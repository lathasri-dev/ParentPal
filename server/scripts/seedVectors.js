require('dotenv').config();
const connectPinecone = require('../config/pinecone');
const { getEmbedding } = require('../services/aiService');

const sampleMilestones = [
    {
        id: "m1",
        text: "At age 3, children begin to engage in parallel play and start sharing toys with assistance. They can follow 2-3 step instructions.",
        metadata: { age: 3, category: "Social/Emotional", source: "CDC" }
    },
    {
        id: "m2",
        text: "Montessori Practical Life activities for 3-year-olds include pouring water, buttoning frames, and sweeping. These build fine motor skills and concentration.",
        metadata: { age: 3, category: "Practical Life", source: "Montessori" }
    },
    {
        id: "m3",
        text: "At age 4, children enjoy cooperative play and can retell simple stories. They start to understand the concept of time (morning, afternoon).",
        metadata: { age: 4, category: "Cognitive", source: "CDC" }
    },
    {
        id: "m4",
        text: "Montessori Sensorial activities for 4-year-olds focus on refining senses, such as the Pink Tower (visual discrimination of size) and Sound Cylinders.",
        metadata: { age: 4, category: "Sensorial", source: "Montessori" }
    },
    {
        id: "m5",
        text: "At age 5, children can count 10 or more things, speak very clearly, and print some letters or numbers. They like to sing, dance, and act.",
        metadata: { age: 5, category: "General", source: "CDC" }
    }
];

const seedVectors = async () => {
    const pc = connectPinecone();
    if (!pc) return;

    const indexName = process.env.PINECONE_INDEX || 'parentpal';
    const index = pc.index(indexName);

    console.log(`Seeding index: ${indexName}...`);

    try {
        const records = [];

        for (const item of sampleMilestones) {
            console.log(`Processing: ${item.id}`);
            const vector = await getEmbedding(item.text);

            records.push({
                id: item.id,
                values: vector,
                metadata: {
                    ...item.metadata,
                    text: item.text // Store text in metadata for retrieval
                }
            });
        }

        if (records.length > 0) {
            await index.upsert(records);
            console.log(`Successfully seeded ${records.length} records.`);
        }

    } catch (error) {
        console.error("Seeding Error:", error);
    }
};

seedVectors();
