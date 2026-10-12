// these DTOs validate the reasons supplied by the system-admin
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RequestKycInfo {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
