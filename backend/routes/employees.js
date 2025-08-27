const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Team = require('../models/Team');

const allowedRoles = ["admin", "manager", "employee"];

// @route   POST /api/employees
// @desc    Create a new employee, department optional
router.post('/', async (req, res) => {
  try {
    const {
      employeeId, firstName, lastName, email, phone,
      department, position, status, address, emergencyContact, skills, role
    } = req.body;

    // Basic validation (department is optional)
    if (!employeeId || !firstName || !lastName || !email || !position || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    // Validate department if provided
    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({ error: 'Invalid department ID format' });
      }
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    // Check if employeeId or email already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { email }]
    });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this ID or email already exists' });
    }

    const employeeData = {
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

    // Set department if provided
    if (department) employeeData.department = department;

    const employee = new Employee(employeeData);
    await employee.save();

    // Populate department and team for response
    const savedEmployee = await Employee.findById(employee._id)
      .populate('department', 'name')
      .populate('team', 'name');

    res.status(201).json(savedEmployee);

  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee details, department optional
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };

    // Prevent updating immutable fields
    delete updates.employeeId;
    delete updates.email;
    delete updates.createdAt;

    // Validate role if provided
    if (updates.role && !allowedRoles.includes(updates.role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    // Validate department if provided
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ error: 'Invalid department ID format' });
      }
      const departmentExists = await Department.findById(updates.department);
      if (!departmentExists) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('department', 'name')
     .populate('team', 'name');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// @route   GET /api/employees
// @desc    Get all employees with populated department and team info
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({})
      .sort({ lastName: 1, firstName: 1 });

    const formattedEmployees = employees.map(emp => ({
      id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department ? emp.department : 'Not assigned',
      team: emp.team ? emp.team : 'Not assigned',
      status: emp.status,
      role: emp.role
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get a single employee by ID with populated department and team info
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('team', 'name');
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Remaining routes (DELETE, etc.) stay the same as your existing implementation

module.exports = router;
