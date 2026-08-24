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

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ cursor: "pointer" }} aria-label={label}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
    <span style={{ display: "inline-block", width: 44, height: 24, borderRadius: 12, background: checked ? "#2563eb" : "#cbd5e1", position: "relative", transition: "background 0.2s" }}>
      <span style={{ position: "absolute", top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s" }} />
    </span>
  </label>
);

const SettingRow = ({ label, sub, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderBottom: "1px solid #f0f2f5", flexWrap: "wrap" }}>
    <div>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{sub}</p>}
    </div>
    {children}
  </div>
);

const SectionHead = ({ icon, label, iconBg, iconStroke }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <div style={{ width: 34, height: 34, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon d={icon} size={18} stroke={iconStroke} />
    </div>
    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{label}</h3>
  </div>
);

const AdminSettings = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useTransit();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    delayAlerts: true,
    maintenanceReminders: true,
    lowFuelAlerts: true,
    autoAssign: false,
    twoFA: true,
  });

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

  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaveMsg("✓ System settings saved and applied across all transit gateways!");
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="settings" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">System Settings & Configurations</div>
              <div className="ad-topbar-subtitle">System notifications, security policies and operational rules</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={handleSave}>
                Save Changes
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
            {saveMsg && (
              <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, fontWeight: 700 }}>
                {saveMsg}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
              {/* Notification Preferences */}
              <div className="ad-card">
                <SectionHead icon="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" label="Transit Notification Preferences" iconBg="#eff6ff" iconStroke="#2563eb" />
                <SettingRow label="Email Broadcasts" sub="Send trip reports and invoices to students and staff">
                  <Toggle checked={prefs.emailAlerts} onChange={() => toggle("emailAlerts")} label="Email Alerts" />
                </SettingRow>
                <SettingRow label="SMS Gateway Alerts" sub="Send urgent delay and emergency SMS">
                  <Toggle checked={prefs.smsAlerts} onChange={() => toggle("smsAlerts")} label="SMS Alerts" />
                </SettingRow>
                <SettingRow label="Real-time Delay Alerts" sub="Auto-dispatch notification when a bus is &gt;5 min delayed">
                  <Toggle checked={prefs.delayAlerts} onChange={() => toggle("delayAlerts")} label="Delay Alerts" />
                </SettingRow>
                <SettingRow label="Maintenance Expiry Reminders" sub="Alert transport team 14 days before fitness cert expiry">
                  <Toggle checked={prefs.maintenanceReminders} onChange={() => toggle("maintenanceReminders")} label="Maintenance Reminders" />
                </SettingRow>
              </div>

              {/* Security & Access */}
              <div className="ad-card">
                <SectionHead icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" label="Security & Access Policies" iconBg="#f0fdf4" iconStroke="#16a34a" />
                <SettingRow label="Two-Factor Authentication (2FA)" sub="Require OTP verification on Admin login">
                  <Toggle checked={prefs.twoFA} onChange={() => toggle("twoFA")} label="Two FA" />
                </SettingRow>
                <SettingRow label="Auto-assign Student Passes" sub="Automatically activate pass upon payment verification">
                  <Toggle checked={prefs.autoAssign} onChange={() => toggle("autoAssign")} label="Auto assign" />
                </SettingRow>
                <SettingRow label="Low Fuel / EV Battery Warnings" sub="Flag buses with &lt;30% energy in telemetry console">
                  <Toggle checked={prefs.lowFuelAlerts} onChange={() => toggle("lowFuelAlerts")} label="Low fuel" />
                </SettingRow>
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

export default AdminSettings;
