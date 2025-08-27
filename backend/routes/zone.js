const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');
const Team = require('../models/Team'); 
const Department = require('../models/Department'); 

// POST /api/zones - Assign a team to a zone
router.post('/', async (req, res) => {
  try {
    const { name: zoneName, team } = req.body;

    if (!zoneName || !team) {
      return res.status(400).json({ error: 'Please provide zone name and team.' });
    }

    // 🔹 Find the team and its department
    const teamDoc = await Team.findById(team).populate('department');
    if (!teamDoc || !teamDoc.department) {
      return res.status(404).json({ error: 'Team or department not found.' });
    }

    // 🔹 Get all tasks from the department
    let assignedTasks = [];
    if (Array.isArray(teamDoc.department.tasks) && teamDoc.department.tasks.length > 0) {
      assignedTasks = teamDoc.department.tasks; // ✅ assign full array
    }

    // Create or update zone assignment with team + tasks
    const updatedZone = await Zone.findOneAndUpdate(
      { name: zoneName },                               // match by zone name
      { team, tasks: assignedTasks, assignedAt: new Date() }, // ✅ use tasks array
      { new: true, upsert: true }
    );

    res.json({ 
      message: `Team assigned successfully to zone "${zoneName}".`, 
      zone: updatedZone 
    });
  } catch (error) {
    console.error('Failed to assign team:', error);
    res.status(500).json({ error: 'Failed to assign team.' });
  }
});

module.exports = router;
