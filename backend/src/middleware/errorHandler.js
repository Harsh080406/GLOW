export const globalErrorHandler = (err, req, res, next) => {
  console.error("🔥 Unhandled Server Error:", err);

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected internal server error occurred.";

  res.status(statusCode).json({
    error: {
      code: typeof errorCode === "number" ? "SERVER_ERROR" : errorCode,
      message,
    },
  });
};
