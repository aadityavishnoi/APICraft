const rateLimit = require('express-rate-limit');

// Auth endpoints — strict, by IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login specifically — tighter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dynamic API routes — per IP, generous but bounded
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 120,
  message: { message: 'Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dashboard routes — per authenticated user (keyed by user id)
const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: false,
  message: { message: 'Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, loginLimiter, apiLimiter, dashboardLimiter };