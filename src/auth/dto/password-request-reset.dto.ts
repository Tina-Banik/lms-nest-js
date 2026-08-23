import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordRequestResetDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
