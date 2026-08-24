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

const FinanceAuditLogs = () => {
  const { auditLogs } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="audit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Financial Audit Logs</div>
              <div className="ad-topbar-subtitle">Immutable chronological trail of payment verifications, adjustments & fee modifications</div>
            </div>
          </header>

          <main className="ad-content">
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">System Audit Trail</h3>
                <span className="ad-badge ad-badge--green">Compliance Certified</span>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Log ID</th>
                      <th className="ad-th">Timestamp</th>
                      <th className="ad-th">Operator / User</th>
                      <th className="ad-th">Action Executed</th>
                      <th className="ad-th">Details & Record Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{log.id}</td>
                        <td className="ad-td">{log.timestamp}</td>
                        <td className="ad-td"><strong>{log.user}</strong></td>
                        <td className="ad-td">
                          <span className="ad-badge ad-badge--blue">{log.action}</span>
                        </td>
                        <td className="ad-td">{log.details}</td>
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

export default FinanceAuditLogs;
