import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import { OFFICIAL_13_BUSES } from "../../../shared/data/officialRoutes2026";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const BusIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1" fill={color} stroke="none" />
    <circle cx="17" cy="19" r="1" fill={color} stroke="none" />
    <path d="M6 5V3M18 5V3" />
  </svg>
);

const ManageFleet = () => {
  const { authFetch } = useTransit();
  const [buses, setBuses] = useState(() => (Array.isArray(OFFICIAL_13_BUSES) ? OFFICIAL_13_BUSES : []));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const [form, setForm] = useState({
    busNumber: "",
    registrationNumber: "",
    busType: "Volvo AC",
    capacity: 52,
    fitnessCertificateExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "IDLE",
  });

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/fleet");
      if (res && res.buses) {
        setBuses(res.buses);
      }
    } catch (err) {
      setError(err.message || "Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleOpenAdd = () => {
    setEditingBus(null);
    setForm({
      busNumber: `BUS-${Math.floor(100 + Math.random() * 900)}`,
      registrationNumber: "GJ-06-AB-9999",
      busType: "Volvo AC",
      capacity: 52,
      fitnessCertificateExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "IDLE",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBus(b);
    setForm({
      busNumber: b.busNumber || b.id || "",
      registrationNumber: b.registrationNumber || b.regNo || "",
      busType: b.busType || b.type || "Volvo AC",
      capacity: b.capacity || 52,
      fitnessCertificateExpiry: b.fitnessCertificateExpiry
        ? new Date(b.fitnessCertificateExpiry).toISOString().slice(0, 10)
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: (b.status || "IDLE").toUpperCase(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await authFetch(`/admin/fleet/${editingBus._id || editingBus.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showNotification(`✓ Bus ${form.busNumber} updated successfully!`);
      } else {
        await authFetch("/admin/fleet", {
          method: "POST",
          body: JSON.stringify(form),
        });
        showNotification(`✓ Bus ${form.busNumber} registered into fleet!`);
      }
      setModalOpen(false);
      fetchBuses();
    } catch (err) {
      alert("Error saving bus: " + err.message);
    }
  };

  const handleDelete = async (id, busNo) => {
    if (!window.confirm(`Delete bus ${busNo} from fleet?`)) return;
    try {
      await authFetch(`/admin/fleet/${id}`, { method: "DELETE" });
      showNotification(`✓ Bus ${busNo} removed from fleet`);
      fetchBuses();
    } catch (err) {
      alert("Error deleting bus: " + err.message);
    }
  };

  const filtered = buses.filter((b) => {
    const status = (b.status || "IDLE").toUpperCase();
    if (filter !== "All" && status !== filter.toUpperCase()) return false;
    const q = search.toLowerCase();
    const bNum = (b.busNumber || b.id || "").toLowerCase();
    const rNum = (b.registrationNumber || b.regNo || "").toLowerCase();
    return bNum.includes(q) || rNum.includes(q);
  });

  const expiringSoonCount = buses.filter((b) => b.fitnessExpiringSoon).length;

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

      {/* Fitness Certificate Warning Banner */}
      {expiringSoonCount > 0 && (
        <div style={{
          background: "#fffbeb", border: "1.5px solid #f59e0b", color: "#92400e",
          borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>
              {expiringSoonCount} Vehicle Fitness Certificate{expiringSoonCount > 1 ? "s" : ""} Expiring Within 30 Days!
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: "#b45309" }}>
              Scheduled motor vehicles compliance audit flags these buses for RTO renewal inspections.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Campus Bus Fleet Management</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Full CRUD on university fleet inventory, live health telematics & fitness tracking
          </p>
        </div>
        <button className="ad-btn-primary" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
          Add New Bus
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="ad-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Total Fleet Buses</p>
            <p className="ad-stat-value">{buses.length || 13}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
            <BusIcon size={24} color="#3b82f6" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Active On Route</p>
            <p className="ad-stat-value">{buses.filter((b) => (b.status || "").toUpperCase() === "ON_ROUTE" || (b.status || "") === "On Route").length}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
            <BusIcon size={24} color="#22c55e" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Under Maintenance</p>
            <p className="ad-stat-value">{buses.filter((b) => (b.status || "").toUpperCase() === "MAINTENANCE" || (b.status || "") === "Maintenance").length}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#fef2f2" }}>
            <BusIcon size={24} color="#ef4444" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Expiring Fitness (&lt;30d)</p>
            <p className="ad-stat-value">{expiringSoonCount}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#fffbeb" }}>
            <Icon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          className="ad-search"
          placeholder="Search bus number or registration plate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 250px", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "ON_ROUTE", "IDLE", "MAINTENANCE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: `1.5px solid ${filter === f ? "#2563eb" : "#e2e8f0"}`,
                background: filter === f ? "#2563eb" : "#fff",
                color: filter === f ? "#fff" : "#475569",
                cursor: "pointer",
              }}
            >
              {f === "All" ? "All Status" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Fleet Directory ({filtered.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading fleet...</span>}
        </div>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button className="ad-btn-secondary" onClick={fetchBuses} style={{ marginTop: 8 }}>Retry</button>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Bus Number</th>
                  <th className="ad-th">Registration</th>
                  <th className="ad-th">Type</th>
                  <th className="ad-th">Capacity</th>
                  <th className="ad-th">Fitness Expiry</th>
                  <th className="ad-th">Status</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading buses..." : "No buses found matching filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const status = (b.status || "IDLE").toUpperCase();
                    const expiryDate = b.fitnessCertificateExpiry
                      ? new Date(b.fitnessCertificateExpiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "Not set";
                    return (
                      <tr key={b._id || b.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800 }}>{b.busNumber || b.id}</td>
                        <td className="ad-td">{b.registrationNumber || b.regNo || "GJ-06-XXXX"}</td>
                        <td className="ad-td">{b.busType || b.type || "Standard"}</td>
                        <td className="ad-td">{b.capacity || 52} seats</td>
                        <td className="ad-td">
                          <span>{expiryDate}</span>
                          {b.fitnessExpiringSoon && (
                            <span style={{ marginLeft: 6, background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                              ⚠️ &lt; 30 Days
                            </span>
                          )}
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${
                            status === "ON_ROUTE" || status === "ON ROUTE" ? "ad-badge--green" :
                            status === "MAINTENANCE" ? "ad-badge--red" : "ad-badge--yellow"
                          }`}>
                            ● {status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleOpenEdit(b)}
                              style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b._id || b.id, b.busNumber || b.id)}
                              style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Delete
                            </button>
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

      {/* Add / Edit Bus Modal */}
      {modalOpen && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
              {editingBus ? "Edit Fleet Vehicle" : "Register New Fleet Bus"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Bus Code / Number</label>
                <input
                  type="text"
                  value={form.busNumber}
                  onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Registration Number</label>
                <input
                  type="text"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Bus Model / Type</label>
                  <input
                    type="text"
                    value={form.busType}
                    onChange={(e) => setForm({ ...form, busType: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Seating Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Fitness Certificate Expiry</label>
                <input
                  type="date"
                  value={form.fitnessCertificateExpiry}
                  onChange={(e) => setForm({ ...form, fitnessCertificateExpiry: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="IDLE">IDLE</option>
                  <option value="ON_ROUTE">ON_ROUTE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  {editingBus ? "Save Changes" : "Register Bus"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default ManageFleet;
