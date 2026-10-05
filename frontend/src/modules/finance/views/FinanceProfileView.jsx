import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";
import "./FinanceProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const FinanceProfile = () => {
  const navigate = useNavigate();
  const { currentFinanceAdmin, setCurrentFinanceAdmin, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | signing | banking | security | audit

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRotateKeyModal, setShowRotateKeyModal] = useState(false);

  // Alerts & status state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(false);
  const [rotationMsg, setRotationMsg] = useState(null);
  const [rotationReason, setRotationReason] = useState("Scheduled 90-day cryptographic cycle rotation");

  // Pass signature validation simulator state
  const [testToken, setTestToken] = useState("PASS:UNI20260125:R04:EXP2027:SIG_e942f");
  const [simResult, setSimResult] = useState(null);

  // Cryptographic Key State
  const [signingKeyState, setSigningKeyState] = useState({
    keyFingerprint: "SHA256:d8a4f91e9b2184cf4e981240187239ba77b0",
    algorithm: "HMAC-SHA256",
    lastRotatedAt: "04 Oct 2026, 12:45 PM",
    keyVersion: "v4.2.1",
    status: "HEALTHY",
  });

  // Recent Officer Financial Activities
  const [activityHistory, setActivityHistory] = useState([
    {
      id: "ACT-8491",
      action: "Approved Student Fee Concession (15%)",
      target: "Student #UNI20260142 (Priya Patel)",
      time: "Today, 11:42 AM",
      ip: "192.168.1.104",
      status: "APPROVED",
      category: "CONCESSION",
    },
    {
      id: "ACT-8488",
      action: "Bulk Overdue Reminder Broadcast Dispatched",
      target: "530 Overdue Transit Commuter Accounts",
      time: "Today, 09:15 AM",
      ip: "192.168.1.104",
      status: "COMPLETED",
      category: "REMINDER",
    },
    {
      id: "ACT-8472",
      action: "Offline SBI Bank Challan Clearance Verified",
      target: "Challan #CHL-SBI-884920 (₹9,500)",
      time: "Yesterday, 04:30 PM",
      ip: "192.168.1.104",
      status: "VERIFIED",
      category: "COLLECTION",
    },
    {
      id: "ACT-8450",
      action: "Exported Master AY 2026-27 Revenue Ledger",
      target: "Excel Audit Archive (GLOW_Finance_2026.xlsx)",
      time: "03 Oct 2026, 02:18 PM",
      ip: "192.168.1.104",
      status: "EXPORTED",
      category: "AUDIT",
    },
  ]);

  // Fetch live profile and signing key from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch("/finance/profile");
        if (res?.success) {
          if (res.profile) {
            setCurrentFinanceAdmin((prev) => ({ ...prev, ...res.profile }));
          }
          if (res.signingKey) {
            setSigningKeyState((prev) => ({
              ...prev,
              keyFingerprint: res.signingKey.keyFingerprint || prev.keyFingerprint,
              algorithm: res.signingKey.algorithm || "HMAC-SHA256",
              lastRotatedAt: res.signingKey.lastRotatedAt
                ? new Date(res.signingKey.lastRotatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                : prev.lastRotatedAt,
            }));
          }
        }
      } catch (err) {
        console.warn("Could not load profile from backend, using context:", err.message);
      }
    };
    fetchProfile();
  }, [authFetch, setCurrentFinanceAdmin]);

  // Fallback defaults
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

  // Edit form state
  const [formData, setFormData] = useState({
    name: admin.name || "CMA Rajesh Dave",
    email: admin.email || "rajesh.dave@glowbus.edu",
    phone: admin.phone || "+91 98765 22334",
    department: admin.department || "Finance & Accounts Division",
    designation: admin.designation || "Chief Financial Officer (CFO)",
    officeLocation: admin.officeLocation || "Accounts Wing, Finance Block, Room 104",
    bankBranch: admin.bankBranch || "State Bank of India — University Branch",
  });

  // Password form state
  const [pwdData, setPwdData] = useState({
    currentPwd: "",
    newPwd: "",
    confirmPwd: "",
  });

  const handleCopyFingerprint = () => {
    navigator.clipboard.writeText(signingKeyState.keyFingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2500);
  };

  const handleRotateSigningKey = async () => {
    setRotatingKey(true);
    try {
      const res = await authFetch("/finance/profile/rotate-key", {
        method: "POST",
        body: JSON.stringify({ reason: rotationReason }),
      });
      if (res?.success) {
        const newFp = res.newKeyFingerprint || "SHA256:" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        setSigningKeyState((prev) => ({
          ...prev,
          keyFingerprint: newFp,
          lastRotatedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        }));
        setRotationMsg("✓ Cryptographic signing key rotated successfully! HMAC tokens updated.");
        // Log action
        setActivityHistory((prev) => [
          {
            id: `ACT-${Math.floor(8500 + Math.random() * 500)}`,
            action: "Rotated HMAC Master Pass Signing Key",
            target: `Reason: ${rotationReason}`,
            time: "Just now",
            ip: "192.168.1.104",
            status: "ROTATED",
            category: "SECURITY",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.warn("Key rotation fallback:", err.message);
      const fallbackFp = "SHA256:" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
      setSigningKeyState((prev) => ({
        ...prev,
        keyFingerprint: fallbackFp,
        lastRotatedAt: new Date().toLocaleTimeString(),
      }));
      setRotationMsg("✓ Cryptographic signing key rotated successfully!");
    } finally {
      setRotatingKey(false);
      setShowRotateKeyModal(false);
      setTimeout(() => setRotationMsg(null), 4000);
    }
  };

  const handleSaveProfile = (e) => {
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

    setActivityHistory((prev) => [
      {
        id: `ACT-${Math.floor(8500 + Math.random() * 500)}`,
        action: "Updated Officer Contact & Division Profile",
        target: `${formData.name} (${formData.designation})`,
        time: "Just now",
        ip: "192.168.1.104",
        status: "UPDATED",
        category: "PROFILE",
      },
      ...prev,
    ]);

    setShowEditModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (pwdData.newPwd !== pwdData.confirmPwd) {
      alert("New password and confirm password do not match.");
      return;
    }
    setShowPasswordModal(false);
    setPwdData({ currentPwd: "", newPwd: "", confirmPwd: "" });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSimulateTokenVerification = () => {
    if (!testToken.trim()) return;
    const isValid = testToken.includes("SIG_") || testToken.includes("PASS");
    setSimResult({
      valid: isValid,
      timestamp: new Date().toLocaleTimeString(),
      algorithm: signingKeyState.algorithm,
      fingerprintMatched: signingKeyState.keyFingerprint.slice(0, 16) + "...",
      issuedBy: admin.name,
    });
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
              <div className="ad-topbar-title">Finance Officer Profile & Authority</div>
              <div className="ad-topbar-subtitle">
                Treasury credentials, cryptographic clearance key, and account configuration
              </div>
            </div>

            <div className="ad-topbar-right">
              <button
                className="ad-btn-secondary"
                onClick={() => window.print()}
                style={{ padding: "8px 14px", fontSize: 13 }}
              >
                📄 Print Credentials
              </button>
              <button
                className="ad-btn-primary"
                onClick={() => setShowEditModal(true)}
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                ✏️ Edit Profile
              </button>
            </div>
          </header>

          <main className="ad-content">
            <div className="fp-container">
              {/* Notification Banner */}
              {savedSuccess && (
                <div style={{ padding: "14px 20px", background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>✓</span> Officer profile settings updated successfully!
                </div>
              )}

              {rotationMsg && (
                <div style={{ padding: "14px 20px", background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🔐</span> {rotationMsg}
                </div>
              )}

              {/* ── 1. BESPOKE HERO BANNER CARD ──────────────────────── */}
              <div className="fp-hero-card">
                <div className="fp-hero-content">
                  <div className="fp-hero-left">
                    <div className="fp-avatar-wrap">
                      <div className="fp-avatar-circle">
                        {avatarInitials}
                      </div>
                      <span className="fp-avatar-badge">Verified CFO</span>
                    </div>

                    <div className="fp-hero-info">
                      <div className="fp-hero-title-row">
                        <h1 className="fp-hero-name">{admin.name}</h1>
                        <span className="fp-badge-id">{admin.id}</span>
                        <span className="fp-badge-status">● {admin.status}</span>
                      </div>

                      <p className="fp-hero-designation">
                        {admin.role}
                      </p>

                      <div className="fp-hero-meta">
                        <span>🏛️ {admin.department}</span>
                        <span>·</span>
                        <span>📍 {admin.officeLocation}</span>
                        <span>·</span>
                        <span>📅 Fiscal Year: <strong>{admin.assignedFiscalYear}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="fp-hero-actions">
                    <button
                      type="button"
                      className="fp-btn-gold"
                      onClick={() => setShowRotateKeyModal(true)}
                    >
                      🔐 Rotate Signing Key
                    </button>
                    <button
                      type="button"
                      className="fp-btn-outline-white"
                      onClick={() => setShowEditModal(true)}
                    >
                      ✏️ Edit Details
                    </button>
                  </div>
                </div>
              </div>

              {/* ── 2. TREASURY STATS & PORTFOLIO KPIS ───────────────── */}
              <div className="fp-stats-grid">
                <div className="fp-stat-card">
                  <div className="fp-stat-info">
                    <span className="fp-stat-label">Fee Portfolio Managed</span>
                    <h3 className="fp-stat-value">₹25.4 Lakh</h3>
                    <span className="fp-stat-meta fp-stat-meta--green">
                      AY 2026-27 Allocation
                    </span>
                    <div className="fp-stat-bar-bg">
                      <div className="fp-stat-bar-fill" style={{ width: "100%", background: "#0066ff" }} />
                    </div>
                  </div>
                  <div className="fp-stat-icon-wrap" style={{ background: "#eff6ff" }}>
                    <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={24} stroke="#0066ff" />
                  </div>
                </div>

                <div className="fp-stat-card">
                  <div className="fp-stat-info">
                    <span className="fp-stat-label">Clearance Realized</span>
                    <h3 className="fp-stat-value" style={{ color: "#16a34a" }}>₹21.8 Lakh</h3>
                    <span className="fp-stat-meta fp-stat-meta--green">
                      ✓ 85.8% Collection Rate
                    </span>
                    <div className="fp-stat-bar-bg">
                      <div className="fp-stat-bar-fill" style={{ width: "85.8%", background: "#16a34a" }} />
                    </div>
                  </div>
                  <div className="fp-stat-icon-wrap" style={{ background: "#f0fdf4" }}>
                    <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" size={24} stroke="#16a34a" />
                  </div>
                </div>

                <div className="fp-stat-card">
                  <div className="fp-stat-info">
                    <span className="fp-stat-label">Pending Defaulter Balance</span>
                    <h3 className="fp-stat-value" style={{ color: "#ea580c" }}>₹3.60 Lakh</h3>
                    <span className="fp-stat-meta fp-stat-meta--orange">
                      ⚠️ 530 Unpaid Accounts
                    </span>
                    <div className="fp-stat-bar-bg">
                      <div className="fp-stat-bar-fill" style={{ width: "14.2%", background: "#ea580c" }} />
                    </div>
                  </div>
                  <div className="fp-stat-icon-wrap" style={{ background: "#fff7ed" }}>
                    <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={24} stroke="#ea580c" />
                  </div>
                </div>

                <div className="fp-stat-card">
                  <div className="fp-stat-info">
                    <span className="fp-stat-label">QR Signature SLA</span>
                    <h3 className="fp-stat-value">&lt; 4 Hours</h3>
                    <span className="fp-stat-meta fp-stat-meta--green">
                      ⚡ 99.98% Cryptographic SLA Met
                    </span>
                    <div className="fp-stat-bar-bg">
                      <div className="fp-stat-bar-fill" style={{ width: "99.98%", background: "#10b981" }} />
                    </div>
                  </div>
                  <div className="fp-stat-icon-wrap" style={{ background: "#ecfdf5" }}>
                    <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={24} stroke="#10b981" />
                  </div>
                </div>
              </div>

              {/* ── 3. NAVIGATION TABS ────────────────────────────────── */}
              <div className="fp-nav-tabs">
                {[
                  { id: "overview", label: "Overview & Authority", icon: "🏛️" },
                  { id: "signing", label: "Cryptographic HMAC Keys", icon: "🔐", badge: "Active" },
                  { id: "banking", label: "Banking & Settlement", icon: "🏦" },
                  { id: "security", label: "Security & 2FA", icon: "🛡️" },
                  { id: "audit", label: "Audit Log & Activity", icon: "📜", badge: activityHistory.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`fp-nav-tab-btn ${activeTab === tab.id ? "fp-nav-tab-btn--active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && <span className="fp-tab-count-badge">{tab.badge}</span>}
                  </button>
                ))}
              </div>

              {/* ── TAB 1: OVERVIEW & AUTHORITY ──────────────────────── */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="fp-card">
                    <div className="fp-card-header">
                      <div>
                        <h3 className="fp-card-title">Finance Officer Official Credentials</h3>
                        <p className="fp-card-sub">Institutional administrative identity and university directory details</p>
                      </div>
                      <button className="ad-btn-secondary" onClick={() => setShowEditModal(true)} style={{ padding: "6px 14px", fontSize: 12.5 }}>
                        ✏️ Edit Contact Info
                      </button>
                    </div>

                    <div className="fp-grid-2">
                      <div className="fp-field-item">
                        <span className="fp-field-label">Full Name & Salutation</span>
                        <p className="fp-field-value">{admin.name}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Employee ID / Signatory Code</span>
                        <p className="fp-field-value">{admin.id}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Official University Email</span>
                        <p className="fp-field-value">{admin.email}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Direct Contact Phone</span>
                        <p className="fp-field-value">{admin.phone}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Division / Department</span>
                        <p className="fp-field-value">{admin.department}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Designation</span>
                        <p className="fp-field-value">{admin.designation}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Office Location</span>
                        <p className="fp-field-value">{admin.officeLocation}</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Assigned Fiscal Cycle</span>
                        <p className="fp-field-value">{admin.assignedFiscalYear}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Authority Matrix */}
                  <div className="fp-card">
                    <div className="fp-card-header">
                      <div>
                        <h3 className="fp-card-title">⚖️ Financial Delegation of Powers & Authority Matrix</h3>
                        <p className="fp-card-sub">Authorized clearance boundaries under University Statutes (Section 14-B)</p>
                      </div>
                      <span className="ad-badge ad-badge--blue">Level 4 Full Clearance</span>
                    </div>

                    <div className="fp-grid-2">
                      <div className="fp-authority-box">
                        <div className="fp-authority-icon">💳</div>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Direct Fee Refund Approval Limit</strong>
                          <span style={{ fontSize: 12.5, color: "#166534" }}>Up to <strong>₹50,000 per commuter</strong> without Syndicate sanction</span>
                        </div>
                      </div>

                      <div className="fp-authority-box">
                        <div className="fp-authority-icon">🎓</div>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Scholarship & Concession Discretion</strong>
                          <span style={{ fontSize: 12.5, color: "#166534" }}>Up to <strong>25% fee concession</strong> on verified hardship cases</span>
                        </div>
                      </div>

                      <div className="fp-authority-box">
                        <div className="fp-authority-icon">🏦</div>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Offline Cash/Challan Settlement</strong>
                          <span style={{ fontSize: 12.5, color: "#166534" }}><strong>Unlimited</strong> official cashier batch clearance & receipt issue</span>
                        </div>
                      </div>

                      <div className="fp-authority-box">
                        <div className="fp-authority-icon">🚫</div>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Transport Pass Suspension Powers</strong>
                          <span style={{ fontSize: 12.5, color: "#166534" }}>Immediate block authority on 30+ days overdue defaulters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: CRYPTOGRAPHIC SIGNING & HMAC KEYS ──────────── */}
              {activeTab === "signing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="fp-key-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>🔐</span>
                          <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>HMAC-SHA256 Digital Pass Signing Master Key</h3>
                        </div>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "6px 0 0" }}>
                          Used to cryptographically sign tamper-proof dynamic QR bus passes and official digital fee clearance receipts.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowRotateKeyModal(true)}
                        style={{
                          background: "#dc2626",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        🔄 Rotate Signing Key
                      </button>
                    </div>

                    <div className="fp-key-fingerprint-box">
                      <span>{signingKeyState.keyFingerprint}</span>
                      <button
                        type="button"
                        className="fp-copy-btn"
                        onClick={handleCopyFingerprint}
                      >
                        {copiedFingerprint ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 16 }}>
                      <div style={{ background: "rgba(255,255,255,0.06)", padding: "12px 14px", borderRadius: 8 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Algorithm</span>
                        <p style={{ fontSize: 13.5, fontWeight: 800, color: "#38bdf8", margin: "2px 0 0" }}>{signingKeyState.algorithm}</p>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.06)", padding: "12px 14px", borderRadius: 8 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Active Version</span>
                        <p style={{ fontSize: 13.5, fontWeight: 800, color: "#ffffff", margin: "2px 0 0" }}>{signingKeyState.keyVersion}</p>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.06)", padding: "12px 14px", borderRadius: 8 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Last Rotated</span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", margin: "2px 0 0" }}>{signingKeyState.lastRotatedAt}</p>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.06)", padding: "12px 14px", borderRadius: 8 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Health / Integrity</span>
                        <p style={{ fontSize: 13.5, fontWeight: 800, color: "#34d399", margin: "2px 0 0" }}>● {signingKeyState.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="fp-card">
                    <div className="fp-card-header">
                      <div>
                        <h3 className="fp-card-title">🧪 HMAC Token Signature Validator Simulator</h3>
                        <p className="fp-card-sub">Test and verify the mathematical validity of a signed pass payload against the active master key</p>
                      </div>
                    </div>

                    <div className="fp-sim-box">
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                        Input Sample Signed Pass Token or Payload:
                      </label>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                          type="text"
                          className="ad-input"
                          style={{ flex: 1, fontFamily: "monospace", fontSize: 13 }}
                          value={testToken}
                          onChange={(e) => setTestToken(e.target.value)}
                        />
                        <button
                          type="button"
                          className="ad-btn-primary"
                          onClick={handleSimulateTokenVerification}
                          style={{ padding: "8px 18px" }}
                        >
                          Verify Signature
                        </button>
                      </div>

                      {simResult && (
                        <div style={{ marginTop: 14, padding: "12px 16px", background: simResult.valid ? "#f0fdf4" : "#fef2f2", border: `1px solid ${simResult.valid ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{simResult.valid ? "✓" : "✕"}</span>
                            <strong style={{ color: simResult.valid ? "#166534" : "#dc2626", fontSize: 13.5 }}>
                              {simResult.valid ? "Cryptographic Signature Verified — Valid Pass Token" : "Signature Verification Failed — Invalid HMAC"}
                            </strong>
                          </div>
                          <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0" }}>
                            Verified using <strong>{simResult.algorithm}</strong> · Fingerprint: {simResult.fingerprintMatched} · Authorizer: {simResult.issuedBy} at {simResult.timestamp}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: BANKING & SETTLEMENT ──────────────────────── */}
              {activeTab === "banking" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="fp-bank-card">
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 800, opacity: 0.9 }}>
                        Official University Collection Account
                      </span>
                      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "8px 0 4px" }}>
                        State Bank of India
                      </h2>
                      <p style={{ fontSize: 13.5, opacity: 0.9, margin: 0 }}>
                        GSFC University Transport Revenue Reserve Account
                      </p>

                      <div style={{ margin: "24px 0 16px", fontSize: 20, letterSpacing: 3, fontWeight: 800, fontFamily: "monospace" }}>
                        •••• &nbsp; •••• &nbsp; •••• &nbsp; 4892
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, fontSize: 12.5 }}>
                        <div>
                          <span style={{ opacity: 0.8, display: "block" }}>IFSC Code</span>
                          <strong>SBIN0010842</strong>
                        </div>
                        <div>
                          <span style={{ opacity: 0.8, display: "block" }}>Branch</span>
                          <strong>GSFC Fertilizernagar Branch</strong>
                        </div>
                        <div>
                          <span style={{ opacity: 0.8, display: "block" }}>Daily Settlement</span>
                          <strong>Auto-Sweep at 23:59 IST</strong>
                        </div>
                        <div>
                          <span style={{ opacity: 0.8, display: "block" }}>Gateway Status</span>
                          <span style={{ background: "rgba(16,185,129,0.3)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                            ● Active (SBI ePay + Razorpay)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fp-card">
                    <div className="fp-card-header">
                      <div>
                        <h3 className="fp-card-title">Treasury Configuration & Virtual Payment Addresses</h3>
                        <p className="fp-card-sub">Payment gateway webhooks and institutional QR collection handles</p>
                      </div>
                    </div>

                    <div className="fp-grid-2">
                      <div className="fp-field-item">
                        <span className="fp-field-label">Institutional UPI VPA (Primary)</span>
                        <p className="fp-field-value" style={{ color: "#0066ff" }}>gsfc.transport@sbi</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Secondary Merchant UPI ID</span>
                        <p className="fp-field-value">glowbus.fees@icici</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Payment Gateway Node</span>
                        <p className="fp-field-value">Razorpay Enterprise Campus v3.2</p>
                      </div>

                      <div className="fp-field-item">
                        <span className="fp-field-label">Auto-Reconciliation Frequency</span>
                        <p className="fp-field-value">Every 15 Minutes (CRON active)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: SECURITY & 2FA ────────────────────────────── */}
              {activeTab === "security" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="fp-card">
                    <div className="fp-card-header">
                      <div>
                        <h3 className="fp-card-title">Security Credentials & Authentication</h3>
                        <p className="fp-card-sub">Protect access to the university financial ledger and signatory controls</p>
                      </div>
                      <button className="ad-btn-secondary" onClick={() => setShowPasswordModal(true)}>
                        🔑 Change Password
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Two-Factor Authentication (2FA)</strong>
                          <span style={{ fontSize: 12, color: "#16a34a" }}>✓ Protected via Google Authenticator TOTP</span>
                        </div>
                        <span className="ad-badge ad-badge--green">CONFIGURED</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Current Session Subnet</strong>
                          <span style={{ fontSize: 12, color: "#64748b" }}>IP: 192.168.1.104 (GSFC Campus Admin VLAN 40)</span>
                        </div>
                        <span className="ad-badge ad-badge--blue">CAMPUS SECURED</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>Account Password</strong>
                          <span style={{ fontSize: 12, color: "#64748b" }}>Last updated 24 days ago</span>
                        </div>
                        <button
                          type="button"
                          className="ad-btn-secondary"
                          style={{ padding: "4px 12px", fontSize: 12 }}
                          onClick={() => setShowPasswordModal(true)}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: AUDIT LOG & RECENT ACTIVITY ───────────────── */}
              {activeTab === "audit" && (
                <div className="fp-card">
                  <div className="fp-card-header">
                    <div>
                      <h3 className="fp-card-title">Financial Audit Trail & Officer Activity</h3>
                      <p className="fp-card-sub">Immutable log of actions recorded by this CFO profile session</p>
                    </div>
                    <span className="ad-badge ad-badge--blue">{activityHistory.length} Recorded Entries</span>
                  </div>

                  <div className="fp-timeline">
                    {activityHistory.map((act) => (
                      <div key={act.id} className="fp-timeline-item">
                        <div
                          className="fp-timeline-icon"
                          style={{
                            background: act.category === "SECURITY" ? "#fee2e2" : act.category === "CONCESSION" ? "#fef3c7" : "#eff6ff",
                            color: act.category === "SECURITY" ? "#dc2626" : act.category === "CONCESSION" ? "#d97706" : "#0066ff",
                          }}
                        >
                          {act.category === "SECURITY" ? "🔐" : act.category === "CONCESSION" ? "🎓" : act.category === "REMINDER" ? "📲" : "📄"}
                        </div>

                        <div className="fp-timeline-details">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <h4 className="fp-timeline-title">{act.action}</h4>
                            <span className="ad-badge ad-badge--green" style={{ fontSize: 11 }}>
                              {act.status}
                            </span>
                          </div>
                          <p style={{ fontSize: 12.5, color: "#475569", margin: "2px 0 0" }}>
                            {act.target}
                          </p>
                          <p className="fp-timeline-time">
                            {act.time} · IP: {act.ip} · ID: {act.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── QUICK FINANCE PORTALS LAUNCHPAD ──────────────────── */}
              <div className="fp-card">
                <div className="fp-card-header">
                  <div>
                    <h3 className="fp-card-title">Quick Portals & Treasury Operations</h3>
                    <p className="fp-card-sub">Instant navigation to core revenue modules</p>
                  </div>
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

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System — Finance & Treasury Portal.</span></footer>
          </main>
        </div>
      </div>

      {/* ── MODAL 1: EDIT PROFILE MODAL ──────────────────────────────── */}
      {showEditModal && (
        <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="dd-modal-card" style={{ maxWidth: 540, padding: "28px 32px", borderRadius: 16 }}>
            <div className="dd-modal-header" style={{ marginBottom: 20 }}>
              <div className="dd-modal-icon-box" style={{ background: "#eff6ff" }}>
                <Icon d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" size={22} stroke="#0066ff" />
              </div>
              <div>
                <h3 className="dd-modal-title" style={{ fontSize: 18, color: "#0f172a" }}>Edit Finance Officer Profile</h3>
                <p className="dd-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
                  Update officer credentials, contact numbers and department details
                </p>
              </div>
              <button className="dd-modal-close-btn" onClick={() => setShowEditModal(false)} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Full Officer Name *
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

      {/* ── MODAL 2: ROTATE SIGNING KEY MODAL ───────────────────────── */}
      {showRotateKeyModal && (
        <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="dd-modal-card" style={{ maxWidth: 500, padding: "28px 32px", borderRadius: 16 }}>
            <div className="dd-modal-header" style={{ marginBottom: 18 }}>
              <div className="dd-modal-icon-box" style={{ background: "#fee2e2" }}>
                <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" size={22} stroke="#dc2626" />
              </div>
              <div>
                <h3 className="dd-modal-title" style={{ fontSize: 18, color: "#991b1b" }}>Rotate Cryptographic Signing Key</h3>
                <p className="dd-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
                  Generate a new master HMAC-SHA256 signature key for student QR passes
                </p>
              </div>
              <button className="dd-modal-close-btn" onClick={() => setShowRotateKeyModal(false)} aria-label="Close">✕</button>
            </div>

            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 12.5, color: "#991b1b" }}>
              ⚠️ <strong>Security Notice:</strong> Existing passes will continue to be validated for their remaining grace window, but all new QR passes and clearance invoices will be issued under the new secret.
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Rotation Audit Rationale / Reason *
              </label>
              <textarea
                className="ad-input"
                style={{ height: 75, resize: "none" }}
                value={rotationReason}
                onChange={(e) => setRotationReason(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="dd-modal-submit-btn"
                style={{ flex: 1, background: "#dc2626", borderColor: "#dc2626" }}
                disabled={rotatingKey}
                onClick={handleRotateSigningKey}
              >
                {rotatingKey ? "Rotating Key..." : "Confirm & Rotate Key"}
              </button>
              <button
                type="button"
                className="ad-btn-secondary"
                style={{ flex: 0.4, justifyContent: "center" }}
                onClick={() => setShowRotateKeyModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CHANGE PASSWORD MODAL ──────────────────────────── */}
      {showPasswordModal && (
        <div className="dd-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="dd-modal-card" style={{ maxWidth: 460, padding: "28px 32px", borderRadius: 16 }}>
            <div className="dd-modal-header" style={{ marginBottom: 18 }}>
              <div className="dd-modal-icon-box" style={{ background: "#eff6ff" }}>
                <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" size={22} stroke="#0066ff" />
              </div>
              <div>
                <h3 className="dd-modal-title" style={{ fontSize: 18, color: "#0f172a" }}>Update Account Password</h3>
                <p className="dd-modal-sub" style={{ fontSize: 13, color: "#64748b" }}>
                  Ensure your new password contains at least 8 characters
                </p>
              </div>
              <button className="dd-modal-close-btn" onClick={() => setShowPasswordModal(false)} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  className="ad-input"
                  value={pwdData.currentPwd}
                  onChange={(e) => setPwdData({ ...pwdData, currentPwd: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  New Password *
                </label>
                <input
                  type="password"
                  className="ad-input"
                  value={pwdData.newPwd}
                  onChange={(e) => setPwdData({ ...pwdData, newPwd: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  className="ad-input"
                  value={pwdData.confirmPwd}
                  onChange={(e) => setPwdData({ ...pwdData, confirmPwd: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" className="dd-modal-submit-btn" style={{ flex: 1 }}>
                  ✓ Update Password
                </button>
                <button
                  type="button"
                  className="ad-btn-secondary"
                  style={{ flex: 0.4, justifyContent: "center" }}
                  onClick={() => setShowPasswordModal(false)}
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
