/**
 * This file sets up the Express server with comprehensive error handling at multiple levels.
 *
 * ERROR HANDLING FLOW:
 * 1. Routes (asyncHandler catches async errors) → Global Error Handler
 * 2. Routes throw errors → Global Error Handler formats response with standardized JSON
 * 3. Undefined routes → 404 Handler (notFoundHandler)
 * 4. Unhandled async errors → Process-level rejection handler (unhandledRejection)
 * 5. Synchronous errors → Process-level exception handler (uncaughtException)
 *
 * MIDDLEWARE STACK (in order):
 * - helmet: Security headers
 * - cors: Cross-origin requests
 * - express.json(): Parse JSON request bodies
 * - rateLimit: Limit requests per IP
 * - routes: API endpoints (authRouter)
 * - notFoundHandler: Catch undefined routes (404)
 * - globalErrorHandler: Catch all errors from routes
 *
 * KEY CONCEPTS:
 * - asyncHandler: Wraps route handlers to automatically catch promise rejections
 * - reason: The error/value that rejected a promise (caught in unhandledRejection handler)
 * - Middleware order matters: globalErrorHandler must be LAST
 *
 * LINKED MIDDLEWARE FILES:
 * - ./middlewares/notFoundHandler.js: Handles undefined routes
 * - ./middlewares/globalErrorHandler.js: Catches and formats all errors with standardized JSON
 * - ./routes/authRoutes.js: Uses asyncHandler to catch errors automatically
 */

const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const notFoundHandler = require('./middlewares/notFoundHandler');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const authRouter = require('./routes/authRoutes');
const patientRouter = require('./routes/patientRoutes');
const staffRouter = require('./routes/staffRoutes');
const doctorRouter = require('./routes/doctorRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.use(require('helmet')());
app.use(
  require('cors')({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
); // Add render URL when deployed

app.use(express.json());

// ========== Rate Limiting Middleware ==========

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests from this IP' },
});

app.use(limiter);

// ========== Mount API Routes ==========

const mountRoutes = () => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/patients', patientRouter);
  app.use('/api/v1/staff', staffRouter);
  app.use('/api/v1/doctors', doctorRouter);
  app.use('/api/v1/bookings', bookingRouter);
};

mountRoutes();

// ========== GET / — API Welcome Message (Public) ==========
app.get('/', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'Hello from MediMate!',
    version: '1.0.0',
  });
});

// ========== GET /databaseHealth — Database Status (Public) ==========
app.get('/databaseHealth', (_request, response) => {
  response.status(200).json({
    success: true,
    models: mongoose.connection.modelNames(),
    host: mongoose.connection.host || 'Not connected',
  });
});

// ========== 404 / notFoundHandler ==========
app.use(notFoundHandler);

// ========== globalErrorHandler ==========
app.use(globalErrorHandler);

// ========== Unhandled Rejections ==========
// Safety net! Catches any async errors that weren't caught by asyncHandler and prevents server crash
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// ========== Uncaught Exceptions ==========
// Safety net! Catches regular errors that happen outside try/catch blocks and prevents server crash
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
