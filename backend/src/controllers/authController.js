import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

    return res.json({
      success: true,
      accessToken,
      refreshToken,
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
    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/auth/google & GET /api/auth/google
export const googleAuth = async (req, res, next) => {
  try {
    const { email, idToken, googleId } = req.body;

    const targetEmail = (email || "rahul.sharma@glowbus.edu").toLowerCase().trim();
    const domain = targetEmail.split("@")[1];

    // Validate domain / registered campus account
    if (!ALLOWED_DOMAINS.includes(domain) && !targetEmail.endsWith(".edu")) {
      return res.status(403).json({
        error: {
          code: "NOT_REGISTERED_CAMPUS_ACCOUNT",
          message: `The account ${targetEmail} is not a registered campus account. Please use your official university email (@glowbus.edu).`,
        },
      });
    }

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

      const namePart = targetEmail.split("@")[0].replace(".", " ");
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      user = await User.create({
        id: `UNI${Date.now().toString().slice(-8)}`,
        name,
        email: targetEmail,
        role,
        googleId: googleId || `google_${Date.now()}`,
        avatar: name.slice(0, 2).toUpperCase(),
        department: "University Student Mobility",
      });
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
