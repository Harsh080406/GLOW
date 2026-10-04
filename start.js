/**
 * GLOW Monorepo Unified Dev Runner
 * Starts both Backend API (port 5000) and Frontend (port 5173) concurrently.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("==================================================");
console.log("  🚀 Starting GLOW Smart Campus Transit Platform  ");
console.log("  • Backend:  http://localhost:5000               ");
console.log("  • Frontend: http://localhost:5173               ");
console.log("==================================================\n");

// 1. Start Backend Service
const backend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

backend.on("error", (err) => {
  console.error("❌ Failed to start Backend process:", err);
});

// 2. Start Frontend Service
const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
  shell: true,
});

frontend.on("error", (err) => {
  console.error("❌ Failed to start Frontend process:", err);
});

// Graceful cleanup on SIGINT/SIGTERM
const cleanup = () => {
  console.log("\n🛑 Stopping GLOW processes...");
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
