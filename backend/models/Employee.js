const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false // Department is optional
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated', 'Probation'],
    default: 'Active'
  },
  role: {
    type: String,
    enum: ["admin", "manager", "employee"],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for employee's full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update the updatedAt field before saving
employeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Worker = mongoose.model('Worker', employeeSchema, 'workers');

module.exports = Worker;