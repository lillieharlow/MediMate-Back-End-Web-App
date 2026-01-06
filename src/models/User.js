/**
 * User Model: Handles user authentication and profile data
 * Defines user schema with:
 * - Email with validation
 * - Hashed password with bcryptjs
 * - Foreign key reference to UserType
 * - Password hashing middleware
 * - JSON transformation for security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// ========== User Schema ==========
const UserSchema = mongoose.Schema(
  {
    userType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserType',
      required: [true, 'User type is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already in use'],
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email format',
      },
    },
    hashedPassword: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
  },
  { timestamps: true }
);

// ========== Password Hashing ==========
UserSchema.pre('save', async () => {
  if (!this.isModified('hashedPassword')) return;
  const salt = await bcrypt.genSalt(12);
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
});

// ========== JSON Transformation ==========
UserSchema.set('toJSON', {
  transform: (doc, returnObject) => {
    const sanitized = { ...returnObject };
    delete sanitized.hashedPassword;
    return sanitized;
  },
});

module.exports = mongoose.model('User', UserSchema);
