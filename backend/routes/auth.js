const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Worker = require('../models/Employee');

router.post('/login', async (req, res) => {
  const { employeeId, password } = req.body; // password here is phone

  try {
    const user = await Worker.findOne({ employeeId });
    if (!user || user.phone !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        employeeId: user.employeeId,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
