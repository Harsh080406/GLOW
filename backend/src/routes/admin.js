import express from "express";
import {
  getAdminKPIs,
  getActivityLog,
  getDispatchesToday,
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentsExcel,
  getFleet,
  createBus,
  updateBus,
  deleteBus,
  scheduleBusMaintenance,
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  assignDriverVehicle,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  reorderRouteStops,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  publishTimetable,
  getFinanceSummary,
  getMaintenanceLogs,
  createMaintenanceLog,
  approveMaintenanceInvoice,
  markVehicleFit,
  getComplaints,
  resolveComplaint,
  assignComplaintDepartment,
  getEmergencies,
  dispatchSecurityTeam,
  resolveEmergency,
  broadcastCampusAlert,
  getReportsAnalytics,
  exportTelemetryCSV,
  getSettings,
  updateSettings,
  getAdminProfile,
  updateAdminProfile,
  generate2FA,
  verify2FA,
  disable2FA,
} from "../controllers/adminController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Strict Super Admin Access Control
router.use(authenticateJWT);
router.use(requireRole("super_admin"));

// 1. Dashboard & KPIs
router.get("/kpis", getAdminKPIs);
router.get("/dashboard", getAdminKPIs);
router.get("/activity-log", getActivityLog);
router.get("/dispatches/today", getDispatchesToday);

// 2. User & RBAC Management
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/role", updateUser);
router.patch("/users/:id/status", toggleUserStatus);

// 3. Student Roster (Server-side Search, Pagination, Excel)
router.get("/students", getStudents);
router.get("/students/export", exportStudentsExcel);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// 4. Fleet Management & Maintenance Scheduling
router.get("/fleet", getFleet);
router.post("/fleet", createBus);
router.put("/fleet/:id", updateBus);
router.delete("/fleet/:id", deleteBus);
router.post("/fleet/:id/maintenance", scheduleBusMaintenance);

// 5. Driver Management & Transactional Vehicle Assignment
router.get("/drivers", getDrivers);
router.post("/drivers", createDriver);
router.put("/drivers/:id", updateDriver);
router.delete("/drivers/:id", deleteDriver);
router.post("/drivers/:id/assign-vehicle", assignDriverVehicle);

// 6. Routes & Embedded Stop Sequencing
router.get("/routes", getRoutes);
router.post("/routes", createRoute);
router.put("/routes/:id", updateRoute);
router.put("/routes/:id/stops", reorderRouteStops);
router.delete("/routes/:id", deleteRoute);

// 7. Schedules & Timetable Publishing
router.get("/schedules", getSchedules);
router.post("/schedules", createSchedule);
router.put("/schedules/:id", updateSchedule);
router.delete("/schedules/:id", deleteSchedule);
router.post("/schedules/publish", publishTimetable);

// 8. Finance Overview
router.get("/finance/summary", getFinanceSummary);

// 9. Fleet Maintenance
router.get("/maintenance", getMaintenanceLogs);
router.post("/maintenance", createMaintenanceLog);
router.patch("/maintenance/:id/approve", approveMaintenanceInvoice);
router.patch("/maintenance/:id/fit", markVehicleFit);

// 10. Complaints Queue
router.get("/complaints", getComplaints);
router.patch("/complaints/:id/resolve", resolveComplaint);
router.patch("/complaints/:id/assign", assignComplaintDepartment);

// 11. Emergencies & Campus SOS Command
router.get("/emergencies", getEmergencies);
router.patch("/emergencies/:id/dispatch", dispatchSecurityTeam);
router.patch("/emergencies/:id/resolve", resolveEmergency);
router.post("/emergencies/broadcast-campus", broadcastCampusAlert);

// 12. System Analytics & Telemetry Export
router.get("/reports/analytics", getReportsAnalytics);
router.get("/reports", getReportsAnalytics);
router.get("/reports/export-telemetry-csv", exportTelemetryCSV);

// 13. System Configuration Singleton
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// 14. Admin Profile & Real TOTP 2FA
router.get("/me/profile", getAdminProfile);
router.put("/me/profile", updateAdminProfile);
router.post("/2fa/generate", generate2FA);
router.post("/2fa/verify", verify2FA);
router.post("/2fa/disable", disable2FA);

export default router;
