import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";
import "./AdminProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AdminProfile = () => {
  const navigate = useNavigate();
  const { authFetch, currentAdmin, setCurrentAdmin } = useTransit();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "Dr. Arvind Patel",
    email: "arvind.patel@glowbus.edu",
    phone: "+91 98250 99999",
    role: "Super Admin",
    department: "University Transportation Cell",
    officeLocation: "Admin Block, 3rd Floor, Room 302",
    twoFactorEnabled: false,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Edit Form State
  const [formData, setFormData] = useState({ ...profile });

  // 2FA Enrollment State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch("/admin/profile");
      if (res && res.profile) {
        setProfile(res.profile);
        setFormData(res.profile);
        if (setCurrentAdmin) {
          setCurrentAdmin((prev) => ({
            ...prev,
            name: res.profile.name,
            email: res.profile.email,
            role: res.profile.role,
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to load admin profile:", err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, setCurrentAdmin]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      if (res && res.profile) {
        setProfile(res.profile);
      }
      showNotification("✓ Administrator profile updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  };

  // Start 2FA Enrollment
  const handleStart2FA = async () => {
    try {
      const res = await authFetch("/admin/2fa/generate", { method: "POST" });
      if (res && res.qrCodeDataUrl) {
        setQrCodeDataUrl(res.qrCodeDataUrl);
        setTotpSecret(res.secret);
        setVerificationToken("");
        setShow2FAModal(true);
      }
    } catch (err) {
      alert("Error generating 2FA QR code: " + err.message);
    }
  };

  // Verify TOTP Code
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!verificationToken.trim()) return;

    try {
      setVerifying2FA(true);
      const res = await authFetch("/admin/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ token: verificationToken.trim() }),
      });

      if (res && res.success) {
        showNotification("✓ Two-Factor Authentication (TOTP) successfully activated!");
        setShow2FAModal(false);
        setProfile((prev) => ({ ...prev, twoFactorEnabled: true }));
      }
    } catch (err) {
      alert("Verification failed: " + (err.message || "Invalid 6-digit TOTP code"));
    } finally {
      setVerifying2FA(false);
    }
  };

  const avatarInitials = (profile.name || "AP")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AP";

  return (
    <div className="view-container">
      {toastMsg && (
        <div style={{
          background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
          borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontWeight: 700, fontSize: 13,
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)"
        }}>
          {toastMsg}
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="ap-hero-card">
        <div className="ap-hero-avatar-wrap">
          <div className="ap-hero-avatar">{avatarInitials}</div>
          <span className="ap-online-dot" />
        </div>

        <div className="ap-hero-meta">
          <div className="ap-hero-badge-row">
            <span className="ad-badge ad-badge--purple">● {profile.role || "Super Admin"}</span>
            <span className="ap-system-badge">System Root Access</span>
          </div>
          <h2 className="ap-hero-name">{profile.name}</h2>
          <p className="ap-hero-dept">{profile.department} · {profile.officeLocation}</p>
        </div>

        <button
          className="ap-edit-btn"
          onClick={() => { setFormData({ ...profile }); setShowEditModal(true); }}
        >
          <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={16} stroke="#fff" />
          Edit Profile
        </button>
      </div>

      {/* Profile Details & Security Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Contact & Office Info */}
        <div className="ad-card" style={{ padding: "20px 24px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Official Credentials & Contact</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Email ID</span>
              <strong style={{ fontSize: 14 }}>{profile.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Phone Number</span>
              <strong style={{ fontSize: 14 }}>{profile.phone}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Office Location</span>
              <strong style={{ fontSize: 14 }}>{profile.officeLocation}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Department Cell</span>
              <strong style={{ fontSize: 14 }}>{profile.department}</strong>
            </div>
          </div>
        </div>

        {/* Real 2FA Security Section */}
        <div className="ad-card" style={{ padding: "20px 24px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Security Clearance & 2FA (TOTP)</h3>
          <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
            Hardware & Authenticator-app based Time-based One-Time Password protocol (`otplib` & `qrcode`).
          </p>

          <div style={{
            background: profile.twoFactorEnabled ? "#f0fdf4" : "#fef2f2",
            border: `1.5px solid ${profile.twoFactorEnabled ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: 12, padding: "16px", marginBottom: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 800, color: profile.twoFactorEnabled ? "#166534" : "#991b1b" }}>
                  {profile.twoFactorEnabled ? "✓ 2FA Protection Active" : "⚠️ 2FA Disabled"}
                </span>
                <p style={{ fontSize: 12, color: profile.twoFactorEnabled ? "#15803d" : "#b91c1c", margin: "4px 0 0" }}>
                  {profile.twoFactorEnabled
                    ? "Your account requires a 6-digit TOTP code at login."
                    : "Protect super admin credentials with an Authenticator app."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart2FA}
                style={{
                  padding: "8px 16px",
                  background: profile.twoFactorEnabled ? "#fff" : "#2563eb",
                  color: profile.twoFactorEnabled ? "#166534" : "#fff",
                  border: `1.5px solid ${profile.twoFactorEnabled ? "#bbf7d0" : "#2563eb"}`,
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                {profile.twoFactorEnabled ? "Reconfigure 2FA" : "Enable 2FA (TOTP)"}
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
            <div><strong>Algorithm:</strong> SHA-1 RFC 6238 Standard (30-second window)</div>
            <div><strong>Supported:</strong> Google Authenticator, Microsoft Authenticator, 1Password, Authy</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="glow-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="glow-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="glow-modal-header">
              <div className="glow-modal-title-row">
                <div className="glow-modal-icon">
                  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={20} stroke="#0066ff" />
                </div>
                <div>
                  <h3 className="glow-modal-title">Edit Administrator Profile</h3>
                  <p className="glow-modal-sub">Update official details and contact information</p>
                </div>
              </div>
              <button className="glow-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="glow-modal-body">
                <div className="glow-modal-grid">
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Full Name</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Official Phone</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Office Location</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.officeLocation}
                      onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field glow-modal-field--full">
                    <label className="glow-modal-label">Assigned Department</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="glow-modal-footer">
                <button type="button" className="ap-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="ap-save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real TOTP 2FA Setup Modal with QR Code */}
      {show2FAModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: "24px", textAlign: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              Set Up Two-Factor Authentication
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>
              Scan the QR code with Google Authenticator or your preferred TOTP app.
            </p>

            {qrCodeDataUrl ? (
              <div style={{ display: "inline-block", padding: 12, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 14 }}>
                <img src={qrCodeDataUrl} alt="2FA QR Code" style={{ width: 180, height: 180, display: "block" }} />
              </div>
            ) : (
              <p>Generating QR code...</p>
            )}

            <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: 6, fontSize: 11.5, fontFamily: "monospace", color: "#334155", marginBottom: 16, wordBreak: "break-all" }}>
              Manual Key: <strong>{totpSecret}</strong>
            </div>

            <form onSubmit={handleVerify2FA}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  required
                  style={{ width: 160, textAlign: "center", fontSize: 20, letterSpacing: 4, fontWeight: 800, padding: "10px", borderRadius: 8, border: "2px solid #2563eb" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={verifying2FA}
                  style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                >
                  {verifying2FA ? "Verifying..." : "Verify & Enable 2FA"}
                </button>
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
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

export default AdminProfile;
