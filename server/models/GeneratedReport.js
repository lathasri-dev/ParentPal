const mongoose = require('mongoose');

const GeneratedReportSchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true, unique: true },
    activities: { type: Array, required: true },
    contextUsed: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeneratedReport', GeneratedReportSchema);
