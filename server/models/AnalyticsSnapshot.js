const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true }, // e.g., 'top-artists'
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // The aggregated result
  createdAt: { type: Date, default: Date.now, expires: 60 } // Auto-delete after 1 min
});

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);