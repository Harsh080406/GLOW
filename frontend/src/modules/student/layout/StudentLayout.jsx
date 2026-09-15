import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import StudentSidebar from "./StudentSidebar";
import "./StudentLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const STUDENT_ROUTE_TITLES = {
  "/student/dashboard": { title: "Student Mobility Dashboard", subtitle: "Live Bus Updates, Scheduled Pickup & Active Pass Status" },
  "/student/my-bus": { title: "My Assigned Bus & Crew", subtitle: "Bus details, capacity status & driver contacts" },
  "/student/my-route": { title: "My Transit Route", subtitle: "Route stops, scheduled timings & live progression" },
  "/student/schedule": { title: "Bus Timetables & Schedules", subtitle: "Daily schedule, weekly shifts & exam bus timings" },
  "/student/timetable": { title: "Bus Timetables & Schedules", subtitle: "Daily schedule, weekly shifts & exam bus timings" },
  "/student/tracking": { title: "Live Bus GPS Tracking", subtitle: "Real-time location, speed telemetry & live ETAs" },
  "/student/pass": { title: "My Transport Pass", subtitle: "Encrypted QR code for contactless bus boarding" },
  "/student/fees": { title: "Fees & Payment Invoices", subtitle: "Fee breakdown, online payment gateway & tax invoices" },
  "/student/notifications": { title: "Transit Notifications", subtitle: "Real-time schedule alerts, trip updates & broadcasts" },
  "/student/complaints": { title: "Complaints & Support Tickets", subtitle: "Submit feedback, report lost items or route issues" },
  "/student/emergency": { title: "Emergency & Safety Command", subtitle: "SOS alert trigger, 24/7 security contacts & SOS guidelines" },
  "/student/profile": { title: "Student Profile", subtitle: "University credentials, route allotment & pass settings" },
};

const StudentLayout = ({ children, title: overrideTitle, subtitle: overrideSubtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStudent } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePath = location.pathname;
  const currentRouteMeta = STUDENT_ROUTE_TITLES[activePath] || {
    title: overrideTitle || "Student Portal",
    subtitle: overrideSubtitle || "Campus Transportation & Student Mobility",
  };

  const title = overrideTitle || currentRouteMeta.title;
  const subtitle = overrideSubtitle || currentRouteMeta.subtitle;

  const studentName = currentStudent?.name || "Rahul Sharma";
  const studentInitials = currentStudent?.avatar ||
    studentName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RS";

  return (
    <div className="sl-wrapper">
      <div className="sl-root">
        {/* Persistent Student Sidebar */}
        <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="sl-main">
          {/* Persistent Student Topbar Header */}
          <header className="sl-topbar">
            <button className="sl-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div className="sl-topbar-title-wrap">
              {title && <h1 className="sl-topbar-title">{title}</h1>}
              {subtitle && <p className="sl-topbar-sub">{subtitle}</p>}
            </div>
            <div className="sl-topbar-right">
              <button
                className="sl-notif-btn"
                aria-label="Notifications"
                onClick={() => navigate("/student/notifications")}
                title="View Transit Notifications"
              >
                <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={20} />
                <span className="sl-notif-dot">3</span>
              </button>
              <button
                className="sl-sos-btn"
                aria-label="SOS Emergency"
                onClick={() => navigate("/student/emergency")}
                title="Trigger SOS Emergency Alert"
              >
                🚨 SOS
              </button>
              <div
                className="sl-avatar"
                title={`${studentName} (${currentStudent?.id || "UNI20260125"}) — Click to view Profile`}
                aria-label="Student profile"
                onClick={() => navigate("/student/profile")}
              >
                {studentInitials}
              </div>
            </div>
          </header>

          {/* Dynamically Rendered Sub-view */}
          <main className="sl-content">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
