const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Worker = require('../models/Employee');
const Department = require('../models/Department');

const auth = require('../middleware/auth'); // <-- Your JWT middleware

const allowedRoles = ["admin", "manager", "employee"];

// @route   POST /api/workers
// @desc    Create a new worker, department optional (admin only)
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const {
      employeeId, firstName, lastName, email, phone,
      department, position, status, address, emergencyContact, skills, role
    } = req.body;

    if (!employeeId || !firstName || !lastName || !email || !position || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({ error: 'Invalid department ID format' });
      }
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    const existingWorker = await Worker.findOne({
      $or: [{ employeeId }, { email }]
    });
    if (existingWorker) {
      return res.status(400).json({ error: 'Worker with this ID or email already exists' });
    }

    const workerData = {
      employeeId,
      firstName,
      lastName,
      email,
      phone: phone || '',
      position,
      status: status || 'Active',
      address: address || {},
      emergencyContact: emergencyContact || {},
      skills: skills || [],
      role,
      hireDate: new Date()
    };

    if (department) workerData.department = department;

    const worker = new Worker(workerData);
    await worker.save();

    const savedWorker = await Worker.findById(worker._id)
      .populate('department', 'name');

    res.status(201).json(savedWorker);

  } catch (error) {
    console.error('Error creating worker:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// @route   PUT /api/workers/:id
// @desc    Update worker (admin only)
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.employeeId;
    delete updates.email;
    delete updates.createdAt;

    if (updates.role && !allowedRoles.includes(updates.role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ error: 'Invalid department ID format' });
      }
      const departmentExists = await Department.findById(updates.department);
      if (!departmentExists) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error updating worker:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// @route   DELETE /api/workers/:id
// @desc    Delete worker (admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const deleted = await Worker.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Worker not found' });
    res.json({ message: 'Worker deleted' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// @route   GET /api/workers
// @desc    Get all workers (admin and manager only)
router.get('/', auth(['admin', 'manager']), async (req, res) => {
  try {
    const workers = await Worker.find({})
      .populate('department', 'name')
      .sort({ lastName: 1, firstName: 1 });

    const formattedWorkers = workers.map(emp => ({
      id: emp._id,
      employeeId: emp.employeeId,
      name: emp.fullName, // uses virtual
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department ? emp.department.name : 'Not assigned',
      status: emp.status,
      role: emp.role
    }));

    res.json(formattedWorkers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// @route   GET /api/workers/:id
// @desc    Get a single worker (admin and manager only)
router.get('/:id', auth(['admin', 'manager']), async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('department', 'name');
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

module.exports = router;
