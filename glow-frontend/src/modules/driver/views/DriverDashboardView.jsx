import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const DriverDashboardView = () => {
  const navigate = useNavigate();
  const {
    currentDriver,
    setCurrentDriver,
    activeTrip,
    setActiveTrip,
    students,
    boardStudent,
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

  // Driver Profile edit modal state
  const [showDriverEditModal, setShowDriverEditModal] = useState(false);
  const [driverSavedSuccess, setDriverSavedSuccess] = useState(false);
  const [driverFormData, setDriverFormData] = useState({
    name: currentDriver?.name || "Mahesh Patel",
    phone: currentDriver?.phone || "+91 98765 11111",
    email: currentDriver?.email || "mahesh.patel@glowbus.edu",
    address: currentDriver?.address || "A-12, Green Park Society, Chandkheda, Ahmedabad - 382424",
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

  // Modals & form state
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayMins, setDelayMins] = useState(10);
  const [delayReason, setDelayReason] = useState("Traffic congestion on SG Highway");
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState(null);

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
      broadcastDriverLocation({ isDeviceGps: false });
      setBroadcastFeedback("Switched to Route Telemetry mode.");
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDeviceGpsActive(true);
          const { latitude, longitude, speed } = pos.coords;
          broadcastDriverLocation({
            lat: parseFloat(latitude.toFixed(4)),
            lng: parseFloat(longitude.toFixed(4)),
            speed: speed ? Math.round(speed * 3.6) : 42,
            isDeviceGps: true,
          });
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
    broadcastDriverLocation({
      speed: activeTrip.currentSpeed || 42,
      lastUpdated: new Date().toISOString(),
    });
    setBroadcastFeedback("✓ Telemetry packet broadcasted! Synced with Students and Admin.");
    setTimeout(() => setBroadcastFeedback(null), 4000);
  };

  const handleStartTrip = () => {
    setActiveTrip((prev) => ({
      ...prev,
      isActive: true,
      status: "ON_ROUTE",
      departureTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));
    broadcastDriverLocation({ status: "ON_ROUTE" });
  };

  const handlePauseTrip = () => {
    const nextStatus = activeTrip.status === "PAUSED" ? "ON_ROUTE" : "PAUSED";
    setActiveTrip((prev) => ({
      ...prev,
      status: nextStatus,
    }));
    broadcastDriverLocation({ status: nextStatus });
  };

  const handleEndTrip = () => {
    setActiveTrip((prev) => ({
      ...prev,
      isActive: false,
      status: "COMPLETED",
    }));
    broadcastDriverLocation({ status: "COMPLETED" });
  };

  const handleNextStop = () => {
    const nextIdx = Math.min(5, activeTrip.currentStopIndex + 1);
    setActiveTrip((prev) => ({
      ...prev,
      currentStopIndex: nextIdx,
    }));
    broadcastDriverLocation({ nextStopIndex: nextIdx });
  };

  const driverRouteId = currentDriver?.assignedRoute || "R-04";
  const driverBusId = currentDriver?.assignedBus || "BUS-104";
  const busCapacity = currentDriver?.expectedStudents || 38;

  // Strictly filter students allocated to this driver's specific assigned bus & route
  const assignedBusStudents = students
    .filter(
      (s) =>
        s.routeId === driverRouteId ||
        s.route === "Route 4D" ||
        (s.routeName && s.routeName.includes("Chandkheda")) ||
        s.busId === driverBusId
    )
    .slice(0, busCapacity);

  const boardedCount = assignedBusStudents.filter((s) => s.boardedToday).length;

  const handleDelaySubmit = (e) => {
    e.preventDefault();
    reportTripDelay(Number(delayMins), delayReason);
    setShowDelayModal(false);
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    const query = scanInput.trim().toLowerCase();
    const targetStudent = students.find(
      (s) => s.id.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );

    if (!targetStudent) {
      setScanMessage({ type: "error", text: `Student ID / Pass "${scanInput}" not recognized. Please check registration.` });
    } else {
      // Check if student belongs to this driver's route/bus
      const isAssignedToThisBus =
        assignedBusStudents.some((s) => s.id === targetStudent.id) ||
        targetStudent.routeId === driverRouteId ||
        targetStudent.route === "Route 4D" ||
        (targetStudent.routeName && targetStudent.routeName.includes("Chandkheda"));

      if (!isAssignedToThisBus) {
        setScanMessage({
          type: "warning",
          text: `⚠️ ${targetStudent.name} is allocated to ${targetStudent.route || targetStudent.routeName || "Another Route"} (${targetStudent.routeId || "Other Bus"}), NOT Route ${driverRouteId} (${driverBusId}). Please guide them to their assigned shuttle.`,
        });
      } else if (targetStudent.boardedToday) {
        setScanMessage({ type: "warning", text: `${targetStudent.name} (${targetStudent.id}) is already marked boarded!` });
      } else {
        boardStudent(targetStudent.id);
        setScanMessage({ type: "success", text: `✓ Verified: ${targetStudent.name} (${targetStudent.id}) boarded for ${driverBusId} at ${targetStudent.pickupStop || "Assigned Stop"}` });
      }
    }
    setScanInput("");
    setTimeout(() => setScanMessage(null), 5000);
  };

  const routeStops = [
    { index: 0, name: "Chandkheda Stop", scheduled: "07:30 AM", actual: "07:31 AM", students: 12, status: "departed" },
    { index: 1, name: "Visat Circle", scheduled: "07:42 AM", actual: "07:44 AM", students: 8, status: "departed" },
    { index: 2, name: "Motera Crossroads", scheduled: "07:54 AM", actual: "On Time (2 min)", students: 11, status: "approaching" },
    { index: 3, name: "Ranip Bus Port", scheduled: "08:04 AM", actual: "Estimated 08:05 AM", students: 5, status: "upcoming" },
    { index: 4, name: "Koba Circle", scheduled: "08:14 AM", actual: "Estimated 08:15 AM", students: 2, status: "upcoming" },
    { index: 5, name: "University Main Bay", scheduled: "08:20 AM", actual: "Estimated 08:20 AM", students: 0, status: "destination" },
  ];

  const dynamicNavItems = NAV_ITEMS.map((item) =>
    item.id === "boarding"
      ? { ...item, badge: `${boardedCount}/${assignedBusStudents.length}` }
      : item
  );

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
                <div className="dd-brand-name">GLOW BUS</div>
                <div className="dd-brand-sub">Driver Portal</div>
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
            title={isCollapsed ? `${currentDriver.name} (${currentDriver.id})` : undefined}
            onClick={() => {
              setActiveNav("profile");
              setSidebarOpen(false);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="dd-driver-avatar">{currentDriver.avatar}</div>
            {!isCollapsed && (
              <div className="dd-driver-text" style={{ flex: 1 }}>
                <p className="dd-driver-name">{currentDriver.name}</p>
                <p className="dd-driver-id">{currentDriver.id}</p>
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
              <span className="dd-topbar-greeting">Driver Cockpit</span>
              <h1 className="dd-topbar-name">{currentDriver.name} 👋</h1>
            </div>
            <div className="dd-topbar-right">
              <span className={`dd-trip-status ${activeTrip.status === "ON_ROUTE" ? "dd-trip-status--active" : "dd-trip-status--idle"}`}>
                {activeTrip.status === "ON_ROUTE" ? "● Trip Active" : activeTrip.status === "PAUSED" ? "⏸ Trip Paused" : "● Idle / Base"}
              </span>
              <button className="dd-notif-btn" aria-label="Emergency" onClick={() => setActiveNav("emergency")}>
                <span style={{ fontSize: 16 }}>🚨</span>
              </button>
              <div
                className="dd-avatar"
                title={`${currentDriver.name} (${currentDriver.id})`}
                onClick={() => setActiveNav("profile")}
                style={{ cursor: "pointer" }}
              >
                {currentDriver.avatar}
              </div>
            </div>
          </header>

          <main className="dd-content">
            {/* ── 1. DRIVER HOME ────────────────────────────────────── */}
            {activeNav === "dashboard" && (
              <>
                {/* Active Trip Hero Banner (White, Blue, Black) */}
                <div className="dd-hero-banner">
                  <div className="dd-hero-left">
                    <div className="dd-hero-icon-box">
                      <BusIcon size={30} color="#ffffff" />
                    </div>
                    <div>
                      <span className="dd-hero-badge">TODAY'S VEHICLE & ROUTE ASSIGNMENT</span>
                      <h2 className="dd-hero-title">Bus: {currentDriver.assignedBus} &nbsp;·&nbsp; Route: {currentDriver.assignedRoute} ({currentDriver.routeName || "University → Chandkheda"})</h2>
                      <p className="dd-hero-sub">
                        Allocated Passengers: <strong>{assignedBusStudents.length} Students</strong> &nbsp;·&nbsp; Departure: <strong>07:30 AM</strong> &nbsp;·&nbsp; Status: <span className="dd-hero-status-pill">{activeTrip.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="dd-hero-actions">
                    {activeTrip.status !== "ON_ROUTE" ? (
                      <button onClick={handleStartTrip} className="dd-btn-start">
                        <span>▶</span> START TRIP
                      </button>
                    ) : (
                      <>
                        <button onClick={handlePauseTrip} className="dd-btn-pause">
                          {activeTrip.status === "PAUSED" ? "▶ RESUME" : "⏸ PAUSE"}
                        </button>
                        <button onClick={handleNextStop} className="dd-btn-next-stop">
                          ⏭ NEXT STOP
                        </button>
                        <button onClick={handleEndTrip} className="dd-btn-end">
                          ✓ COMPLETE
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Telemetry Metric Cards */}
                <section className="dd-stats">
                  <div className="dd-stat-card" onClick={() => setActiveNav("boarding")}>
                    <div className="dd-stat-body">
                      <p className="dd-stat-label">Boarded Passengers</p>
                      <h3 className="dd-stat-value">{boardedCount} / {assignedBusStudents.length}</h3>
                      <p className="dd-stat-sub">{assignedBusStudents.length - boardedCount} remaining on Route {driverRouteId}</p>
                    </div>
                    <div className="dd-stat-icon">
                      <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={22} stroke="#0066ff" />
                    </div>
                  </div>

                  <div className="dd-stat-card" onClick={() => setActiveNav("route")}>
                    <div className="dd-stat-body">
                      <p className="dd-stat-label">Next Scheduled Stop</p>
                      <h3 className="dd-stat-value" style={{ fontSize: 17 }}>Motera Crossroads</h3>
                      <p className="dd-stat-sub">ETA: 07:58 AM (2 min)</p>
                    </div>
                    <div className="dd-stat-icon">
                      <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={22} stroke="#0066ff" />
                    </div>
                  </div>

                  <div className="dd-stat-card" onClick={() => setActiveNav("trip_mgmt")}>
                    <div className="dd-stat-body">
                      <p className="dd-stat-label">Telemetry Speed</p>
                      <h3 className="dd-stat-value">{activeTrip.speed}</h3>
                      <p className="dd-stat-sub">GPS refreshed 2s ago</p>
                    </div>
                    <div className="dd-stat-icon">
                      <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={22} stroke="#0066ff" />
                    </div>
                  </div>

                  <div className="dd-stat-card" onClick={() => setActiveNav("mybus")}>
                    <div className="dd-stat-body">
                      <p className="dd-stat-label">Bus Pre-Trip Check</p>
                      <h3 className="dd-stat-value" style={{ color: "#16a34a" }}>✓ Passed</h3>
                      <p className="dd-stat-sub">{currentDriver.assignedBus} · 6/6 vitals verified</p>
                    </div>
                    <div className="dd-stat-icon">
                      <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={22} stroke="#0066ff" />
                    </div>
                  </div>
                </section>

                {/* Action Buttons Row */}
                <div className="dd-action-grid">
                  <button className="dd-action-card" onClick={() => setShowScannerModal(true)}>
                    <div className="dd-action-icon-box">
                      <Icon d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" size={22} stroke="#0066ff" />
                    </div>
                    <div>
                      <h4 className="dd-action-title">Scan / Verify Student Pass</h4>
                      <p className="dd-action-sub">Verify boarding eligibility for Route {driverRouteId}</p>
                    </div>
                  </button>

                  <button className="dd-action-card" onClick={() => setShowDelayModal(true)}>
                    <div className="dd-action-icon-box">
                      <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={22} stroke="#0066ff" />
                    </div>
                    <div>
                      <h4 className="dd-action-title">Report Trip Delay</h4>
                      <p className="dd-action-sub">Broadcast traffic variance to passengers</p>
                    </div>
                  </button>

                  <button className="dd-action-card" onClick={() => setActiveNav("mybus")}>
                    <div className="dd-action-icon-box">
                      <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={22} stroke="#0066ff" />
                    </div>
                    <div>
                      <h4 className="dd-action-title">My Assigned Bus ({currentDriver.assignedBus})</h4>
                      <p className="dd-action-sub">View vehicle specs & daily inspection vitals</p>
                    </div>
                  </button>
                </div>
              </>
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
                          <td className="ad-td">R-04 Chandkheda</td>
                          <td className="ad-td">Chandkheda Stop → University Campus</td>
                          <td className="ad-td">07:30 AM - 08:20 AM</td>
                          <td className="ad-td">
                            <span className="ad-badge ad-badge--green">● {activeTrip.status}</span>
                          </td>
                        </tr>
                        <tr className="ad-tr">
                          <td className="ad-td"><strong>Trip #2 (Evening Return)</strong></td>
                          <td className="ad-td">R-04 Chandkheda</td>
                          <td className="ad-td">University Campus → Chandkheda Stop</td>
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
                      Bus: <strong>{currentDriver.assignedBus}</strong> &nbsp;·&nbsp; Route: <strong>{driverRouteId} ({currentDriver.routeName || "Chandkheda"})</strong> &nbsp;·&nbsp; {boardedCount} of {assignedBusStudents.length} passengers boarded
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
                          <td className="ad-td">{s.pickupStop || s.boarding || "Chandkheda"}</td>
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
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{currentDriver.busReg || "GJ-05-AB-1234"}</h3>
                      <span style={{ fontSize: 12, color: "#16a34a" }}>✓ Fitness Valid (Aug 2027)</span>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Assigned Route</p>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{currentDriver.assignedRoute || "R-04"}</h3>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{currentDriver.routeName || "University → Chandkheda"}</span>
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
                      <p style={{ fontSize: 12.5, color: "#64748b" }}>Route R-04: Chandkheda ➔ University Campus (Distance: 24.8 km)</p>
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
                        { x: 60, y: 240, name: "Chandkheda Stop" },
                        { x: 140, y: 190, name: "Visat Circle" },
                        { x: 260, y: 160, name: "Motera Crossroads (Next)" },
                        { x: 380, y: 130, name: "Ranip Bus Port" },
                        { x: 480, y: 90, name: "Koba Circle" },
                        { x: 600, y: 60, name: "University Campus" },
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
                    onClick={() => {
                      triggerEmergency("MEDICAL", "Driver SOS triggered medical assistance alarm", "Motera Crossroads");
                      alert("🚨 SOS Broadcast Sent! University Security and Admin have been alerted.");
                    }}
                    style={{ padding: "14px 20px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" }}
                  >
                    🚨 TRIGGER EMERGENCY SOS NOW
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── SCANNER MODAL ────────────────────────────────────── */}
      {showScannerModal && (
        <div className="dd-modal-overlay" onClick={() => setShowScannerModal(false)}>
          <div className="dd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dd-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#0066ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  🎫
                </div>
                <div>
                  <h3 className="dd-modal-title">Student Pass Verification</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Driver POS boarding checkpoint terminal</p>
                </div>
              </div>
              <button className="dd-modal-close" onClick={() => setShowScannerModal(false)}>✕</button>
            </div>

            {scanMessage && (
              <div className={`dd-modal-alert dd-modal-alert--${scanMessage.type}`}>
                <span>{scanMessage.type === "success" ? "✓" : scanMessage.type === "warning" ? "⚠️" : "✕"}</span>
                <span>{scanMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleScanSubmit} className="dd-modal-form">
              <div className="dd-form-group">
                <label className="dd-form-label">Enter Enrollment ID or Student Name</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="ad-input"
                    placeholder="e.g. UNI20260125, STU-104 or Rahul Sharma"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    autoFocus
                    required
                    style={{ paddingLeft: 42 }}
                  />
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none", fontSize: 15 }}>
                    🔍
                  </span>
                </div>
              </div>

              <button type="submit" className="dd-modal-submit-btn">
                <span>✓ Verify & Mark Boarded</span>
              </button>
            </form>
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
                  placeholder="e.g. Traffic congestion on SG Highway, road work"
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
