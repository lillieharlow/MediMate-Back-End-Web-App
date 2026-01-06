/**
 * Validation Handler Middleware:
 * - Handles validation errors from express-validator
 * - Returns validation errors to global error handler if invalid
 * - Reusable across all validation middleware
 */

const { validationResult } = require('express-validator');

const handleValidationErrors = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.errors = errors.array();
    return next(error);
  }
  return next();
};

module.exports = handleValidationErrors;
