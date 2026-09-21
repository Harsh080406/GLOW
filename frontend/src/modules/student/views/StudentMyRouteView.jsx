import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const RouteMapSVG = () => (
  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8eaf0", position: "relative" }}>
    <svg viewBox="0 0 680 160" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="680" height="160" fill="#f8fafc" />
      <rect x="0" y="55" width="680" height="22" fill="#fff" opacity="0.7" />
      <rect x="0" y="105" width="680" height="16" fill="#fff" opacity="0.6" />
      {[
        [8, 8, 85, 40], [130, 8, 100, 40], [265, 8, 100, 40], [400, 8, 100, 40], [535, 8, 130, 40],
        [8, 85, 85, 14], [130, 85, 100, 14], [265, 85, 100, 14], [400, 85, 100, 14], [535, 85, 130, 14],
        [8, 128, 85, 28], [130, 128, 100, 28], [265, 128, 100, 28], [400, 128, 100, 28], [535, 128, 130, 28],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#e2e8f0" opacity="0.8" />
      ))}
      <line x1="50" y1="66" x2="630" y2="66" stroke="#0066ff" strokeWidth="3" strokeLinecap="round" />
      {[50, 165, 295, 420, 558, 630].map((cx, i) => (
        <circle key={i} cx={cx} cy="66" r={i === 0 || i === 5 ? 8 : i === 3 ? 10 : 6}
          fill={i === 3 ? "#0066ff" : i === 0 ? "#0066ff" : i === 5 ? "#0f172a" : "#fff"}
          stroke={i === 5 ? "#0f172a" : "#0066ff"} strokeWidth="2.5" />
      ))}
      <text x="50" y="88" textAnchor="middle" fontSize="9" fill="#0066ff" fontWeight="700">S</text>
      <text x="165" y="88" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">2</text>
      <text x="295" y="88" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">3</text>
      <text x="420" y="88" textAnchor="middle" fontSize="9" fill="#0066ff" fontWeight="700">★4</text>
      <text x="558" y="88" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">5</text>
      <text x="630" y="88" textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="700">E</text>
      <text x="50" y="100" textAnchor="middle" fontSize="8" fill="#0066ff">Chandkheda</text>
      <text x="630" y="100" textAnchor="middle" fontSize="8" fill="#0f172a">University</text>
      <rect x="390" y="40" width="62" height="16" rx="3" fill="#0066ff" opacity="0.9" />
      <text x="421" y="52" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">YOUR STOP</text>
    </svg>
  </div>
);

const StudentMyRoute = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("morning");
  const [routeData, setRouteData] = useState(null);
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/v1/student/me/route/stops", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.route) {
          setRouteData(data.route);
        }
      })
      .catch((err) => console.warn("Route stops fetch fallback active:", err));
  }, []);

  const handleSetNotification = (stopName) => {
    fetch("/api/v1/student/me/stop-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
      body: JSON.stringify({ stopName, minutesBefore: 10 }),
    })
      .then((res) => res.json())
      .then(() => {
        setNotifSuccess(true);
        setTimeout(() => setNotifSuccess(false), 4000);
      })
      .catch((err) => console.warn("Stop notification error:", err));
  };

  const handleDownloadPdf = () => {
    window.open("/api/v1/student/me/route/pdf", "_blank");
  };

  const stops = routeData?.stops || [
    { name: "Chandkheda Bus Stop", etaOffsetMin: 0, lat: 23.102, lng: 72.585 },
    { name: "Motera Stadium", etaOffsetMin: 12, lat: 23.091, lng: 72.591 },
    { name: "University Main Campus", etaOffsetMin: 35, lat: 23.078, lng: 72.592 },
  ];

  return (
    <div className="student-view-wrap">
      {/* Route header */}
      <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#1a1d23" }}>{routeData?.name || "Route R-04"}</span>
              <span className="ad-badge ad-badge--green">Active</span>
            </div>
            <p style={{ fontSize: 13.5, color: "#7c8494" }}>{routeData?.origin || "Chandkheda Bus Stop"} → {routeData?.destination || "University Campus"}</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="ad-btn-primary" onClick={handleDownloadPdf} style={{ minHeight: 44 }}>
              <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />Download Route Map PDF
            </button>
          </div>
        </div>
        <RouteMapSVG />
      </div>

      {notifSuccess && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", color: "#166534", fontSize: 13, fontWeight: 600 }}>
          ✓ Stop reminder set! Backend will push SMS / App alert 10 mins before bus arrives at your stop.
        </div>
      )}

      {/* Trip selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {[["morning", "Morning Trip"], ["evening", "Evening Trip"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "8px 20px", border: `1.5px solid ${tab === id ? "#22c55e" : "#e8eaf0"}`, borderRadius: 20, background: tab === id ? "#22c55e" : "#fff", color: tab === id ? "#fff" : "#5a6070", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Stops list */}
      <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 14, padding: "20px 22px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 16 }}>
          {tab === "morning" ? "Morning Stops (07:45 AM Departure)" : "Evening Stops (05:00 PM Departure)"}
        </h3>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 16, top: 20, bottom: 20, width: 2, background: "#e8eaf0" }} />
          {stops.map((stop, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f8fafc", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                  {i + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{stop.name}</h4>
                  <p style={{ fontSize: 12, color: "#64748b" }}>ETA Offset: +{stop.etaOffsetMin || i * 10} mins</p>
                </div>
              </div>
              <button
                onClick={() => handleSetNotification(stop.name)}
                style={{ padding: "6px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", minHeight: 44 }}
              >
                🔔 Set Stop Notification
              </button>
            </div>
          ))}
        </div>
      </div>

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};
export default StudentMyRoute;
