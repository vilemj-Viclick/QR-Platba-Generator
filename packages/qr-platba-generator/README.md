# QR Platba Generator

A TypeScript library for generating QR payment codes according to the Czech QR Platba specification.

## Installation

```bash
npm install qr-platba-generator
```

## Usage

### Basic Usage

```typescript
import { generateQRString, QRPlatbaRequest } from 'qr-platba-generator';
import QRCode from 'qrcode';

// Create a payment request
const paymentData: QRPlatbaRequest = {
  acc: '123456789/0800',  // Account number in format "prefix-number/bankCode" or "number/bankCode"
  am: 100.50,             // Amount
  cc: 'CZK',              // Currency code
  // Optional fields
  vs: '1234567890',       // Variable symbol (max 10 digits)
  ss: '0987654321',       // Specific symbol (max 10 digits)
  ks: '1234',             // Constant symbol (max 4 digits)
  dt: '20250806',         // Due date in format YYYYMMDD
  msg: 'Payment for services', // Message
  rec: 'John Doe'         // Recipient name
};

// Generate QR code string
const qrString = generateQRString(paymentData);
console.log(qrString);
// Output: SPD*1.0*ACC:CZ7508000000000123456789*AM:100.50*CC:CZK*VS:1234567890*SS:0987654321*KS:1234*DT:20250806*MSG:Payment for services*RN:John Doe

// Generate QR code image (requires qrcode package)
QRCode.toDataURL(qrString, (err, url) => {
  if (err) {
    console.error('Error generating QR code:', err);
    return;
  }
  console.log('QR code data URL:', url);
});
```

### Validation

The library includes validation functions to ensure the payment data is valid:

```typescript
import { validateQRPlatbaRequest, QRPlatbaRequest } from 'qr-platba-generator';

const paymentData: QRPlatbaRequest = {
  acc: '123456789/0800',
  am: 100.50,
  cc: 'CZK'
};

const validationErrors = validateQRPlatbaRequest(paymentData);
if (validationErrors) {
  console.error('Validation errors:', validationErrors);
} else {
  console.log('Payment data is valid');
}
```

### Individual Validation Functions

You can also use the individual validation functions:

```typescript
import { 
  isValidAccountNumber, 
  isValidAmount, 
  isValidCurrency,
  isValidDigitString,
  isValidDate
} from 'qr-platba-generator';

// Validate account number
console.log(isValidAccountNumber('123456789/0800')); // true
console.log(isValidAccountNumber('invalid')); // false

// Validate amount
console.log(isValidAmount(100.50)); // true
console.log(isValidAmount(-100)); // false

// Validate currency
console.log(isValidCurrency('CZK')); // true
console.log(isValidCurrency('INVALID')); // false

// Validate digit string (for VS, SS, KS)
console.log(isValidDigitString('1234567890', 10)); // true
console.log(isValidDigitString('abc', 10)); // false

// Validate date
console.log(isValidDate('20250806')); // true
console.log(isValidDate('2025-08-06')); // false
```

### IBAN Conversion

The library can convert Czech account numbers to IBAN format:

```typescript
import { convertToIBAN } from 'qr-platba-generator';

// Convert account number to IBAN
console.log(convertToIBAN('123456789/0800')); // CZ7508000000000123456789
console.log(convertToIBAN('19-2000145399/0800')); // CZ6508000000192000145399
```

## API Reference

### Types

#### QRPlatbaRequest

```typescript
interface QRPlatbaRequest {
    acc: string;    // Account number (mandatory)
    rec?: string;   // Recipient name (optional)
    am: number;     // Amount (mandatory)
    cc: string;     // Currency code (mandatory)
    vs?: string;    // Variable symbol (optional)
    ss?: string;    // Specific symbol (optional)
    ks?: string;    // Constant symbol (optional)
    dt?: string;    // Due date (optional)
    msg?: string;   // Message (optional)
}
```

### Functions

#### generateQRString(data: QRPlatbaRequest): string

Generates a QR code string according to the QR Platba specification.

#### validateQRPlatbaRequest(data: QRPlatbaRequest): Record<string, string> | null

Validates the QR payment request data. Returns null if valid, or an object with validation errors.

#### convertToIBAN(accountNumber: string): string

Converts a Czech account number to IBAN format.

#### isValidAccountNumber(acc: string): boolean

Validates if the account number is in the correct format.

#### isValidDigitString(str: string | undefined, maxLength: number): boolean

Validates if a string contains only digits and is within the specified length.

#### isValidDate(dateStr: string | undefined): boolean

Validates if a date string is in the correct format and represents a valid date.

#### isValidAmount(amount: number | undefined): boolean

Validates if an amount is a positive number.

#### isValidCurrency(currency: string): boolean

Validates if a currency code is supported.

## License

MIT