/**
 * Patient User Profile Model: Handles patient profile data
 * Defines patient profile schema with:
 * - _id is the primary key and foreign key to User
 * - Patient personal information fields
 * - Timestamps for tracking creation and updates
 */

const mongoose = require('mongoose');
const validator = require('validator');

// ========== Patient Profile Schema ==========
const PatientProfileSchema = mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: (value) => value < new Date(),
        message: 'Date of birth cannot be in the future',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: [true, 'Phone number already in use'],
      validate: {
        validator: (value) => validator.isMobilePhone(value, 'any'),
        message: 'Invalid phone number format',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
