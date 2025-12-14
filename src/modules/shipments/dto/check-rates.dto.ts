import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class RatesItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  value: number;

  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  quantity: number;
}

export class CheckRatesDto {
  @IsString()
  origin_area_id: string;

  @IsString()
  destination_area_id: string;

  @IsString()
  couriers: string; // comma separated: jne,jnt,sicepat

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatesItemDto)
  items: RatesItemDto[];
}
