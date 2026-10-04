import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ cursor: "pointer", display: "inline-block" }} aria-label={label}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
    />
    <span style={{
      display: "inline-block", width: 44, height: 24, borderRadius: 12,
      background: checked ? "#2563eb" : "#cbd5e1", position: "relative", transition: "background 0.2s"
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 23 : 3, width: 18, height: 18,
        borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s"
      }} />
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
  const { authFetch } = useTransit();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [config, setConfig] = useState({
    gpsPollingFrequencySeconds: 3,
    sosAutoDispatch: true,
    paymentGracePeriodDays: 15,
    maxOccupancyAlertThreshold: 90,
    geofenceRadiusMeters: 500,
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch("/admin/settings");
      if (res && res.config) {
        setConfig(res.config);
      }
    } catch (err) {
      console.warn("Failed to load settings:", err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(config),
      });
      setSaveMsg("✓ System configuration saved to SystemConfig singleton! Runtime simulator & payment logic updated.");
      setTimeout(() => setSaveMsg(null), 4000);
    } catch (err) {
      alert("Error saving system settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view-container">
      {saveMsg && (
        <div style={{
          background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
          borderRadius: 8, padding: "12px 18px", marginBottom: 20, fontWeight: 700, fontSize: 13,
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)"
        }}>
          {saveMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="ad-page-header" style={{ marginBottom: 20 }}>
        <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>System Configuration & Runtime Settings</h2>
        <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
          Manage GPS polling cadence, SOS emergency auto-dispatch & financial grace period in `SystemConfig`
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "#64748b" }}>Loading system configuration singleton...</p>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* GPS & Telematics Section */}
            <div className="ad-card" style={{ padding: "20px 24px" }}>
              <SectionHead
                icon="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                label="GPS Simulator & Telemetry Runtime"
                iconBg="#eff6ff"
                iconStroke="#2563eb"
              />

              <SettingRow
                label="GPS Telemetry Broadcast Cadence"
                sub="Interval in seconds for vehicle coordinate streaming (restarts simulator loop at runtime)"
              >
                <select
                  value={config.gpsPollingFrequencySeconds}
                  onChange={(e) => setConfig({ ...config, gpsPollingFrequencySeconds: Number(e.target.value) })}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", fontWeight: 700 }}
                >
                  <option value={1}>1 second (High Precision)</option>
                  <option value={3}>3 seconds (Standard Fleet Default)</option>
                  <option value={5}>5 seconds (Battery / Bandwidth Saver)</option>
                  <option value={10}>10 seconds (Low Frequency)</option>
                </select>
              </SettingRow>

              <SettingRow
                label="Campus Geofence Radius"
                sub="Trigger perimeter arrival notifications when bus is within this distance (meters)"
              >
                <input
                  type="number"
                  value={config.geofenceRadiusMeters}
                  onChange={(e) => setConfig({ ...config, geofenceRadiusMeters: Number(e.target.value) })}
                  style={{ width: 100, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontWeight: 700 }}
                />
              </SettingRow>
            </div>

            {/* Emergency & Automation Section */}
            <div className="ad-card" style={{ padding: "20px 24px" }}>
              <SectionHead
                icon="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
                label="Safety & SOS Auto-Dispatch"
                iconBg="#fef2f2"
                iconStroke="#dc2626"
              />

              <SettingRow
                label="Automated Security Team Dispatch"
                sub="Immediately dispatch nearest campus security unit upon receiving verified SOS beacon"
              >
                <Toggle
                  checked={config.sosAutoDispatch}
                  onChange={() => setConfig({ ...config, sosAutoDispatch: !config.sosAutoDispatch })}
                  label="Auto SOS Dispatch"
                />
              </SettingRow>

              <SettingRow
                label="Overcapacity Alert Trigger (%)"
                sub="Flag warning when passenger occupancy exceeds threshold"
              >
                <input
                  type="number"
                  min="50"
                  max="120"
                  value={config.maxOccupancyAlertThreshold}
                  onChange={(e) => setConfig({ ...config, maxOccupancyAlertThreshold: Number(e.target.value) })}
                  style={{ width: 80, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontWeight: 700 }}
                />
              </SettingRow>
            </div>
          </div>

          {/* Financial & Fee Rules Section */}
          <div className="ad-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
            <SectionHead
              icon="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2"
              label="Financial Policies & Bus Pass Grace Period"
              iconBg="#f0fdf4"
              iconStroke="#16a34a"
            />

            <SettingRow
              label="Bus Pass Fee Payment Grace Period"
              sub="Days allowed after term fee due date before student transport pass automatically suspends"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={config.paymentGracePeriodDays}
                  onChange={(e) => setConfig({ ...config, paymentGracePeriodDays: Number(e.target.value) })}
                  style={{ width: 80, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontWeight: 700 }}
                />
                <span style={{ fontSize: 13, color: "#64748b" }}>Days</span>
              </div>
            </SettingRow>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={saving}
              className="ad-btn-primary"
              style={{ padding: "12px 28px", fontSize: 14 }}
            >
              {saving ? "Saving to SystemConfig..." : "Save System Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
