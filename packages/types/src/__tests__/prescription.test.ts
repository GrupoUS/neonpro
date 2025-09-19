/**
 * Digital Prescription Valibot Schemas Test Suite
 * 
 * Comprehensive test coverage for Brazilian digital prescription validation
 * Tests include ANVISA compliance, CFM standards, controlled substances
 * 
 * @package @neonpro/types
 * @author Claude AI Agent
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import {
  // Basic validation schemas
  ANVISARegisterNumberSchema,
  PharmaceuticalBarcodeSchema,
  DosageSchema,
  FrequencySchema,
  DurationSchema,
  PrescriptionExpirationSchema,
  MedicationPriceSchema,
  
  // Complex object schemas
  MedicationInformationSchema,
  PrescriptionInstructionsSchema,
  DigitalCertificateSchema,
  PrescriptionAuditTrailSchema,
  
  // Main prescription schemas
  PrescriptionCreationSchema,
  PrescriptionUpdateSchema,
  PrescriptionQuerySchema,
  
  // Enum schemas
  PrescriptionStatusSchema,
  MedicationTypeSchema,
  AdministrationRouteSchema,
  PrescriptionTypeSchema,
  DigitalCertificateTypeSchema,
  
  // Helper functions
  validateControlledSubstanceCompliance,
  generatePrescriptionNumber,
  calculateExpirationDate,
  
  // Branded types
  type PrescriptionId,
  type MedicationCode,
  type ANVISARegisterNumber,
  type DigitalCertificateId,
  type Dosage,
  type PharmaceuticalBarcode
} from '../prescription.valibot';

describe('Digital Prescription Validation - TDD RED Phase', () => {
  
  describe('ANVISA Register Number Validation', () => {
    it('should validate correct ANVISA register format', () => {
      const validRegisters = [
        '1.2345.6789.123-4',
        '9.8765.4321.987-6',
        '5.1234.5678.456-7'
      ];
      
      validRegisters.forEach(register => {
        const result = v.safeParse(ANVISARegisterNumberSchema, register);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBe(register);
        }
      });
    });
    
    it('should reject invalid ANVISA register formats', () => {
      const invalidRegisters = [
        '12345.6789.123-4',    // Missing first segment
        '1.23456.789.123-4',   // Wrong segment length
        '1.2345.6789.123',     // Missing check digit
        '0.2345.6789.123-4',   // Invalid first digit
        'A.2345.6789.123-4',   // Non-numeric
        '1.2345.6789.123-45'   // Wrong check digit length
      ];
      
      invalidRegisters.forEach(register => {
        const result = v.safeParse(ANVISARegisterNumberSchema, register);
        expect(result.success).toBe(false);
      });
    });
  });
  
  describe('Pharmaceutical Barcode Validation (EAN-13)', () => {
    it('should validate correct EAN-13 barcodes', () => {
      // Valid EAN-13 codes with correct check digits
      const validBarcodes = [
        '7891234567895',  // Valid EAN-13
        '7899876543215',  // Valid EAN-13
        '1234567890128'   // Valid EAN-13
      ];
      
      validBarcodes.forEach(barcode => {
        const result = v.safeParse(PharmaceuticalBarcodeSchema, barcode);
        expect(result.success).toBe(true);
      });
    });
    
    it('should reject invalid barcode formats', () => {
      const invalidBarcodes = [
        '123456789012',      // Too short
        '12345678901234',    // Too long
        '123456789012A',     // Non-numeric
        '7891234567891'      // Invalid check digit
      ];
      
      invalidBarcodes.forEach(barcode => {
        const result = v.safeParse(PharmaceuticalBarcodeSchema, barcode);
        expect(result.success).toBe(false);
      });
    });
  });
  
  describe('Dosage Validation', () => {
    it('should validate correct dosage formats', () => {
      const validDosages = [
        '500mg',
        '5ml',
        '1 comprimido',
        '2 gotas',
        '10mcg',
        '1.5g',
        '500mg/5ml',  // Concentration format
        '2 a 3 comprimidos',
        '1 sachê',
        '1 aplicação'
      ];
      
      validDosages.forEach(dosage => {
        const result = v.safeParse(DosageSchema, dosage);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBe(dosage.toLowerCase());
        }
      });
    });
    
    it('should reject invalid dosage formats', () => {
      const invalidDosages = [
        'mg',           // Missing quantity
        '500',          // Missing unit
        'muito',        // Vague quantity
        '500 xyz',      // Invalid unit
        ''              // Empty
      ];
      
      invalidDosages.forEach(dosage => {
        const result = v.safeParse(DosageSchema, dosage);
        expect(result.success).toBe(false);
      });
    });
  });
  
  describe('Frequency Validation (Posologia)', () => {
    it('should validate correct frequency formats', () => {
      const validFrequencies = [
        '1x ao dia',
        '2x ao dia',
        'de 8 em 8 horas',
        'a cada 12 horas',
        'conforme necessário',
        'em jejum',
        'antes das refeições',
        'após as refeições',
        'ao deitar',
        '3 gotas no olho direito'
      ];
      
      validFrequencies.forEach(frequency => {
        const result = v.safeParse(FrequencySchema, frequency);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBe(frequency.toLowerCase());
        }
      });
    });
    
    it('should reject invalid frequency formats', () => {
      const invalidFrequencies = [
        'sempre',
        'quando quiser',
        'x ao dia',  // Missing number
        'muito'
      ];
      
      invalidFrequencies.forEach(frequency => {
        const result = v.safeParse(FrequencySchema, frequency);
        expect(result.success).toBe(false);
      });
    });
  });
  
  describe('Duration Validation', () => {
    it('should validate correct duration formats', () => {
      const validDurations = [
        '7 dias',
        '2 semanas',
        '1 mês',
        'uso contínuo',
        'até melhora dos sintomas',
        'por tempo indeterminado'
      ];
      
      validDurations.forEach(duration => {
        const result = v.safeParse(DurationSchema, duration);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBe(duration.toLowerCase());
        }
      });
    });
    
    it('should reject invalid duration formats', () => {
      const invalidDurations = [
        'pouco tempo',
        'muito',
        '7',        // Missing unit
        'dias'      // Missing quantity
      ];
      
      invalidDurations.forEach(duration => {
        const result = v.safeParse(DurationSchema, duration);
        expect(result.success).toBe(false);
      });
    });
  });
  
  describe('Prescription Expiration Validation', () => {
    it('should validate correct expiration dates', () => {
      const now = new Date();
      const issueDate = now.toISOString().split('T')[0]; // Date only format YYYY-MM-DD
      const validExpiration = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 30 days later
      
      const expirationData = {
        issue_date: issueDate,
        expiration_date: validExpiration
      };
      
      const result = v.safeParse(PrescriptionExpirationSchema, expirationData);
      expect(result.success).toBe(true);
    });
    
    it('should reject expired prescriptions at issue', () => {
      const now = new Date();
      const issueDate = now.toISOString().split('T')[0];
      const expiredDate = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Yesterday
      
      const expirationData = {
        issue_date: issueDate,
        expiration_date: expiredDate
      };
      
      const result = v.safeParse(PrescriptionExpirationSchema, expirationData);
      expect(result.success).toBe(false);
    });
    
    it('should reject prescriptions with excessive validity period', () => {
      const now = new Date();
      const issueDate = now.toISOString().split('T')[0];
      const tooLongExpiration = new Date(now.getTime() + (200 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 200 days later
      
      const expirationData = {
        issue_date: issueDate,
        expiration_date: tooLongExpiration
      };
      
      const result = v.safeParse(PrescriptionExpirationSchema, expirationData);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Medication Price Validation', () => {
    it('should validate correct medication prices', () => {
      const validPrices = [0, 10.50, 999.99, 500];
      
      validPrices.forEach(price => {
        const result = v.safeParse(MedicationPriceSchema, price);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBe(Math.round(price * 100) / 100);
        }
      });
    });
    
    it('should reject invalid medication prices', () => {
      const invalidPrices = [-1, 1000000, NaN, Infinity];
      
      invalidPrices.forEach(price => {
        const result = v.safeParse(MedicationPriceSchema, price);
        expect(result.success).toBe(false);
      });
    });
  });
  
  describe('Medication Information Schema', () => {
    it('should validate complete medication information', () => {
      const validMedication = {
        name: 'Paracetamol 500mg',
        active_principle: 'Paracetamol',
        medication_type: 'common',
        anvisa_register: '1.2345.6789.123-4',
        barcode: '7891234567895',
        manufacturer: 'Laboratório Exemplo',
        presentation: 'Comprimidos revestidos 500mg cx 10 un',
        concentration: '500mg',
        administration_route: 'oral',
        therapeutic_class: 'Analgésico e antipirético',
        pharmacological_class: 'Derivados da para-aminofenol',
        controlled_substance: false,
        requires_prescription: false,
        generic_available: true,
        reference_price: 15.50
      };
      
      const result = v.safeParse(MedicationInformationSchema, validMedication);
      expect(result.success).toBe(true);
    });
    
    it('should reject medication with invalid fields', () => {
      const invalidMedication = {
        name: 'P',  // Too short
        active_principle: 'Paracetamol',
        medication_type: 'invalid_type',
        administration_route: 'oral',
        controlled_substance: false,
        requires_prescription: false,
        generic_available: true
      };
      
      const result = v.safeParse(MedicationInformationSchema, invalidMedication);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Prescription Instructions Schema', () => {
    it('should validate complete prescription instructions', () => {
      const validInstructions = {
        dosage: '500mg',
        frequency: '1x ao dia',
        duration: '7 dias',
        quantity_prescribed: 7,
        quantity_unit: 'comprimidos',
        instructions: 'Tomar com água',
        precautions: 'Não exceder a dose recomendada',
        administration_time: 'apos_refeicao',
        renewal_allowed: false,
        max_renewals: 0
      };
      
      const result = v.safeParse(PrescriptionInstructionsSchema, validInstructions);
      expect(result.success).toBe(true);
    });
    
    it('should reject instructions with invalid quantity', () => {
      const invalidInstructions = {
        dosage: '500mg',
        frequency: '1x ao dia',
        duration: '7 dias',
        quantity_prescribed: 0, // Invalid
        quantity_unit: 'comprimidos',
        renewal_allowed: false
      };
      
      const result = v.safeParse(PrescriptionInstructionsSchema, invalidInstructions);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Digital Certificate Schema', () => {
    it('should validate complete digital certificate', () => {
      const validCertificate = {
        certificate_id: '123e4567-e89b-12d3-a456-426614174000',
        certificate_type: 'a3',
        certificate_serial: 'ABC123456789',
        issuer_name: 'Autoridade Certificadora Exemplo',
        subject_name: 'Dr. João Silva - CRM/SP 123456',
        valid_from: '2024-01-01',
        valid_until: '2025-01-01',
        is_valid: true,
        thumbprint: '1234567890abcdef1234567890abcdef12345678',
        key_usage: ['digital_signature', 'key_encipherment'],
        crm_number: '123456/SP',
        cfm_validation_status: 'validated'
      };
      
      const result = v.safeParse(DigitalCertificateSchema, validCertificate);
      expect(result.success).toBe(true);
    });
    
    it('should reject certificate with invalid CRM format', () => {
      const invalidCertificate = {
        certificate_id: '123e4567-e89b-12d3-a456-426614174000',
        certificate_type: 'a3',
        certificate_serial: 'ABC123456789',
        issuer_name: 'Autoridade Certificadora Exemplo',
        subject_name: 'Dr. João Silva',
        valid_from: '2024-01-01',
        valid_until: '2025-01-01',
        is_valid: true,
        thumbprint: '1234567890abcdef1234567890abcdef12345678',
        key_usage: ['digital_signature'],
        crm_number: '123456', // Invalid format
        cfm_validation_status: 'validated'
      };
      
      const result = v.safeParse(DigitalCertificateSchema, invalidCertificate);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Prescription Creation Schema', () => {
    it('should validate complete prescription creation', () => {
      const now = new Date();
      const expiration = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const validPrescription = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        patient_id: '223e4567-e89b-12d3-a456-426614174000',
        professional_id: '323e4567-e89b-12d3-a456-426614174000',
        prescription_type: 'simple',
        medications: [{
          medication: {
            name: 'Paracetamol 500mg',
            active_principle: 'Paracetamol',
            medication_type: 'common',
            administration_route: 'oral',
            controlled_substance: false,
            requires_prescription: false,
            generic_available: true
          },
          instructions: {
            dosage: '500mg',
            frequency: '1x ao dia',
            duration: '7 dias',
            quantity_prescribed: 7,
            quantity_unit: 'comprimidos',
            renewal_allowed: false
          }
        }],
        digital_certificate: {
          certificate_id: '423e4567-e89b-12d3-a456-426614174000',
          certificate_type: 'a3',
          certificate_serial: 'ABC123456789',
          issuer_name: 'Autoridade Certificadora Exemplo',
          subject_name: 'Dr. João Silva - CRM/SP 123456',
          valid_from: '2024-01-01',
          valid_until: '2025-01-01',
          is_valid: true,
          thumbprint: '1234567890abcdef1234567890abcdef12345678',
          key_usage: ['digital_signature']
        },
        issue_date: now.toISOString().split('T')[0],
        expiration_date: expiration.toISOString().split('T')[0],
        cfm_compliance_verified: true,
        anvisa_compliance_verified: true
      };
      
      const result = v.safeParse(PrescriptionCreationSchema, validPrescription);
      expect(result.success).toBe(true);
    });
    
    it('should reject prescription without required compliance verification', () => {
      const now = new Date();
      const expiration = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const invalidPrescription = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        patient_id: '223e4567-e89b-12d3-a456-426614174000',
        professional_id: '323e4567-e89b-12d3-a456-426614174000',
        prescription_type: 'simple',
        medications: [{
          medication: {
            name: 'Paracetamol 500mg',
            active_principle: 'Paracetamol',
            medication_type: 'common',
            administration_route: 'oral',
            controlled_substance: false,
            requires_prescription: false,
            generic_available: true
          },
          instructions: {
            dosage: '500mg',
            frequency: '1x ao dia',
            duration: '7 dias',
            quantity_prescribed: 7,
            quantity_unit: 'comprimidos',
            renewal_allowed: false
          }
        }],
        digital_certificate: {
          certificate_id: '423e4567-e89b-12d3-a456-426614174000',
          certificate_type: 'a3',
          certificate_serial: 'ABC123456789',
          issuer_name: 'Autoridade Certificadora Exemplo',
          subject_name: 'Dr. João Silva - CRM/SP 123456',
          valid_from: '2024-01-01',
          valid_until: '2025-01-01',
          is_valid: true,
          thumbprint: '1234567890abcdef1234567890abcdef12345678',
          key_usage: ['digital_signature']
        },
        issue_date: now.toISOString().split('T')[0],
        expiration_date: expiration.toISOString().split('T')[0],
        cfm_compliance_verified: false, // Invalid - must be true
        anvisa_compliance_verified: true
      };
      
      const result = v.safeParse(PrescriptionCreationSchema, invalidPrescription);
      expect(result.success).toBe(false);
    });
    
    it('should reject prescription with controlled substance violations', () => {
      const now = new Date();
      const expiration = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const invalidPrescription = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        patient_id: '223e4567-e89b-12d3-a456-426614174000',
        professional_id: '323e4567-e89b-12d3-a456-426614174000',
        prescription_type: 'special_blue',
        medications: [{
          medication: {
            name: 'Morfina 10mg',
            active_principle: 'Morfina',
            medication_type: 'controlled_a1',
            administration_route: 'oral',
            controlled_substance: true,
            requires_prescription: true,
            generic_available: false
          },
          instructions: {
            dosage: '10mg',
            frequency: '1x ao dia',
            duration: '60 dias', // Invalid - exceeds 30 days for A1 controlled
            quantity_prescribed: 100, // Invalid - exceeds 60 units
            quantity_unit: 'comprimidos',
            renewal_allowed: false
          }
        }],
        digital_certificate: {
          certificate_id: '423e4567-e89b-12d3-a456-426614174000',
          certificate_type: 'a3',
          certificate_serial: 'ABC123456789',
          issuer_name: 'Autoridade Certificadora Exemplo',
          subject_name: 'Dr. João Silva - CRM/SP 123456',
          valid_from: '2024-01-01',
          valid_until: '2025-01-01',
          is_valid: true,
          thumbprint: '1234567890abcdef1234567890abcdef12345678',
          key_usage: ['digital_signature']
        },
        issue_date: now.toISOString().split('T')[0],
        expiration_date: expiration.toISOString().split('T')[0],
        cfm_compliance_verified: true,
        anvisa_compliance_verified: true
      };
      
      const result = v.safeParse(PrescriptionCreationSchema, invalidPrescription);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Helper Functions', () => {
    describe('validateControlledSubstanceCompliance', () => {
      it('should validate compliant controlled substance prescription', () => {
        const medications = [{
          medication: {
            medication_type: 'controlled_a1',
            controlled_substance: true
          },
          instructions: {
            duration: '30 dias',
            quantity_prescribed: 30
          }
        }];
        
        const result = validateControlledSubstanceCompliance(medications);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      
      it('should reject non-compliant controlled substance prescription', () => {
        const medications = [{
          medication: {
            medication_type: 'controlled_a1',
            controlled_substance: true
          },
          instructions: {
            duration: '60 dias', // Invalid - exceeds 30 days
            quantity_prescribed: 100 // Invalid - exceeds 60 units
          }
        }];
        
        const result = validateControlledSubstanceCompliance(medications);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
    
    describe('generatePrescriptionNumber', () => {
      it('should generate valid prescription number format', () => {
        const clinicId = '123e4567-e89b-12d3-a456-426614174000';
        const professionalCRM = '123456/SP';
        const issueDate = '2024-01-15T10:30:00.000Z';
        
        const prescriptionNumber = generatePrescriptionNumber(clinicId, professionalCRM, issueDate);
        
        // Should follow format: CLINICPREFIX-CRMNUM-YYYYMMDD-SEQUENCE
        expect(prescriptionNumber).toMatch(/^[A-Z0-9]{6}-\d+-\d{8}-\d{4}$/);
        expect(prescriptionNumber).toContain('123456'); // CRM number
        expect(prescriptionNumber).toContain('20240115'); // Date
      });
    });
    
    describe('calculateExpirationDate', () => {
      it('should calculate correct expiration for common medications', () => {
        const issueDate = '2024-01-01T00:00:00.000Z';
        const expirationDate = calculateExpirationDate(issueDate, 'common');
        
        const expectedExpiration = new Date('2024-01-01T00:00:00.000Z');
        expectedExpiration.setDate(expectedExpiration.getDate() + 180);
        
        expect(new Date(expirationDate)).toEqual(expectedExpiration);
      });
      
      it('should calculate correct expiration for controlled substances A1', () => {
        const issueDate = '2024-01-01T00:00:00.000Z';
        const expirationDate = calculateExpirationDate(issueDate, 'controlled_a1');
        
        const expectedExpiration = new Date('2024-01-01T00:00:00.000Z');
        expectedExpiration.setDate(expectedExpiration.getDate() + 30);
        
        expect(new Date(expirationDate)).toEqual(expectedExpiration);
      });
      
      it('should calculate correct expiration for antibiotics', () => {
        const issueDate = '2024-01-01T00:00:00.000Z';
        const expirationDate = calculateExpirationDate(issueDate, 'antibiotic');
        
        const expectedExpiration = new Date('2024-01-01T00:00:00.000Z');
        expectedExpiration.setDate(expectedExpiration.getDate() + 30);
        
        expect(new Date(expirationDate)).toEqual(expectedExpiration);
      });
      
      it('should calculate correct expiration for insulin', () => {
        const issueDate = '2024-01-01T00:00:00.000Z';
        const expirationDate = calculateExpirationDate(issueDate, 'insulin');
        
        const expectedExpiration = new Date('2024-01-01T00:00:00.000Z');
        expectedExpiration.setDate(expectedExpiration.getDate() + 90);
        
        expect(new Date(expirationDate)).toEqual(expectedExpiration);
      });
    });
  });
  
  describe('Enum Schemas', () => {
    it('should validate prescription status values', () => {
      const validStatuses = ['draft', 'issued', 'dispensed', 'expired', 'cancelled'];
      
      validStatuses.forEach(status => {
        const result = v.safeParse(PrescriptionStatusSchema, status);
        expect(result.success).toBe(true);
      });
    });
    
    it('should validate medication type values', () => {
      const validTypes = ['common', 'generic', 'controlled_a1', 'antibiotic', 'insulin'];
      
      validTypes.forEach(type => {
        const result = v.safeParse(MedicationTypeSchema, type);
        expect(result.success).toBe(true);
      });
    });
    
    it('should validate administration route values', () => {
      const validRoutes = ['oral', 'intramuscular', 'intravenous', 'topical', 'inhalation'];
      
      validRoutes.forEach(route => {
        const result = v.safeParse(AdministrationRouteSchema, route);
        expect(result.success).toBe(true);
      });
    });
  });
  
  describe('Query Schema', () => {
    it('should validate complete prescription query', () => {
      const validQuery = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        patient_id: '223e4567-e89b-12d3-a456-426614174000',
        status: 'issued',
        prescription_type: 'simple',
        issue_date_from: '2024-01-01',
        issue_date_to: '2024-12-31',
        medication_type: 'common',
        controlled_substances_only: false,
        limit: 50,
        offset: 0,
        sort_by: 'issue_date',
        sort_order: 'desc'
      };
      
      const result = v.safeParse(PrescriptionQuerySchema, validQuery);
      expect(result.success).toBe(true);
    });
    
    it('should reject query with invalid sort parameters', () => {
      const invalidQuery = {
        sort_by: 'invalid_field',
        sort_order: 'invalid_order'
      };
      
      const result = v.safeParse(PrescriptionQuerySchema, invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});