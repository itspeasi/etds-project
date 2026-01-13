const express = require('express');
const ArtistProfile = require('../models/ArtistProfile');
const Performance = require('../models/Performance');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Create or Update an artist profile (Artist or Admin)
router.post('/', protect, authorize('artist', 'admin'), async (req, res) => {
    try {
        const { user, artistName, bio, imageUrl } = req.body;
        
        // Security check: Ensure the user is updating their own profile
        if (req.user.userType !== 'admin' && req.user.id !== user) {
             return res.status(403).json({ message: 'You can only edit your own artist profile' });
        }

        let profile = await ArtistProfile.findOne({ user });
        if (profile) {
            profile.artistName = artistName;
            profile.bio = bio;
            profile.imageUrl = imageUrl;
        } else {
            profile = new ArtistProfile({ user, artistName, bio, imageUrl });
        }
        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        res.status(400).json({ message: 'Error saving profile: ' + error.message });
    }
});

// Get all artist profiles for public view
router.get('/', async (req, res) => {
    try {
        const profiles = await ArtistProfile.find().populate('user', 'username');
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single artist profile by user ID
router.get('/by-user/:userId', async (req, res) => {
    try {
        const profile = await ArtistProfile.findOne({ user: req.params.userId });
        res.status(200).json(profile); // Returns null if not found, which is handled by the client
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single artist profile and their performances by profile ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Artist profile not found' });
    }
    // Filter to only show active performances on the public profile
    const performances = await Performance.find({ artistProfile: req.params.id, isActive: true }).lean();

    for (const performance of performances) {
      const events = await Event.find({
        performance: performance._id,
        status: { $in: ['approved', 'canceled'] }
      })
        .populate('venue', 'name city state')
        .sort({ startDateTime: 1 });
      performance.events = events;
    }

    res.status(200).json({ profile, performances });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;