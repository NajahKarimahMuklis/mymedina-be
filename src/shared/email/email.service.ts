import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Email Service
 *
 * Bertanggung jawab untuk mengirim email menggunakan Resend API.
 *
 * OOP Concepts:
 * - Encapsulation: Email sending logic dikapsulasi dalam service ini
 * - Single Responsibility: Hanya handle email sending
 * - Dependency Injection: Inject ConfigService
 *
 * Design Pattern:
 * - Service Pattern: Business logic untuk email
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!resendApiKey) {
      this.logger.warn(
        'RESEND_API_KEY tidak ditemukan! Email tidak akan terkirim.',
      );
    }

    this.resend = new Resend(resendApiKey);
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'MyMedina <onboarding@resend.dev>';
  }

  /**
   * Kirim Email Verifikasi
   *
   * Mengirim email berisi link verifikasi ke user yang baru register.
   *
   * @param email - Email tujuan
   * @param nama - Nama user
   * @param userId - ID user untuk link verifikasi
   * @param token - Token verifikasi (6 digit)
   */
  async kirimEmailVerifikasi(
    email: string,
    nama: string,
    userId: string,
    token: string,
  ): Promise<void> {
    try {
      const verificationUrl = `${this.frontendUrl}/verifikasi-email?userId=${userId}&token=${token}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '✅ Verifikasi Email Anda - MyMedina',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .token { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🕌 MyMedina</h1>
                  <p>Verifikasi Email Anda</p>
                </div>
                <div class="content">
                  <h2>Halo, ${nama}! 👋</h2>
                  <p>Terima kasih telah mendaftar di MyMedina. Untuk mengaktifkan akun Anda, silakan verifikasi email dengan menggunakan kode berikut:</p>
                  
                  <div class="token">${token}</div>
                  
                  <p>Atau klik tombol di bawah ini:</p>
                  <center>
                    <a href="${verificationUrl}" class="button">Verifikasi Email</a>
                  </center>
                  
                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Jika Anda tidak mendaftar di MyMedina, abaikan email ini.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2025 MyMedina - Platform Fashion Muslim Terpercaya</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Email verifikasi berhasil dikirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal mengirim email verifikasi ke ${email}:`, error);
      // Tidak throw error agar proses registrasi tetap berhasil
      // User masih bisa verifikasi manual dengan token
    }
  }

  /**
   * Kirim Email Reset Password
   *
   * Mengirim email berisi link reset password ke user yang lupa password.
   *
   * @param email - Email tujuan
   * @param nama - Nama user
   * @param token - Token reset password
   */
  async kirimEmailResetPassword(
    email: string,
    nama: string,
    token: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '🔐 Reset Password Anda - MyMedina',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Reset Password</h1>
                  <p>MyMedina</p>
                </div>
                <div class="content">
                  <h2>Halo, ${nama}!</h2>
                  <p>Kami menerima permintaan untuk reset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
                  
                  <center>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </center>
                  
                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2025 MyMedina - Platform Fashion Muslim Terpercaya</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Email reset password berhasil dikirim ke ${email}`);
    } catch (error) {
      this.logger.error(
        `Gagal mengirim email reset password ke ${email}:`,
        error,
      );
      // Tidak throw error agar proses request reset tetap berhasil
    }
  }

  /**
   * Kirim Email Welcome (Optional)
   *
   * Mengirim email selamat datang setelah user berhasil verifikasi email.
   *
   * @param email - Email tujuan
   * @param nama - Nama user
   */
  async kirimEmailWelcome(email: string, nama: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '🎉 Selamat Datang di MyMedina!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Selamat Datang!</h1>
                  <p>MyMedina</p>
                </div>
                <div class="content">
                  <h2>Halo, ${nama}! 👋</h2>
                  <p>Selamat! Email Anda telah berhasil diverifikasi. Sekarang Anda dapat menikmati semua fitur MyMedina:</p>
                  
                  <ul>
                    <li>🛍️ Belanja koleksi fashion Muslim terbaru</li>
                    <li>💳 Checkout dengan berbagai metode pembayaran</li>
                    <li>📦 Tracking pesanan real-time</li>
                    <li>⭐ Review dan rating produk</li>
                  </ul>
                  
                  <center>
                    <a href="${this.frontendUrl}" class="button">Mulai Belanja</a>
                  </center>
                </div>
                <div class="footer">
                  <p>© 2025 MyMedina - Platform Fashion Muslim Terpercaya</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Email welcome berhasil dikirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal mengirim email welcome ke ${email}:`, error);
    }
  }

  /**
   * Send waybill/tracking email to customer
   */
  async sendWaybillEmail(recipientEmail: string, order: any, waybill: string) {
    try {
      const trackingUrl = `${this.frontendUrl}/tracking/${waybill}/${order.shipmentCourierCode}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: recipientEmail,
        subject: `Pesanan Anda #${order.nomorOrder} - Sudah Dikirim!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📦 Pesanan Dikirim!</h1>
                  <p>MyMedina</p>
                </div>
                <div class="content">
                  <h2>Pesanan Anda Sudah Dalam Perjalanan! 🚚</h2>
                  <p>Nomor Pesanan: <strong>#${order.nomorOrder}</strong></p>
                  <p>Nomor Resi: <strong>${waybill}</strong></p>
                  
                  <center>
                    <a href="${trackingUrl}" class="button">Lacak Pesanan</a>
                  </center>
                  
                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Klik tombol di atas untuk melihat status pengiriman real-time.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2025 MyMedina - Platform Fashion Muslim Terpercaya</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Waybill email sent to ${recipientEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send waybill email to ${recipientEmail}:`,
        error,
      );
    }
  }
}
