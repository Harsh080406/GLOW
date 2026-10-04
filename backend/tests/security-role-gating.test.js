process.env.NODE_ENV = "test";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import jwt from "jsonwebtoken";
import { app } from "../src/server.js";
import {
  generateSignedPassPayload,
  verifySignedPassPayload,
  generateSignedReceiptPayload,
  verifySignedReceiptPayload,
} from "../src/utils/cryptoUtils.js";
import fs from "node:fs";
import path from "node:path";

const JWT_SECRET = process.env.JWT_SECRET || "glow_super_secret_jwt_access_key_2026";

// Generate a valid student access token
const studentToken = jwt.sign(
  {
    sub: "6ac20d18cfeeafc5329cee99",
    id: "6ac20d18cfeeafc5329cee99",
    email: "student.test@glowbus.edu",
    role: "student",
    name: "Test Commuter",
  },
  JWT_SECRET,
  { expiresIn: "1h" }
);

// Generate a driver token for testing scan validation
const driverToken = jwt.sign(
  {
    sub: "6ac20d18cfeeafc5329ceedd",
    id: "6ac20d18cfeeafc5329ceedd",
    email: "driver.test@glowbus.edu",
    role: "driver",
    name: "Test Driver",
  },
  JWT_SECRET,
  { expiresIn: "1h" }
);

describe("Phase 11 Security & Data Integrity Hardening Test Suite", () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start test server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Helper fetch function
  const apiRequest = async (path, options = {}) => {
    const url = `${baseUrl}${path}`;
    const headers = {
      Authorization: `Bearer ${studentToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    return fetch(url, { ...options, headers });
  };

  describe("1. RBAC Protection — Admin Endpoints reject student with 403", () => {
    const adminEndpoints = [
      { method: "GET", path: "/api/v1/admin/dashboard" },
      { method: "GET", path: "/api/v1/admin/kpis" },
      { method: "GET", path: "/api/v1/admin/activity-log" },
      { method: "GET", path: "/api/v1/admin/users" },
      { method: "POST", path: "/api/v1/admin/users", body: JSON.stringify({ name: "Hacker", email: "h@e.com", role: "admin" }) },
      { method: "GET", path: "/api/v1/admin/students" },
      { method: "POST", path: "/api/v1/admin/students", body: JSON.stringify({ name: "Test" }) },
      { method: "GET", path: "/api/v1/admin/fleet" },
      { method: "POST", path: "/api/v1/admin/fleet", body: JSON.stringify({ registrationNumber: "GJ-06-AB-9999" }) },
      { method: "GET", path: "/api/v1/admin/drivers" },
      { method: "GET", path: "/api/v1/admin/routes" },
      { method: "GET", path: "/api/v1/admin/schedules" },
      { method: "GET", path: "/api/v1/admin/maintenance" },
      { method: "GET", path: "/api/v1/admin/complaints" },
      { method: "GET", path: "/api/v1/admin/emergencies" },
      { method: "GET", path: "/api/v1/admin/settings" },
    ];

    for (const ep of adminEndpoints) {
      test(`${ep.method} ${ep.path} returns 403 Forbidden for student`, async () => {
        const res = await apiRequest(ep.path, {
          method: ep.method,
          body: ep.body,
        });
        assert.equal(res.status, 403, `Expected 403 on ${ep.path}, got ${res.status}`);
        const data = await res.json();
        assert.equal(data.error?.code, "FORBIDDEN");
      });
    }
  });

  describe("2. RBAC Protection — Finance Endpoints reject student with 403", () => {
    const financeEndpoints = [
      { method: "GET", path: "/api/v1/finance/dashboard" },
      { method: "GET", path: "/api/v1/finance/students" },
      { method: "POST", path: "/api/v1/finance/collect", body: JSON.stringify({ studentId: "123", amount: 5000 }) },
      { method: "GET", path: "/api/v1/finance/fee-structures" },
      { method: "POST", path: "/api/v1/finance/fee-structures", body: JSON.stringify({ zone: "Zone A", baseFee: 10000 }) },
      { method: "GET", path: "/api/v1/finance/payments" },
      { method: "GET", path: "/api/v1/finance/pending" },
      { method: "GET", path: "/api/v1/finance/verifications" },
      { method: "GET", path: "/api/v1/finance/refunds" },
      { method: "GET", path: "/api/v1/finance/discounts" },
      { method: "GET", path: "/api/v1/finance/receipts" },
      { method: "GET", path: "/api/v1/finance/reports" },
      { method: "GET", path: "/api/v1/finance/audit-logs" },
    ];

    for (const ep of financeEndpoints) {
      test(`${ep.method} ${ep.path} returns 403 Forbidden for student`, async () => {
        const res = await apiRequest(ep.path, {
          method: ep.method,
          body: ep.body,
        });
        assert.equal(res.status, 403, `Expected 403 on ${ep.path}, got ${res.status}`);
        const data = await res.json();
        assert.equal(data.error?.code, "FORBIDDEN");
      });
    }
  });

  describe("3. RBAC Protection — Transport Endpoints reject student with 403", () => {
    const transportEndpoints = [
      { method: "GET", path: "/api/v1/transport/dashboard" },
      { method: "GET", path: "/api/v1/transport/students" },
      { method: "POST", path: "/api/v1/transport/students/reassign", body: JSON.stringify({ studentId: "s1", targetRouteId: "r1" }) },
      { method: "POST", path: "/api/v1/transport/routes/auto-balance", body: JSON.stringify({ commit: false }) },
      { method: "GET", path: "/api/v1/transport/students/export-excel" },
      { method: "GET", path: "/api/v1/transport/reports" },
      { method: "GET", path: "/api/v1/transport/reports/export-pdf" },
    ];

    for (const ep of transportEndpoints) {
      test(`${ep.method} ${ep.path} returns 403 Forbidden for student`, async () => {
        const res = await apiRequest(ep.path, {
          method: ep.method,
          body: ep.body,
        });
        assert.equal(res.status, 403, `Expected 403 on ${ep.path}, got ${res.status}`);
        const data = await res.json();
        assert.equal(data.error?.code, "FORBIDDEN");
      });
    }
  });

  describe("4. Cryptographic HMAC Signatures for Bus Passes & Receipts", () => {
    test("generates and verifies valid signed pass payload", () => {
      const validUntil = new Date(Date.now() + 86400000).toISOString();
      const signedPayload = generateSignedPassPayload({
        enrollmentId: "UNI2026001",
        routeId: "ROUTE-4B",
        zone: "Zone B",
        validUntil,
      });

      assert.ok(signedPayload.startsWith("GLOW_PASS|"));
      const verification = verifySignedPassPayload(signedPayload);
      assert.equal(verification.valid, true);
      assert.equal(verification.enrollmentId, "UNI2026001");
      assert.equal(verification.routeId, "ROUTE-4B");
      assert.equal(verification.zone, "Zone B");
    });

    test("rejects tampered pass payload (modified route)", () => {
      const validUntil = new Date(Date.now() + 86400000).toISOString();
      const signedPayload = generateSignedPassPayload({
        enrollmentId: "UNI2026001",
        routeId: "ROUTE-4B",
        zone: "Zone B",
        validUntil,
      });

      // Tamper route to ROUTE-99 without recalculating HMAC
      const tampered = signedPayload.replace("ROUTE-4B", "ROUTE-99");
      const verification = verifySignedPassPayload(tampered);
      assert.equal(verification.valid, false);
      assert.equal(verification.error, "TAMPERED_PAYLOAD");
    });

    test("rejects expired pass payload", () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      const expiredPayload = generateSignedPassPayload({
        enrollmentId: "UNI2026002",
        routeId: "ROUTE-1A",
        zone: "Zone A",
        validUntil: pastDate,
      });

      const verification = verifySignedPassPayload(expiredPayload);
      assert.equal(verification.valid, false);
      assert.equal(verification.error, "EXPIRED_PASS");
    });

    test("generates and verifies valid signed receipt payload", () => {
      const receiptPayload = generateSignedReceiptPayload({
        receiptId: "REC-998811",
        studentId: "STU-001",
        amount: 15000,
        paymentDate: "2026-10-04T12:00:00Z",
      });

      assert.ok(receiptPayload.startsWith("GLOW_RECEIPT|"));
      const verification = verifySignedReceiptPayload(receiptPayload);
      assert.equal(verification.valid, true);
      assert.equal(verification.receiptId, "REC-998811");
      assert.equal(verification.amount, 15000);
    });

    test("rejects tampered receipt payload (amount altered)", () => {
      const receiptPayload = generateSignedReceiptPayload({
        receiptId: "REC-998811",
        studentId: "STU-001",
        amount: 15000,
        paymentDate: "2026-10-04T12:00:00Z",
      });

      const tampered = receiptPayload.replace("15000", "5000");
      const verification = verifySignedReceiptPayload(tampered);
      assert.equal(verification.valid, false);
    });

    test("driver endpoint POST /api/v1/driver/validate-pass rejects tampered payload with 400", async () => {
      const res = await fetch(`${baseUrl}/api/v1/driver/validate-pass`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${driverToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrPayload: "GLOW_PASS|FORGED_STUDENT|FORGED_ROUTE|Zone A|2026-12-31T00:00:00Z|deadbeefsignature",
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.valid, false);
      assert.equal(data.status, "REJECTED");
      assert.equal(data.error?.code, "TAMPERED_PAYLOAD");
    });
  });

  describe("5. Anti-Malware File Upload Guard & Scanner", () => {
    test("scanner rejects file with embedded script tags", async () => {
      const { scanUploadedFile } = await import("../src/middleware/uploadMiddleware.js");
      const tempPath = path.join(process.cwd(), "temp_malicious_test.pdf");
      try {
        fs.writeFileSync(tempPath, "%PDF-1.4\n" + "<scr" + "ipt>alert('xss')</scr" + "ipt>\n%%EOF");
        let statusSent = null;
        let bodySent = null;
        let nextCalled = false;
        const req = { file: { path: tempPath, originalname: "exploit.pdf", mimetype: "application/pdf" } };
        const res = {
          status: (code) => { statusSent = code; return res; },
          json: (body) => { bodySent = body; return res; },
        };
        await scanUploadedFile(req, res, () => { nextCalled = true; });

        assert.equal(statusSent, 400);
        assert.equal(bodySent?.error?.code, "MALWARE_DETECTED");
        assert.equal(nextCalled, false);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    });

    test("scanner rejects file with prohibited executable payload", async () => {
      const { scanUploadedFile } = await import("../src/middleware/uploadMiddleware.js");
      const tempPath = path.join(process.cwd(), "temp_script_test.pdf");
      try {
        const prohibitedTag = "<" + "?ph" + "p";
        fs.writeFileSync(tempPath, `%PDF-1.4\n${prohibitedTag} echo "hi"; ?>\n%%EOF`);
        let statusSent = null;
        let bodySent = null;
        let nextCalled = false;
        const req = { file: { path: tempPath, originalname: "backdoor.pdf", mimetype: "application/pdf" } };
        const res = {
          status: (code) => { statusSent = code; return res; },
          json: (body) => { bodySent = body; return res; },
        };
        await scanUploadedFile(req, res, () => { nextCalled = true; });

        assert.equal(statusSent, 400);
        assert.equal(bodySent?.error?.code, "MALWARE_DETECTED");
        assert.equal(nextCalled, false);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    });

    test("scanner accepts genuine PDF document", async () => {
      const { scanUploadedFile } = await import("../src/middleware/uploadMiddleware.js");
      const tempPath = path.join(process.cwd(), "temp_clean_test.pdf");
      try {
        fs.writeFileSync(tempPath, "%PDF-1.5\n%Valid student deposit bank slip\n%%EOF");
        let statusSent = null;
        let nextCalled = false;
        const req = { file: { path: tempPath, originalname: "deposit.pdf", mimetype: "application/pdf" } };
        const res = {
          status: (code) => { statusSent = code; return res; },
          json: () => res,
        };
        await scanUploadedFile(req, res, () => { nextCalled = true; });

        assert.equal(statusSent, null);
        assert.equal(nextCalled, true);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    });
  });

  describe("6. CSRF Protection for Refresh Token Cookie Flow", () => {
    test("POST /api/v1/auth/refresh rejects refresh request with cookie but missing CSRF token with 403", async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: "refreshToken=simulated_refresh_token_jwt",
          "Content-Type": "application/json",
        },
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.error?.code, "EBADCSRFTOKEN");
    });
  });
});
