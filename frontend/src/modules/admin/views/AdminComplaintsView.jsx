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
  const { authFetch, complaints, resolveStudentComplaint } = useTransit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMsg, setToastMsg] = useState(null);

  // Resolution & Department Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [assignedDept, setAssignedDept] = useState("Transportation");
  const [resolutionStatus, setResolutionStatus] = useState("RESOLVED");
  const [viewingProofModal, setViewingProofModal] = useState(null);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenAction = (c) => {
    setSelectedComplaint(c);
    setResponseText(c.response || c.resolutionNotes || "");
    setAssignedDept(c.department || "Transportation");
    setResolutionStatus((c.status || "PENDING").toUpperCase() === "PENDING" ? "RESOLVED" : c.status);
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await resolveStudentComplaint(selectedComplaint._id || selectedComplaint.id, {
        response: responseText,
        resolutionNotes: responseText,
        status: resolutionStatus,
        department: assignedDept,
      });
      showNotification(`✓ Grievance #${selectedComplaint.id || selectedComplaint._id} resolved & assigned to ${assignedDept}!`);
      setSelectedComplaint(null);
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
                          <strong>{c.studentName || c.userId?.name || c.submittedBy?.name || "Student Complainant"}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{c.phone || c.userId?.phone || c.submittedBy?.phone}</span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <strong>{c.category || "Route Delay"}</strong>
                            {c.attachment && (
                              <button
                                type="button"
                                onClick={() => setViewingProofModal({ url: c.attachment, name: c.proofName || "Student Attached Proof" })}
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  borderRadius: 4,
                                  fontWeight: 700,
                                  border: "1px solid #bfdbfe",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                📎 View Proof
                              </button>
                            )}
                          </div>
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
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, padding: "24px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
              Resolve Grievance #{selectedComplaint.id || selectedComplaint._id}
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 14 }}>
              Assign to responsible university department and draft an official commuter response.
            </p>

            {/* Attached Proof View in Admin Modal */}
            {selectedComplaint.attachment && (
              <div style={{ marginBottom: 16, padding: 12, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    📎 Attached Proof: {selectedComplaint.proofName || "Evidence File"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingProofModal({ url: selectedComplaint.attachment, name: selectedComplaint.proofName || "Student Attached Proof" })}
                    style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}
                  >
                    Enlarge ↗
                  </button>
                </div>
                {selectedComplaint.attachment.startsWith("data:image/") ? (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={selectedComplaint.attachment}
                      alt="Student Proof"
                      onClick={() => setViewingProofModal({ url: selectedComplaint.attachment, name: selectedComplaint.proofName || "Student Attached Proof" })}
                      style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, objectFit: "contain", border: "1px solid #cbd5e1", cursor: "pointer" }}
                    />
                  </div>
                ) : (
                  <a
                    href={selectedComplaint.attachment}
                    download={selectedComplaint.proofName || "complaint_proof"}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", padding: "6px 12px", background: "#2563eb", color: "#fff", borderRadius: 6, fontSize: 12, textDecoration: "none", fontWeight: 700 }}
                  >
                    Download / Open Attached File ↗
                  </a>
                )}
              </div>
            )}

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

      {/* FULL SCREEN PROOF PREVIEW MODAL FOR ADMIN */}
      {viewingProofModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 20,
          }}
          onClick={() => setViewingProofModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 640,
              width: "100%",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
                📎 Student Attached Proof: {viewingProofModal.name}
              </h4>
              <button
                onClick={() => setViewingProofModal(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>
              {viewingProofModal.url?.startsWith("data:image/") ? (
                <img
                  src={viewingProofModal.url}
                  alt="Student full proof"
                  style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: 8, objectFit: "contain", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{viewingProofModal.name}</div>
                  <a
                    href={viewingProofModal.url}
                    download={viewingProofModal.name || "proof_document"}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", padding: "10px 20px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}
                  >
                    Download / Open Document ↗
                  </a>
                </div>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", background: "#fff", textAlign: "right" }}>
              <button
                onClick={() => setViewingProofModal(null)}
                style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;

