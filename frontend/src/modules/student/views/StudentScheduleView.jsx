import { useState } from "react";
import "../../admin/layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentSchedule = () => {
  const [activeTab, setActiveTab] = useState("daily");

  const weeklySchedule = [
    { day: "Monday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Tuesday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Wednesday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Thursday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Friday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Saturday", morning: "07:45 AM → 08:15 AM", evening: "01:30 PM → 02:20 PM", bus: "BUS-104", status: "Half Day" },
    { day: "Sunday", morning: "--", evening: "--", bus: "--", status: "No Service (Holiday)" },
  ];

  const handleDownloadTimetablePdf = () => {
    const type = activeTab === "exam" ? "exam" : "regular";
    window.open(`/api/v1/student/me/schedule/pdf?type=${type}`, "_blank");
  };

  return (
    <div className="student-view-wrap">
      {/* HEADER WITH PDF DOWNLOAD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { id: "daily", label: "Today's Schedule" },
            { id: "weekly", label: "Weekly Schedule" },
            { id: "exam", label: "Special Exam Timings" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 24,
                border: `1.5px solid ${activeTab === t.id ? "#2563eb" : "#e2e8f0"}`,
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

        <button className="ad-btn-primary" onClick={handleDownloadTimetablePdf} style={{ minHeight: 44 }}>
          <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={15} stroke="#fff" />Download Timetable PDF
        </button>
      </div>

      {/* DAILY VIEW */}
      {activeTab === "daily" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <div className="ad-card" style={{ borderLeft: "4px solid #22c55e" }}>
            <div className="ad-card-header">
              <div>
                <span className="ad-badge ad-badge--green">Morning Pickup</span>
                <h3 className="ad-card-title" style={{ marginTop: 6 }}>Trip #1 · Chandkheda → Campus</h3>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>07:45 AM</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {[
                { time: "07:45 AM", stop: "Chandkheda Bus Stop", desc: "First Pickup (Your Stop)", isYours: true },
                { time: "07:50 AM", stop: "New Ranip Cross Roads", desc: "Stop 2" },
                { time: "07:55 AM", stop: "Sabarmati Bridge", desc: "Stop 3" },
                { time: "08:00 AM", stop: "Motera Stadium Circle", desc: "Stop 4" },
                { time: "08:15 AM", stop: "University Campus Bus Bay", desc: "Final Campus Drop" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: s.isYours ? "#eff6ff" : "#f8fafc", borderRadius: 8, border: s.isYours ? "1px solid #bfdbfe" : "none" }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: s.isYours ? 800 : 600, color: s.isYours ? "#1d4ed8" : "#1e293b" }}>{s.stop}</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{s.desc}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.isYours ? "#1d4ed8" : "#475569" }}>{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ad-card" style={{ borderLeft: "4px solid #3b82f6" }}>
            <div className="ad-card-header">
              <div>
                <span className="ad-badge ad-badge--blue">Evening Return</span>
                <h3 className="ad-card-title" style={{ marginTop: 6 }}>Trip #2 · Campus → Chandkheda</h3>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2563eb" }}>05:00 PM</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {[
                { time: "05:00 PM", stop: "University Campus Bus Bay", desc: "Campus Boarding" },
                { time: "05:35 PM", stop: "Chandkheda Bus Stop", desc: "Your Drop Off", isYours: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: s.isYours ? "#eff6ff" : "#f8fafc", borderRadius: 8 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: s.isYours ? 800 : 600, color: s.isYours ? "#1d4ed8" : "#1e293b" }}>{s.stop}</p>
                    <p style={{ fontSize: 11, color: "#64748b" }}>{s.desc}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {activeTab === "weekly" && (
        <div className="ad-card">
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Day</th>
                  <th className="ad-th">Morning Departure</th>
                  <th className="ad-th">Evening Departure</th>
                  <th className="ad-th">Assigned Bus</th>
                  <th className="ad-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((w, i) => (
                  <tr key={i} className="ad-tr">
                    <td className="ad-td" style={{ fontWeight: 700 }}>{w.day}</td>
                    <td className="ad-td">{w.morning}</td>
                    <td className="ad-td">{w.evening}</td>
                    <td className="ad-td" style={{ fontWeight: 700, color: "#2563eb" }}>{w.bus}</td>
                    <td className="ad-td">
                      <span className={`ad-badge ${w.status === "Regular" ? "ad-badge--green" : w.status === "Half Day" ? "ad-badge--yellow" : "ad-badge--red"}`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXAM TIMINGS */}
      {activeTab === "exam" && (
        <div className="ad-card" style={{ background: "#fffbf0", border: "1px solid #fef3c7" }}>
          <h3 className="ad-card-title" style={{ color: "#92400e", marginBottom: 8 }}>Mid-Sem & End-Sem Exam Transit Timings</h3>
          <p style={{ fontSize: 13, color: "#b45309", marginBottom: 16 }}>Special examination shuttles operate at 08:00 AM for 09:00 AM exam shifts and return at 01:30 PM.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <span className="ad-badge ad-badge--yellow">Exam Special Shuttle Active</span>
          </div>
        </div>
      )}

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </div>
  );
};

export default StudentSchedule;
