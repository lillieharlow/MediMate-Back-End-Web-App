/**
 * Staff Routes: Staff profile and management endpoints
 *
 * Handles HTTP endpoints for staff profiles:
 * - PATCH /api/v1/staff/userType/:userId       : Change user type (staff only)
 * - POST /api/v1/staff                         : Create staff profile (staff only)
 * - GET /api/v1/staff/:userId                  : Get staff by userId (staff only)
 * - GET /api/v1/staff                          : List all staff (staff only)
 * - GET /api/v1/staff/patients                 : List all patients (staff only)
 * - GET /api/v1/staff/users                    : List all users of any type (staff only)
 * - PATCH /api/v1/staff/:userId                : Update staff profile (staff only)
 * - DELETE /api/v1/staff/:userId               : Delete staff (staff only)
 */

const express = require('express');

const profileController = require('../controllers/profileController');
const asyncHandler = require('../middlewares/asyncHandler');
const authorizeUserTypes = require('../middlewares/authorizeUserTypes');
const jwtAuth = require('../middlewares/jwtAuth');
const validateFields = require('../middlewares/validateFields');
const PatientProfile = require('../models/PatientProfile');
const StaffProfile = require('../models/StaffProfile');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const UserType = require('../models/UserTypes');
const createError = require('../utils/httpError');

const router = express.Router();

// ========== PATCH /api/v1/staff/userType/:userId — Change user type ==========
// Authorized: Staff only
router.patch(
  '/userType/:userId',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const { typeName } = request.body;

    if (!typeName) {
      throw createError('typeName is required', 400);
    }

    const userType = await UserType.findOne({ typeName });
    if (!userType) {
      throw createError('User type not found', 404);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userType: userType._id },
      { new: true }
    ).populate('userType');

    if (!updatedUser) {
      throw createError('User not found', 404);
    }

    response.status(200).json({
      success: true,
      message: 'User type updated successfully',
      data: updatedUser,
    });
  })
);

// ========== POST /api/v1/staff — Create staff profile ==========
// Authorized: Staff only
router.post(
  '/',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const { firstName, lastName } = request.body;
    const { userId } = request.user;

    const staff = await profileController.createProfile(StaffProfile, userId, {
      firstName,
      lastName,
    });

    response.status(201).json({
      success: true,
      message: 'Staff profile created successfully',
      userId: staff.user._id,
    });
  })
);

// ========== GET /api/v1/staff — List all staff ==========
// Authorized: Staff only
router.get(
  '/',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const staff = await profileController.getAllProfiles(StaffProfile);

    response.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  })
);

// ========== GET /api/v1/staff/patients — List all patients ==========
// Authorized: Staff only
router.get(
  '/patients',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const patients = await profileController.getAllProfiles(PatientProfile);

    response.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  })
);

// ========== GET /api/v1/staff/users — List profiles of all user types ==========
// Authorized: Staff only
router.get(
  '/users',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const patients = await profileController.getAllProfiles(PatientProfile);
    const doctors = await profileController.getAllProfiles(DoctorProfile);
    const staff = await profileController.getAllProfiles(StaffProfile);

    response.status(200).json({
      success: true,
      count: patients.length + doctors.length + staff.length,
      data: [...patients, ...doctors, ...staff],
    });
  })
);

// ========== GET /api/v1/staff/:userId — Get staff by userId ==========
// Authorized: Staff only
router.get(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const filter = {};
    if (request.query.firstName) {
      filter.firstName = { $regex: request.query.firstName, $options: 'i' };
    }
    if (request.query.lastName) {
      filter.lastName = { $regex: request.query.lastName, $options: 'i' };
    }
    if (request.query.email) {
      filter.email = { $regex: request.query.email, $options: 'i' };
    }
    if (request.query.dateOfBirth) {
      filter.dob = request.query.dateOfBirth;
    }
    if (request.query.phone) {
      filter.phone = { $regex: request.query.phone, $options: 'i' };
    }

    const patients = await PatientProfile.find(filter);

    response.status(200).json({
      success: true,
      data: staff,
    });
  })
);

// ========== PATCH /api/v1/staff/:userId — Update staff profile ==========
// Authorized: Staff only
router.patch(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff'),
  validateFields(['firstName', 'lastName']),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const { firstName, lastName } = request.body;

    const update = {};
    if (firstName !== undefined) update.firstName = firstName;
    if (lastName !== undefined) update.lastName = lastName;

    const updated = await profileController.updateProfile(StaffProfile, userId, update);

    response.status(200).json({
      success: true,
      data: updated,
    });
  })
);

// ========== DELETE /api/v1/staff/:userId — Delete staff profile ==========
// Authorized: Staff only
router.delete(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;

    await profileController.deleteProfile(StaffProfile, userId);

    response.status(200).json({
      success: true,
      message: 'Staff profile deleted',
    });
  })
);

module.exports = router;
