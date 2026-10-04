import express from "express";
import {
  loginUser,
  refreshToken,
  logoutUser,
  googleAuth,
  initiateGoogleAuth,
  handleGoogleCallback,
} from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// Apply auth rate limiting
router.use(authRateLimiter);

// 1. POST /login
router.post("/login", loginUser);

// 2. POST /refresh
router.post("/refresh", refreshToken);

// 3. POST /logout
router.post("/logout", logoutUser);

// 4. Google OAuth 2.0 Authorization Flow
router.get("/google", initiateGoogleAuth);
router.get("/google/callback", handleGoogleCallback);
router.post("/google", googleAuth);

// 5. GET /me (Protected)
router.get("/me", authenticateJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
