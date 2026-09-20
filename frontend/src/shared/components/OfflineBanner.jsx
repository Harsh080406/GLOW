import React from "react";
import "./OfflineBanner.css";

export default function OfflineBanner({ isWsConnected, onReconnect }) {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (isWsConnected && isOnline) {
    return null;
  }

  return (
    <div className="glow-offline-banner" role="alert" aria-live="assertive">
      <div className="glow-offline-content">
        <span className="glow-offline-pulse"></span>
        <span className="glow-offline-text">
          {!isOnline
            ? "⚠️ Internet disconnected. Transit map & live telemetry are currently paused."
            : "⚠️ Real-time transit telemetry connection lost. Reconnecting to GLOW server..."}
        </span>
      </div>
      <button className="glow-offline-retry-btn" onClick={onReconnect}>
        Reconnect Now
      </button>
    </div>
  );
}
