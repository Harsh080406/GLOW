import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
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

/* Mini live map */
const MiniMap = ({ progress = 46 }) => {
  const busX = 50 + (progress / 100) * 430;
  const busY = 160 - (progress / 100) * 120;

  return (
    <div className="sdb-map">
      <svg viewBox="0 0 500 180" style={{ width: "100%", height: "100%", display: "block" }}>
        <rect width="500" height="180" fill="#f1f5f9" />
        <rect x="0" y="55" width="500" height="22" fill="#ffffff" opacity="0.8" />
        <rect x="0" y="110" width="500" height="18" fill="#ffffff" opacity="0.7" />
        <rect x="80" y="0" width="18" height="180" fill="#ffffff" opacity="0.7" />
        <rect x="200" y="0" width="15" height="180" fill="#ffffff" opacity="0.7" />
        <rect x="340" y="0" width="18" height="180" fill="#ffffff" opacity="0.7" />
        {[
          [10, 10, 60, 38], [108, 10, 82, 38], [225, 10, 105, 38], [368, 10, 120, 38],
          [10, 85, 60, 18], [108, 85, 82, 18], [225, 85, 105, 18], [368, 85, 120, 18],
          [10, 136, 60, 38], [108, 136, 82, 38], [225, 136, 105, 38], [368, 136, 120, 38],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#e2e8f0" opacity="0.8" />
        ))}
        <polyline points="50,160 99,66 215,66 358,66 480,40" fill="none" stroke="#0066ff" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="160" r="6" fill="#0066ff" stroke="#fff" strokeWidth="2" />
        <circle cx="480" cy="40" r="6" fill="#0f172a" stroke="#fff" strokeWidth="2" />
        {/* Bus position */}
        <g transform={`translate(${busX}, ${busY})`}>
          <circle r="14" fill="#0066ff" stroke="#fff" strokeWidth="2.5" />
          <text x="-6" y="4" fontSize="10">🚌</text>
        </g>
        <text x="30" y="173" fontSize="10" fill="#0066ff" fontWeight="700">Chandkheda Stop</text>
        <text x="400" y="32" fontSize="10" fill="#0f172a" fontWeight="700">University Campus</text>
      </svg>
      <div className="sdb-map-badge-wrap">
        <div className="sdb-live-tag">
          <span className="sdb-pulse-dot" /> 📡 Live Driver Telemetry Feed
        </div>
      </div>
    </div>
  );
};

const StudentDashboardView = () => {
  const navigate = useNavigate();
  const { currentStudent, liveBusTelemetry } = useTransit();

  const student = currentStudent || {};
  const busId = student.busId || "BUS-104";
  const telemetry = (liveBusTelemetry && liveBusTelemetry[busId]) || (liveBusTelemetry && liveBusTelemetry["BUS-104"]) || {};

  const routeName = student.routeName || student.route || "Route 4D (Chandkheda)";
  const pickupStop = student.pickupStop || student.boarding || "Chandkheda Stop";
  const pickupTime = student.pickupTime || "07:45 AM";
  const feeStatus = student.feeStatus || "PAID";
  const pendingFee = student.pendingFee || 0;
  const passStatus = student.passStatus || student.pass || "ACTIVE";

  const etaMinutes = telemetry.etaMinutes || 6;
  const locationName = telemetry.currentLocationName || telemetry.nextStop || "Motera Crossroads";
  const speed = telemetry.speed || 42;

  const notifications = [
    { type: "info", icon: "🚌", text: `Your bus ${busId} is on route near ${locationName}. Estimated arrival in ${etaMinutes} min.`, time: "Just now" },
    { type: "neutral", icon: "👤", text: `Pilot ${telemetry.driverName || "Mahesh Patel"} broadcasting live GPS telemetry (${speed} km/h).`, time: "2 min ago" },
    { type: "success", icon: "💳", text: `Transport Pass ${student.passId || "PASS-STU-2026-0125"} verified & active.`, time: "1 day ago" },
  ];

  return (
    <div className="sdb-view">
      {/* ── HERO BUS CARD ──────────────────────────────────────── */}
      <div className="sdb-hero-card">
        <div className="sdb-hero-left">
          <div className="sdb-hero-badge">Today's Active Transportation</div>
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
          <button className="sdb-track-btn" onClick={() => navigate("/student/tracking")}>
            <Icon d="M5 3l14 9-14 9V3z" size={16} stroke="#0066ff" />
            Track Bus on Live Map
          </button>
        </div>
        <div className="sdb-hero-right">
          <MiniMap progress={telemetry.progressPercent || 46} />
          <p className="sdb-map-label">Bus is near {locationName} · ETA {etaMinutes} min ({speed} km/h)</p>
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
          },
          {
            label: "Transport Pass",
            value: passStatus,
            badgeText: "Active Valid",
            icon: "M20 12V22H4V12M22 7H2v5h20V7z",
            isBlue: true,
          },
          {
            label: "Next Scheduled Trip",
            value: pickupTime,
            badgeText: "On Schedule",
            icon: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2",
            isBlue: true,
          },
          {
            label: "Assigned Zone",
            value: student.zone || "Zone B (East)",
            badgeText: "Route R-04",
            icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            isBlue: true,
          },
        ].map((s, idx) => (
          <div key={idx} className="sdb-status-card">
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
              { time: "07:45 AM", label: "Morning Boarding", place: "Chandkheda Stop", tagLabel: "Boarding" },
              { time: "08:15 AM", label: "Arrival Campus", place: "University Main Gate", tagLabel: "Campus" },
              { time: "05:00 PM", label: "Evening Boarding", place: "University Bus Bay", tagLabel: "Return" },
              { time: "05:50 PM", label: "Arrival Home", place: "Chandkheda Stop", tagLabel: "Drop-off" },
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