import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import "./StudentProfile.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const resultDataUrl = e.target.result;
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const maxSize = 360;
            let { width, height } = img;
            if (!width || !height) return resolve(resultDataUrl);
            if (width > height) {
              if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } catch (canvasErr) {
            console.warn("Canvas compress fallback:", canvasErr);
            resolve(resultDataUrl);
          }
        };
        img.onerror = () => resolve(resultDataUrl);
        img.src = resultDataUrl;
      } catch (err) {
        resolve(resultDataUrl);
      }
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const { currentStudent, setCurrentStudent } = useTransit();
  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const [formData, setFormData] = useState(() => ({
    name: currentStudent?.name || "Rahul Sharma",
    phone: currentStudent?.phone || "+91 98765 43210",
    email: currentStudent?.email || "student@glowbus.edu",
    guardianContact: currentStudent?.guardianContact || "+91 98250 12345",
    avatar: (typeof window !== "undefined" && localStorage.getItem("glow_student_avatar")) || currentStudent?.avatar || "",
  }));

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const cachedAvatar = (typeof window !== "undefined" && localStorage.getItem("glow_student_avatar")) || "";
    fetch("/api/v1/student/me/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          const finalAvatar = data.profile.avatar || cachedAvatar || "";
          setFormData((prev) => ({
            ...prev,
            name: data.profile.name || prev.name,
            email: data.profile.email || prev.email,
            phone: data.profile.phone || prev.phone,
            guardianContact: data.profile.guardianContact || prev.guardianContact,
            avatar: finalAvatar,
          }));
          if (finalAvatar) {
            setCurrentStudent((prev) => ({
              ...prev,
              avatar: finalAvatar,
            }));
          }
        }
      })
      .catch((err) => console.warn("Profile fetch fallback active:", err));
  }, [setCurrentStudent]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotoUploading(true);
      const base64Photo = await compressImage(file);
      if (!base64Photo) throw new Error("Could not process image file.");

      // 1. Immediately update UI and localStorage so user sees photo instantly
      setFormData((prev) => ({ ...prev, avatar: base64Photo }));
      setCurrentStudent((prev) => ({ ...prev, avatar: base64Photo }));
      try {
        localStorage.setItem("glow_student_avatar", base64Photo);
      } catch (storageErr) {
        console.warn("localStorage quota:", storageErr);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      // 2. Persist to backend API asynchronously
      fetch("/api/v1/student/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
        },
        body: JSON.stringify({ avatar: base64Photo }),
      }).catch((apiErr) => console.warn("Backend photo save error:", apiErr));
    } catch (err) {
      alert("Error uploading photo: " + (err.message || "Failed to process photo"));
    } finally {
      setPhotoUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setPhotoUploading(true);
      setFormData((prev) => ({ ...prev, avatar: "" }));
      setCurrentStudent((prev) => ({ ...prev, avatar: "" }));
      localStorage.removeItem("glow_student_avatar");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      fetch("/api/v1/student/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
        },
        body: JSON.stringify({ avatar: "" }),
      }).catch((apiErr) => console.warn("Backend remove photo sync:", apiErr));
    } catch (err) {
      alert("Error removing photo: " + err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

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
        avatar: formData.avatar,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setCurrentStudent((prev) => ({ ...prev, name: formData.name, phone: formData.phone, avatar: formData.avatar }));
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

  const hasPhoto = Boolean(
    formData.avatar &&
      (formData.avatar.startsWith("data:") ||
        formData.avatar.startsWith("http") ||
        formData.avatar.startsWith("blob:") ||
        formData.avatar.length > 10)
  );

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
              <div
                className="sp-avatar-circle"
                title="Click to change profile photo"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
              >
                {hasPhoto ? (
                  <img src={formData.avatar} alt={formData.name} className="sp-avatar-img" />
                ) : (
                  <span>{avatarInitials}</span>
                )}
              </div>
              <button
                type="button"
                className="sp-avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Add or Change Profile Photo"
                aria-label="Upload Photo"
                disabled={photoUploading}
              >
                <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" size={13} stroke="#ffffff" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <span className="sp-avatar-badge">Active Pass</span>
            </div>

            <div className="sp-hero-info">
              <div className="sp-hero-name-row">
                <h2 className="sp-hero-name">{formData.name}</h2>
                <span className="sp-verified-tag">✓ Verified Student</span>
              </div>
              <p className="sp-hero-id">Enrollment ID: <strong>{currentStudent?.id || "UNI20260125"}</strong></p>
              <p className="sp-hero-email">{formData.email}</p>
              {photoUploading && (
                <span style={{ fontSize: 12, color: "#0066ff", fontWeight: 600 }}>Updating photo...</span>
              )}
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
              ["Assigned Corridor", "Route R-04 (Fatehgunj - GSFC Express)"],
              ["Boarding Stop", "Fatehgunj Bus Stop"],
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
              {/* Photo Upload in Modal */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Profile Photo</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#f8fafc", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #1d6fe9, #0d52c7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                    {hasPhoto ? (
                      <img src={formData.avatar} alt={formData.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      avatarInitials
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        disabled={photoUploading}
                        style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        📷 {hasPhoto ? "Change Photo" : "Upload Photo"}
                      </button>
                      {hasPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={photoUploading}
                          style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b" }}>PNG, JPG or WebP (auto-optimized)</span>
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </div>

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
