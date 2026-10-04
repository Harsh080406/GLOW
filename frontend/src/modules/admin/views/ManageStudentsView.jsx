import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const ManageStudents = () => {
  const { authFetch } = useTransit();

  // Server-side State
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [feeStatus, setFeeStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // KPIs
  const [kpis, setKpis] = useState({
    total: 0,
    activePasses: 0,
    pendingFees: 0,
  });

  // UI / Modals
  const [toastMsg, setToastMsg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enrollmentId: "",
    phone: "",
    course: "B.Tech Computer Engineering",
    semester: 5,
    pickupStop: "Helmet Circle",
    feeStatus: "PAID",
    passStatus: "ACTIVE",
  });

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Students with Server-side Pagination & Filter
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (feeStatus !== "ALL") params.append("feeStatus", feeStatus);

      const res = await authFetch(`/admin/students?${params.toString()}`);
      if (res) {
        setStudents(res.students || []);
        setTotalStudents(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res.kpis) setKpis(res.kpis);
      }
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, limit, debouncedSearch, feeStatus]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Server-side Excel Export via xlsx library
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem("glow_access_token") || "";
      const response = await fetch(`${API_BASE_URL}/admin/students/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status}): ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `GLOW_Students_Roster_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showNotification("✓ Real .xlsx Excel student roster downloaded successfully!");
    } catch (err) {
      alert("Excel export error: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      enrollmentId: `UNI2026${Math.floor(1000 + Math.random() * 9000)}`,
      phone: "+91 98765 00000",
      course: "B.Tech Computer Engineering",
      semester: 5,
      pickupStop: "Helmet Circle",
      feeStatus: "PAID",
      passStatus: "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || student.userId?.name || "",
      email: student.email || student.userId?.email || "",
      enrollmentId: student.enrollmentId || "",
      phone: student.phone || student.userId?.phone || "",
      course: student.course || "B.Tech Computer Engineering",
      semester: student.semester || 5,
      pickupStop: student.pickupStop || "Helmet Circle",
      feeStatus: student.feeStatus || "PAID",
      passStatus: student.passStatus || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await authFetch(`/admin/students/${editingStudent._id || editingStudent.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        showNotification(`✓ Updated student ${formData.name}`);
      } else {
        await authFetch("/admin/students", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        showNotification(`✓ Added new student ${formData.name}`);
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert("Error saving student: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student ${name}?`)) return;
    try {
      await authFetch(`/admin/students/${id}`, { method: "DELETE" });
      showNotification(`✓ Deleted student record`);
      fetchStudents();
    } catch (err) {
      alert("Error deleting student: " + err.message);
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
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Student Directory & Commuter Roster</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Server-side paginated student directory ({totalStudents.toLocaleString()} total students in DB)
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="ad-btn-secondary"
            onClick={handleExportExcel}
            disabled={exporting}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={16} stroke="currentColor" />
            {exporting ? "Generating XLSX..." : "Export Students Excel"}
          </button>
          <button className="ad-btn-primary" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
            Add Student
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="ad-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Total Registered</p>
            <p className="ad-stat-value">{kpis.total ? kpis.total.toLocaleString() : totalStudents.toLocaleString()}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
            <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#3b82f6" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Active Transport Passes</p>
            <p className="ad-stat-value">{kpis.activePasses ? kpis.activePasses.toLocaleString() : "..."}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22c55e" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Pending / Overdue Fees</p>
            <p className="ad-stat-value">{kpis.pendingFees ? kpis.pendingFees.toLocaleString() : "..."}</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#fef2f2" }}>
            <Icon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 300px" }}>
          <input
            type="text"
            className="ad-search"
            placeholder="Server search by name, enrollment ID, phone, pickup stop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["ALL", "PAID", "PENDING", "OVERDUE"].map((status) => (
            <button
              key={status}
              onClick={() => { setFeeStatus(status); setPage(1); }}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: `1.5px solid ${feeStatus === status ? "#2563eb" : "#e2e8f0"}`,
                background: feeStatus === status ? "#2563eb" : "#fff",
                color: feeStatus === status ? "#fff" : "#475569",
                cursor: "pointer",
              }}
            >
              Fee: {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ad-card">
        <div className="ad-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="ad-card-title">
            Students Roster (Page {page} of {totalPages} — Showing {students.length} rows)
          </h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading page {page}...</span>}
        </div>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button className="ad-btn-secondary" onClick={fetchStudents} style={{ marginTop: 8 }}>Retry</button>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Enrollment ID</th>
                  <th className="ad-th">Student Name</th>
                  <th className="ad-th">Course & Sem</th>
                  <th className="ad-th">Pickup Stop</th>
                  <th className="ad-th">Pass Status</th>
                  <th className="ad-th">Fee Status</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading students..." : "No students found matching current query."}
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const studentName = s.name || s.userId?.name || "Student";
                    const studentEmail = s.email || s.userId?.email || "";
                    return (
                      <tr key={s._id || s.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{s.enrollmentId || s.id}</td>
                        <td className="ad-td">
                          <strong>{studentName}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{studentEmail}</span>
                        </td>
                        <td className="ad-td">{s.course || "B.Tech"} · Sem {s.semester || 1}</td>
                        <td className="ad-td">{s.pickupStop || "Main Campus"}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${(s.passStatus || "ACTIVE") === "ACTIVE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            ● {s.passStatus || "ACTIVE"}
                          </span>
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${(s.feeStatus || "PAID") === "PAID" ? "ad-badge--green" : "ad-badge--red"}`}>
                            {s.feeStatus || "PAID"}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(s._id || s.id, studentName)}
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

        {/* Server Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #e2e8f0", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: "#64748b" }}>
            Showing page {page} of {totalPages} ({totalStudents.toLocaleString()} records total)
          </span>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="ad-btn-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage(1)}
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              « First
            </button>
            <button
              className="ad-btn-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              ‹ Prev
            </button>
            <span style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
              {page} / {totalPages}
            </span>
            <button
              className="ad-btn-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              Next ›
            </button>
            <button
              className="ad-btn-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(totalPages)}
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              Last »
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 500, padding: "24px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
              {editingStudent ? "Edit Student Details" : "Register New Student"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Enrollment ID</label>
                  <input
                    type="text"
                    value={formData.enrollmentId}
                    onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Course</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Pickup Stop</label>
                <input
                  type="text"
                  value={formData.pickupStop}
                  onChange={(e) => setFormData({ ...formData, pickupStop: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Pass Status</label>
                  <select
                    value={formData.passStatus}
                    onChange={(e) => setFormData({ ...formData, passStatus: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Fee Status</label>
                  <select
                    value={formData.feeStatus}
                    onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  {editingStudent ? "Save Changes" : "Create Student"}
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

export default ManageStudents;
