import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { comparePasswords, hashPassword } from 'src/utils/password';
import { JwtService } from '@nestjs/jwt';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';
import * as argon2 from 'argon2';
import SendResponse from 'src/utils/response/response';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';

@Injectable()
export class UsersService {
    usersService: any;
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private jwtService: JwtService,
    ) { }

    async register(firstName: string, lastName: string, email: string, password: string, dob: string, gender: string, address: string, phoneNumber: string): Promise<{status: number, data:string, message:string}> {
        const hashedPassword = await hashPassword(password);
        let user: User;
        try {
            user = await this.userModel.create({ firstName, lastName, email, dob, gender, address, phoneNumber, password: hashedPassword });
            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return SendResponse(STATUS_CODE.CREATED, user, RESPONSE_MESSAGES.MESSAGE.USER_REGISTERED_SUCCESSFULLY );
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, {'error':error}, RESPONSE_MESSAGES.ERROR_MESSAGES.BAD_REQUEST);
        }

    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { email } });
        } catch (error) {
            return error.message
        }

    }
    async findById(id: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { id } });
        } catch (error) {
            return error.message;
        }

    }
    async validateUser(email: string, password: string): Promise<User | null> {
        let user: User;
        try {
            user = await this.findByEmail(email);
            if (user && (await comparePasswords(password, user.password))) {
                return user;
            }
            return null;
        } catch (error) {
            return error.message;
        }

    }

    async login(user: User) {
        let tokens:any;
        try {
            tokens = await this.getTokens(user.id, user.email);
            return  tokens;
        } catch (error) {
            return error.message;
        }

    }

    async generateResetToken(email: string): Promise<{status: number, data:string, message:string}> {
        let resetToken = process.env.RESET_TOKEN;
        let resetTokenExpires = new Date(Date.now() + 3600000);
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                throw new Error(RESPONSE_MESSAGES.MESSAGE.USER_NOT_FOUND);
            }
            await this.userModel.update(
                { resetToken, resetTokenExpires },
                { where: { email } },
            );
            return SendResponse(STATUS_CODE.OK, {'data':resetToken}, RESPONSE_MESSAGES.MESSAGE.TOKEN_GENERATED_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, {'error':error.message}, RESPONSE_MESSAGES.ERROR_MESSAGES.BAD_REQUEST);
        }

    }
    async resetPassword(email: string, token: string, password: string): Promise<{ status: number, data:string, message:string }> {
        try {
            await this.userModel.update(
                { password, resetToken: null, resetTokenExpires: null },
                { where: { email, resetToken: token, resetTokenExpires: { $gt: new Date() } } },
            );
            return SendResponse(STATUS_CODE.OK, RESPONSE_MESSAGES.MESSAGE.PASSWORD_RESET_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, {'error':error.message}, RESPONSE_MESSAGES.ERROR_MESSAGES.BAD_REQUEST);
        }
    }

    async getTokens(userId: string, username: string) {
        const secret: string = process.env.JWT_SECRET;
        const refreshSecret: string = process.env.JWT_REFRESH_SECRET;
        try {
            const [accessToken, refreshToken] = await Promise.all([
                await this.jwtService.signAsync(
                    {
                        sub: userId,
                        username,
                    },
                    {
                        secret: secret,
                        expiresIn: '3m',
                    },
                ),
                await this.jwtService.signAsync(
                    {
                        sub: userId,
                        username,
                    },
                    {
                        secret: refreshSecret,
                        expiresIn: '7d',
                    },
                ),
            ]);

            return {
                accessToken,
                refreshToken,
            };
        } catch (error) {
            return error.message
        }

    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken);
            await this.userModel.update(
                { refreshToken: hashedRefreshToken },
                { where: { id: userId } },
            );
            return hashedRefreshToken;
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, {'error':error}, RESPONSE_MESSAGES.ERROR_MESSAGES.BAD_REQUEST);
        }

    }
    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const user = await this.findById(userId);
            if (!user?.refreshToken)
                throw new ForbiddenException('Access Denied');
            const refreshTokenMatches = await argon2.verify(
                user.refreshToken,
                refreshToken,
            );
            if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch (error) {
            return error.message
        }

    }
    hashData(data: string) {
        return argon2.hash(data);
    }
}
