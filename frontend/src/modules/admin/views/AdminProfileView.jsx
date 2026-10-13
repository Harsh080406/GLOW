import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";
import "./AdminProfile.css";

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
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

const AdminProfile = () => {
  const navigate = useNavigate();
  const { authFetch, setCurrentAdmin } = useTransit();
  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const [photoUploading, setPhotoUploading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [profile, setProfile] = useState(() => ({
    name: "Dr. Arvind Patel",
    email: "admin@glowbus.edu",
    phone: "+91 98250 99999",
    role: "super_admin",
    department: "GSFC University Transportation Cell, Vigyan Bhavan",
    officeLocation: "Administrative Block, 3rd Floor, Suite 302",
    avatar: (typeof window !== "undefined" && localStorage.getItem("glow_admin_avatar")) || "",
  }));

  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    officeLocation: "",
    avatar: "",
  });

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const cachedAvatar = (typeof window !== "undefined" && localStorage.getItem("glow_admin_avatar")) || "";
      const res = await authFetch("/admin/profile");
      if (res && res.profile) {
        const p = res.profile;
        const finalAvatar = p.avatar || cachedAvatar || "";
        const normalized = {
          name: p.name || "Dr. Arvind Patel",
          email: p.email || "admin@glow.edu",
          phone: p.phone || "+91 98250 99999",
          role: p.role || "super_admin",
          department: p.department || "GSFC University Transportation Cell, Vigyan Bhavan",
          officeLocation: p.officeLocation || "Administrative Block, 3rd Floor, Suite 302",
          avatar: finalAvatar,
        };
        setProfile(normalized);
        setFormData({
          name: normalized.name,
          phone: normalized.phone,
          department: normalized.department,
          officeLocation: normalized.officeLocation,
          avatar: finalAvatar,
        });

        if (setCurrentAdmin) {
          setCurrentAdmin((prev) => ({
            ...prev,
            name: normalized.name,
            email: normalized.email,
            role: normalized.role,
            avatar: finalAvatar,
          }));
        }
      } else if (cachedAvatar) {
        setProfile((prev) => ({ ...prev, avatar: cachedAvatar }));
        setFormData((prev) => ({ ...prev, avatar: cachedAvatar }));
        if (setCurrentAdmin) {
          setCurrentAdmin((prev) => ({ ...prev, avatar: cachedAvatar }));
        }
      }
    } catch (err) {
      console.warn("Failed to load admin profile:", err.message);
    }
  }, [authFetch, setCurrentAdmin]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotoUploading(true);
      const base64Photo = await compressImage(file);
      if (!base64Photo) throw new Error("Could not process image file.");

      // 1. Immediately update UI and localStorage so user sees photo instantly
      setProfile((prev) => ({ ...prev, avatar: base64Photo }));
      setFormData((prev) => ({ ...prev, avatar: base64Photo }));
      if (setCurrentAdmin) {
        setCurrentAdmin((prev) => ({ ...prev, avatar: base64Photo }));
      }
      try {
        localStorage.setItem("glow_admin_avatar", base64Photo);
      } catch (storageErr) {
        console.warn("localStorage quota:", storageErr);
      }
      showNotification("✓ Profile photo updated successfully!");

      // 2. Persist to backend API asynchronously
      authFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify({ avatar: base64Photo }),
      }).catch((apiErr) => console.warn("Backend photo sync:", apiErr));
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
      setProfile((prev) => ({ ...prev, avatar: "" }));
      setFormData((prev) => ({ ...prev, avatar: "" }));
      if (setCurrentAdmin) {
        setCurrentAdmin((prev) => ({ ...prev, avatar: "" }));
      }
      localStorage.removeItem("glow_admin_avatar");
      showNotification("✓ Profile photo removed. Initials restored.");

      authFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify({ avatar: "" }),
      }).catch((apiErr) => console.warn("Backend remove photo sync:", apiErr));
    } catch (err) {
      alert("Error removing photo: " + err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      if (res && res.profile) {
        const updated = {
          ...profile,
          ...res.profile,
          officeLocation: formData.officeLocation,
          avatar: formData.avatar || profile.avatar,
        };
        setProfile(updated);
        if (setCurrentAdmin) {
          setCurrentAdmin((prev) => ({
            ...prev,
            name: updated.name,
            email: updated.email,
            avatar: updated.avatar,
          }));
        }
      }
      showNotification("✓ Administrator profile updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      alert("Error saving profile: " + err.message);
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

  const hasPhoto = Boolean(
    profile.avatar &&
      (profile.avatar.startsWith("data:") ||
        profile.avatar.startsWith("http") ||
        profile.avatar.startsWith("blob:") ||
        profile.avatar.length > 10)
  );

  const displayName = profile.name || "Dr. Arvind Patel";
  const displayPhone = profile.phone || "+91 98250 99999";
  const displayDept = profile.department || "GSFC University Transportation Cell, Vigyan Bhavan";
  const displayOffice = profile.officeLocation || "Administrative Block, 3rd Floor, Suite 302";
  const displayEmail = profile.email || "admin@glowbus.edu";

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

      {/* ── HERO PROFILE BANNER ── */}
      <div className="ap-hero-card" style={{ marginBottom: 20 }}>
        <div className="ap-hero-left">
          <div className="ap-avatar-wrap">
            <div
              className="ap-avatar-circle"
              title="Click to change profile photo"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              {hasPhoto ? (
                <img src={profile.avatar} alt={displayName} className="ap-avatar-img" />
              ) : (
                <span>{avatarInitials}</span>
              )}
            </div>
            <button
              type="button"
              className="ap-avatar-upload-btn"
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
          </div>

          <div className="ap-hero-info">
            <h2 className="ap-hero-name" style={{ margin: 0 }}>{displayName}</h2>
            {photoUploading && (
              <span style={{ fontSize: 12, color: "#0066ff", fontWeight: 600 }}>Updating photo...</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="ap-edit-btn"
            onClick={() => {
              setFormData({
                name: displayName,
                phone: displayPhone,
                department: displayDept,
                officeLocation: displayOffice,
                avatar: profile.avatar || "",
              });
              setShowEditModal(true);
            }}
          >
            <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} stroke="#0066ff" />
            Edit Profile
          </button>
          <button
            type="button"
            className="ap-edit-btn"
            onClick={() => navigate("/logout")}
            style={{ background: "#ef4444", borderColor: "#ef4444", color: "#ffffff" }}
            title="Log out and return to Homepage"
          >
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={15} stroke="#ffffff" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── OFFICIAL CREDENTIALS & CONTACT CARD ── */}
      <div className="ap-card" style={{ marginBottom: 24 }}>
        <div className="ap-card-header">
          <div className="ap-card-icon">
            <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={20} stroke="#0066ff" />
          </div>
          <div>
            <h3 className="ap-card-title">Official Credentials & Contact</h3>
            <p className="ap-card-sub">Campus Directory Record & University Identity</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          <div className="ap-info-item">
            <span className="ap-info-label">Email ID</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ap-info-val" style={{ fontFamily: "monospace" }}>{displayEmail}</span>
              <button
                type="button"
                className="ap-copy-btn"
                onClick={() => copyToClipboard(displayEmail, "email")}
                title="Copy Email"
              >
                {copiedField === "email" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="ap-info-item">
            <span className="ap-info-label">Phone Number</span>
            <span className="ap-info-val">{displayPhone}</span>
          </div>

          <div className="ap-info-item">
            <span className="ap-info-label">Office Location</span>
            <span className="ap-info-val">{displayOffice}</span>
          </div>

          <div className="ap-info-item">
            <span className="ap-info-label">Department Cell</span>
            <span className="ap-info-val">{displayDept}</span>
          </div>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {showEditModal && (
        <div className="glow-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="glow-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="glow-modal-header">
              <div className="glow-modal-title-row">
                <div className="glow-modal-icon">
                  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={20} stroke="#0066ff" />
                </div>
                <div>
                  <h3 className="glow-modal-title">Edit Administrator Profile</h3>
                  <p className="glow-modal-sub">Update official university credentials and contact details</p>
                </div>
              </div>
              <button className="glow-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="glow-modal-body">
                <div className="glow-modal-grid">
                  {/* Photo Upload in Modal */}
                  <div className="glow-modal-field glow-modal-field--full" style={{ marginBottom: 4 }}>
                    <label className="glow-modal-label">Profile Photo</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, overflow: "hidden", background: "linear-gradient(135deg, #0066ff, #0047b3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
                        {hasPhoto ? (
                          <img src={profile.avatar} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                            style={{ background: "#0066ff", color: "#ffffff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            📷 {hasPhoto ? "Change Photo" : "Upload Photo"}
                          </button>
                          {hasPhoto && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              disabled={photoUploading}
                              style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: 11.5, color: "#64748b" }}>PNG, JPG or WebP. Automatically optimized.</span>
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

                  <div className="glow-modal-field glow-modal-field--full">
                    <label className="glow-modal-label">Full Name</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g. Dr. Arvind Patel"
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
                      placeholder="+91 98250 99999"
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
                      placeholder="Administrative Block, Room 302"
                    />
                  </div>

                  <div className="glow-modal-field glow-modal-field--full">
                    <label className="glow-modal-label">Assigned Department / Cell</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                      placeholder="GSFC University Transportation Cell, Vigyan Bhavan"
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
    </div>
  );
};

export default AdminProfile;
