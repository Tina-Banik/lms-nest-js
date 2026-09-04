import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendVerifyEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email!:string
}