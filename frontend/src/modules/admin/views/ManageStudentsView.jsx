import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransit } from "../../../shared/context/TransitContext";
import { exportStudentsToXLSX } from "../../../shared/utils/excelExport";
import AdminSidebar from "../layout/AdminSidebar";
import "../layout/AdminLayout.css";

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ROUTE_OPTIONS = [
  { id: "R-02", name: "Route 2A (Navrangpura)", key: "Route 2A", stops: ["Navrangpura", "Helmet Circle", "Science City Road", "Commerce Six Road", "Gujarat University", "Law Garden", "University Campus"] },
  { id: "R-03", name: "Route 3B (Memnagar)", key: "Route 3B", stops: ["Memnagar", "Naranpura", "Paldi", "Ambawadi", "University Area", "University Campus"] },
  { id: "R-01", name: "Route 1C (Satellite)", key: "Route 1C", stops: ["Satellite", "Jodhpur", "Judges Bunglow", "Bodakdev", "Thaltej", "Sola", "Chandkheda", "University Campus"] },
  { id: "R-04", name: "Route 4D (Chandkheda)", key: "Route 4D", stops: ["Chandlodiya", "Gota Cross Roads", "Chandkheda Bus Stop", "Motera Stadium Circle", "New Ranip", "University Campus"] },
  { id: "R-05", name: "Route 5E (Gandhinagar)", key: "Route 5E", stops: ["Sector 21 Complex", "Ch-3 Circle", "Infocity", "Koba Circle", "PDPU Cross Roads", "University Campus"] },
  { id: "R-06", name: "Route 6F (Maninagar)", key: "Route 6F", stops: ["Maninagar Station", "Kankaria Lake Gate 3", "Geeta Mandir", "Paldi Cross Roads", "University Campus"] },
];

const COURSE_OPTIONS = [
  { course: "B.Tech CS", dept: "Computer Science" },
  { course: "B.Tech IT", dept: "Information Technology" },
  { course: "B.Tech AI&DS", dept: "Artificial Intelligence" },
  { course: "B.Tech EC", dept: "Electronics & Comm." },
  { course: "B.Tech ME", dept: "Mechanical Eng." },
  { course: "B.Tech CE", dept: "Civil Eng." },
  { course: "B.Tech Chem", dept: "Chemical Eng." },
  { course: "MBA", dept: "School of Management" },
  { course: "MCA", dept: "Computer Applications" },
  { course: "B.Sc Biotech", dept: "Biotechnology" },
];

const PASS_COLOR = {
  Active: "green",
  ACTIVE: "green",
  Pending: "yellow",
  PENDING: "yellow",
  Expired: "red",
  EXPIRED: "red",
};

const ManageStudents = () => {
  const navigate = useNavigate();
  const { currentAdmin, students, addStudent, updateStudent, deleteStudent } = useTransit();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [routeFilter, setRouteFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals & Export State
  const [modalOpen, setModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportRouteSelection, setExportRouteSelection] = useState("ALL");
  const [editingStudent, setEditingStudent] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    course: "B.Tech CS",
    year: "1st",
    route: "Route 2A",
    boarding: "Helmet Circle",
    pass: "Pending",
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

  // Dynamic Statistics
  const totalCount = students.length;
  const activeCount = useMemo(
    () => students.filter((s) => s.pass === "Active" || s.passStatus === "ACTIVE").length,
    [students]
  );
  const pendingCount = useMemo(
    () => students.filter((s) => s.pass === "Pending" || s.passStatus === "PENDING").length,
    [students]
  );
  const expiredCount = useMemo(
    () => students.filter((s) => s.pass === "Expired" || s.passStatus === "EXPIRED").length,
    [students]
  );

  // Filtered List
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      // Status Filter
      const sPass = s.pass || s.passStatus || "Active";
      if (statusFilter !== "ALL" && sPass.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Route Filter
      if (routeFilter !== "ALL") {
        const sRoute = s.route || s.routeName || "";
        if (!sRoute.toLowerCase().includes(routeFilter.toLowerCase())) {
          return false;
        }
      }
      // Course Filter
      if (courseFilter !== "ALL") {
        const sCourse = s.course || s.dept || "";
        if (!sCourse.toLowerCase().includes(courseFilter.toLowerCase())) {
          return false;
        }
      }
      // Search Query
      if (q) {
        const nameMatch = (s.name || "").toLowerCase().includes(q);
        const idMatch = (s.id || "").toLowerCase().includes(q);
        const emailMatch = (s.email || "").toLowerCase().includes(q);
        const phoneMatch = (s.phone || "").toLowerCase().includes(q);
        const routeMatch = (s.route || s.routeName || "").toLowerCase().includes(q);
        const stopMatch = (s.boarding || s.pickupStop || "").toLowerCase().includes(q);
        const courseMatch = (s.course || s.dept || "").toLowerCase().includes(q);
        return nameMatch || idMatch || emailMatch || phoneMatch || routeMatch || stopMatch || courseMatch;
      }
      return true;
    });
  }, [students, search, statusFilter, routeFilter, courseFilter]);

  // Pagination Computations
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Route breakdown counts for download modal
  const routeCounts = useMemo(() => {
    const counts = {};
    ROUTE_OPTIONS.forEach((r) => {
      counts[r.key] = students.filter((s) => (s.route || s.routeName || "").includes(r.key)).length;
    });
    return counts;
  }, [students]);

  // Handle Trigger Direct Excel .xlsx Download
  const handleQuickDownloadXLSX = (targetRoute = "ALL") => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    if (targetRoute === "ALL") {
      exportStudentsToXLSX(students, `GLOW_All_Students_Master_Roster_${dateStamp}.xlsx`, "All_Students");
      setSuccessToast(`✓ Successfully downloaded all ${students.length.toLocaleString()} student records in Excel (.XLSX) format!`);
    } else if (targetRoute === "FILTERED") {
      exportStudentsToXLSX(filteredStudents, `GLOW_Filtered_Students_${dateStamp}.xlsx`, "Filtered_Students");
      setSuccessToast(`✓ Downloaded ${filteredStudents.length.toLocaleString()} filtered student records in Excel (.XLSX) format!`);
    } else {
      const routeStudents = students.filter((s) => (s.route || s.routeName || "").includes(targetRoute));
      const cleanName = targetRoute.replace(/\s+/g, "_");
      exportStudentsToXLSX(routeStudents, `GLOW_Students_${cleanName}_${dateStamp}.xlsx`, `${targetRoute}_Manifest`);
      setSuccessToast(`✓ Downloaded ${routeStudents.length.toLocaleString()} student records for ${targetRoute} in Excel (.XLSX) format!`);
    }
    setExportModalOpen(false);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const randomId = `CS2025${Math.floor(1000 + Math.random() * 8999)}`;
    setFormData({
      id: randomId,
      name: "",
      email: "",
      phone: "+91 ",
      course: "B.Tech CS",
      year: "1st",
      route: "Route 2A",
      boarding: "Helmet Circle",
      pass: "Pending",
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course || student.dept || "B.Tech CS",
      year: student.year || "1st",
      route: student.route || student.routeName || "Route 2A",
      boarding: student.boarding || student.pickupStop || "Helmet Circle",
      pass: student.pass || (student.passStatus === "ACTIVE" ? "Active" : student.passStatus === "PENDING" ? "Pending" : "Expired"),
    });
    setModalOpen(true);
  };

  // Handle Submit Form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const matchedCourse = COURSE_OPTIONS.find((c) => c.course === formData.course) || { dept: "Computer Science" };
    const matchedRoute = ROUTE_OPTIONS.find((r) => r.name.startsWith(formData.route.slice(0, 8))) || ROUTE_OPTIONS[0];

    if (editingStudent) {
      // Update Existing Student
      updateStudent(editingStudent.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        course: formData.course,
        dept: matchedCourse.dept,
        year: formData.year,
        route: formData.route,
        routeName: matchedRoute.name,
        boarding: formData.boarding,
        pickupStop: formData.boarding,
        pass: formData.pass,
        passStatus: formData.pass.toUpperCase(),
      });
      setSuccessToast(`✓ Successfully updated profile for ${formData.name}!`);
    } else {
      // Add New Student
      const added = addStudent({
        id: formData.id.trim() || `STU${Date.now().toString().slice(-6)}`,
        name: formData.name.trim(),
        email: formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/\s+/g, ".")}@glowbus.edu`,
        phone: formData.phone.trim() || "+91 98765 00000",
        course: formData.course,
        dept: matchedCourse.dept,
        year: formData.year,
        route: formData.route,
        routeId: matchedRoute.id,
        routeName: matchedRoute.name,
        boarding: formData.boarding,
        pickupStop: formData.boarding,
        pass: formData.pass,
        passStatus: formData.pass.toUpperCase(),
      });
      setRecentlyAddedId(added.id);
      setCurrentPage(1); // Jump to front to see added student
      setSuccessToast(`✓ Successfully registered student: ${added.name} (${added.id}) on ${added.route}!`);
    }

    setModalOpen(false);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  // Handle Delete Student
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} (${id}) from the transport directory?`)) {
      deleteStudent(id);
      setSuccessToast(`✓ Commuter record for ${name} (${id}) has been removed.`);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // When Route changes in Form, pick first stop of that route
  const handleRouteChange = (routeName) => {
    const rObj = ROUTE_OPTIONS.find((r) => r.name.startsWith(routeName.slice(0, 8)));
    setFormData((prev) => ({
      ...prev,
      route: routeName,
      boarding: rObj ? rObj.stops[0] : prev.boarding,
    }));
  };

  // Available stops for selected route in form
  const currentRouteStops = useMemo(() => {
    const rObj = ROUTE_OPTIONS.find((r) => r.name.startsWith(formData.route.slice(0, 8)));
    return rObj ? rObj.stops : ["University Campus"];
  }, [formData.route]);

  return (
    <div className="ad-wrapper">
      <div className="ad-root">
        <AdminSidebar activeId="students" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="ad-main">
          {/* Topbar */}
          <header className="ad-topbar">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Icon d="M3 12h18M3 6h18M3 18h18" size={22} />
            </button>
            <div>
              <div className="ad-topbar-title">Manage Students Directory</div>
              <div className="ad-topbar-subtitle">Real-time commuter directory, pass allocations & route onboarding</div>
            </div>
            <div className="ad-search-wrap">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              <input
                className="ad-search"
                placeholder="Search by name, roll no, route, boarding point…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="ad-topbar-right">
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
            {/* Success Toast */}
            {successToast && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  color: "#166534",
                  padding: "12px 18px",
                  borderRadius: 10,
                  marginBottom: 20,
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(34, 197, 94, 0.12)",
                }}
              >
                <span>{successToast}</span>
                <button
                  onClick={() => setSuccessToast(null)}
                  style={{ background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: 900 }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Page Header with Action Buttons */}
            <div className="ad-page-header">
              <div className="ad-page-header-text">
                <h2 className="ad-page-title">Registered Commuters Directory</h2>
                <p className="ad-page-sub">
                  Master registry of all {totalCount.toLocaleString()} enrolled student transit commuters across university routes.
                </p>
              </div>
              <div className="ad-page-actions">
                {/* Download Excel XLSX Button */}
                <button
                  className="ad-btn-excel"
                  onClick={() => setExportModalOpen(true)}
                  title="Download in Microsoft Excel (.XLSX) format"
                >
                  <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={16} stroke="#16a34a" />
                  Download Excel (.XLSX)
                </button>

                {/* Add Student Button */}
                <button className="ad-btn-primary" onClick={handleOpenAdd}>
                  <Icon d="M12 5v14M5 12h14" size={16} stroke="#fff" />
                  Add / Register Student
                </button>
              </div>
            </div>

            {/* ── 4 KPI STATS CARDS ──────────────────────────────────── */}
            <div className="ad-stats">
              <div
                className="ad-stat-card"
                onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }}
                style={{ cursor: "pointer", border: statusFilter === "ALL" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
              >
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Total Registered</p>
                  <p className="ad-stat-value">{totalCount.toLocaleString()}</p>
                  <p className="ad-stat-meta ad-stat-meta--blue">All Campus Routes</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#eff6ff" }}>
                  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={24} stroke="#3b82f6" />
                </div>
              </div>

              <div
                className="ad-stat-card"
                onClick={() => { setStatusFilter("Active"); setCurrentPage(1); }}
                style={{ cursor: "pointer", border: statusFilter === "Active" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
              >
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Active Passes</p>
                  <p className="ad-stat-value" style={{ color: "#16a34a" }}>{activeCount.toLocaleString()}</p>
                  <p className="ad-stat-meta ad-stat-meta--green">{((activeCount / (totalCount || 1)) * 100).toFixed(1)}% Validated</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#f0fdf4" }}>
                  <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={24} stroke="#22c55e" />
                </div>
              </div>

              <div
                className="ad-stat-card"
                onClick={() => { setStatusFilter("Pending"); setCurrentPage(1); }}
                style={{ cursor: "pointer", border: statusFilter === "Pending" ? "2px solid #ca8a04" : "1px solid #e2e8f0" }}
              >
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Pending Passes</p>
                  <p className="ad-stat-value" style={{ color: "#ca8a04" }}>{pendingCount.toLocaleString()}</p>
                  <p className="ad-stat-meta" style={{ color: "#ca8a04" }}>Verification Required</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#fefce8" }}>
                  <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={24} stroke="#ca8a04" />
                </div>
              </div>

              <div
                className="ad-stat-card"
                onClick={() => { setStatusFilter("Expired"); setCurrentPage(1); }}
                style={{ cursor: "pointer", border: statusFilter === "Expired" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
              >
                <div className="ad-stat-body">
                  <p className="ad-stat-label">Expired / Suspended</p>
                  <p className="ad-stat-value" style={{ color: "#dc2626" }}>{expiredCount.toLocaleString()}</p>
                  <p className="ad-stat-meta ad-stat-meta--red">Renewal Required</p>
                </div>
                <div className="ad-stat-icon" style={{ background: "#fef2f2" }}>
                  <Icon d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" size={24} stroke="#ef4444" />
                </div>
              </div>
            </div>

            {/* ── FILTER TOOLBAR WITH ROUTE EXPORT ───────────────────── */}
            <div className="ad-card" style={{ marginBottom: 20, padding: "16px 20px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                {/* Status Tabs */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { id: "ALL", label: `All (${totalCount.toLocaleString()})` },
                    { id: "Active", label: `Active (${activeCount.toLocaleString()})` },
                    { id: "Pending", label: `Pending (${pendingCount.toLocaleString()})` },
                    { id: "Expired", label: `Expired (${expiredCount.toLocaleString()})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 700,
                        border: statusFilter === tab.id ? "1px solid #0066ff" : "1px solid #e2e8f0",
                        background: statusFilter === tab.id ? "#0066ff" : "#fff",
                        color: statusFilter === tab.id ? "#fff" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dropdowns & Route Export Button */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {/* Route Filter Dropdown */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <select
                      className="ad-input"
                      style={{ width: "auto", minWidth: 160, height: 38, fontSize: 12.5 }}
                      value={routeFilter}
                      onChange={(e) => { setRouteFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="ALL">All Routes ({totalCount.toLocaleString()})</option>
                      <option value="Route 2A">Route 2A (Navrangpura) ({routeCounts["Route 2A"] || 0})</option>
                      <option value="Route 3B">Route 3B (Memnagar) ({routeCounts["Route 3B"] || 0})</option>
                      <option value="Route 1C">Route 1C (Satellite) ({routeCounts["Route 1C"] || 0})</option>
                      <option value="Route 4D">Route 4D (Chandkheda) ({routeCounts["Route 4D"] || 0})</option>
                      <option value="Route 5E">Route 5E (Gandhinagar) ({routeCounts["Route 5E"] || 0})</option>
                      <option value="Route 6F">Route 6F (Maninagar) ({routeCounts["Route 6F"] || 0})</option>
                    </select>

                    {/* Direct Route Export Button (XLSX) */}
                    <button
                      onClick={() => handleQuickDownloadXLSX(routeFilter === "ALL" ? "ALL" : routeFilter)}
                      style={{
                        height: 38,
                        padding: "0 12px",
                        borderRadius: 8,
                        border: "1px solid #bbf7d0",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                      title={`Export ${routeFilter === "ALL" ? "All Students" : routeFilter} as Excel (.XLSX)`}
                    >
                      <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={14} stroke="#16a34a" />
                      {routeFilter === "ALL" ? "Export Master (.xlsx)" : `Export ${routeFilter} (.xlsx)`}
                    </button>
                  </div>

                  {/* Course Filter */}
                  <select
                    className="ad-input"
                    style={{ width: "auto", minWidth: 150, height: 38, fontSize: 12.5 }}
                    value={courseFilter}
                    onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="ALL">All Programs</option>
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c.course} value={c.course}>{c.course}</option>
                    ))}
                  </select>

                  {/* Page Size */}
                  <select
                    className="ad-input"
                    style={{ width: "auto", height: 38, fontSize: 12.5 }}
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value={15}>15 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── STUDENTS DIRECTORY TABLE ───────────────────────────── */}
            <div className="ad-card">
              <div className="ad-card-header" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h3 className="ad-card-title">
                    Commuters Roster
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginLeft: 8 }}>
                      ({filteredStudents.length.toLocaleString()} matching records)
                    </span>
                  </h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => handleQuickDownloadXLSX("FILTERED")}
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      padding: "5px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#16a34a",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={13} stroke="#16a34a" />
                    Download Visible Filtered (.xlsx) ({filteredStudents.length.toLocaleString()})
                  </button>
                  <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table" aria-label="Students master table">
                  <thead>
                    <tr>
                      <th className="ad-th">Student Details</th>
                      <th className="ad-th">Roll / ID</th>
                      <th className="ad-th">Program & Year</th>
                      <th className="ad-th">Assigned Route</th>
                      <th className="ad-th">Boarding Stop</th>
                      <th className="ad-th">Pass Status</th>
                      <th className="ad-th">Pass ID</th>
                      <th className="ad-th" style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "48px 16px", color: "#64748b" }}>
                          <Icon d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={32} stroke="#94a3b8" />
                          <p style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>No students found matching your filters.</p>
                          <p style={{ fontSize: 13, color: "#94a3b8" }}>Try adjusting your search query or reset status/route filters.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => {
                        const isRecentlyAdded = s.id === recentlyAddedId;
                        const pStatus = s.pass || (s.passStatus === "ACTIVE" ? "Active" : s.passStatus === "PENDING" ? "Pending" : "Expired");
                        return (
                          <tr
                            key={s.id}
                            className="ad-tr"
                            style={{
                              background: isRecentlyAdded ? "#f0fdf4" : undefined,
                              transition: "background 0.3s ease",
                            }}
                          >
                            <td className="ad-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "#eff6ff",
                                    color: "#0066ff",
                                    fontWeight: 800,
                                    fontSize: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    border: "1px solid #bfdbfe",
                                  }}
                                >
                                  {(s.name || "ST")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <strong style={{ color: "#0f172a", fontSize: 13.5 }}>{s.name}</strong>
                                  {isRecentlyAdded && (
                                    <span style={{ marginLeft: 6, fontSize: 10, background: "#22c55e", color: "#fff", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>
                                      NEW
                                    </span>
                                  )}
                                  <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>
                                    {s.email || `${s.name.toLowerCase().replace(/\s+/g, ".")}@glowbus.edu`} · {s.phone || "+91 98765 00000"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="ad-td">
                              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a", background: "#f8fafc", padding: "3px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                                {s.id}
                              </span>
                            </td>
                            <td className="ad-td">
                              <span style={{ fontWeight: 600, color: "#1e293b" }}>{s.course || s.dept || "B.Tech CS"}</span>
                              <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>{s.year || "1st"} Year</span>
                            </td>
                            <td className="ad-td">
                              <span style={{ fontWeight: 600, color: "#0066ff" }}>{s.route || s.routeName || "Route 2A"}</span>
                            </td>
                            <td className="ad-td">
                              <span style={{ color: "#334155" }}>{s.boarding || s.pickupStop || "University Campus"}</span>
                            </td>
                            <td className="ad-td">
                              <span className={`ad-badge ad-badge--${PASS_COLOR[pStatus] || "green"}`}>
                                ● {pStatus}
                              </span>
                            </td>
                            <td className="ad-td" style={{ fontFamily: "monospace", fontSize: 11.5 }}>
                              {s.passId ? (
                                <span style={{ color: "#0f172a", fontWeight: 600 }}>{s.passId}</span>
                              ) : (
                                <span style={{ color: "#94a3b8" }}>— None —</span>
                              )}
                            </td>
                            <td className="ad-td" style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: 6 }}>
                                <button
                                  className="ad-btn-icon"
                                  title="Edit Commuter"
                                  onClick={() => handleOpenEdit(s)}
                                  aria-label="Edit student"
                                >
                                  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                                </button>
                                <button
                                  className="ad-btn-icon ad-btn-icon--danger"
                                  title="Delete Commuter"
                                  onClick={() => handleDelete(s.id, s.name)}
                                  aria-label="Delete student"
                                >
                                  <Icon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
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

              {/* ── PAGINATION CONTROLS ─────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderTop: "1px solid #f1f5f9",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                  Showing{" "}
                  <strong>
                    {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} –{" "}
                    {Math.min(currentPage * pageSize, filteredStudents.length)}
                  </strong>{" "}
                  of <strong>{filteredStudents.length.toLocaleString()}</strong> students
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: currentPage === 1 ? "#f8fafc" : "#fff",
                      color: currentPage === 1 ? "#cbd5e1" : "#0f172a",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    « First
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: currentPage === 1 ? "#f8fafc" : "#fff",
                      color: currentPage === 1 ? "#cbd5e1" : "#0f172a",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    ‹ Prev
                  </button>

                  {/* Page indicator pills */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalPages) return null;
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 6,
                          border: currentPage === pageNum ? "1px solid #0066ff" : "1px solid #e2e8f0",
                          background: currentPage === pageNum ? "#0066ff" : "#fff",
                          color: currentPage === pageNum ? "#fff" : "#0f172a",
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: currentPage === totalPages ? "#f8fafc" : "#fff",
                      color: currentPage === totalPages ? "#cbd5e1" : "#0f172a",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    Next ›
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: currentPage === totalPages ? "#f8fafc" : "#fff",
                      color: currentPage === totalPages ? "#cbd5e1" : "#0f172a",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    Last »
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── DOWNLOAD / EXPORT EXCEL (.XLSX) MODAL (NO SCROLLING) ───── */}
      {exportModalOpen && (
        <div className="glow-modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div className="glow-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="glow-modal-header">
              <div className="glow-modal-title-row">
                <div className="glow-modal-icon" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={20} stroke="#16a34a" />
                </div>
                <div>
                  <h3 className="glow-modal-title">Download Student Commuter Workbook (.XLSX)</h3>
                  <p className="glow-modal-sub">Export true Microsoft Excel workbook formatted with auto-column widths</p>
                </div>
              </div>
              <button
                className="glow-modal-close"
                onClick={() => setExportModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="glow-modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="glow-modal-label">Choose Export Scope / Route Selection</label>
                  <select
                    className="glow-modal-select"
                    value={exportRouteSelection}
                    onChange={(e) => setExportRouteSelection(e.target.value)}
                    style={{ marginTop: 6 }}
                  >
                    <option value="ALL">All University Routes ({totalCount.toLocaleString()} Students Total)</option>
                    <option value="FILTERED">Current Active Search & Filters ({filteredStudents.length.toLocaleString()} Students)</option>
                    {ROUTE_OPTIONS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.name} — ({routeCounts[r.key] || 0} Registered Students)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Excel Workbook Specifications:</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                    <li><strong>Format:</strong> Real Microsoft Excel OpenXML Workbook (.xlsx) with styled columns</li>
                    <li><strong>Included Fields:</strong> Sr. No, Roll No, Full Name, Email, Phone, Program, Dept, Year, Route, Route Code, Boarding Stop, Pass Status, Pass ID, Total Fee, Paid Fee, Pending Dues, Payment Status, Account Status, Boarded Today, Boarding Time</li>
                    <li>
                      <strong>Target Count:</strong>{" "}
                      <span style={{ color: "#16a34a", fontWeight: 700 }}>
                        {exportRouteSelection === "ALL"
                          ? totalCount.toLocaleString()
                          : exportRouteSelection === "FILTERED"
                          ? filteredStudents.length.toLocaleString()
                          : (routeCounts[exportRouteSelection] || 0).toLocaleString()}{" "}
                        commuter records
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="glow-modal-footer">
              <button
                type="button"
                className="ap-cancel-btn"
                onClick={() => setExportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ap-save-btn"
                style={{ background: "#16a34a", borderColor: "#16a34a" }}
                onClick={() => handleQuickDownloadXLSX(exportRouteSelection)}
              >
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={16} stroke="#fff" />
                Download Excel (.XLSX)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT STUDENT MODAL CONTAINER (NO SCROLLING) ──────── */}
      {modalOpen && (
        <div className="glow-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="glow-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="glow-modal-header">
              <div className="glow-modal-title-row">
                <div className="glow-modal-icon">
                  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={20} stroke="#0066ff" />
                </div>
                <div>
                  <h3 className="glow-modal-title">{editingStudent ? "Edit Student Commuter" : "Add / Register New Student"}</h3>
                  <p className="glow-modal-sub">
                    {editingStudent ? `Update records for ${editingStudent.name} (${editingStudent.id})` : "Enter enrollment details to allocate route and digital transit pass"}
                  </p>
                </div>
              </div>
              <button
                className="glow-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="glow-modal-body">
                <div className="glow-modal-grid">
                  {/* Roll No */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Roll No / Student ID</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="e.g. CS20251092"
                      required
                      disabled={!!editingStudent}
                    />
                  </div>

                  {/* Full Name */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Full Name</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ankit Sharma"
                      required
                    />
                  </div>

                  {/* University Email */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">University Email</label>
                    <input
                      type="email"
                      className="glow-modal-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ankit.sharma@glowbus.edu"
                    />
                  </div>

                  {/* Phone */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Contact Phone</label>
                    <input
                      type="text"
                      className="glow-modal-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  {/* Program / Course */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Academic Program</label>
                    <select
                      className="glow-modal-select"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    >
                      {COURSE_OPTIONS.map((c) => (
                        <option key={c.course} value={c.course}>{c.course} ({c.dept})</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Academic Year</label>
                    <select
                      className="glow-modal-select"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    >
                      <option value="1st">1st Year (Fresher)</option>
                      <option value="2nd">2nd Year (Sophomore)</option>
                      <option value="3rd">3rd Year (Junior)</option>
                      <option value="4th">4th Year (Senior)</option>
                    </select>
                  </div>

                  {/* Assigned Route */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Assigned Transit Route</label>
                    <select
                      className="glow-modal-select"
                      value={formData.route}
                      onChange={(e) => handleRouteChange(e.target.value)}
                    >
                      {ROUTE_OPTIONS.map((r) => (
                        <option key={r.id} value={r.name.split(" ")[0] + " " + r.name.split(" ")[1]}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Boarding Point */}
                  <div className="glow-modal-field">
                    <label className="glow-modal-label">Boarding Stop</label>
                    <select
                      className="glow-modal-select"
                      value={formData.boarding}
                      onChange={(e) => setFormData({ ...formData, boarding: e.target.value })}
                    >
                      {currentRouteStops.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pass Status Selection Cards */}
                  <div className="glow-modal-field glow-modal-field--full" style={{ marginTop: 6 }}>
                    <label className="glow-modal-label">Transit Pass Allocation Status</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 4 }}>
                      {[
                        { id: "Active", label: "Active", desc: "Digital Pass Issued", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
                        { id: "Pending", label: "Pending", desc: "Approval Required", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
                        { id: "Expired", label: "Expired", desc: "Access Suspended", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
                      ].map((st) => {
                        const isSelected = formData.pass === st.id;
                        return (
                          <div
                            key={st.id}
                            onClick={() => setFormData({ ...formData, pass: st.id })}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 12,
                              border: isSelected ? `2px solid ${st.color}` : "1.5px solid #e2e8f0",
                              background: isSelected ? st.bg : "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              transition: "all 0.15s ease",
                              boxShadow: isSelected ? `0 2px 8px ${st.color}22` : "none",
                            }}
                          >
                            <input
                              type="radio"
                              name="passStatus"
                              checked={isSelected}
                              onChange={() => setFormData({ ...formData, pass: st.id })}
                              style={{ accentColor: st.color, cursor: "pointer", width: 16, height: 16 }}
                            />
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 800, color: isSelected ? st.color : "#0f172a" }}>{st.label}</div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{st.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glow-modal-footer">
                <button
                  type="button"
                  className="ad-btn-secondary"
                  style={{ padding: "10px 20px", fontSize: 13.5, fontWeight: 700 }}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ad-btn-primary"
                  style={{ padding: "10px 24px", fontSize: 13.5, fontWeight: 700 }}
                >
                  {editingStudent ? "Save Changes" : "Save & Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
