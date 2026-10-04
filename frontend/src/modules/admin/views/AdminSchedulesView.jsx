import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminSchedules = () => {
  const { authFetch } = useTransit();
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [toastMsg, setToastMsg] = useState(null);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({
    routeId: "",
    busId: "",
    shiftType: "MORNING",
    departureTime: "07:30 AM",
    published: true,
  });

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedRes, routeRes, busRes] = await Promise.allSettled([
        authFetch("/admin/schedules"),
        authFetch("/admin/routes"),
        authFetch("/admin/fleet"),
      ]);

      if (schedRes.status === "fulfilled" && schedRes.value?.schedules) {
        setSchedules(schedRes.value.schedules);
      }
      if (routeRes.status === "fulfilled" && routeRes.value?.routes) {
        setRoutes(routeRes.value.routes);
      }
      if (busRes.status === "fulfilled" && busRes.value?.buses) {
        setBuses(busRes.value.buses);
      }
    } catch (err) {
      setError(err.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setSlotForm({
      routeId: routes[0]?._id || routes[0]?.id || "",
      busId: buses[0]?._id || buses[0]?.id || "",
      shiftType: "MORNING",
      departureTime: "07:30 AM",
      published: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      routeId: slot.routeId?._id || slot.routeId || "",
      busId: slot.busId?._id || slot.busId || "",
      shiftType: slot.shiftType || "MORNING",
      departureTime: slot.departureTime || "07:30 AM",
      published: slot.published !== false,
    });
    setModalOpen(true);
  };

  const handleSubmitSlot = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await authFetch(`/admin/schedules/${editingSlot._id || editingSlot.id}`, {
          method: "PUT",
          body: JSON.stringify(slotForm),
        });
        showNotification("✓ Schedule slot updated successfully");
      } else {
        await authFetch("/admin/schedules", {
          method: "POST",
          body: JSON.stringify(slotForm),
        });
        showNotification("✓ Added new schedule slot");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Error saving schedule: " + err.message);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Delete this schedule slot?")) return;
    try {
      await authFetch(`/admin/schedules/${id}`, { method: "DELETE" });
      showNotification("✓ Deleted schedule slot");
      loadData();
    } catch (err) {
      alert("Error deleting slot: " + err.message);
    }
  };

  const handlePublishTimetable = async () => {
    try {
      await authFetch("/admin/schedules/publish", {
        method: "POST",
        body: JSON.stringify({ published: true }),
      });
      showNotification("✓ Timetable published to all students and drivers!");
      loadData();
    } catch (err) {
      alert("Error publishing timetable: " + err.message);
    }
  };

  const filtered = schedules.filter((s) => {
    if (filterType === "ALL") return true;
    return (s.shiftType || "").toUpperCase() === filterType.toUpperCase();
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
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Bus Timetables & Staggered Shifts</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Manage regular morning/evening slots, exam specials & publish synchronized timetables
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="ad-btn-secondary"
            onClick={handlePublishTimetable}
            style={{ background: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0", fontWeight: 700 }}
          >
            📢 Publish Timetable
          </button>
          <button className="ad-btn-primary" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
            + New Schedule Slot
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["ALL", "MORNING", "EVENING", "EXAM"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: `1.5px solid ${filterType === type ? "#2563eb" : "#e2e8f0"}`,
              background: filterType === type ? "#2563eb" : "#fff",
              color: filterType === type ? "#fff" : "#475569",
              cursor: "pointer",
            }}
          >
            {type === "ALL" ? "All Shifts" : `${type} Shift`}
          </button>
        ))}
      </div>

      {/* Schedules Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Active Schedule Slots ({filtered.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading schedules...</span>}
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
                  <th className="ad-th">Shift Type</th>
                  <th className="ad-th">Route Corridor</th>
                  <th className="ad-th">Assigned Bus</th>
                  <th className="ad-th">Departure Time</th>
                  <th className="ad-th">Published</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading schedules..." : "No schedules found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((slot) => {
                    const routeName = slot.routeId?.name || slot.route || "Corridor";
                    const busName = slot.busId?.busNumber || slot.bus || "Bus";
                    return (
                      <tr key={slot._id || slot.id} className="ad-tr">
                        <td className="ad-td">
                          <span className={`ad-badge ${
                            slot.shiftType === "MORNING" ? "ad-badge--blue" :
                            slot.shiftType === "EXAM" ? "ad-badge--purple" : "ad-badge--yellow"
                          }`}>
                            {slot.shiftType || "MORNING"}
                          </span>
                        </td>
                        <td className="ad-td">
                          <strong>{routeName}</strong>
                        </td>
                        <td className="ad-td">{busName}</td>
                        <td className="ad-td" style={{ fontWeight: 700 }}>{slot.departureTime || "07:30 AM"}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${slot.published !== false ? "ad-badge--green" : "ad-badge--red"}`}>
                            {slot.published !== false ? "✓ Published" : "Draft"}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleOpenEdit(slot)}
                              style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot._id || slot.id)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
              {editingSlot ? "Edit Schedule Slot" : "Create Schedule Slot"}
            </h3>
            <form onSubmit={handleSubmitSlot}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Route</label>
                <select
                  value={slotForm.routeId}
                  onChange={(e) => setSlotForm({ ...slotForm, routeId: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="">-- Select Route --</option>
                  {routes.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>{r.routeNumber || ""} - {r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Bus</label>
                <select
                  value={slotForm.busId}
                  onChange={(e) => setSlotForm({ ...slotForm, busId: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                >
                  <option value="">-- Select Bus --</option>
                  {buses.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>{b.busNumber || b.id} ({b.registrationNumber || b.regNo})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Shift Type</label>
                  <select
                    value={slotForm.shiftType}
                    onChange={(e) => setSlotForm({ ...slotForm, shiftType: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="MORNING">MORNING</option>
                    <option value="EVENING">EVENING</option>
                    <option value="EXAM">EXAM</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Departure Time</label>
                  <input
                    type="text"
                    value={slotForm.departureTime}
                    onChange={(e) => setSlotForm({ ...slotForm, departureTime: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={slotForm.published}
                    onChange={(e) => setSlotForm({ ...slotForm, published: e.target.checked })}
                  />
                  Mark as Published Timetable
                </label>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  {editingSlot ? "Save Changes" : "Create Slot"}
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

export default AdminSchedules;
