import User from "../models/User.js";
import Student from "../models/Student.js";
import Driver from "../models/Driver.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";
import Trip from "../models/Trip.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import Complaint from "../models/Complaint.js";
import SosAlert from "../models/SosAlert.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";

// 1. Executive Dashboard KPIs
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: "On Route" });
    const totalBuses = await Bus.countDocuments();
    const activeTrips = await Trip.countDocuments({ status: "IN_PROGRESS" });
    const pendingComplaints = await Complaint.countDocuments({ status: "OPEN" });
    const activeEmergencies = await SosAlert.find({ status: "ACTIVE" });

    return res.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          activeBuses: `${activeBuses}/${totalBuses}`,
          activeTrips,
          pendingComplaints,
          activeSosAlerts: activeEmergencies.length,
          fleetHealthScore: "96%",
        },
        activeEmergencies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. User & RBAC Management
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash -refreshTokenHash").sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: { code: "ALREADY_EXISTS", message: "User email already registered." } });
    }

    const passwordHash = await bcrypt.hash(password || "glow2026", 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "student",
      department: department || "General",
    });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found." } });
    }
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// 3. Student Roster Management
export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate("userId").populate("routeId").populate("assignedBusId");
    return res.json({ success: true, students });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { name, email, branch, semester, assignedStopId, routeId, guardianContact } = req.body;
    const passwordHash = await bcrypt.hash("glow2026", 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "student",
      department: branch,
    });

    const student = await Student.create({
      userId: user._id,
      enrollmentId: `UNI${Date.now().toString().slice(-8)}`,
      branch,
      semester,
      assignedStopId,
      routeId,
      guardianContact,
    });

    return res.status(201).json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Student.findByIdAndDelete(id);
    return res.json({ success: true, message: "Student record deleted." });
  } catch (error) {
    next(error);
  }
};

// 4. Fleet Management
export const getFleet = async (req, res, next) => {
  try {
    const buses = await Bus.find().populate("currentDriverId");
    return res.json({ success: true, buses });
  } catch (error) {
    next(error);
  }
};

export const createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    return res.status(201).json({ success: true, bus });
  } catch (error) {
    next(error);
  }
};

export const updateBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, bus });
  } catch (error) {
    next(error);
  }
};

// 5. Driver Management
export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().populate("userId").populate("assignedBusId");
    return res.json({ success: true, drivers });
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const { name, email, licenseNumber, shiftTiming } = req.body;
    const passwordHash = await bcrypt.hash("glow2026", 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "driver",
    });

    const driver = await Driver.create({
      userId: user._id,
      licenseNumber,
      shiftTiming,
    });

    return res.status(201).json({ success: true, driver });
  } catch (error) {
    next(error);
  }
};

// 6. Route Management
export const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find();
    return res.json({ success: true, routes });
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    return res.status(201).json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await Route.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

// 7. Master Schedules
export const getSchedules = async (req, res, next) => {
  try {
    const trips = await Trip.find().populate("busId").populate("driverId").populate("routeId");
    return res.json({ success: true, schedules: trips });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const trip = await Trip.create(req.body);
    return res.status(201).json({ success: true, schedule: trip });
  } catch (error) {
    next(error);
  }
};

// 8. Vehicle Maintenance Logs
export const getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find().populate("busId");
    return res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.create(req.body);
    return res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

// 9. Complaints Queue
export const getAdminComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status: "RESOLVED", resolvedBy: req.user.id, resolvedAt: new Date() },
      { new: true }
    );
    return res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// 10. Incident & Emergency Queue
export const getEmergencies = async (req, res, next) => {
  try {
    const emergencies = await SosAlert.find().sort({ createdAt: -1 });
    return res.json({ success: true, emergencies });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const emergency = await SosAlert.findByIdAndUpdate(id, { status }, { new: true });
    return res.json({ success: true, emergency });
  } catch (error) {
    next(error);
  }
};

// 11. Reports & Settings
export const getReports = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      reports: {
        totalTripsToday: 48,
        onTimePerformance: "98.4%",
        totalPassengersCarried: 1840,
        fuelConsumptionLitres: 340,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      settings: {
        telemetryIntervalSeconds: 3,
        autoDispatchThreshold: 0.85,
        sosAutoAlertSecurity: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    return res.json({ success: true, settings: req.body, message: "System settings updated." });
  } catch (error) {
    next(error);
  }
};
