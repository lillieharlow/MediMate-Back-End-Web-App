/**
 * Test Setup: Global infastructure (DB, config) for tests.
 *
 * Spins up a temporary MongoDB instance for each test run.
 * Database gets dropped/wiped between tests to ensure isolation.
 *
 * Sets JWT_SECRET=test-secret for auth route tests.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
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
  validPatient: {
    firstName: 'Alice',
    lastName: 'Smith',
    dateOfBirth: '1990-05-15',
    phone: '1234567890',
  },
};

module.exports = { testData };
