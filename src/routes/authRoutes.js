/**
 * Auth Routes: User authentication endpoints
 *
 * Handles HTTP endpoints related to user authentication:
 * - POST /api/v1/auth/signup       : Register new user (public)
 * - POST /api/v1/auth/login        : User login (public)
 *
 * Features:
 * - Password hashing with bcryptjs
 * - JWT token generation (3d expiry)
 * - Input validation middleware
 * - Error handling with global handler
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const validateSignup = require('../middlewares/validateSignup');

const router = express.Router();

// ========== POST /api/v1/auth/signup — Register new user (Public) ==========
router.post('/signup', validateSignup, async (request, response, next) => {
  try {
    const { email, hashedPassword } = request.body;
    // Auto assign 'patient' userType. Only staff can change to 'staff' or 'doctor'.
    const patientType = await mongoose.model('UserType').findOne({ typeName: 'patient' });
    
    const user = new User({ email, hashedPassword, userType: patientType._id });
    await user.save();
    response.status(201).json({
      message: 'User created successfully',
      userId: user._id,
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

// ========== POST /api/v1/auth/login — User login (Public) ==========
router.post('/login', async (request, response, next) => {
  try {
    const { email, hashedPassword } = request.body;
    const user = await User.findOne({ email }).select('+hashedPassword').populate('userType');
    if (!user) {
      const error = new Error('Invalid email');
      error.status = 401;
      return next(error);
    }
    const match = await bcrypt.compare(hashedPassword, user.hashedPassword);
    if (!match) {
      const error = new Error('Invalid password');
      error.status = 401;
      return next(error);
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );
    response.json({ token, userType: user.userType });
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

module.exports = router;