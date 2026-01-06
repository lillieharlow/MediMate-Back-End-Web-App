/**
 * Auth Routes: User authentication endpoints
 *
 * Handles HTTP endpoints related to user authentication:
 * - POST /api/v1/auth/signup       : Register new user (public)
 * - POST /api/v1/auth/login        : User login (public)
 *
 * Features:
 * - Password hashing with bcryptjs
 * - JWT token generation (8h expiry)
 * - Input validation middleware
 *
 * Error Handling:
 * - asyncHandler automatically catches errors thrown in async functions
 * - Errors are passed to the global error handler with standardized JSON responses
 *
 * Response Format:
 * - Success: { success: true, message, data... }
 * - Error: { success: false, status, message, timestamp }
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const validateSignup = require('../middlewares/validateSignup');
const validateLogin = require('../middlewares/validateLogin');
const asyncHandler = require('../middlewares/asyncHandler');
const createError = require('../utils/httpError');

const router = express.Router();

// ========== POST /api/v1/auth/signup — Register new user (Public) ==========
router.post(
  '/signup',
  validateSignup,
  asyncHandler(async (request, response) => {
    const { email, password } = request.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto assign 'patient' userType. Only staff can change to 'staff' or 'doctor'.
    const patientType = await mongoose.model('UserType').findOne({ typeName: 'patient' });

    const user = new User({ email, hashedPassword, userType: patientType._id });
    await user.save();

    response.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: user._id,
    });
  })
);

// ========== POST /api/v1/auth/login — User login (Public) ==========
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (request, response) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email }).select('+hashedPassword').populate('userType');
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) {
      throw createError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    response.json({
      success: true,
      token,
      userType: user.userType,
    });
  })
);

module.exports = router;
