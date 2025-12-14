import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ShipmentsService } from './shipments.service';
import { CheckRatesDto } from './dto/check-rates.dto';
import { CreateBiteshipOrderDto } from './dto/create-biteship-order.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  /**
   * POST /shipments/check-rates - Cek Ongkir
   */
  @Post('check-rates')
  @HttpCode(HttpStatus.OK)
  async cekOngkir(@Body() checkRatesDto: CheckRatesDto) {
    const rates = await this.shipmentsService.cekOngkir(checkRatesDto);
    return {
      message: 'Berhasil cek ongkir',
      data: rates,
    };
  }

  /**
   * POST /shipments - Create Shipment (Manual)
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
   * POST /shipments/create-with-biteship - Buat Shipment via Biteship
   */
  @Post('create-with-biteship')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.CREATED)
  async buatPengirimanDenganBiteship(
    @Body() createBiteshipOrderDto: CreateBiteshipOrderDto,
  ) {
    const shipment = await this.shipmentsService.buatPengirimanDenganBiteship(
      createBiteshipOrderDto,
    );
    return {
      message: 'Shipment berhasil dibuat via Biteship',
      shipment,
    };
  }

  /**
   * GET /shipments/locations/search - Cari Lokasi
   * NOTE: Specific routes must be before generic :id routes
   */
  @Get('locations/search')
  async cariLokasi(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" diperlukan');
    }

    const locations = await this.shipmentsService.cariLokasi(query);
    return {
      message: 'Berhasil cari lokasi',
      data: locations,
    };
  }

  /**
   * GET /shipments/order/:orderId/track - Track Shipment by Order ID
   * NOTE: Specific routes must be before generic :id routes
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
   * GET /shipments/:id/tracking - Tracking dari Biteship
   * NOTE: Routes with additional params must be before generic :id routes
   */
  @Get(':id/tracking')
  async trackingShipment(@Param('id') id: string) {
    const tracking = await this.shipmentsService.trackingDariBiteship(id);
    return {
      message: 'Berhasil tracking shipment',
      data: tracking,
    };
  }

  /**
   * GET /shipments/:id - Get Shipment by ID
   * NOTE: This is the most generic GET route, must be last
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