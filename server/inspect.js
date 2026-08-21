const mongoose = require('mongoose');
const ChildProfile = require('./models/ChildProfile');
const dotenv = require('dotenv');

dotenv.config();

const inspectProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const profiles = await ChildProfile.find();
        console.log("Current Profiles in DB:");
        profiles.forEach(p => {
            console.log(`- ID: ${p._id}, Name: "${p.name}", Age: ${p.age}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectProfiles();
