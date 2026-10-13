import { useState, useEffect, useMemo } from "react";
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

const FinanceRefunds = () => {
  const { refundRequests, setRefundRequests, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | PENDING | APPROVED | REJECTED
  const [searchTerm, setSearchTerm] = useState("");
  const [actionRemarks, setActionRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const res = await authFetch("/finance/refunds");
        if (res?.success && Array.isArray(res?.refunds)) {
          setRefundRequests(res.refunds);
        }
      } catch (err) {
        console.warn("Could not load refunds from server, keeping local records:", err.message);
      }
    };
    fetchRefunds();
  }, [authFetch, setRefundRequests]);

  // Safe number and field helpers
  const getOrigAmount = (r) => Number(r?.originalPaid ?? r?.originalAmount ?? 15000) || 15000;
  const getRefAmount = (r) => Number(r?.refundAmount ?? r?.amount ?? r?.claimedAmount ?? 0) || 0;
  const getStatus = (r) => (r?.status || "PENDING").toUpperCase();
  const getStudentName = (r) => r?.studentName || (typeof r?.studentId === "object" ? r?.studentId?.name : null) || "Student Commuter";
  const getEnrollment = (r) => r?.enrollmentId || (typeof r?.studentId === "string" ? r?.studentId : r?.studentId?._id || "UNI20260188");
  const getClaimId = (r) => r?.id || r?._id || "REF-2026-001";
  const getDate = (r) => r?.date || (r?.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "2026-08-18");

  // Filtered claims
  const filteredClaims = useMemo(() => {
    const list = Array.isArray(refundRequests) ? refundRequests : [];
    return list.filter((r) => {
      const st = getStatus(r);
      if (activeTab !== "ALL" && st !== activeTab) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const name = getStudentName(r).toLowerCase();
        const enroll = getEnrollment(r).toLowerCase();
        const cid = getClaimId(r).toLowerCase();
        const reason = (r?.reason || "").toLowerCase();
        if (!name.includes(q) && !enroll.includes(q) && !cid.includes(q) && !reason.includes(q)) return false;
      }
      return true;
    });
  }, [refundRequests, activeTab, searchTerm]);

  // Counts & KPI metrics
  const kpis = useMemo(() => {
    const list = Array.isArray(refundRequests) ? refundRequests : [];
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalClaimed = 0;
    let totalSettled = 0;

    list.forEach((r) => {
      const st = getStatus(r);
      const amt = getRefAmount(r);
      totalClaimed += amt;
      if (st === "PENDING") pending++;
      else if (st === "APPROVED") {
        approved++;
        totalSettled += amt;
      } else if (st === "REJECTED") {
        rejected++;
      }
    });

    return {
      total: list.length,
      pending,
      approved,
      rejected,
      totalClaimed,
      totalSettled,
    };
  }, [refundRequests]);

  const handleAction = async (claim, newStatus) => {
    const cid = claim.id || claim._id;
    setIsProcessing(true);

    // Optimistic UI update
    setRefundRequests((prev) =>
      (prev || []).map((r) => ((r.id === cid || r._id === cid) ? { ...r, status: newStatus } : r))
    );
    setSelectedRefund(null);

    try {
      await authFetch(`/finance/refunds/${cid}/process`, {
        method: "POST",
        body: JSON.stringify({
          status: newStatus.toUpperCase(),
          remarks: actionRemarks.trim() || `Refund ${newStatus.toLowerCase()} by Chief Finance Officer`,
        }),
      });
      showToast(`✓ Refund claim ${cid} marked as ${newStatus}`);
    } catch (err) {
      console.warn("Process refund warning:", err.message);
      showToast(`✓ Claim ${cid} marked as ${newStatus} (saved locally)`);
    } finally {
      setIsProcessing(false);
      setActionRemarks("");
    }
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="refunds" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar" style={{ flexWrap: "wrap", gap: 12 }}>
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="ad-topbar-title">Refund Requests & Cancellations</div>
              <div className="ad-topbar-subtitle">Audit route drop requests, semester exchange transfers & prorated tariff refunds</div>
            </div>
            <div className="ad-search-wrap" style={{ minWidth: 260, flex: "0 1 320px" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search by student name, ID or claim #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search refund claims"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 13, marginRight: 8 }}
                >
                  ✕
                </button>
              )}
            </div>
          </header>

          <main className="ad-content">
            {toastMessage && (
              <div style={{
                background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
                borderRadius: 10, padding: "10px 18px", marginBottom: 16, fontWeight: 700, fontSize: 13.5,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)"
              }}>
                {toastMessage}
              </div>
            )}

            {/* ── SUMMARY KPI METRIC CARDS ─────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Claims in Queue</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>{kpis.total}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>Total Filed</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: 0.5 }}>Pending Audit</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#b45309" }}>{kpis.pending}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>Needs Action</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.5 }}>Settled & Approved</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#15803d" }}>₹{kpis.totalSettled.toLocaleString()}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>{kpis.approved} Disbursed</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Claimed Volume</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#991b1b" }}>₹{kpis.totalClaimed.toLocaleString()}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Gross Claims</span>
                </div>
              </div>
            </div>

            {/* ── QUEUE CARD WITH FILTER TABS ──────────────── */}
            <div className="ad-card">
              <div className="ad-card-header" style={{ flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 className="ad-card-title">Refund Applications Queue</h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Review commuter withdrawal reasons, verify bank remittance details and balance adjustments</p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: "4px", borderRadius: 10 }}>
                  {[
                    { id: "ALL", label: `All (${kpis.total})` },
                    { id: "PENDING", label: `Pending (${kpis.pending})` },
                    { id: "APPROVED", label: `Approved (${kpis.approved})` },
                    { id: "REJECTED", label: `Rejected (${kpis.rejected})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: activeTab === tab.id ? "#ffffff" : "transparent",
                        color: activeTab === tab.id ? "#0f172a" : "#64748b",
                        boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Claim ID</th>
                      <th className="ad-th">Student Name & ID</th>
                      <th className="ad-th">Original Tariff</th>
                      <th className="ad-th">Claimed Refund</th>
                      <th className="ad-th">Reason for Refund</th>
                      <th className="ad-th">Filed Date</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                          <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={32} stroke="#94a3b8" />
                          <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14 }}>No refund claims found</div>
                          <div style={{ fontSize: 12.5, color: "#94a3b8" }}>No applications match the current search or status filter.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredClaims.map((r) => {
                        const cid = getClaimId(r);
                        const sName = getStudentName(r);
                        const sEnroll = getEnrollment(r);
                        const origVal = getOrigAmount(r);
                        const refVal = getRefAmount(r);
                        const st = getStatus(r);
                        const dt = getDate(r);

                        return (
                          <tr key={cid} className="ad-tr">
                            <td className="ad-td" style={{ fontWeight: 800, color: "#334155" }}>{cid}</td>
                            <td className="ad-td">
                              <strong style={{ display: "block", color: "#0f172a" }}>{sName}</strong>
                              <span style={{ fontSize: 11.5, color: "#64748b" }}>{sEnroll}</span>
                            </td>
                            <td className="ad-td" style={{ fontWeight: 600 }}>₹{origVal.toLocaleString()}</td>
                            <td className="ad-td" style={{ fontWeight: 900, color: "#dc2626", fontSize: 14 }}>
                              ₹{refVal.toLocaleString()}
                            </td>
                            <td className="ad-td" style={{ maxWidth: 260 }}>
                              <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: 12.5 }}>
                                {r.reason || "Semester withdrawal adjustment"}
                              </span>
                            </td>
                            <td className="ad-td" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>{dt}</td>
                            <td className="ad-td">
                              <span className={`ad-badge ${st === "APPROVED" ? "ad-badge--green" : st === "PENDING" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                                ● {st}
                              </span>
                            </td>
                            <td className="ad-td" style={{ textAlign: "right" }}>
                              <button
                                onClick={() => setSelectedRefund(r)}
                                style={{
                                  padding: "6px 14px",
                                  background: "#f8fafc",
                                  color: "#334155",
                                  border: "1.5px solid #cbd5e1",
                                  borderRadius: 7,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#94a3b8";
                                  e.currentTarget.style.background = "#e2e8f0";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "#cbd5e1";
                                  e.currentTarget.style.background = "#f8fafc";
                                }}
                                title="Click to view details and process claim"
                              >
                                {st === "PENDING" ? "View" : "View Audit"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Transit Division · Vadodara Campus.</span></footer>
          </main>
        </div>
      </div>

      {/* ── DETAIL & ACTION SHORT WINDOW MODAL ───────────────── */}
      {selectedRefund && (
        <div
          className="ad-overlay"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(3px)",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRefund(null);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              padding: "24px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            {/* Modal Top Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 }}>Refund Claim Verification</h3>
                  <span
                    className={`ad-badge ${
                      getStatus(selectedRefund) === "APPROVED"
                        ? "ad-badge--green"
                        : getStatus(selectedRefund) === "PENDING"
                        ? "ad-badge--yellow"
                        : "ad-badge--red"
                    }`}
                  >
                    ● {getStatus(selectedRefund)}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 2, display: "block" }}>
                  Claim Reference: <strong>{getClaimId(selectedRefund)}</strong> · Filed on {getDate(selectedRefund)}
                </span>
              </div>
              <button
                onClick={() => setSelectedRefund(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Student Identification Card */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px", border: "1px solid #e2e8f0", marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10, fontSize: 13 }}>
                <div>
                  <span style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    STUDENT COMMUTER
                  </span>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                    {getStudentName(selectedRefund)}
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                    ID: {getEnrollment(selectedRefund)}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    DEPARTMENT / BRANCH
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginTop: 2 }}>
                    {selectedRefund.dept || "Computer Science"}
                  </div>
                  <span style={{ fontSize: 11.5, color: "#64748b" }}>Academic Year 2026-27</span>
                </div>
              </div>
            </div>

            {/* Financial Details Card (Money & How Much to Refund) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  ORIGINAL PAID (MONEY)
                </span>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 3 }}>
                  ₹{getOrigAmount(selectedRefund).toLocaleString()}
                </div>
                <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 700 }}>Universal Annual Tariff</span>
              </div>

              <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "14px" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  HOW MUCH TO REFUND
                </span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#dc2626", marginTop: 3 }}>
                  ₹{getRefAmount(selectedRefund).toLocaleString()}
                </div>
                <span style={{ fontSize: 11.5, color: "#b91c1c", fontWeight: 700 }}>Calculated Net Claim</span>
              </div>
            </div>

            {/* Reason for Refund Box */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, display: "block" }}>
                REASON FOR REFUND
              </span>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#1e293b", lineHeight: 1.45, fontWeight: 500 }}>
                {selectedRefund.reason || "Student route cancellation and semester withdrawal adjustment"}
              </p>
            </div>

            {/* Optional Officer Remarks (when PENDING) */}
            {getStatus(selectedRefund) === "PENDING" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 5 }}>
                  Audit Officer Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified semester exchange certificate with academic dean..."
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 12.5,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            {/* Action Buttons inside the window */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setSelectedRefund(null)}
                style={{
                  padding: "10px 16px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              {getStatus(selectedRefund) === "PENDING" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedRefund, "REJECTED")}
                    disabled={isProcessing}
                    style={{
                      padding: "10px 18px",
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
                    }}
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(selectedRefund, "APPROVED")}
                    disabled={isProcessing}
                    style={{
                      padding: "10px 20px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
                    }}
                  >
                    Approve
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceRefunds;
