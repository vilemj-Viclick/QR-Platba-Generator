import * as http from 'http';

// Define interfaces for type safety
interface QRPlatbaRequest {
    acc?: string;
    rec?: string;
    am?: number;
    cc?: string;
    vs?: string;
    ss?: string;
    ks?: string;
    dt?: string;
    msg?: string;
}

interface QRPlatbaResponse {
    qrCode?: string;
    qrString?: string;
    error?: string;
}

interface TestResponse {
    statusCode: number;
    headers: http.IncomingHttpHeaders;
    body: string;
}

// Function to make a POST request to the server
function testQRPlatba(data: QRPlatbaRequest): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/qr-platba',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

// Test cases
async function runTests(): Promise<void> {
  console.log('Running tests for QR Platba API...');

  // Test 1: Valid input
  console.log('\nTest 1: Valid input');
  try {
    const validData: QRPlatbaRequest = {
      acc: '123456-123456789012/1234',
      rec: 'John Doe',
      am: 100.50,
      cc: 'CZK',
      vs: '1234567890',
      ss: '0987654321',
      ks: '1234',
      dt: '20230101',
      msg: 'Payment for services'
    };

    const response = await testQRPlatba(validData);
    console.log(`Status Code: ${response.statusCode}`);
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body) as QRPlatbaResponse;
      console.log('QR String:', body.qrString);
      console.log('QR Code generated successfully');
    } else {
      console.log('Response:', response.body);
    }
  } catch (error) {
    console.error('Test 1 failed:', (error as Error).message);
  }

  // Test 2: Missing required field (acc)
  console.log('\nTest 2: Missing required field (acc)');
  try {
    const invalidData: QRPlatbaRequest = {
      rec: 'John Doe',
      am: 100.50,
      cc: 'CZK'
    };

    const response = await testQRPlatba(invalidData);
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Response:', response.body);
  } catch (error) {
    console.error('Test 2 failed:', (error as Error).message);
  }

  // Test 3: Invalid account number format
  console.log('\nTest 3: Invalid account number format');
  try {
    const invalidData: QRPlatbaRequest = {
      acc: '123456-12345/1234', // Wrong format
      rec: 'John Doe',
      am: 100.50,
      cc: 'CZK'
    };

    const response = await testQRPlatba(invalidData);
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Response:', response.body);
  } catch (error) {
    console.error('Test 3 failed:', (error as Error).message);
  }

  // Test 4: Invalid variable symbol (too long)
  console.log('\nTest 4: Invalid variable symbol (too long)');
  try {
    const invalidData: QRPlatbaRequest = {
      acc: '123456-123456789012/1234',
      rec: 'John Doe',
      am: 100.50,
      cc: 'CZK',
      vs: '12345678901' // 11 digits, max is 10
    };

    const response = await testQRPlatba(invalidData);
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Response:', response.body);
  } catch (error) {
    console.error('Test 4 failed:', (error as Error).message);
  }

  // Test 5: Invalid date format
  console.log('\nTest 5: Invalid date format');
  try {
    const invalidData: QRPlatbaRequest = {
      acc: '123456-123456789012/1234',
      rec: 'John Doe',
      am: 100.50,
      cc: 'CZK',
      dt: '2023-01-01' // Wrong format, should be YYYYMMDD
    };

    const response = await testQRPlatba(invalidData);
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Response:', response.body);
  } catch (error) {
    console.error('Test 5 failed:', (error as Error).message);
  }
}

console.log('Make sure the server is running on port 3000 before running this test script.');
console.log('You can start the server with: npm run dev');
console.log('Then run this test with: npm test');

// Run the tests automatically
runTests();
