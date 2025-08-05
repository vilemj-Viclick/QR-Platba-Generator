import { describe, it, expect } from 'vitest';
import { isValidAccountNumber } from '../validators';

describe('isValidAccountNumber', () => {
  // Test valid account numbers
  it('should return true for valid account number with prefix', () => {
    expect(isValidAccountNumber('123456-123456789012/1234')).toBe(true);
  });

  it('should return true for valid account number without prefix', () => {
    expect(isValidAccountNumber('123456789012/1234')).toBe(true);
  });

  it('should return true for account number with minimum digits before slash', () => {
    expect(isValidAccountNumber('1/1234')).toBe(true);
  });

  it('should return true for account number with maximum digits before slash', () => {
    expect(isValidAccountNumber('123456-123456789012/1234')).toBe(true);
  });

  // Test invalid account numbers
  it('should return false for account number with invalid format', () => {
    expect(isValidAccountNumber('123456-12345/123')).toBe(false); // Bank code should be 4 digits
  });

  it('should return false for account number without slash', () => {
    expect(isValidAccountNumber('123456-1234567890121234')).toBe(false);
  });

  it('should return false for account number with invalid bank code', () => {
    expect(isValidAccountNumber('123456789012/123')).toBe(false); // Bank code should be 4 digits
  });

  it('should return false for account number with too many digits before slash', () => {
    expect(isValidAccountNumber('1234567890123/1234')).toBe(false); // More than 12 digits
  });

  it('should return false for account number with too many digits after slash', () => {
    expect(isValidAccountNumber('123456789012/12345')).toBe(false); // More than 4 digits
  });

  it('should return false for account number with letters', () => {
    expect(isValidAccountNumber('123456-ABCDEF789012/1234')).toBe(false);
  });

  it('should return false for account number with special characters', () => {
    expect(isValidAccountNumber('123456-12345!789012/1234')).toBe(false);
  });

  // Edge cases
  it('should return false for empty string', () => {
    expect(isValidAccountNumber('')).toBe(false);
  });

  it('should return false for null', () => {
    // @ts-ignore - Testing runtime behavior with invalid input
    expect(isValidAccountNumber(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    // @ts-ignore - Testing runtime behavior with invalid input
    expect(isValidAccountNumber(undefined)).toBe(false);
  });
});