const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const ChildProfile = require('./models/ChildProfile');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const profiles = await ChildProfile.find({});
        let output = `Found ${profiles.length} profiles.\n`;

        profiles.forEach(p => {
            const hex = Buffer.from(p.name).toString('hex');
            output += `- ID: ${p._id} | Name: "${p.name}" | Length: ${p.name.length} | Hex: ${hex}\n`;
        });

        fs.writeFileSync('audit_utf8.txt', output, 'utf8');
        console.log("Audit complete. Results in audit_utf8.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
