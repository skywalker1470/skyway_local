const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker', // or 'Employee' depending on your model name
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  officeName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  reviewComments: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Checkin', checkinSchema);
