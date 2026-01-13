const express = require('express');
const Event = require('../models/Event');
const Performance = require('../models/Performance');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new event (Distributor or Admin only)
router.post('/', protect, authorize('distributor', 'admin'), async (req, res) => {
    try {
        const { performance, venue, startDateTime, endDateTime, ticketPrice } = req.body;
        
        // Use logged in user ID if distributor is not explicitly passed (or enforce logged in user)
        const distributor = req.body.distributor || req.user.id;

        const venueConflict = await Event.findOne({
            venue: venue,
            status: 'approved',
            $or: [{ startDateTime: { $lt: endDateTime }, endDateTime: { $gt: startDateTime } }]
        });
        if (venueConflict) {
            return res.status(409).json({ message: 'This venue is already booked for an overlapping time.' });
        }

        const perf = await Performance.findById(performance).populate('artistProfile');
        if (!perf) return res.status(404).json({ message: 'Performance not found.' });
        
        const artistPerformances = await Performance.find({ artistProfile: perf.artistProfile._id });
        const artistPerformanceIds = artistPerformances.map(p => p._id);

        const artistConflict = await Event.findOne({
            performance: { $in: artistPerformanceIds },
            status: 'approved',
            $or: [{ startDateTime: { $lt: endDateTime }, endDateTime: { $gt: startDateTime } }]
        });
        if (artistConflict) {
            return res.status(409).json({ message: 'The artist already has a conflicting event scheduled at this time.' });
        }

        const event = new Event({ 
            performance, 
            venue, 
            startDateTime, 
            endDateTime, 
            distributor,
            ticketPrice: ticketPrice || 0 
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an event (Distributor or Admin)
router.put('/:id', protect, authorize('distributor', 'admin'), async (req, res) => {
    try {
        const { performance, venue, startDateTime, endDateTime, ticketPrice } = req.body;
        const eventId = req.params.id;

        // Check for conflicts excluding the current event
        const venueConflict = await Event.findOne({
            _id: { $ne: eventId },
            venue: venue,
            status: 'approved',
            $or: [{ startDateTime: { $lt: endDateTime }, endDateTime: { $gt: startDateTime } }]
        });
        if (venueConflict) {
            return res.status(409).json({ message: 'This venue is already booked for an overlapping time.' });
        }

        const perf = await Performance.findById(performance).populate('artistProfile');
        if (!perf) return res.status(404).json({ message: 'Performance not found.' });
        
        const artistPerformances = await Performance.find({ artistProfile: perf.artistProfile._id });
        const artistPerformanceIds = artistPerformances.map(p => p._id);

        const artistConflict = await Event.findOne({
            _id: { $ne: eventId },
            performance: { $in: artistPerformanceIds },
            status: 'approved',
            $or: [{ startDateTime: { $lt: endDateTime }, endDateTime: { $gt: startDateTime } }]
        });
        if (artistConflict) {
            return res.status(409).json({ message: 'The artist already has a conflicting event scheduled at this time.' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(eventId, {
            performance,
            venue,
            startDateTime,
            endDateTime,
            ticketPrice
        }, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get events, optionally filtered by distributor (Public)
router.get('/', async (req, res) => {
  try {
    const { distributorId } = req.query;
    const filter = {};
    if (distributorId) {
      filter.distributor = distributorId;
    }

    const events = await Event.find(filter)
      .populate({ path: 'performance', populate: { path: 'artistProfile', select: 'artistName' } })
      .populate('venue', 'name city state capacity');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all upcoming approved events (Public)
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({
      status: 'approved',
      startDateTime: { $gte: today }
    })
    .populate({
      path: 'performance',
      populate: { path: 'artistProfile', select: 'artistName' }
    })
    .populate('venue')
    .sort({ startDateTime: 'asc' });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events for a specific artist (Public)
router.get('/for-artist/:artistProfileId', async (req, res) => {
    try {
        const performances = await Performance.find({ artistProfile: req.params.artistProfileId });
        const performanceIds = performances.map(p => p._id);
        const events = await Event.find({
            performance: { $in: performanceIds },
            status: { $in: ['pending', 'approved'] }
        })
        .populate('venue', 'name city state')
        .populate('performance', 'performanceName')
        .populate('distributor', 'username'); 
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get events for a specific venue (Public)
router.get('/by-venue/:venueId', async (req, res) => {
    try {
        const events = await Event.find({ 
            venue: req.params.venueId,
            status: 'approved' // Only show approved events on public venue page
        })
        .populate({
            path: 'performance',
            populate: { path: 'artistProfile', select: 'artistName' }
        })
        .populate('venue', 'name city state capacity')
        .sort({ startDateTime: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an event's status (Distributor or Admin)
router.put('/:id/status', protect, authorize('distributor', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel an event (Distributor or Admin)
router.put('/:id/cancel', protect, authorize('distributor', 'admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.status !== 'approved') return res.status(400).json({ message: 'Only approved events can be canceled.' });
        
        event.status = 'canceled';
        await event.save();
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an event (Distributor or Admin)
router.delete('/:id', protect, authorize('distributor', 'admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.status !== 'pending') return res.status(400).json({ message: 'Only pending events can be deleted.' });
        
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;