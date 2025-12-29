import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Response,
  BadRequestException,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ReportsService } from '../services/reports.service';
import { DateRangeDto } from '../dto/reports.dto';
import { ExportService } from '../services/export.service';

/**
 * Owner Reports Controller
 * Hanya untuk laporan keuangan (Sales Report)
 * Overview data diambil dari /orders/admin/all di frontend
 */
@Controller('owner/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * GET /owner/reports/sales
   * Get sales report for date range
   */
  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async getSalesReport(@Query() dateRange: DateRangeDto) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateSalesReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    return report;
  }

  /**
   * GET /owner/reports/sales/export
   * Export sales report to CSV
   */
  @Get('sales/export')
  @HttpCode(HttpStatus.OK)
  async exportSalesReport(
    @Query() dateRange: DateRangeDto,
    @Response() res: ExpressResponse,
  ) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateSalesReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    const csv = this.exportService.generateSalesReportCSV(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }
}