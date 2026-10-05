import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TransportSidebar from "../layout/TransportSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
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

const TransportDashboard = () => {
  const navigate = useNavigate();
  const { buses: contextBuses, routes: contextRoutes, emergencies, authFetch } = useTransit();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Auto-Balance State
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceCommitLoading, setBalanceCommitLoading] = useState(false);
  const [balanceDiff, setBalanceDiff] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch("/transport/dashboard");
      if (res && res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn("[TransportDashboard] Failed to fetch live data:", err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle Auto-Balance Preview
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
        showToast("Could not generate load-balancing preview.", true);
      }
    } catch (err) {
      showToast(err.message || "Failed to load corridor balancing preview.", true);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Handle Auto-Balance Commit
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
        fetchDashboard();
      } else {
        showToast(res?.error?.message || "Failed to commit load-balance.", true);
      }
    } catch (err) {
      showToast(err.message || "Execution error.", true);
    } finally {
      setBalanceCommitLoading(false);
    }
  };

  // Resolved Data
  const kpis = dashboardData || {};
  const routeLoads = dashboardData?.routeLoads || contextRoutes.map((r, i) => {
    const bus = contextBuses.find((b) => b.id === r.assignedBus);
    const occupied = bus ? bus.occupied : 38;
    const capacity = bus ? bus.capacity : 50;
    const loadPercent = Math.round((occupied / capacity) * 100);
    return {
      id: r.id || `r-${i}`,
      name: r.name,
      assignedBus: r.assignedBus || `BUS-${101 + i}`,
      occupied,
      capacity,
      loadPercent,
      isOverCapacity: occupied > capacity,
    };
  });

  const fleet = dashboardData?.fleet || contextBuses;

  const topCards = [
    {
      label: "Active Buses",
      value: kpis.totalFleet ? `${kpis.busesOnRoute || 13} / ${kpis.totalFleet}` : "13 / 13",
      sub: "13 Official Fleet Units",
      color: "#059669",
      path: "/transport/fleet",
    },
    {
      label: "Active Drivers",
      value: "13 / 13",
      sub: "All Official Drivers Active",
      color: "#2563eb",
      path: "/transport/drivers",
    },
    {
      label: "Today's Trips",
      value: `${kpis.activeTrips || 64} Trips`,
      sub: "Morning & Evening",
      color: "#8b5cf6",
      path: "/transport/schedules",
    },
    {
      label: "Delayed Buses",
      value: `${kpis.delayedBuses || 2} Buses`,
      sub: "Traffic / Maintenance",
      color: "#ea580c",
      path: "/transport/tracking",
    },
    {
      label: "In Maintenance",
      value: `${kpis.busesInMaintenance || 6} Buses`,
      sub: "Workshop Inspection",
      color: "#dc2626",
      path: "/transport/maintenance",
    },
    {
      label: "Active Corridors",
      value: `${kpis.totalCorridors || 34} Routes`,
      sub: "Vadodara ↔ GSFC",
      color: "#3b82f6",
      path: "/transport/routes",
    },
    {
      label: "Commuters Transported",
      value: kpis.totalStudents ? kpis.totalStudents.toLocaleString() : "4,250",
      sub: "Registered Manifest",
      color: "#16a34a",
      path: "/transport/students",
    },
    {
      label: "Capacity Utilization",
      value: kpis.overallCapacityUtilization || "88%",
      sub: "Live Fleet Occupancy",
      color: "#0d9488",
      path: "/transport/students",
    },
  ];

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <TransportSidebar activeId="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* TOPBAR */}
          <header className="ad-topbar" style={{ flexWrap: "wrap", gap: 10 }}>
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="ad-topbar-title">Transport Operations Control</div>
              <div className="ad-topbar-subtitle">Live Corridors, Bus Occupancy & Depot Walk Telemetry</div>
            </div>
            <div className="ad-topbar-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="ad-btn-secondary"
                onClick={handleOpenAutoBalance}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  background: "#eff6ff",
                  borderRadius: 8,
                  minHeight: 44,
                }}
              >
                <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={15} />
                Auto-Balance Corridors
              </button>
              <button
                className="ad-btn-primary"
                onClick={fetchDashboard}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 13,
                  minHeight: 44,
                  borderRadius: 8,
                }}
                title="Refresh Live Fleet Metrics"
              >
                <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={15} stroke="#fff" />
                Refresh
              </button>
            </div>
          </header>

          <main className="ad-content" style={{ padding: "16px" }}>
            {/* TOAST MESSAGE */}
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

            {/* ── LIVE KPI CARDS (Portrait Mobile Optimized: 2 Columns on Phone) ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {topCards.map((s) => (
                <div
                  key={s.label}
                  onClick={() => navigate(s.path)}
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "14px",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {s.label}
                  </p>
                  <h3 style={{ fontSize: 21, fontWeight: 900, color: s.color, marginTop: 4, marginBottom: 2 }}>
                    {s.value}
                  </h3>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* ── FLEET CORRIDORS & OCCUPANCY (Mobile Stack Friendly) ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Route Capacity & Load Meters */}
              <div className="ad-card" style={{ padding: "16px" }}>
                <div
                  className="ad-card-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <h3 className="ad-card-title" style={{ fontSize: 15, fontWeight: 800 }}>
                      Live Corridor Load Meters
                    </h3>
                    <p style={{ fontSize: 11.5, color: "#64748b" }}>
                      Occupancy threshold monitoring (Depot Walk View)
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="ad-btn-secondary"
                      onClick={() => navigate("/transport/students")}
                      style={{ fontSize: 12, padding: "6px 12px", minHeight: 38, fontWeight: 700 }}
                    >
                      Allocate
                    </button>
                    <button
                      className="ad-btn-primary"
                      onClick={handleOpenAutoBalance}
                      style={{ fontSize: 12, padding: "6px 12px", minHeight: 38, background: "#2563eb", fontWeight: 700 }}
                    >
                      Balance
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
                  {routeLoads.map((r) => {
                    const pct = r.loadPercent || Math.round((r.occupied / (r.capacity || 50)) * 100);
                    const isOver = r.isOverCapacity || pct >= 100;
                    const isAmber = pct >= 80 && pct < 100;
                    const barColor = isOver ? "#ef4444" : isAmber ? "#f59e0b" : "#10b981";

                    return (
                      <div
                        key={r.id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: `1px solid ${isOver ? "#fca5a5" : "#e2e8f0"}`,
                          background: isOver ? "#fef2f2" : "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            fontSize: 13,
                            fontWeight: 700,
                            marginBottom: 6,
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          <span style={{ color: "#0f172a" }}>
                            {r.name}
                            <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6, fontWeight: 500 }}>
                              ({r.assignedBus})
                            </span>
                          </span>
                          <span
                            style={{
                              color: barColor,
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {isOver && (
                              <span
                                style={{
                                  background: "#fee2e2",
                                  color: "#b91c1c",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 800,
                                }}
                              >
                                OVERLOAD
                              </span>
                            )}
                            {r.occupied} / {r.capacity} seats ({pct}%)
                          </span>
                        </div>

                        {/* Progress Meter Bar */}
                        <div
                          style={{
                            width: "100%",
                            height: 10,
                            background: "#e2e8f0",
                            borderRadius: 6,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, pct)}%`,
                              height: "100%",
                              background: barColor,
                              borderRadius: 6,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions for Walking Managers */}
              <div className="ad-card" style={{ padding: "16px" }}>
                <div className="ad-card-header" style={{ marginBottom: 14 }}>
                  <h3 className="ad-card-title" style={{ fontSize: 15, fontWeight: 800 }}>
                    Depot Walk Operations
                  </h3>
                  <p style={{ fontSize: 11.5, color: "#64748b" }}>Single-tap tools for floor dispatch</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    {
                      label: "Reassign Commuter Corridors",
                      sub: "Transactional seat-capacity validation",
                      path: "/transport/students",
                      icon: "👥",
                      accent: "#2563eb",
                    },
                    {
                      label: "Auto-Balance Parallel Corridors",
                      sub: "Relieve congested stops onto parallel routes",
                      action: handleOpenAutoBalance,
                      icon: "⚡",
                      accent: "#059669",
                    },
                    {
                      label: "Live Fleet Telemetry & SOS",
                      sub: "GPS coordinates, speed & emergency tracking",
                      path: "/transport/tracking",
                      icon: "📡",
                      accent: "#d97706",
                    },
                    {
                      label: "Generate Operational Reports (PDF)",
                      sub: "Fleet efficiency & punctuality records",
                      path: "/transport/reports",
                      icon: "📄",
                      accent: "#7c3aed",
                    },
                  ].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => (q.action ? q.action() : navigate(q.path))}
                      style={{
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 52,
                        transition: "background 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{q.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{q.label}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{q.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── FLEET STATUS TABLE (Mobile Horizontal Scrollable) ── */}
            <div className="ad-card" style={{ padding: "16px" }}>
              <div
                className="ad-card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 className="ad-card-title" style={{ fontSize: 15, fontWeight: 800 }}>
                    Active Fleet Operations ({fleet.length} Vehicles)
                  </h3>
                  <p style={{ fontSize: 11.5, color: "#64748b" }}>
                    Live telemetry status from Vadodara RTO GJ-06 fleet
                  </p>
                </div>
                <button
                  className="ad-btn-primary"
                  onClick={() => navigate("/transport/tracking")}
                  style={{ fontSize: 12.5, minHeight: 40, padding: "8px 14px" }}
                >
                  Live Telemetry Map
                </button>
              </div>

              <div className="ad-table-wrap" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table className="ad-table" style={{ width: "100%", minWidth: 680 }}>
                  <thead>
                    <tr>
                      <th className="ad-th">Vehicle Reg</th>
                      <th className="ad-th">Driver</th>
                      <th className="ad-th">Driver Phone</th>
                      <th className="ad-th">Assigned Route</th>
                      <th className="ad-th">Occupancy</th>
                      <th className="ad-th">Speed</th>
                      <th className="ad-th">Energy</th>
                      <th className="ad-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.slice(0, 15).map((b) => (
                      <tr key={b.id || b.registrationNumber} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800 }}>
                          {b.registrationNumber || b.id}
                        </td>
                        <td className="ad-td">
                          <strong>{b.driver}</strong>
                        </td>
                        <td className="ad-td">{b.driverPhone}</td>
                        <td className="ad-td">{b.route}</td>
                        <td className="ad-td">
                          <span
                            style={{
                              fontWeight: 700,
                              color: b.occupied >= b.capacity ? "#dc2626" : "#0f172a",
                            }}
                          >
                            {b.occupied} / {b.capacity}
                          </span>
                        </td>
                        <td className="ad-td">{b.speed} km/h</td>
                        <td className="ad-td">
                          {b.fuelPercent}% {b.isEV ? "🔋 EV" : "⛽ Diesel"}
                        </td>
                        <td className="ad-td">
                          <span
                            className={`ad-badge ${
                              b.status === "On Route"
                                ? "ad-badge--green"
                                : b.status === "Delayed"
                                ? "ad-badge--yellow"
                                : "ad-badge--red"
                            }`}
                          >
                            ● {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer" style={{ marginTop: 24, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
              <span>© 2026 GLOW Bus Transit Operations · GSFC University Campus</span>
            </footer>
          </main>
        </div>
      </div>

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
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
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
                  Auto-Balance Parallel Corridors
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  Greedy load-balancing across overlapping transit stops
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

            {/* Modal Body */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {balanceLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>⚡</div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>Analyzing corridor passenger loads...</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Checking overlapping stops and available bus capacities</p>
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
                      Moving commuters from over-capacity corridors to under-capacity parallel routes serving the same stops.
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
                          <span style={{ color: "#2563eb" }}>Stop: {shift.sharedStop}</span>
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
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Corridors Already Balanced</h4>
                  <p style={{ fontSize: 12.5, marginTop: 4 }}>
                    All transit corridors are currently operating within nominal passenger capacity thresholds.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
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

export default TransportDashboard;
