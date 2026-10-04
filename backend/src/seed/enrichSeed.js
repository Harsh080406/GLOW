import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/connect.js";

import User from "../models/User.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";
import Trip from "../models/Trip.js";
import Complaint from "../models/Complaint.js";
import SosAlert from "../models/SosAlert.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import DailyRollup from "../models/DailyRollup.js";
import SystemConfig from "../models/SystemConfig.js";
import AuditLog from "../models/AuditLog.js";

dotenv.config();

const enrichSeed = async () => {
  console.log("🌟 Enriching GLOW MERN Database with Operational Datasets...");

  const conn = await connectDB();
  if (!conn) {
    console.error("❌ Connection failed.");
    process.exit(1);
  }

  try {
    const adminUser = await User.findOne({ role: "super_admin" });
    const buses = await Bus.find().limit(25);
    const routes = await Route.find().limit(25);
    const drivers = await User.find({ role: "driver" }).limit(25);
    const students = await User.find({ role: "student" }).limit(25);

    if (buses.length === 0 || routes.length === 0) {
      console.error("❌ Fleet or Routes missing. Run base seed first.");
      process.exit(1);
    }

    // 1. Seed Trips / Schedules if 0
    const tripCount = await Trip.countDocuments();
    if (tripCount === 0) {
      console.log("⏱️ Seeding 18 Operational Schedules / Trips...");
      const shifts = ["MORNING", "AFTERNOON", "EVENING"];
      const times = ["07:15 AM", "07:30 AM", "08:00 AM", "08:30 AM", "12:45 PM", "01:30 PM", "04:30 PM", "05:15 PM"];
      const statuses = ["ON_ROUTE", "NOT_STARTED", "COMPLETED", "ON_ROUTE"];

      const tripDocs = [];
      for (let i = 0; i < 18; i++) {
        const bus = buses[i % buses.length];
        const route = routes[i % routes.length];
        const driver = drivers[i % drivers.length];
        tripDocs.push({
          busId: bus._id,
          driverId: driver._id,
          routeId: route._id,
          status: statuses[i % statuses.length],
          startedAt: new Date(Date.now() - (i * 25) * 60000),
          occupancySnapshot: Math.floor(25 + Math.random() * 25),
          departureTime: times[i % times.length],
          shiftType: shifts[i % shifts.length],
          published: true,
        });
      }
      await Trip.insertMany(tripDocs);
      console.log("✅ 18 Schedules / Trips seeded.");
    } else {
      console.log(`ℹ️ Trips already exist (${tripCount}).`);
    }

    // 2. Seed Maintenance Logs if 0
    const maintCount = await MaintenanceLog.countDocuments();
    if (maintCount === 0) {
      console.log("🔧 Seeding 10 Fleet Maintenance Service Records...");
      const serviceTypes = [
        "Brake Pad Replacement & Hydraulic Check",
        "Engine Oil & Fuel Filter Overhaul",
        "HVAC Air Conditioning Compressor Servicing",
        "Wheel Alignment & Radial Tire Rotation",
        "Transmission Fluid Flush & Gear Calibration",
        "Electrical Wiring & Telemetry GPS Tracker Inspection",
      ];
      const vendors = ["Shreeji Auto Hub (Makarpura)", "Vadodara Fleet Works", "Tata Motors Authorized Depot", "Ashok Leyland Service Center"];
      const statuses = ["In Progress", "Completed", "Pending", "In Progress"];

      const maintDocs = [];
      for (let i = 0; i < 10; i++) {
        maintDocs.push({
          busId: buses[i % buses.length]._id,
          serviceType: serviceTypes[i % serviceTypes.length],
          cost: Math.floor(2500 + Math.random() * 8000),
          vendor: vendors[i % vendors.length],
          status: statuses[i % statuses.length],
        });
      }
      await MaintenanceLog.insertMany(maintDocs);
      console.log("✅ 10 Maintenance records seeded.");
    } else {
      console.log(`ℹ️ Maintenance logs already exist (${maintCount}).`);
    }

    // 3. Seed Complaints if 0
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      console.log("📋 Seeding 12 Commuter Complaints...");
      const categories = [
        "AC Malfunction & Ventilation",
        "Route Delay / Schedule Punctuality",
        "Bus Cleanliness & Seating Hygiene",
        "Driver Rash Driving / Speed Compliance",
        "Overcrowding at Chhani Pickup Stop",
        "Digital Bus Pass QR Scanner Lag",
      ];
      const departments = ["Transportation", "Maintenance", "Finance", "Security", "Administration"];
      const priorities = ["HIGH", "MEDIUM", "LOW", "MEDIUM"];
      const statuses = ["PENDING", "IN_REVIEW", "RESOLVED", "PENDING"];

      const complaintDocs = [];
      for (let i = 0; i < 12; i++) {
        const student = students[i % students.length] || adminUser;
        complaintDocs.push({
          submittedBy: student._id,
          category: categories[i % categories.length],
          description: `Commuter feedback regarding ${categories[i % categories.length].toLowerCase()} on Route R-0${(i % 9) + 1}.`,
          priority: priorities[i % priorities.length],
          status: statuses[i % statuses.length],
          department: departments[i % departments.length],
          resolutionNotes: statuses[i % statuses.length] === "RESOLVED" ? "Inspected by depot supervisor and rectified." : undefined,
        });
      }
      await Complaint.insertMany(complaintDocs);
      console.log("✅ 12 Complaints seeded.");
    } else {
      console.log(`ℹ️ Complaints already exist (${complaintCount}).`);
    }

    // 4. Seed SOS Alerts if 0
    const sosCount = await SosAlert.countDocuments();
    if (sosCount === 0) {
      console.log("🚨 Seeding 4 SOS Emergency Alerts...");
      const alerts = [
        {
          role: "student",
          lat: 22.3412,
          lng: 73.1710,
          status: "RESOLVED",
          resolvedNotes: "Medical assistance dispatched; commuter safely attended by campus EMT.",
        },
        {
          role: "student",
          lat: 22.3150,
          lng: 73.1812,
          status: "DISPATCHED",
          resolvedNotes: "Campus security team in route to pickup point.",
        },
        {
          role: "driver",
          lat: 22.3550,
          lng: 73.1620,
          status: "RESOLVED",
          resolvedNotes: "Minor breakdown tire puncture replaced within 15 minutes.",
        },
        {
          role: "student",
          lat: 22.3615,
          lng: 73.1550,
          status: "ACTIVE",
          resolvedNotes: undefined,
        },
      ];

      const sosDocs = alerts.map((a, idx) => ({
        raisedBy: (idx % 2 === 0 ? students[idx % students.length] : drivers[idx % drivers.length])?._id || adminUser._id,
        role: a.role,
        lat: a.lat,
        lng: a.lng,
        status: a.status,
        resolvedNotes: a.resolvedNotes,
      }));
      await SosAlert.insertMany(sosDocs);
      console.log("✅ 4 SOS Alerts seeded.");
    } else {
      console.log(`ℹ️ SOS Alerts already exist (${sosCount}).`);
    }

    // 5. Seed Daily Rollups if 0
    const rollupCount = await DailyRollup.countDocuments();
    if (rollupCount === 0) {
      console.log("📊 Seeding 7 Days of Fleet Analytics Rollups...");
      const rollupDocs = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        rollupDocs.push({
          date: d,
          totalTrips: 46 + Math.floor(Math.random() * 6),
          onTimeTrips: 44 + Math.floor(Math.random() * 4),
          onTimeRate: Number((97.5 + Math.random() * 2.2).toFixed(1)),
          totalPassengersCarried: 1800 + Math.floor(Math.random() * 250),
          activeBuses: 57,
          fuelConsumptionLitres: 480 + Math.floor(Math.random() * 60),
          incidentsCount: Math.floor(Math.random() * 2),
          delaysCount: Math.floor(Math.random() * 3),
          feeCollectionAmount: 85000 + Math.floor(Math.random() * 40000),
        });
      }
      await DailyRollup.insertMany(rollupDocs);
      console.log("✅ 7 Daily Rollups seeded.");
    } else {
      console.log(`ℹ️ Daily Rollups already exist (${rollupCount}).`);
    }

    // 6. Ensure SystemConfig singleton exists
    const config = await SystemConfig.getSingleton();
    console.log(`⚙️ SystemConfig singleton verified (GPS interval: ${config.gpsPollingFrequency}s).`);

    // 7. Seed Audit Logs if few
    const auditCount = await AuditLog.countDocuments();
    if (auditCount < 6 && adminUser) {
      console.log("📜 Seeding Executive Audit Log History...");
      const auditDocs = [
        {
          actorId: adminUser._id,
          actionType: "POST /api/v1/admin/schedules/publish",
          targetCollection: "Schedules",
          targetId: "FALL_2026_TIMETABLE",
          details: "Published semester transit timetable to commuter mobile app",
          ip: "127.0.0.1",
          timestamp: new Date(Date.now() - 3600000 * 2),
        },
        {
          actorId: adminUser._id,
          actionType: "POST /api/v1/admin/fleet/BUS-104/maintenance",
          targetCollection: "Fleet",
          targetId: "BUS-104",
          details: "Scheduled routine safety inspection for BUS-104",
          ip: "127.0.0.1",
          timestamp: new Date(Date.now() - 3600000 * 6),
        },
        {
          actorId: adminUser._id,
          actionType: "PATCH /api/v1/admin/emergencies/dispatch",
          targetCollection: "SosAlert",
          targetId: "SOS-2026-904",
          details: "Dispatched campus security unit to Chhani Jakat Naka stop",
          ip: "127.0.0.1",
          timestamp: new Date(Date.now() - 3600000 * 14),
        },
      ];
      await AuditLog.insertMany(auditDocs);
      console.log("✅ Executive Audit Logs seeded.");
    }

    console.log("\n🚀 Enrichment Complete! Operational collections are fully populated.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Enrichment Error:", err);
    process.exit(1);
  }
};

enrichSeed();
