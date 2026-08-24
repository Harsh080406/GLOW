import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../context/TransitContext";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ROUTES = [
  { id: "2a", name: "Route 2A", from: "Navrangpura", to: "University Campus", distance: "12.6 km", duration: "20 min", stops: 7, buses: 2, students: 142, status: "Active",   color: "#22c55e",
    stopList: ["Navrangpura","Helmet Circle","Science City Road","Commerce Six Road","Gujarat University","Law Garden","University Campus"] },
  { id: "3b", name: "Route 3B", from: "Memnagar",    to: "University Campus", distance: "10.2 km", duration: "18 min", stops: 6, buses: 1, students: 98,  status: "Delayed",  color: "#f59e0b",
    stopList: ["Memnagar","Naranpura","Paldi","Ambawadi","University Area","University Campus"] },
  { id: "1c", name: "Route 1C", from: "Satellite",   to: "University Campus", distance: "15.4 km", duration: "28 min", stops: 8, buses: 1, students: 120, status: "Active",   color: "#3b82f6",
    stopList: ["Satellite","Jodhpur","Judges Bunglow","Bodakdev","Thaltej","Sola","Chandkheda","University Campus"] },
  { id: "4d", name: "Route 4D", from: "Chandlodiya", to: "University Campus", distance: "8.8 km",  duration: "15 min", stops: 5, buses: 1, students: 75,  status: "Active",   color: "#8b5cf6",
    stopList: ["Chandlodiya","New Ranip","Sabarmati","Motera","University Campus"] },
  { id: "5e", name: "Route 5E", from: "Vastral",     to: "University Campus", distance: "18.2 km", duration: "35 min", stops: 9, buses: 0, students: 0,   status: "Inactive", color: "#7c8494",
    stopList: ["Vastral","Odhav","CTM","Bapunagar","Raipur","Kalupur","Shahibaug","Science City","University Campus"] },
];

const statusColor = { Active: "green", Delayed: "yellow", Inactive: "gray" };

const Modal = ({ route, onClose }) => {
  const [form, setForm] = useState(route || { name: "", from: "", to: "", distance: "", duration: "", status: "Active" });
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <h3 className="ad-modal-title">{route ? "Edit Route" : "Add New Route"}</h3>
          <button className="ad-modal-close" onClick={onClose}><Icon d="M18 6 6 18M6 6l12 12" size={20} /></button>
        </div>
        <div className="ad-modal-body">
          {[
            { label: "Route Name",   key: "name",     placeholder: "e.g. Route 5E" },
            { label: "From",         key: "from",     placeholder: "Starting point" },
            { label: "To",           key: "to",       placeholder: "End point" },
            { label: "Distance",     key: "distance", placeholder: "e.g. 12.6 km" },
            { label: "Duration",     key: "duration", placeholder: "e.g. 20 min" },
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
              {["Active","Inactive","Delayed"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="ad-btn-primary" onClick={onClose}>{route ? "Save Changes" : "Add Route"}</button>
        </div>
      </div>
    </div>
  );
};

const ManageRoutes = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0]);

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

  const filtered = ROUTES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.from.toLowerCase().includes(search.toLowerCase()) ||
    r.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="routes" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {modal && <Modal route={modal === "add" ? null : modal} onClose={() => setModal(null)} />}

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Manage Routes</div>
              <div className="ad-topbar-subtitle">Route networks & stop sequences</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input className="ad-search" placeholder="Search route name, stops…" value={search} onChange={e => setSearch(e.target.value)} />
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
                <h2 className="ad-page-title">University Transit Routes</h2>
                <p className="ad-page-sub">Configure route corridors, stops sequence, and student allocations.</p>
              </div>
              <div className="ad-page-actions">
                <button className="ad-btn-primary" onClick={() => setModal("add")}>
                  <Icon d="M12 5v14M5 12h14" size={16} stroke="#fff" />Add New Route
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="ad-stats">
              {[
                { label: "Total Routes",   value: ROUTES.length,                                bg: "#eff6ff", stroke: "#3b82f6" },
                { label: "Active Routes",  value: ROUTES.filter(r=>r.status==="Active").length,  bg: "#f0fdf4", stroke: "#22c55e" },
                { label: "Total Stops",    value: ROUTES.reduce((a,r)=>a+r.stops,0),             bg: "#f5f3ff", stroke: "#8b5cf6" },
                { label: "Total Riders",   value: ROUTES.reduce((a,r)=>a+r.students,0),          bg: "#fff7ed", stroke: "#ea580c" },
              ].map(s => (
                <div key={s.label} className="ad-stat-card">
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">{s.label}</p>
                    <p className="ad-stat-value">{s.value}</p>
                  </div>
                  <div className="ad-stat-icon" style={{ background: s.bg }}>
                    <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={24} stroke={s.stroke} />
                  </div>
                </div>
              ))}
            </div>

            {/* Main grid with Route List and Stop Sequencer */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {/* Route list */}
              <div className="ad-card">
                <h3 className="ad-card-title" style={{ marginBottom: 14 }}>Routes ({filtered.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoute(r)}
                      style={{
                        padding: "14px",
                        borderRadius: 10,
                        border: `1.5px solid ${selectedRoute?.id === r.id ? "#2563eb" : "#e2e8f0"}`,
                        background: selectedRoute?.id === r.id ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 14 }}>{r.name}</span>
                          <span className={`ad-badge ad-badge--${statusColor[r.status]}`}>● {r.status}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.from} → {r.to}</p>
                        <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{r.distance} · {r.duration} · {r.stops} Stops</p>
                      </div>
                      <button className="ad-action-btn" onClick={(e) => { e.stopPropagation(); setModal(r); }}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stop sequence */}
              <div className="ad-card">
                <div className="ad-card-header">
                  <h3 className="ad-card-title">{selectedRoute?.name} — Stop Timeline</h3>
                  <span className="ad-badge ad-badge--blue">{selectedRoute?.distance}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedRoute?.stopList.map((stop, idx) => (
                    <div key={stop} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: idx === 0 ? "#22c55e" : idx === selectedRoute.stopList.length - 1 ? "#ef4444" : "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{stop}</p>
                        <p style={{ fontSize: 11, color: "#64748b" }}>Stop #{idx + 1} · Standard Pickup point</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <footer className="ad-footer">
              <span>© 2026 GLOW Bus Development System.</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManageRoutes;
