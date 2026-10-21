import multer from "multer";

// Unknown /api/* paths answer in JSON like every other API response, instead
// of Express's default HTML "Cannot GET ..." page.
export const apiNotFound = (req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
};

// Global error handler. 4xx errors (bad JSON, oversized body, multer limits)
// carry a safe, user-actionable message. A 5xx is an unexpected failure, so
// its message (which can name collections, paths or driver internals) stays in
// the server log and the client gets a generic one.
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  // Multer's own errors (e.g. LIMIT_FILE_SIZE) don't set .status — surface
  // them as 400s instead of a generic 500.
  const status = err.status || (err instanceof multer.MulterError ? 400 : 500);
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal Server Error" : err.message || "Bad Request",
  });
};
