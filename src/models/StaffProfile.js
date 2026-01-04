/**
 * Staff User Profile Model: Handles staff profile data
 * Defines staff profile schema with:
 * - _id is the primary key and foreign key to User
 * - Staff name fields
 * - Timestamps for tracking creation and updates
 */

const mongoose = require('mongoose');

// ========== Staff Profile Schema ==========
const StaffProfileSchema = mongoose.Schema(
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
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StaffProfile', StaffProfileSchema);
