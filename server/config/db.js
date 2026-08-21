const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let dbUri = process.env.MONGO_URI || '';
        // Defensive sanitation: strip leading/trailing backslashes, quotes, and whitespace
        dbUri = dbUri.trim().replace(/^[\s\\"'`]+|[\s\\"'`]+$/g, '');

        const conn = await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error("TIP: Ensure your IP is whitelisted in MongoDB Atlas or check your network.");
        console.warn("⚠️ BACKEND STARTING IN DEMO MODE (No Database Connection)");
        // process.exit(1);
    }
};

module.exports = connectDB;
