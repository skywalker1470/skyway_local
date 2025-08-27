const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { isWithinRadius } = require('../utils/locationUtils');
const cloudinary = require('cloudinary').v2;
const Checkin = require('../models/Checkin');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const streamUpload = (buffer, watermarkText) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: 'image',
      transformation: [
        { width: 800, crop: "limit" },
        {
          overlay: {
            font_family: "Arial",
            font_size: 20,
            text: watermarkText
          },
          gravity: "south",
          y: 10,
          color: "white",
          opacity: 60
        }
      ]
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

// POST /api/checkin
router.post('/', auth(['employee']), upload.single('photo'), async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const employeeId = req.user.id; // from JWT

    if (!lat || !lng) return res.status(400).json({ message: 'Location required' });
    if (!req.file) return res.status(400).json({ message: 'Photo required' });

    // Validate radius
    const { inside, office } = await isWithinRadius(parseFloat(lat), parseFloat(lng));
    if (!inside) {
      return res.status(403).json({ message: 'You are not within the allowed office radius to check-in.' });
    }

    // Prepare watermark text
    const now = new Date();
    const watermarkText = `${req.user.employeeId || req.user.email} | ${now.toLocaleDateString()} ${now.toLocaleTimeString()} | ${lat},${lng}`;

    // Upload photo with watermark
    const uploadResult = await streamUpload(req.file.buffer, watermarkText);

    // Save check-in record
    const newCheckin = new Checkin({
      employee: employeeId,
      lat,
      lng,
      photoUrl: uploadResult.secure_url,
      officeName: office.officeName,
      status: 'pending',
      timestamp: now
    });

    await newCheckin.save();

    res.json({
      message: 'Check-in recorded and photo uploaded, awaiting manager approval',
      photoUrl: uploadResult.secure_url,
      checkinId: newCheckin._id
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
});

// NEW ROUTE: GET /api/checkin/status
// Returns the latest check-in status of the logged-in employee
router.get('/status', auth(['employee']), async (req, res) => {
  try {
    const latestCheckin = await Checkin.findOne({ employee: req.user.id })
      .sort({ createdAt: -1 });

    if (!latestCheckin) {
      return res.status(404).json({ message: 'No check-in record found for user' });
    }

    res.json({ status: latestCheckin.status });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    res.status(500).json({ message: 'Failed to fetch check-in status' });
  }
});

module.exports = router;
