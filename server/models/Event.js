const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  performance: { type: mongoose.Schema.Types.ObjectId, ref: 'Performance', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'canceled'], default: 'pending' },
  ticketPrice: { type: Number, required: true, default: 0 },
  ticketsSold: { type: Number, default: 0, min: 0 }
});

module.exports = mongoose.model('Event', eventSchema);