import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Status order tidak valid' })
  @IsNotEmpty({ message: 'Status wajib diisi' })
  status: OrderStatus;
}
