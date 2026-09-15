import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useTransit } from "../../../shared/context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ROUTE_TITLES = {
  "/admin/dashboard": { title: "Super Admin Command Center", subtitle: "University Fleet, Operations, Student Transit & System Control" },
  "/admin/users": { title: "User & Role Access Management", subtitle: "RBAC Governance, Permissions, Security Audits & Roster Control" },
  "/admin/students": { title: "Student Directory & Transit Roster", subtitle: "Student Route Allotments, Pass Authorizations & Transit Status" },
  "/admin/fleet": { title: "Campus Bus Fleet Management", subtitle: "Vehicle Allocation, Health Monitoring, Odometer & Telemetry Telematics" },
  "/admin/drivers": { title: "Drivers Roster & Shift Schedules", subtitle: "Licensing Status, Shift Allocations, Performance & Ratings" },
  "/admin/routes": { title: "Transit Corridors & Bus Stops", subtitle: "Route Sequencer, Geographic Stops, Morning & Evening Timings" },
  "/admin/schedules": { title: "Bus Timetables & Staggered Shifts", subtitle: "Regular Class Shifts, Exam Special Slots & Holiday Rotations" },
  "/admin/tracking": { title: "Live Fleet GPS Telemetry", subtitle: "Real-Time 3-Second High-Precision Map Coordinates & Bus Speeds" },
  "/admin/finance": { title: "Finance & Accounts Overview", subtitle: "Fee Realizations, Collection Metrics, Revenue Audits & Dues" },
  "/admin/maintenance": { title: "Fleet Maintenance & Servicing", subtitle: "Fitness Logs, Preventative Servicing, Odometer & Workshop Audits" },
  "/admin/complaints": { title: "Grievances & Commuter Support", subtitle: "Student & Staff Ticket Resolutions, Category Logs & Resolution SLA" },
  "/admin/emergencies": { title: "Emergencies & SOS Control Room", subtitle: "High-Priority Driver & Student SOS Broadcasts & Incident Logs" },
  "/admin/reports": { title: "Reports & Fleet Analytics", subtitle: "Data Export Center, Mileage Analysis, Fuel Efficiency & Audits" },
  "/admin/settings": { title: "System Settings & Configuration", subtitle: "GPS Intervals, Alert Webhooks, Geofence Radius & Backup Config" },
  "/admin/profile": { title: "Super Administrator Profile", subtitle: "Executive Account Credentials, 2FA Security & System Clearance" },
};

const AdminLayout = ({ children, title: overrideTitle, subtitle: overrideSubtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAdmin, emergencies, searchQuery, setSearchQuery } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePath = location.pathname;
  const currentRouteMeta = ROUTE_TITLES[activePath] || {
    title: overrideTitle || "Super Admin Portal",
    subtitle: overrideSubtitle || "Campus Transportation & Fleet Governance",
  };

  const title = overrideTitle || currentRouteMeta.title;
  const subtitle = overrideSubtitle || currentRouteMeta.subtitle;

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

  const activeEmergenciesCount = (emergencies || []).filter((e) => e.status === "ACTIVE" || e.status === "DISPATCHED").length;

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        {/* Persistent Role Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Persistent Topbar Header */}
          <header className="ad-topbar">
            <button
              className="ad-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>

            <div className="ad-topbar-title-wrap">
              <h1 className="ad-topbar-title">{title}</h1>
              <p className="ad-topbar-subtitle">{subtitle}</p>
            </div>

            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search buses, drivers, students, trips..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                aria-label="Search"
              />
            </div>

            <div className="ad-topbar-right">
              {/* Emergency Alert Indicator */}
              <button
                className="ad-notif-btn"
                aria-label="Emergencies"
                onClick={() => navigate("/admin/emergencies")}
                title={`${activeEmergenciesCount} Active Emergency Alerts`}
              >
                <Icon
                  d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
                  size={20}
                  stroke={activeEmergenciesCount > 0 ? "#ef4444" : "#64748b"}
                />
                {activeEmergenciesCount > 0 && (
                  <span className="ad-notif-dot" style={{ background: "#ef4444" }}>
                    {activeEmergenciesCount}
                  </span>
                )}
              </button>

              {/* Profile Card */}
              <div
                className="ad-topbar-profile"
                onClick={() => navigate("/admin/profile")}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                title={`${adminName} (${adminRole}) — Click to view Profile`}
              >
                <div className="ad-avatar">{adminInitials}</div>
                <div className="ad-avatar-info">
                  <span className="ad-avatar-name">{adminName}</span>
                  <span className="ad-avatar-role">{adminRole}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dynamically Rendered Sub-view */}
          <main className="ad-content">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
