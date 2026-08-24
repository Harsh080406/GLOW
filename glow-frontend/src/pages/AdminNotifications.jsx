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

const NOTIFS = [
  { id: 1, group: "Today",        title: "Route 3B Delay Alert",       tag: "Alert",    tagType: "alert",   icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", iconBg: "#fff7ed", iconColor: "#f97316", desc: "Route 3B is delayed by ~18 minutes due to heavy traffic on SG Road near Memnagar.", time: "08:30 AM", unread: true,  audience: "All" },
  { id: 2, group: "Today",        title: "System Maintenance Tonight",  tag: "System",   tagType: "system",  icon: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01",                        iconBg: "#eff6ff", iconColor: "#3b82f6", desc: "Scheduled maintenance from 01:00 AM to 04:00 AM. App services may be interrupted.",   time: "07:00 AM", unread: true,  audience: "Students" },
  { id: 3, group: "Yesterday",    title: "New Driver Onboarded",        tag: "Update",   tagType: "update",  icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",                               iconBg: "#f0fdf4", iconColor: "#22c55e", desc: "Driver Bhavesh Modi (DRV-2024-006) has been onboarded and assigned to Route 5E.",    time: "04:00 PM", unread: false, audience: "Admin" },
  { id: 4, group: "Yesterday",    title: "Route 2A Schedule Updated",   tag: "Update",   tagType: "update",  icon: "M3 12h18M3 6h18M3 18h18",                                                                                        iconBg: "#f0fdf4", iconColor: "#22c55e", desc: "Route 2A departure timings updated effective 01 Aug 2026. Students have been notified.", time: "10:15 AM", unread: false, audience: "All" },
  { id: 5, group: "21 Aug 2026",  title: "Low Fuel Alert — GJ05CD5678",  tag: "Alert",   tagType: "alert",   icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", iconBg: "#fff7ed", iconColor: "#f97316", desc: "Bus GJ05CD5678 fuel level is at 18%. Immediate refuelling required before next trip.", time: "06:45 PM", unread: false, audience: "Admin" },
  { id: 6, group: "21 Aug 2026",  title: "48 New Student Registrations",tag: "Info",     tagType: "info",    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",                                  iconBg: "#f5f3ff", iconColor: "#8b5cf6", desc: "48 new students registered for the bus facility this week. Passes pending approval.", time: "12:00 PM", unread: false, audience: "Admin" },
];

const TABS = [
  { id: "all",     label: "All",     count: 6 },
  { id: "alerts",  label: "Alerts",  count: 2 },
  { id: "updates", label: "Updates", count: 2 },
  { id: "info",    label: "Info",    count: 1 },
  { id: "system",  label: "System",  count: 1 },
];

const tagColors = {
  alert:  { bg: "#fff7ed", color: "#d97706" },
  update: { bg: "#f0fdf4", color: "#16a34a" },
  info:   { bg: "#f5f3ff", color: "#7c3aed" },
  system: { bg: "#eff6ff", color: "#2563eb" },
};

const AdminNotifications = () => {
  const navigate    = useNavigate();
  const { currentAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState("all");
  const [notifs,      setNotifs]      = useState(NOTIFS);
  const [compose,     setCompose]     = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "All" });

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

  const markRead    = id  => setNotifs(p => p.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = ()  => setNotifs(p => p.map(n => ({ ...n, unread: false })));
  const unreadCount = notifs.filter(n => n.unread).length;

  const filtered = activeTab === "all"
    ? notifs
    : notifs.filter(n => n.tagType === activeTab);

  const groups = filtered.reduce((acc, n) => {
    if (!acc[n.group]) acc[n.group] = [];
    acc[n.group].push(n);
    return acc;
  }, {});

  return (
    <div className="ad-root">
      <AdminSidebar activeId="notifications" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Compose modal */}
      {compose && (
        <div className="ad-modal-overlay" onClick={() => setCompose(false)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title">Send Notification</h3>
              <button className="ad-modal-close" onClick={() => setCompose(false)}><Icon d="M18 6 6 18M6 6l12 12" size={20} /></button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-field-group">
                <label className="ad-field-label">Title</label>
                <input className="ad-field-input" placeholder="Notification title" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="ad-field-group">
                <label className="ad-field-label">Message</label>
                <textarea className="ad-field-input" rows={4} placeholder="Write your message here…" value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div className="ad-field-group">
                <label className="ad-field-label">Audience</label>
                <select className="ad-field-input" value={form.audience}
                  onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}>
                  <option>All</option>
                  <option>Students</option>
                  <option>Drivers</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
              <button className="ad-btn-primary" onClick={() => setCompose(false)}>
                <Icon d="M22 2 11 13M22 2 15 22l-4-9-9-4 19-7z" size={14} stroke="#fff" />Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ad-main">
        <header className="ad-topbar">
          <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
          </button>
          <div>
            <div className="ad-topbar-title">Notifications</div>
            <div className="ad-topbar-subtitle">System alerts & broadcasts</div>
          </div>
          <div className="ad-topbar-right" style={{ marginLeft: "auto" }}>
            {unreadCount > 0 && (
              <button className="ad-btn-secondary" onClick={markAllRead} style={{ fontSize: 12, padding: "7px 14px" }}>
                <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" size={14} />Mark all read
              </button>
            )}
            <button className="ad-btn-primary" onClick={() => setCompose(true)}>
              <Icon d="M12 5v14M5 12h14" size={15} stroke="#fff" />New Notification
            </button>
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
          <nav className="ad-breadcrumb">
            <button className="ad-bc-link" onClick={() => navigate("/admin/dashboard")}>
              <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={13} />Dashboard
            </button>
            <span className="ad-bc-sep">›</span>
            <span className="ad-bc-current">Notifications</span>
          </nav>

          <div className="ad-page-header">
            <div>
              <h2 className="ad-page-title">Notifications</h2>
              <p className="ad-page-sub">Manage and broadcast system notifications to students and drivers.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="ad-stats">
            {[
              { label: "Total Sent",   value: "248",        bg: "#eff6ff", c: "#3b82f6", icon: "M22 2 11 13M22 2 15 22l-4-9-9-4 19-7z" },
              { label: "Unread",       value: unreadCount,  bg: "#fef2f2", c: "#ef4444", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
              { label: "This Week",    value: "12",          bg: "#f0fdf4", c: "#22c55e", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
              { label: "Reach (Avg)", value: "8,024",        bg: "#f5f3ff", c: "#8b5cf6", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
            ].map(s => (
              <div key={s.label} className="ad-stat-card">
                <div className="ad-stat-body">
                  <p className="ad-stat-label">{s.label}</p>
                  <p className="ad-stat-value">{s.value}</p>
                </div>
                <div className="ad-stat-icon" style={{ background: s.bg }}>
                  <Icon d={s.icon} size={26} stroke={s.c} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="ad-filter-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`ad-filter-tab ${activeTab===t.id?"ad-filter-tab--active":""}`} onClick={() => setActiveTab(t.id)}>
                {t.label} <span style={{ marginLeft: 5, background: activeTab===t.id?"#3b82f6":"#e8eaf0", color: activeTab===t.id?"#fff":"#7c8494", borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="ad-card" style={{ padding: 0 }}>
            {Object.keys(groups).length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "#7c8494" }}>
                <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={40} stroke="#d1d5db" />
                <p style={{ marginTop: 12, fontWeight: 600 }}>No notifications</p>
              </div>
            ) : (
              Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#7c8494", textTransform: "uppercase", letterSpacing: "0.6px", padding: "14px 22px 8px", borderBottom: "1px solid #f0f2f5" }}>{group}</p>
                  {items.map(n => (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 22px", borderBottom: "1px solid #f8fafc", cursor: "pointer", background: n.unread ? "#fafeff" : "#fff", transition: "background 0.15s" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: n.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={n.icon} size={20} stroke={n.iconColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1a1d23" }}>{n.title}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 20, padding: "2px 9px", background: tagColors[n.tagType]?.bg, color: tagColors[n.tagType]?.color }}>{n.tag}</span>
                          <span style={{ fontSize: 10.5, color: "#7c8494", background: "#f4f6f9", borderRadius: 20, padding: "2px 9px" }}>→ {n.audience}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#5a6070", lineHeight: 1.5 }}>{n.desc}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11.5, color: "#7c8494" }}>{n.time}</span>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: n.unread ? "#3b82f6" : "transparent", border: n.unread ? "none" : "1.5px solid #d1d5db" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <footer className="ad-footer">
            <span>© 2026 GLOW Bus Development System.</span>
            <span>{notifs.length} total notifications</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;
