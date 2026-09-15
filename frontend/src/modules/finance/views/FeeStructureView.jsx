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
  const { feeStructures, setFeeStructures, addFeeStructure } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Annual");
  const [newZone, setNewZone] = useState("Zone A");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("15 Sep 2026");

  const handleAddFee = (e) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    addFeeStructure({
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

  const toggleStatus = (id) => {
    setFeeStructures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f))
    );
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
              <div className="ad-topbar-subtitle">Define Zone-based, Distance-based, and Semester Transit Tariffs</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => setShowAddModal(true)}>
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Create Fee Slab
              </button>
            </div>
          </header>

          <main className="ad-content">
            {/* ── ZONE-BASED & SEMESTER FEE SLABS ───────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { zone: "Zone A", dist: "0 - 5 km from Campus", amount: "₹12,000 / year", type: "Annual Slab", color: "#3b82f6", bg: "#eff6ff" },
                { zone: "Zone B", dist: "5 - 12 km from Campus", amount: "₹15,000 / year", type: "Annual Slab", color: "#059669", bg: "#ecfdf5" },
                { zone: "Zone C", dist: "12 - 20 km from Campus", amount: "₹18,000 / year", type: "Annual Slab", color: "#8b5cf6", bg: "#f5f3ff" },
                { zone: "Semester Plan", dist: "Flexible Half-Year", amount: "₹7,500 / sem", type: "Semester Slab", color: "#f59e0b", bg: "#fffbeb" },
              ].map((slab) => (
                <div key={slab.zone} style={{ background: slab.bg, border: `1px solid ${slab.color}33`, borderRadius: 14, padding: "20px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: slab.color, textTransform: "uppercase" }}>{slab.type}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "#1e293b", marginTop: 4 }}>{slab.zone}</h3>
                  <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>{slab.dist}</p>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: slab.color }}>{slab.amount}</span>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>AY 2026-27</span>
                  </div>
                </div>
              ))}
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
                    {feeStructures.map((f) => (
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
                          <button
                            onClick={() => toggleStatus(f.id)}
                            style={{ padding: "4px 10px", background: f.status === "Active" ? "#fef2f2" : "#f0fdf4", color: f.status === "Active" ? "#dc2626" : "#16a34a", border: `1px solid ${f.status === "Active" ? "#fecaca" : "#bbf7d0"}`, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            {f.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
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
                  placeholder="e.g. Zone D (20 - 30 km Express)"
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
                    <option value="Annual">Annual</option>
                    <option value="Semester">Semester</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Zone / Region</label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13.5, background: "#fff" }}
                  >
                    <option value="Zone A">Zone A (0 - 5 km)</option>
                    <option value="Zone B">Zone B (5 - 12 km)</option>
                    <option value="Zone C">Zone C (12 - 20 km)</option>
                    <option value="Zone D">Zone D (20+ km)</option>
                    <option value="All Zones">All Zones</option>
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
