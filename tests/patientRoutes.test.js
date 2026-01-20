/**
 * Patient Routes Tests
 *
 * Tests CRUD operations for patient profiles:
 * - Create patient profile (patient token)
 * - List all patients (non-staff receives 403)
 * - Get one patient by userId (patient can access own profile)
 * - Patient cannot access another patient's profile (403 forbidden)
 * - Patient can update own profile
 * - Patient cannot delete own profile (403 forbidden)
 *
 * Uses Supertest to test routes without starting the actual server.
 */

const request = require('supertest');
const app = require('../src/index');
const { testData } = require('./setupMongo');

describe('Patient Routes: CRUD operations for /api/v1/patients', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send(testData.patientUser);
    userId = signupRes.body.userId;

    const loginRes = await request(app).post('/api/v1/auth/login').send(testData.patientUser);
    token = loginRes.body.token;
  });

  test('POST /patients - should create a patient profile', async () => {
    const res = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(testData.validPatient);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBe(userId);

    const resDuplicate = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(testData.validPatient);

    expect(resDuplicate.status).toBe(409);
  });

  test('POST /patients with a duplicate profile should be prevented', async () => {
    
  })

  test('GET /patients/:userId - should only get own patient profile', async () => {
    await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(testData.validPatient);

    const res = await request(app)
      .get(`/api/v1/patients/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe(testData.validPatient.firstName);
    expect(res.body.data.lastName).toBe(testData.validPatient.lastName);
  });

  test('GET /patients/:userId - patient should NOT access another patient profile', async () => {
    const otherUserId = '507f1f77bcf86cd799439011'; // Random MongoDB ObjectId

    const res = await request(app)
      .get(`/api/v1/patients/${otherUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('PATCH /patients/:userId - patient should update own profile', async () => {
    await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(testData.validPatient);

    const res = await request(app)
      .patch(`/api/v1/patients/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '5551234567' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe('5551234567');
  });

  test('DELETE /patients/:userId - patient cannot delete own profile', async () => {
    await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(testData.validPatient);

    const res = await request(app)
      .delete(`/api/v1/patients/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
