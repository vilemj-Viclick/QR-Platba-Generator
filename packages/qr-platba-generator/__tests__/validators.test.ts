import {describe, expect, it} from 'vitest';
import {
  validateQRPlatbaRequest,
  isValidAccountNumber,
  isValidDigitString,
  isValidDate,
  isValidAmount,
  isValidCurrency
} from '../src/validators';
import { QRPlatbaRequest } from '../src/types';

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