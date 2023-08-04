import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { registerSchema } from 'src/schema/register.schema';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginDto } from 'src/dto/login.dto';
import { ForgotPasswordDto } from 'src/dto/forgetPassword.dto';
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';
import { loginSchema } from 'src/schema/login.schema';
import { resetPasswordSchema } from 'src/schema/reset-password.schema';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';
import { VerifyUserDto } from 'src/dto/verifyUser.dto';
import { SendResponse } from 'src/utils/response/response';
import { RefreshTokenGuard } from 'src/guard/refreshToken.guard';
import { ChangePasswordDto } from 'src/dto/changePassword';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        try {
            const { firstName, lastName, email, password, dob, gender, address, phoneNumber } = await registerSchema.validate(createUserDto);
            const user = await this.userService.register(firstName, lastName, email, password, dob, gender, address, phoneNumber);
            return user;
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }

    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const { email, password, phoneNumber } = await loginSchema.validate(loginDto);
            return await this.userService.login(email, password, phoneNumber);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    @Post('verify')
    async verify(@Body() verifyUserDto: VerifyUserDto) {
        try {
            const { email, phoneNumber, otp } = verifyUserDto
            return await this.userService.verifyOtp(email, phoneNumber, otp)
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    @Post('verify/login/user')
    async verifyLoginUser(@Body() verifyUserDto: VerifyUserDto) {
        try {
            const { email, phoneNumber, otp } = verifyUserDto
            return await this.userService.loginVerified(email, phoneNumber, otp)
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;
            return await this.userService.generateResetToken(email);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        try {
            const { email, token, password } = await resetPasswordSchema.validate(resetPasswordDto);
            const user = await this.userService.findByEmail(email);

            if (!user || user.resetToken !== token || user.resetTokenExpires <= new Date()) {
                throw new Error(RESPONSE_MESSAGES.MESSAGE.INVALID_OR_EXPIRED_RESET_TOKEN);
            }
            return await this.userService.resetPassword(user.email, token, password);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }

    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Body() req: any) {
        try {
            await this.userService.logout(req.user['sub']);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refreshTokens(@Body() req: any) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return this.userService.refreshTokens(userId, refreshToken);
    }
    @UseGuards(AuthGuard)
    @Post('change-password')
    async changePassword(@Body() changePassword: ChangePasswordDto) {
        try {
            const { email, phoneNumber, oldPassword, newPassword } = changePassword;
            return await this.userService.changePassword(email,phoneNumber, oldPassword, newPassword);

        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST);
        }
    }
}

