/**
 * Booking Routes: Booking CRUD endpoints
 *
 * Handles HTTP endpoints for bookings:
 * - GET /api/v1/bookings                           : List all bookings (staff only)
 * - GET /api/v1/bookings/patients/:userId          : Get all bookings for one patient (staff all, doctor self and patient self)
 * - GET /api/v1/bookings/doctors/:userId           : Get all bookings for one doctor (staff and patient all, doctor self)
 * - GET /api/v1/bookings/:bookingId                : Get one booking (staff all, doctor self, patient self)
 * - POST /api/v1/bookings                          : Create a booking (staff and patient only)
 * - PATCH /api/v1/bookings/:bookingId              : Update a booking (staff, doctor self, patient self)
 * - PATCH /api/v1/bookings/:bookingId/doctorNotes  : Update doctor notes of a booking (doctor self only)
 * - GET /api/v1/bookings/:bookingId/doctorNotes    : Get doctor notes of a booking (doctor self only)
 * - DELETE /api/v1/bookings/:bookingId             : Delete a booking (staff and patient self)
 */

const express = require('express');

const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/asyncHandler');
const authorizeUserTypes = require('../middlewares/authorizeUserTypes');
const jwtAuth = require('../middlewares/jwtAuth');
const createError = require('../utils/httpError');
const Bookings = require('../models/Bookings');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

const router = express.Router();

// ========== GET /api/v1/bookings — List all bookings ==========
// Authorized: Staff only
router.get(
  '/',
  jwtAuth,
  authorizeUserTypes('staff'),
  asyncHandler(async (request, response) => {
    const bookings = await Bookings.find({});
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;
    let filtered = bookings;
    if (requesterType !== 'doctor') {
      filtered = bookings.map((b) => {
        const obj = b.toObject();
        obj.doctorId = obj.doctorId.toString();
        obj.patientId = obj.patientId.toString();
        obj.datetimeStart = new Date(obj.datetimeStart).toISOString();
        delete obj.doctorNotes;
        return obj;
      });
    }
    response.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  })
);

// ========== GET /api/v1/bookings/patients/:userId — Get all bookings for one patient ==========
// Authorized: Staff, doctor self, and patient self
router.get(
  '/patients/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor', 'patient'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;

    if (requesterType === 'patient' && requester.id !== userId) {
      throw createError('You do not have permission to access this profile', 403);
    }
    if (requesterType === 'doctor') {
      // Only allow if this doctor has at least one booking with this patient
      const hasBooking = await Bookings.exists({ doctorId: requester.id, patientId: userId });
      if (!hasBooking) {
        throw createError('You do not have permission to access this profile', 403);
      }
    }

    // Populate doctorId with User and DoctorProfile
    const bookings = await Bookings.find({ patientId: userId }).populate({
      path: 'doctorId',
      model: 'User',
    });

    // For each booking, also fetch DoctorProfile
    const bookingsWithProfile = await Promise.all(
      bookings.map(async (b) => {
        const obj = b.toObject();
        let doctorProfile = null;
        let doctorIdStr = null;
        if (obj.doctorId?._id) {
          doctorProfile = await DoctorProfile.findOne({ user: obj.doctorId._id });
          doctorIdStr = obj.doctorId._id.toString();
        }
        obj.doctorProfile = doctorProfile ? doctorProfile.toObject() : null;
        obj.doctorId = doctorIdStr;
        obj.patientId = obj.patientId ? obj.patientId.toString() : null;
        delete obj.doctorNotes;
        return obj;
      })
    );

    response.status(200).json({
      success: true,
      count: bookingsWithProfile.length,
      data: bookingsWithProfile,
    });
  })
);

// ========== GET /api/v1/bookings/doctors/:userId — Get all bookings for one doctor ==========
// Authorized: Staff, patient and doctor self
router.get(
  '/doctors/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor', 'patient'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;

    if (requesterType === 'doctor' && requester.id !== userId) {
      throw createError('You do not have permission to access this profile', 403);
    }

    // Ensure doctorId is a valid ObjectId
    console.log('[DEBUG] GET /api/v1/bookings/doctors/:userId - received userId:', userId);
    let doctorId = userId;
    try {
      doctorId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      console.error('[ERROR] Invalid doctorId format:', userId);
      throw createError('Invalid doctorId format', 400);
    }
    const bookings = await Bookings.find({ doctorId }).populate({
      path: 'patientId',
      model: 'User',
    });

    // For each booking, also fetch PatientProfile
    const bookingsWithProfile = await Promise.all(
      bookings.map(async (b) => {
        const obj = b.toObject();
        // Attach patient profile if exists
        const profile = await PatientProfile.findOne({ user: obj.patientId._id });
        obj.patientProfile = profile ? profile.toObject() : null;
        obj.doctorId = obj.doctorId.toString();
        obj.patientId = obj.patientId._id.toString();
        delete obj.doctorNotes;
        return obj;
      })
    );
    response.status(200).json({
      success: true,
      count: bookingsWithProfile.length,
      data: bookingsWithProfile,
    });
  })
);

// ========== GET /api/v1/bookings/:bookingId — Get one booking ==========
// Authorized: Staff, doctor self, and patient self
router.get(
  '/:bookingId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor', 'patient'),
  asyncHandler(async (request, response) => {
    const { bookingId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;
    const booking = await Bookings.findById(bookingId);

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    if (
      (requesterType === 'doctor' && booking.doctorId.toString() !== requester.id) ||
      (requesterType === 'patient' && booking.patientId.toString() !== requester.id)
    ) {
      console.log('[DEBUG] GET /api/v1/bookings/:bookingId');
      console.log('requesterType:', requesterType);
      console.log('requester.id:', requester.id);
      console.log('booking.doctorId:', booking.doctorId.toString());
      console.log('booking.patientId:', booking.patientId.toString());
      throw createError('You do not have permission to access this booking', 403);
    }

    let filtered = booking;
    if (requesterType !== 'doctor') {
      filtered = booking.toObject();
      delete filtered.doctorNotes;
    }
    response.status(200).json({
      success: true,
      data: filtered,
    });
  })
);

// ========== POST /api/v1/bookings — Create a booking ==========
// Authorized: Staff and patient only
router.post(
  '/',
  jwtAuth,
  authorizeUserTypes('staff', 'patient'),
  asyncHandler(async (request, response) => {
    const { bookingStatus, datetimeStart, bookingDuration, patientNotes, doctorId: bodyDoctorId, patientId: bodyPatientId } = request.body;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;
    let patientId;
    let doctorId;
    if (requesterType === 'patient') {
      patientId = requester._id;
      doctorId = bodyDoctorId;
    } else if (requesterType === 'staff') {
      patientId = bodyPatientId;
      doctorId = bodyDoctorId;
    } else {
      throw createError('Only staff or patients can create bookings', 403);
    }
    // Validate and convert to ObjectId if needed
    if (!patientId || !doctorId) {
      throw createError('Both patientId and doctorId must be provided as strings in the request body', 400);
    }
    // Ensure doctorId and patientId are strings (ObjectId)
    if (typeof doctorId === 'object' && doctorId !== null && doctorId._id) doctorId = doctorId._id;
    if (typeof patientId === 'object' && patientId !== null && patientId._id) patientId = patientId._id;

    const start = new Date(datetimeStart);
    const end = new Date(start.getTime() + (parseInt(bookingDuration, 10) || 15) * 60000);

    // Only allow bookings in the future
    if (new Date(datetimeStart) < new Date()) {
      throw createError('Bookings can only be made for a future date/time.', 400);
    }

    // Overlap check: Prevent doctor from having overlapping bookings
    const overlap = await Bookings.findOne({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      $expr: {
        $and: [
          { $lt: ['$datetimeStart', end] },
          {
            $gt: [{ $add: ['$datetimeStart', { $multiply: ['$bookingDuration', 60000] }] }, start],
          },
        ],
      },
    });
    if (overlap) {
      throw createError(
        'There are no available appointments at this time with your choosen Doctor, please select another time.',
        409
      );
    }

    // Overlap check: Prevent patient from having overlapping bookings with any doctor
    const patientOverlap = await Bookings.findOne({
      patientId: new mongoose.Types.ObjectId(patientId),
      $expr: {
        $and: [
          { $lt: ['$datetimeStart', end] },
          {
            $gt: [{ $add: ['$datetimeStart', { $multiply: ['$bookingDuration', 60000] }] }, start],
          },
        ],
      },
    });
    if (patientOverlap) {
      throw createError(
        'This appointment date/time is already taken, please select another time.',
        409
      );
    }

    const booking = await Bookings.create({
      patientId,
      doctorId,
      bookingStatus,
      datetimeStart,
      bookingDuration,
      patientNotes,
      doctorNotes: null, // Only doctors can read & update this field once booking is created
    });
    response.status(201).json({
      success: true,
      data: booking,
    });
  })
);

// ========== PATCH /api/v1/bookings/:bookingId — Update a booking ==========
// Authorized: Staff, doctor self, patient self
router.patch(
  '/:bookingId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor', 'patient'),
  asyncHandler(async (request, response) => {
    const { bookingId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;
    const booking = await Bookings.findById(bookingId);

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    if (
      (requesterType === 'doctor' && booking.doctorId.toString() !== requester.id) ||
      (requesterType === 'patient' && booking.patientId.toString() !== requester.id)
    ) {
      throw createError('You do not have permission to update this booking', 403);
    }

    const update = { ...request.body }; // Remove doctorNotes from general update route for confidentiality
    if ('doctorNotes' in update) {
      delete update.doctorNotes;
    }
    const updatedBooking = await Bookings.findByIdAndUpdate(bookingId, update, {
      new: true,
    });

    response.status(200).json({
      success: true,
      data: updatedBooking,
    });
  })
);

// ========== PATCH /api/v1/bookings/:bookingId/doctorNotes — Update doctor notes of a booking ==========
// Authorized: Doctor self only
router.patch(
  '/:bookingId/doctorNotes',
  jwtAuth,
  authorizeUserTypes('doctor'),
  asyncHandler(async (request, response) => {
    const { bookingId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;
    const booking = await Bookings.findById(bookingId);

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    if (requesterType !== 'doctor' && booking.doctorId.toString() !== requester.id) {
      throw createError('You do not have permission to update doctor notes for this booking', 403);
    }

    booking.doctorNotes = request.body.doctorNotes;
    await booking.save();

    response.status(200).json({
      success: true,
      data: {
        doctorNotes: booking.doctorNotes,
      },
    });
  })
);

// ========== GET /api/v1/bookings/:bookingId/doctorNotes — Get doctor notes of a booking ==========
// Authorized: Doctor self only
router.get(
  '/:bookingId/doctorNotes',
  jwtAuth,
  authorizeUserTypes('doctor'),
  asyncHandler(async (request, response) => {
    const { bookingId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;
    const booking = await Bookings.findById(bookingId);

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    if (requesterType !== 'doctor' && booking.doctorId.toString() !== requester.id) {
      throw createError('You do not have permission to access doctor notes for this booking', 403);
    }

    response.status(200).json({
      success: true,
      data: {
        doctorNotes: booking.doctorNotes,
      },
    });
  })
);

// ========== DELETE /api/v1/bookings/:bookingId — Delete a booking ==========
// Authorized: Staff and patient self
router.delete(
  '/:bookingId',
  jwtAuth,
  authorizeUserTypes('staff', 'patient'),
  asyncHandler(async (request, response) => {
    const { bookingId } = request.params;

    await Bookings.findByIdAndDelete(bookingId);

    response.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  })
);

module.exports = router;
