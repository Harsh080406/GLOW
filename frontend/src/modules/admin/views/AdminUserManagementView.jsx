import React, { useState, useEffect, useCallback } from "react";
import { useTransit } from "../../../shared/context/TransitContext";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ROLES = [
  "super_admin",
  "transport_manager",
  "finance_admin",
  "driver",
  "student",
];

const ROLE_LABELS = {
  super_admin: "Super Admin",
  transport_manager: "Transport Manager",
  finance_admin: "Finance Admin",
  driver: "Driver",
  student: "Student",
};

const AdminUserManagement = () => {
  const { authFetch } = useTransit();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [toastMsg, setToastMsg] = useState(null);

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("TempPass@123");
  const [newRole, setNewRole] = useState("super_admin");
  const [newDept, setNewDept] = useState("Fleet Operations");

  // Edit Permissions Modal
  const [editUser, setEditUser] = useState(null);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/admin/users");
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || "Failed to load system users");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (selectedRole === "ALL") return true;
    return u.role === selectedRole;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      await authFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          department: newDept,
        }),
      });
      showNotification(`✓ User ${newName} created successfully!`);
      setShowAddModal(false);
      setNewName("");
      setNewEmail("");
      fetchUsers();
    } catch (err) {
      alert("Error adding user: " + err.message);
    }
  };

  const handleEditPermissions = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      await authFetch(`/admin/users/${editUser._id || editUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          department: editUser.department,
        }),
      });
      showNotification(`✓ Permissions updated for ${editUser.name}`);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      alert("Error updating permissions: " + err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "ACTIVE" || user.status === "Active" ? "SUSPENDED" : "ACTIVE";
    try {
      await authFetch(`/admin/users/${user._id || user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      showNotification(`✓ User ${user.name} access ${nextStatus === "ACTIVE" ? "restored" : "suspended"}`);
      fetchUsers();
    } catch (err) {
      alert("Error changing status: " + err.message);
    }
  };

  return (
    <div className="view-container">
      {toastMsg && (
        <div style={{
          background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46",
          borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontWeight: 700, fontSize: 13,
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)"
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header Actions */}
      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 className="ad-page-title" style={{ fontSize: 20, fontWeight: 800 }}>User & Role Access Management</h2>
          <p className="ad-page-sub" style={{ color: "#64748b", fontSize: 13 }}>
            Manage system administrators, transport managers, RBAC credentials & security status
          </p>
        </div>
        <button className="ad-btn-primary" onClick={() => setShowAddModal(true)}>
          <Icon d="M12 4v16m8-8H4" size={16} stroke="#fff" />
          + Add System User
        </button>
      </div>

      {/* Role Filter Pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["ALL", ...ROLES].map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: `1.5px solid ${selectedRole === r ? "#2563eb" : "#e2e8f0"}`,
              background: selectedRole === r ? "#2563eb" : "#fff",
              color: selectedRole === r ? "#fff" : "#475569",
              cursor: "pointer",
            }}
          >
            {r === "ALL" ? "All Roles" : ROLE_LABELS[r] || r}
          </button>
        ))}
      </div>

      {/* Users Directory Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">System User Directory ({filteredUsers.length})</h3>
          {loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading directory...</span>}
        </div>

        {error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
            <p>{error}</p>
            <button className="ad-btn-secondary" onClick={fetchUsers} style={{ marginTop: 8 }}>Retry</button>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th className="ad-th">User</th>
                  <th className="ad-th">Role</th>
                  <th className="ad-th">Department</th>
                  <th className="ad-th">Status</th>
                  <th className="ad-th">2FA</th>
                  <th className="ad-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                      {loading ? "Loading users..." : "No users found matching this filter."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isActive = (u.status || "ACTIVE").toUpperCase() === "ACTIVE";
                    return (
                      <tr key={u._id || u.id} className="ad-tr">
                        <td className="ad-td">
                          <strong>{u.name}</strong>
                          <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>{u.email}</span>
                        </td>
                        <td className="ad-td">
                          <span className={`ad-badge ${
                            u.role === "super_admin" ? "ad-badge--purple" :
                            u.role === "transport_manager" ? "ad-badge--blue" :
                            u.role === "finance_admin" ? "ad-badge--green" : "ad-badge--yellow"
                          }`}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="ad-td">{u.department || "General Administration"}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${isActive ? "ad-badge--green" : "ad-badge--red"}`}>
                            ● {isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="ad-td">
                          {u.twoFactorEnabled ? (
                            <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 700 }}>✓ Enabled</span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 12 }}>Disabled</span>
                          )}
                        </td>
                        <td className="ad-td">
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              onClick={() => setEditUser({ ...u, role: u.role || "student" })}
                              style={{
                                padding: "4px 10px", background: "#eff6ff", color: "#2563eb",
                                border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              Edit Permissions
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              style={{
                                padding: "4px 10px",
                                background: isActive ? "#fef2f2" : "#f0fdf4",
                                color: isActive ? "#dc2626" : "#16a34a",
                                border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              {isActive ? "Revoke / Suspend" : "Restore Access"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Add System User & Assign Role</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Dave"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. p.dave@glowbus.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Initial Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>System Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Department</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
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

      {/* Edit Permissions Modal */}
      {editUser && (
        <div className="ad-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: "24px", position: "relative" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Edit User Permissions & Role</h3>
            <form onSubmit={handleEditPermissions}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Role / Permission</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Department</label>
                  <input
                    type="text"
                    value={editUser.department || ""}
                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Save Permissions
                </button>
                <button type="button" onClick={() => setEditUser(null)} style={{ padding: "12px 18px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
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
