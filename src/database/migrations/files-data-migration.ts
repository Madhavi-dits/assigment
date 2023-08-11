const DataType = require('sequelize').DataTypes;
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('FileData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataType.INTEGER,
      }, 
      firstName:{
        allowNull: true,
        type: DataType.STRING,
      },
      lastName:{
        allowNull: true,
        type: DataType.STRING,
      },
      gender:{
        allowNull: true,
        type: DataType.STRING,
      },
      country:{
        allowNull: true,
        type: DataType.STRING,
      },
      age:{
        allowNull: true,
        type: DataType.STRING,
      },
      date:{
        allowNull: true,
        type: DataType.STRING,
      },
      createdAt: {
        allowNull: true,
        type: DataType.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataType.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Files-data');
  },
};
