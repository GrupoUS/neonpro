import { describe, expect, it } from 'vitest';

describe('Database Package - Basic Validation', () => {
  it('should validate test infrastructure is working', () => {
    expect(true).toBe(true);
  });

  it('should validate environment variables are set', () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_KEY).toBeDefined();
  });

  it('should validate test utils are available', () => {
    const testUtils = (global as any).testUtils;
    expect(testUtils).toBeDefined();
    expect(typeof testUtils.createMockPatient).toBe('function');
    expect(typeof testUtils.createMockConsentRequest).toBe('function');
    expect(typeof testUtils.createMockAppointment).toBe('function');
  });

  it('should validate mock patient creation', () => {
    const testUtils = (global as any).testUtils;
    const mockPatient = testUtils.createMockPatient();
    
    expect(mockPatient).toBeDefined();
    expect(mockPatient.clinicId).toBe('test-clinic-id');
    expect(mockPatient.medicalRecordNumber).toMatch(/^MRN-\d+$/);
    expect(mockPatient.fullName).toBe('Test Patient');
    expect(mockPatient.lgpdConsentGiven).toBe(true);
  });

  it('should validate mock consent request creation', () => {
    const testUtils = (global as any).testUtils;
    const mockConsent = testUtils.createMockConsentRequest();
    
    expect(mockConsent).toBeDefined();
    expect(mockConsent.patientId).toBe('test-patient-id');
    expect(mockConsent.consentType).toBe('DATA_PROCESSING');
    expect(mockConsent.purpose).toBe('Healthcare treatment');
    expect(Array.isArray(mockConsent.dataTypes)).toBe(true);
  });

  it('should validate mock appointment creation', () => {
    const testUtils = (global as any).testUtils;
    const mockAppointment = testUtils.createMockAppointment();
    
    expect(mockAppointment).toBeDefined();
    expect(mockAppointment.clinicId).toBe('test-clinic-id');
    expect(mockAppointment.patientId).toBe('test-patient-id');
    expect(mockAppointment.professionalId).toBe('test-professional-id');
    expect(typeof mockAppointment.startTime).toBe('string');
    expect(typeof mockAppointment.endTime).toBe('string');
  });
});