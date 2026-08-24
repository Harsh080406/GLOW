import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import "../pages/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const STOPS = [
  { num: "S", name: "Chandkheda Bus Stop",      time: "07:45 AM", dist: "0 km",   yours: false, tag: "START" },
  { num: "2", name: "New Ranip",                time: "07:50 AM", dist: "2.1 km", yours: false, tag: null },
  { num: "3", name: "Sabarmati Bridge",         time: "07:55 AM", dist: "4.3 km", yours: false, tag: null },
  { num: "4", name: "Motera Stadium",           time: "08:00 AM", dist: "6.8 km", yours: true,  tag: "YOUR STOP" },
  { num: "5", name: "Chandlodiya Cross Roads",  time: "08:05 AM", dist: "8.5 km", yours: false, tag: null },
  { num: "E", name: "University Main Bus Bay",  time: "08:15 AM", dist: "11.2 km",yours: false, tag: "END" },
];

const RouteMapSVG = () => (
  <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #e8eaf0", position:"relative" }}>
    <svg viewBox="0 0 680 160" style={{ width:"100%", height:"auto", display:"block" }}>
      <rect width="680" height="160" fill="#f8fafc"/>
      <rect x="0" y="55" width="680" height="22" fill="#fff" opacity="0.7"/>
      <rect x="0" y="105" width="680" height="16" fill="#fff" opacity="0.6"/>
      {[[8,8,85,40],[130,8,100,40],[265,8,100,40],[400,8,100,40],[535,8,130,40],
        [8,85,85,14],[130,85,100,14],[265,85,100,14],[400,85,100,14],[535,85,130,14],
        [8,128,85,28],[130,128,100,28],[265,128,100,28],[400,128,100,28],[535,128,130,28]].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#e2e8f0" opacity="0.8"/>
      ))}
      <line x1="50" y1="66" x2="630" y2="66" stroke="#0066ff" strokeWidth="3" strokeLinecap="round"/>
      {[50,165,295,420,558,630].map((cx,i)=>(
        <circle key={i} cx={cx} cy="66" r={i===0||i===5?8:i===3?10:6}
          fill={i===3?"#0066ff":i===0?"#0066ff":i===5?"#0f172a":"#fff"}
          stroke={i===5?"#0f172a":"#0066ff"} strokeWidth="2.5"/>
      ))}
      <text x="50" y="88" textAnchor="middle" fontSize="9" fill="#0066ff" fontWeight="700">S</text>
      <text x="165" y="88" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">2</text>
      <text x="295" y="88" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">3</text>
      <text x="420" y="88" textAnchor="middle" fontSize="9" fill="#0066ff" fontWeight="700">★4</text>
      <text x="558" y="88" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">5</text>
      <text x="630" y="88" textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="700">E</text>
      <text x="50" y="100" textAnchor="middle" fontSize="8" fill="#0066ff">Chandkheda</text>
      <text x="630" y="100" textAnchor="middle" fontSize="8" fill="#0f172a">University</text>
      <rect x="390" y="40" width="62" height="16" rx="3" fill="#0066ff" opacity="0.9"/>
      <text x="421" y="52" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">YOUR STOP</text>
    </svg>
  </div>
);

const StudentMyRoute = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("morning");
  return (
    <StudentLayout title="My Route" subtitle="Route R-04 — Chandkheda to University Campus">
      {/* Route header */}
      <div style={{ background:"#fff", border:"1px solid #e8eaf0", borderRadius:14, padding:"20px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <span style={{ fontWeight:800, fontSize:18, color:"#1a1d23" }}>Route R-04</span>
              <span className="ad-badge ad-badge--green">Active</span>
            </div>
            <p style={{ fontSize:13.5, color:"#7c8494" }}>Chandkheda Bus Stop → University Campus</p>
          </div>
          {[["Distance","11.2 km"],["Duration","~30 min"],["Stops","6"],["Bus","BUS-104"]].map(([l,v])=>(
            <div key={l} style={{ textAlign:"center", padding:"0 12px", borderLeft:"1px solid #e8eaf0" }}>
              <p style={{ fontSize:16, fontWeight:800, color:"#1a1d23" }}>{v}</p>
              <p style={{ fontSize:11, color:"#7c8494" }}>{l}</p>
            </div>
          ))}
        </div>
        <RouteMapSVG />
      </div>

      {/* Trip selector */}
      <div style={{ display:"flex", gap:8 }}>
        {[["morning","Morning Trip"],["evening","Evening Trip"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ padding:"8px 20px", border:`1.5px solid ${tab===id?"#22c55e":"#e8eaf0"}`, borderRadius:20, background:tab===id?"#22c55e":"#fff", color:tab===id?"#fff":"#5a6070", fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Stops list */}
      <div style={{ background:"#fff", border:"1px solid #e8eaf0", borderRadius:14, padding:"20px 22px" }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:"#1a1d23", marginBottom:16 }}>
          {tab==="morning" ? "Morning Stops (07:45 AM Departure)" : "Evening Stops (05:00 PM Departure)"}
        </h3>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:16, top:20, bottom:20, width:2, background:"#e8eaf0" }}/>
          {STOPS.map((stop, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"12px 0", position:"relative" }}>
              <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, zIndex:1,
                background: stop.yours?"#3b82f6": stop.num==="S"?"#22c55e": stop.num==="E"?"#ef4444":"#f4f6f9",
                border:`2px solid ${stop.yours?"#3b82f6":stop.num==="S"?"#22c55e":stop.num==="E"?"#ef4444":"#d1d5db"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700,
                color: (stop.yours||stop.num==="S"||stop.num==="E")?"#fff":"#5a6070" }}>
                {stop.num}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:14, fontWeight: stop.yours?700:600, color:"#1a1d23" }}>{stop.name}</span>
                  {stop.tag && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                    background: stop.tag==="YOUR STOP"?"#eff6ff": stop.tag==="START"?"#f0fdf4":"#fef2f2",
                    color: stop.tag==="YOUR STOP"?"#2563eb": stop.tag==="START"?"#16a34a":"#dc2626" }}>
                    {stop.tag}
                  </span>}
                </div>
                <p style={{ fontSize:12, color:"#7c8494", marginTop:2 }}>{stop.dist} from start</p>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color: stop.yours?"#2563eb":"#1a1d23", flexShrink:0 }}>
                {tab==="morning" ? stop.time : stop.time.replace("07:","05:").replace("08:","06:")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:"14px 18px", display:"flex", gap:12, alignItems:"center" }}>
        <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01" size={20} stroke="#d97706" />
        <p style={{ fontSize:13, color:"#92400e", fontWeight:500 }}>Please arrive at your stop 5 minutes before scheduled time. Route timings may vary due to traffic.</p>
      </div>

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </StudentLayout>
  );
};
export default StudentMyRoute;
