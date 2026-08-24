import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import "./MyBookings.css";

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

/* ── Nav items (same as StudentDashboard) ─────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",     icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "bookings",  label: "My Bookings",   icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { id: "tracking",  label: "Live Tracking", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
  { id: "routes",    label: "Bus Routes",    icon: "M3 12h18M3 6h18M3 18h18" },
  { id: "timetable", label: "Time Table",    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { id: "notif",     label: "Notifications", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", badge: 3 },
  { id: "profile",   label: "Profile",       icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { id: "feedback",  label: "Feedback",      icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { id: "settings",  label: "Settings",      icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { id: "help",      label: "Help & Support",icon: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01" },
];

/* ── Route stops data ─────────────────────────────────────── */
const STOPS = [
  { num: "S",   name: "Navrangpura",     tag: "START",            tagType: "start",   time: "08:00 AM", location: "Navrangpura Bus Stop, Near HDFC Bank",         badge: null },
  { num: "1",   name: "Helmet Circle",   tag: null,               tagType: null,      time: "08:05 AM", location: "Helmet Circle Bus Stop, Opp. City Gold",         badge: "your" },
  { num: "2",   name: "Science City Road",tag: null,              tagType: null,      time: "08:08 AM", location: "Science City Road Bus Stop, Near Shukan Mall",   badge: "enroute" },
  { num: "3",   name: "Commerce Six Road",tag: null,              tagType: null,      time: "08:12 AM", location: "Commerce Six Road Bus Stop, Opp. IMAX",          badge: "enroute" },
  { num: "4",   name: "Gujarat University",tag: null,             tagType: null,      time: "08:15 AM", location: "Gujarat University Bus Stop, Library Gate",       badge: "enroute" },
  { num: "5",   name: "Law Garden",      tag: null,               tagType: null,      time: "08:18 AM", location: "Law Garden Bus Stop, Near Metro Station",         badge: "enroute" },
  { num: "END", name: "University Campus", tag: "Drop Point",       tagType: "end",     time: "08:20 AM", location: "University Main Bus Bay",                        badge: "drop" },
];

/* ── Inline route map ─────────────────────────────────────── */
const RouteMap = () => (
  <div className="mb-route-map">
    <svg viewBox="0 0 700 160" xmlns="http://www.w3.org/2000/svg" className="mb-route-svg">
      {/* Background */}
      <rect width="700" height="160" fill="#f8fafc" />
      {/* Road */}
      <rect x="0" y="65" width="700" height="30" fill="#fff" opacity="0.7" />
      {/* City blocks */}
      {[[10,10,80,48],[120,10,90,48],[240,10,80,48],[355,10,80,48],[470,10,80,48],[585,10,90,48],
        [10,105,80,48],[120,105,90,48],[240,105,80,48],[355,105,80,48],[470,105,80,48],[585,105,80,48]
      ].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} rx="5" fill="#e2e8f0" opacity="0.8"/>
      ))}
      {/* Route line */}
      <line x1="60" y1="80" x2="640" y2="80" stroke="#0066ff" strokeWidth="3" strokeLinecap="round"/>
      {/* Stop circles */}
      {[60,165,265,370,470,555,640].map((cx,i)=>(
        <circle key={i} cx={cx} cy="80" r={i===0||i===6?9:7}
          fill={i===1?"#0066ff":i===6?"#0f172a":"#fff"}
          stroke={i===0?"#0066ff":i===6?"#0f172a":"#0066ff"} strokeWidth="2.5"/>
      ))}
      {/* START label */}
      <rect x="28" y="44" width="64" height="20" rx="4" fill="#0066ff"/>
      <text x="60" y="58" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">START</text>
      <text x="60" y="100" textAnchor="middle" fontSize="9" fill="#0066ff" fontWeight="600">Navrangpura</text>
      {/* Stop numbers */}
      {[1,2,3,4,5].map((n,i)=>(
        <text key={n} x={[165,265,370,470,555][i]} y="84" textAnchor="middle" fontSize="9" fill="#0066ff" fontWeight="700">{n}</text>
      ))}
      {/* END label */}
      <rect x="605" y="44" width="70" height="20" rx="4" fill="#0f172a"/>
      <text x="640" y="58" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">END</text>
      <text x="640" y="100" textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="600">University Campus</text>
    </svg>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const MyBookings = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav]   = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cancelled, setCancelled]   = useState(false);

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

  return (
    <div className="mb-root">

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className={`sd-sidebar ${sidebarOpen ? "sd-sidebar--open" : ""}`}>
        <div className="sd-brand">
          <div className="sd-brand-icon">
            <BusIcon size={22} color="#fff" />
          </div>
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

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div className="mb-main">

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
        <main className="mb-content">

          {/* Breadcrumb */}
          <nav className="mb-breadcrumb" aria-label="Breadcrumb">
            <button className="mb-bc-link" onClick={() => navigate("/student/dashboard")}>
              <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={13} />
              Dashboard
            </button>
            <span className="mb-bc-sep" aria-hidden="true">›</span>
            <button className="mb-bc-link">My Bookings</button>
            <span className="mb-bc-sep" aria-hidden="true">›</span>
            <span className="mb-bc-current">Booking Details</span>
          </nav>

          {/* Page heading */}
          <div className="mb-page-header">
            <div>
              <h2 className="mb-page-title">Booking Details</h2>
              <p className="mb-page-sub">View your booking and full route with boarding points.</p>
            </div>
            <button className="mb-back-btn" onClick={() => navigate("/student/dashboard")}>
              <Icon d="M19 12H5M12 5l-7 7 7 7" size={15} />
              Back to My Bookings
            </button>
          </div>

          {/* ── BOOKING CARD ─────────────────────────────── */}
          <div className="mb-card">
            {/* Top: route summary */}
            <div className="mb-card-top">
              <div className="mb-route-head">
                <div className="mb-route-bus-icon">
                  <BusIcon size={30} color="#22c55e" />
                </div>
                <div>
                  <h3 className="mb-route-name">Route 2A</h3>
                  <p className="mb-route-path">Navrangpura to University Campus</p>
                </div>
              </div>

              {/* Progress bar between stops */}
              <div className="mb-route-bar-wrap">
                <div className="mb-route-bar">
                  <span className="mb-rb-dot mb-rb-dot--start" aria-hidden="true" />
                  <div className="mb-rb-line">
                    <div className="mb-rb-fill" style={{ width: "30%" }} />
                  </div>
                  <span className="mb-rb-dot mb-rb-dot--end" aria-hidden="true" />
                </div>
                <div className="mb-route-bar-labels">
                  <div>
                    <p className="mb-rbl-place">Navrangpura</p>
                    <p className="mb-rbl-time">08:00 AM</p>
                  </div>
                  <div className="mb-rbl-right">
                    <p className="mb-rbl-place">University Campus</p>
                    <p className="mb-rbl-time">08:20 AM</p>
                  </div>
                </div>
              </div>

              {/* Booking meta */}
              <div className="mb-booking-meta">
                <div className="mb-meta-left">
                  <div className="mb-meta-group">
                    <p className="mb-meta-label">Booking ID</p>
                    <p className="mb-meta-val mb-meta-val--bold">BK-2026-2456</p>
                  </div>
                  <div className="mb-meta-group">
                    <p className="mb-meta-label">Booking Date</p>
                    <p className="mb-meta-val">
                      <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={13} stroke="#7c8494" />
                      &nbsp;10 Aug 2026
                    </p>
                  </div>
                  <div className="mb-meta-group">
                    <p className="mb-meta-label">Fare</p>
                    <p className="mb-meta-val mb-meta-val--bold">₹0</p>
                    <span className="mb-pass-tag">Student Pass</span>
                  </div>
                </div>
                <div className="mb-meta-right">
                  {cancelled ? (
                    <span className="mb-status-tag mb-status-tag--cancelled">✕ Cancelled</span>
                  ) : (
                    <span className="mb-status-tag mb-status-tag--booked">✓ Booked</span>
                  )}
                  <div className="mb-meta-group">
                    <p className="mb-meta-label">Booking Time</p>
                    <p className="mb-meta-val">08 Aug 2026, 06:45 PM</p>
                  </div>
                  {!cancelled && (
                    <button className="mb-cancel-btn" onClick={() => setCancelled(true)}>
                      <Icon d="M18 6 6 18M6 6l12 12" size={14} stroke="#dc2626" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── BOARDING POINT CARD ───────────────────────── */}
          <div className="mb-card mb-boarding-card">
            <div className="mb-boarding-left">
              <div className="mb-boarding-pin">
                <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" size={28} stroke="#22c55e" />
              </div>
              <div>
                <p className="mb-boarding-label">Your Selected Boarding Point</p>
                <p className="mb-boarding-name">2. Helmet Circle</p>
              </div>
            </div>
            <div className="mb-boarding-mid">
              <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2" size={18} stroke="#7c8494" />
              <div>
                <p className="mb-boarding-time-val">08:05 AM</p>
                <p className="mb-boarding-time-label">Boarding Time</p>
              </div>
            </div>
            <div className="mb-boarding-right">
              <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={18} stroke="#7c8494" />
              <div>
                <p className="mb-boarding-loc">Helmet Circle Bus Stop,</p>
                <p className="mb-boarding-loc">Opp. City Gold</p>
              </div>
            </div>
          </div>

          {/* ── FULL ROUTE OVERVIEW ───────────────────────── */}
          <div className="mb-card">
            <h3 className="mb-section-title">Full Route Overview</h3>
            <div className="mb-route-overview">
              <RouteMap />
              <div className="mb-route-stats">
                <div className="mb-route-stat">
                  <p className="mb-rs-label">Total Distance</p>
                  <p className="mb-rs-val">12.6 km</p>
                </div>
                <div className="mb-route-stat">
                  <p className="mb-rs-label">Total Stops</p>
                  <p className="mb-rs-val">7 <span className="mb-rs-note">(Including Start &amp; End)</span></p>
                </div>
                <div className="mb-route-stat">
                  <p className="mb-rs-label">Total Duration</p>
                  <p className="mb-rs-val">~ 20 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── ALL BOARDING POINTS ───────────────────────── */}
          <div className="mb-card">
            <h3 className="mb-section-title">
              All Boarding Points{" "}
              <span className="mb-section-note">(Please reach 5 minutes before the scheduled time)</span>
            </h3>

            <ul className="mb-stops" aria-label="All boarding points">
              {STOPS.map((stop, i) => (
                <li key={i} className={`mb-stop-row ${stop.badge === "your" ? "mb-stop-row--highlight" : ""}`}>
                  {/* Stop number circle */}
                  <div className={`mb-stop-num ${
                    stop.num === "S"   ? "mb-stop-num--start" :
                    stop.num === "END" ? "mb-stop-num--end"   :
                    stop.badge === "your" ? "mb-stop-num--your" : "mb-stop-num--default"
                  }`}>
                    {stop.num === "S" ? "" : stop.num === "END" ? "END" : stop.num}
                  </div>

                  {/* Connector line (not on last) */}
                  {i < STOPS.length - 1 && (
                    <div className="mb-stop-connector" aria-hidden="true" />
                  )}

                  {/* Name + tag */}
                  <div className="mb-stop-name-wrap">
                    {stop.num === "S" && <span className="mb-inline-tag mb-inline-tag--start">START</span>}
                    <span className="mb-stop-name">{stop.name}</span>
                    {stop.tag && stop.num !== "S" && (
                      <span className={`mb-inline-tag ${stop.num === "END" ? "mb-inline-tag--drop" : ""}`}>
                        {stop.tag}
                      </span>
                    )}
                    {stop.num === "S" && <span className="mb-stop-sub">(Starting Point)</span>}
                  </div>

                  {/* Time */}
                  <span className="mb-stop-time">{stop.time}</span>

                  {/* Location */}
                  <span className="mb-stop-loc">
                    <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={13} stroke="#7c8494" />
                    {stop.location}
                  </span>

                  {/* Badge */}
                  {stop.badge && (
                    <span className={`mb-stop-badge ${
                      stop.badge === "your"    ? "mb-stop-badge--your"    :
                      stop.badge === "enroute" ? "mb-stop-badge--enroute" :
                      stop.badge === "drop"    ? "mb-stop-badge--drop"    : ""
                    }`}>
                      {stop.badge === "your"    ? "Your Boarding Point" :
                       stop.badge === "enroute" ? "En-route"            :
                       stop.badge === "drop"    ? "Drop Point"          : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ── HELP BANNER ───────────────────────────────── */}
          <div className="mb-help-banner">
            <div className="mb-help-icon">
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={28} stroke="#3b82f6" />
            </div>
            <div className="mb-help-text">
              <p className="mb-help-title">Need Help?</p>
              <p className="mb-help-sub">If you have any issues with your booking, please contact support.</p>
            </div>
            <button className="mb-help-btn">
              <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={15} stroke="#3b82f6" />
              Contact Support
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default MyBookings;

