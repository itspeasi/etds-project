const express = require('express');
const Performance = require('../models/Performance');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new performance (Artist or Admin)
router.post('/', protect, authorize('artist', 'admin'), async (req, res) => {
    try {
        const performance = new Performance(req.body);
        await performance.save();
        res.status(201).json(performance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get performances by artist profile ID (Public)
router.get('/by-artist/:artistProfileId', async (req, res) => {
    try {
        const performances = await Performance.find({ artistProfile: req.params.artistProfileId });
        res.status(200).json(performances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all performances (Public - for distributor event creation dropdowns)
router.get('/', async (req, res) => {
  try {
    const performances = await Performance.find().populate({
      path: 'artistProfile',
      select: 'artistName'
    });
    res.status(200).json(performances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a performance (Artist or Admin)
router.put('/:id', protect, authorize('artist', 'admin'), async (req, res) => {
    try {
        const performance = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!performance) return res.status(404).json({ message: 'Performance not found' });
        res.status(200).json(performance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a performance (Artist or Admin)
router.delete('/:id', protect, authorize('artist', 'admin'), async (req, res) => {
    try {
        const performance = await Performance.findByIdAndDelete(req.params.id);
        if (!performance) return res.status(404).json({ message: 'Performance not found' });
        res.status(200).json({ message: 'Performance deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;