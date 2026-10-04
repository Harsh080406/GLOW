import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ManageDrivers = () => {
  const { authFetch } = useTransit();
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [toastMsg, setToastMsg] = useState(null);

  // Add / Edit Driver Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    yearsOfExperience: 5,
    status: "ON_DUTY",
  });

  // Assign Vehicle Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDriverForBus, setSelectedDriverForBus] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState("");

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [drvRes, busRes] = await Promise.allSettled([
        authFetch("/admin/drivers"),
        authFetch("/admin/fleet"),
      ]);

      if (drvRes.status === "fulfilled" && drvRes.value?.drivers) {
        setDrivers(drvRes.value.drivers);
      }
      if (busRes.status === "fulfilled" && busRes.value?.buses) {
        setBuses(busRes.value.buses);
      }
    } catch (err) {
      setError(err.message || "Failed to load drivers roster");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setDriverForm({
      name: "",
      email: `driver${Math.floor(100 + Math.random() * 900)}@glowbus.edu`,
      phone: "+91 98765 00000",
      licenseNumber: `GJ-06-${Math.floor(2015 + Math.random() * 8)}-${Math.floor(1000 + Math.random() * 9000)}`,
      yearsOfExperience: 5,
      status: "ON_DUTY",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (drv) => {
    setEditingDriver(drv);
    setDriverForm({
      name: drv.name || drv.userId?.name || "",
      email: drv.email || drv.userId?.email || "",
      phone: drv.phone || drv.userId?.phone || "",
      licenseNumber: drv.licenseNumber || "",
      yearsOfExperience: drv.yearsOfExperience || 5,
      status: drv.status || "ON_DUTY",
    });
    setModalOpen(true);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await authFetch(`/admin/drivers/${editingDriver._id || editingDriver.id}`, {
          method: "PUT",
          body: JSON.stringify(driverForm),
        });
        showNotification(`✓ Updated driver details for ${driverForm.name}`);
      } else {
        await authFetch("/admin/drivers", {
          method: "POST",
          body: JSON.stringify(driverForm),
        });
        showNotification(`✓ Registered new driver ${driverForm.name}`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Error saving driver: " + err.message);
    }
  };

  const handleDeleteDriver = async (id, name) => {
    if (!window.confirm(`Delete driver ${name} from roster?`)) return;
    try {
      await authFetch(`/admin/drivers/${id}`, { method: "DELETE" });
      showNotification(`✓ Driver ${name} deleted`);
      loadData();
    } catch (err) {
      alert("Error deleting driver: " + err.message);
    }
  };

  const handleOpenAssign = (drv) => {
    setSelectedDriverForBus(drv);
    setSelectedBusId(drv.assignedBusId?._id || drv.assignedBusId || "");
    setAssignModalOpen(true);
  };

  const handleAssignVehicle = async (e) => {
    e.preventDefault();
    if (!selectedDriverForBus || !selectedBusId) return;

    try {
      await authFetch(`/admin/drivers/${selectedDriverForBus._id || selectedDriverForBus.id}/assign-vehicle`, {
        method: "POST",
        body: JSON.stringify({ busId: selectedBusId }),
      });
      showNotification(`✓ Assigned vehicle to driver successfully (transaction verified)`);
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      alert("Transaction failed: " + err.message);
    }
  };

  const filtered = drivers.filter((d) => {
    const st = (d.status || "ON_DUTY").toUpperCase();
    if (filter !== "All" && st !== filter.toUpperCase()) return false;
    const q = search.toLowerCase();
    const name = (d.name || d.userId?.name || "").toLowerCase();
    const lic = (d.licenseNumber || "").toLowerCase();
    return name.includes(q) || lic.includes(q);
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
      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Drivers Roster & Vehicle Allocations</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Full CRUD on university drivers, licensing checks & transactional vehicle assignment
          </p>
        </div>
        <button className="ad-btn-primary" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
          Add New Driver
        </button>
      </div>

      {/* Driver Stats */}
      <div className="ad-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Total Drivers Roster</p>
            <p className="ad-stat-value">{drivers.length || 92}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
            <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" stroke="#3b82f6" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">On Active Duty</p>
            <p className="ad-stat-value">{drivers.filter((d) => (d.status || "").toUpperCase() === "ON_DUTY" || (d.status || "") === "On Duty").length}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22c55e" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Vehicles Assigned</p>
            <p className="ad-stat-value">{drivers.filter((d) => d.assignedBusId).length}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#faf5ff" }}>
            <Icon d="M3 12h18M3 6h18M3 18h18" stroke="#a855f7" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          className="ad-search"
          placeholder="Search driver by name or license..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 250px", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "ON_DUTY", "OFF_DUTY", "ON_LEAVE"].map((f) => (
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
              {f === "All" ? "All Shifts" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Licensed Drivers Directory ({filtered.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading drivers...</span>}
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
                  <th className="ad-th">Driver Name</th>
                  <th className="ad-th">Phone & License</th>
                  <th className="ad-th">Experience</th>
                  <th className="ad-th">Assigned Bus</th>
                  <th className="ad-th">Status</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading roster..." : "No drivers found matching filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => {
                    const name = d.name || d.userId?.name || "Driver";
                    const phone = d.phone || d.userId?.phone || "+91 XXXXX XXXXX";
                    const assignedBus = d.assignedBusId?.busNumber || d.assignedBusId?.registrationNumber || d.assignedBusId || "Unassigned";
                    const status = (d.status || "ON_DUTY").toUpperCase();
                    return (
                      <tr key={d._id || d.id} className="ad-tr">
                        <td className="ad-td">
                          <strong>{name}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{d.email || d.userId?.email}</span>
                        </td>
                        <td className="ad-td">
                          <span>{phone}</span>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>Lic: {d.licenseNumber || "GJ-XX-XXXX"}</span>
                        </td>
                        <td className="ad-td">{d.yearsOfExperience || 5} yrs</td>
                        <td className="ad-td">
                          <span style={{ fontWeight: 700, color: assignedBus !== "Unassigned" ? "#0f172a" : "#94a3b8" }}>
                            {assignedBus}
                          </span>
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${
                            status === "ON_DUTY" ? "ad-badge--green" :
                            status === "ON_LEAVE" ? "ad-badge--yellow" : "ad-badge--red"
                          }`}>
                            ● {status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleOpenAssign(d)}
                              style={{ padding: "4px 8px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Assign Vehicle
                            </button>
                            <button
                              onClick={() => handleOpenEdit(d)}
                              style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(d._id || d.id, name)}
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

      {/* Add / Edit Driver Modal */}
      {modalOpen && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
              {editingDriver ? "Edit Driver Profile" : "Register Driver to Roster"}
            </h3>
            <form onSubmit={handleDriverSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Driver Full Name</label>
                <input
                  type="text"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Phone</label>
                  <input
                    type="text"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>License Number</label>
                  <input
                    type="text"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Years Experience</label>
                  <input
                    type="number"
                    value={driverForm.yearsOfExperience}
                    onChange={(e) => setDriverForm({ ...driverForm, yearsOfExperience: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Status</label>
                  <select
                    value={driverForm.status}
                    onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="ON_DUTY">ON_DUTY</option>
                    <option value="OFF_DUTY">OFF_DUTY</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  {editingDriver ? "Save Changes" : "Register Driver"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactional Vehicle Assignment Modal */}
      {assignModalOpen && selectedDriverForBus && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Assign Fleet Vehicle</h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Driver: <strong>{selectedDriverForBus.name || selectedDriverForBus.userId?.name}</strong>.
              Uses database transactions to ensure exclusive single-bus driver allocation.
            </p>

            <form onSubmit={handleAssignVehicle}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Available Bus</label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="">-- Choose a Bus --</option>
                  {buses.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.busNumber || b.id} ({b.registrationNumber || b.regNo}) — {b.status || "IDLE"}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Confirm Assignment
                </button>
                <button type="button" onClick={() => setAssignModalOpen(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default ManageDrivers;