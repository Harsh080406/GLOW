import express from "express";
import {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUserRole,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getFleet,
  createBus,
  updateBus,
  getDrivers,
  createDriver,
  getRoutes,
  createRoute,
  updateRoute,
  getSchedules,
  createSchedule,
  getMaintenanceLogs,
  createMaintenanceLog,
  getAdminComplaints,
  resolveComplaint,
  getEmergencies,
  updateEmergencyStatus,
  getReports,
  getSettings,
  updateSettings,
} from "../controllers/adminController.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole("super_admin", "transport_manager"));

router.get("/dashboard", getAdminDashboard);

// Users
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id/role", updateUserRole);

// Students
router.get("/students", getStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Fleet & Drivers
router.get("/fleet", getFleet);
router.post("/fleet", createBus);
router.put("/fleet/:id", updateBus);
router.get("/drivers", getDrivers);
router.post("/drivers", createDriver);

// Routes & Schedules
router.get("/routes", getRoutes);
router.post("/routes", createRoute);
router.put("/routes/:id", updateRoute);
router.get("/schedules", getSchedules);
router.post("/schedules", createSchedule);

// Maintenance & Complaints
router.get("/maintenance", getMaintenanceLogs);
router.post("/maintenance", createMaintenanceLog);
router.get("/complaints", getAdminComplaints);
router.patch("/complaints/:id/resolve", resolveComplaint);

// Emergencies & System Reports
router.get("/emergencies", getEmergencies);
router.patch("/emergencies/:id/status", updateEmergencyStatus);
router.get("/reports", getReports);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
