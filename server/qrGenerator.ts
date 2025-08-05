// QR code string generation functionality

// Define interface for type safety
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

/**
 * Generates a QR code string according to the QR Platba specification.
 * @param data QR payment request data
 * @returns Formatted QR code string
 */
export function generateQRString(data: QRPlatbaRequest): string {
    // According to https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
    let qrString = 'SPD*1.0*';

    // ACC - Account number (mandatory)
    qrString += `ACC:${data.acc}*`;

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
