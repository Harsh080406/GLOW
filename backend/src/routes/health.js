import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "GLOW Transit Enterprise Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
