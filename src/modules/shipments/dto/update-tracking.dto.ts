// src/modules/shipments/dto/update-tracking.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateTrackingDto {
  @IsString()
  nomorResi: string;

  @IsOptional()
  @IsString()
  kurir?: string;
}
