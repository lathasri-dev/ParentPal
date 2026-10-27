require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const connectPinecone = require('./config/pinecone');
const apiRoutes = require('./routes/api');

async function runE2ETests() {
    console.log("=========================================");
    console.log("       STARTING FULL E2E API TESTS       ");
    console.log("=========================================");

    await connectDB();
    connectPinecone();

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/api', apiRoutes);

    const TEST_PORT = 5005;
    const server = app.listen(TEST_PORT, async () => {
        const baseUrl = `http://127.0.0.1:${TEST_PORT}/api`;
        let passCount = 0;
        let failCount = 0;

        async function testEndpoint(name, url, options = {}) {
            try {
                process.stdout.write(`Testing ${name}... `);
                const res = await fetch(url, options);
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errText.substring(0, 100)}`);
                }
                const data = await res.json();
                console.log(`✅ PASSED`);
                passCount++;
                return data;
            } catch (err) {
                console.log(`❌ FAILED: ${err.message}`);
                failCount++;
                return null;
            }
        }

        try {
            // 1. GET /api/profiles
            const profiles = await testEndpoint("GET /api/profiles", `${baseUrl}/profiles`);
            console.log(`   Found ${profiles ? profiles.length : 0} child profiles.`);

            // 2. POST /api/chat
            const chatRes = await testEndpoint("POST /api/chat", `${baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "What sound does an owl make?", age: 4 })
            });
            if (chatRes) console.log(`   Owl Reply: "${chatRes.reply.slice(0, 60)}..."`);

            // 3. POST /api/story
            const storyRes = await testEndpoint("POST /api/story", `${baseUrl}/story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: "A happy dinosaur in space", childName: "Leo", childAge: 5 })
            });
            if (storyRes) console.log(`   Story: "${storyRes.story.slice(0, 60)}..."`);

            // 4. POST /api/generate-activity
            let targetChildId = profiles && profiles.length > 0 ? profiles[0]._id : null;
            if (targetChildId) {
                const actGenRes = await testEndpoint("POST /api/generate-activity", `${baseUrl}/generate-activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ childId: targetChildId, specificGoal: "Sensory & motor skills" })
                });
                if (actGenRes) {
                    const acts = actGenRes.activities?.activities || actGenRes.activities;
                    console.log(`   Generated ${Array.isArray(acts) ? acts.length : 1} activities.`);
                }
            }

            // 5. POST /api/activity (logging)
            if (targetChildId) {
                const logRes = await testEndpoint("POST /api/activity", `${baseUrl}/activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        childId: targetChildId,
                        type: 'game',
                        activityName: 'Puzzle Challenge',
                        details: 'Solved level 1'
                    })
                });

                // 6. GET /api/activity/:childId
                const getLogsRes = await testEndpoint(`GET /api/activity/${targetChildId}`, `${baseUrl}/activity/${targetChildId}`);
                if (getLogsRes) console.log(`   Retrieved ${getLogsRes.length} activity logs.`);
            }

            console.log("\n=========================================");
            console.log(`E2E SUMMARY: ${passCount} Passed, ${failCount} Failed`);
            console.log("=========================================");

        } finally {
            server.close(() => {
                process.exit(failCount === 0 ? 0 : 1);
            });
        }
    });
}

runE2ETests().catch(err => {
    console.error("Fatal Test Suite Error:", err);
    process.exit(1);
});
