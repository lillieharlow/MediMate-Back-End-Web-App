/**
 * Patient Routes Tests
 *
 * Tests endpoints:
 * - POST patient (staff & patient only) - /api/v1/patients
 * - GET - list all patients (staff only) - /api/v1/patients
 * - GET - one patient (staff all, doctor & patient only self) - /api/v1/patients/:userId
 * - PATCH patient (staff & patient only) - /api/v1/patients/:userId
 * - DELETE patient (staff only) - /api/v1/patients/:userId
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
  });

  test('GET /patients - should return 403 for non-staff users', async () => {
    const res = await request(app).get('/api/v1/patients').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
