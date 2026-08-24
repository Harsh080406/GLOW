import { useState } from "react";
import StudentLayout from "../components/StudentLayout";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentFees = () => {
  const { currentStudent, transactions, payStudentFee } = useTransit();
  const student = currentStudent || {};
  const totalFee = student.totalFee || 15000;
  const paidFee = student.paidFee || 0;
  const pendingFee = student.pendingFee !== undefined ? student.pendingFee : 15000;
  const dueDate = student.dueDate || "15 Sep 2026";
  const zone = student.zone || "Zone B";

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(pendingFee || 5000);
  const [selectedMethod, setSelectedMethod] = useState("UPI (Google Pay)");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);

  const handlePayment = (e) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const txn = payStudentFee(Number(payAmount), selectedMethod);
      setIsProcessing(false);
      setSuccessTxn(txn);
    }, 1200);
  };

  const studentTxns = (transactions || []).filter((t) => t.studentId === student.id);

  return (
    <StudentLayout title="Fees & Payments" subtitle="Manage your university transport dues and view payment receipts">
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

        <div style={{ background: pendingFee > 0 ? "#fff7ed" : "#f0fdf4", border: `1px solid ${pendingFee > 0 ? "#fed7aa" : "#bbf7d0"}`, borderRadius: 14, padding: "20px" }}>
          <p style={{ fontSize: 12, color: pendingFee > 0 ? "#9a3412" : "#166534", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Amount Pending</p>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: pendingFee > 0 ? "#ea580c" : "#16a34a", marginTop: 4 }}>₹{pendingFee.toLocaleString()}</h2>
          <span style={{ fontSize: 12, color: pendingFee > 0 ? "#c2410c" : "#166534" }}>
            {pendingFee > 0 ? `Due Date: ${dueDate}` : "All dues cleared!"}
          </span>
        </div>
      </div>

      {/* ── ACTION BANNER ──────────────────────────────────────── */}
      {pendingFee > 0 ? (
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", borderRadius: 16, padding: "24px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24, boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              ⚡ Payment Due Soon
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>Clear Pending Dues of ₹{pendingFee.toLocaleString()}</h3>
            <p style={{ fontSize: 13.5, opacity: 0.9, marginTop: 2 }}>Pay via Instant UPI, Credit/Debit Card, or NetBanking to keep your Transport Pass active.</p>
          </div>
          <button
            onClick={() => {
              setPayAmount(pendingFee);
              setSuccessTxn(null);
              setShowPayModal(true);
            }}
            style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(34,197,94,0.4)" }}
          >
            <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={18} stroke="#fff" />
            PAY ₹{pendingFee.toLocaleString()} NOW
          </button>
        </div>
      ) : (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>
            ✓
          </div>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>Fee Payment Completed for AY 2026-27</h4>
            <p style={{ fontSize: 13, color: "#15803d" }}>Your transport pass is valid until 31 May 2027. You have zero outstanding dues.</p>
          </div>
        </div>
      )}

      {/* ── PAYMENT HISTORY TABLE ──────────────────────────────── */}
      <div className="ad-card">
        <div className="ad-card-header">
          <div>
            <h3 className="ad-card-title">Payment History & Receipts</h3>
            <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Official tax invoices and digital payment receipts</p>
          </div>
          <button className="ad-btn-secondary" onClick={() => window.print()}>
            <Icon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" size={15} />
            Print Statement
          </button>
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
                <th className="ad-th">Receipt</th>
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
                      <button
                        className="ad-action-btn"
                        style={{ color: "#2563eb", borderColor: "#bfdbfe", background: "#eff6ff" }}
                        onClick={() => setSelectedReceipt(t)}
                      >
                        <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={13} stroke="#2563eb" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAYMENT MODAL ──────────────────────────────────────── */}
      {showPayModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 480, padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            <button
              onClick={() => setShowPayModal(false)}
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
            >
              ✕
            </button>

            {!successTxn ? (
              <form onSubmit={handlePayment}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={24} stroke="#2563eb" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1d23" }}>University Transport Fee Portal</h3>
                    <p style={{ fontSize: 12, color: "#64748b" }}>Secure Payment Gateway · 256-Bit SSL Encrypted</p>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px", marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "#64748b" }}>Student ID:</span>
                    <span style={{ fontWeight: 600 }}>{currentStudent.id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "#64748b" }}>Student Name:</span>
                    <span style={{ fontWeight: 600 }}>{currentStudent.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Assigned Route:</span>
                    <span style={{ fontWeight: 600 }}>{currentStudent.routeName}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    max={currentStudent.pendingFee}
                    min={100}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 16, fontWeight: 700 }}
                  />
                  <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>Maximum payable pending: ₹{currentStudent.pendingFee.toLocaleString()}</span>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Select Payment Mode</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { id: "UPI (Google Pay)", label: "Google Pay UPI", icon: "📱" },
                      { id: "UPI (PhonePe)", label: "PhonePe UPI", icon: "🟣" },
                      { id: "HDFC NetBanking", label: "NetBanking", icon: "🏦" },
                      { id: "Credit/Debit Card", label: "Card (Visa/Master)", icon: "💳" },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: `1.5px solid ${selectedMethod === m.id ? "#2563eb" : "#e2e8f0"}`,
                          background: selectedMethod === m.id ? "#eff6ff" : "#fff",
                          color: selectedMethod === m.id ? "#1d4ed8" : "#334155",
                          fontWeight: 600,
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{ width: "100%", padding: "14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: isProcessing ? "not-allowed" : "pointer" }}
                >
                  {isProcessing ? "Processing Payment..." : `Proceed to Pay ₹${Number(payAmount).toLocaleString()}`}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 64, height: 64, background: "#dcfce7", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#166534" }}>Payment Successful!</h3>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Transaction ID: {successTxn.id}</p>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", margin: "20px 0", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Amount Paid:</span>
                    <span style={{ fontWeight: 800, color: "#16a34a" }}>₹{successTxn.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Reference No:</span>
                    <span style={{ fontWeight: 600 }}>{successTxn.refNo}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>Payment Mode:</span>
                    <span style={{ fontWeight: 600 }}>{successTxn.method}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setSelectedReceipt(successTxn);
                      setShowPayModal(false);
                    }}
                    style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                  >
                    View Receipt
                  </button>
                  <button
                    onClick={() => setShowPayModal(false)}
                    style={{ flex: 1, padding: "12px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              <span style={{ fontSize: 11, letterSpacing: 1.5, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>GLOW UNIVERSITY TRANSPORT SYSTEM</span>
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
                onClick={() => window.print()}
                style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Icon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" size={16} stroke="#fff" />
                Print / Download PDF
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
    </StudentLayout>
  );
};

export default StudentFees;
