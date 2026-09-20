import express from "express";
import {
  getStudentDashboard,
  getMyBus,
  getMyRoute,
  getSchedule,
  getTransportPass,
  getStudentFees,
  payStudentFee,
  uploadChallan,
  getNotifications,
  markNotificationsRead,
  getComplaints,
  createComplaint,
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Require student authorization for all student routes
router.use(authenticateJWT);
router.use(requireRole("student", "super_admin", "transport_manager"));

router.get("/dashboard", getStudentDashboard);
router.get("/my-bus", getMyBus);
router.get("/my-route", getMyRoute);
router.get("/schedule", getSchedule);
router.get("/pass", getTransportPass);
router.get("/fees", getStudentFees);
router.post("/fees/pay", payStudentFee);
router.post("/fees/upload-challan", uploadChallan);
router.get("/notifications", getNotifications);
router.patch("/notifications/read-all", markNotificationsRead);
router.get("/complaints", getComplaints);
router.post("/complaints", createComplaint);
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);

export default router;
