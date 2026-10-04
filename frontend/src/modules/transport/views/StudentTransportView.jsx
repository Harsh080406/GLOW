import { useState, useEffect, useCallback, useRef } from "react";
import TransportSidebar from "../layout/TransportSidebar";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportStudentsToXLSX } from "../../../shared/utils/excelExport";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const StudentTransport = () => {
  const { students: fallbackStudents, routes: fallbackRoutes, buses: fallbackBuses, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Server-side State
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exportRouteFilter, setExportRouteFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedStop, setSelectedStop] = useState("");
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState(null);

  // Auto-Balance State
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceCommitLoading, setBalanceCommitLoading] = useState(false);
  const [balanceDiff, setBalanceDiff] = useState(null);

  // UI Toast
  const [toastMsg, setToastMsg] = useState(null);
  const searchTimeoutRef = useRef(null);

  const showToast = (text, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Fetch Students & Routes from Backend
  const fetchStudents = useCallback(
    async (searchTerm = search, routeId = exportRouteFilter, pageNum = page) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: "25",
          search: searchTerm,
          routeId: routeId !== "ALL" ? routeId : "",
        });

        const res = await authFetch(`/transport/students?${queryParams.toString()}`);
        if (res && res.success) {
          setStudents(res.students || []);
          if (res.routes && res.routes.length > 0) {
            setRoutes(res.routes);
          }
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
            setTotalStudents(res.pagination.total || 0);
          }
        }
      } catch (err) {
        console.warn("[StudentTransport] Using context fallback:", err.message);
        setStudents(fallbackStudents);
        setRoutes(
          fallbackRoutes.map((r, i) => {
            const b = fallbackBuses.find((bus) => bus.id === r.assignedBus);
            return {
              id: r.id || `r-${i}`,
              _id: r.id || `r-${i}`,
              name: r.name,
              assignedBus: r.assignedBus || `BUS-${101 + i}`,
              capacity: b ? b.capacity : 50,
              occupied: b ? b.occupied : 38,
              stops: (r.stops || []).map((s) => ({ name: typeof s === "string" ? s : s.name })),
            };
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [authFetch, search, exportRouteFilter, page, fallbackStudents, fallbackRoutes, fallbackBuses]
  );

  useEffect(() => {
    fetchStudents(search, exportRouteFilter, page);
  }, [exportRouteFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchStudents(val, exportRouteFilter, 1);
    }, 350);
  };

  const targetRouteObj = routes.find((r) => r.id === selectedRouteId || r._id === selectedRouteId) || routes[0];

  // 1. Transactional Reassign Student Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferModal || !selectedRouteId) return;

    setTransferSubmitting(true);
    setTransferError(null);

    try {
      const token = localStorage.getItem("glow_access_token");
      const res = await fetch(`${API_BASE_URL}/transport/students/reassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId: transferModal.id || transferModal._id,
          newRouteId: selectedRouteId,
          newPickupStop: selectedStop || targetRouteObj?.stops?.[0]?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Seat capacity rejection handled transactionally
        if (data?.error?.code === "ROUTE_CAPACITY_EXCEEDED") {
          setTransferError(data.error.message);
        } else {
          setTransferError(data?.error?.message || "Reassignment request failed.");
        }
        return;
      }

      showToast(`✓ Reassigned ${transferModal.name} to ${targetRouteObj?.name} successfully.`);
      setTransferModal(null);
      fetchStudents(search, exportRouteFilter, page);
    } catch (err) {
      setTransferError(err.message || "Network error while validating route capacity.");
    } finally {
      setTransferSubmitting(false);
    }
  };

  // 2. Real Excel Roster Export
  const handleDownloadExcel = async () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    try {
      showToast("Generating official commuter roster (.xlsx)...");
      const token = localStorage.getItem("glow_access_token");
      const queryParam = exportRouteFilter !== "ALL" ? `?routeId=${exportRouteFilter}` : "";

      const res = await fetch(`${API_BASE_URL}/transport/students/export-excel${queryParam}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Backend Excel export returned status " + res.status);

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `GLOW_Student_Transport_Roster_${dateStamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showToast(`✓ Downloaded official student roster in Excel (.XLSX) format!`);
    } catch (err) {
      console.warn("[Excel Export] Falling back to client-side sheet generator:", err.message);
      const targetList = students;
      exportStudentsToXLSX(targetList, `GLOW_Student_Allocations_${dateStamp}.xlsx`, "Commuter_Roster");
      showToast(`✓ Exported ${targetList.length} student records in Excel format!`);
    }
  };

  // 3. Auto-Balance Corridor Triggers
  const handleOpenAutoBalance = async () => {
    setBalanceModalOpen(true);
    setBalanceLoading(true);
    setBalanceDiff(null);
    try {
      const res = await authFetch("/transport/routes/auto-balance", {
        method: "POST",
        body: JSON.stringify({ commit: false }),
      });
      if (res && res.success) {
        setBalanceDiff(res);
      } else {
        showToast("Unable to compute load-balancing preview.", true);
      }
    } catch (err) {
      showToast(err.message || "Failed to load corridor balancing preview.", true);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleCommitAutoBalance = async () => {
    setBalanceCommitLoading(true);
    try {
      const res = await authFetch("/transport/routes/auto-balance", {
        method: "POST",
        body: JSON.stringify({ commit: true }),
      });
      if (res && res.success) {
        showToast(`✓ Auto-balance executed: shifted ${res.transferredCount || res.shifts?.length || 0} commuters.`);
        setBalanceModalOpen(false);
        fetchStudents(search, exportRouteFilter, page);
      } else {
        showToast(res?.error?.message || "Commit failed.", true);
      }
    } catch (err) {
      showToast(err.message || "Execution error.", true);
    } finally {
      setBalanceCommitLoading(false);
    }
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <TransportSidebar activeId="students" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* TOPBAR */}
          <header className="ad-topbar" style={{ flexWrap: "wrap", gap: 10 }}>
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="ad-topbar-title">Student Transport Allocation & Route Transfers</div>
              <div className="ad-topbar-subtitle">
                Assign routes, enforce seat capacity limits & auto-balance parallel corridors
              </div>
            </div>
            <div className="ad-search-wrap" style={{ minWidth: 220, flex: "1 1 240px" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search name, enrollment ID, branch..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="ad-topbar-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="ad-btn-secondary"
                onClick={handleOpenAutoBalance}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  background: "#eff6ff",
                  borderRadius: 8,
                  minHeight: 44,
                }}
              >
                <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={15} />
                Auto-Balance
              </button>
              <button
                className="ad-btn-primary"
                onClick={handleDownloadExcel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#16a34a",
                  borderColor: "#16a34a",
                  minHeight: 44,
                  fontSize: 12.5,
                  borderRadius: 8,
                }}
                title="Download Allocation Excel (.XLSX)"
              >
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} stroke="#fff" />
                Export Roster (.XLSX)
              </button>
            </div>
          </header>

          <main className="ad-content" style={{ padding: "16px" }}>
            {toastMsg && (
              <div
                style={{
                  padding: "12px 16px",
                  background: toastMsg.isError ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${toastMsg.isError ? "#fca5a5" : "#86efac"}`,
                  color: toastMsg.isError ? "#991b1b" : "#166534",
                  borderRadius: 8,
                  fontWeight: 700,
                  marginBottom: 16,
                  fontSize: 13.5,
                }}
              >
                {toastMsg.text}
              </div>
            )}

            {/* ── ROUTE CAPACITIES STRIP (Mobile Scrollable / Portrait Optimized) ── */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <h4 style={{ fontSize: 13.5, fontWeight: 800, color: "#1e293b", textTransform: "uppercase" }}>
                  Live Route Capacity Status ({routes.length} Corridors)
                </h4>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Red badges indicate corridors requiring load balancing
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 12,
                  maxHeight: 260,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {routes.map((r) => {
                  const occ = r.occupied || 0;
                  const cap = r.capacity || 50;
                  const isOver = occ >= cap;
                  const pct = Math.round((occ / cap) * 100);

                  return (
                    <div
                      key={r.id || r._id}
                      style={{
                        background: "#fff",
                        border: `1.5px solid ${isOver ? "#fca5a5" : "#e2e8f0"}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", flex: 1 }}>{r.name}</h4>
                        <span className="ad-badge ad-badge--blue" style={{ fontSize: 10 }}>
                          {r.assignedBus}
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Load Meter</span>
                        <span style={{ color: isOver ? "#dc2626" : pct >= 80 ? "#d97706" : "#16a34a" }}>
                          {isOver && "⚠️ "}
                          {occ} / {cap} Seats ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 6,
                          background: "#e2e8f0",
                          borderRadius: 4,
                          overflow: "hidden",
                          marginTop: 6,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            height: "100%",
                            background: isOver ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#22c55e",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── STUDENT ALLOCATION MANIFEST TABLE ── */}
            <div className="ad-card" style={{ padding: "16px" }}>
              <div
                className="ad-card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 className="ad-card-title" style={{ fontSize: 15, fontWeight: 800 }}>
                    Student Transit Manifest ({totalStudents.toLocaleString()} Commuters)
                  </h3>
                  <p style={{ fontSize: 11.5, color: "#64748b" }}>
                    Showing page {page} of {totalPages}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    className="ad-input"
                    style={{ width: "auto", minHeight: 40, fontSize: 12.5 }}
                    value={exportRouteFilter}
                    onChange={(e) => {
                      setExportRouteFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">All Routes ({totalStudents.toLocaleString()})</option>
                    {routes.map((r) => (
                      <option key={r.id || r._id} value={r.id || r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="ad-btn-secondary"
                    onClick={handleDownloadExcel}
                    style={{
                      padding: "8px 14px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      borderColor: "#16a34a",
                      color: "#16a34a",
                      background: "#f0fdf4",
                      minHeight: 40,
                    }}
                  >
                    Export .XLSX
                  </button>
                </div>
              </div>

              <div className="ad-table-wrap" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table className="ad-table" style={{ width: "100%", minWidth: 720 }}>
                  <thead>
                    <tr>
                      <th className="ad-th">Enrollment ID</th>
                      <th className="ad-th">Student Name</th>
                      <th className="ad-th">Department</th>
                      <th className="ad-th">Assigned Route</th>
                      <th className="ad-th">Pickup Stop</th>
                      <th className="ad-th">Pass Status</th>
                      <th className="ad-th" style={{ textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          Loading passenger manifest...
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No students matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s.id || s._id} className="ad-tr">
                          <td className="ad-td" style={{ fontWeight: 800 }}>
                            {s.enrollmentId || s.id}
                          </td>
                          <td className="ad-td">
                            <strong>{s.name}</strong>
                          </td>
                          <td className="ad-td">
                            {s.branch || s.dept} · {s.semester || s.year}
                          </td>
                          <td className="ad-td">
                            <span className="ad-badge ad-badge--blue">{s.routeName || s.route}</span>
                          </td>
                          <td className="ad-td">{s.pickupStop}</td>
                          <td className="ad-td">
                            <span
                              className={`ad-badge ${
                                s.passStatus === "ACTIVE" ? "ad-badge--green" : "ad-badge--yellow"
                              }`}
                            >
                              ● {s.passStatus}
                            </span>
                          </td>
                          <td className="ad-td" style={{ textAlign: "right" }}>
                            <button
                              onClick={() => {
                                setTransferModal(s);
                                setSelectedRouteId(s.routeId || (routes[0]?.id || routes[0]?._id));
                                setSelectedStop(s.pickupStop);
                                setTransferError(null);
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                minHeight: 36,
                              }}
                            >
                              Reassign
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 14,
                    paddingTop: 10,
                    borderTop: "1px solid #e2e8f0",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>
                    Page {page} of {totalPages}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="ad-btn-secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={{ fontSize: 12, padding: "6px 14px", minHeight: 38 }}
                    >
                      Previous
                    </button>
                    <button
                      className="ad-btn-secondary"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      style={{ fontSize: 12, padding: "6px 14px", minHeight: 38 }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="ad-footer" style={{ marginTop: 24, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
              <span>© 2026 GLOW Bus Transit Allocation · GSFC University Campus</span>
            </footer>
          </main>
        </div>
      </div>

      {/* ── TRANSACTIONAL ROUTE REASSIGNMENT MODAL ── */}
      {transferModal && (
        <div
          className="ad-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>
              Reassign Route & Enforce Seat Capacity
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Student: <strong>{transferModal.name}</strong> ({transferModal.enrollmentId || transferModal.id})
              <br />
              Current Corridor: <strong>{transferModal.routeName || transferModal.route}</strong>
            </p>

            {transferError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1.5px solid #fca5a5",
                  color: "#991b1b",
                  padding: "12px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 16,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 16 }}>⚠️</span>
                <div>{transferError}</div>
              </div>
            )}

            <form onSubmit={handleTransferSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: "#334155" }}>
                  Select Target Corridor
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedRouteId(newId);
                    setTransferError(null);
                    const newR = routes.find((r) => r.id === newId || r._id === newId);
                    if (newR && newR.stops?.length > 0) {
                      setSelectedStop(newR.stops[0]?.name || "");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #cbd5e1",
                    background: "#fff",
                    fontSize: 13.5,
                    minHeight: 44,
                  }}
                >
                  {routes.map((r) => {
                    const isFull = (r.occupied || 0) >= (r.capacity || 50);
                    return (
                      <option key={r.id || r._id} value={r.id || r._id}>
                        {r.name} ({r.occupied}/{r.capacity} Seats {isFull ? "· FULL" : ""})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: "#334155" }}>
                  Select Boarding Stop
                </label>
                <select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #cbd5e1",
                    background: "#fff",
                    fontSize: 13.5,
                    minHeight: 44,
                  }}
                >
                  {(targetRouteObj?.stops || []).map((st, i) => (
                    <option key={st.id || i} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  {transferSubmitting ? "Validating Capacity..." : "Confirm Reassignment"}
                </button>
                <button
                  type="button"
                  onClick={() => setTransferModal(null)}
                  style={{
                    padding: "12px 18px",
                    background: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AUTO-BALANCE PREVIEW & COMMIT MODAL ── */}
      {balanceModalOpen && (
        <div
          className="ad-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                  Corridor Load Auto-Balance (Greedy Transfer)
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  Transfers commuters from overcrowded corridors to parallel routes
                </p>
              </div>
              <button
                onClick={() => setBalanceModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 4,
                  minHeight: 44,
                  minWidth: 44,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {balanceLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>⚡</div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>Calculating optimal passenger shifts...</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Validating overlapping pickup stops</p>
                </div>
              ) : balanceDiff?.shifts?.length > 0 ? (
                <div>
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 10,
                      padding: "12px 14px",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e40af" }}>
                      💡 Proposed Diff Preview ({balanceDiff.shifts.length} Commuters Identified)
                    </div>
                    <div style={{ fontSize: 12, color: "#1e3a8a", marginTop: 4 }}>
                      Review proposed transfers before committing changes to the live manifest.
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
                    {balanceDiff.shifts.map((shift, idx) => (
                      <div
                        key={shift.studentId || idx}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "10px 12px",
                          fontSize: 12.5,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                          <span>
                            {shift.studentName} ({shift.enrollmentId})
                          </span>
                          <span style={{ color: "#2563eb" }}>Shared Stop: {shift.sharedStop}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 6,
                            color: "#475569",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ color: "#dc2626", fontWeight: 600 }}>
                            {shift.sourceRoute.name} ({shift.sourceRoute.beforeLoad} → {shift.sourceRoute.afterLoad})
                          </span>
                          <span>➔</span>
                          <span style={{ color: "#16a34a", fontWeight: 600 }}>
                            {shift.targetRoute.name} ({shift.targetRoute.beforeLoad} → {shift.targetRoute.afterLoad})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#64748b" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>All Corridors Nominally Loaded</h4>
                  <p style={{ fontSize: 12.5, marginTop: 4 }}>
                    No congested routes currently exceed capacity limits.
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setBalanceModalOpen(false)}
                style={{
                  padding: "10px 16px",
                  background: "#e2e8f0",
                  color: "#334155",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Close
              </button>
              {balanceDiff?.shifts?.length > 0 && (
                <button
                  type="button"
                  onClick={handleCommitAutoBalance}
                  disabled={balanceCommitLoading}
                  style={{
                    padding: "10px 20px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  {balanceCommitLoading ? "Executing Shifts..." : "Commit Auto-Balance"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTransport;
