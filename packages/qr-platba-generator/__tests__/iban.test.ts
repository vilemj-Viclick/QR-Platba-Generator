import {describe, expect, it} from 'vitest';
import {convertToIBAN} from '../src/iban';

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