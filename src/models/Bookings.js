/**
 * Bookings Model: Handles appointment bookings
 * Defines booking schema with:
 * - Patient and doctor foreign keys to User
 * - Booking status with enum validation
 * - DateTime and duration fields
 * - Patient and doctor notes
 * - Timestamps for tracking creation and updates
 */

const mongoose = require('mongoose');

// ========== Bookings Schema ==========
const BookingsSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    bookingStatus: {
      type: String,
      required: [true, 'Booking status is required'],
      enum: {
        values: ['pending', 'confirmed', 'started', 'complete'],
        message: 'Booking status must be one of: pending, confirmed, started, or complete',
      },
      default: 'pending',
      lowercase: true,
    },
    datetimeStart: {
      type: Date,
      required: [true, 'Start datetime is required'],
    },
    bookingDuration: {
      type: Number,
      required: [true, 'Booking duration is required'],
      enum: {
        values: [15, 30],
        message: 'Booking duration must be either 15 or 30 minutes',
      },
    },
    patientNotes: {
      type: String,
      trim: true,
    },
    doctorNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent a doctor from having two bookings at the same start time
BookingsSchema.index({ doctorId: 1, datetimeStart: 1 }, { unique: true });

module.exports = mongoose.model('Bookings', BookingsSchema);
