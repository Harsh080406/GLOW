import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const DEPARTMENTS = [
  "Transportation",
  "Maintenance",
  "Finance",
  "Security",
  "Administration",
];

const AdminComplaints = () => {
  const { authFetch } = useTransit();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMsg, setToastMsg] = useState(null);

  // Resolution & Department Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [assignedDept, setAssignedDept] = useState("Transportation");
  const [resolutionStatus, setResolutionStatus] = useState("RESOLVED");

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/complaints");
      if (res && res.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleOpenAction = (c) => {
    setSelectedComplaint(c);
    setResponseText(c.response || "");
    setAssignedDept(c.department || "Transportation");
    setResolutionStatus((c.status || "PENDING").toUpperCase() === "PENDING" ? "RESOLVED" : c.status);
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await authFetch(`/admin/complaints/${selectedComplaint._id || selectedComplaint.id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({
          response: responseText,
          status: resolutionStatus,
          department: assignedDept,
        }),
      });
      showNotification(`✓ Grievance #${selectedComplaint.id || selectedComplaint._id} resolved & assigned to ${assignedDept}!`);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert("Error saving complaint resolution: " + err.message);
    }
  };

  const filtered = complaints.filter((c) => {
    if (statusFilter === "ALL") return true;
    return (c.status || "PENDING").toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="view-container">
      {toastMsg && (
        <div style={{
          background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
          borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontWeight: 700, fontSize: 13,
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)"
        }}>
          {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="ad-page-header" style={{ marginBottom: 20 }}>
        <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Passenger Grievances & Service Support</h2>
        <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
          Student and staff complaint resolution workflow, departmental SLA delegation & audit trails
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["ALL", "PENDING", "RESOLVED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: `1.5px solid ${statusFilter === status ? "#2563eb" : "#e2e8f0"}`,
              background: statusFilter === status ? "#2563eb" : "#fff",
              color: statusFilter === status ? "#fff" : "#475569",
              cursor: "pointer",
            }}
          >
            {status === "ALL" ? "All Grievances" : status}
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Grievances Log ({filtered.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading grievances...</span>}
        </div>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button className="ad-btn-secondary" onClick={fetchComplaints} style={{ marginTop: 8 }}>Retry</button>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Ticket ID</th>
                  <th className="ad-th">Complainant</th>
                  <th className="ad-th">Category & Issue</th>
                  <th className="ad-th">Assigned Department</th>
                  <th className="ad-th">Status</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading grievances..." : "No complaints found matching this filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const isPending = (c.status || "PENDING").toUpperCase() === "PENDING";
                    return (
                      <tr key={c._id || c.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800 }}>{c.id || c._id}</td>
                        <td className="ad-td">
                          <strong>{c.studentName || c.userId?.name || "Student Complainant"}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{c.phone || c.userId?.phone}</span>
                        </td>
                        <td className="ad-td">
                          <strong>{c.category || "Route Delay"}</strong>
                          <p style={{ fontSize: 12, color: "#475569", margin: "2px 0 0" }}>{c.description || c.subject}</p>
                        </td>
                        <td className="ad-td">
                          <span style={{ fontWeight: 700, color: "#2563eb" }}>
                            {c.department || "Transportation"}
                          </span>
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${isPending ? "ad-badge--yellow" : "ad-badge--green"}`}>
                            ● {c.status || "PENDING"}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            onClick={() => handleOpenAction(c)}
                            style={{ padding: "5px 12px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                          >
                            Resolve / Delegate
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve / Assign Department Modal */}
      {selectedComplaint && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
              Resolve Grievance #{selectedComplaint.id || selectedComplaint._id}
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 14 }}>
              Assign to responsible university department and draft an official commuter response.
            </p>

            <form onSubmit={handleSaveResolution}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Assign to Department</label>
                <select
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept} Department</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Resolution Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Resolution Comments / Response to Student</label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Explain actions taken (e.g., Driver counselled regarding punctuality; replacement bus assigned)..."
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save & Dispatch Resolution
                </button>
                <button type="button" onClick={() => setSelectedComplaint(null)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default AdminComplaints;
