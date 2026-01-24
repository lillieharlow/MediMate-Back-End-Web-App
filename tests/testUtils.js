/**
 * Test Utils: Shared helpers for user creation and tokens.
 *
 * - Creates staff, doctor, and patient users
 * - Logging in and retrieving JWT tokens
 * - Ensuring user types exist in the database
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const UserType = require('../src/models/UserTypes');
const { testData } = require('./setupMongo');

const ensureType = async (typeName) =>
  UserType.findOneAndUpdate(
    { typeName },
    { $setOnInsert: { typeName } },
    { upsert: true, new: true }
  );

const createStaffUserAndToken = async (app) => {
  const staffType = await ensureType('staff');
  const uniqueEmail = `staff+${Date.now()}@example.com`;
  const staffUser = { ...testData.staffUser, email: uniqueEmail };
  const hashedPassword = await bcrypt.hash(staffUser.password, 10);
  // const signupRes = await request(app).post('/api/v1/auth/signup').send(staffUser);
  // const { userId } = signupRes.body;
  const user = new User({ ...staffUser, userType: staffType._id, hashedPassword });
  await user.save();
  const userId = user._id;
  await User.findByIdAndUpdate(userId, { userType: staffType._id });
  const loginRes = await request(app).post('/api/v1/auth/login').send(staffUser);
  return { token: loginRes.body.token, userId };
};

const createDoctorUserAndToken = async (app) => {
  const doctorType = await ensureType('doctor');
  const uniqueEmail = `doctor+${Date.now()}@example.com`;
  const doctorUser = { ...testData.doctorUser, email: uniqueEmail };
  const hashedPassword = await bcrypt.hash(doctorUser.password, 10);
  // const signupRes = await request(app).post('/api/v1/auth/signup').send(doctorUser);
  // const { userId } = signupRes.body;
  const user = new User({ ...doctorUser, userType: doctorType._id, hashedPassword });
  await user.save();
  const userId = user._id;
  await User.findByIdAndUpdate(userId, { userType: doctorType._id });
  const loginRes = await request(app).post('/api/v1/auth/login').send(doctorUser);
  return { token: loginRes.body.token, userId };
};

const createPatientUserAndToken = async (app) => {
  const patientType = await ensureType('patient');
  const uniqueEmail = `patient+${Date.now()}@example.com`;
  const patientUser = { ...testData.patientUser, email: uniqueEmail };
  const hashedPassword = await bcrypt.hash(patientUser.password, 10);
  // const signupRes = await request(app).post('/api/v1/auth/signup').send(patientUser);
  // const { userId } = signupRes.body;
  const user = new User({ ...patientUser, userType: patientType._id, hashedPassword });
  await user.save();
  const userId = user._id;
  await User.findByIdAndUpdate(userId, { userType: patientType._id });
  const loginRes = await request(app).post('/api/v1/auth/login').send(patientUser);
  return { token: loginRes.body.token, userId };
};

const getFutureDate = (ms = 60 * 60 * 1000) => new Date(Date.now() + ms).toISOString();

const buildDoctorProfilePayload = () => {
  const start = getFutureDate(); // +1 hour ISO string
  const end = getFutureDate(90 * 60 * 1000); // +1.5 hours ISO string
  return {
    shiftStartTime: start,
    shiftEndTime: end,
    firstName: 'John',
    lastName: 'Doctor',
  };
};

module.exports = {
  ensureType,
  createStaffUserAndToken,
  createDoctorUserAndToken,
  createPatientUserAndToken,
  getFutureDate,
  buildDoctorProfilePayload,
};
