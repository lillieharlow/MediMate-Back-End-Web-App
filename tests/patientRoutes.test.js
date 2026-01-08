/**
 * Patient Routes Tests
 *
 * Tests endpoints:
 * - GET - list all patients (staff only) - /api/v1/patients
 * - GET - one patient (staff all, doctor & patient only self) - /api/v1/patients/:userId
 * - POST patient (staff & patient only) - /api/v1/patients
 * - PATCH patient (staff & patient only) - /api/v1/patients/:userId
 * - DELETE patient (staff only) - /api/v1/patients/:userId
 */

const request = require('supertest');
const app = require('../src/index');
const { testData } = require('./setupMongo');

describe('Patient Routes: CRUD operations for /api/v1/patients', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Signup to create user
    const signupRes = await request(app).post('/api/v1/auth/signup').send(testData.patientUser);
    userId = signupRes.body.userId;
    
    // Login to get token (signup doesn't return token)
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
    
    
 });