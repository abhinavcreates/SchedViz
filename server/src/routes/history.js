const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Simulation = require('../models/Simulation');

const router = express.Router();

// All history routes require authentication
router.use(requireAuth);

/**
 * GET /api/history
 * Returns the authenticated user's last 5 simulations.
 * 
 * @returns {Array} Array of simulation objects sorted by createdAt descending
 */
router.get('/', async (req, res) => {
  try {
    const history = await Simulation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * DELETE /api/history/:id
 * Deletes a specific simulation by ID, if it belongs to the authenticated user.
 * 
 * @param {string} req.params.id - The simulation ID
 * @returns {Object} Success message or error
 */
router.delete('/:id', async (req, res) => {
  try {
    const sim = await Simulation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sim) {
      return res.status(404).json({ error: 'Simulation not found or not authorized' });
    }
    res.json({ message: 'Simulation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete simulation' });
  }
});

module.exports = router;
