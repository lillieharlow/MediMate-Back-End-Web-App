const mongoose = require('mongoose');
const User = require('./src/models/User');
const PatientProfile = require('./src/models/PatientProfile');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medimate';

async function printSeededData() {
  await mongoose.connect(MONGODB_URI);

  const users = await User.find({}, 'email');
  console.log('Seeded user emails:');
  users.forEach((u) => console.log(u.email));

  const patients = await PatientProfile.find({}).populate('user');
  console.log('\nSeeded patient emails and phone numbers:');
  patients.forEach((p) =>
    console.log(`Email: ${p.user.email}, Phone: ${p.phone}, DOB: ${p.dateOfBirth}`)
  );

  await mongoose.disconnect();
}

printSeededData();
