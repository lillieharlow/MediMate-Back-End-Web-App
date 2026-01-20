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
  const existingProfile = await Model.findOne({user: userId});
  if (existingProfile) {
    throw createError('Profile already exists', 409);
  }
  if (Model.modelName === 'DoctorProfile') {
    validateDoctorShiftTimes(profileData.shiftStartTime, profileData.shiftEndTime);
  }
  const profile = new Model({
    user: userId,
    ...profileData,
  });
  await profile.save();
  return profile;
};

// ========== Get Profile By ID ==========
const getProfileById = async (Model, userId) => {
  const profile = await Model.findOne({ user: userId }).populate({
    path: 'user',
    populate: { path: 'userType' },
  });

  if (!profile) {
    throw createError('Profile not found', 404);
  }

  return profile;
};

// ========== Get All Profiles ==========
const getAllProfiles = async (Model) => {
  const profiles = await Model.find().populate({ path: 'user', populate: { path: 'userType' } });
  return profiles;
};

// ========== Update Profile ==========
const updateProfile = async (Model, userId, updateData) => {
  if (Model.modelName === 'DoctorProfile') {
    const current = await Model.findOne({ user: userId });
    const start = updateData.shiftStartTime || (current && current.shiftStartTime);
    const end = updateData.shiftEndTime || (current && current.shiftEndTime);
    validateDoctorShiftTimes(start, end);
  }
  const updated = await Model.findOneAndUpdate({ user: userId }, updateData, {
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
  const deleted = await Model.findOneAndDelete({ user: userId });

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
