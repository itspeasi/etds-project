const mongoose = require('mongoose');

const artistProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  artistName: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
});

module.exports = mongoose.model('ArtistProfile', artistProfileSchema);