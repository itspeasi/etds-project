const express = require('express');
const mongoose = require('mongoose');
const JSZip = require('jszip');
const { seedDatabase, clearDatabase } = require('../utils/seeder');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(adminOnly);

// --- Collection Management Routes ---

// Get all collection names
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));
    res.json(collectionNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get data from a specific collection (Paginated)
router.get('/collections/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const collection = mongoose.connection.db.collection(collectionName);
    
    // Get total count for pagination metadata
    const total = await collection.countDocuments({});
    
    // Get paginated data
    const data = await collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a collection
router.delete('/collections/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    await mongoose.connection.db.dropCollection(collectionName);
    res.status(200).json({ message: `Collection '${collectionName}' deleted successfully.` });
  } catch (error) {
    if (error.code === 26) { 
      return res.status(404).json({ message: 'Collection not found.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Export all collections as a zip file
router.get('/export-all', async (req, res) => {
  try {
    const zip = new JSZip();
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));

    for (const name of collectionNames) {
      const data = await mongoose.connection.db.collection(name).find({}).toArray();
      zip.file(`${name}.json`, JSON.stringify(data, null, 2));
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename="collections.zip"');
    res.send(zipContent);
  } catch (error) {
    res.status(500).json({ message: `Error exporting collections: ${error.message}` });
  }
});

// --- Database Management Routes ---
router.post('/reset-db', async (req, res) => {
  try {
    await clearDatabase();
    await seedDatabase();
    res.json({ message: 'Database reset to seed data successfully.' });
  } catch (error) {
    console.error('Reset DB Error:', error);
    res.status(500).json({ message: 'Failed to reset database: ' + error.message });
  }
});

router.post('/clear-db', async (req, res) => {
  try {
    await clearDatabase();
    res.json({ message: 'All collections deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear database: ' + error.message });
  }
});

module.exports = router;