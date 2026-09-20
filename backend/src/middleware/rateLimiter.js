import rateLimit from "express-rate-limit";

// Rate limiter for authentication endpoints (login, refresh, oauth)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    },
  },
});

// Rate limiter for high-priority SOS emergency endpoint
export const sosRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 SOS broadcasts per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many SOS emergency alerts sent. Please wait before broadcasting again.",
    },
  },
});
