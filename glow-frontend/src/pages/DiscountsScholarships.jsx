import { useState } from "react";
import FinanceSidebar from "../components/FinanceSidebar";
import RoleSwitcherBar from "../components/RoleSwitcherBar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const DiscountsScholarships = () => {
  const { discounts, setDiscounts } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [value, setValue] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !value) return;

    setDiscounts((prev) => [
      ...prev,
      {
        id: `DSC-0${prev.length + 1}`,
        name: name,
        discountType: discountType,
        value: Number(value),
        studentsApplied: 0,
        status: "Active",
      },
    ]);

    setShowAddModal(false);
    setName("");
    setValue("");
  };

  return (
    <div className="ad-wrapper">
      <RoleSwitcherBar />
      <div className="ad-root">
        <FinanceSidebar activeId="discounts" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Discounts & Scholarships</div>
              <div className="ad-topbar-subtitle">Configure merit concessions, sports quotas & university staff allowances</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => setShowAddModal(true)} style={{ background: "#059669" }}>
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Create Concession Scheme
              </button>
            </div>
          </header>

          <main className="ad-content">
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Active Scholarship & Concession Schemes</h3>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">Scheme ID</th>
                      <th className="ad-th">Concession Title</th>
                      <th className="ad-th">Type</th>
                      <th className="ad-th">Benefit Value</th>
                      <th className="ad-th">Students Enrolled</th>
                      <th className="ad-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((d) => (
                      <tr key={d.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{d.id}</td>
                        <td className="ad-td"><strong>{d.name}</strong></td>
                        <td className="ad-td">{d.discountType}</td>
                        <td className="ad-td" style={{ fontWeight: 800, color: "#059669" }}>
                          {d.discountType === "Percentage" ? `${d.value}% Off` : `₹${d.value.toLocaleString()} Fixed`}
                        </td>
                        <td className="ad-td">{d.studentsApplied} Students</td>
                        <td className="ad-td"><span className="ad-badge ad-badge--green">● {d.status}</span></td>
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

      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Create Concession Scheme</h3>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Scheme Name</label>
                <input
                  type="text"
                  placeholder="e.g. Economically Weaker Section (EWS)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Value</label>
                  <input
                    type="number"
                    placeholder={discountType === "Percentage" ? "25" : "5000"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save Scheme
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

export default DiscountsScholarships;
