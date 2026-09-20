# GLOW — From UI-Only to Fully Functional
## A Step-by-Step Implementation Prompt Playbook

> **Context**: GLOW currently exists as a React 19 + Vite frontend SPA with static/mock data (`TransitContext.jsx`), a stubbed Express backend, and an unwired SQL DDL schema. This playbook turns it into a real, working, mobile-friendly product built **entirely on the MERN stack — MongoDB, Express.js, React, Node.js.** No SQL database, no Prisma/Sequelize/Knex, no ORMs for relational DBs anywhere in this project. All persistence goes through **Mongoose** models against **MongoDB**.
>
> **How to use this file**: Each phase below is a self-contained **prompt** you paste into your AI coding assistant (Claude Code, Cursor, etc.), one at a time, in order. Each prompt references the exact files/routes named in `PROJECT_OVERVIEW.md` so the assistant edits the real codebase instead of inventing a new one. Run and test after every phase before moving to the next — don't batch phases together, or you'll get a huge diff you can't debug.
>
> **Stack lock — paste this line at the top of every single prompt session with your AI assistant, every phase, no exceptions:**
> `"This project is MERN stack only: MongoDB + Mongoose for all data, Express.js for the API, React for the frontend, Node.js runtime. Do not introduce PostgreSQL, MySQL, SQLite, Prisma, Sequelize, Knex, TypeORM, or any SQL database or SQL-oriented ORM anywhere in this codebase, even as an option. If a task seems to need a relational join, model it as embedded documents or referenced ObjectIds in Mongoose instead."`
>
> **Golden rule for every prompt**: paste in the relevant section(s) of `PROJECT_OVERVIEW.md` alongside the prompt text, so the assistant has the exact routes, file names, and button/control list to implement against.

---

## Phase 0 — Lock the Architecture Before Writing Code

```
Read frontend/src/App.jsx, frontend/src/shared/context/TransitContext.jsx,
and backend/src/server.js in full. This project is MERN stack only —
MongoDB + Mongoose, Express, React, Node — so treat any existing SQL schema
files as reference-only for field names, not as the actual data layer.

Produce a short ARCHITECTURE.md that documents:
1. Every REST endpoint we will need, grouped by module (public/auth, student,
   driver, admin, transport, finance), matching the routes listed in
   PROJECT_OVERVIEW.md.
2. The request/response JSON shape for each endpoint.
3. Which endpoints need to be real-time (WebSocket/SSE) vs plain REST —
   specifically live bus GPS telemetry, SOS alerts, and delay broadcasts.
4. Auth strategy: JWT access + refresh token flow, role claim in the token
   (student/driver/super_admin/transport_admin/finance_admin), and how the
   existing "Google SSO" demo modal will be replaced by real Google OAuth
   while keeping a seeded-demo-account fallback for local dev.
5. A responsive design contract: breakpoints (mobile <640px, tablet 640–1024px,
   desktop >1024px), and which modules are mobile-first by nature (Student
   Portal, Driver Cockpit) vs desktop-first (Admin, Finance, Transport Ops)
   but must still be usable on a tablet.

Do not write implementation code yet — output only the architecture doc and
wait for my confirmation.
```

---

## Phase 1 — Database: MongoDB + Mongoose Models, Seeded

```
This project uses MongoDB with Mongoose — no SQL, no DDL migrations.
Delete/ignore any database/migrations/*.sql or database/seeds/*.sql files
from the old design; replace them entirely with a Mongoose-based data layer
under backend/src/models/ and backend/src/seed/.

1. Create a Mongoose model per collection needed by TransitContext.jsx and
   PROJECT_OVERVIEW.md:
   - User (base auth fields: email, passwordHash, role enum
     ['student','driver','super_admin','transport_admin','finance_admin'],
     googleId, refreshTokenHash)
   - Student (ref User, enrollmentId, branch, semester, assignedStopId,
     routeId ref Route, guardianContact)
   - Driver (ref User, licenseNumber, assignedBusId ref Bus, shiftTiming,
     safetyRating)
   - Bus (registrationNumber, capacity, occupancy, fuelLevel, status enum
     ['On Route','Maintenance','Idle'], fitnessCertExpiry, currentDriverId)
   - Route (name, origin, destination, distanceKm, durationMin, stops: an
     embedded array of {name, lat, lng, orderIndex, etaOffsetMin} — embed
     stops directly in the Route document rather than a separate collection,
     since they're always read together)
   - Trip (busId, driverId, routeId, status enum
     ['NOT_STARTED','ON_ROUTE','PAUSED','COMPLETED'], startedAt, completedAt,
     occupancySnapshot)
   - TransportPass (studentId, routeId, zone enum ['A','B','C'], status enum
     ['ACTIVE','EXPIRED','PENDING_FEE','BLOCKED'], validUntil, signedPayload)
   - FeeLedger (studentId, zone, totalFee, paidAmount, balanceDue, status enum
     ['PAID','PARTIAL','OVERDUE'], dueDate)
   - Payment (studentId, amount, gateway enum ['UPI','Card','NetBanking',
     'Challan'], status, txnRef, attachmentUrl, verifiedBy)
   - FeeSlab (zone, amount, semester)
   - Discount (studentId, waiverPercent, discountedAmount, approvedBy, status)
   - Refund (studentId, reason, amount, status enum
     ['PENDING','APPROVED','REJECTED'])
   - Complaint (studentId or driverId, category, description, priority enum
     ['HIGH','MEDIUM','LOW'], status enum ['PENDING','IN_REVIEW','RESOLVED'],
     department, resolutionNotes)
   - Notification (userId, type, message, read: Boolean, createdAt)
   - SosAlert (raisedBy ref User, role, lat, lng, status enum
     ['ACTIVE','DISPATCHED','RESOLVED'], resolvedNotes)
   - MaintenanceLog (busId, serviceType, cost, vendor, status)
   - AuditLog (actorId, actionType, targetCollection, targetId, details, ip,
     timestamp)
   Use Mongoose `ref` + `.populate()` for cross-collection lookups (this is
   the Mongoose equivalent of a SQL join) — e.g. populating a Trip's busId
   and driverId when the driver cockpit loads.
2. Add indexes via `schema.index(...)` on frequently queried fields:
   Student.routeId, Payment.studentId, FeeLedger.status, SosAlert.status,
   Trip.status, Notification.userId + read.
3. Create backend/src/db/connect.js that connects with
   `mongoose.connect(process.env.MONGODB_URI)`, with sensible connection
   pool/retry options, and is imported once from server.js.
4. Create backend/src/seed/seed.js (run via `npm run db:seed`) that wipes and
   re-populates the database matching the numbers referenced in the UI:
   85 buses, 34 routes, 4,250 students, 92 drivers, fee zones A/B/C exactly as
   priced in PROJECT_OVERVIEW.md (₹6,000 / ₹9,500 / ₹14,000 per semester),
   plus the four named demo accounts used in the Google SSO modal
   (Rahul Sharma - student, Dr. Arvind Patel - super admin,
   CMA Rajesh Dave - finance admin, Mahesh Patel - driver) with real
   bcrypt-hashed passwords.
5. Add a `.env.example` with MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET,
   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.

Confirm `npm run db:seed` runs cleanly against a local MongoDB instance (or
MongoDB Atlas) before continuing. Do not add any SQL database driver
(pg, mysql2, etc.) to package.json.
```

---

## Phase 2 — Backend API Foundation

```
In backend/src/server.js and a new backend/src/ directory structure
(routes/, controllers/, middleware/, services/, db/), build:

1. Express app with CORS restricted to the frontend origin, helmet for
   security headers, and a global error-handling middleware that returns
   consistent JSON error shapes { error: { code, message } }.
2. Import and call `db/connect.js` from Phase 1 (Mongoose connection to
   MONGODB_URI) on startup, and refuse to start the server if the initial
   connection fails.
3. `middleware/auth.js`: verifies the JWT from the Authorization header,
   attaches `req.user = { id, role }`.
4. `middleware/requireRole.js`: a factory `requireRole('super_admin', 'transport_admin')`
   that 403s if the user's role isn't in the allowed list — this is what will
   gate every admin/finance/transport route.
5. Rate limiting on all /auth/* endpoints and the SOS endpoint.
6. A health-check route GET /api/health.

Wire this server to actually start with `npm run dev` in the backend
workspace and log the port. Do not build feature routes yet.
```

---

## Phase 3 — Real Authentication (Replace the Mock Login)

```
Rewrite modules/public/views/LoginPageView.jsx's submit handler and build
backend/src/routes/auth.js to support:

1. POST /api/auth/login — validate email+password against the Mongoose
   `User` model (bcrypt compare against passwordHash), return
   { accessToken, refreshToken, user: { id, role, name } }.
2. POST /api/auth/refresh — rotate the refresh token, storing the current
   refreshTokenHash on the User document (or a separate RefreshToken
   collection if you want multi-device support).
3. POST /api/auth/logout — invalidate the refresh token by clearing/rotating
   refreshTokenHash on the User document.
4. Real Google OAuth 2.0 (authorization code flow) behind GET /api/auth/google
   and GET /api/auth/google/callback, using GOOGLE_CLIENT_ID/SECRET. On first
   login, auto-provision a user row if the email matches a pre-approved
   domain/list; otherwise reject with a clear "not a registered campus
   account" error.
5. Keep the existing "smart keyword auto-routing" (admin/driver/finance/
   transport/student in the username) ONLY as a local-dev convenience flag
   behind `if (import.meta.env.DEV)`; production login must route purely by
   the role returned from the server, never by guessing from the typed text.
6. Update the "Google Account Chooser Modal" so its four demo profile cards
   call the real /api/auth/google flow in dev mode with pre-seeded demo
   accounts, instead of hard-coding a fake login.
7. On the frontend, store tokens in memory + an httpOnly refresh cookie (not
   localStorage), add an axios/fetch interceptor that attaches the access
   token and retries once on 401 after refreshing.
8. Add React Router route guards (ProtectedRoute component) that redirect to
   /login if unauthenticated, and to a 403 page if the role doesn't match the
   route's required role, covering every /student/*, /driver/*, /admin/*,
   /transport/*, /finance/* route listed in PROJECT_OVERVIEW.md.

Also make the login form and Google SSO modal fully usable on a 375px-wide
mobile viewport: stack the dual-panel layout into a single column on mobile,
make the modal a bottom sheet on small screens instead of a centered dialog,
and ensure tap targets on the profile cards are at least 44px tall.
```

---

## Phase 4 — Replace Mock Global State with Live Data + WebSockets

```
Refactor frontend/src/shared/context/TransitContext.jsx so it no longer holds
hardcoded mock arrays for buses, routes, students, passes, fee ledger, and SOS
alerts. Instead:

1. On mount (per authenticated role), fetch the role-scoped initial dataset
   from the backend (e.g. a student only fetches their own bus/route/pass/fees;
   an admin fetches fleet-wide summaries) via React Query or SWR, with loading
   and error states.
2. Open a single WebSocket connection (backend/src/ws/index.js using `ws` or
   Socket.IO) authenticated with the JWT, subscribed to channels:
   `bus:{busId}:telemetry`, `sos:alerts`, `notifications:{userId}`,
   `trip:{tripId}:status`.
3. Build a backend GPS telemetry simulator service
   (backend/src/services/telemetrySimulator.js) that moves each of the 85
   buses along its seeded route's stop coordinates and broadcasts a position
   update every 3 seconds over the `bus:{busId}:telemetry` channel — this
   replaces the "3-second GPS updates" currently faked in the UI.
4. Update every consumer of TransitContext (student dashboard mini-map, my-bus
   telemetry, live tracking view, driver cockpit telemetry card, admin fleet
   map, admin tracking console) to read from this live context instead of
   static mock values, keeping their existing visual components untouched.
5. Add reconnection-with-backoff logic and an offline banner component shown
   across the app (especially useful on mobile, on flaky campus wifi/cellular)
   when the WebSocket drops.
```

---

## Phase 5 — Student Mobility Portal (wire every screen)

```
For each of the following StudentX views, replace mock data/handlers with
real API calls to new backend/src/routes/student.js endpoints, and keep every
button listed in PROJECT_OVERVIEW.md functional end-to-end:

- StudentDashboardView.jsx: GET /api/student/me/summary (assigned bus, route,
  pass status, next pickup ETA).
- StudentMyBusView.jsx: GET /api/student/me/bus (vehicle spec, driver profile,
  live speed/AC/fuel from the telemetry channel). Wire [Call Driver Button] to
  a real `tel:` link using the driver's stored phone number.
- StudentMyRouteView.jsx: GET /api/student/me/route/stops. Implement
  [Set Stop Notification] as a real subscription row in a
  `stop_notifications` table that the backend checks before pushing a
  push/SMS reminder. Implement [Download Route Map PDF] using a PDF
  generation library (e.g. pdf-lib) server-side, returning a real file.
- StudentScheduleView.jsx: GET /api/student/me/schedule?type=regular|exam.
  Wire [Download Timetable PDF] to a real generated PDF.
- LiveTrackingView.jsx: subscribe to the student's bus WebSocket channel;
  [Recenter Map], [Select Bus Pill], [Toggle Traffic Layer] all operate on
  real state, not mock coordinates.
- StudentTransportPassView.jsx: GET /api/student/me/pass returns an encrypted
  payload (HMAC-signed JSON containing student id + route + expiry) rendered
  as a real QR code (use `qrcode` npm package). [Download Pass PDF] and
  [Print Pass] must render this real QR, not a placeholder image.
- StudentFeesView.jsx: GET /api/student/me/fees + POST /api/student/me/pay
  (simulate UPI/Card/NetBanking gateway — return a mock-but-real success/
  failure with a generated transaction id, write a row to `payments`), and
  POST /api/student/me/challan-upload (multipart file upload, stored in
  backend/uploads or S3-compatible storage, creates a `payments` row with
  status PENDING_VERIFICATION for the Finance module to review).
- NotificationsView.jsx: GET /api/student/me/notifications,
  PATCH /api/student/me/notifications/read-all,
  DELETE /api/student/me/notifications/:id — plus real-time push via the
  `notifications:{userId}` WebSocket channel.
- StudentComplaintsView.jsx: POST /api/student/me/complaints,
  GET /api/student/me/complaints (with status timeline).
- StudentEmergencyView.jsx: POST /api/student/me/sos with live geolocation
  (navigator.geolocation, with a graceful fallback if permission is denied)
  — this must appear instantly in the Admin Emergency & SOS Control Room via
  the `sos:alerts` WebSocket channel. Implement [Cancel False Alarm] as a
  PATCH that also broadcasts the cancellation.
- StudentProfileView.jsx: GET/PATCH /api/student/me/profile,
  POST /api/student/me/change-password.

Mobile requirement for this whole phase: every one of these views must work
one-handed on a phone — bottom-anchor the primary action button (Pay Dues,
Trigger SOS, Scan-adjacent flows), make tables convert to stacked cards below
640px, and ensure the SOS trigger button is reachable by thumb without
scrolling on a standard 375×667 viewport.
```

---

## Phase 6 — Driver Mobile Cockpit (tablet-first, must also work on phone)

```
Wire DriverDashboardView.jsx to backend/src/routes/driver.js:

- [START TRIP] -> POST /api/driver/me/trip/start (creates a `trips` row,
  status ON_ROUTE, starts this driver's bus broadcasting real telemetry).
- [PAUSE TRIP] -> PATCH /api/driver/me/trip/:id/pause.
- [COMPLETE TRIP] -> PATCH /api/driver/me/trip/:id/complete (archives metrics,
  resets occupancy counter to 0).
- [📷 Scan Passenger QR Pass] -> integrate a real camera-based QR scanner
  (e.g. `@zxing/browser` or `html5-qrcode`), decode the pass payload, call
  POST /api/driver/me/validate-pass with the decoded token; backend verifies
  the HMAC signature and pass status (ACTIVE/EXPIRED/PENDING_FEE) and must
  respond in under 2 seconds — add a p95 latency check for this endpoint.
- [Validate Manual Student ID] -> same validation endpoint, keyed by
  enrollment ID instead of QR payload, as the stated fallback.
- [📢 Broadcast Delay Notice] -> POST /api/driver/me/trip/:id/delay with
  {minutes: 5|10|15}; fan this out over the `notifications:{userId}` channel
  to every student on that route's roster.
- [🚨 DRIVER SOS EMERGENCY] -> POST /api/driver/me/sos, same real-time path
  into the Admin SOS Control Room as the student SOS flow in Phase 5.

Since this interface is described as tablet-optimized but drivers may also
use a phone mount: build the layout mobile-first with a single-column stack
on <768px (speed gauge, trip card, then action buttons), and a two-column
layout ≥768px. Make the [📷 Scan] button and the SOS button large fixed
touch targets (minimum 56px) since they're used while driving/stopped in
traffic — this is a safety requirement, not just style.
```

---

## Phase 7 — Super Admin Command Center

```
Wire every AdminXView.jsx listed under section 6 of PROJECT_OVERVIEW.md to
backend/src/routes/admin.js, gated by requireRole('super_admin'):

- AdminDashboardView.jsx: GET /api/admin/kpis returning the 8 KPI numbers
  live from the DB (not hardcoded 4,250/85/92/34/28/pending-fees/6/12), plus
  GET /api/admin/activity-log and GET /api/admin/dispatches/today.
- AdminUserManagementView.jsx: full CRUD on /api/admin/users, including
  [+ Add System User], [Edit Permissions], [Revoke/Suspend Access].
- ManageStudentsView.jsx: full CRUD on /api/admin/students, with server-side
  search/filter/pagination (not client-side filtering of a full mock array —
  4,250 rows must not all ship to the browser at once), and
  [Export Students Excel] generating a real .xlsx with the `xlsx` library.
- ManageFleetView.jsx: full CRUD on /api/admin/fleet, including fitness
  certificate expiry tracking (a scheduled job flags buses within 30 days of
  expiry).
- ManageDriversView.jsx: full CRUD on /api/admin/drivers, [Assign Vehicle]
  updates the Driver.assignedBusId / Bus.currentDriverId references inside a
  Mongoose session/transaction (prevent double-assigning one driver to two
  active buses — MongoDB transactions require a replica set, so document this
  requirement in the README for local dev setup).
- ManageRoutesView.jsx: full CRUD on /api/admin/routes, editing the embedded
  `stops` array directly on the Route document, with the stop-sequence
  reordering list persisting each stop's `orderIndex` field.
- AdminSchedulesView.jsx: CRUD on schedule slots, [Publish Timetable] flips a
  `published` flag that the Student Schedule view reads.
- AdminTrackingView.jsx: subscribes to all 85 bus telemetry channels at once
  — this is the heaviest real-time view; batch/throttle re-renders (e.g.
  requestAnimationFrame-batched marker updates) so it stays performant.
- AdminFinanceOverviewView.jsx: GET /api/admin/finance/summary.
- AdminMaintenanceView.jsx: full CRUD on /api/admin/maintenance.
- AdminComplaintsView.jsx: resolution workflow, [Assign to Department] sets a
  `department` enum column.
- AdminEmergenciesView.jsx: this is the receiving end of Phases 5 & 6's SOS
  broadcasts — render the live `sos:alerts` feed, [Dispatch Security Team]
  and [Resolve Emergency] as PATCH endpoints, [Broadcast Campus Alert] fans a
  message out to every connected student's `notifications:{userId}` channel.
- AdminReportsView.jsx: analytics endpoints aggregating trips/routes/telemetry
  history — precompute daily rollups in a scheduled job rather than
  aggregating raw telemetry on every request.
- AdminSettingsView.jsx: persist GPS polling frequency, SOS auto-dispatch
  toggle, and payment grace period to a single `SystemConfig` document
  (Mongoose singleton pattern) that the telemetry simulator and payment
  logic actually read at runtime.
- AdminProfileView.jsx: profile update + real TOTP-based 2FA enrollment
  (e.g. `otplib`), not just a UI toggle.

Mobile requirement: Admin is desktop-first, but every table view needs a
responsive fallback — collapse wide tables to a card list below 768px,
and keep the AdminTrackingView map usable (pinch-zoom, single-finger pan)
on a tablet for on-the-move supervisors.
```

---

## Phase 8 — Transport Operations Hub

```
Wire TransportDashboardView.jsx, StudentTransportView.jsx, and
TransportReportsView.jsx to backend/src/routes/transport.js, gated by
requireRole('transport_admin', 'super_admin'):

- Live KPI cards computed from real route/bus occupancy data.
- [Reassign Route] with a transactional seat-availability check (reject if
  the target route is at capacity).
- [Auto-Balance Corridors]: implement a real (even if simple greedy) load
  -balancing algorithm that moves students from over-capacity routes to
  under-capacity parallel routes serving overlapping stops, and returns a
  diff/preview before committing.
- [Export Roster Excel] and transport reports as real generated files.

Mobile: this hub is used by managers walking the depot — make the route
capacity load meters and KPI cards readable and the primary actions
reachable on a phone in portrait mode.
```

---

## Phase 9 — Finance & Billing Division

```
Wire every FinanceXView.jsx from section 8 to backend/src/routes/finance.js,
gated by requireRole('finance_admin', 'super_admin'):

- FinanceDashboardView.jsx: live KPI widgets from real aggregates (Total
  Realization, Dues Pending, Offline Verification Queue count, Refund
  Requests count).
- FinanceStudentsFeesView.jsx: [Collect Fee Payment] modal writes a real
  `payments` row and updates `fee_ledger` balance; [Send Reminder Notice]
  triggers an email/SMS via a provider abstraction (stub the actual
  send in dev, but make the interface real so swapping in Twilio/SendGrid
  later is a one-line config change).
- FeeStructureView.jsx: CRUD on `fee_slabs`, and make StudentFeesView (Phase
  5) actually compute dues from these live slabs by the student's zone,
  not a hardcoded number.
- FinancePaymentsView.jsx: real transaction stream with gateway filter,
  [Export Excel] and [Print Invoice] generating real files.
- FinancePendingFeesView.jsx: real days-past-due calculation from
  `fee_ledger.due_date`, [Send Bulk SMS Reminders] batches the same
  provider abstraction as above, [Block Transport Pass] flips the pass
  status to a blocked state that Phase 5/6's pass validation endpoint
  actually respects (a blocked pass must fail scanning).
- PaymentVerificationView.jsx: this is the receiving end of Phase 5's
  challan upload — render the real uploaded attachment image,
  [Approve Bank Slip] transactionally updates the ledger and issues a
  receipt row, [Reject Slip with Reason] notifies the student.
- FinanceRefundsView.jsx / DiscountsScholarshipsView.jsx: real approval
  workflows writing to `refunds` / `discounts` tables and recomputing the
  student's balance.
- ReceiptsInvoicesView.jsx: server-generated PDF receipts with a QR
  verification tag (reuse the QR approach from Phase 5's pass), plus
  [Email Receipt] via the provider abstraction.
- FinancialReportsView.jsx: [Export Master Excel] as a real multi-sheet
  workbook (Revenue, By-Channel, Tax Summary sheets) using the `xlsx`
  library, matching what's described in PROJECT_OVERVIEW.md.
- FinanceAuditLogsView.jsx: every mutating action above must write an
  `audit_logs` row (actor, action type, target, timestamp, IP) — implement
  this as a single Express middleware rather than repeating it per route.
- FinanceProfileView.jsx: profile + signing-key rotation.

Mobile: Finance is desktop-first for data entry, but make the read-only
views (dashboard KPIs, payment status lookup) legible on a phone for a
CFO checking numbers on the go — single-column KPI stack, sticky
"Total Pending" summary bar.
```

---

## Phase 10 — Dedicated Mobile & Responsiveness Pass (run after Phases 5–9)

```
Do a full responsiveness audit and fix pass across the entire app, testing
at 375px (phone), 768px (tablet), and 1440px (desktop):

1. Add/verify a shared responsive layout shell (`AppShell.jsx`) with:
   - A collapsible sidebar nav that becomes a bottom tab bar on <768px for
     the Student and Driver modules (their primary actions — Track Bus,
     Pass, Fees, SOS — belong in a persistent bottom tab bar, not a hamburger
     menu, since SOS access speed matters).
   - A hamburger/drawer nav for the Admin/Transport/Finance modules on
     <1024px, since those have many more nav items than fit a tab bar.
2. Convert every data table across Admin/Transport/Finance views into a
   responsive card list below 640px using a single reusable
   `ResponsiveTable` component (don't hand-roll this per view) — this
   affects ManageStudentsView, ManageFleetView, ManageDriversView,
   FinancePaymentsView, FinancePendingFeesView, and every other table
   listed in PROJECT_OVERVIEW.md.
3. Audit every modal (Add User, Add Student, Add Bus, Add Driver, Create
   Route, Record Manual Payment, Apply Discount, etc.) to render as a
   full-screen sheet on mobile instead of a centered dialog with fixed
   pixel width.
4. Verify every SVG map component (mini-map, LiveTrackingView, admin
   tracking console) uses a responsive viewBox and supports pinch-to-zoom
   and single-finger pan via touch events, not just mouse events.
5. Audit tap target sizes app-wide (minimum 44×44px per WCAG), spacing
   between adjacent interactive elements, and form input font-size ≥16px
   (to prevent iOS Safari's automatic zoom-on-focus).
6. Add `<meta name="viewport" content="width=device-width, initial-scale=1">`
   if missing, and safe-area-inset padding for notched devices on the
   Student and Driver full-screen views.
7. Turn the app into an installable PWA: web manifest with GLOW branding,
   a service worker caching the app shell so the Student "View Digital Pass"
   and Driver cockpit remain usable with flaky connectivity (queue SOS/
   trip-status writes and flush them on reconnect).
8. Run Lighthouse mobile audits on the Landing Page, Student Dashboard,
   Driver Cockpit, and Admin Dashboard; fix anything scoring below 90 on
   Performance and Accessibility, and report the before/after scores.
```

---

## Phase 11 — Security & Data Integrity Hardening

```
Do a security pass across the now-functional backend:

1. Validate and sanitize every request body with a schema library (zod or
   joi) on every route added in Phases 3–9.
2. Confirm requireRole is applied to every admin/finance/transport route —
   write an automated test that hits each protected endpoint as a student
   and asserts a 403.
3. Ensure the pass QR payload and receipt QR are cryptographically signed
   (HMAC-SHA256) and the validate-pass endpoint rejects tampered or expired
   payloads.
4. Wrap all multi-step financial writes (fee collection, refund approval,
   auto-balance corridor reassignment) in Mongoose sessions
   (`session.withTransaction()`) so partial writes can't corrupt the ledger —
   note in DEPLOYMENT.md that this requires MongoDB to run as a replica set
   (a single-node replica set is fine for local dev).
5. Add CSRF protection for the httpOnly refresh-cookie flow.
6. Confirm file uploads (challan slips) are size/type restricted and scanned
   before being persisted.
```

---

## Phase 12 — Testing

```
Add automated tests:
1. Backend: integration tests (supertest + a test DB) covering auth flow,
   role-gating, pass validation latency, and the fee-payment-to-ledger
   transaction.
2. Frontend: component tests for the responsive table/card breakpoint switch,
   the SOS trigger flow, and the QR scanner fallback-to-manual-ID path.
3. One end-to-end test (Playwright) that logs in as each of the four demo
   roles, exercises one primary action per role, and asserts the real-time
   WebSocket update lands (e.g. student SOS shows up in Admin Emergencies
   within 2 seconds).
4. Run the Playwright suite against a mobile viewport preset (iPhone 13) in
   addition to desktop.
```

---

## Phase 13 — Deployment

```
Prepare GLOW for deployment:
1. Dockerize backend + frontend build, with a docker-compose that also runs
   a single-node MongoDB replica set for local/staging parity (needed for
   the Mongoose transactions from Phase 11).
2. Environment-specific config (.env.production) with real Google OAuth
   credentials and a placeholder for the SMS/email provider keys.
3. A CI pipeline (GitHub Actions) that runs migrations, the test suite from
   Phase 12, and a Lighthouse mobile check on PRs before merge.
4. Document the deploy steps and rollback procedure in DEPLOYMENT.md.
```

---

## Suggested Order of Operations Summary

| Order | Phase | Unlocks |
|---|---|---|
| 1 | Architecture lock | Shared contract for every later prompt |
| 2 | Database (MongoDB/Mongoose) | Real data to build against |
| 3 | Backend foundation | Auth-ready server |
| 4 | Real authentication | All role-gated routes become possible |
| 5 | Live global state + WebSockets | Real-time features across every module |
| 6–9 | Student, Driver, Admin, Transport, Finance wiring | Feature completeness |
| 10 | Mobile pass | Usable on real devices |
| 11 | Security hardening | Production-safe |
| 12 | Testing | Regression-safe |
| 13 | Deployment | Live |

Run phases 5–9 in any order relative to each other once Phase 4 is done — they touch mostly separate files — but always finish Phase 10 (mobile) after all five are wired, since it audits the whole app at once.
