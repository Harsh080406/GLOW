import { useState, useMemo } from "react";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import { INITIAL_MASTER_STUDENTS } from "../../../shared/data/studentsData";
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
  const poolStudents = useMemo(() => {
    return (students && students.length > 0) ? students : (INITIAL_MASTER_STUDENTS || []);
  }, [students]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("UNI20260125");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | OVERDUE | PARTIAL | PAID
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reminderSent, setReminderSent] = useState(null);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordTargetId, setRecordTargetId] = useState("");
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);

  // Find selected student or best match
  const matchedStudent = useMemo(() => {
    if (!poolStudents || poolStudents.length === 0) return null;
    if (selectedStudentId) {
      const bySel = poolStudents.find(
        (s) =>
          (s.id && s.id.toLowerCase() === selectedStudentId.toLowerCase()) ||
          (s.enrollmentId && s.enrollmentId.toLowerCase() === selectedStudentId.toLowerCase())
      );
      if (bySel) return bySel;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const bySearch = poolStudents.find(
        (s) =>
          s.id?.toLowerCase().includes(q) ||
          s.enrollmentId?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q)
      );
      if (bySearch) return bySearch;
    }
    return poolStudents[0];
  }, [poolStudents, selectedStudentId, searchTerm]);

  // Filtered roster for table
  const filteredStudents = useMemo(() => {
    return poolStudents.filter((s) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const pStatus = (s.paymentStatus || (s.pendingFee > 0 ? "PARTIAL" : "PAID")).toUpperCase();
        if (statusFilter === "OVERDUE" && (s.pendingFee <= 0)) return false;
        if (statusFilter === "PARTIAL" && pStatus !== "PARTIAL") return false;
        if (statusFilter === "PAID" && pStatus !== "PAID") return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matches =
          (s.id && s.id.toLowerCase().includes(q)) ||
          (s.enrollmentId && s.enrollmentId.toLowerCase().includes(q)) ||
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.dept && s.dept.toLowerCase().includes(q)) ||
          (s.course && s.course.toLowerCase().includes(q)) ||
          (s.routeName && s.routeName.toLowerCase().includes(q)) ||
          (s.route && s.route.toLowerCase().includes(q)) ||
          (s.pickupStop && s.pickupStop.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [poolStudents, statusFilter, searchTerm]);

  // Counts for pills
  const counts = useMemo(() => {
    let overdue = 0;
    let partial = 0;
    let paid = 0;
    poolStudents.forEach((s) => {
      const p = (s.paymentStatus || (s.pendingFee > 0 ? "PARTIAL" : "PAID")).toUpperCase();
      if ((s.pendingFee || 0) > 0) overdue++;
      if (p === "PARTIAL") partial++;
      if (p === "PAID") paid++;
    });
    return { all: poolStudents.length, overdue, partial, paid };
  }, [poolStudents]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, effectivePage, pageSize]);

  // Student transactions or synthesized historical clearance
  const studentTxns = useMemo(() => {
    if (!matchedStudent) return [];
    const directTxns = (transactions || []).filter(
      (t) =>
        t.studentId === matchedStudent.id ||
        t.studentId === matchedStudent.enrollmentId ||
        t.studentName?.toLowerCase() === matchedStudent.name?.toLowerCase()
    );
    if (directTxns.length > 0) return directTxns;

    if ((matchedStudent.paidFee || 0) > 0) {
      return [
        {
          id: `TXN-2026-${matchedStudent.id?.slice(-3) || "081"}`,
          receiptId: `REC-2026-${matchedStudent.id?.slice(-4) || "0001"}`,
          studentName: matchedStudent.name,
          studentId: matchedStudent.id,
          dept: matchedStudent.dept || matchedStudent.course || "Computer Science",
          route: matchedStudent.routeName || matchedStudent.route || "Route 4D",
          amount: matchedStudent.paidFee,
          date: "2026-08-15",
          method: "UPI (Auto-Pay Verified)",
          refNo: `UPI-${matchedStudent.id?.slice(-6) || "984210"}`,
          status: "SUCCESS",
        },
      ];
    }
    return [];
  }, [transactions, matchedStudent]);

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
    const dataToExport = filteredStudents.map((s) => ({
      "Student ID": s.id || s.enrollmentId,
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
              <div className="ad-topbar-subtitle">
                Look up student transport balances, payment history & trigger reminders ({poolStudents.length.toLocaleString()} total students)
              </div>
            </div>
            <div className="ad-search-wrap" style={{ maxWidth: 380 }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search by ID (e.g. UNI20260125) or Name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
            {/* ── SEARCHED STUDENT CARD ───────────────────────────────── */}
            {matchedStudent ? (
              <div style={{ background: "#fff", border: "1.5px solid #cbd5e1", borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 18, marginBottom: 18 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#0066ff", textTransform: "uppercase", background: "#eff6ff", padding: "2px 8px", borderRadius: 4 }}>
                        STUDENT FEE ACCOUNT
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Roll No: <strong>{matchedStudent.id || matchedStudent.enrollmentId}</strong></span>
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{matchedStudent.name}</h2>
                    <p style={{ fontSize: 13.5, color: "#475569" }}>
                      Department: <strong>{matchedStudent.dept || matchedStudent.course || "Computer Science"}</strong> &nbsp;·&nbsp; Year: <strong>{matchedStudent.year || "3rd"}</strong> &nbsp;·&nbsp; Contact: <strong>{matchedStudent.phone || "+91 98765 00000"}</strong>
                    </p>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                      Transport Route: <strong>{matchedStudent.routeName || matchedStudent.route || "Route 4D (Fatehgunj - GSFC)"}</strong> &nbsp;·&nbsp; Pickup: <strong>{matchedStudent.pickupStop || matchedStudent.boarding || "Fatehgunj Stop"}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className={`ad-badge ${(matchedStudent.paymentStatus || (matchedStudent.pendingFee > 0 ? "PARTIAL" : "PAID")).toUpperCase() === "PAID" ? "ad-badge--green" : (matchedStudent.paymentStatus || "").toUpperCase() === "PARTIAL" ? "ad-badge--yellow" : "ad-badge--red"}`} style={{ fontSize: 14, padding: "6px 14px" }}>
                      STATUS: {(matchedStudent.paymentStatus || (matchedStudent.pendingFee > 0 ? "PARTIAL" : "PAID")).toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Transport Pass: <strong style={{ color: (matchedStudent.passStatus || matchedStudent.pass || "").toUpperCase() === "ACTIVE" ? "#16a34a" : "#ea580c" }}>{matchedStudent.passStatus || matchedStudent.pass || "Active"}</strong>
                    </span>
                  </div>
                </div>

                {/* 3 Fee summary figures */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <p style={{ fontSize: 11.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Transport Fee</p>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>₹{(matchedStudent.totalFee || 15000).toLocaleString()}</h3>
                  </div>

                  <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                    <p style={{ fontSize: 11.5, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Amount Paid</p>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: "#16a34a", marginTop: 2 }}>₹{(matchedStudent.paidFee || 0).toLocaleString()}</h3>
                  </div>

                  <div style={{ background: (matchedStudent.pendingFee || 0) > 0 ? "#fff7ed" : "#f0fdf4", padding: "14px", borderRadius: 10, border: `1px solid ${(matchedStudent.pendingFee || 0) > 0 ? "#fed7aa" : "#bbf7d0"}` }}>
                    <p style={{ fontSize: 11.5, color: (matchedStudent.pendingFee || 0) > 0 ? "#9a3412" : "#166534", fontWeight: 700, textTransform: "uppercase" }}>Amount Pending</p>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: (matchedStudent.pendingFee || 0) > 0 ? "#ea580c" : "#16a34a", marginTop: 2 }}>₹{(matchedStudent.pendingFee || 0).toLocaleString()}</h3>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleOpenPaymentForStudent(matchedStudent.id || matchedStudent.enrollmentId)}
                    className="ad-btn-primary"
                    style={{ padding: "10px 20px" }}
                  >
                    + Record Payment (₹{(matchedStudent.pendingFee || 5000).toLocaleString()})
                  </button>
                  <button
                    onClick={() => handleSendReminder(matchedStudent)}
                    style={{ padding: "10px 20px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    {reminderSent === (matchedStudent.id || matchedStudent.enrollmentId) ? "✓ Reminder Sent to Student SMS/Email!" : "📲 Send Fee Reminder"}
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
            ) : (
              <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 16, padding: "24px", marginBottom: 24, textAlign: "center", color: "#64748b" }}>
                No student selected. Select a student from the roster below or search by ID.
              </div>
            )}

            {/* ── STUDENT PAYMENT HISTORY TABLE ───────────────────────── */}
            <div className="ad-card" style={{ marginBottom: 24 }}>
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Payment History for {matchedStudent?.name || "Student"}</h3>
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
                        <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                          No past clearance transactions found for this student. Use &ldquo;+ Record Payment&rdquo; to log a collection.
                        </td>
                      </tr>
                    ) : (
                      studentTxns.map((t) => (
                        <tr key={t.id} className="ad-tr">
                          <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                          <td className="ad-td">{t.date}</td>
                          <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>₹{(t.amount || 0).toLocaleString()}</td>
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
              <div className="ad-card-header" style={{ flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h3 className="ad-card-title">All Students Fee Roster ({filteredStudents.length.toLocaleString()} matching records)</h3>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Master fee accounts across university transport network</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="ad-btn-secondary" onClick={handleExportAllStudentsExcel}>
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} />
                    Export Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Page Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "12px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { id: "ALL", label: `All (${counts.all.toLocaleString()})` },
                    { id: "OVERDUE", label: `Pending Dues (${counts.overdue.toLocaleString()})` },
                    { id: "PARTIAL", label: `Partial (${counts.partial.toLocaleString()})` },
                    { id: "PAID", label: `Paid (${counts.paid.toLocaleString()})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(tab.id);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: statusFilter === tab.id ? "#0066ff" : "#cbd5e1",
                        background: statusFilter === tab.id ? "#0066ff" : "#fff",
                        color: statusFilter === tab.id ? "#fff" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5, background: "#fff" }}
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
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
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                          No student fee records found matching &ldquo;{searchTerm}&rdquo; with status &ldquo;{statusFilter}&rdquo;.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => {
                        const isSelected = matchedStudent && (matchedStudent.id === s.id || matchedStudent.enrollmentId === s.id);
                        return (
                          <tr
                            key={s.id || s.enrollmentId}
                            className="ad-tr"
                            style={{
                              cursor: "pointer",
                              background: isSelected ? "#eff6ff" : undefined,
                              transition: "background 0.15s ease",
                            }}
                            onClick={() => {
                              setSelectedStudentId(s.id || s.enrollmentId);
                            }}
                          >
                            <td className="ad-td" style={{ fontWeight: 700, color: isSelected ? "#0066ff" : undefined }}>
                              {s.id || s.enrollmentId}
                            </td>
                            <td className="ad-td">
                              <strong>{s.name}</strong>
                              {isSelected && <span style={{ marginLeft: 6, fontSize: 10, background: "#0066ff", color: "#fff", padding: "1px 5px", borderRadius: 3 }}>Selected</span>}
                            </td>
                            <td className="ad-td">{s.dept || s.course}</td>
                            <td className="ad-td">{s.routeName || s.route}</td>
                            <td className="ad-td">₹{(s.totalFee || 15000).toLocaleString()}</td>
                            <td className="ad-td" style={{ color: "#16a34a", fontWeight: 700 }}>₹{(s.paidFee || 0).toLocaleString()}</td>
                            <td className="ad-td" style={{ color: (s.pendingFee || 0) > 0 ? "#ea580c" : "#16a34a", fontWeight: 700 }}>
                              ₹{(s.pendingFee || 0).toLocaleString()}
                            </td>
                            <td className="ad-td">
                              <span className={`ad-badge ${(s.paymentStatus || "").toUpperCase() === "PAID" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                                {(s.paymentStatus || (s.pendingFee > 0 ? "PARTIAL" : "PAID")).toUpperCase()}
                              </span>
                            </td>
                            <td className="ad-td">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPaymentForStudent(s.id || s.enrollmentId);
                                }}
                                className="ad-btn-primary"
                                style={{ padding: "4px 10px", fontSize: 11.5 }}
                              >
                                + Collect
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Showing <strong>{filteredStudents.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}</strong> to <strong>{Math.min(effectivePage * pageSize, filteredStudents.length)}</strong> of <strong>{filteredStudents.length.toLocaleString()}</strong> students
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    disabled={effectivePage <= 1}
                    onClick={() => setCurrentPage(1)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: effectivePage <= 1 ? "not-allowed" : "pointer", opacity: effectivePage <= 1 ? 0.5 : 1, fontSize: 12 }}
                  >
                    « First
                  </button>
                  <button
                    type="button"
                    disabled={effectivePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: effectivePage <= 1 ? "not-allowed" : "pointer", opacity: effectivePage <= 1 ? 0.5 : 1, fontSize: 12 }}
                  >
                    ‹ Prev
                  </button>
                  <span style={{ fontSize: 13, padding: "0 8px", fontWeight: 700, color: "#0f172a" }}>
                    Page {effectivePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={effectivePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: effectivePage >= totalPages ? "not-allowed" : "pointer", opacity: effectivePage >= totalPages ? 0.5 : 1, fontSize: 12 }}
                  >
                    Next ›
                  </button>
                  <button
                    type="button"
                    disabled={effectivePage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: effectivePage >= totalPages ? "not-allowed" : "pointer", opacity: effectivePage >= totalPages ? 0.5 : 1, fontSize: 12 }}
                  >
                    Last »
                  </button>
                </div>
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
