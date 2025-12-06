import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

/**
 * Shipments Controller
 *
 * OOP Concepts:
 * - Encapsulation: HTTP handling logic in controller
 * - Single Responsibility: Handles only HTTP requests/responses
 *
 * Design Patterns:
 * - Controller Pattern: Handles HTTP requests
 * - Dependency Injection: ShipmentsService injected
 * - Guard Pattern: Authentication and authorization
 */
@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  /**
   * POST /shipments - Create Shipment
   * Admin/Owner only
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.CREATED)
  async buatPengiriman(@Body() createShipmentDto: CreateShipmentDto) {
    const shipment =
      await this.shipmentsService.buatPengiriman(createShipmentDto);

    return {
      message: 'Pengiriman berhasil dibuat',
      shipment,
    };
  }

  /**
   * GET /shipments/order/:orderId/track - Track Shipment by Order ID
   * Customer (own orders) or Admin (all orders)
   */
  @Get('order/:orderId/track')
  async lacakPengiriman(@Param('orderId') orderId: string) {
    const shipment =
      await this.shipmentsService.ambilPengirimanByOrderId(orderId);

    return {
      message: 'Berhasil melacak pengiriman',
      shipment,
    };
  }

  /**
   * GET /shipments/:id - Get Shipment by ID
   * Customer (own shipments) or Admin (all shipments)
   */
  @Get(':id')
  async ambilPengirimanById(@Param('id') id: string) {
    const shipment = await this.shipmentsService.ambilPengirimanById(id);

    return {
      message: 'Berhasil mengambil detail pengiriman',
      shipment,
    };
  }

  /**
   * PUT /shipments/:id/status - Update Shipment Status
   * Admin/Owner only
   */
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async updateStatusPengiriman(
    @Param('id') id: string,
    @Body() updateShipmentStatusDto: UpdateShipmentStatusDto,
  ) {
    const shipment = await this.shipmentsService.updateStatusPengiriman(
      id,
      updateShipmentStatusDto,
    );

    return {
      message: 'Status pengiriman berhasil diupdate',
      shipment,
    };
  }
}

