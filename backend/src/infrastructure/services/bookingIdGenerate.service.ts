import * as QRCode from 'qrcode';

export class BookingGenerateService {
  static generateBookingId(): string {
    const prefix = 'CBID';
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(-4).toUpperCase();
    return `${prefix}${datePart}${randomPart}`;
  }

  static async generateQrCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      console.error('❌ Error generating QR Code:', error);
      throw new Error('Failed to generate QR Code');
    }
  }
}
