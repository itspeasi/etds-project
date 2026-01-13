const express = require('express');
const Venue = require('../models/Venue');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new venue (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const venue = new Venue(req.body);
    await venue.save();
    res.status(201).json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all venues (Public)
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single venue by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a venue (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a venue (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;