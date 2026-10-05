import { useState, useEffect } from "react";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportToExcel } from "../../../shared/utils/excelExport";
import { RecordOfflinePaymentModal, ViewReceiptModal } from "./FinanceModals";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d={d} />
</svg>
);

const FinancePayments = () => {
  const { transactions, setTransactions, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchPaymentsStream = async () => {
      try {
        const queryParam = methodFilter !== "ALL" ? `?gateway=${encodeURIComponent(methodFilter)}` : "";
        const res = await authFetch(`/finance/payments${queryParam}`);
        if (res?.success && res?.payments) {
          setTransactions(res.payments);
        }
      } catch (err) {
        console.warn("Could not fetch payments stream:", err.message);
      }
    };
    fetchPaymentsStream();
  }, [methodFilter, authFetch, setTransactions]);

  const filteredTxns = (transactions || []).filter((t) => {
    const matchesSearch =
      t.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.refNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === "ALL" || (t.method && t.method.includes(methodFilter));
    return matchesSearch && matchesMethod;
  });

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await authFetch("/finance/payments/export-excel", { responseType: "blob" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GLOW_Payment_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Server excel export fallback:", err.message);
      const dataToExport = filteredTxns.map((t) => ({
        "Transaction ID": t.id,
        "Receipt No": t.receiptId || "REC-2026-0001",
        "Student Name": t.studentName,
        "Student ID": t.studentId,
        "Department": t.dept,
        "Route": t.route,
        "Amount (INR)": t.amount,
        "Payment Date": t.date,
        "Payment Method": t.method,
        "Reference UTR": t.refNo,
        "Status": t.status,
      }));
      exportToExcel(dataToExport, `GLOW_Payment_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`, "Payments Ledger");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintInvoice = async (t) => {
    try {
      const blob = await authFetch(`/finance/payments/${t.id}/invoice-pdf`, { responseType: "blob" });
      if (!blob || !(blob instanceof Blob)) {
        throw new Error("Invalid invoice blob received");
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GLOW_Invoice_${t.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Server invoice PDF fallback:", err.message);
      setSelectedReceiptTxn(t);
    }
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="payments" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">All Payment Transactions</div>
              <div className="ad-topbar-subtitle">Complete ledger of fee collections, payment methods & gateway references</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search transaction ID, student, UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>
          </header>

          <main className="ad-content">
            {/* ── FILTERS ────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["ALL", "UPI", "HDFC NetBanking", "Debit Card", "Cash Counter", "Challan"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: 12.5,
                      fontWeight: 700,
                      border: `1.5px solid ${methodFilter === m ? "#0066ff" : "#e2e8f0"}`,
                      background: methodFilter === m ? "#eff6ff" : "#fff",
                      color: methodFilter === m ? "#0066ff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {m === "ALL" ? "All Methods" : m}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="ad-btn-secondary" onClick={handleExportExcel}>
                  <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} />
                  Export Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* ── TRANSACTIONS TABLE ─────────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Transactions Record ({filteredTxns.length})</h3>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Live audited transactions log with certified receipts</p>
                </div>
                <span className="ad-badge ad-badge--blue">Ledger Synchronized</span>
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
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Payment Method</th>
                      <th className="ad-th">Reference UTR</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map((t) => (
                      <tr key={t.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                        <td className="ad-td">
                          <strong>{t.studentName}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{t.studentId}</span>
                        </td>
                        <td className="ad-td">{t.dept}</td>
                        <td className="ad-td">{t.route}</td>
                        <td className="ad-td" style={{ fontWeight: 900, color: "#16a34a", fontSize: 14 }}>₹{t.amount.toLocaleString()}</td>
                        <td className="ad-td">{t.date}</td>
                        <td className="ad-td">{t.method}</td>
                        <td className="ad-td" style={{ fontFamily: "monospace", fontSize: 12 }}>{t.refNo}</td>
                        <td className="ad-td"><span className="ad-badge ad-badge--green">● {t.status}</span></td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setSelectedReceiptTxn(t)}
                              style={{
                                padding: "4px 8px",
                                background: "#eff6ff",
                                color: "#0066ff",
                                border: "1px solid #bfdbfe",
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Receipt
                            </button>
                            <button
                              onClick={() => handlePrintInvoice(t)}
                              style={{
                                padding: "4px 8px",
                                background: "#f8fafc",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                              title="Download official PDF invoice"
                            >
                              🖨️ PDF
                            </button>
                          </div>
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
    </div>
  );
};

export default FinancePayments;
