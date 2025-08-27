const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// @route   GET /api/departments
// @desc    Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/departments
// @desc    Create a new department
router.post('/', async (req, res) => {
  const { name, tasks } = req.body;
  try {
    // Check if department already exists
    let department = await Department.findOne({ name });
    if (department) {
      return res.status(400).json({ errors: [{ msg: 'Department already exists' }] });
    }
    // Create new department
    department = new Department({
      name,
      tasks: Array.isArray(tasks) ? tasks : []
    });
    await department.save();
    res.json(department);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/departments/:id/tasks
// @desc    Get tasks for a specific department by ID
router.get('/:id/tasks', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ msg: 'Department not found' });
    }
    res.json(department.tasks);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Department not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete a department by ID
router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ msg: 'Department not found' });
    }
    // Optionally: Add logic here to check if this department has teams before deleting
    await department.remove();
    res.json({ msg: 'Department removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Department not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
