const mongoose = require('mongoose');
const app = require('./index.js');
const seedDatabase = require('./utils/seedDatabase');

// eslint-disable no-undef
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medimate';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database!');
    await seedDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

startServer();
