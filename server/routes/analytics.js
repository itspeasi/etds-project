const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const ArtistProfile = require('../models/ArtistProfile');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

const router = express.Router();

// Get Top 5 Artists by Gross Sales (Cached)
router.get('/top-artists', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';

    // 1. Check Cache (unless forced)
    if (!forceRefresh) {
      const cachedData = await AnalyticsSnapshot.findOne({ type: 'top-artists' }).sort({ createdAt: -1 });
      if (cachedData) {
        return res.json(cachedData.data);
      }
    }

    // 2. Run Expensive Aggregation
    const topArtists = await Event.aggregate([
      // Join with Performances to get the Artist ID
      {
        $lookup: {
          from: 'performances',
          localField: 'performance',
          foreignField: '_id',
          as: 'perf'
        }
      },
      { $unwind: '$perf' },
      
      // Project fields needed: Artist, Venue, Tickets Sold, and Gross for the event
      {
        $project: {
          artistId: '$perf.artistProfile',
          venueId: '$venue',
          ticketsSold: { $ifNull: ['$ticketsSold', 0] },
          sales: { $multiply: ['$ticketPrice', { $ifNull: ['$ticketsSold', 0] }] }
        }
      },

      // Group by Artist AND Venue first. 
      // This sums up ticket sales for an artist at a specific venue.
      {
        $group: {
          _id: { artist: '$artistId', venue: '$venueId' },
          venueSales: { $sum: '$sales' },
          venueTicketsSold: { $sum: '$ticketsSold' }
        }
      },

      // Sort by venueTicketsSold descending.
      // This ensures that for every artist, the venue with the most tickets sold appears first.
      { $sort: { venueTicketsSold: -1 } },

      // Group by Artist only.
      // Since we sorted by ticket volume, the $first venue we encounter is the "Most Popular".
      {
        $group: {
          _id: '$_id.artist',
          totalGross: { $sum: '$venueSales' },
          favVenueId: { $first: '$_id.venue' }
        }
      },

      // Join with Artist Profile to get name/image
      {
        $lookup: {
          from: 'artistprofiles',
          localField: '_id',
          foreignField: '_id',
          as: 'artistProfile'
        }
      },
      { $unwind: '$artistProfile' },

      // Join with Venue to get venue details
      {
        $lookup: {
          from: 'venues',
          localField: 'favVenueId',
          foreignField: '_id',
          as: 'favVenue'
        }
      },
      { $unwind: '$favVenue' },

      // Sort by Total Gross Sales (Highest first)
      { $sort: { totalGross: -1 } },

      // Limit to top 5
      { $limit: 5 },

      // Format the output
      {
        $project: {
          _id: '$artistProfile._id',
          artistName: '$artistProfile.artistName',
          imageUrl: '$artistProfile.imageUrl',
          grossSales: '$totalGross',
          favoriteVenue: {
            name: '$favVenue.name',
            city: '$favVenue.city',
            state: '$favVenue.state'
          }
        }
      }
    ]);

    // 3. Save Snapshot
    await AnalyticsSnapshot.create({
      type: 'top-artists',
      data: topArtists
    });

    res.json(topArtists);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Monthly Sales by Artist for a Distributor
router.get('/distributor/:distributorId/sales', async (req, res) => {
  try {
    const distributorId = req.params.distributorId;

    const salesData = await Event.aggregate([
      // Filter Events by Distributor
      { $match: { distributor: new mongoose.Types.ObjectId(distributorId) } },

      // Lookup Tickets associated with these events
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'event',
          as: 'ticket'
        }
      },
      { $unwind: '$ticket' },

      // Exclude refunded tickets
      { $match: { 'ticket.status': { $ne: 'refunded' } } },

      // Lookup Performance to get Artist info
      {
        $lookup: {
          from: 'performances',
          localField: 'performance',
          foreignField: '_id',
          as: 'perf'
        }
      },
      { $unwind: '$perf' },

      // Lookup Artist Profile
      {
        $lookup: {
          from: 'artistprofiles',
          localField: 'perf.artistProfile',
          foreignField: '_id',
          as: 'artist'
        }
      },
      { $unwind: '$artist' },

      // Group by Month, Year, and Artist
      {
        $group: {
          _id: {
            month: { $month: '$ticket.purchaseDate' },
            year: { $year: '$ticket.purchaseDate' },
            artistName: '$artist.artistName'
          },
          monthlyTotal: { $sum: '$ticket.price' }
        }
      },

      // Sort by Date
      { $sort: { '_id.year': 1, '_id.month': 1 } },

      // Format output
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          artist: '$_id.artistName',
          total: '$monthlyTotal'
        }
      }
    ]);

    res.json(salesData);
  } catch (error) {
    console.error('Distributor Analytics Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Monthly Sales by Venue for a Distributor
router.get('/distributor/:distributorId/sales-by-venue', async (req, res) => {
  try {
    const distributorId = req.params.distributorId;

    const salesData = await Event.aggregate([
      // Filter Events by Distributor
      { $match: { distributor: new mongoose.Types.ObjectId(distributorId) } },

      // Lookup Tickets associated with these events
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'event',
          as: 'ticket'
        }
      },
      { $unwind: '$ticket' },

      // Exclude refunded tickets
      { $match: { 'ticket.status': { $ne: 'refunded' } } },

      // Lookup Venue to get Venue info
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueDoc'
        }
      },
      { $unwind: '$venueDoc' },

      // Group by Month, Year, and Venue
      {
        $group: {
          _id: {
            month: { $month: '$ticket.purchaseDate' },
            year: { $year: '$ticket.purchaseDate' },
            venueName: '$venueDoc.name',
            venueCity: '$venueDoc.city',
            venueState: '$venueDoc.state'
          },
          monthlyTotal: { $sum: '$ticket.price' }
        }
      },

      // Sort by Date
      { $sort: { '_id.year': 1, '_id.month': 1 } },

      // Format output
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          venueName: '$_id.venueName',
          venueCity: '$_id.venueCity',
          venueState: '$_id.venueState',
          total: '$monthlyTotal'
        }
      }
    ]);

    res.json(salesData);
  } catch (error) {
    console.error('Distributor Analytics (Venue) Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ARTIST DASHBOARD: Sales Comparison vs Top 5
router.get('/artist/:userId/sales-comparison', async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Find the ArtistProfile ID for the current User
    const currentArtistProfile = await ArtistProfile.findOne({ user: userId });
    if (!currentArtistProfile) {
      return res.status(404).json({ message: 'Artist Profile not found' });
    }
    const currentArtistId = currentArtistProfile._id;

    // 2. Identify Top 5 Artists (IDs)
    // We reuse the aggregation logic from /top-artists but simpler just to get IDs
    const topArtistsAgg = await Event.aggregate([
      {
        $lookup: {
          from: 'performances',
          localField: 'performance',
          foreignField: '_id',
          as: 'perf'
        }
      },
      { $unwind: '$perf' },
      {
        $group: {
          _id: '$perf.artistProfile',
          totalGross: { $sum: { $multiply: ['$ticketPrice', '$ticketsSold'] } }
        }
      },
      { $sort: { totalGross: -1 } },
      { $limit: 5 }
    ]);

    const topArtistIds = topArtistsAgg.map(a => a._id);
    
    // Combine current artist with top 5 for the query
    const targetArtistIds = [...topArtistIds, currentArtistId];

    // 3. Get Monthly Sales for these specific artists
    const salesData = await Event.aggregate([
      // Lookup Performance to get Artist
      {
        $lookup: {
          from: 'performances',
          localField: 'performance',
          foreignField: '_id',
          as: 'perf'
        }
      },
      { $unwind: '$perf' },

      // Filter events belonging to Target Artists
      { $match: { 'perf.artistProfile': { $in: targetArtistIds } } },

      // Lookup Tickets
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'event',
          as: 'ticket'
        }
      },
      { $unwind: '$ticket' },
      { $match: { 'ticket.status': { $ne: 'refunded' } } },

      // Lookup Artist Profile Name
      {
        $lookup: {
          from: 'artistprofiles',
          localField: 'perf.artistProfile',
          foreignField: '_id',
          as: 'artist'
        }
      },
      { $unwind: '$artist' },

      // Group by Month, Year, Artist
      {
        $group: {
          _id: {
            month: { $month: '$ticket.purchaseDate' },
            year: { $year: '$ticket.purchaseDate' },
            artistName: '$artist.artistName',
            artistId: '$artist._id'
          },
          monthlyTotal: { $sum: '$ticket.price' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          artist: '$_id.artistName',
          artistId: '$_id.artistId',
          total: '$monthlyTotal',
          isMe: { $eq: ['$_id.artistId', currentArtistId] } // Flag to identify current user
        }
      }
    ]);

    // 4. Get Venue Breakdown for Current Artist Only
    const venueData = await Event.aggregate([
      {
        $lookup: {
          from: 'performances',
          localField: 'performance',
          foreignField: '_id',
          as: 'perf'
        }
      },
      { $unwind: '$perf' },
      { $match: { 'perf.artistProfile': currentArtistId } }, // Only current artist
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'event',
          as: 'ticket'
        }
      },
      { $unwind: '$ticket' },
      { $match: { 'ticket.status': { $ne: 'refunded' } } },
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueDoc'
        }
      },
      { $unwind: '$venueDoc' },
      {
        $group: {
          _id: {
            month: { $month: '$ticket.purchaseDate' },
            year: { $year: '$ticket.purchaseDate' },
            venueName: '$venueDoc.name',
            venueCity: '$venueDoc.city'
          },
          monthlyTotal: { $sum: '$ticket.price' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          venueName: '$_id.venueName',
          venueCity: '$_id.venueCity',
          total: '$monthlyTotal'
        }
      }
    ]);

    res.json({
      comparisonData: salesData,
      venueData: venueData
    });

  } catch (error) {
    console.error('Artist Dashboard Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;