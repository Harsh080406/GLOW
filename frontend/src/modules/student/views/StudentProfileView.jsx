import { useState } from "react";
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
  const { currentStudent, setCurrentStudent, setStudents } = useTransit();

  const [showEditModal, setShowEditModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: currentStudent?.name || "Rahul Sharma",
    phone: currentStudent?.phone || "+91 98765 43210",
    email: currentStudent?.email || "rahul.sharma@glowbus.edu",
    address: currentStudent?.address || "B-402, Shantiniketan Heights, Chandkheda, Ahmedabad - 382424",
    emergencyContactName: "Dr. Vinod Sharma (Father)",
    emergencyPhone: "+91 98250 12345",
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
      .toUpperCase() || "ST";

    setCurrentStudent((prev) => ({
      ...prev,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      avatar: initials,
    }));

    if (setStudents) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === currentStudent.id
            ? { ...s, name: formData.name, phone: formData.phone, email: formData.email }
            : s
        )
      );
    }

    setShowEditModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const avatarInitials = (formData.name || currentStudent?.name || "ST")
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

        {/* ── PROFILE HEADER HERO CARD ────────────────────────── */}
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
              <p className="sp-hero-id">Enrollment ID: <strong>{currentStudent.id}</strong></p>
              <p className="sp-hero-email">{formData.email}</p>
            </div>
          </div>

          <div className="sp-hero-actions">
            <button
              className="sp-edit-btn"
              onClick={() => setShowEditModal(true)}
            >
              <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* ── ACADEMIC & TRANSIT PASS OVERVIEW ────────────────── */}
        <div className="sp-grid-two">
          {/* Card 1: Academic Enrollment */}
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-icon">
                <Icon d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" size={20} stroke="#0066ff" />
              </div>
              <div>
                <h3 className="sp-card-title">Academic Details</h3>
                <p className="sp-card-sub">University Academic records</p>
              </div>
            </div>

            <div className="sp-info-list">
              <div className="sp-info-item">
                <span className="sp-info-label">Program & Branch</span>
                <span className="sp-info-val">B.Tech Computer Science & Eng.</span>
              </div>
              <div className="sp-info-item">
                <span className="sp-info-label">Current Semester</span>
                <span className="sp-info-val">Semester VI (Year 3)</span>
              </div>
              <div className="sp-info-item">
                <span className="sp-info-label">School / Faculty</span>
                <span className="sp-info-val">School of Technology (SOT)</span>
              </div>
              <div className="sp-info-item">
                <span className="sp-info-label">Academic Year</span>
                <span className="sp-info-val">2025 - 2026</span>
              </div>
            </div>
          </div>

          {/* Card 2: Transport Pass & Route Assignment */}
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-icon">
                <Icon d="M20 12V22H4V12M22 7H2v5h20V7z" size={20} stroke="#0066ff" />
              </div>
              <div>
                <h3 className="sp-card-title">Assigned Bus & Pass</h3>
                <p className="sp-card-sub">Active transit allocation</p>
              </div>
            </div>

            <div className="sp-info-list">
              <div className="sp-info-item">
                <span className="sp-info-label">Pass ID</span>
                <span className="sp-info-val sp-val-blue">{currentStudent.transportPassId || "PASS-STU-2026-0125"}</span>
              </div>
              <div className="sp-info-item">
                <span className="sp-info-label">Assigned Bus</span>
                <span className="sp-info-val"><strong>{currentStudent.busId}</strong> ({currentStudent.routeName})</span>
              </div>
              <div className="sp-info-item">
                <span className="sp-info-label">Boarding Stop</span>
                <span className="sp-info-val">{currentStudent.pickupStop} ({currentStudent.pickupTime})</span>
              </div>
              <div className="sp-info-item">
                <span className="sp-info-label">Fee Status</span>
                <span className="sp-pass-tag-paid">PAID & SETTLED</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PERSONAL & CONTACT INFORMATION ──────────────────── */}
        <div className="sp-card">
          <div className="sp-card-header">
            <div className="sp-card-icon">
              <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={20} stroke="#0066ff" />
            </div>
            <div>
              <h3 className="sp-card-title">Personal & Contact Details</h3>
              <p className="sp-card-sub">Registered student communication data</p>
            </div>
          </div>

          <div className="sp-info-list">
            <div className="sp-info-item">
              <span className="sp-info-label">Full Name</span>
              <span className="sp-info-val">{formData.name}</span>
            </div>
            <div className="sp-info-item">
              <span className="sp-info-label">Phone Number</span>
              <span className="sp-info-val">{formData.phone}</span>
            </div>
            <div className="sp-info-item">
              <span className="sp-info-label">Email ID</span>
              <span className="sp-info-val">{formData.email}</span>
            </div>
            <div className="sp-info-item">
              <span className="sp-info-label">Emergency Contact Phone</span>
              <span className="sp-info-val">{formData.emergencyPhone}</span>
            </div>
            <div className="sp-info-item">
              <span className="sp-info-label">Residential Address</span>
              <span className="sp-info-val">{formData.address}</span>
            </div>
          </div>
        </div>

        {/* ── QUICK SHORTCUTS ─────────────────────────────────── */}
        <div className="sp-actions-bar">
          <div className="sp-action-card-btn" onClick={() => navigate("/student/pass")}>
            <div className="sp-action-card-left">
              <div className="sp-action-card-icon">
                <Icon d="M20 12V22H4V12M22 7H2v5h20V7z" size={18} stroke="#0066ff" />
              </div>
              <div>
                <h4 className="sp-action-card-name">View Transport Pass</h4>
                <p className="sp-action-card-sub">Digital ID & QR verification</p>
              </div>
            </div>
            <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
          </div>

          <div className="sp-action-card-btn" onClick={() => navigate("/student/fees")}>
            <div className="sp-action-card-left">
              <div className="sp-action-card-icon">
                <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" size={18} stroke="#0066ff" />
              </div>
              <div>
                <h4 className="sp-action-card-name">Fees & Receipts</h4>
                <p className="sp-action-card-sub">Download invoices & pay dues</p>
              </div>
            </div>
            <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
          </div>

          <div className="sp-action-card-btn" onClick={() => navigate("/student/emergency")}>
            <div className="sp-action-card-left">
              <div className="sp-action-card-icon">
                <Icon d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={18} stroke="#dc2626" />
              </div>
              <div>
                <h4 className="sp-action-card-name">Emergency Assistance</h4>
                <p className="sp-action-card-sub">Campus security & transport helpline</p>
              </div>
            </div>
            <Icon d="M9 18l6-6-6-6" size={16} stroke="#94a3b8" />
          </div>
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
                  <h3 className="glow-modal-title">Edit Student Profile</h3>
                  <p className="glow-modal-sub">Update your contact and residential details</p>
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
                    <label className="glow-modal-label">Phone Number</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">University Email ID</label>
                    <input
                      type="email"
                      className="glow-modal-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Emergency Phone</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="glow-modal-field glow-modal-field--full">
                    <label className="glow-modal-label">Residential Address</label>
                    <textarea
                      rows={2}
                      className="glow-modal-textarea"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="glow-modal-footer">
                <button
                  type="button"
                  className="sp-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sp-save-btn"
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

export default StudentProfile;
