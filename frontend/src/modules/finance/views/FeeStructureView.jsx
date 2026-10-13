import { useState } from "react";
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

const FeeStructure = () => {
  const { feeStructures, setFeeStructures, addFeeStructure, authFetch } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Annual");
  const [newZone, setNewZone] = useState("Zone A");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("15 Sep 2026");

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    await addFeeStructure({
      name: newName,
      type: newType,
      zone: newZone,
      amount: Number(newAmount),
      dueDate: newDueDate,
      status: "Active",
    });

    setShowAddModal(false);
    setNewName("");
    setNewAmount("");
  };

  const toggleStatus = async (item) => {
    const id = item.id || item._id;
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    setFeeStructures((prev) =>
      prev.map((f) => ((f.id === id || f._id === id) ? { ...f, status: nextStatus } : f))
    );
    try {
      await authFetch(`/finance/fee-structures/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.warn("Toggle status error:", err.message);
    }
  };

  const handleDeleteFee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fee slab?")) return;
    setFeeStructures((prev) => prev.filter((f) => f.id !== id && f._id !== id));
    try {
      await authFetch(`/finance/fee-structures/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Delete fee slab error:", err.message);
    }
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="fee_structure" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Fee Structure Management</div>
              <div className="ad-topbar-subtitle">Fixed Annual Transit Tariff · ₹15,000 / Year (Any Kilometer · No Quarters or Semesters)</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => setShowAddModal(true)}>
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Create Fee Slab
              </button>
            </div>
          </header>

          <main className="ad-content">
            {/* ── UNIFORM ANNUAL FIXED FEE PLAN (₹15,000 FOR WHOLE YEAR) ──── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", border: "1.5px solid #10b98144", borderRadius: 16, padding: "22px", boxShadow: "0 4px 16px rgba(16, 185, 129, 0.08)" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5 }}>● Universal Fixed Annual Tariff</span>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#065f46", marginTop: 4 }}>Annual Transport Plan</h3>
                <p style={{ fontSize: 13, color: "#047857", marginTop: 3 }}>Single flat tariff covering all 13 routes and any distance across Vadodara</p>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(16, 185, 129, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#059669" }}>₹15,000 / year</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>AY 2026-27</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Kilometer / Distance Rule</span>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>Any Distance Covered</h4>
                  <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>No distance slabs (0 - 35+ km). Students from any pickup stop pay the exact same flat fee.</p>
                </div>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, color: "#059669", fontWeight: 700, fontSize: 12.5 }}>
                  ✓ Zero Distance Surcharges
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Billing Period</span>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>Full Academic Year</h4>
                  <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>One fixed fee for 365 days. No quarterly plans, no half-year semester split.</p>
                </div>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, color: "#0284c7", fontWeight: 700, fontSize: 12.5 }}>
                  ✓ Valid Until 31 May 2027
                </div>
              </div>
            </div>

            {/* ── MASTER FEE SLABS TABLE ───────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <div>
                  <h3 className="ad-card-title">Configured Fee Tariffs</h3>
                  <p style={{ fontSize: 12.5, color: "#7c8494", marginTop: 2 }}>Zone tariffs mapped to student boarding stops and billing cycles</p>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Tariff ID</th>
                      <th className="ad-th">Fee Plan Name</th>
                      <th className="ad-th">Billing Type</th>
                      <th className="ad-th">Zone / Distance</th>
                      <th className="ad-th">Tariff Amount</th>
                      <th className="ad-th">Payment Due Date</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(feeStructures || []).map((f) => (
                      <tr key={f.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{f.id}</td>
                        <td className="ad-td"><strong>{f.name}</strong></td>
                        <td className="ad-td">{f.type}</td>
                        <td className="ad-td">{f.zone}</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#059669" }}>₹{f.amount.toLocaleString()}</td>
                        <td className="ad-td">{f.dueDate}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${f.status === "Active" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            ● {f.status}
                          </span>
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => toggleStatus(f)}
                              style={{ padding: "4px 10px", background: f.status === "Active" ? "#fef2f2" : "#f0fdf4", color: f.status === "Active" ? "#dc2626" : "#16a34a", border: `1px solid ${f.status === "Active" ? "#fecaca" : "#bbf7d0"}`, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                              {f.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteFee(f.id || f._id)}
                              style={{ padding: "4px 8px", background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                              title="Delete tariff"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>

      {/* ── CREATE FEE SLAB MODAL ──────────────────────────────── */}
      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Create New Transport Fee Slab</h3>
            <form onSubmit={handleAddFee}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Fee Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Campus Transit (All Routes)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Plan Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff" }}
                  >
                    <option value="Annual">Annual (Full Year)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Distance / Region</label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff" }}
                  >
                    <option value="All Zones">All Zones (Any Distance)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Fee Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Due Date</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save Fee Slab
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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

export default FeeStructure;
