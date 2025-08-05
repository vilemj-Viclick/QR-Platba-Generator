// Validation functions for QR code generation

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
