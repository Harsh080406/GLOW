import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "GLOW Transit Backend API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Demo Auth Endpoint
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }

  const role = email.includes("admin")
    ? "super_admin"
    : email.includes("finance")
    ? "finance_admin"
    : email.includes("driver")
    ? "driver"
    : email.includes("transport")
    ? "transport_manager"
    : "student";

  res.json({
    success: true,
    token: `glow_jwt_mock_${Date.now()}`,
    user: { email, role },
  });
});

// Telemetry & Fleet Summary Endpoint
app.get("/api/v1/fleet/status", (req, res) => {
  res.json({
    totalBuses: 85,
    activeTrips: 28,
    activeRoutes: 34,
    registeredStudents: 4250,
    systemStatus: "OPTIMAL",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GLOW Enterprise API Server running on port ${PORT}`);
});
