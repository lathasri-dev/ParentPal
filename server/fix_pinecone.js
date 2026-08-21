const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function fixPinecone() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || 'parentpal';

    console.log(`Checking index: ${indexName}...`);
    try {
        const description = await pc.describeIndex(indexName);
        console.log(`Current dimension: ${description.dimension}`);

        if (description.dimension !== 768) {
            console.log("Deleting incorrect index...");
            await pc.deleteIndex(indexName);
            console.log("Waiting for deletion to settle...");
            await new Promise(r => setTimeout(r, 10000));

            console.log("Creating new index with 768 dimensions...");
            await pc.createIndex({
                name: indexName,
                dimension: 768,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
            console.log("✅ Index recreation initiated. It may take a minute to be ready.");
        } else {
            console.log("✅ Dimension is already 768. No changes needed.");
        }
    } catch (e) {
        if (e.message.includes("not found")) {
            console.log("Index not found, creating it...");
            await pc.createIndex({
                name: indexName,
                dimension: 768,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
            console.log("✅ Index creation initiated.");
        } else {
            console.error("❌ Pinecone Error:", e.message);
        }
    }
}

fixPinecone();
