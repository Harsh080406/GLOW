import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import RoleSwitcherBar from "../components/RoleSwitcherBar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminMaintenance = () => {
  const { buses, maintenanceRecords, setMaintenanceRecords } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [busId, setBusId] = useState("BUS-112");
  const [issue, setIssue] = useState("");
  const [cost, setCost] = useState("");
  const [garage, setGarage] = useState("Shreeji Auto Hub");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!issue || !cost) return;

    setMaintenanceRecords((prev) => [
      {
        id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
        busId: busId,
        issue: issue,
        cost: Number(cost),
        scheduledDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "In Progress",
        garage: garage,
      },
      ...prev,
    ]);

    setShowAddModal(false);
    setIssue("");
    setCost("");
  };

  const markComplete = (id) => {
    setMaintenanceRecords((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Completed" } : m))
    );
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <AdminSidebar activeId="maintenance" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Bus Fleet Maintenance & Servicing</div>
              <div className="ad-topbar-subtitle">Track repair work orders, vehicle downtime, fitness & insurance certificates</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => setShowAddModal(true)}>
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Log Service / Repair
              </button>
            </div>
          </header>

          <main className="ad-content">
            {/* ── MAINTENANCE STATS ──────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "20px" }}>
                <p style={{ fontSize: 12, color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Vehicles in Workshop</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#dc2626", marginTop: 4 }}>6 Buses</h2>
                <span style={{ fontSize: 12, color: "#991b1b" }}>Average Downtime: 2.1 days</span>
              </div>

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "20px" }}>
                <p style={{ fontSize: 12, color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>Total Maintenance Cost</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#2563eb", marginTop: 4 }}>₹1.84 Lakh</h2>
                <span style={{ fontSize: 12, color: "#1e40af" }}>This Academic Term</span>
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px" }}>
                <p style={{ fontSize: 12, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Fleet Fitness Compliance</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#16a34a", marginTop: 4 }}>98.2%</h2>
                <span style={{ fontSize: 12, color: "#166534" }}>All fitness certs valid</span>
              </div>
            </div>

            {/* ── WORK ORDERS & REPAIRS TABLE ─────────────────────────── */}
            <div className="ad-card" style={{ marginBottom: 24 }}>
              <div className="ad-card-header">
                <h3 className="ad-card-title">Active Service & Repair Work Orders</h3>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Work Order ID</th>
                      <th className="ad-th">Bus ID</th>
                      <th className="ad-th">Issue / Service Details</th>
                      <th className="ad-th">Estimated Cost</th>
                      <th className="ad-th">Workshop / Garage</th>
                      <th className="ad-th">Scheduled Date</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords.map((m) => (
                      <tr key={m.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{m.id}</td>
                        <td className="ad-td"><strong>{m.busId}</strong></td>
                        <td className="ad-td">{m.issue}</td>
                        <td className="ad-td" style={{ fontWeight: 700, color: "#dc2626" }}>₹{m.cost.toLocaleString()}</td>
                        <td className="ad-td">{m.garage}</td>
                        <td className="ad-td">{m.scheduledDate}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${m.status === "Completed" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            ● {m.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          {m.status === "In Progress" && (
                            <button
                              onClick={() => markComplete(m.id)}
                              style={{ padding: "4px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                              Mark Ready
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── FLEET COMPLIANCE EXPIRIES TABLE ─────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Fleet Insurance & Fitness Expiry Monitor</h3>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Bus No.</th>
                      <th className="ad-th">Registration</th>
                      <th className="ad-th">Insurance Expiry</th>
                      <th className="ad-th">Fitness Certificate Expiry</th>
                      <th className="ad-th">RC Expiry</th>
                      <th className="ad-th">Maintenance State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((b) => (
                      <tr key={b.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{b.id}</td>
                        <td className="ad-td">{b.regNo}</td>
                        <td className="ad-td">{b.insuranceExpiry}</td>
                        <td className="ad-td">{b.fitnessExpiry}</td>
                        <td className="ad-td">{b.rcExpiry}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${b.maintenance === "Good" ? "ad-badge--green" : b.maintenance === "Warning" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                            {b.maintenance}
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

      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Log Maintenance Work Order</h3>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Bus</label>
                <select
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>{b.id} ({b.regNo})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Issue / Service Details</label>
                <input
                  type="text"
                  placeholder="e.g. Steering hydraulic oil flush & alignment"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Estimated Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Garage / Hub</label>
                  <input
                    type="text"
                    value={garage}
                    onChange={(e) => setGarage(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save Work Order
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default AdminMaintenance;
