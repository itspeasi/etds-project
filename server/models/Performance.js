const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  artistProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtistProfile', required: true },
  performanceName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Performance', performanceSchema);