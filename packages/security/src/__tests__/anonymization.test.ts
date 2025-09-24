/**
 * @fileoverview Tests for LGPD Anonymization and Data Masking Utilities
 *
 * Tests compliance with LGPD requirements for data anonymization
 * and masking in healthcare scenarios.
 */
import { beforeEach, describe, expect, test } from 'vitest';
import {}
  anonymizePersonalData,
  DEFAULT_MASKING_OPTIONS,
  generatePrivacyReport,
  isDataAnonymized,
  maskAddress,
  maskCNPJ,
  maskCPF,
  maskEmail,
  type MaskingOptions,
  maskName,
  maskPatientData,
  maskPhone,
  type PatientData,
  ANONYMIZATION_VERSION,
  type LGPDComplianceLevel,
} from '../anonymization';
describe('LGPD Anonymization Utils - Core Masking Functions', () => {}
  describe('maskCPF', () => {}
    test('should mask CPF with default format', () => {}
      const cpf = '12345678901';
      const masked = maskCPF(cpf);
      expect(masked).toBe('***.***.***-**');
      expect(masked).toMatch(/^\*{3}\.\*{3}\.\*{3}-\*{2}$/);
    });
    test('should mask formatted CPF', () => {}
      const cpf = '123.456.789-01';
      const masked = maskCPF(cpf);
      expect(masked).toBe('***.***.***-**');
    });
    test('should handle invalid CPF format', () => {}
      const cpf = '123456789'; // Too short
      const masked = maskCPF(cpf);
      expect(masked).toBe(cpf); // Should return original if invalid
    });
    test('should respect preserveFormat option', () => {}
      const cpf = '12345678901';
      const masked = maskCPF(cpf, { preserveFormat: false });
      expect(masked).toBe('***********');
      expect(masked.length).toBe(11);
    });
    test('should handle empty input', () => {}
      const masked = maskCPF('');
      expect(masked).toBe('');
    });
  });
  describe('maskCNPJ', () => {}
    test('should mask CNPJ with default format', () => {}
      const cnpj = '12345678000195';
      const masked = maskCNPJ(cnpj);
      expect(masked).toBe('**.***.***/****-**');
      expect(masked).toMatch(/^\*{2}\.\*{3}\.\*{3}\/\*{4}-\*{2}$/);
    });
    test('should mask formatted CNPJ', () => {}
      const cnpj = '12.345.678/0001-95';
      const masked = maskCNPJ(cnpj);
      expect(masked).toBe('**.***.***/****-**');
    });
    test('should handle invalid CNPJ format', () => {}
      const cnpj = '12345678000'; // Too short
      const masked = maskCNPJ(cnpj);
      expect(masked).toBe(cnpj); // Should return original if invalid
    });
    test('should respect preserveFormat option', () => {}
      const cnpj = '12345678000195';
      const masked = maskCNPJ(cnpj, { preserveFormat: false });
      expect(masked).toBe('**************');
      expect(masked.length).toBe(14);
    });
  });
  describe('maskEmail', () => {}
    test('should mask email with default settings', () => {}
      const email = 'joao.silva@hospital.com';
      const masked = maskEmail(email);
      expect(masked).toBe('j*********@hospital.com');
    });
    test('should handle short email local part', () => {}
      const email = 'a@test.com';
      const masked = maskEmail(email);
      expect(masked).toBe('***@test.com');
    });
    test('should respect visibleStart option', () => {}
      const email = 'joao.silva@hospital.com';
      const masked = maskEmail(email, { visibleStart: 3 });
      expect(masked).toBe('joa*******@hospital.com');
    });
    test('should handle invalid email format', () => {}
      const email = 'invalid-email';
      const masked = maskEmail(email);
      expect(masked).toBe(email); // Should return original if invalid
    });
  });
  describe('maskPhone', () => {}
    test('should mask mobile phone (11 digits)', () => {}
      const phone = '11987654321';
      const masked = maskPhone(phone);
      expect(masked).toBe('(11) 9****-****');
    });
    test('should mask landline phone (10 digits)', () => {}
      const phone = '1133334444';
      const masked = maskPhone(phone);
      expect(masked).toBe('(11) ****-****');
    });
    test('should handle formatted phone', () => {}
      const phone = '(11) 98765-4321';
      const masked = maskPhone(phone);
      expect(masked).toBe('(11) 9****-****');
    });
    test('should respect preserveFormat option', () => {}
      const phone = '11987654321';
      const masked = maskPhone(phone, { preserveFormat: false });
      expect(masked).toBe('119********');
    });
  });
  describe('maskName', () => {}
    test('should mask simple name', () => {}
      const name = 'João Silva';
      const masked = maskName(name);
      expect(masked).toBe('J*** S****');
    });
    test('should handle single name', () => {}
      const name = 'João';
      const masked = maskName(name);
      expect(masked).toBe('J***');
    });
    test('should handle multiple names', () => {}
      const name = 'João Carlos da Silva Santos';
      const masked = maskName(name);
      expect(masked).toBe('J*** C***** d* S**** S*****');
    });
    test('should respect visibleStart option', () => {}
      const name = 'João Silva';
      const masked = maskName(name, { visibleStart: 0 });
      expect(masked).toBe('**** *****');
    });
  });
  describe('maskAddress', () => {}
    test('should mask address object', () => {}
      const address = {}
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
    test('should handle partial address', () => {}
      const address = {}
        street: 'Rua das Flores',
        city: 'São Paulo',
      };
      const masked = maskAddress(address);
      expect(masked?.street).toBe('**********');
      expect(masked?.city).toBe('São Paulo');
      expect(masked?.number).toBeUndefined();
    });
    test('should handle null/undefined address', () => {}
      expect(maskAddress(null)).toBeNull();
      expect(maskAddress(undefined)).toBeUndefined();
    });
  });
});
describe('LGPD Anonymization Utils - High-Level Functions', () => {}
  let samplePatient: PatientData;
  beforeEach(() => {}
    samplePatient = {}
      id: 'patient-123',
      name: 'João Silva Santos',
      cpf: '12345678901',
      email: 'joao.silva@email.com',
      phone: '11987654321',
      birthDate: '1985-06-15',
      address: {}
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      },
      medicalData: {}
        diagnosis: ['Hipertensão', 'Diabetes'],
        allergies: ['Penicilina'],
        medications: ['Metformina', 'Losartana'],
      },
    };
  });
  describe('maskPatientData', () => {}
    test('should mask patient data with basic compliance level', () => {}
      const result = maskPatientData(samplePatient);
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
    test('should mask patient data with enhanced compliance level', () => {}
      const result = maskPatientData(samplePatient, 'enhanced');
      expect(result.data.name).toBe('**** ***** ******');
      expect(result.data.birthDate).toBe('1985-**-**');
      expect(result.data.address?.street).toBe('**********');
      expect(result.data.address?.city).toBe('São Paulo'); // Preserved for statistics
      expect(result.metadata.complianceLevel).toBe('enhanced');
      expect(result.metadata.fieldsAnonymized).toContain('address');
      expect(result.metadata.fieldsAnonymized).toContain('birthDate');
    });
    test('should mask patient data with full anonymization', () => {}
      const result = maskPatientData(samplePatient, 'full');
      expect(result.data.name).toBe('ANONIMIZADO');
      expect(result.data.birthDate).toBe('1970-1990'); // Age group
      expect(result.data.address?.street).toBe('ANONIMIZADO');
      expect(result.data.address?.city).toBe('São Paulo'); // Preserved for statistics
      expect(result.data.id).toBeUndefined(); // Removed
      expect(result.metadata).toMatchObject({}
        method: 'maskPatientData',
        complianceLevel: 'basic',
        version: ANONYMIZATION_VERSION,
      });
      expect(result.metadata.anonymizedAt).toBeDefined();
      expect(result.metadata.fieldsAnonymized).toBeInstanceOf(Array);
    });
    test('should handle missing fields gracefully', () => {}
      const partialPatient: PatientData = {}
        name: 'João Silva',
      };
      const result = maskPatientData(partialPatient);
      expect(result.data.name).toBe('J*** S****');
      expect(result.metadata.fieldsAnonymized).toEqual(['name']);
    });
  });
  describe('anonymizePersonalData', () => {}
    test('should anonymize specified fields', () => {}
      const data = {}
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
    test('should use default fields when none specified', () => {}
      const data = {}
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
    test('should handle non-string values', () => {}
      const data = {}
        name: 'João Silva',
        metadata: { created: '2023-01-01' },
        tags: ['patient', 'diabetes'],
      };
      const anonymized = anonymizePersonalData(data, []
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
describe('LGPD Anonymization Utils - Utility Functions', () => {}
  describe('isDataAnonymized', () => {}
    test('should identify anonymized data', () => {}
      const anonymizedData = {}
        name: 'J*** S****',
        cpf: '***.***.***-**',
        email: 'j***@test.com',
        age: 35,
      };
      expect(isDataAnonymized(anonymizedData)).toBe(true);
    });
    test('should identify non-anonymized data', () => {}
      const nonAnonymizedData = {}
        name: 'João Silva',
        cpf: '123.456.789-01',
        email: 'joao@test.com',
        age: 35,
      };
      expect(isDataAnonymized(nonAnonymizedData)).toBe(false);
    });
    test('should handle data with ANONIMIZADO markers', () => {}
      const anonymizedData = {}
        name: 'ANONIMIZADO',
        cpf: 'ANONIMIZADO',
        email: 'j***@test.com',
      };
      expect(isDataAnonymized(anonymizedData)).toBe(true);
    });
    test('should handle partial anonymization', () => {}
      const partiallyAnonymizedData = {}
        name: 'J*** S****',
        cpf: '123.456.789-01', // Not anonymized
        email: 'j***@test.com',
      };
      expect(isDataAnonymized(partiallyAnonymizedData)).toBe(false);
    });
  });
  describe('generatePrivacyReport', () => {}
    test('should generate compliance report for well-anonymized data', () => {}
      const original = {}
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@test.com',
      };
      const anonymized = {}
        data: {}
          name: 'J***',
          cpf: '***.***.***-**',
          email: 'j***@test.com',
        },
        metadata: {}
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
    test('should identify risks in poorly anonymized data', () => {}
      const original = {}
        name: 'João Silva Santos',
        cpf: '12345678901',
      };
      const poorlyAnonymized = {}
        data: {}
          name: 'João Silva Santos', // Not masked
          cpf: '***.***.***-**',
        },
        metadata: {}
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
    test('should provide recommendations for improvement', () => {}
      const original = {}
        name: 'João Silva Santos',
        cpf: '12345678901',
      };
      const partiallyAnonymized = {}
        data: {}
          name: 'João Silva', // Too much visible
          cpf: '***.***.***-**',
        },
        metadata: {}
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
describe('LGPD Anonymization Utils - Configuration and Constants', () => {}
  test('should have default masking options for all compliance levels', () => {}
    expect(DEFAULT_MASKING_OPTIONS.full_anonymization.preserveFormat).toBe(false);
  });
  test('should export version constant', () => {}
    expect(ANONYMIZATION_VERSION).toBe('1.0.0');
  });
  test('should handle empty patient data', () => {}
    const emptyPatient: PatientData = {};
    const result = maskPatientData(emptyPatient);
    expect(result.data).toEqual({});
    expect(result.metadata.fieldsAnonymized).toHaveLength(0);
  });
  test('should handle invalid phone numbers', () => {}
    expect(maskPhone('123')).toBe('123'); // Too short
    expect(maskPhone('abc')).toBe('abc'); // Non-numeric
    expect(maskPhone('123456789012345')).toBe('123456789012345'); // Too long
  });
  test('should handle different birth date formats', () => {}
    const patient: PatientData = {}
      name: 'Test',
      birthDate: '1985-06-15',
    };
    const result = maskPatientData(patient, 'enhanced');
    expect(result.data.birthDate).toBe('1985-**-**');
  });
  test('should handle age groups correctly in full anonymization', () => {}
    const testCases = []
      { birthDate: '1960-01-01', expected: '1950-1970' },
      { birthDate: '1980-01-01', expected: '1970-1990' },
      { birthDate: '2000-01-01', expected: '1990-2010' },
      { birthDate: '2015-01-01', expected: '2010+' },
    ];
    testCases.forEach(({ birthDate, expected }) => {}
      const patient: PatientData = { name: 'Test', birthDate };
      const result = maskPatientData(patient, 'full');
      expect(result.data.birthDate).toBe(expected);
    });
  });
});