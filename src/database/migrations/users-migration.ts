const  QueryInterface  = require('sequelize');
const DataTypes = require('sequelize').DataTypes;

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      dob: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      gender: {
        allowNull: true,
        type: DataTypes.ENUM('male', 'female', 'others'),
      },
      address: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      role: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      createdBy: {
        allowNull: true,
        type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      },
      passwordUpdateAt:{
        allowNull: false,
        type: DataTypes.DATE,
      },
      resetToken:{
        allowNull: true,
        type: DataTypes.STRING
      },
      refreshToken:{
        allowNull: true,
        type: DataTypes.STRING,
      },
      isVerified:{
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      otp:{
        allowNull: true,
        type: DataTypes.STRING,
      },
      otpExpiration:{
        allowNull: true,
        type: DataTypes.DATE,
      },
      resetTokenExpires:{
        allowNull: true,
        type: DataTypes.DATE,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};
