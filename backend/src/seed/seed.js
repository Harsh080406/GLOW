import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../db/connect.js";

dotenv.config();

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

    // 3. Seed Routes (34 Vadodara Corridors to GSFC University)
    console.log("🗺️ Seeding 34 Vadodara Transit Corridors to GSFC University...");
    const routeDocs = [];
    const routeNames = [
      "Fatehgunj Express", "Alkapuri - RC Dutt Road", "Akota - Old Padra Road", "Sayajigunj Station Corridor",
      "Manjalpur - Makarpura Line", "Karelibaug Water Tank", "Amit Nagar Circle - Sama", "Waghodia Road Parivar",
      "Ajwa Road - Sardar Estate", "Gotri - Sevasi Canal", "Vasna - Bhayli Road", "Subhanpura High Tension",
      "Gorwa - BIDC Industrial", "Nizampura - Chhani Jakat Naka", "Sama-Savli Abacus Circle", "Harni Airport Express",
      "Tarsali - Susen Circle", "Kalali - Vadsar Ring", "Atladara Sun Pharma Road", "Ellora Park Race Course",
      "OP Road - Chakli Circle", "Pratapnagar Dabhoi Line", "Panigate Mandvi Heritage", "Warasia Ring Road Link",
      "New VIP Road Khodiyar", "Bapod Gurukul Line", "Kapurai NH-48 Connect", "Laxmipura Gorwa Link",
      "Chhani Fertilizernagar Direct", "Bajwa Koyali Petrochem", "Ranoli Dashrath Industrial", "Undera Karachiya Shuttle",
      "Sindhwai Mata Pratapgunj", "Dandia Bazar Rajmahal Road"
    ];

    for (let i = 1; i <= 34; i++) {
      const name = routeNames[i - 1] || `Route R-${i < 10 ? '0' + i : i}`;
      routeDocs.push({
        name: `Route R-${i < 10 ? '0' + i : i} (${name})`,
        origin: `Terminal ${i} - ${name.split(" ")[0]}`,
        destination: "GSFC University Main Campus",
        distanceKm: Math.floor(10 + (i * 0.4)),
        durationMin: Math.floor(22 + (i * 0.7)),
        stops: [
          { name: `Stop A - ${name.split(" ")[0]} Terminal`, orderIndex: 1, etaOffsetMin: 0, lat: 22.3100 + (i * 0.002), lng: 73.1700 + (i * 0.002) },
          { name: `Stop B - Chhani / Bajwa Hub`, orderIndex: 2, etaOffsetMin: 14, lat: 22.3480, lng: 73.1680 },
          { name: "GSFC University Main Campus", orderIndex: 3, etaOffsetMin: 32, lat: 22.3615, lng: 73.1550 },
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
        department: "GSFC University Transportation Cell, Vigyan Bhavan",
        phone: "+91 98250 99999",
        avatar: "AP",
      },
      {
        name: "CMA Rajesh Dave",
        email: "finance@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "finance_admin",
        department: "Finance & Accounts Division, GSFC University",
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
      {
        name: "Devendra Joshi",
        email: "transportadmin@glowbus.edu",
        passwordHash: defaultPasswordHash,
        role: "transport_admin",
        department: "Transport Operations & Fleet Depot",
        phone: "+91 98765 44556",
        avatar: "DJ",
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

    // 6. Seed 85 Buses (Vadodara RTO GJ-06)
    console.log("🚍 Seeding 85 Fleet Vehicles (Vadodara RTO GJ-06)...");
    const busDocs = [];
    const models = ["Tata Starbus Ultra AC", "Volvo B11R AC Luxury", "Eicher Skyline Pro EV", "Ashok Leyland Oyster"];

    for (let i = 1; i <= 85; i++) {
      const busIdNum = 100 + i;
      busDocs.push({
        registrationNumber: `GJ-06-AB-${1000 + i}`,
        capacity: i % 2 === 0 ? 52 : 45,
        occupancy: Math.floor(Math.random() * 40),
        fuelLevel: Math.floor(60 + Math.random() * 40),
        status: i % 15 === 0 ? "Maintenance" : i % 3 === 0 ? "Delayed" : "On Route",
        currentDriverId: allDriverUsers[(i - 1) % allDriverUsers.length]._id,
      });
    }
    const createdBuses = await Bus.insertMany(busDocs);

    // Link Routes to Primary Assigned Buses
    for (let i = 0; i < createdRoutes.length; i++) {
      createdRoutes[i].assignedBusId = createdBuses[i]._id;
      await createdRoutes[i].save();
    }

    // Link Drivers to Buses
    const driverDocs = allDriverUsers.map((dUser, idx) => ({
      userId: dUser._id,
      licenseNumber: `GJ-06-2015-${100000 + idx}`,
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
        department: i % 3 === 0 ? "Computer Science" : i % 2 === 0 ? "Chemical Eng" : "Mechanical Eng",
        phone: `+91 98000 ${10000 + (i % 90000)}`,
      });
    }
    const createdStudentUsers = await User.insertMany(studentUsersDocs);
    const allStudentUsers = [studentUser, ...createdStudentUsers];

    // Distribute students with intentional corridor imbalance:
    // Route 0 (R-01): 54 commuters (Cap: 50, Over-capacity)
    // Route 1 (R-02): 32 commuters (Cap: 50, Under-capacity parallel corridor)
    // Remaining students distributed across remaining corridors
    const studentDocs = allStudentUsers.map((sUser, idx) => {
      let assignedRouteIndex;
      if (idx < 54) {
        assignedRouteIndex = 0; // Route 01 (Over Capacity)
      } else if (idx < 54 + 32) {
        assignedRouteIndex = 1; // Route 02 (Under Capacity parallel)
      } else {
        assignedRouteIndex = (idx % (createdRoutes.length - 2)) + 2;
      }

      const assignedRoute = createdRoutes[assignedRouteIndex];
      const assignedBus = createdBuses[assignedRouteIndex];
      const stopObj = assignedRoute.stops[idx % assignedRoute.stops.length] || assignedRoute.stops[0];

      return {
        userId: sUser._id,
        enrollmentId: `UNI2026${(1000 + idx).toString()}`,
        branch: sUser.department || "Computer Science",
        semester: `${(idx % 8) + 1}th Semester`,
        assignedStopId: stopObj.name,
        routeId: assignedRoute._id,
        assignedBusId: assignedBus._id,
        guardianContact: "+91 98765 00000",
      };
    });
    await Student.insertMany(studentDocs);

    // Sync Bus occupancies based on active assignments
    for (let i = 0; i < createdRoutes.length; i++) {
      const occ = await Student.countDocuments({ routeId: createdRoutes[i]._id });
      await Bus.findByIdAndUpdate(createdBuses[i]._id, { occupancy: occ });
    }

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
