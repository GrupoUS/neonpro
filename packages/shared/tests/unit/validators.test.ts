import { describe, it, expect } from 'vitest';
import { 
  validateCPF, 
  validateCNPJ, 
  validatePhone, 
  validateCEP,
  cleanDocument,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP
} from '../../src/validators/brazilian';

describe('Brazilian Validators - T078', () => {
  describe('validateCPF', () => {
    it('should validate correct CPF numbers', () => {
      const validCPFs = [
        '123.456.789-09',
        '12345678909',
        '987.654.321-00',
        '98765432100'
      ];

      validCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it('should reject invalid CPF formats', () => {
      const invalidCPFs = [
        '123.456.789-00', // Wrong check digit
        '111.111.111-11', // All same digits
        '123.456.789',   // Missing digits
        '123.456.789-000', // Too many digits
        'abc.def.ghi-jk', // Non-numeric
        '',               // Empty
        null,             // Null
        undefined         // Undefined
      ];

      invalidCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });
  });

  describe('validateCNPJ', () => {
    it('should validate correct CNPJ numbers', () => {
      const validCNPJs = [
        '12.345.678/0001-95',
        '12345678000195',
        '11.444.777/0001-61'
      ];

      validCNPJs.forEach(cnpj => {
        expect(validateCNPJ(cnpj)).toBe(true);
      });
    });

    it('should reject invalid CNPJ formats', () => {
      const invalidCNPJs = [
        '12.345.678/0001-00', // Wrong check digit
        '11.111.111/1111-11', // All same digits
        '12.345.678/0001',    // Missing digits
        '12.345.678/0001-956', // Too many digits
        'abc.def.ghi/jk-lm',   // Non-numeric
        '',                    // Empty
        null,                  // Null
        undefined              // Undefined
      ];

      invalidCNPJs.forEach(cnpj => {
        expect(validateCNPJ(cnpj)).toBe(false);
      });
    });
  });

  describe('validatePhone', () => {
    it('should validate correct Brazilian phone numbers', () => {
      const validPhones = [
        '(11) 99999-8888',
        '11999998888',
        '(21) 2555-1234',
        '2125551234',
        '+55 11 99999-8888'
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '(11) 9999-888',    // Too short
        '(11) 999999-8888', // Too long
        '1234',            // Too short
        'abc-def-ghij',     // Non-numeric
        '',                // Empty
        null,              // Null
        undefined          // Undefined
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });
  });

  describe('validateCEP', () => {
    it('should validate correct CEP numbers', () => {
      const validCEPs = [
        '01310-100',
        '01310100',
        '20040-020',
        '20040020'
      ];

      validCEPs.forEach(cep => {
        expect(validateCEP(cep)).toBe(true);
      });
    });

    it('should reject invalid CEP formats', () => {
      const invalidCEPs = [
        '0131-100',      // Wrong format
        '01310-1000',    // Too long
        '0131-0100',     // Wrong format
        'abcde-fgh',     // Non-numeric
        '',              // Empty
        null,            // Null
        undefined        // Undefined
      ];

      invalidCEPs.forEach(cep => {
        expect(validateCEP(cep)).toBe(false);
      });
    });
  });

  describe('cleanDocument', () => {
    it('should remove formatting from CPF', () => {
      expect(cleanDocument('123.456.789-09')).toBe('12345678909');
    });

    it('should remove formatting from CNPJ', () => {
      expect(cleanDocument('12.345.678/0001-95')).toBe('12345678000195');
    });

    it('should handle already clean documents', () => {
      expect(cleanDocument('12345678909')).toBe('12345678909');
    });

    it('should handle empty/null inputs', () => {
      expect(cleanDocument('')).toBe('');
      expect(cleanDocument(null)).toBe('');
    });
  });

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
    });

    it('should handle already formatted CPF', () => {
      expect(formatCPF('123.456.789-09')).toBe('123.456.789-09');
    });
  });

  describe('formatCNPJ', () => {
    it('should format CNPJ correctly', () => {
      expect(formatCNPJ('12345678000195')).toBe('12.345.678/0001-95');
    });

    it('should handle already formatted CNPJ', () => {
      expect(formatCNPJ('12.345.678/0001-95')).toBe('12.345.678/0001-95');
    });
  });

  describe('formatPhone', () => {
    it('should format mobile phone correctly', () => {
      expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
    });

    it('should format landline correctly', () => {
      expect(formatPhone('2125551234')).toBe('(21) 2555-1234');
    });

    it('should handle already formatted phone', () => {
      expect(formatPhone('(11) 99999-8888')).toBe('(11) 99999-8888');
    });
  });

  describe('formatCEP', () => {
    it('should format CEP correctly', () => {
      expect(formatCEP('01310100')).toBe('01310-100');
    });

    it('should handle already formatted CEP', () => {
      expect(formatCEP('01310-100')).toBe('01310-100');
    });
  });

  describe('edge cases', () => {
    it('should handle malformed input gracefully', () => {
      expect(validateCPF('not-a-cpf')).toBe(false);
      expect(validateCNPJ('not-a-cnpj')).toBe(false);
      expect(validatePhone('not-a-phone')).toBe(false);
      expect(validateCEP('not-a-cep')).toBe(false);
    });

    it('should handle special characters', () => {
      expect(validateCPF('123.456.789-09!')).toBe(false);
      expect(validatePhone('(11) 9999-8888 ext. 123')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(validateCPF(' 123.456.789-09 ')).toBe(false);
      expect(validatePhone(' (11) 99999-8888 ')).toBe(true);
    });
  });
});