import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName : string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName : string;

    @ApiProperty()
    @IsEmail()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phoneNumber : string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    dob : string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address : string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    gender : string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

}