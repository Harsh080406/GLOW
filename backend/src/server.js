import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
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
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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

// 5. Initialize WebSocket Server
if (!isTestEnv) {
  setupWebSocketServer(server);
}

// 6. Database Connection & Server Startup
const startServer = async () => {
  try {
    console.log("🔄 Initializing GLOW Enterprise Backend Service...");
    await connectDB();

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use by another process.`);
        console.error(`👉 Run 'netstat -ano | findstr :${PORT}' or terminate the existing process.`);
      } else {
        console.error("❌ Backend Server Error:", err.message);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`🚀 GLOW Backend Server live on port ${PORT}`);
      console.log(`📡 WebSocket Real-time Gateway active on ws://localhost:${PORT}`);
      console.log(`🔒 Security headers (Helmet) & CORS active for origin: ${FRONTEND_ORIGIN}`);
    });
  } catch (error) {
    console.error("❌ Refusing to start server: Initial MongoDB connection failed.");
    process.exit(1);
  }
};

if (!isTestEnv) {
  startServer();
}

export { app, server, startServer };
