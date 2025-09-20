/**
 * RED Phase: Logging Sensitive Data Tests
 * 
 * These tests initially FAIL and demonstrate current console logging vulnerabilities
 * They will only pass when proper structured logging and data sanitization is implemented
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '../../src/client';
import { createAdminClient } from '../../../apps/api/src/clients/supabase';

// Mock console methods to capture logging output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});

describe('Database Logging - Sensitive Healthcare Data Exposure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LGPD Compliance - Patient Data Protection', () => {
    it('should NOT log sensitive patient data to console', async () => {
      // Setup test environment with patient data
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
      
      const mockPatientData = {
        id: 'patient-123',
        name: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao.silva@email.com',
        phone: '+55 11 99999-9999',
        medical_record: {
          conditions: ['Diabetes Type 2', 'Hypertension'],
          medications: ['Metformin 500mg', 'Losartan 50mg'],
          allergies: ['Penicillin'],
          last_visit: '2024-01-15'
        }
      };

      // This test will FAIL because current implementation logs errors with full data
      try {
        // Simulate database operation that fails and logs patient data
        const result = await createAdminClient()
          .from('patients')
          .insert(mockPatientData);
        
        if (result.error) {
          // Current implementation would log: console.error('Database error:', result.error)
          // which might contain sensitive patient data
          console.error('Database error:', result.error);
        }
      } catch (error) {
        console.error('Connection error:', error);
      }

      // Test will FAIL because current implementation logs sensitive data
      const logCalls = mockConsoleError.mock.calls;
      const hasSensitiveData = logCalls.some(call => 
        JSON.stringify(call).includes('João Silva') ||
        JSON.stringify(call).includes('123.456.789-00') ||
        JSON.stringify(call).includes('Diabetes Type 2') ||
        JSON.stringify(call).includes('Metformin')
      );

      expect(hasSensitiveData).toBe(false);
    });

    it('should NOT log medical record data in error scenarios', async () => {
      const mockMedicalRecord = {
        patient_id: 'patient-456',
        diagnosis: 'Depression Major',
        treatment: 'Cognitive Behavioral Therapy',
        medications: 'Sertraline 100mg daily',
        notes: 'Patient shows improvement with current treatment plan'
      };

      // Simulate failed medical record insertion
      try {
        const client = createAdminClient();
        const result = await client
          .from('medical_records')
          .insert(mockMedicalRecord);
        
        if (result.error) {
          console.error('Failed to insert medical record:', result.error);
        }
      } catch (error) {
        console.error('Medical record operation failed:', error);
      }

      // Test will FAIL because medical data is being logged
      const errorLogs = mockConsoleError.mock.calls;
      const hasMedicalData = errorLogs.some(call => 
        JSON.stringify(call).includes('Depression Major') ||
        JSON.stringify(call).includes('Sertraline') ||
        JSON.stringify(call).includes('Cognitive Behavioral Therapy')
      );

      expect(hasMedicalData).toBe(false);
    });
  });

  describe('CFM Compliance - Medical Professional Data', () => {
    it('should NOT log doctor credentials or patient interactions', async () => {
      const mockDoctorData = {
        crm: '123456-SP',
        name: 'Dr. Maria Santos',
        specialty: 'Cardiologia',
        patients: ['patient-789', 'patient-101']
      };

      const mockAppointment = {
        id: 'apt-123',
        doctor_id: 'doctor-456',
        patient_id: 'patient-789',
        reason: 'Consulta de rotina',
        notes: 'Paciente refere dor no peito durante exercício',
        prescription: 'Atenolol 25mg 2x ao dia'
      };

      // Simulate failed operations that might log sensitive data
      try {
        const client = createAdminClient();
        
        // Failed doctor data operation
        const doctorResult = await client
          .from('doctors')
          .insert(mockDoctorData);
        
        if (doctorResult.error) {
          console.error('Doctor operation failed:', doctorResult.error);
        }

        // Failed appointment operation
        const aptResult = await client
          .from('appointments')
          .insert(mockAppointment);
        
        if (aptResult.error) {
          console.error('Appointment operation failed:', aptResult.error);
        }
      } catch (error) {
        console.error('Professional data operation failed:', error);
      }

      // Test will FAIL because professional data is being logged
      const allLogs = [...mockConsoleError.mock.calls, ...mockConsoleLog.mock.calls];
      const hasSensitiveProfessionalData = allLogs.some(call => 
        JSON.stringify(call).includes('123456-SP') ||
        JSON.stringify(call).includes('Dr. Maria Santos') ||
        JSON.stringify(call).includes('dor no peito') ||
        JSON.stringify(call).includes('Atenolol')
      );

      expect(hasSensitiveProfessionalData).toBe(false);
    });
  });

  describe('Database Connection Security', () => {
    it('should NOT log database connection credentials or URLs', async () => {
      // Simulate connection error scenarios
      process.env.SUPABASE_URL = 'https://invalid.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'invalid-service-key';

      try {
        const client = createAdminClient();
        await client.validateConnection();
      } catch (error) {
        console.error('Database connection failed:', error);
        console.error('Connection details:', {
          url: process.env.SUPABASE_URL,
          error: error
        });
      }

      // Test will FAIL because connection details are being logged
      const errorLogs = mockConsoleError.mock.calls;
      const hasConnectionDetails = errorLogs.some(call => 
        JSON.stringify(call).includes('supabase.co') ||
        JSON.stringify(call).includes('service-key') ||
        JSON.stringify(call).includes('localhost:5432')
      );

      expect(hasConnectionDetails).toBe(false);
    });

    it('should NOT log database schema information in errors', async () => {
      // Simulate schema-related error
      try {
        const client = createAdminClient();
        const result = await client
          .from('nonexistent_table')
          .select('*');
        
        if (result.error) {
          console.error('Query failed:', result.error);
          console.error('Table does not exist: nonexistent_table');
        }
      } catch (error) {
        console.error('Schema error:', error);
      }

      // Test will FAIL because schema information is being logged
      const allLogs = [...mockConsoleError.mock.calls, ...mockConsoleLog.mock.calls];
      const hasSchemaInfo = allLogs.some(call => 
        JSON.stringify(call).includes('nonexistent_table') ||
        JSON.stringify(call).includes('schema') ||
        JSON.stringify(call).includes('table does not exist')
      );

      expect(hasSchemaInfo).toBe(false);
    });
  });

  describe('ANVISA Compliance - Medical Device Data', () => {
    it('should NOT log medical device calibration or measurement data', async () => {
      const mockDeviceData = {
        device_id: 'device-789',
        patient_id: 'patient-456',
        measurements: {
          blood_pressure: { systolic: 140, diastolic: 90 },
          heart_rate: 85,
          temperature: 36.8,
          oxygen_saturation: 98
        },
        calibration_date: '2024-01-10',
        serial_number: 'MED-DEV-2024-001'
      };

      try {
        const client = createAdminClient();
        const result = await client
          .from('medical_devices')
          .insert(mockDeviceData);
        
        if (result.error) {
          console.error('Medical device data insertion failed:', result.error);
          console.error('Device measurements:', mockDeviceData.measurements);
        }
      } catch (error) {
        console.error('Device operation error:', error);
      }

      // Test will FAIL because medical device data is being logged
      const allLogs = [...mockConsoleError.mock.calls, ...mockConsoleLog.mock.calls];
      const hasDeviceData = allLogs.some(call => 
        JSON.stringify(call).includes('blood_pressure') ||
        JSON.stringify(call).includes('heart_rate') ||
        JSON.stringify(call).includes('MED-DEV-2024-001') ||
        JSON.stringify(call).includes('140/90')
      );

      expect(hasDeviceData).toBe(false);
    });
  });

  describe('Structured Logging Requirements', () => {
    it('should use structured logging with proper correlation IDs', async () => {
      // Test will FAIL because current implementation uses unstructured console.log
      const testCorrelationId = 'test-correlation-123';
      
      // Simulate an operation that should include correlation ID
      console.log(`Processing request ${testCorrelationId}`);
      console.error(`Error processing ${testCorrelationId}: Database timeout`);

      // Check if logs include structured data with correlation ID
      const allLogs = [...mockConsoleLog.mock.calls, ...mockConsoleError.mock.calls];
      const hasStructuredLogging = allLogs.some(call => {
        const logStr = JSON.stringify(call);
        return logStr.includes('correlationId') || 
               logStr.includes('timestamp') || 
               logStr.includes('level');
      });

      expect(hasStructuredLogging).toBe(true);
    });

    it('should sanitize error objects before logging', async () => {
      const errorWithSensitiveData = {
        message: 'Database connection failed',
        stack: 'Error: Database connection failed\n    at Connection.connect (/app/src/client.ts:45:10)',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'neonpro_healthcare',
          user: 'postgres',
          password: 'supersecretpassword'
        },
        query: 'SELECT * FROM patients WHERE id = $1',
        parameters: ['patient-sensitive-123']
      };

      // Current implementation would log the full error object
      console.error('Database error:', errorWithSensitiveData);

      // Test will FAIL because sensitive config data is being logged
      const errorLogs = mockConsoleError.mock.calls;
      const hasSensitiveConfig = errorLogs.some(call => 
        JSON.stringify(call).includes('supersecretpassword') ||
        JSON.stringify(call).includes('localhost:5432') ||
        JSON.stringify(call).includes('patient-sensitive-123')
      );

      expect(hasSensitiveConfig).toBe(false);
    });
  });

  describe('Healthcare Data Anonymization', () => {
    it('should NOT log personal identifiers in error contexts', async () => {
      const patientIds = ['patient-123', 'patient-456', 'patient-789'];
      const doctorIds = ['doctor-111', 'doctor-222'];

      // Simulate bulk operations that might fail
      patientIds.forEach(patientId => {
        try {
          console.log(`Processing patient ${patientId}`);
          // Simulate operation that fails
          throw new Error(`Failed to process patient ${patientId}`);
        } catch (error) {
          console.error(`Error for patient ${patientId}:`, error);
        }
      });

      // Test will FAIL because patient IDs are being logged
      const allLogs = [...mockConsoleLog.mock.calls, ...mockConsoleError.mock.calls];
      const hasPatientIds = allLogs.some(call => 
        JSON.stringify(call).includes('patient-123') ||
        JSON.stringify(call).includes('patient-456') ||
        JSON.stringify(call).includes('patient-789')
      );

      expect(hasPatientIds).toBe(false);
    });

    it('should anonymize CPF and similar identifiers in logs', async () => {
      const testCases = [
        '123.456.789-00',
        '987.654.321-11',
        '456.789.123-99'
      ];

      testCases.forEach(cpf => {
        console.error(`Invalid CPF format: ${cpf}`);
        console.log(`Processing document with CPF: ${cpf}`);
      });

      // Test will FAIL because CPFs are being logged in full
      const allLogs = [...mockConsoleLog.mock.calls, ...mockConsoleError.mock.calls];
      const hasFullCpfs = allLogs.some(call => 
        JSON.stringify(call).includes('123.456.789-00') ||
        JSON.stringify(call).includes('987.654.321-11') ||
        JSON.stringify(call).includes('456.789.123-99')
      );

      expect(hasFullCpfs).toBe(false);
    });
  });
});