import { describe, it, expect } from 'vitest';
import { 
    convertToIBAN, 
    generateQRString, 
    validateQRPlatbaRequest,
    isValidAccountNumber,
    isValidAmount,
    isValidCurrency,
    isValidDate,
    isValidDigitString,
    QRPlatbaRequest
} from '../src/index';

describe('convertToIBAN', () => {
  // Test valid account numbers
  it('should convert account number with prefix to IBAN format', () => {
    const result = convertToIBAN('123456-123456789/2700');
    expect(result).toBe('CZ6627000123456123456789');
    expect(result.length).toBe(24);
    expect(result.startsWith('CZ')).toBe(true);
  });

  it('should convert account number without prefix to IBAN format', () => {
    const result = convertToIBAN('123456789/0800');
    expect(result).toBe('CZ7508000000000123456789');
    expect(result.length).toBe(24);
    expect(result.startsWith('CZ')).toBe(true);
  });

  it('should convert account number with minimum digits to IBAN format', () => {
    const result = convertToIBAN('1/0800');
    expect(result).toBe('CZ3408000000000000000001');
    expect(result.length).toBe(24);
    expect(result.startsWith('CZ')).toBe(true);
  });

  it('should convert account number with maximum digits to IBAN format', () => {
    const result = convertToIBAN('123456-1234567890/0800');
    expect(result).toBe('CZ0508001234561234567890');
    expect(result.length).toBe(24);
    expect(result.startsWith('CZ')).toBe(true);
  });

  // Test specific examples with known results
  it('should convert a known account number to the correct IBAN', () => {
    // Example: 19-2000145399/0800
    const result = convertToIBAN('19-2000145399/0800');
    expect(result).toBe('CZ6508000000192000145399');
    expect(result.length).toBe(24);
  });

  it('should convert another known account number to the correct IBAN', () => {
    // Example: 1234567890/0100
    const result = convertToIBAN('1234567890/0100');
    expect(result).toBe('CZ4701000000001234567890');
    expect(result.length).toBe(24); // Correct length for Czech IBAN
  });

  // Test invalid account numbers
  it('should throw an error for account number with invalid format', () => {
    expect(() => convertToIBAN('123456-12345/123')).toThrow('Invalid account number format');
  });

  it('should throw an error for account number without slash', () => {
    expect(() => convertToIBAN('123456-1234567890121234')).toThrow('Invalid account number format');
  });

  it('should throw an error for account number with invalid bank code', () => {
    expect(() => convertToIBAN('123456789012/123')).toThrow('Invalid account number format');
  });

  it('should throw an error for account number with too many digits before slash', () => {
    expect(() => convertToIBAN('12345678901234/1234')).toThrow('Invalid account number format');
  });

  it('should throw an error for account number with letters', () => {
    expect(() => convertToIBAN('123456-ABCDEF789012/1234')).toThrow('Invalid account number format');
  });

  // Edge cases
  it('should throw an error for empty string', () => {
    expect(() => convertToIBAN('')).toThrow('Invalid account number format');
  });

  it('should throw an error for null', () => {
    // @ts-ignore - Testing runtime behavior with invalid input
    expect(() => convertToIBAN(null)).toThrow();
  });

  it('should throw an error for undefined', () => {
    // @ts-ignore - Testing runtime behavior with invalid input
    expect(() => convertToIBAN(undefined)).toThrow();
  });
});

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

describe('validateQRPlatbaRequest', () => {
  it('should return null for valid request with mandatory fields only', () => {
    const data: QRPlatbaRequest = {
      acc: '123456789/0800',
      am: 100.50,
      cc: 'CZK'
    };
    
    const result = validateQRPlatbaRequest(data);
    expect(result).toBeNull();
  });
  
  it('should return null for valid request with all fields', () => {
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
    
    const result = validateQRPlatbaRequest(data);
    expect(result).toBeNull();
  });
  
  it('should return errors for missing mandatory fields', () => {
    const data = {} as QRPlatbaRequest;
    
    const result = validateQRPlatbaRequest(data);
    expect(result).not.toBeNull();
    expect(result?.acc).toBeDefined();
    expect(result?.am).toBeDefined();
    expect(result?.cc).toBeDefined();
  });
  
  it('should return errors for invalid fields', () => {
    const data: QRPlatbaRequest = {
      acc: 'invalid',
      am: -100,
      cc: 'INVALID',
      vs: 'abc',
      ss: '12345678901',
      ks: '12345',
      dt: '2025-08-06'
    };
    
    const result = validateQRPlatbaRequest(data);
    expect(result).not.toBeNull();
    expect(result?.acc).toBeDefined();
    expect(result?.am).toBeDefined();
    expect(result?.cc).toBeDefined();
    expect(result?.vs).toBeDefined();
    expect(result?.ss).toBeDefined();
    expect(result?.ks).toBeDefined();
    expect(result?.dt).toBeDefined();
  });
});

describe('Validation functions', () => {
  describe('isValidAccountNumber', () => {
    it('should return true for valid account numbers', () => {
      expect(isValidAccountNumber('123456789/0800')).toBe(true);
      expect(isValidAccountNumber('19-2000145399/0800')).toBe(true);
      expect(isValidAccountNumber('1/0800')).toBe(true);
    });
    
    it('should return false for invalid account numbers', () => {
      expect(isValidAccountNumber('invalid')).toBe(false);
      expect(isValidAccountNumber('123456789/123')).toBe(false);
      expect(isValidAccountNumber('123456-123456789')).toBe(false);
    });
  });
  
  describe('isValidDigitString', () => {
    it('should return true for valid digit strings', () => {
      expect(isValidDigitString('1234', 4)).toBe(true);
      expect(isValidDigitString('1', 10)).toBe(true);
      expect(isValidDigitString('1234567890', 10)).toBe(true);
      expect(isValidDigitString(undefined, 10)).toBe(true);
    });
    
    it('should return false for invalid digit strings', () => {
      expect(isValidDigitString('12345', 4)).toBe(false);
      expect(isValidDigitString('abc', 10)).toBe(false);
      expect(isValidDigitString('12345678901', 10)).toBe(false);
    });
  });
  
  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate('20250806')).toBe(true);
      expect(isValidDate('20251231')).toBe(true);
      expect(isValidDate('20250101')).toBe(true);
      expect(isValidDate(undefined)).toBe(true);
    });
    
    it('should return false for invalid dates', () => {
      expect(isValidDate('2025-08-06')).toBe(false);
      expect(isValidDate('20250832')).toBe(false);
      expect(isValidDate('20251301')).toBe(false);
      expect(isValidDate('abcdefgh')).toBe(false);
    });
  });
  
  describe('isValidAmount', () => {
    it('should return true for valid amounts', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
      expect(isValidAmount(999999.99)).toBe(true);
    });
    
    it('should return false for invalid amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(undefined)).toBe(false);
    });
  });
  
  describe('isValidCurrency', () => {
    it('should return true for valid currencies', () => {
      expect(isValidCurrency('CZK')).toBe(true);
      expect(isValidCurrency('EUR')).toBe(true);
      expect(isValidCurrency('USD')).toBe(true);
    });
    
    it('should return false for invalid currencies', () => {
      expect(isValidCurrency('INVALID')).toBe(false);
      expect(isValidCurrency('czk')).toBe(false);
      expect(isValidCurrency('')).toBe(false);
    });
  });
});