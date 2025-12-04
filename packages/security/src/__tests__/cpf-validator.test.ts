/**
 * CPF Validator Tests
 * Tests for Brazilian CPF validation algorithm
 */

import { describe, expect, it } from 'vitest';
import {
  formatCPF,
  generateRandomCPF,
  isCPF,
  unformatCPF,
  validateCPF,
} from '../cpf-validator';

describe('CPF Validator', () => {
  describe('validateCPF', () => {
    it('should validate correct CPF numbers', () => {
      const validCPFs = [
        '123.456.789-09', // formatted
        '12345678909', // unformatted
        '111.444.777-35',
        '11144477735',
        '529.982.247-25',
        '52998224725',
      ];

      validCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it('should reject invalid CPF numbers', () => {
      const invalidCPFs = [
        '123.456.789-00', // wrong check digit
        '12345678900', // wrong check digit
        '111.444.777-30', // wrong check digit
        '000.000.000-00', // all zeros
        '11111111111', // all same digit
        '123.456.789', // incomplete
        '123456789012', // too many digits
        'abc.def.ghi-jk', // non-numeric
        '', // empty string
      ];

      invalidCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should reject all known invalid patterns', () => {
      const invalidPatterns = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
      ];

      invalidPatterns.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should handle null and undefined', () => {
      expect(validateCPF(null as any)).toBe(false);
      expect(validateCPF(undefined as any)).toBe(false);
    });

    it('should validate CPF with spaces', () => {
      expect(validateCPF('123 456 789 09')).toBe(true);
      expect(validateCPF(' 12345678909 ')).toBe(true);
    });
  });

  describe('formatCPF', () => {
    it('should format unformatted CPF', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
    });

    it('should reformat already formatted CPF', () => {
      expect(formatCPF('123.456.789-09')).toBe('123.456.789-09');
    });

    it('should handle invalid input', () => {
      expect(formatCPF('')).toBe('');
      expect(formatCPF('123')).toBe('123'); // too short
      expect(formatCPF('1234567890123')).toBe('1234567890123'); // too long
    });

    it('should remove non-digit characters and reformat', () => {
      expect(formatCPF('123-456-789-09')).toBe('123.456.789-09');
      expect(formatCPF('123 456 789 09')).toBe('123.456.789-09');
    });
  });

  describe('unformatCPF', () => {
    it('should remove all formatting', () => {
      expect(unformatCPF('123.456.789-09')).toBe('12345678909');
      expect(unformatCPF('123-456-789-09')).toBe('12345678909');
      expect(unformatCPF('123 456 789 09')).toBe('12345678909');
    });

    it('should handle unformatted CPF', () => {
      expect(unformatCPF('12345678909')).toBe('12345678909');
    });

    it('should handle empty string', () => {
      expect(unformatCPF('')).toBe('');
    });
  });

  describe('generateRandomCPF', () => {
    it('should generate valid CPF', () => {
      const cpf = generateRandomCPF();
      expect(validateCPF(cpf)).toBe(true);
    });

    it('should generate different CPFs', () => {
      const cpfs = new Set();
      for (let i = 0; i < 100; i++) {
        cpfs.add(generateRandomCPF());
      }
      // Should generate at least 90 different CPFs out of 100
      expect(cpfs.size).toBeGreaterThan(90);
    });

    it('should generate formatted CPFs', () => {
      const cpf = generateRandomCPF();
      expect(cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });
  });

  describe('isCPF', () => {
    it('should return true for valid CPF strings', () => {
      expect(isCPF('123.456.789-09')).toBe(true);
      expect(isCPF('12345678909')).toBe(true);
    });

    it('should return false for invalid CPF strings', () => {
      expect(isCPF('123.456.789-00')).toBe(false);
      expect(isCPF('invalid')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isCPF(123)).toBe(false);
      expect(isCPF(null)).toBe(false);
      expect(isCPF(undefined)).toBe(false);
      expect(isCPF({})).toBe(false);
      expect(isCPF([])).toBe(false);
    });
  });

  describe('Real-world CPF examples', () => {
    it('should validate known valid CPFs', () => {
      // These are valid test CPFs (generated and verified)
      const testCPFs = [
        '123.456.789-09',
        '111.444.777-35',
      ];

      testCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it('should handle edge cases', () => {
      // CPF with valid check digits but uncommon patterns
      expect(validateCPF('000.000.001-91')).toBe(true);
    });
  });
});
