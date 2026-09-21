import express from "express";
import {
  getStudentSummary,
  getStudentBus,
  getStudentRouteStops,
  createStopNotification,
  downloadRoutePdf,
  getStudentSchedule,
  downloadSchedulePdf,
  getStudentPass,
  downloadPassPdf,
  getStudentFees,
  payStudentFee,
  uploadChallan,
  getNotifications,
  markNotificationsRead,
  deleteNotification,
  getComplaints,
  createComplaint,
  triggerSos,
  cancelSosAlert,
  getStudentProfile,
  updateStudentProfile,
  changePassword,
} from "../controllers/studentController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadChallanMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole("student", "super_admin", "transport_manager"));

// Standard & /me Aliases
router.get("/dashboard", getStudentSummary);
router.get("/me/summary", getStudentSummary);

router.get("/my-bus", getStudentBus);
router.get("/me/bus", getStudentBus);

router.get("/my-route", getStudentRouteStops);
router.get("/me/route/stops", getStudentRouteStops);
router.post("/me/stop-notifications", createStopNotification);
router.get("/me/route/pdf", downloadRoutePdf);

router.get("/schedule", getStudentSchedule);
router.get("/me/schedule", getStudentSchedule);
router.get("/me/schedule/pdf", downloadSchedulePdf);

router.get("/pass", getStudentPass);
router.get("/me/pass", getStudentPass);
router.get("/me/pass/pdf", downloadPassPdf);

router.get("/fees", getStudentFees);
router.get("/me/fees", getStudentFees);
router.post("/fees/pay", payStudentFee);
router.post("/me/pay", payStudentFee);
router.post("/fees/upload-challan", uploadChallanMiddleware.single("challan"), uploadChallan);
router.post("/me/challan-upload", uploadChallanMiddleware.single("challan"), uploadChallan);

router.get("/notifications", getNotifications);
router.get("/me/notifications", getNotifications);
router.patch("/notifications/read-all", markNotificationsRead);
router.patch("/me/notifications/read-all", markNotificationsRead);
router.delete("/me/notifications/:id", deleteNotification);

router.get("/complaints", getComplaints);
router.get("/me/complaints", getComplaints);
router.post("/complaints", createComplaint);
router.post("/me/complaints", createComplaint);

router.post("/me/sos", triggerSos);
router.patch("/me/sos/:id/cancel", cancelSosAlert);

router.get("/profile", getStudentProfile);
router.get("/me/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.patch("/me/profile", updateStudentProfile);
router.post("/me/change-password", changePassword);

export default router;
