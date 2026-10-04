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
import { authenticateJWT, optionalAuthenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadChallanMiddleware, scanUploadedFile } from "../middleware/uploadMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import {
  createStopNotificationSchema,
  payStudentFeeSchema,
  createComplaintSchema,
  triggerSosSchema,
  updateStudentProfileSchema,
  changePasswordSchema,
} from "../validators/schemas.js";

const router = express.Router();

// Direct PDF Downloads (Permissive access with fallback user so student downloads never get blocked)
router.get("/schedule/pdf", optionalAuthenticateJWT, downloadSchedulePdf);
router.get("/me/schedule/pdf", optionalAuthenticateJWT, downloadSchedulePdf);
router.get("/route/pdf", optionalAuthenticateJWT, downloadRoutePdf);
router.get("/me/route/pdf", optionalAuthenticateJWT, downloadRoutePdf);
router.get("/pass/pdf", optionalAuthenticateJWT, downloadPassPdf);
router.get("/me/pass/pdf", optionalAuthenticateJWT, downloadPassPdf);

router.use(authenticateJWT);
router.use(requireRole("student", "super_admin", "transport_manager"));

// Standard & /me Aliases
router.get("/dashboard", getStudentSummary);
router.get("/me/summary", getStudentSummary);

router.get("/my-bus", getStudentBus);
router.get("/me/bus", getStudentBus);

router.get("/my-route", getStudentRouteStops);
router.get("/me/route/stops", getStudentRouteStops);
router.post("/me/stop-notifications", validateBody(createStopNotificationSchema), createStopNotification);
router.get("/me/route/pdf", downloadRoutePdf);

router.get("/schedule", getStudentSchedule);
router.get("/me/schedule", getStudentSchedule);
router.get("/me/schedule/pdf", downloadSchedulePdf);

router.get("/pass", getStudentPass);
router.get("/me/pass", getStudentPass);
router.get("/me/pass/pdf", downloadPassPdf);

router.get("/fees", getStudentFees);
router.get("/me/fees", getStudentFees);
router.post("/fees/pay", validateBody(payStudentFeeSchema), payStudentFee);
router.post("/me/pay", validateBody(payStudentFeeSchema), payStudentFee);
router.post(
  "/fees/upload-challan",
  uploadChallanMiddleware.single("challan"),
  scanUploadedFile,
  uploadChallan
);
router.post(
  "/me/challan-upload",
  uploadChallanMiddleware.single("challan"),
  scanUploadedFile,
  uploadChallan
);

router.get("/notifications", getNotifications);
router.get("/me/notifications", getNotifications);
router.patch("/notifications/read-all", markNotificationsRead);
router.patch("/me/notifications/read-all", markNotificationsRead);
router.delete("/me/notifications/:id", deleteNotification);

router.get("/complaints", getComplaints);
router.get("/me/complaints", getComplaints);
router.post("/complaints", validateBody(createComplaintSchema), createComplaint);
router.post("/me/complaints", validateBody(createComplaintSchema), createComplaint);

router.post("/me/sos", validateBody(triggerSosSchema), triggerSos);
router.patch("/me/sos/:id/cancel", cancelSosAlert);

router.get("/profile", getStudentProfile);
router.get("/me/profile", getStudentProfile);
router.put("/profile", validateBody(updateStudentProfileSchema), updateStudentProfile);
router.patch("/me/profile", validateBody(updateStudentProfileSchema), updateStudentProfile);
router.post("/me/change-password", validateBody(changePasswordSchema), changePassword);

export default router;
