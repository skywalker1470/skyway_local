const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  workers: [{
    type: String,
    required: true
  }],
  supervisor: {
    type: String,
    required: true
  },
  tasks: [{
    type: String,
    default: []
  }]
}, { timestamps: true });

// Add a pre-save hook to automatically fetch department tasks
teamSchema.pre('save', async function(next) {
  try {
    const Department = mongoose.model('Department');
    const dept = await Department.findById(this.department);
    if (dept) {
      this.tasks = [...dept.tasks];
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Team', teamSchema);
