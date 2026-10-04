import express from "express";
import {
  getFinanceDashboard,
  getFinanceStudents,
  collectPayment,
  sendStudentReminder,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getPayments,
  exportPaymentsExcel,
  getPaymentInvoicePdf,
  getPendingDues,
  sendBulkFeeReminders,
  blockTransportPass,
  unblockTransportPass,
  getVerificationQueue,
  approveVerification,
  rejectVerification,
  getRefunds,
  processRefund,
  getDiscounts,
  applyDiscount,
  getReceipts,
  downloadReceiptPdf,
  emailReceipt,
  getFinanceReports,
  exportMasterReportsExcel,
  getAuditLogs,
  getFinanceProfile,
  rotateSigningKey,
} from "../controllers/financeController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { auditLogger } from "../middleware/auditLogger.js";
import { validateBody } from "../middleware/validate.js";
import {
  collectPaymentSchema,
  sendStudentReminderSchema,
  createFeeStructureSchema,
  updateFeeStructureSchema,
  sendBulkRemindersSchema,
  rejectVerificationSchema,
  processRefundSchema,
  applyDiscountSchema,
  emailReceiptSchema,
  rotateSigningKeySchema,
} from "../validators/schemas.js";

const router = express.Router();

// Role Gating & Audit Logging Middleware
router.use(authenticateJWT);
router.use(requireRole("finance_admin", "super_admin"));
router.use(auditLogger("Finance"));

// 1. Dashboard
router.get("/dashboard", getFinanceDashboard);

// 2. Student Fee Ledgers & Payments Collection
router.get("/students", getFinanceStudents);
router.post("/payments/collect", validateBody(collectPaymentSchema), collectPayment);
router.post("/students/:id/remind", validateBody(sendStudentReminderSchema), sendStudentReminder);

// 3. Fee Structure (CRUD on FeeSlab)
router.get("/fee-structures", getFeeStructures);
router.post("/fee-structures", validateBody(createFeeStructureSchema), createFeeStructure);
router.put("/fee-structures/:id", validateBody(updateFeeStructureSchema), updateFeeStructure);
router.delete("/fee-structures/:id", deleteFeeStructure);

// 4. Payments Stream & Exports
router.get("/payments", getPayments);
router.get("/payments/export-excel", exportPaymentsExcel);
router.get("/payments/:id/invoice-pdf", getPaymentInvoicePdf);

// 5. Pending Dues & Pass Blocking
router.get("/pending", getPendingDues);
router.post("/pending/send-reminders", validateBody(sendBulkRemindersSchema), sendBulkFeeReminders);
router.post("/students/:id/block-pass", blockTransportPass);
router.post("/students/:id/unblock-pass", unblockTransportPass);

// 6. Bank Slip Verification Queue (Challan Deposits)
router.get("/verification", getVerificationQueue);
router.post("/verification/:id/approve", approveVerification);
router.post("/verification/:id/reject", validateBody(rejectVerificationSchema), rejectVerification);

// 7. Refunds & Discounts / Scholarships
router.get("/refunds", getRefunds);
router.post("/refunds/:id/process", validateBody(processRefundSchema), processRefund);
router.get("/discounts", getDiscounts);
router.post("/discounts", validateBody(applyDiscountSchema), applyDiscount);

// 8. Receipts & Invoices (with QR verification)
router.get("/receipts", getReceipts);
router.get("/receipts/:id/pdf", downloadReceiptPdf);
router.post("/receipts/:id/email", validateBody(emailReceiptSchema), emailReceipt);

// 9. Financial Reports
router.get("/reports", getFinanceReports);
router.get("/reports/export-excel", exportMasterReportsExcel);

// 10. Audit Logs & Profile
router.get("/audit", getAuditLogs);
router.get("/profile", getFinanceProfile);
router.post("/profile/rotate-key", validateBody(rotateSigningKeySchema), rotateSigningKey);

export default router;
