const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Department = require('../models/Department');

// @route   GET /api/teams
// @desc    Get all teams with department details
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('department', 'name tasks')
      .sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/teams
// @desc    Create a team
router.post('/', async (req, res) => {
  const { name, department: departmentId, workers, supervisor } = req.body;

  try {
    // Check if team exists
    let team = await Team.findOne({ name });
    if (team) {
      return res.status(400).json({ errors: [{ msg: 'Team already exists' }] });
    }

    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ errors: [{ msg: 'Department not found' }] });
    }

    // Create new team
    team = new Team({
      name,
      department: departmentId,
      workers: Array.isArray(workers) ? workers : [],
      supervisor
    });

    await team.save();
    
    // Populate department details in response
    const populatedTeam = await Team.findById(team._id)
      .populate('department', 'name tasks');
      
    res.json(populatedTeam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID with department details
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('department', 'name tasks');
      
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }
    
    res.json(team);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/teams/:id
// @desc    Update a team
router.put('/:id', async (req, res) => {
  const { name, department: departmentId, workers, supervisor } = req.body;

  try {
    let team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // If department is being updated, verify it exists
    if (departmentId && departmentId !== team.department.toString()) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({ errors: [{ msg: 'Department not found' }] });
      }
    }

    // Update team fields
    team.name = name || team.name;
    team.department = departmentId || team.department;
    team.workers = Array.isArray(workers) ? workers : team.workers;
    team.supervisor = supervisor || team.supervisor;

    await team.save();
    
    // Populate department details in response
    const populatedTeam = await Team.findById(team._id)
      .populate('department', 'name tasks');
      
    res.json(populatedTeam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/teams/:id
// @desc    Delete a team
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    await team.remove();
    res.json({ msg: 'Team removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
