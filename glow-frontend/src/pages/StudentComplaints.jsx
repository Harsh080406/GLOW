import { useState } from "react";
import StudentLayout from "../components/StudentLayout";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const CATEGORIES = [
  "Bus delay",
  "Driver issue",
  "Route issue",
  "Bus cleanliness",
  "Overcrowding",
  "Lost item",
  "Other",
];

const StudentComplaints = () => {
  const { currentStudent, complaints, submitComplaint } = useTransit();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const studentComplaints = complaints.filter((c) => c.studentId === currentStudent.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitComplaint({
        category: category,
        description: description,
        busId: currentStudent.busId,
        routeId: currentStudent.routeId,
        photoAttached: hasPhoto,
      });
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setDescription("");
      setHasPhoto(false);
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 800);
  };

  return (
    <StudentLayout title="Complaints & Support" subtitle="Report transportation issues, feedback, lost items, and track ticket resolutions">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* ── SUBMIT COMPLAINT FORM ─────────────────────────────── */}
        <div className="ad-card">
          <div className="ad-card-header">
            <div>
              <h3 className="ad-card-title">Submit a New Complaint</h3>
              <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Our transport helpdesk investigates every ticket within 24 hours.</p>
            </div>
            <span className="ad-badge ad-badge--blue">Helpdesk 24/7</span>
          </div>

          {submitSuccess && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ✓ Your complaint has been submitted successfully! Transport Officer will review it shortly.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Select Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>Bus ID</label>
                <input
                  type="text"
                  value={currentStudent.busId}
                  disabled
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>Assigned Route</label>
                <input
                  type="text"
                  value={currentStudent.routeId}
                  disabled
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 600 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, specify stop name, date, time, and details..."
                required
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569" }}>
                <input
                  type="checkbox"
                  checked={hasPhoto}
                  onChange={(e) => setHasPhoto(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span>Attach photo evidence or screenshot (Simulated)</span>
              </label>
              {hasPhoto && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#f1f5f9", borderRadius: 6, fontSize: 12, color: "#2563eb", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📷 photo_evidence_220826.jpg attached (1.2 MB)</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Submitting Ticket..." : "Submit Complaint"}
            </button>
          </form>
        </div>

        {/* ── TRACK COMPLAINTS ───────────────────────────────────── */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">My Complaint Tickets ({studentComplaints.length})</h3>
            <span className="ad-badge ad-badge--green">Live Tracking</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {studentComplaints.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#7c8494" }}>No complaints lodged. Everything running smoothly!</p>
            ) : (
              studentComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedTicket(c)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `1px solid ${selectedTicket?.id === c.id ? "#3b82f6" : "#e2e8f0"}`,
                    background: selectedTicket?.id === c.id ? "#eff6ff" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>{c.id}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{c.category}</h4>
                    </div>
                    <span className={`ad-badge ${c.status === "Resolved" ? "ad-badge--green" : c.status === "In Progress" ? "ad-badge--blue" : "ad-badge--yellow"}`}>
                      ● {c.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {c.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 11.5, color: "#94a3b8" }}>
                    <span>Lodged: {c.date}</span>
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>Click to view staff reply →</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket detail modal or drawer */}
          {selectedTicket && (
            <div style={{ marginTop: 20, padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Ticket Details: {selectedTicket.id}</h4>
                <button onClick={() => setSelectedTicket(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontWeight: 700 }}>✕ Close</button>
              </div>
              <p style={{ fontSize: 13, color: "#334155", marginBottom: 12 }}><strong>Student Description:</strong> {selectedTicket.description}</p>
              <div style={{ padding: "12px", background: "#fff", borderRadius: 8, borderLeft: "3px solid #22c55e" }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: "#166534" }}>Transport Helpdesk Response ({selectedTicket.assignedTo}):</p>
                <p style={{ fontSize: 13, color: "#15803d", marginTop: 4 }}>{selectedTicket.response || "Ticket currently being investigated by route operations officer."}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </StudentLayout>
  );
};

export default StudentComplaints;
