import express from "express";
import {
  getTransportDashboard,
  getTransportStudents,
  reassignStudent,
  autoBalanceRoutes,
  exportStudentsRosterExcel,
  getTransportReports,
  exportTransportReportsPdf,
} from "../controllers/transportController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { reassignStudentSchema, autoBalanceSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole("transport_admin", "super_admin", "transport_manager"));

router.get("/dashboard", getTransportDashboard);
router.get("/students", getTransportStudents);
router.post("/students/reassign", validateBody(reassignStudentSchema), reassignStudent);
router.post("/routes/auto-balance", validateBody(autoBalanceSchema), autoBalanceRoutes);
router.get("/students/export-excel", exportStudentsRosterExcel);
router.get("/reports", getTransportReports);
router.get("/reports/export-pdf", exportTransportReportsPdf);

export default router;
