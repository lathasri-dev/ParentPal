const { Pinecone } = require('@pinecone-database/pinecone');

const connectPinecone = () => {
    if (!process.env.PINECONE_API_KEY) {
        console.warn("Pinecone API Key is missing. Vector search will not work.");
        return null;
    }

    try {
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        console.log('Pinecone Client Initialized');
        return pc;
    } catch (error) {
        console.error(`Pinecone Connection Error: ${error.message}`);
        return null;
    }
};

module.exports = connectPinecone;
