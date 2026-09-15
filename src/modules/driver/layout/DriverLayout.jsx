import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import "../../admin/layout/AdminLayout.css";
import "../views/DriverDashboard.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const DriverLayout = ({ children, title = "Driver Mobile Cockpit", subtitle = "Route R-04 · Live GPS Telematics, Boarding Scanner & Shift Controls" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentDriver, activeTrip, triggerEmergency } = useTransit();

  const driverName = currentDriver?.name || "Mahesh Patel";
  const driverInitials = currentDriver?.avatar ||
    driverName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MP";

  const busId = currentDriver?.busId || "BUS-104";

  return (
    <div className="dd-layout-root">
      {/* ── PERSISTENT COCKPIT TOPBAR ──────────────────────── */}
      <header className="dd-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "12px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #0066ff, #0052cc)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>
              🚌
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", margin: 0 }}>GLOW Driver Cockpit</h1>
                <span style={{ fontSize: 11, fontWeight: 800, background: activeTrip?.status === "IN_PROGRESS" ? "#dcfce7" : "#f1f5f9", color: activeTrip?.status === "IN_PROGRESS" ? "#15803d" : "#475569", padding: "2px 8px", borderRadius: 12 }}>
                  {activeTrip?.status === "IN_PROGRESS" ? "● ON TRIP" : "○ STANDBY"}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                Vehicle: <strong>{busId}</strong> · Driver: <strong>{driverName}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("🚨 TRIGGER EMERGENCY SOS?\n\nThis will instantly alert University Campus Dispatch & Emergency Response with your live GPS location.")) {
                  triggerEmergency && triggerEmergency({
                    type: "DRIVER_COCKPIT_SOS",
                    busId: busId,
                    driver: driverName,
                    location: "Live Route R-04 (Auto-GPS Broadcast)",
                    notes: "High priority SOS triggered from Driver Mobile Cockpit.",
                    severity: "High / SOS",
                  });
                }
              }}
              style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              🚨 EMERGENCY SOS
            </button>

            <div
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              title={`${driverName} (Bus Pilot)`}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                {driverInitials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── DYNAMIC VIEW OUTLET ─────────────────────────────── */}
      <main className="dd-main-container" style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "20px 24px" }}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DriverLayout;
