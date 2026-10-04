# GLOW — Deployment & Production Architecture Guide

This document describes production deployment procedures, environment configuration, database clustering, and security hardening measures implemented across GLOW (Smart Campus Transit & Fleet Management System).

---

## 1. Prerequisites & Environment Setup

- **Node.js**: `v20.x` or `v22.x` LTS
- **MongoDB**: `v6.0+` or `v7.0+` (Must run as a **Replica Set** — see [Section 2](#2-mongodb-replica-set-requirement-for-transactions))
- **Redis** *(Optional / Production recommendation)*: For distributed rate limiting and token blacklisting
- **Reverse Proxy**: NGINX or Caddy configured with TLS 1.3, HSTS, and HTTP/2

---

## 2. MongoDB Replica Set Requirement for Transactions

### Why Replica Sets are Required
GLOW wraps all multi-step financial writes and fleet balancing operations in Mongoose atomic transactions (`session.withTransaction()`):
1. **Fee Collection (`collectPayment`)**: Transactionally creates `payments`, updates `fee_ledger` balance and status, and unblocks `students`/`transport_passes`.
2. **Refund Processing (`processRefund`)**: Atomically updates `refunds` status and recalibrates `fee_ledger` dues.
3. **Challan Verification (`approveVerification`)**: Atomically approves `payments` and credits `fee_ledger`.
4. **Corridor Auto-Balancing (`autoBalanceRoutes`)**: Atomically reallocates student route assignments and synchronizes bus occupancies.

> [!IMPORTANT]
> MongoDB requires a **Replica Set** to support multi-document ACID transactions. Running MongoDB in standalone mode without `--replSet` will prevent transactional isolation. (GLOW includes an automatic graceful fallback for single-node standalone dev environments, but production and staging **must** run as replica sets to guarantee ledger integrity).

### A. Local Development: Single-Node Replica Set

To convert a local standalone MongoDB instance to a single-node replica set:

1. Stop any currently running `mongod` process.
2. Start MongoDB with the `--replSet` flag:
   ```bash
   mongod --dbpath /path/to/data/db --replSet rs0 --port 27017
   ```
   *(Or on Windows in `mongod.cfg`)*:
   ```yaml
   replication:
     replSetName: "rs0"
   ```
3. Open `mongosh` or MongoDB Compass and initiate the replica set:
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "localhost:27017" }]
   })
   ```
4. Update `backend/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/glow?replicaSet=rs0
   ```

### B. Production: MongoDB Atlas / Managed Cluster
MongoDB Atlas clusters (M0 Free Tier, M10, M20+) are automatically configured as 3-node replica sets. Use the standard SRV connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/glow?retryWrites=true&w=majority
```

---

## 3. Environment Variables Reference

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://glow.campus.edu

# Database
MONGO_URI=mongodb+srv://.../glow?retryWrites=true&w=majority

# Authentication & Cryptographic Keys
JWT_SECRET=super_secure_random_production_jwt_secret_min_64_chars
JWT_REFRESH_SECRET=super_secure_random_refresh_secret_min_64_chars
CSRF_SECRET=super_secure_random_csrf_secret_min_64_chars
HMAC_SECRET=super_secure_hmac_signing_key_for_qr_and_receipts

# File Storage & Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_BYTES=5242880 # 5 MB

# Notification Providers (Twilio / SendGrid / Console Stub)
EMAIL_PROVIDER=console # 'sendgrid' | 'smtp' | 'console'
SMS_PROVIDER=console   # 'twilio' | 'console'
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://glow.campus.edu/api/v1
```

---

## 4. Security Hardening Measures (Phase 11)

1. **Request Validation & Sanitization**:
   - Every mutating request body is strictly validated using `zod` schemas (`backend/src/validators/schemas.js` & `validateBody` middleware).
   - Unknown or malicious fields are stripped; type mismatches return structured `400 BAD_REQUEST`.

2. **Role-Based Access Control (RBAC)**:
   - Gated via `requireRole(...)` middleware across all routes (`admin`, `finance`, `transport`, `driver`, `student`).
   - Automated tests assert non-privileged users (e.g. students) receive `403 Forbidden` on all administrative APIs.

3. **HMAC-SHA256 Cryptographic Signatures**:
   - **Student Bus Pass QR**: Payload format `GLOW_PASS|enrollmentId|routeId|zone|expiresAt|signature`.
   - **Financial Receipts QR**: Payload format `GLOW_RECEIPT|receiptId|studentId|amount|timestamp|signature`.
   - The driver scan validator (`validate-pass`) verifies HMAC timing-safely and rejects forged, modified, or expired QR codes.

4. **CSRF Protection on httpOnly Cookie Flows**:
   - `XSRF-TOKEN` cookie issued upon authentication.
   - Refresh token rotation (`/api/v1/auth/refresh`) requires matching `x-csrf-token` header or body token.

5. **Anti-Malware & File Upload Scanning**:
   - Uploads limited to 5MB and restricted to allowed MIME types (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
   - Magic byte header inspection validates genuine file types.
   - Deep inspection heuristically quarantines files containing executable signatures (PE headers, ELF headers, embedded `<script>`, `<?php`, `eval`).

---

## 5. Build & Process Management

### Build Frontend
```bash
cd frontend
npm install
npm run build
# Dist directory: frontend/dist
```

### Launch Backend with PM2
```bash
cd backend
npm install --omit=dev
pm2 start src/server.js --name "glow-api" -i max
pm2 save
```
