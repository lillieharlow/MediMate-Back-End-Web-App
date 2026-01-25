/**
 * Staff Routes Tests
 * - Create staff profile (staff token)
 * - Get one staff profile by userId (staff only)
 * - Update staff profile (staff only)
 * - List staff (staff only)
 * - Change user type for a target user (staff only)
 * - Delete staff profile (staff only)
 */

const request = require('supertest');
const app = require('../src/index');
const { testData } = require('./setupMongo');
const { createStaffUserAndToken } = require('./testUtils');

describe('Staff Routes: /api/v1/staff', () => {
  let staffToken;
  let staffUserId;

  beforeEach(async () => {
    const staff = await createStaffUserAndToken(app);
    staffToken = staff.token;
    staffUserId = staff.userId;
  });

  test('POST /staff creates staff profile', async () => {
    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ firstName: 'Sam', lastName: 'Lee' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBe(staffUserId);
  });

  test('GET /staff/:userId - should return one staff profile', async () => {
    await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ firstName: 'Sam', lastName: 'Lee' });

    const res = await request(app)
      .get(`/api/v1/staff/${staffUserId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('Sam');
  });

  test('PATCH /staff/:userId - should update staff profile', async () => {
    await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ firstName: 'Sam', lastName: 'Lee' });

    const res = await request(app)
      .patch(`/api/v1/staff/${staffUserId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ lastName: 'Chen' });

    expect(res.status).toBe(200);
    expect(res.body.data.lastName).toBe('Chen');
  });

  test('GET /staff - should list all staff', async () => {
    await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ firstName: 'Sam', lastName: 'Lee' });

    const res = await request(app)
      .get('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test('PATCH /staff/userType/:userId - should change user type of profile to doctor', async () => {
    const patientSignup = await request(app)
      .post('/api/v1/auth/signup')
      .send({ ...testData.patientUser, ...testData.validPatient });
    const targetUserId = patientSignup.body.userId;

    const res = await request(app)
      .patch(`/api/v1/staff/userType/${targetUserId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ typeName: 'doctor' });

    expect(res.status).toBe(200);
    expect(res.body.data.userType.typeName).toBe('doctor');
  });

  test('DELETE /staff/:userId - should delete a staff profile', async () => {
    await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ firstName: 'Sam', lastName: 'Lee' });

    const res = await request(app)
      .delete(`/api/v1/staff/${staffUserId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
