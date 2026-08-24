import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTransit } from "../context/TransitContext";
import GlowLogo from "../assets/GlowLogo";
import "../pages/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const SUPER_ADMIN_NAV = [
  {
    section: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", path: "/admin/dashboard" },
      { id: "users", label: "User Management", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", path: "/admin/users" },
      { id: "students", label: "Students", icon: "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5", path: "/admin/students" },
    ],
  },
  {
    section: "Fleet & Routes",
    items: [
      { id: "fleet", label: "Bus Fleet", icon: "M3 12h18M3 6h18M3 18h18", path: "/admin/fleet" },
      { id: "drivers", label: "Drivers Roster", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", path: "/admin/drivers" },
      { id: "routes", label: "Routes & Stops", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", path: "/admin/routes" },
      { id: "schedules", label: "Schedules", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", path: "/admin/schedules" },
    ],
  },
  {
    section: "Operations & Tracking",
    items: [
      { id: "tracking", label: "Live Fleet Tracking", icon: "M5 3l14 9-14 9V3z", path: "/admin/tracking", badge: "Live" },
      { id: "finance", label: "Finance Overview", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2", path: "/admin/finance" },
      { id: "maintenance", label: "Maintenance", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", path: "/admin/maintenance" },
      { id: "complaints", label: "Complaints", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", path: "/admin/complaints", badge: "3" },
      { id: "emergencies", label: "Emergencies & SOS", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", path: "/admin/emergencies", badge: "1" },
    ],
  },
  {
    section: "Analytics & System",
    items: [
      { id: "reports", label: "Reports & Analytics", icon: "M18 20V10M12 20V4M6 20v-6", path: "/admin/reports" },
      { id: "profile", label: "Admin Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", path: "/admin/profile" },
      { id: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", path: "/admin/settings" },
    ],
  },
];

const AdminSidebar = ({ activeId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAdmin } = useTransit();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const adminName = currentAdmin?.name || "Dr. Arvind Patel";
  const adminRole = currentAdmin?.role || "Super Admin";
  const adminInitials = currentAdmin?.avatar ||
    adminName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AP";

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const currentActive = activeId || SUPER_ADMIN_NAV.flatMap((s) => s.items).find((i) => i.path === location.pathname)?.id || "dashboard";

  return (
    <>
      <aside className={`ad-sidebar ${isCollapsed ? "ad-sidebar--collapsed" : ""} ${isOpen ? "ad-sidebar--open" : ""}`}>
        {/* Brand — Click to toggle full / icon-only collapse */}
        <button
          type="button"
          className="ad-brand"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Click to expand sidebar" : "Click to collapse sidebar"}
          aria-label="Toggle admin sidebar collapse"
        >
          <div className="ad-brand-logo-wrap">
            <GlowLogo width={isCollapsed ? 38 : 72} darkMode={false} />
          </div>
          {!isCollapsed && (
            <div className="ad-brand-text">
              <div className="ad-brand-name">GLOW BUS</div>
              <div className="ad-brand-sub">Super Admin</div>
            </div>
          )}
        </button>

        {/* Nav */}
        <nav className="ad-nav" aria-label="Admin navigation">
          {SUPER_ADMIN_NAV.map((section) => (
            <div key={section.section} className="ad-nav-section-wrap">
              {!isCollapsed && <p className="ad-nav-section-label">{section.section}</p>}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`ad-nav-item ${currentActive === item.id ? "ad-nav-item--active" : ""}`}
                  onClick={() => handleNav(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={currentActive === item.id ? "page" : undefined}
                >
                  <Icon d={item.icon} size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge && <span className="ad-nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin Info */}
        <div
          className="ad-admin-info"
          title={isCollapsed ? `${adminName} (${adminRole})` : undefined}
          onClick={() => handleNav("/admin/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="ad-admin-avatar">{adminInitials}</div>
          {!isCollapsed && (
            <div className="ad-admin-text">
              <div className="ad-admin-name">{adminName}</div>
              <div className="ad-admin-role">{adminRole}</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          className="ad-logout"
          onClick={() => navigate("/")}
          title={isCollapsed ? "Exit Command Center" : undefined}
        >
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} />
          {!isCollapsed && <span>Exit Portal</span>}
        </button>
      </aside>

      {isOpen && (
        <div className="ad-overlay" onClick={onClose} aria-hidden="true" />
      )}
    </>
  );
};

export default AdminSidebar;
