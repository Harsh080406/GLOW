import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import TransportSidebar from "./TransportSidebar";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const TRANSPORT_ROUTE_TITLES = {
  "/transport/dashboard": { title: "Transport Operations Hub", subtitle: "Fleet Dispatching, Route Allocations & Active Bus Telemetry" },
  "/transport/fleet": { title: "Bus Fleet Inventory & Status", subtitle: "Live shuttle telemetry, capacity health and maintenance schedules" },
  "/transport/drivers": { title: "Drivers Roster & Shift Assignments", subtitle: "Driver licensing verification, shift allocation and contact directory" },
  "/transport/routes": { title: "Transit Routes & Bus Stops", subtitle: "Campus routes, geographic waypoints and departure timetables" },
  "/transport/schedules": { title: "Bus Schedules & Timetables", subtitle: "Regular semester schedules, exam shifts and special shuttles" },
  "/transport/tracking": { title: "Live Fleet GPS Tracking", subtitle: "3-Second real-time fleet map, vehicle speed and live transit ETAs" },
  "/transport/students": { title: "Student Route Allocation", subtitle: "Manage student route allotments, zone transfers and bus capacities" },
  "/transport/maintenance": { title: "Vehicle Maintenance & Fitness", subtitle: "Servicing logs, routine safety inspections and fitness renewals" },
  "/transport/complaints": { title: "Commuter Grievances & Feedback", subtitle: "Student route complaints, driver feedback and resolution logs" },
  "/transport/emergencies": { title: "Emergency & Incident Logs", subtitle: "Real-time incident dispatches, breakdown alerts and SOS logs" },
  "/transport/reports": { title: "Transport Analytics & Reports", subtitle: "Fleet utilization, fuel consumption and on-time performance" },
};

const TransportLayout = ({ children, title: overrideTitle, subtitle: overrideSubtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { emergencies, searchQuery, setSearchQuery } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePath = location.pathname;
  const currentRouteMeta = TRANSPORT_ROUTE_TITLES[activePath] || {
    title: overrideTitle || "Transport Operations",
    subtitle: overrideSubtitle || "Campus Fleet & Transit Logistics",
  };

  const title = overrideTitle || currentRouteMeta.title;
  const subtitle = overrideSubtitle || currentRouteMeta.subtitle;

  const activeEmergenciesCount = (emergencies || []).filter((e) => e.status === "ACTIVE" || e.status === "DISPATCHED").length;

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        {/* Persistent Role Sidebar */}
        <TransportSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                placeholder="Search fleet, routes, drivers, stops..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                aria-label="Search transport records"
              />
            </div>

            <div className="ad-topbar-right">
              {/* Active Fleet Indicator Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#0066ff",
                }}
              >
                <span style={{ color: "#16a34a" }}>●</span>
                <span>13/13 Dispatched</span>
              </div>

              {/* Emergency Alert Indicator */}
              <button
                className="ad-notif-btn"
                aria-label="Emergencies"
                onClick={() => navigate("/transport/emergencies")}
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

export default TransportLayout;
