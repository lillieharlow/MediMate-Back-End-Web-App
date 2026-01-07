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