import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import { downloadFeeReceiptPdf } from "../../../shared/utils/feeReceiptPdf";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentFees = () => {
  const navigate = useNavigate();
  const { currentStudent, transactions, feeStructures } = useTransit();
  const student = currentStudent || {};
  const zone = student.zone || "Zone B";
  const zoneKey = zone.replace("Zone ", "").trim();
  const matchingSlab = (feeStructures || []).find(
    (f) => (f.zone || "").includes(zoneKey) || (f.zone || "").includes(zone)
  );
  const totalFee = matchingSlab ? matchingSlab.amount : student.totalFee || 15000;
  const paidFee = student.paidFee || 0;
  const pendingFee = student.pendingFee !== undefined ? student.pendingFee : Math.max(0, totalFee - paidFee);
  const dueDate = matchingSlab?.dueDate || student.dueDate || "15 Sep 2026";

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const studentTxns = (transactions || []).filter((t) => t.studentId === student.id);

  return (
    <div className="student-view-wrap">
      {/* ── TOP FEE STATUS CARDS ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 14, padding: "20px" }}>
          <p style={{ fontSize: 12, color: "#7c8494", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Transport Fee</p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1a1d23", marginTop: 4 }}>₹{totalFee.toLocaleString()}</h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>Academic Year 2026-27 · {zone}</span>
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px" }}>
          <p style={{ fontSize: 12, color: "#166534", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Amount Paid</p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#16a34a", marginTop: 4 }}>₹{paidFee.toLocaleString()}</h2>
          <span style={{ fontSize: 12, color: "#166534" }}>✓ Verified & Receipts Issued</span>
        </div>

        <div
          onClick={() => {
            if (pendingFee > 0) {
              navigate(`/student/payment?amount=${pendingFee}`);
            }
          }}
          style={{
            background: pendingFee > 0 ? "#fff7ed" : "#f0fdf4",
            border: `1.5px solid ${pendingFee > 0 ? "#fed7aa" : "#bbf7d0"}`,
            borderRadius: 14,
            padding: "20px",
            cursor: pendingFee > 0 ? "pointer" : "default",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: pendingFee > 0 ? "#9a3412" : "#166534", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Amount Pending</p>
            {pendingFee > 0 && (
              <span style={{ fontSize: 11, background: "#ea580c", color: "#fff", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                Pay Now ➔
              </span>
            )}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: pendingFee > 0 ? "#ea580c" : "#16a34a", marginTop: 4 }}>₹{pendingFee.toLocaleString()}</h2>
          <span style={{ fontSize: 12, color: pendingFee > 0 ? "#c2410c" : "#166534" }}>
            {pendingFee > 0 ? `Due Date: ${dueDate} · Click to Pay` : "All dues cleared!"}
          </span>
        </div>
      </div>

      {/* ── ACTION BANNER ──────────────────────────────────────── */}
      {pendingFee > 0 ? (
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", borderRadius: 16, padding: "clamp(16px, 4vw, 24px) clamp(16px, 4vw, 28px)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24, boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              ⚡ Payment Due Soon
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>Clear Pending Dues of ₹{pendingFee.toLocaleString()}</h3>
            <p style={{ fontSize: 13.5, opacity: 0.9, marginTop: 2 }}>Pay via Instant UPI, Credit/Debit Card, or NetBanking on the secure Payment Gateway.</p>
          </div>
          <button
            onClick={() => navigate(`/student/payment?amount=${pendingFee}`)}
            style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(34,197,94,0.4)", minHeight: 48, flex: "1 1 200px" }}
          >
            <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={18} stroke="#fff" />
            PAY ₹{pendingFee.toLocaleString()} NOW ➔
          </button>
        </div>
      ) : (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>
              ✓
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>Fee Payment Completed for AY 2026-27</h4>
              <p style={{ fontSize: 13, color: "#15803d" }}>Your transport pass is valid until 31 May 2027. You have zero outstanding dues.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/payment?amount=5000")}
            style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>💳</span> Open Payment Gateway ➔
          </button>
        </div>
      )}

      {/* ── PAYMENT HISTORY TABLE ──────────────────────────────── */}
      <div className="ad-card">
        <div className="ad-card-header">
          <div>
            <h3 className="ad-card-title">Payment History & Receipts</h3>
            <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Official tax invoices and digital payment receipts</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="ad-btn-secondary"
              onClick={() => navigate(`/student/payment?amount=${pendingFee > 0 ? pendingFee : 5000}`)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
            >
              <span>💳</span> Payment Gateway
            </button>
            <button
              className="ad-btn-secondary"
              onClick={() => {
                const latest = studentTxns[0] || {
                  receiptId: "REC-2026-8910",
                  amount: paidFee || totalFee,
                  date: new Date().toLocaleDateString("en-IN"),
                  method: "Online Banking / UPI",
                  refNo: "UTR-GSFC-ONLINE",
                };
                downloadFeeReceiptPdf({
                  ...latest,
                  studentName: student.name,
                  studentId: student.id,
                  dept: student.dept,
                  route: student.routeName,
                  zone: student.zone,
                });
              }}
            >
              <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} />
              Download Fee Slip (PDF)
            </button>
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="ad-th">Transaction ID</th>
                <th className="ad-th">Date</th>
                <th className="ad-th">Amount</th>
                <th className="ad-th">Payment Method</th>
                <th className="ad-th">Reference / UTR</th>
                <th className="ad-th">Status</th>
                <th className="ad-th">Receipt Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#7c8494" }}>No payment records found.</td>
                </tr>
              ) : (
                studentTxns.map((t) => (
                  <tr key={t.id} className="ad-tr">
                    <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                    <td className="ad-td">{t.date}</td>
                    <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>₹{t.amount.toLocaleString()}</td>
                    <td className="ad-td">{t.method}</td>
                    <td className="ad-td" style={{ fontFamily: "monospace", fontSize: 12 }}>{t.refNo}</td>
                    <td className="ad-td">
                      <span className="ad-badge ad-badge--green">● {t.status}</span>
                    </td>
                    <td className="ad-td">
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="ad-action-btn"
                          style={{ color: "#2563eb", borderColor: "#bfdbfe", background: "#eff6ff" }}
                          onClick={() => setSelectedReceipt(t)}
                          title="Preview receipt details"
                        >
                          View
                        </button>
                        <button
                          className="ad-action-btn"
                          style={{ color: "#16a34a", borderColor: "#bbf7d0", background: "#f0fdf4" }}
                          onClick={() =>
                            downloadFeeReceiptPdf({
                              ...t,
                              studentName: student.name,
                              studentId: student.id,
                              dept: student.dept,
                              route: student.routeName,
                              zone: student.zone,
                            })
                          }
                          title="Directly download official fee slip PDF"
                        >
                          <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={13} stroke="#16a34a" />
                          Download PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RECEIPT PREVIEW MODAL ──────────────────────────────── */}
      {selectedReceipt && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520, padding: "32px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            <button
              onClick={() => setSelectedReceipt(null)}
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div style={{ textAlign: "center", borderBottom: "2px dashed #e2e8f0", paddingBottom: 20, marginBottom: 20 }}>
              <span style={{ fontSize: 11, letterSpacing: 1.5, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>GSFC UNIVERSITY — GLOW TRANSPORT SYSTEM</span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1e293b", marginTop: 4 }}>FEE PAYMENT RECEIPT</h2>
              <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>● TAX INVOICE / OFFICIAL RECEIPT</p>
            </div>

            {/* Receipt Body */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 20 }}>
              <div>
                <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Receipt Number</span>
                <p style={{ fontWeight: 800 }}>{selectedReceipt.receiptId || "REC-2026-8910"}</p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Transaction Date</span>
                <p style={{ fontWeight: 800 }}>{selectedReceipt.date}</p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Student Name</span>
                <p style={{ fontWeight: 800 }}>{selectedReceipt.studentName}</p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Student ID</span>
                <p style={{ fontWeight: 800 }}>{selectedReceipt.studentId}</p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Route & Zone</span>
                <p style={{ fontWeight: 800 }}>{selectedReceipt.route} (Zone B)</p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>Payment Mode</span>
                <p style={{ fontWeight: 800 }}>{selectedReceipt.method}</p>
              </div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                <span>Amount Paid</span>
                <span style={{ color: "#16a34a", fontSize: 18 }}>₹{selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Ref No: {selectedReceipt.refNo}</p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  downloadFeeReceiptPdf({
                    ...selectedReceipt,
                    studentName: selectedReceipt.studentName || student.name,
                    studentId: selectedReceipt.studentId || student.id,
                    dept: student.dept,
                    route: selectedReceipt.route || student.routeName,
                    zone: student.zone,
                  });
                }}
                style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={16} stroke="#fff" />
                Download PDF Fee Slip
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ padding: "12px 20px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentFees;
