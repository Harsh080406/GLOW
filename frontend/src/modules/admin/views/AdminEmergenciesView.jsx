import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminEmergencies = () => {
  const { authFetch, sosAlerts = [], isWsConnected } = useTransit();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Broadcast Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("URGENT: Campus Perimeter Route Advisory");
  const [broadcastMessage, setBroadcastMessage] = useState("Severe traffic gridlock near Chhani Jakat Naka. Fleet routes R-01 and R-04 delayed by 15 minutes.");
  const [broadcastSeverity, setBroadcastSeverity] = useState("HIGH");

  // Dispatch / Resolve Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionType, setActionType] = useState("DISPATCH"); // 'DISPATCH' | 'RESOLVE'
  const [incidentNotes, setIncidentNotes] = useState("");

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchEmergencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/emergencies");
      if (res && res.emergencies) {
        setEmergencies(res.emergencies);
      }
    } catch (err) {
      setError(err.message || "Failed to load emergencies");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchEmergencies();
  }, [fetchEmergencies]);

  // Combine DB emergencies with real-time incoming WebSocket sosAlerts
  const combinedAlerts = [...emergencies];
  sosAlerts.forEach((wsAlert) => {
    if (!combinedAlerts.some((e) => e.id === wsAlert.id || e._id === wsAlert.id)) {
      combinedAlerts.unshift(wsAlert);
    }
  });

  const activeList = combinedAlerts.filter((e) => e.status === "ACTIVE" || e.status === "MONITORING" || e.status === "DISPATCHED");
  const historyList = combinedAlerts.filter((e) => e.status === "RESOLVED");

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      await authFetch("/admin/emergencies/broadcast", {
        method: "POST",
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          severity: broadcastSeverity,
        }),
      });
      showNotification("✓ Campus emergency broadcast pushed to all student & driver channels!");
      setShowBroadcastModal(false);
    } catch (err) {
      alert("Error broadcasting alert: " + err.message);
    }
  };

  const handleExecuteIncidentAction = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      const endpoint = actionType === "DISPATCH"
        ? `/admin/emergencies/${selectedIncident._id || selectedIncident.id}/dispatch`
        : `/admin/emergencies/${selectedIncident._id || selectedIncident.id}/resolve`;

      await authFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          responderNotes: incidentNotes,
          resolutionNotes: incidentNotes,
        }),
      });

      showNotification(`✓ Emergency signal #${selectedIncident.id || selectedIncident._id} marked as ${actionType === "DISPATCH" ? "DISPATCHED" : "RESOLVED"}!`);
      setSelectedIncident(null);
      setIncidentNotes("");
      fetchEmergencies();
    } catch (err) {
      alert("Error processing emergency action: " + err.message);
    }
  };

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
      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Emergencies & SOS Control Room</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Live `sos:alerts` WebSocket feed, rapid security team dispatch & campus-wide notification broadcast
          </p>
        </div>
        <button
          className="ad-btn-primary"
          onClick={() => setShowBroadcastModal(true)}
          style={{ background: "#dc2626", borderColor: "#b91c1c", display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ fontSize: 16 }}>📢</span>
          Broadcast Campus Alert
        </button>
      </div>

      {/* Live SOS Channel Indicator */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: isWsConnected ? "#fef2f2" : "#f1f5f9",
          color: isWsConnected ? "#b91c1c" : "#64748b",
          border: `1px solid ${isWsConnected ? "#fca5a5" : "#cbd5e1"}`,
          padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: isWsConnected ? "#ef4444" : "#94a3b8" }} />
          Channel: sos:alerts ({isWsConnected ? "Live Listening" : "Offline"})
        </span>
      </div>

      {/* Active Emergencies Section */}
      <div className="ad-card" style={{ marginBottom: 24, border: "2px solid #ef4444" }}>
        <div className="ad-card-header" style={{ background: "#fef2f2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <h3 className="ad-card-title" style={{ color: "#dc2626" }}>Active Emergency Signals ({activeList.length})</h3>
          </div>
          <span className="ad-badge ad-badge--red">Priority 1</span>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="ad-th">Incident ID</th>
                <th className="ad-th">Signal Type</th>
                <th className="ad-th">Bus / Commuter</th>
                <th className="ad-th">GPS Location</th>
                <th className="ad-th">Reported Time</th>
                <th className="ad-th">Status</th>
                <th className="ad-th">Action Control</th>
              </tr>
            </thead>
            <tbody>
              {activeList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#16a34a", fontWeight: 700 }}>
                    ✓ No active emergencies. All transit corridors operating nominally.
                  </td>
                </tr>
              ) : (
                activeList.map((e) => (
                  <tr key={e._id || e.id} className="ad-tr" style={{ background: "#fff5f5" }}>
                    <td className="ad-td" style={{ fontWeight: 800 }}>{e.id || e._id}</td>
                    <td className="ad-td">
                      <strong style={{ color: "#dc2626" }}>{e.type || "SOS PANIC"}</strong>
                    </td>
                    <td className="ad-td">{e.busId || e.driverName || "Fleet Unit"}</td>
                    <td className="ad-td">{e.location || "Campus Perimeter"}</td>
                    <td className="ad-td">{e.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="ad-td">
                      <span className="ad-badge ad-badge--red">● {e.status}</span>
                    </td>
                    <td className="ad-td">
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => { setSelectedIncident(e); setActionType("DISPATCH"); }}
                          style={{ padding: "4px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                        >
                          Dispatch Security Team
                        </button>
                        <button
                          onClick={() => { setSelectedIncident(e); setActionType("RESOLVE"); }}
                          style={{ padding: "4px 10px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                        >
                          Resolve Emergency
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved Incidents History */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Resolved Incident History ({historyList.length})</h3>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="ad-th">Incident ID</th>
                <th className="ad-th">Signal Type</th>
                <th className="ad-th">Bus / Reporter</th>
                <th className="ad-th">Location</th>
                <th className="ad-th">Resolution Notes</th>
                <th className="ad-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                    No previous incidents recorded.
                  </td>
                </tr>
              ) : (
                historyList.map((e) => (
                  <tr key={e._id || e.id} className="ad-tr">
                    <td className="ad-td" style={{ fontWeight: 700 }}>{e.id || e._id}</td>
                    <td className="ad-td">{e.type}</td>
                    <td className="ad-td">{e.busId || "Fleet Unit"}</td>
                    <td className="ad-td">{e.location}</td>
                    <td className="ad-td">{e.resolutionNotes || e.notes || "Resolved"}</td>
                    <td className="ad-td">
                      <span className="ad-badge ad-badge--green">✓ RESOLVED</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Campus Alert Modal */}
      {showBroadcastModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "#dc2626" }}>
              📢 Broadcast Campus Emergency Alert
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Fans out immediate push/WebSocket notifications to all students, drivers, and campus transit displays.
            </p>

            <form onSubmit={handleBroadcastAlert}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Broadcast Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Severity Level</label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="HIGH">HIGH (Urgent Incident)</option>
                  <option value="CRITICAL">CRITICAL (Campus Lockdown / Immediate Standstill)</option>
                  <option value="MEDIUM">MEDIUM (Weather / Route Delay Advisory)</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Broadcast Message Content</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Transmit Broadcast Now
                </button>
                <button type="button" onClick={() => setShowBroadcastModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Dispatch / Resolve Modal */}
      {selectedIncident && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              {actionType === "DISPATCH" ? "Dispatch Campus Security Team" : "Resolve Incident Signal"}
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Incident: <strong>{selectedIncident.type || "SOS Signal"}</strong> on {selectedIncident.busId || "Fleet Unit"}.
            </p>

            <form onSubmit={handleExecuteIncidentAction}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                  {actionType === "DISPATCH" ? "Security Team Instructions / Unit Dispatched" : "Incident Resolution Log Notes"}
                </label>
                <textarea
                  rows={4}
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder={actionType === "DISPATCH" ? "e.g. Unit Sec-3 dispatched with medic kit..." : "e.g. Passenger cleared; route resumed."}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: actionType === "DISPATCH" ? "#dc2626" : "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {actionType === "DISPATCH" ? "Confirm Dispatch" : "Mark Resolved"}
                </button>
                <button type="button" onClick={() => setSelectedIncident(null)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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
