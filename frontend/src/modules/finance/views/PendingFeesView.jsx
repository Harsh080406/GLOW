import { useState } from "react";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportToExcel } from "../../../shared/utils/excelExport";
import { SendBulkRemindersModal, RecordOfflinePaymentModal } from "./FinanceModals";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const PendingFees = () => {
  const { students } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sentReminders, setSentReminders] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [collectTargetId, setCollectTargetId] = useState("");

  const pendingStudents = (students || []).filter(
    (s) =>
      (s.pendingFee || 0) > 0 &&
      (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.dept?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.route?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendSingleReminder = (id) => {
    setSentReminders((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSentReminders((prev) => ({ ...prev, [id]: false }));
    }, 3000);
  };

  const handleOpenCollectModal = (stuId) => {
    setCollectTargetId(stuId);
    setShowRecordModal(true);
  };

  const handleExportDefaultersExcel = () => {
    const dataToExport = pendingStudents.map((s) => ({
      "Student ID": s.id,
      "Name": s.name,
      "Department": s.dept || s.course,
      "Route": s.routeName || s.route,
      "Pickup Stop": s.pickupStop || s.boarding,
      "Total Fee (INR)": s.totalFee || 15000,
      "Amount Paid (INR)": s.paidFee || 0,
      "Outstanding Pending Dues (INR)": s.pendingFee || 0,
      "Payment Status": s.paymentStatus || "PARTIAL",
      "Due Date": "15 Sep 2026",
    }));

    exportToExcel(dataToExport, `GLOW_Fee_Defaulters_Manifest_${new Date().toISOString().slice(0, 10)}.xlsx`, "Fee Defaulters");
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="pending" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Pending Transport Fees & Defaulters</div>
              <div className="ad-topbar-subtitle">Track outstanding balances, automate reminders & download collection statements</div>
            </div>
            <div className="ad-search-wrap" style={{ maxWidth: 360 }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search defaulter name, ID, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={() => setShowBulkModal(true)}
                style={{ background: "#ea580c" }}
              >
                <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={15} stroke="#fff" />
                Broadcast Fee Notices
              </button>
            </div>
          </header>

          <main className="ad-content">
            {/* ── TOP STATS ──────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: "20px" }}>
                <p style={{ fontSize: 12, color: "#9a3412", fontWeight: 700, textTransform: "uppercase" }}>Total Outstanding Dues</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#ea580c", marginTop: 4 }}>₹3.6 Lakh</h2>
                <span style={{ fontSize: 12, color: "#c2410c" }}>Due by 15 Sep 2026</span>
              </div>

              <div style={{ background: "#fefce8", border: "1px solid #fef08a", borderRadius: 14, padding: "20px" }}>
                <p style={{ fontSize: 12, color: "#854d0e", fontWeight: 700, textTransform: "uppercase" }}>Pending Students</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#ca8a04", marginTop: 4 }}>530 Students</h2>
                <span style={{ fontSize: 12, color: "#a16207" }}>Across 32 University Routes</span>
              </div>

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "20px" }}>
                <p style={{ fontSize: 12, color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>Avg Due per Defaulter</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0066ff", marginTop: 4 }}>₹6,790</h2>
                <span style={{ fontSize: 12, color: "#0066ff" }}>Partial & Full defaulters</span>
              </div>
            </div>

            {/* ── PENDING STUDENTS TABLE MATCHING REQUIREMENT ─────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Pending Fee Defaulters Manifest ({pendingStudents.length})</h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Breakdown: Total Fee vs Paid vs Outstanding Pending Balance</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ad-btn-secondary" onClick={handleExportDefaultersExcel}>
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={15} />
                    Export Excel (.xlsx)
                  </button>
                  <button className="ad-btn-secondary" onClick={() => window.print()}>
                    <Icon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" size={15} />
                    Print Statement
                  </button>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Student Name</th>
                      <th className="ad-th">Student ID</th>
                      <th className="ad-th">Department</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Total Fee</th>
                      <th className="ad-th">Paid</th>
                      <th className="ad-th">Pending</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingStudents.slice(0, 20).map((s) => (
                      <tr key={s.id} className="ad-tr">
                        <td className="ad-td"><strong>{s.name}</strong></td>
                        <td className="ad-td">{s.id}</td>
                        <td className="ad-td">{s.dept || s.course}</td>
                        <td className="ad-td">{s.routeName || s.route}</td>
                        <td className="ad-td">₹{(s.totalFee || 15000).toLocaleString()}</td>
                        <td className="ad-td" style={{ color: "#16a34a", fontWeight: 700 }}>₹{(s.paidFee || 0).toLocaleString()}</td>
                        <td className="ad-td" style={{ color: "#ea580c", fontWeight: 900 }}>₹{(s.pendingFee || 0).toLocaleString()}</td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleOpenCollectModal(s.id)}
                              className="ad-btn-primary"
                              style={{ padding: "5px 10px", fontSize: 11.5 }}
                            >
                              + Collect
                            </button>
                            <button
                              onClick={() => handleSendSingleReminder(s.id)}
                              style={{
                                padding: "5px 10px",
                                background: sentReminders[s.id] ? "#16a34a" : "#fff",
                                color: sentReminders[s.id] ? "#fff" : "#ea580c",
                                border: "1px solid #ea580c",
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {sentReminders[s.id] ? "✓ Notice Sent" : "Remind"}
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
      <SendBulkRemindersModal
        isOpen={showBulkModal}
        totalPendingCount={pendingStudents.length}
        onClose={() => setShowBulkModal(false)}
      />

      <RecordOfflinePaymentModal
        isOpen={showRecordModal}
        defaultStudentId={collectTargetId}
        onClose={() => setShowRecordModal(false)}
      />
    </div>
  );
};

export default PendingFees;
