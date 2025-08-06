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

  // Calculate the check digits using MOD 97-10 algorithm:
  // Move country code to end, convert letters to numbers (A=10, B=11, ..., Z=35)
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