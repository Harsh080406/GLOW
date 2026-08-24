import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";
import "./AdminDashboard.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* ── Live Fleet SVG Map (White / Blue / Black Theme) ──────── */
const FleetMap = () => (
  <div className="adb-map-wrap">
    <svg viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg" className="adb-map-svg">
      {/* Background */}
      <rect width="700" height="280" fill="#f8fafc" />

      {/* City Blocks Grid */}
      {[
        [10, 10, 80, 82], [120, 10, 148, 82], [300, 10, 168, 82], [500, 10, 188, 82],
        [10, 112, 80, 68], [120, 112, 148, 68], [300, 112, 168, 68], [500, 112, 168, 68],
        [10, 205, 80, 68], [120, 205, 148, 68], [300, 205, 168, 68], [500, 205, 188, 68],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      ))}

      {/* Primary Road Network */}
      <line x1="0" y1="100" x2="700" y2="100" stroke="#f1f5f9" strokeWidth="14" />
      <line x1="0" y1="190" x2="700" y2="190" stroke="#f1f5f9" strokeWidth="12" />
      <line x1="100" y1="0" x2="100" y2="280" stroke="#f1f5f9" strokeWidth="12" />
      <line x1="280" y1="0" x2="280" y2="280" stroke="#f1f5f9" strokeWidth="12" />
      <line x1="480" y1="0" x2="480" y2="280" stroke="#f1f5f9" strokeWidth="12" />

      {/* Active Transit Corridors */}
      <polyline points="60,250 100,140 280,140 480,140 600,80" fill="none" stroke="#0066ff" strokeWidth="4" strokeLinecap="round" />
      <polyline points="60,200 100,200 280,200 480,200 600,200" fill="none" stroke="#0f172a" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round" />
      <polyline points="60,250 200,250 280,250 480,80 600,50" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round" />

      {/* Live Moving Bus Markers */}
      <g transform="translate(280,140)">
        <circle r="14" fill="#0066ff" stroke="#ffffff" strokeWidth="2.5" />
        <text x="-6" y="5" fontSize="11">🚌</text>
      </g>
      <g transform="translate(400,200)">
        <circle r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
        <text x="-6" y="5" fontSize="11">🚌</text>
      </g>
      <g transform="translate(380,100)">
        <circle r="14" fill="#0066ff" stroke="#ffffff" strokeWidth="2.5" />
        <text x="-6" y="5" fontSize="11">🚌</text>
      </g>
      <g transform="translate(540,140)">
        <circle r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
        <text x="-6" y="5" fontSize="11">🚌</text>
      </g>

      {/* Map Legend */}
      <rect x="10" y="254" width="12" height="4" rx="2" fill="#0066ff" />
      <text x="26" y="260" fontSize="10" fill="#0f172a" fontWeight="700">R-04 Chandkheda (Live)</text>
      <rect x="160" y="254" width="12" height="4" rx="2" fill="#0f172a" />
      <text x="176" y="260" fontSize="10" fill="#0f172a" fontWeight="700">R-02 Maninagar</text>
      <rect x="290" y="254" width="12" height="4" rx="2" fill="#2563eb" />
      <text x="306" y="260" fontSize="10" fill="#0f172a" fontWeight="700">R-01 SG Highway</text>
    </svg>
    <div className="adb-map-overlay">
      <span className="adb-live-pill">
        <span className="adb-beacon" />
        28 Active Trips Live
      </span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentAdmin, students, buses, emergencies, auditLogs } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Topbar */}
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div className="ad-topbar-title-wrap">
              <h1 className="ad-topbar-title">Super Admin Command Center</h1>
              <p className="ad-topbar-subtitle">University Fleet, Operations, Student Transit & System Control</p>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input className="ad-search" placeholder="Search buses, drivers, students, trips..." aria-label="Search" />
            </div>
            <div className="ad-topbar-right">
              <button className="ad-notif-btn" aria-label="Emergencies" onClick={() => navigate("/admin/emergencies")}>
                <Icon d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={20} stroke="#ef4444" />
                <span className="ad-notif-dot" style={{ background: "#ef4444" }}>1</span>
              </button>
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

          <main className="ad-content">
            {/* ── 8 TOP LEVEL STAT KPI CARDS ───────────────────────── */}
            <section className="adb-stats-grid" aria-label="Super Admin KPIs">
              {[
                { label: "Students", value: students ? students.length.toLocaleString() : "4,250", sub: "Registered", path: "/admin/students", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
                { label: "Buses", value: "85", sub: "Total Fleet", path: "/admin/fleet", icon: "M3 12h18M3 6h18M3 18h18" },
                { label: "Drivers", value: "92", sub: "Licensed Roster", path: "/admin/drivers", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
                { label: "Routes", value: "34", sub: "Active Corridors", path: "/admin/routes", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
                { label: "Active Trips", value: "28", sub: "On-Route Now", path: "/admin/tracking", icon: "M5 3l14 9-14 9V3z", isLive: true },
                { label: "Pending Fees", value: "₹3.6L", sub: "530 Accounts", path: "/admin/finance", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" },
                { label: "Maintenance", value: "6", sub: "Under Service", path: "/admin/maintenance", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
                { label: "Complaints", value: "12", sub: "3 Pending", path: "/admin/complaints", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="adb-stat-card"
                  onClick={() => navigate(s.path)}
                >
                  <div className="adb-stat-inner">
                    <div className="adb-stat-text-wrap">
                      <p className="adb-stat-label">{s.label}</p>
                      <h3 className="adb-stat-val">{s.value}</h3>
                      <p className="adb-stat-sub">{s.sub}</p>
                    </div>
                    <div className={`adb-stat-icon-wrap ${s.isLive ? "adb-stat-icon-wrap--live" : ""}`}>
                      <Icon d={s.icon} size={20} stroke="#0066ff" />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* ── ACTIVE INCIDENT ALERT BANNER (IF ACTIVE) ─────────── */}
            {emergencies.some((e) => e.status === "ACTIVE" || e.status === "MONITORING") && (
              <div className="adb-emergency-banner">
                <div className="adb-emergency-left">
                  <span className="adb-emergency-emoji">🚨</span>
                  <div>
                    <h4 className="adb-emergency-title">
                      Active Incident Alert: {emergencies[0].type} ({emergencies[0].busId})
                    </h4>
                    <p className="adb-emergency-desc">
                      {emergencies[0].notes} · Location: {emergencies[0].location}
                    </p>
                  </div>
                </div>
                <button
                  className="adb-emergency-action-btn"
                  onClick={() => navigate("/admin/emergencies")}
                >
                  View Incident & SOS Logs →
                </button>
              </div>
            )}

            {/* ── FLEET MAP & AUDIT TRAIL ROW ─────────────────────── */}
            <div className="adb-mid-row">
              {/* Fleet Map */}
              <div className="ad-card adb-map-card">
                <div className="ad-card-header">
                  <div>
                    <h2 className="ad-card-title">Live Campus Fleet Telemetry Map</h2>
                    <p className="adb-card-sub">Real-time GPS locations & corridor dispatches</p>
                  </div>
                  <button className="ad-btn-secondary" onClick={() => navigate("/admin/tracking")}>
                    Open Live Console
                  </button>
                </div>
                <FleetMap />
              </div>

              {/* System Audit Activity */}
              <div className="ad-card adb-audit-card">
                <div className="ad-card-header">
                  <div>
                    <h2 className="ad-card-title">System Activity Log</h2>
                    <p className="adb-card-sub">Recent operator actions</p>
                  </div>
                  <span className="ad-badge ad-badge--green">Live Feed</span>
                </div>
                <ul className="adb-activity-list">
                  {auditLogs.map((a, i) => (
                    <li key={i} className="adb-activity-row">
                      <div className="adb-act-icon">
                        <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" size={15} stroke="#0066ff" />
                      </div>
                      <div className="adb-act-body">
                        <p className="adb-act-text"><strong>{a.user}</strong>: {a.details}</p>
                        <p className="adb-act-time">{a.timestamp}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── TODAY'S FLEET DISPATCHES TABLE ──────────────────── */}
            <div className="ad-card adb-table-card">
              <div className="ad-card-header">
                <div>
                  <h2 className="ad-card-title">Today's Fleet Dispatches</h2>
                  <p className="adb-card-sub">Real-time GPS telemetry, onboard passengers, speed & ETA</p>
                </div>
                <button className="ad-btn-primary" onClick={() => navigate("/admin/fleet")}>
                  Manage Full Fleet
                </button>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Bus ID</th>
                      <th className="ad-th">Registration</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Driver</th>
                      <th className="ad-th">Occupancy</th>
                      <th className="ad-th">Speed</th>
                      <th className="ad-th">ETA</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((b) => (
                      <tr key={b.id} className="ad-tr">
                        <td className="ad-td adb-bus-id">{b.id}</td>
                        <td className="ad-td">{b.regNo}</td>
                        <td className="ad-td"><strong>{b.route}</strong></td>
                        <td className="ad-td">{b.driver}</td>
                        <td className="ad-td">{b.occupied} / {b.capacity} seats</td>
                        <td className="ad-td">{b.speed}</td>
                        <td className="ad-td">{b.eta}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${b.status === "On Route" ? "ad-badge--green" : b.status === "Delayed" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                            ● {b.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            className="adb-track-action-btn"
                            onClick={() => navigate("/admin/tracking")}
                          >
                            Live Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── FAST COMMAND ACTION GRID ────────────────────────── */}
            <div className="adb-quick-section">
              <h3 className="adb-quick-title">Quick Administration Actions</h3>
              <div className="adb-quick-grid">
                {[
                  { label: "Register New Bus", icon: "M3 12h18M3 6h18M3 18h18", path: "/admin/fleet" },
                  { label: "Assign Driver to Route", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", path: "/admin/drivers" },
                  { label: "Create Route / Timetable", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", path: "/admin/routes" },
                  { label: "Finance & Fee Audit", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2", path: "/admin/finance" },
                  { label: "Broadcast Emergency Alert", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", path: "/admin/emergencies" },
                  { label: "System Roles & Permissions", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", path: "/admin/users" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="adb-quick-btn"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="adb-quick-icon">
                      <Icon d={action.icon} size={20} stroke="#0066ff" />
                    </div>
                    <span className="adb-quick-label">{action.label}</span>
                    <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
                  </button>
                ))}
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Bus Management System · All rights reserved.</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
