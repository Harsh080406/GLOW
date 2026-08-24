# 🚌 GLOW — Campus Transit & Fleet Management System

GLOW is an enterprise-grade university transit and smart fleet mobility platform designed for high-precision real-time bus tracking, encrypted RFID/QR digital passes, automated fee reconciliations, and instant safety command.

---

## 🔑 Default Login Credentials

You can log in to any of the role dashboards directly from the `/login` portal using the default email addresses below (any password e.g., `glow2026` or `admin123` is accepted):

| Role | Portal / Dashboard | Default Email ID | Default Password | Features & Scope |
|---|---|---|---|---|
| 👑 **Super Admin** | `/admin/dashboard` | `admin@glowbus.edu` | `glow2026` | Fleet-wide analytics, 8 core KPI cards, user access control, vehicle rosters & master audits. |
| 💳 **Finance Admin** | `/finance/dashboard` | `finance@glowbus.edu` | `glow2026` | Fee collections, offline bank challan verification, certified tax receipts, and Excel exports. |
| 🚌 **Bus Driver** | `/driver/dashboard` | `driver@glowbus.edu` | `glow2026` | Mobile cockpit tablet, route sequencer, passenger check-in scanner, and live GPS broadcast. |
| 🚦 **Transport Manager** | `/transport/dashboard` | `transport@glowbus.edu` | `glow2026` | Route allocation, student transfers, daily timetable dispatch, and vehicle maintenance logs. |
| 🎓 **Student** | `/student/dashboard` | `student@glowbus.edu` | `glow2026` | Live 3-sec GPS tracker, encrypted digital QR transport pass, timetable, and 24/7 SOS alert. |

> 💡 **Quick Demo Tip**: On the `/login` screen, click any of the **Quick Demo Fill** chips (`👑 Admin`, `💳 Finance`, `🚌 Driver`, `🚦 Transport`, `🎓 Student`) to automatically pre-fill the credentials with one click!

---

## 🌟 Core System Portals

### 1. 🎓 Student Mobility Portal (`/student/dashboard`)
- **Live 3-Second GPS Telemetry**: Real-time interactive map with bus location, upcoming stop ETAs, speed indicator, and traffic warnings.
- **Encrypted Digital QR Pass**: Encrypted anti-counterfeit QR pass with student ID, route allocation, and 1-click PDF download.
- **Fees & Payment Receipts**: Online UPI/Card gateway, downloadable tax invoices, and payment history.
- **Emergency & SOS Dispatch**: One-tap emergency broadcast alerting campus security and dispatch with live GPS coordinates.

### 2. 🚌 Driver Mobile Cockpit (`/driver/dashboard`)
- **Trip Telemetry Control**: Start, pause, and complete trips with automated speed logging and GPS broadcast.
- **Passenger Check-In**: High-speed camera QR scanner for sub-2-second student pass validation.
- **Route Navigator & Delays**: Step-by-step turn sequence and 1-click delay broadcast to students.

### 3. 👑 Super Admin Command Center (`/admin/dashboard`)
- **Fleet Governance**: Real-time status across 85 campus shuttles and 32 transit corridors.
- **User & Roster Management**: RBAC roles, driver assignments, and student route transfers.
- **Maintenance & Incidents**: Vehicle fitness certificates, fuel consumption metrics, and SOS logs.

### 4. 💳 Finance & Billing Division (`/finance/dashboard`)
- **Revenue Reconciliation**: Track fee realizations, pending dues, and automated payment receipts.
- **Offline Challan Verification**: Verify bank slips within 4 hours with certified audit stamps.
- **Ledger Export**: 1-click Excel (`.xlsx`) and PDF revenue reports.

### 5. 🚦 Transport Operations Hub (`/transport/dashboard`)
- **Route Optimization**: Real-time capacity balancing to prevent overcrowding.
- **Schedule Management**: Regular semester and exam special staggered shifts (09:00 AM & 02:00 PM).

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation & Run

1. **Navigate to the frontend folder**:
   ```bash
   cd glow-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:5174/](http://localhost:5174/) or [http://localhost:5173/](http://localhost:5173/) in your web browser.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🎨 Design System & Palette
- **Primary Blue**: `#0066ff` / `#1d6fe9`
- **Charcoal Dark Canvas**: `#0e131f` / `#090c12`
- **Soft Lavender / Studio**: `#c5cbe8` / `#b8c2ec`
- **Backgrounds**: `#ffffff` / `#f8fafc`
- **Text & Borders**: `#0f172a` / `#e2e8f0`
- **Clean Luxury**: High-contrast, accessibility compliant, with tactile button states and micro-animations.

---

© 2026 GLOW Campus Transit & Fleet Management System. All rights reserved.
