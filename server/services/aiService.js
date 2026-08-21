const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GOOGLE_API_KEY;
console.log("DEBUG: Google API Key loaded?", apiKey ? "YES (Starts with " + apiKey.substring(0, 4) + "...)" : "NO");

const genAI = new GoogleGenerativeAI(apiKey);

// Use 'gemini-pro' as it was verified to work in this environment (likely maps to 1.0-pro or 1.5-pro)
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.generateContent = async (prompt, retries = 3) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        if (error.message.includes("429") && retries > 0) {
            console.warn(`⚠️ 429 (Quota Exceeded) on ${model.model}. Retrying in 4s... (${retries} attempts left)`);
            await delay(4000);
            return exports.generateContent(prompt, retries - 1);
        }

        // Fallback or specific error handling
        if (error.message.includes("404") || error.message.includes("not found")) {
            console.warn("⚠️ Model not found. Attempting to use 'gemini-pro' explicitly...");
            try {
                const backupModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await backupModel.generateContent(prompt);
                return (await result.response).text();
            } catch (backupError) {
                console.error("Backup model also failed:", backupError.message);
            }
        }

        console.warn("⚠️ Google Gemini API Failed. Falling back to MOCK data.");
        console.warn(`Error: ${error.message}`);

        // Return mock data based on prompt context
        if (prompt.includes("activities")) {
            return JSON.stringify([
                { title: `⚠️ ERROR: ${error.message}`, description: "This is the reason the Real AI failed.", materials_needed: "Check Server Log", educational_benefit: "Debugging" },
                { title: "Sensory Bin (Mock)", description: "Fill a bin with rice and hidden toys.", materials_needed: "Rice, bin, small toys", educational_benefit: "Sensory play" },
                { title: "Color Sort (Mock)", description: "Sort blocks by color.", materials_needed: "Colored blocks", educational_benefit: "Cognitive skills" }
            ]);
        }
        if (prompt.includes("storyteller")) return "Once upon a time, there was a brave little explorer who loved to learn... (Demo Story)";
        return "Hoot hoot! I am currently in Demo Mode because the API Key is missing. But I can still be your friend! 🦉";
    }
};

exports.getEmbedding = async (text) => {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.warn("⚠️ Google Gemini Embedding Failed. Using Mock Vector.");
        // Return a random 768-dimensional vector for demo purposes
        return Array(768).fill(0).map(() => Math.random());
    }
};
