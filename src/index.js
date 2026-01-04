const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const authRouter = require('./routes/authRoutes');

const app = express();

app.use(require('helmet')());
app.use(require('cors')({ origin: ['http://localhost:3000'], optionsSuccessStatus: 200 })); // Add render URL when deployed
app.use(express.json());

// ========== Rate Limiting Middleware ==========

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP' },
});

app.use(limiter);

// ========== Mount API Routes ==========

const mountRoutes = (app) => {
  app.use('/api/v1/auth', authRouter);
};

mountRoutes(app);

// ========== GET / — API Welcome Message (Public) ==========
app.get('/', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Hello from MediMate!',
    version: '1.0.0',
  });
});

// ========== GET /databaseHealth — Database Status (Public) ==========
app.get('/databaseHealth', (request, response) => {
  response.status(200).json({
    success: true,
    models: mongoose.connection.modelNames(),
    host: mongoose.connection.host || 'Not connected',
  });
});

// ========== ALL /* — Catch-all 404 Handler ==========
app.all(/.*/, (request, response) => {
  response.status(404).json({
    success: false,
    message: 'No route with that path found!',
    attemptedPath: request.path,
  });
});

app.use(globalErrorHandler);

module.exports = app;