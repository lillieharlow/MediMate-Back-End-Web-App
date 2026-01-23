/**
 * Patient User Profile Model: Handles patient profile data
 * Defines patient profile schema with:
 * - _id is the primary key and foreign key to User
 * - Patient personal information fields
 * - Timestamps for tracking creation and updates
 * - toJSON transformation to format dateOfBirth and exclude "__v" from API responses
 */

const mongoose = require('mongoose');
const validator = require('validator');

// ========== Patient Profile Schema ==========
const PatientProfileSchema = mongoose.Schema(
  {
    user: {
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
      type: String,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: (value) => {
          // Check format YYYY-MM-DD and not in the future
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          if (!regex.test(value)) return false;
          const [year, month, day] = value.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date < new Date();
        },
        message: 'Date of birth must be in YYYY-MM-DD format and not in the future',
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
  {
    timestamps: true,
    toJSON: {
      transform: (_, { dateOfBirth, createdAt, updatedAt, __v, ...rest }) => ({
        ...rest,
        dateOfBirth,
        createdAt,
        updatedAt,
      }),
    },
  }
);

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
