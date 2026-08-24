import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import "./MyBookings.css";
import "./TimeTable.css";

/* ── SVG helpers ──────────────────────────────────────────── */
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

/* ── Nav items ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "bookings",  label: "My Bookings",    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { id: "tracking",  label: "Live Tracking",  icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
  { id: "routes",    label: "Bus Routes",     icon: "M3 12h18M3 6h18M3 18h18" },
  { id: "timetable", label: "Time Table",     icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { id: "notif",     label: "Notifications",  icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", badge: 3 },
  { id: "profile",   label: "Profile",        icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { id: "settings",  label: "Settings",       icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
];

/* ── Timetable data ─────────────────────────────────────────── */
const ROUTES = [
  { id: "2a", label: "Route 2A – Navrangpura to University Campus" },
  { id: "3b", label: "Route 3B – Memnagar to University Campus" },
  { id: "1c", label: "Route 1C – Satellite to University Campus" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Stop data per route
const ROUTE_META = {
  "2a": { name: "Route 2A", path: "Navrangpura to University Campus", stops: 7, distance: "12.6 km", duration: "~ 20 min" },
  "3b": { name: "Route 3B", path: "Memnagar to University Campus",    stops: 6, distance: "10.2 km", duration: "~ 18 min" },
  "1c": { name: "Route 1C", path: "Satellite to University Campus",   stops: 8, distance: "15.4 km", duration: "~ 28 min" },
};

// Stops + 5 trip times (each trip offset by +30min)
const STOPS_DATA = {
  "2a": [
    { num: 1,     name: "Navrangpura",      loc: "Navrangpura Bus Stop, Near HDFC Bank",          tag: "Start Point", base: [7*60+30, 8*60+0, 8*60+30, 9*60+0, 9*60+30] },
    { num: 2,     name: "Helmet Circle",    loc: "Helmet Circle Bus Stop, Opp. City Gold",         tag: null,          base: [7*60+35, 8*60+5, 8*60+35, 9*60+5, 9*60+35] },
    { num: 3,     name: "Science City Road",loc: "Science City Road Bus Stop, Near Shukan Mall",  tag: null,          base: [7*60+38, 8*60+8, 8*60+38, 9*60+8, 9*60+38] },
    { num: 4,     name: "Commerce Six Road",loc: "Commerce Six Road Bus Stop, Opp. IMAX",          tag: null,          base: [7*60+42, 8*60+12,8*60+42, 9*60+12,9*60+42] },
    { num: 5,     name: "Gujarat University",loc:"Gujarat University Bus Stop, Library Gate",      tag: null,          base: [7*60+45, 8*60+15,8*60+45, 9*60+15,9*60+45] },
    { num: 6,     name: "Law Garden",       loc: "Law Garden Bus Stop, Near Metro Station",        tag: null,          base: [7*60+48, 8*60+18,8*60+48, 9*60+18,9*60+48] },
    { num: "END", name: "University Campus",loc: "University Main Bus Bay",                        tag: "End Point",   base: [7*60+50, 8*60+20,8*60+50, 9*60+20,9*60+50] },
  ],
  "3b": [
    { num: 1,     name: "Memnagar",         loc: "Memnagar Fire Station Bus Stop",                 tag: "Start Point", base: [7*60+45, 8*60+15,8*60+45, 9*60+15,9*60+45] },
    { num: 2,     name: "Naranpura",        loc: "Naranpura Cross Roads Bus Stop",                 tag: null,          base: [7*60+50, 8*60+20,8*60+50, 9*60+20,9*60+50] },
    { num: 3,     name: "Paldi",            loc: "Paldi Bus Stop, Near HP Petrol",                 tag: null,          base: [7*60+54, 8*60+24,8*60+54, 9*60+24,9*60+54] },
    { num: 4,     name: "Ambawadi",         loc: "Ambawadi Circle Bus Stop",                       tag: null,          base: [7*60+58, 8*60+28,8*60+58, 9*60+28,9*60+58] },
    { num: 5,     name: "University Area",  loc: "University Area Bus Stop",                       tag: null,          base: [8*60+2,  8*60+32,9*60+2,  9*60+32,10*60+2]  },
    { num: "END", name: "University Campus",loc: "University Main Bus Bay",                        tag: "End Point",   base: [8*60+5,  8*60+35,9*60+5,  9*60+35,10*60+5]  },
  ],
  "1c": [
    { num: 1,     name: "Satellite",        loc: "Satellite Cross Roads Bus Stop",                 tag: "Start Point", base: [7*60+20, 7*60+50,8*60+20, 8*60+50,9*60+20] },
    { num: 2,     name: "Jodhpur",          loc: "Jodhpur Cross Roads Bus Stop",                   tag: null,          base: [7*60+26, 7*60+56,8*60+26, 8*60+56,9*60+26] },
    { num: 3,     name: "Judges Bunglow",   loc: "Judges Bunglow Road Bus Stop",                   tag: null,          base: [7*60+30, 8*60+0, 8*60+30, 9*60+0, 9*60+30] },
    { num: 4,     name: "Bodakdev",         loc: "Bodakdev Cross Roads Bus Stop",                  tag: null,          base: [7*60+34, 8*60+4, 8*60+34, 9*60+4, 9*60+34] },
    { num: 5,     name: "Thaltej",          loc: "Thaltej Cross Roads Bus Stop",                   tag: null,          base: [7*60+38, 8*60+8, 8*60+38, 9*60+8, 9*60+38] },
    { num: 6,     name: "Sola",             loc: "Sola Bus Stop, Near Civil Hospital",             tag: null,          base: [7*60+42, 8*60+12,8*60+42, 9*60+12,9*60+42] },
    { num: 7,     name: "Chandkheda",       loc: "Chandkheda Char Rasta Bus Stop",                 tag: null,          base: [7*60+46, 8*60+16,8*60+46, 9*60+16,9*60+46] },
    { num: "END", name: "University Campus",loc: "University Main Bus Bay",                        tag: "End Point",   base: [7*60+50, 8*60+20,8*60+50, 9*60+20,9*60+50] },
  ],
};

// Format minutes → "07:30 AM"
const fmt = (mins) => {
  const h = Math.floor(mins / 60) % 12 || 12;
  const m = mins % 60;
  const ampm = Math.floor(mins / 60) < 12 ? "AM" : "PM";
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`;
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const TimeTable = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav]     = useState("timetable");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("2a");
  const [selectedDay,   setSelectedDay]   = useState("Monday");

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (id === "dashboard") navigate("/student/dashboard");
    if (id === "bookings")  navigate("/student/bookings");
    if (id === "profile")   navigate("/student/profile");
    if (id === "timetable") navigate("/student/timetable");
    if (id === "notif")     navigate("/student/notifications");
    if (id === "tracking")  navigate("/student/tracking");
    if (id === "routes")    navigate("/student/routes");
    if (id === "settings")  navigate("/student/settings");
  };
  const meta  = ROUTE_META[selectedRoute];
  const stops = STOPS_DATA[selectedRoute];

  return (
    <div className="tt-root">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`sd-sidebar ${sidebarOpen ? "sd-sidebar--open" : ""}`}>
        <div className="sd-brand">
          <div className="sd-brand-icon"><BusIcon size={22} color="#fff" /></div>
          <div>
            <div className="sd-brand-name">CampusBus</div>
            <div className="sd-brand-sub">Student Portal</div>
          </div>
        </div>
        <nav className="sd-nav" aria-label="Sidebar navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.id}
              className={`sd-nav-item ${activeNav === item.id ? "sd-nav-item--active" : ""}`}
              onClick={() => handleNavClick(item.id)}
              aria-current={activeNav === item.id ? "page" : undefined}
            >
              <Icon d={item.icon} size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="sd-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sd-promo">
          <div className="sd-promo-bus"><BusIcon size={48} color="#22c55e" /></div>
          <p className="sd-promo-title">Travel Smart,<br />Stay Safe</p>
          <p className="sd-promo-sub">Track, Book and Travel with ease.</p>
        </div>
        <button className="sd-logout" onClick={() => navigate("/")}>
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && (
        <div className="sd-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ── MAIN ────────────────────────────────────────────── */}
      <div className="tt-main">

        {/* Top bar */}
        <header className="sd-topbar">
          <button className="sd-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
          </button>
          <div className="sd-greeting">
            <h1 className="sd-greeting-main">Hello, Student! 👋</h1>
          </div>
          <div className="sd-search-wrap">
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
            <input className="sd-search" placeholder="Search buses, routes..." aria-label="Search" />
          </div>
          <div className="sd-topbar-right">
            <button className="sd-notif-btn" aria-label="Notifications">
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={20} />
              <span className="sd-notif-dot">3</span>
            </button>
            <div className="sd-avatar">ST</div>
            <div className="sd-avatar-info">
              <span className="sd-avatar-name">Student</span>
              <span className="sd-avatar-uni">GLOW Student</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="tt-content">

          {/* Breadcrumb */}
          <nav className="mb-breadcrumb" aria-label="Breadcrumb">
            <button className="mb-bc-link" onClick={() => navigate("/student/dashboard")}>
              <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={13} />
              Dashboard
            </button>
            <span className="mb-bc-sep" aria-hidden="true">›</span>
            <span className="mb-bc-current">Time Table</span>
          </nav>

          {/* Page heading */}
          <div>
            <h2 className="mb-page-title">Time Table</h2>
            <p className="mb-page-sub">View bus schedules for your routes.</p>
          </div>

          {/* ── FILTERS ──────────────────────────────────────── */}
          <div className="tt-filters">
            <div className="tt-filter-group">
              <label className="tt-filter-label" htmlFor="route-select">Select Route</label>
              <div className="tt-select-wrap">
                <select
                  id="route-select"
                  className="tt-select"
                  value={selectedRoute}
                  onChange={e => setSelectedRoute(e.target.value)}
                >
                  {ROUTES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <Icon d="M6 9l6 6 6-6" size={16} stroke="#7c8494" />
              </div>
            </div>
            <div className="tt-filter-group">
              <label className="tt-filter-label" htmlFor="day-select">Select Day</label>
              <div className="tt-select-wrap">
                <select
                  id="day-select"
                  className="tt-select"
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value)}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <Icon d="M6 9l6 6 6-6" size={16} stroke="#7c8494" />
              </div>
            </div>
            <div className="tt-notice">
              <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01" size={18} stroke="#16a34a" />
              <p>All timings are subject to traffic conditions and may vary slightly.</p>
            </div>
          </div>

          {/* ── ROUTE SUMMARY CARD ───────────────────────────── */}
          <div className="tt-card tt-route-summary">
            <div className="tt-rs-icon">
              <BusIcon size={30} color="#22c55e" />
            </div>
            <div className="tt-rs-name">
              <p className="tt-rs-route">{meta.name}</p>
              <p className="tt-rs-path">{meta.path}</p>
            </div>
            <div className="tt-rs-stat">
              <p className="tt-rs-stat-label">Total Stops</p>
              <p className="tt-rs-stat-val">{meta.stops} <span className="tt-rs-stat-note">(Including Start &amp; End)</span></p>
            </div>
            <div className="tt-rs-divider" aria-hidden="true" />
            <div className="tt-rs-stat">
              <p className="tt-rs-stat-label">Total Distance</p>
              <p className="tt-rs-stat-val">{meta.distance}</p>
            </div>
            <div className="tt-rs-divider" aria-hidden="true" />
            <div className="tt-rs-stat">
              <p className="tt-rs-stat-label">Total Duration</p>
              <p className="tt-rs-stat-val">{meta.duration}</p>
            </div>
          </div>

          {/* ── SCHEDULE TABLE ───────────────────────────────── */}
          <div className="tt-card tt-table-card">
            <div className="tt-table-header">
              <div className="tt-table-title-wrap">
                <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={18} stroke="#1a1d23" />
                <h3 className="tt-table-title">{selectedDay} Schedule</h3>
              </div>
              <div className="tt-table-right">
                <span className="tt-effective">Effective from 01 Aug 2026</span>
                <button className="tt-download">
                  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={14} stroke="#22c55e" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="tt-table-wrap">
              <table className="tt-table" aria-label={`${selectedDay} schedule for ${meta.name}`}>
                <thead>
                  <tr>
                    <th className="tt-th tt-th-num">Stop No.</th>
                    <th className="tt-th tt-th-name">Boarding Point</th>
                    <th className="tt-th">Trip 1</th>
                    <th className="tt-th">Trip 2</th>
                    <th className="tt-th">Trip 3</th>
                    <th className="tt-th">Trip 4</th>
                    <th className="tt-th">Trip 5</th>
                  </tr>
                </thead>
                <tbody>
                  {stops.map((stop, i) => (
                    <tr key={i} className={`tt-tr ${stop.num === "END" ? "tt-tr--end" : ""}`}>
                      {/* Stop number */}
                      <td className="tt-td tt-td-num">
                        <span className={`tt-stop-circle ${
                          stop.num === 1 || stop.num === "END"
                            ? stop.num === "END" ? "tt-stop-circle--end" : "tt-stop-circle--start"
                            : "tt-stop-circle--mid"
                        }`}>
                          {stop.num === "END" ? "END" : stop.num}
                        </span>
                      </td>
                      {/* Boarding point */}
                      <td className="tt-td tt-td-name">
                        <div className="tt-stop-name-wrap">
                          <span className="tt-stop-name">{stop.name}</span>
                          {stop.tag && (
                            <span className={`tt-stop-tag ${
                              stop.tag === "Start Point" ? "tt-stop-tag--start" : "tt-stop-tag--end"
                            }`}>
                              {stop.tag}
                            </span>
                          )}
                        </div>
                        <span className="tt-stop-loc">{stop.loc}</span>
                      </td>
                      {/* Trip times */}
                      {stop.base.map((mins, ti) => (
                        <td key={ti} className="tt-td tt-td-time">
                          {fmt(mins)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── INFO BANNER ──────────────────────────────────── */}
          <div className="tt-info-banner">
            <div className="tt-info-bus">
              <BusIcon size={56} color="#22c55e" />
            </div>
            <div className="tt-info-item">
              <p className="tt-info-title">Plan Your Journey</p>
              <p className="tt-info-sub">Please reach your boarding point 5 minutes before the scheduled time for a smooth journey.</p>
            </div>
            <div className="tt-info-divider" aria-hidden="true" />
            <div className="tt-info-item tt-info-item--center">
              <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={22} stroke="#22c55e" />
              <p className="tt-info-title">On Time</p>
              <p className="tt-info-sub">Buses run as per schedule</p>
            </div>
            <div className="tt-info-divider" aria-hidden="true" />
            <div className="tt-info-item tt-info-item--center">
              <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM9 12l2 2 4-4" size={22} stroke="#22c55e" />
              <p className="tt-info-title">Safe Journey</p>
              <p className="tt-info-sub">Your safety is our priority</p>
            </div>
            <div className="tt-info-divider" aria-hidden="true" />
            <div className="tt-info-item tt-info-item--center">
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={22} stroke="#22c55e" />
              <p className="tt-info-title">Need Help?</p>
              <p className="tt-info-sub">Contact support for any assistance</p>
            </div>
          </div>

          {/* Footer */}
          <footer className="sd-footer">
            <span>© 2026 CampusBus. All rights reserved.</span>
            <span>Made with ❤️ for students</span>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default TimeTable;

