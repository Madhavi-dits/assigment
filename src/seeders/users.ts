import { QueryInterface, Sequelize } from 'sequelize';
import { Role } from 'src/utils/enum/role.enum';
import { hashPassword } from 'src/utils/password';


const hashedPassword =  hashPassword('12345678');
module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
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
        role:Role.SUPERADMIN,
        phoneNumber: '9691629030',
        password: hashedPassword
      },
    ], {});
  },

  down: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};