import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { comparePasswords, hashPassword } from 'src/utils/password';
import { JwtService } from '@nestjs/jwt';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';
import { Response, SendResponse } from 'src/utils/response/response';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';
import * as crypto from 'crypto';
import { Twilio } from 'twilio';
import { EmailService } from 'src/email/email.service';
import { compare } from 'bcryptjs';
import { message, otp, otpExpiration, time } from 'src/utils/constant/constant';

@Injectable()
export class UsersService {
    usersService: any;
    private twilioClient: Twilio;
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private jwtService: JwtService,
        private emailService: EmailService
    ) {
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
        this.twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
    }

    async register(firstName: string, lastName: string, email: string, password: string, dob: string, gender: string, address: string, phoneNumber: string) {
        const hashedPassword = await hashPassword(password);
        let user;
        try {
            const userEmailExists = await this.findByEmail(email);
            if (userEmailExists) {
                return SendResponse(STATUS_CODE.FORBIDDEN, email, RESPONSE_MESSAGES.MESSAGE.EMAIL_ALREADY_EXISTS)
            }
            const userPhoneExists = await this.findByPhoneNumber(phoneNumber);
            if (userPhoneExists) {
                return SendResponse(STATUS_CODE.FORBIDDEN, phoneNumber, RESPONSE_MESSAGES.MESSAGE.PHONE_NUMBER_ALREADY_EXISTS)
            }
            user = await this.userModel.create({ firstName, lastName, email, dob, gender, address, phoneNumber, password: hashedPassword, passwordUpdateAt: new Date() });
            await this.sendOtpToPhone(user);
            await this.sendOtpToEmail(user);
            return SendResponse(STATUS_CODE.CREATED, user, RESPONSE_MESSAGES.MESSAGE.USER_REGISTERED_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { email } });
        } catch (error) {
            return error.message
        }
    }
    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { phoneNumber } });
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
    async validateUser(email: string, password: string, phoneNumber: string) {
        let user;
        try {
            if (email) {
                user = await this.findByEmail(email);
            }
            if (phoneNumber) {
                user = await this.findByPhoneNumber(phoneNumber);
            }
            if (user && (await comparePasswords(password, user.password))) {
                return user;
            }
            return null;
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    async sendOtpToPhone(user) {
        const COUNTRY_CODE = '+91'
        try {
            await this.twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: COUNTRY_CODE + user.phoneNumber,
            });
            await this.userModel.update(
                { otp: otp, otpExpiration: otpExpiration },
                { where: { phoneNumber: user.phoneNumber } },
            );
            return Response(STATUS_CODE.OK, RESPONSE_MESSAGES.MESSAGE.OTP_SENT_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    async sendOtpToEmail(user) {
        try {
            const mailDetails = {
                from: process.env.MAIL_USER,
                to: user.email,
                subject: 'Your Login Otp',
                template: './verifyOtp',
                context: {
                    name: user.firstName,
                    otp: otp,
                },
            };
            this.emailService.sendMail(mailDetails);
            await this.userModel.update(
                { otp: otp, otpExpiration: otpExpiration },
                { where: { email: user.email } },
            );
            return Response(STATUS_CODE.OK, RESPONSE_MESSAGES.MESSAGE.OTP_SENT_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    async verifyOtp(email: string, phoneNumber: string, otp: string) {
        let user;
        try {
            if (phoneNumber) {
                user = await this.findByPhoneNumber(phoneNumber);
            }
            if (email) {
                user = await this.findByEmail(email);
            }
            if (!user) {
                return { status: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.USER_NOT_FOUND }
            }
            if (user && otp === user.otp) {
                const timeDiff = parseInt(time) - parseInt(user.otpExpiration.getTime());
                const minDiff = Math.floor(timeDiff / 60000);
                if (minDiff <= 5) {
                    await this.userModel.update(
                        { otp: null, otpExpiration: null, isVerified: true },
                        { where: { id: user.id } },
                    );
                    return { status: STATUS_CODE.ACCEPTED, message: RESPONSE_MESSAGES.MESSAGE.USER_VERIFIED };
                }
                if (minDiff > 5) {
                    if (phoneNumber) {
                        await this.sendOtpToPhone(user);
                    }
                    if (email) {
                        await this.sendOtpToEmail(user);
                    }
                    return { status: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.OTP_EXPIRED };
                }
                return SendResponse(STATUS_CODE.NOT_FOUND, '', RESPONSE_MESSAGES.MESSAGE.OTP_EXPIRED);
            } else {
                return Response(STATUS_CODE.FORBIDDEN, RESPONSE_MESSAGES.MESSAGE.INVALID_OTP);
            }
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }

    }
    async login(email: string, password: string, phoneNumber: string) {
        let verifiedUser;
        try {
            const user = await this.validateUser(
                email,
                password,
                phoneNumber,
            );
            if (!user) {
                throw new UnauthorizedException(RESPONSE_MESSAGES.MESSAGE.INVALID_CREDENTIALS);
            }
            if(user.isVerified == 1){
                if (phoneNumber) {
                    verifiedUser = await this.sendOtpToPhone(user);
                }
                if(email){
                    verifiedUser = await this.sendOtpToEmail(user);
                }
                return verifiedUser;
            }
            else{
                if (phoneNumber) {
                    verifiedUser = await this.sendOtpToPhone(user);
                }
                if(email){
                    verifiedUser = await this.sendOtpToEmail(user);
                }
                return Response(STATUS_CODE.UNAUTHORIZED, RESPONSE_MESSAGES.MESSAGE.VERIFY_ACCOUNT)
            }
            
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    async loginVerified(email: string, phoneNumber: string, otp: string) {
        let user;
        let tokens;
        try {
            if (phoneNumber) {
                user = await this.findByPhoneNumber(phoneNumber);
            }
            if (email) {
                user = await this.findByEmail(email);
            }
            if (!user) {
                return { status: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.USER_NOT_FOUND }
            }
            if (user && otp === user.otp) {
                const timeDiff = parseInt(time) - parseInt(user.otpExpiration.getTime());
                const minDiff = Math.floor(timeDiff / 60000);
                if (minDiff <= 5) {
                    await this.userModel.update(
                        { otp: null, otpExpiration: null },
                        { where: { id: user.id } },
                    );
                    tokens = await this.getTokens(user.id, user.email);
                    await this.updateRefreshToken(user.id, tokens.refreshToken);
                    return tokens;
                }
                if (minDiff > 5) {
                    if (phoneNumber) {
                        await this.sendOtpToPhone(user);
                    }
                    if (email) {
                        await this.sendOtpToEmail(user);
                    }
                    return Response(STATUS_CODE.NOT_FOUND, RESPONSE_MESSAGES.MESSAGE.OTP_EXPIRED);
                }
            } else {
                if (phoneNumber) {
                    await this.sendOtpToPhone(user);
                }
                if (email) {
                    await this.sendOtpToEmail(user);
                }
                return Response(STATUS_CODE.FORBIDDEN, RESPONSE_MESSAGES.MESSAGE.INVALID_OTP);
            }

        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    async generateResetToken(email: string) {
        let resetToken = crypto.randomBytes(40).toString('hex');
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
            return SendResponse(STATUS_CODE.OK, { 'data': resetToken }, RESPONSE_MESSAGES.MESSAGE.TOKEN_GENERATED_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error.message }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }

    }
    async resetPassword(email: string, token: string, password: string) {
        try {
            await this.userModel.update(
                { password, resetToken: null, resetTokenExpires: null,passwordUpdateAt: new Date() },
                { where: { email, resetToken: token, resetTokenExpires: { $gt: new Date() } } },
            );
            return SendResponse(STATUS_CODE.OK, '', RESPONSE_MESSAGES.MESSAGE.PASSWORD_RESET_SUCCESSFULLY);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error.message }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
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
                        expiresIn: '1h',
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
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }

    }
    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const user = await this.findById(userId);
            if (!user?.refreshToken) {
                throw new ForbiddenException(RESPONSE_MESSAGES.MESSAGE.ACCESS_DENIED);
            }

            const refreshTokenMatches = await compare(
                user.refreshToken,
                refreshToken,
            );
            if (!refreshTokenMatches) {
                throw new ForbiddenException(RESPONSE_MESSAGES.MESSAGE.ACCESS_DENIED)
            };
            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch (error) {
            return error.message
        }

    }
    hashData(data: string) {
        return hashPassword(data);
    }
    async logout(userId: string) {
        try {
            await this.userModel.update( { refreshToken: null }, {where:{id:userId}});
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
        
    }

    async changePassword(email:string,phoneNumber:string, oldPassword:string, newPassword:string)
    {
        const hashedPassword = await hashPassword(newPassword);
        try {
            const user = await this.validateUser(
                email,
                oldPassword,
                phoneNumber,
            );
            if (!user) {
                throw new UnauthorizedException(RESPONSE_MESSAGES.MESSAGE.INVALID_CREDENTIALS);
            }
            await this.userModel.update(
                { password: hashedPassword, passwordUpdateAt: new Date()},
                { where: { email: user.email } },
            );
            return Response(STATUS_CODE.OK, RESPONSE_MESSAGES.MESSAGE.PASSWORD_CHANGE_SUCCESSFULLY)

        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

   
}
