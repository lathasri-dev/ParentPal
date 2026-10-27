require("dotenv").config();
const mongoose = require("mongoose");
const { Pinecone } = require("@pinecone-database/pinecone");
const { generateContent, getEmbedding } = require("./services/aiService");

async function diagnose() {
    console.log("=========================================");
    console.log("       PARENTPAL HEALTH DIAGNOSIS        ");
    console.log("=========================================");

    let allPassed = true;

    // 1. Test Gemini AI Generation
    try {
        console.log("\n[1/4] Testing Gemini Text Generation...");
        const response = await generateContent("Reply with only the word: OK");
        console.log(`✅ Gemini Generation passed! Response: "${response.trim()}"`);
    } catch (e) {
        allPassed = false;
        console.error(`❌ Gemini Generation failed: ${e.message}`);
    }

    // 2. Test Gemini AI Embedding
    try {
        console.log("\n[2/4] Testing Gemini Vector Embeddings...");
        const embedding = await getEmbedding("Diagnostic vector test");
        if (embedding.length === 768) {
            console.log(`✅ Gemini Embedding passed! Dimension: ${embedding.length}`);
        } else {
            allPassed = false;
            console.error(`❌ Unexpected embedding dimension: ${embedding.length} (expected 768)`);
        }
    } catch (e) {
        allPassed = false;
        console.error(`❌ Gemini Embedding failed: ${e.message}`);
    }

    // 3. Test Pinecone Vector Database
    const pcKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX || 'parentpal';
    if (!pcKey) {
        allPassed = false;
        console.error("\n[3/4] ❌ PINECONE_API_KEY missing in .env");
    } else {
        try {
            console.log("\n[3/4] Testing Pinecone Database...");
            const pc = new Pinecone({ apiKey: pcKey });
            const description = await pc.describeIndex(indexName);
            console.log(`✅ Pinecone Index '${indexName}' verified!`);
            console.log(`   Dimension: ${description.dimension} | Metric: ${description.metric} | Status: ${description.status?.state || 'Ready'}`);
            if (description.dimension !== 768) {
                allPassed = false;
                console.error(`⚠️ Dimension mismatch: Index is ${description.dimension}, expected 768.`);
            }
        } catch (e) {
            allPassed = false;
            console.error(`❌ Pinecone error: ${e.message}`);
        }
    }

    // 4. Test MongoDB Database
    const mongoUri = (process.env.MONGODB_URI || '').trim().replace(/^[\s\\"'`]+|[\s\\"'`]+$/g, '');
    if (!mongoUri) {
        allPassed = false;
        console.error("\n[4/4] ❌ MONGODB_URI missing in .env");
    } else {
        try {
            console.log("\n[4/4] Testing MongoDB Atlas Connection...");
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log(`✅ MongoDB Atlas connected successfully! Host: ${mongoose.connection.host}`);
            await mongoose.disconnect();
        } catch (e) {
            allPassed = false;
            console.error(`❌ MongoDB connection error: ${e.message}`);
        }
    }

    console.log("\n=========================================");
    if (allPassed) {
        console.log("🎉 ALL CHECKS PASSED: ParentPal is healthy!");
    } else {
        console.log("⚠️ SOME CHECKS FAILED: Review the errors above.");
    }
    console.log("=========================================");
    process.exit(allPassed ? 0 : 1);
}

diagnose();
