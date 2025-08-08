# QR Platba Generator

[![Tests](https://github.com/vilemj-Viclick/QR-Platba-Generator/actions/workflows/tests.yml/badge.svg)](https://github.com/vilemj-Viclick/QR-Platba-Generator/actions/workflows/tests.yml)
[![npm version](https://img.shields.io/npm/v/qr-platba-generator.svg)](https://www.npmjs.com/package/qr-platba-generator)

A TypeScript-based Node.js server and library that generates QR codes for the Czech payment system according to
the [QR Platba specification](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/).

## Inspiration
This whole thing was inspired by [https://qr-platba.cz/](https://qr-platba.cz/), actually.
I just wanted to be able to generate QR platba codes with the recipient's name in them.
And the form hosted at [https://qr-platba.cz/generator/](https://qr-platba.cz/generator/) does not allow that.

## NPM package
For more information about the npm package, see the [npm page](https://www.npmjs.com/package/qr-platba-generator).

## API Documentation
I host a form as well as an API which allows you to generate QR codes. 
Form is available here: [https://qr-platba.jenis.cz](https://qr-platba.jenis.cz)

API endpoints are described below:

### Generate QR Code

**Endpoint:** `POST /qr-platba`

**Request Body:**

Send a JSON object with the following fields:

| Field | Type   | Description      | Required | Format                     |
|-------|--------|------------------|----------|----------------------------|
| acc   | string | Account number   | Yes      | "000000-000000000000/0000" |
| rec   | string | Recipient's name | No       | Any text                   |
| am    | number | Amount           | Yes      | Positive number            |
| cc    | string | Currency         | Yes      | "CZK", "EUR", "USD"        |
| vs    | string | Variable symbol  | No       | Max 10 digits              |
| ss    | string | Specific symbol  | No       | Max 10 digits              |
| ks    | string | Constant symbol  | No       | Max 4 digits               |
| dt    | string | Date             | No       | YYYYMMDD                   |
| msg   | string | Message          | No       | Any text                   |

**Example Request:**

```json
{
  "acc": "123456-123456789012/1234",
  "rec": "John Doe",
  "am": 100.50,
  "cc": "CZK",
  "vs": "1234567890",
  "ss": "0987654321",
  "ks": "1234",
  "dt": "20230101",
  "msg": "Payment for services"
}
```

**Success Response:**

```json
{
  "qrCode": "data:image/png;base64,...", // Base64 encoded QR code image
  "qrString": "SPD*1.0*ACC:123456-123456789012/1234*AM:100.50*CC:CZK*VS:1234567890*SS:0987654321*KS:1234*DT:20230101*MSG:Payment for services*RN:John Doe"
}
```

**Error Response:**

```json
{
  "acc": {
    "msg": "Číslo účtu je povinné",
    "code": "required"
  },
  "am": {
    "msg": "Částka je povinná",
    "code": "required"
  },
  "cc": {
    "msg": "Měna je povinná",
    "code": "required"
  }
}
```

## QR Code Format

The QR code follows the format specified by [QR Platba](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/):

```
SPD*1.0*ACC:account_number*AM:amount*CC:currency*[optional_fields]
```

Optional fields include:

- VS: Variable symbol
- SS: Specific symbol
- KS: Constant symbol
- DT: Date
- MSG: Message
- RN: Recipient's name

## License

MIT
