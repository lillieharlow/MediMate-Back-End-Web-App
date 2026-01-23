/**
 * Authorization User Type Middleware: Restricts routes by user type
 *
 * Checks if the authenticated user's type is in the allowed to make the request.
 * Throws a 403 if user type is not authorized.
 */

const User = require('../models/User');
const createError = require('../utils/httpError');

const authorizeUserTypes =
  (...allowedTypes) =>
  async (request, response, next) => {
    try {
      const user = await User.findById(request.user.userId).populate('userType');

      if (!user) {
        throw createError('User not found', 401);
      }

      const userTypeName = user.userType.typeName;

      if (!allowedTypes.includes(userTypeName)) {
        throw createError('You do not have permission to access this resource', 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };

module.exports = authorizeUserTypes;
