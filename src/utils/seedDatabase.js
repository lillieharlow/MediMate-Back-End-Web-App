const bcrypt = require('bcryptjs');

const User = require('../models/User');
const UserType = require('../models/UserTypes');

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

const seedStaffUser = async () => {
  const staffEmail = 'staff@medimate.com';
  const staffPassword = 'staff123';

  const existingStaff = await User.findOne({ email: staffEmail });
  if (existingStaff) {
    console.log('Staff user already exists');
    return;
  }

  const staffType = await UserType.findOne({ typeName: 'staff' });
  if (!staffType) {
    console.log('Staff userType not found');
    return;
  }

  const hashedPassword = await bcrypt.hash(staffPassword, 10);
  await User.create({
    email: staffEmail,
    hashedPassword,
    userType: staffType._id,
  });

  console.log(`Created staff user: ${staffEmail} | Password: ${staffPassword}`);
};

const seedDatabase = async () => {
  await seedUserTypes();
  await seedStaffUser();
};

module.exports = seedDatabase;
