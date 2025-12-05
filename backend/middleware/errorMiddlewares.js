import ErrorHandler from "../utils/errorHandler.js";

// Error Middleware
export const errorMiddleware = (err, req, res, next) => {
  // Log all errors for debugging
  console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id
  });

  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Handle MongoDB WriteConflict error
  if (err.codeName === "WriteConflict") {
    return res.status(500).json({
      success: false,
      message: "Database write conflict occurred. Please retry your request."
    });
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[0];
    const message = `${duplicateField} already exists`;
    err = new ErrorHandler(message, 400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid Token", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Token Expired", 401);
  }

  // Handle MongoDB CastError
  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found: Invalid ${err.path}`, 404);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(e => e.message).join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Final error message
  const message = err.errors
    ? Object.values(err.errors).map(e => e.message).join(" ")
    : err.message;

  return res.status(err.statusCode).json({ 
    success: false, 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Export the error middleware
export { ErrorHandler };