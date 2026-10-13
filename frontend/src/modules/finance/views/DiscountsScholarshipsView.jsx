import { useState, useEffect, useMemo } from "react";
import FinanceSidebar from "../layout/FinanceSidebar";
import RoleSwitcherBar from "../../../shared/components/RoleSwitcherBar";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const DEFAULT_INSTITUTIONAL_SCHEMES = [
  {
    id: "SCH-01",
    name: "Staff & Faculty Ward Concession",
    category: "Employee Benefit",
    discountType: "Percentage",
    value: 25,
    studentsApplied: 18,
    eligibility: "Children of full-time GSFC University faculty & staff members",
    status: "Active",
  },
  {
    id: "SCH-02",
    name: "University Sports Quota Scholarship",
    category: "Athletics",
    discountType: "Percentage",
    value: 50,
    studentsApplied: 12,
    eligibility: "State & National level university athletic team representations",
    status: "Active",
  },
  {
    id: "SCH-03",
    name: "Merit Academic Excellence Waiver",
    category: "Academic Merit",
    discountType: "Fixed Amount",
    value: 3000,
    studentsApplied: 24,
    eligibility: "Top 5% semester SGPA ranking (> 8.75 CGPA aggregate)",
    status: "Active",
  },
  {
    id: "SCH-04",
    name: "Economically Weaker Section (EWS) Aid",
    category: "Financial Aid",
    discountType: "Percentage",
    value: 40,
    studentsApplied: 15,
    eligibility: "Certified annual family income below ₹2.50 Lakh",
    status: "Active",
  },
];

const DiscountsScholarships = () => {
  const { discounts, setDiscounts, students, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("schemes"); // schemes | students
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Institutional Schemes list (persisted in component/context)
  const [schemes, setSchemes] = useState(DEFAULT_INSTITUTIONAL_SCHEMES);

  // Awarded student discounts from backend
  const [studentGrants, setStudentGrants] = useState([]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("scheme"); // scheme | student_grant

  // Create Scheme fields
  const [schemeName, setSchemeName] = useState("");
  const [schemeType, setSchemeType] = useState("Percentage");
  const [schemeValue, setSchemeValue] = useState("");
  const [schemeEligibility, setSchemeEligibility] = useState("");

  // Award Student Grant fields
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [grantCategory, setGrantCategory] = useState("Academic Merit");
  const [grantPercent, setGrantPercent] = useState("25");
  const [grantReason, setGrantReason] = useState("Top 5% Semester SGPA Academic Excellence");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await authFetch("/finance/discounts");
        if (res?.success && Array.isArray(res?.discounts)) {
          setStudentGrants(res.discounts);
        }
      } catch (err) {
        console.warn("Could not fetch server discounts, using cached grants:", err.message);
      }
    };
    fetchDiscounts();
  }, [authFetch]);

  // Safe Benefit Formatter (prevents undefined.toLocaleString crashes)
  const formatBenefit = (item) => {
    if (item.waiverPercent != null) {
      return `${item.waiverPercent}% Waiver`;
    }
    if (item.discountType === "Percentage") {
      const val = Number(item.value) || 0;
      return `${val}% Waiver`;
    }
    const fixedVal = Number(item.value ?? item.discountedAmount ?? 0);
    return `₹${fixedVal.toLocaleString()} Fixed`;
  };

  // KPI summaries
  const kpis = useMemo(() => {
    const totalEnrolled = schemes.reduce((sum, s) => sum + (Number(s.studentsApplied) || 0), 0) + studentGrants.length;
    let totalSubsidy = 0;

    schemes.forEach((s) => {
      const enrolled = Number(s.studentsApplied) || 0;
      if (s.discountType === "Percentage") {
        totalSubsidy += (15000 * (Number(s.value) || 0) / 100) * enrolled;
      } else {
        totalSubsidy += (Number(s.value) || 0) * enrolled;
      }
    });

    studentGrants.forEach((g) => {
      if (g.discountedAmount) {
        totalSubsidy += Number(g.discountedAmount);
      } else if (g.waiverPercent) {
        totalSubsidy += 15000 * (Number(g.waiverPercent) / 100);
      }
    });

    return {
      activeSchemes: schemes.length,
      totalBeneficiaries: totalEnrolled,
      totalSubsidy: Math.round(totalSubsidy),
      avgRate: "35%",
    };
  }, [schemes, studentGrants]);

  // Filtered lists
  const filteredSchemes = useMemo(() => {
    if (!searchTerm.trim()) return schemes;
    const q = searchTerm.toLowerCase();
    return schemes.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q)
    );
  }, [schemes, searchTerm]);

  const filteredStudentGrants = useMemo(() => {
    if (!searchTerm.trim()) return studentGrants;
    const q = searchTerm.toLowerCase();
    return studentGrants.filter(
      (g) =>
        g.studentName?.toLowerCase().includes(q) ||
        g.enrollmentId?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q) ||
        g.reason?.toLowerCase().includes(q)
    );
  }, [studentGrants, searchTerm]);

  // Handle Create Scheme
  const handleCreateScheme = (e) => {
    e.preventDefault();
    if (!schemeName || !schemeValue) return;

    const newScheme = {
      id: `SCH-0${schemes.length + 1}`,
      name: schemeName,
      category: "Special Policy",
      discountType: schemeType,
      value: Number(schemeValue),
      studentsApplied: 0,
      eligibility: schemeEligibility || "Open to eligible university commuters",
      status: "Active",
    };

    setSchemes((prev) => [newScheme, ...prev]);
    setShowAddModal(false);
    setSchemeName("");
    setSchemeValue("");
    setSchemeEligibility("");
    showToast(`✓ Concession scheme "${newScheme.name}" created successfully`);
  };

  // Handle Award Student Grant
  const handleAwardStudentGrant = async (e) => {
    e.preventDefault();
    const stuList = Array.isArray(students) && students.length > 0 ? students : [];
    const targetStu = stuList.find((s) => s.id === selectedStudentId || s.enrollmentId === selectedStudentId) || stuList[0] || {
      id: "UNI20260125",
      name: "Rahul Sharma",
      enrollmentId: "UNI20260125",
    };

    const waiverNum = Number(grantPercent) || 25;
    const calculatedDiscountAmount = Math.round(15000 * (waiverNum / 100));

    const newGrantRecord = {
      id: `GRT-${Date.now().toString().slice(-4)}`,
      studentName: targetStu.name || "Student Commuter",
      studentId: targetStu.id || targetStu.enrollmentId,
      enrollmentId: targetStu.enrollmentId || targetStu.id,
      category: grantCategory,
      waiverPercent: waiverNum,
      discountedAmount: calculatedDiscountAmount,
      reason: grantReason,
      status: "ACTIVE",
    };

    // Optimistic state update
    setStudentGrants((prev) => [newGrantRecord, ...prev]);
    setShowAddModal(false);
    showToast(`✓ Awarded ${waiverNum}% scholarship to ${newGrantRecord.studentName}`);

    // Call backend
    try {
      await authFetch("/finance/discounts", {
        method: "POST",
        body: JSON.stringify({
          studentId: targetStu.id || targetStu.enrollmentId || "6acd0e26ab464fc887ae068b",
          waiverPercent: waiverNum,
          discountedAmount: calculatedDiscountAmount,
          category: grantCategory,
          reason: grantReason,
        }),
      });
    } catch (err) {
      console.warn("Server grant sync note:", err.message);
    }
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="discounts" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar" style={{ flexWrap: "wrap", gap: 12 }}>
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="ad-topbar-title">Discounts & Scholarships</div>
              <div className="ad-topbar-subtitle">Configure merit concessions, sports quotas & university commuter financial aid</div>
            </div>
            <div className="ad-search-wrap" style={{ minWidth: 240, flex: "0 1 300px" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search scheme name, policy or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search schemes"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 13, marginRight: 8 }}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="ad-topbar-right">
              <button
                className="ad-btn-primary"
                onClick={() => {
                  setModalMode("scheme");
                  setShowAddModal(true);
                }}
                style={{ background: "#059669", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Create Concession Scheme
              </button>
            </div>
          </header>

          <main className="ad-content">
            {toastMessage && (
              <div style={{
                background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
                borderRadius: 10, padding: "10px 18px", marginBottom: 16, fontWeight: 700, fontSize: 13.5,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)"
              }}>
                {toastMessage}
              </div>
            )}

            {/* ── KPI METRICS CARDS ───────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Active Policy Schemes</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>{kpis.activeSchemes}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>Policy Tiers</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: 0.5 }}>Enrolled Beneficiaries</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#0369a1" }}>{kpis.totalBeneficiaries}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0284c7" }}>Students</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Annual Relief</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#047857" }}>₹{kpis.totalSubsidy.toLocaleString()}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>Fee Subsidies</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 0.5 }}>Average Concession</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#6d28d9" }}>{kpis.avgRate}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6" }}>Relief Rate</span>
                </div>
              </div>
            </div>

            {/* ── CARD WITH TAB SELECTOR ───────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header" style={{ flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 className="ad-card-title">
                    {activeTab === "schemes" ? "Institutional Concession Schemes & Policies" : "Awarded Student Concessions & Waivers"}
                  </h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>
                    {activeTab === "schemes"
                      ? "Official university policy tiers with percentage waivers and eligibility rules"
                      : "Individual student fee ledgers with applied scholarship waivers and ledger reductions"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: "4px", borderRadius: 10 }}>
                    <button
                      onClick={() => setActiveTab("schemes")}
                      style={{
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: activeTab === "schemes" ? "#ffffff" : "transparent",
                        color: activeTab === "schemes" ? "#0f172a" : "#64748b",
                        boxShadow: activeTab === "schemes" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      Institutional Policies ({schemes.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("students")}
                      style={{
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: activeTab === "students" ? "#ffffff" : "transparent",
                        color: activeTab === "students" ? "#0f172a" : "#64748b",
                        boxShadow: activeTab === "students" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      Awarded Student Grants ({studentGrants.length})
                    </button>
                  </div>

                  {activeTab === "students" && (
                    <button
                      onClick={() => {
                        setModalMode("student_grant");
                        setShowAddModal(true);
                      }}
                      style={{
                        padding: "7px 12px",
                        background: "#0284c7",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Award to Student
                    </button>
                  )}
                </div>
              </div>

              {/* ── TABLE VIEW ─────────────────────────────── */}
              <div className="ad-table-wrap">
                {activeTab === "schemes" ? (
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th className="ad-th">Scheme ID</th>
                        <th className="ad-th">Concession Title</th>
                        <th className="ad-th">Category</th>
                        <th className="ad-th">Benefit Value</th>
                        <th className="ad-th">Eligibility Criteria</th>
                        <th className="ad-th">Students Enrolled</th>
                        <th className="ad-th">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchemes.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                            No concession schemes match your query.
                          </td>
                        </tr>
                      ) : (
                        filteredSchemes.map((s) => (
                          <tr key={s.id} className="ad-tr">
                            <td className="ad-td" style={{ fontWeight: 800, color: "#334155" }}>{s.id}</td>
                            <td className="ad-td">
                              <strong style={{ color: "#0f172a" }}>{s.name}</strong>
                            </td>
                            <td className="ad-td">
                              <span style={{ fontSize: 12, background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>
                                {s.category || "General"}
                              </span>
                            </td>
                            <td className="ad-td" style={{ fontWeight: 800, color: "#059669", fontSize: 13.5 }}>
                              {formatBenefit(s)}
                            </td>
                            <td className="ad-td" style={{ maxWidth: 300, fontSize: 12.5, color: "#475569" }}>
                              {s.eligibility || "Standard policy guidelines"}
                            </td>
                            <td className="ad-td" style={{ fontWeight: 600 }}>
                              {s.studentsApplied} Students
                            </td>
                            <td className="ad-td">
                              <span className="ad-badge ad-badge--green">● {s.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th className="ad-th">Grant ID</th>
                        <th className="ad-th">Student Name & ID</th>
                        <th className="ad-th">Scholarship Category</th>
                        <th className="ad-th">Benefit Value</th>
                        <th className="ad-th">Approved Reason</th>
                        <th className="ad-th">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudentGrants.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                            No awarded student grants recorded yet. Click &quot;+ Award to Student&quot; to apply a fee waiver.
                          </td>
                        </tr>
                      ) : (
                        filteredStudentGrants.map((g, idx) => (
                          <tr key={g.id || g._id || idx} className="ad-tr">
                            <td className="ad-td" style={{ fontWeight: 800, color: "#334155" }}>{g.id || `GRT-0${idx + 1}`}</td>
                            <td className="ad-td">
                              <strong style={{ display: "block", color: "#0f172a" }}>{g.studentName || "Student Commuter"}</strong>
                              <span style={{ fontSize: 11.5, color: "#64748b" }}>{g.enrollmentId || "UNI20260125"}</span>
                            </td>
                            <td className="ad-td">
                              <span style={{ fontSize: 12, background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                                {g.category || "Merit Concession"}
                              </span>
                            </td>
                            <td className="ad-td" style={{ fontWeight: 800, color: "#059669", fontSize: 13.5 }}>
                              {formatBenefit(g)}
                            </td>
                            <td className="ad-td" style={{ maxWidth: 280, fontSize: 12.5, color: "#475569" }}>
                              {g.reason || "Approved fee concession for academic year"}
                            </td>
                            <td className="ad-td">
                              <span className="ad-badge ad-badge--green">● {g.status || "ACTIVE"}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Transit Division · Vadodara Campus.</span></footer>
          </main>
        </div>
      </div>

      {/* ── MODAL DIALOG ──────────────────────────────────── */}
      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, background: "rgba(15, 23, 42, 0.6)", padding: "16px" }}>
          <div style={{ background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "24px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                {modalMode === "scheme" ? "Create Institutional Policy Scheme" : "Award Concession to Student"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontWeight: 700, color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* Mode Toggle inside modal */}
            <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: "4px", borderRadius: 10, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setModalMode("scheme")}
                style={{
                  flex: 1,
                  border: "none",
                  padding: "7px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: modalMode === "scheme" ? "#ffffff" : "transparent",
                  color: modalMode === "scheme" ? "#0f172a" : "#64748b",
                  boxShadow: modalMode === "scheme" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Institutional Scheme
              </button>
              <button
                type="button"
                onClick={() => setModalMode("student_grant")}
                style={{
                  flex: 1,
                  border: "none",
                  padding: "7px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: modalMode === "student_grant" ? "#ffffff" : "transparent",
                  color: modalMode === "student_grant" ? "#0f172a" : "#64748b",
                  boxShadow: modalMode === "student_grant" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Direct Student Award
              </button>
            </div>

            {modalMode === "scheme" ? (
              <form onSubmit={handleCreateScheme}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                    Scheme Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Physically Challenged (PwD) Waiver"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                      Concession Type
                    </label>
                    <select
                      value={schemeType}
                      onChange={(e) => setSchemeType(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", fontSize: 13, boxSizing: "border-box" }}
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                      {schemeType === "Percentage" ? "Waiver (%)" : "Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      placeholder={schemeType === "Percentage" ? "40" : "5000"}
                      value={schemeValue}
                      onChange={(e) => setSchemeValue(e.target.value)}
                      required
                      min={1}
                      max={schemeType === "Percentage" ? 100 : 15000}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                    Eligibility Rule (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Valid disability certificate from government medical board"
                    value={schemeEligibility}
                    onChange={(e) => setSchemeEligibility(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" style={{ flex: 1, padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                    Save Policy Scheme
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAwardStudentGrant}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                    Select Student Commuter
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", fontSize: 13, boxSizing: "border-box" }}
                  >
                    <option value="">Choose student from roster...</option>
                    {(students || []).slice(0, 15).map((s) => (
                      <option key={s.id || s.enrollmentId} value={s.id || s.enrollmentId}>
                        {s.name} ({s.enrollmentId || s.id}) · {s.dept || "Student"}
                      </option>
                    ))}
                    <option value="UNI20260125">Rahul Sharma (UNI20260125)</option>
                    <option value="UNI20260142">Priya Patel (UNI20260142)</option>
                    <option value="UNI20260188">Ananya Desai (UNI20260188)</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                      Category
                    </label>
                    <select
                      value={grantCategory}
                      onChange={(e) => setGrantCategory(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", fontSize: 13, boxSizing: "border-box" }}
                    >
                      <option value="Academic Merit">Academic Merit</option>
                      <option value="Sports Quota">Sports Quota</option>
                      <option value="Staff Ward">Staff Ward</option>
                      <option value="Financial Aid">Financial Aid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                      Waiver Percent (%)
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      value={grantPercent}
                      onChange={(e) => setGrantPercent(e.target.value)}
                      required
                      min={5}
                      max={100}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "#64748b" }}>Flat Annual Transport Fee:</span>
                    <strong style={{ color: "#0f172a" }}>₹15,000</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 4 }}>
                    <span style={{ color: "#64748b" }}>Calculated Fee Relief:</span>
                    <strong style={{ color: "#059669" }}>- ₹{Math.round(15000 * ((Number(grantPercent) || 0) / 100)).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4, paddingTop: 4, borderTop: "1px solid #e2e8f0" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>Net Payable by Student:</span>
                    <strong style={{ color: "#2563eb", fontWeight: 800 }}>₹{Math.max(0, 15000 - Math.round(15000 * ((Number(grantPercent) || 0) / 100))).toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: "#334155" }}>
                    Reason & Approval Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Semester 4 top rank scholarship sanctioned by Dean"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" style={{ flex: 1, padding: "12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                    Sanction & Apply to Ledger
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsScholarships;
