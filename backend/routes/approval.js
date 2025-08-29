const express = require('express');
const router = express.Router();
const Checkin = require('../models/Checkin');
const auth = require('../middleware/auth');

// Get all pending check-ins (manager only)
router.get('/', auth(['manager', 'admin']), async (req, res) => {
  try {
    const pendingCheckins = await Checkin.find({ status: 'pending' })
      .populate('employee', 'employeeId firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(pendingCheckins);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch check-ins' });
  }
});

// Approve or reject a check-in (manager only)
router.post('/:id/review', auth(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const checkin = await Checkin.findById(id);
    if (!checkin) {
      return res.status(404).json({ message: 'Check-in record not found' });
    }

    checkin.status = status;
    checkin.reviewComments = reviewComments || '';
    await checkin.save();

    res.json({ message: `Check-in ${status}`, checkin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update check-in status' });
  }
});
//Get all approved or rejected check-ins (manager only)
router.get('/history', auth(['manager', 'admin']), async (req, res) => {
  try {
    const { date } = req.query; // Expecting date in YYYY-MM-DD format
    console.log(`Fetching history for date: ${date || 'all'}`);

    const query = {
      status: { $in: ['approved', 'rejected'] }
    };

    if (date) {
      const startOfDayUTC = `${date}T00:00:00.000Z`;
      const endOfDayUTC = `${date}T23:59:59.999Z`;

      const startDate = new Date(startOfDayUTC);
      const endDate = new Date(endOfDayUTC);

      // The 'createdAt' field is automatically managed by Mongoose and is reliable
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    console.log('Executing query:', JSON.stringify(query, null, 2));

    const historyCheckins = await Checkin.find(query)
      .populate('employee', 'employeeId firstName lastName email')
      .sort({ createdAt: -1 });

    console.log(`Found ${historyCheckins.length} records.`);

    res.json(historyCheckins);
  } catch (error) {
    console.error("Failed to fetch check-in history:", error);
    res.status(500).json({ message: 'Failed to fetch check-in history' });
  }
});
module.exports = router;
