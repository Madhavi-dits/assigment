import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from 'src/auth/strategies/accessToken.strategy'; 
import { RefreshTokenStrategy } from 'src/auth/strategies/refreshToken.strategy';


@Module({
    imports: [SequelizeModule.forFeature([User]),
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '5m' },
    }),
    PassportModule.register({      
        defaultStrategy: 'jwt',      
        property: 'user',      
        session: false,    
    }), 
    ],
    providers: [UsersService, AccessTokenStrategy, RefreshTokenStrategy],
    controllers: [UsersController],
    exports: [SequelizeModule, PassportModule, JwtModule]
})
export class UsersModule { }