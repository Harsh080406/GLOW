import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import "./MyBookings.css";
import "./StudentSettings.css";

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

const Toggle = ({ checked, onChange, label }) => (
  <label className="st-toggle-label" aria-label={label}>
    <input type="checkbox" checked={checked} onChange={onChange} className="st-toggle-input" />
    <span className={`st-toggle-track ${checked ? "st-toggle-track--on" : ""}`}>
      <span className={`st-toggle-thumb ${checked ? "st-toggle-thumb--on" : ""}`} />
    </span>
  </label>
);

const StudentSettings = () => {
  const navigate = useNavigate();
  const [activeNav,    setActiveNav]    = useState("settings");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [prefs, setPrefs] = useState({
    pushNotif: true,
    emailNotif: true,
    smsNotif: false,
    busArrival: true,
    routeChange: true,
    promotions: false,
    darkMode: false,
    language: "English",
    boarding: "Helmet Circle",
  });

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

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
  };

  return (
    <div className="st-root">
      {/* SIDEBAR */}
      <aside className={`sd-sidebar ${sidebarOpen ? "sd-sidebar--open" : ""}`}>
        <div className="sd-brand">
          <div className="sd-brand-icon"><BusIcon size={22} color="#fff" /></div>
          <div><div className="sd-brand-name">CampusBus</div><div className="sd-brand-sub">Student Portal</div></div>
        </div>
        <nav className="sd-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={`sd-nav-item ${activeNav === item.id ? "sd-nav-item--active" : ""}`}
              onClick={() => handleNavClick(item.id)} aria-current={activeNav === item.id ? "page" : undefined}>
              <Icon d={item.icon} size={18} /><span>{item.label}</span>
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
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} /><span>Logout</span>
        </button>
      </aside>
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      {/* MAIN */}
      <div className="st-main">
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
            <button className="sd-notif-btn"><Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={20} /><span className="sd-notif-dot">3</span></button>
            <div className="sd-avatar">ST</div>
            <div className="sd-avatar-info"><span className="sd-avatar-name">Student</span><span className="sd-avatar-uni">GLOW Student</span></div>
          </div>
        </header>

        <main className="st-content">
          <nav className="mb-breadcrumb">
            <button className="mb-bc-link" onClick={() => navigate("/student/dashboard")}>
              <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={13} />Dashboard
            </button>
            <span className="mb-bc-sep">›</span>
            <span className="mb-bc-current">Settings</span>
          </nav>

          <div><h2 className="mb-page-title">Settings</h2><p className="mb-page-sub">Manage your preferences and account settings.</p></div>

          <div className="st-grid">
            {/* Notifications */}
            <div className="st-card">
              <div className="st-section-head">
                <span className="st-section-icon" style={{ background: "#eff6ff" }}>
                  <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={18} stroke="#3b82f6" />
                </span>
                <h3 className="st-section-title">Notifications</h3>
              </div>
              {[
                { key: "pushNotif",   label: "Push Notifications",  sub: "Receive notifications on your device" },
                { key: "emailNotif",  label: "Email Notifications",  sub: "Receive updates via email" },
                { key: "smsNotif",    label: "SMS Notifications",    sub: "Receive SMS alerts for bus updates" },
                { key: "busArrival",  label: "Bus Arrival Alerts",   sub: "Get notified 5 min before bus arrives" },
                { key: "routeChange", label: "Route Change Alerts",  sub: "Notified when route timings change" },
                { key: "promotions",  label: "Offers & Promotions",  sub: "Receive promotional messages" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="st-setting-row">
                  <div><p className="st-row-label">{label}</p><p className="st-row-sub">{sub}</p></div>
                  <Toggle checked={prefs[key]} onChange={() => toggle(key)} label={label} />
                </div>
              ))}
            </div>

            {/* Appearance */}
            <div className="st-card">
              <div className="st-section-head">
                <span className="st-section-icon" style={{ background: "#f5f3ff" }}>
                  <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" size={18} stroke="#8b5cf6" />
                </span>
                <h3 className="st-section-title">Appearance</h3>
              </div>
              <div className="st-setting-row">
                <div><p className="st-row-label">Dark Mode</p><p className="st-row-sub">Switch to dark theme</p></div>
                <Toggle checked={prefs.darkMode} onChange={() => toggle("darkMode")} label="Dark Mode" />
              </div>
              <div className="st-setting-row">
                <div><p className="st-row-label">Language</p><p className="st-row-sub">App display language</p></div>
                <select className="st-select" value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                  <option>English</option><option>Gujarati</option><option>Hindi</option>
                </select>
              </div>

              <div className="st-section-head" style={{ marginTop: 20 }}>
                <span className="st-section-icon" style={{ background: "#f0fdf4" }}>
                  <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={18} stroke="#22c55e" />
                </span>
                <h3 className="st-section-title">Travel Preferences</h3>
              </div>
              <div className="st-setting-row">
                <div><p className="st-row-label">Default Boarding Point</p><p className="st-row-sub">Your preferred pickup location</p></div>
                <select className="st-select" value={prefs.boarding} onChange={e => setPrefs(p => ({ ...p, boarding: e.target.value }))}>
                  <option>Navrangpura</option><option>Helmet Circle</option><option>Science City Road</option>
                  <option>Commerce Six Road</option><option>Gujarat University</option><option>Law Garden</option>
                </select>
              </div>
            </div>

            {/* Account actions */}
            <div className="st-card">
              <div className="st-section-head">
                <span className="st-section-icon" style={{ background: "#fef2f2" }}>
                  <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01" size={18} stroke="#ef4444" />
                </span>
                <h3 className="st-section-title">Account</h3>
              </div>
              {[
                { label: "Change Password",       icon: "M15 7a2 2 0 1 1 4 0v3H5V7a2 2 0 1 1 4 0M12 12v4M10 12H14", color: "#3b82f6" },
                { label: "Privacy Settings",      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",               color: "#8b5cf6" },
                { label: "Download My Data",      icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3", color: "#22c55e" },
                { label: "Delete Account",        icon: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",                         color: "#ef4444" },
              ].map(({ label, icon, color }) => (
                <button key={label} className="st-action-row">
                  <span className="st-action-icon" style={{ color, background: color + "14" }}>
                    <Icon d={icon} size={17} stroke={color} />
                  </span>
                  <span className="st-action-label" style={label === "Delete Account" ? { color: "#ef4444" } : {}}>{label}</span>
                  <Icon d="M9 18l6-6-6-6" size={16} stroke="#bdc3cc" />
                </button>
              ))}
            </div>
          </div>

          <div className="st-save-bar">
            <button className="st-save-btn">Save Settings</button>
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

export default StudentSettings;
