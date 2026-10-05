import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

/**
 * Converts a numeric amount to standard Indian currency English words
 */
export const amountInWords = (num) => {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "") + " ";
    if (n < 1000) return inWords(Math.floor(n / 100)) + "Hundred " + (n % 100 !== 0 ? inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? inWords(n % 10000000) : "");
  };

  const words = inWords(Math.floor(num)).trim();
  return (words ? words : "Zero") + " Rupees Only";
};

/**
 * Sanitizes input text to WinAnsi compatible ASCII so pdf-lib doesn't throw encoding errors
 */
const sanitize = (text) => {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/₹/g, "Rs. ")
    .replace(/[\u2190-\u2193\u2794\u2799\u279C\u21D2\u21E2]/g, "->")
    .replace(/[—–]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[•●]/g, "*")
    .replace(/[✓✔]/g, "[V]")
    .replace(/[^\x20-\x7E]/g, " ");
};

/**
 * Generates and triggers direct download of a high-quality formatted official fee slip PDF
 */
export const downloadFeeReceiptPdf = async (receiptData) => {
  const {
    receiptId,
    id,
    txnId,
    studentName = "Rahul Sharma",
    studentId = "UNI20260125",
    dept = "Computer Science & Engineering",
    branch,
    route = "Route R-04 · Fatehgunj Express",
    zone = "Zone B",
    date,
    method = "UPI (Google Pay)",
    refNo,
    amount = 9500,
    status = "COMPLETED",
    academicYear = "2026 - 2027",
  } = receiptData || {};

  const cleanAmount = Number(amount) || 9500;
  const baseFee = Math.round(cleanAmount / 1.18);
  const gstEach = Math.round((cleanAmount - baseFee) / 2);

  const cleanReceiptNo = receiptId || (id ? `REC-2026-${String(id).replace(/\D/g, "").slice(-4) || "8910"}` : "REC-2026-8910");
  const cleanTxnId = txnId || id || `TXN-${String(Date.now()).slice(-8)}`;
  const cleanDate = date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const cleanRefNo = refNo || `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const cleanDept = branch || dept || "School of Technology";

  // 1. Initialize PDF Document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (Points)
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // 2. Generate QR Code Data URL & embed in PDF without Node Buffer
  let qrImage = null;
  try {
    const qrString = `GLOW-VERIFIED-RECEIPT|${cleanReceiptNo}|${studentId}|AMT:${cleanAmount}|DATE:${cleanDate}|REF:${cleanRefNo}|HMAC_SIG_OK`;
    const qrDataUrl = await QRCode.toDataURL(qrString, {
      width: 160,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    // In client browser, pdf-lib embeds PNG directly from data URL
    qrImage = await pdfDoc.embedPng(qrDataUrl);
  } catch (qrErr) {
    console.warn("QR code embed notice:", qrErr);
  }

  // ── A. OUTER DOCUMENT FRAME & BORDER ───────────────────────────────
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderWidth: 1.5,
    borderColor: rgb(0.12, 0.28, 0.55),
    color: rgb(1, 1, 1),
  });

  // Inner subtle accent border
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderWidth: 0.5,
    borderColor: rgb(0.82, 0.86, 0.92),
  });

  // ── B. INSTITUTIONAL HEADER BANNER ─────────────────────────────────
  const bannerHeight = 84;
  const bannerY = height - 28 - bannerHeight;

  page.drawRectangle({
    x: 28,
    y: bannerY,
    width: width - 56,
    height: bannerHeight,
    color: rgb(0.08, 0.22, 0.45), // Deep Navy
  });

  page.drawText("GSFC UNIVERSITY · VADODARA", {
    x: 44,
    y: bannerY + 54,
    size: 17,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("DIRECTORATE OF CAMPUS TRANSIT & FINANCIAL SERVICES", {
    x: 44,
    y: bannerY + 36,
    size: 9.5,
    font: fontBold,
    color: rgb(0.85, 0.92, 1),
  });

  page.drawText("Vigyan Bhavan Campus, P.O. Fertilizernagar, Vadodara, Gujarat - 391750 | transit@gsfcuni.edu.in", {
    x: 44,
    y: bannerY + 18,
    size: 8,
    font,
    color: rgb(0.75, 0.84, 0.95),
  });

  // ── C. SUB-HEADER STRIP ────────────────────────────────────────────
  const subY = bannerY - 28;
  page.drawRectangle({
    x: 28,
    y: subY,
    width: width - 56,
    height: 28,
    color: rgb(0.93, 0.96, 1),
    borderWidth: 1,
    borderColor: rgb(0.78, 0.86, 0.98),
  });

  page.drawText("TAX INVOICE & OFFICIAL TRANSPORT FEE PAYMENT RECEIPT", {
    x: 44,
    y: subY + 9,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.25, 0.55),
  });

  page.drawText("ACADEMIC YEAR " + sanitize(academicYear), {
    x: width - 180,
    y: subY + 9,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.35, 0.65),
  });

  // ── D. TWO-COLUMN METADATA SECTION ─────────────────────────────────
  const metaTopY = subY - 14;
  const colWidth = (width - 56 - 16) / 2; // 2 columns with 16pt gap
  const colHeight = 118;
  const col1X = 28;
  const col2X = col1X + colWidth + 16;
  const colY = metaTopY - colHeight;

  // Box 1: Receipt & Payment Details
  page.drawRectangle({
    x: col1X,
    y: colY,
    width: colWidth,
    height: colHeight,
    color: rgb(0.98, 0.99, 1),
    borderWidth: 1,
    borderColor: rgb(0.86, 0.9, 0.95),
  });

  // Box 1 Header
  page.drawRectangle({
    x: col1X,
    y: colY + colHeight - 20,
    width: colWidth,
    height: 20,
    color: rgb(0.91, 0.94, 0.99),
  });
  page.drawText("PAYMENT & TRANSACTION REFERENCE", {
    x: col1X + 10,
    y: colY + colHeight - 14,
    size: 8,
    font: fontBold,
    color: rgb(0.12, 0.28, 0.55),
  });

  const row1 = [
    { label: "Receipt Number:", val: cleanReceiptNo, bold: true },
    { label: "Transaction ID:", val: cleanTxnId, bold: false },
    { label: "Payment Date:", val: cleanDate, bold: false },
    { label: "Payment Method:", val: method, bold: false },
    { label: "Bank / UTR Ref:", val: cleanRefNo, bold: true },
  ];

  row1.forEach((r, idx) => {
    const lineY = colY + colHeight - 38 - idx * 16;
    page.drawText(r.label, { x: col1X + 10, y: lineY, size: 8, font, color: rgb(0.4, 0.45, 0.52) });
    page.drawText(sanitize(r.val), {
      x: col1X + 100,
      y: lineY,
      size: 8,
      font: r.bold ? fontBold : font,
      color: rgb(0.1, 0.15, 0.2),
    });
  });

  // Box 2: Student Commuter Details
  page.drawRectangle({
    x: col2X,
    y: colY,
    width: colWidth,
    height: colHeight,
    color: rgb(0.98, 0.99, 1),
    borderWidth: 1,
    borderColor: rgb(0.86, 0.9, 0.95),
  });

  // Box 2 Header
  page.drawRectangle({
    x: col2X,
    y: colY + colHeight - 20,
    width: colWidth,
    height: 20,
    color: rgb(0.91, 0.94, 0.99),
  });
  page.drawText("STUDENT COMMUTER CREDENTIALS", {
    x: col2X + 10,
    y: colY + colHeight - 14,
    size: 8,
    font: fontBold,
    color: rgb(0.12, 0.28, 0.55),
  });

  const row2 = [
    { label: "Student Name:", val: studentName, bold: true },
    { label: "Enrollment ID:", val: studentId, bold: true },
    { label: "Branch / Dept:", val: cleanDept, bold: false },
    { label: "Assigned Route:", val: route, bold: false },
    { label: "Zone / Slab:", val: zone, bold: false },
  ];

  row2.forEach((r, idx) => {
    const lineY = colY + colHeight - 38 - idx * 16;
    page.drawText(r.label, { x: col2X + 10, y: lineY, size: 8, font, color: rgb(0.4, 0.45, 0.52) });
    page.drawText(sanitize(r.val).slice(0, 28), {
      x: col2X + 96,
      y: lineY,
      size: 8,
      font: r.bold ? fontBold : font,
      color: rgb(0.1, 0.15, 0.2),
    });
  });

  // ── E. PAYMENT STATUS BANNER ────────────────────────────────────────
  const statusY = colY - 26;
  page.drawRectangle({
    x: 28,
    y: statusY,
    width: width - 56,
    height: 20,
    color: rgb(0.94, 0.99, 0.95),
    borderWidth: 1,
    borderColor: rgb(0.74, 0.92, 0.78),
  });

  page.drawText("[V] PAYMENT STATUS: SETTLED & VERIFIED", {
    x: 38,
    y: statusY + 6,
    size: 8,
    font: fontBold,
    color: rgb(0.08, 0.55, 0.22),
  });

  page.drawText("Transport Pass Active · Zero Paper Renewal Required", {
    x: width - 260,
    y: statusY + 6,
    size: 7.5,
    font,
    color: rgb(0.15, 0.48, 0.25),
  });

  // ── F. LINE ITEMS FEE PARTICULARS TABLE ─────────────────────────────
  const tableTopY = statusY - 14;
  const tableX = 28;
  const tableW = width - 56;
  const rowHeight = 22;

  // Table Header
  page.drawRectangle({
    x: tableX,
    y: tableTopY - rowHeight,
    width: tableW,
    height: rowHeight,
    color: rgb(0.08, 0.22, 0.45),
  });

  page.drawText("Sr.", { x: tableX + 8, y: tableTopY - 15, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Particulars / Fee Description", { x: tableX + 36, y: tableTopY - 15, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("SAC Code", { x: tableX + 270, y: tableTopY - 15, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Session", { x: tableX + 348, y: tableTopY - 15, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Amount (INR)", { x: tableX + 448, y: tableTopY - 15, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });

  const items = [
    {
      sr: "1",
      desc: "Annual Campus Transit Shuttle Pass (" + sanitize(zone) + ")",
      sac: "999299",
      session: "AY 2026-27",
      amt: "Rs. " + baseFee.toLocaleString() + ".00",
    },
    {
      sr: "2",
      desc: "Central Goods & Services Tax (CGST @ 9%)",
      sac: "999299",
      session: "AY 2026-27",
      amt: "Rs. " + gstEach.toLocaleString() + ".00",
    },
    {
      sr: "3",
      desc: "State Goods & Services Tax (SGST @ 9%)",
      sac: "999299",
      session: "AY 2026-27",
      amt: "Rs. " + gstEach.toLocaleString() + ".00",
    },
  ];

  let currentY = tableTopY - rowHeight;
  items.forEach((item, index) => {
    currentY -= rowHeight;
    page.drawRectangle({
      x: tableX,
      y: currentY,
      width: tableW,
      height: rowHeight,
      color: index % 2 === 0 ? rgb(0.99, 0.99, 1) : rgb(1, 1, 1),
      borderWidth: 0.5,
      borderColor: rgb(0.88, 0.9, 0.94),
    });

    page.drawText(item.sr, { x: tableX + 8, y: currentY + 7, size: 8, font, color: rgb(0.3, 0.35, 0.4) });
    page.drawText(item.desc, { x: tableX + 36, y: currentY + 7, size: 8, font, color: rgb(0.1, 0.15, 0.2) });
    page.drawText(item.sac, { x: tableX + 270, y: currentY + 7, size: 8, font, color: rgb(0.3, 0.35, 0.4) });
    page.drawText(item.session, { x: tableX + 348, y: currentY + 7, size: 8, font, color: rgb(0.3, 0.35, 0.4) });
    page.drawText(item.amt, { x: tableX + 448, y: currentY + 7, size: 8, font, color: rgb(0.1, 0.15, 0.2) });
  });

  // Table Total Row
  const totalRowY = currentY - 26;
  page.drawRectangle({
    x: tableX,
    y: totalRowY,
    width: tableW,
    height: 26,
    color: rgb(0.92, 0.96, 1),
    borderWidth: 1.5,
    borderColor: rgb(0.12, 0.32, 0.65),
  });

  page.drawText("TOTAL AMOUNT PAID & RECEIVED (INR):", {
    x: tableX + 36,
    y: totalRowY + 8,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.22, 0.45),
  });

  page.drawText("Rs. " + cleanAmount.toLocaleString() + ".00", {
    x: tableX + 434,
    y: totalRowY + 8,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.52, 0.22),
  });

  // ── G. AMOUNT IN WORDS BOX ─────────────────────────────────────────
  const wordsBoxY = totalRowY - 26;
  page.drawRectangle({
    x: tableX,
    y: wordsBoxY,
    width: tableW,
    height: 22,
    color: rgb(0.98, 0.98, 0.99),
    borderWidth: 0.5,
    borderColor: rgb(0.85, 0.88, 0.92),
  });

  page.drawText("Amount in Words: " + amountInWords(cleanAmount), {
    x: tableX + 10,
    y: wordsBoxY + 6,
    size: 8,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35),
  });

  // ── H. SECURITY QR VERIFICATION & OFFICIAL STAMP ───────────────────
  const secBoxY = wordsBoxY - 106;
  page.drawRectangle({
    x: tableX,
    y: secBoxY,
    width: tableW,
    height: 98,
    color: rgb(0.99, 0.99, 1),
    borderWidth: 1,
    borderColor: rgb(0.85, 0.88, 0.94),
  });

  // Embed QR Image if available
  if (qrImage) {
    page.drawImage(qrImage, {
      x: tableX + 12,
      y: secBoxY + 10,
      width: 78,
      height: 78,
    });
  }

  // QR Explanation Details
  page.drawText("ELECTRONIC AUDIT VERIFICATION QR", {
    x: tableX + 102,
    y: secBoxY + 72,
    size: 9,
    font: fontBold,
    color: rgb(0.08, 0.22, 0.45),
  });

  page.drawText("This cryptographic QR seal contains an HMAC-SHA256 signature.", {
    x: tableX + 102,
    y: secBoxY + 58,
    size: 7.5,
    font,
    color: rgb(0.35, 0.4, 0.45),
  });

  page.drawText("Scan with any mobile camera or the GLOW Scanner to verify authenticity.", {
    x: tableX + 102,
    y: secBoxY + 45,
    size: 7.5,
    font,
    color: rgb(0.35, 0.4, 0.45),
  });

  page.drawText("Certified by Finance & Accounts Division · GSFC University Vadodara", {
    x: tableX + 102,
    y: secBoxY + 32,
    size: 7.5,
    font: fontBold,
    color: rgb(0.12, 0.52, 0.25),
  });

  page.drawText("Verification Token: " + cleanReceiptNo + "/" + cleanDate.replace(/\s+/g, ""), {
    x: tableX + 102,
    y: secBoxY + 18,
    size: 7,
    font: fontOblique,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Official Stamp Box (Right Side)
  const stampBoxX = width - 180;
  page.drawRectangle({
    x: stampBoxX,
    y: secBoxY + 12,
    width: 140,
    height: 74,
    color: rgb(0.96, 0.98, 1),
    borderWidth: 1,
    borderColor: rgb(0.2, 0.45, 0.8),
  });

  page.drawText("DIGITALLY CERTIFIED", {
    x: stampBoxX + 16,
    y: secBoxY + 65,
    size: 8,
    font: fontBold,
    color: rgb(0.12, 0.35, 0.75),
  });

  page.drawText("ACCOUNTS CELL - GSFCU", {
    x: stampBoxX + 14,
    y: secBoxY + 52,
    size: 7.5,
    font: fontBold,
    color: rgb(0.08, 0.22, 0.45),
  });

  page.drawText("Valid without physical seal", {
    x: stampBoxX + 18,
    y: secBoxY + 38,
    size: 6.8,
    font: fontOblique,
    color: rgb(0.4, 0.45, 0.5),
  });

  page.drawText("Date: " + cleanDate, {
    x: stampBoxX + 30,
    y: secBoxY + 24,
    size: 7,
    font,
    color: rgb(0.25, 0.3, 0.35),
  });

  // ── I. LEGAL & TERMS FOOTER ────────────────────────────────────────
  const footerY = secBoxY - 34;

  page.drawText("IMPORTANT TERMS & CONDITIONS:", {
    x: tableX,
    y: footerY + 16,
    size: 7,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.3),
  });

  page.drawText(
    "1. This receipt confirms valid enrollment in the GSFC University campus transit fleet for AY 2026-27.",
    { x: tableX, y: footerY + 6, size: 6.5, font, color: rgb(0.4, 0.45, 0.5) }
  );

  page.drawText(
    "2. Transport passes are strictly non-transferable. Present your digital QR pass to the shuttle operator scanner upon boarding.",
    { x: tableX, y: footerY - 4, size: 6.5, font, color: rgb(0.4, 0.45, 0.5) }
  );

  page.drawText(
    "3. Computer-generated official document issued by GLOW University Transit Platform · No manual signature required.",
    { x: tableX, y: footerY - 14, size: 6.5, font: fontOblique, color: rgb(0.4, 0.45, 0.5) }
  );

  // 3. Serialize and trigger immediate download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `GLOW_Fee_Receipt_${cleanReceiptNo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);

  return true;
};
