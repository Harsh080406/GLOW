import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* Mini bar chart */
const BarChart = ({ data = [], color = "#3b82f6", height = 80 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value || 1));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: color + "22", borderRadius: 4, overflow: "hidden", height: height - 20, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", background: color, borderRadius: 4, height: `${((d.value || 0) / max) * 100}%`, transition: "height 0.3s" }} />
          </div>
          <span style={{ fontSize: 9, color: "#7c8494", textAlign: "center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* Mini line chart */
const LineChart = ({ data = [], color = "#22c55e", width = 300, height = 80 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.value || 1));
  const min = Math.min(...data.map((d) => d.value || 0));
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (((d.value || 0) - min) / range) * (height - 16) - 8;
    return `${x},${y}`;
  });
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (((d.value || 0) - min) / range) * (height - 16) - 8;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />;
      })}
    </svg>
  );
};

const AdminReports = () => {
  const { authFetch } = useTransit();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportMsg, setExportMsg] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/reports/analytics");
      if (res) {
        setAnalytics(res);
      }
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totals = analytics?.totals || {
    totalTrips: 1840,
    totalKmDriven: 24500,
    avgOnTimeRate: 98.4,
    fuelConsumedLiters: 4820,
  };

  const chartTrips = analytics?.chartTrips || [
    { label: "Mon", value: 180 }, { label: "Tue", value: 195 }, { label: "Wed", value: 190 },
    { label: "Thu", value: 210 }, { label: "Fri", value: 205 }, { label: "Sat", value: 85 }, { label: "Sun", value: 40 }
  ];

  const chartOnTime = analytics?.chartOnTime || [
    { label: "Mon", value: 98 }, { label: "Tue", value: 97 }, { label: "Wed", value: 99 },
    { label: "Thu", value: 96 }, { label: "Fri", value: 98 }, { label: "Sat", value: 99 }, { label: "Sun", value: 100 }
  ];

  const routePerf = analytics?.routePerformance || [
    { route: "Route 2A (Sayajigunj)", trips: 620, onTime: 99, students: 142, delay: "0 min avg", color: "#22c55e" },
    { route: "Route 3B (Alkapuri)", trips: 540, onTime: 92, students: 98, delay: "4 min avg", color: "#f59e0b" },
    { route: "Route 1C (Akota)", trips: 580, onTime: 97, students: 120, delay: "1 min avg", color: "#3b82f6" },
    { route: "Route 4D (Fatehgunj)", trips: 490, onTime: 98, students: 75, delay: "1 min avg", color: "#8b5cf6" },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Metric,Value",
       `Total Trips Completed,${totals.totalTrips}`,
       `Total Kilometers Driven,${totals.totalKmDriven}`,
       `Average On-Time Rate,${totals.avgOnTimeRate}%`,
       `Fuel Consumed (Liters),${totals.fuelConsumedLiters}`
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GLOW_Fleet_Daily_Rollup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setExportMsg("✓ Precomputed Daily Rollup CSV report exported!");
    setTimeout(() => setExportMsg(null), 3000);
  };

  return (
    <div className="view-container">
      {exportMsg && (
        <div style={{
          background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
          borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontWeight: 700, fontSize: 13,
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)"
        }}>
          {exportMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Fleet Analytics & Precomputed Daily Rollups</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Aggregated trip kilometers, fuel burn & punctuality SLA metrics stored in `DailyRollup`
          </p>
        </div>
        <button className="ad-btn-primary" onClick={handleExportCSV} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={16} stroke="#fff" />
          Export Rollup CSV
        </button>
      </div>

      {loading && <p style={{ fontSize: 13, color: "#64748b" }}>Loading precomputed daily rollups...</p>}
      {error && <div style={{ padding: 12, background: "#fef2f2", color: "#dc2626", borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {/* High-level Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Total Trips Logged</p>
            <p className="ad-stat-value">{totals.totalTrips.toLocaleString()}</p>
            <p className="ad-stat-meta ad-stat-meta--green">Fleet Dispatch Cycles</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
            <Icon d="M5 3l14 9-14 9V3z" stroke="#3b82f6" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Distance Covered</p>
            <p className="ad-stat-value">{(totals.totalKmDriven || 24500).toLocaleString()} km</p>
            <p className="ad-stat-meta ad-stat-meta--green">Cumulative Odometer</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
            <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#22c55e" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Average On-Time Rate</p>
            <p className="ad-stat-value">{totals.avgOnTimeRate}%</p>
            <p className="ad-stat-meta ad-stat-meta--green">SLA Target &gt;95%</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#faf5ff" }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#a855f7" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Total Fuel Burn</p>
            <p className="ad-stat-value">{(totals.fuelConsumedLiters || 4820).toLocaleString()} L</p>
            <p className="ad-stat-meta ad-stat-meta--red">Diesel / EV Equivalent</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#fef2f2" }}>
            <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" stroke="#ef4444" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Daily Dispatched Trips</h3>
            <span style={{ fontSize: 12, color: "#64748b" }}>Past 7 Days</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <BarChart data={chartTrips} color="#2563eb" height={120} />
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Punctuality SLA Trend (%)</h3>
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>Avg: {totals.avgOnTimeRate}%</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <LineChart data={chartOnTime} color="#16a34a" width={340} height={120} />
          </div>
        </div>
      </div>

      {/* Route Performance Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Corridor Performance & Reliability Audit</h3>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="ad-th">Corridor Name</th>
                <th className="ad-th">Completed Trips</th>
                <th className="ad-th">Punctuality Score</th>
                <th className="ad-th">Daily Passengers</th>
                <th className="ad-th">Average Delay</th>
                <th className="ad-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {routePerf.map((r, i) => (
                <tr key={i} className="ad-tr">
                  <td className="ad-td"><strong>{r.route}</strong></td>
                  <td className="ad-td">{r.trips} trips</td>
                  <td className="ad-td" style={{ fontWeight: 700, color: r.onTime >= 95 ? "#16a34a" : "#d97706" }}>
                    {r.onTime}%
                  </td>
                  <td className="ad-td">{r.students} students</td>
                  <td className="ad-td">{r.delay}</td>
                  <td className="ad-td">
                    <span className={`ad-badge ${r.onTime >= 95 ? "ad-badge--green" : "ad-badge--yellow"}`}>
                      ● {r.onTime >= 95 ? "Optimal" : "Requires Review"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
