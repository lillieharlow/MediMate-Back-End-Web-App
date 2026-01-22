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
const Bookings = require('../models/Bookings');
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

  console.log(`Created staff user: ${staffEmail} | Password: ${staffPassword}`);
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
          shiftStartTime: new Date(Date.now() + 3600 * 1000 * idx),
          shiftEndTime: new Date(Date.now() + 3600 * 1000 * (idx + 8)),
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
          dateOfBirth: new Date(1990, idx, idx),
          email,
          phone: `+1415555267${idx}`,
        });
      }
      return user._id;
    })
  );
  return patientIds;
}

// ========== Seed Bookings ==========
async function seedBookings(doctorIds, patientIds, count) {
  await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const idx = i + 1;
      const doctorId = doctorIds[idx % doctorIds.length];
      const patientId = patientIds[idx % patientIds.length];
      // Set booking times to today
      const now = new Date();
      const start = new Date(now.getTime() + idx * 3600 * 1000); // idx hours from now
      const end = new Date(start.getTime() + 30 * 60000); // 30 min duration
      await Bookings.create({
        patientId,
        doctorId,
        bookingStatus: 'confirmed',
        datetimeStart: start,
        datetimeEnd: end,
        bookingDuration: 30,
        patientNotes: `Booking ${idx} notes`,
        doctorNotes: `Doctor notes for booking ${idx}`,
      });
    })
  );
}

// ========== Main Seed Function ==========
const seedDatabase = async () => {
  await mongoose.connection.dropDatabase();
  console.log('Database dropped. Seeding fresh data...');

  await seedUserTypes();
  await seedStaffUser();
  const doctorIds = await seedDoctors(4);
  const patientIds = await seedPatients(6);
  await seedBookings(doctorIds, patientIds, 10);
  console.log('Database seeded successfully!');
};

module.exports = seedDatabase;
