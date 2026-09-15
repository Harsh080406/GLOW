import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportToExcel } from "../../../shared/utils/excelExport";
import { RecordOfflinePaymentModal, ViewReceiptModal, SendBulkRemindersModal } from "./FinanceModals";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { transactions, offlinePayments, refundRequests, currentFinanceAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);

  const filteredTxns = transactions.filter(
    (t) =>
      t.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.refNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportTransactionsExcel = () => {
    const dataToExport = transactions.map((t) => ({
      "Transaction ID": t.id,
      "Receipt No": t.receiptId || "REC-2026-0001",
      "Student Name": t.studentName,
      "Student ID": t.studentId,
      "Department": t.dept,
      "Route": t.route,
      "Amount (INR)": t.amount,
      "Date": t.date,
      "Payment Mode": t.method,
      "Reference / UTR": t.refNo,
      "Status": t.status,
    }));

    exportToExcel(dataToExport, `GLOW_Fee_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`, "Transactions Ledger");
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Topbar */}
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Finance & Billing Dashboard</div>
              <div className="ad-topbar-subtitle">Accounts, Fee Collections & Reconciliation Portal</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search invoices, receipts, student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
            </div>
            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={() => setShowRecordModal(true)}
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                + Record Offline Fee
              </button>
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                onClick={() => navigate("/finance/profile")}
                title="View Finance Profile"
              >
                <div className="ad-avatar" style={{ background: "#0066ff" }}>{currentFinanceAdmin?.avatar || "RD"}</div>
                <div className="ad-avatar-info">
                  <span className="ad-avatar-name">{currentFinanceAdmin?.name || "CMA Rajesh Dave"}</span>
                  <span className="ad-avatar-role">Finance & Accounts · Profile →</span>
                </div>
              </div>
            </div>
          </header>

          <main className="ad-content">
            {/* ── TOP 4 CARDS AS SPECIFIED IN REQUIREMENT ──────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Total Fees Expected</p>
                  <p className="ad-stat-value">₹25.4 Lakh</p>
                  <p className="ad-stat-meta ad-stat-meta--green">AY 2026-27 Target</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
                  <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={26} stroke="#0066ff" />
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Fees Collected</p>
                  <p className="ad-stat-value" style={{ color: "#16a34a" }}>₹21.8 Lakh</p>
                  <p className="ad-stat-meta ad-stat-meta--green">85.8% Realized</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
                  <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" size={26} stroke="#16a34a" />
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Pending Dues</p>
                  <p className="ad-stat-value" style={{ color: "#ea580c" }}>₹3.6 Lakh</p>
                  <p className="ad-stat-meta ad-stat-meta--red">Due: 15 Sep 2026</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#fff7ed" }}>
                  <Icon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={26} stroke="#ea580c" />
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Students Pending</p>
                  <p className="ad-stat-value">530 Students</p>
                  <p className="ad-stat-meta ad-stat-meta--yellow">Reminders Queued</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#fefce8" }}>
                  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={26} stroke="#ca8a04" />
                </div>
              </div>
            </div>

            {/* ── CHARTS & BREAKDOWN ROW ──────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 24 }}>
              {/* Monthly Collection Bar Graph */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <div>
                    <h3 className="ad-card-title">Monthly Collection Trend (₹ Lakhs)</h3>
                    <p style={{ fontSize: 12, color: "#64748b" }}>Academic Year 2026-2027 Inflow Trajectory</p>
                  </div>
                  <span className="ad-badge ad-badge--blue">● Real-time sync</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 180, padding: "20px 10px 10px", borderBottom: "1px solid #e2e8f0" }}>
                  {[
                    { month: "June", val: 8.2, height: "48%", color: "#0066ff" },
                    { month: "July", val: 12.4, height: "72%", color: "#2563eb" },
                    { month: "August", val: 15.8, height: "92%", color: "#16a34a" },
                    { month: "September (Est)", val: 3.6, height: "24%", color: "#94a3b8" },
                  ].map((b) => (
                    <div key={b.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>₹{b.val}L</span>
                      <div style={{ width: "100%", maxWidth: 60, height: b.height, background: b.color, borderRadius: "6px 6px 0 0", transition: "height 0.5s ease" }} />
                      <span style={{ fontSize: 12, color: "#64748b", marginTop: 8, fontWeight: 600 }}>{b.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions & Queues */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <h3 className="ad-card-title">Pending Action Queues</h3>
                  <span className="ad-badge ad-badge--yellow">Priority Tasks</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    onClick={() => navigate("/finance/verification")}
                    style={{ padding: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>Offline Slip Verification</h4>
                      <p style={{ fontSize: 12, color: "#15803d" }}>{offlinePayments.filter((p) => p.status === "PENDING").length} Challan / Bank deposits awaiting review</p>
                    </div>
                    <span className="ad-badge ad-badge--green">Verify Now →</span>
                  </div>

                  <div
                    onClick={() => navigate("/finance/refunds")}
                    style={{ padding: "14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#9a3412" }}>Refund Requests</h4>
                      <p style={{ fontSize: 12, color: "#c2410c" }}>{refundRequests.filter((r) => r.status === "PENDING").length} Student refund request pending approval</p>
                    </div>
                    <span className="ad-badge ad-badge--yellow">Review →</span>
                  </div>

                  <div
                    onClick={() => setShowRemindersModal(true)}
                    style={{ padding: "14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e40af" }}>Broadcast Fee Reminders</h4>
                      <p style={{ fontSize: 12, color: "#2563eb" }}>SMS / Email triggers to 530 students</p>
                    </div>
                    <span className="ad-badge ad-badge--blue">Broadcast →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RECENT TRANSACTIONS LEDGER ──────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Recent Fee Transactions ({filteredTxns.length})</h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Real-time payment gateway and offline deposits feed</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ad-btn-secondary" onClick={handleExportTransactionsExcel}>
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} />
                    Export Excel (.xlsx)
                  </button>
                  <button className="ad-btn-primary" onClick={() => navigate("/finance/payments")}>
                    View All Payments
                  </button>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Transaction ID</th>
                      <th className="ad-th">Student</th>
                      <th className="ad-th">Department</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Payment Method</th>
                      <th className="ad-th">Reference UTR</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.slice(0, 6).map((t) => (
                      <tr key={t.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                        <td className="ad-td">
                          <strong>{t.studentName}</strong>
                          <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>{t.studentId}</span>
                        </td>
                        <td className="ad-td">{t.dept}</td>
                        <td className="ad-td">{t.route}</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>₹{t.amount.toLocaleString()}</td>
                        <td className="ad-td">{t.method}</td>
                        <td className="ad-td" style={{ fontFamily: "monospace", fontSize: 12 }}>{t.refNo}</td>
                        <td className="ad-td"><span className="ad-badge ad-badge--green">● {t.status}</span></td>
                        <td className="ad-td">
                          <button
                            onClick={() => setSelectedReceiptTxn(t)}
                            style={{
                              padding: "4px 10px",
                              background: "#eff6ff",
                              color: "#0066ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>

      {/* Modals */}
      <RecordOfflinePaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />

      <ViewReceiptModal
        isOpen={!!selectedReceiptTxn}
        transaction={selectedReceiptTxn}
        onClose={() => setSelectedReceiptTxn(null)}
      />

      <SendBulkRemindersModal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
      />
    </div>
  );
};

export default FinanceDashboard;
