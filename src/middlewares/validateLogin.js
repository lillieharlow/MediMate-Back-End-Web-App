/**
 * Login Validation Middleware:
 * - Validates user input for login endpoint
 * - Checks email format and password presence
 * - Returns validation errors to global error handler if invalid
 */

const { body } = require('express-validator');
const handleValidationErrors = require('./validationHandler');

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors,
];

module.exports = validateLogin;
