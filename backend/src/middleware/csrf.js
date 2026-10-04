import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || "glow_csrf_secret_key_2026";

/**
 * Generate a cryptographically signed CSRF token
 */
export const generateCsrfToken = () => {
  const nonce = crypto.randomBytes(16).toString("hex");
  const hmac = crypto.createHmac("sha256", CSRF_SECRET).update(nonce).digest("hex");
  return `${nonce}.${hmac}`;
};

/**
 * Verify a signed CSRF token with constant-time equality
 */
export const verifyCsrfToken = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [nonce, hmac] = parts;
  const expectedHmac = crypto.createHmac("sha256", CSRF_SECRET).update(nonce).digest("hex");
  try {
    const hmacBuf = Buffer.from(hmac, "hex");
    const expBuf = Buffer.from(expectedHmac, "hex");
    if (hmacBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(hmacBuf, expBuf);
  } catch {
    return false;
  }
};

/**
 * CSRF Protection Middleware for Cookie-based Refresh flow
 */
export const requireCsrfForCookieAuth = (req, res, next) => {
  // If the request uses the ambient httpOnly refreshToken cookie:
  if (req.cookies && req.cookies.refreshToken) {
    const clientToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      req.body?._csrf;
    const cookieToken = req.cookies["XSRF-TOKEN"];

    if (!clientToken || !verifyCsrfToken(clientToken)) {
      return res.status(403).json({
        error: {
          code: "EBADCSRFTOKEN",
          message: "CSRF token missing or invalid for cookie-based session refresh.",
        },
      });
    }

    // Double submit validation if cookieToken is also present
    if (cookieToken && cookieToken !== clientToken) {
      return res.status(403).json({
        error: {
          code: "EBADCSRFTOKEN",
          message: "CSRF token mismatch between request header and cookie.",
        },
      });
    }
  }
  next();
};
