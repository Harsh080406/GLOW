import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTransit } from "../context/TransitContext";
import GlowLogo from "../assets/GlowLogo";
import "../pages/AdminLayout.css";


const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const FINANCE_NAV = [
  {
    section: "Overview",
    items: [
      { id: "dashboard", label: "Finance Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", path: "/finance/dashboard" },
      { id: "profile", label: "Finance Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", path: "/finance/profile" },
      { id: "students", label: "Students & Fees", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", path: "/finance/students" },
      { id: "fee_structure", label: "Fee Structure", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2", path: "/finance/fee-structure" },
    ],
  },
  {
    section: "Transactions & Collections",
    items: [
      { id: "payments", label: "Payments Ledger", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2", path: "/finance/payments" },
      { id: "pending", label: "Pending Fees", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", path: "/finance/pending", badge: "530" },
      { id: "verification", label: "Payment Verification", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3", path: "/finance/verification", badge: "2" },
      { id: "refunds", label: "Refund Requests", icon: "M3 10h10a5 5 0 0 1 5 5v2M3 10l6 6M3 10l6-6", path: "/finance/refunds", badge: "1" },
    ],
  },
  {
    section: "Invoicing & Analysis",
    items: [
      { id: "discounts", label: "Discounts / Scholarships", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", path: "/finance/discounts" },
      { id: "receipts", label: "Receipts & Invoices", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6", path: "/finance/receipts" },
      { id: "reports", label: "Financial Reports", icon: "M18 20V10M12 20V4M6 20v-6", path: "/finance/reports" },
      { id: "audit", label: "Audit Logs", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", path: "/finance/audit" },
    ],
  },
];

const FinanceSidebar = ({ activeId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentFinanceAdmin } = useTransit();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const currentActive = activeId || FINANCE_NAV.flatMap((s) => s.items).find((i) => i.path === location.pathname)?.id || "dashboard";

  const adminName = currentFinanceAdmin?.name || "Finance Admin";
  const avatarInitials = currentFinanceAdmin?.avatar || "RD";

  return (
    <>
      <aside className={`ad-sidebar ${isCollapsed ? "ad-sidebar--collapsed" : ""} ${isOpen ? "ad-sidebar--open" : ""}`}>
        {/* Brand — Click to toggle full / icon-only collapse */}
        <button
          type="button"
          className="ad-brand"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Click to expand sidebar" : "Click to collapse sidebar"}
          aria-label="Toggle finance sidebar collapse"
        >
          <div className="ad-brand-logo-wrap">
            <GlowLogo width={isCollapsed ? 38 : 72} darkMode={false} />
          </div>
          {!isCollapsed && (
            <div className="ad-brand-text">
              <div className="ad-brand-name">GLOW BUS</div>
              <div className="ad-brand-sub">Finance Division</div>
            </div>
          )}
        </button>

        {/* Nav */}
        <nav className="ad-nav" aria-label="Finance navigation">
          {FINANCE_NAV.map((section) => (
            <div key={section.section} className="ad-nav-section-wrap">
              {!isCollapsed && <p className="ad-nav-section-label">{section.section}</p>}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`ad-nav-item ${currentActive === item.id ? "ad-nav-item--active" : ""}`}
                  onClick={() => handleNav(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={currentActive === item.id ? "page" : undefined}
                >
                  <Icon d={item.icon} size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge && <span className="ad-nav-badge" style={{ background: "#0066ff" }}>{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin Info */}
        <div
          className="ad-admin-info"
          title={isCollapsed ? `${adminName} (Accounts & Billing)` : undefined}
          onClick={() => handleNav("/finance/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="ad-admin-avatar" style={{ background: "#0066ff" }}>{avatarInitials}</div>
          {!isCollapsed && (
            <div className="ad-admin-text">
              <div className="ad-admin-name">{adminName}</div>
              <div className="ad-admin-role">Accounts & Billing · Profile →</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          className="ad-logout"
          onClick={() => navigate("/")}
          title={isCollapsed ? "Exit Portal" : undefined}
        >
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={18} />
          {!isCollapsed && <span>Exit Portal</span>}
        </button>
      </aside>

      {isOpen && <div className="ad-overlay" onClick={onClose} aria-hidden="true" />}
    </>
  );
};

export default FinanceSidebar;

