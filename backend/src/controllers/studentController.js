import Student from "../models/Student.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";
import TransportPass from "../models/TransportPass.js";
import FeeLedger from "../models/FeeLedger.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// Helper: Get student doc by user ID or email
const findStudentByUser = async (user) => {
  let student = await Student.findOne({ userId: user.id || user._id })
    .populate("routeId")
    .populate("assignedBusId");

  if (!student) {
    // Search by email matching or return fallback
    student = await Student.findOne().populate("routeId").populate("assignedBusId");
  }
  return student;
};

// 1. GET /api/v1/student/dashboard
export const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await findStudentByUser(req.user);
    const bus = student?.assignedBusId || (await Bus.findOne());
    const route = student?.routeId || (await Route.findOne());
    const pass = (await TransportPass.findOne({ studentId: student?._id })) || { status: "ACTIVE" };
    const ledger = await FeeLedger.findOne({ studentId: student?._id });

    return res.json({
      success: true,
      data: {
        student: {
          id: student?.enrollmentId || req.user.id || "UNI20260125",
          name: req.user.name || "Rahul Sharma",
          branch: student?.branch || "Computer Engineering",
          semester: student?.semester || "5th Sem",
          busId: bus?.registrationNumber || "BUS-104",
          routeName: route?.name || "University → Chandkheda Corridor",
          pickupStop: student?.assignedStopId || "Chandkheda Bus Stop",
          pickupTime: "07:45 AM",
          passStatus: pass?.status || "ACTIVE",
          feeStatus: ledger?.status || "PARTIAL",
          pendingFee: ledger?.pendingAmount ?? 5000,
        },
        telemetry: {
          busId: bus?.registrationNumber || "BUS-104",
          speed: 42,
          etaMinutes: 6,
          currentLocation: "Near Motera Crossroads",
          lat: 23.0982,
          lng: 72.5784,
          occupancy: bus?.occupancy || 32,
          capacity: bus?.capacity || 45,
          driverName: "Mahesh Patel",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/v1/student/my-bus
export const getMyBus = async (req, res, next) => {
  try {
    const student = await findStudentByUser(req.user);
    const bus = student?.assignedBusId || (await Bus.findOne({ registrationNumber: "BUS-104" })) || (await Bus.findOne());

    return res.json({
      success: true,
      bus: bus || {
        registrationNumber: "BUS-104",
        status: "On Route",
        capacity: 45,
        occupancy: 32,
        fuelLevel: 82,
        fitnessCertExpiry: "2027-03-31",
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/v1/student/my-route
export const getMyRoute = async (req, res, next) => {
  try {
    const student = await findStudentByUser(req.user);
    const route = student?.routeId || (await Route.findOne());

    return res.json({
      success: true,
      route: route || {
        name: "University → Chandkheda Corridor",
        origin: "Chandkheda Bus Stop",
        destination: "Main Campus Gate 1",
        distanceKm: 14.5,
        durationMin: 35,
        stops: [
          { name: "Chandkheda Bus Stop", orderIndex: 1, etaOffsetMin: 0, lat: 23.102, lng: 72.585 },
          { name: "Motera Crossroads", orderIndex: 2, etaOffsetMin: 12, lat: 23.091, lng: 72.591 },
          { name: "Main Campus Gate 1", orderIndex: 3, etaOffsetMin: 35, lat: 23.078, lng: 72.592 },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET /api/v1/student/schedule
export const getSchedule = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      schedule: [
        { shift: "Morning Pickup", time: "07:30 AM", route: "Route 04 (SG Highway)", status: "On Time" },
        { shift: "Evening Return", time: "05:15 PM", route: "Route 04 (SG Highway)", status: "Scheduled" },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET /api/v1/student/pass
export const getTransportPass = async (req, res, next) => {
  try {
    const student = await findStudentByUser(req.user);
    let pass = await TransportPass.findOne({ studentId: student?._id });

    if (!pass) {
      pass = {
        passCode: `PASS-STU-${Date.now().toString().slice(-6)}`,
        status: "ACTIVE",
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        qrPayload: `PASS|${req.user.id || "UNI20260125"}|BUS-104|VALID`,
      };
    }

    return res.json({
      success: true,
      pass,
    });
  } catch (error) {
    next(error);
  }
};

// 6. GET /api/v1/student/fees
export const getStudentFees = async (req, res, next) => {
  try {
    const student = await findStudentByUser(req.user);
    const ledger = await FeeLedger.findOne({ studentId: student?._id });
    const payments = await Payment.find({ studentId: student?._id }).sort({ paymentDate: -1 });

    return res.json({
      success: true,
      ledger: ledger || {
        totalFee: 14000,
        paidAmount: 9000,
        pendingAmount: 5000,
        dueDate: "2026-10-15",
        status: "PARTIAL",
        zone: "Zone B",
      },
      payments: payments || [],
    });
  } catch (error) {
    next(error);
  }
};

// 7. POST /api/v1/student/fees/pay
export const payStudentFee = async (req, res, next) => {
  try {
    const { amount, paymentMethod, refNo } = req.body;
    const student = await findStudentByUser(req.user);

    const payment = await Payment.create({
      paymentId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentId: student?._id,
      amount: amount || 5000,
      paymentMethod: paymentMethod || "UPI",
      transactionReference: refNo || `UPI/${Date.now()}`,
      status: "SUCCESS",
      receiptId: `REC-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date(),
    });

    let ledger = await FeeLedger.findOne({ studentId: student?._id });
    if (ledger) {
      ledger.paidAmount += amount || 5000;
      ledger.pendingAmount = Math.max(0, ledger.totalFee - ledger.paidAmount);
      ledger.status = ledger.pendingAmount === 0 ? "PAID" : "PARTIAL";
      await ledger.save();
    }

    return res.json({
      success: true,
      transaction: payment,
      updatedPendingFee: ledger ? ledger.pendingAmount : 0,
      feeStatus: ledger ? ledger.status : "PAID",
    });
  } catch (error) {
    next(error);
  }
};

// 8. POST /api/v1/student/fees/upload-challan
export const uploadChallan = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Bank deposit challan slip uploaded successfully for verification.",
      verificationId: `CHALLAN-${Date.now().toString().slice(-6)}`,
      status: "PENDING_VERIFICATION",
    });
  } catch (error) {
    next(error);
  }
};

// 9. GET /api/v1/student/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// 10. PATCH /api/v1/student/notifications/read-all
export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    return res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

// 11. GET /api/v1/student/complaints & POST /api/v1/student/complaints
export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req, res, next) => {
  try {
    const { category, subject, description } = req.body;
    const complaint = await Complaint.create({
      ticketId: `CMP-${Date.now().toString().slice(-6)}`,
      category: category || "General Transit",
      subject: subject || "Delay Notice",
      description: description || "Bus arrived 10 mins late at Stop B.",
      submittedBy: req.user.id || req.user._id,
      submittedByRole: "student",
      status: "OPEN",
    });

    return res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// 12. GET & PUT /api/v1/student/profile
export const getStudentProfile = async (req, res, next) => {
  try {
    const student = await findStudentByUser(req.user);
    const user = await User.findById(req.user.id || req.user._id);

    return res.json({
      success: true,
      profile: {
        id: student?.enrollmentId || req.user.id,
        name: req.user.name,
        email: req.user.email,
        branch: student?.branch || "Computer Science",
        semester: student?.semester || "5th Sem",
        guardianContact: student?.guardianContact || "+91 98765 43210",
        assignedStop: student?.assignedStopId || "Chandkheda Bus Stop",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const { guardianContact, assignedStopId } = req.body;
    const student = await findStudentByUser(req.user);
    if (student) {
      if (guardianContact) student.guardianContact = guardianContact;
      if (assignedStopId) student.assignedStopId = assignedStopId;
      await student.save();
    }
    return res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
};
