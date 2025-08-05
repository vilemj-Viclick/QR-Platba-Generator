# QR Platba Generator

A TypeScript-based Node.js server that generates QR codes for the Czech payment system according to the [QR Platba specification](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/).

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   This step is crucial as it installs TypeScript and other required packages.
3. Build the TypeScript code:
   ```
   npm run build
   ```
4. Start the server:
   ```
   npm start
   ```

Alternatively, you can run the server in development mode without building:
```
npm run dev
```

The server will run on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## API Documentation

### Generate QR Code

**Endpoint:** `POST /qr-platba`

**Request Body:**

| Field | Type | Description | Required | Format |
|-------|------|-------------|----------|--------|
| acc | string | Account number | Yes | "000000-000000000000/0000" |
| rec | string | Recipient's name | No | Any text |
| am | number | Amount | Yes | Positive number |
| cc | string | Currency | Yes | "CZK", "EUR", "USD" |
| vs | string | Variable symbol | No | Max 10 digits |
| ss | string | Specific symbol | No | Max 10 digits |
| ks | string | Constant symbol | No | Max 4 digits |
| dt | string | Date | No | YYYYMMDD |
| msg | string | Message | No | Any text |

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
  "error": "Error message describing what went wrong"
}
```

## Testing

A test script is included to verify the functionality of the API. To run the tests:

1. Start the server in one terminal:
   ```
   npm start
   ```

   Or in development mode:
   ```
   npm run dev
   ```

2. Run the test script in another terminal:
   ```
   npm test
   ```

The tests will run automatically when you execute the test script.

## QR Code Format

The QR code follows the format specified by QR Platba:

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

## TypeScript Implementation

This project is implemented in TypeScript, providing type safety and better code organization. The TypeScript code is located in the `src` directory and is compiled to JavaScript in the `dist` directory.

### Project Structure

- `src/server.ts`: The main server file with Express setup and API endpoints
- `src/test.ts`: Test script for verifying the API functionality
- `tsconfig.json`: TypeScript configuration file
- `package.json`: Project configuration with scripts for building and running

### Available Scripts

- `npm run build`: Compiles TypeScript code to JavaScript in the `dist` directory
- `npm start`: Runs the compiled JavaScript code
- `npm run dev`: Runs the TypeScript code directly using ts-node (useful for development)
- `npm test`: Runs the test script using ts-node

## License

MIT
