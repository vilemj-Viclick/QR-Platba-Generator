// QR Platba Generator - Main entry point

// Import from separated modules
import { validateQRPlatbaRequest } from './validators';
import { convertToIBAN } from './iban';
import { type QRPlatbaRequest, type ErrorReport, type ErrorCode } from './types';

/**
 * Generates a QR code string according to the QR Platba specification:
 * https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 * @param data QR payment request data
 * @returns Formatted QR code string
 */
export function generateQRString(data: QRPlatbaRequest): string {
  // According to https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
  let qrString = 'SPD*1.0*';

  // ACC - Account number (mandatory) - Convert to IBAN format
  const ibanAccount = convertToIBAN(data.acc);
  qrString += `ACC:${ibanAccount}*`;

  // AM - Amount (mandatory)
  qrString += `AM:${data.am.toFixed(2)}*`;

  // CC - Currency (mandatory)
  qrString += `CC:${data.cc}*`;

  // Optional fields
  if (data.vs) qrString += `VS:${data.vs}*`;
  if (data.ss) qrString += `SS:${data.ss}*`;
  if (data.ks) qrString += `KS:${data.ks}*`;
  if (data.dt) qrString += `DT:${data.dt}*`;
  if (data.msg) qrString += `MSG:${data.msg}*`;
  if (data.rec) qrString += `RN:${data.rec}*`;

  // Remove the last asterisk
  return qrString.slice(0, -1);
}

// Re-export the validateQRPlatbaRequest function and QRPlatbaRequest interface
export { validateQRPlatbaRequest, type QRPlatbaRequest, type ErrorReport, type ErrorCode };