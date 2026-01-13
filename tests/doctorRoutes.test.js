/**
 * Doctor Routes Tests
 *
 * Tests CRUD operations for doctor profiles:
 * - Create doctor profile (staff token)
 * - List all doctors (staff only)
 * - Get one doctor by userId (doctor can access own profile, staff can access any)
 * - Doctor can update own profile (staff can update any)
 * - Staff can delete doctor profile
 *
 * Uses Supertest to test routes without starting the actual server.
 */

const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/User');
const UserType = require('../src/models/UserTypes');
const { testData } = require('./setupMongo');

const ensureType = async (typeName) =>
  UserType.findOneAndUpdate(
    { typeName },
    { $setOnInsert: { typeName } },
    { upsert: true, new: true }
  );

const createStaffUserAndToken = async () => {
  const staffType = await ensureType('staff');
  const signupRes = await request(app).post('/api/v1/auth/signup').send(testData.staffUser);
  const { userId } = signupRes.body;
  await User.findByIdAndUpdate(userId, { userType: staffType._id });
  const loginRes = await request(app).post('/api/v1/auth/login').send(testData.staffUser);
  return { token: loginRes.body.token, userId };
};

const createDoctorUserAndToken = async () => {
  const doctorType = await ensureType('doctor');
  const signupRes = await request(app).post('/api/v1/auth/signup').send(testData.doctorUser);
  const { userId } = signupRes.body;
  await User.findByIdAndUpdate(userId, { userType: doctorType._id });
  const loginRes = await request(app).post('/api/v1/auth/login').send(testData.doctorUser);
  return { token: loginRes.body.token, userId };
};

describe('Doctor Routes: /api/v1/doctors', () => {
  let staffToken;
  let doctorToken;
  let doctorUserId;

  beforeEach(async () => {
    const staff = await createStaffUserAndToken();
    staffToken = staff.token;

    const doctor = await createDoctorUserAndToken();
    doctorToken = doctor.token;
    doctorUserId = doctor.userId;
  });

  test('POST /doctors - staff user can create a doctor profile', async () => {
    const res = await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...testData.validDoctor, userId: doctorUserId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBe(doctorUserId);
  });

  test('GET /doctors - doctor should not have permission to list all doctors, 403', async () => {
    const res = await request(app)
      .get('/api/v1/doctors')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /doctors/:userId - doctor should be able to get own profile', async () => {
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(testData.validDoctor);

    const res = await request(app)
      .get(`/api/v1/doctors/${doctorUserId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe(testData.validDoctor.firstName);
  });

  test('PATCH /doctors/:userId - doctor should be able to update own profile', async () => {
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(testData.validDoctor);

    const res = await request(app)
      .patch(`/api/v1/doctors/${doctorUserId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ specialization: 'Neurology' });

    expect(res.status).toBe(200);
    expect(res.body.data.specialization).toBe('Neurology');
  });

  test('DELETE /doctors/:userId - should allow staff to delete doctor profile', async () => {
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(testData.validDoctor);

    const res = await request(app)
      .delete(`/api/v1/doctors/${doctorUserId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
