const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

const router = express.Router();

// Purchase Tickets
router.post('/purchase', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { eventId, quantity, userId } = req.body;
    if (!eventId || !quantity || !userId) throw new Error('Missing required fields');
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');

    const event = await Event.findById(eventId).populate('venue').session(session);
    if (!event) throw new Error('Event not found');
    if (event.status !== 'approved') throw new Error('Event is not open for ticket sales');

    const now = new Date();

    // Past events cannot be purchased
    if (new Date(event.startDateTime) < now) {
      throw new Error('Event has already started or ended. Sales are closed.');
    }

    const capacity = event.venue.capacity;
    const currentSold = event.ticketsSold || 0;

    if (currentSold + quantity > capacity) {
      const remaining = capacity - currentSold;
      throw new Error(remaining > 0 ? `Only ${remaining} tickets remaining.` : 'Event is Sold Out.');
    }

    const totalPrice = event.ticketPrice * quantity;

    const transaction = new Transaction({
      user: userId,
      event: eventId,
      amount: totalPrice,
      quantity: quantity,
      status: 'completed'
    });
    await transaction.save({ session });

    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      tickets.push({
        event: eventId,
        user: userId,
        transaction: transaction._id,
        price: event.ticketPrice,
        status: 'active'
      });
    }
    await Ticket.insertMany(tickets, { session });

    event.ticketsSold = currentSold + quantity;
    await event.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Tickets purchased successfully', transactionId: transaction._id });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get user tickets (PAGINATED)
router.get('/my-tickets/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default limit
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ user: req.params.userId })
      .populate({
        path: 'event',
        populate: [
          { path: 'venue', select: 'name city state' },
          { 
            path: 'performance', 
            select: 'performanceName artistProfile',
            populate: { path: 'artistProfile', select: 'artistName' } 
          }
        ]
      })
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get All Tickets (Paginated)
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find()
      .populate({
        path: 'event',
        select: 'startDateTime',
        populate: {
            path: 'performance',
            select: 'performanceName'
        }
      })
      .populate('user', 'username')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update Ticket
router.put('/:id', async (req, res) => {
    try {
        const { purchaseDate } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { purchaseDate },
            { new: true }
        );
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;