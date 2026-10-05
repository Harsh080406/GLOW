# 🌐 Zero-Cost Cloud Deployment Guide: Vercel + Render + MongoDB Atlas

This step-by-step guide walks you through deploying the complete **GLOW Smart Campus Transit** full-stack platform for **100% FREE** with high availability, global CDN caching, real-time WebSockets, and Google Cloud OAuth 2.0 authentication.

---

## 🏗️ Free-Tier Cloud Architecture

```
                  Commuters & Staff (Browser / Mobile)
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Frontend: VERCEL (Free Hobby Plan)         │
       │  • Global Edge CDN with zero cold starts               │
       │  • Automated CI/CD on git push to main                 │
       │  • URL: https://glow-transit.vercel.app                │
       └────────────────────────────┬───────────────────────────┘
                                    │
                REST API (HTTPS)    │   Live GPS Telemetry (WSS)
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Backend: RENDER (Free Web Service)         │
       │  • Node.js 20 API Server (Port 10000 / Auto-assigned)  │
       │  • Native WebSocket Gateway (/ws) for live bus tracking│
       │  • URL: https://glow-backend.onrender.com              │
       └────────────────────────────┬───────────────────────────┘
                                    │
                         Mongoose Replica Set Connection
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │         Database: MONGODB ATLAS (Free M0 Cluster)      │
       │  • 512 MB Storage (Free forever)                       │
       │  • Native 3-node replica set (ACID Mongoose Txns)      │
       │  • Location: AWS ap-south-1 (Mumbai / Nearest region)  │
       └────────────────────────────────────────────────────────┘
```

---

## ⏱️ Quick Deployment Roadmap (15 Minutes)

- [Step 1: Database (MongoDB Atlas M0) — 3 Mins](#step-1-database-mongodb-atlas-m0)
- [Step 2: Backend & WebSockets (Render) — 5 Mins](#step-2-backend--websockets-render)
- [Step 3: Frontend Client (Vercel) — 4 Mins](#step-3-frontend-client-vercel)
- [Step 4: Google Cloud OAuth 2.0 Console Sync — 3 Mins](#step-4-google-cloud-oauth-20-console-sync)
- [Step 5: Master Data Seeding & Verification](#step-5-master-data-seeding--verification)

---

## Step 1: Database (MongoDB Atlas M0)

MongoDB Atlas provides a **Free Shared M0 cluster** with built-in replica sets, enabling all Mongoose transaction features without cost.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create** $\to$ Select **M0 (Free)**.
3. Choose Cloud Provider: **AWS**, Region: **ap-south-1 (Mumbai)** (or your closest region).
4. Under **Security Quickstart**:
   - Create a database user (e.g. `glow_admin`) and a secure password. Save these credentials.
   - Under **Where would you like to connect from?**:
     - Click **Allow Access from Anywhere** $\to$ IP Address: `0.0.0.0/0` (required so Render dynamic servers can connect).
     - Click **Add Entry**.
5. Click **Finish and Close** $\to$ Go to Overview.
6. Click **Connect** $\to$ Choose **Drivers (Node.js)**.
7. Copy the Connection String:
   ```
   mongodb+srv://glow_admin:<password>@cluster0.xxxxx.mongodb.net/glow_transit?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual password and ensure `/glow_transit` is the database name).*

---

## Step 2: Backend & WebSockets (Render)

Render runs Node.js applications with free HTTPS and native WebSocket support.

### Option A: 1-Click Blueprint Deploy (Fastest)
1. Log in to [dashboard.render.com](https://dashboard.render.com/) with GitHub.
2. Click **New +** $\to$ **Blueprint**.
3. Connect your repository: `Harsh080406/GLOW`.
4. Render will detect the included [`render.yaml`](./render.yaml).
5. Fill in the missing values:
   - `MONGODB_URI`: Paste your MongoDB Atlas URI from Step 1.
   - `FRONTEND_ORIGIN`: `https://glow-transit.vercel.app` (or temporary `*`).
   - `GOOGLE_CALLBACK_URL`: `https://<YOUR-RENDER-NAME>.onrender.com/api/v1/auth/google/callback`.
6. Click **Apply**.

---

### Option B: Manual Web Service Setup
1. On the Render Dashboard, click **New +** $\to$ **Web Service**.
2. Select your repository: `Harsh080406/GLOW`.
3. Configure the service settings:
   - **Name**: `glow-backend`
   - **Region**: Singapore (or closest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: **Free**
4. Scroll down to **Environment Variables** $\to$ Click **Add Environment Variable**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port for Render |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `glow_prod_access_secret_key_2026_render` | 64-character random key |
| `JWT_REFRESH_SECRET` | `glow_prod_refresh_secret_key_2026_render` | 64-character random key |
| `PASS_HMAC_SECRET` | `glow_pass_hmac_sign_key_2026` | HMAC Pass secret |
| `RECEIPT_HMAC_SECRET`| `glow_receipt_hmac_sign_key_2026` | HMAC Receipt secret |
| `FRONTEND_ORIGIN` | `https://your-app.vercel.app` | Will update after Vercel deploy |
| `GOOGLE_CLIENT_ID` | `703668017757-grtcb9lsii76a85h9hde00sae9nsmkla.apps.googleusercontent.com` | Official Google OAuth ID |
| `GOOGLE_CLIENT_SECRET` | `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` | Official Google Secret |
| `GOOGLE_CALLBACK_URL` | `https://glow-backend.onrender.com/api/v1/auth/google/callback` | Render OAuth callback |
| `GPS_SIMULATOR_ENABLED` | `true` | Bus GPS telematics |

5. Click **Create Web Service**.
6. Wait 2–3 minutes for the build to finish. Once live, copy your backend URL:
   `https://glow-backend.onrender.com`

---

## Step 3: Frontend Client (Vercel)

Vercel provides edge hosting with global CDN caching for React/Vite SPAs.

1. Go to [vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New...** $\to$ **Project**.
3. Select and import `Harsh080406/GLOW`.
4. In the **Configure Project** screen:
   - **Project Name**: `glow-transit` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** $\to$ Select `frontend` $\to$ Click **Continue**.
   - **Build & Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
5. Expand **Environment Variables** and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://glow-backend.onrender.com/api/v1` | Your Render backend URL + `/api/v1` |
| `VITE_WS_BASE_URL` | `wss://glow-backend.onrender.com` | Note the `wss://` secure WebSocket prefix |

6. Click **Deploy**.
7. Vercel will build and deploy your frontend in ~45 seconds. Copy your live Vercel URL:
   `https://glow-transit.vercel.app`

> [!NOTE]
> The included [`frontend/vercel.json`](./frontend/vercel.json) automatically handles SPA rewrites, preventing 404 errors when reloading routes like `/student/dashboard` or `/login`.

8. **Sync Render CORS**: Go back to Render $\to$ Environment Variables $\to$ update `FRONTEND_ORIGIN` with your actual Vercel domain (`https://glow-transit.vercel.app`).

---

## Step 4: Google Cloud OAuth 2.0 Console Sync

Now that your production domains are live, authorize them in Google Cloud Console:

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Click on your OAuth 2.0 Client ID:  
   `703668017757-grtcb9lsii76a85h9hde00sae9nsmkla.apps.googleusercontent.com`
3. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   - `https://glow-transit.vercel.app` (Your Vercel domain)
   - `https://glow-backend.onrender.com` (Your Render backend domain)
4. Under **Authorized redirect URIs**, click **+ ADD URI** and add:
   - `https://glow-backend.onrender.com/api/v1/auth/google/callback`
   - `https://glow-backend.onrender.com/api/auth/google/callback`
   - `https://glow-transit.vercel.app/oauth/callback`
5. Click **SAVE** at the bottom of the page.

---

## Step 5: Master Data Seeding & Verification

Populate the 13 official GSFC University routes, 13 fleet buses, and drivers into your MongoDB Atlas database:

### Method A: From Your Local Terminal
You can run the seed script directly against your MongoDB Atlas cluster from your machine:
```bash
# In the backend directory:
cd backend
MONGODB_URI="your_mongodb_atlas_connection_string" npm run db:seed
```

### Method B: From Render Shell
1. In your Render Dashboard, click on your `glow-backend` service.
2. Click **Shell** in the left sidebar $\to$ Click **Connect**.
3. Run:
   ```bash
   npm run db:seed
   ```
4. You will see:
   ```
   🌱 Starting GLOW MERN Database Seeding Pipeline...
   🍃 MongoDB Connected: cluster0.xxxxx.mongodb.net/glow_transit
   🚍 Seeding Official 13 Buses & 13 Drivers...
   ✅ Database Seeding Completed Successfully!
   ```

---

## 💡 Free Tier Tips & Best Practices

### 1. Keeping Render Active (Free Tier Inactivity Sleep)
Render's free tier spins down web services after 15 minutes of inactivity, causing a ~30-second cold start on the first request.
- **Solution (100% Free)**:
  1. Go to [cron-job.org](https://cron-job.org/) or [uptimerobot.com](https://uptimerobot.com/).
  2. Create a free HTTP monitor targeting:  
     `https://glow-backend.onrender.com/api/v1/health`
  3. Set interval to **every 10 minutes**.
  4. This keeps your backend active 24/7 with zero cold starts!

### 2. Live WebSockets
Render natively supports WebSockets on standard port 443 via `wss://`. The frontend automatically falls back to HTTP polling if a commuter is on a restrictive network.

### 3. Alternative Free Platforms
- **Railway.app**: $5 free monthly usage credit (great alternative if Render is slow in your region).
- **Netlify**: Alternative to Vercel for frontend hosting (build command: `npm run build`, publish directory: `dist`).
- **Koyeb**: Free micro container instance with fast boot times.

---

## 🎉 Verification Checklist

- [ ] **Frontend**: `https://glow-transit.vercel.app` loads the Landing Page.
- [ ] **Backend Health**: `https://glow-backend.onrender.com/api/v1/health` returns `status: OK`.
- [ ] **Live Telemetry**: Student "Live Tracking" map displays moving buses with route lines.
- [ ] **Google Login**: Clicking "Sign in with Google" prompts Google OAuth consent without `redirect_uri_mismatch`.
- [ ] **Admin & Driver Rosters**: Displays all 13 official GSFC University buses and 13 drivers.
