import { useState } from "react";
import TransportSidebar from "../layout/TransportSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const TransportReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState(null);

  const handleExport = (type) => {
    setDownloadMsg(`✓ Transport Operations ${type} generated and downloaded.`);
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <TransportSidebar activeId="reports" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Transport Operations Reports</div>
              <div className="ad-topbar-subtitle">Fleet utilization, route efficiency, driver hours & trip punctuality metrics</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => handleExport("PDF Report")} style={{ background: "#2563eb" }}>
                <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />
                Export Operational PDF
              </button>
            </div>
          </header>

          <main className="ad-content">
            {downloadMsg && (
              <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, fontWeight: 700, marginBottom: 20 }}>
                {downloadMsg}
              </div>
            )}

            {/* ── 4 KPI CARDS ────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Fleet On-Time Rate</p>
                  <p className="ad-stat-value" style={{ color: "#16a34a" }}>97.4%</p>
                  <p className="ad-stat-meta ad-stat-meta--green">+1.2% this month</p>
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Bus Seat Utilization</p>
                  <p className="ad-stat-value" style={{ color: "#2563eb" }}>88.6%</p>
                  <p className="ad-stat-meta ad-stat-meta--green">Optimal Capacity</p>
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Total Daily Commute Distance</p>
                  <p className="ad-stat-value">1,420 km</p>
                  <p className="ad-stat-meta ad-stat-meta--green">32 Routes × 2</p>
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Average Trip Delay</p>
                  <p className="ad-stat-value" style={{ color: "#ea580c" }}>4.2 min</p>
                  <p className="ad-stat-meta ad-stat-meta--yellow">Within buffer limit</p>
                </div>
              </div>
            </div>

            {/* ── ROUTE EFFICIENCY TABLE ──────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Route Efficiency & Punctuality Matrix</h3>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Route ID</th>
                      <th className="ad-th">Route Name</th>
                      <th className="ad-th">Distance</th>
                      <th className="ad-th">Assigned Bus</th>
                      <th className="ad-th">Daily Passengers</th>
                      <th className="ad-th">On-Time Performance</th>
                      <th className="ad-th">Avg Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "R-04", name: "Fatehgunj Bus Stop → GSFC University Campus", dist: "9.4 km", bus: "BUS-104", pax: 38, ontime: "98.5%", speed: "42 km/h" },
                      { id: "R-01", name: "Alkapuri RC Dutt Rd → GSFC University Campus", dist: "13.8 km", bus: "BUS-101", pax: 44, ontime: "96.2%", speed: "46 km/h" },
                      { id: "R-02", name: "Sayajigunj Station → GSFC University Campus", dist: "11.2 km", bus: "BUS-108", pax: 32, ontime: "92.0%", speed: "34 km/h" },
                      { id: "R-05", name: "Karelibaug Water Tank → GSFC University Campus", dist: "12.5 km", bus: "BUS-115", pax: 41, ontime: "99.1%", speed: "51 km/h" },
                    ].map((r) => (
                      <tr key={r.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{r.id}</td>
                        <td className="ad-td"><strong>{r.name}</strong></td>
                        <td className="ad-td">{r.dist}</td>
                        <td className="ad-td">{r.bus}</td>
                        <td className="ad-td">{r.pax} Passengers</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>{r.ontime}</td>
                        <td className="ad-td">{r.speed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TransportReports;
