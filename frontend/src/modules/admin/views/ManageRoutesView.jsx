import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ManageRoutes = () => {
  const { authFetch } = useTransit();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState(null);

  // Add / Edit Route Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [form, setForm] = useState({
    name: "",
    routeNumber: "R-01",
    totalDistanceKm: 12.5,
    estimatedDurationMin: 35,
    status: "ACTIVE",
  });

  // Edit Stops Reordering Modal
  const [stopsModalOpen, setStopsModalOpen] = useState(false);
  const [selectedRouteForStops, setSelectedRouteForStops] = useState(null);
  const [stopsList, setStopsList] = useState([]);
  const [newStopName, setNewStopName] = useState("");

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/routes");
      if (res && res.routes) {
        setRoutes(res.routes);
      }
    } catch (err) {
      setError(err.message || "Failed to load routes");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setForm({
      name: "Fatehgunj Express",
      routeNumber: `R-0${Math.floor(1 + Math.random() * 9)}`,
      totalDistanceKm: 14.5,
      estimatedDurationMin: 40,
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditingRoute(r);
    setForm({
      name: r.name || "",
      routeNumber: r.routeNumber || "",
      totalDistanceKm: r.totalDistanceKm || 12,
      estimatedDurationMin: r.estimatedDurationMin || 30,
      status: r.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await authFetch(`/admin/routes/${editingRoute._id || editingRoute.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showNotification(`✓ Route ${form.name} updated!`);
      } else {
        await authFetch("/admin/routes", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            stops: [
              { stopName: "Main Campus Station", orderIndex: 0, scheduledTime: "07:30 AM" },
              { stopName: "Terminal Stop", orderIndex: 1, scheduledTime: "08:15 AM" },
            ],
          }),
        });
        showNotification(`✓ Created route ${form.name}!`);
      }
      setModalOpen(false);
      fetchRoutes();
    } catch (err) {
      alert("Error saving route: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete route ${name}?`)) return;
    try {
      await authFetch(`/admin/routes/${id}`, { method: "DELETE" });
      showNotification(`✓ Deleted route ${name}`);
      fetchRoutes();
    } catch (err) {
      alert("Error deleting route: " + err.message);
    }
  };

  // Stops sequence editing
  const handleOpenStops = (r) => {
    setSelectedRouteForStops(r);
    const sortedStops = [...(r.stops || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    setStopsList(sortedStops);
    setStopsModalOpen(true);
  };

  const handleMoveStop = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= stopsList.length) return;
    const updated = [...stopsList];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    // Recalculate orderIndex
    const reindexed = updated.map((s, idx) => ({ ...s, orderIndex: idx }));
    setStopsList(reindexed);
  };

  const handleAddStopToRoute = () => {
    if (!newStopName.trim()) return;
    const newStop = {
      stopName: newStopName.trim(),
      orderIndex: stopsList.length,
      scheduledTime: "07:45 AM",
    };
    setStopsList([...stopsList, newStop]);
    setNewStopName("");
  };

  const handleRemoveStopFromRoute = (index) => {
    const updated = stopsList.filter((_, i) => i !== index).map((s, idx) => ({ ...s, orderIndex: idx }));
    setStopsList(updated);
  };

  const handleSaveStopsSequence = async () => {
    if (!selectedRouteForStops) return;
    try {
      await authFetch(`/admin/routes/${selectedRouteForStops._id || selectedRouteForStops.id}/stops`, {
        method: "PUT",
        body: JSON.stringify({ stops: stopsList }),
      });
      showNotification(`✓ Updated stops sequence and order indices!`);
      setStopsModalOpen(false);
      fetchRoutes();
    } catch (err) {
      alert("Error updating stops: " + err.message);
    }
  };

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const name = (r.name || "").toLowerCase();
    const num = (r.routeNumber || "").toLowerCase();
    return name.includes(q) || num.includes(q);
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
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Transit Corridors & Bus Stop Sequences</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Full CRUD on university routes, sequence reordering & embedded stop configuration
          </p>
        </div>
        <button className="ad-btn-primary" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
          Create New Route
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="ad-search"
          placeholder="Search route by name or corridor code (e.g. R-04)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 380, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
        />
      </div>

      {/* Routes Cards / Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Transit Route Corridors ({filtered.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading routes...</span>}
        </div>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button className="ad-btn-secondary" onClick={fetchRoutes} style={{ marginTop: 8 }}>Retry</button>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Code</th>
                  <th className="ad-th">Route Corridor</th>
                  <th className="ad-th">Distance & Duration</th>
                  <th className="ad-th">Stops Count</th>
                  <th className="ad-th">Status</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading routes..." : "No routes found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const stops = r.stops || [];
                    const status = (r.status || "ACTIVE").toUpperCase();
                    return (
                      <tr key={r._id || r.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800 }}>{r.routeNumber || "R-XX"}</td>
                        <td className="ad-td">
                          <strong>{r.name}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                            {stops.length > 0 ? `${stops[0]?.stopName || "Origin"} → ${stops[stops.length - 1]?.stopName || "Destination"}` : "No stops defined"}
                          </span>
                        </td>
                        <td className="ad-td">{r.totalDistanceKm || 12} km · ~{r.estimatedDurationMin || 30} mins</td>
                        <td className="ad-td">
                          <span style={{ fontWeight: 700, color: "#2563eb" }}>{stops.length} stops</span>
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${status === "ACTIVE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            ● {status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleOpenStops(r)}
                              style={{ padding: "4px 8px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Edit Stops ({stops.length})
                            </button>
                            <button
                              onClick={() => handleOpenEdit(r)}
                              style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r._id || r.id, r.name)}
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

      {/* Add / Edit Route Modal */}
      {modalOpen && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
              {editingRoute ? "Edit Route Corridor" : "Create New Route"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Route Code (e.g. R-04)</label>
                <input
                  type="text"
                  value={form.routeNumber}
                  onChange={(e) => setForm({ ...form, routeNumber: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Route Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.totalDistanceKm}
                    onChange={(e) => setForm({ ...form, totalDistanceKm: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Duration (min)</label>
                  <input
                    type="number"
                    value={form.estimatedDurationMin}
                    onChange={(e) => setForm({ ...form, estimatedDurationMin: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  {editingRoute ? "Save Route" : "Create Route"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Stops Sequence Editor Modal */}
      {stopsModalOpen && selectedRouteForStops && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, padding: "24px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
              Stops Sequence: {selectedRouteForStops.name}
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Reorder stops to modify sequence & orderIndex directly on the Route document.
            </p>

            {/* Add new stop to sequence */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Enter new stop name..."
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={handleAddStopToRoute}
                className="ad-btn-primary"
                style={{ padding: "8px 14px", fontSize: 12 }}
              >
                + Add Stop
              </button>
            </div>

            {/* List of stops with Up / Down order buttons */}
            <div style={{ flex: 1, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, marginBottom: 16 }}>
              {stopsList.length === 0 ? (
                <p style={{ textAlign: "center", color: "#64748b", padding: 20 }}>No stops added yet.</p>
              ) : (
                stopsList.map((stop, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: "#f8fafc",
                      borderRadius: 6,
                      marginBottom: 6,
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 12, background: "#2563eb", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{stop.stopName}</span>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStop(idx, -1)}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 4, cursor: idx === 0 ? "not-allowed" : "pointer" }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === stopsList.length - 1}
                        onClick={() => handleMoveStop(idx, 1)}
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 4, cursor: idx === stopsList.length - 1 ? "not-allowed" : "pointer" }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStopFromRoute(idx)}
                        style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer" }}
                        title="Remove Stop"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleSaveStopsSequence}
                style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Save Stops Sequence
              </button>
              <button
                type="button"
                onClick={() => setStopsModalOpen(false)}
                style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoutes;
