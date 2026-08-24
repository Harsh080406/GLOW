import * as XLSX from "xlsx";

/**
 * Export student records to a true Microsoft Excel (.xlsx) workbook file
 * @param {Array} studentList - Array of student commuter objects
 * @param {String} filename - Output .xlsx filename
 * @param {String} sheetName - Worksheet title
 */
export const exportStudentsToXLSX = (studentList, filename, sheetName = "Students_Directory") => {
  // 1. Format raw student data into clean, structured Excel rows
  const formattedData = studentList.map((s, idx) => ({
    "Sr. No": idx + 1,
    "Roll No / Student ID": s.id || "",
    "Student Full Name": s.name || "",
    "University Email": s.email || `${(s.name || "").toLowerCase().replace(/\s+/g, ".")}@glowbus.edu`,
    "Contact Phone": s.phone || "+91 98765 00000",
    "Academic Program": s.course || s.dept || "B.Tech CS",
    "Department / School": s.dept || "School of Technology",
    "Academic Year": s.year ? `${s.year} Year` : "1st Year",
    "Assigned Route": s.route || s.routeName || "Route 2A",
    "Route Code": s.routeId || "R-02",
    "Boarding Stop": s.boarding || s.pickupStop || "University Campus",
    "Transit Pass Status": s.pass || (s.passStatus === "ACTIVE" ? "Active" : s.passStatus === "PENDING" ? "Pending" : "Expired"),
    "Digital Pass ID": s.passId || "— None —",
    "Total Annual Fee (₹)": s.totalFee || 15000,
    "Paid Fee (₹)": s.paidFee !== undefined ? s.paidFee : 15000,
    "Pending Dues (₹)": s.pendingFee !== undefined ? s.pendingFee : 0,
    "Payment Status": s.paymentStatus || "PAID",
    "Account Status": s.accountStatus || "Active",
    "Boarded Today": s.boardedToday ? "YES" : "NO",
    "Boarding Time": s.boardingTime || "--",
  }));

  // 2. Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // 3. Set custom column widths for pristine Excel spreadsheet readability
  worksheet["!cols"] = [
    { wch: 8 },  // Sr. No
    { wch: 22 }, // Roll No / Student ID
    { wch: 26 }, // Full Name
    { wch: 32 }, // Email
    { wch: 18 }, // Phone
    { wch: 18 }, // Program
    { wch: 26 }, // Department
    { wch: 15 }, // Year
    { wch: 24 }, // Assigned Route
    { wch: 12 }, // Route Code
    { wch: 24 }, // Boarding Stop
    { wch: 18 }, // Pass Status
    { wch: 24 }, // Digital Pass ID
    { wch: 18 }, // Total Fee
    { wch: 16 }, // Paid Fee
    { wch: 16 }, // Pending Dues
    { wch: 16 }, // Payment Status
    { wch: 15 }, // Account Status
    { wch: 14 }, // Boarded Today
    { wch: 15 }, // Boarding Time
  ];

  // 4. Create new workbook and append sheet
  const workbook = XLSX.utils.book_new();
  const safeSheetName = (sheetName || "Students").slice(0, 31).replace(/[\\/?*[\]]/g, "_");
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  // 5. Generate and download true .xlsx file
  const safeFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename, { bookType: "xlsx", type: "binary" });
};

/**
 * Generic export array of objects to Excel (.xlsx) file
 * @param {Array} data - Array of objects
 * @param {String} filename - Output filename
 * @param {String} sheetName - Worksheet title
 */
export const exportToExcel = (data, filename = "GLOW_Export.xlsx", sheetName = "Sheet1") => {
  if (!data || !data.length) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  const safeSheetName = (sheetName || "Data").slice(0, 31).replace(/[\\/?*[\]]/g, "_");
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
  const safeFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename, { bookType: "xlsx", type: "binary" });
};

