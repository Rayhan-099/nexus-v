const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');

// @route   GET /api/partners/nearby
// @desc    Fetches a list of nearby service centers.
router.get('/nearby', async (req, res) => {
  try {
    const { type, lat, lng } = req.query;
    // For MVP, just return all partners of that type (ignore lat/lng for now)
    const partners = await Partner.find({ type: type || { $exists: true } });
    res.json(partners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Used to seed quick data for hackathon MVP test
router.post('/seed', async (req, res) => {
  try {
    // Clear existing for clean demo
    await Partner.deleteMany({});
    
    const p1 = new Partner({
      _id: "000000000000000000000000",
      businessName: "QuickWash Downtown",
      type: "WASH",
      location: { lat: 12.9716, lng: 77.5946 },
      metrics: { currentQueueLength: 2, avgWaitTimeMins: 15 }
    });
    const p2 = new Partner({
      businessName: "EV Charge Hub East",
      type: "EV_STATION",
      location: { lat: 12.9816, lng: 77.6046 },
    });
    const p3 = new Partner({
      businessName: "Honest Fix Auto",
      type: "REPAIR",
      location: { lat: 12.9616, lng: 77.5846 },
    });
    await Promise.all([p1.save(), p2.save(), p3.save()]);
    res.json({ message: 'Seed data created' });
  } catch (err) {
    res.status(500).send('Error seeding data');
  }
});

module.exports = router;
