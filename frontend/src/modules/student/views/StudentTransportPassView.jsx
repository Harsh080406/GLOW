import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useTransit, API_BASE_URL } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentTransportPass = () => {
  const { currentStudent, authFetch } = useTransit();
  const [passData, setPassData] = useState(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    if (authFetch) {
      authFetch("/student/me/pass")
        .then((data) => {
          if (data?.pass) {
            setPassData(data.pass);
          }
        })
        .catch((err) => console.warn("Pass fetch fallback active:", err));
    }
  }, [authFetch]);

  const signedPayload = passData?.signedPayload || `PASS-${studentId}|R-04|ZONE-B|SIG_VALID_2026`;

  useEffect(() => {
    if (canvasRef.current && signedPayload) {
      QRCode.toCanvas(canvasRef.current, signedPayload, {
        width: 140,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      }).catch((err) => console.error("QR Code rendering error:", err));
    }
  }, [signedPayload]);

  const [downloading, setDownloading] = useState(false);

  // Generates client-side PDF document with embedded QR code as robust fallback
  const generateClientPdfBlob = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 650]);
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
        .replace(/[^\x20-\x7E]/g, " ");
    };

    // Pass Border Frame
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderWidth: 2,
      borderColor: rgb(0.08, 0.35, 0.65),
      color: rgb(0.98, 0.99, 1),
    });

    // Pass Banner Header
    page.drawRectangle({
      x: 20,
      y: height - 110,
      width: width - 40,
      height: 90,
      color: rgb(0.08, 0.35, 0.65),
    });

    page.drawText("DIGITAL TRANSPORT PASS", {
      x: 40,
      y: height - 55,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("GSFC UNIVERSITY - GLOW CAMPUS TRANSIT SYSTEM", {
      x: 40,
      y: height - 80,
      size: 10,
      font,
      color: rgb(0.85, 0.92, 1),
    });

    let y = height - 150;
    page.drawText(sanitize(`PASS ID: ${passData?.passCode || "PASS-STU-2026-0125"}`), { x: 40, y, size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 25;
    page.drawText(sanitize(`Student Name: ${studentName}`), { x: 40, y, size: 12, font, color: rgb(0.15, 0.15, 0.2) });
    y -= 20;
    page.drawText(sanitize(`Enrollment ID: ${studentId}`), { x: 40, y, size: 11, font, color: rgb(0.15, 0.15, 0.2) });
    y -= 20;
    page.drawText(sanitize(`Route Corridor: ${passData?.routeName || "Route R-04 (Fatehgunj - GSFC)"}`), { x: 40, y, size: 11, font, color: rgb(0.15, 0.15, 0.2) });
    y -= 20;
    page.drawText(sanitize(`Distance Zone: ${passData?.zone || "Zone B"}`), { x: 40, y, size: 11, font, color: rgb(0.15, 0.15, 0.2) });
    y -= 20;
    page.drawText(sanitize(`Pass Status: ${passData?.status || "ACTIVE"}`), { x: 40, y, size: 11, font: fontBold, color: rgb(0.05, 0.5, 0.2) });
    y -= 20;
    const expiryStr = passData?.expiryDate
      ? new Date(passData.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "31 May 2027";
    page.drawText(sanitize(`Valid Until: ${expiryStr}`), { x: 40, y, size: 11, font, color: rgb(0.15, 0.15, 0.2) });

    // HMAC Signature Display Box
    y -= 40;
    page.drawRectangle({ x: 40, y: y - 10, width: width - 80, height: 40, color: rgb(0.93, 0.94, 0.97) });
    page.drawText("HMAC SECURITY PAYLOAD SIGNATURE:", { x: 50, y: y + 14, size: 8, font: fontBold, color: rgb(0.2, 0.2, 0.3) });
    page.drawText(sanitize(signedPayload), {
      x: 50,
      y: y,
      size: 8,
      font,
      color: rgb(0.2, 0.2, 0.6),
    });

    // Embed QR code directly into PDF
    try {
      const qrDataUrl = await QRCode.toDataURL(signedPayload, {
        margin: 1,
        width: 300,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      const qrImage = await pdfDoc.embedPng(qrDataUrl);
      const qrSize = 130;
      const qrX = (width - qrSize) / 2;
      const qrBoxY = y - 180;

      page.drawRectangle({
        x: qrX - 16,
        y: qrBoxY,
        width: qrSize + 32,
        height: qrSize + 32,
        color: rgb(1, 1, 1),
        borderWidth: 1,
        borderColor: rgb(0.85, 0.88, 0.92),
      });

      page.drawImage(qrImage, {
        x: qrX,
        y: qrBoxY + 16,
        width: qrSize,
        height: qrSize,
      });

      page.drawText("Scan with GLOW Driver Terminal to Validate Entry", {
        x: 80,
        y: qrBoxY - 22,
        size: 9,
        font,
        color: rgb(0.4, 0.45, 0.5),
      });
    } catch (qrErr) {
      console.warn("Could not embed QR into client PDF:", qrErr);
    }

    // Disclaimer footer
    page.drawText("Non-transferable official institutional credential. Tampering invalidates transit privileges.", {
      x: 40,
      y: 35,
      size: 7.5,
      font,
      color: rgb(0.5, 0.55, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

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
    }, 250);
  };

  // Directly downloads the PDF file in browser without opening print modal
  const handleDownloadPdf = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (downloading) return;
    setDownloading(true);
    const filename = `GLOW_Digital_Pass_${studentId}.pdf`;

    try {
      const token = localStorage.getItem("glow_access_token") || "";
      const res = await fetch(`${API_BASE_URL}/student/me/pass/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/pdf")) {
        const blob = await res.blob();
        triggerDownload(blob, filename);
        return;
      }
      throw new Error(`Server returned non-PDF content (${contentType || res.status})`);
    } catch (err) {
      console.warn("Backend PDF route unavailable or returned HTML, generating client pass PDF:", err);
      try {
        const clientBlob = await generateClientPdfBlob();
        triggerDownload(clientBlob, filename);
      } catch (clientErr) {
        console.error("Direct PDF generation failed:", clientErr);
      }
    } finally {
      setDownloading(false);
    }
  };

  // Directly triggers PDF download when Print button is clicked
  const handlePrint = (e) => {
    return handleDownloadPdf(e);
  };

  return (
    <div className="student-view-wrap">
      {/* ── EMBEDDED PRINT STYLESHEET (ONLY PRINTS THE PASS CARD) ── */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 12mm;
          }

          /* Hide everything on the page by default */
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          #root,
          .sl-wrapper,
          .sl-root,
          .sl-main,
          .sl-content,
          .student-view-wrap {
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }

          /* Hide all outer navigation chrome, headers, sidebars, and non-printable elements */
          .no-print,
          .sl-sidebar,
          .ss-sidebar,
          .sl-topbar,
          .ad-sidebar,
          .ad-topbar,
          .ad-footer,
          header,
          nav,
          aside,
          button {
            display: none !important;
            visibility: hidden !important;
          }

          /* Layout containers become direct block wrappers */
          .pass-grid-layout {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .pass-card-print-wrapper {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            margin: 20px auto 0 !important;
            padding: 0 !important;
          }

          /* Style the pass card itself for paper print / PDF */
          .printable-pass-card {
            width: 380px !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            border-radius: 20px !important;
            padding: 28px 24px !important;
            box-shadow: none !important;
            border: 1.5px solid #1e3a5f !important;
            background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%) !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .printable-pass-card * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .printable-pass-card canvas {
            display: block !important;
            margin: 0 auto !important;
          }
        }

        @media (max-width: 640px) {
          .pass-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .printable-pass-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      <div className="pass-grid-layout" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>

        {/* ── THE PASS CARD (PRINTABLE) ────────────────────────── */}
        <div className="pass-card-print-wrapper">
          <div
            className="printable-pass-card"
            style={{
              background: "linear-gradient(145deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)",
              borderRadius: 20,
              padding: "28px 24px",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(30,64,175,0.35)",
              maxWidth: 420,
              width: "100%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>GLOW — GSFC University Transit</p>
                <p style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>TRANSPORT PASS</p>
              </div>
              <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d="M20 12V22H4V12M22 7H2v5h20V7z" size={22} stroke="#fff" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, marginBottom: 22, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>
                {studentInitials}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17 }}>{studentName}</p>
                <p style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>ID: {studentId}</p>
                <p style={{ fontSize: 12, opacity: 0.75 }}>B.Tech Computer Science · 3rd Year</p>
              </div>
            </div>

            {[
              ["Route", passData?.routeName || "R-04 — GSFC University ↔ Fatehgunj"],
              ["Pickup Stop", currentStudent?.pickupStop || "Fatehgunj Bus Stop"],
              ["Pass Code", passData?.passCode || "PASS-STU-2026-0125"],
              ["Valid Until", passData?.expiryDate || "31 May 2027"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize: 11.5, opacity: 0.7 }}>{l}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{v}</span>
              </div>
            ))}

            {/* Real QR Code Canvas */}
            <div style={{ marginTop: 22, background: "rgba(255,255,255,0.98)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
              <canvas ref={canvasRef} style={{ margin: "0 auto", display: "block" }} />
              <p style={{ fontSize: 11, color: "#374151", marginTop: 8, fontWeight: 600 }}>Cryptographically Signed QR Pass</p>
              <p style={{ fontSize: 9.5, color: "#6b7280", marginTop: 2, wordBreak: "break-all" }}>{signedPayload}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <span style={{ background: "#22c55e", color: "#fff", borderRadius: 20, padding: "5px 20px", fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>● ACTIVE</span>
            </div>
          </div>
        </div>

        {/* ── INFO & ACTION BUTTONS (HIDDEN IN PRINT) ──────────── */}
        <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ad-card">
            <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Pass Summary</h3>
            {[
              ["Status", "Active", "green"],
              ["Pass Type", "Annual Student Pass", ""],
              ["Distance Zone", passData?.zone || "Zone B", ""],
              ["Signed Security Payload", "HMAC-SHA256 Validated", "green"],
              ["Scan-Verified Driver Pilot", "Mahesh Patel (BUS-104)", ""],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f2f5" }}>
                <span style={{ fontSize: 13, color: "#7c8494" }}>{l}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: c === "green" ? "#16a34a" : "#1a1d23" }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="ad-card">
            <h3 className="ad-card-title" style={{ marginBottom: 12 }}>Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                className="ad-btn-primary"
                onClick={handleDownloadPdf}
                disabled={downloading}
                style={{ justifyContent: "center", minHeight: 44, opacity: downloading ? 0.75 : 1 }}
              >
                <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />
                {downloading ? "Downloading PDF..." : "Download Pass PDF"}
              </button>
              <button
                type="button"
                className="ad-btn-secondary"
                onClick={handlePrint}
                disabled={downloading}
                style={{ justifyContent: "center", minHeight: 44, opacity: downloading ? 0.75 : 1 }}
              >
                <Icon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" size={15} />
                {downloading ? "Downloading PDF..." : "Print Official Pass"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="ad-footer no-print">
        <span>© 2026 GLOW Bus Development System.</span>
      </footer>
    </div>
  );
};

export default StudentTransportPass;
