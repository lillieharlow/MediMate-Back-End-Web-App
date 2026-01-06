/**
 * Error Utility:
 * - Creates standardized error objects with HTTP status codes
 * - Used across all routes for consistent error handling
 * - Works with global error handler to format responses
 */

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = createError;
