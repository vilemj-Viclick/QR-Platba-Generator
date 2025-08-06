import {describe, expect, it} from 'vitest';
import {generateQRString} from '../src/index';
import {type QRPlatbaRequest} from '../src/types';

describe('generateQRString', () => {
  it('should generate a valid QR string with mandatory fields only', () => {
    const data: QRPlatbaRequest = {
      acc: '123456789/0800',
      am: 100.50,
      cc: 'CZK'
    };

    const result = generateQRString(data);

    // Check format and mandatory fields
    expect(result.startsWith('SPD*1.0*')).toBe(true);
    expect(result).toContain('ACC:CZ7508000000000123456789');
    expect(result).toContain('AM:100.50');
    expect(result).toContain('CC:CZK');

    // Should not contain optional fields
    expect(result).not.toContain('VS:');
    expect(result).not.toContain('SS:');
    expect(result).not.toContain('KS:');
    expect(result).not.toContain('DT:');
    expect(result).not.toContain('MSG:');
    expect(result).not.toContain('RN:');
  });

  it('should generate a valid QR string with all fields', () => {
    const data: QRPlatbaRequest = {
      acc: '123456789/0800',
      am: 100.50,
      cc: 'CZK',
      vs: '1234567890',
      ss: '0987654321',
      ks: '1234',
      dt: '20250806',
      msg: 'Payment for services',
      rec: 'John Doe'
    };

    const result = generateQRString(data);

    // Check format and all fields
    expect(result.startsWith('SPD*1.0*')).toBe(true);
    expect(result).toContain('ACC:CZ7508000000000123456789');
    expect(result).toContain('AM:100.50');
    expect(result).toContain('CC:CZK');
    expect(result).toContain('VS:1234567890');
    expect(result).toContain('SS:0987654321');
    expect(result).toContain('KS:1234');
    expect(result).toContain('DT:20250806');
    expect(result).toContain('MSG:Payment for services');
    expect(result).toContain('RN:John Doe');
  });

  it('should format amount with two decimal places', () => {
    const data: QRPlatbaRequest = {
      acc: '123456789/0800',
      am: 100,
      cc: 'CZK'
    };

    const result = generateQRString(data);
    expect(result).toContain('AM:100.00');
  });

  it('should handle account number with prefix', () => {
    const data: QRPlatbaRequest = {
      acc: '19-2000145399/0800',
      am: 100,
      cc: 'CZK'
    };

    const result = generateQRString(data);
    expect(result).toContain('ACC:CZ6508000000192000145399');
  });
});