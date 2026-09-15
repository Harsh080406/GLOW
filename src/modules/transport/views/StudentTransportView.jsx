import { useState } from "react";
import TransportSidebar from "../layout/TransportSidebar";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportStudentsToXLSX } from "../../../shared/utils/excelExport";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentTransport = () => {
  const { students, routes, buses, assignStudentRoute } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [transferModal, setTransferModal] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || "R-04");
  const [selectedStop, setSelectedStop] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [exportRouteFilter, setExportRouteFilter] = useState("ALL");

  const filteredStudents = students.filter(
    (s) =>
      (exportRouteFilter === "ALL" || (s.route || s.routeName || "").includes(exportRouteFilter)) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
       s.id.toLowerCase().includes(search.toLowerCase()) ||
       (s.dept || "").toLowerCase().includes(search.toLowerCase()))
  );

  const targetRouteObj = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const handleDownload = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    const targetList = exportRouteFilter === "ALL"
      ? students
      : students.filter((s) => (s.route || s.routeName || "").includes(exportRouteFilter));
    const cleanRouteName = exportRouteFilter === "ALL" ? "All_Routes" : exportRouteFilter.replace(/\s+/g, "_");
    exportStudentsToXLSX(targetList, `GLOW_Allocations_${cleanRouteName}_${dateStamp}.xlsx`, `${cleanRouteName}_Allocations`);
    setTransferSuccess(`✓ Exported ${targetList.length.toLocaleString()} student allocation records in Excel (.XLSX) format!`);
    setTimeout(() => setTransferSuccess(null), 4000);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferModal) return;

    assignStudentRoute(transferModal.id, selectedRouteId, selectedStop || targetRouteObj.stops[0]?.name);
    setTransferSuccess(`✓ Transferred ${transferModal.name} to ${targetRouteObj.name} (${selectedStop || targetRouteObj.stops[0]?.name})`);
    setTransferModal(null);
    setTimeout(() => setTransferSuccess(null), 4000);
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <TransportSidebar activeId="students" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Student Transport Allocation & Route Transfers</div>
              <div className="ad-topbar-subtitle">Assign students to routes, update pickup stops & manage bus capacity distribution</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search student ID, name, branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={handleDownload}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", borderColor: "#16a34a" }}
                title="Download Allocation Excel (.XLSX)"
              >
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} stroke="#fff" />
                Download Excel (.XLSX)
              </button>
            </div>
          </header>

          <main className="ad-content">
            {transferSuccess && (
              <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, fontWeight: 700, marginBottom: 20 }}>
                {transferSuccess}
              </div>
            )}

            {/* ── ROUTE CAPACITIES STRIP ──────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
              {routes.map((r) => {
                const bus = buses.find((b) => b.id === r.assignedBus);
                const occ = bus ? bus.occupied : 38;
                const cap = bus ? bus.capacity : 52;
                return (
                  <div key={r.id} style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12, padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <h4 style={{ fontWeight: 800, fontSize: 14 }}>{r.name}</h4>
                      <span className="ad-badge ad-badge--blue">{r.assignedBus}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.startPoint} → Campus</p>
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700 }}>
                      <span>Load Capacity</span>
                      <span style={{ color: occ >= cap ? "#dc2626" : "#16a34a" }}>{occ} / {cap} Seats</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── STUDENT ALLOCATION TABLE ───────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <h3 className="ad-card-title">Student Transit Allocation Manifest ({filteredStudents.length.toLocaleString()})</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    className="ad-input"
                    style={{ width: "auto", height: 36, fontSize: 12.5 }}
                    value={exportRouteFilter}
                    onChange={(e) => setExportRouteFilter(e.target.value)}
                  >
                    <option value="ALL">All Routes ({students.length.toLocaleString()})</option>
                    <option value="Route 2A">Route 2A (Navrangpura)</option>
                    <option value="Route 3B">Route 3B (Memnagar)</option>
                    <option value="Route 1C">Route 1C (Satellite)</option>
                    <option value="Route 4D">Route 4D (Chandkheda)</option>
                    <option value="Route 5E">Route 5E (Gandhinagar)</option>
                    <option value="Route 6F">Route 6F (Maninagar)</option>
                  </select>
                  <button
                    className="ad-btn-secondary"
                    onClick={handleDownload}
                    style={{ padding: "6px 14px", fontSize: 12.5, fontWeight: 700, borderColor: "#16a34a", color: "#16a34a", background: "#f0fdf4" }}
                  >
                    Export Route (.CSV)
                  </button>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Student ID</th>
                      <th className="ad-th">Student Name</th>
                      <th className="ad-th">Department & Year</th>
                      <th className="ad-th">Assigned Route</th>
                      <th className="ad-th">Assigned Pickup Stop</th>
                      <th className="ad-th">Pass Status</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{s.id}</td>
                        <td className="ad-td"><strong>{s.name}</strong></td>
                        <td className="ad-td">{s.dept} · {s.year}</td>
                        <td className="ad-td"><span className="ad-badge ad-badge--blue">{s.routeName}</span></td>
                        <td className="ad-td">{s.pickupStop}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${s.passStatus === "ACTIVE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            ● {s.passStatus}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            onClick={() => {
                              setTransferModal(s);
                              setSelectedRouteId(s.routeId);
                              setSelectedStop(s.pickupStop);
                            }}
                            style={{ padding: "5px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            Transfer Route / Stop
                          </button>
                        </td>
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

      {/* ── ROUTE TRANSFER MODAL ───────────────────────────────── */}
      {transferModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Transfer Student Transit Allocation</h3>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
              Student: <strong>{transferModal.name}</strong> ({transferModal.id}) &nbsp;·&nbsp; Current: <strong>{transferModal.routeName}</strong>
            </p>

            <form onSubmit={handleTransferSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select New Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    setSelectedRouteId(e.target.value);
                    const newR = routes.find((r) => r.id === e.target.value);
                    if (newR && newR.stops.length > 0) {
                      setSelectedStop(newR.stops[0].name);
                    }
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", fontSize: 13.5 }}
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.distance} · {r.assignedBus})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Pickup Stop</label>
                <select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", fontSize: 13.5 }}
                >
                  {targetRouteObj?.stops.map((st) => (
                    <option key={st.id} value={st.name}>{st.name} ({st.time})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save Allocation
                </button>
                <button type="button" onClick={() => setTransferModal(null)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default StudentTransport;
