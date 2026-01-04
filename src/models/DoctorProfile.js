/**
 * Doctor User Profile Model: Handles doctor profile data
 * Defines doctor profile schema with:
 * - _id is the primary key and foreign key to User
 * - Doctor name fields
 * - Custom validation for shift start and end times
 * - Timestamps for tracking creation and updates
 */

const mongoose = require('mongoose');

// ========== Doctor Profile Schema ==========
const DoctorProfileSchema = mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shiftStartTime: {
      type: Date,
      required: [true, 'Shift start time is required'],
      validate: {
        validator: (value) => value >= new Date(),
        message: 'Shift start time cannot be in the past',
      },
    },
    shiftEndTime: {
      type: Date,
      required: [true, 'Shift end time is required'],
      validate: {
        validator: function (value) {
          return value >= new Date() && value > this.shiftStartTime;
        },
        message: 'Shift end time must be in the future and after shift start time',
      },
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
