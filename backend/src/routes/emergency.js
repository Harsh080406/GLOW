import express from "express";
import { triggerSos } from "../controllers/emergencyController.js";
import { sosRateLimiter } from "../middleware/rateLimiter.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.use(sosRateLimiter);
router.post("/sos", authenticateJWT, triggerSos);

export default router;
