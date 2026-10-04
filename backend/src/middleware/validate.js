export const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: err.errors.map((e) => `${e.path.join(".") || "field"}: ${e.message}`).join(", "),
          details: err.errors,
        },
      });
    }
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: err.message },
    });
  }
};
