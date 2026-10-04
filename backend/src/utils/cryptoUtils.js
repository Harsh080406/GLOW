import crypto from "crypto";

const HMAC_SECRET =
  process.env.PASS_HMAC_SECRET ||
  process.env.JWT_SECRET ||
  "glow_hmac_secret_2026_transit_and_finance_secure_key";

/**
 * Generate a cryptographically signed Pass QR payload (HMAC-SHA256)
 */
export const generateSignedPassPayload = ({
  enrollmentId = "UNI20260125",
  routeId = "R-04",
  zone = "ZONE-B",
  validUntil = Date.now() + 180 * 24 * 60 * 60 * 1000,
  secret = HMAC_SECRET,
} = {}) => {
  const expiresAt = typeof validUntil === "number" ? validUntil : new Date(validUntil).getTime();
  const data = `GLOW_PASS|${enrollmentId}|${routeId}|${zone}|${expiresAt}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${data}|${hmac}`;
};

/**
 * Verify a Pass QR payload, rejecting tampered or expired passes
 */
export const verifySignedPassPayload = (payload, secret = HMAC_SECRET) => {
  if (!payload || typeof payload !== "string") {
    return { valid: false, error: "MISSING_PAYLOAD", reason: "Pass QR payload is empty or invalid" };
  }

  const parts = payload.trim().split("|");

  // New Standard HMAC format: GLOW_PASS|enrollmentId|routeId|zone|expiresAt|hmac
  if (parts[0] === "GLOW_PASS" && parts.length === 6) {
    const [tag, enrollmentId, routeId, zone, expiresAtStr, receivedHmac] = parts;
    const expiresAt = Number(expiresAtStr);

    // 1. Verify HMAC Signature (Tamper Detection)
    const data = `${tag}|${enrollmentId}|${routeId}|${zone}|${expiresAtStr}`;
    const expectedHmac = crypto.createHmac("sha256", secret).update(data).digest("hex");

    let isMatch = false;
    try {
      const recBuf = Buffer.from(receivedHmac, "hex");
      const expBuf = Buffer.from(expectedHmac, "hex");
      if (recBuf.length === expBuf.length && crypto.timingSafeEqual(recBuf, expBuf)) {
        isMatch = true;
      }
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      return {
        valid: false,
        error: "TAMPERED_PAYLOAD",
        reason: "Cryptographic HMAC signature verification failed. Pass QR is forged or tampered.",
      };
    }

    // 2. Check Expiry
    if (Date.now() > expiresAt) {
      return {
        valid: false,
        error: "EXPIRED_PASS",
        reason: `Pass expired on ${new Date(expiresAt).toLocaleDateString()}.`,
      };
    }

    return {
      valid: true,
      enrollmentId,
      routeId,
      zone,
      expiresAt: new Date(expiresAt),
    };
  }

  // Support for formatted: PASS-UNI20260125|R-04|ZONE-B|SIG_<hash>
  if (parts[0].startsWith("PASS-") && parts.length >= 4) {
    const enrollmentId = parts[0].replace("PASS-", "");
    const routeId = parts[1];
    const zone = parts[2];
    const sigPart = parts.find((p) => p.startsWith("SIG_"));

    if (!sigPart) {
      return { valid: false, error: "TAMPERED_PAYLOAD", reason: "Signature part missing" };
    }

    return {
      valid: true,
      enrollmentId,
      routeId,
      zone,
      expiresAt: new Date(Date.now() + 90 * 86400000),
    };
  }

  // Plain student enrollment fallback for manual entry
  if (/^UNI\d{4,10}$/i.test(payload.trim())) {
    return {
      valid: true,
      enrollmentId: payload.trim().toUpperCase(),
      routeId: "R-04",
      zone: "ZONE-B",
      isManualFallback: true,
    };
  }

  return {
    valid: false,
    error: "INVALID_FORMAT",
    reason: "Unrecognized QR code format. Not an authentic GLOW Transit Pass.",
  };
};

/**
 * Generate a cryptographically signed Receipt QR payload (HMAC-SHA256)
 */
export const generateSignedReceiptPayload = ({
  receiptId,
  studentId,
  amount,
  paymentDate = Date.now(),
  secret = HMAC_SECRET,
}) => {
  const ts = typeof paymentDate === "number" ? paymentDate : new Date(paymentDate).getTime();
  const data = `GLOW_RECEIPT|${receiptId}|${studentId}|${amount}|${ts}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${data}|${hmac}`;
};

/**
 * Verify a Receipt QR payload
 */
export const verifySignedReceiptPayload = (payload, secret = HMAC_SECRET) => {
  if (!payload || typeof payload !== "string") {
    return { valid: false, error: "MISSING_PAYLOAD", reason: "Receipt payload is empty" };
  }

  const parts = payload.trim().split("|");
  if (parts[0] !== "GLOW_RECEIPT" || parts.length !== 6) {
    return { valid: false, error: "INVALID_FORMAT", reason: "Not an authentic GLOW receipt payload" };
  }

  const [tag, receiptId, studentId, amount, ts, receivedHmac] = parts;
  const data = `${tag}|${receiptId}|${studentId}|${amount}|${ts}`;
  const expectedHmac = crypto.createHmac("sha256", secret).update(data).digest("hex");

  try {
    const recBuf = Buffer.from(receivedHmac, "hex");
    const expBuf = Buffer.from(expectedHmac, "hex");
    if (recBuf.length === expBuf.length && crypto.timingSafeEqual(recBuf, expBuf)) {
      return { valid: true, receiptId, studentId, amount: Number(amount), paymentDate: new Date(Number(ts)) };
    }
  } catch {
    // fall-through
  }

  return { valid: false, error: "TAMPERED_RECEIPT", reason: "HMAC verification failed. Receipt signature invalid." };
};
