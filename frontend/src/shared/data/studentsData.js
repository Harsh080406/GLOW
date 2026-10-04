// Deterministic master dataset of 4,250 registered student commuters

const FIRST_NAMES = [
  "Rahul", "Aditya", "Priya", "Rohit", "Sneha", "Karan", "Divya", "Vishal", "Anita", "Aarav",
  "Ananya", "Dev", "Ishaan", "Kavya", "Manav", "Pooja", "Rohan", "Riya", "Siddharth", "Tanvi",
  "Varun", "Yash", "Neha", "Amit", "Deep", "Parth", "Jignesh", "Bhavesh", "Harsh", "Mansi",
  "Khushi", "Shreya", "Dhruv", "Jay", "Meet", "Nidhi", "Payal", "Rakesh", "Sonal", "Urvi",
  "Vivek", "Chirag", "Hardik", "Hetal", "Kinnari", "Nilesh", "Paresh", "Riddhi", "Swati", "Tejas",
  "Tushar", "Alok", "Bhavin", "Chetan", "Dharmesh", "Gaurav", "Hemant", "Jagdish", "Ketan", "Mayur"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Desai", "Joshi", "Mehta", "Shah", "Trivedi", "Rao", "Singh", "Kumar",
  "Varma", "Dave", "Bhatt", "Pandya", "Rathod", "Parmar", "Chauhan", "Solanki", "Makwana", "Prajapati",
  "Vaghela", "Barot", "Raval", "Darji", "Mistry", "Soni", "Sutariya", "Gajjar", "Panchal", "Modi",
  "Gandhi", "Merchant", "Kothari", "Parekh", "Zaveri", "Doshi", "Kapadia", "Sanghavi", "Choksi", "Bheda"
];

const COURSES = [
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

const ROUTES = [
  {
    routeId: "R-01",
    route: "Route 1C",
    routeName: "Route 1C (Alkapuri - Akota)",
    stops: ["Akota Stadium", "Old Padra Road", "Chakli Circle", "Alkapuri", "Fatehgunj", "Chhani Jakat Naka", "GSFC University Campus"],
  },
  {
    routeId: "R-02",
    route: "Route 2A",
    routeName: "Route 2A (Sayajigunj - Station)",
    stops: ["Vadodara Railway Station", "Sayajigunj", "Kala Ghoda", "MS University Gate", "Fatehgunj Circle", "Nizampura", "GSFC University Campus"],
  },
  {
    routeId: "R-03",
    route: "Route 3B",
    routeName: "Route 3B (Manjalpur - Makarpura)",
    stops: ["Makarpura Bus Depot", "Manjalpur Naka", "Tarsali Bypass", "Pratapnagar", "Amit Nagar Circle", "GSFC University Campus"],
  },
  {
    routeId: "R-04",
    route: "Route 4D",
    routeName: "Route 4D (Fatehgunj - GSFC Express)",
    stops: ["Fatehgunj Bus Stop", "Nizampura Char Rasta", "Chhani Jakat Naka", "Bajwa Station", "Fertilizernagar Gate", "GSFC University Campus"],
  },
  {
    routeId: "R-05",
    route: "Route 5E",
    routeName: "Route 5E (Karelibaug - Sama Savli)",
    stops: ["Karelibaug Water Tank", "Amit Nagar Circle", "Sama-Savli Road", "Abacus Circle", "Dumad Chokdi", "GSFC University Campus"],
  },
  {
    routeId: "R-06",
    route: "Route 6F",
    routeName: "Route 6F (Gotri - Subhanpura)",
    stops: ["Gotri Hospital", "Subhanpura High Tension", "Gorwa BIDC", "Panchvati", "Koyali Road", "GSFC University Campus"],
  },
];

const YEARS = ["1st", "2nd", "3rd", "4th"];

// Key Seeded Students at the Top
const SEEDED_STUDENTS = [
  {
    id: "UNI20260125",
    name: "Rahul Sharma",
    email: "rahul.sharma@glowbus.edu",
    phone: "+91 98765 43210",
    dept: "Computer Science",
    course: "B.Tech CS",
    year: "3rd",
    route: "Route 4D",
    routeId: "R-04",
    routeName: "Route 4D (Fatehgunj - GSFC Express)",
    boarding: "Fatehgunj Bus Stop",
    pickupStop: "Fatehgunj Bus Stop",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0125",
    totalFee: 15000,
    paidFee: 10000,
    pendingFee: 5000,
    paymentStatus: "PARTIAL",
    accountStatus: "Active",
    boardedToday: true,
    boardingTime: "07:46 AM",
  },
  {
    id: "CS2021001",
    name: "Aditya Sharma",
    email: "aditya.sharma@glowbus.edu",
    phone: "+91 97001 11111",
    dept: "Computer Science",
    course: "B.Tech CS",
    year: "3rd",
    route: "Route 2A",
    routeId: "R-02",
    routeName: "Route 2A (Sayajigunj - Station)",
    boarding: "Sayajigunj",
    pickupStop: "Sayajigunj",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0101",
    totalFee: 15000,
    paidFee: 15000,
    pendingFee: 0,
    paymentStatus: "PAID",
    accountStatus: "Active",
    boardedToday: true,
    boardingTime: "07:38 AM",
  },
  {
    id: "EC2021045",
    name: "Priya Patel",
    email: "priya.patel@glowbus.edu",
    phone: "+91 97001 22222",
    dept: "Electronics & Comm.",
    course: "B.Tech EC",
    year: "3rd",
    route: "Route 3B",
    routeId: "R-03",
    routeName: "Route 3B (Manjalpur - Makarpura)",
    boarding: "Manjalpur Naka",
    pickupStop: "Manjalpur Naka",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0145",
    totalFee: 15000,
    paidFee: 15000,
    pendingFee: 0,
    paymentStatus: "PAID",
    accountStatus: "Active",
    boardedToday: true,
    boardingTime: "07:42 AM",
  },
  {
    id: "ME2022010",
    name: "Rohit Desai",
    email: "rohit.desai@glowbus.edu",
    phone: "+91 97001 33333",
    dept: "Mechanical Eng.",
    course: "B.Tech ME",
    year: "2nd",
    route: "Route 1C",
    routeId: "R-01",
    routeName: "Route 1C (Alkapuri - Akota)",
    boarding: "Alkapuri",
    pickupStop: "Alkapuri",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0210",
    totalFee: 18000,
    paidFee: 18000,
    pendingFee: 0,
    paymentStatus: "PAID",
    accountStatus: "Active",
    boardedToday: false,
    boardingTime: null,
  },
  {
    id: "MBA2023005",
    name: "Sneha Joshi",
    email: "sneha.joshi@glowbus.edu",
    phone: "+91 97001 44444",
    dept: "School of Management",
    course: "MBA",
    year: "1st",
    route: "Route 4D",
    routeId: "R-04",
    routeName: "Route 4D (Fatehgunj - GSFC Express)",
    boarding: "Nizampura Char Rasta",
    pickupStop: "Nizampura Char Rasta",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0305",
    totalFee: 15000,
    paidFee: 15000,
    pendingFee: 0,
    paymentStatus: "PAID",
    accountStatus: "Active",
    boardedToday: true,
    boardingTime: "07:35 AM",
  },
  {
    id: "CS2020088",
    name: "Karan Mehta",
    email: "karan.mehta@glowbus.edu",
    phone: "+91 97001 55555",
    dept: "Computer Science",
    course: "B.Tech CS",
    year: "4th",
    route: "Route 2A",
    routeId: "R-02",
    routeName: "Route 2A (Sayajigunj - Station)",
    boarding: "Fatehgunj Circle",
    pickupStop: "Fatehgunj Circle",
    pass: "Expired",
    passStatus: "EXPIRED",
    passId: "PASS-STU-2025-0088",
    totalFee: 15000,
    paidFee: 5000,
    pendingFee: 10000,
    paymentStatus: "PARTIAL",
    accountStatus: "Suspended",
    boardedToday: false,
    boardingTime: null,
  },
  {
    id: "EC2022032",
    name: "Divya Shah",
    email: "divya.shah@glowbus.edu",
    phone: "+91 97001 66666",
    dept: "Electronics & Comm.",
    course: "B.Tech EC",
    year: "2nd",
    route: "Route 3B",
    routeId: "R-03",
    routeName: "Route 3B (Manjalpur - Makarpura)",
    boarding: "Makarpura Bus Depot",
    pickupStop: "Makarpura Bus Depot",
    pass: "Pending",
    passStatus: "PENDING",
    passId: "",
    totalFee: 15000,
    paidFee: 0,
    pendingFee: 15000,
    paymentStatus: "PENDING",
    accountStatus: "Active",
    boardedToday: false,
    boardingTime: null,
  },
  {
    id: "CE2021019",
    name: "Vishal Trivedi",
    email: "vishal.trivedi@glowbus.edu",
    phone: "+91 97001 77777",
    dept: "Civil Eng.",
    course: "B.Tech CE",
    year: "3rd",
    route: "Route 1C",
    routeId: "R-01",
    routeName: "Route 1C (Alkapuri - Akota)",
    boarding: "Old Padra Road",
    pickupStop: "Old Padra Road",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0419",
    totalFee: 18000,
    paidFee: 18000,
    pendingFee: 0,
    paymentStatus: "PAID",
    accountStatus: "Active",
    boardedToday: true,
    boardingTime: "07:50 AM",
  },
  {
    id: "MBA2024002",
    name: "Anita Rao",
    email: "anita.rao@glowbus.edu",
    phone: "+91 97001 88888",
    dept: "School of Management",
    course: "MBA",
    year: "1st",
    route: "Route 4D",
    routeId: "R-04",
    routeName: "Route 4D (Fatehgunj - GSFC Express)",
    boarding: "Chhani Jakat Naka",
    pickupStop: "Chhani Jakat Naka",
    pass: "Active",
    passStatus: "ACTIVE",
    passId: "PASS-STU-2026-0502",
    totalFee: 15000,
    paidFee: 15000,
    pendingFee: 0,
    paymentStatus: "PAID",
    accountStatus: "Active",
    boardedToday: true,
    boardingTime: "07:44 AM",
  }
];

export const generateMasterStudents = (targetTotal = 4250) => {
  const result = [...SEEDED_STUDENTS];
  const seededCount = SEEDED_STUDENTS.length;
  const remaining = targetTotal - seededCount;

  for (let i = 0; i < remaining; i++) {
    const fnIdx = (i * 7 + 13) % FIRST_NAMES.length;
    const lnIdx = (i * 11 + 23) % LAST_NAMES.length;
    const firstName = FIRST_NAMES[fnIdx];
    const lastName = LAST_NAMES[lnIdx];
    const fullName = `${firstName} ${lastName}`;

    const cObj = COURSES[i % COURSES.length];
    const rObj = ROUTES[i % ROUTES.length];
    const stopName = rObj.stops[i % rObj.stops.length];
    const yr = YEARS[i % YEARS.length];

    // Roll number scheme: Branch + YearPrefix + Index
    const yrCode = yr === "1st" ? "2025" : yr === "2nd" ? "2024" : yr === "3rd" ? "2023" : "2022";
    const prefix = cObj.course.replace(/[^A-Z]/g, "").slice(0, 3) || "STU";
    const padIndex = String(i + 10).padStart(4, "0");
    const rollNo = `${prefix}${yrCode}${padIndex}`;

    // Pass Status Distribution: ~92% Active, ~6% Pending, ~2% Expired
    const mod100 = (i * 17) % 100;
    let pass = "Active";
    let passStatus = "ACTIVE";
    let paymentStatus = "PAID";
    let paidFee = 15000;
    let pendingFee = 0;
    let passId = `PASS-STU-2026-${String(1000 + (i % 8999))}`;

    if (mod100 >= 92 && mod100 < 98) {
      pass = "Pending";
      passStatus = "PENDING";
      paymentStatus = "PENDING";
      paidFee = 0;
      pendingFee = 15000;
      passId = "";
    } else if (mod100 >= 98) {
      pass = "Expired";
      passStatus = "EXPIRED";
      paymentStatus = "PARTIAL";
      paidFee = 5000;
      pendingFee = 10000;
      passId = `PASS-STU-2025-${String(1000 + (i % 8999))}`;
    }

    const phoneDigit = String(9000000000 + ((i * 3829 + 123456) % 999999999));
    const phone = `+91 ${phoneDigit.slice(0, 5)} ${phoneDigit.slice(5)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i % 10 > 0 ? (i % 50) + 1 : ""}@glowbus.edu`;

    const isBoarded = pass === "Active" && (i % 3 === 0 || i % 5 === 0);
    const hour = 7;
    const min = 20 + (i % 40);
    const boardingTime = isBoarded ? `0${hour}:${String(min).padStart(2, "0")} AM` : null;

    result.push({
      id: rollNo,
      name: fullName,
      email: email,
      phone: phone,
      dept: cObj.dept,
      course: cObj.course,
      year: yr,
      route: rObj.route,
      routeId: rObj.routeId,
      routeName: rObj.routeName,
      boarding: stopName,
      pickupStop: stopName,
      pass: pass,
      passStatus: passStatus,
      passId: passId,
      totalFee: 15000,
      paidFee: paidFee,
      pendingFee: pendingFee,
      paymentStatus: paymentStatus,
      accountStatus: pass === "Expired" ? "Suspended" : "Active",
      boardedToday: isBoarded,
      boardingTime: boardingTime,
    });
  }

  return result;
};

export const INITIAL_MASTER_STUDENTS = generateMasterStudents(4250);
