/**
 * Profile Controller: Reusable CRUD operations for all profile types
 *
 * Shared business logic for:
 * - Creating profiles (patient, staff, doctor)
 * - Retrieving profiles by ID
 * - Listing all profiles
 * - Updating profiles
 * - Deleting profiles
 * - Each function accepts the Profile Model as a parameter for DRY code
 */

const createError = require('../utils/httpError');

// ========== Create Profile ==========
const createProfile = async (Model, userId, profileData) => {
  const existingProfile = await Model.findById(userId);
  if (existingProfile) {
    throw createError('Profile already exists', 409);
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
