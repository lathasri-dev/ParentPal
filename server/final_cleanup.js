const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ChildProfile = require('./models/ChildProfile');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB for cleanup...");

        const allProfiles = await ChildProfile.find({}).sort({ createdAt: -1 });
        const seen = new Set();
        const toDelete = [];

        allProfiles.forEach(p => {
            const norm = p.name.toLowerCase().trim();
            if (seen.has(norm)) {
                toDelete.push(p._id);
            } else {
                seen.add(norm);
            }
        });

        if (toDelete.length > 0) {
            console.log(`Deleting ${toDelete.length} duplicates:`, toDelete);
            await ChildProfile.deleteMany({ _id: { $in: toDelete } });
            console.log("Cleanup successful.");
        } else {
            console.log("No duplicates found to delete.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
