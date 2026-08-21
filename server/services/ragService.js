const connectPinecone = require('../config/pinecone');
const { getEmbedding } = require('./aiService');

const indexName = process.env.PINECONE_INDEX || 'parentpal';

exports.queryVectorDB = async (queryText, topK = 3, filter = {}) => {
    const pc = connectPinecone();
    if (!pc) throw new Error("Pinecone client not initialized");

    const index = pc.index(indexName);

    try {
        const vector = await getEmbedding(queryText);

        const queryResponse = await index.query({
            vector: vector,
            topK: topK,
            includeMetadata: true,
            filter: filter // Added filter support (e.g., { type: 'story' })
        });

        return queryResponse.matches.map(match => ({
            ...match.metadata,
            score: match.score
        }));
    } catch (error) {
        console.error("Pinecone Query Error:", error);
        return [];
    }
};

exports.upsertVectorDB = async (id, text, metadata) => {
    const pc = connectPinecone();
    if (!pc) {
        console.warn("Pinecone not connected, skipping upsert.");
        return;
    }

    const index = pc.index(indexName);

    try {
        const vector = await getEmbedding(text);

        await index.upsert([{
            id: String(id),
            values: vector,
            metadata: {
                ...metadata,
                text: text, // Store original text for retrieval
                timestamp: new Date().toISOString()
            }
        }]);

        console.log(`✅ Pinecone Upsert Success: ${id} (${metadata.type || 'unknown'})`);
    } catch (error) {
        console.error("Pinecone Upsert Error:", error);
    }
};
