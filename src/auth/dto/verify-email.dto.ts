import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailDto {
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    token!:string
}