/**
 * Database seeding:
 * - Create default user types (patient, staff, doctor)
 * - Create a default staff user
 * - Create sample doctors, patients, and bookings
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const UserType = require('../models/UserTypes');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const StaffProfile = require('../models/StaffProfile');

// ========== Seed User Types ==========
const seedUserTypes = async () => {
  const types = ['patient', 'staff', 'doctor'];

  await Promise.all(
    types.map(async (type) => {
      const exists = await UserType.findOne({ typeName: type });
      if (!exists) {
        await UserType.create({ typeName: type });
        console.log(`Created UserType: ${type}`);
      }
    })
  );
};

// ========== Seed Default Staff User ==========
const seedStaffUser = async () => {
  const staffEmail = 'staff@medimate.com';
  const staffPassword = 'staff123';
  const staffType = await UserType.findOne({ typeName: 'staff' });

  const hashedPassword = await bcrypt.hash(staffPassword, 10);
  const user = await User.create({
    email: staffEmail,
    hashedPassword,
    userType: staffType._id,
  });
  await StaffProfile.create({
    user: user._id,
    firstName: `Default`,
    lastName: `StaffMember`,
  });
};

// ========== Seed Doctors ==========
async function seedDoctors(count) {
  const doctorType = await UserType.findOne({ typeName: 'doctor' });
  const doctorIds = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const idx = i + 1;
      const email = `doctor${idx}@medimate.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          hashedPassword: await bcrypt.hash('doctor123', 10),
          userType: doctorType._id,
        });
        user.save();
        await DoctorProfile.create({
          user: user._id,
          firstName: `Doc${idx}`,
          lastName: `McDoctor${idx}`,
          shiftStartTime: `${String((8 + idx) % 24).padStart(2, '0')}:00`,
          shiftEndTime: `${String((((8 + idx) % 24) + 8) % 24).padStart(2, '0')}:00`,
        });
      }
      return user._id;
    })
  );
  return doctorIds;
}

// ========== Seed Patients ==========
async function seedPatients(count) {
  const patientType = await UserType.findOne({ typeName: 'patient' });
  const patientIds = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const idx = i + 1;
      const email = `patient${idx}@medimate.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          hashedPassword: await bcrypt.hash('patient123', 10),
          userType: patientType._id,
        });
        user.save();
        await PatientProfile.create({
          user: user._id,
          firstName: `Pat${idx}`,
          lastName: `McPatient${idx}`,
          dateOfBirth: `1990-${String(idx).padStart(2, '0')}-${String(idx).padStart(2, '0')}`,
          email,
          phone: `1415555267${idx}`,
        });
      }
      return user._id;
    })
  );
  return patientIds;
}

// ========== Main Seed Function ==========
const seedDatabase = async () => {
  await mongoose.connection.dropDatabase();
  console.log('Database dropped. Seeding fresh data...');

  await seedUserTypes();
  await seedStaffUser();
  await seedDoctors(4);
  await seedPatients(6);
  console.log('Database seeded successfully!');
};

module.exports = {
  seedDatabase,
  seedUserTypes,
};
