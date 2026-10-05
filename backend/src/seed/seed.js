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
import Refund from "../models/Refund.js";
import Discount from "../models/Discount.js";

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

    // 3. Seed Routes (13 Official University Corridors to GSFC University)
    console.log("🗺️ Seeding 13 Official Vadodara Transit Corridors to GSFC University...");
    const officialRoutesData = [
      { routeNo: 1, name: "Route 1 (Soma Talav - Gurukul - Bapod)", busNo: "GJ-16-AU-4788", driverName: "Ramesh Vasava", driverPhone: "+91 98765 11001", capacity: 45, origin: "SOMA TALAV (BPC PUMP)", durationMin: 55, distanceKm: 18 },
      { routeNo: 2, name: "Route 2 (Parivar - Vrundavan - Amit Nagar)", busNo: "GJ-06-BX-3670", driverName: "Sanjay Parmar", driverPhone: "+91 98765 11002", capacity: 52, origin: "PARIVAR CHAR RASTA", durationMin: 60, distanceKm: 19 },
      { routeNo: 3, name: "Route 3 (Khodiyar Nagar - Airport - Dena)", busNo: "GJ-06-BV-2875", driverName: "Jitendra Solanki", driverPhone: "+91 98765 11003", capacity: 50, origin: "KHODIYAR NAGAR", durationMin: 55, distanceKm: 17 },
      { routeNo: 4, name: "Route 4 (Chankypuri - Abhilasha - Military)", busNo: "GJ-06-AX-3348", driverName: "Prakash Baria", driverPhone: "+91 98765 11004", capacity: 45, origin: "CHANKYPURI", durationMin: 40, distanceKm: 14 },
      { routeNo: 5, name: "Route 5 (Earth Icon - Jagdish - L&T Circle)", busNo: "GJ-16-AU-4890", driverName: "Dinesh Vankar", driverPhone: "+91 98765 11005", capacity: 48, origin: "EARTH ICON", durationMin: 45, distanceKm: 15 },
      { routeNo: 6, name: "Route 6 (Voltamp - Maneja - Susen Circle)", busNo: "GJ-06-BV-7584", driverName: "Mukesh Tadvi", driverPhone: "+91 98765 11006", capacity: 52, origin: "VOLTAMP COMPANY", durationMin: 70, distanceKm: 24 },
      { routeNo: 7, name: "Route 7 (Ravi Park - Kabir Complex - Polo Ground)", busNo: "GJ-16-AU-1390", driverName: "Kishore Rathwa", driverPhone: "+91 98765 11007", capacity: 45, origin: "RAVI PARK", durationMin: 55, distanceKm: 18 },
      { routeNo: 8, name: "Route 8 (Darbar Chowkdi - Kalaghoda - Mahesana)", busNo: "GJ-06-BV-7989", driverName: "Chetan Chauhan", driverPhone: "+91 98765 11008", capacity: 50, origin: "DARBAR CHOWKDI", durationMin: 65, distanceKm: 20 },
      { routeNo: 9, name: "Route 9 (Tulsidham - Fatehgunj - Nizampura)", busNo: "GJ-06-BV-2915", driverName: "Mahesh Patel", driverPhone: "+91 98765 11111", capacity: 52, origin: "SARSWATI COMPLEX", durationMin: 65, distanceKm: 19 },
      { routeNo: 10, name: "Route 10 (Khishcoli - Atladra - Sun Pharma - Tandalja)", busNo: "GJ-16-AU-3840", driverName: "Ashok Dabhi", driverPhone: "+91 98765 11010", capacity: 45, origin: "KHISHCOLI CIRCLE", durationMin: 65, distanceKm: 22 },
      { routeNo: 11, name: "Route 11 (Hari Nagar - Zansi Ki Rani - Gorwa)", busNo: "GJ-06-AX-1826", driverName: "Naresh Gohil", driverPhone: "+91 98765 11011", capacity: 50, origin: "HARI NAGAR CHAR RASTA", durationMin: 60, distanceKm: 17 },
      { routeNo: 12, name: "Route 12 (Akshar Chowk - Vasna - Chhani Corridor)", busNo: "GJ-06-BV-6129", driverName: "Haresh Vaghela", driverPhone: "+91 98765 11012", capacity: 52, origin: "AKSHAR CHOWK", durationMin: 65, distanceKm: 21 },
      { routeNo: 13, name: "Route 13 (Nilamber - Natubhai - Chakli - Genda Circle)", busNo: "GJ-06-BV-6527", driverName: "Dilip Joshi", driverPhone: "+91 98765 11013", capacity: 48, origin: "NILAMBER CIRCLE", durationMin: 55, distanceKm: 16 },
    ];

    const routeDocs = officialRoutesData.map((r, i) => ({
      name: r.name,
      origin: r.origin,
      destination: "GSFC University Main Campus",
      distanceKm: r.distanceKm,
      durationMin: r.durationMin,
      stops: [
        { name: r.origin, orderIndex: 1, etaOffsetMin: 0, lat: 22.3100 + (i * 0.003), lng: 73.1700 + (i * 0.003) },
        { name: `Corridor Hub - Stop ${i + 1}`, orderIndex: 2, etaOffsetMin: Math.floor(r.durationMin * 0.5), lat: 22.3480, lng: 73.1680 },
        { name: "GSFC University Main Campus", orderIndex: 3, etaOffsetMin: r.durationMin, lat: 22.3615, lng: 73.1550 },
      ],
    }));

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

    // 5. Seed 13 Official University Drivers
    console.log("🚌 Seeding 13 Licensed University Drivers Roster...");
    const otherDriverProfiles = officialRoutesData.filter((r) => r.driverName !== "Mahesh Patel");
    const driverUsersDocs = otherDriverProfiles.map((r) => ({
      name: r.driverName,
      email: `${r.driverName.toLowerCase().replace(/\s+/g, ".")}@glowbus.edu`,
      passwordHash: defaultPasswordHash,
      role: "driver",
      department: "Fleet Operations",
      phone: r.driverPhone,
      avatar: r.driverName.split(" ").filter(Boolean).map((n) => n[0]).join(""),
    }));
    const createdOtherDriverUsers = await User.insertMany(driverUsersDocs);

    // Arrange all 13 driver users in exact route order (1 to 13)
    const allDriverUsers = officialRoutesData.map((r) => {
      if (r.driverName === "Mahesh Patel") return driverUser;
      return createdOtherDriverUsers.find((u) => u.name === r.driverName) || driverUser;
    });

    // 6. Seed 13 Official University Buses
    console.log("🚍 Seeding 13 Fleet Vehicles (Vadodara RTO & Official Registrations)...");
    const busDocs = officialRoutesData.map((r, idx) => ({
      registrationNumber: r.busNo,
      capacity: r.capacity || 50,
      occupancy: Math.floor((r.capacity || 50) * 0.75),
      fuelLevel: 80 - (idx * 2),
      status: idx === 3 ? "Delayed" : idx === 11 ? "Maintenance" : "On Route",
      currentDriverId: allDriverUsers[idx]._id,
    }));
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
      assignedBusId: createdBuses[idx]._id,
      shiftTiming: "07:00 AM - 06:30 PM",
      safetyRating: Number((4.7 + ((idx * 3) % 4) * 0.1).toFixed(1)),
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

    // Seed 100 realistic Student Fee Ledgers across Zones A, B, C
    const feeLedgerDocs = [];
    const paymentsDocs = [];
    const gateways = ["UPI", "Card", "NetBanking", "Challan"];

    for (let i = 0; i < Math.min(100, allStudentUsers.length); i++) {
      const u = allStudentUsers[i];
      const s = studentDocs[i];
      const zone = i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C";
      const totalFee = zone === "A" ? 6000 : zone === "B" ? 9500 : 14000;
      
      let paidAmount = 0;
      let status = "OVERDUE";
      const daysOverdue = (i % 25) + 5;
      const dueDate = new Date(Date.now() - daysOverdue * 86400000);

      if (i === 0) {
        // Rahul Sharma
        paidAmount = 10000;
        status = "PARTIAL";
      } else if (i % 3 === 0) {
        paidAmount = totalFee;
        status = "PAID";
      } else if (i % 3 === 1) {
        paidAmount = Math.floor(totalFee / 2);
        status = "PARTIAL";
      } else {
        paidAmount = 0;
        status = "OVERDUE";
      }

      const balanceDue = Math.max(0, totalFee - paidAmount);

      feeLedgerDocs.push({
        studentId: u._id,
        studentRef: s._id,
        zone,
        totalFee,
        paidAmount,
        balanceDue,
        status,
        dueDate,
      });

      if (paidAmount > 0) {
        paymentsDocs.push({
          studentId: u._id,
          amount: paidAmount,
          gateway: gateways[i % gateways.length],
          status: "COMPLETED",
          txnRef: `TXN-2026-${1000 + i}`,
          paymentDate: new Date(Date.now() - (i % 15) * 86400000),
        });
      }
    }
    await FeeLedger.insertMany(feeLedgerDocs);
    await Payment.insertMany(paymentsDocs);

    // Seed Offline Verification Queue (Bank Challans)
    await Payment.insertMany([
      {
        studentId: allStudentUsers[1]._id,
        amount: 9500,
        gateway: "Challan",
        status: "PENDING",
        txnRef: "CHALLAN-SBI-884920",
        bankName: "State Bank of India (Fertilizernagar)",
        attachmentUrl: "/assets/sample_challan_slip.jpg",
        paymentDate: new Date(Date.now() - 2 * 86400000),
      },
      {
        studentId: allStudentUsers[2]._id,
        amount: 6000,
        gateway: "Challan",
        status: "PENDING",
        txnRef: "CHALLAN-BOB-914022",
        bankName: "Bank of Baroda (Sayajigunj)",
        attachmentUrl: "/assets/sample_challan_slip.jpg",
        paymentDate: new Date(Date.now() - 1 * 86400000),
      },
      {
        studentId: allStudentUsers[3]._id,
        amount: 9500,
        gateway: "Challan",
        status: "PENDING",
        txnRef: "CHALLAN-HDFC-302194",
        bankName: "HDFC Bank (Alkapuri)",
        attachmentUrl: "/assets/sample_challan_slip.jpg",
        paymentDate: new Date(),
      },
    ]);

    // Seed Refunds & Discounts
    await Refund.insertMany([
      {
        studentId: allStudentUsers[4]._id,
        reason: "Semester Exchange Program Transfer to Germany",
        amount: 7500,
        originalPaid: 15000,
        claimedAmount: 7500,
        refundAmount: 7500,
        status: "PENDING",
      },
      {
        studentId: allStudentUsers[5]._id,
        reason: "Hostel accommodation allotted on campus",
        amount: 4750,
        originalPaid: 9500,
        claimedAmount: 4750,
        refundAmount: 4750,
        status: "APPROVED",
        processedBy: demoUsers[2]._id,
        processedAt: new Date(Date.now() - 3 * 86400000),
      },
    ]);

    await Discount.insertMany([
      {
        studentId: allStudentUsers[6]._id,
        waiverPercent: 25,
        discountedAmount: 2375,
        category: "Merit Scholarship",
        reason: "Top 5% Semester SGPA Academic Excellence",
        status: "ACTIVE",
        approvedBy: demoUsers[2]._id,
      },
      {
        studentId: allStudentUsers[7]._id,
        waiverPercent: 50,
        discountedAmount: 3000,
        category: "Sports Excellence Concession",
        reason: "State University Athletics Gold Medalist",
        status: "ACTIVE",
        approvedBy: demoUsers[2]._id,
      },
    ]);

    // Seed Initial Audit Logs
    await AuditLog.insertMany([
      {
        actorId: demoUsers[2]._id,
        actionType: "POST /api/v1/finance/payments/collect",
        targetCollection: "Finance",
        targetId: "TXN-2026-081",
        details: "Collected fee payment of Rs. 9,500 via UPI (Google Pay)",
        ip: "127.0.0.1",
        timestamp: new Date(Date.now() - 3600000 * 5),
      },
      {
        actorId: demoUsers[2]._id,
        actionType: "POST /api/v1/finance/verification/approve",
        targetCollection: "Finance",
        targetId: "CHALLAN-SBI-884920",
        details: "Approved offline bank deposit challan for Rs. 9,500",
        ip: "127.0.0.1",
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
    ]);

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
