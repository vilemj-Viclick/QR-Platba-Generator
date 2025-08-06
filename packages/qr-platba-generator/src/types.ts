/**
 * Interface for QR payment request data.
 */
export interface QRPlatbaRequest {
  /** Account number in format "prefix-number/bankCode" or "number/bankCode" */
  acc: string;
  /** Optional recipient name */
  rec?: string;
  /** Amount in given currency */
  am: number;
  /** Currency code */
  cc: string;
  /** Optional variable symbol */
  vs?: string;
  /** Optional specific symbol */
  ss?: string;
  /** Optional constant symbol */
  ks?: string;
  /** Optional due date in format YYYYMMDD */
  dt?: string;
  /** Optional message */
  msg?: string;
}

export type ErrorCode = 'required' | 'format';

export type ErrorReport = {
  readonly msg: string;
  readonly code: ErrorCode
};
