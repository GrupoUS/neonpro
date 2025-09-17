// T046: Unit tests for LGPD compliance utilities
import { describe, it, expect } from 'vitest';
import {
  redactCPF,
  redactCNPJ,
  redactEmail,
  redactPhone,
  redactBankAccount,
  redactFullName,
  redactPII,
  validateCPF,
  validateCNPJ,
  detectPIIPatterns,
  anonymizeData,
  type PIIDetectionResult,
} from '../src/lgpd';

describe('LGPD Compliance Utilities', () => {
  describe('CPF redaction and validation', () => {
    it('should redact valid CPF formats', () => {
      expect(redactCPF('123.456.789-01')).toBe('***.***.***-**');
      expect(redactCPF('12345678901')).toBe('***********');
      expect(redactCPF('CPF: 123.456.789-01')).toBe('CPF: ***.***.***-**');
    });

    it('should not redact invalid CPF patterns', () => {
      expect(redactCPF('123.456.789')).toBe('123.456.789');
      expect(redactCPF('12345')).toBe('12345');
      expect(redactCPF('abc.def.ghi-jk')).toBe('abc.def.ghi-jk');
    });

    it('should validate CPF correctly', () => {
      // Valid CPFs
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
      
      // Invalid CPFs
      expect(validateCPF('12345678901')).toBe(false);
      expect(validateCPF('111.444.777-36')).toBe(false);
      expect(validateCPF('00000000000')).toBe(false);
      expect(validateCPF('invalid')).toBe(false);
    });

    it('should handle edge cases for CPF', () => {
      expect(redactCPF('')).toBe('');
      expect(redactCPF('123')).toBe('123');
      expect(validateCPF('')).toBe(false);
      expect(validateCPF(null as any)).toBe(false);
      expect(validateCPF(undefined as any)).toBe(false);
    });
  });

  describe('CNPJ redaction and validation', () => {
    it('should redact valid CNPJ formats', () => {
      expect(redactCNPJ('12.345.678/0001-95')).toBe('**.***.***/****-**');
      expect(redactCNPJ('12345678000195')).toBe('**************');
      expect(redactCNPJ('CNPJ: 12.345.678/0001-95')).toBe('CNPJ: **.***.***/****-**');
    });

    it('should not redact invalid CNPJ patterns', () => {
      expect(redactCNPJ('12.345.678/0001')).toBe('12.345.678/0001');
      expect(redactCNPJ('123456789')).toBe('123456789');
    });

    it('should validate CNPJ correctly', () => {
      // Valid CNPJ
      expect(validateCNPJ('11222333000181')).toBe(true);
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      
      // Invalid CNPJ
      expect(validateCNPJ('12345678000195')).toBe(false);
      expect(validateCNPJ('11.222.333/0001-82')).toBe(false);
      expect(validateCNPJ('00000000000000')).toBe(false);
    });
  });

  describe('Email redaction', () => {
    it('should redact email addresses', () => {
      expect(redactEmail('user@example.com')).toBe('u***@e******.com');
      expect(redactEmail('john.doe@company.com.br')).toBe('j***.***@c******.com.br');
      expect(redactEmail('Contact: user@test.org')).toBe('Contact: u***@t***.org');
    });

    it('should handle complex email patterns', () => {
      expect(redactEmail('user+tag@example.com')).toBe('u***@e******.com');
      expect(redactEmail('user.name+tag@subdomain.example.com')).toBe('u***.***@s*******.e******.com');
    });

    it('should not redact invalid emails', () => {
      expect(redactEmail('notanemail')).toBe('notanemail');
      expect(redactEmail('user@')).toBe('user@');
      expect(redactEmail('@example.com')).toBe('@example.com');
    });
  });

  describe('Phone redaction', () => {
    it('should redact Brazilian phone numbers', () => {
      expect(redactPhone('(11) 99999-9999')).toBe('(11) 9****-****');
      expect(redactPhone('11999999999')).toBe('11*********');
      expect(redactPhone('+55 11 99999-9999')).toBe('+55 11 9****-****');
      expect(redactPhone('011 9999-9999')).toBe('011 9***-****');
    });

    it('should redact international phone formats', () => {
      expect(redactPhone('+1 (555) 123-4567')).toBe('+1 (555) 1**-****');
      expect(redactPhone('+44 20 7946 0958')).toBe('+44 20 7*** ****');
    });

    it('should not redact invalid phone patterns', () => {
      expect(redactPhone('123')).toBe('123');
      expect(redactPhone('notaphone')).toBe('notaphone');
    });
  });

  describe('Bank account redaction', () => {
    it('should redact bank account numbers', () => {
      expect(redactBankAccount('Banco: 001 Agência: 1234 Conta: 567890-1'))
        .toBe('Banco: 001 Agência: **** Conta: ******-*');
      expect(redactBankAccount('Ag: 1234-5 CC: 123456-7'))
        .toBe('Ag: ****-* CC: ******-*');
    });

    it('should handle various bank account formats', () => {
      expect(redactBankAccount('Conta corrente: 12345-6')).toBe('Conta corrente: *****-*');
      expect(redactBankAccount('PIX: 123.456.789-01')).toBe('PIX: ***.***.***-**'); // CPF as PIX
    });
  });

  describe('Full name redaction', () => {
    it('should redact full names while preserving first name', () => {
      expect(redactFullName('João Silva Santos')).toBe('João ****** ******');
      expect(redactFullName('Maria da Silva')).toBe('Maria ** *****');
      expect(redactFullName('José')).toBe('José'); // Single name unchanged
    });

    it('should handle names with particles', () => {
      expect(redactFullName('Ana Paula da Costa e Silva')).toBe('Ana ***** ** ***** * *****');
      expect(redactFullName('Pedro de Alcântara')).toBe('Pedro ** *********');
    });

    it('should preserve name formatting', () => {
      expect(redactFullName('CARLOS EDUARDO SANTOS')).toBe('CARLOS ******* ******');
      expect(redactFullName('carlos eduardo santos')).toBe('carlos ******* ******');
    });
  });

  describe('Comprehensive PII detection', () => {
    it('should detect multiple PII types in text', () => {
      const text = 'CPF: 111.444.777-35, Email: john@example.com, Telefone: (11) 99999-9999';
      const result = detectPIIPatterns(text);
      
      expect(result.patterns).toHaveLength(3);
      expect(result.patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'cpf' }),
          expect.objectContaining({ type: 'email' }),
          expect.objectContaining({ type: 'phone' }),
        ])
      );
    });

    it('should provide confidence scores', () => {
      const text = 'CPF válido: 111.444.777-35';
      const result = detectPIIPatterns(text);
      
      expect(result.patterns[0].confidence).toBeGreaterThan(0.8);
      expect(result.overall.riskLevel).toBe('high');
    });

    it('should handle mixed valid and invalid patterns', () => {
      const text = 'CPF: 12345678901, Email: invalid-email, Phone: (11) 99999-9999';
      const result = detectPIIPatterns(text);
      
      // Should detect phone as valid, CPF as invalid format, email as invalid
      const validPatterns = result.patterns.filter(p => p.confidence > 0.7);
      expect(validPatterns).toHaveLength(1); // Only phone
      expect(validPatterns[0].type).toBe('phone');
    });
  });

  describe('Complete PII redaction', () => {
    it('should redact all PII types in complex text', () => {
      const text = `
        Paciente: João Silva Santos
        CPF: 111.444.777-35
        Email: joao.silva@email.com
        Telefone: (11) 99999-9999
        Conta: Banco 001, Ag: 1234, CC: 567890-1
      `;
      
      const redacted = redactPII(text);
      
      expect(redacted).toContain('João ****** ******'); // Name
      expect(redacted).toContain('***.***.***-**'); // CPF
      expect(redacted).toContain('j***.***@e****.com'); // Email
      expect(redacted).toContain('(11) 9****-****'); // Phone
      expect(redacted).toContain('Ag: ****, CC: ******-*'); // Bank account
    });

    it('should preserve non-PII content', () => {
      const text = 'Este é um texto normal sem informações pessoais.';
      expect(redactPII(text)).toBe(text);
    });

    it('should handle edge cases', () => {
      expect(redactPII('')).toBe('');
      expect(redactPII(null as any)).toBe('');
      expect(redactPII(undefined as any)).toBe('');
    });

    it('should work with custom options', () => {
      const text = 'João Silva, CPF: 111.444.777-35';
      const redacted = redactPII(text, {
        preserveNames: false,
        maskChar: 'X',
        partialRedaction: false,
      });
      
      expect(redacted).toContain('XXXX XXXXX'); // Full name redaction
      expect(redacted).toContain('XXXXXXXXXXX'); // Full CPF redaction
    });
  });

  describe('Data anonymization', () => {
    it('should anonymize structured data objects', () => {
      const data = {
        id: 1,
        name: 'João Silva Santos',
        cpf: '111.444.777-35',
        email: 'joao@example.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123',
        metadata: {
          notes: 'Paciente preferencial',
          internalCode: 'PAC001',
        },
      };

      const anonymized = anonymizeData(data);

      expect(anonymized.id).toBe(1); // Non-PII preserved
      expect(anonymized.name).toBe('João ****** ******');
      expect(anonymized.cpf).toBe('***.***.***-**');
      expect(anonymized.email).toBe('j***@e******.com');
      expect(anonymized.phone).toBe('(11) 9****-****');
      expect(anonymized.address).toBe('Rua das Flores, 123'); // Address preserved (could be enhanced)
      expect(anonymized.metadata.internalCode).toBe('PAC001'); // Internal data preserved
    });

    it('should handle arrays of objects', () => {
      const data = [
        { name: 'João Silva', cpf: '111.444.777-35' },
        { name: 'Maria Santos', cpf: '222.555.888-46' },
      ];

      const anonymized = anonymizeData(data);

      expect(Array.isArray(anonymized)).toBe(true);
      expect(anonymized).toHaveLength(2);
      expect(anonymized[0].name).toBe('João *****');
      expect(anonymized[1].name).toBe('Maria ******');
    });

    it('should handle nested objects', () => {
      const data = {
        patient: {
          personal: {
            name: 'João Silva',
            cpf: '111.444.777-35',
          },
          contact: {
            email: 'joao@example.com',
            phone: '(11) 99999-9999',
          },
        },
        treatmentHistory: ['Consulta 1', 'Consulta 2'],
      };

      const anonymized = anonymizeData(data);

      expect(anonymized.patient.personal.name).toBe('João *****');
      expect(anonymized.patient.personal.cpf).toBe('***.***.***-**');
      expect(anonymized.patient.contact.email).toBe('j***@e******.com');
      expect(anonymized.treatmentHistory).toEqual(['Consulta 1', 'Consulta 2']);
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large texts efficiently', () => {
      const largeText = 'Normal text '.repeat(1000) + 'CPF: 111.444.777-35';
      const start = Date.now();
      const result = redactPII(largeText);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100); // Should complete in <100ms
      expect(result).toContain('***.***.***-**');
    });

    it('should handle special characters and unicode', () => {
      const text = 'Usuário: João André, CPF: 111.444.777-35, Observação: café ☕';
      const result = redactPII(text);
      
      expect(result).toContain('João *****');
      expect(result).toContain('***.***.***-**');
      expect(result).toContain('café ☕'); // Non-PII unicode preserved
    });

    it('should be safe against regex injection', () => {
      const maliciousText = 'CPF: 111.444.777-35 (.*?)+ dangerous regex';
      expect(() => redactPII(maliciousText)).not.toThrow();
    });
  });

  describe('Configuration and customization', () => {
    it('should respect redaction configuration', () => {
      const text = 'João Silva, CPF: 111.444.777-35';
      
      const conservative = redactPII(text, {
        preserveNames: true,
        partialRedaction: true,
        maskChar: '*',
      });
      
      const aggressive = redactPII(text, {
        preserveNames: false,
        partialRedaction: false,
        maskChar: 'X',
      });
      
      expect(conservative).toContain('João *****');
      expect(aggressive).toContain('XXXX XXXXX');
    });

    it('should allow custom PII patterns', () => {
      const customConfig = {
        customPatterns: [
          {
            name: 'custom_id',
            pattern: /ID-\d{6}/g,
            redactor: (match: string) => 'ID-******',
          },
        ],
      };
      
      const text = 'Internal ID-123456 for patient';
      const result = redactPII(text, customConfig);
      
      expect(result).toContain('ID-******');
    });
  });
});