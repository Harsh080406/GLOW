import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { API_BASE_URL } from "../../../shared/context/TransitContext";
import { OFFICIAL_GSFC_ROUTES_2026 } from "../../../shared/data/officialRoutes2026";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentSchedule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("allRoutes");
  const [routeSearch, setRouteSearch] = useState("");
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState(null);

  const weeklySchedule = [
    { day: "Monday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Tuesday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Wednesday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Thursday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Friday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Saturday", morning: "07:45 AM → 08:15 AM", evening: "01:30 PM → 02:20 PM", bus: "BUS-104", status: "Half Day" },
    { day: "Sunday", morning: "--", evening: "--", bus: "--", status: "No Service (Holiday)" },
  ];

  const [downloading, setDownloading] = useState(false);

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

  const generateClientTimetablePdfBlob = async (scheduleType = "regular") => {
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

    // Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderWidth: 1.5,
      borderColor: rgb(0.12, 0.45, 0.38),
      color: rgb(0.99, 1, 0.99),
    });

    // Header Banner
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

    page.drawText(sanitize(`OFFICIAL TRANSIT TIMETABLE & SHIFT SCHEDULE (${scheduleType.toUpperCase()} MODE)`), {
      x: 36,
      y: height - 74,
      size: 10.5,
      font,
      color: rgb(0.85, 0.96, 0.92),
    });

    page.drawText("Vigyan Bhavan, Fertilizernagar, Vadodara - 391750 · Academic Year 2026-2027", {
      x: 36,
      y: height - 92,
      size: 8.5,
      font,
      color: rgb(0.7, 0.88, 0.82),
    });

    // Student & Route Info Box
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

    page.drawText(sanitize("Student Name: Rahul Sharma"), { x: 48, y: y - 8, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.15) });
    page.drawText(sanitize("Enrollment ID: GSFC20260125"), { x: 230, y: y - 8, size: 10, font, color: rgb(0.2, 0.3, 0.25) });
    page.drawText(sanitize("Assigned Bus: BUS-104 (Volvo 9600)"), { x: 400, y: y - 8, size: 10, font: fontBold, color: rgb(0.08, 0.38, 0.32) });

    page.drawText(sanitize("Route Corridor: R-04 (Fatehgunj <-> GSFC University)"), { x: 48, y: y - 26, size: 10, font, color: rgb(0.2, 0.3, 0.25) });
    page.drawText(sanitize("Boarding Stop: Fatehgunj Bus Stop (07:45 AM)"), { x: 330, y: y - 26, size: 10, font: fontBold, color: rgb(0.1, 0.45, 0.35) });

    // Section 1: Daily Schedule
    y -= 62;
    page.drawText("1. TODAY'S DAILY TRANSIT TIMETABLE & STOP SEQUENCE", {
      x: 36,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.08, 0.38, 0.32),
    });

    y -= 18;
    page.drawRectangle({ x: 36, y: y - 4, width: width - 72, height: 18, color: rgb(0.85, 0.94, 0.88) });
    page.drawText("Trip #1 · Morning Pickup: Fatehgunj Bus Stop -> GSFC University Campus Gate", {
      x: 44,
      y: y + 1,
      size: 9,
      font: fontBold,
      color: rgb(0.08, 0.42, 0.25),
    });

    const morningStops = [
      { time: "07:45 AM", stop: "Fatehgunj Bus Stop", role: "Primary Pickup Stop (Your Stop)" },
      { time: "07:50 AM", stop: "Nizampura Char Rasta", role: "Intermediate Stop" },
      { time: "07:56 AM", stop: "Chhani Jakat Naka", role: "Intermediate Stop" },
      { time: "08:04 AM", stop: "Fertilizernagar Gate", role: "Intermediate Stop" },
      { time: "08:15 AM", stop: "GSFC University Campus Bus Bay", role: "Final Campus Drop" },
    ];

    y -= 14;
    morningStops.forEach((s) => {
      page.drawText(sanitize(s.time), { x: 48, y, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.2) });
      page.drawText(sanitize(s.stop), { x: 130, y, size: 8.5, font, color: rgb(0.15, 0.2, 0.2) });
      page.drawText(sanitize(s.role), { x: 350, y, size: 8, font, color: rgb(0.4, 0.5, 0.45) });
      y -= 15;
    });

    y -= 4;
    page.drawRectangle({ x: 36, y: y - 4, width: width - 72, height: 18, color: rgb(0.88, 0.92, 0.98) });
    page.drawText("Trip #2 · Evening Return: GSFC University Campus -> Fatehgunj Bus Stop", {
      x: 44,
      y: y + 1,
      size: 9,
      font: fontBold,
      color: rgb(0.15, 0.3, 0.65),
    });

    const eveningStops = [
      { time: "05:00 PM", stop: "GSFC University Campus Bus Bay", role: "Campus Boarding" },
      { time: "05:35 PM", stop: "Fatehgunj Bus Stop", role: "Your Destination Drop" },
    ];

    y -= 14;
    eveningStops.forEach((s) => {
      page.drawText(sanitize(s.time), { x: 48, y, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.2) });
      page.drawText(sanitize(s.stop), { x: 130, y, size: 8.5, font, color: rgb(0.15, 0.2, 0.2) });
      page.drawText(sanitize(s.role), { x: 350, y, size: 8, font, color: rgb(0.4, 0.5, 0.45) });
      y -= 15;
    });

    // Section 2: Weekly Shift Table
    y -= 10;
    page.drawText("2. WEEKLY OPERATIONAL SHIFTS & ROTATIONS", {
      x: 36,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.08, 0.38, 0.32),
    });

    y -= 18;
    page.drawRectangle({ x: 36, y: y - 5, width: width - 72, height: 20, color: rgb(0.12, 0.45, 0.38) });
    page.drawText("Day", { x: 48, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Morning Slot", { x: 140, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Evening Slot", { x: 270, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Assigned Shuttle", { x: 400, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Status", { x: 495, y: y + 1, size: 9, font: fontBold, color: rgb(1, 1, 1) });

    const weeklyRows = [
      { day: "Monday", morning: "07:45 AM -> 08:15 AM", evening: "05:00 PM -> 05:50 PM", bus: "BUS-104", status: "Regular Service" },
      { day: "Tuesday", morning: "07:45 AM -> 08:15 AM", evening: "05:00 PM -> 05:50 PM", bus: "BUS-104", status: "Regular Service" },
      { day: "Wednesday", morning: "07:45 AM -> 08:15 AM", evening: "05:00 PM -> 05:50 PM", bus: "BUS-104", status: "Regular Service" },
      { day: "Thursday", morning: "07:45 AM -> 08:15 AM", evening: "05:00 PM -> 05:50 PM", bus: "BUS-104", status: "Regular Service" },
      { day: "Friday", morning: "07:45 AM -> 08:15 AM", evening: "05:00 PM -> 05:50 PM", bus: "BUS-104", status: "Regular Service" },
      { day: "Saturday", morning: "07:45 AM -> 08:15 AM", evening: "01:30 PM -> 02:20 PM", bus: "BUS-104", status: "Half Day Slot" },
      { day: "Sunday", morning: "--", evening: "--", bus: "--", status: "Holiday (No Service)" },
    ];

    y -= 14;
    weeklyRows.forEach((w, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        page.drawRectangle({ x: 36, y: y - 3, width: width - 72, height: 16, color: rgb(0.96, 0.98, 0.97) });
      }
      page.drawText(sanitize(w.day), { x: 48, y, size: 8.5, font: fontBold, color: rgb(0.1, 0.15, 0.15) });
      page.drawText(sanitize(w.morning), { x: 140, y, size: 8, font, color: rgb(0.2, 0.25, 0.25) });
      page.drawText(sanitize(w.evening), { x: 270, y, size: 8, font, color: rgb(0.2, 0.25, 0.25) });
      page.drawText(sanitize(w.bus), { x: 400, y, size: 8, font: fontBold, color: rgb(0.08, 0.38, 0.32) });
      page.drawText(sanitize(w.status), { x: 495, y, size: 8, font, color: w.status.includes("Holiday") ? rgb(0.7, 0.2, 0.2) : rgb(0.1, 0.5, 0.2) });
      y -= 17;
    });

    // Section 3: Exam and Special Notice
    y -= 10;
    page.drawRectangle({
      x: 36,
      y: y - 48,
      width: width - 72,
      height: 52,
      color: rgb(0.99, 0.98, 0.92),
      borderWidth: 1,
      borderColor: rgb(0.9, 0.85, 0.6),
    });

    page.drawText("EXAMINATION PERIOD & SPECIAL PROTOCOLS", {
      x: 48,
      y: y - 8,
      size: 9.5,
      font: fontBold,
      color: rgb(0.55, 0.35, 0.05),
    });
    page.drawText("Special examination shuttles operate at 08:00 AM sharp for 09:00 AM session slots and return at 01:30 PM & 05:30 PM.", {
      x: 48,
      y: y - 22,
      size: 8,
      font,
      color: rgb(0.4, 0.3, 0.1),
    });
    page.drawText("Boarding requires a valid GLOW Digital Pass or NFC Student ID. For route inquiries: transit@gsfcuni.edu.in", {
      x: 48,
      y: y - 36,
      size: 8,
      font,
      color: rgb(0.4, 0.3, 0.1),
    });

    // Verification Footer
    page.drawText("Generated via GLOW Campus Transit OS · GSFC University Transportation Cell · Vadodara - 391750", {
      x: 36,
      y: 35,
      size: 8,
      font,
      color: rgb(0.45, 0.55, 0.5),
    });
    page.drawText(`Document Ref: TT-${Date.now().toString().slice(-8)} · Valid: 2026-2027`, {
      x: 380,
      y: 35,
      size: 8,
      font: fontBold,
      color: rgb(0.45, 0.55, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const handleDownloadTimetablePdf = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (downloading) return;
    setDownloading(true);
    const type = activeTab === "exam" ? "exam" : "regular";
    const filename = `GSFC_University_Timetable_${type}.pdf`;

    try {
      const token = localStorage.getItem("glow_access_token") || "";
      const res = await fetch(`${API_BASE_URL}/student/me/schedule/pdf?type=${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/pdf")) {
        const blob = await res.blob();
        triggerDownload(blob, filename);
        setDownloadSuccessMsg(`✓ Timetable PDF (${type.toUpperCase()}) downloaded successfully`);
        setTimeout(() => setDownloadSuccessMsg(null), 3500);
        return;
      }
      throw new Error(`Server returned ${res.status} (${contentType || "non-pdf response"})`);
    } catch (err) {
      console.warn("Backend schedule PDF route unreachable or mock mode, synthesizing client timetable PDF:", err);
      try {
        const clientBlob = await generateClientTimetablePdfBlob(type);
        triggerDownload(clientBlob, filename);
        setDownloadSuccessMsg(`✓ Timetable PDF (${type.toUpperCase()}) downloaded successfully`);
        setTimeout(() => setDownloadSuccessMsg(null), 3500);
      } catch (clientErr) {
        console.error("Client timetable PDF generation failed:", clientErr);
        alert("Could not generate timetable PDF. Please try again.");
      }
    } finally {
      setDownloading(false);
    }
  };

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

      {/* HEADER WITH PDF DOWNLOAD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { id: "allRoutes", label: "Official 13 Routes (2026-27)" },
            { id: "daily", label: "My Assigned Schedule" },
            { id: "weekly", label: "Weekly Schedule" },
            { id: "exam", label: "Special Exam Timings" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 24,
                border: `1.5px solid ${activeTab === t.id ? "#2563eb" : "#e2e8f0"}`,
                background: activeTab === t.id ? "#2563eb" : "#fff",
                color: activeTab === t.id ? "#fff" : "#475569",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          className="ad-btn-primary"
          onClick={handleDownloadTimetablePdf}
          disabled={downloading}
          style={{ minHeight: 44, opacity: downloading ? 0.75 : 1, flex: "1 1 220px", justifyContent: "center" }}
        >
          <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />
          {downloading ? "Downloading PDF..." : "Download Timetable PDF"}
        </button>
      </div>

      {/* OFFICIAL 13 ROUTES (2026-27) */}
      {activeTab === "allRoutes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Official Document Banner */}
          <div style={{
            background: "#fef08a",
            border: "1.5px solid #eab308",
            borderRadius: 12,
            padding: "14px 20px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "#713f12", letterSpacing: "1px", textTransform: "uppercase" }}>
              GSFC UNIVERSITY STUDENTS ROUTES 2026-27
            </h2>
            <p style={{ fontSize: 12, color: "#854d0e", marginTop: 4, fontWeight: 600 }}>
              Official Fleet Allocation & Corridor Timetable · Tap any bus to track its real-time GPS location
            </p>
          </div>

          {/* Search Bar */}
          <div className="ad-card" style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 16 }}>🔍</span>
              <input
                type="text"
                placeholder="Search by stop (e.g. Amit Nagar, Chhani, Polo Ground, Tulsidham, Earth Icon, Akshar Chowk) or Bus No..."
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                  minWidth: 260,
                  outline: "none"
                }}
              />
              {routeSearch && (
                <button
                  onClick={() => setRouteSearch("")}
                  style={{ background: "#e2e8f0", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 13 Routes Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {OFFICIAL_GSFC_ROUTES_2026
              .filter((rt) => {
                const q = routeSearch.toLowerCase();
                if (!q) return true;
                const matchName = rt.displayName.toLowerCase().includes(q);
                const matchBus = rt.busNo.toLowerCase().includes(q);
                const matchRouteNum = `route ${rt.routeNumber}`.includes(q);
                const matchStops = rt.stops.some((s) => s.name.toLowerCase().includes(q));
                return matchName || matchBus || matchRouteNum || matchStops;
              })
              .map((rt) => (
                <div key={rt.routeId} className="ad-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
                  <div>
                    {/* Route Header */}
                    <div style={{
                      background: "#e0f2fe",
                      border: "1px solid #bae6fd",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10
                    }}>
                      <strong style={{ fontSize: 13, color: "#0369a1", fontWeight: 800 }}>
                        ROUTE - {rt.routeNumber}
                      </strong>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>
                        ● On Route
                      </span>
                    </div>

                    {/* Bus Reg & Details */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <strong style={{ fontSize: 16, color: "#0f172a" }}>{rt.busNo}</strong>
                        {rt.busTypeNote && (
                          <span style={{ marginLeft: 8, fontSize: 10, background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
                            {rt.busTypeNote}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>
                        Driver: {rt.driverName}
                      </span>
                    </div>

                    {/* Stops List */}
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                        Corridor Checkpoints ({rt.stops.length} Stops)
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {rt.stops.map((stop, sIdx) => {
                          const isDest = stop.isDestination || sIdx === rt.stops.length - 1;
                          const isMatched = routeSearch && stop.name.toLowerCase().includes(routeSearch.toLowerCase());
                          return (
                            <div
                              key={sIdx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: 12,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: isMatched ? "#fef08a" : isDest ? "#f0fdf4" : "#f8fafc",
                                border: isMatched ? "1px solid #eab308" : isDest ? "1px solid #bbf7d0" : "1px solid transparent"
                              }}
                            >
                              <span style={{ fontWeight: isDest ? 800 : isMatched ? 700 : 500, color: isDest ? "#166534" : "#1e293b" }}>
                                {sIdx + 1}. {stop.name}
                              </span>
                              <span style={{ fontSize: 11, color: isDest ? "#166534" : "#64748b", fontWeight: 600 }}>
                                {stop.time || "Scheduled"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, display: "flex", gap: 8 }}>
                    <button
                      className="ad-btn-primary"
                      style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}
                      onClick={() => navigate(`/student/tracking?route=${rt.routeId}`)}
                    >
                      <Icon d="M5 3l14 9-14 9V3z" size={13} stroke="#fff" />
                      Track Live Bus ({rt.busNo})
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Official Document Remarks */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 12,
            color: "#64748b",
            fontStyle: "italic",
            textAlign: "center"
          }}>
            REMARKS: Management reserves right to change the routes as per requirements.
          </div>
        </div>
      )}

      {/* DAILY VIEW */}
      {activeTab === "daily" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div className="ad-card" style={{ borderLeft: "4px solid #22c55e" }}>
            <div className="ad-card-header">
              <div>
                <span className="ad-badge ad-badge--green">Morning Pickup</span>
                <h3 className="ad-card-title" style={{ marginTop: 6 }}>Trip #1 · Fatehgunj → GSFC University</h3>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>07:45 AM</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {[
                { time: "07:45 AM", stop: "Fatehgunj Bus Stop", desc: "First Pickup (Your Stop)", isYours: true },
                { time: "07:50 AM", stop: "Nizampura Char Rasta", desc: "Stop 2" },
                { time: "07:56 AM", stop: "Chhani Jakat Naka", desc: "Stop 3" },
                { time: "08:04 AM", stop: "Fertilizernagar Gate", desc: "Stop 4" },
                { time: "08:15 AM", stop: "GSFC University Campus Bus Bay", desc: "Final Campus Drop" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: s.isYours ? "#eff6ff" : "#f8fafc", borderRadius: 8, border: s.isYours ? "1px solid #bfdbfe" : "none" }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: s.isYours ? 800 : 600, color: s.isYours ? "#1d4ed8" : "#1e293b" }}>{s.stop}</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{s.desc}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.isYours ? "#1d4ed8" : "#475569" }}>{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ad-card" style={{ borderLeft: "4px solid #3b82f6" }}>
            <div className="ad-card-header">
              <div>
                <span className="ad-badge ad-badge--blue">Evening Return</span>
                <h3 className="ad-card-title" style={{ marginTop: 6 }}>Trip #2 · GSFC University → Fatehgunj</h3>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2563eb" }}>05:00 PM</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {[
                { time: "05:00 PM", stop: "GSFC University Campus Bus Bay", desc: "Campus Boarding" },
                { time: "05:35 PM", stop: "Fatehgunj Bus Stop", desc: "Your Drop Off", isYours: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: s.isYours ? "#eff6ff" : "#f8fafc", borderRadius: 8 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: s.isYours ? 800 : 600, color: s.isYours ? "#1d4ed8" : "#1e293b" }}>{s.stop}</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{s.desc}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {activeTab === "weekly" && (
        <div className="ad-card">
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Day</th>
                  <th className="ad-th">Morning Departure</th>
                  <th className="ad-th">Evening Departure</th>
                  <th className="ad-th">Assigned Bus</th>
                  <th className="ad-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((w, i) => (
                  <tr key={i} className="ad-tr">
                    <td className="ad-td" style={{ fontWeight: 700 }}>{w.day}</td>
                    <td className="ad-td">{w.morning}</td>
                    <td className="ad-td">{w.evening}</td>
                    <td className="ad-td" style={{ fontWeight: 700, color: "#2563eb" }}>{w.bus}</td>
                    <td className="ad-td">
                      <span className={`ad-badge ${w.status === "Regular" ? "ad-badge--green" : w.status === "Half Day" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXAM TIMINGS */}
      {activeTab === "exam" && (
        <div className="ad-card" style={{ background: "#fffbf0", border: "1px solid #fef3c7" }}>
          <h3 className="ad-card-title" style={{ color: "#92400e", marginBottom: 8 }}>Mid-Sem & End-Sem Exam Transit Timings</h3>
          <p style={{ fontSize: 13, color: "#b45309", marginBottom: 16 }}>Special examination shuttles operate at 08:00 AM for 09:00 AM exam shifts and return at 01:30 PM.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <span className="ad-badge ad-badge--yellow">Exam Special Shuttle Active</span>
          </div>
        </div>
      )}

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentSchedule;
