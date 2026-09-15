import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../layout/AdminSidebar";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminFinanceOverview = () => {
  const navigate = useNavigate();
  const { currentAdmin, transactions } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminName = currentAdmin?.name || "Dr. Arvind Patel";
  const adminRole = currentAdmin?.role || "Super Admin";
  const adminInitials = currentAdmin?.avatar ||
    adminName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AP";

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="finance" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Super Admin Finance Overview</div>
              <div className="ad-topbar-subtitle">Macro financial metrics, fleet revenue realization & collections</div>
            </div>
            <div className="ad-topbar-right">
              <div
                className="ad-topbar-profile"
                onClick={() => navigate("/admin/profile")}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                title={`${adminName} (${adminRole}) — Click to view Profile`}
              >
                <div className="ad-avatar">{adminInitials}</div>
                <div className="ad-avatar-info">
                  <span className="ad-avatar-name">{adminName}</span>
                  <span className="ad-avatar-role">{adminRole}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="ad-content">
            {/* ── HIGH LEVEL KPIS ────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Total Expected Revenue</p>
                  <p className="ad-stat-value">₹25.4 Lakh</p>
                  <p className="ad-stat-meta ad-stat-meta--green">AY 2026-27</p>
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Collected Fees</p>
                  <p className="ad-stat-value" style={{ color: "#16a34a" }}>₹21.8 Lakh</p>
                  <p className="ad-stat-meta ad-stat-meta--green">85.8% Realized</p>
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Pending Fees</p>
                  <p className="ad-stat-value" style={{ color: "#ea580c" }}>₹3.6 Lakh</p>
                  <p className="ad-stat-meta ad-stat-meta--red">530 Defaulters</p>
                </div>
              </div>

              <div className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Total Refunds Issued</p>
                  <p className="ad-stat-value">₹18,500</p>
                  <p className="ad-stat-meta ad-stat-meta--yellow">4 Approved</p>
                </div>
              </div>
            </div>

            {/* ── ROUTE & DEPARTMENT BREAKDOWNS ──────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div className="ad-card">
                <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Route-wise Revenue Realization</h3>
                {[
                  { route: "Route R-04 (Chandkheda)", rev: "₹6.2 Lakh", rate: "92%" },
                  { route: "Route R-01 (SG Highway)", rev: "₹4.5 Lakh", rate: "84%" },
                  { route: "Route R-02 (Maninagar)", rev: "₹3.8 Lakh", rate: "80%" },
                  { route: "Route R-05 (Gandhinagar)", rev: "₹7.3 Lakh", rate: "88%" },
                ].map((r) => (
                  <div key={r.route} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13.5 }}>{r.route}</p>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>Collection Rate: {r.rate}</span>
                    </div>
                    <span style={{ fontWeight: 900, color: "#059669", fontSize: 15 }}>{r.rev}</span>
                  </div>
                ))}
              </div>

              <div className="ad-card">
                <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Department-wise Collections</h3>
                {[
                  { dept: "Engineering Faculty", rev: "₹7.4 Lakh", students: 185 },
                  { dept: "Computer Science & IT", rev: "₹5.2 Lakh", students: 130 },
                  { dept: "Management Studies", rev: "₹3.8 Lakh", students: 95 },
                  { dept: "Science & Biotechnology", rev: "₹5.4 Lakh", students: 120 },
                ].map((d) => (
                  <div key={d.dept} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13.5 }}>{d.dept}</p>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>{d.students} Students</span>
                    </div>
                    <span style={{ fontWeight: 900, color: "#0f172a", fontSize: 15 }}>{d.rev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RECENT TRANSACTIONS TABLE ──────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Recent Payment Transactions</h3>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Txn ID</th>
                      <th className="ad-th">Student</th>
                      <th className="ad-th">Amount</th>
                      <th className="ad-th">Date</th>
                      <th className="ad-th">Payment Method</th>
                      <th className="ad-th">Reference</th>
                      <th className="ad-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((t) => (
                      <tr key={t.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{t.id}</td>
                        <td className="ad-td">{t.studentName} ({t.studentId})</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>₹{t.amount.toLocaleString()}</td>
                        <td className="ad-td">{t.date}</td>
                        <td className="ad-td">{t.method}</td>
                        <td className="ad-td">{t.refNo}</td>
                        <td className="ad-td"><span className="ad-badge ad-badge--green">● {t.status}</span></td>
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
    </div>
  );
};

export default AdminFinanceOverview;
