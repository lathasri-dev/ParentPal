const mongoose = require('mongoose');
const ChildProfile = require('./models/ChildProfile');
require('dotenv').config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await ChildProfile.countDocuments();
        const profiles = await ChildProfile.find().limit(5);
        console.log(`Connection Success. Current Profile Count: ${count}`);
        console.log('Sample Data:', JSON.stringify(profiles, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('DB Check Failed:', err);
        process.exit(1);
    }
};

checkDB();
