import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../layout/AdminSidebar";
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
  const { currentAdmin, setCurrentAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: currentAdmin?.name || "Dr. Arvind Patel",
    email: currentAdmin?.email || "arvind.patel@glowbus.edu",
    phone: currentAdmin?.phone || "+91 98250 99999",
    department: currentAdmin?.department || "University Transportation Cell",
    officeLocation: currentAdmin?.officeLocation || "Admin Block, 3rd Floor, Room 302",
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
      .toUpperCase() || "AP";

    if (setCurrentAdmin) {
      setCurrentAdmin((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        officeLocation: formData.officeLocation,
        avatar: initials,
      }));
    }

    setShowEditModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const avatarInitials = (formData.name || currentAdmin?.name || "AP")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AP";

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="profile" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

            <div className="ad-topbar-title-wrap">
              <h1 className="ad-page-title">Admin Profile</h1>
              <p className="ad-page-sub">Administrator credentials, profile settings & quick management options</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="ad-content">
            <div className="ap-container">
              {savedSuccess && (
                <div className="ap-alert-success">
                  <span>✓</span> Administrator profile details updated successfully!
                </div>
              )}

              {/* ── PROFILE HERO CARD ────────────────────────────── */}
              <div className="ap-hero-card">
                <div className="ap-hero-left">
                  <div className="ap-avatar-wrap">
                    <div className="ap-avatar-circle">
                      <span>{avatarInitials}</span>
                    </div>
                    <span className="ap-avatar-badge">Level 5</span>
                  </div>

                  <div className="ap-hero-info">
                    <div className="ap-hero-name-row">
                      <h2 className="ap-hero-name">{formData.name}</h2>
                      <span className="ap-verified-tag">✓ Super Administrator</span>
                    </div>
                    <p className="ap-hero-role">{currentAdmin?.role || "Super Admin & Systems Director"}</p>
                    <p className="ap-hero-id">Administrator ID: <strong>{currentAdmin?.id || "ADM-2026-001"}</strong></p>
                    <p className="ap-hero-email">{formData.email}</p>
                  </div>
                </div>

                <button
                  className="ap-edit-btn"
                  onClick={() => setShowEditModal(true)}
                >
                  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={16} />
                  Edit Profile
                </button>
              </div>

              {/* ── ADMINISTRATOR DETAILS DISPLAY CARD ────────────── */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <div className="ap-card-icon">
                    <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" size={20} stroke="#0066ff" />
                  </div>
                  <div>
                    <h3 className="ap-card-title">Administrator Details</h3>
                    <p className="ap-card-sub">Official communication & department parameters</p>
                  </div>
                </div>

                <div className="ap-info-list">
                  <div className="ap-info-item">
                    <span className="ap-info-label">Full Name</span>
                    <span className="ap-info-val">{formData.name}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Official Phone</span>
                    <span className="ap-info-val">{formData.phone}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Official Email</span>
                    <span className="ap-info-val">{formData.email}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Office Location</span>
                    <span className="ap-info-val">{formData.officeLocation}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Department</span>
                    <span className="ap-info-val">{formData.department}</span>
                  </div>
                </div>
              </div>

              {/* ── 3 DEDICATED OPTIONS ───────────────────────────── */}
              <div className="ap-actions-bar">
                {/* 1. User Management */}
                <div className="ap-action-card-btn" onClick={() => navigate("/admin/users")}>
                  <div className="ap-action-card-left">
                    <div className="ap-action-card-icon">
                      <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={20} stroke="#0066ff" />
                    </div>
                    <div>
                      <h4 className="ap-action-card-name">User Management</h4>
                      <p className="ap-action-card-sub">Staff, manager, driver & student directory</p>
                    </div>
                  </div>
                  <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
                </div>

                {/* 2. Security and Audit Logs */}
                <div className="ap-action-card-btn" onClick={() => navigate("/finance/audit")}>
                  <div className="ap-action-card-left">
                    <div className="ap-action-card-icon">
                      <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={20} stroke="#0066ff" />
                    </div>
                    <div>
                      <h4 className="ap-action-card-name">Security & Audit Logs</h4>
                      <p className="ap-action-card-sub">System security events & access trails</p>
                    </div>
                  </div>
                  <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
                </div>

                {/* 3. System Settings */}
                <div className="ap-action-card-btn" onClick={() => navigate("/admin/settings")}>
                  <div className="ap-action-card-left">
                    <div className="ap-action-card-icon">
                      <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" size={20} stroke="#0066ff" />
                    </div>
                    <div>
                      <h4 className="ap-action-card-name">System Settings</h4>
                      <p className="ap-action-card-sub">Application configurations & preferences</p>
                    </div>
                  </div>
                  <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
                </div>
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Bus Management System · All rights reserved.</span>
            </footer>
          </main>
        </div>
      </div>

      {/* ── EDIT PROFILE POPUP WINDOW MODAL (NO SCROLLING) ───────── */}
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
              <button
                className="glow-modal-close"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
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
                    <label className="glow-modal-label">Official Email ID</label>
                    <input
                      type="email"
                      className="glow-modal-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <button
                  type="button"
                  className="ap-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-save-btn"
                >
                  Save Changes
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
