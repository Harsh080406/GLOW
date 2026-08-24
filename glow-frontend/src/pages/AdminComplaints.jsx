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

const AdminComplaints = () => {
  const navigate = useNavigate();
  const { currentAdmin, complaints, resolveComplaint } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState("");

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

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleResolve = (e) => {
    e.preventDefault();
    if (!selectedComplaint || !responseText) return;

    resolveComplaint(selectedComplaint.id, responseText, "Resolved");
    setSelectedComplaint(null);
    setResponseText("");
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="complaints" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Complaints & Grievance Resolution</div>
              <div className="ad-topbar-subtitle">Investigate passenger feedback, assign fleet officers & dispatch corrective actions</div>
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
            {/* ── FILTER PILLS ───────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["ALL", "Open", "In Progress", "Resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: `1.5px solid ${statusFilter === s ? "#2563eb" : "#e2e8f0"}`,
                    background: statusFilter === s ? "#2563eb" : "#fff",
                    color: statusFilter === s ? "#fff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {s === "ALL" ? "All Complaints" : `${s} (${complaints.filter((c) => c.status.toLowerCase() === s.toLowerCase()).length})`}
                </button>
              ))}
            </div>

            {/* ── COMPLAINTS TABLE ───────────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Student & Passenger Grievance Tickets ({filteredComplaints.length})</h3>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Ticket ID</th>
                      <th className="ad-th">Category</th>
                      <th className="ad-th">Student</th>
                      <th className="ad-th">Bus / Route</th>
                      <th className="ad-th">Description</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Assigned To</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{c.id}</td>
                        <td className="ad-td"><strong>{c.category}</strong></td>
                        <td className="ad-td">{c.studentName}</td>
                        <td className="ad-td">{c.busId} ({c.routeId})</td>
                        <td className="ad-td" style={{ maxWidth: 260 }}>{c.description}</td>
                        <td className="ad-td">{c.date}</td>
                        <td className="ad-td">{c.assignedTo}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${c.status === "Resolved" ? "ad-badge--green" : c.status === "In Progress" ? "ad-badge--blue" : "ad-badge--yellow"}`}>
                            ● {c.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setResponseText(c.response || "");
                            }}
                            style={{ padding: "4px 10px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            Resolve / Reply
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

      {selectedComplaint && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "24px", position: "relative" }}>
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Resolve Ticket: {selectedComplaint.id}</h3>
            <p style={{ fontSize: 13, color: "#334155", marginBottom: 12 }}>
              <strong>Category:</strong> {selectedComplaint.category} &nbsp;·&nbsp; <strong>Student:</strong> {selectedComplaint.studentName} ({selectedComplaint.busId})
            </p>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: 8, fontSize: 13, color: "#475569", marginBottom: 16 }}>
              {selectedComplaint.description}
            </div>

            <form onSubmit={handleResolve}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Official Helpdesk Resolution Response</label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter resolution notes, actions taken with driver/fleet crew..."
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>
                  Save & Mark Resolved
                </button>
                <button type="button" onClick={() => setSelectedComplaint(null)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
