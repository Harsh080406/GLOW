import { useState } from "react";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const PaymentVerification = () => {
  const { offlinePayments, verifyOfflinePayment } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const pendingVerifications = offlinePayments.filter((p) => p.status === "PENDING");
  const processedVerifications = offlinePayments.filter((p) => p.status !== "PENDING");

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="verification" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Offline Payment Verification</div>
              <div className="ad-topbar-subtitle">Verify bank challans, NEFT/RTGS transfers & cash deposit receipts</div>
            </div>
            <div className="ad-topbar-right">
              <span className="ad-badge ad-badge--yellow" style={{ fontSize: 13, padding: "6px 14px" }}>
                {pendingVerifications.length} Awaiting Approval
              </span>
            </div>
          </header>

          <main className="ad-content">
            {/* ── PENDING VERIFICATION QUEUE ──────────────────────────── */}
            <div className="ad-card" style={{ marginBottom: 24 }}>
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Pending Payment Approval Queue</h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Review uploaded stamped challans or bank reference slips before activating pass</p>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Verification ID</th>
                      <th className="ad-th">Student Name & ID</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Payment Method</th>
                      <th className="ad-th">Reference No</th>
                      <th className="ad-th">Uploaded Receipt</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVerifications.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          ✓ All offline payments verified! Queue is clean.
                        </td>
                      </tr>
                    ) : (
                      pendingVerifications.map((p) => (
                        <tr key={p.id} className="ad-tr">
                          <td className="ad-td" style={{ fontWeight: 700 }}>{p.id}</td>
                          <td className="ad-td">
                            <strong>{p.studentName}</strong>
                            <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{p.studentId} · {p.dept}</span>
                          </td>
                          <td className="ad-td" style={{ fontWeight: 900, color: "#16a34a", fontSize: 15 }}>₹{p.amount.toLocaleString()}</td>
                          <td className="ad-td">{p.method}</td>
                          <td className="ad-td" style={{ fontFamily: "monospace", fontSize: 12 }}>{p.refNo}</td>
                          <td className="ad-td">
                            <button
                              onClick={() => setSelectedSlip(p)}
                              style={{ padding: "4px 10px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <span>📄</span> View Slip
                            </button>
                          </td>
                          <td className="ad-td">{p.date}</td>
                          <td className="ad-td">
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => verifyOfflinePayment(p.id, true)}
                                style={{ padding: "6px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                              >
                                ✓ VERIFY
                              </button>
                              <button
                                onClick={() => verifyOfflinePayment(p.id, false)}
                                style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                              >
                                ✕ REJECT
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

            {/* ── PROCESSED / AUDITED VERIFICATIONS ──────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Processed Offline Verifications Log</h3>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">ID</th>
                      <th className="ad-th">Student</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Payment Method</th>
                      <th className="ad-th">Reference</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedVerifications.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No historical items yet.</td>
                      </tr>
                    ) : (
                      processedVerifications.map((p) => (
                        <tr key={p.id} className="ad-tr">
                          <td className="ad-td">{p.id}</td>
                          <td className="ad-td">{p.studentName} ({p.studentId})</td>
                          <td className="ad-td" style={{ fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                          <td className="ad-td">{p.method}</td>
                          <td className="ad-td">{p.refNo}</td>
                          <td className="ad-td">{p.date}</td>
                          <td className="ad-td">
                            <span className={`ad-badge ${p.status === "VERIFIED" ? "ad-badge--green" : "ad-badge--red"}`}>
                              ● {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>

      {/* ── SLIP PREVIEW MODAL ─────────────────────────────────── */}
      {selectedSlip && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            <button
              onClick={() => setSelectedSlip(null)}
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Deposit Slip: {selectedSlip.studentName}</h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>Amount: <strong>₹{selectedSlip.amount.toLocaleString()}</strong> · Ref: <strong>{selectedSlip.refNo}</strong></p>

            {/* Mock deposit slip graphic */}
            <div style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏦</div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>State Bank of India — Campus Branch</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>University Fee Challan Deposit Copy</p>
              <div style={{ display: "inline-block", background: "#f0fdf4", border: "1.5px solid #22c55e", padding: "6px 16px", borderRadius: 6, marginTop: 12, fontWeight: 800, color: "#166534" }}>
                [ BANK STAMPED & VERIFIED — ₹{selectedSlip.amount.toLocaleString()} ]
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>Branch Code: 04192 · Teller ID: TL-8910</p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  verifyOfflinePayment(selectedSlip.id, true);
                  setSelectedSlip(null);
                }}
                style={{ flex: 1, padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}
              >
                Approve & Activate Pass
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
