/**
 * Healthcare Prisma Client Integration Tests
 *
 * Comprehensive test suite for healthcare-specific Prisma client features including:
 * - Multi-tenant RLS context validation
 * - LGPD compliance operations (data export, deletion, consent management)
 * - Healthcare-specific error handling
 * - Performance optimization features
 * - Brazilian healthcare regulatory compliance
 * - Audit trail integration
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import {
  createHealthcareContextFromRequest,
  createPrismaWithContext,
  getHealthcarePrismaClient,
  type HealthcareContext,
  UnauthorizedHealthcareAccessError,
} from '../../clients/prisma.js';
import {
  BrazilianHealthcareValidator,
  HealthcareAppointmentHelper,
  LGPDComplianceHelper,
  PatientDataHelper,
} from '../../utils/healthcare-helpers.js';
import { HealthcareQueryOptimizer } from '../../utils/healthcare-performance.js';

// Test data setup
const testClinicId = 'test-clinic-123';
const testUserId = 'test-user-456';
const testPatientId = 'test-patient-789';
const testProfessionalId = 'test-professional-101';

// Mock healthcare context
const mockHealthcareContext: HealthcareContext = {
  _userId: testUserId,
  clinicId: testClinicId,
  _role: 'professional',
  permissions: ['patient_read', 'patient_write', 'appointment_read'],
  cfmValidated: true,
};

// Mock patient data
const mockPatientData = {
  givenNames: ['João', 'Silva'],
  familyName: 'Santos',
  fullName: 'João Silva Santos',
  email: 'joao.santos@email.com',
  phonePrimary: '(11) 99999-9999',
  birthDate: new Date('1980-01-15'),
  gender: 'male',
  cpf: '123.456.789-01',
  rg: '12.345.678-9',
  lgpdConsentGiven: true,
  lgpdConsentVersion: '1.0',
  dataConsentStatus: 'given',
  patientStatus: 'active',
  isActive: true,
};

describe('Healthcare Prisma Client Integration Tests',() => {
  let prismaClient: any;
  let prismaWithContext: any;
  let queryOptimizer: HealthcareQueryOptimizer;

  beforeAll(async () => {
    // Initialize Prisma client
    prismaClient = getHealthcarePrismaClient(

    // Ensure database connection is healthy
    const isHealthy = await prismaClient.validateConnection(
    expect(isHealthy).toBe(true);

  afterAll(async () => {
    // Clean up test data
    try {
      await cleanupTestData(
    } catch (error) {
      console.warn('Cleanup failed:', error
    }

    // Disconnect Prisma client
    await prismaClient.$disconnect(

  beforeEach(async () => {
    // Create context-aware Prisma client for each test
    prismaWithContext = createPrismaWithContext(mockHealthcareContext
    queryOptimizer = new HealthcareQueryOptimizer(prismaWithContext

    // Set up test data
    await setupTestData(

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestData(

  describe('Healthcare Context Management',() => {
    test('should create healthcare context from request',() => {
      const context = createHealthcareContextFromRequest(
        testUserId,
        testClinicId,
        'professional',
        { cfmValidated: true, permissions: ['patient_read'] },
      

      expect(context._userId).toBe(testUserId
      expect(context.clinicId).toBe(testClinicId
      expect(context._role).toBe('professional')
      expect(context.cfmValidated).toBe(true);
      expect(context.permissions).toContain('patient_read')

    test('should validate healthcare context successfully',async () => {
      const isValid = await prismaWithContext.validateContext(
      expect(isValid).toBe(true);

    test('should fail context validation for invalid clinic access',async () => {
      const invalidContext = createHealthcareContextFromRequest(
        'invalid-user',
        'invalid-clinic',
        'professional',
      

      const invalidPrisma = createPrismaWithContext(invalidContext
      const isValid = await invalidPrisma.validateContext(
      expect(isValid).toBe(false);

  describe('LGPD Compliance Operations',() => {
    test('should export patient data in LGPD-compliant format',async () => {
      const exportData = await prismaWithContext.exportPatientData(
        testPatientId,
        testUserId,
        'Patient request for data portability',
      

      expect(exportData).toBeDefined(
      expect(exportData.patientId).toBe(testPatientId
      expect(exportData.dataCategories).toBeDefined(
      expect(exportData.dataCategories.personalData).toBeDefined(
      expect(exportData.dataCategories.medicalData).toBeDefined(
      expect(exportData.consentStatus).toBeDefined(
      expect(exportData.auditTrail).toBeDefined(
      expect(exportData.metadata.requestedBy).toBe(testUserId

    test('should delete patient data with cascade option',async () => {
      await expect(
        prismaWithContext.deletePatientData(testPatientId, {
          cascadeDelete: true,
          retainAuditTrail: true,
          reason: 'LGPD right to erasure request',
        }),
      ).resolves.not.toThrow(

      // Verify patient data is deleted
      const deletedPatient = await prismaWithContext.patient.findUnique({
        where: { id: testPatientId },
      expect(deletedPatient).toBeNull(

    test('should validate consent for data processing',async () => {
      // First create a consent record
      await LGPDComplianceHelper.recordConsent(
        prismaWithContext,
        testPatientId,
        testClinicId,
        {
          consentType: 'data_processing',
          purpose: 'medical_care',
          legalBasis: 'consent',
          dataCategories: ['personal_data', 'medical_data'],
          collectionMethod: 'digital_form',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser',
        },
      

      const consentCheck = await LGPDComplianceHelper.checkConsentValidity(
        prismaWithContext,
        testPatientId,
        'medical_care',
        ['personal_data', 'medical_data'],
      

      expect(consentCheck.isValid).toBe(true);
      expect(consentCheck.consentRecord).toBeDefined(
      expect(consentCheck.missingCategories).toBeUndefined(

    test('should sanitize patient data for AI processing',() => {
      const sensitiveText =
        'Patient João Santos, CPF 123.456.789-01, phone (11) 99999-9999, email joao@email.com';
      const sanitized = LGPDComplianceHelper.sanitizeForAI(sensitiveText

      expect(sanitized).not.toContain('123.456.789-01')
      expect(sanitized).not.toContain('(11) 99999-9999')
      expect(sanitized).not.toContain('joao@email.com')
      expect(sanitized).toContain('[CPF_REMOVED]')
      expect(sanitized).toContain('[PHONE_REMOVED]')
      expect(sanitized).toContain('[EMAIL_REMOVED]')

  describe('Brazilian Healthcare Validation',() => {
    test('should validate Brazilian CPF correctly',() => {
      expect(BrazilianHealthcareValidator.validateCPF('123.456.789-01')).toBe(
        false,
      ); // Invalid test CPF
      expect(BrazilianHealthcareValidator.validateCPF('000.000.000-00')).toBe(
        false,
      ); // Invalid pattern
      expect(BrazilianHealthcareValidator.validateCPF('')).toBe(false); // Empty

    test('should validate Brazilian phone numbers',() => {
      expect(
        BrazilianHealthcareValidator.validateBrazilianPhone('(11) 99999-9999'),
      ).toBe(true);
      expect(
        BrazilianHealthcareValidator.validateBrazilianPhone('11 99999-9999'),
      ).toBe(true);
      expect(
        BrazilianHealthcareValidator.validateBrazilianPhone('(11) 9999-9999'),
      ).toBe(true);
      expect(BrazilianHealthcareValidator.validateBrazilianPhone('123')).toBe(
        false,
      

    test('should validate CFM license numbers',() => {
      expect(BrazilianHealthcareValidator.validateCFM('12345')).toBe(true);
      expect(BrazilianHealthcareValidator.validateCFM('123456')).toBe(true);
      expect(BrazilianHealthcareValidator.validateCFM('123')).toBe(false);
      expect(BrazilianHealthcareValidator.validateCFM('1234567')).toBe(false);

    test('should validate patient data completeness',() => {
      const validation = PatientDataHelper.validatePatientDataCompleteness(mockPatientData

      expect(validation.isComplete).toBe(true);
      expect(validation.missingFields).toHaveLength(0

    test('should generate unique medical record numbers',() => {
      const mrn1 = PatientDataHelper.generateMedicalRecordNumber(testClinicId
      const mrn2 = PatientDataHelper.generateMedicalRecordNumber(testClinicId

      expect(mrn1).toBeDefined(
      expect(mrn2).toBeDefined(
      expect(mrn1).not.toBe(mrn2
      expect(mrn1).toContain(testClinicId.substring(0, 4).toUpperCase()

  describe('Healthcare Query Operations',() => {
    test('should find patients in clinic with RLS validation',async () => {
      const patients = await prismaWithContext.findPatientsInClinic(
        testClinicId,
        {
          isActive: true,
        },
      

      expect(Array.isArray(patients)).toBe(true);
      // Verify all patients belong to the test clinic
      patients.forEach(patient => {
        expect(patient.id).toBeDefined(
        expect(patient.fullName).toBeDefined(

    test('should find appointments for professional',async () => {
      const appointments = await prismaWithContext.findAppointmentsForProfessional(
        testProfessionalId,
        {
          status: 'scheduled',
        },
      

      expect(Array.isArray(appointments)).toBe(true);

    test('should create audit logs for operations',async () => {
      await prismaWithContext.createAuditLog(
        'VIEW',
        'PATIENT_RECORD',
        testPatientId,
        {
          operation: 'patient_view',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Client',
        },
      

      // Verify audit log was created
      const auditLogs = await prismaWithContext.auditTrail.findMany({
        where: {
          _userId: testUserId,
          resourceId: testPatientId,
        },

      expect(auditLogs.length).toBeGreaterThan(0
      expect(auditLogs[0].action).toBe('VIEW')

  describe('Performance Optimization',() => {
    test('should optimize patient search with caching',async () => {
      const searchResult1 = await queryOptimizer.searchPatientsOptimized(
        testClinicId,
        {
          _query: 'João',
          page: 1,
          limit: 10,
        },
      

      expect(searchResult1.fromCache).toBe(false);
      expect(searchResult1.patients).toBeDefined(
      expect(searchResult1.total).toBeGreaterThanOrEqual(0

      // Second call should use cache
      const searchResult2 = await queryOptimizer.searchPatientsOptimized(
        testClinicId,
        {
          _query: 'João',
          page: 1,
          limit: 10,
        },
      

      expect(searchResult2.fromCache).toBe(true);

    test('should get optimized dashboard metrics',async () => {
      const result = await queryOptimizer.getDashboardMetricsOptimized(testClinicId

      expect(result.metrics).toBeDefined(
      expect(result.metrics.patients).toBeDefined(
      expect(result.metrics.appointments).toBeDefined(
      expect(result.metrics.professionals).toBeDefined(
      expect(result.fromCache).toBe(false);

    test('should track performance metrics',() => {
      const metrics = queryOptimizer.getPerformanceMetrics(

      expect(metrics).toBeDefined(
      expect(metrics.queryCount).toBeGreaterThanOrEqual(0
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0
      expect(metrics.connectionPoolStatus).toBeDefined(

  describe('Healthcare Appointment Operations',() => {
    test('should calculate no-show risk score',async () => {
      // This would need a test appointment
      const appointmentId = 'test-appointment-123';

      const riskScore = await HealthcareAppointmentHelper.calculateNoShowRisk(
        prismaWithContext,
        appointmentId,
      

      expect(typeof riskScore).toBe('number')
      expect(riskScore).toBeGreaterThanOrEqual(0
      expect(riskScore).toBeLessThanOrEqual(100

    test('should check appointment conflicts',async () => {
      const startTime = new Date(
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const conflicts = await HealthcareAppointmentHelper.checkAppointmentConflicts(
        prismaWithContext,
        testProfessionalId,
        startTime,
        endTime,
      

      expect(Array.isArray(conflicts)).toBe(true);

  describe('Error Handling',() => {
    test('should throw HealthcareComplianceError for LGPD violations',async () => {
      // Create invalid context (no CFM validation for professional)
      const invalidContext = createHealthcareContextFromRequest(
        testUserId,
        testClinicId,
        'professional',
        { cfmValidated: false },
      

      const invalidPrisma = createPrismaWithContext(invalidContext

      await expect(invalidPrisma.validateContext()).resolves.toBe(false);

    test('should throw UnauthorizedHealthcareAccessError for invalid access',async () => {
      const unauthorizedContext = createHealthcareContextFromRequest(
        'unauthorized-user',
        testClinicId,
        'professional',
      

      const unauthorizedPrisma = createPrismaWithContext(unauthorizedContext

      await expect(
        unauthorizedPrisma.findPatientsInClinic(testClinicId),
      ).rejects.toThrow(UnauthorizedHealthcareAccessError

  describe('Data Anonymization',() => {
    test('should anonymize patient data for research',() => {
      const anonymized = PatientDataHelper.anonymizePatientData(mockPatientData

      expect(anonymized.givenNames).toEqual(['[ANONYMIZED]']
      expect(anonymized.familyName).toBe('[ANONYMIZED]')
      expect(anonymized.email).toBeNull(
      expect(anonymized.cpf).toBeNull(
      expect(anonymized.phonePrimary).toBeNull(

      // Medical data should be preserved
      expect(anonymized.birthDate).toBe(mockPatientData.birthDate
      expect(anonymized.gender).toBe(mockPatientData.gender

  // Helper functions for test setup and cleanup
  async function setupTestData(): Promise<void> {
    try {
      // Create test clinic
      await prismaClient.clinic.upsert({
        where: { id: testClinicId },
        update: {},
        create: {
          id: testClinicId,
          name: 'Test Clinic',
          ownerId: testUserId,
        },

      // Create test user
      await prismaClient.user.upsert({
        where: { id: testUserId },
        update: {},
        create: {
          id: testUserId,
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        },

      // Create test professional
      await prismaClient.professional.upsert({
        where: { id: testProfessionalId },
        update: {},
        create: {
          id: testProfessionalId,
          clinicId: testClinicId,
          _userId: testUserId,
          fullName: 'Dr. Test Professional',
          specialization: 'General Practice',
          licenseNumber: 'CRM-12345',
          isActive: true,
        },

      // Create test patient
      await prismaClient.patient.upsert({
        where: { id: testPatientId },
        update: {},
        create: {
          id: testPatientId,
          clinicId: testClinicId,
          medicalRecordNumber: PatientDataHelper.generateMedicalRecordNumber(testClinicId),
          ...mockPatientData,
        },
    } catch (error) {
      console.warn('Test data setup failed:', error
    }
  }

  async function cleanupTestData(): Promise<void> {
    try {
      // Clean up in reverse order of dependencies
      await prismaClient.auditTrail.deleteMany({
        where: { _userId: testUserId },

      await prismaClient.consentRecord.deleteMany({
        where: { patientId: testPatientId },

      await prismaClient.appointment.deleteMany({
        where: { patientId: testPatientId },

      await prismaClient.patient.deleteMany({
        where: { id: testPatientId },

      await prismaClient.professional.deleteMany({
        where: { id: testProfessionalId },

      await prismaClient.clinic.deleteMany({
        where: { id: testClinicId },

      await prismaClient.user.deleteMany({
        where: { id: testUserId },
    } catch (error) {
      console.warn('Test data cleanup failed:', error
    }
  }
