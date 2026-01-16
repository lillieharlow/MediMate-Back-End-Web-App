/**
 * Profile Controller: Reusable CRUD operations for all profile types
 *
 * Shared business logic for:
 * - Doctor shift time validation helper
 * - Creating profiles (patient, staff, doctor)
 * - Retrieving profiles by ID
 * - Listing all profiles
 * - Updating profiles
 * - Deleting profiles
 * - Each function accepts the Profile Model as a parameter for DRY code
 */

const createError = require('../utils/httpError');

// ========== Doctor shift time validation helper ==========
function validateDoctorShiftTimes(shiftStartTime, shiftEndTime) {
  if (shiftStartTime && shiftEndTime && new Date(shiftEndTime) <= new Date(shiftStartTime)) {
    throw createError('Shift end time must be after shift start time', 400);
  }
}

// ========== Create Profile ==========
const createProfile = async (Model, userId, profileData) => {
  const existingProfile = await Model.findById(userId);
  if (existingProfile) {
    throw createError('Profile already exists', 409);
  }
  if (Model.modelName === 'DoctorProfile') {
    validateDoctorShiftTimes(profileData.shiftStartTime, profileData.shiftEndTime);
  }
  const profile = new Model({
    _id: userId,
    ...profileData,
  });
  await profile.save();
  return profile;
};

// ========== Get Profile By ID ==========
const getProfileById = async (Model, userId) => {
  const profile = await Model.findById(userId);

  if (!profile) {
    throw createError('Profile not found', 404);
  }

  return profile;
};

// ========== Get All Profiles ==========
const getAllProfiles = async (Model) => {
  const profiles = await Model.find();
  return profiles;
};

// ========== Update Profile ==========
const updateProfile = async (Model, userId, updateData) => {
  if (Model.modelName === 'DoctorProfile') {
    const current = await Model.findById(userId);
    const start = updateData.shiftStartTime || (current && current.shiftStartTime);
    const end = updateData.shiftEndTime || (current && current.shiftEndTime);
    validateDoctorShiftTimes(start, end);
  }
  const updated = await Model.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw createError('Profile not found', 404);
  }
  return updated;
};

// ========== Delete Profile ==========
const deleteProfile = async (Model, userId) => {
  const deleted = await Model.findByIdAndDelete(userId);

  if (!deleted) {
    throw createError('Profile not found', 404);
  }

  return deleted;
};

module.exports = {
  createProfile,
  getProfileById,
  getAllProfiles,
  updateProfile,
  deleteProfile,
};
