import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateBiteshipOrderDto {
  @IsUUID()
  orderId: string;

  @IsString()
  courier_company: string;

  @IsString()
  courier_type: string;

  @IsString()
  origin_area_id: string;

  @IsString()
  destination_area_id: string;

  @IsString()
  destination_contact_name: string;

  @IsString()
  destination_contact_phone: string;

  @IsString()
  destination_contact_email: string;

  @IsString()
  destination_address: string;

  @IsNumber()
  destination_postal_code: number;

  @IsString()
  @IsOptional()
  destination_note?: string;
}
