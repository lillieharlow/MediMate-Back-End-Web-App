/**
 * User Type Model: Handles user type definitions
 * Defines user type schema with:
 * - Type name field with validation and enumeration
 * - Custom error message for validation
 * - Custom ID field (type_id)
 */

const mongoose = require('mongoose');

// ========== User Type Schema ==========
const UserTypeSchema = mongoose.Schema(
  {
    typeName: {
      type: String,
      required: [true, 'Type name is required'],
      enum: {
        values: ['staff', 'doctor', 'patient'],
        message: 'Type name must be one of: staff, doctor, or patient',
      },
      lowercase: true,
    },
  },
  { _id: 'type_id' }
);

module.exports = mongoose.model('UserType', UserTypeSchema);
