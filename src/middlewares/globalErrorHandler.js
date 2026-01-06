/**
 * Global Error Handler:
 * - Catches all errors thrown by routes
 * - Formats them with standardized JSON
 * - Maps error types to appropriate HTTP status codes
 * - Logs errors for debugging
 */

// Map error names to HTTP status codes
const errorStatusMap = {
  ValidationError: 400,
  CastError: 400,
  JsonWebTokenError: 401,
  TokenExpiredError: 401,
  MongoServerError: 500,
  MongoNetworkError: 503,
};

const globalErrorHandler = (error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  const status = errorStatusMap[error.name] || error.status || error.statusCode || 500;

  const errorResponse = {
    success: false,
    status,
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  };

  if (error.name === 'ValidationError') {
    errorResponse.errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  } else if (error.errors && Array.isArray(error.errors)) {
    errorResponse.errors = error.errors;
  }

  console.error(`[${errorResponse.timestamp}] Error (${error.name}):`, error.stack);

  return response.status(status).json(errorResponse);
};

module.exports = globalErrorHandler;
