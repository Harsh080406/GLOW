import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import AdminSidebar from "../layout/AdminSidebar";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* Mini bar chart */
const BarChart = ({ data, color = "#3b82f6", height = 80 }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: color + "22", borderRadius: 4, overflow: "hidden", height: height - 20 }}>
            <div style={{ width: "100%", background: color, borderRadius: 4, height: `${(d.value / max) * 100}%`, marginTop: "auto", transition: "height 0.3s" }} />
          </div>
          <span style={{ fontSize: 9, color: "#7c8494", textAlign: "center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* Mini line chart (SVG path) */
const LineChart = ({ data, color = "#22c55e", width = 300, height = 80 }) => {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 16) - 8;
    return `${x},${y}`;
  });
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / range) * (height - 16) - 8;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />;
      })}
    </svg>
  );
};

const tripsData   = [{ label:"Jan",value:1820 },{ label:"Feb",value:1740 },{ label:"Mar",value:1950 },{ label:"Apr",value:1880 },{ label:"May",value:2100 },{ label:"Jun",value:2250 },{ label:"Jul",value:2180 },{ label:"Aug",value:2340 }];
const studentsData= [{ label:"Jan",value:7640 },{ label:"Feb",value:7720 },{ label:"Mar",value:7800 },{ label:"Apr",value:7920 },{ label:"May",value:7980 },{ label:"Jun",value:8010 },{ label:"Jul",value:8024 },{ label:"Aug",value:8024 }];
const onTimeData  = [{ label:"Jan",value:96 },{ label:"Feb",value:97 },{ label:"Mar",value:95 },{ label:"Apr",value:98 },{ label:"May",value:99 },{ label:"Jun",value:97 },{ label:"Jul",value:98 },{ label:"Aug",value:99.2 }];

const ROUTE_PERF = [
  { route: "Route 2A", trips: 620, onTime: 99, students: 142, delay: "0 min avg",  color: "#22c55e" },
  { route: "Route 3B", trips: 540, onTime: 92, students: 98,  delay: "4 min avg",  color: "#f59e0b" },
  { route: "Route 1C", trips: 580, onTime: 97, students: 120, delay: "1 min avg",  color: "#3b82f6" },
  { route: "Route 4D", trips: 490, onTime: 98, students: 75,   delay: "1 min avg",  color: "#8b5cf6" },
];

const AdminReports = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportMsg, setExportMsg] = useState(null);

  const adminName = currentAdmin?.name || "Dr. Arvind Patel";
  const adminRole = currentAdmin?.role || "Super Admin";
  const adminInitials = currentAdmin?.avatar ||
    adminName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AP";

  const handleExport = (type) => {
    setExportMsg(`✓ Analytics report (${type}) exported successfully!`);
    setTimeout(() => setExportMsg(null), 3000);
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="reports" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Analytics & Operations Reports</div>
              <div className="ad-topbar-subtitle">System performance, ridership trends & reliability metrics</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => handleExport("PDF")}>
                <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />Export PDF
              </button>
              <div
                className="ad-topbar-profile"
                onClick={() => navigate("/admin/profile")}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                title={`${adminName} (${adminRole}) — Click to view Profile`}
              >
                <div className="ad-avatar">{adminInitials}</div>
                <div className="ad-avatar-info">
                  <span className="ad-avatar-name">{adminName}</span>
                  <span className="ad-avatar-role">{adminRole}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="ad-content">
            {exportMsg && (
              <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, fontWeight: 700 }}>
                {exportMsg}
              </div>
            )}

            {/* Top Stats */}
            <div className="ad-stats">
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Total Trips Dispatched</p>
                  <p className="ad-stat-value">2,340</p>
                  <p className="ad-stat-meta ad-stat-meta--green">↑ 7.3% this month</p>
                </div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Overall On-Time Rate</p>
                  <p className="ad-stat-value" style={{ color: "#16a34a" }}>99.2%</p>
                  <p className="ad-stat-meta ad-stat-meta--green">Above target (95%)</p>
                </div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Avg Daily Commuters</p>
                  <p className="ad-stat-value">3,912</p>
                  <p className="ad-stat-meta ad-stat-meta--green">92% Turnout</p>
                </div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Reported Incidents</p>
                  <p className="ad-stat-value">1</p>
                  <p className="ad-stat-meta ad-stat-meta--green">Resolved</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              <div className="ad-card">
                <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Monthly Trip Volume (2026)</h3>
                <BarChart data={tripsData} color="#2563eb" height={130} />
              </div>

              <div className="ad-card">
                <h3 className="ad-card-title" style={{ marginBottom: 14 }}>On-Time Reliability Trend (%)</h3>
                <LineChart data={onTimeData} color="#16a34a" width={340} height={130} />
              </div>
            </div>

            {/* Route Performance Table */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Route Efficiency & Punctuality</h3>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Total Trips</th>
                      <th className="ad-th">Punctuality</th>
                      <th className="ad-th">Daily Students</th>
                      <th className="ad-th">Avg Delay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROUTE_PERF.map(r => (
                      <tr key={r.route} className="ad-tr">
                        <td className="ad-td"><strong>{r.route}</strong></td>
                        <td className="ad-td">{r.trips}</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>{r.onTime}%</td>
                        <td className="ad-td">{r.students} Commuters</td>
                        <td className="ad-td">{r.delay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Bus Development System.</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
