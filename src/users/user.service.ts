import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { comparePasswords, hashPassword } from 'src/utils/password';
import { JwtService } from '@nestjs/jwt';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';
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
    //  signup user
    async register(firstName: string, lastName: string, email: string, password: string, dob: string, gender: string, address: string, phoneNumber: string, role:string) {
        const hashedPassword = await hashPassword(password);
        let user;
        try {
            const userEmailExists = await this.findByEmail(email);
            if (userEmailExists) {
                return { statusCode: STATUS_CODE.FORBIDDEN, message: RESPONSE_MESSAGES.MESSAGE.EMAIL_ALREADY_EXISTS }
            }
            const userPhoneExists = await this.findByPhoneNumber(phoneNumber);
            if (userPhoneExists) {
                return { statusCode: STATUS_CODE.FORBIDDEN, message: RESPONSE_MESSAGES.MESSAGE.PHONE_NUMBER_ALREADY_EXISTS };
            }
            user = await this.userModel.create({ firstName, lastName, email, dob, gender, address, phoneNumber, password: hashedPassword, passwordUpdateAt: new Date(), role });
            await this.sendOtpToPhone(user);
            await this.sendOtpToEmail(user);
            return { statusCode: STATUS_CODE.CREATED, data: user, message: RESPONSE_MESSAGES.MESSAGE.USER_REGISTERED_SUCCESSFULLY };
        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }
    }
    // user find by email
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { email } });
        } catch (error) {
            return error.message
        }
    }
    // user find by phoneNumber
    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { phoneNumber } });
        } catch (error) {
            return error.message
        }
    }
    // user find by id
    async findById(id: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { id } });
        } catch (error) {
            return error.message;
        }
    }
    // validate user before login
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
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }
    }
    //  send otp to phoneNumber
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
            return { statusCode: STATUS_CODE.OK, message: RESPONSE_MESSAGES.MESSAGE.OTP_SENT_SUCCESSFULLY }
        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }
    }
    // send otp to email
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
            return { statusCode: STATUS_CODE.OK, message: RESPONSE_MESSAGES.MESSAGE.OTP_SENT_SUCCESSFULLY }
        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }
    }
    // verify otp
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
                return { statusCode: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.USER_NOT_FOUND };
            }
            if (user && otp === user.otp) {
                const timeDiff = parseInt(time) - parseInt(user.otpExpiration.getTime());
                const minDiff = Math.floor(timeDiff / 60000);
                if (minDiff <= 5) {
                    await this.userModel.update(
                        { otp: null, otpExpiration: null, isVerified: true },
                        { where: { id: user.id } },
                    );
                    return { statusCode: STATUS_CODE.ACCEPTED, message: RESPONSE_MESSAGES.MESSAGE.USER_VERIFIED };
                }
                if (minDiff > 5) {
                    if (phoneNumber) {
                        await this.sendOtpToPhone(user);
                    }
                    if (email) {
                        await this.sendOtpToEmail(user);
                    }
                    return { statusCode: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.OTP_EXPIRED };
                }
                return { statusCode: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.OTP_EXPIRED }
            } else {
                return { statusCode: STATUS_CODE.FORBIDDEN, message: RESPONSE_MESSAGES.MESSAGE.INVALID_OTP };
            }
        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }

    }
    // login user
    async login(email: string, password: string, phoneNumber: string) {
        let verifiedUser;
        try {
            const user = await this.validateUser(
                email,
                password,
                phoneNumber,
            );
            if (!user) {
                return { statusCode: STATUS_CODE.UNAUTHORIZED, message: RESPONSE_MESSAGES.MESSAGE.INVALID_CREDENTIALS };
            }
            if(user.isVerified){
                if (phoneNumber) {
                    verifiedUser = await this.sendOtpToPhone(user);
                }
                if (email) {
                    verifiedUser = await this.sendOtpToEmail(user);
                }
                return verifiedUser;
            } else {
                if (phoneNumber) {
                    await this.sendOtpToPhone(user);
                }
                if (email) {
                    await this.sendOtpToEmail(user);
                }
                return { statusCode: STATUS_CODE.UNAUTHORIZED, message: RESPONSE_MESSAGES.MESSAGE.VERIFY_ACCOUNT }
            }
            

        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }
    }
    // login time verification
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
                    return { statusCode: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.OTP_EXPIRED };
                }
            } else {
                if (phoneNumber) {
                    await this.sendOtpToPhone(user);
                }
                if (email) {
                    await this.sendOtpToEmail(user);
                }
                return { statusCode: STATUS_CODE.FORBIDDEN, message: RESPONSE_MESSAGES.MESSAGE.INVALID_OTP };
            }

        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST }
        }
    }
    // genrate reset password token
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
            return { data: resetToken, message: RESPONSE_MESSAGES.MESSAGE.TOKEN_GENERATED_SUCCESSFULLY };
        } catch (error) {
            return { statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST };
        }

    }
    // reset password api
    async resetPassword(email: string, token: string, password: string) {
        try {
            await this.userModel.update(
                { password: password, resetToken: null, resetTokenExpires: null, passwordUpdateAt: new Date() },
                { where: { email: email } },
            );
            return { statusCode: STATUS_CODE.OK, message: RESPONSE_MESSAGES.MESSAGE.PASSWORD_RESET_SUCCESSFULLY }
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }
    // get access and refresh token
    async getTokens(userId: string, email: string) {
        const secret: string = process.env.JWT_SECRET;
        const refreshSecret: string = process.env.JWT_REFRESH_SECRET;
        try {
            const [accessToken, refreshToken] = await Promise.all([
                await this.jwtService.signAsync(
                    {
                        sub: userId,
                        email,
                    },
                    {
                        secret: secret,
                        expiresIn: '1h',
                    },
                ),
                await this.jwtService.signAsync(
                    {
                        sub: userId,
                        email,
                    },
                    {
                        secret: refreshSecret,
                        expiresIn: '7d',
                    },
                ),
            ]);
            return { data: { accessToken: accessToken, refreshToken: refreshToken } };
        } catch (error) {
            return error.message
        }

    }
    // update refresh token
    async updateRefreshToken(userId: string, refreshToken: string) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken);
            await this.userModel.update(
                { refreshToken: hashedRefreshToken },
                { where: { id: userId } },
            );
            return { data: hashedRefreshToken };
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }

    }
    //from refresh token get new access token
    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const user = await this.findById(userId);
            if (!user?.refreshToken) {
                return { statusCode: STATUS_CODE.FORBIDDEN, message: RESPONSE_MESSAGES.MESSAGE.ACCESS_DENIED };
            }

            const refreshTokenMatches = await compare(
                user.refreshToken,
                refreshToken,
            );
            if (!refreshTokenMatches) {
                return { statusCode: STATUS_CODE.FORBIDDEN, message: RESPONSE_MESSAGES.MESSAGE.ACCESS_DENIED };
            };
            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch (error) {
            return error.message
        }

    }
    // hash refreh token
    hashData(data: string) {
        return hashPassword(data);
    }
    // logout 
    async logout(userId: string) {
        try {
            await this.userModel.update({ refreshToken: null }, { where: { id: userId } });
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }

    }
    // change password 
    async changePassword(email: string, phoneNumber: string, oldPassword: string, newPassword: string) {
        const hashedPassword = await hashPassword(newPassword);
        try {
            const user = await this.validateUser(
                email,
                oldPassword,
                phoneNumber,
            );
            if (!user) {
                return { statusCode: STATUS_CODE.UNAUTHORIZED, message: RESPONSE_MESSAGES.MESSAGE.INVALID_CREDENTIALS };
            }
            await this.userModel.update(
                { password: hashedPassword, passwordUpdateAt: new Date() },
                { where: { email: user.email } },
            );
            return { statusCode: STATUS_CODE.OK, message: RESPONSE_MESSAGES.MESSAGE.PASSWORD_CHANGE_SUCCESSFULLY }

        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }

    }

    async updateUser(id:string,firstName:string,lastName:string,dob:string,address:string){
        try {
            const user = await this.findById(id)
            if (!user) {
                return { statusCode: STATUS_CODE.NOT_FOUND, message: RESPONSE_MESSAGES.MESSAGE.USER_NOT_FOUND };
            }
            await this.userModel.update(
                { firstName: firstName, lastName:lastName,dob:dob,address:address },
                { where: { id: id } },
            );
            return { statusCode: STATUS_CODE.OK, message: RESPONSE_MESSAGES.MESSAGE.USER_PROFILE_UPDATED }
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

}
