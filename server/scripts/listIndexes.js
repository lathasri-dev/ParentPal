const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
require('dotenv').config();

const test = async () => {
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });
    try {
        const indexesResponse = await pc.listIndexes();
        // The structure depends on the version of the SDK, usually it's an array or an object with an 'indexes' property
        const names = indexesResponse.indexes ? indexesResponse.indexes.map(idx => idx.name) : indexesResponse.map(idx => idx.name);
        fs.writeFileSync('scripts/index_names.txt', names.join('\n'));
        console.log('Indexes saved to scripts/index_names.txt');
    } catch (err) {
        fs.writeFileSync('scripts/index_names.txt', 'Error: ' + err.message);
        console.error('Error listing indexes:', err);
    }
};

test();
