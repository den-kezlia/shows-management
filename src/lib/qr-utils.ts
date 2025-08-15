import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface QRCodeData {
  ticketId: string;
  performanceId: string;
  customerName: string;
  placeRow: string | number;
  placeNumber: string | number;
  timestamp: number;
}

export async function generateQRCode(data: QRCodeData): Promise<string> {
  try {
    const qrString = JSON.stringify(data);
    const qrCode = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function generateTicketId(): string {
  return uuidv4();
}

export function parseQRCodeData(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);
    if (
      data.ticketId &&
      data.performanceId &&
      data.customerName &&
      data.placeRow !== undefined &&
      data.placeNumber !== undefined &&
      data.timestamp
    ) {
      return data as QRCodeData;
    }
    return null;
  } catch {
    return null;
  }
}

export function generateTicketUrl(ticketId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/ticket/${ticketId}`;
}
