import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Req, UseInterceptors, Put, Param } from '@nestjs/common';
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
import { RefreshTokenGuard } from 'src/guard/refreshToken.guard';
import { ChangePasswordDto } from 'src/dto/changePassword.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { ResponseInterceptor } from 'src/interceptors/reponse.interceptors';
import { UpdateUserProfiledDto } from 'src/dto/updateUserProfile.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { HasRole } from 'src/decorater/has-roles.decorator';
import { Role } from 'src/utils/enum/role.enum';

@Controller('users')
// @UseGuards(RolesGuard)
@UseInterceptors(ResponseInterceptor)
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    // register
    @UseGuards(AuthGuard, RolesGuard)
    @HasRole(Role.ADMIN, Role.SUPERADMIN)
    @Post('register')
    async register(@Req() request, @Body() createUserDto: CreateUserDto) {
        try {
            const loginUser = request.user.sub;
            const checkRole = await this.userService.findById(loginUser);
            const userRole = checkRole.role;
            const { firstName, lastName, email, password, dob, gender, address, phoneNumber, role } = await registerSchema.validate(createUserDto);
            return await this.userService.register(firstName, lastName, email, password, dob, gender, address, phoneNumber, role, userRole, loginUser);
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // login
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const { email, password, phoneNumber } = await loginSchema.validate(loginDto);
            return await this.userService.login(email, password, phoneNumber);
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // verify otp
    @Post('verify')
    async verify(@Body() verifyUserDto: VerifyUserDto) {
        try {
            const { email, phoneNumber, otp } = verifyUserDto
            return await this.userService.verifyOtp(email, phoneNumber, otp)
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // verify login user
    @Post('verify/login/user')
    async verifyLoginUser(@Body() verifyUserDto: VerifyUserDto) {
        try {
            const { email, phoneNumber, otp } = verifyUserDto
            return await this.userService.loginVerified(email, phoneNumber, otp)
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // forgot-password
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;
            return await this.userService.generateResetToken(email);
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // reset-password
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
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // logout
    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Req() request) {
        try {
            await this.userService.logout(request.user['sub']);
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // refresh token
    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refreshTokens(@Req() request) {
        try {
            const userId = request.user['sub'];
            const refreshToken = request.user['refreshToken'];
            return this.userService.refreshTokens(userId, refreshToken);
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }

    }
    // change password
    @UseGuards(AuthGuard)
    @Post('change-password')
    async changePassword(@Body() changePassword: ChangePasswordDto) {
        try {
            const { email, phoneNumber, oldPassword, newPassword } = changePassword;
            return await this.userService.changePassword(email, phoneNumber, oldPassword, newPassword);
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    // update user profile
    @UseGuards(AuthGuard, RolesGuard)
    @HasRole(Role.USER, Role.ADMIN, Role.USER)
    @Put('/update-user/:id')
    async updateUser(@Param('id') id: string,@Req() request, @Body() updateUserProfile: UpdateUserProfiledDto) {
        try {
            const loginUser = request.user.sub;
            const checkRole = await this.userService.findById(loginUser);
            const userRole = checkRole.role;
            const { firstName, lastName, dob, address } = updateUserProfile;
            return await this.userService.updateUser(id, firstName, lastName, dob, address,userRole, loginUser)
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('/users')
    async getUsers(){
        try {
            return await this.userService.getUsers();
        } catch (error) {
            return {
                statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
            }
        }
    }

}

