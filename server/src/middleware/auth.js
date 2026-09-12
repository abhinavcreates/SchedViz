const jwt = require('jsonwebtoken');

/**
 * Middleware: verifies the JWT from the Authorization header.
 * Attaches the decoded user payload to req.user.
 * Returns 401 if token is missing or invalid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Middleware: optionally verifies JWT but doesn't block if missing.
 * Attaches req.user if token is valid, otherwise req.user = null.
 * Use this for routes that work for both authenticated and guest users.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
