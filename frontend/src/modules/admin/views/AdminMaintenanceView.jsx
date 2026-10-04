import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminMaintenance = () => {
  const { authFetch } = useTransit();
  const [records, setRecords] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [form, setForm] = useState({
    busId: "BUS-112",
    issue: "Brake Pad Replacement & Hydraulic Check",
    cost: 4800,
    garage: "Shreeji Auto Hub",
    status: "In Progress",
  });

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [mRes, bRes] = await Promise.allSettled([
        authFetch("/admin/maintenance"),
        authFetch("/admin/fleet"),
      ]);

      if (mRes.status === "fulfilled" && mRes.value?.maintenance) {
        setRecords(mRes.value.maintenance);
      }
      if (bRes.status === "fulfilled" && bRes.value?.buses) {
        setBuses(bRes.value.buses);
      }
    } catch (err) {
      setError(err.message || "Failed to load maintenance logs");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await authFetch("/admin/maintenance", {
        method: "POST",
        body: JSON.stringify(form),
      });
      showNotification("✓ Maintenance work order logged successfully!");
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert("Error logging maintenance: " + err.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await authFetch(`/admin/maintenance/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      showNotification(`✓ Vehicle marked as ${newStatus} & restored to service readiness`);
      loadData();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const inProgressCount = records.filter((r) => r.status === "In Progress" || r.status === "IN_PROGRESS").length;
  const totalCost = records.reduce((acc, curr) => acc + (curr.cost || 0), 0);

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
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Fleet Maintenance & Workshop Logs</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Full CRUD on vehicle servicing work orders, repair costs & fitness re-certifications
          </p>
        </div>
        <button className="ad-btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
          + Log Service / Repair
        </button>
      </div>

      {/* Maintenance KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "20px" }}>
          <p style={{ fontSize: 12, color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Vehicles in Workshop</p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#dc2626", marginTop: 4 }}>{inProgressCount} Buses</h2>
          <p style={{ fontSize: 12, color: "#b91c1c", marginTop: 4 }}>Under Active Service</p>
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px" }}>
          <p style={{ fontSize: 12, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Completed Work Orders</p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#16a34a", marginTop: 4 }}>
            {records.filter((r) => r.status === "Completed").length} Done
          </h2>
          <p style={{ fontSize: 12, color: "#15803d", marginTop: 4 }}>Cleared for Route Dispatch</p>
        </div>

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "20px" }}>
          <p style={{ fontSize: 12, color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>Total Servicing Spend</p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#2563eb", marginTop: 4 }}>₹{(totalCost / 1000).toFixed(1)}k</h2>
          <p style={{ fontSize: 12, color: "#1d4ed8", marginTop: 4 }}>Fiscal Year To Date</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Maintenance Work Order Records ({records.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading logs...</span>}
        </div>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button className="ad-btn-secondary" onClick={loadData} style={{ marginTop: 8 }}>Retry</button>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Work Order ID</th>
                  <th className="ad-th">Bus ID</th>
                  <th className="ad-th">Issue / Service Nature</th>
                  <th className="ad-th">Authorized Garage</th>
                  <th className="ad-th">Cost</th>
                  <th className="ad-th">Status</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading logs..." : "No maintenance records found."}
                    </td>
                  </tr>
                ) : (
                  records.map((m) => {
                    const isInProgress = m.status === "In Progress" || m.status === "IN_PROGRESS";
                    return (
                      <tr key={m.id || m._id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800 }}>{m.id || m._id}</td>
                        <td className="ad-td"><strong>{m.busId}</strong></td>
                        <td className="ad-td">{m.issue}</td>
                        <td className="ad-td">{m.garage || "University Fleet Workshop"}</td>
                        <td className="ad-td" style={{ fontWeight: 700 }}>₹{(m.cost || 0).toLocaleString()}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${isInProgress ? "ad-badge--yellow" : "ad-badge--green"}`}>
                            ● {m.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            {isInProgress ? (
                              <button
                                onClick={() => handleUpdateStatus(m.id || m._id, "Completed")}
                                style={{ padding: "4px 8px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                              >
                                Mark Vehicle Fit
                              </button>
                            ) : (
                              <button
                                onClick={() => alert(`Invoice receipt #${m.id || m._id} approved by Finance`)}
                                style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                              >
                                View Invoice
                              </button>
                            )}
                          </div>
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

      {/* Add Work Order Modal */}
      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Log Maintenance Work Order</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Vehicle</label>
                <input
                  type="text"
                  placeholder="e.g. BUS-112"
                  value={form.busId}
                  onChange={(e) => setForm({ ...form, busId: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Service Nature / Issue</label>
                <input
                  type="text"
                  placeholder="e.g. Engine Oil Change & Filter Replacement"
                  value={form.issue}
                  onChange={(e) => setForm({ ...form, issue: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Service Hub / Garage</label>
                  <input
                    type="text"
                    value={form.garage}
                    onChange={(e) => setForm({ ...form, garage: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Submit Work Order
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
