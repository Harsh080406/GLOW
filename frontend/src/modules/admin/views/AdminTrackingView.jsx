import React, { useState, useEffect, useRef } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import RealMapView from "../../../shared/components/RealMapView";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
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
  const demoBusCoords = {
    "BUS-104": { lat: 22.3485, lng: 73.1710 },
    "BUS-108": { lat: 22.3150, lng: 73.1810 },
    "BUS-101": { lat: 22.3080, lng: 73.1670 },
    "BUS-115": { lat: 22.3290, lng: 73.1950 },
  };

  const rawList = Object.values(batchedTelemetry);
  const displayList = (rawList.length > 0 ? rawList : [
    { busId: "BUS-104", regNo: "GJ-06-AB-1004", routeName: "Route 4D (Fatehgunj)", driverName: "Mahesh Patel", speed: 42, nextStop: "Nizampura Char Rasta", etaMinutes: 6, status: "ON_ROUTE", progressPercent: 46, lat: 22.3485, lng: 73.1710 },
    { busId: "BUS-108", regNo: "GJ-06-CD-1008", routeName: "Route 2A (Sayajigunj)", driverName: "Ramesh Shah", speed: 18, nextStop: "Station Circle", etaMinutes: 12, status: "DELAYED", progressPercent: 62, lat: 22.3150, lng: 73.1810 },
    { busId: "BUS-101", regNo: "GJ-06-EF-1001", routeName: "Route 1C (Alkapuri)", driverName: "Suresh Joshi", speed: 36, nextStop: "RC Dutt Road", etaMinutes: 4, status: "ON_ROUTE", progressPercent: 28, lat: 22.3080, lng: 73.1670 },
    { busId: "BUS-115", regNo: "GJ-06-GH-1015", routeName: "Route 5E (Karelibaug)", driverName: "Kailash Dave", speed: 48, nextStop: "Amit Nagar Circle", etaMinutes: 9, status: "ON_ROUTE", progressPercent: 78, lat: 22.3290, lng: 73.1950 },
  ]).map((b, idx) => ({
    ...b,
    lat: Number(b.lat) || demoBusCoords[b.busId]?.lat || (22.3100 + ((idx * 7) % 30) * 0.002),
    lng: Number(b.lng) || demoBusCoords[b.busId]?.lng || (73.1600 + ((idx * 11) % 30) * 0.002),
  }));

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
            High-frequency 3-second GPS updates across 85 fleet channels · Real Vadodara Map view
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

      {/* Grid: Real Map on Left (or Top), Selected Bus Details on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div>
          <RealMapView
            buses={displayList}
            selectedBusId={selected}
            onSelectBus={(id) => setSelected(id)}
            height="440px"
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
