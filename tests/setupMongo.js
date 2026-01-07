/**
 * Jest Test Setup: In-memory MongoDB for Jest
 *
 * Spins up a temporary MongoDB instance for each test run.
 * Database gets wiped between tests so they don't interfere with each other.
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
