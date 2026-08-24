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

const AdminEmergencies = () => {
  const navigate = useNavigate();
  const { currentAdmin, emergencies, resolveEmergency } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

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

  const activeList = emergencies.filter((e) => e.status === "ACTIVE" || e.status === "MONITORING");
  const historyList = emergencies.filter((e) => e.status === "RESOLVED");

  const handleResolve = (e) => {
    e.preventDefault();
    if (!selectedEmergency) return;
    resolveEmergency(selectedEmergency.id, resolutionNotes);
    setSelectedEmergency(null);
    setResolutionNotes("");
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="emergencies" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Emergency Response & SOS Command Center</div>
              <div className="ad-topbar-subtitle">Real-time incident dispatch, vehicle accident monitoring & SOS alert coordination</div>
            </div>
            <div className="ad-topbar-right">
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
            {/* ── ACTIVE INCIDENTS LIST ──────────────────────────────── */}
            <div className="ad-card" style={{ marginBottom: 24, border: "2px solid #ef4444" }}>
              <div className="ad-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>🚨</span>
                  <h3 className="ad-card-title" style={{ color: "#dc2626" }}>Active Emergency Signals ({activeList.length})</h3>
                </div>
                <span className="ad-badge ad-badge--red">HIGH PRIORITY DISPATCH</span>
              </div>

              {activeList.length === 0 ? (
                <p style={{ textAlign: "center", padding: "30px", color: "#166534", fontWeight: 700 }}>
                  ✓ All clear. Zero active emergency alerts on campus network.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activeList.map((e) => (
                    <div key={e.id} style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 900, color: "#991b1b" }}>{e.type}</h4>
                            <span className="ad-badge ad-badge--red">● {e.status}</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 4 }}>
                            Bus: <strong>{e.busId}</strong> &nbsp;·&nbsp; Route: <strong>{e.routeId}</strong> &nbsp;·&nbsp; Driver: <strong>{e.driver}</strong> &nbsp;·&nbsp; Passengers: <strong>{e.studentsOnboard || 38} Onboard</strong>
                          </p>
                          <p style={{ fontSize: 13, color: "#7f1d1d", marginTop: 4 }}>
                            <strong>Coordinates / Location:</strong> {e.location}
                          </p>
                          <p style={{ fontSize: 13, color: "#7f1d1d", marginTop: 4 }}>
                            <strong>Incident Description:</strong> {e.notes}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedEmergency(e);
                              setResolutionNotes("");
                            }}
                            style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                          >
                            ✓ Mark Incident Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── HISTORICAL EMERGENCY LOG ────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Resolved Incident History & Log</h3>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Incident ID</th>
                      <th className="ad-th">Type</th>
                      <th className="ad-th">Bus ID</th>
                      <th className="ad-th">Driver</th>
                      <th className="ad-th">Location</th>
                      <th className="ad-th">Time</th>
                      <th className="ad-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencies.map((e) => (
                      <tr key={e.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{e.id}</td>
                        <td className="ad-td"><strong>{e.type}</strong></td>
                        <td className="ad-td">{e.busId}</td>
                        <td className="ad-td">{e.driver}</td>
                        <td className="ad-td">{e.location}</td>
                        <td className="ad-td">{e.time}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${e.status === "RESOLVED" ? "ad-badge--green" : "ad-badge--red"}`}>
                            ● {e.status}
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

      {selectedEmergency && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Resolve Emergency Incident</h3>
            <form onSubmit={handleResolve}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Resolution Summary & Actions Taken</label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Police escort cleared detour. All 32 students safely dropped at campus bus bay."
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>
                  Confirm Incident Resolution
                </button>
                <button type="button" onClick={() => setSelectedEmergency(null)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default AdminEmergencies;
