/**
 * Not Found Handler:
 * - Catches requests to routes that don't exist and returns standardized 404 response
 */

const notFoundHandler = (request, response) => {
  response.status(404).json({
    success: false,
    status: 404,
    message: 'Route not found',
    path: request.originalUrl,
    method: request.method,
    timestamp: new Date().toISOString()
  });
};

module.exports = notFoundHandler;
