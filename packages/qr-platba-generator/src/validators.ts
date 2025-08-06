// Import the QRPlatbaRequest interface
import {ErrorReport, QRPlatbaRequest} from './types';

const isFiniteNumber = (num: number | undefined | null): boolean =>
  (typeof num === 'number') && !isNaN(num) && isFinite(num);

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
 * Validates if a string is within the specified length.
 * @param str String to validate
 * @param maxLength Maximum allowed length
 * @returns Boolean indicating if the string is valid
 */
function isValidStringLength(str: string | undefined, maxLength: number): boolean {
  if (!str) return true; // Optional field
  return str.length <= maxLength;
}

/**
 * Validates the QR payment request data.
 * @param data QR payment request data
 * @returns Object with validation errors or null if valid
 */
export function validateQRPlatbaRequest(data: QRPlatbaRequest): Partial<Record<keyof QRPlatbaRequest, ErrorReport>> | null {
  const errors: Partial<Record<keyof QRPlatbaRequest, { msg: string; code: string }>> = {};

  // Validate mandatory fields
  if (!data.acc) {
    errors.acc = {
      msg: 'Číslo účtu je povinné',
      code: 'required'
    };
  } else if (!isValidAccountNumber(data.acc)) {
    errors.acc = {
      msg: 'Neplatný formát čísla účtu. Očekávaný formát: 000000-000000000000/0000',
      code: 'format'
    };
  }

  if (!isFiniteNumber(data.am)) {
    errors.am = {
      msg: 'Částka je povinná',
      code: 'required'
    };
  } else if (!isValidAmount(data.am)) {
    errors.am = {
      msg: 'Neplatná částka. Musí být kladné číslo',
      code: 'format'
    };
  }

  if (!data.cc) {
    errors.cc = {
      msg: 'Měna je povinná',
      code: 'required'
    };
  } else if (!isValidCurrency(data.cc)) {
    errors.cc = {
      msg: 'Neplatný kód měny',
      code: 'format'
    };
  }

  // Validate optional fields
  if (data.vs && !isValidDigitString(data.vs, 10)) {
    errors.vs = {
      msg: 'Neplatný variabilní symbol. Musí obsahovat pouze číslice, maximálně 10 znaků',
      code: 'format'
    };
  }

  if (data.ss && !isValidDigitString(data.ss, 10)) {
    errors.ss = {
      msg: 'Neplatný specifický symbol. Musí obsahovat pouze číslice, maximálně 10 znaků',
      code: 'format'
    };
  }

  if (data.ks && !isValidDigitString(data.ks, 4)) {
    errors.ks = {
      msg: 'Neplatný konstantní symbol. Musí obsahovat pouze číslice, maximálně 4 znaky',
      code: 'format'
    };
  }

  if (data.dt && !isValidDate(data.dt)) {
    errors.dt = {
      msg: 'Neplatný formát data. Očekávaný formát: RRRRMMDD',
      code: 'format'
    };
  }

  // Validate msg field length
  if (data.msg && !isValidStringLength(data.msg, 250)) {
    errors.msg = {
      msg: 'Zpráva je příliš dlouhá. Maximální délka je 250 znaků',
      code: 'format'
    };
  }

  // Validate rec field length
  if (data.rec && !isValidStringLength(data.rec, 250)) {
    errors.rec = {
      msg: 'Jméno příjemce je příliš dlouhé. Maximální délka je 250 znaků',
      code: 'format'
    };
  }

  // If there are any validation errors, return them
  if (Object.keys(errors).length > 0) {
    return errors as Record<string, { msg: string; code: string }>;
  }

  return null;
}

// Export the validator functions for testing purposes
export {
  isValidAccountNumber,
  isValidDigitString,
  isValidDate,
  isValidAmount,
  isValidCurrency,
  isValidStringLength
};