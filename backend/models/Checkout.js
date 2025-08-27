const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',  // same reference as in Checkin
    required: true
  },
  checkin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checkin', // links to the corresponding checkin
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now // when checkout happens
  }
}, { timestamps: true });

module.exports = mongoose.model('Checkout', checkoutSchema);
