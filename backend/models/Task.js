const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    required: true,
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  task: {
    type: String,
    required: true,
    trim: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
