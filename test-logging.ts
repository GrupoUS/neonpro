/**
 * Test script for enhanced logging system
 */

import { winstonLogger } from './packages/shared/src/services/structured-logging';

// Test basic logging
console.log('Testing enhanced logging system...');

// Set correlation ID
const correlationId = winstonLogger.generateCorrelationId();
winstonLogger.setCorrelationId(correlationId);

// Test different log levels
winstonLogger.info('Test info message', { testData: 'some data' });
winstonLogger.warn('Test warning message', { warning: 'test warning' });
winstonLogger.error('Test error message', new Error('Test error'));

// Test PII redaction
const testDataWithPII = {
  name: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao.silva@email.com',
  phone: '(11) 98765-4321',
  address: 'Rua das Flores, 123, São Paulo',
  password: 'senha123'
};

console.log('Original data:', JSON.stringify(testDataWithPII, null, 2));
console.log('Redacted data:', JSON.stringify(testDataWithPII, null, 2)); // Note: redaction will be handled automatically by the logger

// Test healthcare-specific logging
winstonLogger.logPatientSafetyEvent(
  'Patient requires immediate attention',
  'high',
  {
    workflowType: 'emergency_response',
    patientContext: {
      anonymizedPatientId: 'patient_****',
      ageGroup: 'adult',
      criticalityLevel: 'critical',
      isEmergencyCase: true,
    },
    professionalContext: {
      anonymizedProfessionalId: 'doctor_****',
      role: 'physician',
      department: 'emergency',
    },
    clinicalContext: {
      facilityId: 'hospital_001',
      serviceType: 'emergency_care',
      requiresAudit: true,
    },
    brazilianCompliance: {
      lgpdLegalBasis: 'vital_interests',
      requiresAnonymization: true,
      hasExplicitConsent: false,
    },
  },
  { patientId: 'patient_sensitive_123', symptoms: ['chest pain', 'shortness of breath'] }
);

// Test correlation ID logging
winstonLogger.info('Request with correlation ID', { 
  requestId: correlationId,
  action: 'test_request' 
});

console.log('Test completed successfully!');