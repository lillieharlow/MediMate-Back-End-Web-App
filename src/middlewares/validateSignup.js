/**
 * Signup Validation Middleware:
 * - Validates user input for signup endpoint
 * - Checks email format and password length
 * - Returns validation errors to global error handler if invalid
 */

const { body } = require('express-validator');
const handleValidationErrors = require('./validationHandler');

const validateSignup = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  handleValidationErrors,
];

module.exports = validateSignup;
