// Import the QRPlatbaRequest interface
import { QRPlatbaRequest } from './types';

/**
 * Validates if the account number is in the correct format.
 * @param acc Account number string
 * @returns Boolean indicating if the account number is valid
 */
function isValidAccountNumber(acc: string): boolean {
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
function isValidDigitString(str: string | undefined, maxLength: number): boolean {
  if (!str) return true; // Optional field
  const regex = new RegExp(`^\\d{1,${maxLength}}$`);
  return regex.test(str);
}

/**
 * Validates if a date string is in the correct format and represents a valid date.
 * @param dateStr Date string in YYYYMMDD format
 * @returns Boolean indicating if the date is valid
 */
function isValidDate(dateStr: string | undefined): boolean {
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
function isValidAmount(amount: number | undefined): boolean {
  return typeof amount === 'number' && amount > 0;
}

/**
 * Validates if a currency code is supported.
 * @param currency Currency code
 * @returns Boolean indicating if the currency is valid
 */
function isValidCurrency(currency: string): boolean {
  // Common currencies, can be expanded
  const validCurrencies = ['CZK', 'EUR', 'USD'];
  return validCurrencies.includes(currency);
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

// Export the validator functions for testing purposes
export {
  isValidAccountNumber,
  isValidDigitString,
  isValidDate,
  isValidAmount,
  isValidCurrency
};