import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// 1. AUTH SCHEMAS
// ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "driver", "transport_manager", "transport_admin", "finance_admin", "super_admin"]).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// 2. ADMIN SCHEMAS
// ─────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(6).optional(),
  role: z.enum(["student", "driver", "transport_manager", "transport_admin", "finance_admin", "super_admin"]).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(["student", "driver", "transport_manager", "transport_admin", "finance_admin", "super_admin"]).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
});

export const createStudentSchema = z.object({
  name: z.string().trim().min(2, "Student name is required"),
  email: z.string().trim().email("Valid student email is required"),
  branch: z.string().optional(),
  semester: z.union([z.string(), z.number()]).optional(),
  routeId: z.string().optional().nullable(),
  busId: z.string().optional().nullable(),
  pickupStop: z.string().optional(),
  feeStatus: z.string().optional(),
  guardianContact: z.string().optional(),
});

export const updateStudentSchema = z.object({
  branch: z.string().optional(),
  semester: z.union([z.string(), z.number()]).optional(),
  routeId: z.string().optional().nullable(),
  assignedBusId: z.string().optional().nullable(),
  assignedStopId: z.string().optional(),
  feeStatus: z.string().optional(),
  passStatus: z.enum(["ACTIVE", "BLOCKED", "EXPIRED", "PENDING_FEE"]).optional(),
  guardianContact: z.string().optional(),
});

export const createBusSchema = z.object({
  registrationNumber: z.string().trim().min(3, "Registration number is required"),
  capacity: z.coerce.number().min(10).max(100).optional(),
  fuelLevel: z.coerce.number().min(0).max(100).optional(),
  fitnessCertExpiry: z.union([z.string(), z.date()]).optional(),
});

export const updateBusSchema = z.object({
  registrationNumber: z.string().trim().min(3).optional(),
  capacity: z.coerce.number().min(10).max(100).optional(),
  fuelLevel: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["On Route", "Maintenance", "Idle", "Delayed"]).optional(),
  fitnessCertExpiry: z.union([z.string(), z.date()]).optional(),
});

export const createDriverSchema = z.object({
  name: z.string().trim().min(2, "Driver name is required"),
  email: z.string().trim().email("Driver email is required"),
  phone: z.string().optional(),
  licenseNumber: z.string().trim().min(3, "License number is required"),
  shiftTiming: z.string().optional(),
  assignedBusId: z.string().optional().nullable(),
});

export const updateDriverSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().optional(),
  licenseNumber: z.string().trim().optional(),
  shiftTiming: z.string().optional(),
  assignedBusId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export const assignDriverVehicleSchema = z.object({
  busId: z.string().optional().nullable(),
});

export const createRouteSchema = z.object({
  name: z.string().trim().min(2, "Route name is required"),
  routeNumber: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  distanceKm: z.coerce.number().optional(),
  durationMin: z.coerce.number().optional(),
  stops: z.array(z.any()).optional(),
});

export const updateRouteSchema = z.object({
  name: z.string().trim().min(2).optional(),
  routeNumber: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  distanceKm: z.coerce.number().optional(),
  durationMin: z.coerce.number().optional(),
  status: z.string().optional(),
  stops: z.array(z.any()).optional(),
});

export const reorderStopsSchema = z.object({
  stops: z.array(z.any()).min(1, "At least one stop is required"),
});

export const createScheduleSchema = z.object({
  busId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  routeId: z.string().optional().nullable(),
  departureTime: z.string().optional(),
  shiftType: z.string().optional(),
});

export const updateScheduleSchema = z.object({
  departureTime: z.string().optional(),
  shiftType: z.string().optional(),
  status: z.string().optional(),
  published: z.boolean().optional(),
});

export const publishTimetableSchema = z.object({
  shiftType: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  busId: z.string().min(1, "Bus ID is required"),
  serviceType: z.string().optional(),
  cost: z.coerce.number().optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
});

export const resolveComplaintSchema = z.object({
  resolutionNotes: z.string().optional(),
  status: z.enum(["PENDING", "IN_REVIEW", "RESOLVED"]).optional(),
});

export const assignComplaintDepartmentSchema = z.object({
  department: z.string().min(1, "Department is required"),
});

export const dispatchSecuritySchema = z.object({
  responderNotes: z.string().optional(),
});

export const resolveEmergencySchema = z.object({
  resolutionNotes: z.string().optional(),
});

export const broadcastCampusAlertSchema = z.object({
  title: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export const adminSettingsSchema = z.object({
  gpsPollingFrequency: z.coerce.number().min(1).max(30).optional(),
  gpsPollingFrequencySeconds: z.coerce.number().min(1).max(30).optional(),
  sosAutoDispatch: z.boolean().optional(),
  paymentGracePeriodDays: z.coerce.number().min(0).max(90).optional(),
  autoBalanceCorridors: z.boolean().optional(),
  maxOccupancyAlertThreshold: z.coerce.number().optional(),
  geofenceRadiusMeters: z.coerce.number().optional(),
});

export const adminProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

export const verify2FASchema = z.object({
  token: z.string().trim().min(6, "6-digit token is required"),
});

// ─────────────────────────────────────────────────────────────
// 3. FINANCE SCHEMAS
// ─────────────────────────────────────────────────────────────
export const collectPaymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  gateway: z.string().optional(),
  txnRef: z.string().optional(),
  remarks: z.string().optional(),
});

export const sendStudentReminderSchema = z.object({
  channel: z.enum(["SMS", "EMAIL", "PUSH", "ALL"]).optional(),
  template: z.string().optional(),
});

export const createFeeStructureSchema = z.object({
  zone: z.string().min(1, "Zone is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
});

export const updateFeeStructureSchema = z.object({
  zone: z.string().optional(),
  amount: z.coerce.number().positive().optional(),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
});

export const sendBulkRemindersSchema = z.object({
  studentIds: z.array(z.string()).optional(),
  channel: z.enum(["SMS", "EMAIL", "PUSH", "ALL"]).optional(),
  template: z.string().optional(),
});

export const rejectVerificationSchema = z.object({
  reason: z.string().trim().min(2, "Rejection reason is required"),
});

export const processRefundSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  remarks: z.string().optional(),
});

export const applyDiscountSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  waiverPercent: z.coerce.number().min(0).max(100).optional(),
  discountedAmount: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  reason: z.string().optional(),
});

export const emailReceiptSchema = z.object({
  email: z.string().email("Valid email is required").optional(),
});

export const rotateSigningKeySchema = z.object({
  newSecret: z.string().min(8, "Secret must be at least 8 characters").optional(),
});

// ─────────────────────────────────────────────────────────────
// 4. TRANSPORT SCHEMAS
// ─────────────────────────────────────────────────────────────
export const reassignStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  newRouteId: z.string().min(1, "New route ID is required"),
  newBusId: z.string().optional().nullable(),
  newStopName: z.string().optional(),
});

export const autoBalanceSchema = z.object({
  commit: z.boolean().optional(),
  thresholdPercent: z.coerce.number().min(1).max(100).optional(),
});

// ─────────────────────────────────────────────────────────────
// 5. DRIVER SCHEMAS
// ─────────────────────────────────────────────────────────────
export const startTripSchema = z.object({
  routeId: z.string().optional(),
  busId: z.string().optional(),
});

export const validatePassSchema = z.object({
  qrPayload: z.string().optional(),
  enrollmentId: z.string().optional(),
  busId: z.string().optional(),
});

export const broadcastDelaySchema = z.object({
  reason: z.string().optional(),
  delayMinutes: z.coerce.number().min(1).optional(),
});

export const driverSosSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  reason: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// 6. STUDENT SCHEMAS
// ─────────────────────────────────────────────────────────────
export const createStopNotificationSchema = z.object({
  stopName: z.string().optional(),
  etaMinutes: z.coerce.number().optional(),
  pushToken: z.string().optional(),
});

export const payStudentFeeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  gateway: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const createComplaintSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

export const triggerSosSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export const updateStudentProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  pickupStop: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
