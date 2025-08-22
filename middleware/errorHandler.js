module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: "Duplicate key error",
      details: err.message,
    });
  }

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Max 50MB allowed",
      });
    }
    return res.status(400).json({
      error: "File upload error",
      details: err.message,
    });
  }

  // Default error handler
  res.status(500).json({
    error: "Something went wrong on the server",
  });
};
