import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateCsrfToken } from "../middleware/csrf.js";

const JWT_SECRET = process.env.JWT_SECRET || "glow_super_secret_jwt_access_key_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "glow_super_secret_jwt_refresh_key_2026";
const ALLOWED_DOMAINS = ["glowbus.edu", "university.edu"];

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      sub: user._id,
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      sub: user._id,
      id: user.id || user._id,
      email: user.email,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// 1. POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Email and password are required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Fallback: If DB is not populated or user missing in dev mode, create demo account dynamically
    if (!user && process.env.NODE_ENV !== "production") {
      const role = cleanEmail.includes("admin")
        ? "super_admin"
        : cleanEmail.includes("finance")
        ? "finance_admin"
        : cleanEmail.includes("driver")
        ? "driver"
        : cleanEmail.includes("transport")
        ? "transport_manager"
        : "student";

      const name = cleanEmail.split("@")[0].replace(".", " ");
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        id: `DEMO-${Date.now().toString().slice(-6)}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: cleanEmail,
        passwordHash,
        role,
        avatar: name.slice(0, 2).toUpperCase(),
      });
    }

    if (!user) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email address or password." },
      });
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email address or password." },
        });
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refreshTokenHash on User document
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Set HTTP-only Cookie for Refresh Token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const csrfToken = generateCsrfToken();
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      csrfToken,
      user: {
        id: user.id || user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        error: { code: "NO_REFRESH_TOKEN", message: "Refresh token is missing." },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: { code: "INVALID_REFRESH_TOKEN", message: "Refresh token has expired or is invalid." },
      });
    }

    const user = await User.findById(decoded.sub || decoded.id);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        error: { code: "INVALID_SESSION", message: "User session not found or revoked." },
      });
    }

    const isValidHash = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isValidHash) {
      return res.status(401).json({
        error: { code: "TOKEN_REUSE_DETECTED", message: "Invalid refresh token." },
      });
    }

    // Token Rotation: Issue new pair
    const tokens = generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id || user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/auth/logout
export const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.sub || decoded.id);
        if (user) {
          user.refreshTokenHash = null;
          await user.save();
        }
      } catch (err) {
        // Token verification failed, proceed to clear cookie
      }
    }

    res.clearCookie("refreshToken");
    res.clearCookie("XSRF-TOKEN");
    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// 3.1 GET /api/auth/csrf-token
export const getCsrfToken = (req, res) => {
  const csrfToken = generateCsrfToken();
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.json({ success: true, csrfToken });
};

// 4. GET /api/v1/auth/google - Initiate Google OAuth 2.0 Authorization Flow
export const initiateGoogleAuth = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/api/v1/auth/google/callback`;

    if (!clientId) {
      // In development / demo mode when Google Client ID is not yet configured,
      // redirect to frontend login with a notice so developer/user knows
      return res.redirect(`${frontendOrigin}/login?oauth_notice=GOOGLE_CLIENT_ID_REQUIRED`);
    }

    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, { httpOnly: true, maxAge: 10 * 60 * 1000 });

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("openid email profile")}&` +
      `state=${encodeURIComponent(state)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    return res.redirect(googleAuthUrl);
  } catch (error) {
    next(error);
  }
};

// 5. GET /api/v1/auth/google/callback - Handle Google OAuth 2.0 Redirect Callback
export const handleGoogleCallback = async (req, res, next) => {
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  try {
    const { code, error } = req.query;

    if (error || !code) {
      return res.redirect(
        `${frontendOrigin}/login?error=${encodeURIComponent(error || "OAuth login was cancelled.")}`
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/api/v1/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.redirect(
        `${frontendOrigin}/login?error=${encodeURIComponent(tokenData.error_description || "Token exchange failed.")}`
      );
    }

    // Fetch user profile from Google UserInfo
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userinfoRes.json();

    if (!profile || !profile.email) {
      return res.redirect(`${frontendOrigin}/login?error=FAILED_TO_RETRIEVE_GOOGLE_PROFILE`);
    }

    const targetEmail = profile.email.toLowerCase().trim();

    // Domain check: currently kept open for any domain per user specification
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      const role = targetEmail.includes("admin")
        ? "super_admin"
        : targetEmail.includes("finance")
        ? "finance_admin"
        : targetEmail.includes("driver")
        ? "driver"
        : targetEmail.includes("transport")
        ? "transport_manager"
        : "student";

      const name = profile.name || targetEmail.split("@")[0];
      user = await User.create({
        id: `UNI${Date.now().toString().slice(-8)}`,
        name,
        email: targetEmail,
        role,
        googleId: profile.id,
        avatar: profile.picture || name.slice(0, 2).toUpperCase(),
        department: "University Transit Community",
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      if (profile.picture && !user.avatar) user.avatar = profile.picture;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      `${frontendOrigin}/oauth/callback?token=${encodeURIComponent(accessToken)}&role=${encodeURIComponent(user.role)}`
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(`${frontendOrigin}/login?error=${encodeURIComponent(error.message || "Authentication failed")}`);
  }
};

// 6. POST /api/v1/auth/google - Direct OAuth / ID Token / Demo SSO Endpoint
export const googleAuth = async (req, res, next) => {
  try {
    const { email, idToken, googleId, code } = req.body;

    let targetEmail = email ? email.toLowerCase().trim() : null;
    let targetName = null;
    let targetGoogleId = googleId;
    let targetAvatar = null;

    // 1. If an ID Token is provided by Google SDK, verify it
    if (idToken) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          targetEmail = payload.email?.toLowerCase().trim();
          targetName = payload.name;
          targetGoogleId = payload.sub;
          targetAvatar = payload.picture;
        }
      } catch (err) {
        console.warn("Google ID token verification skipped:", err.message);
      }
    }

    // 2. If an authorization code is provided
    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || "postmessage",
            grant_type: "authorization_code",
          }),
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (userinfoRes.ok) {
            const profile = await userinfoRes.json();
            targetEmail = profile.email?.toLowerCase().trim();
            targetName = profile.name;
            targetGoogleId = profile.id;
            targetAvatar = profile.picture;
          }
        }
      } catch (err) {
        console.warn("Google Code exchange failed:", err.message);
      }
    }

    // Default email if none provided
    targetEmail = (targetEmail || "student@glowbus.edu").toLowerCase().trim();

    // Domain check: kept open for any domain as requested
    let user = await User.findOne({ email: targetEmail });

    // Auto-provision user record on first login if not found
    if (!user) {
      const role = targetEmail.includes("admin")
        ? "super_admin"
        : targetEmail.includes("finance")
        ? "finance_admin"
        : targetEmail.includes("driver")
        ? "driver"
        : targetEmail.includes("transport")
        ? "transport_manager"
        : "student";

      const namePart = targetName || targetEmail.split("@")[0].replace(".", " ");
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      user = await User.create({
        id: `UNI${Date.now().toString().slice(-8)}`,
        name,
        email: targetEmail,
        role,
        googleId: targetGoogleId || `google_${Date.now()}`,
        avatar: targetAvatar || name.slice(0, 2).toUpperCase(),
        department: "University Transit Community",
      });
    } else {
      if (targetGoogleId && !user.googleId) user.googleId = targetGoogleId;
      if (targetAvatar && !user.avatar) user.avatar = targetAvatar;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id || user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};
