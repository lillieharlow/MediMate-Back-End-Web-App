/**
 * Doctor Routes Tests
 *
 * Tests CRUD operations for doctor profiles:
 * - Create doctor profile (staff token)
 * - List all doctors (staff only)
 * - Get one doctor by userId (doctor can access own profile, staff can access any)
 * - Should return 400 if shiftEndTime is not after shiftStartTime (validation error)
 * - Staff can delete doctor profile
 *
 * Uses Supertest to test routes without starting the actual server.
 */

const request = require('supertest');
const app = require('../src/index');
const { createStaffUserAndToken, createDoctorUserAndToken } = require('./testUtils');
const { buildDoctorProfilePayload, getFutureDate } = require('./testUtils');

describe('Doctor Routes: /api/v1/doctors', () => {
  let staffToken;
  let doctorToken;
  let doctorUserId;

  beforeEach(async () => {
    const staff = await createStaffUserAndToken(app);
    staffToken = staff.token;

    const doctor = await createDoctorUserAndToken(app);
    doctorToken = doctor.token;
    doctorUserId = doctor.userId;
  });

  test('POST /doctors - staff user can create a doctor profile', async () => {
    const doctorPayload = buildDoctorProfilePayload();
    const res = await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...doctorPayload, userId: doctorUserId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBe(doctorUserId);
  });

  test('GET /doctors - doctor should not have permission to list all doctors, 403', async () => {
    const doctorPayload = buildDoctorProfilePayload();
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...doctorPayload, userId: doctorUserId });

    const res = await request(app)
      .get('/api/v1/doctors')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /doctors/:userId - doctor should be able to get own profile', async () => {
    const doctorPayload = buildDoctorProfilePayload();
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...doctorPayload, userId: doctorUserId });

    const res = await request(app)
      .get(`/api/v1/doctors/${doctorUserId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe(doctorPayload.firstName);
  });

  test('PATCH /doctors/:userId - should return 400 if shiftEndTime is not after shiftStartTime', async () => {
    const doctorPayload = buildDoctorProfilePayload();
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...doctorPayload, userId: doctorUserId });

    const invalidShiftEnd = getFutureDate(-60 * 60 * 1000); // 1 hour in the past

    const res = await request(app)
      .patch(`/api/v1/doctors/${doctorUserId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        shiftEndTime: invalidShiftEnd,
      });

    expect(res.status).toBe(400);
    expect(res.body.message || res.body.errors?.[0]?.message).toMatch(
      /shift end time.*after shift start time/i
    );
  });

  test('DELETE /doctors/:userId - should allow staff to delete doctor profile', async () => {
    const doctorPayload = buildDoctorProfilePayload();
    await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...doctorPayload, userId: doctorUserId });

    const res = await request(app)
      .delete(`/api/v1/doctors/${doctorUserId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
