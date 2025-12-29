import { Injectable } from '@nestjs/common';

/**
 * Export Service - Generate CSV files for reports
 * Hanya untuk Sales Report (Owner)
 */
@Injectable()
export class ExportService {
  /**
   * Generate Sales Report CSV
   */
  generateSalesReportCSV(report: any): string {
    let csv = 'Sales Report\n';
    csv += `Period: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}\n\n`;

    // Summary section
    csv += 'SUMMARY\n';
    csv += 'Total Transactions,Total Revenue\n';
    csv += `${report.summary.totalTransactions},${report.summary.totalRevenue}\n\n`;

    // Sales by method
    csv += 'SALES BY PAYMENT METHOD\n';
    csv += 'Method,Count,Total\n';
    report.salesByMethod.forEach((item) => {
      csv += `${item.method},${item.count},${item.total}\n`;
    });
    csv += '\n';

    // Daily sales
    csv += 'DAILY SALES\n';
    csv += 'Date,Count,Total\n';
    report.dailySales.forEach((item) => {
      csv += `${item.date},${item.count},${item.total}\n`;
    });
    csv += '\n';

    // Product sales
    csv += 'PRODUCT SALES\n';
    csv += 'Product,Quantity Sold,Revenue\n';
    report.productSales.forEach((item) => {
      csv += `"${item.productName}",${item.quantitySold},${item.totalRevenue}\n`;
    });

    return csv;
  }
}