import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_MASTER_STUDENTS } from "../data/studentsData";
import TelemetryService from "../services/telemetryService";

const TransitContext = createContext(null);

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error("useTransit must be used within a TransitProvider");
  }
  return context;
};

export const TransitProvider = ({ children }) => {
  // Authentication State & Memory Tokens
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Current active role: "student" | "driver" | "super_admin" | "transport_manager" | "finance_admin"
  const [activeRole, setActiveRole] = useState("student");

  // Current Logged-in Student
  const [currentStudent, setCurrentStudent] = useState({
    id: "UNI20260125",
    name: "Rahul Sharma",
    avatar: "RS",
    department: "Computer Science",
    year: "3rd Year",
    email: "rahul.sharma@glowbus.edu",
    phone: "+91 98765 43210",
    busId: "BUS-104",
    busType: "Volvo B11R AC Luxury",
    routeId: "R-04",
    routeName: "University → Chandkheda",
    pickupStop: "Chandkheda Bus Stop",
    pickupTime: "07:45 AM",
    dropTime: "05:50 PM",
    zone: "Zone B",
    passId: "PASS-STU-2026-0125",
    passStatus: "ACTIVE",
    validFrom: "01 Jun 2026",
    validUntil: "31 May 2027",
    totalFee: 15000,
    paidFee: 10000,
    pendingFee: 5000,
    feeStatus: "PARTIAL", // "PAID", "PARTIAL", "PENDING"
    dueDate: "15 Sep 2026",
    attendanceRate: 92,
  });

  // Current Logged-in Driver
  const [currentDriver, setCurrentDriver] = useState({
    id: "DRV-2024-001",
    name: "Mahesh Patel",
    avatar: "MP",
    phone: "+91 98765 11111",
    email: "mahesh.patel@glowbus.edu",
    address: "A-12, Green Park Society, Chandkheda, Ahmedabad - 382424",
    emergencyContact: "+91 98765 00000 (Wife)",
    bloodGroup: "B+",
    assignedBus: "BUS-104",
    busReg: "GJ-05-AB-1234",
    assignedRoute: "R-04",
    routeName: "University → Chandkheda",
    expectedStudents: 38,
    status: "ON_DUTY",
    licenseNo: "GJ-01-2015-008921",
    licenseExpiry: "18 Nov 2028",
    rating: 4.8,
    experience: "8 years",
    inspectionDone: true,
    joiningDate: "12 Mar 2020",
    shiftHours: "07:00 AM - 06:30 PM",
  });

  // Current Logged-in Admin
  const [currentAdmin, setCurrentAdmin] = useState({
    id: "ADM-2026-001",
    name: "Dr. Arvind Patel",
    avatar: "AP",
    role: "Super Admin & Systems Director",
    email: "arvind.patel@glowbus.edu",
    phone: "+91 98250 99999",
    department: "University Transportation Cell",
    officeLocation: "Admin Block, 3rd Floor, Room 302",
    accessLevel: "Level 5 — Full System Access",
    status: "ACTIVE",
    joinedDate: "15 Jan 2018",
    twoFactorEnabled: true,
    lastLogin: "Today, 08:30 AM",
  });

  // Current Logged-in Finance Admin
  const [currentFinanceAdmin, setCurrentFinanceAdmin] = useState({
    id: "FIN-2026-001",
    name: "CMA Rajesh Dave",
    avatar: "RD",
    role: "Chief Finance Officer & Accounts Head",
    email: "rajesh.dave@glowbus.edu",
    phone: "+91 98765 22334",
    department: "Finance & Accounts Division",
    designation: "Chief Financial Officer (CFO)",
    officeLocation: "Accounts Wing, Finance Block, Room 104",
    financialAuthority: "Level 4 — Complete Accounts & Reconciliation",
    bankBranch: "State Bank of India — University Branch",
    assignedFiscalYear: "AY 2026-27",
    status: "ACTIVE",
    joinedDate: "10 Aug 2019",
    twoFactorEnabled: true,
    lastLogin: "Today, 09:15 AM",
  });

  // Active Live Trip Telemetry
  const [activeTrip, setActiveTrip] = useState({
    isActive: true,
    tripId: "TRIP-2026-0822-01",
    busId: "BUS-104",
    routeId: "R-04",
    driverId: "DRV-2024-001",
    driverName: "Mahesh Patel",
    status: "ON_ROUTE", // "NOT_STARTED", "ON_ROUTE", "PAUSED", "COMPLETED"
    departureTime: "07:30 AM",
    currentLocation: "Near Motera Crossroads",
    currentSpeed: 42,
    etaMinutes: 6,
    currentStopIndex: 2,
    expectedStudents: 38,
    boardedCount: 31,
    isDelayed: false,
    delayMinutes: 0,
    delayReason: "",
    gpsAccuracy: "High Precision (3m)",
    coordinates: { lat: 23.0982, lng: 72.5784 },
    progressPercent: 46,
    isLiveBroadcasting: true,
    isDeviceGps: false,
  });

  // Centralized Real-time Multi-Bus Telemetry Feed (Ready for Backend API/WebSocket linkage)
  const [liveBusTelemetry, setLiveBusTelemetry] = useState({
    "BUS-104": {
      busId: "BUS-104",
      regNo: "GJ-05-AB-1234",
      routeId: "R-04",
      routeName: "University → Chandkheda",
      driverName: "Mahesh Patel",
      driverId: "DRV-2024-001",
      driverPhone: "+91 98765 11111",
      lat: 23.0982,
      lng: 72.5784,
      mapX: 270,
      mapY: 210,
      progressPercent: 46,
      speed: 42,
      heading: "North-East",
      status: "ON_ROUTE",
      currentLocationName: "Near Motera Crossroads",
      nextStop: "Motera Crossroads",
      nextStopIndex: 2,
      etaMinutes: 6,
      isLiveBroadcasting: true,
      isDeviceGps: false,
      lastUpdated: new Date().toISOString(),
    },
    "BUS-108": {
      busId: "BUS-108",
      regNo: "GJ-05-CD-5678",
      routeId: "R-02",
      routeName: "Maninagar Circle",
      driverName: "Ramesh Shah",
      driverId: "DRV-2024-002",
      driverPhone: "+91 98765 33333",
      lat: 23.0034,
      lng: 72.6012,
      mapX: 380,
      mapY: 180,
      progressPercent: 62,
      speed: 18,
      heading: "North",
      status: "DELAYED",
      currentLocationName: "Approaching Paldi",
      nextStop: "Paldi Cross Roads",
      nextStopIndex: 3,
      etaMinutes: 14,
      isLiveBroadcasting: true,
      isDeviceGps: false,
      lastUpdated: new Date().toISOString(),
    },
    "BUS-101": {
      busId: "BUS-101",
      regNo: "GJ-05-AB-1001",
      routeId: "R-01",
      routeName: "SG Highway Express",
      driverName: "Suresh Joshi",
      driverId: "DRV-2024-003",
      driverPhone: "+91 98765 22222",
      lat: 23.0338,
      lng: 72.5074,
      mapX: 480,
      mapY: 130,
      progressPercent: 74,
      speed: 48,
      heading: "East",
      status: "ON_ROUTE",
      currentLocationName: "Near Thaltej Overbridge",
      nextStop: "Thaltej Cross Roads",
      nextStopIndex: 3,
      etaMinutes: 5,
      isLiveBroadcasting: true,
      isDeviceGps: false,
      lastUpdated: new Date().toISOString(),
    },
    "BUS-115": {
      busId: "BUS-115",
      regNo: "GJ-05-GH-3456",
      routeId: "R-05",
      routeName: "Gandhinagar Sector 21",
      driverName: "Kailash Dave",
      driverId: "DRV-2024-004",
      driverPhone: "+91 98765 55555",
      lat: 23.1895,
      lng: 72.6456,
      mapX: 520,
      mapY: 110,
      progressPercent: 82,
      speed: 51,
      heading: "South-West",
      status: "ON_ROUTE",
      currentLocationName: "Koba Highway",
      nextStop: "Koba Circle",
      nextStopIndex: 4,
      etaMinutes: 3,
      isLiveBroadcasting: true,
      isDeviceGps: false,
      lastUpdated: new Date().toISOString(),
    },
  });

  // Bus Fleet
  const [buses, setBuses] = useState([
    {
      id: "BUS-101",
      regNo: "GJ-05-AB-1001",
      model: "Tata Starbus Ultra AC",
      capacity: 52,
      occupied: 44,
      driver: "Suresh Joshi",
      driverPhone: "+91 98765 22222",
      route: "R-01 — SG Highway Express",
      status: "On Route",
      speed: "48 km/h",
      eta: "12 min",
      fuelPercent: 84,
      isEV: false,
      gpsStatus: "Online",
      maintenance: "Good",
      insuranceExpiry: "14 Jan 2027",
      fitnessExpiry: "22 Mar 2027",
      rcExpiry: "10 Oct 2030",
    },
    {
      id: "BUS-104",
      regNo: "GJ-05-AB-1234",
      model: "Volvo B11R AC Luxury",
      capacity: 52,
      occupied: 38,
      driver: "Mahesh Patel",
      driverPhone: "+91 98765 11111",
      route: "R-04 — University → Chandkheda",
      status: "On Route",
      speed: "42 km/h",
      eta: "7 min",
      fuelPercent: 72,
      isEV: false,
      gpsStatus: "Online",
      maintenance: "Good",
      insuranceExpiry: "10 Jul 2027",
      fitnessExpiry: "15 Aug 2027",
      rcExpiry: "28 Feb 2032",
    },
    {
      id: "BUS-108",
      regNo: "GJ-05-CD-5678",
      model: "Eicher Skyline Pro EV",
      capacity: 45,
      occupied: 32,
      driver: "Ramesh Shah",
      driverPhone: "+91 98765 33333",
      route: "R-02 — Maninagar Circle",
      status: "Delayed",
      speed: "18 km/h",
      eta: "24 min",
      fuelPercent: 65,
      isEV: true,
      gpsStatus: "Online",
      maintenance: "Warning",
      insuranceExpiry: "05 Nov 2026",
      fitnessExpiry: "12 Dec 2026",
      rcExpiry: "19 May 2029",
    },
    {
      id: "BUS-112",
      regNo: "GJ-05-EF-9012",
      model: "Ashok Leyland Oyster",
      capacity: 40,
      occupied: 0,
      driver: "Dinesh Trivedi",
      driverPhone: "+91 98765 44444",
      route: "R-03 — Bopal South",
      status: "Maintenance",
      speed: "0 km/h",
      eta: "--",
      fuelPercent: 40,
      isEV: false,
      gpsStatus: "Offline",
      maintenance: "Under Service",
      insuranceExpiry: "20 Dec 2026",
      fitnessExpiry: "02 Jan 2027",
      rcExpiry: "14 Jul 2028",
    },
    {
      id: "BUS-115",
      regNo: "GJ-05-GH-3456",
      model: "Tata Starbus EV Prime",
      capacity: 48,
      occupied: 41,
      driver: "Kailash Dave",
      driverPhone: "+91 98765 55555",
      route: "R-05 — Gandhinagar Sector 21",
      status: "On Route",
      speed: "51 km/h",
      eta: "5 min",
      fuelPercent: 91,
      isEV: true,
      gpsStatus: "Online",
      maintenance: "Good",
      insuranceExpiry: "18 Sep 2027",
      fitnessExpiry: "30 Sep 2027",
      rcExpiry: "11 Nov 2033",
    },
  ]);

  // Routes & Stops
  const [routes, setRoutes] = useState([
    {
      id: "R-04",
      name: "Route R-04",
      startPoint: "Chandkheda Bus Stop",
      endPoint: "University Main Bus Bay",
      distance: "11.2 km",
      duration: "30 min",
      assignedBus: "BUS-104",
      assignedDriver: "Mahesh Patel",
      totalStudents: 38,
      status: "Active",
      stops: [
        { id: 1, name: "Chandkheda Bus Stop", time: "07:45 AM", returnTime: "05:50 PM", dist: "0.0 km", isPickup: true },
        { id: 2, name: "New Ranip Cross Roads", time: "07:50 AM", returnTime: "05:40 PM", dist: "2.1 km", isPickup: false },
        { id: 3, name: "Sabarmati Bridge", time: "07:55 AM", returnTime: "05:32 PM", dist: "4.3 km", isPickup: false },
        { id: 4, name: "Motera Stadium Circle", time: "08:00 AM", returnTime: "05:25 PM", dist: "6.8 km", isPickup: false },
        { id: 5, name: "Chandlodiya Junction", time: "08:05 AM", returnTime: "05:18 PM", dist: "8.5 km", isPickup: false },
        { id: 6, name: "University Main Bus Bay", time: "08:15 AM", returnTime: "05:00 PM", dist: "11.2 km", isPickup: false },
      ],
    },
    {
      id: "R-01",
      name: "Route R-01",
      startPoint: "SG Highway Iscon",
      endPoint: "University Main Bus Bay",
      distance: "16.5 km",
      duration: "42 min",
      assignedBus: "BUS-101",
      assignedDriver: "Suresh Joshi",
      totalStudents: 44,
      status: "Active",
      stops: [
        { id: 1, name: "Iscon Cross Roads", time: "07:35 AM", dist: "0.0 km" },
        { id: 2, name: "Pakwan Junction", time: "07:42 AM", dist: "3.2 km" },
        { id: 3, name: "Thaltej Cross Roads", time: "07:50 AM", dist: "6.8 km" },
        { id: 4, name: "Science City Gate", time: "08:00 AM", dist: "11.0 km" },
        { id: 5, name: "University Main Bus Bay", time: "08:17 AM", dist: "16.5 km" },
      ],
    },
    {
      id: "R-02",
      name: "Route R-02",
      startPoint: "Maninagar Railway Stn",
      endPoint: "University Main Bus Bay",
      distance: "14.2 km",
      duration: "38 min",
      assignedBus: "BUS-108",
      assignedDriver: "Ramesh Shah",
      totalStudents: 32,
      status: "Active",
      stops: [
        { id: 1, name: "Maninagar Station", time: "07:30 AM", dist: "0.0 km" },
        { id: 2, name: "Kankaria Lake Gate 3", time: "07:38 AM", dist: "2.5 km" },
        { id: 3, name: "Geeta Mandir", time: "07:46 AM", dist: "5.1 km" },
        { id: 4, name: "Paldi Cross Roads", time: "07:55 AM", dist: "8.4 km" },
        { id: 5, name: "University Main Bus Bay", time: "08:15 AM", dist: "14.2 km" },
      ],
    },
    {
      id: "R-05",
      name: "Route R-05",
      startPoint: "Gandhinagar Sector 21",
      endPoint: "University Main Bus Bay",
      distance: "18.0 km",
      duration: "45 min",
      assignedBus: "BUS-115",
      assignedDriver: "Kailash Dave",
      totalStudents: 41,
      status: "Active",
      stops: [
        { id: 1, name: "Sector 21 Complex", time: "07:25 AM", dist: "0.0 km" },
        { id: 2, name: "Ch-3 Circle", time: "07:35 AM", dist: "4.0 km" },
        { id: 3, name: "Infocity", time: "07:45 AM", dist: "8.5 km" },
        { id: 4, name: "Koba Circle", time: "07:55 AM", dist: "12.0 km" },
        { id: 5, name: "University Main Bus Bay", time: "08:12 AM", dist: "18.0 km" },
      ],
    },
  ]);

  // Students Master Database (4,250 Registered Students)
  const [students, setStudents] = useState(INITIAL_MASTER_STUDENTS);

  // Fee Structure Master
  const [feeStructures, setFeeStructures] = useState([
    { id: "FS-01", name: "Zone A (0 - 5 km)", type: "Annual", amount: 12000, zone: "Zone A", dueDate: "15 Sep 2026", status: "Active" },
    { id: "FS-02", name: "Zone B (5 - 12 km)", type: "Annual", amount: 15000, zone: "Zone B", dueDate: "15 Sep 2026", status: "Active" },
    { id: "FS-03", name: "Zone C (12 - 20 km)", type: "Annual", amount: 18000, zone: "Zone C", dueDate: "15 Sep 2026", status: "Active" },
    { id: "FS-04", name: "Semester 1 Transit Fee", type: "Semester", amount: 7500, zone: "All Zones", dueDate: "31 Aug 2026", status: "Active" },
    { id: "FS-05", name: "Semester 2 Transit Fee", type: "Semester", amount: 7500, zone: "All Zones", dueDate: "15 Jan 2027", status: "Upcoming" },
  ]);

  // Payments / Transactions Ledger
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-98412",
      studentId: "UNI20260125",
      studentName: "Rahul Sharma",
      dept: "Computer Science",
      route: "Route R-04",
      amount: 10000,
      date: "12 Aug 2026",
      method: "UPI (Google Pay)",
      refNo: "UPI/2349018274/AXIS",
      status: "COMPLETED",
      receiptId: "REC-2026-8910",
    },
    {
      id: "TXN-98390",
      studentId: "UNI20260189",
      studentName: "Neha Patel",
      dept: "Civil Eng",
      route: "Route R-04",
      amount: 15000,
      date: "10 Aug 2026",
      method: "HDFC NetBanking",
      refNo: "NET/88219034/HDFC",
      status: "COMPLETED",
      receiptId: "REC-2026-8902",
    },
    {
      id: "TXN-98315",
      studentId: "UNI20260210",
      studentName: "Priya Singh",
      dept: "Chemical Eng",
      route: "Route R-02",
      amount: 12000,
      date: "08 Aug 2026",
      method: "Debit Card (ICICI)",
      refNo: "CARD/491204812",
      status: "COMPLETED",
      receiptId: "REC-2026-8854",
    },
    {
      id: "TXN-98204",
      studentId: "UNI20260302",
      studentName: "Ananya Desai",
      dept: "Electrical Eng",
      route: "Route R-05",
      amount: 18000,
      date: "05 Aug 2026",
      method: "UPI (PhonePe)",
      refNo: "UPI/9921048120/SBI",
      status: "COMPLETED",
      receiptId: "REC-2026-8790",
    },
  ]);

  // Offline Payment Verification Queue
  const [offlinePayments, setOfflinePayments] = useState([
    {
      id: "VER-201",
      studentId: "UNI20260142",
      studentName: "Amit Kumar",
      dept: "Mechanical Eng",
      amount: 18000,
      method: "Bank Challan / Cash Deposit",
      refNo: "CHALLAN-SBI-98412",
      slipUrl: "deposit_slip_amit.png",
      date: "21 Aug 2026",
      status: "PENDING",
      notes: "SBI Campus Branch Challan stamped deposit",
    },
    {
      id: "VER-202",
      studentId: "UNI20260341",
      studentName: "Rohan Varma",
      dept: "Biotechnology",
      amount: 5000,
      method: "NEFT / RTGS Transfer",
      refNo: "NEFT-AXIS-091283",
      slipUrl: "neft_slip_rohan.png",
      date: "20 Aug 2026",
      status: "PENDING",
      notes: "Transfer for Semester 1 Part Payment",
    },
  ]);

  // Refund Requests
  const [refundRequests, setRefundRequests] = useState([
    {
      id: "REF-101",
      studentId: "UNI20260199",
      studentName: "Kunal Mehra",
      originalAmount: 15000,
      refundAmount: 7500,
      reason: "Semester Exchange Program (Moved out of hostel transit)",
      date: "18 Aug 2026",
      status: "PENDING",
    },
    {
      id: "REF-098",
      studentId: "UNI20260288",
      studentName: "Tanvi Shah",
      originalAmount: 18000,
      refundAmount: 3000,
      reason: "Shifted to closer bus stop (Zone C to Zone B)",
      date: "14 Aug 2026",
      status: "APPROVED",
    },
  ]);

  // Discounts & Scholarships
  const [discounts, setDiscounts] = useState([
    { id: "DSC-01", name: "Merit Academic Scholarship", discountType: "Percentage", value: 20, studentsApplied: 48, status: "Active" },
    { id: "DSC-02", name: "Sports Concession", discountType: "Percentage", value: 30, studentsApplied: 16, status: "Active" },
    { id: "DSC-03", name: "University Staff Ward Allowance", discountType: "Fixed Amount", value: 7500, studentsApplied: 24, status: "Active" },
  ]);

  // Student Attendance History (Rahul Sharma)
  const [attendanceLogs, setAttendanceLogs] = useState([
    { date: "22 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "07:46 AM", dropTime: "05:48 PM", status: "Present" },
    { date: "21 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "07:48 AM", dropTime: "05:52 PM", status: "Present" },
    { date: "20 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "07:54 AM", dropTime: "05:45 PM", status: "Late" },
    { date: "19 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "07:44 AM", dropTime: "05:50 PM", status: "Present" },
    { date: "18 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "07:45 AM", dropTime: "05:51 PM", status: "Present" },
    { date: "17 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "--", dropTime: "--", status: "Missed" },
    { date: "14 Aug 2026", bus: "BUS-104", route: "R-04", stop: "Chandkheda Bus Stop", boardTime: "07:46 AM", dropTime: "05:47 PM", status: "Present" },
  ]);

  // Complaints / Tickets
  const [complaints, setComplaints] = useState([
    {
      id: "CMP-2026-104",
      studentId: "UNI20260125",
      studentName: "Rahul Sharma",
      category: "Bus delay",
      busId: "BUS-104",
      routeId: "R-04",
      description: "Morning pickup bus arrived 15 minutes late at Chandkheda Stop due to detour.",
      date: "20 Aug 2026",
      status: "In Progress", // "Open", "Assigned", "In Progress", "Resolved"
      assignedTo: "Transport Officer (Mr. Vikram)",
      response: "Reviewed traffic logs on SG Road. Route timing adjusted by 5 minutes starting next Monday.",
      photoAttached: true,
    },
    {
      id: "CMP-2026-098",
      studentId: "UNI20260189",
      studentName: "Neha Patel",
      category: "Bus cleanliness",
      busId: "BUS-104",
      routeId: "R-04",
      description: "Back row seats needed vacuuming and sanitization.",
      date: "18 Aug 2026",
      status: "Resolved",
      assignedTo: "Fleet Maintenance Crew",
      response: "Deep cleaning scheduled and completed on 19 Aug night shift.",
      photoAttached: false,
    },
    {
      id: "CMP-2026-091",
      studentId: "UNI20260142",
      studentName: "Amit Kumar",
      category: "AC problem",
      busId: "BUS-108",
      routeId: "R-02",
      description: "AC blower in middle aisle was not cooling adequately in afternoon return trip.",
      date: "15 Aug 2026",
      status: "Resolved",
      assignedTo: "HVAC Technician",
      response: "Compressor gas refilled and filter replaced.",
      photoAttached: true,
    },
  ]);

  // Emergency Incidents
  const [emergencies, setEmergencies] = useState([
    {
      id: "EMG-2026-01",
      type: "Traffic Stoppage / Roadblock",
      busId: "BUS-108",
      routeId: "R-02",
      driver: "Ramesh Shah",
      driverPhone: "+91 98765 33333",
      studentsOnboard: 32,
      location: "Near Paldi Underpass",
      time: "08:04 AM",
      status: "MONITORING", // "ACTIVE", "MONITORING", "RESOLVED"
      notes: "Severe water-logging detour taken. Traffic police escort requested.",
      severity: "Medium",
    },
  ]);

  // Maintenance Records
  const [maintenanceRecords, setMaintenanceRecords] = useState([
    { id: "MNT-401", busId: "BUS-112", issue: "Brake Pad Replacement & Oil Flush", cost: 18500, scheduledDate: "21 Aug 2026", status: "In Progress", garage: "Shreeji Auto Hub" },
    { id: "MNT-398", busId: "BUS-104", issue: "Routine 10,000 km Inspection", cost: 9200, scheduledDate: "01 Aug 2026", status: "Completed", garage: "Volvo Authorized Service" },
    { id: "MNT-392", busId: "BUS-108", issue: "EV Battery Inverter Health Check", cost: 14000, scheduledDate: "28 Jul 2026", status: "Completed", garage: "Eicher EV Technical Center" },
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: "AUD-991", timestamp: "22 Aug 2026, 07:46 AM", user: "Mahesh Patel (Driver)", action: "Student Check-in", details: "Checked in UNI20260125 (Rahul Sharma) at Chandkheda Stop" },
    { id: "AUD-990", timestamp: "21 Aug 2026, 04:30 PM", user: "Finance Admin (Vikas)", action: "Payment Verified", details: "Approved online receipt for UNI20260189 ₹15,000" },
    { id: "AUD-989", timestamp: "20 Aug 2026, 11:15 AM", user: "Super Admin", action: "Fee Structure Update", details: "Updated Zone B annual fee structure due date to 15 Sep" },
  ]);

  // Actions
  const payStudentFee = (amount, method, refNo) => {
    const newPaid = currentStudent.paidFee + amount;
    const newPending = Math.max(0, currentStudent.totalFee - newPaid);
    const newStatus = newPending === 0 ? "PAID" : "PARTIAL";

    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      dept: currentStudent.department,
      route: currentStudent.routeName,
      amount: amount,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      method: method,
      refNo: refNo || `REF/${Date.now().toString().slice(-8)}`,
      status: "COMPLETED",
      receiptId: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setCurrentStudent(prev => ({
      ...prev,
      paidFee: newPaid,
      pendingFee: newPending,
      feeStatus: newStatus,
    }));

    setTransactions(prev => [newTxn, ...prev]);

    // Update students list
    setStudents(prev =>
      prev.map(s =>
        s.id === currentStudent.id
          ? { ...s, paidFee: newPaid, pendingFee: newPending, paymentStatus: newStatus }
          : s
      )
    );

    // Audit log
    setAuditLogs(prev => [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString("en-GB"),
        user: `${currentStudent.name} (Student)`,
        action: "Fee Payment",
        details: `Paid ₹${amount.toLocaleString()} via ${method} (Ref: ${newTxn.refNo})`,
      },
      ...prev,
    ]);

    return newTxn;
  };

  const verifyOfflinePayment = (verificationId, isApproved) => {
    const target = offlinePayments.find(p => p.id === verificationId);
    if (!target) return;

    if (isApproved) {
      // Mark as approved & update student balance
      setStudents(prev =>
        prev.map(s => {
          if (s.id === target.studentId) {
            const newPaid = s.paidFee + target.amount;
            const newPending = Math.max(0, s.totalFee - newPaid);
            return {
              ...s,
              paidFee: newPaid,
              pendingFee: newPending,
              paymentStatus: newPending === 0 ? "PAID" : "PARTIAL",
              passStatus: "ACTIVE",
            };
          }
          return s;
        })
      );

      // Add to completed transactions
      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        studentId: target.studentId,
        studentName: target.studentName,
        dept: target.dept,
        route: "Route R-04",
        amount: target.amount,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        method: target.method,
        refNo: target.refNo,
        status: "COMPLETED",
        receiptId: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setTransactions(prev => [newTxn, ...prev]);
    }

    setOfflinePayments(prev =>
      prev.map(p => (p.id === verificationId ? { ...p, status: isApproved ? "VERIFIED" : "REJECTED" } : p))
    );

    setAuditLogs(prev => [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString("en-GB"),
        user: "Finance Admin",
        action: isApproved ? "Offline Payment Verified" : "Offline Payment Rejected",
        details: `${isApproved ? "Approved" : "Rejected"} ₹${target.amount} for ${target.studentName} (${target.studentId})`,
      },
      ...prev,
    ]);
  };

  const boardStudent = (studentId) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            boardedToday: true,
            boardingTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        }
        return s;
      })
    );

    setActiveTrip(prev => ({
      ...prev,
      boardedCount: prev.boardedCount + 1,
    }));

    const std = students.find(s => s.id === studentId);
    setAuditLogs(prev => [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString("en-GB"),
        user: "Driver (Mahesh Patel)",
        action: "Student Boarded",
        details: `Scanned pass for ${std ? std.name : studentId} at stop`,
      },
      ...prev,
    ]);
  };

  const submitComplaint = (complaintData) => {
    const newComplaint = {
      id: `CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Open",
      assignedTo: "Transport Helpdesk",
      response: "Ticket received and queued for operations review.",
      photoAttached: complaintData.photoAttached || false,
      ...complaintData,
    };
    setComplaints(prev => [newComplaint, ...prev]);
    return newComplaint;
  };

  const resolveComplaint = (complaintId, responseText, status = "Resolved") => {
    setComplaints(prev =>
      prev.map(c => (c.id === complaintId ? { ...c, response: responseText, status: status } : c))
    );
  };

  const triggerEmergency = (emergencyData) => {
    const newEmergency = {
      id: `EMG-2026-${Math.floor(10 + Math.random() * 90)}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "ACTIVE",
      ...emergencyData,
    };
    setEmergencies(prev => [newEmergency, ...prev]);
    return newEmergency;
  };

  const resolveEmergency = (emergencyId, notes) => {
    setEmergencies(prev =>
      prev.map(e => (e.id === emergencyId ? { ...e, status: "RESOLVED", notes: notes || e.notes } : e))
    );
  };

  const reportTripDelay = (minutes, reason) => {
    setActiveTrip(prev => ({
      ...prev,
      isDelayed: true,
      delayMinutes: minutes,
      delayReason: reason,
      etaMinutes: prev.etaMinutes + minutes,
    }));
  };

  const addBus = (newBus) => {
    setBuses(prev => [newBus, ...prev]);
  };

  const updateBus = (busId, updatedFields) => {
    setBuses(prev => prev.map(b => (b.id === busId ? { ...b, ...updatedFields } : b)));
  };

  const deleteBus = (busId) => {
    setBuses(prev => prev.filter(b => b.id !== busId));
  };

  const addRoute = (newRoute) => {
    setRoutes(prev => [newRoute, ...prev]);
  };

  const updateRoute = (routeId, updatedFields) => {
    setRoutes(prev => prev.map(r => (r.id === routeId ? { ...r, ...updatedFields } : r)));
  };

  const deleteRoute = (routeId) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
  };

  const addFeeStructure = (feeData) => {
    const newFS = {
      id: `FS-0${feeStructures.length + 1}`,
      ...feeData,
    };
    setFeeStructures(prev => [...prev, newFS]);
  };

  const assignStudentRoute = (studentId, routeId, stopName) => {
    const targetRoute = routes.find(r => r.id === routeId);
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId
          ? {
              ...s,
              routeId: routeId,
              routeName: targetRoute ? targetRoute.name : s.routeName,
              pickupStop: stopName || s.pickupStop,
            }
          : s
      )
    );
    if (studentId === currentStudent.id) {
      setCurrentStudent(prev => ({
        ...prev,
        routeId: routeId,
        routeName: targetRoute ? targetRoute.name : prev.routeName,
        pickupStop: stopName || prev.pickupStop,
      }));
    }
  };

  const addStudent = (studentData) => {
    const newId = studentData.id || `STU${Date.now().toString().slice(-6)}`;
    const passStatus = (studentData.pass || studentData.passStatus || "Active").toUpperCase();
    const isPaid = passStatus === "ACTIVE";
    const newStudent = {
      id: newId,
      name: studentData.name,
      email: studentData.email || `${studentData.name.toLowerCase().replace(/\s+/g, ".")}@glowbus.edu`,
      phone: studentData.phone || "+91 98765 00000",
      dept: studentData.dept || studentData.course || "Computer Science",
      course: studentData.course || studentData.dept || "B.Tech CS",
      year: studentData.year || "1st",
      route: studentData.route || "Route 2A",
      routeId: studentData.routeId || "R-02",
      routeName: studentData.routeName || studentData.route || "Route 2A (Navrangpura)",
      boarding: studentData.boarding || studentData.pickupStop || "Helmet Circle",
      pickupStop: studentData.boarding || studentData.pickupStop || "Helmet Circle",
      pass: passStatus === "ACTIVE" ? "Active" : passStatus === "PENDING" ? "Pending" : "Expired",
      passStatus: passStatus,
      passId: studentData.passId || (passStatus === "ACTIVE" ? `PASS-STU-2026-${Math.floor(1000 + Math.random() * 8999)}` : ""),
      totalFee: studentData.totalFee || 15000,
      paidFee: studentData.paidFee !== undefined ? studentData.paidFee : isPaid ? 15000 : 0,
      pendingFee: studentData.pendingFee !== undefined ? studentData.pendingFee : isPaid ? 0 : 15000,
      paymentStatus: isPaid ? "PAID" : "PENDING",
      accountStatus: passStatus === "EXPIRED" ? "Suspended" : "Active",
      boardedToday: false,
      boardingTime: null,
    };
    setStudents(prev => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (studentId, updatedFields) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, ...updatedFields } : s))
    );
  };

  const deleteStudent = (studentId) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // ── TELEMETRY & LIVE GPS BROADCAST METHODS (BACKEND READY) ─────
  /**
   * Broadcast Driver Real-time Location to Context & Backend API
   */
  const broadcastDriverLocation = (locationUpdate = {}) => {
    const busId = locationUpdate.busId || currentDriver.assignedBus || "BUS-104";
    const timestamp = new Date().toISOString();

    const payload = {
      busId,
      driverId: currentDriver.id,
      driverName: currentDriver.name,
      driverPhone: currentDriver.phone,
      routeId: currentDriver.assignedRoute,
      routeName: currentDriver.routeName,
      status: activeTrip.status,
      lastUpdated: timestamp,
      isLiveBroadcasting: true,
      ...locationUpdate,
    };

    // Update in Context state for instant reactive UI updates
    setLiveBusTelemetry((prev) => ({
      ...prev,
      [busId]: {
        ...(prev[busId] || {}),
        ...payload,
      },
    }));

    // If this is the active trip bus, update activeTrip state as well
    if (busId === activeTrip.busId) {
      setActiveTrip((prev) => ({
        ...prev,
        currentSpeed: locationUpdate.speed !== undefined ? locationUpdate.speed : prev.currentSpeed,
        etaMinutes: locationUpdate.etaMinutes !== undefined ? locationUpdate.etaMinutes : prev.etaMinutes,
        currentStopIndex: locationUpdate.nextStopIndex !== undefined ? locationUpdate.nextStopIndex : prev.currentStopIndex,
        progressPercent: locationUpdate.progressPercent !== undefined ? locationUpdate.progressPercent : prev.progressPercent,
        coordinates: locationUpdate.lat && locationUpdate.lng ? { lat: locationUpdate.lat, lng: locationUpdate.lng } : prev.coordinates,
        isDeviceGps: locationUpdate.isDeviceGps !== undefined ? locationUpdate.isDeviceGps : prev.isDeviceGps,
        isLiveBroadcasting: true,
      }));
    }

    // Call modular Backend API client
    TelemetryService.broadcastDriverLocation(payload).catch((err) => {
      console.warn("[TransitContext] Telemetry API fallback mode active:", err);
    });

    return payload;
  };

  /**
   * Toggle Live GPS Broadcast status for Driver
   */
  const toggleDriverGpsBroadcast = (enableBroadcasting = true) => {
    const busId = currentDriver.assignedBus || "BUS-104";
    setLiveBusTelemetry((prev) => ({
      ...prev,
      [busId]: {
        ...(prev[busId] || {}),
        isLiveBroadcasting: enableBroadcasting,
        lastUpdated: new Date().toISOString(),
      },
    }));
    setActiveTrip((prev) => ({
      ...prev,
      isLiveBroadcasting: enableBroadcasting,
    }));
  };

  /**
   * Retrieve live telemetry for any given busId
   */
  const getLiveBusLocation = (busId) => {
    return liveBusTelemetry[busId] || liveBusTelemetry["BUS-104"] || null;
  };

  // ── REAL-TIME GPS REFRESH LOOP & BACKEND STREAM SUBSCRIPTION ────
  useEffect(() => {
    // 1. Subscribe to Backend WebSocket/SSE Stream if live backend is enabled
    const unsubscribeStream = TelemetryService.subscribeToLiveFleet((streamData) => {
      if (streamData && streamData.busId) {
        setLiveBusTelemetry((prev) => ({
          ...prev,
          [streamData.busId]: {
            ...(prev[streamData.busId] || {}),
            ...streamData,
          },
        }));
      }
    });

    // 2. Real-time ticker for continuous smooth progression
    const interval = setInterval(() => {
      setLiveBusTelemetry((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((busId) => {
          const bus = updated[busId];
          if (bus.status === "ON_ROUTE" && bus.isLiveBroadcasting && !bus.isDeviceGps) {
            // Smoothly progress along route (between 10% and 95%)
            let nextProg = (bus.progressPercent || 20) + 1.2;
            if (nextProg > 96) nextProg = 12;

            // Map stop index based on progress
            let nextStopIdx = 1;
            let nextStopName = "Visat Circle";
            let eta = 8;

            if (nextProg > 75) {
              nextStopIdx = 4;
              nextStopName = "Koba Circle";
              eta = 2;
            } else if (nextProg > 50) {
              nextStopIdx = 3;
              nextStopName = "Ranip Bus Port";
              eta = 5;
            } else if (nextProg > 25) {
              nextStopIdx = 2;
              nextStopName = "Motera Crossroads";
              eta = 7;
            }

            // Smoothly calculate lat / lng along city transit corridor
            const baseLat = 23.0500 + (nextProg / 100) * 0.1200;
            const baseLng = 72.5600 + (nextProg / 100) * 0.0800;

            updated[busId] = {
              ...bus,
              progressPercent: Math.round(nextProg * 10) / 10,
              nextStopIndex: nextStopIdx,
              nextStop: nextStopName,
              etaMinutes: eta,
              lat: parseFloat(baseLat.toFixed(4)),
              lng: parseFloat(baseLng.toFixed(4)),
              speed: Math.floor(36 + Math.sin(nextProg) * 8),
              lastUpdated: new Date().toISOString(),
            };
          }
        });

        return updated;
      });
    }, 3500);

    return () => {
      clearInterval(interval);
      unsubscribeStream();
    };
  }, []);

  return (
    <TransitContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        accessToken,
        setAccessToken,
        activeRole,
        setActiveRole,
        currentStudent,
        setCurrentStudent,
        currentDriver,
        setCurrentDriver,
        currentAdmin,
        setCurrentAdmin,
        currentFinanceAdmin,
        setCurrentFinanceAdmin,
        activeTrip,
        setActiveTrip,
        liveBusTelemetry,
        setLiveBusTelemetry,
        buses,
        setBuses,
        routes,
        setRoutes,
        students,
        setStudents,
        feeStructures,
        setFeeStructures,
        transactions,
        setTransactions,
        offlinePayments,
        setOfflinePayments,
        refundRequests,
        setRefundRequests,
        discounts,
        setDiscounts,
        attendanceLogs,
        setAttendanceLogs,
        complaints,
        setComplaints,
        emergencies,
        setEmergencies,
        maintenanceRecords,
        setMaintenanceRecords,
        auditLogs,
        setAuditLogs,
        // Methods
        payStudentFee,
        verifyOfflinePayment,
        boardStudent,
        submitComplaint,
        resolveComplaint,
        triggerEmergency,
        resolveEmergency,
        reportTripDelay,
        addBus,
        updateBus,
        deleteBus,
        addRoute,
        updateRoute,
        deleteRoute,
        addFeeStructure,
        assignStudentRoute,
        addStudent,
        updateStudent,
        deleteStudent,
        // Telemetry & GPS methods
        broadcastDriverLocation,
        toggleDriverGpsBroadcast,
        getLiveBusLocation,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};
