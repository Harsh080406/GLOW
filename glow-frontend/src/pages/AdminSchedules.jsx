import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminSchedules = () => {
  const navigate = useNavigate();
  const { currentAdmin, routes, buses } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState("Daily");
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const [trips, setTrips] = useState([
    { id: "TRP-101", route: "R-04 (Chandkheda)", bus: "BUS-104", driver: "Mahesh Patel", departure: "07:30 AM", returnTime: "05:00 PM", status: "Active", type: "Daily" },
    { id: "TRP-102", route: "R-01 (SG Highway)", bus: "BUS-101", driver: "Suresh Joshi", departure: "07:35 AM", returnTime: "05:00 PM", status: "Active", type: "Daily" },
    { id: "TRP-103", route: "R-02 (Maninagar)", bus: "BUS-108", driver: "Ramesh Shah", departure: "07:30 AM", returnTime: "05:00 PM", status: "Active", type: "Daily" },
    { id: "TRP-104", route: "R-05 (Gandhinagar)", bus: "BUS-115", driver: "Kailash Dave", departure: "07:25 AM", returnTime: "05:00 PM", status: "Active", type: "Daily" },
    { id: "TRP-EXAM-01", route: "R-04 (Chandkheda)", bus: "BUS-104", driver: "Mahesh Patel", departure: "12:30 PM", returnTime: "05:30 PM", status: "Scheduled", type: "Exam" },
  ]);

  const [newRoute, setNewRoute] = useState(routes[0]?.name || "Route R-04");
  const [newBus, setNewBus] = useState(buses[0]?.id || "BUS-101");
  const [newDeparture, setNewDeparture] = useState("07:30 AM");
  const [newReturn, setNewReturn] = useState("05:00 PM");

  const filteredTrips = trips.filter((t) => scheduleType === "ALL" || t.type === scheduleType);

  const handleCreateTrip = (e) => {
    e.preventDefault();
    setTrips((prev) => [
      {
        id: `TRP-${Math.floor(100 + Math.random() * 900)}`,
        route: newRoute,
        bus: newBus,
        driver: "Mahesh Patel",
        departure: newDeparture,
        returnTime: newReturn,
        status: "Scheduled",
        type: scheduleType === "ALL" ? "Daily" : scheduleType,
      },
      ...prev,
    ]);
    setShowCreateModal(false);
  };

  const cancelTrip = (id) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "Cancelled" ? "Active" : "Cancelled" } : t))
    );
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="schedules" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Schedule & Dispatch Management</div>
              <div className="ad-topbar-subtitle">Configure Daily, Weekly, Exam Special, and Holiday transit timetables</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => setShowCreateModal(true)}>
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Dispatch / Create Trip
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
            {/* ── SCHEDULE TYPE TABS ─────────────────────────────────── */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {["Daily", "Weekly", "Exam", "Holiday", "Special Event", "ALL"].map((t) => (
                <button
                  key={t}
                  onClick={() => setScheduleType(t)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: `1.5px solid ${scheduleType === t ? "#2563eb" : "#e2e8f0"}`,
                    background: scheduleType === t ? "#2563eb" : "#fff",
                    color: scheduleType === t ? "#fff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {t === "ALL" ? "All Schedules" : `${t} Schedule`}
                </button>
              ))}
            </div>

            {/* ── TRIPS DISPATCH TABLE ───────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Active Dispatches & Timetable Records ({filteredTrips.length})</h3>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Trip ID</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Bus Assigned</th>
                      <th className="ad-th">Driver Assigned</th>
                      <th className="ad-th">Morning Departure</th>
                      <th className="ad-th">Evening Return</th>
                      <th className="ad-th">Schedule Type</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((t) => (
                      <tr key={t.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                        <td className="ad-td"><strong>{t.route}</strong></td>
                        <td className="ad-td">{t.bus}</td>
                        <td className="ad-td">{t.driver}</td>
                        <td className="ad-td">{t.departure}</td>
                        <td className="ad-td">{t.returnTime}</td>
                        <td className="ad-td"><span className="ad-badge ad-badge--blue">{t.type}</span></td>
                        <td className="ad-td">
                          <span className={`ad-badge ${t.status === "Active" ? "ad-badge--green" : t.status === "Scheduled" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                            ● {t.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            onClick={() => cancelTrip(t.id)}
                            style={{ padding: "4px 10px", background: t.status === "Cancelled" ? "#f0fdf4" : "#fef2f2", color: t.status === "Cancelled" ? "#16a34a" : "#dc2626", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                          >
                            {t.status === "Cancelled" ? "Restore" : "Cancel Trip"}
                          </button>
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

      {showCreateModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Create / Schedule Transit Trip</h3>
            <form onSubmit={handleCreateTrip}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Route</label>
                <select
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.name}>{r.name} ({r.distance})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Assign Bus</label>
                <select
                  value={newBus}
                  onChange={(e) => setNewBus(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>{b.id} — {b.model}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Morning Departure</label>
                  <input
                    type="text"
                    value={newDeparture}
                    onChange={(e) => setNewDeparture(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Evening Return</label>
                  <input
                    type="text"
                    value={newReturn}
                    onChange={(e) => setNewReturn(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save & Dispatch Trip
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
