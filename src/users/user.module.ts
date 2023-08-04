import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { AccessTokenStrategy } from 'src/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from 'src/strategies/refreshToken.strategy';

@Module({
    imports: [
        SequelizeModule.forFeature([User]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '2h' },
        }),
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: 'user',
            session: false,
        }),
        EmailModule
    ],
    providers: [UsersService, EmailService,AccessTokenStrategy,RefreshTokenStrategy],
    controllers: [UsersController],
    exports: [SequelizeModule, PassportModule,JwtModule,EmailModule]
})
export class UsersModule { }