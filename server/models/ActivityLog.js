const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true },
    type: { type: String, required: true }, // e.g., 'story', 'paint', 'learn', 'chat', 'game'
    activityName: { type: String, required: true }, // e.g., 'Magical Forest Story', 'Alphabet Learning', 'Rainbow Painting'
    details: { type: String }, // Optional details
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
