import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import RealMapView from "../../../shared/components/RealMapView";
import { getStudentAssignedRoute, OFFICIAL_GSFC_ROUTES_2026 } from "../../../shared/data/officialRoutes2026";
import "./StudentDashboard.css";

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


const StudentDashboardView = () => {
  const navigate = useNavigate();
  const { currentStudent, liveBusTelemetry } = useTransit();
  const student = currentStudent || {};

  // Resolve assigned route automatically for this student
  const assignedRoute = useMemo(() => {
    return getStudentAssignedRoute(currentStudent);
  }, [currentStudent]);

  const busId = assignedRoute?.busNo || currentStudent?.assignedBusRegNo || currentStudent?.busId || "GJ-06-BV-2915";
  const routeName = assignedRoute?.displayName || currentStudent?.routeName || "Route 9 (Tulsidham - Fatehgunj - Nizampura)";
  const routeNumber = assignedRoute?.routeNumber || "9";
  const pickupStop = currentStudent?.pickupStop || currentStudent?.boarding || assignedRoute?.stops?.[2]?.name || "Fatehgunj Stop";
  const pickupTime = currentStudent?.pickupTime || "07:48 AM";
  const feeStatus = currentStudent?.feeStatus || "PAID";
  const pendingFee = currentStudent?.pendingFee || 0;
  const passStatus = currentStudent?.passStatus || currentStudent?.pass || "ACTIVE";

  // Telemetry packet synchronized with driver GPS broadcast
  const telemetry =
    (liveBusTelemetry && liveBusTelemetry[busId]) ||
    (liveBusTelemetry && liveBusTelemetry[assignedRoute?.routeId]) ||
    (liveBusTelemetry && liveBusTelemetry[currentStudent?.busId]) ||
    (liveBusTelemetry && liveBusTelemetry["BUS-104"]) ||
    {};

  const isDeviceGps = Boolean(telemetry.isDeviceGps);
  const speed = Number(telemetry.speed) || 42;
  const nextStopIndex =
    telemetry.nextStopIndex !== undefined
      ? telemetry.nextStopIndex
      : Math.min(2, (assignedRoute?.stops?.length || 4) - 1);
  const nextStop = telemetry.nextStop || assignedRoute?.stops?.[nextStopIndex]?.name || "Nizampura Char Rasta";
  const etaMinutes = telemetry.etaMinutes || 6;
  const lat = Number(telemetry.lat) || assignedRoute?.stops?.[Math.max(0, nextStopIndex - 1)]?.lat || 22.3365;
  const lng = Number(telemetry.lng) || assignedRoute?.stops?.[Math.max(0, nextStopIndex - 1)]?.lng || 73.1795;
  const driverName = telemetry.driverName || assignedRoute?.driverName || "Mahesh Patel";
  const driverPhone = telemetry.driverPhone || assignedRoute?.driverPhone || "+91 98765 11111";

  const activeDriverNotice =
    telemetry.broadcastMessage ||
    (typeof window !== "undefined" && localStorage.getItem("glow_driver_broadcast_notice")) ||
    "";

  const notifications = [
    ...(activeDriverNotice
      ? [
          {
            type: "warning",
            icon: "📢",
            text: `Driver Alert (${driverName}): ${activeDriverNotice}`,
            time: telemetry.broadcastTime || "Live",
          },
        ]
      : []),
    {
      type: "info",
      icon: "🚌",
      text: `Your assigned bus ${busId} (Route ${routeNumber}) is on route near ${nextStop}. Estimated arrival in ${etaMinutes} min.`,
      time: "Just now"
    },
    {
      type: "neutral",
      icon: "📡",
      text: isDeviceGps
        ? `Pilot ${driverName} broadcasting real device GPS live (${speed} km/h).`
        : `Pilot ${driverName} broadcasting live telemetry (${speed} km/h).`,
      time: "Live sync"
    },
    {
      type: "success",
      icon: "💳",
      text: `Transport Pass ${currentStudent?.passId || "PASS-STU-2026-0125"} verified & active.`,
      time: "1 day ago"
    },
  ];

  return (
    <div className="sdb-view">
      {/* ── DRIVER BROADCAST ISSUE ANNOUNCEMENT BANNER ─────────── */}
      {activeDriverNotice && (
        <div style={{
          background: "#fffbeb",
          border: "1.5px solid #f59e0b",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 10px rgba(245, 158, 11, 0.12)",
        }}>
          <span style={{ fontSize: 24 }}>📢</span>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 13.5, color: "#92400e" }}>
              Live Driver Announcement ({driverName}):
            </strong>
            <div style={{ fontSize: 13.5, color: "#78350f", fontWeight: 700, marginTop: 2 }}>
              {activeDriverNotice}
            </div>
          </div>
          <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
            {telemetry.broadcastTime || "Live"}
          </span>
        </div>
      )}

      {/* ── HERO BUS CARD ──────────────────────────────────────── */}
      <div className="sdb-hero-card">
        <div className="sdb-hero-left">
          <div className="sdb-hero-badge">Today's Assigned Transportation · Auto-Selected</div>
          <div className="sdb-hero-bus-row">
            <div className="sdb-hero-bus-icon">
              <BusIcon size={30} color="#fff" />
            </div>
            <div>
              <h2 className="sdb-hero-bus-id">{busId}</h2>
              <p className="sdb-hero-route">Route: {routeName}</p>
            </div>
          </div>
          <div className="sdb-hero-times">
            <div className="sdb-time-chip">
              <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={15} stroke="rgba(255,255,255,0.9)" />
              <div>
                <p className="sdb-time-label">Pickup Stop</p>
                <p className="sdb-time-val">{pickupStop}</p>
              </div>
            </div>
            <div className="sdb-time-chip">
              <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={15} stroke="rgba(255,255,255,0.9)" />
              <div>
                <p className="sdb-time-label">Scheduled Pickup</p>
                <p className="sdb-time-val">{pickupTime}</p>
              </div>
            </div>
            <div className="sdb-time-chip">
              <Icon d="M5 3l14 9-14 9V3z" size={15} stroke="rgba(255,255,255,0.9)" />
              <div>
                <p className="sdb-time-label">ETA at Stop</p>
                <p className="sdb-time-val">{etaMinutes} min ({speed} km/h)</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <button className="sdb-track-btn" onClick={() => navigate("/student/tracking")}>
              <Icon d="M5 3l14 9-14 9V3z" size={16} stroke="#0066ff" />
              Explore All Fleet Routes
            </button>
            <button
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={() => navigate("/student/my-bus")}
            >
              <BusIcon size={16} color="#ffffff" />
              View My Bus & Crew
            </button>
          </div>
        </div>
      </div>

      {/* ── AUTO-CONNECTED ASSIGNED ROUTE LIVE LOCATION CARD (NO CLICK REQUIRED) ── */}
      <div
        className="sdb-assigned-live-card"
        style={{
          background: "#ffffff",
          borderRadius: 18,
          border: "1.5px solid #bfdbfe",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0, 102, 255, 0.08)",
          marginBottom: 20,
        }}
      >
        {/* Card Header with Badges and Switch Button */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <span
                style={{
                  background: "#22c55e",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  letterSpacing: "0.03em",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "inline-block",
                  }}
                />
                LIVE LOCATION ACTIVE
              </span>
              <span
                style={{
                  background: "#0066ff",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                ★ Your Assigned Route (Auto-Selected · No Click Needed)
              </span>
              {isDeviceGps && (
                <span
                  style={{
                    background: "#059669",
                    color: "#ffffff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  🛰 Driver Device GPS Active
                </span>
              )}
            </div>
            <h3 style={{ margin: "2px 0 4px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              Bus {busId} · {routeName}
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
              Your allocated route is loaded automatically. Approaching: <strong>{nextStop}</strong> · ETA: <strong>{etaMinutes} min</strong> ({speed} km/h) · Pilot: <strong>{driverName}</strong>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate("/student/tracking")}
              style={{
                background: "#ffffff",
                color: "#0066ff",
                border: "1.5px solid #0066ff",
                borderRadius: 10,
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 6px rgba(0, 102, 255, 0.12)",
                transition: "all 0.15s ease",
              }}
              title="Click to track any of the other 12 university fleet buses live"
            >
              <span>🌐</span>
              <span>Click to Track Other Routes Live ➔</span>
            </button>
          </div>
        </div>

        {/* Live Map Display */}
        <RealMapView
          singleBus={{
            busId,
            regNo: busId,
            routeName,
            driverName,
            driverPhone,
            lat,
            lng,
            speed,
            etaMinutes,
          }}
          routeStops={assignedRoute?.stops || []}
          height="350px"
          center={[lat, lng]}
          zoom={13}
          showControls={true}
        />

        {/* Live Telemetry Info Footer Bar */}
        <div
          style={{
            padding: "12px 20px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12.5,
            color: "#475569",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span>
              📍 Approaching Stop: <strong>{nextStop}</strong>
            </span>
            <span>
              ⏱ ETA at Stop: <strong>{etaMinutes} min</strong>
            </span>
            <span>
              🚀 Speed: <strong>{speed} km/h</strong>
            </span>
            <span>
              👤 Driver: <strong>{driverName}</strong> ({driverPhone})
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => window.open(`tel:${driverPhone.replace(/\s+/g, "")}`, "_self")}
              style={{
                background: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              📞 Call Driver
            </button>
            <button
              onClick={() => navigate("/student/tracking")}
              style={{
                background: "#eff6ff",
                color: "#0066ff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Full Screen Tracking ➔
            </button>
          </div>
        </div>
      </div>

      {/* ── STATUS ROW ─────────────────────────────────────────── */}
      <div className="sdb-status-row">
        {[
          {
            label: "Fee Payment Status",
            value: feeStatus === "PAID" ? "PAID" : `PENDING (₹${pendingFee.toLocaleString()})`,
            badgeText: feeStatus === "PAID" ? "Settled" : "Action Needed",
            icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
            isBlue: feeStatus === "PAID",
            path: pendingFee > 0 ? `/student/payment?amount=${pendingFee}` : "/student/fees",
          },
          {
            label: "Transport Pass",
            value: passStatus,
            badgeText: "Active Valid",
            icon: "M20 12V22H4V12M22 7H2v5h20V7z",
            isBlue: true,
            path: "/student/pass",
          },
          {
            label: "Next Scheduled Trip",
            value: pickupTime,
            badgeText: "On Schedule",
            icon: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2",
            isBlue: true,
            path: "/student/schedule",
          },
          {
            label: "Assigned Zone",
            value: student?.zone || currentStudent?.zone || assignedRoute?.zone || "Zone B (East)",
            badgeText: assignedRoute ? `Route ${assignedRoute.routeNumber || routeNumber}` : "Route 9",
            icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            isBlue: true,
            path: "/student/my-route",
          },
        ].map((s, idx) => (
          <div
            key={idx}
            className="sdb-status-card"
            style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            onClick={() => navigate(s.path)}
            title={`Click to view ${s.label}`}
          >
            <div className="sdb-status-card-top">
              <div className="sdb-status-icon">
                <Icon d={s.icon} size={20} stroke="#0066ff" />
              </div>
              <span className="sdb-status-badge">{s.badgeText}</span>
            </div>
            <div className="sdb-status-card-bottom">
              <p className="sdb-status-label">{s.label}</p>
              <p className="sdb-status-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── PENDING FEE INSTANT CHECKOUT BANNER ──────────────── */}
      {pendingFee > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          borderRadius: 14,
          padding: "14px 20px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          boxShadow: "0 6px 20px rgba(37, 99, 235, 0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>💳</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>
                Outstanding Bus Fee: ₹{pendingFee.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Directly clear dues via Payment Gateway to prevent pass deactivation.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/payment?amount=${pendingFee}`)}
            style={{
              background: "#22c55e",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)"
            }}
          >
            Pay Now via Gateway ➔
          </button>
        </div>
      )}
      <div style={{
        background: "#eff6ff",
        border: "1.5px solid #bfdbfe",
        borderRadius: 14,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div>
            <strong style={{ fontSize: 13.5, color: "#1e3a8a" }}>Missed your morning bus?</strong>
            <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>
              12 other official university fleet buses are currently on route to GSFC Campus. Track any bus live & catch it at a nearby stop.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/student/tracking")}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          Find Alternative Bus ➔
        </button>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────────────── */}
      <div className="sdb-quick-section">
        <h3 className="sdb-section-title">Quick Transit Actions</h3>
        <div className="sdb-quick-grid">
          {[
            { label: "My Bus & Crew", icon: "M3 12h18M3 6h18M3 18h18", path: "/student/my-bus" },
            { label: "Route & Stops", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", path: "/student/my-route" },
            { label: "Digital Pass", icon: "M20 12V22H4V12M22 7H2v5h20V7z", path: "/student/pass" },
            { label: "Fees & Invoices", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2", path: "/student/fees" },
            { label: "Transit Timetable", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", path: "/student/schedule" },
            { label: "Support & Help", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", path: "/student/complaints" },
          ].map((q, idx) => (
            <button key={idx} className="sdb-quick-btn" onClick={() => navigate(q.path)}>
              <span className="sdb-quick-icon">
                <Icon d={q.icon} size={20} stroke="#0066ff" />
              </span>
              <span className="sdb-quick-label">{q.label}</span>
              <Icon d="M9 18l6-6-6-6" size={14} stroke="#94a3b8" />
            </button>
          ))}
        </div>
      </div>

      {/* ── TODAY'S SCHEDULE & NOTIFICATIONS ───────────────────── */}
      <div className="sdb-two-col">
        <div className="sdb-card">
          <div className="sdb-card-header">
            <div>
              <h3 className="sdb-card-title">Today's Transit Schedule</h3>
              <p className="sdb-card-sub">Daily fixed route timetable</p>
            </div>
            <button className="sdb-view-all" onClick={() => navigate("/student/schedule")}>View Schedule</button>
          </div>
          <div className="sdb-sched-list">
            {[
              { time: "07:45 AM", label: "Morning Boarding", place: "Fatehgunj Stop", tagLabel: "Boarding" },
              { time: "08:15 AM", label: "Arrival Campus", place: "GSFC University Main Gate", tagLabel: "Campus" },
              { time: "05:00 PM", label: "Evening Boarding", place: "GSFC University Bus Bay", tagLabel: "Return" },
              { time: "05:50 PM", label: "Arrival Home", place: "Fatehgunj Stop", tagLabel: "Drop-off" },
            ].map((s, i) => (
              <div key={i} className="sdb-sched-row">
                <span className="sdb-sched-time">{s.time}</span>
                <div className="sdb-sched-dot" />
                <div className="sdb-sched-info">
                  <p className="sdb-sched-label">{s.label}</p>
                  <p className="sdb-sched-place">{s.place}</p>
                </div>
                <span className="sdb-tag">{s.tagLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="sdb-card">
          <div className="sdb-card-header">
            <div>
              <h3 className="sdb-card-title">Important Alerts</h3>
              <p className="sdb-card-sub">Live updates and notifications</p>
            </div>
            <button className="sdb-view-all" onClick={() => navigate("/student/notifications")}>All Alerts</button>
          </div>
          <div className="sdb-notif-list">
            {notifications.map((n, i) => (
              <div key={i} className="sdb-notif-row">
                <span className="sdb-notif-icon">{n.icon}</span>
                <div className="sdb-notif-body">
                  <p className="sdb-notif-text">{n.text}</p>
                  <p className="sdb-notif-time">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="sdb-sos-btn" onClick={() => navigate("/student/emergency")}>
            <Icon d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={16} stroke="#ffffff" />
            Emergency SOS Alert
          </button>
        </div>
      </div>

      <footer className="sdb-footer">
        <span>© {new Date().getFullYear()} GLOW — Bus Development System.</span>
        <span>GLOW Smart Transit</span>
      </footer>
    </div>
  );
};

export default StudentDashboardView;