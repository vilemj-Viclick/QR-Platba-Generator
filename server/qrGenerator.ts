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
 * Converts a Czech account number to IBAN format.
 * @param accountNumber Account number in format "prefix-number/bankCode" or "number/bankCode"
 * @returns IBAN formatted string
 * @throws Error if the account number format is invalid
 */
export function convertToIBAN(accountNumber: string): string {
    // Validate the account number format
    // Allow for formats like "19-2000145399/0800" with variable length prefix
    const regex = /^(\d+-)?(\d{1,10})\/(\d{4})$/;
    if (!regex.test(accountNumber)) {
        throw new Error('Invalid account number format');
    }

    // Parse the account number
    let prefix = '';
    let number = '';
    let bankCode = '';

    if (accountNumber.includes('-')) {
        // Format with prefix: "prefix-number/bankCode"
        const parts = accountNumber.split('-');
        prefix = parts[0];
        const remainingParts = parts[1].split('/');
        number = remainingParts[0];
        bankCode = remainingParts[1];
    } else {
        // Format without prefix: "number/bankCode"
        const parts = accountNumber.split('/');
        number = parts[0];
        bankCode = parts[1];
    }

    // Pad the account number parts to the required length
    // For Czech IBAN: 16 digits for account number (including prefix)
    // If there's a prefix, it should be part of the 16 digits
    let paddedAccount = '';
    if (prefix) {
        // Ensure the combined length is 16 digits
        paddedAccount = (prefix + number).padStart(16, '0');
    } else {
        // No prefix, just pad the number to 16 digits
        paddedAccount = number.padStart(16, '0');
    }

    // Create the IBAN without check digits (using 00 as placeholder)
    // Format: CZ00 + bank code + padded account
    const ibanWithoutCheck = `CZ00${bankCode}${paddedAccount}`;
    
    // Calculate the check digits
    // 1. Move the country code and check digits to the end
    // 2. Convert letters to numbers (A=10, B=11, ..., Z=35)
    // 3. Calculate MOD 97-10
    const rearranged = `${bankCode}${paddedAccount}CZ00`;
    const converted = rearranged.replace(/[A-Z]/g, letter => 
        (letter.charCodeAt(0) - 55).toString()
    );
    
    // Calculate the check digits
    let remainder = 0;
    for (let i = 0; i < converted.length; i++) {
        remainder = (remainder * 10 + parseInt(converted[i])) % 97;
    }
    
    const checkDigits = (98 - remainder).toString().padStart(2, '0');
    
    // Format the final IBAN
    // CZxx BBBB AAAA AAAA AAAA AAAA (without spaces for our implementation)
    const finalIBAN = `CZ${checkDigits}${bankCode}${paddedAccount}`;
    
    return finalIBAN;
}

/**
 * Generates a QR code string according to the QR Platba specification.
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
