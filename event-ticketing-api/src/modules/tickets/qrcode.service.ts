import { Injectable } from '@nestjs/common';

export interface QrCodeData {
  ticketNumber: string;
  eventId: number;
  eventTitle: string;
  timestamp: string;
}

@Injectable()
export class QrCodeService {
  /**
   * Generate QR code data (JSON string)
   */
  generateQrCodeData(
    ticketNumber: string,
    eventId: number,
    eventTitle: string,
  ): string {
    const qrData: QrCodeData = {
      ticketNumber,
      eventId,
      eventTitle,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate unique ticket number
   */
  generateTicketNumber(): string {
    const prefix = 'TKT';
    const date = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ''); // YYYYMMDD
    const random = Math.floor(Math.random() * 900000) + 100000; // 6-digit random

    return `${prefix}-${date}-${random}`;
  }

  /**
   * Parse QR code data
   */
  parseQrCodeData(qrDataString: string): QrCodeData | null {
    try {
      const data = JSON.parse(qrDataString) as QrCodeData;
      return data;
    } catch {
      return null;
    }
  }
}
