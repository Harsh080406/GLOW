import express from "express";
import {
  getDriverDashboard,
  startTrip,
  pauseTrip,
  completeTrip,
  scanPass,
  broadcastDelay,
} from "../controllers/driverController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Require driver authorization for driver routes
router.use(authenticateJWT);
router.use(requireRole("driver", "super_admin", "transport_manager"));

router.get("/dashboard", getDriverDashboard);
router.post("/trip/start", startTrip);
router.post("/trip/pause", pauseTrip);
router.post("/trip/complete", completeTrip);
router.post("/scan-pass", scanPass);
router.post("/broadcast-delay", broadcastDelay);

export default router;
