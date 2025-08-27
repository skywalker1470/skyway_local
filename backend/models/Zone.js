const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  tasks: {
    type: [String],   // ✅ new field for tasks array
    default: []
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Zone', zoneSchema);
