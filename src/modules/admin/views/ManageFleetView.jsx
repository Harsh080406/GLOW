import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const BusIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1" fill={color} stroke="none" />
    <circle cx="17" cy="19" r="1" fill={color} stroke="none" />
    <path d="M6 5V3M18 5V3" />
  </svg>
);

const BUSES = [
  { id: "GJ05AB1234", type: "Volvo AC",    capacity: 52, route: "Route 2A", driver: "Mahesh Patel",   status: "On Route",     fuel: 72, lastService: "01 Aug 2026", year: 2021 },
  { id: "GJ05CD5678", type: "Tata LP 912", capacity: 44, route: "Route 3B", driver: "Ramesh Shah",    status: "Delayed",      fuel: 45, lastService: "15 Jul 2026", year: 2019 },
  { id: "GJ05EF9012", type: "Ashok Leyland",capacity:48, route: "Route 1C", driver: "Suresh Joshi",   status: "On Route",     fuel: 88, lastService: "10 Aug 2026", year: 2022 },
  { id: "GJ05GH3456", type: "Volvo AC",    capacity: 52, route: "Route 4D", driver: "Dinesh Trivedi", status: "On Route",     fuel: 61, lastService: "05 Aug 2026", year: 2021 },
  { id: "GJ05IJ7890", type: "Tata LP 912", capacity: 44, route: "Unassigned", driver: "Unassigned",   status: "Maintenance",  fuel: 30, lastService: "20 Jul 2026", year: 2018 },
  { id: "GJ05KL2345", type: "Ashok Leyland",capacity:48, route: "Unassigned", driver: "Unassigned",   status: "Idle",         fuel: 95, lastService: "12 Aug 2026", year: 2023 },
];

const statusColor = { "On Route": "green", "Delayed": "yellow", "Maintenance": "red", "Idle": "gray" };

const Modal = ({ bus, onClose }) => {
  const [form, setForm] = useState(bus || { id: "", type: "Volvo AC", capacity: 52, route: "", driver: "", status: "Idle", fuel: 100, year: 2024 });
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ad-modal-header">
          <h3 className="ad-modal-title">{bus ? "Edit Bus" : "Add New Bus"}</h3>
          <button className="ad-modal-close" onClick={onClose} aria-label="Close">
            <Icon d="M18 6 6 18M6 6l12 12" size={20} />
          </button>
        </div>
        <div className="ad-modal-body">
          {[
            { label: "Bus ID",       key: "id",       type: "text",   placeholder: "e.g. GJ05XX0000" },
            { label: "Bus Type",     key: "type",     type: "text",   placeholder: "e.g. Volvo AC" },
            { label: "Capacity",     key: "capacity", type: "number", placeholder: "52" },
            { label: "Year",         key: "year",     type: "number", placeholder: "2024" },
            { label: "Assigned Route",  key: "route",  type: "text", placeholder: "Route 2A" },
            { label: "Assigned Driver", key: "driver", type: "text", placeholder: "Driver name" },
          ].map(f => (
            <div key={f.key} className="ad-field-group">
              <label className="ad-field-label">{f.label}</label>
              <input className="ad-field-input" type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="ad-field-group">
            <label className="ad-field-label">Status</label>
            <select className="ad-field-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {["On Route","Delayed","Maintenance","Idle"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="ad-btn-primary" onClick={onClose}>
            <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" size={15} stroke="#fff" />
            {bus ? "Save Changes" : "Add Bus"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageFleet = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = BUSES.filter(b =>
    (filter === "All" || b.status === filter) &&
    (b.id.toLowerCase().includes(search.toLowerCase()) ||
     b.route.toLowerCase().includes(search.toLowerCase()) ||
     b.driver.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="view-container">
      {modal && <Modal bus={modal === "add" ? null : modal} onClose={() => setModal(null)} />}
      <div className="ad-page-header">
              <div className="ad-page-header-text">
                <h2 className="ad-page-title">University Bus Fleet</h2>
                <p className="ad-page-sub">View, add, edit and track all buses in the campus fleet network.</p>
              </div>
              <div className="ad-page-actions">
                <button className="ad-btn-primary" onClick={() => setModal("add")}>
                  <Icon d="M12 5v14M5 12h14" size={16} stroke="#fff" />Add New Bus
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="ad-stats">
              {[
                { label: "Total Buses",      value: BUSES.length,                                  bg: "#eff6ff", stroke: "#3b82f6" },
                { label: "Active (On Route)",value: BUSES.filter(b=>b.status==="On Route").length,  bg: "#f0fdf4", stroke: "#22c55e" },
                { label: "Under Maintenance",value: BUSES.filter(b=>b.status==="Maintenance").length,bg:"#fef2f2", stroke: "#ef4444" },
                { label: "Idle / Standby",   value: BUSES.filter(b=>b.status==="Idle").length,      bg: "#f4f6f9", stroke: "#7c8494" },
              ].map(s => (
                <div key={s.label} className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">{s.label}</p>
                    <p className="ad-stat-value">{s.value}</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: s.bg }}>
                    <BusIcon size={24} color={s.stroke} />
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">Fleet Directory ({filtered.length})</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["All","On Route","Delayed","Maintenance","Idle"].map(f => (
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
                <table className="ad-table" aria-label="Fleet table">
                  <thead>
                    <tr>
                      <th className="ad-th">Bus ID</th>
                      <th className="ad-th">Type</th>
                      <th className="ad-th">Capacity</th>
                      <th className="ad-th">Year</th>
                      <th className="ad-th">Route</th>
                      <th className="ad-th">Driver</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Fuel / Bat %</th>
                      <th className="ad-th">Last Service</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id} className="ad-tr">
                        <td className="ad-td"><span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><BusIcon size={16} color="#3b82f6" />{b.id}</span></td>
                        <td className="ad-td">{b.type}</td>
                        <td className="ad-td">{b.capacity} seats</td>
                        <td className="ad-td">{b.year}</td>
                        <td className="ad-td">{b.route}</td>
                        <td className="ad-td"><strong>{b.driver}</strong></td>
                        <td className="ad-td"><span className={`ad-badge ad-badge--${statusColor[b.status]}`}>● {b.status}</span></td>
                        <td className="ad-td" style={{ fontWeight: 700, color: b.fuel < 40 ? "#dc2626" : "#16a34a" }}>
                          {b.fuel}%
                        </td>
                        <td className="ad-td">{b.lastService}</td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="ad-action-btn" onClick={() => setModal(b)}>
                              Edit
                            </button>
                            <button className="ad-action-btn" onClick={() => navigate("/admin/tracking")}>
                              Track
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Bus Development System.</span>
              <span>Showing {filtered.length} of {BUSES.length} buses</span>
            </footer>
    </div>
  );
};

export default ManageFleet;
