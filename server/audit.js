const mongoose = require('mongoose');
const ChildProfile = require('./models/ChildProfile');
const dotenv = require('dotenv');

dotenv.config();

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const profiles = await ChildProfile.find();
        console.log("--- START AUDIT ---");
        profiles.forEach(p => {
            console.log(JSON.stringify({
                id: p._id,
                name: p.name,
                nameLength: p.name.length,
                normalized: p.name.toLowerCase().trim()
            }));
        });
        console.log("--- END AUDIT ---");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

audit();
