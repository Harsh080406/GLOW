import express from "express";
import {
  getTransportDashboard,
  reassignStudent,
  autoBalanceRoutes,
  getTransportReports,
} from "../controllers/transportController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole("transport_manager", "super_admin"));

router.get("/dashboard", getTransportDashboard);
router.post("/students/reassign", reassignStudent);
router.post("/routes/auto-balance", autoBalanceRoutes);
router.get("/reports", getTransportReports);

export default router;
