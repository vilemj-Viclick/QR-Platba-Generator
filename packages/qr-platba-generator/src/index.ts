// QR Platba Generator - Main entry point

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
 * Validates if the account number is in the correct format.
 * @param acc Account number string
 * @returns Boolean indicating if the account number is valid
 */
export function isValidAccountNumber(acc: string): boolean {
  // Format: "000000-000000000000/0000"
  const regex = /^(\d{1,6}-)?\d{1,12}\/\d{4}$/;
  return regex.test(acc);
}

/**
 * Validates if a string contains only digits and is within the specified length.
 * @param str String to validate
 * @param maxLength Maximum allowed length
 * @returns Boolean indicating if the string is valid
 */
export function isValidDigitString(str: string | undefined, maxLength: number): boolean {
  if (!str) return true; // Optional field
  const regex = new RegExp(`^\\d{1,${maxLength}}$`);
  return regex.test(str);
}

/**
 * Validates if a date string is in the correct format and represents a valid date.
 * @param dateStr Date string in YYYYMMDD format
 * @returns Boolean indicating if the date is valid
 */
export function isValidDate(dateStr: string | undefined): boolean {
  if (!dateStr) return true; // Optional field

  // Format: YYYYMMDD
  if (!/^\d{8}$/.test(dateStr)) return false;

  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));

  // Check if date is valid
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

/**
 * Validates if an amount is a positive number.
 * @param amount Amount to validate
 * @returns Boolean indicating if the amount is valid
 */
export function isValidAmount(amount: number | undefined): boolean {
  return typeof amount === 'number' && amount > 0;
}

/**
 * Validates if a currency code is supported.
 * @param currency Currency code
 * @returns Boolean indicating if the currency is valid
 */
export function isValidCurrency(currency: string): boolean {
  // Common currencies, can be expanded
  const validCurrencies = ['CZK', 'EUR', 'USD'];
  return validCurrencies.includes(currency);
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
 * Validates the QR payment request data.
 * @param data QR payment request data
 * @returns Object with validation errors or null if valid
 */
export function validateQRPlatbaRequest(data: QRPlatbaRequest): Partial<Record<keyof QRPlatbaRequest, string>> | null {
  const errors: Partial<Record<keyof QRPlatbaRequest, string>> = {};

  // Validate mandatory fields
  if (!data.acc) {
    errors.acc = 'Account number is required';
  } else if (!isValidAccountNumber(data.acc)) {
    errors.acc = 'Invalid account number format. Expected format: 000000-000000000000/0000';
  }

  if (data.am === undefined) {
    errors.am = 'Amount is required';
  } else if (!isValidAmount(data.am)) {
    errors.am = 'Invalid amount. Must be a positive number';
  }

  if (!data.cc) {
    errors.cc = 'Currency is required';
  } else if (!isValidCurrency(data.cc)) {
    errors.cc = 'Invalid currency code';
  }

  // Validate optional fields
  if (data.vs && !isValidDigitString(data.vs, 10)) {
    errors.vs = 'Invalid variable symbol. Must be a string of digits, max 10 characters';
  }

  if (data.ss && !isValidDigitString(data.ss, 10)) {
    errors.ss = 'Invalid specific symbol. Must be a string of digits, max 10 characters';
  }

  if (data.ks && !isValidDigitString(data.ks, 4)) {
    errors.ks = 'Invalid constant symbol. Must be a string of digits, max 4 characters';
  }

  if (data.dt && !isValidDate(data.dt)) {
    errors.dt = 'Invalid date format. Expected format: YYYYMMDD';
  }

  // If there are any validation errors, return them
  if (Object.keys(errors).length > 0) {
    return errors as Record<string, string>;
  }

  return null;
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