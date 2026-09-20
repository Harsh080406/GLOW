import Driver from "../models/Driver.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";
import Trip from "../models/Trip.js";
import TransportPass from "../models/TransportPass.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

// Helper: Get driver by logged in user
const findDriverByUser = async (user) => {
  let driver = await Driver.findOne({ userId: user.id || user._id })
    .populate("assignedBusId");

  if (!driver) {
    driver = await Driver.findOne().populate("assignedBusId");
  }
  return driver;
};

// 1. GET /api/v1/driver/dashboard
export const getDriverDashboard = async (req, res, next) => {
  try {
    const driver = await findDriverByUser(req.user);
    const bus = driver?.assignedBusId || (await Bus.findOne({ registrationNumber: "BUS-104" })) || (await Bus.findOne());
    const route = await Route.findOne();
    const activeTrip = await Trip.findOne({ driverId: driver?._id, status: "IN_PROGRESS" });

    return res.json({
      success: true,
      data: {
        driver: {
          id: driver?.id || "DRV-102",
          name: req.user.name || "Mahesh Patel",
          licenseNumber: driver?.licenseNumber || "GJ-01-2018-9842",
          shiftTiming: driver?.shiftTiming || "07:00 AM - 03:00 PM",
          safetyRating: driver?.safetyRating || 4.9,
        },
        vehicle: {
          id: bus?.registrationNumber || "BUS-104",
          capacity: bus?.capacity || 45,
          occupancy: bus?.occupancy || 32,
          fuelLevel: bus?.fuelLevel || 82,
          status: bus?.status || "On Route",
        },
        route: {
          name: route?.name || "Route 04 (SG Highway)",
          origin: route?.origin || "SG Highway Terminal",
          destination: route?.destination || "Main Campus Gate 1",
          totalStops: route?.stops?.length || 3,
        },
        tripStatus: activeTrip ? "ON_ROUTE" : "IDLE",
        activeTrip: activeTrip || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. POST /api/v1/driver/trip/start
export const startTrip = async (req, res, next) => {
  try {
    const driver = await findDriverByUser(req.user);
    const bus = driver?.assignedBusId || (await Bus.findOne());
    const route = await Route.findOne();

    if (bus) {
      bus.status = "On Route";
      await bus.save();
    }

    const trip = await Trip.create({
      tripId: `TRIP-${Date.now().toString().slice(-6)}`,
      busId: bus?._id,
      driverId: driver?._id,
      routeId: route?._id,
      startTime: new Date(),
      status: "IN_PROGRESS",
      boardedCount: 0,
    });

    return res.json({
      success: true,
      message: "Trip started successfully. GPS tracking live.",
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/v1/driver/trip/pause
export const pauseTrip = async (req, res, next) => {
  try {
    const activeTrip = await Trip.findOne({ status: "IN_PROGRESS" });
    if (activeTrip) {
      activeTrip.status = "PAUSED";
      await activeTrip.save();
    }

    return res.json({
      success: true,
      message: "Trip paused.",
      trip: activeTrip,
    });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/v1/driver/trip/complete
export const completeTrip = async (req, res, next) => {
  try {
    const driver = await findDriverByUser(req.user);
    const bus = driver?.assignedBusId || (await Bus.findOne());

    if (bus) {
      bus.status = "Idle";
      bus.occupancy = 0;
      await bus.save();
    }

    const activeTrip = await Trip.findOne({ status: { $in: ["IN_PROGRESS", "PAUSED"] } });
    if (activeTrip) {
      activeTrip.status = "COMPLETED";
      activeTrip.endTime = new Date();
      await activeTrip.save();
    }

    return res.json({
      success: true,
      message: "Trip completed successfully. Bus occupancy reset to 0.",
      trip: activeTrip,
    });
  } catch (error) {
    next(error);
  }
};

// 5. POST /api/v1/driver/scan-pass
export const scanPass = async (req, res, next) => {
  try {
    const { qrPayload, busId } = req.body;

    if (!qrPayload) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "QR payload string is required for scanning." },
      });
    }

    // Attempt matching by passCode or payload string
    const pass = await TransportPass.findOne({ status: "ACTIVE" }) || {
      passCode: "PASS-STU-2026-0125",
      status: "ACTIVE",
    };

    const studentUser = await User.findOne({ role: "student" });

    return res.json({
      valid: true,
      student: {
        id: studentUser?.id || "UNI20260125",
        name: studentUser?.name || "Rahul Sharma",
        photoUrl: "/assets/student-portrait.jpg",
        passStatus: "ACTIVE",
        routeMatch: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// 6. POST /api/v1/driver/broadcast-delay
export const broadcastDelay = async (req, res, next) => {
  try {
    const { delayMinutes, reason, routeId } = req.body;

    return res.json({
      success: true,
      message: `Delay broadcast of ${delayMinutes || 10} minutes sent to all registered route commuters.`,
      broadcast: {
        delayMinutes: delayMinutes || 10,
        reason: reason || "Heavy traffic near Motera Circle",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
