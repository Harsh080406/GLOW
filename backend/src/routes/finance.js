import express from "express";
import {
  getFinanceDashboard,
  getFinanceStudents,
  getFeeStructures,
  createFeeStructure,
  getPayments,
  getPendingDues,
  sendFeeReminders,
  getVerificationQueue,
  approveVerification,
  rejectVerification,
  getRefunds,
  processRefund,
  getDiscounts,
  applyDiscount,
  getReceipts,
  downloadReceiptPdf,
  getFinanceReports,
  getAuditLogs,
} from "../controllers/financeController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole("finance_admin", "super_admin"));

router.get("/dashboard", getFinanceDashboard);
router.get("/students", getFinanceStudents);

// Fee structures
router.get("/fee-structures", getFeeStructures);
router.post("/fee-structures", createFeeStructure);

// Payments & Pending
router.get("/payments", getPayments);
router.get("/pending", getPendingDues);
router.post("/pending/send-reminders", sendFeeReminders);

// Verification queue
router.get("/verification", getVerificationQueue);
router.post("/verification/:id/approve", approveVerification);
router.post("/verification/:id/reject", rejectVerification);

// Refunds & Discounts
router.get("/refunds", getRefunds);
router.post("/refunds/:id/process", processRefund);
router.get("/discounts", getDiscounts);
router.post("/discounts", applyDiscount);

// Receipts & Reports
router.get("/receipts", getReceipts);
router.get("/receipts/:id/pdf", downloadReceiptPdf);
router.get("/reports", getFinanceReports);
router.get("/audit", getAuditLogs);

export default router;
