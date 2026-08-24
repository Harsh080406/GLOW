import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FinanceSidebar from "../components/FinanceSidebar";
import RoleSwitcherBar from "../components/RoleSwitcherBar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";
import "./AdminProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const FinanceProfile = () => {
  const navigate = useNavigate();
  const { currentFinanceAdmin, setCurrentFinanceAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fallback defaults if context item is loading
  const admin = currentFinanceAdmin || {
    id: "FIN-2026-001",
    name: "CMA Rajesh Dave",
    avatar: "RD",
    role: "Chief Finance Officer & Accounts Head",
    email: "rajesh.dave@glowbus.edu",
    phone: "+91 98765 22334",
    department: "Finance & Accounts Division",
    designation: "Chief Financial Officer (CFO)",
    officeLocation: "Accounts Wing, Finance Block, Room 104",
    financialAuthority: "Level 4 — Complete Accounts & Reconciliation",
    bankBranch: "State Bank of India — University Branch",
    assignedFiscalYear: "AY 2026-27",
    status: "ACTIVE",
    joinedDate: "10 Aug 2019",
    twoFactorEnabled: true,
    lastLogin: "Today, 09:15 AM",
  };

  // Form State for editing
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    department: admin.department,
    designation: admin.designation,
    officeLocation: admin.officeLocation,
    bankBranch: admin.bankBranch,
  });

  const handleSave = (e) => {
    e.preventDefault();
    const initials = (formData.name || "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RD";

    if (setCurrentFinanceAdmin) {
      setCurrentFinanceAdmin((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        officeLocation: formData.officeLocation,
        bankBranch: formData.bankBranch,
        avatar: initials,
      }));
    }

    setShowEditModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const avatarInitials = (admin.avatar || admin.name || "RD")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "RD";

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="profile" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Topbar */}
          <header className="ad-topbar">
            <button
              className="ad-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>

            <div>
              <div className="ad-topbar-title">Finance Officer Profile</div>
              <div className="ad-topbar-subtitle">Accounts credentials, clearance authority & billing configurations</div>
            </div>

            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={() => setShowEditModal(true)}
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                ✏️ Edit Profile
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="ad-content">
            <div className="ap-container">
              {savedSuccess && (
                <div style={{ padding: "14px 18px", background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534", borderRadius: 12, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>✓</span> Finance Officer profile updated successfully!
                </div>
              )}

              {/* ── PROFILE HERO CARD ────────────────────────────── */}
              <div className="ad-card" style={{ marginBottom: 24, padding: "28px", border: "1.5px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #0066ff 0%, #0040aa 100%)",
                        color: "#fff",
                        fontSize: 26,
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 20px rgba(0, 102, 255, 0.25)",
                      }}
                    >
                      {avatarInitials}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{admin.name}</h2>
                        <span className="ad-badge ad-badge--blue" style={{ fontSize: 12 }}>
                          {admin.id}
                        </span>
                        <span className="ad-badge ad-badge--green" style={{ fontSize: 12 }}>
                          ● {admin.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: "#0066ff", fontWeight: 700, marginTop: 4 }}>
                        {admin.role}
                      </p>
                      <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                        {admin.department} · {admin.officeLocation}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="ad-btn-primary"
                      onClick={() => setShowEditModal(true)}
                      style={{ padding: "10px 18px" }}
                    >
                      ✏️ Edit Details
                    </button>
                  </div>
                </div>
              </div>

              {/* ── FINANCIAL AUTHORITY & STATS ───────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">Fee Portfolio Managed</p>
                    <p className="ad-stat-value">₹25.4 Lakh</p>
                    <p className="ad-stat-meta ad-stat-meta--green">AY 2026-27 Target</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
                    <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={26} stroke="#0066ff" />
                  </div>
                </div>

                <div className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">Clearance Realized</p>
                    <p className="ad-stat-value" style={{ color: "#16a34a" }}>₹21.8 Lakh</p>
                    <p className="ad-stat-meta ad-stat-meta--green">85.8% Efficiency</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
                    <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" size={26} stroke="#16a34a" />
                  </div>
                </div>

                <div className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">Routes In Reconciliation</p>
                    <p className="ad-stat-value">32 Routes</p>
                    <p className="ad-stat-meta ad-stat-meta--blue">4,250 Commuters</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
                    <Icon d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" size={26} stroke="#0066ff" />
                  </div>
                </div>

                <div className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">Slip Verification SLA</p>
                    <p className="ad-stat-value">&lt; 4 Hours</p>
                    <p className="ad-stat-meta ad-stat-meta--green">Active Service Level</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: "#fefce8" }}>
                    <Icon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={26} stroke="#ca8a04" />
                  </div>
                </div>
              </div>

              {/* ── PROFILE DETAILS GRID ──────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 24 }}>
                {/* Account Information */}
                <div className="ad-card">
                  <div className="ad-card-header">
                    <div>
                      <h3 className="ad-card-title">Finance Officer Credentials</h3>
                      <p style={{ fontSize: 12, color: "#64748b" }}>Official accounting details and system contact</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Official Email</span>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{admin.email}</p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Phone Number</span>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{admin.phone}</p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Designation</span>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{admin.designation}</p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Office Location</span>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{admin.officeLocation}</p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Financial Authority</span>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0066ff", marginTop: 2 }}>{admin.financialAuthority}</p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Assigned Bank Branch</span>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{admin.bankBranch}</p>
                    </div>
                  </div>
                </div>

                {/* Security & Activity Card */}
                <div className="ad-card">
                  <div className="ad-card-header">
                    <div>
                      <h3 className="ad-card-title">Security & Session</h3>
                      <p style={{ fontSize: 12, color: "#64748b" }}>Authentication & login status</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 8 }}>
                      <div>
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>Two-Factor Authentication</strong>
                        <span style={{ fontSize: 11.5, color: "#16a34a", display: "block" }}>✓ Enabled via Official Authenticator</span>
                      </div>
                      <span className="ad-badge ad-badge--green">ACTIVE</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 8 }}>
                      <div>
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>Current Session</strong>
                        <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>IP: 192.168.1.104 (Campus Secure Intranet)</span>
                      </div>
                      <span className="ad-badge ad-badge--blue">ONLINE</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 8 }}>
                      <div>
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>Fiscal Year Scope</strong>
                        <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>Academic Year 2026–2027</span>
                      </div>
                      <span className="ad-badge ad-badge--yellow">ACTIVE AY</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── QUICK FINANCE ACTIONS ROW ─────────────────────── */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <h3 className="ad-card-title">Quick Finance Portals</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <button
                    onClick={() => navigate("/finance/payments")}
                    className="ad-btn-secondary"
                    style={{ justifyContent: "center", padding: "12px", fontSize: 13 }}
                  >
                    💳 Payments Ledger
                  </button>
                  <button
                    onClick={() => navigate("/finance/students")}
                    className="ad-btn-secondary"
                    style={{ justifyContent: "center", padding: "12px", fontSize: 13 }}
                  >
                    🎓 Students Fee Accounts
                  </button>
                  <button
                    onClick={() => navigate("/finance/pending")}
                    className="ad-btn-secondary"
                    style={{ justifyContent: "center", padding: "12px", fontSize: 13 }}
                  >
                    ⚠️ Pending Defaulters (530)
                  </button>
                  <button
                    onClick={() => navigate("/finance/verification")}
                    className="ad-btn-secondary"
                    style={{ justifyContent: "center", padding: "12px", fontSize: 13 }}
                  >
                    🏦 Slip Verification
                  </button>
                  <button
                    onClick={() => navigate("/finance/reports")}
                    className="ad-btn-primary"
                    style={{ justifyContent: "center", padding: "12px", fontSize: 13 }}
                  >
                    📊 Financial Reports
                  </button>
                </div>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────── */}
      {showEditModal && (
        <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="dd-modal-card" style={{ maxWidth: 520, padding: "28px 32px", borderRadius: 16 }}>
            <div className="dd-modal-header" style={{ marginBottom: 20 }}>
              <div className="dd-modal-icon-box" style={{ background: "#eff6ff" }}>
                <Icon d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" size={22} stroke="#0066ff" />
              </div>
              <div>
                <h3 className="dd-modal-title" style={{ fontSize: 18, color: "#0f172a" }}>Edit Finance Officer Profile</h3>
                <p className="dd-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
                  Update contact details, official designation and office location
                </p>
              </div>
              <button className="dd-modal-close-btn" onClick={() => setShowEditModal(false)} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="ad-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    className="ad-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    className="ad-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    className="ad-input"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Office Location
                  </label>
                  <input
                    type="text"
                    className="ad-input"
                    value={formData.officeLocation}
                    onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Assigned Bank Branch
                </label>
                <input
                  type="text"
                  className="ad-input"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" className="dd-modal-submit-btn" style={{ flex: 1 }}>
                  ✓ Save Profile Changes
                </button>
                <button
                  type="button"
                  className="ad-btn-secondary"
                  style={{ flex: 0.4, justifyContent: "center" }}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceProfile;
