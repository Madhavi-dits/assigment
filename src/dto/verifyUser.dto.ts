import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  @IsEmpty()
  email: string;

  @IsString()
  @IsEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}