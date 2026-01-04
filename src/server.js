const mongoose = require('mongoose');
const app = require('./index.js');


// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;
// eslint-disable-next-line no-undef
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medimate';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

startServer();