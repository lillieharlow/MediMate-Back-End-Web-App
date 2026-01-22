/**
 * JWT Authentication Middleware:
 * - Verifies JWT token from Authorization header
 * - Extracts and validates token from "Bearer <token>" format
 * - Attaches decoded user data to request.user if valid
 * - Returns 401 error if token is missing or invalid
 */

const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
  // Extract Authorization header
  const header = request.headers.authorization;

  // Check if Authorization header exists
  if (!header) {
    return response.status(401).json({
      success: false,
      status: 401,
      message: 'Missing token',
      timestamp: new Date().toISOString(),
    });
  }

  // Extract token from "Bearer <token>" format
  const token = header.split(' ')[1];
  
  // Verify token and attach user data to request
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return response.status(401).json({
      success: false,
      status: 401,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    });
  }
};
