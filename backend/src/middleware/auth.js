import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Access token is missing or malformed",
      },
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "glow_super_secret_jwt_access_key_2026";

  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: err.name === "TokenExpiredError" ? "Access token has expired" : "Invalid access token",
      },
    });
  }
};
