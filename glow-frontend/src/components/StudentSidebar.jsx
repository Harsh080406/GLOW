import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTransit } from "../context/TransitContext";
import GlowLogo from "../assets/GlowLogo";
import "./StudentSidebar.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const STUDENT_NAV = [
  {
    section: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", path: "/student/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    ],
  },
  {
    section: "Transit & Tracking",
    items: [
      { id: "mybus", label: "My Bus", path: "/student/my-bus", icon: "M3 12h18M3 6h18M3 18h18" },
      { id: "myroute", label: "My Route", path: "/student/my-route", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
      { id: "tracking", label: "Live Tracking", path: "/student/tracking", icon: "M5 3l14 9-14 9V3z" },
      { id: "schedule", label: "Schedule", path: "/student/schedule", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
      { id: "pass", label: "My Transport Pass", path: "/student/pass", icon: "M20 12V22H4V12M22 7H2v5h20V7zM12 22V7" },
    ],
  },
  {
    section: "Financials & Alerts",
    items: [
      { id: "fees", label: "Fees & Payments", path: "/student/fees", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" },
      { id: "notif", label: "Notifications", path: "/student/notifications", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", badge: 3 },
    ],
  },
  {
    section: "Support & Safety",
    items: [
      { id: "complaints", label: "Complaints & Support", path: "/student/complaints", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
      { id: "emergency", label: "Emergency / SOS", path: "/student/emergency", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
      { id: "profile", label: "Student Profile", path: "/student/profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
    ],
  },
];

const StudentSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentStudent } = useTransit();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const studentName = currentStudent?.name || "Student";
  const studentId = currentStudent?.id || "UNI20260125";
  const studentInitials = currentStudent?.avatar ||
    studentName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const activeId = STUDENT_NAV.flatMap((s) => s.items).find((i) => i.path === pathname)?.id;

  return (
    <>
      <aside className={`ss-sidebar ${isCollapsed ? "ss-sidebar--collapsed" : ""} ${isOpen ? "ss-sidebar--open" : ""}`}>
        {/* Brand Header — Clicking toggles between full and small icon-only logo */}
        <button
          type="button"
          className="ss-brand"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Click to expand sidebar" : "Click to collapse sidebar"}
          aria-label="Toggle sidebar collapse"
        >
          <div className="ss-brand-logo-wrap">
            <GlowLogo width={isCollapsed ? 38 : 72} darkMode={false} />
          </div>
          {!isCollapsed && (
            <div className="ss-brand-text">
              <div className="ss-brand-name">GLOW BUS</div>
              <div className="ss-brand-sub">Student Portal</div>
            </div>
          )}
        </button>

        <nav className="ss-nav" aria-label="Student navigation">
          {STUDENT_NAV.map((section) => (
            <div key={section.section} className="ss-nav-section-wrap">
              {!isCollapsed && <p className="ss-nav-section">{section.section}</p>}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`ss-nav-item ${activeId === item.id ? "ss-nav-item--active" : ""}`}
                  onClick={() => go(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={activeId === item.id ? "page" : undefined}
                >
                  <Icon d={item.icon} size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge && <span className="ss-nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="ss-user-card" title={isCollapsed ? `${studentName} (${studentId})` : undefined} onClick={() => go("/student/profile")} style={{ cursor: "pointer" }}>
          <div className="ss-user-avatar">{studentInitials}</div>
          {!isCollapsed && (
            <div className="ss-user-info">
              <p className="ss-user-name">{studentName}</p>
              <p className="ss-user-id">{studentId}</p>
            </div>
          )}
        </div>

        <button
          className="ss-logout"
          onClick={() => navigate("/")}
          title={isCollapsed ? "Exit Portal" : undefined}
        >
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} />
          {!isCollapsed && <span>Exit Portal</span>}
        </button>
      </aside>
      {isOpen && <div className="ss-overlay" onClick={onClose} aria-hidden="true" />}
    </>
  );
};

export default StudentSidebar;
