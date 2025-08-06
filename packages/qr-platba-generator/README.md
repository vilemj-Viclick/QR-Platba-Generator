# QR Platba Generator

A TypeScript library for generating QR payment codes according to the Czech QR Platba specification.

## Installation

```bash
npm install qr-platba-generator
```

## Usage

### Basic Usage

```typescript
import {generateQRString, QRPlatbaRequest} from 'qr-platba-generator';
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

// Generate QR code image (requires qrcode package - You can use any package of your choice to generate the actual QR code.)
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
import {validateQRPlatbaRequest, QRPlatbaRequest} from 'qr-platba-generator';

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

## License

MIT