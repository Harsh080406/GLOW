import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlowLogo from "../assets/GlowLogo";
import { useTransit } from "../context/TransitContext";
import "./Home.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const PORTALS = [
  {
    id: "student",
    title: "Student Portal",
    badge: "Student Access",
    persona: "Rahul Sharma (UNI20260125)",
    icon: "🎓",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.25)",
    border: "rgba(59, 130, 246, 0.4)",
    gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
    path: "/student/dashboard",
    summary: "Personal transit console for bus tracking, payment gateways, and digital passes.",
    stats: [
      { label: "Assigned Bus", val: "BUS-104" },
      { label: "Pickup ETA", val: "7:38 AM" },
      { label: "Pass Status", val: "ACTIVE" },
      { label: "Fee Balance", val: "₹5,000 Pending" },
    ],
    features: ["Live GPS Map", "Digital QR Pass", "₹5k Instant UPI Pay", "SOS Emergency Alert", "Grievance Tickets"],
    cta: "Launch Student Portal",
  },
  {
    id: "driver",
    title: "Driver Cockpit",
    badge: "Driver Terminal",
    persona: "Mahesh Patel (BUS-104 · Route R-04)",
    icon: "🚌",
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.25)",
    border: "rgba(249, 115, 22, 0.4)",
    gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
    path: "/driver/dashboard",
    summary: "Mobile-optimized cockpit for trip dispatch, passenger check-in, and inspection.",
    stats: [
      { label: "Departure", val: "07:30 AM" },
      { label: "Expected", val: "38 Students" },
      { label: "Boarded", val: "31 / 38 Check-in" },
      { label: "Pre-Trip Inspection", val: "Passed ✓" },
    ],
    features: ["Start / End Trip", "QR Passenger Scanner", "Live Speed Telemetry", "Report Delay / Traffic", "SOS Hotline"],
    cta: "Open Driver Cockpit",
  },
  {
    id: "super_admin",
    title: "Super Admin",
    badge: "Full Control",
    persona: "Master Administrator Console",
    icon: "👑",
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.25)",
    border: "rgba(168, 85, 247, 0.4)",
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
    path: "/admin/dashboard",
    summary: "Complete governance of campus fleet, finances, user roles, security, and audits.",
    stats: [
      { label: "Total Students", val: "4,250" },
      { label: "Active Buses", val: "85 Fleet" },
      { label: "Transit Routes", val: "32 Corridors" },
      { label: "Pending Fees", val: "₹3.6 Lakh" },
    ],
    features: ["8 Core KPI Cards", "Live Telemetry Map", "RBAC User Matrix", "Maintenance Records", "Audit Logs"],
    cta: "Launch Super Admin",
  },
  {
    id: "transport_manager",
    title: "Transport Manager",
    badge: "Fleet Operations",
    persona: "Fleet Logistics & Roster Lead",
    icon: "🚦",
    color: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.25)",
    border: "rgba(14, 165, 233, 0.4)",
    gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
    path: "/transport/dashboard",
    summary: "Fleet operations management, student route transfers, and schedule dispatching.",
    stats: [
      { label: "Active Buses", val: "79 / 85" },
      { label: "Active Drivers", val: "89 / 92" },
      { label: "Today's Trips", val: "64 Dispatched" },
      { label: "On-Time Rate", val: "97.4%" },
    ],
    features: ["Student Allocation", "Route Transfers", "Capacity Gauging", "Vehicle Servicing", "Punctuality Analytics"],
    cta: "Open Transport Console",
  },
  {
    id: "finance_admin",
    title: "Finance Admin",
    badge: "Accounts & Billing",
    persona: "University Accounts Bureau",
    icon: "💳",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.25)",
    border: "rgba(16, 185, 129, 0.4)",
    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
    path: "/finance/dashboard",
    summary: "Revenue realization, fee structures, offline payment approval, and receipt ledger.",
    stats: [
      { label: "Total Revenue", val: "₹25.4 Lakh" },
      { label: "Collected Fees", val: "₹21.8 Lakh" },
      { label: "Outstanding", val: "₹3.6 Lakh" },
      { label: "Pending Defaulters", val: "530 Students" },
    ],
    features: ["Zone A/B/C Slabs", "Offline Slip Verification", "1-Click Reminders", "Tax Invoices & Receipts", "Audit Trail"],
    cta: "Enter Finance Portal",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { setActiveRole } = useTransit();
  const [selectedRole, setSelectedRole] = useState(null);

  const handlePortalLaunch = (roleId, path) => {
    setActiveRole(roleId);
    navigate(path);
  };

  return (
    <div className="home-root">
      {/* Dynamic Background */}
      <div className="home-bg" aria-hidden="true">
        <div className="home-bg-overlay" />
        <div className="home-bg-glow" />
      </div>

      {/* Top Navigation Bar */}
      <header className="home-nav">
        <div className="home-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <GlowLogo width={110} darkMode={true} />
            <div className="home-nav-divider" />
            <div>
              <span className="home-nav-title">GLOW TRANSIT</span>
              <span className="home-nav-sub">Bus Development & Transit System</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="home-nav-status">
              <span className="home-live-pulse" />
              <span>Campus Network Online · AY 2026-27</span>
            </div>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "7px 16px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
                color: "#ffffff",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(37, 99, 235, 0.35)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>🔑 Account Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="home-main">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-badge-pill">
            <span className="home-badge-dot" />
            <span>ENTERPRISE MOBILITY ECOSYSTEM</span>
          </div>
          <h1 className="home-hero-heading">
            Smart University Transit<br />
            <span className="home-hero-gradient">Precision in Motion.</span>
          </h1>
          <p className="home-hero-description">
            Choose your role to access real-time GPS telemetry, instant ₹5k UPI fee reconciliation,
            digital QR pass issuance, driver passenger check-in, and operational controls.
          </p>
        </section>

        {/* 5 Distinct Interactive Role Options */}
        <section className="home-portals-section">
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">Select Portal to Continue</h2>
              <p className="home-section-sub">Authorized role-based access for students, drivers, and administrative staff</p>
            </div>
          </div>

          <div className="home-portals-grid">
            {PORTALS.map((portal) => (
              <div
                key={portal.id}
                className="home-portal-card"
                style={{
                  background: portal.gradient,
                  borderColor: portal.border,
                  boxShadow: `0 8px 30px ${portal.glow}`,
                }}
                onClick={() => handlePortalLaunch(portal.id, portal.path)}
                onMouseEnter={() => setSelectedRole(portal.id)}
                onMouseLeave={() => setSelectedRole(null)}
              >
                {/* Header */}
                <div className="home-card-top">
                  <div className="home-card-icon-wrap" style={{ background: `${portal.color}25`, borderColor: portal.color }}>
                    <span className="home-card-icon">{portal.icon}</span>
                  </div>
                  <span className="home-card-badge" style={{ background: `${portal.color}30`, color: portal.color, borderColor: portal.color }}>
                    {portal.badge}
                  </span>
                </div>

                {/* Title & Info */}
                <div className="home-card-body">
                  <h3 className="home-card-title">{portal.title}</h3>
                  <p className="home-card-persona">{portal.persona}</p>
                  <p className="home-card-summary">{portal.summary}</p>
                </div>

                {/* Key live metrics snippet */}
                <div className="home-card-stats-grid">
                  {portal.stats.map((s, idx) => (
                    <div key={idx} className="home-stat-chip">
                      <span className="home-stat-chip-label">{s.label}</span>
                      <strong className="home-stat-chip-val" style={{ color: idx === 1 || idx === 2 ? portal.color : "#fff" }}>
                        {s.val}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Feature Pills */}
                <div className="home-card-pills">
                  {portal.features.map((feat, i) => (
                    <span key={i} className="home-feat-pill">
                      ✓ {feat}
                    </span>
                  ))}
                </div>

                {/* Action CTA Button */}
                <button
                  className="home-card-cta"
                  style={{
                    background: portal.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePortalLaunch(portal.id, portal.path);
                  }}
                >
                  <span>{portal.cta}</span>
                  <span className="home-cta-arrow">→</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Global Live Statistics Strip */}
        <section className="home-metrics-banner">
          {[
            { label: "Fleet Buses Active", value: "85 Buses", sub: "100% Inspected & Fit" },
            { label: "Transit Corridors", value: "32 Routes", sub: "Ahmedabad & Gandhinagar" },
            { label: "Daily Students", value: "4,250 Riders", sub: "92.0% Morning Turnout" },
            { label: "On-Time Reliability", value: "99.2%", sub: "Live GPS Dispatched" },
          ].map((m, idx) => (
            <div key={idx} className="home-metric-item">
              <span className="home-metric-num">{m.value}</span>
              <span className="home-metric-title">{m.label}</span>
              <span className="home-metric-note">{m.sub}</span>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <span>© {new Date().getFullYear()} GLOW Transportation Cell · Smart Transit System</span>
          <span>Security Certified · End-to-End Encrypted · 24/7 Operations Helpdesk</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
