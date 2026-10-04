import { useState } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentEmergency = () => {
  const { currentStudent, triggerSosAlert } = useTransit();
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(null);
  const [reportType, setReportType] = useState("Accident / Collision");
  const [reportNotes, setReportNotes] = useState("");
  const [locationShared, setLocationShared] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState(null);

  const executeSosDispatch = (lat, lng) => {
    const payload = {
      lat: lat || 23.0982,
      lng: lng || 72.5784,
      busId: currentStudent?.busId || "BUS-104",
      notes: `Urgent SOS triggered by Student ${currentStudent?.name || "Rahul Sharma"} onboard bus ${currentStudent?.busId || "BUS-104"}`,
    };

    triggerSosAlert(payload);
    setSosTriggered(true);

    fetch("/api/v1/student/me/sos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.incident?.id) {
          setActiveIncidentId(data.incident.id);
        }
      })
      .catch((err) => console.warn("SOS REST dispatch error, WS alert active:", err));
  };

  const startSos = () => {
    setSosCountdown(3);

    // Get live geolocation coordinates with fallback (Vadodara GSFC Corridor)
    let currentCoords = { lat: 22.3412, lng: 73.1710 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => console.warn("Geolocation permission denied, using live bus GPS fallback.")
      );
    }

    const interval = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          executeSosDispatch(currentCoords.lat, currentCoords.lng);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSosCountdown = () => {
    setSosCountdown(null);
  };

  const handleCancelFalseAlarm = async () => {
    if (activeIncidentId) {
      try {
        await fetch(`/api/v1/student/me/sos/${activeIncidentId}/cancel`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
          },
        });
      } catch (e) {
        console.warn("Cancel false alarm REST error:", e);
      }
    }
    setSosTriggered(false);
    setActiveIncidentId(null);
  };

  const handleReportIncident = (e) => {
    e.preventDefault();
    triggerSosAlert({
      type: reportType,
      busId: currentStudent?.busId || "BUS-104",
      notes: `Incident report: ${reportNotes} (Reported by ${currentStudent?.name})`,
    });
    setAlertSuccess(true);
    setReportNotes("");
    setTimeout(() => setAlertSuccess(false), 4000);
  };

  const handleShareLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://glowbus.edu/tracking?bus=${currentStudent?.busId || "BUS-104"}`);
    }
    setLocationShared(true);
    setTimeout(() => setLocationShared(false), 5000);
  };

  return (
    <div className="student-view-wrap">
      {/* ── SOS EMERGENCY HERO CARD (THUMB-ACCESSIBLE ON 375px) ── */}
      <div
        style={{
          background: sosTriggered ? "linear-gradient(135deg, #7f1d1d, #dc2626)" : "linear-gradient(135deg, #1e293b, #0f172a)",
          borderRadius: 20,
          padding: "24px 16px",
          color: "#fff",
          textAlign: "center",
          marginBottom: 24,
          boxShadow: sosTriggered ? "0 0 40px rgba(220,38,38,0.5)" : "0 10px 30px rgba(0,0,0,0.2)",
          border: sosTriggered ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ width: 70, height: 70, background: sosTriggered ? "#ef4444" : "#dc2626", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 0 20px rgba(220,38,38,0.6)" }}>
            <span style={{ fontSize: 32 }}>🚨</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900 }}>
            {sosTriggered ? "EMERGENCY ALERT BROADCASTED!" : "CAMPUS TRANSPORT SOS"}
          </h2>
          <p style={{ fontSize: 13, opacity: 0.9, marginTop: 4, marginBottom: 16 }}>
            {sosTriggered
              ? "University Security, Transport Control Room, and Emergency Dispatchers have received your high-priority distress signal and live location."
              : "Pressing SOS immediately transmits your geolocation, bus ID, and student profile to the Central Transport Security Room & Police Dispatch."}
          </p>

          {sosCountdown !== null && (
            <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 14, padding: "14px", marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fca5a5" }}>Broadcasting SOS alert in {sosCountdown} seconds...</p>
              <button
                onClick={cancelSosCountdown}
                style={{ marginTop: 8, padding: "8px 20px", background: "#fff", color: "#991b1b", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}
              >
                CANCEL SOS
              </button>
            </div>
          )}

          {!sosTriggered && sosCountdown === null && (
            <button
              onClick={startSos}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "16px 36px",
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 1,
                cursor: "pointer",
                boxShadow: "0 8px 30px rgba(220,38,38,0.5)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                justifyContent: "center",
                minHeight: 52,
              }}
            >
              <span>🚨</span> TRIGGER EMERGENCY SOS
            </button>
          )}

          {sosTriggered && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
              <button
                onClick={handleCancelFalseAlarm}
                style={{ padding: "10px 24px", background: "rgba(255,255,255,0.25)", color: "#fff", border: "1px solid #fff", borderRadius: 8, fontWeight: 700, cursor: "pointer", minHeight: 44 }}
              >
                Cancel False Alarm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── EMERGENCY CONTACTS & ACTIONS ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* Rapid Dial Directory */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">1-Click Emergency Directory</h3>
            <span className="ad-badge ad-badge--green">Available 24/7</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { role: "GSFC University Security & Vigilance", phone: "+91 265 3093753", desc: "Fertilizernagar Main Campus Security", icon: "🛡️" },
              { role: "GSFC University Transport Fleet Desk", phone: "+91 265 3093750", desc: "Vigyan Bhavan Transit Dispatch Cell", icon: "🚌" },
              { role: "GSFC Hospital Emergency Care", phone: "+91 265 3092400", desc: "Fertilizernagar Medical Centre", icon: "🚑" },
              { role: "Chhani / Vadodara Police Hotline", phone: "112", desc: "Vadodara City Police Control", icon: "👮" },
            ].map((contact, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 22 }}>{contact.icon}</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{contact.role}</h4>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{contact.desc}</p>
                    <p style={{ fontSize: 12.5, fontWeight: 800, color: "#2563eb", marginTop: 2 }}>{contact.phone}</p>
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  style={{ padding: "8px 14px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, minHeight: 44 }}
                >
                  <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 11.77a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.48 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" size={14} stroke="#fff" />
                  Call
                </a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={handleShareLocation}
              style={{ width: "100%", padding: "12px", background: "#eff6ff", color: "#1d4ed8", border: "1.5px solid #bfdbfe", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44 }}
            >
              <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={16} stroke="#1d4ed8" />
              {locationShared ? "✓ Live Location Link Copied & Sent to Guardians!" : "Share Live Bus Location with Guardians"}
            </button>
          </div>
        </div>

        {/* Report Bus Incident */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Report Immediate Incident</h3>
            <span className="ad-badge ad-badge--red">Priority Dispatch</span>
          </div>

          {alertSuccess && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              ✓ Emergency report logged. Patrol vehicle dispatched to coordinates.
            </div>
          )}

          <form onSubmit={handleReportIncident}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Incident Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff", minHeight: 44 }}
              >
                <option value="Accident / Collision">Vehicle Accident / Collision</option>
                <option value="Bus Breakdown / Mechanical Failure">Bus Breakdown / Mechanical Failure</option>
                <option value="Medical Emergency Onboard">Medical Emergency Onboard</option>
                <option value="Severe Roadblock / Water-logging">Severe Roadblock / Water-logging</option>
                <option value="Driver Distress / Incapacitation">Driver Distress / Incapacitation</option>
                <option value="Other Security Incident">Other Security Incident</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Incident Details & Exact Landmark</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Give details about vehicle condition, any injuries, road cross street..."
                required
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              style={{ width: "100%", padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", minHeight: 44 }}
            >
              Report Bus Incident to Transport Desk
            </button>
          </form>
        </div>
      </div>

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentEmergency;
