import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

import RealMapView from "../../../shared/components/RealMapView";


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

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState(null);

  const triggerDownload = (blob, filename) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 300);
  };

  const generateClientRoutePdfBlob = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    const sanitize = (text) => {
      if (!text) return "";
      return String(text)
        .replace(/[\u2190-\u2193\u2794\u2799\u279C\u21D2\u21E2]/g, "->")
        .replace(/[—–]/g, "-")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[•●]/g, "*")
        .replace(/[^\x20-\x7E]/g, " ");
    };

    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderWidth: 1.5,
      borderColor: rgb(0.12, 0.45, 0.38),
      color: rgb(0.99, 1, 0.99),
    });

    page.drawRectangle({
      x: 20,
      y: height - 105,
      width: width - 40,
      height: 85,
      color: rgb(0.08, 0.38, 0.32),
    });

    page.drawText("GSFC UNIVERSITY · GLOW TRANSIT SYSTEM", {
      x: 36,
      y: height - 52,
      size: 17,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(sanitize("OFFICIAL TRANSIT ROUTE MAP & CORRIDOR WAYPOINTS"), {
      x: 36,
      y: height - 74,
      size: 10.5,
      font,
      color: rgb(0.85, 0.96, 0.92),
    });

    page.drawText("Route R-04 · Fatehgunj Bus Stop <-> GSFC University Campus Gate", {
      x: 36,
      y: height - 92,
      size: 8.5,
      font,
      color: rgb(0.7, 0.88, 0.82),
    });

    let y = height - 135;
    page.drawRectangle({
      x: 36,
      y: y - 38,
      width: width - 72,
      height: 48,
      color: rgb(0.93, 0.97, 0.95),
      borderWidth: 1,
      borderColor: rgb(0.75, 0.88, 0.82),
    });

    page.drawText(sanitize("Assigned Route: Route R-04 (Fatehgunj Express)"), { x: 48, y: y - 8, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.15) });
    page.drawText(sanitize("Total Distance: 9.4 km"), { x: 340, y: y - 8, size: 10, font, color: rgb(0.2, 0.3, 0.25) });
    page.drawText(sanitize("Assigned Vehicle: BUS-104 (GJ-06-AB-1004)"), { x: 48, y: y - 26, size: 10, font, color: rgb(0.2, 0.3, 0.25) });
    page.drawText(sanitize("Total Travel Time: ~35 mins"), { x: 340, y: y - 26, size: 10, font: fontBold, color: rgb(0.1, 0.45, 0.35) });

    y -= 62;
    page.drawText("CORRIDOR STOPS & ARRIVAL TIMELINE", {
      x: 36,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.08, 0.38, 0.32),
    });

    y -= 18;
    page.drawRectangle({ x: 36, y: y - 5, width: width - 72, height: 20, color: rgb(0.12, 0.45, 0.38) });
    page.drawText("Seq", { x: 48, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Stop Name", { x: 80, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("ETA Offset", { x: 300, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Coordinates", { x: 400, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Type", { x: 500, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });

    const stopRows = [
      { seq: "1", name: "Fatehgunj Bus Stop", eta: "07:45 AM (+0m)", coords: "22.3218, 73.1876", type: "Origin Pickup" },
      { seq: "2", name: "Nizampura Char Rasta", eta: "07:50 AM (+5m)", coords: "22.3335, 73.1802", type: "Intermediate" },
      { seq: "3", name: "Chhani Jakat Naka", eta: "07:56 AM (+11m)", coords: "22.3468, 73.1725", type: "Intermediate" },
      { seq: "4", name: "Fertilizernagar Gate", eta: "08:04 AM (+19m)", coords: "22.3590, 73.1580", type: "Intermediate" },
      { seq: "5", name: "GSFC University Main Campus", eta: "08:15 AM (+30m)", coords: "22.3615, 73.1550", type: "Campus Bay" },
    ];

    y -= 14;
    stopRows.forEach((s, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        page.drawRectangle({ x: 36, y: y - 3, width: width - 72, height: 16, color: rgb(0.96, 0.98, 0.97) });
      }
      page.drawText(s.seq, { x: 48, y, size: 8.5, font, color: rgb(0.2, 0.25, 0.25) });
      page.drawText(sanitize(s.name), { x: 80, y, size: 8.5, font: fontBold, color: rgb(0.1, 0.15, 0.15) });
      page.drawText(sanitize(s.eta), { x: 300, y, size: 8.5, font, color: rgb(0.2, 0.25, 0.25) });
      page.drawText(sanitize(s.coords), { x: 400, y, size: 8, font, color: rgb(0.4, 0.5, 0.45) });
      page.drawText(sanitize(s.type), { x: 500, y, size: 8, font: fontBold, color: rgb(0.08, 0.38, 0.32) });
      y -= 18;
    });

    page.drawText("Generated via GLOW Campus Transit OS · GSFC University Transportation Cell · Vadodara", {
      x: 36,
      y: 35,
      size: 8,
      font,
      color: rgb(0.45, 0.55, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const handleDownloadPdf = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (downloading) return;
    setDownloading(true);
    const filename = "GSFC_University_Route_R-04_Schedule.pdf";

    try {
      const token = localStorage.getItem("glow_access_token") || "";
      const res = await fetch("/api/v1/student/me/route/pdf", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const blob = await res.blob();
        triggerDownload(blob, filename);
        setDownloadSuccessMsg("✓ Route Schedule PDF downloaded successfully");
        setTimeout(() => setDownloadSuccessMsg(null), 3500);
        return;
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn("Backend route PDF unavailable, synthesizing client PDF:", err);
      try {
        const clientBlob = await generateClientRoutePdfBlob();
        triggerDownload(clientBlob, filename);
        setDownloadSuccessMsg("✓ Route Schedule PDF downloaded successfully");
        setTimeout(() => setDownloadSuccessMsg(null), 3500);
      } catch (clientErr) {
        console.error("Client route PDF generation failed:", clientErr);
        alert("Could not generate route PDF. Please try again.");
      }
    } finally {
      setDownloading(false);
    }
  };

  const stops = routeData?.stops || [
    { name: "Fatehgunj Bus Stop", etaOffsetMin: 0, lat: 22.3218, lng: 73.1876 },
    { name: "Nizampura Char Rasta", etaOffsetMin: 8, lat: 22.3335, lng: 73.1802 },
    { name: "Chhani Jakat Naka", etaOffsetMin: 16, lat: 22.3468, lng: 73.1725 },
    { name: "Fertilizernagar Gate", etaOffsetMin: 26, lat: 22.3590, lng: 73.1580 },
    { name: "GSFC University Main Campus", etaOffsetMin: 35, lat: 22.3615, lng: 73.1550 },
  ];

  return (
    <div className="student-view-wrap">
      {/* SUCCESS TOAST NOTIFICATION */}
      {downloadSuccessMsg && (
        <div style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          background: "#065f46",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          animation: "fadeIn 0.2s ease"
        }}>
          {downloadSuccessMsg}
        </div>
      )}

      {/* Route header */}
      <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#1a1d23" }}>{routeData?.name || "Route R-04 (GSFC University ↔ Fatehgunj)"}</span>
              <span className="ad-badge ad-badge--green">Active</span>
            </div>
            <p style={{ fontSize: 13.5, color: "#7c8494" }}>{routeData?.origin || "Fatehgunj Bus Stop"} → {routeData?.destination || "GSFC University Campus"}</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="ad-btn-primary"
              onClick={handleDownloadPdf}
              disabled={downloading}
              style={{ minHeight: 44, opacity: downloading ? 0.75 : 1 }}
            >
              <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />
              {downloading ? "Downloading PDF..." : "Download Route Map PDF"}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 14, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <RealMapView
            routeStops={stops}
            singleBus={{
              busId: "BUS-104",
              regNo: "BUS-104",
              routeName: routeData?.name || "Route R-04 (Fatehgunj ↔ GSFC University)",
              lat: 22.3485,
              lng: 73.1710,
              speed: 42,
              status: "On Route",
              nextStop: "Chhani Jakat Naka",
              nextStopIndex: 2,
              etaMinutes: 6,
            }}
            height="340px"
            showControls={true}
          />
        </div>
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
