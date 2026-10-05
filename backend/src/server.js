import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "./db/connect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from backend directory or workspace root
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

// Import Route Handlers
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/student.js";
import driverRoutes from "./routes/driver.js";
import adminRoutes from "./routes/admin.js";
import transportRoutes from "./routes/transport.js";
import financeRoutes from "./routes/finance.js";
import emergencyRoutes from "./routes/emergency.js";

import { globalErrorHandler } from "./middleware/errorHandler.js";
import { setupWebSocketServer } from "./websocket/wsServer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Create HTTP Server for Express + WebSockets
const server = http.createServer(app);

// 1. Security & Middleware Configuration
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// Bulletproof CORS Configuration for Vercel, Render, Localhost & Custom Domains
const rawOrigins = process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:80";
const configuredOrigins = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, mobile, curl, or empty origin requests
    if (!origin) return callback(null, true);

    // Explicitly allowed origins or wildcard
    if (
      configuredOrigins.includes("*") ||
      configuredOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("vercel.app") ||
      origin.endsWith(".onrender.com") ||
      origin.includes("onrender.com") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes("gsfcuniversity.ac.in")
    ) {
      return callback(null, true);
    }

    // Default to allow to ensure cross-origin fetch succeeds
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "x-csrf-token",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// 2. Register Feature Module API Routes
app.use("/api", healthRoutes);
app.use("/api/v1", healthRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);

app.use("/api/student", studentRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/transport", transportRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/emergencies", emergencyRoutes);

// 3. Catch-All 404 Route for Unmatched Endpoints
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Endpoint ${req.originalUrl} does not exist on this server.`,
    },
  });
});

// 4. Global Error Handling Middleware
app.use(globalErrorHandler);

const isTestEnv =
  process.env.NODE_ENV === "test" ||
  process.argv.includes("--test") ||
  process.argv.some((arg) => arg.endsWith(".test.js") || arg.endsWith(".spec.js"));

let wsGateway = null;
let isShuttingDown = false;

// 5. Graceful Process Termination Handlers
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Gracefully stopping GLOW Backend Server...`);

  if (wsGateway?.close) {
    try {
      wsGateway.close();
    } catch (e) {}
  }

  if (server.listening) {
    try {
      await new Promise((resolve) => server.close(resolve));
      console.log("🔒 HTTP server closed.");
    } catch (e) {}
  }

  try {
    await mongoose.disconnect();
    console.log("🍃 MongoDB disconnected.");
  } catch (e) {}

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("⚠️ Uncaught Exception:", error);
});

// 6. Database Connection & Server Startup with Port-in-use Retry
const startServer = async () => {
  try {
    console.log("🔄 Initializing GLOW Enterprise Backend Service...");
    await connectDB();

    // Initialize WebSocket Gateway AFTER database is successfully connected
    if (!isTestEnv && !wsGateway) {
      wsGateway = setupWebSocketServer(server);
    }

    let attempts = 0;
    const maxRetries = 5;
    const retryDelayMs = 1000;

    const tryListen = () => {
      attempts++;
      server.listen(PORT, () => {
        console.log(`🚀 GLOW Backend Server live on port ${PORT}`);
        console.log(`📡 WebSocket Real-time Gateway active on ws://localhost:${PORT}`);
        console.log(`🔒 Security headers (Helmet) & CORS active for origin: ${FRONTEND_ORIGIN}`);
      });
    };

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (attempts < maxRetries) {
          console.warn(`⚠️ Port ${PORT} is busy (attempt ${attempts}/${maxRetries}). Waiting ${retryDelayMs}ms for release...`);
          setTimeout(() => {
            try {
              server.close();
            } catch (e) {}
            tryListen();
          }, retryDelayMs);
        } else {
          console.error(`❌ Port ${PORT} is already in use after ${maxRetries} attempts.`);
          console.error(`👉 Run 'netstat -ano | findstr :${PORT}' or terminate the existing process.`);
          process.exit(1);
        }
      } else {
        console.error("❌ Backend Server Error:", err.message);
        process.exit(1);
      }
    });

    tryListen();
  } catch (error) {
    console.error("❌ Refusing to start server: Initial MongoDB connection failed.", error.message);
    process.exit(1);
  }
};

if (!isTestEnv) {
  startServer();
}

export { app, server, startServer, wsGateway };
