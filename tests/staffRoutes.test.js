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
const User = require('../src/models/User');
const UserType = require('../src/models/UserTypes');
const { testData } = require('./setupMongo');

const ensureType = async (typeName) =>
  UserType.findOneAndUpdate({ typeName }, { $setOnInsert: { typeName } }, { upsert: true, new: true });

const createStaffUserAndToken = async () => {
  const staffType = await ensureType('staff');
  await ensureType('doctor'); // used in the userType change test
  const signupRes = await request(app).post('/api/v1/auth/signup').send(testData.staffUser);
  const { userId } = signupRes.body;
  await User.findByIdAndUpdate(userId, { userType: staffType._id });
  const loginRes = await request(app).post('/api/v1/auth/login').send(testData.staffUser);
  return { token: loginRes.body.token, userId };
};

describe('Staff Routes: /api/v1/staff', () => {
  let staffToken;
  let staffUserId;

  beforeEach(async () => {
    const staff = await createStaffUserAndToken();
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

  test('GET /staff/:userId returns staff profile', async () => {
    await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ firstName: 'Sam', lastName: 'Lee' });

    const res = await request(app)
      .get(`/api/v1/staff/${staffUserId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Sam');
  });

  test('PATCH /staff/:userId updates staff profile', async () => {
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

  test('GET /staff lists staff', async () => {
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

  test('PATCH /staff/userType/:userId changes user type to doctor', async () => {
    const patientSignup = await request(app).post('/api/v1/auth/signup').send(testData.patientUser);
    const targetUserId = patientSignup.body.userId;

    const res = await request(app)
      .patch(`/api/v1/staff/userType/${targetUserId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ typeName: 'doctor' });

    expect(res.status).toBe(200);
    expect(res.body.data.userType.typeName).toBe('doctor');
  });

  test('DELETE /staff/:userId deletes staff profile', async () => {
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