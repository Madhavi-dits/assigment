import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    email:string;

    @IsString()
    phoneNumber:string;

    @IsString()
    @MinLength(6)
    oldPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}