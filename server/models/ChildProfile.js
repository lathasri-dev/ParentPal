const mongoose = require('mongoose');

const ChildProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    interests: [{ type: String }],
    strengths: [{ type: String }],
    challenges: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChildProfile', ChildProfileSchema);
