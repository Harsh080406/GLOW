import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import "./MyBookings.css";
import "./BusRoutes.css";

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
  { id: "dashboard", label: "Dashboard",      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "bookings",  label: "My Bookings",    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { id: "tracking",  label: "Live Tracking",  icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
  { id: "routes",    label: "Bus Routes",     icon: "M3 12h18M3 6h18M3 18h18" },
  { id: "timetable", label: "Time Table",     icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { id: "notif",     label: "Notifications",  icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", badge: 3 },
  { id: "profile",   label: "Profile",        icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { id: "settings",  label: "Settings",       icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
];

const ROUTES = [
  {
    id: "2a", name: "Route 2A", color: "#22c55e",
    from: "Navrangpura", to: "University Campus",
    distance: "12.6 km", duration: "20 min", stops: 7,
    busId: "GJ05AB1234", status: "active",
    stopList: ["Navrangpura", "Helmet Circle", "Science City Road", "Commerce Six Road", "Gujarat University", "Law Garden", "University Campus"],
  },
  {
    id: "3b", name: "Route 3B", color: "#f59e0b",
    from: "Memnagar", to: "University Campus",
    distance: "10.2 km", duration: "18 min", stops: 6,
    busId: "GJ05CD5678", status: "delayed",
    stopList: ["Memnagar", "Naranpura", "Paldi", "Ambawadi", "University Area", "University Campus"],
  },
  {
    id: "1c", name: "Route 1C", color: "#3b82f6",
    from: "Satellite", to: "University Campus",
    distance: "15.4 km", duration: "28 min", stops: 8,
    busId: "GJ05EF9012", status: "active",
    stopList: ["Satellite", "Jodhpur", "Judges Bunglow", "Bodakdev", "Thaltej", "Sola", "Chandkheda", "University Campus"],
  },
  {
    id: "4d", name: "Route 4D", color: "#8b5cf6",
    from: "Chandlodiya", to: "University Campus",
    distance: "8.8 km", duration: "15 min", stops: 5,
    busId: "GJ05GH3456", status: "active",
    stopList: ["Chandlodiya", "New Ranip", "Sabarmati", "Motera", "University Campus"],
  },
];

const BusRoutes = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav]     = useState("routes");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded]       = useState(null);

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (id === "dashboard") navigate("/student/dashboard");
    if (id === "bookings")  navigate("/student/bookings");
    if (id === "profile")   navigate("/student/profile");
    if (id === "timetable") navigate("/student/timetable");
    if (id === "notif")     navigate("/student/notifications");
    if (id === "tracking")  navigate("/student/tracking");
    if (id === "settings")  navigate("/student/settings");
  };

  return (
    <div className="br-root">
      {/* SIDEBAR */}
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
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      {/* MAIN */}
      <div className="br-main">
        <header className="sd-topbar">
          <button className="sd-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
          </button>
          <div className="sd-greeting"><h1 className="sd-greeting-main">Hello, Student! 👋</h1></div>
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

        <main className="br-content">
          {/* Breadcrumb */}
          <nav className="mb-breadcrumb" aria-label="Breadcrumb">
            <button className="mb-bc-link" onClick={() => navigate("/student/dashboard")}>
              <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={13} />Dashboard
            </button>
            <span className="mb-bc-sep">›</span>
            <span className="mb-bc-current">Bus Routes</span>
          </nav>

          <div>
            <h2 className="mb-page-title">Bus Routes</h2>
            <p className="mb-page-sub">All available routes from your campus.</p>
          </div>

          {/* Summary stats */}
          <div className="br-stats">
            {[
              { label: "Total Routes",    value: "4",   icon: "M3 12h18M3 6h18M3 18h18",                                                                             color: "#22c55e", bg: "#f0fdf4" },
              { label: "Active Buses",    value: "3",   icon: "M3 12h18M3 6h18M3 18h18",                                                                             color: "#3b82f6", bg: "#eff6ff" },
              { label: "Total Stops",     value: "26",  icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",                            color: "#8b5cf6", bg: "#f5f3ff" },
              { label: "Routes Available","value": "4", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",                                              color: "#f59e0b", bg: "#fffbeb" },
            ].map((s) => (
              <div key={s.label} className="br-stat-card">
                <div className="br-stat-icon" style={{ background: s.bg }}>
                  <Icon d={s.icon} size={22} stroke={s.color} />
                </div>
                <div>
                  <p className="br-stat-value">{s.value}</p>
                  <p className="br-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Route cards */}
          <div className="br-route-list">
            {ROUTES.map((route) => (
              <div key={route.id} className="br-route-card">
                <div className="br-route-top">
                  {/* Color bar */}
                  <div className="br-route-color-bar" style={{ background: route.color }} />

                  <div className="br-route-head">
                    <div className="br-route-icon" style={{ background: route.color + "18", border: `1px solid ${route.color}33` }}>
                      <BusIcon size={24} color={route.color} />
                    </div>
                    <div>
                      <h3 className="br-route-name">{route.name}</h3>
                      <p className="br-route-path">{route.from} → {route.to}</p>
                    </div>
                    <span className={`br-status-tag ${route.status === "active" ? "br-status--active" : "br-status--delayed"}`}>
                      {route.status === "active" ? "● On Time" : "⚠ Delayed"}
                    </span>
                  </div>

                  <div className="br-route-meta">
                    <div className="br-meta-item">
                      <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={15} stroke="#7c8494" />
                      <span>{route.distance}</span>
                    </div>
                    <div className="br-meta-item">
                      <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={15} stroke="#7c8494" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="br-meta-item">
                      <Icon d="M3 12h18M3 6h18M3 18h18" size={15} stroke="#7c8494" />
                      <span>{route.stops} stops</span>
                    </div>
                    <div className="br-meta-item">
                      <BusIcon size={15} color="#7c8494" />
                      <span>{route.busId}</span>
                    </div>
                  </div>

                  <div className="br-route-actions">
                    <button className="br-track-btn" onClick={() => navigate("/student/tracking")}>
                      <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={14} stroke={route.color} />
                      Track Bus
                    </button>
                    <button className="br-expand-btn" onClick={() => setExpanded(expanded === route.id ? null : route.id)}>
                      <Icon d={expanded === route.id ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} size={16} stroke="#7c8494" />
                      {expanded === route.id ? "Hide Stops" : "View Stops"}
                    </button>
                  </div>
                </div>

                {/* Expandable stops */}
                {expanded === route.id && (
                  <div className="br-stops-panel">
                    <div className="br-stops-line" style={{ background: route.color + "44" }} />
                    <ul className="br-stops-list">
                      {route.stopList.map((stop, i) => (
                        <li key={i} className="br-stop-item">
                          <div className={`br-stop-dot ${i === 0 ? "br-stop-dot--start" : i === route.stopList.length - 1 ? "br-stop-dot--end" : ""}`}
                            style={i !== 0 && i !== route.stopList.length - 1 ? { borderColor: route.color } : {}} />
                          <span className="br-stop-name">{stop}</span>
                          {i === 0 && <span className="br-stop-tag br-stop-tag--start">Start</span>}
                          {i === route.stopList.length - 1 && <span className="br-stop-tag br-stop-tag--end">End</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <footer className="sd-footer">
            <span>© 2026 CampusBus. All rights reserved.</span>
            <span>Made with ❤️ for students</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default BusRoutes;
