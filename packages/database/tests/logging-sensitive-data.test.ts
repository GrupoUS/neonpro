/**
 * RED Phase: Logging Sensitive Data Tests
 * 
 * These tests validate that healthcare data logging complies with LGPD, ANVISA, and CFM regulations.
 * Tests are designed to FAIL with current implementation and PASS when proper logging is implemented.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '../../src/client';
import { createAdminClient } from '../../../apps/api/src/clients/supabase';
import { 
  healthcareFixtures, 
  testUtils, 
  loggingTestUtils, 
  complianceTestUtils 
} from './test-setup';

describe('Database Logging - Healthcare Data Compliance_, () => {
  let consoleCapture: ReturnType<typeof loggingTestUtils.captureConsoleOutput>;

  beforeEach(() => {
    vi.clearAllMocks(
    consoleCapture = loggingTestUtils.captureConsoleOutput(
  }

  afterEach(() => {
    consoleCapture.restore(
    vi.restoreAllMocks(
  }

  describe('LGPD Compliance - Patient Data Protection_, () => {
    it('should NOT log sensitive patient PII data to console_,_async () => {
      // Setup test environment with sanitized patient data
      process.env.SUPABASE_URL = ''https://test.supabase.co')
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''test-key')
      
      const mockPatientData = healthcareFixtures.patientData;
      const sensitiveData = {
        ...mockPatientData,
        cpf: '123.456.789-00', // This should NOT be logged
        rg: '12.345.678-9',   // This should NOT be logged
        medical_record: {
          conditions: ['Diabetes Type 2', 'Hypertension'],
          medications: ['Metformin 500mg', 'Losartan 50mg'],
          allergies: ['Penicillin'],
          last_visit: '2024-01-15_
        }
      };

      // Mock database client to simulate operations
      const mockClient = testUtils.createMockClient(
      const mockError = testUtils.createDatabaseError('Constraint violation', '23505')
      
      // Simulate database operation that fails and might log patient data
      try {
        const result = await mockClient
          .from('patients')
          .insert(sensitiveData
        
        if (result.error) {
          // Current implementation might log: console.error('Database error:', result.error)
          console.error('Database error:', result.error
        }
      } catch (error) {
        console.error('Connection error:', error
      }

      // Check that NO sensitive data was logged
      const { errors } = consoleCapture.getOutput(
      const hasSensitiveData = loggingTestUtils.containsSensitiveData(errors, [
        '123.456.789-00',
        '12.345.678-9', 
        'Diabetes Type 2',
        'Metformin')
      ]

      expect(hasSensitiveData).toBe(false);
    }

    it('should anonymize medical record data in error logs_,_async () => {
      const mockMedicalRecord = {
        ...healthcareFixtures.medicalRecordData,
        diagnosis: 'Depression Major',
        treatment: 'Cognitive Behavioral Therapy',
        medications: 'Sertraline 100mg daily',
        notes: 'Patient shows improvement with current treatment plan')
      };

      // Simulate failed medical record insertion
      try {
        const client = createAdminClient(
        vi.mocked(client.from).mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database constraint violation' }
          })
        } as any

        const result = await client
          .from('medical_records_)
          .insert(mockMedicalRecord
        
        if (result.error) {
          console.error('Failed to insert medical record:', result.error
        }
      } catch (error) {
        console.error('Medical record operation failed:', error
      }

      // Test should pass because medical data should be anonymized
      const { errors } = consoleCapture.getOutput(
      const hasMedicalData = loggingTestUtils.containsSensitiveData(errors, [
        'Depression Major',
        'Sertraline',
        'Cognitive Behavioral Therapy')
      ]

      expect(hasMedicalData).toBe(false);
    }
  }

  describe('CFM Compliance - Medical Professional Data_, () => {
    it('should NOT log doctor credentials or patient interactions_,_async () => {
      const mockDoctorData = {
        ...healthcareFixtures.professionalData,
        crm: '123456-SP', // This should NOT be logged
        patients: ['patient-789', 'patient-101']
      };

      const mockAppointment = {
        ...healthcareFixtures.appointmentData,
        reason: 'Consulta de rotina',
        notes: 'Paciente refere dor no peito durante exercício', // This should NOT be logged
        prescription: 'Atenolol 25mg 2x ao dia' // This should NOT be logged
      };

      // Simulate failed operations that might log sensitive data
      try {
        const client = createAdminClient(
        
        // Failed doctor data operation
        const doctorResult = await client
          .from('doctors')
          .insert(mockDoctorData
        
        if (doctorResult.error) {
          console.error('Doctor operation failed:', doctorResult.error
        }

        // Failed appointment operation
        const aptResult = await client
          .from('appointments')
          .insert(mockAppointment
        
        if (aptResult.error) {
          console.error('Appointment operation failed:', aptResult.error
        }
      } catch (error) {
        console.error('Professional data operation failed:', error
      }

      // Test should pass because professional data should be protected
      const { errors, logs } = consoleCapture.getOutput(
      const allLogs = [...errors, ...logs];
      const hasSensitiveProfessionalData = loggingTestUtils.containsSensitiveData(allLogs, [
        '123456-SP',
        'Dr. Test Professional',
        'dor no peito',
        'Atenolol')
      ]

      expect(hasSensitiveProfessionalData).toBe(false);
    }
  }

  describe('Database Connection Security_, () => {
    it('should NOT log database connection credentials or URLs_,_async () => {
      // Simulate connection error scenarios
      const originalUrl = process.env.SUPABASE_URL;
      process.env.SUPABASE_URL = ''https://invalid.supabase.co')
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''invalid-service-key')

      try {
        const client = createAdminClient(
        // Mock a connection validation method
        await (client as any).validateConnection?.(
      } catch (error) {
        console.error('Database connection failed:', error
        console.error('Connection details:', {
          url: process.env.SUPABASE_URL,
          error: error
        }
      }

      // Restore original URL
      process.env.SUPABASE_URL = originalUrl;

      // Test should pass because connection details should not be logged
      const { errors } = consoleCapture.getOutput(
      const hasConnectionDetails = loggingTestUtils.containsSensitiveData(errors, [
        'supabase.co',
        'service-key',
        'localhost:5432')
      ]

      expect(hasConnectionDetails).toBe(false);
    }

    it('should NOT log database schema information in errors_,_async () => {
      // Simulate schema-related error
      try {
        const client = createAdminClient(
        const result = await client
          .from('nonexistent_table_)
          .select('*')
        
        if (result.error) {
          console.error('Query failed:', result.error
          console.error('Table does not exist: nonexistent_table_
        }
      } catch (error) {
        console.error('Schema error:', error
      }

      // Test should pass because schema information should not be logged
      const { errors, logs } = consoleCapture.getOutput(
      const allLogs = [...errors, ...logs];
      const hasSchemaInfo = loggingTestUtils.containsSensitiveData(allLogs, [
        'nonexistent_table_,
        'schema',
        'table does not exist')
      ]

      expect(hasSchemaInfo).toBe(false);
    }
  }

  describe('ANVISA Compliance - Medical Device Data_, () => {
    it('should NOT log medical device calibration or measurement data_,_async () => {
      const mockDeviceData = {
        device_id: 'device-789_,
        patient_id: 'patient-456_,
        measurements: {
          blood_pressure: { systolic: 140, diastolic: 90 },
          heart_rate: 85,
          temperature: 36.8,
          oxygen_saturation: 98
        },
        calibration_date: '2024-01-10_,
        serial_number: 'MED-DEV-2024-001_
      };

      try {
        const client = createAdminClient(
        const result = await client
          .from('medical_devices_)
          .insert(mockDeviceData
        
        if (result.error) {
          console.error('Medical device data insertion failed:', result.error
          console.error('Device measurements:', mockDeviceData.measurements
        }
      } catch (error) {
        console.error('Device operation error:', error
      }

      // Test should pass because medical device data should be protected
      const { errors, logs } = consoleCapture.getOutput(
      const allLogs = [...errors, ...logs];
      const hasDeviceData = loggingTestUtils.containsSensitiveData(allLogs, [
        'blood_pressure_,
        'heart_rate_,
        'MED-DEV-2024-001',
        '140/90')
      ]

      expect(hasDeviceData).toBe(false);
    }
  }

  describe('Structured Logging Requirements_, () => {
    it('should use structured logging with proper correlation IDs_,_async () => {
      const testCorrelationId = testUtils.generateCorrelationId(
      
      // Simulate an operation that should include correlation ID
      console.log(`Processing request ${testCorrelationId}`
      console.error(`Error processing ${testCorrelationId}: Database timeout`

      // Check if logs include structured data with correlation ID
      const { logs, errors } = consoleCapture.getOutput(
      const allLogs = [...logs, ...errors];
      const hasStructuredLogging = loggingTestUtils.hasStructuredLogging(allLogs

      expect(hasStructuredLogging).toBe(true);
    }

    it('should sanitize error objects before logging_,_async () => {
      const errorWithSensitiveData = {
        message: 'Database connection failed',
        stack: 'Error: Database connection failed\\n    at Connection.connect (/app/src/client.ts:45:10)',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'neonpro_healthcare_,
          user: 'postgres',
          password: 'supersecretpassword' // This should NOT be logged
        },
        _query: 'SELECT * FROM patients WHERE id = $1_,
        parameters: ['patient-sensitive-123'] // This should NOT be logged
      };

      // Current implementation would log the full error object
      console.error('Database error:', errorWithSensitiveData

      // Test should pass because sensitive config data should be sanitized
      const { errors } = consoleCapture.getOutput(
      const hasSensitiveConfig = loggingTestUtils.containsSensitiveData(errors, [
        'supersecretpassword',
        'localhost:5432',
        'patient-sensitive-123')
      ]

      expect(hasSensitiveConfig).toBe(false);
    }
  }

  describe('Healthcare Data Anonymization_, () => {
    it('should NOT log personal identifiers in error contexts_,_async () => {
      const patientIds = ['patient-123', 'patient-456', 'patient-789'];
      const doctorIds = ['doctor-111', 'doctor-222'];

      // Simulate bulk operations that might fail
      patientIds.forEach(patientId => {
        try {
          console.log(`Processing patient ${patientId}`
          // Simulate operation that fails
          throw new Error(`Failed to process patient ${patientId}`
        } catch (error) {
          console.error(`Error for patient ${patientId}:`, error
        }
      }

      // Test should pass because patient IDs should be anonymized
      const { logs, errors } = consoleCapture.getOutput(
      const allLogs = [...logs, ...errors];
      const hasPatientIds = loggingTestUtils.containsSensitiveData(allLogs, [
        'patient-123',
        'patient-456', 
        'patient-789')
      ]

      expect(hasPatientIds).toBe(false);
    }

    it('should anonymize CPF and similar identifiers in logs_,_async () => {
      const testCases = [
        '123.456.789-00',
        '987.654.321-11',
        '456.789.123-99')
      ];

      testCases.forEach(cpf => {
        console.error(`Invalid CPF format: ${cpf}`
        console.log(`Processing document with CPF: ${cpf}`
      }

      // Test should pass because CPFs should be anonymized
      const { logs, errors } = consoleCapture.getOutput(
      const allLogs = [...logs, ...errors];
      const hasFullCpfs = loggingTestUtils.containsSensitiveData(allLogs, [
        '123.456.789-00',
        '987.654.321-11',
        '456.789.123-99')
      ]

      expect(hasFullCpfs).toBe(false);
    }
  }

  describe('LGPD Data Processing Compliance_, () => {
    it('should validate LGPD compliance for data processing operations_,_async () => {
      const lgpdData = complianceTestUtils.generateLGPDCompliantData(
      const validationResult = complianceTestUtils.validatesLGPDCompliance(
        lgpdData, 
        'patient_data_access_
      

      // Test should pass because LGPD validation should be implemented
      expect(validationResult.compliant).toBe(true);
      expect(validationResult.checks.hasConsent).toBe(true);
      expect(validationResult.checks.hasPurpose).toBe(true);
      expect(validationResult.checks.hasLegalBasis).toBe(true);
    }

    it('should maintain audit trail for healthcare data access_,_async () => {
      const auditTrail = {
        _userId: 'test-user-123_,
        action: 'patient_data_access_,
        timestamp: new Date().toISOString(),
        correlationId: testUtils.generateCorrelationId(),
        dataType: 'patient_medical_records_,
        purpose: 'healthcare_analysis_,
        legalBasis: 'legitimate_interest_
      };

      // Simulate audit logging
      console.log('Audit trail:', JSON.stringify(auditTrail)

      // Test should pass because audit trail should be structured
      const { logs } = consoleCapture.getOutput(
      const hasStructuredAudit = loggingTestUtils.hasStructuredLogging(logs

      expect(hasStructuredAudit).toBe(true);
    }
  }
}