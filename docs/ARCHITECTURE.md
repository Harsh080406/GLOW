# GLOW Enterprise Architecture Specification (MERN Stack)

This document details the target **MERN Stack** architecture (**M**ongoDB, **E**xpress.js, **R**eact.js 19, **N**ode.js), REST API design, real-time telemetry protocols, authentication mechanisms, and responsive UI contract for the GLOW Campus Transit & Fleet Management System.

---

## 0. MERN Stack Technology Definition

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      REACT.JS 19 (SPA)                      │
 │   - Vite 8.3.0 Client Application (`frontend/`)             │
 │   - Modular Domain Views & Shared Context State             │
 └──────────────────────────────┬──────────────────────────────┘
                                │ REST / WebSockets
 ┌──────────────────────────────▼──────────────────────────────┐
 │                     EXPRESS.JS / NODE.JS                    │
 │   - REST API Controllers & Middleware (`backend/`)          │
 │   - Telemetry Stream Engine & JWT Authentication            │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Mongoose ODM
 ┌──────────────────────────────▼──────────────────────────────┐
 │                        MONGODB 7.0                          │
 │   - Document Collections (`users`, `buses`, `routes`, etc.) │
 │   - Seed JSON Data & Indexing (`database/`)                │
 └─────────────────────────────────────────────────────────────┘
```

- **M (MongoDB)**: NoSQL document store with Mongoose ODM schemas for flexible document modeling (`users`, `buses`, `routes`, `studentpasses`, `feetransactions`, `emergencyevents`, `complaints`, `maintenancerecords`, `auditlogs`).
- **E (Express.js)**: Fast, unopinionated Node.js REST API server & WebSocket gateway.
- **R (React.js)**: Modern React 19 Single Page Application bundled with Vite.
- **N (Node.js)**: High-performance asynchronous runtime environment.

---

## 1. REST Endpoints by Module

Endpoints are grouped by system module and correspond directly to the views outlined in `PROJECT_OVERVIEW.md`.

### 1.1 Public & Authentication Module
* **`POST /api/v1/auth/login`**: Standard username/password login.
* **`POST /api/v1/auth/google`**: Authenticate via Google OAuth ID token (or seeded demo account fallback).
* **`POST /api/v1/auth/refresh`**: Issue new JWT access token using HTTP-only refresh cookie.
* **`POST /api/v1/auth/logout`**: Invalidate refresh token session and clear auth cookies.
* **`GET /api/v1/auth/me`**: Get currently authenticated user profile and active role permissions.

### 1.2 Student Mobility Module
* **`GET /api/v1/student/dashboard`**: Summary KPIs (assigned bus, route info, pass validity, fees).
* **`GET /api/v1/student/my-bus`**: Detailed telemetry & specifications for assigned bus.
* **`GET /api/v1/student/my-route`**: Sequential stop-by-stop route timeline and ETAs.
* **`GET /api/v1/student/schedule`**: Semester timetable and exam shift schedules.
* **`GET /api/v1/student/pass`**: Fetch student digital transport pass metadata and signed QR payload.
* **`GET /api/v1/student/fees`**: Get student fee balance, ledger history, and pending dues.
* **`POST /api/v1/student/fees/pay`**: Process online fee payment (UPI / Card / NetBanking).
* **`POST /api/v1/student/fees/upload-challan`**: Upload offline bank deposit slip image for manual verification.
* **`GET /api/v1/student/notifications`**: Get student transit notifications and alert history.
* **`PATCH /api/v1/student/notifications/read-all`**: Mark all student notifications as read.
* **`GET /api/v1/student/complaints`**: Get complaint tickets submitted by student.
* **`POST /api/v1/student/complaints`**: Submit new complaint ticket.
* **`GET /api/v1/student/profile`**: Get current student profile details.
* **`PUT /api/v1/student/profile`**: Update student profile and emergency contact details.

### 1.3 Driver Mobile Cockpit Module
* **`GET /api/v1/driver/dashboard`**: Fetch driver roster status, assigned vehicle, and active trip telemetry.
* **`POST /api/v1/driver/trip/start`**: Start scheduled route trip (sets status to `ON_ROUTE`).
* **`POST /api/v1/driver/trip/pause`**: Pause active trip (rest stop or congestion).
* **`POST /api/v1/driver/trip/complete`**: Complete trip and reset occupancy counters.
* **`POST /api/v1/driver/scan-pass`**: Validate student QR pass code in sub-2-second scan pipeline.
* **`POST /api/v1/driver/broadcast-delay`**: Push route delay broadcast (5m, 10m, 15m) to subscribed commuters.

### 1.4 Super Admin Command Center
* **`GET /api/v1/admin/dashboard`**: Super admin executive KPIs, active emergency banner, and dispatches.
* **`GET /api/v1/admin/users`**: List all system users and RBAC roles.
* **`POST /api/v1/admin/users`**: Create new system staff user.
* **`PATCH /api/v1/admin/users/:id/role`**: Modify access permissions or revoke user access.
* **`GET /api/v1/admin/students`**: Query student roster with pagination, search, and fee filter.
* **`POST /api/v1/admin/students`**: Add new student commuter record.
* **`PUT /api/v1/admin/students/:id`**: Update student details or route assignment.
* **`DELETE /api/v1/admin/students/:id`**: Remove student record.
* **`GET /api/v1/admin/fleet`**: Fetch full vehicle inventory, fitness status, and fuel levels.
* **`POST /api/v1/admin/fleet`**: Add new bus shuttle to fleet.
* **`PUT /api/v1/admin/fleet/:id`**: Update vehicle status or driver assignment.
* **`GET /api/v1/admin/drivers`**: List licensed driver roster and safety scores.
* **`POST /api/v1/admin/drivers`**: Register new driver account.
* **`GET /api/v1/admin/routes`**: List transit corridors and stop sequences.
* **`POST /api/v1/admin/routes`**: Create new transit corridor.
* **`PUT /api/v1/admin/routes/:id`**: Update route stops or distance parameters.
* **`GET /api/v1/admin/schedules`**: Get master dispatch schedules.
* **`POST /api/v1/admin/schedules`**: Create new schedule slot.
* **`GET /api/v1/admin/maintenance`**: Fetch vehicle repair and overhaul tickets.
* **`POST /api/v1/admin/maintenance`**: Log new vehicle maintenance ticket.
* **`GET /api/v1/admin/complaints`**: Admin complaints resolution queue.
* **`PATCH /api/v1/admin/complaints/:id/resolve`**: Resolve student/driver complaint ticket.
* **`GET /api/v1/admin/emergencies`**: View incident logs and active SOS events.
* **`PATCH /api/v1/admin/emergencies/:id/status`**: Dispatch security or resolve emergency event.
* **`GET /api/v1/admin/reports`**: System-wide analytics and audit statistics.
* **`GET /api/v1/admin/settings`**: System parameters (telemetry frequency, auto-dispatch rules).
* **`PUT /api/v1/admin/settings`**: Update system configuration rules.

### 1.5 Transport Operations Module
* **`GET /api/v1/transport/dashboard`**: Operation KPIs, fleet availability, and corridor capacity.
* **`POST /api/v1/transport/students/reassign`**: Transfer student from one bus corridor to another.
* **`POST /api/v1/transport/routes/auto-balance`**: Auto-balance overcrowding across parallel corridors.
* **`GET /api/v1/transport/reports`**: Vehicle mileage, fuel efficiency, and trip completion stats.

### 1.6 Finance & Billing Module
* **`GET /api/v1/finance/dashboard`**: Financial collection widgets, pending dues summary, and recent sales stream.
* **`GET /api/v1/finance/students`**: Searchable student fee balance ledger.
* **`GET /api/v1/finance/fee-structures`**: Get distance zone fee slabs (Zone A, Zone B, Zone C).
* **`POST /api/v1/finance/fee-structures`**: Create or edit zone fee slab pricing.
* **`GET /api/v1/finance/payments`**: List incoming payment transactions with gateway filters.
* **`GET /api/v1/finance/pending`**: List overdue defaulter accounts.
* **`POST /api/v1/finance/pending/send-reminders`**: Trigger bulk SMS/email reminders to defaulter accounts.
* **`GET /api/v1/finance/verification`**: Offline bank deposit slip verification queue.
* **`POST /api/v1/finance/verification/:id/approve`**: Approve bank slip and mark student dues as paid.
* **`POST /api/v1/finance/verification/:id/reject`**: Reject deposit slip with reason.
* **`GET /api/v1/finance/refunds`**: Fetch pass cancellation refund applications.
* **`POST /api/v1/finance/refunds/:id/process`**: Approve or reject refund payout.
* **`GET /api/v1/finance/discounts`**: Merit and fee waiver list.
* **`POST /api/v1/finance/discounts`**: Apply fee discount waiver to student.
* **`GET /api/v1/finance/receipts`**: Certified GST invoices index.
* **`GET /api/v1/finance/receipts/:id/pdf`**: Download certified PDF tax receipt.
* **`GET /api/v1/finance/reports`**: Revenue realization and reconciliation analytics.
* **`GET /api/v1/finance/audit`**: Financial transaction audit logs.

---

## 2. Request & Response JSON Shapes

Below are exemplar JSON payloads for core endpoints across all modules.

### `POST /api/v1/auth/login`
```json
// Request
{
  "email": "student@glowbus.edu",
  "password": "glow2026"
}

// Response (200 OK)
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "UNI20260125",
    "name": "Rahul Sharma",
    "email": "student@glowbus.edu",
    "role": "student",
    "avatar": "RS"
  }
}
```

### `POST /api/v1/auth/google`
```json
// Request
{
  "idToken": "google_oauth_token_string",
  "demoAccountEmail": "admin@glowbus.edu" // Optional fallback for local dev
}

// Response (200 OK)
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "ADM-2026-001",
    "name": "Dr. Arvind Patel",
    "email": "admin@glowbus.edu",
    "role": "super_admin",
    "avatar": "AP"
  }
}
```

### `GET /api/v1/student/dashboard`
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "student": {
      "id": "UNI20260125",
      "name": "Rahul Sharma",
      "busId": "BUS-104",
      "routeName": "University → Chandkheda",
      "pickupStop": "Chandkheda Bus Stop",
      "pickupTime": "07:45 AM",
      "passStatus": "ACTIVE",
      "feeStatus": "PARTIAL",
      "pendingFee": 5000
    },
    "telemetry": {
      "busId": "BUS-104",
      "speed": 42,
      "etaMinutes": 6,
      "currentLocation": "Near Motera Crossroads"
    }
  }
}
```

### `POST /api/v1/driver/scan-pass`
```json
// Request
{
  "qrPayload": "PASS-STU-2026-0125|UNI20260125|R-04|SIG_HASH_982",
  "busId": "BUS-104"
}

// Response (200 OK)
{
  "valid": true,
  "student": {
    "id": "UNI20260125",
    "name": "Rahul Sharma",
    "photoUrl": "/assets/student-portrait.jpg",
    "passStatus": "ACTIVE",
    "routeMatch": true
  },
  "timestamp": "2026-09-20T11:45:00.000Z"
}
```

### `POST /api/v1/student/fees/pay`
```json
// Request
{
  "amount": 5000,
  "paymentMethod": "UPI",
  "refNo": "UPI/99812490/AXIS"
}

// Response (200 OK)
{
  "success": true,
  "transaction": {
    "id": "TXN-98415",
    "amount": 5000,
    "method": "UPI",
    "refNo": "UPI/99812490/AXIS",
    "status": "COMPLETED",
    "receiptId": "REC-2026-8915",
    "date": "2026-09-20"
  },
  "updatedPendingFee": 0,
  "feeStatus": "PAID"
}
```

### `POST /api/v1/emergencies/sos` (WebSocket / REST)
```json
// Request
{
  "reportedBy": "UNI20260125",
  "role": "student",
  "busId": "BUS-104",
  "eventType": "SOS Emergency",
  "location": "Near Motera Crossroads",
  "coordinates": { "lat": 23.0982, "lng": 72.5784 },
  "notes": "Panic button triggered from mobile web app"
}

// Response (201 Created)
{
  "success": true,
  "incident": {
    "id": "EMG-2026-99",
    "status": "ACTIVE",
    "timestamp": "2026-09-20T11:46:10.000Z",
    "securityDispatched": true
  }
}
```

---

## 3. Real-Time (WebSocket/SSE) vs. REST Classification

To ensure sub-second responsiveness without polling overhead, real-time channels are specified for streaming telemetry, emergency broadcasts, and delay notices:

```
                          ┌───────────────────────────┐
                          │    REST HTTP API          │
                          │ (Crud & Auth Operations)  │
                          └─────────────┬─────────────┘
                                        │
┌───────────────────────────────────────┴───────────────────────────────────────┐
│                                                                               │
▼                                                                               ▼
Real-Time Event Engine (WebSocket / SSE)                       Standard REST Endpoints
────────────────────────────────────────                      ───────────────────────
1. Live Bus GPS Telemetry Stream                              1. User & Student Roster CRUD
   - Bus coordinates (lat, lng), speed, heading, ETA          2. Fee Payments & Bank Challan Uploads
   - Channel: ws://api.glowbus.edu/v1/ws/telemetry           3. Route Configuration & Stop Sequences
                                                              4. Service Complaints & Maintenance Logs
2. High-Priority SOS Emergency Broadcast                      5. Master Timetables & Schedules
   - Student & Driver SOS alerts with live location            6. PDF Receipt Generation & Audit Logs
   - Channel: ws://api.glowbus.edu/v1/ws/sos

3. Driver Trip Delay Broadcasts
   - Route delay alerts (5m, 10m, 15m) pushed to commuters
   - Channel: ws://api.glowbus.edu/v1/ws/delays
```

* **Live GPS Telemetry**: Updated every **3 seconds** over WebSocket stream `ws://api.glowbus.edu/v1/ws/telemetry`.
* **SOS Emergency Alerts**: Instant bidirectional push over `ws://api.glowbus.edu/v1/ws/sos` alerting Super Admin Command (`/admin/emergencies`) and Transport Hub (`/transport/emergencies`).
* **Delay Notices**: Event-driven broadcast over `ws://api.glowbus.edu/v1/ws/delays` notifying subscribed commuters on the affected route.

---

## 4. Authentication Strategy & Role-Based Access Control

### 4.1 JWT Access + Refresh Token Tokenology
- **Access Token**: Short-lived JWT (15-minute expiration) sent in `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived token (7-day expiration) stored in an `HttpOnly`, `SameSite=Strict`, `Secure` cookie (`/api/v1/auth/refresh`).
- **JWT Payload Schema**:
```json
{
  "sub": "u-001",
  "email": "admin@glowbus.edu",
  "role": "super_admin", // "student" | "driver" | "super_admin" | "transport_manager" | "finance_admin"
  "name": "Dr. Arvind Patel",
  "iat": 1758368800,
  "exp": 1758369700
}
```

### 4.2 Google OAuth 2.0 Integration & Seeded Demo Fallback
1. **Production Google OAuth Flow**:
   - Frontend initiates Google Sign-In SDK prompt (`@react-oauth/google`).
   - Receives Google `idToken` and posts to `/api/v1/auth/google`.
   - Backend verifies token with Google OAuth Client (`google-auth-library`), matches user email against `users` table, and issues GLOW JWT access token.
2. **Seeded Local Dev Fallback**:
   - The existing Google SSO Modal (`LoginPageView.jsx`) displays pre-seeded profile cards (`Rahul Sharma`, `Dr. Arvind Patel`, `CMA Rajesh Dave`, `Mahesh Patel`).
   - Clicking a demo card passes `demoAccountEmail` to `/api/v1/auth/google`, allowing developers and offline reviewers to test all 5 roles seamlessly without needing live Google API keys.

---

## 5. Responsive Design Contract & Device Scoping

GLOW enforces a strict responsive design contract across three device viewport tiers:

| Viewport Tier | Breakpoint Width | Primary Layout Strategy | Core Modules & Primary Focus |
|---|---|---|---|
| **Mobile** | `< 640px` | Single column, sticky bottom navigation bar, card stacks | **Mobile-First**: Student Mobility Portal (`/student/*`), Driver Mobile Cockpit (`/driver/*`) |
| **Tablet** | `640px – 1024px` | Collapsible sidebar, 2-column KPI grid, responsive tables | **Adaptive Hybrid**: All portals must adapt smoothly to tablet touchscreens |
| **Desktop** | `> 1024px` | Fixed sidebar, multi-column dashboard grid, full data tables | **Desktop-First**: Super Admin Command (`/admin/*`), Finance & Billing (`/finance/*`), Transport Hub (`/transport/*`) |

### Module-Specific Layout Enforcement
1. **Student Mobility Portal (`/student/*`)**: Mobile-first design optimized for smartphone usage at bus stops. Includes quick-touch SOS buttons, responsive maps, and digital QR pass cards.
2. **Driver Mobile Cockpit (`/driver/*`)**: Mobile/Tablet-first touch layout optimized for bus dashboard mount tablets. Features large 48px+ tap targets, high-speed camera scanner modal, and trip telemetry buttons.
3. **Super Admin, Finance, & Transport Hub (`/admin/*`, `/finance/*`, `/transport/*`)**: Desktop-first layout optimized for multi-monitor command centers with high-density data tables, side-by-side SVG maps, and audit logs. Adapts to tablet viewports via collapsible sidebars and scrollable data tables.

---
