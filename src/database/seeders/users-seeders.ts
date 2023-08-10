const bcrypt = require("bcrypt");

const password = bcrypt.hashSync('12345678', bcrypt.genSaltSync(8));

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Madhavi',
        lastName: 'Sharma',
        email: 'madhavi@yopmail.com',
        gender:'Female',
        dob:'07-08-1998',
        address:'chandigarh',
        createdAt: new Date(),
        updatedAt: new Date(),
        role:'superadmin',
        phoneNumber: '9691629030',
        password: password,
        passwordUpdateAt: new Date(),
        isVerified: 1
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

