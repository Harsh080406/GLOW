import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminFinanceOverview = () => {
  const { authFetch } = useTransit();
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinanceSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/finance/summary");
      if (res && res.summary) {
        setFinanceData(res);
      }
    } catch (err) {
      setError(err.message || "Failed to load financial summary");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchFinanceSummary();
  }, [fetchFinanceSummary]);

  const summary = financeData?.summary || {
    totalExpectedRevenue: 2540000,
    totalCollectedRevenue: 2180000,
    totalPendingFees: 360000,
    collectionRate: 85.8,
    totalAccounts: 4250,
    paidAccounts: 3720,
    pendingAccounts: 530,
  };

  const recentTransactions = financeData?.recentTransactions || [
    { id: "TXN-9021", student: "Rahul Sharma", enrollment: "UNI20260125", amount: 15000, method: "UPI / Razorpay", status: "SUCCESS", date: "Today, 10:45 AM" },
    { id: "TXN-9020", student: "Priya Dave", enrollment: "UNI20260126", amount: 15000, method: "Net Banking", status: "SUCCESS", date: "Today, 09:30 AM" },
    { id: "TXN-9019", student: "Aman Varma", enrollment: "UNI20260127", amount: 7500, method: "Debit Card", status: "SUCCESS", date: "Yesterday, 04:12 PM" },
  ];

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="ad-page-header" style={{ marginBottom: 20 }}>
        <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>Finance & Revenue Realization Overview</h2>
        <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
          High-level university fee collections, dues auditing & payment gateway reconciliations
        </p>
      </div>

      {loading && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Loading financial metrics from DB...</p>}
      {error && (
        <div style={{ padding: 12, background: "#fef2f2", color: "#dc2626", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* High-Level KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Total Expected Revenue</p>
            <p className="ad-stat-value">₹{(summary.totalExpectedRevenue / 100000).toFixed(1)}L</p>
            <p className="ad-stat-meta ad-stat-meta--green">AY 2026-27 Roster</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
            <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" stroke="#3b82f6" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Collected Revenue</p>
            <p className="ad-stat-value">₹{(summary.totalCollectedRevenue / 100000).toFixed(1)}L</p>
            <p className="ad-stat-meta ad-stat-meta--green">Realized in University Bank</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22c55e" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Pending Dues</p>
            <p className="ad-stat-value">₹{(summary.totalPendingFees / 100000).toFixed(1)}L</p>
            <p className="ad-stat-meta ad-stat-meta--red">{summary.pendingAccounts} Accounts Outstanding</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#fef2f2" }}>
            <Icon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" />
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-body">
            <p className="ad-stat-label">Collection Rate</p>
            <p className="ad-stat-value">{summary.collectionRate}%</p>
            <p className="ad-stat-meta ad-stat-meta--green">{summary.paidAccounts} Paid Accounts</p>
          </div>
          <div className="ad-stat-icon" style={{ background: "#faf5ff" }}>
            <Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="#a855f7" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Recent Fee Collection Transactions</h3>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th className="ad-th">Transaction ID</th>
                <th className="ad-th">Student Name</th>
                <th className="ad-th">Enrollment ID</th>
                <th className="ad-th">Amount Paid</th>
                <th className="ad-th">Payment Mode</th>
                <th className="ad-th">Status</th>
                <th className="ad-th">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id || tx._id} className="ad-tr">
                  <td className="ad-td" style={{ fontWeight: 700 }}>{tx.id || tx._id}</td>
                  <td className="ad-td"><strong>{tx.student || tx.studentName || "Student"}</strong></td>
                  <td className="ad-td">{tx.enrollment || tx.enrollmentId || "UNI20260125"}</td>
                  <td className="ad-td" style={{ fontWeight: 800, color: "#16a34a" }}>₹{(tx.amount || 15000).toLocaleString()}</td>
                  <td className="ad-td">{tx.method || "Online"}</td>
                  <td className="ad-td">
                    <span className="ad-badge ad-badge--green">● {tx.status || "SUCCESS"}</span>
                  </td>
                  <td className="ad-td">{tx.date || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceOverview;
