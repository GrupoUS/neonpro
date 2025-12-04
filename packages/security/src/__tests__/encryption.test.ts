/**
 * Encryption Service Tests
 * Tests for AES-256-GCM encryption of PII data
 */

import { describe, expect, it } from 'vitest';
import {
  decryptPII,
  encryptPII,
  encryptPIIFields,
  decryptPIIFields,
  hashPII,
  isEncrypted,
  maskPII,
  testEncryption,
} from '../encryption';

describe('Encryption Service', () => {
  describe('encryptPII / decryptPII', () => {
    it('should encrypt and decrypt data correctly', () => {
      const plaintext = '123.456.789-01';
      const encrypted = encryptPII(plaintext);
      const decrypted = decryptPII(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different encrypted output for same input (different salts)', () => {
      const plaintext = '987.654.321-00';
      const encrypted1 = encryptPII(plaintext);
      const encrypted2 = encryptPII(plaintext);

      expect(encrypted1).not.toBe(encrypted2); // Different salts/IVs
      expect(decryptPII(encrypted1)).toBe(plaintext);
      expect(decryptPII(encrypted2)).toBe(plaintext);
    });

    it('should handle empty strings', () => {
      const encrypted = encryptPII('');
      expect(encrypted).toBe('');

      const decrypted = decryptPII('');
      expect(decrypted).toBe('');
    });

    it('should encrypt CPF correctly', () => {
      const cpf = '123.456.789-01';
      const encrypted = encryptPII(cpf);
      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(cpf);
    });

    it('should encrypt RG correctly', () => {
      const rg = '12.345.678-9';
      const encrypted = encryptPII(rg);
      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(rg);
    });
  });

  describe('hashPII', () => {
    it('should generate consistent hash for same input', () => {
      const plaintext = '123.456.789-01';
      const hash1 = hashPII(plaintext);
      const hash2 = hashPII(plaintext);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hash for different input', () => {
      const hash1 = hashPII('123.456.789-01');
      const hash2 = hashPII('987.654.321-00');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = hashPII('');
      expect(hash).toBe('');
    });
  });

  describe('maskPII', () => {
    it('should mask CPF correctly (11 digits)', () => {
      const cpf = '12345678901';
      const masked = maskPII(cpf, 'cpf');

      expect(masked).toBe('***.***.*89-01');
    });

    it('should mask CPF correctly (formatted)', () => {
      const cpf = '123.456.789-01';
      const masked = maskPII(cpf, 'cpf');

      expect(masked).toBe('***.***.*89-01');
    });

    it('should mask RG correctly', () => {
      const rg = '12.345.678-9';
      const masked = maskPII(rg, 'rg');

      expect(masked).toBe('**.***.**8-9');
    });

    it('should mask mobile phone correctly', () => {
      const phone = '11987654321';
      const masked = maskPII(phone, 'phone');

      expect(masked).toBe('(11) ****-4321');
    });

    it('should mask landline phone correctly', () => {
      const phone = '1134567890';
      const masked = maskPII(phone, 'phone');

      expect(masked).toBe('(11) ****-7890');
    });

    it('should mask email correctly', () => {
      const email = 'user@example.com';
      const masked = maskPII(email, 'email');

      expect(masked).toBe('u***@example.com');
    });

    it('should handle null/undefined values', () => {
      expect(maskPII(null, 'cpf')).toBe('Não informado');
      expect(maskPII(undefined, 'email')).toBe('Não informado');
    });
  });

  describe('isEncrypted', () => {
    it('should detect encrypted data', () => {
      const plaintext = 'Test Data';
      const encrypted = encryptPII(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should detect non-encrypted data', () => {
      expect(isEncrypted('plain text')).toBe(false);
      expect(isEncrypted('123.456.789-01')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isEncrypted('')).toBe(false);
    });
  });

  describe('encryptPIIFields / decryptPIIFields', () => {
    it('should encrypt multiple fields in object', () => {
      const patient = {
        id: '123',
        name: 'John Doe',
        cpf: '123.456.789-01',
        rg: '12.345.678-9',
        email: 'john@example.com',
      };

      const encrypted = encryptPIIFields(patient, ['cpf', 'rg']);

      expect(encrypted.id).toBe(patient.id);
      expect(encrypted.name).toBe(patient.name);
      expect(encrypted.email).toBe(patient.email);
      expect(encrypted.cpf).not.toBe(patient.cpf);
      expect(encrypted.rg).not.toBe(patient.rg);
      expect(isEncrypted(encrypted.cpf)).toBe(true);
      expect(isEncrypted(encrypted.rg)).toBe(true);
    });

    it('should decrypt multiple fields in object', () => {
      const patient = {
        id: '123',
        name: 'John Doe',
        cpf: '123.456.789-01',
        rg: '12.345.678-9',
      };

      const encrypted = encryptPIIFields(patient, ['cpf', 'rg']);
      const decrypted = decryptPIIFields(encrypted, ['cpf', 'rg']);

      expect(decrypted.cpf).toBe(patient.cpf);
      expect(decrypted.rg).toBe(patient.rg);
    });

    it('should handle empty or null fields', () => {
      const patient = {
        id: '123',
        cpf: '',
        rg: null,
      };

      const encrypted = encryptPIIFields(patient, ['cpf', 'rg']);

      expect(encrypted.cpf).toBe('');
      expect(encrypted.rg).toBe(null);
    });
  });

  describe('testEncryption', () => {
    it('should pass encryption test', () => {
      const result = testEncryption();
      expect(result).toBe(true);
    });
  });
});
