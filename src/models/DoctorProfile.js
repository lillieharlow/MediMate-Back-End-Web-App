/* eslint-disable no-param-reassign */
/**
 * Doctor User Profile Model: Handles doctor profile data
 * Defines doctor profile schema with:
 * - _id is the primary key and foreign key to User
 * - Doctor name fields
 * - Custom validation for shift start and end times
 * - Timestamps for tracking creation and updates
 */

const mongoose = require('mongoose');
const validator = require('validator');

// ========== Doctor Profile Schema ==========
const DoctorProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shiftStartTime: {
      type: String,
      required: [true, 'Shift start time is required'],
      trim: true,
      validate: {
        validator: (v) => validator.matches(v, /^([01]\d|2[0-3]):[0-5]\d$/),
        message: (props) => `${props.value} is not a valid time (HH:MM 24-hour)`,
      },
    },
    shiftEndTime: {
      type: String,
      required: [true, 'Shift end time is required'],
      trim: true,
      validate: {
        validator: (v) => validator.matches(v, /^([01]\d|2[0-3]):[0-5]\d$/),
        message: (props) => `${props.value} is not a valid time (HH:MM 24-hour)`,
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
