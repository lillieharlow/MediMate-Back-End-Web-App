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
async function seedDoctors(_count) {
  const doctorType = await UserType.findOne({ typeName: 'doctor' });
  const doctors = [
    {
      email: 'doctor1@medimate.com',
      firstName: 'Gregory',
      lastName: 'House',
      shiftStartTime: '08:00',
      shiftEndTime: '16:00',
    },
    {
      email: 'doctor2@medimate.com',
      firstName: 'Meredith',
      lastName: 'Grey',
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
    },
    {
      email: 'doctor3@medimate.com',
      firstName: 'John',
      lastName: 'Dorian',
      shiftStartTime: '10:00',
      shiftEndTime: '18:00',
    },
    {
      email: 'doctor4@medimate.com',
      firstName: 'Lisa',
      lastName: 'Cuddy',
      shiftStartTime: '11:00',
      shiftEndTime: '19:00',
    },
  ];
  const doctorIds = await Promise.all(
    doctors.map(async (doc) => {
      let user = await User.findOne({ email: doc.email });
      if (!user) {
        user = await User.create({
          email: doc.email,
          hashedPassword: await bcrypt.hash('doctor123', 10),
          userType: doctorType._id,
        });
      }
      const profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        await DoctorProfile.create({
          user: user._id,
          firstName: doc.firstName,
          lastName: doc.lastName,
          shiftStartTime: doc.shiftStartTime,
          shiftEndTime: doc.shiftEndTime,
        });
      }
      return user._id;
    })
  );
  return doctorIds;
}

// ========== Seed Patients ==========
async function seedPatients(_count) {
  const patientType = await UserType.findOne({ typeName: 'patient' });
  const patients = [
    {
      email: 'patient1@medimate.com',
      firstName: 'James',
      lastName: 'Wilson',
      dateOfBirth: '1990-01-01',
      phone: '14155552671',
    },
    {
      email: 'patient2@medimate.com',
      firstName: 'Allison',
      lastName: 'Cameron',
      dateOfBirth: '1991-02-02',
      phone: '14155552672',
    },
    {
      email: 'patient3@medimate.com',
      firstName: 'Robert',
      lastName: 'Chase',
      dateOfBirth: '1992-03-03',
      phone: '14155552673',
    },
    {
      email: 'patient4@medimate.com',
      firstName: 'Remy',
      lastName: 'Hadley',
      dateOfBirth: '1993-04-04',
      phone: '14155552674',
    },
    {
      email: 'patient5@medimate.com',
      firstName: 'Eric',
      lastName: 'Foreman',
      dateOfBirth: '1994-05-05',
      phone: '14155552675',
    },
    {
      email: 'patient6@medimate.com',
      firstName: 'Chris',
      lastName: 'Taub',
      dateOfBirth: '1995-06-06',
      phone: '14155552676',
    },
  ];
  const patientIds = await Promise.all(
    patients.map(async (pat) => {
      let user = await User.findOne({ email: pat.email });
      if (!user) {
        user = await User.create({
          email: pat.email,
          hashedPassword: await bcrypt.hash('patient123', 10),
          userType: patientType._id,
        });
      }
      const profile = await PatientProfile.findOne({ user: user._id });
      if (!profile) {
        await PatientProfile.create({
          user: user._id,
          firstName: pat.firstName,
          lastName: pat.lastName,
          dateOfBirth: pat.dateOfBirth,
          email: pat.email,
          phone: pat.phone,
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
