import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../context/TransitContext";
import AdminSidebar from "../components/AdminSidebar";
import RoleSwitcherBar from "../components/RoleSwitcherBar";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const BusIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1" fill={color} stroke="none" />
    <circle cx="17" cy="19" r="1" fill={color} stroke="none" />
    <path d="M6 5V3M18 5V3" />
  </svg>
);

const BUSES = [
  { id: "GJ05AB1234", busName: "BUS-104", route: "Route 2A (Chandkheda)", driver: "Mahesh Patel",   status: "On Route", speed: "42 km/h", lat: 280, lng: 140, next: "Commerce Six Road", eta: "2 min",  passengers: 38, color: "#22c55e" },
  { id: "GJ05CD5678", busName: "BUS-108", route: "Route 3B (Maninagar)", driver: "Ramesh Shah",    status: "Delayed",  speed: "18 km/h", lat: 400, lng: 200, next: "Paldi",             eta: "12 min", passengers: 28, color: "#f59e0b" },
  { id: "GJ05EF9012", busName: "BUS-101", route: "Route 1C (SG Highway)", driver: "Suresh Joshi",   status: "On Route", speed: "36 km/h", lat: 380, lng: 100, next: "Thaltej",           eta: "5 min",  passengers: 42, color: "#3b82f6" },
  { id: "GJ05GH3456", busName: "BUS-115", route: "Route 4D (Gandhinagar)", driver: "Dinesh Trivedi", status: "On Route", speed: "51 km/h", lat: 540, lng: 140, next: "University Campus",   eta: "3 min",  passengers: 30, color: "#8b5cf6" },
];

const FleetMap = ({ buses, selected, onSelect }) => (
  <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e8eaf0" }}>
    <svg viewBox="0 0 700 360" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="700" height="360" fill="#f8fafc" />
      {/* City Road Network */}
      <line x1="0" y1="130" x2="700" y2="130" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="0" y1="240" x2="700" y2="240" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="120" y1="0" x2="120" y2="360" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="300" y1="0" x2="300" y2="360" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="500" y1="0" x2="500" y2="360" stroke="#e2e8f0" strokeWidth="16" />

      {/* Urban Blocks */}
      {[[10,10,100,112],[140,10,148,112],[320,10,168,112],[520,10,168,112],
        [10,150,100,80],[140,150,148,80],[320,150,168,80],[520,150,148,80],
        [10,260,100,90],[140,260,148,90],[320,260,168,90],[520,260,168,90]].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      ))}

      {/* Transit Route Polylines */}
      <polyline points="60,310 120,200 300,200 500,200 620,200" fill="none" stroke="#0066ff" strokeWidth="4" strokeLinecap="round"/>
      <polyline points="60,250 120,250 300,250 500,250 620,250" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round"/>
      <polyline points="60,310 200,310 300,120 500,80 620,60" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round"/>
      <polyline points="60,180 120,180 300,180 500,180 620,180" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round"/>

      {/* Real-Time Live Bus Markers */}
      {buses.map(b => {
        const isSel = selected === b.busId;
        // Compute coordinate along route from progressPercent (0 to 100)
        const posX = 70 + ((b.progressPercent || 50) / 100) * 540;
        const posY = b.busId === "BUS-104" ? 280 - ((b.progressPercent || 50) / 100) * 190 : b.busId === "BUS-108" ? 250 : b.busId === "BUS-101" ? 200 : 160;

        return (
          <g key={b.busId} transform={`translate(${posX},${posY})`} style={{ cursor: "pointer", transition: "transform 0.5s ease" }} onClick={() => onSelect(b.busId)}>
            {isSel && <circle r="22" fill="#0066ff" opacity="0.2" className="lt-pulse-circle" />}
            <circle r={isSel ? 16 : 13} fill={isSel ? "#0066ff" : b.status === "DELAYED" ? "#f59e0b" : "#0f172a"} stroke="#ffffff" strokeWidth={isSel ? 3 : 2} />
            <text x="0" y="4" textAnchor="middle" fontSize="11">🚌</text>
            <text x="0" y={isSel ? -20 : -16} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0f172a" stroke="#ffffff" strokeWidth="3" paintOrder="stroke">{b.busId}</text>
            <text x="0" y={isSel ? -20 : -16} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0f172a">{b.busId}</text>
          </g>
        );
      })}
    </svg>
  </div>
);

const AdminTracking = () => {
  const navigate = useNavigate();
  const { currentAdmin, liveBusTelemetry } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState("BUS-104");

  const telemetryList = Object.values(liveBusTelemetry || {});
  const selBus = (liveBusTelemetry && liveBusTelemetry[selected]) || telemetryList[0] || {
    busId: "BUS-104",
    regNo: "GJ-05-AB-1234",
    routeName: "Route 4D (Chandkheda)",
    driverName: "Mahesh Patel",
    driverPhone: "+91 98765 11111",
    status: "ON_ROUTE",
    speed: 42,
    nextStop: "Motera Crossroads",
    etaMinutes: 6,
    lat: 23.0982,
    lng: 72.5784,
    progressPercent: 46,
  };

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

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="tracking" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Live GPS Fleet Telemetry</div>
              <div className="ad-topbar-subtitle">Real-time telemetry stream synchronized across Driver, Student & Admin portals</div>
            </div>
            <div className="ad-topbar-right">
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {/* Map view */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <div>
                    <h3 className="ad-card-title">Live Telemetry Map</h3>
                    <p style={{ fontSize: 12, color: "#64748b" }}>GPS coordinates stream updated in real time</p>
                  </div>
                  <span className="ad-badge ad-badge--green">📡 Live GPS Stream Active</span>
                </div>
                <FleetMap buses={telemetryList} selected={selected} onSelect={setSelected} />
              </div>

              {/* Selected Bus details */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <div>
                    <h3 className="ad-card-title">{selBus.busId} ({selBus.regNo || "GJ-05-AB-1234"})</h3>
                    <p style={{ fontSize: 12, color: "#64748b" }}>Live Driver Telemetry Feed</p>
                  </div>
                  <span className={`ad-badge ${selBus.status === "ON_ROUTE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                    ● {selBus.status}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["Assigned Route", selBus.routeName || selBus.routeId || "Route 4D"],
                    ["Assigned Driver", `${selBus.driverName || "Mahesh Patel"} (${selBus.driverPhone || "+91 98765 11111"})`],
                    ["Live GPS Coords", `Lat ${selBus.lat || 23.0982}° N, Long ${selBus.lng || 72.5784}° E`],
                    ["Current Speed", `${selBus.speed || 42} km/h`],
                    ["Next Stop", selBus.nextStop || "Motera Crossroads"],
                    ["Estimated Arrival (ETA)", `${selBus.etaMinutes || 6} min`],
                    ["Route Progress", `${Math.round(selBus.progressPercent || 46)}% Completed`],
                    ["Last Telemetry Sync", selBus.lastUpdated ? new Date(selBus.lastUpdated).toLocaleTimeString() : "Just now"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 12.5, color: "#64748b" }}>{label}</span>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{val}</strong>
                    </div>
                  ))}

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => alert(`Connecting direct radio/phone line to Driver ${selBus.driverName || "Mahesh Patel"}...`)}
                      className="ad-btn-primary"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      Call Driver
                    </button>
                    <button
                      onClick={() => navigate("/admin/schedules")}
                      className="ad-btn-secondary"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Fleet Telemetry Table */}
            <div className="ad-card" style={{ marginTop: 20 }}>
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Live Fleet Telemetry Stream</h3>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Real-time telemetry payload table ready for backend REST/WebSocket ingestion</p>
                </div>
                <span className="ad-badge ad-badge--blue">{telemetryList.length} Vehicles Broadcasting</span>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Bus ID</th>
                      <th className="ad-th">Plate No</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Driver In-Charge</th>
                      <th className="ad-th">Coordinates (GPS)</th>
                      <th className="ad-th">Speed</th>
                      <th className="ad-th">Next Stop ETA</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetryList.map((b) => (
                      <tr
                        key={b.busId}
                        className="ad-tr"
                        style={{ background: selected === b.busId ? "#f0fdf4" : undefined, cursor: "pointer" }}
                        onClick={() => setSelected(b.busId)}
                      >
                        <td className="ad-td"><strong>{b.busId}</strong></td>
                        <td className="ad-td">{b.regNo || "GJ-05-AB-1234"}</td>
                        <td className="ad-td">{b.routeName || b.routeId}</td>
                        <td className="ad-td">{b.driverName}</td>
                        <td className="ad-td" style={{ fontFamily: "monospace", fontSize: 12 }}>{b.lat}, {b.lng}</td>
                        <td className="ad-td"><strong>{b.speed} km/h</strong></td>
                        <td className="ad-td">{b.nextStop} ({b.etaMinutes}m)</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${b.status === "ON_ROUTE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            ● {b.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            className="ad-btn-secondary"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(b.busId);
                            }}
                          >
                            Track Live
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Campus Bus Transit System.</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;
