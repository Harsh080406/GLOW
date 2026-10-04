import { useState, useEffect } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

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
  const { currentStudent } = useTransit();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [complaintList, setComplaintList] = useState([]);

  useEffect(() => {
    fetch("/api/v1/student/me/complaints", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.complaints) {
          setComplaintList(data.complaints);
        }
      })
      .catch((err) => console.warn("Complaints fetch fallback active:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    fetch("/api/v1/student/me/complaints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
      body: JSON.stringify({
        category,
        subject: category,
        description,
        priority: "MEDIUM",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setDescription("");
        if (data?.complaint) {
          setComplaintList((prev) => [data.complaint, ...prev]);
        }
        setTimeout(() => setSubmitSuccess(false), 4000);
      })
      .catch((err) => {
        setIsSubmitting(false);
        console.warn("Complaint POST error:", err);
      });
  };

  return (
    <div className="student-view-wrap">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* SUBMIT COMPLAINT FORM */}
        <div className="ad-card">
          <div className="ad-card-header">
            <div>
              <h3 className="ad-card-title">Submit a New Complaint</h3>
              <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Transport helpdesk investigates every ticket within 24 hours.</p>
            </div>
            <span className="ad-badge ad-badge--blue">Helpdesk 24/7</span>
          </div>

          {submitSuccess && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ✓ Your complaint ticket has been logged! Transport Officer will review it.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Select Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff", minHeight: 44 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Describe Your Complaint</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give details about bus stop location, driver behavior, delay minutes..."
                required
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", minHeight: 44 }}
            >
              {isSubmitting ? "Submitting Ticket..." : "Submit Complaint Ticket"}
            </button>
          </form>
        </div>

        {/* MY COMPLAINTS TIMELINE */}
        <div className="ad-card">
          <h3 className="ad-card-title" style={{ marginBottom: 16 }}>My Ticket Status Timeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {complaintList.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>No complaints submitted yet.</p>
            ) : (
              complaintList.map((c, i) => (
                <div key={c._id || i} style={{ padding: "14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>{c.category}</span>
                    <span className={`ad-badge ${c.status === "RESOLVED" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                      ● {c.status || "PENDING"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.4 }}>{c.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentComplaints;
