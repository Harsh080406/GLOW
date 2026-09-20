# GLOW — Campus Transit & Smart Fleet Management System
## Complete System Overview & Page-by-Page Feature Matrix

> **Platform Architecture**: Full-Stack Enterprise Monorepo (React 19 + Vite Frontend SPA, Node.js Express REST API Backend, PostgreSQL/MySQL DDL Schema).  
> **Core Purpose**: Enterprise university transit and smart fleet mobility platform designed for high-precision real-time bus tracking, encrypted RFID/QR digital passes, automated fee reconciliations, and instant safety command.

---

## Table of Contents

1. [System Overview & Key Capabilities](#1-system-overview--key-capabilities)
2. [Global Shared Infrastructure & Navigation](#2-global-shared-infrastructure--navigation)
3. [Public & Authentication Module](#3-public--authentication-module)
4. [Student Mobility Portal](#4-student-mobility-portal)
5. [Driver Mobile Cockpit](#5-driver-mobile-cockpit)
6. [Super Admin Command Center](#6-super-admin-command-center)
7. [Transport Operations Hub](#7-transport-operations-hub)
8. [Finance & Billing Division](#8-finance--billing-division)
9. [Technology Stack & File Index](#9-technology-stack--file-index)

---

## 1. System Overview & Key Capabilities

GLOW connects five key university stakeholder groups into a unified real-time ecosystem:
- **Students**: Track buses in real-time with 3-second GPS updates, display anti-counterfeit QR passes, pay fees via UPI/Cards, and trigger immediate SOS alerts.
- **Drivers**: Utilize a mobile cockpit tablet interface for trip sequencing, sub-2-second QR pass validation, delay broadcasts, and emergency dispatch.
- **Super Admins**: Oversee fleet-wide analytics, 8 core KPI cards, vehicle rosters, user access control, live telemetry, and SOS incident response.
- **Transport Managers**: Balance route allocations, manage vehicle fitness and maintenance logs, and dispatch exam-special shifts.
- **Finance Admins**: Verify offline bank challans, reconcile fee realizations, issue certified tax receipts, and export 1-click Excel ledgers.

---

## 2. Global Shared Infrastructure & Navigation

### Shared Components & Context

- **Global State (`TransitContext.jsx`)**: Manages real-time data for 85+ campus buses, 34 transit corridors, 4,250 registered commuters, live telemetry feeds, digital QR passes, fee ledgers, and SOS alerts.
- **Role Switcher Bar (`RoleSwitcherBar.jsx`)**: Sticky top/bottom quick-role switcher allowing instantaneous 1-click preview toggling between:
  - `Student`
  - `Driver`
  - `Super Admin`
  - `Finance Admin`
  - `Transport Operations`
- **Animated Splash Screen (`SplashScreen.jsx`)**: Full-screen startup loader with GLOW branding and progress animation.
- **Global Error Boundary (`ErrorBoundary.jsx`)**: React error boundary capturing runtime exceptions with a fallback error card and reset control.

---

## 3. Public & Authentication Module

### 3.1 Public Landing Page
* **Route**: `/` or `/landing`
* **File**: `modules/public/views/LandingPageView.jsx`
* **Purpose**: Public home page showcasing campus transit capabilities, live statistics, and portal access entry points.
* **Key Features**:
  - Split-canvas hero banner featuring animated video assets and stats counter (85+ Buses, 34+ Corridors, 4,250+ Commuters).
  - Feature highlights suite (Real-Time GPS, Digital QR Pass, Speed Telemetry, SOS Safety System).
  - Interactive FAQ accordion section.
  - Footer with campus contact information and system links.
* **Interactive Buttons & Controls**:
  - `[Launch Mobility Portal]`: Navigates to `/login`.
  - `[Login to Dashboard]`: Opens login portal.
  - `[Access Student Portal]`: Direct link to `/student/dashboard`.
  - `[Driver Cockpit]`: Direct link to `/driver/dashboard`.
  - `[Super Admin Command]`: Direct link to `/admin/dashboard`.
  - `[Explore Live Map]`: Scrolls to feature breakdown section.
  - `[FAQ Accordion Headers]`: Toggles question collapse/expansion.

---

### 3.2 Unified Login Portal & Google SSO
* **Route**: `/login`, `/login/admin`, `/login/student`, `/login/driver`
* **File**: `modules/public/views/LoginPageView.jsx`
* **Purpose**: Authentication gateway supporting direct credential login, automatic role-based redirect, and 1-click Google SSO account selector.
* **Key Features**:
  - Dual-panel layout with branded artwork banner and login form.
  - Smart keyword auto-routing (detects keywords like `admin`, `driver`, `finance`, `transport`, or `student` in the username to route automatically).
  - Google SSO Account Chooser Modal with 4 pre-configured demo profiles.
  - Password visibility toggle.
* **Interactive Buttons & Controls**:
  - `[Email Input]` & `[Password Input]`: Text input fields for user credentials.
  - `[Show/Hide Password (Eye Button)]`: Toggles password field masking between `password` and `text`.
  - `[Login Button (Submit)]`: Validates inputs and logs user into their respective role dashboard.
  - `[Forgot Password?]`: Triggers reset notice toast alert.
  - `[Sign in with Google]`: Opens the Google Account Chooser Modal.
  - `[Google Account Profile Cards (Modal)]`:
    - `Rahul Sharma (Student)` -> Log in as Student.
    - `Dr. Arvind Patel (Super Admin)` -> Log in as Super Admin.
    - `CMA Rajesh Dave (Finance Admin)` -> Log in as Finance Admin.
    - `Mahesh Patel (Senior Driver)` -> Log in as Bus Driver.
  - `[Cancel Modal Button]`: Closes the Google SSO modal.

---

## 4. Student Mobility Portal

### 4.1 Student Dashboard
* **Route**: `/student/dashboard`
* **File**: `modules/student/views/StudentDashboardView.jsx`
* **Purpose**: Primary dashboard for student commuters displaying bus assignment, real-time status, quick actions, and mini-map.
* **Key Features**:
  - Summary KPI cards: Assigned Bus, Route Name, Digital Pass Status, Next Pickup ETA.
  - Live Mini-GPS Map component showing live shuttle movement.
  - Quick action card grid for rapid navigation.
* **Interactive Buttons & Controls**:
  - `[View Digital Pass]`: Navigates to `/student/pass`.
  - `[Live Bus Tracking]`: Navigates to `/student/tracking`.
  - `[Pay Transport Dues]`: Navigates to `/student/fees`.
  - `[Report Complaint]`: Navigates to `/student/complaints`.
  - `[Trigger SOS Alert]`: Navigates to `/student/emergency`.

---

### 4.2 My Bus Telemetry
* **Route**: `/student/my-bus`
* **File**: `modules/student/views/StudentMyBusView.jsx`
* **Purpose**: Detailed telemetry view of the student's assigned bus shuttle.
* **Key Features**:
  - Vehicle specifications (Registration number, Model, Total Capacity, Occupancy percentage).
  - Driver profile information & safety rating.
  - AC status, current speed indicator, and fuel/battery health.
* **Interactive Buttons & Controls**:
  - `[Call Driver Button]`: Opens phone dialer prompt (`tel:+91...`).
  - `[View Full Route Map]`: Navigates to `/student/my-route`.
  - `[Refresh Telemetry]`: Fetches latest bus GPS status.

---

### 4.3 My Route Timeline
* **Route**: `/student/my-route`
* **File**: `modules/student/views/StudentMyRouteView.jsx`
* **Purpose**: Sequential stop-by-stop timeline of the student's transit corridor.
* **Key Features**:
  - Visual route sequence from Origin to Destination with intermediate stops.
  - Distance between stops, estimated time of arrival (ETA), and traffic condition badges.
* **Interactive Buttons & Controls**:
  - `[Set Stop Notification]`: Toggles push/SMS reminder for designated stop.
  - `[Download Route Map PDF]`: Exports route timeline document.

---

### 4.4 Student Schedule & Semester Timetable
* **Route**: `/student/schedule`, `/student/timetable`
* **File**: `modules/student/views/StudentScheduleView.jsx`
* **Purpose**: Master transport schedule for regular shifts and examination periods.
* **Key Features**:
  - Morning Shift (09:00 AM) and Evening Shift (05:00 PM) bus departure lists.
  - Exam special staggered shift schedule banner.
  - Stop departure time table.
* **Interactive Buttons & Controls**:
  - `[Regular Semester Tab]`: Displays standard daily shift schedule.
  - `[Exam Special Shift Tab]`: Displays examination staggered bus timings.
  - `[Download Timetable PDF]`: Downloads printable PDF timetable.

---

### 4.5 Live GPS Interactive Bus Tracking
* **Route**: `/student/tracking`
* **File**: `modules/student/views/LiveTrackingView.jsx`
* **Purpose**: Full-screen interactive GPS telemetry map displaying live bus movement across campus corridors.
* **Key Features**:
  - High-precision SVG map with animated moving shuttle markers.
  - Real-time telemetry sidebar showing speed, current road, next stop ETA, and driver details.
  - Traffic congestion indicators and active trip selector.
* **Interactive Buttons & Controls**:
  - `[Recenter Map Button]`: Centers map view on assigned bus position.
  - `[Select Bus Pill / Dropdown]`: Switches telemetry focus between active buses (`BUS-101`, `BUS-102`, etc.).
  - `[Toggle Traffic Layer]`: Enables/disables traffic congestion overlay.
  - `[Call Driver]`: Triggers driver contact popup.

---

### 4.6 Encrypted Digital Transport Pass
* **Route**: `/student/pass`
* **File**: `modules/student/views/StudentTransportPassView.jsx`
* **Purpose**: Anti-counterfeit digital transport pass with encrypted QR code for onboard scanner validation.
* **Key Features**:
  - Encrypted QR code containing student ID, route allocation, and signature.
  - Pass validity period, zone tier (Zone A / B / C), student portrait badge.
  - Pass status indicator (`ACTIVE`, `EXPIRED`, `PENDING_FEE`).
* **Interactive Buttons & Controls**:
  - `[Download Pass PDF]`: Generates offline printable digital pass PDF.
  - `[Print Pass]`: Launches browser print dialog.
  - `[Renew Transport Pass]`: Navigates to fee payment portal.

---

### 4.7 Student Fees & Dues Gateway
* **Route**: `/student/fees`
* **File**: `modules/student/views/StudentFeesView.jsx`
* **Purpose**: Transport fee payment portal and payment history ledger.
* **Key Features**:
  - Outstanding dues card with payment breakdown.
  - Integrated online checkout simulation (UPI / Credit Card / NetBanking).
  - Offline bank challan slip upload workflow.
  - Transaction receipt table with downloadable invoices.
* **Interactive Buttons & Controls**:
  - `[Pay Total Dues Online]`: Launches online payment checkout modal.
  - `[Select Payment Method (UPI/Card/NetBanking)]`: Selects active gateway option.
  - `[Submit Online Payment]`: Executes mock payment transaction.
  - `[Upload Bank Challan Slip]`: Opens offline deposit verification modal.
  - `[Download Receipt PDF]`: Downloads tax invoice PDF for specific transaction.

---

### 4.8 Notifications Center
* **Route**: `/student/notifications`
* **File**: `modules/student/views/NotificationsView.jsx`
* **Purpose**: Real-time broadcast inbox for route delays, emergency alerts, and system notices.
* **Key Features**:
  - Categorized alert list (Delay Alerts, Emergency Alerts, Fee Reminders, Schedule Updates).
  - Unread badge counter and timestamp markers.
* **Interactive Buttons & Controls**:
  - `[Mark All as Read]`: Clears unread indicator across all notifications.
  - `[Filter All / Unread]`: Toggles list display filter.
  - `[Clear Notification Item]`: Dismisses single notification entry.

---

### 4.9 Student Complaints & Feedback
* **Route**: `/student/complaints`
* **File**: `modules/student/views/StudentComplaintsView.jsx`
* **Purpose**: Service feedback ticket submission and tracking system.
* **Key Features**:
  - Ticket submission form (Category: Cleanliness, Driver Conduct, Overcrowding, Timing Delay).
  - Ticket resolution status timeline (`PENDING`, `IN_REVIEW`, `RESOLVED`).
* **Interactive Buttons & Controls**:
  - `[Category Select Dropdown]`: Selects ticket feedback classification.
  - `[Submit Ticket Button]`: Posts new complaint ticket to administration queue.
  - `[View Ticket Details]`: Expands admin resolution notes.

---

### 4.10 Emergency & SOS Dispatch
* **Route**: `/student/emergency`
* **File**: `modules/student/views/StudentEmergencyView.jsx`
* **Purpose**: One-tap emergency broadcast alert sending real-time GPS coordinates to Security Command.
* **Key Features**:
  - High-visibility emergency trigger button.
  - Live GPS coordinate logging and emergency contact hotline list.
  - Active SOS status indicator.
* **Interactive Buttons & Controls**:
  - `[🚨 TRIGGER SOS EMERGENCY BROADCAST]`: Dispatches immediate high-priority alert to Admin/Transport command centers.
  - `[Cancel False Alarm]`: Rescues/deactivates active SOS broadcast.
  - `[Call Campus Security Hotlines]`: Direct dialer for emergency numbers (`112`, `Campus SOS`).

---

### 4.11 Student Profile & Account Settings
* **Route**: `/student/profile`
* **File**: `modules/student/views/StudentProfileView.jsx`
* **Purpose**: Account management view for updating personal information and emergency contact.
* **Key Features**:
  - Student academic info (Enrollment ID, Branch, Semester, Assigned Stop).
  - Editable contact details, phone number, and emergency guardian contact.
* **Interactive Buttons & Controls**:
  - `[Edit Profile]`: Enables form input fields for editing.
  - `[Save Changes]`: Persists updated student details to context state.
  - `[Change Password]`: Opens password modification dialog.

---

## 5. Driver Mobile Cockpit

### 5.1 Driver Cockpit Dashboard
* **Route**: `/driver/dashboard`
* **File**: `modules/driver/views/DriverDashboardView.jsx`
* **Purpose**: Tablet-optimized interface for bus drivers to manage trip telemetry, scan passenger passes, and broadcast delays.
* **Key Features**:
  - Active Trip Telemetry Card (Speed gauge, Assigned Bus `BUS-101`, Route, Passenger Count, Next Stop).
  - High-Speed Camera QR Scanner modal for sub-2-second student pass validation.
  - Step-by-step route stop sequence progression.
  - Delay notification broadcast trigger (5 min, 10 min, 15 min delays).
  - High-priority Driver SOS Alert.
* **Interactive Buttons & Controls**:
  - `[START TRIP]`: Initiates route trip, sets status to `On Route`, and starts live GPS broadcast.
  - `[PAUSE TRIP]`: Temporarily halts trip for traffic or rest stops.
  - `[COMPLETE TRIP]`: Finalizes trip, resets occupancy, and archives route metrics.
  - `[📷 Scan Passenger QR Pass]`: Opens high-speed camera scanner modal to scan student pass QR code.
  - `[Validate Manual Student ID]`: Fallback input for typing student enrollment ID manually.
  - `[📢 Broadcast Delay Notice]`: Opens delay options (5m, 10m, 15m) to push real-time notification to students on the route.
  - `[🚨 DRIVER SOS EMERGENCY]`: Triggers vehicle breakdown or safety emergency alert to fleet dispatch.

---

## 6. Super Admin Command Center

### 6.1 Super Admin Dashboard
* **Route**: `/admin/dashboard`
* **File**: `modules/admin/views/AdminDashboardView.jsx`
* **Purpose**: Main executive command center providing 360-degree fleet governance and operational KPIs.
* **Key Features**:
  - 8 Top KPI Stat Cards: Total Students (4,250), Buses (85), Drivers (92), Active Routes (34), Active Trips (28), Pending Fees (₹3.6L), Maintenance (6), Complaints (12).
  - Active Emergency Incident Alert Banner (displays high-priority SOS alerts).
  - Live Campus Fleet Telemetry SVG Map with active bus markers.
  - System Activity Log audit trail.
  - Today's Fleet Dispatches data table.
  - Quick Administration Actions grid.
* **Interactive Buttons & Controls**:
  - `[KPI Stat Cards]`: Clickable cards navigating directly to corresponding management views.
  - `[Open Live Console]`: Navigates to `/admin/tracking`.
  - `[Manage Full Fleet]`: Navigates to `/admin/fleet`.
  - `[Live Track (Row Action)]`: Focuses tracking console on specific bus.
  - `[View Incident & SOS Logs]`: Navigates to `/admin/emergencies`.
  - `[Quick Action Buttons]`:
    - `Register New Bus` -> `/admin/fleet`
    - `Assign Driver to Route` -> `/admin/drivers`
    - `Create Route / Timetable` -> `/admin/routes`
    - `Finance & Fee Audit` -> `/admin/finance`
    - `Broadcast Emergency Alert` -> `/admin/emergencies`
    - `System Roles & Permissions` -> `/admin/users`

---

### 6.2 User Access & Role Management
* **Route**: `/admin/users`
* **File**: `modules/admin/views/AdminUserManagementView.jsx`
* **Purpose**: Role-Based Access Control (RBAC) administration for system users.
* **Key Features**:
  - Master user accounts table (Name, Email, Assigned Role, Status, Last Login).
  - Role filter tabs (`All`, `Admins`, `Drivers`, `Finance`, `Transport`).
  - Add User Modal & Role permission modifier.
* **Interactive Buttons & Controls**:
  - `[+ Add System User]`: Opens modal to create new staff or administrative account.
  - `[Filter Role Tabs]`: Filters table list by role classification.
  - `[Edit Permissions (Row Action)]`: Modifies account access level.
  - `[Revoke / Suspend Access]`: Toggles account active/suspended state.

---

### 6.3 Manage Students
* **Route**: `/admin/students`
* **File**: `modules/admin/views/ManageStudentsView.jsx`
* **Purpose**: Comprehensive student transport roster administration.
* **Key Features**:
  - Searchable student table with branch, route assignment, transport fee status, and pass ID.
  - Add/Edit Student modal.
  - Fee status filtering (`Paid`, `Pending`, `Waived`).
* **Interactive Buttons & Controls**:
  - `[+ Add New Student]`: Opens modal form to register a new student commuter.
  - `[Search Bar]`: Searches students by name, enrollment ID, or email.
  - `[Filter Fee Status Dropdown]`: Filters list by payment status.
  - `[Edit Student (Row Action)]`: Opens edit modal to modify assigned route or details.
  - `[Delete Student (Row Action)]`: Prompts confirmation to remove student entry.
  - `[Export Students Excel]`: Downloads student roster `.xlsx` spreadsheet.

---

### 6.4 Manage Fleet Inventory
* **Route**: `/admin/fleet`
* **File**: `modules/admin/views/ManageFleetView.jsx`
* **Purpose**: Vehicle inventory management and fleet fitness control.
* **Key Features**:
  - Vehicle cards/table with registration number, seating capacity, fuel/battery level, assigned driver, and operational status (`On Route`, `Maintenance`, `Idle`).
  - Add Bus Modal.
  - Vehicle Fitness Certificate expiry tracker.
* **Interactive Buttons & Controls**:
  - `[+ Add New Vehicle]`: Opens modal to register a new bus shuttle.
  - `[Schedule Maintenance (Row Action)]`: Moves vehicle to maintenance queue.
  - `[Toggle Active/Inactive Status]`: Updates operational availability.
  - `[Export Fleet Roster]`: Exports vehicle list to Excel.

---

### 6.5 Manage Drivers Roster
* **Route**: `/admin/drivers`
* **File**: `modules/admin/views/ManageDriversView.jsx`
* **Purpose**: Driver roster, license verification, and vehicle assignment console.
* **Key Features**:
  - Licensed driver roster table (License number, Assigned vehicle `BUS-101`, shift timing, safety rating score).
  - Add Driver modal.
* **Interactive Buttons & Controls**:
  - `[+ Add Driver]`: Opens modal to onboard a new driver.
  - `[Assign Vehicle (Row Action)]`: Links driver to specific bus shuttle.
  - `[View Driving Logs]`: Displays safety rating and trip metrics.
  - `[Edit Driver Profile]`: Modifies contact or license details.

---

### 6.6 Manage Transit Routes
* **Route**: `/admin/routes`
* **File**: `modules/admin/views/ManageRoutesView.jsx`
* **Purpose**: Transit corridor creation, stop sequencing, and route optimization.
* **Key Features**:
  - Route cards displaying Origin, Destination, total distance (km), estimated duration, stop count, and assigned buses.
  - Add/Edit Route modal.
  - Stop sequence reordering list.
* **Interactive Buttons & Controls**:
  - `[+ Create Transit Route]`: Opens modal to configure a new transit corridor.
  - `[Edit Route Sequence (Row Action)]`: Modifies stop list and timing.
  - `[Deactivate Route]`: Toggles route status to inactive.

---

### 6.7 Schedules & Timetables
* **Route**: `/admin/schedules`
* **File**: `modules/admin/views/AdminSchedulesView.jsx`
* **Purpose**: Semester timetable dispatch and exam-special shift planner.
* **Key Features**:
  - Departure time slot planner by shift (Morning 09:00 AM, Evening 05:00 PM, Exam 02:00 PM).
  - Bus & driver schedule matrix.
* **Interactive Buttons & Controls**:
  - `[+ Add Schedule Slot]`: Creates a new departure time slot.
  - `[Publish Timetable]`: Pushes updated schedule to student and driver portals.
  - `[Export Schedule PDF]`: Downloads printable schedule document.

---

### 6.8 Multi-Bus Live Tracking Console
* **Route**: `/admin/tracking`
* **File**: `modules/admin/views/AdminTrackingView.jsx`
* **Purpose**: Full-screen dispatch monitoring console tracking all active buses simultaneously.
* **Key Features**:
  - Multi-vehicle GPS SVG telemetry map with live speed, direction, and stop progress.
  - Active telemetry feed panel displaying vehicle diagnostic metrics.
* **Interactive Buttons & Controls**:
  - `[Focus Bus (BUS-101 / BUS-102)]`: Centers map and side panel on target bus.
  - `[Filter Active Only]`: Displays only buses currently `On Route`.
  - `[Toggle Satellite View]`: Switches map rendering mode.

---

### 6.9 Finance Overview
* **Route**: `/admin/finance`
* **File**: `modules/admin/views/AdminFinanceOverviewView.jsx`
* **Purpose**: High-level financial executive summary for Super Admins.
* **Key Features**:
  - Total revenue collected, pending dues sum, and fee realization rate metrics.
  - Recent transaction summary stream.
* **Interactive Buttons & Controls**:
  - `[Open Finance Portal]`: Navigates to `/finance/dashboard`.
  - `[Generate Revenue Report]`: Exports financial breakdown PDF.

---

### 6.10 Fleet Maintenance & Service Logs
* **Route**: `/admin/maintenance`
* **File**: `modules/admin/views/AdminMaintenanceView.jsx`
* **Purpose**: Vehicle repair tickets, routine service scheduling, and overhaul logs.
* **Key Features**:
  - Maintenance records table (Bus ID, Service Type: Oil Change, Engine Check, Tire Swap, Cost, Vendor, Status).
  - Create Maintenance Ticket modal.
* **Interactive Buttons & Controls**:
  - `[+ Log Maintenance Ticket]`: Creates new service record.
  - `[Approve Service Invoice (Row Action)]`: Marks ticket as paid/completed.
  - `[Mark Vehicle Fit]`: Returns bus to active fleet status.

---

### 6.11 Complaints Queue
* **Route**: `/admin/complaints`
* **File**: `modules/admin/views/AdminComplaintsView.jsx`
* **Purpose**: Centralized complaint ticket resolution queue.
* **Key Features**:
  - List of student & driver feedback tickets with priority tags (`HIGH`, `MEDIUM`, `LOW`).
  - Resolution modal to respond and close tickets.
* **Interactive Buttons & Controls**:
  - `[Resolve Ticket (Row Action)]`: Opens resolution notes modal.
  - `[Assign to Department]`: Routes ticket to Transport or Maintenance team.

---

### 6.12 Emergency & SOS Control Room
* **Route**: `/admin/emergencies`
* **File**: `modules/admin/views/AdminEmergenciesView.jsx`
* **Purpose**: High-priority incident dispatch and emergency response command.
* **Key Features**:
  - Real-time emergency event log (Student SOS alerts, Driver breakdown alerts, GPS coordinates, Status: `ACTIVE`, `DISPATCHED`, `RESOLVED`).
  - Incident response control modal.
* **Interactive Buttons & Controls**:
  - `[Dispatch Security Team (Row Action)]`: Updates status to `DISPATCHED` and alerts campus security.
  - `[Resolve Emergency]`: Marks incident as resolved with post-incident notes.
  - `[Broadcast Campus Alert]`: Triggers emergency banner across all active student dashboards.

---

### 6.13 System Analytics & Reports
* **Route**: `/admin/reports`
* **File**: `modules/admin/views/AdminReportsView.jsx`
* **Purpose**: Operational analytics and executive audit report generator.
* **Key Features**:
  - Ridership volume analytics, route efficiency scores, fuel utilization, and delay frequency graphs.
* **Interactive Buttons & Controls**:
  - `[Generate Monthly Audit PDF]`: Downloads executive PDF summary.
  - `[Export Raw Telemetry CSV]`: Downloads dataset spreadsheet.

---

### 6.14 Admin Settings
* **Route**: `/admin/settings`
* **File**: `modules/admin/views/AdminSettingsView.jsx`
* **Purpose**: System configuration parameters and operational rules.
* **Key Features**:
  - GPS Telemetry polling frequency slider (1s - 10s).
  - SOS auto-dispatch toggles.
  - Payment grace period settings.
* **Interactive Buttons & Controls**:
  - `[Save System Config]`: Applies global rules to system runtime.
  - `[Reset Defaults]`: Restores factory default parameters.

---

### 6.15 Admin Profile
* **Route**: `/admin/profile`
* **File**: `modules/admin/views/AdminProfileView.jsx`
* **Purpose**: Super Admin profile, credentials, and security settings.
* **Key Features**:
  - Admin name, official email, department, 2-Factor Authentication state.
* **Interactive Buttons & Controls**:
  - `[Update Profile]`: Saves updated admin info.
  - `[Enable Two-Factor Auth]`: Toggles 2FA security prompt.

---

## 7. Transport Operations Hub

### 7.1 Transport Dashboard
* **Route**: `/transport/dashboard`
* **File**: `modules/transport/views/TransportDashboardView.jsx`
* **Purpose**: Operational cockpit for transport managers handling daily vehicle dispatches and capacity balancing.
* **Key Features**:
  - Operations KPI cards (Active Buses 85, Total Corridors 34, Capacity Occupancy 78%, Unassigned Students 12).
  - Route capacity load meters.
* **Interactive Buttons & Controls**:
  - `[Assign Routes]`: Navigates to `/transport/students`.
  - `[View Fleet Status]`: Navigates to `/transport/fleet`.

---

### 7.2 Student Route Allocation Matrix
* **Route**: `/transport/students`
* **File**: `modules/transport/views/StudentTransportView.jsx`
* **Purpose**: Route assignment matrix for assigning or transferring students between bus corridors.
* **Key Features**:
  - Student list with current route assignment and pickup stop.
  - Route transfer modal with real-time seat availability check.
* **Interactive Buttons & Controls**:
  - `[Reassign Route (Row Action)]`: Opens modal to move student to a different route.
  - `[Auto-Balance Corridors]`: Automatically balances overcrowding across parallel routes.
  - `[Export Roster Excel]`: Downloads transport allocation spreadsheet.

---

### 7.3 Transport Reports
* **Route**: `/transport/reports`
* **File**: `modules/transport/views/TransportReportsView.jsx`
* **Purpose**: Transport operational metrics, mileage logs, and fuel efficiency reports.
* **Key Features**:
  - Mileage per bus, trip completion rate, passenger throughput stats.
* **Interactive Buttons & Controls**:
  - `[Generate Operational Report]`: Downloads transport summary PDF.
  - `[Export CSV]`: Exports metrics data file.

---

## 8. Finance & Billing Division

### 8.1 Finance Dashboard
* **Route**: `/finance/dashboard`
* **File**: `modules/finance/views/FinanceDashboardView.jsx`
* **Purpose**: Primary dashboard for Chief Finance Officer (CFO) and billing team.
* **Key Features**:
  - Collection KPI Widgets: Total Realization (₹42.5L), Dues Pending (₹3.6L), Offline Verification Queue (8), Refund Requests (3).
  - Recent payment transaction feed.
  - Quick Verification Banner.
* **Interactive Buttons & Controls**:
  - `[Verify Offline Payment]`: Navigates to `/finance/verification`.
  - `[Issue Refund]`: Navigates to `/finance/refunds`.
  - `[Export Fee Ledger]`: Downloads master financial Excel sheet (`.xlsx`).

---

### 8.2 Student Fee Management
* **Route**: `/finance/students`
* **File**: `modules/finance/views/FinanceStudentsFeesView.jsx`
* **Purpose**: Master fee ledger listing all student accounts and payment statuses.
* **Key Features**:
  - Student fee ledger table (Student Name, Enrollment ID, Total Fee, Paid Amount, Balance Due, Payment Status: `PAID`, `PARTIAL`, `OVERDUE`).
  - Record Manual Fee Payment modal.
* **Interactive Buttons & Controls**:
  - `[Collect Fee Payment (Row Action)]`: Opens manual payment entry modal.
  - `[Send Reminder Notice]`: Triggers email/SMS fee payment reminder to student.
  - `[View Payment History]`: Displays complete receipt history.

---

### 8.3 Fee Structure & Distance Zones
* **Route**: `/finance/fee-structure`
* **File**: `modules/finance/views/FeeStructureView.jsx`
* **Purpose**: Configuration of annual/semester transport fees based on distance zones.
* **Key Features**:
  - Zone tier breakdown:
    - **Zone A (0-5 km)**: ₹6,000 / semester
    - **Zone B (5-15 km)**: ₹9,500 / semester
    - **Zone C (15-30 km)**: ₹14,000 / semester
  - Add/Edit Fee Slab modal.
* **Interactive Buttons & Controls**:
  - `[+ Add Fee Slab]`: Creates new pricing tier.
  - `[Edit Zone Pricing (Row Action)]`: Modifies fee amount for zone.

---

### 8.4 Payments Transaction Stream
* **Route**: `/finance/payments`
* **File**: `modules/finance/views/FinancePaymentsView.jsx`
* **Purpose**: Real-time log of all incoming digital and offline payments.
* **Key Features**:
  - Comprehensive transaction table (Txn ID, Student, Amount, Gateway: UPI/Card/Challan, Date/Time, Status).
  - Gateway transaction reference lookup.
* **Interactive Buttons & Controls**:
  - `[Filter Gateway (UPI / Card / Challan)]`: Filters transaction list by payment channel.
  - `[Export Excel (.xlsx)]`: Exports complete transaction ledger.
  - `[Print Invoice (Row Action)]`: Downloads official tax invoice PDF.

---

### 8.5 Pending Fees & Defaulter Recovery
* **Route**: `/finance/pending`
* **File**: `modules/finance/views/FinancePendingFeesView.jsx`
* **Purpose**: Dedicated recovery view for accounts with overdue transport dues.
* **Key Features**:
  - Overdue student accounts list sorted by Days Past Due (>30 days, >60 days).
  - Total outstanding amount counter.
* **Interactive Buttons & Controls**:
  - `[Send Bulk SMS Reminders]`: Sends automated SMS payment link to all overdue accounts.
  - `[Block Transport Pass (Row Action)]`: Deactivates digital QR pass until dues cleared.
  - `[Export Defaulter List Excel]`: Downloads defaulter spreadsheet.

---

### 8.6 Payment Verification (Offline Bank Challans)
* **Route**: `/finance/verification`
* **File**: `modules/finance/views/PaymentVerificationView.jsx`
* **Purpose**: Verification queue for student-submitted offline bank deposit slips and challans.
* **Key Features**:
  - Queue of uploaded bank slips (Student Name, Bank Reference No, Amount, Deposit Date, Attachment Image preview).
  - Verification decision form.
* **Interactive Buttons & Controls**:
  - `[Approve Bank Slip (Row Action)]`: Validates deposit, updates student balance to `PAID`, and issues receipt.
  - `[Reject Slip with Reason]`: Rejects deposit slip with custom notification to student.
  - `[View Attachment Image]`: Opens full-screen view of uploaded bank challan slip.

---

### 8.7 Refund Requests Workflow
* **Route**: `/finance/refunds`
* **File**: `modules/finance/views/FinanceRefundsView.jsx`
* **Purpose**: Pass cancellation and fee refund processing.
* **Key Features**:
  - Refund requests table (Student, Reason: Pass Cancellation, Departure, Amount, Status: `PENDING`, `APPROVED`, `REJECTED`).
* **Interactive Buttons & Controls**:
  - `[Approve Refund (Row Action)]`: Authorizes bank refund payout.
  - `[Reject Request]`: Dismisses refund application with rationale.

---

### 8.8 Discounts & Scholarships
* **Route**: `/finance/discounts`
* **File**: `modules/finance/views/DiscountsScholarshipsView.jsx`
* **Purpose**: Administration of merit and merit-cum-means transport fee waivers.
* **Key Features**:
  - Active scholarship waivers list (Student, Waiver %, Discounted Amount, Authority Approval).
  - Apply Discount modal.
* **Interactive Buttons & Controls**:
  - `[+ Apply Discount]`: Opens modal to grant fee waiver to eligible student.
  - `[Revoke Discount (Row Action)]`: Removes scholarship adjustment.

---

### 8.9 Receipts & Invoices
* **Route**: `/finance/receipts`
* **File**: `modules/finance/views/ReceiptsInvoicesView.jsx`
* **Purpose**: Searchable index of certified GST/tax invoices and official payment receipts.
* **Key Features**:
  - Printable receipt generator with digital authorization stamp and QR verification tag.
* **Interactive Buttons & Controls**:
  - `[Generate Receipt PDF (Row Action)]`: Downloads official PDF tax receipt.
  - `[Print Receipt]`: Opens direct print dialog.
  - `[Email Receipt]`: Sends PDF invoice directly to student's email.

---

### 8.10 Financial Reports
* **Route**: `/finance/reports`
* **File**: `modules/finance/views/FinancialReportsView.jsx`
* **Purpose**: Financial revenue realization, audit reconciliation, and ledger reporting.
* **Key Features**:
  - Monthly fee realization graphs, payment channel distribution breakdown, and tax summary tables.
* **Interactive Buttons & Controls**:
  - `[Export Master Excel (.xlsx)]`: Exports formatted multi-sheet Excel financial report using `xlsx` library.
  - `[Download Revenue Report PDF]`: Downloads executive financial PDF summary.

---

### 8.11 Finance Audit Logs
* **Route**: `/finance/audit`
* **File**: `modules/finance/views/FinanceAuditLogsView.jsx`
* **Purpose**: Immutable audit trail logging all financial adjustments, fee collection actions, and verifications.
* **Key Features**:
  - Audit event table (Timestamp, Officer Name, Action Type, Target Student, Details, IP Address).
* **Interactive Buttons & Controls**:
  - `[Filter Audit Logs]`: Filters entries by operator or action type.
  - `[Export Audit Trail]`: Downloads audit log CSV file.

---

### 8.12 Finance Profile
* **Route**: `/finance/profile`
* **File**: `modules/finance/views/FinanceProfileView.jsx`
* **Purpose**: Account settings for Chief Finance Officer and authorized billing staff.
* **Key Features**:
  - Officer name, email, authorization signature upload, and security key setup.
* **Interactive Buttons & Controls**:
  - `[Save Profile]`: Updates finance officer credentials.
  - `[Update Security Key]`: Changes transaction signing key.

---

## 9. Technology Stack & File Index

### Technology Stack
- **Frontend Core**: React 19.2.7, React Router DOM 7.18.1, Vite 8.3.0
- **Excel Export Engine**: `xlsx` 0.18.5
- **Linting & Quality**: Oxlint 1.71.0
- **Backend API Server**: Node.js, Express.js 4.21.2, CORS, Dotenv
- **Database Specifications**: PostgreSQL / MySQL (DDL Schema in `database/migrations/001_initial_schema.sql`)

### Master File Map
- **Monorepo Config**: `package.json`
- **Frontend Root**: `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`
- **Frontend App Router**: `frontend/src/App.jsx`
- **Global State Context**: `frontend/src/shared/context/TransitContext.jsx`
- **Role Switcher Bar**: `frontend/src/shared/components/RoleSwitcherBar.jsx`
- **Backend Server Entry**: `backend/src/server.js`
- **Database DDL**: `database/migrations/001_initial_schema.sql`
- **Database Seeds**: `database/seeds/001_initial_seeds.sql`

---
© 2026 GLOW Campus Transit & Fleet Management System. All rights reserved.
