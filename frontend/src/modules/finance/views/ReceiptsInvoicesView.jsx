import { useState } from "react";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportToExcel } from "../../../shared/utils/excelExport";
import { ViewReceiptModal, RecordOfflinePaymentModal } from "./FinanceModals";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ReceiptsInvoices = () => {
  const { transactions } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const filtered = transactions.filter(
    (t) =>
      t.id?.toLowerCase().includes(search.toLowerCase()) ||
      t.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      t.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      t.receiptId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportInvoicesExcel = () => {
    const dataToExport = filtered.map((t) => ({
      "Receipt Number": t.receiptId || `REC-2026-${t.id?.replace(/\D/g, "") || "8819"}`,
      "Transaction ID": t.id,
      "Student Name": t.studentName,
      "Student ID": t.studentId,
      "Department": t.dept,
      "Route": t.route,
      "Amount (INR)": t.amount,
      "Receipt Date": t.date,
      "Payment Mode": t.method,
      "Reference UTR": t.refNo,
      "Status": "CERTIFIED & SETTLED",
    }));

    exportToExcel(dataToExport, `GLOW_Tax_Invoices_Receipts_${new Date().toISOString().slice(0, 10)}.xlsx`, "Receipts Invoices");
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="receipts" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Official Receipts & Tax Invoices</div>
              <div className="ad-topbar-subtitle">Generate, preview, reprint and download certified transport payment receipts</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search by receipt no, txn ID, student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={() => setShowRecordModal(true)}
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                + Generate Invoice / Fee
              </button>
            </div>
          </header>

          <main className="ad-content">
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Generated Invoices & Receipts ({filtered.length})</h3>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Certified tax invoice repository</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ad-btn-secondary" onClick={handleExportInvoicesExcel}>
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} />
                    Export Invoices (.xlsx)
                  </button>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Receipt No</th>
                      <th className="ad-th">Txn ID</th>
                      <th className="ad-th">Student Name</th>
                      <th className="ad-th">Student ID</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 800, color: "#0066ff" }}>{t.receiptId || `REC-2026-${t.id?.replace(/\D/g, "") || "8910"}`}</td>
                        <td className="ad-td">{t.id}</td>
                        <td className="ad-td"><strong>{t.studentName}</strong></td>
                        <td className="ad-td">{t.studentId}</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>₹{t.amount.toLocaleString()}</td>
                        <td className="ad-td">{t.date}</td>
                        <td className="ad-td">
                          <button
                            onClick={() => setActiveReceipt(t)}
                            style={{ padding: "4px 12px", background: "#eff6ff", color: "#0066ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            Preview & Print
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

      {/* View Tax Invoice Modal */}
      <ViewReceiptModal
        isOpen={!!activeReceipt}
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Record Payment Modal */}
      <RecordOfflinePaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />
    </div>
  );
};

export default ReceiptsInvoices;
