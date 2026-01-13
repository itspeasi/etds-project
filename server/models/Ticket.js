const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'used', 'refunded'], default: 'active' },
  purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);