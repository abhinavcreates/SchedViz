const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { runEngine } = require('../utils/engine');
const Simulation = require('../models/Simulation');

const router = express.Router();

// All simulation routes are optionally authenticated
router.use(optionalAuth);

/**
 * Helper to save simulation history for authenticated users.
 * Keeps only the last 5 simulations per user.
 * 
 * @param {string} userId - ID of the user
 * @param {string} module - 'cpu', 'memory', or 'page'
 * @param {string} algorithm - The specific algorithm used
 * @param {Object} input - Input payload sent to engine
 * @param {Object} result - Result received from engine
 */
async function saveHistory(userId, module, algorithm, input, result) {
  try {
    const sim = new Simulation({ userId, module, algorithm, input, result });
    await sim.save();

    const count = await Simulation.countDocuments({ userId });
    if (count > 5) {
      const oldest = await Simulation.find({ userId }).sort({ createdAt: 1 }).limit(1);
      if (oldest.length > 0) {
        await Simulation.findByIdAndDelete(oldest[0]._id);
      }
    }
  } catch (err) {
    console.error('[SchedViz] Failed to save simulation history:', err);
  }
}

/**
 * POST /api/simulate/cpu
 * Simulates CPU scheduling algorithms.
 * 
 * @param {Object} req.body - { algorithm, processes, quantum }
 */
router.post('/cpu', async (req, res) => {
  try {
    const { algorithm, processes, quantum = 2 } = req.body;
    
    const validAlgos = ['fcfs', 'sjf', 'srtf', 'rr', 'priority_np', 'priority_p'];
    if (!validAlgos.includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid algorithm' });
    }
    
    if (!Array.isArray(processes) || processes.length === 0) {
      return res.status(400).json({ error: 'Processes must be a non-empty array' });
    }

    if (processes.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 processes allowed per simulation' });
    }
    
    for (const p of processes) {
      if (typeof p.id !== 'string' || p.id.trim() === '') {
        return res.status(400).json({ error: 'Each process must have a non-empty string id' });
      }
      if (!Number.isInteger(p.arrival) || p.arrival < 0) {
        return res.status(400).json({ error: `Process ${p.id}: arrival must be a non-negative integer` });
      }
      if (!Number.isInteger(p.burst) || p.burst <= 0) {
        return res.status(400).json({ error: `Process ${p.id}: burst must be a positive integer` });
      }
      if (algorithm.startsWith('priority') && (p.priority === undefined || !Number.isInteger(p.priority))) {
        return res.status(400).json({ error: `Process ${p.id}: priority (integer) is required for priority algorithms` });
      }
    }
    
    if (algorithm === 'rr' && (!Number.isInteger(quantum) || quantum <= 0)) {
      return res.status(400).json({ error: 'Quantum must be a positive integer for Round Robin' });
    }
    
    const payload = { module: 'cpu', algorithm, processes, quantum };
    const result = await runEngine(payload);
    
    if (req.user && req.user.id) {
      await saveHistory(req.user.id, 'cpu', algorithm, payload, result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('[SchedViz] CPU simulation error:', err.message);
    res.status(500).json({ error: 'Simulation failed. Please check your inputs and try again.' });
  }
});

/**
 * POST /api/simulate/memory
 * Simulates Memory Allocation algorithms.
 * 
 * @param {Object} req.body - { algorithm, blocks, processes }
 */
router.post('/memory', async (req, res) => {
  try {
    const { algorithm, blocks, processes } = req.body;
    
    const validAlgos = ['firstfit', 'bestfit', 'worstfit'];
    if (!validAlgos.includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid algorithm' });
    }
    
    if (!Array.isArray(blocks) || blocks.length === 0 || !Array.isArray(processes) || processes.length === 0) {
      return res.status(400).json({ error: 'Blocks and processes must be non-empty arrays' });
    }

    // Cap input sizes to prevent long-running engine subprocesses
    if (processes.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 processes allowed per simulation' });
    }
    if (blocks.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 memory blocks allowed per simulation' });
    }
    
    const payload = { module: 'memory', algorithm, blocks, processes };
    const result = await runEngine(payload);
    
    if (req.user && req.user.id) {
      await saveHistory(req.user.id, 'memory', algorithm, payload, result);
    }
    
    res.json(result);
  } catch (err) {
    // Log full error internally; never send internal details (binary paths, C++ exceptions) to client
    console.error('[SchedViz] Memory simulation error:', err.message);
    res.status(500).json({ error: 'Simulation failed. Please check your inputs and try again.' });
  }
});

/**
 * POST /api/simulate/page
 * Simulates Page Replacement algorithms.
 * 
 * @param {Object} req.body - { algorithm, frames, referenceString }
 */
router.post('/page', async (req, res) => {
  try {
    const { algorithm, frames, referenceString } = req.body;
    
    const validAlgos = ['fifo', 'lru', 'optimal'];
    if (!validAlgos.includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid algorithm' });
    }
    
    if (!Number.isInteger(frames) || frames <= 0) {
      return res.status(400).json({ error: 'Frames must be a positive integer' });
    }

    if (frames > 20) {
      return res.status(400).json({ error: 'Maximum 20 frames allowed' });
    }
    
    if (!Array.isArray(referenceString) || referenceString.length === 0) {
      return res.status(400).json({ error: 'Reference string must be a non-empty array' });
    }

    // Cap reference string length to prevent extremely long C++ simulations
    if (referenceString.length > 100) {
      return res.status(400).json({ error: 'Reference string must not exceed 100 page references' });
    }
    
    const payload = { module: 'page', algorithm, frames, referenceString };
    const result = await runEngine(payload);
    
    if (req.user && req.user.id) {
      await saveHistory(req.user.id, 'page', algorithm, payload, result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('[SchedViz] Page simulation error:', err.message);
    res.status(500).json({ error: 'Simulation failed. Please check your inputs and try again.' });
  }
});

module.exports = router;
