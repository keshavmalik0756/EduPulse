class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false; // Add success flag for consistent error responses

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;