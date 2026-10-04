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
import { validateBody } from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  createStudentSchema,
  updateStudentSchema,
  createBusSchema,
  updateBusSchema,
  createDriverSchema,
  updateDriverSchema,
  assignDriverVehicleSchema,
  createRouteSchema,
  updateRouteSchema,
  reorderStopsSchema,
  createScheduleSchema,
  updateScheduleSchema,
  publishTimetableSchema,
  createMaintenanceSchema,
  resolveComplaintSchema,
  assignComplaintDepartmentSchema,
  dispatchSecuritySchema,
  resolveEmergencySchema,
  broadcastCampusAlertSchema,
  adminSettingsSchema,
  adminProfileSchema,
  verify2FASchema,
} from "../validators/schemas.js";

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
router.post("/users", validateBody(createUserSchema), createUser);
router.put("/users/:id", validateBody(updateUserSchema), updateUser);
router.patch("/users/:id", validateBody(updateUserSchema), updateUser);
router.patch("/users/:id/role", validateBody(updateUserSchema), updateUser);
router.patch("/users/:id/status", toggleUserStatus);

// 3. Student Roster (Server-side Search, Pagination, Excel)
router.get("/students", getStudents);
router.get("/students/export", exportStudentsExcel);
router.post("/students", validateBody(createStudentSchema), createStudent);
router.put("/students/:id", validateBody(updateStudentSchema), updateStudent);
router.delete("/students/:id", deleteStudent);

// 4. Fleet Management & Maintenance Scheduling
router.get("/fleet", getFleet);
router.post("/fleet", validateBody(createBusSchema), createBus);
router.put("/fleet/:id", validateBody(updateBusSchema), updateBus);
router.delete("/fleet/:id", deleteBus);
router.post("/fleet/:id/maintenance", scheduleBusMaintenance);

// 5. Driver Management & Transactional Vehicle Assignment
router.get("/drivers", getDrivers);
router.post("/drivers", validateBody(createDriverSchema), createDriver);
router.put("/drivers/:id", validateBody(updateDriverSchema), updateDriver);
router.delete("/drivers/:id", deleteDriver);
router.post("/drivers/:id/assign-vehicle", validateBody(assignDriverVehicleSchema), assignDriverVehicle);

// 6. Routes & Embedded Stop Sequencing
router.get("/routes", getRoutes);
router.post("/routes", validateBody(createRouteSchema), createRoute);
router.put("/routes/:id", validateBody(updateRouteSchema), updateRoute);
router.put("/routes/:id/stops", validateBody(reorderStopsSchema), reorderRouteStops);
router.delete("/routes/:id", deleteRoute);

// 7. Schedules & Timetable Publishing
router.get("/schedules", getSchedules);
router.post("/schedules", validateBody(createScheduleSchema), createSchedule);
router.put("/schedules/:id", validateBody(updateScheduleSchema), updateSchedule);
router.delete("/schedules/:id", deleteSchedule);
router.post("/schedules/publish", validateBody(publishTimetableSchema), publishTimetable);

// 8. Finance Overview
router.get("/finance/summary", getFinanceSummary);

// 9. Fleet Maintenance
router.get("/maintenance", getMaintenanceLogs);
router.post("/maintenance", validateBody(createMaintenanceSchema), createMaintenanceLog);
router.patch("/maintenance/:id/approve", approveMaintenanceInvoice);
router.patch("/maintenance/:id/fit", markVehicleFit);

// 10. Complaints Queue
router.get("/complaints", getComplaints);
router.patch("/complaints/:id/resolve", validateBody(resolveComplaintSchema), resolveComplaint);
router.patch("/complaints/:id/assign", validateBody(assignComplaintDepartmentSchema), assignComplaintDepartment);

// 11. Emergencies & Campus SOS Command
router.get("/emergencies", getEmergencies);
router.patch("/emergencies/:id/dispatch", validateBody(dispatchSecuritySchema), dispatchSecurityTeam);
router.patch("/emergencies/:id/resolve", validateBody(resolveEmergencySchema), resolveEmergency);
router.post("/emergencies/broadcast-campus", validateBody(broadcastCampusAlertSchema), broadcastCampusAlert);

// 12. System Analytics & Telemetry Export
router.get("/reports/analytics", getReportsAnalytics);
router.get("/reports", getReportsAnalytics);
router.get("/reports/export-telemetry-csv", exportTelemetryCSV);

// 13. System Configuration Singleton
router.get("/settings", getSettings);
router.put("/settings", validateBody(adminSettingsSchema), updateSettings);

// 14. Admin Profile & Real TOTP 2FA
router.get("/profile", getAdminProfile);
router.put("/profile", validateBody(adminProfileSchema), updateAdminProfile);
router.get("/me/profile", getAdminProfile);
router.put("/me/profile", validateBody(adminProfileSchema), updateAdminProfile);
router.post("/2fa/generate", generate2FA);
router.post("/2fa/verify", validateBody(verify2FASchema), verify2FA);
router.post("/2fa/disable", disable2FA);

export default router;
