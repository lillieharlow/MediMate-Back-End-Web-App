/**
 * Auth Routes Tests
 *
 * Tests signup and login endpoints:
 * - New user registration (success + duplicate email)
 * - User login (success + wrong password)
 */

const request = require('supertest');
const app = require('../src/index');
const { testData } = require('./setupMongo');

describe('Auth Routes: Signup and login for /api/v1/auth', () => {
  const { email, password } = testData.validUser;

  test('POST /signup - should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email,
        password,
        ...testData.validPatient,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBeDefined();
  });

  test('POST /signup - should fail if there is a duplicate email', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email, password, ...testData.validPatient });
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email, password, ...testData.validPatient });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  test('POST /login - should login an existing user', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email, password, ...testData.validPatient });
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /login - should fail with incorrect password', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email, password, ...testData.validPatient });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrongpass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
