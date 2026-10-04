import { useState, useEffect } from "react";
import "./Notifications.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const INITIAL_NOTIFS = [
  {
    _id: "1",
    type: "service",
    message: "Your assigned bus BUS-104 is approaching Chhani Jakat Naka on Route R-04. Please be ready at Fatehgunj Stop.",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    type: "alerts",
    message: "Driver Mahesh Patel checked in for morning departure and vehicle pre-trip inspection passed 100%.",
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    _id: "3",
    type: "pass",
    message: "Your digital transport pass PASS-STU-2026-0125 for Semester VI is active and verified.",
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const Notifications = () => {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetch("/api/v1/student/me/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.notifications && data.notifications.length > 0) {
          setNotifs(data.notifications);
        }
      })
      .catch((err) => console.warn("Notifications REST fetch fallback active:", err));
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));

    fetch("/api/v1/student/me/notifications/read-all", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    }).catch((err) => console.warn("Read-all REST error:", err));
  };

  const deleteNotification = (id) => {
    setNotifs(notifs.filter((n) => (n._id || n.id) !== id));

    fetch(`/api/v1/student/me/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("glow_access_token") || ""}`,
      },
    }).catch((err) => console.warn("Delete notification REST error:", err));
  };

  const filteredNotifs = notifs.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return true;
  });

  return (
    <div className="student-view-wrap">
      <div className="nf-container">
        {/* TOP CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Alerts" },
              { id: "unread", label: `Unread (${unreadCount})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: `1.5px solid ${activeTab === t.id ? "#2563eb" : "#cbd5e1"}`,
                  background: activeTab === t.id ? "#2563eb" : "#fff",
                  color: activeTab === t.id ? "#fff" : "#475569",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 8, color: "#334155", fontSize: 13, fontWeight: 700, cursor: "pointer", minHeight: 44 }}
          >
            ✓ Mark All As Read
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              No notifications found.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n._id || n.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: n.read ? "#ffffff" : "#f0f7ff",
                  border: `1px solid ${n.read ? "#e2e8f0" : "#bfdbfe"}`,
                  borderRadius: 12,
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, background: "#2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, marginTop: 2 }}>
                    🔔
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{n.type?.toUpperCase() || "TRANSIT ALERT"}</h4>
                    <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.4 }}>{n.message}</p>
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 6, display: "inline-block" }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(n._id || n.id)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 6, fontSize: 16 }}
                  title="Delete notification"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default Notifications;
