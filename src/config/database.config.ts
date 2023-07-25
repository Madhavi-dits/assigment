import { SequelizeModuleOptions } from '@nestjs/sequelize';

const databaseConfig: SequelizeModuleOptions = {
    dialect: 'mysql',
    host: 'localhost',
    //   port: 3306,
    username: 'root',
    password: '123qwe!@#QWE',
    database: 'assesment',
    models: [__dirname + '/**/*.model.ts'],
    autoLoadModels: true,
    synchronize: true, 
};

export default databaseConfig;



