/**
 * @fileoverview Tests for LGPD Anonymization and Data Masking Utilities
 *
 * Tests compliance with LGPD requirements for data anonymization
 * and masking in healthcare scenarios.
 */

import { beforeEach, describe, expect, test } from 'vitest';
import {
  ANONYMIZATION_VERSION,
  anonymizePersonalData,
  DEFAULT_MASKING_OPTIONS,
  generatePrivacyReport,
  isDataAnonymized,
  type LGPDComplianceLevel,
  maskAddress,
  maskCNPJ,
  maskCPF,
  maskEmail,
  type MaskingOptions,
  maskName,
  maskPatientData,
  maskPhone,
  type PatientData,
} from '../anonymization';

describe(_'LGPD Anonymization Utils - Core Masking Functions',_() => {
  describe(_'maskCPF',_() => {
    test(_'should mask CPF with default format',_() => {
      const cpf = '12345678901';
      const masked = maskCPF(cpf);

      expect(masked).toBe('***.***.***-**');
      expect(masked).toMatch(/^\*{3}\.\*{3}\.\*{3}-\*{2}$/);
    });

    test(_'should mask formatted CPF',_() => {
      const cpf = '123.456.789-01';
      const masked = maskCPF(cpf);

      expect(masked).toBe('***.***.***-**');
    });

    test(_'should handle invalid CPF format',_() => {
      const cpf = '123456789'; // Too short
      const masked = maskCPF(cpf);

      expect(masked).toBe(cpf); // Should return original if invalid
    });

    test(_'should respect preserveFormat option',_() => {
      const cpf = '12345678901';
      const masked = maskCPF(cpf, { preserveFormat: false });

      expect(masked).toBe('***********');
      expect(masked.length).toBe(11);
    });

    test(_'should handle empty input',_() => {
      expect(maskCPF('')).toBe('');
      expect(maskCPF(undefined as any)).toBe('');
    });
  });

  describe(_'maskCNPJ',_() => {
    test(_'should mask CNPJ with default format',_() => {
      const cnpj = '12345678000195';
      const masked = maskCNPJ(cnpj);

      expect(masked).toBe('**.***.***/****-**');
      expect(masked).toMatch(/^\*{2}\.\*{3}\.\*{3}\/\*{4}-\*{2}$/);
    });

    test(_'should mask formatted CNPJ',_() => {
      const cnpj = '12.345.678/0001-95';
      const masked = maskCNPJ(cnpj);

      expect(masked).toBe('**.***.***/****-**');
    });

    test(_'should handle invalid CNPJ format',_() => {
      const cnpj = '12345678000'; // Too short
      const masked = maskCNPJ(cnpj);

      expect(masked).toBe(cnpj); // Should return original if invalid
    });

    test(_'should respect preserveFormat option',_() => {
      const cnpj = '12345678000195';
      const masked = maskCNPJ(cnpj, { preserveFormat: false });

      expect(masked).toBe('**************');
      expect(masked.length).toBe(14);
    });
  });

  describe(_'maskEmail',_() => {
    test(_'should mask email with default settings',_() => {
      const email = 'joao.silva@hospital.com';
      const masked = maskEmail(email);

      expect(masked).toBe('j*********@hospital.com');
      expect(masked.split('@')[1]).toBe('hospital.com'); // Domain preserved
    });

    test(_'should handle short email local part',_() => {
      const email = 'a@test.com';
      const masked = maskEmail(email);

      expect(masked).toBe('***@test.com');
    });

    test(_'should respect visibleStart option',_() => {
      const email = 'joao.silva@hospital.com';
      const masked = maskEmail(email, { visibleStart: 3 });

      expect(masked).toBe('joa*******@hospital.com');
    });

    test(_'should handle invalid email format',_() => {
      const email = 'invalid-email';
      const masked = maskEmail(email);

      expect(masked).toBe(email); // Should return original if invalid
    });
  });

  describe(_'maskPhone',_() => {
    test('should mask mobile phone (11 digits)', () => {
      const phone = '11987654321';
      const masked = maskPhone(phone);

      expect(masked).toBe('(11) 9****-****');
    });

    test('should mask landline phone (10 digits)', () => {
      const phone = '1133334444';
      const masked = maskPhone(phone);

      expect(masked).toBe('(11) ****-****');
    });

    test(_'should handle formatted phone',_() => {
      const phone = '(11) 98765-4321';
      const masked = maskPhone(phone);

      expect(masked).toBe('(11) 9****-****');
    });

    test(_'should respect preserveFormat option',_() => {
      const phone = '11987654321';
      const masked = maskPhone(phone, { preserveFormat: false });

      expect(masked).toBe('119********');
    });
  });

  describe(_'maskName',_() => {
    test(_'should mask simple name',_() => {
      const name = 'João Silva';
      const masked = maskName(name);

      expect(masked).toBe('J*** S****');
    });

    test(_'should handle single name',_() => {
      const name = 'João';
      const masked = maskName(name);

      expect(masked).toBe('J***');
    });

    test(_'should handle multiple names',_() => {
      const name = 'João Carlos da Silva Santos';
      const masked = maskName(name);

      expect(masked).toBe('J*** C***** d* S**** S*****');
    });

    test(_'should respect visibleStart option',_() => {
      const name = 'João Silva';
      const masked = maskName(name, { visibleStart: 0 });

      expect(masked).toBe('**** *****');
    });
  });

  describe(_'maskAddress',_() => {
    test(_'should mask address object',_() => {
      const address = {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      };

      const masked = maskAddress(address);

      expect(masked?.street).toBe('**********');
      expect(masked?.number).toBe('***');
      expect(masked?.complement).toBe('*******');
      expect(masked?.neighborhood).toBe('********');
      expect(masked?.city).toBe('São Paulo'); // Preserved
      expect(masked?.state).toBe('SP'); // Preserved
      expect(masked?.zipCode).toBe('01******');
    });

    test(_'should handle partial address',_() => {
      const address = {
        street: 'Rua das Flores',
        city: 'São Paulo',
      };

      const masked = maskAddress(address);

      expect(masked?.street).toBe('**********');
      expect(masked?.city).toBe('São Paulo');
      expect(masked?.number).toBeUndefined();
    });

    test(_'should handle null/undefined address',_() => {
      expect(maskAddress(null)).toBeNull();
      expect(maskAddress(undefined)).toBeUndefined();
    });
  });
});

describe(_'LGPD Anonymization Utils - High-Level Functions',_() => {
  let samplePatient: PatientData;

  beforeEach(_() => {
    samplePatient = {
      id: 'patient-123',
      name: 'João Silva Santos',
      cpf: '12345678901',
      email: 'joao.silva@email.com',
      phone: '11987654321',
      birthDate: '1985-06-15',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      },
      medicalData: {
        diagnosis: ['Hipertensão', 'Diabetes'],
        allergies: ['Penicilina'],
        medications: ['Metformina', 'Losartana'],
      },
    };
  });

  describe(_'maskPatientData',_() => {
    test(_'should mask patient data with basic compliance level',_() => {
      const result = maskPatientData(samplePatient, 'basic');

      expect(result.data.name).toBe('J*** S**** S******');
      expect(result.data.cpf).toBe('***.***.***-**');
      expect(result.data.email).toBe('j******************@email.com');
      expect(result.data.phone).toBe('(11) 9****-****');
      expect(result.data.birthDate).toBe('1985-06-15'); // Not masked in basic
      expect(result.data.address).toBe(samplePatient.address); // Not masked in basic

      expect(result.metadata.complianceLevel).toBe('basic');
      expect(result.metadata.fieldsAnonymized).toContain('cpf');
      expect(result.metadata.fieldsAnonymized).toContain('email');
      expect(result.metadata.fieldsAnonymized).toContain('phone');
      expect(result.metadata.fieldsAnonymized).toContain('name');
    });

    test(_'should mask patient data with enhanced compliance level',_() => {
      const result = maskPatientData(samplePatient, 'enhanced');

      expect(result.data.name).toBe('**** ***** ******');
      expect(result.data.birthDate).toBe('1985-**-**');
      expect(result.data.address?.street).toBe('**********');
      expect(result.data.address?.city).toBe('São Paulo'); // Preserved for statistics

      expect(result.metadata.complianceLevel).toBe('enhanced');
      expect(result.metadata.fieldsAnonymized).toContain('address');
      expect(result.metadata.fieldsAnonymized).toContain('birthDate');
    });

    test(_'should mask patient data with full anonymization',_() => {
      const result = maskPatientData(samplePatient, 'full_anonymization');

      expect(result.data.name).toBe('ANONIMIZADO');
      expect(result.data.birthDate).toBe('1970-1990'); // Age group
      expect(result.data.address?.street).toBe('ANONIMIZADO');
      expect(result.data.address?.city).toBe('São Paulo'); // Preserved for statistics
      expect(result.data.id).toBeUndefined(); // Removed

      expect(result.metadata.complianceLevel).toBe('full_anonymization');
      expect(result.metadata.fieldsAnonymized).toContain('id');
    });

    test(_'should include proper metadata',_() => {
      const result = maskPatientData(samplePatient);

      expect(result.metadata).toMatchObject({
        method: 'maskPatientData',
        complianceLevel: 'basic',
        version: ANONYMIZATION_VERSION,
      });
      expect(result.metadata.anonymizedAt).toBeDefined();
      expect(result.metadata.fieldsAnonymized).toBeInstanceOf(Array);
    });

    test(_'should handle missing fields gracefully',_() => {
      const partialPatient: PatientData = {
        name: 'João Silva',
      };

      const result = maskPatientData(partialPatient);

      expect(result.data.name).toBe('J*** S****');
      expect(result.metadata.fieldsAnonymized).toEqual(['name']);
    });
  });

  describe(_'anonymizePersonalData',_() => {
    test(_'should anonymize specified fields',_() => {
      const data = {
        name: 'João Silva',
        cpf: '12345678901',
        age: 35,
        department: 'Cardiology',
      };

      const anonymized = anonymizePersonalData(data, ['name', 'cpf']);

      expect(anonymized.name).toBe('J*** S****');
      expect(anonymized.cpf).toBe('***.***.***-**');
      expect(anonymized.age).toBe(35); // Not anonymized
      expect(anonymized.department).toBe('Cardiology'); // Not anonymized
    });

    test(_'should use default fields when none specified',_() => {
      const data = {
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@test.com',
        age: 35,
      };

      const anonymized = anonymizePersonalData(data);

      expect(anonymized.name).toBe('J*** S****');
      expect(anonymized.cpf).toBe('***.***.***-**');
      expect(anonymized.email).toBe('j***@test.com');
      expect(anonymized.age).toBe(35); // Not in default fields
    });

    test(_'should handle non-string values',_() => {
      const data = {
        name: 'João Silva',
        metadata: { created: '2023-01-01' },
        tags: ['patient', 'diabetes'],
      };

      const anonymized = anonymizePersonalData(data, [
        'name',
        'metadata',
        'tags',
      ]);

      expect(anonymized.name).toBe('J*** S****');
      expect(anonymized.metadata).toBe('ANONIMIZADO');
      expect(anonymized.tags).toBe('ANONIMIZADO');
    });
  });
});

describe(_'LGPD Anonymization Utils - Utility Functions',_() => {
  describe(_'isDataAnonymized',_() => {
    test(_'should identify anonymized data',_() => {
      const anonymizedData = {
        name: 'J*** S****',
        cpf: '***.***.***-**',
        email: 'j***@test.com',
        age: 35,
      };

      expect(isDataAnonymized(anonymizedData)).toBe(true);
    });

    test(_'should identify non-anonymized data',_() => {
      const nonAnonymizedData = {
        name: 'João Silva',
        cpf: '123.456.789-01',
        email: 'joao@test.com',
        age: 35,
      };

      expect(isDataAnonymized(nonAnonymizedData)).toBe(false);
    });

    test(_'should handle data with ANONIMIZADO markers',_() => {
      const anonymizedData = {
        name: 'ANONIMIZADO',
        cpf: 'ANONIMIZADO',
        email: 'j***@test.com',
      };

      expect(isDataAnonymized(anonymizedData)).toBe(true);
    });

    test(_'should handle partial anonymization',_() => {
      const partiallyAnonymizedData = {
        name: 'J*** S****',
        cpf: '123.456.789-01', // Not anonymized
        email: 'j***@test.com',
      };

      expect(isDataAnonymized(partiallyAnonymizedData)).toBe(false);
    });
  });

  describe(_'generatePrivacyReport',_() => {
    test(_'should generate compliance report for well-anonymized data',_() => {
      const original = {
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@test.com',
      };

      const anonymized = {
        data: {
          name: 'J***',
          cpf: '***.***.***-**',
          email: 'j***@test.com',
        },
        metadata: {
          anonymizedAt: new Date().toISOString(),
          method: 'maskPatientData',
          complianceLevel: 'basic' as LGPDComplianceLevel,
          fieldsAnonymized: ['name', 'cpf', 'email'],
          version: '1.0.0',
        },
      };

      const report = generatePrivacyReport(original, anonymized);

      expect(report.lgpdCompliant).toBe(true);
      expect(report.complianceScore).toBeGreaterThanOrEqual(85);
      expect(report.risks).toHaveLength(0);
    });

    test(_'should identify risks in poorly anonymized data',_() => {
      const original = {
        name: 'João Silva Santos',
        cpf: '12345678901',
      };

      const poorlyAnonymized = {
        data: {
          name: 'João Silva Santos', // Not masked
          cpf: '***.***.***-**',
        },
        metadata: {
          anonymizedAt: new Date().toISOString(),
          method: 'maskPatientData',
          complianceLevel: 'basic' as LGPDComplianceLevel,
          fieldsAnonymized: ['cpf'],
          version: '1.0.0',
        },
      };

      const report = generatePrivacyReport(original, poorlyAnonymized);

      expect(report.lgpdCompliant).toBe(false);
      expect(report.complianceScore).toBeLessThan(85);
      expect(report.risks.length).toBeGreaterThan(0);
      expect(report.risks[0]).toContain('name');
    });

    test(_'should provide recommendations for improvement',_() => {
      const original = {
        name: 'João Silva Santos',
        cpf: '12345678901',
      };

      const partiallyAnonymized = {
        data: {
          name: 'João Silva', // Too much visible
          cpf: '***.***.***-**',
        },
        metadata: {
          anonymizedAt: new Date().toISOString(),
          method: 'maskPatientData',
          complianceLevel: 'basic' as LGPDComplianceLevel,
          fieldsAnonymized: ['name', 'cpf'],
          version: '1.0.0',
        },
      };

      const report = generatePrivacyReport(original, partiallyAnonymized);

      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });
});

describe(_'LGPD Anonymization Utils - Configuration and Constants',_() => {
  test(_'should have default masking options for all compliance levels',_() => {
    expect(DEFAULT_MASKING_OPTIONS).toHaveProperty('basic');
    expect(DEFAULT_MASKING_OPTIONS).toHaveProperty('enhanced');
    expect(DEFAULT_MASKING_OPTIONS).toHaveProperty('full_anonymization');

    expect(DEFAULT_MASKING_OPTIONS.basic.maskChar).toBe('*');
    expect(DEFAULT_MASKING_OPTIONS.enhanced.visibleStart).toBe(0);
    expect(DEFAULT_MASKING_OPTIONS.full_anonymization.preserveFormat).toBe(
      false,
    );
  });

  test(_'should export version constant',_() => {
    expect(ANONYMIZATION_VERSION).toBeDefined();
    expect(typeof ANONYMIZATION_VERSION).toBe('string');
  });
});

describe(_'LGPD Anonymization Utils - Edge Cases and Error Handling',_() => {
  test(_'should handle null and undefined inputs gracefully',_() => {
    expect(maskCPF(null as any)).toBe('');
    expect(maskEmail(undefined as any)).toBe(undefined);
    expect(maskPhone('')).toBe('');
    expect(maskName(null as any)).toBe('');
  });

  test(_'should handle empty patient data',_() => {
    const emptyPatient: PatientData = {};
    const result = maskPatientData(emptyPatient);

    expect(result.data).toEqual({});
    expect(result.metadata.fieldsAnonymized).toHaveLength(0);
  });

  test(_'should handle invalid phone numbers',_() => {
    expect(maskPhone('123')).toBe('123'); // Too short
    expect(maskPhone('abc')).toBe('abc'); // Non-numeric
    expect(maskPhone('123456789012345')).toBe('123456789012345'); // Too long
  });

  test(_'should handle different birth date formats',_() => {
    const patient: PatientData = {
      name: 'Test',
      birthDate: '1985-06-15',
    };

    const result = maskPatientData(patient, 'enhanced');
    expect(result.data.birthDate).toBe('1985-**-**');
  });

  test(_'should handle age groups correctly in full anonymization',_() => {
    const testCases = [
      { birthDate: '1960-01-01', expected: '1950-1970' },
      { birthDate: '1980-01-01', expected: '1970-1990' },
      { birthDate: '2000-01-01', expected: '1990-2010' },
      { birthDate: '2015-01-01', expected: '2010+' },
    ];

    testCases.forEach(_({ birthDate,_expected }) => {
      const patient: PatientData = { name: 'Test', birthDate };
      const result = maskPatientData(patient, 'full_anonymization');
      expect(result.data.birthDate).toBe(expected);
    });
  });
});
