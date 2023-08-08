import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    firstName : string;

    @IsNotEmpty()
    @IsString()
    lastName : string;

    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber : string;

    @IsNotEmpty()
    @IsString()
    dob : string;

    @IsNotEmpty()
    @IsString()
    address : string;

    @IsNotEmpty()
    @IsString()
    gender : string;

    @IsNotEmpty()
    @IsNumber()
    password: number;

    @IsNotEmpty()
    @IsString()
    role : string;
    

}