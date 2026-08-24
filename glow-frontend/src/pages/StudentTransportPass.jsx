import StudentLayout from "../components/StudentLayout";
import { useTransit } from "../context/TransitContext";
import "../pages/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* QR Code mock */
const QRCode = () => (
  <svg viewBox="0 0 100 100" width="120" height="120" style={{ display:"block", margin:"0 auto" }}>
    <rect width="100" height="100" fill="#fff"/>
    {/* QR pattern mock */}
    {[[5,5,28,28],[67,5,28,28],[5,67,28,28]].map(([x,y,w,h],i)=>(
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill="#1a1d23" rx="2"/>
        <rect x={x+4} y={y+4} width={w-8} height={h-8} fill="#fff" rx="1"/>
        <rect x={x+8} y={y+8} width={w-16} height={h-16} fill="#1a1d23" rx="1"/>
      </g>
    ))}
    {[38,44,50,56,62].map((x,i)=>[38,44,50,56,62].map((y,j)=>(
      (i+j)%2===0 && <rect key={`${i}${j}`} x={x} y={y} width={5} height={5} fill="#1a1d23" rx="0.5"/>
    )))}
    {[72,78,84].map((y,i)=>[5,11,17].map((x,j)=>(
      (i+j)%3!==1 && <rect key={`r${i}${j}`} x={x} y={y} width={5} height={5} fill="#1a1d23" rx="0.5"/>
    )))}
    {[72,78,84].map((x,i)=>[38,44,50].map((y,j)=>(
      (i+j)%2===0 && <rect key={`c${i}${j}`} x={x} y={y} width={5} height={5} fill="#1a1d23" rx="0.5"/>
    )))}
  </svg>
);

const StudentTransportPass = () => {
  const { currentStudent } = useTransit();
  const studentName = currentStudent?.name || "Rahul Sharma";
  const studentId = currentStudent?.id || "UNI20260125";
  const studentInitials = currentStudent?.avatar ||
    studentName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  return (
    <StudentLayout title="Transport Pass" subtitle="Your digital bus pass">
      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:20, alignItems:"start" }}>

        {/* The pass card */}
        <div style={{ background:"linear-gradient(145deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)", borderRadius:20, padding:"28px 24px", color:"#fff", boxShadow:"0 8px 32px rgba(30,64,175,0.35)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div>
              <p style={{ fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.6)", textTransform:"uppercase" }}>GLOW — University Transit</p>
              <p style={{ fontSize:16, fontWeight:800, marginTop:4 }}>TRANSPORT PASS</p>
            </div>
            <div style={{ width:40, height:40, background:"rgba(255,255,255,0.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d="M20 12V22H4V12M22 7H2v5h20V7z" size={22} stroke="#fff" />
            </div>
          </div>

          <div style={{ display:"flex", gap:14, marginBottom:22, alignItems:"center" }}>
            <div style={{ width:52, height:52, background:"rgba(255,255,255,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18 }}>{studentInitials}</div>
            <div>
              <p style={{ fontWeight:700, fontSize:17 }}>{studentName}</p>
              <p style={{ fontSize:12, opacity:0.75, marginTop:2 }}>ID: {studentId}</p>
              <p style={{ fontSize:12, opacity:0.75 }}>B.Tech Computer Science · 3rd Year</p>
            </div>
          </div>

          {[["Route","R-04 — University → Chandkheda"],["Pickup Stop","Chandkheda Bus Stop"],["Pass ID",currentStudent?.passId || "PASS-STU-2026-0125"],["Valid From","01 Jun 2026"],["Valid Until","31 May 2027"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize:11.5, opacity:0.7 }}>{l}</span>
              <span style={{ fontSize:12.5, fontWeight:600 }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop:22, background:"rgba(255,255,255,0.98)", borderRadius:14, padding:"16px", textAlign:"center" }}>
            <QRCode />
            <p style={{ fontSize:11, color:"#374151", marginTop:8, fontWeight:600 }}>Scan to verify pass</p>
            <p style={{ fontSize:10, color:"#7c8494", marginTop:2 }}>{currentStudent?.passId || "PASS-STU-2026-0125"}</p>
          </div>

          <div style={{ display:"flex", justifyContent:"center", marginTop:16 }}>
            <span style={{ background:"#22c55e", color:"#fff", borderRadius:20, padding:"5px 20px", fontWeight:800, fontSize:13, letterSpacing:0.5 }}>● ACTIVE</span>
          </div>
        </div>

        {/* Info side */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="ad-card">
            <h3 className="ad-card-title" style={{ marginBottom:14 }}>Pass Summary</h3>
            {[["Status","Active","green"],["Pass Type","Annual Student Pass",""],["Issue Date","01 Jun 2026",""],["Expiry Date","31 May 2027",""],["Days Remaining","282 days",""],["Zone","Zone B",""]].map(([l,v,c])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f0f2f5" }}>
                <span style={{ fontSize:13, color:"#7c8494" }}>{l}</span>
                <span style={{ fontSize:13.5, fontWeight:700, color: c==="green"?"#16a34a":"#1a1d23" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="ad-card">
            <h3 className="ad-card-title" style={{ marginBottom:12 }}>Actions</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button className="ad-btn-primary" style={{ justifyContent:"center" }}>
                <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />Download Pass PDF
              </button>
              <button className="ad-btn-secondary" style={{ justifyContent:"center" }}>
                <Icon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" size={14} />Share Pass
              </button>
              <button className="ad-btn-secondary" style={{ justifyContent:"center" }}>
                <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" size={14} />Request Renewal
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </StudentLayout>
  );
};

export default StudentTransportPass;
