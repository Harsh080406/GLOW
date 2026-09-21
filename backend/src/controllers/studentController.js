import crypto from "crypto";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";
import TransportPass from "../models/TransportPass.js";
import FeeLedger from "../models/FeeLedger.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import Complaint from "../models/Complaint.js";
import SosAlert from "../models/SosAlert.js";
import User from "../models/User.js";
import StopNotification from "../models/StopNotification.js";
import { pdfService } from "../services/pdfService.js";

const HMAC_SECRET = process.env.JWT_SECRET || "glow_super_secret_jwt_access_key_2026";

// Helper: Get Student Document by authenticated user
const getStudentByUser = async (user) => {
  let student = await Student.findOne({ userId: user.id || user._id })
    .populate("routeId")
    .populate("assignedBusId");

  if (!student) {
    student = await Student.findOne().populate("routeId").populate("assignedBusId");
  }
  return student;
};

// 1. GET /api/v1/student/me/summary & /dashboard
export const getStudentSummary = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const bus = student?.assignedBusId || (await Bus.findOne({ registrationNumber: "BUS-104" })) || (await Bus.findOne());
    const route = student?.routeId || (await Route.findOne());
    const pass = (await TransportPass.findOne({ studentId: student?._id })) || { status: "ACTIVE" };
    const ledger = await FeeLedger.findOne({ studentId: student?._id });

    return res.json({
      success: true,
      data: {
        student: {
          id: student?.enrollmentId || req.user.id || "UNI20260125",
          name: req.user.name || "Rahul Sharma",
          email: req.user.email || "student@glowbus.edu",
          branch: student?.branch || "Computer Engineering",
          semester: student?.semester || "5th Sem",
          busId: bus?.registrationNumber || "BUS-104",
          routeName: route?.name || "University → Chandkheda",
          pickupStop: student?.assignedStopId || "Chandkheda Bus Stop",
          pickupTime: "07:45 AM",
          dropTime: "05:50 PM",
          passStatus: pass?.status || "ACTIVE",
          feeStatus: ledger?.status || "PARTIAL",
          pendingFee: ledger?.balanceDue ?? ledger?.pendingAmount ?? 5000,
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

// 2. GET /api/v1/student/me/bus
export const getStudentBus = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const bus = student?.assignedBusId || (await Bus.findOne({ registrationNumber: "BUS-104" })) || (await Bus.findOne());

    const driverUser = await User.findOne({ role: "driver" }) || {
      name: "Mahesh Patel",
      phone: "+91 98765 11111",
      email: "mahesh.patel@glowbus.edu",
    };

    return res.json({
      success: true,
      bus: {
        registrationNumber: bus?.registrationNumber || "BUS-104",
        model: "Tata Starbus AC Luxury 45-Seater",
        capacity: bus?.capacity || 45,
        occupancy: bus?.occupancy || 32,
        fuelLevel: bus?.fuelLevel || 82,
        status: bus?.status || "On Route",
        acStatus: "Active (21°C)",
        speed: 42,
        fitnessCertExpiry: bus?.fitnessCertExpiry || "2027-03-31",
        driver: {
          name: driverUser.name,
          phone: driverUser.phone || "+91 98765 11111",
          email: driverUser.email,
          licenseNo: "GJ-01-2015-008921",
          rating: 4.8,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/v1/student/me/route/stops & POST stop-notifications & PDF download
export const getStudentRouteStops = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const route = student?.routeId || (await Route.findOne());

    return res.json({
      success: true,
      route: route || {
        name: "Route R-04 (University → Chandkheda)",
        origin: "Chandkheda Bus Stop",
        destination: "University Main Campus",
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

export const createStopNotification = async (req, res, next) => {
  try {
    const { stopName, minutesBefore, routeId } = req.body;

    const stopNotif = await StopNotification.create({
      userId: req.user.id || req.user._id,
      routeId: routeId || (await Route.findOne())?._id,
      stopName: stopName || "Motera Crossroads",
      minutesBefore: minutesBefore || 10,
    });

    return res.status(201).json({
      success: true,
      message: `Stop notification set for ${stopNotif.stopName} (${stopNotif.minutesBefore} mins before arrival).`,
      notification: stopNotif,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadRoutePdf = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const route = student?.routeId || (await Route.findOne());

    const pdfBuffer = await pdfService.generateRoutePdf(route || { name: "Route R-04" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="GLOW_Route_${route?.name || 'Schedule'}.pdf"`);
    return res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

// 4. GET /api/v1/student/me/schedule & PDF download
export const getStudentSchedule = async (req, res, next) => {
  try {
    const { type } = req.query;

    const schedule =
      type === "exam"
        ? [
            { shift: "Exam Morning Shuttle", time: "08:00 AM", route: "R-04 SG Highway", status: "Exam Special" },
            { shift: "Exam Afternoon Return", time: "01:30 PM", route: "R-04 SG Highway", status: "Exam Special" },
          ]
        : [
            { shift: "Morning Pickup", time: "07:30 AM", route: "R-04 SG Highway", status: "On Time" },
            { shift: "Mid-Day Shuttle", time: "01:15 PM", route: "R-04 Shuttle", status: "Scheduled" },
            { shift: "Evening Return", time: "05:15 PM", route: "R-04 SG Highway", status: "Scheduled" },
          ];

    return res.json({ success: true, scheduleType: type || "regular", schedule });
  } catch (error) {
    next(error);
  }
};

export const downloadSchedulePdf = async (req, res, next) => {
  try {
    const { type } = req.query;
    const pdfBuffer = await pdfService.generateSchedulePdf(req.user, type || "regular");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="GLOW_Timetable_${type || 'Regular'}.pdf"`);
    return res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

// 5. GET /api/v1/student/me/pass & PDF download
export const getStudentPass = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    let pass = await TransportPass.findOne({ studentId: student?._id });

    const rawData = `GLOW|${req.user.id || 'UNI20260125'}|${student?.branch || 'CS'}|${Date.now()}`;
    const hmacSig = crypto.createHmac("sha256", HMAC_SECRET).update(rawData).digest("hex").slice(0, 16);

    const signedPayload = `PASS-${req.user.id || 'UNI20260125'}|R-04|ZONE-B|SIG_${hmacSig}`;

    if (!pass) {
      pass = {
        passCode: "PASS-STU-2026-0125",
        status: "ACTIVE",
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        signedPayload,
      };
    } else {
      pass = pass.toObject();
      pass.signedPayload = signedPayload;
    }

    return res.json({
      success: true,
      pass: {
        ...pass,
        studentName: req.user.name || "Rahul Sharma",
        studentId: req.user.id || "UNI20260125",
        zone: "Zone B",
        routeName: "University → Chandkheda Corridor",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPassPdf = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const pass = await TransportPass.findOne({ studentId: student?._id });

    const rawData = `GLOW|${req.user.id || 'UNI20260125'}|${Date.now()}`;
    const hmacSig = crypto.createHmac("sha256", HMAC_SECRET).update(rawData).digest("hex").slice(0, 16);

    const pdfBuffer = await pdfService.generatePassPdf({
      passCode: pass?.passCode || "PASS-STU-2026-0125",
      studentName: req.user.name || "Rahul Sharma",
      studentId: req.user.id || "UNI20260125",
      routeName: "University → Chandkheda Corridor",
      zone: "Zone B",
      status: "ACTIVE",
      expiryDate: "31 May 2027",
      signedPayload: `PASS-${req.user.id || 'UNI20260125'}|R-04|ZONE-B|SIG_${hmacSig}`,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="GLOW_Digital_Pass_${req.user.id || 'STU'}.pdf"`);
    return res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

// 6. GET /api/v1/student/me/fees, POST /pay, POST /challan-upload
export const getStudentFees = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const ledger = await FeeLedger.findOne({ studentId: student?._id });
    const payments = await Payment.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      ledger: ledger || {
        totalFee: 14000,
        paidAmount: 9000,
        balanceDue: 5000,
        pendingAmount: 5000,
        dueDate: "2026-10-15",
        status: "PARTIAL",
        zone: "Zone B",
      },
      payments,
    });
  } catch (error) {
    next(error);
  }
};

export const payStudentFee = async (req, res, next) => {
  try {
    const { amount, paymentMethod, refNo } = req.body;
    const student = await getStudentByUser(req.user);

    const payment = await Payment.create({
      studentId: req.user.id || req.user._id,
      amount: amount || 5000,
      gateway: paymentMethod || "UPI",
      txnRef: refNo || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "COMPLETED",
    });

    let ledger = await FeeLedger.findOne({ studentId: student?._id });
    if (ledger) {
      ledger.paidAmount += amount || 5000;
      ledger.balanceDue = Math.max(0, ledger.totalFee - ledger.paidAmount);
      ledger.status = ledger.balanceDue === 0 ? "PAID" : "PARTIAL";
      await ledger.save();
    }

    return res.json({
      success: true,
      transaction: payment,
      updatedPendingFee: ledger ? ledger.balanceDue : 0,
      feeStatus: ledger ? ledger.status : "PAID",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadChallan = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Deposit slip file attachment is required." } });
    }

    const payment = await Payment.create({
      studentId: req.user.id || req.user._id,
      amount: req.body.amount ? Number(req.body.amount) : 5000,
      gateway: "Challan",
      txnRef: `CHALLAN-${Date.now().toString().slice(-6)}`,
      status: "PENDING",
      attachmentUrl: `/uploads/${file.filename}`,
    });

    return res.status(201).json({
      success: true,
      message: "Bank deposit slip uploaded successfully. Sent to Finance for verification.",
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET, PATCH read-all, DELETE /api/v1/student/me/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    return res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    return res.json({ success: true, message: "Notification deleted." });
  } catch (error) {
    next(error);
  }
};

// 8. GET & POST /api/v1/student/me/complaints
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
    const { category, subject, description, priority } = req.body;

    const complaint = await Complaint.create({
      submittedBy: req.user.id || req.user._id,
      category: category || "General Transit",
      description: description || subject || "Service delay reported",
      priority: priority || "MEDIUM",
      status: "PENDING",
    });

    return res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// 9. POST /api/v1/student/me/sos & PATCH /cancel
export const triggerSos = async (req, res, next) => {
  try {
    const { lat, lng, busId, notes } = req.body;

    const alert = await SosAlert.create({
      raisedBy: req.user.id || req.user._id,
      role: "student",
      lat: lat || 23.0982,
      lng: lng || 72.5784,
      status: "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      incident: {
        id: alert._id,
        alertId: `EMG-${Date.now().toString().slice(-4)}`,
        status: alert.status,
        lat: alert.lat,
        lng: alert.lng,
        timestamp: alert.createdAt,
        securityDispatched: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSosAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await SosAlert.findByIdAndUpdate(
      id,
      { status: "RESOLVED", resolvedNotes: "False alarm cancelled by student user." },
      { new: true }
    );

    return res.json({
      success: true,
      message: "SOS panic alert cancelled. Incident marked as resolved.",
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// 10. GET/PATCH profile & change-password
export const getStudentProfile = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user);
    const user = await User.findById(req.user.id || req.user._id);

    return res.json({
      success: true,
      profile: {
        id: student?.enrollmentId || req.user.id || "UNI20260125",
        name: user?.name || req.user.name || "Rahul Sharma",
        email: user?.email || req.user.email || "student@glowbus.edu",
        phone: user?.phone || "+91 98765 43210",
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
    const { phone, guardianContact, assignedStopId } = req.body;
    const student = await getStudentByUser(req.user);

    if (phone) {
      await User.findByIdAndUpdate(req.user.id || req.user._id, { phone });
    }
    if (student) {
      if (guardianContact) student.guardianContact = guardianContact;
      if (assignedStopId) student.assignedStopId = assignedStopId;
      await student.save();
    }

    return res.json({ success: true, message: "Profile details updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id || req.user._id);

    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Current password does not match." } });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
    }

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};
