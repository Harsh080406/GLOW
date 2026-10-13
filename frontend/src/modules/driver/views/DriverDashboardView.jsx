import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import GlowLogo from "../../../shared/assets/GlowLogo";
import { useTransit } from "../../../shared/context/TransitContext";
import { OFFICIAL_GSFC_ROUTES_2026 } from "../../../shared/data/officialRoutes2026";
import RealMapView from "../../../shared/components/RealMapView";
import "./DriverDashboard.css";
import "../../admin/layout/AdminLayout.css";
import "../../admin/views/AdminProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Driver Home (GPS & Scan)", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "boarding", label: "Passenger List", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "route", label: "Route Stops & Map", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
  { id: "emergency", label: "Emergency SOS", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
  { id: "profile", label: "Driver Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
];

const DRIVER_TAB_TITLES = {
  dashboard: {
    title: "Driver Dashboard",
    subtitle: "Route live GPS location & student pass scanner",
  },
  boarding: {
    title: "Passenger List",
    subtitle: "Check in students allocated to your bus",
  },
  route: {
    title: "Route Stops & Map",
    subtitle: "Scheduled stops and live map view",
  },
  emergency: {
    title: "Driver Emergency SOS",
    subtitle: "Direct alert dispatch to central university security",
  },
  profile: {
    title: "Driver Profile",
    subtitle: "Your credentials and contact details",
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
    triggerDriverSos,
    validatePass,
    broadcastDriverLocation,
    liveBusTelemetry,
  } = useTransit();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Real-time GPS Broadcasting state
  const [isDeviceGpsActive, setIsDeviceGpsActive] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState(null);
  const [showGpsPromptModal, setShowGpsPromptModal] = useState(false);
  const gpsWatchIdRef = useRef(null);

  // Driver Issue Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessageInput, setBroadcastMessageInput] = useState("");
  const [activeDriverNotice, setActiveDriverNotice] = useState(() => {
    return (typeof window !== "undefined" && localStorage.getItem("glow_driver_broadcast_notice")) || "";
  });

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

  const [boardingSearch, setBoardingSearch] = useState("");
  const [scanInput, setScanInput] = useState("");

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

  // Cleanup GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    };
  }, []);

  // Assigned Route and Vehicle Resolution
  const driverRouteId = currentDriver?.assignedRoute || currentDriver?.routeId || activeTrip?.routeId || "ROUTE-9";
  const driverAssignedBusId = currentDriver?.assignedBus || activeTrip?.busId || "GJ-06-BV-2915";
  const driverName = currentDriver?.name || "Mahesh Patel";

  const matchedOfficialRoute = OFFICIAL_GSFC_ROUTES_2026.find(
    (r) =>
      r.routeId === driverRouteId ||
      r.routeNumber === Number(String(driverRouteId).replace(/[^\d]/g, "")) ||
      r.busNo === driverAssignedBusId
  ) || OFFICIAL_GSFC_ROUTES_2026[8]; // Route 9 default

  const routeStops = matchedOfficialRoute.stops.map((s, idx) => ({
    index: idx,
    name: s.name,
    scheduled: s.time,
    lat: s.lat,
    lng: s.lng,
    isDestination: !!s.isDestination,
    actual: idx < 3 ? `${s.time} (Departed)` : idx === 3 ? "Approaching (2 min)" : `Estimated ${s.time}`,
    students: s.isDestination ? 0 : Math.floor(4 + ((idx * 3) % 5)),
    status: idx < 3 ? "departed" : idx === 3 ? "approaching" : s.isDestination ? "destination" : "upcoming",
  }));

  const defaultStudents = [
    { id: "UNI20260125", name: "Rahul Sharma", enrollmentId: "UNI20260125", pickupStop: "FATEHGUNG- BOB", stopName: "FATEHGUNG- BOB", pickupTime: "07:48 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260142", name: "Priya Patel", enrollmentId: "UNI20260142", pickupStop: "SARSWATI COMPLEX", stopName: "SARSWATI COMPLEX", pickupTime: "07:15 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260188", name: "Ananya Desai", enrollmentId: "UNI20260188", pickupStop: "TULSIDHAM", stopName: "TULSIDHAM", pickupTime: "07:25 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260210", name: "Siddharth Joshi", enrollmentId: "UNI20260210", pickupStop: "RAJ MAHEL GATE", stopName: "RAJ MAHEL GATE", pickupTime: "07:35 AM", boardedToday: false, passStatus: "ACTIVE" },
    { id: "UNI20260235", name: "Kavita Shah", enrollmentId: "UNI20260235", pickupStop: "YOGNIKETAN", stopName: "YOGNIKETAN", pickupTime: "07:58 AM", boardedToday: false, passStatus: "ACTIVE" },
    { id: "UNI20260280", name: "Rohan Dave", enrollmentId: "UNI20260280", pickupStop: "FATEHGUNG- BOB", stopName: "FATEHGUNG- BOB", pickupTime: "07:48 AM", boardedToday: true, passStatus: "ACTIVE" },
    { id: "UNI20260312", name: "Aarav Mehta", enrollmentId: "UNI20260312", pickupStop: "NIZAMPURA-TASTY VADAPAV", stopName: "NIZAMPURA-TASTY VADAPAV", pickupTime: "08:05 AM", boardedToday: false, passStatus: "ACTIVE" },
    { id: "UNI20260340", name: "Isha Nair", enrollmentId: "UNI20260340", pickupStop: "NIZAMPURA-TASTY VADAPAV", stopName: "NIZAMPURA-TASTY VADAPAV", pickupTime: "08:05 AM", boardedToday: true, passStatus: "ACTIVE" },
  ];

  const matchedStudents = (students && students.length > 0)
    ? students.filter((s) => s.busId === driverAssignedBusId || s.routeId === driverRouteId || s.route === driverRouteId)
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

  const displayedStudents = effectiveStudents.filter((s) => {
    if (!boardingSearch.trim()) return true;
    const term = boardingSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.id && s.id.toLowerCase().includes(term)) ||
      (s.pickupStop && s.pickupStop.toLowerCase().includes(term)) ||
      (s.stopName && s.stopName.toLowerCase().includes(term))
    );
  });

  // Haversine distance calculation in meters
  const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const currentStopIndex = typeof activeTrip?.currentStopIndex === "number" ? activeTrip.currentStopIndex : 0;
  const currentStopIndexRef = useRef(currentStopIndex);
  useEffect(() => {
    currentStopIndexRef.current = currentStopIndex;
  }, [currentStopIndex]);

  const currentApproachingStop = routeStops[currentStopIndex] || routeStops[0];

  // Quick Issue/Delay Presets for 1-Tap Driver Reporting
  const BROADCAST_PRESETS = [
    "⏱ Traffic Congestion: Delayed by 10-15 minutes",
    "⏱ Heavy Traffic Jam: Running ~20 mins late",
    "🚧 Road Diversion / Detour in progress",
    "🌧 Heavy Rain / Weather slowdown: Drive safe",
    "🔧 Vehicle Mechanical Check / Delayed 15 minutes",
    "⛽ Refueling Halt (5 minutes)",
  ];

  const handleSendBroadcastNotice = (customText) => {
    const text = (customText || broadcastMessageInput || "").trim();
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setActiveDriverNotice(text);
    if (typeof window !== "undefined") {
      localStorage.setItem("glow_driver_broadcast_notice", text);
      window.dispatchEvent(
        new CustomEvent("glow:telemetry_update", {
          detail: { broadcastMessage: text, broadcastTime: timeStr, busId: driverAssignedBusId },
        })
      );
    }
    if (broadcastDriverLocation) {
      broadcastDriverLocation({
        broadcastMessage: text,
        broadcastTime: timeStr,
        busId: driverAssignedBusId,
        routeId: driverRouteId,
      });
    }
    setShowBroadcastModal(false);
    setBroadcastMessageInput("");
    setBroadcastFeedback(`📢 Live issue notice broadcast to students: "${text}"`);
    setTimeout(() => setBroadcastFeedback(null), 5000);
  };

  const handleClearBroadcastNotice = () => {
    setActiveDriverNotice("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("glow_driver_broadcast_notice");
      window.dispatchEvent(
        new CustomEvent("glow:telemetry_update", {
          detail: { broadcastMessage: "", broadcastTime: "", busId: driverAssignedBusId },
        })
      );
    }
    if (broadcastDriverLocation) {
      broadcastDriverLocation({
        broadcastMessage: "",
        broadcastTime: "",
        busId: driverAssignedBusId,
        routeId: driverRouteId,
      });
    }
    setBroadcastFeedback("✓ Issue notice cleared.");
    setTimeout(() => setBroadcastFeedback(null), 3000);
  };

  // Automatic Stop Advancement along route corridor during active trip (GPS simulation & live progression)
  useEffect(() => {
    if (activeTrip?.status !== "ON_ROUTE") return;
    const corridorInterval = setInterval(() => {
      const curIdx = currentStopIndexRef.current;
      if (curIdx < routeStops.length - 1) {
        const nextIdx = curIdx + 1;
        currentStopIndexRef.current = nextIdx;
        const targetStop = routeStops[nextIdx];
        setActiveTrip((prev) => ({
          ...prev,
          currentStopIndex: nextIdx,
          coordinates: { lat: targetStop.lat, lng: targetStop.lng },
          currentSpeed: 38 + Math.floor(Math.random() * 8),
        }));
        if (broadcastDriverLocation) {
          broadcastDriverLocation({
            lat: targetStop.lat,
            lng: targetStop.lng,
            speed: 40,
            nextStopIndex: nextIdx,
            nextStop: targetStop.name,
            status: "ON_ROUTE",
            busId: driverAssignedBusId,
            routeId: driverRouteId,
          });
        }
        setBroadcastFeedback(`⚡ GPS Auto-Advance: Bus crossed stop. Approaching "${targetStop.name}".`);
        setTimeout(() => setBroadcastFeedback(null), 4000);
      }
    }, 45000);
    return () => clearInterval(corridorInterval);
  }, [activeTrip?.status, routeStops, driverAssignedBusId, driverRouteId, broadcastDriverLocation]);

  // Open GPS Prompt Modal to ask driver before starting route live location
  const handleOpenStartTripPrompt = () => {
    setShowGpsPromptModal(true);
  };

  // Toggle Device GPS (Phone / Browser Geolocation)
  const handleToggleDeviceGps = () => {
    if (activeTrip?.status !== "ON_ROUTE") {
      setShowGpsPromptModal(true);
      return;
    }

    if (isDeviceGpsActive) {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setIsDeviceGpsActive(false);
      if (broadcastDriverLocation) {
        broadcastDriverLocation({ isDeviceGps: false });
      }
      setBroadcastFeedback("Live Location GPS turned OFF.");
    } else {
      setShowGpsPromptModal(true);
    }
    setTimeout(() => setBroadcastFeedback(null), 4000);
  };

  // Start route trip with Driver GPS location confirmation
  const handleStartTripWithGps = async (enableDeviceGps) => {
    setIsStartingTrip(true);
    setShowGpsPromptModal(false);

    const initialStopIdx = 0;
    currentStopIndexRef.current = initialStopIdx;

    let coords = {
      lat: routeStops[0]?.lat || 22.3245,
      lng: routeStops[0]?.lng || 73.1880,
      speed: 40,
      accuracy: 10,
    };
    let isGpsSuccess = false;

    if (enableDeviceGps) {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser. Starting trip with high-precision route telemetry.");
      } else {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          });
          coords = {
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
            speed: pos.coords.speed != null && !isNaN(pos.coords.speed) ? Math.round(pos.coords.speed * 3.6) : 38,
            accuracy: Math.round(pos.coords.accuracy || 3),
          };
          isGpsSuccess = true;
          setIsDeviceGpsActive(true);

          if (gpsWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(gpsWatchIdRef.current);
          }

          gpsWatchIdRef.current = navigator.geolocation.watchPosition(
            (watchPos) => {
              const wLat = parseFloat(watchPos.coords.latitude.toFixed(6));
              const wLng = parseFloat(watchPos.coords.longitude.toFixed(6));
              const wSpeed = watchPos.coords.speed != null && !isNaN(watchPos.coords.speed)
                ? Math.round(watchPos.coords.speed * 3.6)
                : 40;

              // Automatic stop-crossing detection via GPS proximity (within 250m)
              const curIdx = currentStopIndexRef.current;
              let nextIdx = curIdx;
              const targetStop = routeStops[curIdx];
              if (targetStop && curIdx < routeStops.length - 1) {
                const dist = calculateDistanceInMeters(wLat, wLng, targetStop.lat, targetStop.lng);
                if (dist <= 250) {
                  nextIdx = curIdx + 1;
                  currentStopIndexRef.current = nextIdx;
                  setActiveTrip((prev) => ({
                    ...prev,
                    currentStopIndex: nextIdx,
                    coordinates: { lat: wLat, lng: wLng },
                    currentSpeed: wSpeed,
                  }));
                  setBroadcastFeedback(`⚡ GPS Auto-Advance: Crossed "${targetStop.name}". Next stop: "${routeStops[nextIdx]?.name}".`);
                  setTimeout(() => setBroadcastFeedback(null), 5000);
                }
              }

              if (broadcastDriverLocation) {
                broadcastDriverLocation({
                  lat: wLat,
                  lng: wLng,
                  speed: wSpeed,
                  accuracy: Math.round(watchPos.coords.accuracy || 3),
                  isDeviceGps: true,
                  status: "ON_ROUTE",
                  busId: driverAssignedBusId,
                  routeId: driverRouteId,
                  driverName: driverName,
                  driverPhone: currentDriver?.phone || "+91 98765 11111",
                  nextStopIndex: nextIdx,
                  nextStop: routeStops[nextIdx]?.name,
                });
              }
            },
            (watchErr) => {
              console.warn("GPS live watch warning:", watchErr?.message);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 2000,
              timeout: 10000,
            }
          );
        } catch (geoErr) {
          console.warn("Could not acquire device GPS:", geoErr);
          alert(`GPS Notice: ${geoErr.message || "Permission not granted"}. Starting trip with scheduled route telemetry.`);
          setIsDeviceGpsActive(false);
        }
      }
    } else {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setIsDeviceGpsActive(false);
    }

    try {
      if (startTrip) {
        await startTrip();
      }

      setActiveTrip((prev) => ({
        ...prev,
        status: "ON_ROUTE",
        isActive: true,
        currentStopIndex: initialStopIdx,
        coordinates: { lat: coords.lat, lng: coords.lng },
        currentSpeed: coords.speed,
      }));

      if (broadcastDriverLocation) {
        await broadcastDriverLocation({
          lat: coords.lat,
          lng: coords.lng,
          speed: coords.speed,
          accuracy: coords.accuracy,
          isDeviceGps: isGpsSuccess,
          status: "ON_ROUTE",
          busId: driverAssignedBusId,
          routeId: driverRouteId,
          driverName: driverName,
          driverPhone: currentDriver?.phone || "+91 98765 11111",
          nextStopIndex: initialStopIdx,
          nextStop: routeStops[initialStopIdx]?.name,
        });
      }

      setBroadcastFeedback(
        isGpsSuccess
          ? "✓ Trip Started! Live GPS is ON (Stop points will advance automatically as you cross them)."
          : "✓ Trip Started! (Running on scheduled timings with auto-advancing stops)."
      );
    } catch (err) {
      console.error("Start trip error:", err);
      setActiveTrip((prev) => ({ ...prev, status: "ON_ROUTE", isActive: true, currentStopIndex: initialStopIdx }));
    } finally {
      setIsStartingTrip(false);
      setTimeout(() => setBroadcastFeedback(null), 5000);
    }
  };

  const handlePauseTrip = async () => {
    setIsPausingTrip(true);
    const tripId = activeTrip?.id || activeTrip?._id || activeTrip?.tripId;
    try {
      if (pauseTrip) {
        await pauseTrip(tripId);
      }
      const nextStatus = activeTrip?.status === "PAUSED" ? "ON_ROUTE" : "PAUSED";
      setActiveTrip((prev) => ({ ...prev, status: nextStatus }));

      if (broadcastDriverLocation) {
        broadcastDriverLocation({ status: nextStatus });
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
    if (!window.confirm("Complete this trip? This resets bus occupancy and marks route complete.")) {
      return;
    }
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    setIsDeviceGpsActive(false);
    setIsCompletingTrip(true);
    const tripId = activeTrip?.id || activeTrip?._id || activeTrip?.tripId;
    try {
      if (completeTrip) {
        await completeTrip(tripId);
      }
      setActiveTrip((prev) => ({ ...prev, status: "COMPLETED", isActive: false, currentStopIndex: 0 }));
      if (broadcastDriverLocation) {
        broadcastDriverLocation({ status: "COMPLETED", isDeviceGps: false });
      }
      setBroadcastFeedback("✓ Route Completed & Live Location Ended.");
    } catch (err) {
      console.error("Complete trip error:", err);
    } finally {
      setIsCompletingTrip(false);
      setTimeout(() => setBroadcastFeedback(null), 4000);
    }
  };

  // Driver SOS Emergency Handler
  const handleDriverSos = async () => {
    if (!window.confirm("🚨 Trigger DRIVER SOS EMERGENCY? This alerts University Security with your exact location.")) {
      return;
    }
    setIsSosLoading(true);
    let coords = { lat: 22.3245, lng: 73.1880 };

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
        console.warn("GPS timeout:", err);
      }
    }

    try {
      if (triggerDriverSos) {
        await triggerDriverSos({
          lat: coords.lat,
          lng: coords.lng,
          busId: driverAssignedBusId,
          notes: "Driver Cockpit Emergency Alert",
        });
      }
      setBroadcastFeedback("🚨 DRIVER EMERGENCY SOS TRANSMITTED! Campus Security Notified.");
    } catch (err) {
      console.error("SOS trigger error:", err);
    } finally {
      setIsSosLoading(false);
      setTimeout(() => setBroadcastFeedback(null), 6000);
    }
  };

  // Pass Validation Handler (Camera QR & Manual ID)
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
          busId: driverAssignedBusId,
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
            busId: driverAssignedBusId,
          }),
        });
        res = await fetchRes.json();
      }

      const clientLatency = Math.round(performance.now() - startTime);

      if (res && res.valid) {
        const studentId = res.student?.id || enrollmentId || "Student";
        const studentName = res.student?.name || "Student";
        setScanResult({
          type: "success",
          status: res.status || "ACTIVE",
          message: `✓ PASS AUTHORIZED: ${studentName} (${studentId})`,
          submessage: "Boarding approved for Route 9",
          student: res.student,
          latencyMs: clientLatency,
        });
        if (boardStudent) {
          boardStudent(res.student?.id || enrollmentId);
        }
        const validId = res.student?.id || enrollmentId;
        if (validId) {
          setBoardedStudentsState((prev) => ({
            ...prev,
            [validId]: true,
          }));
        }
      } else {
        const status = res?.status || "REJECTED";
        const reason = status === "EXPIRED"
          ? "Transport Pass Expired"
          : status === "PENDING_FEE"
            ? "Transport Fee Dues Pending"
            : "Pass Signature Invalid";

        setScanResult({
          type: "warning",
          status,
          message: `⚠️ ACCESS DENIED: ${reason}`,
          submessage: `Status: ${status}`,
          student: res?.student,
          latencyMs: clientLatency,
        });
      }
    } catch (err) {
      setScanResult({
        type: "error",
        status: "ERROR",
        message: `Validation Error: ${err.message || "Failed to reach validator"}`,
        latencyMs: Math.round(performance.now() - startTime),
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
            () => { }
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
              qrScanner.stop().then(() => qrScanner.clear()).catch(() => { });
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
            scannerInstanceRef.current.stop().then(() => scannerInstanceRef.current.clear()).catch(() => { });
          } else {
            scannerInstanceRef.current.clear();
          }
        } catch (e) { }
        scannerInstanceRef.current = null;
      }
    }
  }, [showScannerModal, scannerMode]);

  const handleCloseScannerModal = () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          scannerInstanceRef.current.stop().then(() => scannerInstanceRef.current.clear()).catch(() => { });
        } else {
          scannerInstanceRef.current.clear();
        }
      } catch (e) { }
      scannerInstanceRef.current = null;
    }
    setShowScannerModal(false);
    setScanResult(null);
    setManualIdInput("");
  };

  const driverInitials = currentDriver?.avatar ||
    driverName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MP";

  const dynamicNavItems = NAV_ITEMS.map((item) =>
    item.id === "boarding"
      ? { ...item, badge: `${effectiveBoardedCount}/${effectiveStudents.length}` }
      : item
  );

  const currentTabMeta = DRIVER_TAB_TITLES[activeNav] || {
    title: "Driver Dashboard",
    subtitle: "Route live GPS location & student pass scanner",
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
                <div className="dd-brand-sub">Driver Portal</div>
              </div>
            )}
          </button>

          <nav className="dd-nav">
            {dynamicNavItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  className={`dd-nav-item ${isActive ? "dd-nav-item--active" : ""}`}
                  onClick={() => {
                    setActiveNav(item.id);
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

          {/* Pinned Footer */}
          <div className="dd-sidebar-footer">
            <div
              className="dd-driver-info"
              title={isCollapsed ? `${driverName} (${driverAssignedBusId})` : undefined}
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
                  <p className="dd-driver-id">{driverAssignedBusId}</p>
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
                      Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="dd-logout"
              onClick={() => navigate("/logout")}
              title={isCollapsed ? "Exit Portal & Return to Homepage" : undefined}
            >
              <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} />
              {!isCollapsed && <span>Exit Portal</span>}
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="dd-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

        {/* ── MAIN CONTENT AREA ─────────────────────────────────── */}
        <div className="dd-main">
          {/* TOP BAR */}
          <header className="dd-topbar">
            <div className="dd-topbar-left">
              <button className="dd-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
              </button>
              <div className="dd-topbar-info">
                <h1 className="dd-topbar-title">{currentTabMeta.title}</h1>
                <p className="dd-topbar-subtitle">{currentTabMeta.subtitle}</p>
              </div>
            </div>

            <div className="dd-topbar-right">
              {/* Clean Assigned Bus & Route Badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                padding: "6px 12px",
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0066ff" }}>
                  🚌 {driverAssignedBusId}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, background: "#e2e8f0", color: "#334155", padding: "2px 8px", borderRadius: 8 }}>
                  Route 9
                </span>
              </div>

              <div className="dd-topbar-status-actions">
                <span className={`dd-trip-status ${activeTrip?.status === "ON_ROUTE" ? "dd-trip-status--active" : "dd-trip-status--idle"}`}>
                  {activeTrip?.status === "ON_ROUTE" ? "● Active" : activeTrip?.status === "PAUSED" ? "⏸ Paused" : "○ Standby"}
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
                  title={`${driverName} (${driverAssignedBusId})`}
                  onClick={() => setActiveNav("profile")}
                >
                  <div className="dd-avatar">{driverInitials}</div>
                  <div className="dd-avatar-info">
                    <span className="dd-avatar-name">{driverName}</span>
                    <span className="dd-avatar-role">Driver</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="dd-content">
            {/* ── 1. DRIVER HOMEPAGE (GPS + SCANNER ONLY) ─────────── */}
            {activeNav === "dashboard" && (
              <div className="dd-cockpit-container">
                {/* Feedback Notification */}
                {broadcastFeedback && (
                  <div style={{
                    padding: "12px 16px",
                    background: broadcastFeedback.includes("🚨") ? "#fef2f2" : "#eff6ff",
                    color: broadcastFeedback.includes("🚨") ? "#b91c1c" : "#0066ff",
                    border: `1px solid ${broadcastFeedback.includes("🚨") ? "#fecaca" : "#bfdbfe"}`,
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <span>{broadcastFeedback.includes("🚨") ? "🚨" : "✓"}</span>
                    <span>{broadcastFeedback}</span>
                  </div>
                )}

                {/* Active Issue Broadcast Notice Banner */}
                {activeDriverNotice && (
                  <div className="dd-active-notice-banner">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 20 }}>📢</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase" }}>
                          ACTIVE ISSUE BROADCAST TO STUDENTS & ADMIN
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#78350f", wordBreak: "break-word" }}>
                          {activeDriverNotice}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearBroadcastNotice}
                      style={{
                        background: "#fef3c7",
                        border: "1px solid #f59e0b",
                        borderRadius: 8,
                        color: "#92400e",
                        fontWeight: 800,
                        fontSize: 12,
                        padding: "6px 12px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Clear Notice ✕
                    </button>
                  </div>
                )}

                {/* Assigned Person & Route Header Strip */}
                <div className="dd-header-banner">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      ASSIGNED DRIVER & BUS ROUTE
                    </div>
                    <h2 style={{ fontSize: 19, fontWeight: 900, color: "#0f172a", margin: "4px 0 2px", wordBreak: "break-word" }}>
                      {driverName} &nbsp;·&nbsp; {matchedOfficialRoute.displayName || "Route 9 (Tulsidham - Fatehgunj - Nizampura)"}
                    </h2>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                      Vehicle: <strong>{driverAssignedBusId}</strong> &nbsp;|&nbsp; Approaching: <strong>{currentApproachingStop.name}</strong>
                    </p>
                  </div>

                  <span style={{
                    background: activeTrip?.status === "ON_ROUTE" ? "#dcfce7" : "#fef9c3",
                    color: activeTrip?.status === "ON_ROUTE" ? "#15803d" : "#854d0e",
                    fontWeight: 800,
                    fontSize: 12.5,
                    padding: "6px 14px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}>
                    {activeTrip?.status === "ON_ROUTE" ? "● Trip Active" : activeTrip?.status === "PAUSED" ? "⏸ Trip Paused" : "○ Ready to Depart"}
                  </span>
                </div>

                {/* 1. THE GPS PART (LIVE LOCATION & ROUTE CONTROLS) */}
                <div className="dd-card-simplified">
                  <div className="dd-gps-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>📍</span>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                          Live GPS & Route Location
                        </h3>
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                        Broadcast real-time bus location so students & college track live
                      </p>
                    </div>

                    {/* GPS Toggle */}
                    <button
                      type="button"
                      onClick={handleToggleDeviceGps}
                      className="dd-gps-toggle-btn"
                      style={{
                        background: isDeviceGpsActive ? "#16a34a" : "#f1f5f9",
                        color: isDeviceGpsActive ? "#ffffff" : "#475569",
                        border: isDeviceGpsActive ? "none" : "1.5px solid #cbd5e1",
                        boxShadow: isDeviceGpsActive ? "0 4px 12px rgba(22, 163, 74, 0.25)" : "none",
                      }}
                      title="Turn live phone GPS on or off"
                    >
                      <span style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: isDeviceGpsActive ? "#ffffff" : "#94a3b8",
                        display: "inline-block",
                      }} />
                      {isDeviceGpsActive ? "📍 Live GPS: ON" : "📍 Live GPS: OFF"}
                    </button>
                  </div>

                  {/* Approaching stop & telemetry status */}
                  <div className="dd-telemetry-box">
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>CURRENT APPROACHING STOP</span>
                      <h4 style={{ fontSize: 15, fontWeight: 900, color: "#0066ff", margin: "2px 0 0", wordBreak: "break-word" }}>
                        {currentApproachingStop.name} &nbsp;({currentStopIndex + 1} of {routeStops.length})
                      </h4>
                    </div>
                    <div className="dd-telemetry-meta-row">
                      <div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>SPEED</span>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a" }}>
                          {liveBusTelemetry?.[driverAssignedBusId]?.speed ?? activeTrip?.currentSpeed ?? 42} km/h
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>STUDENT TRACKING</span>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#16a34a" }}>
                          ✓ Live
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Trip Action Buttons (Start, End & Broadcast Issue) */}
                  <div className="dd-trip-actions-row">
                    {activeTrip?.status !== "ON_ROUTE" ? (
                      <button
                        onClick={handleOpenStartTripPrompt}
                        disabled={isStartingTrip}
                        style={{
                          background: "linear-gradient(135deg, #0066ff 0%, #0052cc 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 14,
                          padding: "16px 28px",
                          fontSize: 16,
                          fontWeight: 900,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          boxShadow: "0 4px 16px rgba(0, 102, 255, 0.28)",
                          flex: 1,
                        }}
                      >
                        ▶ {isStartingTrip ? "STARTING ROUTE..." : "START ROUTE (GPS ON)"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleEndTrip}
                          disabled={isCompletingTrip}
                          style={{
                            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 14,
                            padding: "15px 24px",
                            fontSize: 15,
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                            flex: 1,
                          }}
                        >
                          ✓ {isCompletingTrip ? "ENDING ROUTE..." : "END ROUTE & LOCATION"}
                        </button>
                        <button
                          onClick={handlePauseTrip}
                          disabled={isPausingTrip}
                          style={{
                            background: "#f1f5f9",
                            color: "#334155",
                            border: "1.5px solid #cbd5e1",
                            borderRadius: 14,
                            padding: "15px 18px",
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {activeTrip?.status === "PAUSED" ? "▶ Resume" : "⏸ Pause"}
                        </button>
                      </>
                    )}

                    {/* Broadcast Issue / Delay Button */}
                    <button
                      type="button"
                      onClick={() => setShowBroadcastModal(true)}
                      className="dd-broadcast-btn"
                      title="Broadcast delay or issue message to students"
                    >
                      <span style={{ fontSize: 16 }}>📢</span>
                      <span>{activeDriverNotice ? "Update Delay Notice" : "Broadcast Issue / Delay"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. THE SCANNER & PASS PART (STUDENT BUS PASS SCANNER) */}
                <div className="dd-card-simplified">
                  <div className="dd-scanner-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>🎟️</span>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                          Student Bus Pass Scanner
                        </h3>
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                        Verify student passes and confirm passenger boarding in 1 tap
                      </p>
                    </div>

                    {/* Boarded Count Badge */}
                    <div className="dd-boarded-count-pill">
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e3a8a" }}>
                        Boarded Today:
                      </span>
                      <strong style={{ fontSize: 16, color: "#0066ff" }}>
                        {effectiveBoardedCount} / {effectiveStudents.length} Students
                      </strong>
                    </div>
                  </div>

                  {/* Responsive Scanner Controls: 1-col on mobile, 2-col on desktop */}
                  <div className="dd-scanner-grid">
                    {/* Camera QR Scanner Button */}
                    <button
                      type="button"
                      className="dd-camera-scan-btn"
                      onClick={() => {
                        setScanResult(null);
                        setScannerMode("camera");
                        setShowScannerModal(true);
                      }}
                    >
                      <span style={{ fontSize: 22 }}>📷</span>
                      <span>Scan Pass with Camera</span>
                    </button>

                    {/* Quick Manual Student ID Entry */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (scanInput.trim()) {
                          handleValidatePass({ enrollmentId: scanInput.trim() });
                          setScanInput("");
                        }
                      }}
                      className="dd-manual-scan-form"
                    >
                      <input
                        type="text"
                        placeholder="Type Student ID (e.g. UNI20260125)..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="dd-manual-scan-input"
                      />
                      <button
                        type="submit"
                        disabled={isValidating || !scanInput.trim()}
                        className="dd-manual-scan-btn"
                      >
                        {isValidating ? "Checking..." : "Verify"}
                      </button>
                    </form>
                  </div>

                  {/* 1-Click Quick Sample IDs */}
                  <div className="dd-test-chips-row">
                    <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 700 }}>Quick Test IDs:</span>
                    {["UNI20260125", "UNI20260142", "UNI20260188"].map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleValidatePass({ enrollmentId: id })}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#334155",
                          cursor: "pointer",
                        }}
                      >
                        {id}
                      </button>
                    ))}
                  </div>

                  {/* Scan Result Feedback Toast */}
                  {scanResult && (
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: scanResult.type === "success" ? "#f0fdf4" : "#fef2f2",
                      border: `1.5px solid ${scanResult.type === "success" ? "#86efac" : "#fecaca"}`,
                      color: scanResult.type === "success" ? "#166534" : "#991b1b",
                      fontWeight: 700,
                      fontSize: 13.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                      gap: 8,
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ wordBreak: "break-word" }}>{scanResult.message}</div>
                        {scanResult.submessage && (
                          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>{scanResult.submessage}</div>
                        )}
                      </div>
                      <button
                        onClick={() => setScanResult(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 900, fontSize: 16 }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Footer link to passenger list */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: "#64748b" }}>
                      Allocated passengers: <strong>{effectiveStudents.length} students</strong>
                    </span>
                    <button
                      onClick={() => setActiveNav("boarding")}
                      style={{
                        background: "#eff6ff",
                        color: "#0066ff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 12px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      View Passenger List ➔
                    </button>
                  </div>
                </div>

                {/* 3. QUICK EMERGENCY ASSISTANCE BAR */}
                <div className="dd-emergency-bar">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 22 }}>🚨</span>
                    <div>
                      <strong style={{ fontSize: 13.5, color: "#991b1b" }}>Emergency Assistance</strong>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#b91c1c" }}>
                        Need immediate security or mechanical help? Alert campus dispatch.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDriverSos}
                    disabled={isSosLoading}
                    style={{
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 18px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSosLoading ? "Alerting..." : "🚨 Trigger Driver SOS"}
                  </button>
                </div>
              </div>
            )}

            {/* ── 2. PASSENGER LIST TAB ────────────────────────────── */}
            {activeNav === "boarding" && (
              <div className="dd-card" style={{ maxWidth: 960, margin: "0 auto" }}>
                <div className="dd-card-header" style={{ flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 className="dd-card-title">Allocated Route Passenger Roster</h2>
                    <p style={{ fontSize: 12.5, color: "#64748b" }}>
                      Bus: <strong>{driverAssignedBusId}</strong> &nbsp;·&nbsp; Route: <strong>Route 9</strong> &nbsp;·&nbsp; {effectiveBoardedCount} of {effectiveStudents.length} passengers boarded
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search student or stop..."
                        value={boardingSearch}
                        onChange={(e) => setBoardingSearch(e.target.value)}
                        style={{
                          padding: "7px 12px 7px 32px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: 13,
                          outline: "none",
                          width: 220,
                        }}
                      />
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94a3b8" }}>
                        🔍
                      </span>
                      {boardingSearch && (
                        <button
                          type="button"
                          onClick={() => setBoardingSearch("")}
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#94a3b8",
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button className="dd-btn-primary" onClick={() => setShowScannerModal(true)}>
                      + Scan Pass
                    </button>
                  </div>
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
                      {displayedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "28px 16px", color: "#64748b" }}>
                            No passengers found matching &ldquo;{boardingSearch}&rdquo;
                          </td>
                        </tr>
                      ) : (
                        displayedStudents.map((s) => (
                          <tr key={s.id} className="ad-tr">
                            <td className="ad-td"><strong>{s.name}</strong></td>
                            <td className="ad-td">{s.id}</td>
                            <td className="ad-td">{s.pickupStop || s.stopName || "Assigned Stop"}</td>
                            <td className="ad-td">{s.pickupTime || "07:45 AM"}</td>
                            <td className="ad-td">
                              <span className={`ad-badge ${(s.pass || s.passStatus || "").toUpperCase() === "ACTIVE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                                {(s.pass || s.passStatus || "Active").toUpperCase() === "ACTIVE" ? "● Active Pass" : "● Pending"}
                              </span>
                            </td>
                            <td className="ad-td">
                              {s.boardedToday ? (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 12.5, color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    ✓ Boarded
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleStudentBoarded(s.id)}
                                    title="Undo boarding"
                                    style={{
                                      fontSize: 11,
                                      color: "#64748b",
                                      background: "#f1f5f9",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: 4,
                                      padding: "2px 7px",
                                      cursor: "pointer",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Undo
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="dd-board-btn"
                                  onClick={() => {
                                    toggleStudentBoarded(s.id);
                                    if (boardStudent) boardStudent(s.id);
                                  }}
                                >
                                  Mark Boarded
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── 3. ROUTE STOPS & MAP TAB ─────────────────────────── */}
            {activeNav === "route" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960, margin: "0 auto" }}>
                <div className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h2 className="dd-card-title">{matchedOfficialRoute.displayName || "Route 9: Fatehgunj ↔ GSFC University"}</h2>
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>
                        Bus: <strong>{driverAssignedBusId}</strong> · Driver: <strong>{driverName}</strong> · Total {routeStops.length} Scheduled Stops
                      </p>
                    </div>
                    <span className="ad-badge ad-badge--blue">
                      {isDeviceGpsActive ? "● Phone GPS Active" : "📡 High-Precision GPS Feed"}
                    </span>
                  </div>

                  {/* Real Interactive Route Map */}
                  <div style={{ marginTop: 12 }}>
                    <RealMapView
                      singleBus={{
                        busId: driverAssignedBusId,
                        regNo: driverAssignedBusId,
                        routeName: matchedOfficialRoute.displayName,
                        driverName: driverName,
                        driverPhone: currentDriver?.phone || "+91 98765 11111",
                        lat: Number(liveBusTelemetry?.[driverAssignedBusId]?.lat) || 22.3245,
                        lng: Number(liveBusTelemetry?.[driverAssignedBusId]?.lng) || 73.1880,
                        speed: Number(liveBusTelemetry?.[driverAssignedBusId]?.speed) || 42,
                        nextStop: currentApproachingStop.name,
                        nextStopIndex: currentStopIndex,
                        etaMinutes: 6,
                        status: activeTrip?.status === "ON_ROUTE" ? "On Route" : "Standby",
                        occupancy: effectiveBoardedCount,
                        capacity: 52,
                      }}
                      routeStops={routeStops}
                      height="380px"
                    />
                  </div>
                </div>

                {/* Scheduled Stops Timeline */}
                <div className="dd-card">
                  <div className="dd-card-header">
                    <h3 className="dd-card-title">Scheduled Stops & Sequence</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                    {routeStops.map((stop, idx) => {
                      const isPast = idx < currentStopIndex;
                      const isCurrent = idx === currentStopIndex;
                      return (
                        <div
                          key={stop.index}
                          style={{
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: isCurrent ? "#eff6ff" : isPast ? "#f8fafc" : "#ffffff",
                            border: `1.5px solid ${isCurrent ? "#93c5fd" : "#e2e8f0"}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: isCurrent ? "#0066ff" : isPast ? "#16a34a" : "#cbd5e1",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 12,
                            }}>
                              {idx + 1}
                            </div>
                            <div>
                              <strong style={{ fontSize: 14, color: isCurrent ? "#0066ff" : "#0f172a" }}>{stop.name}</strong>
                              <div style={{ fontSize: 12, color: "#64748b" }}>Scheduled Time: {stop.scheduled}</div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: isCurrent ? "#0066ff" : isPast ? "#16a34a" : "#64748b",
                          }}>
                            {isCurrent ? "● Approaching Stop" : isPast ? "✓ Departed" : "Scheduled"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. EMERGENCY SOS TAB ─────────────────────────────── */}
            {activeNav === "emergency" && (
              <div className="dd-card" style={{ maxWidth: 640, margin: "0 auto", border: "2px solid #fecaca" }}>
                <div className="dd-card-header">
                  <div>
                    <h2 className="dd-card-title" style={{ color: "#dc2626" }}>🚨 Emergency SOS Alert</h2>
                    <p style={{ fontSize: 12.5, color: "#64748b" }}>Instant dispatch to University Campus Security & Administration</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.5 }}>
                    Triggering this alarm broadcasts an urgent security alert with your vehicle registration <strong>({driverAssignedBusId})</strong>, driver name <strong>({driverName})</strong>, and live GPS coordinates to central security command.
                  </p>

                  <button
                    onClick={handleDriverSos}
                    disabled={isSosLoading}
                    style={{
                      padding: "18px 24px",
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 14,
                      fontWeight: 900,
                      fontSize: 16,
                      minHeight: 58,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      boxShadow: "0 4px 16px rgba(220, 38, 38, 0.35)",
                    }}
                  >
                    🚨 {isSosLoading ? "TRANSMITTING SOS DISPATCH..." : "TRIGGER EMERGENCY SOS NOW"}
                  </button>
                </div>
              </div>
            )}

            {/* ── 5. DRIVER PROFILE TAB ────────────────────────────── */}
            {activeNav === "profile" && (
              <div className="ap-container" style={{ width: "100%", padding: 0, maxWidth: 960, margin: "0 auto" }}>
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
                        <span>{driverInitials}</span>
                      </div>
                      <span className="ap-avatar-badge">★ 4.9 Rating</span>
                    </div>

                    <div className="ap-hero-info">
                      <div className="ap-hero-name-row">
                        <h2 className="ap-hero-name">{driverFormData.name}</h2>
                        <span className="ap-verified-tag" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a" }}>● Active On Duty</span>
                      </div>
                      <p className="ap-hero-role">Senior Transit Pilot · {driverAssignedBusId}</p>
                      <p className="ap-hero-id">Assigned Route: <strong>Route 9</strong></p>
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

                {/* Grid Two Details */}
                <div className="ap-grid-two">
                  <div className="ap-card">
                    <div className="ap-card-header">
                      <div className="ap-card-icon">
                        <Icon d="M3 12h18M3 6h18M3 18h18" size={20} stroke="#0066ff" />
                      </div>
                      <div>
                        <h3 className="ap-card-title">Assigned Vehicle Records</h3>
                        <p className="ap-card-sub">GSFC University Transport Compliance</p>
                      </div>
                    </div>

                    <div className="ap-info-list">
                      <div className="ap-info-item">
                        <span className="ap-info-label">Assigned Vehicle</span>
                        <span className="ap-info-val">{driverAssignedBusId}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Assigned Route</span>
                        <span className="ap-info-val">Route 9 (Tulsidham - Fatehgunj - Nizampura)</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">License Number</span>
                        <span className="ap-info-val">{currentDriver?.licenseNo || "GJ-06-2018-9842"}</span>
                      </div>
                      <div className="ap-info-item">
                        <span className="ap-info-label">Total Allocated Passengers</span>
                        <span className="ap-info-val">{effectiveStudents.length} Students</span>
                      </div>
                    </div>
                  </div>

                  <div className="ap-card">
                    <div className="ap-card-header">
                      <div className="ap-card-icon">
                        <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" size={20} stroke="#0066ff" />
                      </div>
                      <div>
                        <h3 className="ap-card-title">Personal Contact</h3>
                        <p className="ap-card-sub">Emergency & medical contacts</p>
                      </div>
                    </div>

                    <div className="ap-info-list">
                      <div className="ap-info-item">
                        <span className="ap-info-label">Phone Number</span>
                        <span className="ap-info-val">{driverFormData.phone}</span>
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
          </main>
        </div>
      </div>

      {/* ── CAMERA QR SCANNER MODAL ───────────────────────────── */}
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
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Point camera at student QR pass or enter ID</p>
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

            {/* Validation Result Alert */}
            {scanResult && (
              <div
                className={`dd-modal-alert dd-modal-alert--${scanResult.type === "success" ? "success" : "warning"}`}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, marginBottom: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 18 }}>{scanResult.type === "success" ? "✓" : "⚠️"}</span>
                  <span style={{ fontWeight: 700, flex: 1 }}>{scanResult.message}</span>
                </div>
                {scanResult.student && (
                  <div style={{ fontSize: 12, color: "#475569", marginLeft: 26 }}>
                    Pass Status: <strong>{scanResult.status}</strong> · Boarding Marked
                  </div>
                )}
              </div>
            )}

            {/* Camera Viewfinder Mode */}
            {scannerMode === "camera" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div id="driver-qr-reader" style={{ width: "100%", minHeight: 250, background: "#0f172a", borderRadius: 12, position: "relative" }} />
                {cameraError && (
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
                )}
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
                      placeholder="e.g. UNI20260125"
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
                    Sample ID: UNI20260125
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

      {/* ── DRIVER EDIT PROFILE POPUP WINDOW MODAL ───────────── */}
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

      {/* ── ROUTE START GPS CONFIRMATION MODAL ────────────────── */}
      {showGpsPromptModal && (
        <div className="glow-modal-overlay" onClick={() => setShowGpsPromptModal(false)}>
          <div
            className="glow-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440, borderRadius: 20, boxShadow: "0 20px 45px rgba(0, 0, 0, 0.22)" }}
          >
            <div className="glow-modal-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 14 }}>
              <div className="glow-modal-title-row">
                <div
                  className="glow-modal-icon"
                  style={{
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    color: "#0066ff",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  📍
                </div>
                <div>
                  <h3 className="glow-modal-title" style={{ fontSize: 18, color: "#0f172a", fontWeight: 800 }}>
                    Share Live Location?
                  </h3>
                  <p className="glow-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
                    Turn on GPS so students and college can track the bus
                  </p>
                </div>
              </div>
              <button
                className="glow-modal-close"
                onClick={() => setShowGpsPromptModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="glow-modal-body" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Option 1: Yes, Turn On GPS */}
                <button
                  type="button"
                  onClick={() => handleStartTripWithGps(true)}
                  disabled={isStartingTrip}
                  style={{
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 4px 14px rgba(22, 163, 74, 0.28)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 28 }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>
                        Yes, Turn On GPS
                      </div>
                      <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 2 }}>
                        Share real-time location with students
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800 }}>➔</span>
                </button>

                {/* Option 2: Start Without GPS */}
                <button
                  type="button"
                  onClick={() => handleStartTripWithGps(false)}
                  disabled={isStartingTrip}
                  style={{
                    background: "#f8fafc",
                    color: "#334155",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: 14,
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 26 }}>🚌</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                        Start Without GPS
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Run trip with scheduled timings
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: "#64748b" }}>➔</span>
                </button>
              </div>
            </div>

            <div
              className="glow-modal-footer"
              style={{
                borderTop: "1px solid #e2e8f0",
                padding: "12px 24px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="ap-cancel-btn"
                onClick={() => setShowGpsPromptModal(false)}
                style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRIVER ISSUE BROADCAST POPUP MODAL ───────────────── */}
      {showBroadcastModal && (
        <div className="glow-modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div
            className="glow-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, borderRadius: 20, boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="glow-modal-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 14 }}>
              <div className="glow-modal-title-row">
                <div
                  className="glow-modal-icon"
                  style={{
                    background: "#fffbeb",
                    color: "#b45309",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  📢
                </div>
                <div>
                  <h3 className="glow-modal-title" style={{ fontSize: 18, color: "#0f172a", fontWeight: 800 }}>
                    Broadcast Route Issue
                  </h3>
                  <p className="glow-modal-sub" style={{ fontSize: 12.5, color: "#64748b" }}>
                    Send instant delay or situation notice to all route students
                  </p>
                </div>
              </div>
              <button
                className="glow-modal-close"
                onClick={() => setShowBroadcastModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="glow-modal-body" style={{ padding: "18px 22px" }}>
              {/* Quick 1-Tap Presets */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Quick One-Tap Presets:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {BROADCAST_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="dd-preset-chip"
                      onClick={() => handleSendBroadcastNotice(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message input */}
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Or Type Custom Issue:
                </label>
                <textarea
                  rows={2}
                  className="glow-modal-textarea"
                  placeholder="e.g., Road repair near Subhanpura, bus running 12 mins late..."
                  value={broadcastMessageInput}
                  onChange={(e) => setBroadcastMessageInput(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", fontSize: 13.5 }}
                />
              </div>
            </div>

            <div
              className="glow-modal-footer"
              style={{
                borderTop: "1px solid #e2e8f0",
                padding: "12px 22px",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <button
                type="button"
                className="ap-cancel-btn"
                onClick={() => setShowBroadcastModal(false)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ap-save-btn"
                onClick={() => handleSendBroadcastNotice()}
                disabled={!broadcastMessageInput.trim()}
                style={{
                  background: "#b45309",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  opacity: !broadcastMessageInput.trim() ? 0.6 : 1,
                  cursor: !broadcastMessageInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                📢 Broadcast Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAVIGATION (Fixed, Visible on Mobile & Tablet) ── */}
      <nav className="dd-bottom-nav">
        <button
          type="button"
          className={`dd-bottom-nav-item ${activeNav === "dashboard" ? "dd-bottom-nav-item--active" : ""}`}
          onClick={() => setActiveNav("dashboard")}
        >
          <div className="dd-bottom-nav-icon-wrap">
            <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={18} />
          </div>
          <span className="dd-bottom-nav-label">Home</span>
        </button>

        <button
          type="button"
          className={`dd-bottom-nav-item ${activeNav === "boarding" ? "dd-bottom-nav-item--active" : ""}`}
          onClick={() => setActiveNav("boarding")}
        >
          <div className="dd-bottom-nav-icon-wrap">
            <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={18} />
            {effectiveBoardedCount > 0 && (
              <span className="dd-bottom-nav-badge">{effectiveBoardedCount}</span>
            )}
          </div>
          <span className="dd-bottom-nav-label">Passengers</span>
        </button>

        <button
          type="button"
          className={`dd-bottom-nav-item ${activeNav === "route" ? "dd-bottom-nav-item--active" : ""}`}
          onClick={() => setActiveNav("route")}
        >
          <div className="dd-bottom-nav-icon-wrap">
            <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={18} />
          </div>
          <span className="dd-bottom-nav-label">Route</span>
        </button>

        <button
          type="button"
          className={`dd-bottom-nav-item ${activeNav === "emergency" ? "dd-bottom-nav-item--active" : ""}`}
          onClick={() => setActiveNav("emergency")}
        >
          <div className="dd-bottom-nav-icon-wrap">
            <Icon d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={18} />
          </div>
          <span className="dd-bottom-nav-label">SOS</span>
        </button>

        <button
          type="button"
          className={`dd-bottom-nav-item ${activeNav === "profile" ? "dd-bottom-nav-item--active" : ""}`}
          onClick={() => setActiveNav("profile")}
        >
          <div className="dd-bottom-nav-icon-wrap">
            <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" size={18} />
          </div>
          <span className="dd-bottom-nav-label">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default DriverDashboardView;
