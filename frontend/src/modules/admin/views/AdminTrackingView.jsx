import React, { useState, useEffect, useRef } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const FleetMap = ({ buses, selected, onSelect }) => (
  <div style={{
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    border: "1.5px solid #e2e8f0",
    touchAction: "pan-x pan-y pinch-zoom"
  }}>
    <svg viewBox="0 0 700 360" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="700" height="360" fill="#f8fafc" />

      {/* City Road Network */}
      <line x1="0" y1="130" x2="700" y2="130" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="0" y1="240" x2="700" y2="240" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="120" y1="0" x2="120" y2="360" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="300" y1="0" x2="300" y2="360" stroke="#e2e8f0" strokeWidth="16" />
      <line x1="500" y1="0" x2="500" y2="360" stroke="#e2e8f0" strokeWidth="16" />

      {/* Urban Blocks */}
      {[[10, 10, 100, 112], [140, 10, 148, 112], [320, 10, 168, 112], [520, 10, 168, 112],
        [10, 150, 100, 80], [140, 150, 148, 80], [320, 150, 168, 80], [520, 150, 148, 80],
        [10, 260, 100, 90], [140, 260, 148, 90], [320, 260, 168, 90], [520, 260, 168, 90]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      ))}

      {/* Transit Route Polylines */}
      <polyline points="60,310 120,200 300,200 500,200 620,200" fill="none" stroke="#0066ff" strokeWidth="4" strokeLinecap="round" />
      <polyline points="60,250 120,250 300,250 500,250 620,250" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round" />
      <polyline points="60,310 200,310 300,120 500,80 620,60" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round" />
      <polyline points="60,180 120,180 300,180 500,180 620,180" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />

      {/* Real-Time Live Bus Markers */}
      {buses.map((b, idx) => {
        const isSel = selected === (b.busId || b.id);
        const progress = b.progressPercent !== undefined ? b.progressPercent : (idx * 17) % 100;
        const posX = 70 + (progress / 100) * 540;
        const posY = (idx % 4 === 0)
          ? 280 - (progress / 100) * 190
          : (idx % 4 === 1)
          ? 250
          : (idx % 4 === 2)
          ? 200
          : 160;

        return (
          <g
            key={b.busId || b.id || idx}
            transform={`translate(${posX},${posY})`}
            style={{ cursor: "pointer", transition: "transform 0.4s ease" }}
            onClick={() => onSelect(b.busId || b.id)}
          >
            {isSel && <circle r="22" fill="#0066ff" opacity="0.25" />}
            <circle
              r={isSel ? 16 : 13}
              fill={isSel ? "#0066ff" : b.status === "DELAYED" ? "#f59e0b" : "#0f172a"}
              stroke="#ffffff"
              strokeWidth={isSel ? 3 : 2}
            />
            <text x="0" y="4" textAnchor="middle" fontSize="11">🚌</text>
            <text x="0" y={isSel ? -20 : -16} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0f172a" stroke="#ffffff" strokeWidth="3" paintOrder="stroke">
              {b.busId || b.id}
            </text>
            <text x="0" y={isSel ? -20 : -16} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0f172a">
              {b.busId || b.id}
            </text>
          </g>
        );
      })}
    </svg>
    <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, border: "1px solid #cbd5e1" }}>
      Touch pan & pinch-zoom enabled
    </div>
  </div>
);

const AdminTracking = () => {
  const { liveBusTelemetry, isWsConnected } = useTransit();
  const [selected, setSelected] = useState("BUS-104");
  const [search, setSearch] = useState("");

  // Throttled / Batched Telemetry Frame Buffer via requestAnimationFrame
  const [batchedTelemetry, setBatchedTelemetry] = useState({});
  const rafRef = useRef(null);
  const pendingBufferRef = useRef({});

  useEffect(() => {
    pendingBufferRef.current = { ...pendingBufferRef.current, ...liveBusTelemetry };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setBatchedTelemetry({ ...pendingBufferRef.current });
        rafRef.current = null;
      });
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [liveBusTelemetry]);

  // Merge live telemetry with seed list of active buses (covers fleet of up to 85 buses)
  const allBusList = Object.values(batchedTelemetry);
  const displayList = allBusList.length > 0 ? allBusList : [
    { busId: "BUS-104", regNo: "GJ-06-AB-1004", routeName: "Route 4D (Fatehgunj)", driverName: "Mahesh Patel", speed: 42, nextStop: "Nizampura Char Rasta", etaMinutes: 6, status: "ON_ROUTE", progressPercent: 46 },
    { busId: "BUS-108", regNo: "GJ-06-CD-1008", routeName: "Route 2A (Sayajigunj)", driverName: "Ramesh Shah", speed: 18, nextStop: "Station Circle", etaMinutes: 12, status: "DELAYED", progressPercent: 62 },
    { busId: "BUS-101", regNo: "GJ-06-EF-1001", routeName: "Route 1C (Alkapuri)", driverName: "Suresh Joshi", speed: 36, nextStop: "RC Dutt Road", etaMinutes: 4, status: "ON_ROUTE", progressPercent: 28 },
    { busId: "BUS-115", regNo: "GJ-06-GH-1015", routeName: "Route 5E (Karelibaug)", driverName: "Kailash Dave", speed: 48, nextStop: "Amit Nagar Circle", etaMinutes: 9, status: "ON_ROUTE", progressPercent: 78 },
  ];

  const selBus = displayList.find((b) => (b.busId || b.id) === selected) || displayList[0];

  const filteredBuses = displayList.filter((b) => {
    const q = search.toLowerCase();
    const id = (b.busId || b.id || "").toLowerCase();
    const rt = (b.routeName || b.route || "").toLowerCase();
    const drv = (b.driverName || b.driver || "").toLowerCase();
    return id.includes(q) || rt.includes(q) || drv.includes(q);
  });

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Live Fleet GPS Telemetry Console</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            High-frequency 3-second GPS updates across 85 fleet channels · Throttled batch rendering
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: isWsConnected ? "#f0fdf4" : "#fef2f2",
            color: isWsConnected ? "#16a34a" : "#dc2626",
            border: `1px solid ${isWsConnected ? "#bbf7d0" : "#fecaca"}`,
            padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: isWsConnected ? "#16a34a" : "#dc2626" }} />
            {isWsConnected ? "WebSocket Connected (bus:*:telemetry)" : "Reconnecting Telemetry Engine..."}
          </span>
        </div>
      </div>

      {/* Grid: Map on Left (or Top), Selected Bus Details on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div>
          <FleetMap
            buses={displayList}
            selected={selected}
            onSelect={(id) => setSelected(id)}
          />
        </div>

        {/* Selected Bus Cockpit Card */}
        {selBus && (
          <div className="ad-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{selBus.busId || selBus.id}</span>
                <span className={`ad-badge ${(selBus.status || "ON_ROUTE") === "ON_ROUTE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                  ● {selBus.status || "ON_ROUTE"}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                Route: <strong>{selBus.routeName || selBus.route || "Corridor"}</strong>
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Live Speed</span>
                  <strong style={{ fontSize: 16, color: "#2563eb" }}>{selBus.speed || selBus.currentSpeed || 0} km/h</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Next Stop ETA</span>
                  <strong style={{ fontSize: 16, color: "#0f172a" }}>~{selBus.etaMinutes || selBus.eta || 5} min</strong>
                </div>
              </div>

              <div style={{ fontSize: 12.5, lineHeight: 1.8, color: "#334155" }}>
                <div><strong>Assigned Driver:</strong> {selBus.driverName || selBus.driver || "Mahesh Patel"}</div>
                <div><strong>Registration:</strong> {selBus.regNo || "GJ-06-AB-1004"}</div>
                <div><strong>Next Approaching Stop:</strong> {selBus.nextStop || "Main Gate"}</div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
              <button
                className="ad-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => alert(`Broadcasting telemetry sync request for ${selBus.busId || selBus.id}`)}
              >
                Ping Bus Gateway
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fleet Live Channel Roster */}
      <div className="ad-card">
        <div className="ad-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="ad-card-title">Live Telemetry Fleet Channels ({filteredBuses.length})</h3>
          <input
            type="text"
            placeholder="Search active bus, driver, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1.5px solid #cbd5e1", fontSize: 12.5 }}
          />
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="ad-th">Bus ID</th>
                <th className="ad-th">Route</th>
                <th className="ad-th">Driver</th>
                <th className="ad-th">Current Speed</th>
                <th className="ad-th">Next Stop & ETA</th>
                <th className="ad-th">Status</th>
                <th className="ad-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map((b) => {
                const bId = b.busId || b.id;
                const isSelected = selected === bId;
                return (
                  <tr key={bId} className="ad-tr" style={{ background: isSelected ? "#eff6ff" : "inherit" }}>
                    <td className="ad-td" style={{ fontWeight: 800 }}>{bId}</td>
                    <td className="ad-td"><strong>{b.routeName || b.route}</strong></td>
                    <td className="ad-td">{b.driverName || b.driver}</td>
                    <td className="ad-td">{b.speed || b.currentSpeed || 0} km/h</td>
                    <td className="ad-td">{b.nextStop || "Approaching"} (~{b.etaMinutes || b.eta || 5} min)</td>
                    <td className="ad-td">
                      <span className={`ad-badge ${(b.status || "ON_ROUTE") === "ON_ROUTE" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                        ● {b.status || "ON_ROUTE"}
                      </span>
                    </td>
                    <td className="ad-td">
                      <button
                        onClick={() => setSelected(bId)}
                        style={{
                          padding: "4px 10px",
                          background: isSelected ? "#2563eb" : "#f1f5f9",
                          color: isSelected ? "#fff" : "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {isSelected ? "Tracking" : "Focus"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;
