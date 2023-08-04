import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}