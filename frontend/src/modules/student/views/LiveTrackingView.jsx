import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import RealMapView from "../../../shared/components/RealMapView";
import { OFFICIAL_GSFC_ROUTES_2026, getStudentAssignedRoute } from "../../../shared/data/officialRoutes2026";
import "./LiveTracking.css";

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

const LiveTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStudent, liveBusTelemetry } = useTransit();

  // Resolve student's assigned route automatically
  const assignedRoute = useMemo(() => {
    return getStudentAssignedRoute(currentStudent);
  }, [currentStudent]);

  const assignedBusNo = assignedRoute?.busNo || "GJ-06-BV-2915";

  // Check URL query parameters (e.g. ?route=ROUTE-2 or ?bus=GJ-06-BX-3670)
  const queryParams = new URLSearchParams(location.search);
  const routeParam = queryParams.get("route");
  const busParam = queryParams.get("bus");

  // Determine initial selected route (student's assigned route is selected first by default!)
  const defaultRoute = useMemo(() => {
    if (routeParam) {
      const match = OFFICIAL_GSFC_ROUTES_2026.find((r) => r.routeId === routeParam);
      if (match) return match;
    }
    if (busParam) {
      const match = OFFICIAL_GSFC_ROUTES_2026.find((r) => r.busNo === busParam);
      if (match) return match;
    }
    return assignedRoute;
  }, [routeParam, busParam, assignedRoute]);

  const [selectedRouteId, setSelectedRouteId] = useState(defaultRoute.routeId);

  // Sync when defaultRoute changes
  useEffect(() => {
    if (routeParam || busParam) {
      setSelectedRouteId(defaultRoute.routeId);
    } else {
      setSelectedRouteId(defaultRoute.routeId);
    }
  }, [routeParam, busParam, defaultRoute]);

  const activeRoute = useMemo(() => {
    return OFFICIAL_GSFC_ROUTES_2026.find((r) => r.routeId === selectedRouteId) || defaultRoute;
  }, [selectedRouteId, defaultRoute]);

  const isAlternativeBus = activeRoute.busNo !== assignedBusNo;

  // Ordered list of routes: student's assigned route appears FIRST so they see their route immediately
  const orderedRoutes = useMemo(() => {
    const rest = OFFICIAL_GSFC_ROUTES_2026.filter((r) => r.routeId !== assignedRoute.routeId);
    return [assignedRoute, ...rest];
  }, [assignedRoute]);

  // Telemetry for the active selected bus
  const telemetry =
    (liveBusTelemetry && liveBusTelemetry[activeRoute.busNo]) ||
    (liveBusTelemetry && liveBusTelemetry[activeRoute.routeId]) ||
    (activeRoute.busNo === assignedBusNo && liveBusTelemetry && liveBusTelemetry[currentStudent?.busId]) ||
    (activeRoute.busNo === assignedBusNo && liveBusTelemetry && liveBusTelemetry["BUS-104"]) ||
    {};

  const speed = Number(telemetry.speed) || 42;
  const isDeviceGps = Boolean(telemetry.isDeviceGps);
  const nextStopIndex =
    telemetry.nextStopIndex !== undefined
      ? telemetry.nextStopIndex
      : Math.min(2, activeRoute.stops.length - 1);
  const nextStopName = activeRoute.stops[nextStopIndex]?.name || "GSFC University";
  const etaMinutes = telemetry.etaMinutes || 6;
  const lat = Number(telemetry.lat) || activeRoute.stops[Math.max(0, nextStopIndex - 1)]?.lat || 22.3485;
  const lng = Number(telemetry.lng) || activeRoute.stops[Math.max(0, nextStopIndex - 1)]?.lng || 73.1795;
  const driverName = telemetry.driverName || activeRoute.driverName || "Mahesh Patel";
  const driverPhone = telemetry.driverPhone || activeRoute.driverPhone || "+91 98765 11111";

  // Checkpoints for right-hand column timeline
  const routeStops = useMemo(() => {
    return activeRoute.stops.map((stop, idx) => {
      const isDestination = stop.isDestination || idx === activeRoute.stops.length - 1;
      const isPassed = idx < nextStopIndex;
      const isNext = idx === nextStopIndex;
      return {
        ...stop,
        eta: isPassed ? "Departed" : isNext ? `${etaMinutes} min` : isDestination ? "Destination" : "Upcoming",
        status: isPassed ? "passed" : isNext ? "approaching" : isDestination ? "destination" : "upcoming",
      };
    });
  }, [activeRoute, nextStopIndex, etaMinutes]);

  const handleCallDriver = () => {
    const confirmCall = window.confirm(`Call ${driverName} (Bus ${activeRoute.busNo}) at ${driverPhone}?`);
    if (confirmCall) {
      window.open(`tel:${driverPhone.replace(/\s+/g, "")}`, "_self");
    }
  };

  return (
    <div className="student-view-wrap">
      <div className="lt-root-container">

        {/* ── ASSIGNED ROUTE & FLEET ROUTE SELECTOR CAROUSEL ────────── */}
        <div className="lt-alt-bus-bar">
          <div className="lt-alt-bus-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{isAlternativeBus ? "🔀" : "★"}</span>
              <div>
                <strong style={{ color: "#0f172a", fontSize: 14 }}>
                  {isAlternativeBus
                    ? `Viewing Alternative Bus ${activeRoute.busNo} (Route ${activeRoute.routeNumber})`
                    : `★ Your Assigned Route ${activeRoute.routeNumber} (${activeRoute.busNo}) · Auto-Selected`}
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                  {isAlternativeBus
                    ? `You clicked to track alternative Bus ${activeRoute.busNo}. Your regular allocated bus is ${assignedBusNo}.`
                    : `Your assigned route is shown first automatically without clicking. Click any other route below to check its live location:`}
                </p>
              </div>
            </div>
            {isAlternativeBus && (
              <button
                className="lt-reset-bus-btn"
                onClick={() => setSelectedRouteId(assignedRoute.routeId)}
              >
                ↺ Return to My Assigned Bus ({assignedBusNo})
              </button>
            )}
          </div>

          {/* 13 Official Routes Horizontal Selector with Assigned Route First */}
          <div className="lt-route-chips-scroll">
            {orderedRoutes.map((rt) => {
              const isSelected = rt.routeId === activeRoute.routeId;
              const isMyBus = rt.busNo === assignedBusNo;
              const firstStopShort = rt.stops[0].name.split("(")[0].trim();
              return (
                <button
                  key={rt.routeId}
                  className={`lt-route-chip ${isSelected ? "is-active" : ""}`}
                  onClick={() => setSelectedRouteId(rt.routeId)}
                  style={isMyBus ? { borderColor: isSelected ? "#0066ff" : "#86efac", background: isSelected ? undefined : "#f0fdf4" } : undefined}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <span className="lt-chip-number">Route {rt.routeNumber}</span>
                    {isMyBus && (
                      <span className="lt-chip-badge" style={{ background: "#16a34a", color: "#ffffff", fontWeight: 800 }}>
                        ★ My Route
                      </span>
                    )}
                  </div>
                  <strong className="lt-chip-busno">{rt.busNo}</strong>
                  <span className="lt-chip-origin">{firstStopShort} ➔ GSFC</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TOP HERO TRIP METRICS ──────────────────────────── */}
        <div className="lt-hero-banner" style={{ background: isAlternativeBus ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : undefined }}>
          <div className="lt-hero-main">
            <div className="lt-hero-bus-icon">
              <BusIcon size={28} color="#ffffff" />
            </div>
            <div>
              <div className="lt-hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {isAlternativeBus
                  ? "🔀 Alternative Bus · Live Location"
                  : "★ My Assigned Bus · Auto-Connected"}
                {isDeviceGps && (
                  <span style={{ background: "#22c55e", color: "#fff", padding: "1px 6px", borderRadius: 10, fontSize: 10, marginLeft: 6 }}>
                    🛰 GPS Live
                  </span>
                )}
              </div>
              <h2 className="lt-hero-title">{activeRoute.busNo} • {activeRoute.displayName}</h2>
              <p className="lt-hero-sub">Pilot: <strong>{driverName}</strong> (Ph: {driverPhone})</p>
            </div>
          </div>

          <div className="lt-hero-stats">
            <div className="lt-stat-box">
              <span className="lt-stat-label">Next Stop ({nextStopName})</span>
              <span className="lt-stat-val">{etaMinutes} min ETA</span>
            </div>
            <div className="lt-stat-box">
              <span className="lt-stat-label">Live Speed</span>
              <span className="lt-stat-val">{speed} km/h</span>
            </div>
            <div className="lt-stat-box">
              <span className="lt-stat-label">Destination</span>
              <span className="lt-stat-val">GSFC University</span>
            </div>
          </div>
        </div>

        {/* ── MAIN TWO-COLUMN VIEW (MAP & ROUTE PROGRESS) ──────── */}
        <div className="lt-grid-two">

          {/* Left: Big Live Interactive Map */}
          <div className="lt-card lt-card--map">
            <div className="lt-card-header">
              <div>
                <h3 className="lt-card-title">Live Route Telemetry</h3>
                <p className="lt-card-sub">
                  Google Maps route line · Bus {activeRoute.busNo} (Route {activeRoute.routeNumber})
                </p>
              </div>
              <button className="lt-sos-top-btn" onClick={() => navigate("/student/emergency")}>
                🚨 Emergency SOS
              </button>
            </div>

            <RealMapView
              singleBus={{
                busId: activeRoute.busNo,
                regNo: activeRoute.busNo,
                routeName: activeRoute.displayName,
                driverName,
                driverPhone,
                lat,
                lng,
                speed,
                etaMinutes,
                nextStop: nextStopName,
                nextStopIndex,
                status: "On Route",
                occupancy: 32,
                capacity: activeRoute.capacity || 50,
              }}
              routeStops={activeRoute.stops}
              height="400px"
              showControls={true}
              isLiveBroadcasting={telemetry.isLiveBroadcasting !== false}
            />

            <div className="lt-map-actions">
              <button className="lt-map-action-btn" onClick={handleCallDriver}>
                <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" size={16} stroke="#0066ff" />
                <span>Call Driver ({driverName})</span>
              </button>
              <button className="lt-map-action-btn" onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert(`Live tracking link for ${activeRoute.busNo} copied to clipboard!`);
              }}>
                <Icon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" size={16} stroke="#0066ff" />
                <span>Share Bus Link</span>
              </button>
              <button className="lt-map-action-btn" onClick={() => navigate("/student/schedule")}>
                <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={16} stroke="#0066ff" />
                <span>Official Timetable</span>
              </button>
            </div>
          </div>

          {/* Right: Checkpoint Stops Timeline */}
          <div className="lt-card">
            <div className="lt-card-header">
              <div>
                <h3 className="lt-card-title">Route Checkpoints ({activeRoute.stops.length} Stops)</h3>
                <p className="lt-card-sub">Route {activeRoute.routeNumber} ({activeRoute.busNo})</p>
              </div>
              <span className="lt-status-pill">● On Route</span>
            </div>

            <div className="lt-timeline-list">
              {routeStops.map((stop, idx) => (
                <div key={idx} className={`lt-timeline-item lt-timeline-item--${stop.status}`}>
                  <div className="lt-timeline-node">
                    <div className="lt-node-circle" />
                    {idx < routeStops.length - 1 && <div className="lt-node-line" />}
                  </div>

                  <div className="lt-timeline-content">
                    <div className="lt-timeline-title-row">
                      <p className="lt-stop-name">{stop.name}</p>
                      <span className={`lt-eta-tag lt-eta-tag--${stop.status}`}>{stop.eta}</span>
                    </div>
                    <p className="lt-stop-time">Scheduled Departure: {stop.time || "07:45 AM"}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Transfer notice */}
            <div className="lt-delay-notice">
              <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={18} stroke="#0066ff" />
              <span>
                {isAlternativeBus
                  ? `Commuter Notice: You can board this bus at any upcoming checkpoint with your active GLOW Digital Pass.`
                  : "All university buses stop at GSFC Main Campus Gate before 08:20 AM."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
