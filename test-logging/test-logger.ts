#!/usr/bin/env node

/**
 * Simple test script to verify the enhanced Winston logging system
 */

import { enhancedLogger } from '../packages/shared/src/services/winston-logging/index.js';

console.log('🧪 Testing Enhanced Winston Logging System...');

// Test basic logging
enhancedLogger.info('Test info message', { test: true });
enhancedLogger.warn('Test warning message', { warning: 'test warning' });
enhancedLogger.error('Test error message', new Error('Test error'));

// Test PII redaction
enhancedLogger.info('PII test', { 
  cpf: '123.456.789-00',
  cnpj: '12.345.678/0001-00',
  patientName: 'João Silva',
  email: 'joao.silva@email.com'
});

// Test healthcare-specific logging
const healthcareContext = {
  workflowType: 'patient_registration' as const,
  workflowStage: 'initial_assessment',
  patientContext: {
    anonymizedPatientId: 'patient_12345',
    ageGroup: 'adult' as const,
    criticalityLevel: 'routine' as const,
    hasAllergies: false,
    isEmergencyCase: false,
    requiresConsent: true,
    consentStatus: 'granted' as const,
  },
  professionalContext: {
    anonymizedProfessionalId: 'prof_67890',
    role: 'doctor',
    specialization: 'general_practice',
    department: 'outpatient',
    councilNumber: 'CRM/SP 123456',
  },
  clinicalContext: {
    facilityId: 'facility_001',
    serviceType: 'general_consultation',
    protocolVersion: 'v2.0',
    complianceFrameworks: ['LGPD', 'ANVISA'],
    requiresAudit: true,
  },
  brazilianCompliance: {
    lgpdLegalBasis: 'consent' as const,
    dataRetentionDays: 365,
    requiresAnonymization: true,
    hasExplicitConsent: true,
  },
};

enhancedLogger.logClinicalWorkflow(
  'patient_registration',
  'initial_assessment',
  'Patient registration workflow started',
  { patientId: 'patient_12345' },
  { healthcare: healthcareContext }
);

// Test correlation ID
const correlationId = enhancedLogger.generateCorrelationId();
enhancedLogger.setCorrelationId(correlationId);
enhancedLogger.info('Message with correlation ID', { correlationId });

// Test child logger
const childLogger = enhancedLogger.child({ service: 'test-service' });
childLogger.info('Message from child logger');

// Get statistics
const stats = enhancedLogger.getStatistics();
console.log('📊 Logger Statistics:', JSON.stringify(stats, null, 2));

console.log('✅ Enhanced Winston Logging System Test Complete');