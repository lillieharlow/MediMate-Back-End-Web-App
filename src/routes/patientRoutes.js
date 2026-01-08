/**
 * Patient Routes: Patient profile CRUD operations
 *
 * Handles HTTP endpoints for patient profiles:
 * - POST /api/v1/patients          : Create patient profile (staff & patient only)
 * - GET /api/v1/patients/:userId   : Get patient by userId (Staff all,
 *      patients self, doctors with bookings for that patient)
 * - GET /api/v1/patients           : List all patients (staff only)
 * - PATCH /api/v1/patients/:userId : Update patient profile (staff & patient only)
 * - DELETE /api/v1/patients/:userId: Delete patient (staff only)
 */

const express = require('express');
const PatientProfile = require('../models/PatientProfile');
const Booking = require('../models/Bookings');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const jwtAuth = require('../middlewares/jwtAuth');
const authorizeUserTypes = require('../middlewares/authorizeUserTypes');
const createError = require('../utils/httpError');

const router = express.Router();

// ========== POST /api/v1/patients — Create patient profile ==========
router.post(
  '/',
  jwtAuth,
  authorizeUserTypes('staff', 'patient'),
  asyncHandler(async (request, response) => {
    const { firstName, middleName, lastName, dateOfBirth, phone } = request.body;

    const { userId } = request.user;

    const existingPatient = await PatientProfile.findById(userId);
    if (existingPatient) {
      throw createError('Patient profile already exists', 409);
    }

    const patient = new PatientProfile({
      _id: userId,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      phone,
    });

    await patient.save();

    response.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      userId: patient._id,
    });
  })
);

// ========== GET /api/v1/patients/:userId — Get one patient by userId ==========
// Authorised: Staff all, patients self, doctors with bookings for that patient
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

    const patient = await PatientProfile.findById(userId);

    if (!patient) {
      throw createError('Patient profile not found', 404);
    }

    response.status(200).json(patient);
  })
);

// ========== GET /api/v1/patients — List all patients (staff only) ==========
router.get(
  '/',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const patients = await PatientProfile.find();

    response.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  })
);

module.exports = router;
