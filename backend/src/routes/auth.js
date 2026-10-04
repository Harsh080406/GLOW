import express from "express";
import {
  loginUser,
  refreshToken,
  logoutUser,
  googleAuth,
  initiateGoogleAuth,
  handleGoogleCallback,
  getCsrfToken,
} from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireCsrfForCookieAuth } from "../middleware/csrf.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema } from "../validators/schemas.js";

const router = express.Router();

// Apply auth rate limiting
router.use(authRateLimiter);

// 1. POST /login
router.post("/login", validateBody(loginSchema), loginUser);

// 2. POST /refresh (with CSRF protection for cookie-based flow)
router.post("/refresh", requireCsrfForCookieAuth, refreshToken);

// 3. POST /logout
router.post("/logout", logoutUser);

// 4. GET /csrf-token (Issue anti-CSRF token)
router.get("/csrf-token", getCsrfToken);

// 5. Google OAuth 2.0 Authorization Flow
router.get("/google", initiateGoogleAuth);
router.get("/google/callback", handleGoogleCallback);
router.post("/google", googleAuth);

// 6. GET /me (Protected)
router.get("/me", authenticateJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
