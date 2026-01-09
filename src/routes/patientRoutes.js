/**
 * Patient Routes: Patient profile CRUD operations
 *
 * Handles HTTP endpoints for patient profiles:
 * - POST /api/v1/patients          : Create patient profile (patient only)
 * - GET /api/v1/patients/:userId   : Get patient by userId (Staff all,
 *      patients self, doctors with bookings for that patient)
 * - PATCH /api/v1/patients/:userId : Update patient profile (staff & patient only)
 * - DELETE /api/v1/patients/:userId: Delete patient (staff only)
 */

const express = require('express');

const profileController = require('../controllers/profileController');
const asyncHandler = require('../middlewares/asyncHandler');
const authorizeUserTypes = require('../middlewares/authorizeUserTypes');
const jwtAuth = require('../middlewares/jwtAuth');
const validateFields = require('../middlewares/validateFields');
const Booking = require('../models/Bookings');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const createError = require('../utils/httpError');

const router = express.Router();

// ========== POST /api/v1/patients — Create patient profile ==========
// Authorized: Patient only
router.post(
  '/',
  jwtAuth,
  authorizeUserTypes('patient'),
  asyncHandler(async (request, response) => {
    const { firstName, middleName, lastName, dateOfBirth, phone } = request.body;
    const { userId } = request.user;

    const patient = await profileController.createProfile(PatientProfile, userId, {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      phone,
    });

    response.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      userId: patient._id,
    });
  })
);

// ========== GET /api/v1/patients/:userId — Get one patient by userId ==========
// Authorized: Staff all, patient self, doctors only with bookings for that patient
router.get(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor', 'patient'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requestingUserId = request.user.userId;

    const requestingUser = await User.findById(requestingUserId).populate('userType');
    const userTypeName = requestingUser.userType.typeName;

    if (userTypeName === 'patient') {
      if (requestingUserId !== userId) {
        throw createError('You do not have permission to access this profile', 403);
      }
    } else if (userTypeName === 'doctor') {
      const booking = await Booking.findOne({
        doctorId: requestingUserId,
        patientId: userId,
      });

      if (!booking) {
        throw createError('You do not have permission to access this profile', 403);
      }
    }

    const patient = await profileController.getProfileById(PatientProfile, userId);

    response.status(200).json(patient);
  })
);

// ========== PATCH /api/v1/patients/:userId — Update patient profile ==========
// Authorized: Staff all, patient self
router.patch(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'patient'),
  validateFields(['firstName', 'middleName', 'lastName', 'dateOfBirth', 'phone']),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requestingUserId = request.user.userId;

    const requestingUser = await User.findById(requestingUserId).populate('userType');
    const userTypeName = requestingUser.userType.typeName;
    if (userTypeName === 'patient' && requestingUserId !== userId) {
      throw createError('You do not have permission to update this profile', 403);
    }

    const { firstName, middleName, lastName, dateOfBirth, phone } = request.body;
    const update = {};
    if (firstName !== undefined) update.firstName = firstName;
    if (middleName !== undefined) update.middleName = middleName;
    if (lastName !== undefined) update.lastName = lastName;
    if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
    if (phone !== undefined) update.phone = phone;

    const updated = await profileController.updateProfile(PatientProfile, userId, update);

    response.status(200).json({ success: true, data: updated });
  })
);

// ========== DELETE /api/v1/patients/:userId — Delete patient profile ==========
// Authorized: Staff only
router.delete(
  '/:userId',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;

    await profileController.deleteProfile(PatientProfile, userId);

    response.status(200).json({ success: true, message: 'Patient profile deleted' });
  })
);

module.exports = router;
