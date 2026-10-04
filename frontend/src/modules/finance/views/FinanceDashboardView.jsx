import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import { RecordOfflinePaymentModal, ViewReceiptModal } from "./FinanceModals";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { authFetch, currentFinanceAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch("/finance/dashboard");
      if (res && res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn("[FinanceDashboard] Failed to fetch live data:", err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpis = dashboardData || {
    totalRealization: 34250000,
    totalPendingDues: 6125000,
    offlineVerificationQueueCount: 3,
    refundRequestsCount: 2,
    collectionRate: "84.8%",
    recentPayments: [],
  };

  const handleExportMasterExcel = async () => {
    try {
      const token = localStorage.getItem("glow_access_token");
      const res = await fetch(`${API_BASE_URL}/finance/reports/export-excel`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GLOW_Master_Financial_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export Excel report: " + err.message);
    }
  };

  const recentList = (kpis.recentPayments || []).filter(
    (t) =>
      !searchQuery.trim() ||
      t.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.txnRef?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Topbar */}
          <header className="ad-topbar" style={{ flexWrap: "wrap", gap: 10 }}>
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="ad-topbar-title">Finance & Billing Dashboard</div>
              <div className="ad-topbar-subtitle">CFO Operational Realization & Fee Reconciliation Hub</div>
            </div>
            <div className="ad-search-wrap" style={{ minWidth: 220, flex: "1 1 240px" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search transactions, student names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
            </div>
            <div className="ad-topbar-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="ad-btn-secondary"
                onClick={handleExportMasterExcel}
                style={{ padding: "8px 14px", fontSize: 12.5, minHeight: 44, fontWeight: 700 }}
              >
                Export Master Excel
              </button>
              <button
                className="ad-btn-primary"
                onClick={() => setShowRecordModal(true)}
                style={{ padding: "8px 16px", fontSize: 13, minHeight: 44 }}
              >
                + Collect Fee Payment
              </button>
            </div>
          </header>

          <main className="ad-content" style={{ padding: "16px", paddingBottom: "80px" }}>
            {/* ── TOP 4 KPI CARDS (Single Column Stack on Mobile) ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
              className="finance-kpi-grid"
            >
              {/* 1. Total Realization */}
              <div className="ad-stat-card" style={{ padding: "16px" }} onClick={() => navigate("/finance/payments")}>
                <div className="ad-stat-body">
                  <p className="ad-stat-label" style={{ fontSize: 11, fontWeight: 700 }}>Total Realization</p>
                  <p className="ad-stat-value" style={{ color: "#16a34a", fontSize: 24, fontWeight: 900 }}>
                    ₹{(kpis.totalRealization / 100000).toFixed(2)} Lakh
                  </p>
                  <p className="ad-stat-meta ad-stat-meta--green" style={{ fontSize: 11 }}>
                    {kpis.collectionRate} Realized Inflow
                  </p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
                  <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={24} stroke="#16a34a" />
                </div>
              </div>

              {/* 2. Dues Pending */}
              <div className="ad-stat-card" style={{ padding: "16px" }} onClick={() => navigate("/finance/pending")}>
                <div className="ad-stat-body">
                  <p className="ad-stat-label" style={{ fontSize: 11, fontWeight: 700 }}>Dues Pending</p>
                  <p className="ad-stat-value" style={{ color: "#ea580c", fontSize: 24, fontWeight: 900 }}>
                    ₹{(kpis.totalPendingDues / 100000).toFixed(2)} Lakh
                  </p>
                  <p className="ad-stat-meta ad-stat-meta--red" style={{ fontSize: 11 }}>
                    Click to review defaulters
                  </p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#fff7ed" }}>
                  <Icon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={24} stroke="#ea580c" />
                </div>
              </div>

              {/* 3. Offline Verification Queue */}
              <div className="ad-stat-card" style={{ padding: "16px" }} onClick={() => navigate("/finance/verification")}>
                <div className="ad-stat-body">
                  <p className="ad-stat-label" style={{ fontSize: 11, fontWeight: 700 }}>Offline Verification</p>
                  <p className="ad-stat-value" style={{ color: "#2563eb", fontSize: 24, fontWeight: 900 }}>
                    {kpis.offlineVerificationQueueCount} Slips
                  </p>
                  <p className="ad-stat-meta ad-stat-meta--blue" style={{ fontSize: 11 }}>
                    Awaiting Bank Seal Check
                  </p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
                  <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={24} stroke="#2563eb" />
                </div>
              </div>

              {/* 4. Refund Requests Count */}
              <div className="ad-stat-card" style={{ padding: "16px" }} onClick={() => navigate("/finance/refunds")}>
                <div className="ad-stat-body">
                  <p className="ad-stat-label" style={{ fontSize: 11, fontWeight: 700 }}>Refund Requests</p>
                  <p className="ad-stat-value" style={{ color: "#dc2626", fontSize: 24, fontWeight: 900 }}>
                    {kpis.refundRequestsCount} Pending
                  </p>
                  <p className="ad-stat-meta ad-stat-meta--yellow" style={{ fontSize: 11 }}>
                    Pass Cancellation Claims
                  </p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#fef2f2" }}>
                  <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" size={24} stroke="#dc2626" />
                </div>
              </div>
            </div>

            {/* ── REAL RECENT TRANSACTIONS STREAM ── */}
            <div className="ad-card" style={{ padding: "16px" }}>
              <div
                className="ad-card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 className="ad-card-title" style={{ fontSize: 15, fontWeight: 800 }}>
                    Live Transaction Feed & Payment Receipts
                  </h3>
                  <p style={{ fontSize: 11.5, color: "#64748b" }}>
                    Verified payments from UPI, NetBanking, Cards & Bank Challan registers
                  </p>
                </div>
                <button
                  className="ad-btn-secondary"
                  onClick={() => navigate("/finance/payments")}
                  style={{ fontSize: 12.5, minHeight: 40, padding: "8px 14px" }}
                >
                  View All Payments →
                </button>
              </div>

              <div className="ad-table-wrap" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table className="ad-table" style={{ width: "100%", minWidth: 680 }}>
                  <thead>
                    <tr>
                      <th className="ad-th">Transaction Ref</th>
                      <th className="ad-th">Student Name</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Gateway Mode</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th" style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No recent transactions found.
                        </td>
                      </tr>
                    ) : (
                      recentList.map((t) => (
                        <tr key={t.id || t.txnRef} className="ad-tr">
                          <td className="ad-td" style={{ fontWeight: 800 }}>{t.txnRef}</td>
                          <td className="ad-td"><strong>{t.studentName}</strong></td>
                          <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>
                            ₹{t.amount?.toLocaleString()}
                          </td>
                          <td className="ad-td">
                            <span className="ad-badge ad-badge--blue">{t.gateway}</span>
                          </td>
                          <td className="ad-td">
                            {t.date ? new Date(t.date).toISOString().slice(0, 10) : "2026-09-18"}
                          </td>
                          <td className="ad-td">
                            <span className="ad-badge ad-badge--green">● {t.status}</span>
                          </td>
                          <td className="ad-td" style={{ textAlign: "right" }}>
                            <button
                              onClick={() => setSelectedReceiptTxn(t)}
                              style={{
                                padding: "6px 12px",
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                minHeight: 36,
                              }}
                            >
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

            <footer className="ad-footer" style={{ marginTop: 24, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
              <span>© 2026 GLOW Finance & Accounts Directorate · GSFC University Vadodara</span>
            </footer>
          </main>

          {/* ── MOBILE STICKY SUMMARY BAR FOR CFO WALKING ON THE GO ── */}
          <div
            className="finance-sticky-cfo-bar"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#0f172a",
              color: "#fff",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 999,
              boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
              borderTop: "1px solid #1e293b",
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                CFO Quick Glance · Total Pending
              </span>
              <strong style={{ fontSize: 16, color: "#fb923c" }}>
                ₹{(kpis.totalPendingDues / 100000).toFixed(2)} Lakh
              </strong>
            </div>
            <button
              onClick={() => navigate("/finance/pending")}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                minHeight: 40,
              }}
            >
              Review Defaulters →
            </button>
          </div>
        </div>
      </div>

      {/* Record Offline Fee Payment Modal */}
      {showRecordModal && (
        <RecordOfflinePaymentModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          onPaymentRecorded={() => fetchDashboard()}
        />
      )}

      {/* View Receipt Modal */}
      {selectedReceiptTxn && (
        <ViewReceiptModal
          isOpen={!!selectedReceiptTxn}
          onClose={() => setSelectedReceiptTxn(null)}
          transaction={selectedReceiptTxn}
        />
      )}
    </div>
  );
};

export default FinanceDashboard;
