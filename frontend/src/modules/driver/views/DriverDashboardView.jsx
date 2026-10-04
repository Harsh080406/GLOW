import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import GlowLogo from "../../../shared/assets/GlowLogo";
import { useTransit } from "../../../shared/context/TransitContext";
import "./DriverDashboard.css";
import "../../admin/layout/AdminLayout.css";
import "../../admin/views/AdminProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const BusIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1" fill={color} stroke="none" />
    <circle cx="17" cy="19" r="1" fill={color} stroke="none" />
    <path d="M6 5V3M18 5V3" />
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Driver Home", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "trip_mgmt", label: "Trip Management", icon: "M5 3l14 9-14 9V3z" },
  { id: "boarding", label: "Student Boarding", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", badge: "31/38" },
  { id: "mybus", label: "Bus & Inspection", icon: "M3 12h18M3 6h18M3 18h18" },
  { id: "route", label: "Route & GPS Map", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
  { id: "profile", label: "Driver Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { id: "edit_profile", label: "Edit Profile", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
  { id: "report_problem", label: "Report Issue", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
  { id: "emergency", label: "Emergency / SOS", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
];

const DRIVER_TAB_TITLES = {
  dashboard: {
    title: "Driver Command Cockpit",
    subtitle: "Real-Time Bus Telematics, Live Trip Controls & Passenger Roster",
  },
  trip_mgmt: {
    title: "Trip & Shift Controls",
    subtitle: "Real-Time Trip Dispatch, Pause, Progression & Route Verification",
  },
  boarding: {
    title: "Passenger Boarding Roster",
    subtitle: "Live QR Validation, Student Headcount & Check-in Records",
  },
  mybus: {
    title: "Bus Fitness & Inspection",
    subtitle: "Vehicle Telematics, Health Checklist, Odometer & Fuel Level",
  },
  route: {
    title: "Route & Geographic GPS Map",
    subtitle: "Scheduled Bus Stops, Progression Line & Commuter ETAs",
  },
  profile: {
    title: "Driver Profile & Credentials",
    subtitle: "Shift Allocation, Licensing Documents, Contact & Performance",
  },
  edit_profile: {
    title: "Edit Driver Credentials",
    subtitle: "Update Contact Information, Shift Preference & License Docs",
  },
  report_problem: {
    title: "Vehicle & Route Issue Report",
    subtitle: "Direct Mechanical, Traffic or Infrastructure Grievance Dispatch",
  },
  emergency: {
    title: "Driver Emergency & Safety SOS",
    subtitle: "High-Priority Alert Dispatch to Admin & Security Control Room",
  },
};

const DriverDashboardView = () => {
  const navigate = useNavigate();
  const {
    currentDriver,
    setCurrentDriver,
    activeTrip,
    setActiveTrip,
    students,
    boardStudent,
    startTrip,
    pauseTrip,
    completeTrip,
    broadcastDelay,
    triggerDriverSos,
    validatePass,
    reportTripDelay,
    triggerEmergency,
    broadcastDriverLocation,
    toggleDriverGpsBroadcast,
    liveBusTelemetry,
  } = useTransit();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Real-time GPS Broadcasting state
  const [isDeviceGpsActive, setIsDeviceGpsActive] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState(null);

  // Loading & Action states
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const [isPausingTrip, setIsPausingTrip] = useState(false);
  const [isCompletingTrip, setIsCompletingTrip] = useState(false);
  const [isSosLoading, setIsSosLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Camera QR Scanner & Manual ID State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerMode, setScannerMode] = useState("camera"); // "camera" | "manual"
  const [manualIdInput, setManualIdInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const scannerInstanceRef = useRef(null);

  // Modals & form state
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayMins, setDelayMins] = useState(10);
  const [delayReason, setDelayReason] = useState("Traffic congestion near Chhani Jakat Naka");
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState(null);

  // Driver Profile edit modal state
  const [showDriverEditModal, setShowDriverEditModal] = useState(false);
  const [driverSavedSuccess, setDriverSavedSuccess] = useState(false);
  const [driverFormData, setDriverFormData] = useState({
    name: currentDriver?.name || "Mahesh Patel",
    phone: currentDriver?.phone || "+91 98765 11111",
    email: currentDriver?.email || "mahesh.patel@glowbus.edu",
    address: currentDriver?.address || "B-14, Shanti Nagar, Nizampura, Vadodara - 390002",
    emergencyContact: currentDriver?.emergencyContact || "+91 98765 00000 (Wife)",
    bloodGroup: currentDriver?.bloodGroup || "B+",
  });

  const handleDriverSave = (e) => {
    e.preventDefault();
    const initials = (driverFormData.name || "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MP";

    if (setCurrentDriver) {
      setCurrentDriver((prev) => ({
        ...prev,
        name: driverFormData.name,
        phone: driverFormData.phone,
        email: driverFormData.email,
        address: driverFormData.address,
        emergencyContact: driverFormData.emergencyContact,
        bloodGroup: driverFormData.bloodGroup,
        avatar: initials,
      }));
    }

    setShowDriverEditModal(false);
    setDriverSavedSuccess(true);
    setTimeout(() => setDriverSavedSuccess(false), 3000);
  };

  // Problem reporting
  const [problemCategory, setProblemCategory] = useState("AC cooling malfunction");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemSubmitted, setProblemSubmitted] = useState(false);

  // Inspection checklist
  const [inspection, setInspection] = useState({
    brakes: true,
    tires: true,
    headlights: true,
    gpsDevice: true,
    firstAidKit: true,
    fireExtinguisher: true,
  });

  // Toggle Device GPS (Phone / Browser Geolocation)
  const handleToggleDeviceGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this device browser.");
      return;
    }

    if (isDeviceGpsActive) {
      setIsDeviceGpsActive(false);
      if (broadcastDriverLocation) broadcastDriverLocation({ isDeviceGps: false });
      setBroadcastFeedback("Switched to Route Telemetry mode.");
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDeviceGpsActive(true);
          const { latitude, longitude, speed } = pos.coords;
          if (broadcastDriverLocation) {
            broadcastDriverLocation({
              lat: parseFloat(latitude.toFixed(4)),
              lng: parseFloat(longitude.toFixed(4)),
              speed: speed ? Math.round(speed * 3.6) : 42,
              isDeviceGps: true,
            });
          }
          setBroadcastFeedback("✓ Device GPS Linked & Broadcasting Live to Students & Admin!");
        },
        (err) => {
          alert(`Could not acquire device GPS: ${err.message}. Using high-precision transit telemetry.`);
        }
      );
    }
    setTimeout(() => setBroadcastFeedback(null), 4000);
  };

  // Trigger Manual Telemetry Sync
  const handleManualBroadcast = () => {
    if (broadcastDriverLocation) {
      broadcastDriverLocation({
        speed: activeTrip.currentSpeed || 42,
        lastUpdated: new Date().toISOString(),
      });
    }
    setBroadcastFeedback("✓ Telemetry packet broadcasted! Synced with Students and Admin.");
    setTimeout(() => setBroadcastFeedback(null), 4000);
  };

  // Trip Lifecycle API Handlers
  const handleStartTrip = async () => {
    setIsStartingTrip(true);
    try {
      if (startTrip) {
        await startTrip();
      } else {
        const res = await fetch("/api/driver/me/trip/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
        });
        const data = await res.json();
        if (data?.trip) {
          setActiveTrip((prev) => ({
            ...prev,
            ...data.trip,
            id: data.trip._id,
            isActive: true,
            status: "ON_ROUTE",
          }));
        }
      }
      if (broadcastDriverLocation) {
        broadcastDriverLocation({ status: "ON_ROUTE" });
      }
      setBroadcastFeedback("✓ Trip Started! Status: ON_ROUTE. Broadcasting GPS Telemetry.");
    } catch (err) {
      console.error("Start trip error:", err);
      setActiveTrip((prev) => ({ ...prev, status: "ON_ROUTE", isActive: true }));
    } finally {
      setIsStartingTrip(false);
      setTimeout(() => setBroadcastFeedback(null), 4000);
    }
  };

  const handlePauseTrip = async () => {
    setIsPausingTrip(true);
    const tripId = activeTrip?.id || activeTrip?._id || activeTrip?.tripId;
    try {
      if (pauseTrip) {
        await pauseTrip(tripId);
      } else {
        await fetch(`/api/driver/me/trip/${tripId || "active"}/pause`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
        });
        const nextStatus = activeTrip.status === "PAUSED" ? "ON_ROUTE" : "PAUSED";
        setActiveTrip((prev) => ({ ...prev, status: nextStatus }));
      }
      if (broadcastDriverLocation) {
        broadcastDriverLocation({ status: activeTrip?.status === "PAUSED" ? "ON_ROUTE" : "PAUSED" });
      }
      setBroadcastFeedback(activeTrip?.status === "PAUSED" ? "▶ Trip Resumed." : "⏸ Trip Paused.");
    } catch (err) {
      console.error("Pause trip error:", err);
    } finally {
      setIsPausingTrip(false);
      setTimeout(() => setBroadcastFeedback(null), 4000);
    }
  };

  const handleEndTrip = async () => {
    if (!window.confirm("Complete this trip? This archives metrics and resets bus occupancy to 0.")) {
      return;
    }
    setIsCompletingTrip(true);
    const tripId = activeTrip?.id || activeTrip?._id || activeTrip?.tripId;
    try {
      if (completeTrip) {
        await completeTrip(tripId);
      } else {
        await fetch(`/api/driver/me/trip/${tripId || "active"}/complete`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
        });
        setActiveTrip((prev) => ({ ...prev, status: "COMPLETED", isActive: false }));
      }
      if (broadcastDriverLocation) {
        broadcastDriverLocation({ status: "COMPLETED" });
      }
      setBroadcastFeedback("✓ Trip Completed! Bus occupancy reset to 0.");
    } catch (err) {
      console.error("Complete trip error:", err);
    } finally {
      setIsCompletingTrip(false);
      setTimeout(() => setBroadcastFeedback(null), 4000);
    }
  };

  const handleNextStop = () => {
    const nextIdx = Math.min(5, (activeTrip.currentStopIndex || 0) + 1);
    setActiveTrip((prev) => ({
      ...prev,
      currentStopIndex: nextIdx,
    }));
    if (broadcastDriverLocation) {
      broadcastDriverLocation({ nextStopIndex: nextIdx });
    }
  };

  // Delay Notice Broadcast Handler
  const handleDelaySubmit = async (e) => {
    e.preventDefault();
    const tripId = activeTrip?.id || activeTrip?._id || activeTrip?.tripId;
    try {
      if (broadcastDelay) {
        await broadcastDelay(Number(delayMins), delayReason, tripId);
      } else {
        await fetch(`/api/driver/me/trip/${tripId || "active"}/delay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
          body: JSON.stringify({ minutes: Number(delayMins), reason: delayReason }),
        });
      }
      setShowDelayModal(false);
      setBroadcastFeedback(`📢 Delay alert (+${delayMins}m) broadcasted to route commuters.`);
    } catch (err) {
      console.error("Broadcast delay error:", err);
    } finally {
      setTimeout(() => setBroadcastFeedback(null), 5000);
    }
  };

  // Driver SOS Emergency Handler
  const handleDriverSos = async () => {
    if (!window.confirm("🚨 Trigger DRIVER SOS EMERGENCY? This alerts University Central Security and Super Admin with your GPS location.")) {
      return;
    }
    setIsSosLoading(true);
    let coords = { lat: 23.0982, lng: 72.5784 };

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3500 });
        });
        coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        };
      } catch (err) {
        console.warn("GPS timeout, falling back to telemetry coordinates:", err);
      }
    }

    try {
      if (triggerDriverSos) {
        await triggerDriverSos({
          lat: coords.lat,
          lng: coords.lng,
          busId: currentDriver?.assignedBus || "BUS-104",
          notes: "Driver Cockpit Emergency Alert",
        });
      } else {
        await fetch("/api/driver/me/sos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
          body: JSON.stringify({
            lat: coords.lat,
            lng: coords.lng,
            busId: currentDriver?.assignedBus || "BUS-104",
            notes: "Driver Cockpit Emergency Alert",
          }),
        });
      }
      setBroadcastFeedback("🚨 DRIVER EMERGENCY SOS TRANSMITTED! Security & Dispatch Notified.");
    } catch (err) {
      console.error("SOS trigger error:", err);
    } finally {
      setIsSosLoading(false);
      setTimeout(() => setBroadcastFeedback(null), 6000);
    }
  };

  // Pass Validation Handler (Camera QR & Manual ID) with sub-2s p95 latency check
  const handleValidatePass = async ({ qrPayload, enrollmentId }) => {
    if (isValidating) return;
    setIsValidating(true);
    setScanResult(null);

    const startTime = performance.now();
    try {
      let res;
      if (validatePass) {
        res = await validatePass({
          qrPayload,
          enrollmentId,
          busId: currentDriver?.assignedBus || "BUS-104",
        });
      } else {
        const fetchRes = await fetch("/api/driver/me/validate-pass", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
          body: JSON.stringify({
            qrPayload,
            enrollmentId,
            busId: currentDriver?.assignedBus || "BUS-104",
          }),
        });
        res = await fetchRes.json();
      }

      const clientLatency = Math.round(performance.now() - startTime);
      const latency = res?.latencyMs !== undefined ? res.latencyMs : clientLatency;
      const p95Met = res?.p95TargetMet !== undefined ? res.p95TargetMet : latency < 2000;

      if (res && res.valid) {
        const studentId = res.student?.id || enrollmentId || "Student";
        const studentName = res.student?.name || "Student";
        setScanResult({
          type: "success",
          status: res.status || "ACTIVE",
          message: `✓ Authorized: ${studentName} (${studentId}) - Boarding Approved`,
          student: res.student,
          latencyMs: latency,
          p95TargetMet: p95Met,
        });
        if (boardStudent) {
          boardStudent(res.student?.id || enrollmentId);
        }
      } else {
        const status = res?.status || "REJECTED";
        const reason = status === "EXPIRED"
          ? "Transport Pass Expired"
          : status === "PENDING_FEE"
          ? "Transport Fee Dues Pending"
          : "Invalid HMAC Pass Signature";

        setScanResult({
          type: "warning",
          status,
          message: `⚠️ Access Denied: ${reason} (Status: ${status})`,
          student: res?.student,
          latencyMs: latency,
          p95TargetMet: p95Met,
        });
      }
    } catch (err) {
      setScanResult({
        type: "error",
        status: "ERROR",
        message: `Validation Error: ${err.message || "Failed to reach validator"}`,
        latencyMs: Math.round(performance.now() - startTime),
        p95TargetMet: false,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;
    handleValidatePass({ enrollmentId: manualIdInput.trim() });
  };

  // Camera QR scanner lifecycle with html5-qrcode
  useEffect(() => {
    let qrScanner = null;

    if (showScannerModal && scannerMode === "camera") {
      setCameraError(null);
      const timer = setTimeout(() => {
        const readerElem = document.getElementById("driver-qr-reader");
        if (!readerElem) return;

        try {
          qrScanner = new Html5Qrcode("driver-qr-reader");
          scannerInstanceRef.current = qrScanner;

          qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              handleValidatePass({ qrPayload: decodedText });
            },
            () => {}
          ).catch((err) => {
            console.warn("Camera start failed:", err);
            setCameraError("Camera unavailable or permission denied. Please switch to manual entry.");
          });
        } catch (err) {
          console.warn("Html5Qrcode init error:", err);
          setCameraError("Camera initialization failed. Please switch to manual entry.");
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (qrScanner) {
          try {
            if (qrScanner.isScanning) {
              qrScanner.stop().then(() => qrScanner.clear()).catch(() => {});
            } else {
              qrScanner.clear();
            }
          } catch (e) {
            console.warn(e);
          }
        }
        scannerInstanceRef.current = null;
      };
    } else {
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            scannerInstanceRef.current.stop().then(() => scannerInstanceRef.current.clear()).catch(() => {});
          } else {
            scannerInstanceRef.current.clear();
          }
        } catch (e) {}
        scannerInstanceRef.current = null;
      }
    }
  }, [showScannerModal, scannerMode]);

  const handleCloseScannerModal = () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          scannerInstanceRef.current.stop().then(() => scannerInstanceRef.current.clear()).catch(() => {});
        } else {
          scannerInstanceRef.current.clear();
        }
      } catch (e) {}
      scannerInstanceRef.current = null;
    }
    setShowScannerModal(false);
    setScanResult(null);
    setManualIdInput("");
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    handleValidatePass({ enrollmentId: scanInput.trim() });
    setScanInput("");
  };

  const routeStops = [
    { index: 0, name: "Fatehgunj Stop", scheduled: "07:30 AM", actual: "07:31 AM", students: 12, status: "departed" },
    { index: 1, name: "Nizampura Char Rasta", scheduled: "07:42 AM", actual: "07:44 AM", students: 8, status: "departed" },
    { index: 2, name: "Chhani Jakat Naka", scheduled: "07:54 AM", actual: "On Time (2 min)", students: 11, status: "approaching" },
    { index: 3, name: "Bajwa Crossing", scheduled: "08:04 AM", actual: "Estimated 08:05 AM", students: 5, status: "upcoming" },
    { index: 4, name: "Fertilizernagar Gate", scheduled: "08:14 AM", actual: "Estimated 08:15 AM", students: 2, status: "upcoming" },
    { index: 5, name: "GSFC University Main Bay", scheduled: "08:20 AM", actual: "Estimated 08:20 AM", students: 0, status: "destination" },
  ];

  const driverRouteId = currentDriver?.assignedRoute || currentDriver?.routeId || activeTrip?.routeId || "R-04";

  const defaultStudents = [
    { id: "UNI20260125", name: "Rahul Sharma", enrollmentId: "UNI20260125", pickupStop: "Chhani Jakat Naka", stopName: "Chhani Jakat Naka", pickupTime: "07:54 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260142", name: "Priya Patel", enrollmentId: "UNI20260142", pickupStop: "Fatehgunj Stop", stopName: "Fatehgunj Stop", pickupTime: "07:30 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260188", name: "Ananya Desai", enrollmentId: "UNI20260188", pickupStop: "Nizampura Char Rasta", stopName: "Nizampura Char Rasta", pickupTime: "07:42 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260210", name: "Siddharth Joshi", enrollmentId: "UNI20260210", pickupStop: "Chhani Jakat Naka", stopName: "Chhani Jakat Naka", pickupTime: "07:54 AM", boardedToday: false, passStatus: "ACTIVE" },
    { id: "UNI20260235", name: "Kavita Shah", enrollmentId: "UNI20260235", pickupStop: "Bajwa Crossing", stopName: "Bajwa Crossing", pickupTime: "08:04 AM", boardedToday: false, passStatus: "ACTIVE" },
    { id: "UNI20260280", name: "Rohan Dave", enrollmentId: "UNI20260280", pickupStop: "Fatehgunj Stop", stopName: "Fatehgunj Stop", pickupTime: "07:30 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260312", name: "Aarav Mehta", enrollmentId: "UNI20260312", pickupStop: "Fertilizernagar Gate", stopName: "Fertilizernagar Gate", pickupTime: "08:14 AM", boardedToday: false, passStatus: "ACTIVE" },
    { id: "UNI20260340", name: "Isha Nair", enrollmentId: "UNI20260340", pickupStop: "Nizampura Char Rasta", stopName: "Nizampura Char Rasta", pickupTime: "07:42 AM", boardedToday: true, passStatus: "ACTIVE" },
  ];

  const matchedStudents = (students && students.length > 0)
    ? students.filter((s) => s.busId === currentDriver?.assignedBus || s.routeId === driverRouteId || s.route === driverRouteId)
    : [];

  const assignedBusStudents = matchedStudents.length > 0 ? matchedStudents : defaultStudents;

  const [boardedStudentsState, setBoardedStudentsState] = useState(() => {
    const initial = {};
    defaultStudents.forEach((s) => {
      initial[s.id] = !!s.boardedToday;
    });
    return initial;
  });

  const toggleStudentBoarded = (studentId) => {
    setBoardedStudentsState((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const effectiveStudents = assignedBusStudents.map((s) => ({
    ...s,
    boardedToday: boardedStudentsState[s.id] !== undefined ? boardedStudentsState[s.id] : !!s.boardedToday,
  }));
  const effectiveBoardedCount = effectiveStudents.filter((s) => s.boardedToday).length;

  const currentStopIndex = typeof activeTrip?.currentStopIndex === "number" ? activeTrip.currentStopIndex : 2;
  const currentApproachingStop = routeStops[currentStopIndex] || routeStops[2];
  const nextStopStudentsRaw = effectiveStudents.filter(
    (s) => s.pickupStop === currentApproachingStop.name || s.stopName === currentApproachingStop.name
  );
  const nextStopStudents = nextStopStudentsRaw.length > 0 ? nextStopStudentsRaw : effectiveStudents.slice(0, 3);

  const dynamicNavItems = NAV_ITEMS.map((item) =>
    item.id === "boarding"
      ? { ...item, badge: `${effectiveBoardedCount}/${effectiveStudents.length}` }
      : item
  );

  const driverName = currentDriver?.name || "Mahesh Patel";
  const driverAssignedBusId = currentDriver?.assignedBus || activeTrip?.busId || "BUS-104";
  const driverInitials = currentDriver?.avatar ||
    driverName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MP";

  const currentTabMeta = DRIVER_TAB_TITLES[activeNav] || {
    title: "Driver Command Cockpit",
    subtitle: "Real-Time Bus Telematics, Live Trip Controls & Passenger Roster",
  };

  return (
    <div className="dd-wrapper">
      <div className="dd-root">
        {/* ── SIDEBAR ────────────────────────────────────────── */}
        <aside className={`dd-sidebar ${isCollapsed ? "dd-sidebar--collapsed" : ""} ${sidebarOpen ? "dd-sidebar--open" : ""}`}>
          <button
            type="button"
            className="dd-brand"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Click to expand sidebar" : "Click to collapse sidebar"}
            aria-label="Toggle driver sidebar collapse"
          >
            <div className="dd-brand-logo-wrap">
              <GlowLogo width={isCollapsed ? 38 : 72} darkMode={false} />
            </div>
            {!isCollapsed && (
              <div className="dd-brand-text">
                <div className="dd-brand-name">TRANSIT</div>
                <div className="dd-brand-sub">Driver Cockpit</div>
              </div>
            )}
          </button>

          <nav className="dd-nav">
            {dynamicNavItems.map((item) => {
              const isEditProfile = item.id === "edit_profile";
              const isActive = isEditProfile ? (activeNav === "profile" && showDriverEditModal) : activeNav === item.id;

              return (
                <button
                  key={item.id}
                  className={`dd-nav-item ${isActive ? "dd-nav-item--active" : ""}`}
                  onClick={() => {
                    if (isEditProfile) {
                      setActiveNav("profile");
                      setShowDriverEditModal(true);
                    } else {
                      setActiveNav(item.id);
                    }
                    setSidebarOpen(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon d={item.icon} size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge && <span className="dd-nav-badge">{item.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div
            className="dd-driver-info"
            title={isCollapsed ? `${driverName} (${currentDriver?.id || "DRV-104"})` : undefined}
            onClick={() => {
              setActiveNav("profile");
              setSidebarOpen(false);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="dd-driver-avatar">{driverInitials}</div>
            {!isCollapsed && (
              <div className="dd-driver-text" style={{ flex: 1 }}>
                <p className="dd-driver-name">{driverName}</p>
                <p className="dd-driver-id">{currentDriver?.id || "DRV-104"}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <span className="dd-duty-badge">● On Duty</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNav("profile");
                      setShowDriverEditModal(true);
                      setSidebarOpen(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0066ff",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="dd-logout"
            onClick={() => navigate("/")}
            title={isCollapsed ? "Exit Portal" : undefined}
          >
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} />
            {!isCollapsed && <span>Exit Portal</span>}
          </button>
        </aside>

        {sidebarOpen && <div className="dd-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

        {/* ── MAIN ───────────────────────────────────────────── */}
        <div className="dd-main">
          <header className="dd-topbar">
            <button className="dd-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div className="dd-topbar-info">
              <h1 className="dd-topbar-title">{currentTabMeta.title}</h1>
              <p className="dd-topbar-subtitle">{currentTabMeta.subtitle}</p>
            </div>
            <div className="dd-topbar-right">
              <span className={`dd-trip-status ${activeTrip?.status === "ON_ROUTE" ? "dd-trip-status--active" : "dd-trip-status--idle"}`}>
                {activeTrip?.status === "ON_ROUTE" ? "● Trip Active" : activeTrip?.status === "PAUSED" ? "⏸ Trip Paused" : "○ Standby / Base"}
              </span>
              <button
                className="dd-sos-btn"
                aria-label="Emergency SOS"
                onClick={() => setActiveNav("emergency")}
                title="Trigger Emergency SOS"
              >
                🚨 SOS
              </button>
              <div
                className="dd-topbar-profile"
                title={`${driverName} (${currentDriver?.id || "DRV-104"}) — Click to view Profile`}
                onClick={() => setActiveNav("profile")}
              >
                <div className="dd-avatar">{driverInitials}</div>
                <div className="dd-avatar-info">
                  <span className="dd-avatar-name">{driverName}</span>
                  <span className="dd-avatar-role">Bus Pilot · {driverAssignedBusId}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="dd-content">
            {/* ── 1. DRIVER HOME ────────────────────────────────────── */}
            {activeNav === "dashboard" && (
              <div className="dd-cockpit-wrapper" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {broadcastFeedback && (
                  <div style={{
                    padding: "12px 18px",
                    background: broadcastFeedback.includes("🚨") ? "#fef2f2" : "#eff6ff",
                    color: broadcastFeedback.includes("🚨") ? "#b91c1c" : "#0066ff",
                    border: `1px solid ${broadcastFeedback.includes("🚨") ? "#fecaca" : "#bfdbfe"}`,
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}>
                    {broadcastFeedback}
                  </div>
                )}

                {/* 1. MISSION COMMAND HERO BANNER */}
                <div className="dd-mission-card">
                  <div className="dd-mission-top">
                    <div className="dd-mission-badges">
                      <span className="ad-badge ad-badge--blue" style={{ fontSize: 12, padding: "5px 12px" }}>
                        🚌 Vehicle: {currentDriver?.assignedBus || "BUS-104"}
                      </span>
                      <span className="ad-badge ad-badge--gray" style={{ fontSize: 12, padding: "5px 12px" }}>
                        Route {driverRouteId}
                      </span>
                      <span className={`ad-badge ${activeTrip?.status === "ON_ROUTE" ? "ad-badge--green" : "ad-badge--yellow"}`} style={{ fontSize: 12, padding: "5px 12px" }}>
                        {activeTrip?.status === "ON_ROUTE" ? "● Cruising on Route" : activeTrip?.status === "PAUSED" ? "⏸ Trip Paused" : "○ Standby / Base"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleDeviceGps}
                      className="dd-sensor-btn"
                      title="Toggle between Device GPS and Bus Hardware Telematics"
                    >
                      <span className="dd-pulse-dot" />
                      GPS: {isDeviceGpsActive ? "Device GPS (Live)" : "Bus Sensor Active"}
                    </button>
                  </div>

                  <div className="dd-mission-body">
                    {/* Left: Route Corridor */}
                    <div className="dd-mission-info">
                      <span className="dd-mission-eyebrow">ASSIGNED TRANSIT CORRIDOR</span>
                      <h2 className="dd-mission-title">{currentDriver?.routeName || "GSFC University ↔ Fatehgunj Corridor"}</h2>
                      <p className="dd-mission-desc">
                        Pilot: <strong>{driverName}</strong> · Morning Shift · <strong>{effectiveStudents.length} Students Allocated</strong> · 6 Scheduled Stops
                      </p>
                    </div>

                    {/* Center: Live Telematics Mini HUD */}
                    <div className="dd-mission-hud">
                      <div className="dd-hud-item">
                        <span className="dd-hud-label">LIVE SPEED</span>
                        <div className="dd-hud-val-wrap">
                          <strong className="dd-hud-speed">
                            {liveBusTelemetry?.[currentDriver?.assignedBus]?.speed ?? liveBusTelemetry?.speed ?? activeTrip?.speed ?? activeTrip?.currentSpeed ?? 42}
                          </strong>
                          <span className="dd-hud-unit">KM/H</span>
                        </div>
                        <span className="dd-hud-sub">Limit: 50 KM/H · Safe</span>
                      </div>
                      <div className="dd-hud-divider" />
                      <div className="dd-hud-item">
                        <span className="dd-hud-label">NEXT STOP</span>
                        <strong className="dd-hud-stop">{currentApproachingStop.name}</strong>
                        <span className="dd-hud-sub">ETA: 07:58 AM (2 min)</span>
                      </div>
                    </div>

                    {/* Right: Trip Controls */}
                    <div className="dd-mission-actions">
                      {activeTrip?.status !== "ON_ROUTE" ? (
                        <button
                          onClick={handleStartTrip}
                          disabled={isStartingTrip}
                          className="dd-action-btn dd-action-btn--primary"
                        >
                          ▶ {isStartingTrip ? "STARTING..." : "START MORNING SHIFT"}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handlePauseTrip}
                            disabled={isPausingTrip}
                            className="dd-action-btn dd-action-btn--outline"
                          >
                            {activeTrip?.status === "PAUSED" ? "▶ RESUME" : "⏸ PAUSE"}
                          </button>
                          <button
                            onClick={handleNextStop}
                            className="dd-action-btn dd-action-btn--primary"
                          >
                            ⏭ NEXT STOP
                          </button>
                          <button
                            onClick={handleEndTrip}
                            disabled={isCompletingTrip}
                            className="dd-action-btn dd-action-btn--dark"
                          >
                            ✓ COMPLETE
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. FOUR KPI METRIC CARDS */}
                <div className="dd-kpi-grid">
                  <div className="dd-kpi-card" onClick={() => setActiveNav("boarding")}>
                    <div className="dd-kpi-top">
                      <span className="dd-kpi-label">Boarded Passengers</span>
                      <div className="dd-kpi-icon dd-kpi-icon--blue">
                        <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={20} stroke="#0066ff" />
                      </div>
                    </div>
                    <div className="dd-kpi-main">
                      <h3 className="dd-kpi-val">{effectiveBoardedCount} / {effectiveStudents.length}</h3>
                      <div className="dd-kpi-progress-bar">
                        <div className="dd-kpi-progress-fill" style={{ width: `${Math.round((effectiveBoardedCount / effectiveStudents.length) * 100)}%` }} />
                      </div>
                      <p className="dd-kpi-sub">{effectiveStudents.length - effectiveBoardedCount} commuters remaining on Route</p>
                    </div>
                  </div>

                  <div className="dd-kpi-card" onClick={() => setActiveNav("route")}>
                    <div className="dd-kpi-top">
                      <span className="dd-kpi-label">Approaching Stop</span>
                      <div className="dd-kpi-icon dd-kpi-icon--blue">
                        <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={20} stroke="#0066ff" />
                      </div>
                    </div>
                    <div className="dd-kpi-main">
                      <h3 className="dd-kpi-val" style={{ fontSize: 17 }}>{currentApproachingStop.name}</h3>
                      <p className="dd-kpi-sub">Stop #{currentStopIndex + 1} of {routeStops.length} · ETA 07:58 AM (2 min)</p>
                    </div>
                  </div>

                  <div className="dd-kpi-card" onClick={() => setActiveNav("trip_mgmt")}>
                    <div className="dd-kpi-top">
                      <span className="dd-kpi-label">Corridor Speed</span>
                      <div className="dd-kpi-icon dd-kpi-icon--blue">
                        <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={20} stroke="#0066ff" />
                      </div>
                    </div>
                    <div className="dd-kpi-main">
                      <h3 className="dd-kpi-val">{activeTrip?.speed || "42 km/h"}</h3>
                      <p className="dd-kpi-sub">Limit 50 km/h · 3s telemetry active</p>
                    </div>
                  </div>

                  <div className="dd-kpi-card" onClick={() => setActiveNav("mybus")}>
                    <div className="dd-kpi-top">
                      <span className="dd-kpi-label">Bus Pre-Trip Check</span>
                      <div className="dd-kpi-icon dd-kpi-icon--green">
                        <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={20} stroke="#16a34a" />
                      </div>
                    </div>
                    <div className="dd-kpi-main">
                      <h3 className="dd-kpi-val" style={{ color: "#16a34a" }}>✓ Passed</h3>
                      <p className="dd-kpi-sub">6/6 vitals verified · Fuel 78% · OK</p>
                    </div>
                  </div>
                </div>

                {/* 3. REFINED QUICK ACTION CARDS (Clean SaaS Design) */}
                <div className="dd-quick-grid">
                  <div
                    className="dd-quick-item"
                    onClick={() => {
                      setScanResult(null);
                      setScannerMode("camera");
                      setShowScannerModal(true);
                    }}
                  >
                    <div className="dd-quick-icon-wrap dd-quick-icon-wrap--blue">
                      <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={22} stroke="#0066ff" />
                    </div>
                    <div className="dd-quick-content">
                      <h4 className="dd-quick-title">Scan Passenger QR Pass</h4>
                      <p className="dd-quick-sub">Live camera validator & sub-2s HMAC check</p>
                    </div>
                    <span className="dd-quick-arrow">→</span>
                  </div>

                  <div
                    className="dd-quick-item"
                    onClick={() => setShowDelayModal(true)}
                  >
                    <div className="dd-quick-icon-wrap dd-quick-icon-wrap--amber">
                      <Icon d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 8a3 3 0 0 1 0 6M11 5.882A3 3 0 0 0 9 3H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a3 3 0 0 0 2-2.882" size={22} stroke="#d97706" />
                    </div>
                    <div className="dd-quick-content">
                      <h4 className="dd-quick-title">Broadcast Delay Notice</h4>
                      <p className="dd-quick-sub">Push 5, 10, or 15m alert to route commuters</p>
                    </div>
                    <span className="dd-quick-arrow">→</span>
                  </div>

                  <div
                    className="dd-quick-item dd-quick-item--sos"
                    onClick={handleDriverSos}
                  >
                    <div className="dd-quick-icon-wrap dd-quick-icon-wrap--red">
                      <Icon d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={22} stroke="#dc2626" />
                    </div>
                    <div className="dd-quick-content">
                      <h4 className="dd-quick-title" style={{ color: "#dc2626" }}>
                        {isSosLoading ? "Transmitting..." : "Driver Emergency SOS"}
                      </h4>
                      <p className="dd-quick-sub">Instant priority dispatch to security & admin</p>
                    </div>
                    <span className="dd-quick-arrow" style={{ color: "#dc2626" }}>→</span>
                  </div>
                </div>

                {/* 4. TWO-COLUMN OPERATIONS CORE */}
                <div className="dd-operational-split">
                  {/* Left Column: Live Route Stop Progression */}
                  <div className="dd-card dd-timeline-card">
                    <div className="dd-card-header">
                      <div>
                        <h3 className="dd-card-title">Live Route Progression & Timetable</h3>
                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Route {driverRouteId} · Stop by stop commuter schedule & status</p>
                      </div>
                      <span className="ad-badge ad-badge--blue">
                        Current: Stop #{currentStopIndex + 1} of {routeStops.length}
                      </span>
                    </div>

                    <div className="dd-stops-timeline">
                      {routeStops.map((stop, i) => {
                        const isCompleted = i < currentStopIndex;
                        const isCurrent = i === currentStopIndex;

                        return (
                          <div
                            key={stop.index}
                            className={`dd-timeline-item ${isCurrent ? "dd-timeline-item--current" : ""} ${isCompleted ? "dd-timeline-item--completed" : ""}`}
                          >
                            <div className="dd-timeline-indicator">
                              <div className={`dd-timeline-dot ${isCurrent ? "dd-timeline-dot--current" : isCompleted ? "dd-timeline-dot--done" : "dd-timeline-dot--pending"}`}>
                                {isCompleted ? "✓" : i + 1}
                              </div>
                              {i < routeStops.length - 1 && (
                                <div className={`dd-timeline-connector ${isCompleted ? "dd-timeline-connector--done" : ""}`} />
                              )}
                            </div>

                            <div className="dd-timeline-body">
                              <div className="dd-timeline-main-row">
                                <div className="dd-timeline-title-wrap">
                                  <h4 className="dd-timeline-stop-name">{stop.name}</h4>
                                  <span className={`ad-badge ${isCompleted ? "ad-badge--green" : isCurrent ? "ad-badge--blue" : "ad-badge--gray"}`}>
                                    {isCompleted ? "Departed" : isCurrent ? "Approaching (2 min)" : "Upcoming"}
                                  </span>
                                </div>
                                <span className="dd-timeline-time">{stop.scheduled}</span>
                              </div>

                              <div className="dd-timeline-sub-row">
                                <span className="dd-timeline-detail">
                                  {isCompleted ? `Departed at ${stop.actual}` : isCurrent ? `Live ETA: ${stop.actual}` : `Estimated: ${stop.actual}`}
                                </span>
                                <span className="dd-timeline-students">
                                  👥 {stop.students} Students Scheduled
                                </span>
                              </div>

                              {isCurrent && activeTrip?.status === "ON_ROUTE" && (
                                <div className="dd-timeline-arrival-box">
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span className="dd-pulse-dot" />
                                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0066ff" }}>
                                      Approaching Nizampura Char Rasta · Ready to board students
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleNextStop}
                                    className="dd-confirm-arrival-btn"
                                  >
                                    Confirm Arrival & Advance Stop ⏭
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Passengers at Next Stop & Vehicle Telematics */}
                  <div className="dd-side-stack">
                    {/* Next Stop Passengers Manifest */}
                    <div className="dd-card">
                      <div className="dd-card-header">
                        <div>
                          <h3 className="dd-card-title">Next Stop Commuters</h3>
                          <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{currentApproachingStop.name} pickup list</p>
                        </div>
                        <button
                          className="ad-badge ad-badge--blue"
                          style={{ cursor: "pointer", border: "none" }}
                          onClick={() => setActiveNav("boarding")}
                        >
                          View All ({effectiveStudents.length})
                        </button>
                      </div>

                      <div className="dd-commuter-list">
                        {nextStopStudents.map((st) => (
                          <div key={st.id} className="dd-commuter-row">
                            <div className="dd-commuter-avatar">
                              {st.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div className="dd-commuter-info">
                              <h5 className="dd-commuter-name">{st.name}</h5>
                              <p className="dd-commuter-id">{st.id} · Route {driverRouteId}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleStudentBoarded(st.id)}
                              className={`dd-board-btn ${st.boardedToday ? "dd-board-btn--boarded" : "dd-board-btn--pending"}`}
                            >
                              {st.boardedToday ? "✓ Boarded" : "Check In"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vehicle Telematics Diagnostics */}
                    <div className="dd-card">
                      <div className="dd-card-header">
                        <div>
                          <h3 className="dd-card-title">Vehicle Diagnostics</h3>
                          <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Bus {currentDriver?.assignedBus || "BUS-104"} Telemetry</p>
                        </div>
                        <span className="ad-badge ad-badge--green">All Systems OK</span>
                      </div>

                      <div className="dd-diagnostics-grid">
                        <div className="dd-diagnostic-item">
                          <div className="dd-diag-top">
                            <span className="dd-diag-label">Fuel Level</span>
                            <span className="dd-diag-val" style={{ color: "#16a34a" }}>78%</span>
                          </div>
                          <div className="dd-diag-bar">
                            <div className="dd-diag-fill" style={{ width: "78%", background: "#16a34a" }} />
                          </div>
                        </div>

                        <div className="dd-diagnostic-item">
                          <div className="dd-diag-top">
                            <span className="dd-diag-label">Engine Temp</span>
                            <span className="dd-diag-val">88°C</span>
                          </div>
                          <div className="dd-diag-bar">
                            <div className="dd-diag-fill" style={{ width: "45%", background: "#0066ff" }} />
                          </div>
                        </div>

                        <div className="dd-diagnostic-item">
                          <div className="dd-diag-top">
                            <span className="dd-diag-label">Tire Pressure</span>
                            <span className="dd-diag-val">34 PSI</span>
                          </div>
                          <div className="dd-diag-bar">
                            <div className="dd-diag-fill" style={{ width: "85%", background: "#0066ff" }} />
                          </div>
                        </div>

                        <div className="dd-diagnostic-item">
                          <div className="dd-diag-top">
                            <span className="dd-diag-label">GPS Latency</span>
                            <span className="dd-diag-val">42 ms</span>
                          </div>
                          <div className="dd-diag-bar">
                            <div className="dd-diag-fill" style={{ width: "95%", background: "#16a34a" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. TRIP MANAGEMENT VIEW ───────────────────────────── */}
            {activeNav === "trip_mgmt" && (
              <div className="dd-view-container">
                <div className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h2 className="dd-card-title">Live Trip Execution & Checkpoints</h2>
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>Route {driverRouteId} · Bus {currentDriver.assignedBus} · Current status: <strong>{activeTrip.status}</strong></p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="dd-btn-secondary" onClick={() => setShowDelayModal(true)}>
                        Report Delay
                      </button>
                      {activeTrip.status === "ON_ROUTE" && (
                        <button className="dd-btn-primary" onClick={handleNextStop}>
                          Arrived at Next Stop (Stop #{activeTrip.currentStopIndex + 1})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Route Checkpoints Progress */}
                  <div className="dd-checkpoints-list">
                    {routeStops.map((stop, i) => {
                      const isCompleted = i < activeTrip.currentStopIndex;
                      const isCurrent = i === activeTrip.currentStopIndex;
                      return (
                        <div key={stop.index} className={`dd-checkpoint-row ${isCurrent ? "dd-checkpoint-row--current" : ""}`}>
                          <div className="dd-checkpoint-dot-wrap">
                            <div className={`dd-checkpoint-dot ${isCompleted ? "dd-checkpoint-dot--done" : isCurrent ? "dd-checkpoint-dot--active" : ""}`} />
                            {i < routeStops.length - 1 && (
                              <div className={`dd-checkpoint-line ${isCompleted ? "dd-checkpoint-line--done" : ""}`} />
                            )}
                          </div>
                          <div className="dd-checkpoint-details">
                            <div className="dd-checkpoint-title-row">
                              <h4 className="dd-checkpoint-name">{stop.name}</h4>
                              <span className={`ad-badge ${isCompleted ? "ad-badge--green" : isCurrent ? "ad-badge--blue" : "ad-badge--gray"}`}>
                                {isCompleted ? "Departed" : isCurrent ? "Current Stop" : "Scheduled"}
                              </span>
                            </div>
                            <p className="dd-checkpoint-meta">
                              Scheduled: <strong>{stop.scheduled}</strong> · Status: {stop.actual} · Expected Boardings: <strong>{stop.students} Students</strong>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trip History & Schedules */}
                <div className="dd-card">
                  <div className="dd-card-header">
                    <h2 className="dd-card-title">Today's Shift Itinerary & Logs</h2>
                    <span className="ad-badge ad-badge--blue">Shift: Morning & Evening · Bus {currentDriver.assignedBus}</span>
                  </div>

                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th className="ad-th">Trip Session</th>
                          <th className="ad-th">Route</th>
                          <th className="ad-th">Origin → Destination</th>
                          <th className="ad-th">Scheduled Window</th>
                          <th className="ad-th">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="ad-tr">
                          <td className="ad-td"><strong>Trip #1 (Morning Drop)</strong></td>
                          <td className="ad-td">R-04 Fatehgunj</td>
                          <td className="ad-td">Fatehgunj Stop → GSFC University Campus</td>
                          <td className="ad-td">07:30 AM - 08:20 AM</td>
                          <td className="ad-td">
                            <span className="ad-badge ad-badge--green">● {activeTrip.status}</span>
                          </td>
                        </tr>
                        <tr className="ad-tr">
                          <td className="ad-td"><strong>Trip #2 (Evening Return)</strong></td>
                          <td className="ad-td">R-04 Fatehgunj</td>
                          <td className="ad-td">GSFC University Campus → Fatehgunj Stop</td>
                          <td className="ad-td">05:00 PM - 05:50 PM</td>
                          <td className="ad-td">
                            <span className="ad-badge ad-badge--gray">⏳ Scheduled</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. STUDENT BOARDING ────────────────────────────────── */}
            {activeNav === "boarding" && (
              <div className="dd-card">
                <div className="dd-card-header">
                  <div>
                    <h2 className="dd-card-title">Allocated Route Passenger Roster</h2>
                    <p style={{ fontSize: 12.5, color: "#64748b" }}>
                      Bus: <strong>{currentDriver.assignedBus}</strong> &nbsp;·&nbsp; Route: <strong>{driverRouteId} ({currentDriver.routeName || "Fatehgunj - GSFC"})</strong> &nbsp;·&nbsp; {boardedCount} of {assignedBusStudents.length} passengers boarded
                    </p>
                  </div>
                  <button className="dd-btn-primary" onClick={() => setShowScannerModal(true)}>
                    + Verify Passenger
                  </button>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th className="ad-th">Student Name</th>
                        <th className="ad-th">Enrollment ID</th>
                        <th className="ad-th">Assigned Stop</th>
                        <th className="ad-th">Pickup Time</th>
                        <th className="ad-th">Pass Status</th>
                        <th className="ad-th">Boarding Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedBusStudents.map((s) => (
                        <tr key={s.id} className="ad-tr">
                          <td className="ad-td"><strong>{s.name}</strong></td>
                          <td className="ad-td">{s.id}</td>
                          <td className="ad-td">{s.pickupStop || s.boarding || "Fatehgunj Stop"}</td>
                          <td className="ad-td">{s.pickupTime || "07:45 AM"}</td>
                          <td className="ad-td">
                            <span className={`ad-badge ${(s.pass || s.passStatus || "").toUpperCase() === "ACTIVE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                              {(s.pass || s.passStatus || "Active").toUpperCase() === "ACTIVE" ? "● Active Pass" : "● Pending"}
                            </span>
                          </td>
                          <td className="ad-td">
                            {s.boardedToday ? (
                              <span style={{ fontSize: 12.5, color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                ✓ Boarded
                              </span>
                            ) : (
                              <button
                                className="dd-board-btn"
                                onClick={() => boardStudent(s.id)}
                              >
                                Mark Boarded
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── 4. BUS & INSPECTION (DRIVER'S ASSIGNED BUS ONLY) ───── */}
            {activeNav === "mybus" && (
              <div className="dd-view-container">
                {/* Vehicle Master Specs Card */}
                <div className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h2 className="dd-card-title">Assigned Vehicle Specifications</h2>
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>Exclusive vehicle profile assigned to {currentDriver.name}</p>
                    </div>
                    <span className="ad-badge ad-badge--blue">Vehicle Status: Active On Route</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Bus Identifier</p>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0066ff", marginTop: 4 }}>{currentDriver.assignedBus || "BUS-104"}</h3>
                      <span style={{ fontSize: 12, color: "#334155" }}>Volvo B11R AC Luxury Coach</span>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Registration Plate</p>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{currentDriver.busReg || "GJ-06-AB-1004"}</h3>
                      <span style={{ fontSize: 12, color: "#16a34a" }}>✓ Fitness Valid (Aug 2027)</span>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Assigned Route</p>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{currentDriver.assignedRoute || "R-04"}</h3>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{currentDriver.routeName || "GSFC University ↔ Fatehgunj"}</span>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Allocated Capacity</p>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{assignedBusStudents.length} / 52 Seats</h3>
                      <span style={{ fontSize: 12, color: "#16a34a" }}>Optimal Load (73%)</span>
                    </div>
                  </div>
                </div>

                {/* Pre-Trip Inspection Card */}
                <div className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h2 className="dd-card-title">Pre-Trip Safety & Equipment Inspection</h2>
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>Mandatory pre-departure safety vitals for {currentDriver.assignedBus}</p>
                    </div>
                    <span className="ad-badge ad-badge--green">✓ 6/6 Vitals Verified</span>
                  </div>

                  <div className="dd-inspection-grid">
                    {Object.entries(inspection).map(([key, val]) => (
                      <div key={key} className="dd-inspection-item">
                        <input
                          type="checkbox"
                          id={key}
                          checked={val}
                          onChange={(e) => setInspection({ ...inspection, [key]: e.target.checked })}
                          className="dd-check"
                        />
                        <label htmlFor={key} className="dd-check-label">
                          {key.replace(/([A-Z])/g, " $1").toUpperCase()} Check Passed
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. ROUTE & LIVE GPS MAP ────────────────────────────── */}
            {activeNav === "route" && (
              <div className="dd-view-container">
                {broadcastFeedback && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>📡</span> {broadcastFeedback}
                  </div>
                )}

                {/* Live GPS Broadcasting Terminal Card */}
                <div className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h2 className="dd-card-title">📡 Real-Time GPS Broadcaster Terminal</h2>
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>
                        Live telemetry broadcast is active and shared in real-time with <strong>Students</strong> and <strong>Admins</strong>.
                      </p>
                    </div>
                    <span className="ad-badge ad-badge--green">
                      ● {isDeviceGpsActive ? "📱 Device GPS Active" : "📡 High-Precision GPS Feed"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}>
                    <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11.5, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Broadcasting Coordinates</span>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 4, fontFamily: "monospace" }}>
                        Lat {((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.lat) || activeTrip.coordinates?.lat || 23.0982)}° N, Long {((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.lng) || activeTrip.coordinates?.lng || 72.5784)}° E
                      </h4>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11.5, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Telemetry Speed</span>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0066ff", marginTop: 4 }}>
                        {((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.speed) || activeTrip.currentSpeed || 42)} km/h (Optimal)
                      </h4>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11.5, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Shared Visibility</span>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>
                        ✓ Visible to Students & Admins
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="dd-btn-primary" onClick={handleManualBroadcast}>
                      📡 Broadcast GPS Telemetry Now
                    </button>
                    <button
                      className="dd-btn-secondary"
                      onClick={handleToggleDeviceGps}
                      style={{ background: isDeviceGpsActive ? "#eff6ff" : undefined, borderColor: isDeviceGpsActive ? "#0066ff" : undefined, color: isDeviceGpsActive ? "#0066ff" : undefined }}
                    >
                      {isDeviceGpsActive ? "✓ Using Phone Device GPS" : "📱 Switch to Phone Device GPS"}
                    </button>
                  </div>
                </div>

                {/* Visual Route Navigation Map */}
                <div className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h2 className="dd-card-title">Live Navigation & Corridor Map</h2>
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>Route R-04: Fatehgunj ➔ GSFC University Campus (Distance: 14.5 km)</p>
                    </div>
                    <span className="ad-badge ad-badge--blue">GPS Lock: 100% Signal (3m Accuracy)</span>
                  </div>

                  {/* Visual Route SVG Map */}
                  <div className="dd-map-wrap">
                    <svg viewBox="0 0 680 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", display: "block" }}>
                      <rect width="680" height="280" fill="#f8fafc" />

                      {/* City Blocks */}
                      {[
                        [20, 20, 110, 80], [150, 20, 160, 80], [330, 20, 160, 80], [510, 20, 150, 80],
                        [20, 120, 110, 70], [150, 120, 160, 70], [330, 120, 160, 70], [510, 120, 150, 70],
                        [20, 210, 110, 60], [150, 210, 160, 60], [330, 210, 160, 60], [510, 210, 150, 60],
                      ].map(([x, y, w, h], i) => (
                        <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                      ))}

                      {/* Road Network */}
                      <line x1="0" y1="110" x2="680" y2="110" stroke="#f1f5f9" strokeWidth="14" />
                      <line x1="0" y1="200" x2="680" y2="200" stroke="#f1f5f9" strokeWidth="14" />
                      <line x1="140" y1="0" x2="140" y2="280" stroke="#f1f5f9" strokeWidth="14" />
                      <line x1="320" y1="0" x2="320" y2="280" stroke="#f1f5f9" strokeWidth="14" />
                      <line x1="500" y1="0" x2="500" y2="280" stroke="#f1f5f9" strokeWidth="14" />

                      {/* Active Route Polyline */}
                      <polyline
                        points="60,240 140,190 260,160 380,130 480,90 600,60"
                        fill="none"
                        stroke="#0066ff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Marked Stops */}
                      {[
                        { x: 60, y: 240, name: "Fatehgunj Stop" },
                        { x: 140, y: 190, name: "Nizampura Char Rasta" },
                        { x: 260, y: 160, name: "Chhani Jakat Naka (Next)" },
                        { x: 380, y: 130, name: "Bajwa Crossing" },
                        { x: 480, y: 90, name: "Fertilizernagar Gate" },
                        { x: 600, y: 60, name: "GSFC University" },
                      ].map((stop, idx) => (
                        <g key={idx}>
                          <circle
                            cx={stop.x}
                            cy={stop.y}
                            r={idx === 2 ? 8 : 6}
                            fill={idx === 2 ? "#0066ff" : idx < 2 ? "#0f172a" : "#ffffff"}
                            stroke={idx === 2 ? "#ffffff" : idx < 2 ? "#ffffff" : "#0066ff"}
                            strokeWidth="2.5"
                          />
                          <text
                            x={stop.x}
                            y={stop.y + (idx % 2 === 0 ? 18 : -12)}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight={idx === 2 ? "800" : "600"}
                            fill={idx === 2 ? "#0066ff" : "#0f172a"}
                          >
                            {stop.name}
                          </text>
                        </g>
                      ))}

                      {/* Moving Driver Bus Marker */}
                      <g transform={`translate(${70 + (((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.progressPercent) || 46) / 100) * 500}, ${260 - (((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.progressPercent) || 46) / 100) * 190})`}>
                        <circle r="20" fill="#0066ff" opacity="0.25" className="lt-pulse-circle" />
                        <circle r="14" fill="#0066ff" stroke="#ffffff" strokeWidth="2.5" />
                        <text textAnchor="middle" y="5" fontSize="12">🚌</text>
                      </g>
                    </svg>

                    {/* HUD Telemetry Chips */}
                    <div className="dd-map-telemetry-hud">
                      <span className="dd-hud-pill">
                        Lat: {((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.lat) || 23.0982)}° N, Long: {((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.lng) || 72.5784)}° E
                      </span>
                      <span className="dd-hud-pill dd-hud-pill--blue">
                        Speed: {((liveBusTelemetry && liveBusTelemetry[currentDriver.assignedBus]?.speed) || 42)} km/h · Heading: North-East
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5.5 DRIVER PROFILE ───────────────────────────────── */}
            {activeNav === "profile" && (
              <div className="ap-container" style={{ width: "100%", padding: 0 }}>
                {driverSavedSuccess && (
                  <div className="ap-alert-success">
                    <span>✓</span> Driver profile details updated successfully!
                  </div>
                )}

                {/* Hero Card */}
                <div className="ap-hero-card">
                  <div className="ap-hero-left">
                    <div className="ap-avatar-wrap">
                      <div className="ap-avatar-circle" style={{ background: "linear-gradient(135deg, #0066ff 0%, #0047b3 100%)" }}>
                        <span>{currentDriver.avatar}</span>
                      </div>
                      <span className="ap-avatar-badge">★ 4.8 Rating</span>
                    </div>

                    <div className="ap-hero-info">
                      <div className="ap-hero-name-row">
                        <h2 className="ap-hero-name">{driverFormData.name}</h2>
                        <span className="ap-verified-tag" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a" }}>● Active On Duty</span>
                      </div>
                      <p className="ap-hero-role">Senior Transit Pilot · {currentDriver.assignedBus} ({currentDriver.busReg})</p>
                      <p className="ap-hero-id">Driver ID: <strong>{currentDriver.id}</strong></p>
                      <p className="ap-hero-email">{driverFormData.email}</p>
                    </div>
                  </div>

                  <button
                    className="ap-edit-btn"
                    onClick={() => setShowDriverEditModal(true)}
                  >
                    <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={16} />
                    Edit Profile
                  </button>
                </div>

                {/* Grid Two */}
                <div className="ap-grid-two">
                  {/* Card 1: Official Driver & Vehicle Records */}
                  <div className="ap-card">
                    <div className="ap-card-header">
                      <div className="ap-card-icon">
                        <Icon d="M3 12h18M3 6h18M3 18h18" size={20} stroke="#0066ff" />
                      </div>
                      <div>
                        <h3 className="ap-card-title">Commercial License & Fleet Records</h3>
                        <p className="ap-card-sub">University transport compliance verification</p>
                      </div>
                    </div>

                    <div className="ap-info-list">
                      <div className="ap-info-item">
                        <span className="ap-info-label">Assigned Vehicle</span>
                        <span className="ap-info-val">{currentDriver.assignedBus} (Volvo B11R AC)</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Vehicle Registration</span>
                        <span className="ap-info-val">{currentDriver.busReg}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Commercial License No</span>
                        <span className="ap-info-val">{currentDriver.licenseNo}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">License Validity</span>
                        <span className="ap-info-val" style={{ color: "#16a34a" }}>Valid until {currentDriver.licenseExpiry}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Assigned Route</span>
                        <span className="ap-info-val">{currentDriver.assignedRoute} ({currentDriver.routeName})</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Total Experience</span>
                        <span className="ap-info-val">{currentDriver.experience} · 1,420+ Safe Trips</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Shift Hours</span>
                        <span className="ap-info-val">{currentDriver.shiftHours || "07:00 AM - 06:30 PM"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Contact & Medical Information */}
                  <div className="ap-card">
                    <div className="ap-card-header">
                      <div className="ap-card-icon">
                        <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" size={20} stroke="#0066ff" />
                      </div>
                      <div>
                        <h3 className="ap-card-title">Personal & Medical Details</h3>
                        <p className="ap-card-sub">Emergency communication and health profile</p>
                      </div>
                    </div>

                    <div className="ap-info-list">
                      <div className="ap-info-item">
                        <span className="ap-info-label">Full Name</span>
                        <span className="ap-info-val">{driverFormData.name}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Phone Number</span>
                        <span className="ap-info-val">{driverFormData.phone}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Email ID</span>
                        <span className="ap-info-val">{driverFormData.email}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Blood Group</span>
                        <span className="ap-info-val" style={{ color: "#dc2626" }}>● {driverFormData.bloodGroup}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Emergency Contact</span>
                        <span className="ap-info-val">{driverFormData.emergencyContact}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Residential Address</span>
                        <span className="ap-info-val">{driverFormData.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. REPORT PROBLEM ─────────────────────────────────── */}
            {activeNav === "report_problem" && (
              <div className="dd-card" style={{ maxWidth: 650 }}>
                <div className="dd-card-header">
                  <div>
                    <h2 className="dd-card-title">Report Vehicle / Route Issue</h2>
                    <p style={{ fontSize: 12.5, color: "#64748b" }}>Directly logs maintenance ticket with Transport Workshop</p>
                  </div>
                </div>

                {problemSubmitted ? (
                  <div style={{ padding: 20, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, color: "#166534", fontWeight: 700 }}>
                    ✓ Issue submitted successfully! Workshop team has been alerted.
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setProblemSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Issue Category</label>
                      <select value={problemCategory} onChange={(e) => setProblemCategory(e.target.value)} className="ad-input" style={{ marginTop: 4 }}>
                        <option>AC cooling malfunction</option>
                        <option>Brake / Suspension sound</option>
                        <option>Tire pressure low</option>
                        <option>GPS device connectivity</option>
                        <option>Electrical / Lighting defect</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Description / Location</label>
                      <textarea
                        rows={4}
                        className="ad-input"
                        placeholder="Explain the issue in detail..."
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                        required
                        style={{ marginTop: 4 }}
                      />
                    </div>

                    <button type="submit" className="ad-btn-primary" style={{ alignSelf: "flex-start" }}>
                      Submit Workshop Ticket
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── 7. EMERGENCY / SOS ────────────────────────────────── */}
            {activeNav === "emergency" && (
              <div className="dd-card" style={{ maxWidth: 600, border: "2px solid #fecaca" }}>
                <div className="dd-card-header">
                  <div>
                    <h2 className="dd-card-title" style={{ color: "#dc2626" }}>🚨 Emergency SOS Broadcast</h2>
                    <p style={{ fontSize: 12.5, color: "#64748b" }}>Instant high-priority dispatch to University Central Security & Admin</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ fontSize: 13.5, color: "#334155" }}>
                    Triggering this alarm will broadcast an active alert on the Super Admin and Transport dashboards with your exact GPS telemetry coordinates.
                  </p>

                  <button
                    onClick={handleDriverSos}
                    disabled={isSosLoading}
                    style={{
                      padding: "16px 20px",
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 16,
                      minHeight: 56,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.35)",
                    }}
                  >
                    🚨 {isSosLoading ? "TRANSMITTING SOS DISPATCH..." : "TRIGGER EMERGENCY SOS NOW"}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── SCANNER MODAL (Camera QR + Manual Student ID Fallback) ── */}
      {showScannerModal && (
        <div className="dd-modal-overlay" onClick={handleCloseScannerModal}>
          <div className="dd-modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="dd-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#0066ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  📷
                </div>
                <div>
                  <h3 className="dd-modal-title">Student Pass Verification</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Driver POS boarding checkpoint & HMAC validator</p>
                </div>
              </div>
              <button className="dd-modal-close" onClick={handleCloseScannerModal}>✕</button>
            </div>

            {/* Mode Switcher: Camera QR vs Manual ID */}
            <div className="dd-scanner-tabs">
              <button
                type="button"
                className={`dd-scanner-tab-btn ${scannerMode === "camera" ? "dd-scanner-tab-btn--active" : ""}`}
                onClick={() => setScannerMode("camera")}
              >
                📷 Camera QR Scanner
              </button>
              <button
                type="button"
                className={`dd-scanner-tab-btn ${scannerMode === "manual" ? "dd-scanner-tab-btn--active" : ""}`}
                onClick={() => setScannerMode("manual")}
              >
                ⌨️ Manual Student ID
              </button>
            </div>

            {/* Validation Result Alert & p95 latency check */}
            {scanResult && (
              <div
                className={`dd-modal-alert dd-modal-alert--${scanResult.type === "success" ? "success" : "warning"}`}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 18 }}>{scanResult.type === "success" ? "✓" : "⚠️"}</span>
                  <span style={{ fontWeight: 700, flex: 1 }}>{scanResult.message}</span>
                  <span className={`dd-latency-badge ${scanResult.p95TargetMet ? "dd-latency-badge--met" : "dd-latency-badge--missed"}`}>
                    ⚡ {scanResult.latencyMs}ms {scanResult.p95TargetMet ? "(p95 < 2s met)" : "(> 2s target missed)"}
                  </span>
                </div>
                {scanResult.student && (
                  <div style={{ fontSize: 12, color: "#475569", marginLeft: 26 }}>
                    Pass Status: <strong>{scanResult.status}</strong> · Route Match: <strong>{scanResult.student.routeMatch ? "Verified Corridor" : "Mismatch"}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Camera Viewfinder Mode */}
            {scannerMode === "camera" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div id="driver-qr-reader" style={{ width: "100%", minHeight: 250, background: "#0f172a", borderRadius: 12, position: "relative" }} />
                {cameraError ? (
                  <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12.5 }}>
                    {cameraError}
                    <button
                      type="button"
                      onClick={() => setScannerMode("manual")}
                      style={{ display: "block", marginTop: 6, background: "none", border: "none", color: "#0066ff", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                    >
                      Switch to Manual Student ID Entry
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", margin: "4px 0 0" }}>
                    Point camera at passenger QR pass to automatically verify HMAC and board.
                  </p>
                )}

                {/* Quick Simulation Button for Demo / Testing */}
                <button
                  type="button"
                  onClick={() => handleValidatePass({ qrPayload: "PASS-UNI20260125|R-04|ZONE-B|SIG_VALID" })}
                  disabled={isValidating}
                  style={{
                    padding: "10px 14px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  ⚡ Simulate Camera QR Scan (UNI20260125)
                </button>
              </div>
            )}

            {/* Manual ID Input Mode */}
            {scannerMode === "manual" && (
              <form onSubmit={handleManualScanSubmit} className="dd-modal-form">
                <div className="dd-form-group">
                  <label className="dd-form-label">Enter Enrollment ID or Student Roll No</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="ad-input"
                      placeholder="e.g. UNI20260125, STU-104"
                      value={manualIdInput}
                      onChange={(e) => setManualIdInput(e.target.value)}
                      autoFocus
                      required
                      style={{ paddingLeft: 42 }}
                    />
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none", fontSize: 15 }}>
                      🔍
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setManualIdInput("UNI20260125")}
                    style={{ fontSize: 11.5, padding: "4px 8px", background: "#eff6ff", color: "#0066ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer" }}
                  >
                    Use Sample ID: UNI20260125
                  </button>
                </div>

                <button type="submit" disabled={isValidating} className="dd-modal-submit-btn" style={{ minHeight: 48 }}>
                  <span>{isValidating ? "Verifying..." : "✓ Validate Student ID & Mark Boarded"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── DELAY MODAL ──────────────────────────────────────── */}
      {showDelayModal && (
        <div className="dd-modal-overlay" onClick={() => setShowDelayModal(false)}>
          <div className="dd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dd-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  ⏱️
                </div>
                <div>
                  <h3 className="dd-modal-title">Report Trip Delay</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Broadcast delay alerts to waiting passengers & ops</p>
                </div>
              </div>
              <button className="dd-modal-close" onClick={() => setShowDelayModal(false)}>✕</button>
            </div>

            <form onSubmit={handleDelaySubmit} className="dd-modal-form">
              <div className="dd-form-group">
                <label className="dd-form-label">Delay Duration (Minutes)</label>
                <select className="ad-input" value={delayMins} onChange={(e) => setDelayMins(e.target.value)}>
                  <option value={5}>+5 Minutes (Slight delay)</option>
                  <option value={10}>+10 Minutes (Moderate traffic)</option>
                  <option value={15}>+15 Minutes (Heavy congestion)</option>
                  <option value={20}>+20 Minutes (Detour / Roadblock)</option>
                  <option value={30}>+30 Minutes (Major traffic incident)</option>
                </select>
              </div>

              <div className="dd-form-group">
                <label className="dd-form-label">Reason for Delay</label>
                <input
                  type="text"
                  className="ad-input"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="e.g. Traffic congestion near Chhani Jakat Naka, road work"
                  required
                />
              </div>

              <button type="submit" className="dd-modal-submit-btn" style={{ background: "#d97706" }}>
                <span>Broadcast Delay Alert</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── DRIVER EDIT PROFILE POPUP WINDOW MODAL (NO SCROLLING) ─ */}
      {showDriverEditModal && (
        <div className="glow-modal-overlay" onClick={() => setShowDriverEditModal(false)}>
          <div className="glow-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="glow-modal-header">
              <div className="glow-modal-title-row">
                <div className="glow-modal-icon">
                  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={20} stroke="#0066ff" />
                </div>
                <div>
                  <h3 className="glow-modal-title">Edit Driver Profile</h3>
                  <p className="glow-modal-sub">Update contact and personal medical information</p>
                </div>
              </div>
              <button
                className="glow-modal-close"
                onClick={() => setShowDriverEditModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDriverSave}>
              <div className="glow-modal-body">
                <div className="glow-modal-grid">
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Full Name</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={driverFormData.name}
                      onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Phone Number</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={driverFormData.phone}
                      onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Email ID</label>
                    <input
                      type="email"
                      className="glow-modal-input"
                      value={driverFormData.email}
                      onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Blood Group</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={driverFormData.bloodGroup}
                      onChange={(e) => setDriverFormData({ ...driverFormData, bloodGroup: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field glow-modal-field--full">
                    <label className="glow-modal-label">Emergency Contact Phone</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={driverFormData.emergencyContact}
                      onChange={(e) => setDriverFormData({ ...driverFormData, emergencyContact: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field glow-modal-field--full">
                    <label className="glow-modal-label">Residential Address</label>
                    <textarea
                      rows={2}
                      className="glow-modal-textarea"
                      value={driverFormData.address}
                      onChange={(e) => setDriverFormData({ ...driverFormData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="glow-modal-footer">
                <button
                  type="button"
                  className="ap-cancel-btn"
                  onClick={() => setShowDriverEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboardView;
