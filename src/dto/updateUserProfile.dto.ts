import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateUserProfiledDto {
    @IsNotEmpty()
    @IsString()
    firstName : string;

    @IsNotEmpty()
    @IsString()
    lastName : string;

    @IsNotEmpty()
    @IsString()
    dob : string;

    @IsNotEmpty()
    @IsString()
    address : string;
}