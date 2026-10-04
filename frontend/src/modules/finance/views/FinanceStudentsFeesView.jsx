import { useState } from "react";
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

const FinanceStudentsFees = () => {
  const { students, transactions, authFetch } = useTransit();
  const [searchTerm, setSearchTerm] = useState("UNI20260125");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reminderSent, setReminderSent] = useState(null);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordTargetId, setRecordTargetId] = useState("");
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);

  const matchedStudent = students.find(
    (s) =>
      s.id?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      s.enrollmentId?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      s.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  ) || students[0];

  const studentTxns = (transactions || []).filter(
    (t) => t.studentId === matchedStudent?.id || t.studentId === matchedStudent?.enrollmentId
  );

  const handleSendReminder = async (student) => {
    const sId = student.id || student.enrollmentId;
    setReminderSent(sId);
    try {
      await authFetch(`/finance/students/${sId}/remind`, { method: "POST" });
    } catch (err) {
      console.warn("Reminder dispatch note:", err.message);
    }
    setTimeout(() => setReminderSent(null), 3000);
  };

  const handleOpenPaymentForStudent = (stuId) => {
    setRecordTargetId(stuId);
    setShowRecordModal(true);
  };

  const handleExportAllStudentsExcel = () => {
    const dataToExport = students.slice(0, 1000).map((s) => ({
      "Student ID": s.id,
      "Name": s.name,
      "Email": s.email || `${s.name.toLowerCase().replace(/\s+/g, ".")}@glowbus.edu`,
      "Department": s.dept || s.course || "Computer Science",
      "Route": s.routeName || s.route || "Route 4D",
      "Pickup Stop": s.pickupStop || s.boarding || "Fatehgunj",
      "Total Fee (INR)": s.totalFee || 15000,
      "Paid Fee (INR)": s.paidFee || 0,
      "Pending Fee (INR)": s.pendingFee || 0,
      "Payment Status": s.paymentStatus || (s.pendingFee > 0 ? "PARTIAL" : "PAID"),
      "Pass Status": s.passStatus || s.pass || "Active",
    }));

    exportToExcel(dataToExport, `GLOW_Students_Fee_Roster_${new Date().toISOString().slice(0, 10)}.xlsx`, "Student Fee Roster");
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="students" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Students & Fee Ledger</div>
              <div className="ad-topbar-subtitle">Look up student transport balances, payment history & trigger reminders</div>
            </div>
            <div className="ad-search-wrap" style={{ maxWidth: 380 }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search by ID (e.g. UNI20260125) or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={() => handleOpenPaymentForStudent(matchedStudent?.id || "")}
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                + Collect Offline Fee
              </button>
            </div>
          </header>

          <main className="ad-content">
            {/* ── SEARCHED STUDENT CARD MATCHING REQUIREMENT EXACTLY ────── */}
            {matchedStudent && (
              <div style={{ background: "#fff", border: "1.5px solid #cbd5e1", borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 18, marginBottom: 18 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>STUDENT FEE ACCOUNT</span>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>{matchedStudent.name}</h2>
                    <p style={{ fontSize: 13.5, color: "#475569" }}>
                      ID: <strong>{matchedStudent.id}</strong> &nbsp;·&nbsp; Department: <strong>{matchedStudent.dept || matchedStudent.course}</strong> &nbsp;·&nbsp; Year: <strong>{matchedStudent.year}</strong>
                    </p>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                      Transport Plan: <strong>Zone B ({matchedStudent.routeName || matchedStudent.route})</strong> &nbsp;·&nbsp; Pickup: <strong>{matchedStudent.pickupStop || matchedStudent.boarding}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span className={`ad-badge ${matchedStudent.paymentStatus === "PAID" ? "ad-badge--green" : matchedStudent.paymentStatus === "PARTIAL" ? "ad-badge--yellow" : "ad-badge--red"}`} style={{ fontSize: 14, padding: "6px 14px" }}>
                      STATUS: {matchedStudent.paymentStatus || (matchedStudent.pendingFee > 0 ? "PARTIAL" : "PAID")}
                    </span>
                  </div>
                </div>

                {/* 3 Fee summary figures */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                    <p style={{ fontSize: 11.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Transport Fee</p>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>₹{(matchedStudent.totalFee || 15000).toLocaleString()}</h3>
                  </div>

                  <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: 10 }}>
                    <p style={{ fontSize: 11.5, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Amount Paid</p>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: "#16a34a", marginTop: 2 }}>₹{(matchedStudent.paidFee || 0).toLocaleString()}</h3>
                  </div>

                  <div style={{ background: (matchedStudent.pendingFee || 0) > 0 ? "#fff7ed" : "#f0fdf4", padding: "14px", borderRadius: 10 }}>
                    <p style={{ fontSize: 11.5, color: (matchedStudent.pendingFee || 0) > 0 ? "#9a3412" : "#166534", fontWeight: 700, textTransform: "uppercase" }}>Amount Pending</p>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: (matchedStudent.pendingFee || 0) > 0 ? "#ea580c" : "#16a34a", marginTop: 2 }}>₹{(matchedStudent.pendingFee || 0).toLocaleString()}</h3>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleOpenPaymentForStudent(matchedStudent.id)}
                    className="ad-btn-primary"
                    style={{ padding: "10px 20px" }}
                  >
                    + Record Payment (₹{(matchedStudent.pendingFee || 5000).toLocaleString()})
                  </button>
                  <button
                    onClick={() => handleSendReminder(matchedStudent)}
                    style={{ padding: "10px 20px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    {reminderSent === matchedStudent.id ? "✓ Reminder Sent to Student SMS/Email!" : "📲 Send Fee Reminder"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="ad-btn-secondary"
                    style={{ padding: "10px 20px" }}
                  >
                    📄 Print Statement
                  </button>
                </div>
              </div>
            )}

            {/* ── STUDENT PAYMENT HISTORY TABLE ───────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Payment History for {matchedStudent?.name}</h3>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Past receipts and recorded clearance</p>
                </div>
                <span className="ad-badge ad-badge--blue">{studentTxns.length} Transactions</span>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Txn ID</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Payment Method</th>
                      <th className="ad-th">Reference UTR</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentTxns.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>No payments on record yet for this student.</td>
                      </tr>
                    ) : (
                      studentTxns.map((t) => (
                        <tr key={t.id} className="ad-tr">
                          <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                          <td className="ad-td">{t.date}</td>
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
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── ALL STUDENTS FEE LEDGER OVERVIEW ─────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">All Students Fee Roster (4,250 Records)</h3>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Master fee accounts across university transport network</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ad-btn-secondary" onClick={handleExportAllStudentsExcel}>
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} />
                    Export Excel (.xlsx)
                  </button>
                </div>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Student ID</th>
                      <th className="ad-th">Name</th>
                      <th className="ad-th">Department</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Total Fee</th>
                      <th className="ad-th">Paid</th>
                      <th className="ad-th">Pending</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 15).map((s) => (
                      <tr key={s.id} className="ad-tr" style={{ cursor: "pointer" }} onClick={() => setSearchTerm(s.id)}>
                        <td className="ad-td" style={{ fontWeight: 700 }}>{s.id}</td>
                        <td className="ad-td"><strong>{s.name}</strong></td>
                        <td className="ad-td">{s.dept || s.course}</td>
                        <td className="ad-td">{s.routeName || s.route}</td>
                        <td className="ad-td">₹{(s.totalFee || 15000).toLocaleString()}</td>
                        <td className="ad-td" style={{ color: "#16a34a", fontWeight: 700 }}>₹{(s.paidFee || 0).toLocaleString()}</td>
                        <td className="ad-td" style={{ color: (s.pendingFee || 0) > 0 ? "#ea580c" : "#16a34a", fontWeight: 700 }}>
                          ₹{(s.pendingFee || 0).toLocaleString()}
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${(s.paymentStatus || "").toUpperCase() === "PAID" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            {(s.paymentStatus || "PARTIAL").toUpperCase()}
                          </span>
                        </td>
                        <td className="ad-td">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPaymentForStudent(s.id);
                            }}
                            className="ad-btn-primary"
                            style={{ padding: "4px 10px", fontSize: 11.5 }}
                          >
                            + Collect
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
        defaultStudentId={recordTargetId}
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

export default FinanceStudentsFees;
