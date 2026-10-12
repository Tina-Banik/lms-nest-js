// these DTOs validate the reasons supplied by the system-admin

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectKycDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  rejectionReason!: string;
}
