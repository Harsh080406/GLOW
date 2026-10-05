import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import RealMapView, { DEFAULT_R04_STOPS } from "../../../shared/components/RealMapView";
import { OFFICIAL_GSFC_ROUTES_2026 } from "../../../shared/data/officialRoutes2026";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const BusIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    <circle cx="7" cy="19" r="1" fill={color} stroke="none" /><circle cx="17" cy="19" r="1" fill={color} stroke="none" />
    <path d="M6 5V3M18 5V3" />
  </svg>
);

const StudentMyBus = () => {
  const navigate = useNavigate();
  const { currentStudent, liveBusTelemetry } = useTransit();

  const busId = currentStudent?.busId || "BUS-104";
  const telemetry = (liveBusTelemetry && liveBusTelemetry[busId]) || (liveBusTelemetry && liveBusTelemetry["BUS-104"]) || {};

  const routeName = currentStudent?.routeName || currentStudent?.route || "Route R-04: GSFC University ↔ Fatehgunj";
  const driverName = telemetry.driverName || "Mahesh Patel";
  const driverPhone = telemetry.driverPhone || "+91 98765 11111";
  const driverExperience = telemetry.driverExperience || "8 years";
  const driverRating = telemetry.driverRating || "⭐ 4.8 / 5.0";
  const speed = telemetry.speed || 42;
  const nextStop = telemetry.nextStop || "Chhani Jakat Naka";
  const nextStopIndex = telemetry.nextStopIndex !== undefined ? telemetry.nextStopIndex : 2;
  const etaMinutes = telemetry.etaMinutes || 6;
  const lat = Number(telemetry.lat) || 22.3485;
  const lng = Number(telemetry.lng) || 73.1710;
  const status = telemetry.status || "On Route";
  const regNo = currentStudent?.assignedBusRegNo || "GJ-06-AB-1004";
  const busType = currentStudent?.busType || "Volvo AC Seater";
  const capacity = telemetry.capacity || 52;
  const occupancy = telemetry.occupancy || 28;
  const currentLocation = telemetry.currentLocationName || `Near ${nextStop}`;

  const singleBus = {
    busId,
    regNo,
    routeName,
    driverName,
    driverPhone,
    lat,
    lng,
    speed,
    etaMinutes,
    nextStop,
    nextStopIndex,
    status,
    occupancy,
    capacity,
  };

  const handleCallDriver = () => {
    const confirmCall = window.confirm(`Initiate transit direct voice call to driver ${driverName} at ${driverPhone}?`);
    if (confirmCall) {
      window.open(`tel:${driverPhone.replace(/\s+/g, "")}`, "_self");
    }
  };

  return (
    <div className="student-view-wrap">
      {/* Bus Hero Info Card */}
      <div style={{ background: "linear-gradient(135deg,#1e40af,#2563eb)", borderRadius: 16, padding: "clamp(16px, 4vw, 24px) clamp(16px, 4vw, 28px)", color: "#fff", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 60, height: 60, background: "rgba(255,255,255,0.18)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BusIcon size={34} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Your Assigned University Bus</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 2 }}>{busId}</h2>
          <p style={{ opacity: 0.85, fontSize: 14 }}>{routeName} &nbsp;·&nbsp; Reg: {regNo}</p>
        </div>
        <span style={{ background: status === "On Route" ? "#22c55e" : "#eab308", color: "#fff", borderRadius: 20, padding: "6px 18px", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
          ● {status}
        </span>
      </div>

      {/* Details Grid: Bus Details & Driver Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div className="ad-card">
          <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Bus Vehicle Specifications</h3>
          {[
            ["Bus Number",      busId],
            ["Registration",    regNo],
            ["Type",            busType],
            ["Capacity",        `${capacity} passenger seats`],
            ["Live Occupancy",  `${occupancy} / ${capacity} seats (${Math.round((occupancy / capacity) * 100)}%)`],
            ["Current Status",  status],
            ["GPS Gateway",     "Active (Dual Quad-Band)"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f2f5" }}>
              <span style={{ fontSize: 12.5, color: "#7c8494" }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Assigned Driver & Crew</h3>
          {[
            ["Driver Name",   driverName],
            ["Staff ID",      "DRV-2024-001"],
            ["Contact",       driverPhone],
            ["Experience",    driverExperience],
            ["Safety Rating", driverRating],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f2f5" }}>
              <span style={{ fontSize: 12.5, color: "#7c8494" }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <button
            className="ad-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
            onClick={handleCallDriver}
          >
            <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 11.77a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.48 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" size={15} stroke="#fff" />
            Direct Call to Driver ({driverName})
          </button>
        </div>
      </div>

      {/* Real Interactive Route & Live GPS Map */}
      <div className="ad-card">
        <div className="ad-card-header">
          <div>
            <h3 className="ad-card-title">Live Interactive Navigation Map</h3>
            <p className="ad-card-sub" style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Google Maps style route corridor with real-time bus location telemetry
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px" }}>
            <div style={{ width: 7, height: 7, background: "#16a34a", borderRadius: "50%", animation: "livePulse 1.4s infinite" }} />
            Live Real-Time GPS
          </div>
        </div>

        {/* Real Interactive Map View */}
        <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <RealMapView
            singleBus={singleBus}
            routeStops={DEFAULT_R04_STOPS}
            height="380px"
            showControls={true}
            isLiveBroadcasting={telemetry.isLiveBroadcasting !== false}
          />
        </div>

        {/* Live Telemetry Highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 16 }}>
          {[
            ["Current Location", currentLocation, "#0f172a"],
            ["Next Approaching Stop", nextStop, "#0066ff"],
            ["Live Speed", `${speed} km/h`, "#16a34a"],
            ["ETA to GSFC Campus", `~${etaMinutes} min`, "#0f172a"],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: 11, color: "#7c8494", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>{label}</p>
              <p style={{ fontSize: 13.5, fontWeight: 700, color, marginTop: 3 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="ad-btn-primary" onClick={() => navigate("/student/tracking")}>
            <Icon d="M5 3l14 9-14 9V3z" size={15} stroke="#fff" />
            Open Full Tracking Console
          </button>
          <button
            className="ad-btn-secondary"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#334155", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={() => navigate("/student/my-route")}
          >
            <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={15} stroke="#334155" />
            View Route Corridor & Stops Timetable
          </button>
        </div>
      </div>

      {/* ── MISSED YOUR BUS? ALTERNATIVE BUSES SECTION ── */}
      <div className="ad-card" style={{ marginTop: 16 }}>
        <div className="ad-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 className="ad-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🚨</span>
              <span>Missed Your Bus? Board An Alternative University Bus</span>
            </h3>
            <p className="ad-card-sub" style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Official GSFC University 2026-27 fleet channels heading to Main Campus Gate. Tap any bus to track its live GPS location:
            </p>
          </div>
          <button
            className="ad-btn-secondary"
            style={{ fontSize: 12, padding: "6px 14px", cursor: "pointer" }}
            onClick={() => navigate("/student/schedule")}
          >
            Full 13-Route Timetable ➔
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginTop: 14 }}>
          {OFFICIAL_GSFC_ROUTES_2026.filter((r) => r.busNo !== busId).map((rt) => (
            <div
              key={rt.routeId}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 12 }}>
                    Route {rt.routeNumber}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>● Active / On Route</span>
                </div>
                <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>{rt.busNo}</strong>
                <p style={{ fontSize: 11.5, color: "#64748b", marginTop: 3 }}>
                  Origin: <strong>{rt.stops[0].name}</strong> ({rt.stops.length} stops)
                </p>
              </div>

              <button
                className="ad-btn-primary"
                style={{ fontSize: 12, padding: "7px 12px", justifyContent: "center" }}
                onClick={() => navigate(`/student/tracking?route=${rt.routeId}`)}
              >
                <Icon d="M5 3l14 9-14 9V3z" size={13} stroke="#fff" />
                Track Live Location & Board
              </button>
            </div>
          ))}
        </div>
      </div>

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentMyBus;
