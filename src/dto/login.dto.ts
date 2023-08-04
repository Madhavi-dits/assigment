import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmpty()
  email: string;

  @IsString()
  @IsEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}