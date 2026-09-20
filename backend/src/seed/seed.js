import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../db/connect.js";

// Models
import User from "../models/User.js";
import Student from "../models/Student.js";
import Driver from "../models/Driver.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";
import FeeSlab from "../models/FeeSlab.js";
import TransportPass from "../models/TransportPass.js";
import FeeLedger from "../models/FeeLedger.js";
import Payment from "../models/Payment.js";
import Trip from "../models/Trip.js";
import SosAlert from "../models/SosAlert.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import AuditLog from "../models/AuditLog.js";
import Complaint from "../models/Complaint.js";

const runSeed = async () => {
  console.log("🌱 Starting GLOW MERN Database Seeding Pipeline...");

  const conn = await connectDB();
  if (!conn) {
    console.error("❌ Seeding aborted: Could not connect to MongoDB instance.");
    process.exit(1);
  }

  try {
    // 1. Wipe Existing Data
    console.log("🧹 Wiping existing collection documents...");
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Driver.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      FeeSlab.deleteMany({}),
      TransportPass.deleteMany({}),
      FeeLedger.deleteMany({}),
      Payment.deleteMany({}),
      Trip.deleteMany({}),
      SosAlert.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      AuditLog.deleteMany({}),
      Complaint.deleteMany({}),
    ]);

    const defaultPasswordHash = await bcrypt.hash("glow2026", 10);

    // 2. Seed Fee Slabs (Exact Pricing per PROJECT_OVERVIEW.md)
    console.log("💰 Seeding Fee Slabs (Zones A/B/C)...");
    const feeSlabs = await FeeSlab.insertMany([
      { zone: "A", amount: 6000, semester: "Fall 2026" },
      { zone: "B", amount: 9500, semester: "Fall 2026" },
      { zone: "C", amount: 14000, semester: "Fall 2026" },
    ]);

    // 3. Seed Routes (34 Corridors)
    console.log("🗺️ Seeding 34 Transit Corridors & Stops...");
    const routeDocs = [];
    const routeNames = [
      "SG Highway Express", "Maninagar Circle", "Bopal South", "University → Chandkheda",
      "Gandhinagar Sector 21", "Navrangpura Ring", "Vastrapur Campus Line", "Satellite Shuttle",
      "Ghatlodiya Direct", "Prahlad Nagar Flyer", "Naroda Corridor", "Asarwa Metro Link",
      "Isanpur Connect", "Sabarmati Route", "Science City Shuttle", "C.G. Road Express",
      "Law Garden Line", "Naranpura Shuttle", "Memnagar Route", "Paldi Circle",
      "Usmanpura Connector", "Shahibaug Express", "Bodakdev Shuttle", "Gurukul Line",
      "Shyamal Cross Connector", "Jodhpur Tekra Shuttle", "Sola Road Express", "Bhadaj Line",
      "Gota Junction Flyer", "Sarkhej Link", "Juhapura Route", "Vastral Metro Shuttle",
      "Ohav Industrial Express", "Nikol Ring Line"
    ];

    for (let i = 1; i <= 34; i++) {
      const name = routeNames[i - 1] || `Route R-${i < 10 ? '0' + i : i}`;
      routeDocs.push({
        name: `Route R-${i < 10 ? '0' + i : i} (${name})`,
        origin: `Terminal ${i}`,
        destination: "University Main Campus",
        distanceKm: Math.floor(8 + (i * 0.5)),
        durationMin: Math.floor(20 + (i * 0.8)),
        stops: [
          { name: `Stop A - ${name}`, orderIndex: 1, etaOffsetMin: 0, lat: 23.0225, lng: 72.5714 },
          { name: `Stop B - ${name}`, orderIndex: 2, etaOffsetMin: 12, lat: 23.0450, lng: 72.5830 },
          { name: "University Main Campus", orderIndex: 3, etaOffsetMin: 30, lat: 23.0780, lng: 72.5920 },
        ],
      });
    }
    const createdRoutes = await Route.insertMany(routeDocs);

    // 4. Seed Named Demo Users
    console.log("👤 Seeding Named Demo Accounts & Staff Roster...");
    const demoUsers = await User.insertMany([
      {
        name: "Rahul Sharma",
        email: "student@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "student",
        department: "Computer Science",
        phone: "+91 98765 43210",
        avatar: "RS",
      },
      {
        name: "Dr. Arvind Patel",
        email: "admin@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "super_admin",
        department: "University Transportation Cell",
        phone: "+91 98250 99999",
        avatar: "AP",
      },
      {
        name: "CMA Rajesh Dave",
        email: "finance@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "finance_admin",
        department: "Finance & Accounts Division",
        phone: "+91 98765 22334",
        avatar: "RD",
      },
      {
        name: "Mahesh Patel",
        email: "driver@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "driver",
        department: "Fleet Operations",
        phone: "+91 98765 11111",
        avatar: "MP",
      },
      {
        name: "Vikram Singh",
        email: "transport@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "transport_manager",
        department: "Transport Operations",
        phone: "+91 98765 33445",
        avatar: "VS",
      },
    ]);

    const studentUser = demoUsers[0];
    const driverUser = demoUsers[3];

    // 5. Seed 92 Drivers (Mahesh Patel + 91 generated)
    console.log("🚌 Seeding 92 Licensed Drivers Roster...");
    const driverUsersDocs = [];
    for (let i = 2; i <= 92; i++) {
      driverUsersDocs.push({
        name: `Driver ${i}`,
        email: `driver${i}@glowbus.edu`,
        passwordHash: defaultPasswordHash,
        role: "driver",
        phone: `+91 98765 ${10000 + i}`,
      });
    }
    const createdDriverUsers = await User.insertMany(driverUsersDocs);
    const allDriverUsers = [driverUser, ...createdDriverUsers];

    // 6. Seed 85 Buses
    console.log("🚍 Seeding 85 Fleet Vehicles...");
    const busDocs = [];
    const models = ["Tata Starbus Ultra AC", "Volvo B11R AC Luxury", "Eicher Skyline Pro EV", "Ashok Leyland Oyster"];

    for (let i = 1; i <= 85; i++) {
      const busIdNum = 100 + i;
      busDocs.push({
        registrationNumber: `GJ-05-AB-${1000 + i}`,
        capacity: i % 2 === 0 ? 52 : 45,
        occupancy: Math.floor(Math.random() * 40),
        fuelLevel: Math.floor(60 + Math.random() * 40),
        status: i % 15 === 0 ? "Maintenance" : i % 3 === 0 ? "Delayed" : "On Route",
        currentDriverId: allDriverUsers[(i - 1) % allDriverUsers.length]._id,
      });
    }
    const createdBuses = await Bus.insertMany(busDocs);

    // Link Drivers to Buses
    const driverDocs = allDriverUsers.map((dUser, idx) => ({
      userId: dUser._id,
      licenseNumber: `GJ-01-2015-${100000 + idx}`,
      assignedBusId: createdBuses[idx % createdBuses.length]._id,
      shiftTiming: "07:00 AM - 06:30 PM",
      safetyRating: 4.8,
    }));
    await Driver.insertMany(driverDocs);

    // 7. Seed 4,250 Students
    console.log("🎓 Seeding 4,250 Registered Student Commuters...");
    const studentUsersDocs = [];
    for (let i = 2; i <= 4250; i++) {
      studentUsersDocs.push({
        name: `Student Commuter ${i}`,
        email: `student${i}@glowbus.edu`,
        passwordHash: defaultPasswordHash,
        role: "student",
        department: i % 3 === 0 ? "Computer Science" : i % 2 === 0 ? "Electrical Eng" : "Mechanical Eng",
        phone: `+91 98000 ${10000 + (i % 90000)}`,
      });
    }
    const createdStudentUsers = await User.insertMany(studentUsersDocs);
    const allStudentUsers = [studentUser, ...createdStudentUsers];

    const studentDocs = allStudentUsers.map((sUser, idx) => ({
      userId: sUser._id,
      enrollmentId: `UNI2026${(1000 + idx).toString()}`,
      branch: sUser.department || "Computer Science",
      semester: `${(idx % 8) + 1}th Semester`,
      assignedStopId: "Chandkheda Bus Stop",
      routeId: createdRoutes[idx % createdRoutes.length]._id,
      guardianContact: "+91 98765 00000",
    }));
    await Student.insertMany(studentDocs);

    // Seed Rahul Sharma's Transport Pass & Fee Ledger
    const rahulStudent = await Student.findOne({ userId: studentUser._id });
    await TransportPass.create({
      studentId: studentUser._id,
      routeId: createdRoutes[0]._id,
      zone: "B",
      status: "ACTIVE",
      validUntil: new Date("2027-05-31"),
      signedPayload: "PASS-STU-2026-0125|UNI20260125|R-04|SIG_984",
    });

    await FeeLedger.create({
      studentId: studentUser._id,
      zone: "B",
      totalFee: 15000,
      paidAmount: 10000,
      balanceDue: 5000,
      status: "PARTIAL",
      dueDate: new Date("2026-09-15"),
    });

    console.log("\n========================================================");
    console.log("✅ GLOW MERN Database Seeding Pipeline Complete!");
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Students: ${await Student.countDocuments()} (Matches UI 4,250)`);
    console.log(`- Drivers: ${await Driver.countDocuments()} (Matches UI 92)`);
    console.log(`- Buses: ${await Bus.countDocuments()} (Matches UI 85)`);
    console.log(`- Routes: ${await Route.countDocuments()} (Matches UI 34)`);
    console.log(`- Fee Slabs: ${await FeeSlab.countDocuments()} (Zones A/B/C)`);
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

runSeed();
