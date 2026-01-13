// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Import User model
const { seedDatabase } = require('./utils/seeder'); // Import seeder
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const artistProfileRoutes = require('./routes/artistProfiles');
const performanceRoutes = require('./routes/performances');
const eventRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const ticketRoutes = require('./routes/tickets');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/etds';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('MongoDB connected successfully.');
    
    // Auto-seed if no users exist (First run logic)
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('No users found. Running initial seed...');
        await seedDatabase();
      }
    } catch (err) {
      console.error('Auto-seed check failed:', err);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/', (req, res) => {
  res.send('ETDS Server is running and connected to the database!');
});

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/artist-profiles', artistProfileRoutes);
app.use('/api/performances', performanceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});