const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // indexed for fast history queries per user
  },
  module: {
    type: String,
    enum: ['cpu', 'memory', 'page'],
    required: true
  },
  algorithm: {
    type: String,
    required: true
  },
  // Store the full input payload for history replay
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Store the full result for history replay
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Simulation', simulationSchema);
