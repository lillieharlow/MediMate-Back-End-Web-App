/**
 * Staff Routes: Staff profile and management endpoints
 *
 * Handles HTTP endpoints for staff profiles:
 * - GET /api/v1/staff/patients                 : List all patients (staff only)
 * - PATCH /api/v1/staff/userType/:userId       : Change user type (staff only)
 * - POST /api/v1/staff                         : Create staff profile (staff only)
 * - POST /api/v1/staff/createUser              : Create user of any type (staff only)
 * - GET /api/v1/staff                          : List all staff (staff only)
 * - GET /api/v1/staff/users                    : List all profiles of any user type (staff only)
 * - GET /api/v1/staff/:userId                  : Get staff by userId (staff only)
 * - PATCH /api/v1/staff/:userId                : Update staff profile (staff only)
 * - DELETE /api/v1/staff/:userId               : Delete staff (staff only)
 */

const express = require('express');
const bcrypt = require('bcryptjs');

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

// ========== GET /api/v1/staff/patients — List all patients ==========
// Authorized: Staff only
router.get(
  '/patients',
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
    if (request.query.dateOfBirth) {
      filter.dateOfBirth = request.query.dateOfBirth;
    }
    if (request.query.phone) {
      filter.phone = { $regex: request.query.phone, $options: 'i' };
    }

    let patients = await PatientProfile.find(filter).populate('user');

    if (request.query.email) {
      const emailRegex = new RegExp(request.query.email, 'i');
      patients = patients.filter((p) => p.user && emailRegex.test(p.user.email));
    }

    response.status(200).json({
      success: true,
      count: patients.length,
      data: patients.map((p) => ({
        ...p.toObject(),
        email: p.user?.email || null,
      })),
    });
  })
);

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

// ========== POST /api/v1/staff — Create staff profile ==========
// Authorized: Staff only
router.post(
  '/createUser',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const { userType, email, password, firstName, lastName } = request.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userTypeObj = await UserType.findOneAndUpdate(
      { typeName: userType },
      { $setOnInsert: { typeName: userType } },
      { upsert: true, new: true }
    );

    const user = new User({ email, hashedPassword, userType: userTypeObj._id });
    await user.validate();

    let profile;

    if (userType === 'patient') {
      const { middleName, dateOfBirth, phone } = request.body;
      profile = await profileController.createProfile(PatientProfile, user._id, {
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        phone,
      });
    }
    if (userType === 'doctor') {
      const { shiftStartTime, shiftEndTime } = request.body;
      profile = await profileController.createProfile(DoctorProfile, user._id, {
        firstName,
        lastName,
        shiftStartTime,
        shiftEndTime,
      });
    }
    if (userType === 'staff') {
      profile = await profileController.createProfile(StaffProfile, user._id, {
        firstName,
        lastName,
      });
    }

    await user.save();
    response.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: user._id,
      data: await profile.populate({
        path: 'user',
        populate: { path: 'userType' },
      }),
    });
  })
);

// ========== GET /api/v1/staff — List all staff ==========
// Authorized: Staff only
router.get(
  '/',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (_request, response) => {
    const staff = await profileController.getAllProfiles(StaffProfile);

    response.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  })
);

// ========== GET /api/v1/staff/users — List profiles of all user types ==========
// Authorized: Staff only
router.get(
  '/users',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (_request, response) => {
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
    const { userId } = request.params;
    const requestingUserId = request.user.userId;

    const requestingUser = await User.findById(requestingUserId).populate('userType');
    const userTypeName = requestingUser.userType.typeName;

    if (userTypeName !== 'staff') {
      throw createError('You do not have permission to access this profile', 403);
    }

    const staff = await profileController.getProfileById(StaffProfile, userId);

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
    await User.deleteOne({ _id: userId });

    response.status(200).json({
      success: true,
      message: 'Staff profile deleted',
    });
  })
);

module.exports = router;
