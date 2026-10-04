import { useNavigate } from "react-router-dom";
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

const MapSVG = () => (
  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8eaf0" }}>
    <svg viewBox="0 0 600 220" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="600" height="220" fill="#e8f5e9" />
      <line x1="0" y1="80" x2="600" y2="80" stroke="#fff" strokeWidth="14" opacity="0.7"/>
      <line x1="0" y1="160" x2="600" y2="160" stroke="#fff" strokeWidth="10" opacity="0.6"/>
      <line x1="100" y1="0" x2="100" y2="220" stroke="#fff" strokeWidth="10" opacity="0.6"/>
      <line x1="280" y1="0" x2="280" y2="220" stroke="#fff" strokeWidth="10" opacity="0.6"/>
      <line x1="480" y1="0" x2="480" y2="220" stroke="#fff" strokeWidth="10" opacity="0.6"/>
      {[[10,10,80,62],[120,10,148,62],[300,10,168,62],[500,10,88,62],
        [10,98,80,54],[120,98,148,54],[300,98,168,54],[500,98,88,54],
        [10,178,80,36],[120,178,148,36],[300,178,168,36],[500,178,88,36]].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} rx="5" fill="#c8e6c9" opacity="0.65"/>
      ))}
      <polyline points="60,200 110,80 290,80 490,80 570,45" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="60" cy="200" r="7" fill="#3b82f6" stroke="#fff" strokeWidth="2"/>
      <text x="30" y="213" fontSize="9" fill="#1e40af" fontWeight="700">Fatehgunj</text>
      <g transform="translate(290,80)"><circle r="13" fill="#22c55e" stroke="#fff" strokeWidth="2.5"/><text x="-7" y="5" fontSize="12">🚌</text></g>
      <circle cx="570" cy="45" r="7" fill="#ef4444" stroke="#fff" strokeWidth="2"/>
      <text x="490" y="35" fontSize="9" fill="#991b1b" fontWeight="700">GSFC University</text>
    </svg>
  </div>
);

const StudentMyBus = () => {
  const navigate = useNavigate();
  return (
    <div className="student-view-wrap">
      {/* Bus info card */}
      <div style={{ background: "linear-gradient(135deg,#1e40af,#2563eb)", borderRadius: 16, padding: "24px 28px", color: "#fff", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 60, height: 60, background: "rgba(255,255,255,0.18)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BusIcon size={34} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Your Assigned Bus</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 2 }}>BUS-104</h2>
          <p style={{ opacity: 0.85, fontSize: 14 }}>Route: GSFC University ↔ Fatehgunj &nbsp;·&nbsp; Route 4D</p>
        </div>
        <span style={{ background: "#22c55e", color: "#fff", borderRadius: 20, padding: "5px 16px", fontWeight: 700, fontSize: 13 }}>● On Route</span>
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="ad-card">
          <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Bus Details</h3>
          {[
            ["Bus Number",      "BUS-104"],
            ["Registration",    "GJ-06-AB-1004"],
            ["Type",            "Volvo AC Seater"],
            ["Capacity",        "52 seats"],
            ["Current Status",  "On Route"],
            ["Fuel Level",      "72%"],
          ].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f0f2f5" }}>
              <span style={{ fontSize:12.5, color:"#7c8494" }}>{l}</span>
              <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="ad-card">
          <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Driver Details</h3>
          {[
            ["Driver Name",  "Mahesh Patel"],
            ["Driver ID",    "DRV-2024-001"],
            ["Contact",      "+91 98765 11111"],
            ["Experience",   "8 years"],
            ["Rating",       "⭐ 4.8 / 5.0"],
          ].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f0f2f5" }}>
              <span style={{ fontSize:12.5, color:"#7c8494" }}>{l}</span>
              <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          <button className="ad-btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:16 }}>
            <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 11.77a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.48 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" size={15} stroke="#fff" />
            Call Driver
          </button>
        </div>
      </div>

      {/* Live map */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Live Location</h3>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:700, color:"#22c55e", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:20, padding:"3px 10px" }}>
            <div style={{ width:7, height:7, background:"#22c55e", borderRadius:"50%", animation:"livePulse 1.4s infinite" }}/>Live
          </div>
        </div>
        <MapSVG />
        <div style={{ display:"flex", gap:20, marginTop:16, flexWrap:"wrap" }}>
          {[["Current Location","Between Nizampura & Chhani"],["Next Stop","Chhani Jakat Naka"],["Speed","42 km/h"],["ETA to Campus","~7 min"]].map(([l,v])=>(
            <div key={l}>
              <p style={{ fontSize:11, color:"#7c8494", textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</p>
              <p style={{ fontSize:14, fontWeight:700, color:"#1a1d23", marginTop:2 }}>{v}</p>
            </div>
          ))}
        </div>
        <button className="ad-btn-primary" style={{ marginTop:14 }} onClick={() => navigate("/student/tracking")}>
          <Icon d="M5 3l14 9-14 9V3z" size={15} stroke="#fff" />Open Full Tracking
        </button>
      </div>

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};
export default StudentMyBus;
