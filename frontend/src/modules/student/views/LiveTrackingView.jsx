import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import "./LiveTracking.css";

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

/* ── INTERACTIVE LIVE MAP COMPONENT ────────────────────────── */
const TrackingMap = ({ busProgress, routeStops, nextStopIndex, lat, lng, speed, isLiveBroadcasting }) => {
  // Compute bus marker coordinates along polyline (0% to 100%)
  const busX = 80 + (busProgress / 100) * 500;
  const busY = 280 - (busProgress / 100) * 190;

  return (
    <div className="lt-map-container">
      <svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg" className="lt-map-svg">
        {/* Background Map Grid */}
        <rect width="680" height="360" fill="#f8fafc" />

        {/* City Blocks Grid */}
        {[
          [20, 20, 110, 100], [150, 20, 160, 100], [330, 20, 160, 100], [510, 20, 150, 100],
          [20, 140, 110, 90], [150, 140, 160, 90], [330, 140, 160, 90], [510, 140, 150, 90],
          [20, 250, 110, 90], [150, 250, 160, 90], [330, 250, 160, 90], [510, 250, 150, 90],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        ))}

        {/* Roads Network */}
        <line x1="0" y1="130" x2="680" y2="130" stroke="#f1f5f9" strokeWidth="18" />
        <line x1="0" y1="240" x2="680" y2="240" stroke="#f1f5f9" strokeWidth="18" />
        <line x1="140" y1="0" x2="140" y2="360" stroke="#f1f5f9" strokeWidth="18" />
        <line x1="320" y1="0" x2="320" y2="360" stroke="#f1f5f9" strokeWidth="18" />
        <line x1="500" y1="0" x2="500" y2="360" stroke="#f1f5f9" strokeWidth="18" />

        {/* Active Transit Highway Polyline */}
        <polyline
          points="80,280 170,240 270,210 380,180 480,130 580,90"
          fill="none"
          stroke="#0066ff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Route Stops */}
        {[
          { x: 80, y: 280, name: "Fatehgunj Stop", isStart: true },
          { x: 170, y: 240, name: "Nizampura Char Rasta" },
          { x: 270, y: 210, name: "Chhani Jakat Naka" },
          { x: 380, y: 180, name: "Bajwa Crossing" },
          { x: 480, y: 130, name: "Fertilizernagar Gate" },
          { x: 580, y: 90, name: "GSFC University", isEnd: true },
        ].map((stop, i) => {
          const isPassed = i < nextStopIndex;
          const isNext = i === nextStopIndex;
          return (
            <g key={i}>
              <circle
                cx={stop.x}
                cy={stop.y}
                r={isNext ? 9 : 7}
                fill={isNext ? "#0066ff" : isPassed ? "#0f172a" : "#ffffff"}
                stroke={isNext ? "#ffffff" : isPassed ? "#ffffff" : "#0066ff"}
                strokeWidth="2.5"
              />
              <text
                x={stop.x}
                y={stop.y + (i % 2 === 0 ? 22 : -14)}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isNext ? "800" : "600"}
                fill={isNext ? "#0066ff" : "#0f172a"}
              >
                {stop.name}
              </text>
            </g>
          );
        })}

        {/* Moving Live Bus Marker with Pulse Ring */}
        <g transform={`translate(${busX}, ${busY})`}>
          <circle r="22" fill="#0066ff" opacity="0.2" className="lt-pulse-circle" />
          <circle r="15" fill="#0066ff" stroke="#ffffff" strokeWidth="3" />
          <text textAnchor="middle" y="5" fontSize="13">🚌</text>
        </g>
      </svg>

      {/* Floating GPS Telemetry Overlay */}
      <div className="lt-map-telemetry">
        <div className="lt-telemetry-pill">
          <span className="lt-live-beacon" />
          <span>📡 {isLiveBroadcasting !== false ? "Live Driver Feed" : "Telemetry Stream"} · {speed} km/h</span>
        </div>
        <div className="lt-telemetry-pill lt-telemetry-pill--dark">
          <span>Lat {lat}° N, Long {lng}° E</span>
        </div>
      </div>
    </div>
  );
};

const LiveTracking = () => {
  const navigate = useNavigate();
  const { currentStudent, liveBusTelemetry } = useTransit();

  const busId = currentStudent?.busId || "BUS-104";
  const telemetry = (liveBusTelemetry && liveBusTelemetry[busId]) || (liveBusTelemetry && liveBusTelemetry["BUS-104"]) || {};

  const busProgress = telemetry.progressPercent || 46;
  const speed = telemetry.speed || 42;
  const nextStopIndex = telemetry.nextStopIndex !== undefined ? telemetry.nextStopIndex : 2;
  const nextStopName = telemetry.nextStop || "Chhani Jakat Naka";
  const etaMinutes = telemetry.etaMinutes || 6;
  const lat = telemetry.lat || 22.3412;
  const lng = telemetry.lng || 73.1710;
  const driverName = telemetry.driverName || "Mahesh Patel";
  const driverPhone = telemetry.driverPhone || "+91 98765 11111";

  const routeName = currentStudent?.routeName || currentStudent?.route || "Route 4D (Fatehgunj - GSFC)";
  const pickupStop = currentStudent?.pickupStop || currentStudent?.boarding || "Fatehgunj Stop";

  const routeStops = [
    { name: "Fatehgunj Stop", time: "07:30 AM", eta: "Departed", status: nextStopIndex > 0 ? "passed" : "approaching" },
    { name: "Nizampura Char Rasta", time: "07:42 AM", eta: nextStopIndex === 1 ? `${etaMinutes} min` : nextStopIndex > 1 ? "Passed" : "Upcoming", status: nextStopIndex === 1 ? "approaching" : nextStopIndex > 1 ? "passed" : "upcoming" },
    { name: "Chhani Jakat Naka", time: "07:54 AM", eta: nextStopIndex === 2 ? `${etaMinutes} min` : nextStopIndex > 2 ? "Passed" : "Upcoming", status: nextStopIndex === 2 ? "approaching" : nextStopIndex > 2 ? "passed" : "upcoming" },
    { name: "Bajwa Crossing", time: "08:04 AM", eta: nextStopIndex === 3 ? `${etaMinutes} min` : nextStopIndex > 3 ? "Passed" : "Upcoming", status: nextStopIndex === 3 ? "approaching" : nextStopIndex > 3 ? "passed" : "upcoming" },
    { name: "Fertilizernagar Gate", time: "08:14 AM", eta: nextStopIndex === 4 ? `${etaMinutes} min` : nextStopIndex > 4 ? "Passed" : "Upcoming", status: nextStopIndex === 4 ? "approaching" : nextStopIndex > 4 ? "passed" : "upcoming" },
    { name: "GSFC University", time: "08:20 AM", eta: "Destination", status: "destination" },
  ];

  return (
    <div className="student-view-wrap">
      <div className="lt-root-container">

        {/* ── TOP HERO TRIP METRICS ──────────────────────────── */}
        <div className="lt-hero-banner">
          <div className="lt-hero-main">
            <div className="lt-hero-bus-icon">
              <BusIcon size={28} color="#ffffff" />
            </div>
            <div>
              <div className="lt-hero-badge">📡 Real-Time Live Feed Active</div>
              <h2 className="lt-hero-title">{busId} • {routeName}</h2>
              <p className="lt-hero-sub">Pilot: <strong>{driverName}</strong> (Ph: {driverPhone})</p>
            </div>
          </div>

          <div className="lt-hero-stats">
            <div className="lt-stat-box">
              <span className="lt-stat-label">Next Stop ({nextStopName})</span>
              <span className="lt-stat-val">{etaMinutes} min ETA</span>
            </div>
            <div className="lt-stat-box">
              <span className="lt-stat-label">Live Speed</span>
              <span className="lt-stat-val">{speed} km/h</span>
            </div>
            <div className="lt-stat-box">
              <span className="lt-stat-label">Your Stop</span>
              <span className="lt-stat-val">{pickupStop}</span>
            </div>
          </div>
        </div>

        {/* ── MAIN TWO-COLUMN VIEW (MAP & ROUTE PROGRESS) ──────── */}
        <div className="lt-grid-two">

          {/* Left: Big Live Interactive Map */}
          <div className="lt-card lt-card--map">
            <div className="lt-card-header">
              <div>
                <h3 className="lt-card-title">Live Route Telemetry</h3>
                <p className="lt-card-sub">GPS refreshed in real-time · Accuracy: 3m</p>
              </div>
              <button className="lt-sos-top-btn" onClick={() => navigate("/student/emergency")}>
                🚨 Emergency SOS
              </button>
            </div>

            <TrackingMap
              busProgress={busProgress}
              routeStops={routeStops}
              nextStopIndex={nextStopIndex}
              lat={lat}
              lng={lng}
              speed={speed}
              isLiveBroadcasting={telemetry.isLiveBroadcasting}
            />

            <div className="lt-map-actions">
              <button className="lt-map-action-btn" onClick={() => alert(`Connecting direct voice call with Driver ${driverName} (${driverPhone})...`)}>
                <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" size={16} stroke="#0066ff" />
                <span>Call Driver</span>
              </button>
              <button className="lt-map-action-btn" onClick={() => alert("Live tracking location link copied to clipboard to share with parents.")}>
                <Icon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" size={16} stroke="#0066ff" />
                <span>Share Live Location</span>
              </button>
              <button className="lt-map-action-btn" onClick={() => navigate("/student/schedule")}>
                <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={16} stroke="#0066ff" />
                <span>Full Timetable</span>
              </button>
            </div>
          </div>

          {/* Right: Checkpoint Stops Timeline */}
          <div className="lt-card">
            <div className="lt-card-header">
              <div>
                <h3 className="lt-card-title">Route Checkpoints</h3>
                <p className="lt-card-sub">6 stops scheduled</p>
              </div>
              <span className="lt-status-pill">● On Route</span>
            </div>

            <div className="lt-timeline-list">
              {routeStops.map((stop, idx) => (
                <div key={idx} className={`lt-timeline-item lt-timeline-item--${stop.status}`}>
                  <div className="lt-timeline-node">
                    <div className="lt-node-circle" />
                    {idx < routeStops.length - 1 && <div className="lt-node-line" />}
                  </div>

                  <div className="lt-timeline-content">
                    <div className="lt-timeline-title-row">
                      <p className="lt-stop-name">{stop.name}</p>
                      <span className={`lt-eta-tag lt-eta-tag--${stop.status}`}>{stop.eta}</span>
                    </div>
                    <p className="lt-stop-time">Scheduled: {stop.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delay notice footer */}
            <div className="lt-delay-notice">
              <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={18} stroke="#0066ff" />
              <span>Normal traffic conditions reported on route. Telemetry synchronized with Driver POS.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
