import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import FinanceSidebar from "./FinanceSidebar";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const FINANCE_ROUTE_TITLES = {
  "/finance/dashboard": { title: "Finance & Accounts Command Suite", subtitle: "Fee Realizations, Collection Metrics, Bank Challan Reconciliations & Revenue Audits" },
  "/finance/students": { title: "Students Fee Directory", subtitle: "Individual student fee ledger, dues tracking & zone allocations" },
  "/finance/fee-structure": { title: "University Transit Fee Structure", subtitle: "Zone pricing, installment policies & late penalty tiers" },
  "/finance/payments": { title: "Transactions & Payment Ledger", subtitle: "Real-time UPI, NetBanking, Card & Challan settlement records" },
  "/finance/pending": { title: "Pending Fee Defaulters", subtitle: "Automated SMS/Email payment reminders & overdue penalty audits" },
  "/finance/verification": { title: "Bank Challan & Offline Verification", subtitle: "Verify physical counter bank deposit slips within 4hr SLA" },
  "/finance/refunds": { title: "Transport Refund Requests", subtitle: "Route cancellation and semester withdrawal refund approvals" },
  "/finance/discounts": { title: "Fee Concessions & Merit Scholarships", subtitle: "Manage staff wards, sports quota & financial aid fee waivers" },
  "/finance/receipts": { title: "Certified Tax Invoices & Receipts", subtitle: "Issue university certified GST/transport tax receipts" },
  "/finance/reports": { title: "Revenue Analytics & Statements", subtitle: "Export revenue spreadsheets (.xlsx) and semester audit logs" },
  "/finance/audit": { title: "Financial Audit Trail", subtitle: "Immutable timestamped logs of fee overrides, approvals & refunds" },
  "/finance/profile": { title: "Finance Officer Profile", subtitle: "Executive Account Authority, Level 4 Clearance & SBI University Branch Liaison" },
};

const FinanceLayout = ({ children, title: overrideTitle, subtitle: overrideSubtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentFinanceAdmin, searchQuery, setSearchQuery } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePath = location.pathname;
  const currentRouteMeta = FINANCE_ROUTE_TITLES[activePath] || {
    title: overrideTitle || "Finance & Billing Suite",
    subtitle: overrideSubtitle || "Campus Transportation Accounts & Billing Governance",
  };

  const title = overrideTitle || currentRouteMeta.title;
  const subtitle = overrideSubtitle || currentRouteMeta.subtitle;

  const adminName = currentFinanceAdmin?.name || "CMA Rajesh Dave";
  const adminRole = currentFinanceAdmin?.role || "Chief Finance Officer";
  const avatarInitials = currentFinanceAdmin?.avatar || "RD";

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        {/* Persistent Role Sidebar */}
        <FinanceSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Persistent Topbar Header */}
          <header className="ad-topbar">
            <button
              className="ad-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>

            <div className="ad-topbar-title-wrap">
              <h1 className="ad-topbar-title">{title}</h1>
              <p className="ad-topbar-subtitle">{subtitle}</p>
            </div>

            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search invoice #, student ID, challan..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                aria-label="Search financial records"
              />
            </div>

            <div className="ad-topbar-right">
              {/* Verification Alerts Badge */}
              <button
                className="ad-notif-btn"
                aria-label="Payment Verifications"
                onClick={() => navigate("/finance/verification")}
                title="2 Pending Offline Challans to Verify"
              >
                <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={20} stroke="#16a34a" />
                <span className="ad-notif-dot" style={{ background: "#16a34a" }}>2</span>
              </button>

              {/* Profile Card */}
              <div
                className="ad-topbar-profile"
                onClick={() => navigate("/finance/profile")}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                title={`${adminName} (${adminRole}) — Click to view Profile`}
              >
                <div className="ad-avatar" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                  {avatarInitials}
                </div>
                <div className="ad-avatar-info">
                  <span className="ad-avatar-name">{adminName}</span>
                  <span className="ad-avatar-role">{adminRole}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dynamically Rendered Sub-view */}
          <main className="ad-content">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FinanceLayout;
