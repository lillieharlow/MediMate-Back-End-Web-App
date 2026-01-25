/**
 * Test Setup: Global infastructure (DB, config) for tests.
 *
 * Spins up a temporary MongoDB instance for each test run.
 * Database gets dropped and seeded before each test.
 *
 * Sets JWT_SECRET=test-secret for auth route tests.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { seedUserTypes } = require('../src/utils/seedDatabase');

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  await seedUserTypes();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const testData = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
  },
  patientUser: {
    email: 'patient@example.com',
    password: 'password123',
  },
  staffUser: {
    email: 'staff@example.com',
    password: 'password123',
  },
  doctorUser: {
    email: 'doctor@example.com',
    password: 'password123',
  },
  validPatient: {
    firstName: 'Alice',
    lastName: 'Smith',
    dateOfBirth: '1990-05-15',
    phone: '1234567890',
  },
  validDoctor: {
    shiftStartTime: '08:00',
    shiftEndTime: '16:00',
    firstName: 'John',
    lastName: 'Doctor',
  },
};

module.exports = { testData };
