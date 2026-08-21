const mongoose = require('mongoose');
const ChildProfile = require('./models/ChildProfile');
const dotenv = require('dotenv');

dotenv.config();

const cleanupDuplicates = async () => {
    try {
        console.log("Connecting to MongoDB for cleanup...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        const profiles = await ChildProfile.find().sort({ createdAt: -1 });
        const seenNames = new Set();
        const toDelete = [];

        for (const profile of profiles) {
            const lowerName = profile.name.toLowerCase().trim();
            if (seenNames.has(lowerName)) {
                toDelete.push(profile._id);
            } else {
                seenNames.add(lowerName);
            }
        }

        if (toDelete.length > 0) {
            console.log(`Found ${toDelete.length} duplicates. Deleting...`);
            await ChildProfile.deleteMany({ _id: { $in: toDelete } });
            console.log("✅ Duplicates removed successfully.");
        } else {
            console.log("No duplicates found.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Cleanup Error:", error);
        process.exit(1);
    }
};

cleanupDuplicates();
