import { useState } from "react";
import StudentLayout from "../components/StudentLayout";
import "./Notifications.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const INITIAL_NOTIFS = [
  {
    id: 1,
    title: "Bus On The Way • 7 min ETA",
    tag: "Live Transit",
    category: "service",
    desc: "Your assigned bus BUS-104 is approaching Motera Crossroads on Route R-04. Please be ready at Chandkheda Stop.",
    time: "2 min ago",
    unread: true,
    icon: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2",
  },
  {
    id: 2,
    title: "Driver Checked In",
    tag: "Crew Update",
    category: "service",
    desc: "Driver Mahesh Patel checked in for morning departure and vehicle pre-trip inspection passed 100%.",
    time: "15 min ago",
    unread: true,
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    id: 3,
    title: "Traffic Alert • SG Highway",
    tag: "Route Alert",
    category: "alerts",
    desc: "Moderate congestion near Koba Circle due to road resurfacing. Estimated +3 min transit variance.",
    time: "45 min ago",
    unread: true,
    icon: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  },
  {
    id: 4,
    title: "Transport Pass Validated",
    tag: "Pass Status",
    category: "pass",
    desc: "Your digital transport pass PASS-STU-2026-0125 for Semester VI is active and paid for 2025-2026.",
    time: "Yesterday",
    unread: false,
    icon: "M20 12V22H4V12M22 7H2v5h20V7zM12 22V7",
  },
  {
    id: 5,
    title: "Timetable Schedule Released",
    tag: "Timetable",
    category: "service",
    desc: "Updated monsoon return timings: Evening departure from University bus bay shifted to 05:00 PM.",
    time: "2 days ago",
    unread: false,
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  },
  {
    id: 6,
    title: "Fee Receipt Generated",
    tag: "Finance",
    category: "pass",
    desc: "Receipt #RCPT-2026-089 for ₹18,000 transport fee has been issued and emailed to your registered address.",
    time: "3 days ago",
    unread: false,
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const Notifications = () => {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const filteredNotifs = notifs.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return n.unread;
    if (activeTab === "service") return n.category === "service";
    if (activeTab === "alerts") return n.category === "alerts";
    if (activeTab === "pass") return n.category === "pass";
    return true;
  });

  return (
    <StudentLayout
      title="Notifications & Alerts"
      subtitle="Important transportation updates, schedule adjustments & pass alerts"
    >
      <div className="nf-container">
        {/* ── TOP CONTROLS & TABS ───────────────────────────────── */}
        <div className="nf-header-card">
          <div className="nf-tabs">
            {[
              { id: "all", label: "All Alerts", count: notifs.length },
              { id: "unread", label: "Unread", count: unreadCount },
              { id: "service", label: "Live Transit", count: notifs.filter(n => n.category === "service").length },
              { id: "alerts", label: "Route Alerts", count: notifs.filter(n => n.category === "alerts").length },
              { id: "pass", label: "Pass & Fees", count: notifs.filter(n => n.category === "pass").length },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`nf-tab-btn ${activeTab === tab.id ? "nf-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className={`nf-tab-pill ${activeTab === tab.id ? "nf-tab-pill--active" : ""}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button className="nf-mark-read-btn" onClick={markAllRead}>
              <Icon d="M5 13l4 4L19 7" size={15} stroke="#0066ff" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* ── NOTIFICATIONS LIST ────────────────────────────────── */}
        <div className="nf-list-wrap">
          {filteredNotifs.length === 0 ? (
            <div className="nf-empty-card">
              <div className="nf-empty-icon">🔔</div>
              <h3 className="nf-empty-title">No notifications found</h3>
              <p className="nf-empty-sub">You are all caught up with your transit updates.</p>
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                className={`nf-card-item ${item.unread ? "nf-card-item--unread" : ""}`}
                onClick={() => toggleRead(item.id)}
              >
                <div className="nf-icon-box">
                  <Icon d={item.icon} size={20} stroke="#0066ff" />
                </div>

                <div className="nf-body">
                  <div className="nf-title-row">
                    <div className="nf-title-group">
                      <h4 className="nf-title">{item.title}</h4>
                      <span className="nf-tag">{item.tag}</span>
                    </div>
                    <div className="nf-meta-group">
                      <span className="nf-time">{item.time}</span>
                      {item.unread && <span className="nf-unread-dot" title="Unread" />}
                    </div>
                  </div>
                  <p className="nf-desc">{item.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Notifications;
