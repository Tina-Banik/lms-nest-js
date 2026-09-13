import { InstituteType } from "@prisma/client";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsPhoneNumber()
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @IsString()
  @IsNotEmpty()
  instituteName!:string;

  @IsEnum(InstituteType)
  instituteType!:InstituteType;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  pincode!: string;

  @IsBoolean()
  acceptTerms!:boolean;

  @IsBoolean()
  acceptPrivacyPolicy!:boolean;
}
