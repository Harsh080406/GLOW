import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import healthRoutes from "./routes/health.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

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

// 2. Health Check Routes
app.use("/api", healthRoutes);
app.use("/api/v1", healthRoutes);

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

// 5. Database Connection & Server Startup
const startServer = async () => {
  try {
    console.log("🔄 Initializing GLOW Enterprise Backend Service...");
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 GLOW Backend Server live on port ${PORT}`);
      console.log(`🔒 Security headers (Helmet) & CORS active for origin: ${FRONTEND_ORIGIN}`);
    });
  } catch (error) {
    console.error("❌ Refusing to start server: Initial MongoDB connection failed.");
    process.exit(1);
  }
};

startServer();
