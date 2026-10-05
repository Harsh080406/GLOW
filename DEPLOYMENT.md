# 🚀 GLOW Smart Campus Transit — Production Deployment & Rollback Guide

This guide details the complete deployment architecture, container orchestration, environment configuration, database replica set setup, and emergency rollback procedures for the **GLOW** campus bus transit platform.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & System Requirements](#2-prerequisites--system-requirements)
3. [Quick Start Deployment (Docker Compose)](#3-quick-start-deployment-docker-compose)
4. [Production Environment Configuration](#4-production-environment-configuration)
5. [MongoDB Replica Set & Mongoose Transactions](#5-mongodb-replica-set--mongoose-transactions)
6. [Domain, SSL/TLS & Reverse Proxy Setup](#6-domain-ssltls--reverse-proxy-setup)
7. [Database Seeding & Migration Guide](#7-database-seeding--migration-guide)
8. [Zero-Downtime Rollback Procedure](#8-zero-downtime-rollback-procedure)
9. [Telemetry, Healthchecks & Monitoring](#9-telemetry-healthchecks--monitoring)
10. [Backup & Disaster Recovery Runbook](#10-backup--disaster-recovery-runbook)

---

## 1. Architecture Overview

```
                        Internet / Commuter Traffic
                                    │
                                    ▼
                         [ DNS: glow.gsfcuniversity.ac.in ]
                                    │
                                    ▼
         ┌────────────────────────────────────────────────────────┐
         │          Production Nginx Web Server (Port 80 / 443)   │
         │  • Serves Optimized Vite React SPA Assets              │
         │  • Proxies /api/* ──▶ Backend API Service (Port 5000)  │
         │  • Proxies /ws    ──▶ Real-Time Telemetry Gateway      │
         └──────────────────────────┬─────────────────────────────┘
                                    │
                     Docker Internal Bridge Network
                                    │
         ┌──────────────────────────┴─────────────────────────────┐
         │          GLOW Node.js / Express Backend (Port 5000)   │
         │  • RBAC & JWT Session Auth (HMAC Pass/Receipt Signing) │
         │  • Live WebSocket Bus GPS Telemetry Broadcaster       │
         │  • Financial Ledger & Automated Route Balancer         │
         └──────────────────────────┬─────────────────────────────┘
                                    │
                       Mongoose Session Connection
                                    │
         ┌──────────────────────────▼─────────────────────────────┐
         │     MongoDB 7.0 Single-Node Replica Set (rs0:27017)    │
         │  • ACID Multi-Document Transactions                    │
         │  • Local/Staging/Production Environment Parity         │
         │  • Persistent Data Volumes: mongo_data & mongo_config   │
         └────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites & System Requirements

### Hardware Requirements
- **CPU**: 2 vCPUs minimum (4 vCPUs recommended for peak exam/admission transit load)
- **RAM**: 4 GB minimum (8 GB recommended for MongoDB cache and concurrent WebSocket streams)
- **Disk**: 25 GB SSD or NVMe

### Software Dependencies
- **Docker Engine**: Version `24.0.0` or higher ([Install Guide](https://docs.docker.com/engine/install/))
- **Docker Compose**: Version `2.20.0` or higher
- **Git**: Version `2.30.0` or higher

Verify your installation:
```bash
docker --version
docker compose version
```

---

## 3. Quick Start Deployment (Docker Compose)

The repository includes a ready-to-use [`docker-compose.yml`](./docker-compose.yml) topology that automatically provisions the MongoDB replica set (`rs0`), builds the hardened Node.js backend, and compiles the production Nginx frontend SPA.

### Step 1: Clone Repository & Enter Directory
```bash
git clone https://github.com/Harsh080406/GLOW.git
cd GLOW
```

### Step 2: Initialize Production Environment Variables
Copy the production environment template or edit `.env.production`:
```bash
cp .env.production.example .env.production
# Review and customize variables:
nano .env.production
```

### Step 3: Launch Containers in Detached Mode
```bash
docker compose up -d --build
```

### Step 4: Verify Container Health & Status
```bash
docker compose ps
```
You should see all 3 core services running and reporting `healthy`:
- `glow-mongo`: `healthy` (Port 27017)
- `glow-backend`: `healthy` (Port 5000)
- `glow-frontend`: `healthy` (Port 80)

### Step 5: Seed University Transit Master Data
Seed the 13 official GSFC University buses, 13 drivers, timetables, and fee slabs:
```bash
docker compose run --rm db-seed
```

Open your browser to:
- **Web Portal**: `http://localhost` (or your server's public IP)
- **API Health Probe**: `http://localhost:5000/api/v1/health`

---

## 4. Production Environment Configuration

The production settings reside in `.env.production`. Key variables include:

### Core System Variables
| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Backend listening port | `5000` |
| `FRONTEND_ORIGIN` | Allowed CORS origins (comma-separated) | `https://glow.gsfcuniversity.ac.in` |
| `MONGODB_URI` | Replica set connection URI | `mongodb://mongo:27017/glow_transit?replicaSet=rs0` |

### Security & Token Signing
| Variable | Description | Notes |
| :--- | :--- | :--- |
| `JWT_SECRET` | Secret key for access token signing | Minimum 64 random characters |
| `JWT_REFRESH_SECRET`| Secret key for refresh token signing | Minimum 64 random characters |
| `PASS_HMAC_SECRET` | Cryptographic HMAC key for bus pass QR verification | Tamper-proof validation |
| `RECEIPT_HMAC_SECRET`| Cryptographic HMAC key for fee receipts | Auditable digital signature |

Generate strong cryptographic keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Google OAuth 2.0 Credentials
| Variable | Value |
| :--- | :--- |
| `GOOGLE_CLIENT_ID` | `703668017757-grtcb9lsii76a85h9hde00sae9nsmkla.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |
| `GOOGLE_CALLBACK_URL` | `https://glow.gsfcuniversity.ac.in/api/v1/auth/google/callback` |

> [!IMPORTANT]
> In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), ensure the following are registered under OAuth 2.0 Client ID:
> - **Authorized redirect URIs**: `https://glow.gsfcuniversity.ac.in/api/v1/auth/google/callback`
> - **Authorized JavaScript origins**: `https://glow.gsfcuniversity.ac.in`

### Telephony / SMS Providers (Configurable in `.env.production`)
- **Twilio**: Set `SMS_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
- **MSG91 (India DLT Compliant)**: Set `SMS_PROVIDER=msg91`, `MSG91_AUTH_KEY`, `MSG91_SENDER_ID=GLOWTX`.
- **Fast2SMS**: Set `SMS_PROVIDER=fast2sms`, `FAST2SMS_API_KEY`.

### Email Notification Providers (Configurable in `.env.production`)
- **SendGrid**: Set `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY`, `EMAIL_FROM_ADDRESS`.
- **SMTP (Google Workspace / University Exchange)**: Set `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

---

## 5. MongoDB Replica Set & Mongoose Transactions

GLOW's financial transaction suite and fee reconciliation engines rely on Mongoose multi-document ACID transactions (`session.withTransaction`). Standalone MongoDB nodes reject transaction calls with:
```
Transaction numbers are only allowed on a replica set member or mongos
```

### How the Docker Topology Solves This
1. The `mongo` container starts with:
   ```yaml
   command: ["mongod", "--replSet", "rs0", "--bind_ip_all"]
   ```
2. The healthcheck script automatically checks if the replica set is initiated; if not, it runs:
   ```javascript
   rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] })
   ```
3. The `backend` container waits for `mongo` to report `healthy` before attempting database connection, guaranteeing zero transaction boot errors.

To manually inspect the replica set status at any time:
```bash
docker exec -it glow-mongo mongosh --eval "rs.status()"
```

---

## 6. Domain, SSL/TLS & Reverse Proxy Setup

When deploying to a public VPS (Ubuntu 22.04 / 24.04 LTS), terminate SSL/TLS at an edge reverse proxy (such as host Nginx or Caddy) and forward traffic to the Docker stack.

### Option A: Host Nginx with Certbot (Let's Encrypt)

1. **Install Nginx & Certbot**:
   ```bash
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx Site** (`/etc/nginx/sites-available/glow.conf`):
   ```nginx
   server {
       server_name glow.gsfcuniversity.ac.in;

       location / {
           proxy_pass http://127.0.0.1:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Site & Obtain Free SSL Certificate**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/glow.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d glow.gsfcuniversity.ac.in
   ```

---

## 7. Database Seeding & Migration Guide

### Running Database Seeds
To populate the 13 official GSFC University routes, 13 fleet buses, 13 drivers, timetables, and test commuters:
```bash
# Using Docker Compose:
docker compose run --rm db-seed

# Or executing directly in the running backend container:
docker exec -it glow-backend npm run db:seed
```

### Performing Database Backups
```bash
# Create timestamped BSON archive
docker exec -t glow-mongo mongodump --archive="/data/db/backup-$(date +%Y%m%d_%H%M%S).gz" --gzip --db=glow_transit

# Copy backup off container to host machine
docker cp glow-mongo:/data/db/backup-*.gz ./backups/
```

---

## 8. Zero-Downtime Rollback Procedure

If a faulty deployment or corrupted migration occurs in production, follow these steps to restore service stability:

### Scenario A: Fast Container Rollback (Code Regression)
If a new code deployment introduces errors but the database is intact:

1. **Check Previous Docker Image / Git Commit**:
   ```bash
   git log --oneline -n 5
   ```
2. **Checkout Previous Stable Commit or Tag**:
   ```bash
   git checkout <STABLE_COMMIT_HASH_OR_TAG>
   ```
3. **Rebuild & Restart Containers**:
   ```bash
   docker compose down
   docker compose up -d --build
   ```
4. **Verify Health Probes**:
   ```bash
   curl -f http://localhost:5000/api/v1/health
   ```

### Scenario B: Database Restoration from Backup
If data corruption occurred during a migration or test execution:

1. **Stop Backend Traffic (Prevent New Writes)**:
   ```bash
   docker compose stop backend frontend
   ```
2. **Restore Database from Gzip Archive**:
   ```bash
   docker exec -i glow-mongo mongorestore --gzip --archive --drop < ./backups/backup-latest.gz
   ```
3. **Restart Application Services**:
   ```bash
   docker compose start backend frontend
   ```
4. **Verify Ledger & Roster Consistency**:
   ```bash
   docker exec -it glow-backend node -e "
     import('./src/models/Student.js').then(({ default: S }) => {
       S.countDocuments().then(c => console.log('Students count:', c));
     });
   "
   ```

---

## 9. Telemetry, Healthchecks & Monitoring

### Health Probe Endpoints
- **Frontend Nginx Probe**: `GET http://localhost/health` (HTTP 200 `OK`)
- **Backend API Probe**: `GET http://localhost:5000/api/v1/health` (Reports DB connection status, memory usage, uptime)
- **WebSocket Gateway Probe**: `ws://localhost:5000` (Responds to ping/pong frames)

### Inspecting Live Container Logs
```bash
# Stream all logs
docker compose logs -f

# Stream backend API & WebSocket events specifically
docker compose logs -f backend

# Stream MongoDB replica set elections & logs
docker compose logs -f mongo
```

### Monitoring Resource Utilization
```bash
docker stats --no-stream
```

---

## 10. Backup & Disaster Recovery Runbook

### Automated Daily Cron Backup
Add the following job to the server host `crontab -e`:
```bash
# Run daily at 02:00 AM UTC
0 2 * * * docker exec glow-mongo mongodump --archive=/data/db/daily-backup.gz --gzip --db=glow_transit && docker cp glow-mongo:/data/db/daily-backup.gz /var/backups/glow/backup-$(date +\%F).gz
```

### Emergency Contacts
- **Transit Control Room**: `+91 265 3092400`
- **IT Systems Operations**: `admin@glowbus.edu` / `transit-alerts@gsfcuniversity.ac.in`
