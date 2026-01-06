/**
 * Async Handler Wrapper:
 * - Identical to npm package 'express-async-handler'
 * - Wraps async route handlers to automatically catch promise rejections
 * - Passes caught errors to the global error handler
 * - Eliminates need for try/catch blocks in routes
 *
 * Usage: router.post('/path', asyncHandler(async (req, res) => { ... }))
 */

const asyncHandler = (fn) => (request, response, next) => {
  // Wrap the async function in Promise.resolve() to handle both:
  // 1. Functions that return promises
  // 2. Functions that throw errors synchronously
  // .catch(next) sends any errors to the next middleware (globalErrorHandler)
  Promise.resolve(fn(request, response, next)).catch(next);
};

module.exports = asyncHandler;
