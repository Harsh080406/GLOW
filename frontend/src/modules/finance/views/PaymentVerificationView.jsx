import { useState, useEffect } from "react";
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
  const { offlinePayments, setOfflinePayments, verifyOfflinePayment, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("Bank challan seal missing or amount mismatch");

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await authFetch("/finance/verification");
        if (res?.success && res?.verificationQueue) {
          setOfflinePayments(res.verificationQueue);
        }
      } catch (err) {
        console.warn("Could not load verification queue:", err.message);
      }
    };
    fetchQueue();
  }, [authFetch, setOfflinePayments]);

  const pendingVerifications = (offlinePayments || []).filter((p) => p.status === "PENDING");
  const processedVerifications = (offlinePayments || []).filter((p) => p.status !== "PENDING");

  const handleApproveSlip = async (slip) => {
    await verifyOfflinePayment(slip.id || slip._id, true);
    setSelectedSlip(null);
  };

  const handleOpenRejectModal = (slip) => {
    setRejectModalItem(slip);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    await verifyOfflinePayment(rejectModalItem.id || rejectModalItem._id, false, rejectReason);
    setRejectModalItem(null);
    setSelectedSlip(null);
  };

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
                      pendingVerifications.map((p) => {
                        const pid = p.id || p._id;
                        return (
                          <tr key={pid} className="ad-tr">
                            <td className="ad-td" style={{ fontWeight: 700 }}>{pid}</td>
                            <td className="ad-td">
                              <strong>{p.studentName}</strong>
                              <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{p.studentId} · {p.dept || "Student"}</span>
                            </td>
                            <td className="ad-td" style={{ fontWeight: 900, color: "#16a34a", fontSize: 15 }}>₹{p.amount?.toLocaleString()}</td>
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
                                  onClick={() => handleApproveSlip(p)}
                                  style={{ padding: "6px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                                >
                                  ✓ APPROVE
                                </button>
                                <button
                                  onClick={() => handleOpenRejectModal(p)}
                                  style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                >
                                  ✕ REJECT
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, padding: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            <button
              onClick={() => setSelectedSlip(null)}
              style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Bank Challan Deposit Copy: {selectedSlip.studentName}</h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Amount: <strong style={{ color: "#16a34a" }}>₹{selectedSlip.amount?.toLocaleString()}</strong> · Ref: <strong>{selectedSlip.refNo}</strong> · Mode: <strong>{selectedSlip.method}</strong>
            </p>

            {/* Real Uploaded Attachment or Stamped Challan Preview */}
            <div style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: 12, padding: "18px", textAlign: "center", marginBottom: 20 }}>
              {selectedSlip.slipUrl && selectedSlip.slipUrl.startsWith("http") ? (
                <div style={{ maxHeight: 240, overflow: "hidden", borderRadius: 8, marginBottom: 12 }}>
                  <img
                    src={selectedSlip.slipUrl}
                    alt="Uploaded Bank Challan"
                    style={{ width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 8 }}
                  />
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #0066ff", paddingBottom: 10, marginBottom: 12 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{selectedSlip.bankName || "State Bank of India — Campus Branch"}</strong>
                      <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>University Transit Fee Collection Counter</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#0066ff", background: "#eff6ff", padding: "3px 8px", borderRadius: 4 }}>
                      OFFICIAL VOUCHER
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, marginBottom: 12 }}>
                    <div><span style={{ color: "#64748b" }}>Student ID:</span> <strong>{selectedSlip.studentId}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Deposit Date:</span> <strong>{selectedSlip.date}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Challan No:</span> <strong style={{ fontFamily: "monospace" }}>{selectedSlip.refNo}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Teller Code:</span> <strong>TLR-08412</strong></div>
                  </div>
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #22c55e", padding: "8px 12px", borderRadius: 6, textAlign: "center", fontWeight: 800, color: "#166534", fontSize: 13 }}>
                    ✓ BANK STAMPED & VERIFIED — ₹{selectedSlip.amount?.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => handleApproveSlip(selectedSlip)}
                style={{ flex: "1 1 180px", padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer", minHeight: 44 }}
              >
                ✓ Approve & Activate Pass
              </button>
              <button
                onClick={() => handleOpenRejectModal(selectedSlip)}
                style={{ flex: "1 1 160px", padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", minHeight: 44 }}
              >
                ✕ Reject with Reason
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                style={{ flex: "1 1 80px", padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", minHeight: 44 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTION REASON MODAL ──────────────────────────────── */}
      {rejectModalItem && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#dc2626", marginBottom: 6 }}>Reject Deposit Slip</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Student <strong>{rejectModalItem.studentName}</strong> ({rejectModalItem.studentId}) will receive an automated notification.
            </p>

            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Rejection Reason *</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, marginBottom: 10 }}
                >
                  <option value="Bank challan seal missing or illegible">Bank challan seal missing or illegible</option>
                  <option value="UTR / Reference number mismatched on university bank statement">UTR / Reference number mismatched on university bank statement</option>
                  <option value="Deposited amount is less than total pending dues">Deposited amount is less than total pending dues</option>
                  <option value="Duplicate challan submission already credited">Duplicate challan submission already credited</option>
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom reason for student..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}
                >
                  Confirm Rejection & Notify
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
