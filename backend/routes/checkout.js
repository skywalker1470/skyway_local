const express = require('express');
const router = express.Router();

const Checkin = require('../models/Checkin');
const Checkout = require('../models/Checkout');

// POST /api/checkout
router.post('/', async (req, res) => {
  try {
    const { employeeId, checkinId } = req.body;

    // 1. Find the checkin record
    const checkin = await Checkin.findById(checkinId);

    if (!checkin) {
      return res.status(404).json({ message: 'Checkin not found' });
    }

    // 2. Check if the employee matches
    if (checkin.employee.toString() !== employeeId) {
      return res.status(403).json({ message: 'Employee does not match this checkin' });
    }

    // 3. Allow checkout only if supervisor approved
    if (checkin.status !== 'approved') {
      return res.status(400).json({ message: 'Checkout not allowed. Supervisor has not approved yet.' });
    }

    // 4. Prevent multiple checkouts for the same checkin
    const existingCheckout = await Checkout.findOne({ checkin: checkinId });
    if (existingCheckout) {
      return res.status(400).json({ message: 'Already checked out for this checkin' });
    }

    // 5. Create checkout record with timestamp
    const checkout = new Checkout({
      employee: employeeId,
      checkin: checkinId,
      timestamp: new Date()
    });

    await checkout.save();

    res.status(201).json({
      message: 'Checkout successful',
      checkout
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
