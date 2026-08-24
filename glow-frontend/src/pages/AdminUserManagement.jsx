import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { useTransit } from "../context/TransitContext";
import "./AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ROLES = [
  "Super Admin",
  "Transport Manager",
  "Finance Admin",
  "Driver",
  "Student",
];

const INITIAL_USERS = [
  { id: "USR-001", name: "Dr. Arvind Patel", email: "arvind.patel@glowbus.edu", role: "Super Admin", department: "Administration", status: "Active", lastLogin: "Today, 08:30 AM" },
  { id: "USR-002", name: "Vikram Rathod", email: "vikram.transport@glowbus.edu", role: "Transport Manager", department: "Fleet Operations", status: "Active", lastLogin: "Today, 07:15 AM" },
  { id: "USR-003", name: "Vikas Agrawal", email: "vikas.accounts@glowbus.edu", role: "Finance Admin", department: "Accounts & Billing", status: "Active", lastLogin: "Today, 09:00 AM" },
  { id: "USR-004", name: "Mahesh Patel", email: "mahesh.patel@glowbus.edu", role: "Driver", department: "Fleet Operations", status: "Active", lastLogin: "Today, 07:28 AM" },
  { id: "USR-005", name: "Rahul Sharma", email: "rahul.sharma@glowbus.edu", role: "Student", department: "Computer Science", status: "Active", lastLogin: "Today, 07:46 AM" },
  { id: "USR-006", name: "Ramesh Shah", email: "ramesh.shah@glowbus.edu", role: "Driver", department: "Fleet Operations", status: "Active", lastLogin: "Yesterday" },
  { id: "USR-007", name: "Amit Kumar", email: "amit.kumar@glowbus.edu", role: "Student", department: "Mechanical Eng", status: "Active", lastLogin: "2 days ago" },
];

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useTransit();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [dept, setDept] = useState("Computer Science");

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

  const filteredUsers = users.filter((u) => {
    if (selectedRole === "ALL") return true;
    return u.role === selectedRole;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    setUsers((prev) => [
      {
        id: `USR-00${prev.length + 1}`,
        name: name,
        email: email,
        role: role,
        department: dept,
        status: "Active",
        lastLogin: "Never",
      },
      ...prev,
    ]);

    setShowAddModal(false);
    setName("");
    setEmail("");
  };

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" } : u))
    );
  };

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="users" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">User & Role Management</div>
              <div className="ad-topbar-subtitle">Manage system access, RBAC roles, accounts & security permissions</div>
            </div>
            <div className="ad-topbar-right">
              <button className="ad-btn-primary" onClick={() => setShowAddModal(true)}>
                <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
                Add New User
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
            {/* ── ROLE FILTER PILLS ──────────────────────────────────── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["ALL", ...ROLES].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: `1.5px solid ${selectedRole === r ? "#2563eb" : "#e2e8f0"}`,
                    background: selectedRole === r ? "#2563eb" : "#fff",
                    color: selectedRole === r ? "#fff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {r === "ALL" ? "All Roles" : r}
                </button>
              ))}
            </div>

            {/* ── USERS TABLE ────────────────────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header">
                <h3 className="ad-card-title">System User Directory ({filteredUsers.length})</h3>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th className="ad-th">User ID</th>
                      <th className="ad-th">Name & Email</th>
                      <th className="ad-th">Assigned Role</th>
                      <th className="ad-th">Department</th>
                      <th className="ad-th">Status</th>
                      <th className="ad-th">Last Login</th>
                      <th className="ad-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="ad-tr">
                        <td className="ad-td" style={{ fontWeight: 700 }}>{u.id}</td>
                        <td className="ad-td">
                          <strong>{u.name}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{u.email}</span>
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${u.role === "Super Admin" ? "ad-badge--purple" : u.role === "Transport Manager" ? "ad-badge--blue" : u.role === "Finance Admin" ? "ad-badge--green" : "ad-badge--yellow"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="ad-td">{u.department}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${u.status === "Active" ? "ad-badge--green" : "ad-badge--red"}`}>
                            ● {u.status}
                          </span>
                        </td>
                        <td className="ad-td">{u.lastLogin}</td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              style={{ padding: "4px 8px", background: u.status === "Active" ? "#fef2f2" : "#f0fdf4", color: u.status === "Active" ? "#dc2626" : "#16a34a", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              {u.status === "Active" ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => alert(`Password reset link sent to ${u.email}`)}
                              style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                            >
                              Reset Pwd
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="ad-footer"><span>© 2026 GLOW Bus Development System.</span></footer>
          </main>
        </div>
      </div>

      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Add New User & Assign Role</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Dave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. p.dave@glowbus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Select Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Department</label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Create User
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
