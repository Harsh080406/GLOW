import { useState, useEffect, useRef } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const CATEGORIES = [
  "Bus delay",
  "Driver issue",
  "Route issue",
  "Bus cleanliness",
  "Overcrowding",
  "Lost item",
  "Air Conditioning / Facility",
  "Fare / Pass issue",
  "Other",
];

const StudentComplaints = () => {
  const { currentStudent, complaints, submitStudentComplaint } = useTransit();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Proof attachment state
  const [attachment, setAttachment] = useState(null); // base64 string
  const [proofName, setProofName] = useState("");
  const [proofSize, setProofSize] = useState("");
  const [proofType, setProofType] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalProof, setPreviewModalProof] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileProcess = (file) => {
    setFileError("");
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File is too large. Maximum allowed size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachment(e.target.result);
      setProofName(file.name);
      setProofType(file.type);
      const formattedSize = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      setProofSize(formattedSize);
    };
    reader.onerror = () => {
      setFileError("Failed to read file. Please try another image or document.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleRemoveProof = () => {
    setAttachment(null);
    setProofName("");
    setProofSize("");
    setProofType("");
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await submitStudentComplaint({
        category,
        subject: category,
        description,
        priority: "MEDIUM",
        attachment: attachment || undefined,
        proofName: proofName || undefined,
      });
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setDescription("");
      handleRemoveProof();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setIsSubmitting(false);
      console.warn("Complaint submit error:", err);
    }
  };

  return (
    <div className="student-view-wrap">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* SUBMIT COMPLAINT FORM */}
        <div className="ad-card" style={{ padding: 24, borderRadius: 16 }}>
          <div className="ad-card-header" style={{ marginBottom: 16, alignItems: "flex-start" }}>
            <div>
              <h3 className="ad-card-title" style={{ fontSize: 18, fontWeight: 800 }}>Submit a New Complaint</h3>
              <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Transport helpdesk investigates every ticket within 24 hours.</p>
            </div>
            <span className="ad-badge ad-badge--blue" style={{ padding: "4px 10px", fontSize: 11.5 }}>Helpdesk 24/7</span>
          </div>

          {submitSuccess && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✓</span>
              <span>Your complaint ticket with attached proof has been logged! Transport Officer will review it.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Select Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff", minHeight: 44, color: "#1e293b", fontWeight: 500 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Describe Your Complaint</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give details about bus stop location, driver behavior, delay minutes..."
                required
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, fontFamily: "inherit", color: "#1e293b", resize: "vertical" }}
              />
            </div>

            {/* ATTACH PROOF SECTION */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
                  Attach Proof / Evidence <span style={{ fontWeight: 400, color: "#64748b" }}>(Optional)</span>
                </label>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>Max 5MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="complaint-proof-upload"
              />

              {!attachment ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? "#2563eb" : "#cbd5e1"}`,
                    background: isDragging ? "#eff6ff" : "#f8fafc",
                    borderRadius: 10,
                    padding: "20px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e7ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 18 }}>
                    📎
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>
                    Click or drag & drop proof file here
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    Attach bus photo, ticketing slip, GPS screenshot, or PDF document
                  </div>
                </div>
              ) : (
                <div style={{ border: "1.5px solid #bfdbfe", background: "#eff6ff", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {attachment.startsWith("data:image/") ? (
                      <img
                        src={attachment}
                        alt="Proof preview"
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1", flexShrink: 0, cursor: "pointer" }}
                        onClick={() => setPreviewModalProof({ url: attachment, name: proofName, type: "image" })}
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        📄
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {proofName || "Attached Proof"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#64748b" }}>
                        {proofSize} • <span style={{ color: "#16a34a", fontWeight: 600 }}>Ready to upload</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {attachment.startsWith("data:image/") && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalProof({ url: attachment, name: proofName, type: "image" })}
                        style={{ padding: "6px 10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: "#2563eb", cursor: "pointer" }}
                      >
                        Preview
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      style={{ padding: "6px 10px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: "#b91c1c", cursor: "pointer" }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                  ⚠️ {fileError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                background: isSubmitting ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s ease"
              }}
            >
              {isSubmitting ? (
                <>Submitting Ticket with Proof...</>
              ) : (
                <>Submit Complaint Ticket</>
              )}
            </button>
          </form>
        </div>

        {/* MY COMPLAINTS TIMELINE */}
        <div className="ad-card" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="ad-card-title" style={{ fontSize: 18, fontWeight: 800 }}>My Ticket Status Timeline</h3>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{(complaints || []).length} Tickets</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(complaints || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>No Complaints Logged</div>
                <p style={{ fontSize: 12.5, marginTop: 4 }}>You have not reported any transport issues yet.</p>
              </div>
            ) : (
              (complaints || []).map((c, i) => (
                <div key={c._id || i} style={{ padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", transition: "box-shadow 0.2s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{c.category}</span>
                      {c.priority && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: c.priority === "HIGH" ? "#fee2e2" : "#f1f5f9", color: c.priority === "HIGH" ? "#b91c1c" : "#475569" }}>
                          {c.priority}
                        </span>
                      )}
                    </div>
                    <span className={`ad-badge ${c.status === "RESOLVED" ? "ad-badge--green" : c.status === "IN_REVIEW" ? "ad-badge--blue" : "ad-badge--yellow"}`} style={{ fontSize: 11.5 }}>
                      ● {c.status || "PENDING"}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: c.attachment || c.resolutionNotes ? 10 : 0 }}>
                    {c.description || c.subject}
                  </p>

                  {/* Attached Proof View in Timeline */}
                  {c.attachment && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#334155" }}>
                        <span>📎</span>
                        <span style={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.proofName || "Attached Proof File"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewModalProof({ url: c.attachment, name: c.proofName || "Attached Proof", type: c.attachment.startsWith("data:image/") ? "image" : "doc" })}
                        style={{ padding: "4px 10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: "#2563eb", cursor: "pointer" }}
                      >
                        View Proof ↗
                      </button>
                    </div>
                  )}

                  {/* Resolution Notes from Admin */}
                  {c.resolutionNotes && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, fontSize: 12, color: "#065f46" }}>
                      <strong>Officer Resolution:</strong> {c.resolutionNotes}
                    </div>
                  )}

                  <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                    <span>Ticket ID: #{c._id?.toString().slice(-6) || `GLOW-${i + 1}`}</span>
                    <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recent"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PROOF PREVIEW MODAL */}
      {previewModalProof && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 20,
          }}
          onClick={() => setPreviewModalProof(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 600,
              width: "100%",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
                📎 Attached Proof: {previewModalProof.name}
              </h4>
              <button
                onClick={() => setPreviewModalProof(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>
              {previewModalProof.url?.startsWith("data:image/") || previewModalProof.type === "image" ? (
                <img
                  src={previewModalProof.url}
                  alt="Full proof preview"
                  style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: 8, objectFit: "contain", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{previewModalProof.name}</div>
                  <a
                    href={previewModalProof.url}
                    download={previewModalProof.name || "proof_document"}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", padding: "10px 20px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}
                  >
                    Download / Open Document ↗
                  </a>
                </div>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", background: "#fff", textAlign: "right" }}>
              <button
                onClick={() => setPreviewModalProof(null)}
                style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentComplaints;

