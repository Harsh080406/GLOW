import AuditLog from "../models/AuditLog.js";

/**
 * Express middleware that intercepts all mutating actions (POST, PUT, PATCH, DELETE)
 * on finance routes and logs an audit_logs entry with actor, action type, target, timestamp, and IP.
 */
export const auditLogger = (targetCollection = "Finance") => {
  return (req, res, next) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return next();
    }

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const recordAuditLog = async (statusCode) => {
      try {
        if (statusCode >= 200 && statusCode < 400) {
          const actorId = req.user?.id || req.user?._id;
          const actionType = `${req.method} ${req.baseUrl || ""}${req.path}`;
          const targetId = req.params?.id || req.body?.studentId || req.body?._id || "N/A";

          // Format clean details string without sensitive secrets
          const safeBody = { ...req.body };
          delete safeBody.password;
          delete safeBody.passwordHash;
          delete safeBody.signingSecret;

          const details = `${req.method} action on ${req.originalUrl} | Target: ${targetId} | Payload: ${JSON.stringify(safeBody).slice(0, 300)}`;
          const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.ip ||
            req.socket?.remoteAddress ||
            "127.0.0.1";

          await AuditLog.create({
            actorId: actorId || null,
            actionType,
            targetCollection,
            targetId: String(targetId),
            details,
            ip,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.warn("[AuditLogger] Failed to write audit log:", err.message);
      }
    };

    res.json = (body) => {
      recordAuditLog(res.statusCode);
      return originalJson(body);
    };

    res.send = (body) => {
      recordAuditLog(res.statusCode);
      return originalSend(body);
    };

    next();
  };
};

export default auditLogger;
