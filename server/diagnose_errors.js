const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function diagnose() {
    console.log("--- DIAGNOSIS START ---");

    // 1. Test Gemini
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("❌ GOOGLE_API_KEY missing in .env");
    } else {
        console.log(`Checking Gemini with key: ${apiKey.substring(0, 4)}...`);
        const genAI = new GoogleGenerativeAI(apiKey);
        try {
            // Try different model variants
            const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
            for (const modelName of modelsToTry) {
                console.log(`Trying model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                try {
                    const result = await model.generateContent("Hi");
                    console.log(`✅ Gemini ${modelName} works! Response: ${result.response.text().substring(0, 10)}...`);
                    break;
                } catch (e) {
                    console.error(`❌ Gemini ${modelName} failed: ${e.message}`);
                }
            }
        } catch (e) {
            console.error(`❌ Gemini SDK error: ${e.message}`);
        }
    }

    // 2. Test Pinecone
    const pcKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX || 'parentpal';
    if (!pcKey) {
        console.error("❌ PINECONE_API_KEY missing in .env");
    } else {
        console.log(`Checking Pinecone with key: ${pcKey.substring(0, 4)}...`);
        const pc = new Pinecone({ apiKey: pcKey });
        try {
            const description = await pc.describeIndex(indexName);
            console.log(`✅ Pinecone Index '${indexName}' found.`);
            console.log(`   Dimension: ${description.dimension}`);
            console.log(`   Metric: ${description.metric}`);
            console.log(`   Status: ${description.status.state}`);

            if (description.dimension !== 768) {
                console.warn(`⚠️ DIMENSION MISMATCH: Index is ${description.dimension}, but Gemini produces 768.`);
                console.log("Attempting to recreate index with 768 dimensions...");
                // Note: Recreating index takes time and might fail if serverless/pod limit reached
                // But let's see if we can at least detect it properly.
            }
        } catch (e) {
            console.error(`❌ Pinecone error: ${e.message}`);
        }
    }

    console.log("--- DIAGNOSIS END ---");
}

diagnose();
