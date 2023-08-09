import { Module, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/user.module';
import { UsersController } from './users/user.controller';
import { UsersService } from './users/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      // port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME_DEVELOPMENT,
      models: [__dirname + '/**/*.model.ts'],
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    ScheduleModule.forRoot(),
    CronjobsModule,
    UsersModule,
    EmailModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, JwtService, EmailService,]
})
export class AppModule { }
