import { useState } from "react";
import FinanceSidebar from "../components/FinanceSidebar";
import RoleSwitcherBar from "../components/RoleSwitcherBar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const FinanceRefunds = () => {
  const { refundRequests, setRefundRequests } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);

  const handleAction = (id, newStatus) => {
    setRefundRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setSelectedRefund(null);
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="refunds" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Refund Requests & Cancellations</div>
              <div className="ad-topbar-subtitle">Process route drop adjustments, semester exchange refunds & prorated returns</div>
            </div>
          </header>

          <main className="ad-content">
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Refund Claims Queue</h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Audit student refund applications with reason codes and bank return processing</p>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Claim ID</th>
                      <th className="ad-th">Student Name & ID</th>
                      <th className="ad-th">Original Paid</th>
                      <th className="ad-th">Claimed Refund</th>
                      <th className="ad-th">Reason for Refund</th>
                      <th className="ad-th">Application Date</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundRequests.map((r) => (
                      <tr key={r.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{r.id}</td>
                        <td className="ad-td">
                          <strong>{r.studentName}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{r.studentId}</span>
                        </td>
                        <td className="ad-td">₹{r.originalAmount.toLocaleString()}</td>
                        <td className="ad-td" style={{ fontWeight: 900, color: "#dc2626", fontSize: 14 }}>₹{r.refundAmount.toLocaleString()}</td>
                        <td className="ad-td" style={{ maxWidth: 280 }}>{r.reason}</td>
                        <td className="ad-td">{r.date}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${r.status === "APPROVED" ? "ad-badge--green" : r.status === "PENDING" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                            ● {r.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          {r.status === "PENDING" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => handleAction(r.id, "APPROVED")}
                                style={{ padding: "4px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(r.id, "REJECTED")}
                                style={{ padding: "4px 8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Archived</span>
                          )}
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
    </div>
  );
};

export default FinanceRefunds;
