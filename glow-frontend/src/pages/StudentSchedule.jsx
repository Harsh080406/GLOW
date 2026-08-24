import { useState } from "react";
import StudentLayout from "../components/StudentLayout";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const StudentSchedule = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDay, setSelectedDay] = useState("Today (Saturday)");

  const weeklySchedule = [
    { day: "Monday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Tuesday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Wednesday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Thursday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Friday", morning: "07:45 AM → 08:15 AM", evening: "05:00 PM → 05:50 PM", bus: "BUS-104", status: "Regular" },
    { day: "Saturday", morning: "07:45 AM → 08:15 AM", evening: "01:30 PM → 02:20 PM", bus: "BUS-104", status: "Half Day" },
    { day: "Sunday", morning: "--", evening: "--", bus: "--", status: "No Service (Holiday)" },
  ];

  const holidays = [
    { date: "15 Aug 2026", name: "Independence Day", type: "National Holiday", busService: "Suspended" },
    { date: "27 Aug 2026", name: "Janmashtami", type: "Public Holiday", busService: "Suspended" },
    { date: "02 Oct 2026", name: "Mahatma Gandhi Jayanti", type: "National Holiday", busService: "Suspended" },
    { date: "20 Oct - 26 Oct 2026", name: "Diwali Vacation", type: "Academic Break", busService: "Special Exam / Skeleton Fleet" },
  ];

  return (
    <StudentLayout title="Transport Schedule" subtitle="Route R-04 daily timetables, weekly rotations, and holiday transit calendar">
      {/* ── TABS ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { id: "daily", label: "Today's Schedule" },
          { id: "weekly", label: "Weekly Schedule" },
          { id: "exam", label: "Special Exam Timings" },
          { id: "holidays", label: "Holiday Transit Calendar" },
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
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DAILY VIEW ─────────────────────────────────────────── */}
      {activeTab === "daily" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Morning Trip */}
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
                { time: "08:05 AM", stop: "Chandlodiya Junction", desc: "Stop 5" },
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

          {/* Evening Trip */}
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
                { time: "05:00 PM", stop: "University Campus Bus Bay", desc: "Boarding at Campus Bay 3" },
                { time: "05:18 PM", stop: "Chandlodiya Junction", desc: "Drop Stop 1" },
                { time: "05:25 PM", stop: "Motera Stadium Circle", desc: "Drop Stop 2" },
                { time: "05:32 PM", stop: "Sabarmati Bridge", desc: "Drop Stop 3" },
                { time: "05:40 PM", stop: "New Ranip Cross Roads", desc: "Drop Stop 4" },
                { time: "05:50 PM", stop: "Chandkheda Bus Stop", desc: "Final Drop (Your Stop)", isYours: true },
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
        </div>
      )}

      {/* ── WEEKLY ROTATION ────────────────────────────────────── */}
      {activeTab === "weekly" && (
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Weekly Schedule Overview</h3>
            <span className="ad-badge ad-badge--green">Route R-04 · Bus BUS-104</span>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Day</th>
                  <th className="ad-th">Morning Departure</th>
                  <th className="ad-th">Evening Departure</th>
                  <th className="ad-th">Assigned Bus</th>
                  <th className="ad-th">Service Type</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((w) => (
                  <tr key={w.day} className="ad-tr" style={{ background: w.day === "Saturday" ? "#fffbeb" : "transparent" }}>
                    <td className="ad-td" style={{ fontWeight: 700 }}>{w.day}</td>
                    <td className="ad-td">{w.morning}</td>
                    <td className="ad-td">{w.evening}</td>
                    <td className="ad-td" style={{ fontWeight: 600 }}>{w.bus}</td>
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

      {/* ── EXAM SPECIAL ───────────────────────────────────────── */}
      {activeTab === "exam" && (
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Mid-Semester & Final Examination Special Shuttles</h3>
            <span className="ad-badge ad-badge--yellow">Special Timings</span>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>During examination weeks, buses operate on high-frequency staggered shifts to accommodate shift 1 (09:00 AM) and shift 2 (02:00 PM) examinations.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Morning Exam Slot (09:00 AM - 12:00 PM)</h4>
              <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>• Pickup starts at 07:30 AM (15 min earlier)</p>
              <p style={{ fontSize: 13, color: "#475569" }}>• Campus arrival by 08:15 AM</p>
              <p style={{ fontSize: 13, color: "#475569" }}>• Return shuttle departs at 12:45 PM</p>
            </div>
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Afternoon Exam Slot (02:00 PM - 05:00 PM)</h4>
              <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>• Afternoon pickup starts at 12:30 PM</p>
              <p style={{ fontSize: 13, color: "#475569" }}>• Campus arrival by 01:15 PM</p>
              <p style={{ fontSize: 13, color: "#475569" }}>• Regular return shuttle departs at 05:30 PM</p>
            </div>
          </div>
        </div>
      )}

      {/* ── HOLIDAYS ───────────────────────────────────────────── */}
      {activeTab === "holidays" && (
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Academic Year 2026-27 Transit Holiday Calendar</h3>
            <span className="ad-badge ad-badge--red">No Regular Service</span>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">Date</th>
                  <th className="ad-th">Holiday Name</th>
                  <th className="ad-th">Category</th>
                  <th className="ad-th">Fleet Status</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.name} className="ad-tr">
                    <td className="ad-td" style={{ fontWeight: 700 }}>{h.date}</td>
                    <td className="ad-td">{h.name}</td>
                    <td className="ad-td">{h.type}</td>
                    <td className="ad-td">
                      <span className="ad-badge ad-badge--red">● {h.busService}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
    </StudentLayout>
  );
};

export default StudentSchedule;
