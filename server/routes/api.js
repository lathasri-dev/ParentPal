const express = require('express');
const router = express.Router();
const ChildProfile = require('../models/ChildProfile');
const ActivityLog = require('../models/ActivityLog');
const GeneratedReport = require('../models/GeneratedReport');
const { generateContent } = require('../services/aiService');
const { queryVectorDB, upsertVectorDB } = require('../services/ragService');
const mongoose = require('mongoose');

// In-memory store for Demo Mode (if MongoDB is disconnected)
let demoProfiles = [];
let demoActivities = [];
let demoGeneratedReports = [];

// --- Child Profile Routes ---

// Get All Profiles (Deduplicated by Name)
router.get('/profiles', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Serving profiles from In-Memory (Demo Mode)");
            // Deduplicate demo profiles by name
            const unique = [];
            const seen = new Set();
            [...demoProfiles].sort((a, b) => b.createdAt - a.createdAt).forEach(p => {
                const norm = p.name.toLowerCase().trim();
                if (!seen.has(norm)) {
                    seen.add(norm);
                    unique.push(p);
                }
            });
            return res.json(unique);
        }

        const profiles = await ChildProfile.aggregate([
            {
                $addFields: {
                    normalizedName: { $toLower: { $trim: { input: "$name" } } }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$normalizedName",
                    latestProfile: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$latestProfile" } },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or Update Profile (Deduplication by Name)
router.post('/child', async (req, res) => {
    try {
        const { name, age, interests, strengths, challenges } = req.body;
        const cleanName = name?.trim();

        if (!cleanName) return res.status(400).json({ error: "Name is required" });

        console.log(`📩 POST /child: Processing ${cleanName}...`);

        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Saving profile to In-Memory (Demo Mode)");
            let child = demoProfiles.find(p => p.name.toLowerCase().trim() === cleanName.toLowerCase());
            let wasUpdate = false;

            if (child) {
                child.age = age || child.age;
                child.interests = interests || child.interests;
                child.strengths = strengths || child.strengths;
                child.challenges = challenges || child.challenges;
                child.updatedAt = new Date();
                wasUpdate = true;
            } else {
                child = {
                    _id: `demo_${Date.now()}`,
                    name: cleanName,
                    age,
                    interests: interests || [],
                    strengths: strengths || [],
                    challenges: challenges || [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                demoProfiles.push(child);
            }

            return res.status(201).json({
                profile: child,
                message: wasUpdate ? "Profile updated successfully (Demo Mode)" : "Profile created successfully (Demo Mode)",
                isUpdate: wasUpdate
            });
        }

        // Find existing profile by name (case-insensitive + trimmed)
        let child = await ChildProfile.findOne({
            name: { $regex: new RegExp(`^\\s*${cleanName}\\s*$`, 'i') }
        });

        if (child) {
            // Update existing
            child.age = age || child.age;
            child.interests = interests || child.interests;
            child.strengths = strengths || child.strengths;
            child.challenges = challenges || child.challenges;
            await child.save();
            child.wasUpdate = true;
            console.log(`✅ Profile Updated: ${name}`);
        } else {
            // Create new
            child = new ChildProfile({ name, age, interests, strengths, challenges });
            await child.save();
            console.log(`✅ Profile Created: ${name}`);
        }

        // Sync to Pinecone (Upsert handles both create and update)
        try {
            const profileText = `Child Profile: ${name}, Age: ${child.age}. Interests: ${child.interests?.join(', ')}. Strengths: ${child.strengths?.join(', ')}. Challenges: ${child.challenges?.join(', ')}.`;
            await upsertVectorDB(child._id, profileText, { type: 'profile', childId: child._id.toString(), age: child.age });
        } catch (vdbError) {
            console.warn("Vector DB Sync failed, but profile saved to MongoDB.");
        }

        res.status(201).json({
            profile: child,
            success: true,
            message: child.wasUpdate ? "Profile updated successfully" : "Profile created successfully",
            isUpdate: !!child.wasUpdate
        });
    } catch (error) {
        console.error("❌ POST /child error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error during save" });
    }
});

// Delete Profile
router.delete('/child/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`🗑️ DELETE /child/${id}: Request received`);

        // 1. Handle Demo IDs (starts with demo_)
        if (id.startsWith('demo_')) {
            console.warn(`📝 Deleting In-Memory profile: ${id}`);
            const initialCount = demoProfiles.length;
            demoProfiles = demoProfiles.filter(p => p._id !== id);

            if (demoProfiles.length < initialCount) {
                return res.json({ success: true, message: "Demo profile deleted successfully" });
            } else {
                return res.status(404).json({ success: false, message: "Demo profile not found" });
            }
        }

        // 2. Handle DB IDs (only if MongoDB is connected)
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: "Database disconnected. Cannot delete persistent profiles in Demo Mode."
            });
        }

        const child = await ChildProfile.findByIdAndDelete(id);
        if (!child) {
            console.log(`❌ Profile not found in DB: ${id}`);
            return res.status(404).json({ success: false, message: "Profile not found in database" });
        }

        console.log(`✅ Profile deleted from DB: ${id}`);
        res.json({ success: true, message: "Profile deleted successfully" });
    } catch (error) {
        console.error(`❌ DELETE /child/${id} error:`, error);

        // Handle Mongoose CastError (invalid hex string)
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: "Invalid ID format" });
        }

        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Profile
router.get('/child/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Serving profile from In-Memory (Demo Mode)");
            const child = demoProfiles.find(p => p._id === req.params.id);
            if (!child) return res.status(404).json({ message: "Child not found" });
            return res.json(child);
        }
        const child = await ChildProfile.findById(req.params.id);
        if (!child) return res.status(404).json({ message: "Child not found" });
        res.json(child);
    } catch (error) {
        res.status(404).json({ message: "Error fetching child profile" });
    }
});


// --- Parent Mode: Activity Generator (RAG) ---

router.post('/generate-activity', async (req, res) => {
    const { childId, specificGoal } = req.body;

    try {
        let child;
        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Fetching profile for activity from In-Memory (Demo Mode)");
            child = demoProfiles.find(p => p._id === childId);
        } else {
            child = await ChildProfile.findById(childId);
        }
        if (!child) return res.status(404).json({ message: "Child not found" });

        console.log(`\n[Generate]`);
        console.log(`Selected child ID: ${child._id}`);
        console.log(`Selected child name: ${child.name}`);

        // 1. Construct Query for RAG
        const query = `${child.age} year old ${specificGoal || 'development'} ${child.challenges.join(' ')}`;

        // 2. Retrieve Relevant Milestones
        const retrievedDocs = await queryVectorDB(query, 3, { childId: child._id.toString() });
        const context = retrievedDocs.map(doc => doc.text).join("\n\n");

        // 3. Generate Activity with Gemini
        const prompt = `
      You are an expert Montessori pedagogical consultant.
      
      Child Profile:
      - Age: ${child.age}
      - Interests: ${child.interests.join(', ')}
      - Challenges: ${child.challenges.join(', ')}
      
      Goal: ${specificGoal || "General developmental support"}
      
      Relevant Developmental Context (from CDC/Montessori matches):
      ${context}
      
      Task: Suggest 3 specific, actionable, and fun activities for the parent to do with this child.
      Format the output as JSON with an array called "activities", where each object has "title", "description", "materials_needed", and "educational_benefit".
      Do not include markdown formatting.
    `;

        console.log(`\n[Gemini]`);
        console.log(`Generation model: gemini-flash-latest`);
        console.log(`Request started: ${new Date().toISOString()}`);

        const aiResponse = await generateContent(prompt);

        console.log(`Response success: true`);
        console.log(`HTTP status: 200`);

        // Robust JSON parsing (extract JSON object or markdown block, with graceful fallback)
        let activities;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const cleanedResponse = jsonMatch ? jsonMatch[0] : aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedResponse);
            activities = parsed.activities || parsed;
        } catch (parseErr) {
            console.warn("⚠️ JSON parse warning on AI response, using structured fallback:", parseErr.message);
            activities = [
                {
                    title: "Creative Developmental Play",
                    description: aiResponse.slice(0, 300),
                    materials_needed: "Household materials",
                    educational_benefit: "Fine motor and cognitive development"
                }
            ];
        }

        console.log(`\n[MongoDB]`);
        console.log(`Saving report for childId: ${child._id}`);

        // Save to DB (or In-Memory if demo mode)
        if (mongoose.connection.readyState !== 1) {
            demoGeneratedReports = demoGeneratedReports.filter(r => r.childId !== childId);
            demoGeneratedReports.push({ childId, activities, contextUsed: retrievedDocs, updatedAt: new Date() });
        } else {
            await GeneratedReport.findOneAndUpdate(
                { childId: child._id },
                { activities, contextUsed: retrievedDocs, updatedAt: Date.now() },
                { upsert: true, returnDocument: 'after' }
            );
        }

        res.json({ activities, contextUsed: retrievedDocs });
    } catch (error) {
        console.error("\n[Gemini/Generate] Error:", error.message);
        
        // Use 503 if overloaded, 500 otherwise
        const status = error.message.includes('503') || error.message.includes('fetch') || error.message.includes('overloaded') ? 503 : 500;
        console.log(`Response failure: true`);
        console.log(`HTTP status: ${status}`);

        res.status(status).json({ 
            error: "Failed to generate activities. AI service may be temporarily unavailable.", 
            details: error.message 
        });
    }
});

router.get('/generate-activity/:childId', async (req, res) => {
    try {
        const { childId } = req.params;
        if (mongoose.connection.readyState !== 1) {
            const report = demoGeneratedReports.find(r => r.childId === childId);
            if (!report) return res.status(404).json({ message: "No report found" });
            return res.json(report);
        }

        const report = await GeneratedReport.findOne({ childId });
        if (!report) return res.status(404).json({ message: "No report found" });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch report" });
    }
});


// --- Child Mode: Safe AI Story/Chat ---

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

router.post('/story', async (req, res) => {
    const { childId, theme, childName, childAge } = req.body;

    try {
        let child = null;
        // Try to find child
        if (childId) {
            if (mongoose.connection.readyState !== 1) {
                console.warn("⚠️ Fetching profile for story from In-Memory (Demo Mode)");
                child = demoProfiles.find(p => p._id === childId);
            } else if (childId.match(/^[0-9a-fA-F]{24}$/)) {
                child = await ChildProfile.findById(childId);
            }
        }

        // Fallback for Guest Mode or Invalid ID
        if (!child) {
            console.log("Using temporary child profile for story generation");
            child = {
                name: childName || "Explorer",
                age: childAge || 5
            };
        }

        let contextText = "";
        const pdfPath = path.join(__dirname, '../assets/story.pdf');

        // Check if server-side PDF exists
        if (fs.existsSync(pdfPath)) {
            try {
                // console.log("Found story.pdf, reading content...");
                const dataBuffer = fs.readFileSync(pdfPath);
                let textContent = "";
                if (typeof pdf === 'function') {
                    const pdfData = await pdf(dataBuffer);
                    textContent = pdfData.text;
                } else if (pdf && typeof pdf.PDFParse === 'function') {
                    const parser = new pdf.PDFParse(new Uint8Array(dataBuffer));
                    const pdfData = await parser.getText();
                    textContent = pdfData.text;
                } else {
                    console.warn("⚠️ PDF Parse library exports unknown format");
                }
                contextText = `\n\nSTORY CONTEXT (FROM LOCAL BOOK):\n${textContent.substring(0, 3000)}...`;
            } catch (pdfError) {
                console.warn("Local PDF Parse Error:", pdfError);
            }
        }

        const prompt = `
      System: You are a friendly, safe AI storyteller.
      Target Audience: A ${child.age}-year-old child named ${child.name}.
      Theme: ${theme || 'A magical adventure'}
      ${contextText}
      Constraints:
      - Use age-appropriate vocabulary (Age ${child.age}).
      - NO scary content, violence, or negativity.
      - Keep it short (max 200 words).
      - Include a positive moral.
      - If PDF context is provided, base the story HEAVILY on that content.
    `;

        const story = await generateContent(prompt);

        // Sync to Pinecone (safely catch any vector background errors)
        if (child && child._id) {
            upsertVectorDB(`story_${Date.now()}`, story, {
                type: 'story',
                childId: child._id,
                theme: theme || 'adventure'
            }).catch(err => console.warn("Background Pinecone upsert for story failed:", err.message));
        }

        res.json({ story });
    } catch (error) {
        console.error("Story API Error:", error);
        res.status(500).json({ error: error.message || "Failed to generate story" });
    }
});

router.post('/chat', async (req, res) => {
    const { message, age } = req.body;

    const systemPrompt = `
    You are Professor Owl, a friendly AI character depending on the child's age (${age || 5}).
    - Respond safely and kindly.
    - If the child asks about sensitive topics (violence, adult themes), gently redirect to something fun or educational.
    - Keep responses short.
  `;

    try {
        const response = await generateContent(`${systemPrompt}\n\nChild: ${message}\nProfessor Owl:`);

        // Sync interaction to Pinecone (safely catch any vector background errors)
        upsertVectorDB(`chat_${Date.now()}`, `Child: ${message} | Owl: ${response}`, {
            type: 'chat',
            age: age || 5
        }).catch(err => console.warn("Background Pinecone upsert for chat failed:", err.message));

        res.json({ reply: response });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: error.message || "Chat error" });
    }
});

// --- Memory / Progress Routes (Pinecone Retrieval) ---

router.get('/memory/:childId', async (req, res) => {
    const { childId } = req.params;
    const { type } = req.query; // optional filter: 'story' or 'chat'

    try {
        // We use a dummy query text like "memory" because queryVectorDB requires a vector search.
        // In a more advanced setup, we'd use index.fetch() or metadata filtering without vector sweep.
        const filter = { childId: childId };
        if (type) filter.type = type;

        const results = await queryVectorDB("recent history", 10, filter);
        res.json(results);
    } catch (error) {
        console.error("Memory Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch memory from Pinecone" });
    }
});

// --- Activity Log Routes ---

router.post('/activity', async (req, res) => {
    try {
        const { childId, type, activityName, details } = req.body;
        if (!childId) return res.status(400).json({ error: "childId is required" });

        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Saving activity log to In-Memory (Demo Mode)");
            const log = {
                _id: `demo_log_${Date.now()}`,
                childId,
                type,
                activityName,
                details,
                timestamp: new Date()
            };
            demoActivities.push(log);
            return res.status(201).json(log);
        }

        const log = new ActivityLog({ childId, type, activityName, details });
        await log.save();
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/activity/:childId', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Serving activity log from In-Memory (Demo Mode)");
            const logs = demoActivities
                .filter(log => log.childId === req.params.childId)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20);
            return res.json(logs);
        }

        const logs = await ActivityLog.find({ childId: req.params.childId })
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
