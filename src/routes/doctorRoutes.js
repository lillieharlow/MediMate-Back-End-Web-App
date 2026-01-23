/**
 * Doctor Routes: Doctor profile CRUD endpoints
 *
 * Handles HTTP endpoints for doctor profiles:
 * - GET /api/v1/doctors                : List all doctors (staff and patient only)
 * - GET /api/v1/doctors/:userId        : Get one doctor (staff; doctor can view self; patient with appointment)
 * - POST /api/v1/doctors               : Create doctor profile (staff only)
 * - PATCH /api/v1/doctors/:userId      : Update doctor (staff; doctor can update self)
 * - DELETE /api/v1/doctors/:userId     : Delete doctor profile (staff only)
 */

const express = require('express');

const profileController = require('../controllers/profileController');
const asyncHandler = require('../middlewares/asyncHandler');
const authorizeUserTypes = require('../middlewares/authorizeUserTypes');
const jwtAuth = require('../middlewares/jwtAuth');
const validateFields = require('../middlewares/validateFields');
const createError = require('../utils/httpError');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

const router = express.Router();

// ========== GET /api/v1/doctors — List all doctors ==========
// Authorized: Staff and patient only
router.get(
  '/',
  jwtAuth,
  authorizeUserTypes('staff', 'patient'),
  asyncHandler(async (request, response) => {
    const doctors = await profileController.getAllProfiles(DoctorProfile);

    response.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  })
);

// ========== GET /api/v1/doctors/:userId — Get one doctor ==========
// Authorized: Staff, doctor self, patient with appointment
router.get(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor', 'patient'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;

    if (requesterType === 'doctor' && requester.id !== userId) {
      throw createError('You do not have permission to access this profile', 403);
    }

    const doctor = await profileController.getProfileById(DoctorProfile, userId);

    response.status(200).json({
      success: true,
      data: doctor,
    });
  })
);

// ========== POST /api/v1/doctors — Create doctor profile ==========
// Authorized: Staff only (creates profile for target userId)
router.post(
  '/',
  jwtAuth,
  authorizeUserTypes('staff'),
  validateFields(['userId', 'shiftStartTime', 'shiftEndTime', 'firstName', 'lastName']),
  asyncHandler(async (request, response) => {
    const { userId, shiftStartTime, shiftEndTime, firstName, lastName } = request.body;

    const doctor = await profileController.createProfile(DoctorProfile, userId, {
      shiftStartTime,
      shiftEndTime,
      firstName,
      lastName,
    });

    response.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      userId: doctor.user._id,
    });
  })
);

// ========== PATCH /api/v1/doctors/:userId — Update doctor profile ==========
// Authorized: Staff and doctor self
router.patch(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;

    if (requesterType === 'doctor' && requester.id !== userId) {
      throw createError('You do not have permission to update this profile', 403);
    }

    const { shiftStartTime, shiftEndTime, firstName, lastName } = request.body;
    const update = {};
    if (shiftStartTime !== undefined) update.shiftStartTime = shiftStartTime;
    if (shiftEndTime !== undefined) update.shiftEndTime = shiftEndTime;
    if (firstName !== undefined) update.firstName = firstName;
    if (lastName !== undefined) update.lastName = lastName;

    const updatedDoctor = await profileController.updateProfile(DoctorProfile, userId, update);

    response.status(200).json({
      success: true,
      data: updatedDoctor,
    });
  })
);

// ========== DELETE /api/v1/doctors/:userId — Delete doctor profile ==========
// Authorized: Staff only
router.delete(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;

    await profileController.deleteProfile(DoctorProfile, userId);

    response.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully',
    });
  })
);

module.exports = router;
