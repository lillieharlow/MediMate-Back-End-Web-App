/**
 * Booking Routes: Booking CRUD endpoints
 *
 * Handles HTTP endpoints for bookings:
 * - GET /api/v1/bookings                           : List all bookings (staff only)
 * - GET /api/v1/bookings/patients/:userId          : Get all bookings for one patient (staff all, doctor self and patient self)
 * - GET /api/v1/bookings/doctors/:userId           : Get all bookings for one doctor (staff all, doctor self)
 * - GET /api/v1/bookings/:bookingId                : Get one booking (staff all, doctor self, patient self)
 * - POST /api/v1/bookings                          : Create a booking (staff and patient only)
 * - PATCH /api/v1/bookings/:bookingId              : Update a booking (staff, doctor self, patient self)
 * - PATCH /api/v1/bookings/:bookingId/doctorNotes  : Update doctor notes of a booking (doctor self only)
 * - GET /api/v1/bookings/:bookingId/doctorNotes    : Get doctor notes of a booking (doctor self only)
 * - DELETE /api/v1/bookings/:bookingId             : Delete a booking (staff and patient self)
 */

const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const authorizeUserTypes = require('../middlewares/authorizeUserTypes');
const jwtAuth = require('../middlewares/jwtAuth');
const createError = require('../utils/httpError');
const Bookings = require('../models/Bookings');
const User = require('../models/User');

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

    if (['doctor', 'patient'].includes(requesterType) && requester.id !== userId) {
      throw createError('You do not have permission to access this profile', 403);
    }

    const bookings = await Bookings.find({ patientId: userId });
    let filtered = bookings;
    if (requesterType !== 'doctor') {
      filtered = bookings.map((b) => {
        const obj = b.toObject();
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

// ========== GET /api/v1/bookings/doctors/:userId — Get all bookings for one doctor ==========
// Authorized: Staff and doctor self
router.get(
  '/doctors/:userId',
  jwtAuth,
  authorizeUserTypes('staff', 'doctor'),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const requester = await User.findById(request.user.userId).populate('userType');
    const requesterType = requester.userType.typeName;

    if (requesterType === 'doctor' && requester.id !== userId) {
      throw createError('You do not have permission to access this profile', 403);
    }

    const bookings = await Bookings.find({ doctorId: userId });
    let filtered = bookings;
    if (requesterType !== 'doctor') {
      filtered = bookings.map((b) => {
        const obj = b.toObject();
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
    const { patientId, doctorId, bookingStatus, datetimeStart, bookingDuration, patientNotes } =
      request.body;

    // Only allow bookings in the future
    if (new Date(datetimeStart) < new Date()) {
      throw createError('Bookings can only be made for a future date/time.', 400);
    }

    // Overlap check: Prevent doctor from having overlapping bookings
    const start = new Date(datetimeStart);
    if (start < new Date()) {
      throw createError('Cannot create a booking in the past.', 400);
    }

    // Overlap check: Prevent doctor from having overlapping bookings
    const end = new Date(start.getTime() + bookingDuration * 60000);
    const overlap = await Bookings.findOne({
      doctorId,
      $or: [
        {
          datetimeStart: { $lt: end },
          $expr: {
            $gte: [{ $add: ['$datetimeStart', { $multiply: ['$bookingDuration', 60000] }] }, start],
          },
        },
        {
          datetimeStart: { $gte: start, $lt: end },
        },
      ],
    });
    if (overlap) {
      throw createError(
        'There are no available appointments at this time with your choosen Doctor.',
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
