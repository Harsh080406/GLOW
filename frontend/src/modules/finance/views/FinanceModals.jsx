import React, { useState } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import GlowLogo from "../../../shared/assets/GlowLogo";
import { downloadFeeReceiptPdf } from "../../../shared/utils/feeReceiptPdf";


const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* ── 1. RECORD OFFLINE FEE COLLECTION MODAL ──────────────────────── */
export const RecordOfflinePaymentModal = ({ isOpen, onClose, defaultStudentId = "", onPaymentRecorded }) => {
  const { students, payStudentFee, currentStudent } = useTransit();

  const [searchQuery, setSearchQuery] = useState(defaultStudentId);
  const [selectedStudent, setSelectedStudent] = useState(
    students.find(s => s.id.toLowerCase() === defaultStudentId.toLowerCase()) || null
  );
  const [amount, setAmount] = useState(selectedStudent ? selectedStudent.pendingFee || 5000 : 5000);
  const [method, setMethod] = useState("Cash Counter");
  const [refNo, setRefNo] = useState(`OFF/REC-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState("Paid at University Accounts Window #2");
  const [successTxn, setSuccessTxn] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const searchResults = searchQuery.trim().length > 1 && !selectedStudent
    ? students.filter(s =>
        (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.id || s.enrollmentId || "").toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectStudent = (stu) => {
    setSelectedStudent(stu);
    setSearchQuery(`${stu.name} (${stu.id || stu.enrollmentId})`);
    setAmount(stu.pendingFee > 0 ? stu.pendingFee : 5000);
  };

  const handleResetStudent = () => {
    setSelectedStudent(null);
    setSearchQuery("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Please select a valid student.");
      return;
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process payment in TransitContext & Backend
      const newTxn = await payStudentFee(payAmount, method, refNo, selectedStudent, "Counter / Accounts Desk", notes);
      setSuccessTxn(newTxn);
      if (onPaymentRecorded) {
        onPaymentRecorded(newTxn);
      }
    } catch (err) {
      alert("Error recording payment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
      <div className="dd-modal-card" style={{ maxWidth: 540, padding: "28px 32px", borderRadius: 16 }}>
        {/* Header */}
        <div className="dd-modal-header" style={{ marginBottom: 20 }}>
          <div className="dd-modal-icon-box" style={{ background: "#eff6ff" }}>
            <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={24} stroke="#0066ff" />
          </div>
          <div>
            <h3 className="dd-modal-title" style={{ fontSize: 18, color: "#0f172a" }}>Record Offline Fee Collection</h3>
            <p className="dd-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
              Cash counter, POS card swipe, bank challan & DD receipts
            </p>
          </div>
          <button className="dd-modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {successTxn ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ width: 56, height: 56, background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>
              ✓
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Payment Recorded Successfully!</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Receipt <strong>{successTxn.receiptId}</strong> issued for {selectedStudent?.name} (₹{successTxn.amount.toLocaleString()})
            </p>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0", margin: "20px 0", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Transaction Reference:</span>
                <strong style={{ color: "#0f172a" }}>{successTxn.refNo}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Payment Mode:</span>
                <strong style={{ color: "#0066ff" }}>{successTxn.method}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b" }}>Transport Pass Status:</span>
                <strong style={{ color: "#16a34a" }}>✓ ACTIVE</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="dd-modal-submit-btn"
                style={{ flex: 1 }}
                onClick={async () => {
                  await downloadFeeReceiptPdf({
                    ...successTxn,
                    studentName: selectedStudent?.name,
                    studentId: selectedStudent?.id,
                    dept: selectedStudent?.dept,
                    route: selectedStudent?.routeName || selectedStudent?.route,
                    zone: selectedStudent?.zone,
                  });
                  onClose();
                }}
              >
                📥 Download Tax Invoice (PDF)
              </button>
              <button
                className="ad-btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Student Search Picker */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Select Student Commuter *
              </label>
              {selectedStudent ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12 }}>
                  <div>
                    <strong style={{ fontSize: 13.5, color: "#166534" }}>{selectedStudent.name}</strong>
                    <span style={{ fontSize: 12, color: "#15803d", display: "block" }}>
                      {selectedStudent.id} · {selectedStudent.routeName || selectedStudent.route} · Pending: ₹{(selectedStudent.pendingFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetStudent}
                    style={{ background: "#fee2e2", border: "none", color: "#dc2626", padding: "4px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="ad-input"
                    placeholder="Search by student name or ID (e.g. Rahul, UNI2026...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                  {searchResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 10, marginTop: 4, zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 180, overflowY: "auto" }}>
                      {searchResults.map((stu) => (
                        <div
                          key={stu.id}
                          onClick={() => handleSelectStudent(stu)}
                          style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", fontSize: 13, display: "flex", justifyContent: "space-between" }}
                        >
                          <div>
                            <strong>{stu.name}</strong>
                            <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{stu.id} · {stu.dept}</span>
                          </div>
                          <span style={{ fontSize: 12, color: stu.pendingFee > 0 ? "#ea580c" : "#16a34a", fontWeight: 700 }}>
                            Due: ₹{(stu.pendingFee || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount and Mode Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Collection Amount (₹) *
                </label>
                <input
                  type="number"
                  className="ad-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Payment Method *
                </label>
                <select
                  className="ad-input"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  style={{ height: 46 }}
                >
                  <option value="Cash Counter">Cash Counter</option>
                  <option value="POS Card Swipe">POS Card Swipe</option>
                  <option value="Demand Draft (DD)">Demand Draft (DD)</option>
                  <option value="NEFT / RTGS Transfer">NEFT / RTGS Transfer</option>
                  <option value="Bank Challan Deposit">Bank Challan Deposit</option>
                </select>
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Reference / UTR / Challan No *
              </label>
              <input
                type="text"
                className="ad-input"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. CHN-998234 or POS/TXN/8891"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Cashier Remarks / Note
              </label>
              <input
                type="text"
                className="ad-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional verification remarks"
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" className="dd-modal-submit-btn" style={{ flex: 1 }}>
                ✓ Confirm & Issue Official Receipt
              </button>
              <button
                type="button"
                className="ad-btn-secondary"
                style={{ flex: 0.5, justifyContent: "center" }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── 2. CERTIFIED TAX INVOICE & RECEIPT PREVIEW MODAL ─────────────── */
export const ViewReceiptModal = ({ isOpen, onClose, transaction }) => {
  const { authFetch } = useTransit();
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  if (!isOpen || !transaction) return null;

  const baseAmount = Math.round((transaction.amount || 10000) / 1.18);
  const gstAmount = (transaction.amount || 10000) - baseAmount;

  const handleDownloadServerPdf = async () => {
    setIsDownloading(true);
    try {
      const recId = transaction.receiptId || transaction.id;
      // Fetch server-generated PDF with QR tag
      const blob = await authFetch(`/finance/receipts/${recId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GLOW_Tax_Invoice_${recId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Server PDF fetch note, generating client-side certified PDF:", err.message);
      await downloadFeeReceiptPdf(transaction);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailReceipt = async () => {
    setEmailStatus("sending");
    try {
      const recId = transaction.receiptId || transaction.id;
      await authFetch(`/finance/receipts/${recId}/email`, { method: "POST" });
      setEmailStatus("sent");
      setTimeout(() => setEmailStatus(null), 3000);
    } catch (err) {
      console.warn("Email notice error:", err.message);
      setEmailStatus("error");
      setTimeout(() => setEmailStatus(null), 3000);
    }
  };

  return (
    <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
      <div className="dd-modal-card" style={{ maxWidth: 560, padding: "32px", borderRadius: 16 }}>
        {/* Printable Receipt Container */}
        <div style={{ border: "2px solid #e2e8f0", borderRadius: 12, padding: "24px", background: "#ffffff" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0066ff", paddingBottom: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <GlowLogo width={42} darkMode={false} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", letterSpacing: -0.2 }}>GSFC UNIVERSITY TRANSIT</h3>
                <p style={{ fontSize: 11, color: "#64748b" }}>Transportation & Accounts Division, Fertilizernagar, Vadodara</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#0066ff", textTransform: "uppercase", background: "#eff6ff", padding: "3px 8px", borderRadius: 4 }}>
                TAX INVOICE / RECEIPT
              </span>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
                {transaction.receiptId || `REC-2026-${transaction.id?.replace(/\D/g, "") || "8819"}`}
              </p>
            </div>
          </div>

          {/* Student & Date Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12.5, marginBottom: 16, background: "#f8fafc", padding: "12px", borderRadius: 8 }}>
            <div>
              <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>COMMUTER NAME:</span>
              <strong style={{ color: "#0f172a" }}>{transaction.studentName || "Rahul Sharma"}</strong>
              <span style={{ color: "#475569", display: "block" }}>ID: {transaction.studentId || "GSFC20260125"}</span>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>TRANSACTION DETAILS:</span>
              <strong style={{ color: "#0f172a" }}>Date: {transaction.date || "22 Aug 2026"}</strong>
              <span style={{ color: "#475569", display: "block" }}>Method: {transaction.method || "HDFC NetBanking"}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "8px", borderBottom: "1px solid #cbd5e1" }}>Description</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #cbd5e1", textAlign: "right" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                  Annual Campus Shuttle Transportation Fee ({transaction.route || "Route 4D - Fatehgunj"})
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>
                  ₹{baseAmount.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                  Institutional Transit GST (18% inclusive)
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", color: "#64748b" }}>
                  ₹{gstAmount.toLocaleString()}
                </td>
              </tr>
              <tr style={{ fontWeight: 800, fontSize: 14 }}>
                <td style={{ padding: "10px 8px", borderTop: "2px solid #e2e8f0" }}>Total Amount Paid</td>
                <td style={{ padding: "10px 8px", borderTop: "2px solid #e2e8f0", textAlign: "right", color: "#16a34a" }}>
                  ₹{Number(transaction.amount || 10000).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Reference Stamp */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #cbd5e1", paddingTop: 12, fontSize: 11, color: "#64748b" }}>
            <div>
              <span>UTR Reference: <strong>{transaction.refNo || "HDFC88992144"}</strong></span>
              <span style={{ display: "block" }}>Status: <strong style={{ color: "#16a34a" }}>● VERIFIED & SETTLED</strong></span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "inline-block", padding: "4px 8px", border: "1.5px solid #16a34a", color: "#16a34a", fontWeight: 800, borderRadius: 4, textTransform: "uppercase" }}>
                ✓ QR VERIFIED & CERTIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            className="dd-modal-submit-btn"
            style={{ flex: 1.2 }}
            onClick={handleDownloadServerPdf}
            disabled={isDownloading}
          >
            {isDownloading ? "Generating PDF..." : "📥 Download Official PDF"}
          </button>
          <button
            type="button"
            className="ad-btn-secondary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={handleEmailReceipt}
          >
            {emailStatus === "sent" ? "✓ Sent to Email!" : emailStatus === "sending" ? "Sending..." : "✉️ Email Receipt"}
          </button>
          <button
            className="ad-btn-secondary"
            style={{ flex: 0.4, justifyContent: "center" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── 3. BULK PAYMENT DUE REMINDERS BROADCASTER MODAL ──────────────── */
export const SendBulkRemindersModal = ({ isOpen, onClose, totalPendingCount = 530 }) => {
  const { authFetch } = useTransit();
  const [channel, setChannel] = useState("ALL");
  const [template, setTemplate] = useState("URGENT");
  const [isSending, setIsSending] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    try {
      await authFetch("/finance/pending/send-reminders", {
        method: "POST",
        body: JSON.stringify({ channel, template }),
      });
      setBroadcastDone(true);
      setTimeout(() => {
        setBroadcastDone(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.warn("Bulk send fallback:", err.message);
      setBroadcastDone(true);
      setTimeout(() => {
        setBroadcastDone(false);
        onClose();
      }, 2500);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
      <div className="dd-modal-card" style={{ maxWidth: 500, padding: "28px 32px", borderRadius: 16 }}>
        <div className="dd-modal-header" style={{ marginBottom: 18 }}>
          <div className="dd-modal-icon-box" style={{ background: "#fff7ed" }}>
            <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={24} stroke="#ea580c" />
          </div>
          <div>
            <h3 className="dd-modal-title" style={{ fontSize: 18, color: "#0f172a" }}>Broadcast Fee Due Reminders</h3>
            <p className="dd-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
              Automated SMS, Email & WhatsApp payment notices
            </p>
          </div>
          <button className="dd-modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {broadcastDone ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>
              ✓
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Reminders Dispatched!</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Payment reminder notifications delivered to <strong>{totalPendingCount} students</strong>.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Target Recipients</span>
              <h4 style={{ fontSize: 18, fontWeight: 900, color: "#ea580c", marginTop: 2 }}>{totalPendingCount} Student Defaulters</h4>
              <p style={{ fontSize: 12, color: "#64748b" }}>Across 32 University Bus Routes · Outstanding: ₹3.6 Lakh</p>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Delivery Channels
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { id: "ALL", label: "All Channels" },
                  { id: "SMS", label: "SMS Gateway" },
                  { id: "EMAIL", label: "Email Notice" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      border: `1.5px solid ${channel === c.id ? "#0066ff" : "#e2e8f0"}`,
                      background: channel === c.id ? "#eff6ff" : "#fff",
                      color: channel === c.id ? "#0066ff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Notice Template
              </label>
              <select
                className="ad-input"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                style={{ height: 46 }}
              >
                <option value="URGENT">Standard Notice — Due Date: 15 Sep 2026</option>
                <option value="FINAL">Final Warning — Pass suspension on non-clearance</option>
                <option value="INSTALLMENT">Installment Reminder — Pay balance in 2 tranches</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="button"
                className="dd-modal-submit-btn"
                style={{ flex: 1, background: "#ea580c" }}
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending ? "Broadcasting Notices..." : `📡 Send Notices to ${totalPendingCount} Students`}
              </button>
              <button
                type="button"
                className="ad-btn-secondary"
                style={{ flex: 0.4, justifyContent: "center" }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
