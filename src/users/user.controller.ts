import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { registerSchema } from 'src/schema/register.schema';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginDto } from 'src/dto/login.dto';
import { ForgotPasswordDto } from 'src/dto/forgetPassword.dto';
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';
import { AuthGuard } from 'src/guard/auth.guard';
import { RefreshTokenGuard } from 'src/guard/refreshToken.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './user.model';
import { loginSchema } from 'src/schema/login.schema';
import { resetPasswordSchema } from 'src/schema/reset-password.schema';
import SendResponse from 'src/utils/response/response';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}
    
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto):Promise<{status: number, data: string, message: string}> {
        try {
            const { firstName, lastName, email, password, dob, gender, address, phoneNumber } = await registerSchema.validate(createUserDto);
            return await this.userService.register(firstName, lastName, email, password, dob, gender, address, phoneNumber);
        } catch (error) {
            return SendResponse(STATUS_CODE.BAD_REQUEST, { 'error': error }, RESPONSE_MESSAGES.ERROR_MESSAGES.BAD_REQUEST);
        }

    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string, refreshToken: string }> {
        const { email, password } = await loginSchema.validate(loginDto);
        const user = await this.userService.validateUser(
            email,
            password,
        );
        if (!user) {
            throw new UnauthorizedException(RESPONSE_MESSAGES.MESSAGE.INVALID_CREDENTIALS);
        }
        const tokens = await this.userService.login(user);
        return tokens;
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ resetToken, message }> {
        const { email } = forgotPasswordDto;
        const resetToken = await this.userService.generateResetToken(email);
        return { message: `Reset token for ${email}:`, resetToken };
    }


    @Post('reset-password')

    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: any }> {
        const { email, token, password } = await resetPasswordSchema.validate(resetPasswordDto);
        const user = await this.userService.findByEmail(email);

        if (!user || user.resetToken !== token || user.resetTokenExpires <= new Date()) {
            throw new Error(RESPONSE_MESSAGES.MESSAGE.INVALID_OR_EXPIRED_RESET_TOKEN);
        }
        return await this.userService.resetPassword(user.email, token, password);
    }

    @UseGuards(AuthGuard)
    @Get('home-page')
    getHome() {
        return { "message": RESPONSE_MESSAGES.MESSAGE.WELCOME_TO_HOME_PAGE }
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refreshTokens(@Body() req: any) {
        const userId = req.userId;
        const refreshToken = req.refreshToken;
        return this.userService.refreshTokens(userId, refreshToken);
    }

}