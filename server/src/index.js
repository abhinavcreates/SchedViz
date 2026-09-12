const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const simulateRoutes = require('./routes/simulate');
const historyRoutes = require('./routes/history');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[SchedViz] MongoDB connected'))
  .catch(err => { console.error('[SchedViz] MongoDB connection error:', err); process.exit(1); });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SchedViz] Server running on http://localhost:${PORT}`);
});
