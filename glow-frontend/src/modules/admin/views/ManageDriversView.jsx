import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import AdminSidebar from "../layout/AdminSidebar";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const DRIVERS = [
  { id: "DRV-2024-001", name: "Mahesh Patel",   phone: "+91 98765 11111", route: "Route 2A", bus: "GJ05AB1234", status: "On Duty",  license: "GJ-23-0001", experience: "8 yrs", joined: "15 Jan 2018", trips: 1842, rating: 4.8 },
  { id: "DRV-2024-002", name: "Ramesh Shah",    phone: "+91 98765 22222", route: "Route 3B", bus: "GJ05CD5678", status: "On Duty",  license: "GJ-23-0002", experience: "6 yrs", joined: "20 Mar 2020", trips: 1340, rating: 4.5 },
  { id: "DRV-2024-003", name: "Suresh Joshi",   phone: "+91 98765 33333", route: "Route 1C", bus: "GJ05EF9012", status: "On Duty",  license: "GJ-23-0003", experience: "10 yrs",joined: "05 Jun 2016", trips: 2210, rating: 4.9 },
  { id: "DRV-2024-004", name: "Dinesh Trivedi", phone: "+91 98765 44444", route: "Route 4D", bus: "GJ05GH3456", status: "On Duty",  license: "GJ-23-0004", experience: "5 yrs", joined: "10 Aug 2021", trips: 980,  rating: 4.7 },
  { id: "DRV-2024-005", name: "Nilesh Vyas",    phone: "+91 98765 55555", route: "Unassigned", bus: "Unassigned", status: "On Leave", license: "GJ-23-0005", experience: "4 yrs", joined: "02 Feb 2022", trips: 720,  rating: 4.3 },
  { id: "DRV-2024-006", name: "Bhavesh Modi",   phone: "+91 98765 66666", route: "Unassigned", bus: "Unassigned", status: "Off Duty", license: "GJ-23-0006", experience: "3 yrs", joined: "18 Nov 2023", trips: 360,  rating: 4.6 },
];

const statusColor = { "On Duty": "green", "On Leave": "yellow", "Off Duty": "gray" };

const Modal = ({ driver, onClose }) => {
  const [form, setForm] = useState(driver || { id: "", name: "", phone: "", route: "", bus: "", license: "", experience: "", status: "Off Duty" });
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <h3 className="ad-modal-title">{driver ? "Edit Driver" : "Add New Driver"}</h3>
          <button className="ad-modal-close" onClick={onClose}><Icon d="M18 6 6 18M6 6l12 12" size={20} /></button>
        </div>
        <div className="ad-modal-body">
          {[
            { label: "Driver ID",     key: "id",         placeholder: "DRV-2024-XXX" },
            { label: "Full Name",     key: "name",       placeholder: "Driver full name" },
            { label: "Phone",         key: "phone",      placeholder: "+91 XXXXX XXXXX" },
            { label: "License No.",   key: "license",    placeholder: "GJ-XX-XXXX" },
            { label: "Experience",    key: "experience", placeholder: "e.g. 5 yrs" },
            { label: "Assigned Route",key: "route",      placeholder: "Route 2A" },
            { label: "Assigned Bus",  key: "bus",        placeholder: "Bus ID" },
          ].map(f => (
            <div key={f.key} className="ad-field-group">
              <label className="ad-field-label">{f.label}</label>
              <input className="ad-field-input" value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="ad-field-group">
            <label className="ad-field-label">Status</label>
            <select className="ad-field-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {["On Duty","Off Duty","On Leave"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="ad-btn-primary" onClick={onClose}>{driver ? "Save Changes" : "Add Driver"}</button>
        </div>
      </div>
    </div>
  );
};

const ManageDrivers = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState(null);
  const [filter, setFilter]           = useState("All");

  const adminName = currentAdmin?.name || "Dr. Arvind Patel";
  const adminRole = currentAdmin?.role || "Super Admin";
  const adminInitials = currentAdmin?.avatar ||
    adminName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AP";

  const filtered = DRIVERS.filter(d =>
    (filter === "All" || d.status === filter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
     d.route.toLowerCase().includes(search.toLowerCase()) ||
     d.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="drivers" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {modal && <Modal driver={modal === "add" ? null : modal} onClose={() => setModal(null)} />}

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Manage Drivers</div>
              <div className="ad-topbar-subtitle">Driver roster & duties</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input className="ad-search" placeholder="Search driver name, ID, route…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="ad-topbar-right">
              <div
                className="ad-topbar-profile"
                onClick={() => navigate("/admin/profile")}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                title={`${adminName} (${adminRole}) — Click to view Profile`}
              >
                <div className="ad-avatar">{adminInitials}</div>
                <div className="ad-avatar-info">
                  <span className="ad-avatar-name">{adminName}</span>
                  <span className="ad-avatar-role">{adminRole}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="ad-content">
            <div className="ad-page-header">
              <div className="ad-page-header-text">
                <h2 className="ad-page-title">Driver Roster & Profiles</h2>
                <p className="ad-page-sub">View license details, assign routes, and monitor duty status.</p>
              </div>
              <div className="ad-page-actions">
                <button className="ad-btn-primary" onClick={() => setModal("add")}>
                  <Icon d="M12 5v14M5 12h14" size={16} stroke="#fff" />Add New Driver
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="ad-stats">
              {[
                { label: "Total Drivers", value: DRIVERS.length,                                bg: "#eff6ff", color: "#3b82f6" },
                { label: "On Duty",       value: DRIVERS.filter(d=>d.status==="On Duty").length,  bg: "#f0fdf4", color: "#22c55e" },
                { label: "On Leave",      value: DRIVERS.filter(d=>d.status==="On Leave").length, bg: "#fefce8", color: "#ca8a04" },
                { label: "Off Duty",      value: DRIVERS.filter(d=>d.status==="Off Duty").length, bg: "#f4f6f9", color: "#7c8494" },
              ].map(s => (
                <div key={s.label} className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">{s.label}</p>
                    <p className="ad-stat-value">{s.value}</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: s.bg }}>
                    <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" size={24} stroke={s.color} />
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Driver Directory ({filtered.length})</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["All","On Duty","On Leave","Off Duty"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        border: `1px solid ${filter === f ? "#2563eb" : "#e2e8f0"}`,
                        background: filter === f ? "#2563eb" : "#fff",
                        color: filter === f ? "#fff" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table" aria-label="Drivers table">
                  <thead>
                    <tr>
                      <th className="ad-th">Driver</th>
                      <th className="ad-th">Driver ID</th>
                      <th className="ad-th">Phone</th>
                      <th className="ad-th">Assigned Route</th>
                      <th className="ad-th">Assigned Bus</th>
                      <th className="ad-th">Experience</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Rating</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => (
                      <tr key={d.id} className="ad-tr">
                        <td className="ad-td"><strong>{d.name}</strong></td>
                        <td className="ad-td">{d.id}</td>
                        <td className="ad-td">{d.phone}</td>
                        <td className="ad-td">{d.route}</td>
                        <td className="ad-td">{d.bus}</td>
                        <td className="ad-td">{d.experience}</td>
                        <td className="ad-td"><span className={`ad-badge ad-badge--${statusColor[d.status]}`}>● {d.status}</span></td>
                        <td className="ad-td" style={{ fontWeight: 700, color: "#eab308" }}>⭐ {d.rating}</td>
                        <td className="ad-td">
                          <button className="ad-action-btn" onClick={() => setModal(d)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Bus Development System.</span>
              <span>Showing {filtered.length} of {DRIVERS.length} drivers</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManageDrivers;