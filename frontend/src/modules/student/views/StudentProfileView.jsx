import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import "./StudentProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentProfile = () => {
  const navigate = useNavigate();
  const { currentStudent, setCurrentStudent } = useTransit();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  const [formData, setFormData] = useState({
    name: currentStudent?.name || "Rahul Sharma",
    phone: currentStudent?.phone || "+91 98765 43210",
    email: currentStudent?.email || "student@glowbus.edu",
    guardianContact: currentStudent?.guardianContact || "+91 98250 12345",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/v1/student/me/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          setFormData((prev) => ({
            ...prev,
            name: data.profile.name || prev.name,
            email: data.profile.email || prev.email,
            phone: data.profile.phone || prev.phone,
            guardianContact: data.profile.guardianContact || prev.guardianContact,
          }));
        }
      })
      .catch((err) => console.warn("Profile fetch fallback active:", err));
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    fetch("/api/v1/student/me/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
      body: JSON.stringify({
        phone: formData.phone,
        guardianContact: formData.guardianContact,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setCurrentStudent((prev) => ({ ...prev, name: formData.name, phone: formData.phone }));
        setShowEditModal(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch((err) => console.warn("Profile save error:", err));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPassError("");

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    fetch("/api/v1/student/me/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
      body: JSON.stringify({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPassError(data.error.message || "Failed to update password.");
        } else {
          setShowPassModal(false);
          setPassSuccess(true);
          setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setTimeout(() => setPassSuccess(false), 3000);
        }
      })
      .catch(() => setPassError("Password change failed."));
  };

  const avatarInitials = (formData.name || "ST")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  return (
    <div className="student-view-wrap">
      <div className="sp-container">
        {savedSuccess && (
          <div className="sp-alert-success">
            <span>✓</span> Profile details updated successfully!
          </div>
        )}

        {passSuccess && (
          <div className="sp-alert-success">
            <span>✓</span> Password updated successfully!
          </div>
        )}

        {/* HERO CARD */}
        <div className="sp-hero-card">
          <div className="sp-hero-left">
            <div className="sp-avatar-wrap">
              <div className="sp-avatar-circle">
                <span>{avatarInitials}</span>
              </div>
              <span className="sp-avatar-badge">Active Pass</span>
            </div>

            <div className="sp-hero-info">
              <div className="sp-hero-name-row">
                <h2 className="sp-hero-name">{formData.name}</h2>
                <span className="sp-verified-tag">✓ Verified Student</span>
              </div>
              <p className="sp-hero-id">Enrollment ID: <strong>{currentStudent?.id || "UNI20260125"}</strong></p>
              <p className="sp-hero-email">{formData.email}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="sp-edit-btn" onClick={() => setShowEditModal(true)} style={{ minHeight: 44 }}>
              <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} stroke="#fff" />
              Edit Profile
            </button>
            <button className="sp-pass-btn" onClick={() => setShowPassModal(true)} style={{ minHeight: 44, padding: "10px 18px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* INFO GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <div className="ad-card">
            <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Academic & Personal Details</h3>
            {[
              ["Branch", "B.Tech Computer Science & Engineering"],
              ["Semester", "5th Semester"],
              ["Mobile Number", formData.phone],
              ["Guardian Contact", formData.guardianContact],
              ["Assigned Corridor", "Route R-04 (SG Highway Express)"],
              ["Boarding Stop", "Chandkheda Bus Stop"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f2f5" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{l}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px", maxWidth: 440, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Edit Profile Details</h3>
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Mobile Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", minHeight: 44 }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Guardian Contact</label>
                <input
                  type="text"
                  value={formData.guardianContact}
                  onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", minHeight: 44 }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPassModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px", maxWidth: 440, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Change Password</h3>
            {passError && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{passError}</div>}
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Current Password</label>
                <input
                  type="password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", minHeight: 44 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>New Password</label>
                <input
                  type="password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", minHeight: 44 }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", minHeight: 44 }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowPassModal(false)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700 }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentProfile;
