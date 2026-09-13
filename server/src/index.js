/**
 * SchedViz API Server — Entry Point
 *
 * Security layers applied here (in order):
 *   1. Env-var guard  — exits immediately if JWT_SECRET or MONGO_URI are missing
 *   2. Helmet         — sets secure HTTP response headers
 *   3. CORS           — restricted to CLIENT_URL env var (fallback: localhost:3000)
 *   4. Rate limiting  — applied per route group (see routes/ files for limits)
 *   5. express.json() — body parser (after security middleware)
 */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const mongoose   = require('mongoose');
const rateLimit  = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const simulateRoutes = require('./routes/simulate');
const historyRoutes  = require('./routes/history');

// ── 1. Guard: fail fast if required env vars are missing ─────────────────────
// Running without these would cause silent failures deep in request handlers.
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI'];
const missingVars = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error(
    `[SchedViz] ✖ Missing required environment variable(s): ${missingVars.join(', ')}\n` +
    `  Copy server/.env.example to server/.env and fill in the values.`
  );
  process.exit(1);
}

const app = express();

// ── 2. Helmet — secure HTTP headers ──────────────────────────────────────────
// Sets X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS, etc.
// Content-Security-Policy is left at Helmet's safe defaults.
app.use(helmet());

// ── 3. CORS — restrict to known frontend origin ───────────────────────────────
// In production, set CLIENT_URL to your deployed frontend URL.
// In development, it falls back to http://localhost:3000 (Vite default).
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// ── 4. Rate limiters ──────────────────────────────────────────────────────────
// Auth limiter: prevents brute-force login/signup attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per IP per window
  standardHeaders: true,     // returns RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait 15 minutes before trying again.' },
});

// Simulate limiter: prevents abusive C++ subprocess spawning
const simulateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // max 30 simulation requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Simulation rate limit exceeded. Please wait before running more simulations.' },
});

// ── 5. Body parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' })); // cap body size to prevent large payload attacks

// ── 6. MongoDB connection ─────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[SchedViz] MongoDB connected'))
  .catch(err => {
    console.error('[SchedViz] MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── 7. Routes (with rate limiters applied per group) ─────────────────────────
// Auth routes get the strict limiter (brute-force protection)
app.use('/api/auth', authLimiter, authRoutes);

// Simulate routes get the subprocess-abuse limiter
app.use('/api/simulate', simulateLimiter, simulateRoutes);

// History routes (auth-gated in the router itself, no extra rate limit needed)
app.use('/api/history', historyRoutes);

// Health check (not rate-limited — used by uptime monitors)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 8. Global error handler ───────────────────────────────────────────────────
// Catches any unhandled errors thrown by route handlers.
// Never exposes stack traces or internal details to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[SchedViz] Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// ── 9. Start listening ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SchedViz] Server running on http://localhost:${PORT}`);
  console.log(`[SchedViz] CORS allowed origin: ${allowedOrigin}`);
});
