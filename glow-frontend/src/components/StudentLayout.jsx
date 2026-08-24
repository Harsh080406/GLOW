import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../context/TransitContext";
import StudentSidebar from "./StudentSidebar";
import "./StudentLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const { currentStudent } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentName = currentStudent?.name || "Student";
  const studentInitials = currentStudent?.avatar ||
    studentName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  return (
    <div className="sl-wrapper">
      <div className="sl-root">
        <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="sl-main">
          <header className="sl-topbar">
            <button className="sl-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div className="sl-topbar-title-wrap">
              {title && <h1 className="sl-topbar-title">{title}</h1>}
              {subtitle && <p className="sl-topbar-sub">{subtitle}</p>}
            </div>
            <div className="sl-topbar-right">
              <button className="sl-notif-btn" aria-label="Notifications" onClick={() => navigate("/student/notifications")}>
                <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={20} />
                <span className="sl-notif-dot">3</span>
              </button>
              <button className="sl-sos-btn" aria-label="SOS Emergency" onClick={() => navigate("/student/emergency")}>
                🚨 SOS
              </button>
              <div
                className="sl-avatar"
                title={`${studentName} (${currentStudent?.id || "UNI20260125"})`}
                aria-label="Student profile"
                onClick={() => navigate("/student/profile")}
              >
                {studentInitials}
              </div>
            </div>
          </header>
          <main className="sl-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
