/**
 * Validate Request Fields Middleware:
 * - Checks that the request.body only contains allowed fields
 * - Throws 400 error if any unexpected fields are present
 */

const createError = require('../utils/httpError');
const asyncHandler = require('./asyncHandler');

const validateFields = (allowedFields) =>
  asyncHandler((request, response, next) => {
    const requestFields = Object.keys(request.body);
    const unexpectedFields = requestFields.filter((field) => !allowedFields.includes(field));

    if (unexpectedFields.length > 0) {
      throw createError(`Unexpected fields: ${unexpectedFields.join(', ')}`, 400);
    }
    next();
  });

module.exports = validateFields;
