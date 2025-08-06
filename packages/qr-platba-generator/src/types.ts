/**
 * Interface for QR payment request data.
 */
export interface QRPlatbaRequest {
  acc: string;
  rec?: string;
  am: number;
  cc: string;
  vs?: string;
  ss?: string;
  ks?: string;
  dt?: string;
  msg?: string;
}