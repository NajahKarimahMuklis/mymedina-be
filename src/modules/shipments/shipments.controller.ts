import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Put,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { BiteshipService } from './biteship.service';
import { CheckRatesDto } from './dto/check-rates.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('shipments')
export class ShipmentController {
  private readonly logger = new Logger(ShipmentController.name);

  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly biteshipService: BiteshipService,
  ) {}

  @Get('areas')
  @HttpCode(HttpStatus.OK)
  async getAreas(@Query('input') input: string) {
    const result = await this.biteshipService.cariLokasi(input || '', 'ID');
    return result;
  }

  @Post('rates')
  @HttpCode(HttpStatus.OK)
  async getRates(@Body() body: CheckRatesDto) {
    try {
      this.logger.log('📤 Calculating shipping rates');
      this.logger.debug('Payload:', JSON.stringify(body, null, 2));

      const hasAreaId = body.origin_area_id && body.destination_area_id;
      const hasPostalCode =
        body.origin_postal_code && body.destination_postal_code;

      if (!hasAreaId && !hasPostalCode) {
        throw new BadRequestException(
          'Harus menggunakan area_id ATAU postal_code untuk origin dan destination',
        );
      }

      if (!body.items || body.items.length === 0) {
        throw new BadRequestException('Items tidak boleh kosong');
      }

      const biteshipPayload: any = {
        couriers: body.couriers || 'jne,jnt,sicepat,anteraja,pos',
        items: body.items.map((item) => ({
          name: item.name,
          description: item.description || item.name,
          value: item.value,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          quantity: item.quantity,
        })),
      };

      if (hasPostalCode) {
        biteshipPayload.origin_postal_code = body.origin_postal_code;
        biteshipPayload.destination_postal_code = body.destination_postal_code;
        this.logger.log('Using postal_code method');
      } else {
        biteshipPayload.origin_area_id = body.origin_area_id;
        biteshipPayload.destination_area_id = body.destination_area_id;
        this.logger.log('Using area_id method');
      }

      const result = await this.biteshipService.cekOngkir(biteshipPayload);

      this.logger.log('✅ Biteship response SUCCESS');
      return result;
    } catch (error) {
      this.logger.error('❌ Biteship API Error:');
      this.logger.error('Status:', error.response?.status);
      this.logger.error('Status Text:', error.response?.statusText);
      this.logger.error(
        'Error Data:',
        JSON.stringify(error.response?.data, null, 2),
      );
      this.logger.error('Error Message:', error.message);

      if (error.response?.data) {
        throw new BadRequestException({
          message: error.response.data.message || 'Gagal menghitung ongkir',
          error: error.response.data.error,
          code: error.response.data.code,
          details: error.response.data,
          hint: 'Cek API Key Biteship atau validitas area/postal code',
        });
      }

      throw new BadRequestException({
        message: 'Terjadi kesalahan saat menghitung ongkir',
        error: error.message,
        hint: 'Cek koneksi ke Biteship API atau API Key',
      });
    }
  }

  @Post('order')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() body: any) {
    try {
      if (body?.orderId) {
        return await this.shipmentsService.buatPengirimanDenganBiteship(body);
      }
      return await this.biteshipService.buatOrderShipment(body);
    } catch (error) {
      throw new BadRequestException({
        message: error.response?.data?.message || 'Gagal membuat shipment',
        details: error.response?.data,
      });
    }
  }

  // ✅ GET SHIPMENT BY ORDER ID (untuk customer & admin)
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getShipmentByOrder(@Param('orderId') orderId: string, @Request() req) {
    this.logger.log(`📦 Getting shipment for order: ${orderId}`);

    try {
      const shipment =
        await this.shipmentsService.getShipmentByOrderId(orderId);

      if (!shipment) {
        throw new NotFoundException('Shipment tidak ditemukan');
      }

      // Check authorization: only owner or admin
      const userId = req.user.userId;
      const isAdmin =
        req.user.role === Role.ADMIN || req.user.role === Role.OWNER;

      if (!isAdmin && shipment.order?.user?.id !== userId) {
        throw new BadRequestException(
          'Anda tidak memiliki akses ke shipment ini',
        );
      }

      return {
        success: true,
        shipment: {
          id: shipment.id,
          orderId: shipment.orderId,
          nomorResi: shipment.nomorResi,
          courierWaybillId: shipment.courierWaybillId,
          kurir: shipment.kurir,
          layanan: shipment.layanan,
          status: shipment.status,
          biaya: shipment.biaya,
          deskripsi: shipment.deskripsi,
          estimasiPengiriman: shipment.estimasiPengiriman,
          dikirimPada: shipment.dikirimPada,
          diterimaPada: shipment.diterimaPada,
          courierTrackingUrl: shipment.courierTrackingUrl,
          biteshipOrderId: shipment.biteshipOrderId,
          biteshipTrackingId: shipment.biteshipTrackingId,
        },
      };
    } catch (error) {
      this.logger.error('❌ Failed to get shipment:', error.message);
      throw error;
    }
  }

  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  async createManualShipment(@Body() body: any) {
    const { orderId, kurir, layanan, nomorResi, biaya } = body;

    if (!orderId || !kurir || !nomorResi) {
      throw new BadRequestException(
        'orderId, kurir, dan nomorResi wajib diisi',
      );
    }

    return this.shipmentsService.createManualShipment({
      orderId,
      kurir,
      layanan,
      nomorResi,
      biaya,
    });
  }

  // ✅ GET SHIPMENT INFO UNTUK CUSTOMER (cuma info resi, biar cek sendiri)
  @Get('tracking/:orderId')
  @HttpCode(HttpStatus.OK)
  async trackingCustomer(@Param('orderId') orderId: string) {
    const shipment = await this.shipmentsService.getShipmentByOrderId(orderId);

    if (!shipment) {
      return {
        success: true,
        hasShipment: false,
        message: 'Shipment belum dibuat',
      };
    }

    return {
      success: true,
      hasShipment: true,
      tracking: {
        nomorResi: shipment.nomorResi,
        kurir: shipment.kurir,
        layanan: shipment.layanan,
        status: shipment.status,
        courierTrackingUrl: shipment.courierTrackingUrl,
      },
    };
  }

  // ✅ UPDATE TRACKING INFO (Admin Only)
  @Put(':id/tracking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  async updateTracking(
    @Param('id') shipmentId: string,
    @Body() dto: UpdateTrackingDto,
  ) {
    this.logger.log(`📝 Updating tracking info for shipment ${shipmentId}`);

    try {
      const shipment = await this.shipmentsService.updateTrackingInfoShipment(
        shipmentId,
        dto.nomorResi,
      );

      if (dto.kurir) {
        shipment.kurir = dto.kurir;
      }

      return {
        success: true,
        message: 'Tracking info berhasil diupdate',
        shipment,
      };
    } catch (error) {
      this.logger.error('❌ Failed to update tracking:', error.message);
      throw new BadRequestException({
        message: 'Gagal update tracking info',
        error: error.message,
      });
    }
  }
}
