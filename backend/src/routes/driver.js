import express from "express";
import {
  getDriverDashboard,
  startTrip,
  pauseTrip,
  completeTrip,
  validatePass,
  broadcastDelay,
  triggerDriverSos,
} from "../controllers/driverController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import {
  startTripSchema,
  validatePassSchema,
  broadcastDelaySchema,
  driverSosSchema,
} from "../validators/schemas.js";

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole("driver", "super_admin", "transport_manager"));

// Dashboard
router.get("/dashboard", getDriverDashboard);
router.get("/me/dashboard", getDriverDashboard);

// Trip Lifecycle
router.post("/trip/start", validateBody(startTripSchema), startTrip);
router.post("/me/trip/start", validateBody(startTripSchema), startTrip);

router.patch("/trip/pause", pauseTrip);
router.post("/trip/pause", pauseTrip);
router.patch("/trip/:id/pause", pauseTrip);
router.patch("/me/trip/pause", pauseTrip);
router.patch("/me/trip/:id/pause", pauseTrip);

router.patch("/trip/complete", completeTrip);
router.post("/trip/complete", completeTrip);
router.patch("/trip/:id/complete", completeTrip);
router.patch("/me/trip/complete", completeTrip);
router.patch("/me/trip/:id/complete", completeTrip);

// Pass Validation (Camera QR & Manual ID fallback)
router.post("/scan-pass", validateBody(validatePassSchema), validatePass);
router.post("/validate-pass", validateBody(validatePassSchema), validatePass);
router.post("/me/validate-pass", validateBody(validatePassSchema), validatePass);

// Delay Notices
router.post("/broadcast-delay", validateBody(broadcastDelaySchema), broadcastDelay);
router.post("/trip/:id/delay", validateBody(broadcastDelaySchema), broadcastDelay);
router.post("/me/broadcast-delay", validateBody(broadcastDelaySchema), broadcastDelay);
router.post("/me/trip/:id/delay", validateBody(broadcastDelaySchema), broadcastDelay);

// Driver Emergency SOS
router.post("/sos", validateBody(driverSosSchema), triggerDriverSos);
router.post("/me/sos", validateBody(driverSosSchema), triggerDriverSos);

export default router;
