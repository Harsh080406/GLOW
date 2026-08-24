import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TransportSidebar from "../components/TransportSidebar";
import RoleSwitcherBar from "../components/RoleSwitcherBar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const TransportDashboard = () => {
  const navigate = useNavigate();
  const { buses, routes, emergencies } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <TransportSidebar activeId="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Transport Operations Control</div>
              <div className="ad-topbar-subtitle">Fleet Dispatch, Driver Roster & Student Transit Operations</div>
            </div>
            <div className="ad-topbar-right">
              <div className="ad-avatar" style={{ background: "#2563eb" }}>TM</div>
              <div className="ad-avatar-info">
                <span className="ad-avatar-name">Transport Manager</span>
                <span className="ad-avatar-role">Fleet Operations Lead</span>
              </div>
            </div>
          </header>

          <main className="ad-content">
            {/* ── TOP OPERATIONAL CARDS MATCHING REQUIREMENT 15 EXACTLY ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Active Buses", value: "79 / 85", sub: "On-Route or Standby", color: "#059669", bg: "#ecfdf5", path: "/transport/fleet", icon: "M3 12h18M3 6h18M3 18h18" },
                { label: "Active Drivers", value: "89 / 92", sub: "3 on Approved Leave", color: "#2563eb", bg: "#eff6ff", path: "/transport/drivers", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
                { label: "Today's Trips", value: "64 Trips", sub: "Morning & Evening", color: "#8b5cf6", bg: "#f5f3ff", path: "/transport/schedules", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
                { label: "Delayed Buses", value: "2 Buses", sub: "SG Road Congestion", color: "#ea580c", bg: "#fff7ed", path: "/transport/tracking", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
                { label: "Maintenance", value: "6 Buses", sub: "In Workshop", color: "#dc2626", bg: "#fef2f2", path: "/transport/maintenance", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
                { label: "Active Routes", value: "32 Corridors", sub: "100% Coverage", color: "#3b82f6", bg: "#eff6ff", path: "/transport/routes", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
                { label: "Students Transported", value: "3,912", sub: "Morning Shift", color: "#16a34a", bg: "#f0fdf4", path: "/transport/students", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
                { label: "Emergency Alerts", value: emergencies.filter((e) => e.status === "ACTIVE" || e.status === "MONITORING").length, sub: "High Priority", color: "#ef4444", bg: "#fef2f2", path: "/transport/emergencies", icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
              ].map((s) => (
                <div
                  key={s.label}
                  onClick={() => navigate(s.path)}
                  style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12, padding: "16px", cursor: "pointer" }}
                >
                  <p style={{ fontSize: 11.5, color: "#7c8494", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</p>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.value}</h3>
                  <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* ── FLEET CORRIDORS & OCCUPANCY ─────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 24 }}>
              {/* Route Capacity & Occupancy */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <h3 className="ad-card-title">Route Load & Passenger Occupancy</h3>
                  <button className="ad-btn-secondary" onClick={() => navigate("/transport/students")}>
                    Manage Student Allocation
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {routes.map((r) => {
                    const bus = buses.find((b) => b.id === r.assignedBus);
                    const occupied = bus ? bus.occupied : 38;
                    const cap = bus ? bus.capacity : 52;
                    const pct = Math.round((occupied / cap) * 100);
                    return (
                      <div key={r.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>
                          <span>{r.name} ({r.assignedBus})</span>
                          <span style={{ color: pct > 85 ? "#ea580c" : "#16a34a" }}>
                            {occupied} / {cap} seats ({pct}%)
                          </span>
                        </div>
                        <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct > 85 ? "#ea580c" : "#22c55e", borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <h3 className="ad-card-title">Quick Operations Dispatch</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Transfer Student Between Routes", path: "/transport/students", icon: "👥" },
                    { label: "Dispatch Spare Standby Bus", path: "/transport/fleet", icon: "🚌" },
                    { label: "Adjust Route Stops & Timings", path: "/transport/routes", icon: "🗺️" },
                    { label: "Review Driver Hours & Attendance", path: "/transport/drivers", icon: "⏱️" },
                  ].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => navigate(q.path)}
                      style={{ padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#1e293b" }}
                    >
                      <span>{q.icon}</span>
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── FLEET STATUS ────────────────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Active Fleet Operations</h3>
                <button className="ad-btn-primary" onClick={() => navigate("/transport/tracking")}>
                  Open Live Telemetry
                </button>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Bus ID</th>
                      <th className="ad-th">Driver</th>
                      <th className="ad-th">Driver Contact</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Occupancy</th>
                      <th className="ad-th">Speed</th>
                      <th className="ad-th">Fuel / EV</th>
                      <th className="ad-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((b) => (
                      <tr key={b.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800 }}>{b.id}</td>
                        <td className="ad-td"><strong>{b.driver}</strong></td>
                        <td className="ad-td">{b.driverPhone}</td>
                        <td className="ad-td">{b.route}</td>
                        <td className="ad-td">{b.occupied} / {b.capacity}</td>
                        <td className="ad-td">{b.speed}</td>
                        <td className="ad-td">{b.fuelPercent}% {b.isEV ? "🔋 EV" : "⛽ Diesel"}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${b.status === "On Route" ? "ad-badge--green" : b.status === "Delayed" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                            ● {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;
