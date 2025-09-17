/**
 * Tests for Audit Trail Service (T041)
 * Following TDD methodology - MUST FAIL FIRST
 * CRITICAL: All audit data must be persisted to Supabase PostgreSQL
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Audit Trail Service (T041)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export AuditService class', () => {
    expect(() => {
      const module = require('../audit-service');
      expect(module.AuditService).toBeDefined();
    }).not.toThrow();
  });

  describe('Activity Logging', () => {
    it('should log patient data access activity', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logActivity({
        userId: 'doctor-123',
        action: 'patient_data_access',
        resourceType: 'patient',
        resourceId: 'patient-123',
        details: {
          fields: ['name', 'cpf', 'medical_history'],
          reason: 'Consulta médica agendada',
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      });

      expect(result.success).toBe(true);
      expect(result.data.auditId).toBeDefined();
      expect(result.data.timestamp).toBeDefined();
      expect(result.data.persisted).toBe(true);
    });

    it('should log patient data modification activity', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logActivity({
        userId: 'doctor-123',
        action: 'patient_data_update',
        resourceType: 'patient',
        resourceId: 'patient-123',
        details: {
          changedFields: ['phone', 'address'],
          oldValues: { phone: '(11) 99999-9999', address: 'Rua A, 123' },
          newValues: { phone: '(11) 88888-8888', address: 'Rua B, 456' },
          reason: 'Atualização de dados pelo paciente',
        },
        ipAddress: '192.168.1.100',
      });

      expect(result.success).toBe(true);
      expect(result.data.auditId).toBeDefined();
      expect(result.data.changeHash).toBeDefined();
      expect(result.data.persisted).toBe(true);
    });

    it('should log LGPD consent changes', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logActivity({
        userId: 'patient-123',
        action: 'consent_update',
        resourceType: 'lgpd_consent',
        resourceId: 'consent-123',
        details: {
          consentType: 'marketing',
          previousValue: false,
          newValue: true,
          legalBasis: 'consent',
        },
        complianceContext: 'LGPD',
      });

      expect(result.success).toBe(true);
      expect(result.data.complianceFlags).toContain('LGPD');
      expect(result.data.persisted).toBe(true);
    });

    it('should log AI chat interactions', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logActivity({
        userId: 'patient-123',
        action: 'ai_chat_interaction',
        resourceType: 'ai_conversation',
        resourceId: 'conv-123',
        details: {
          provider: 'openai',
          model: 'gpt-4',
          messageCount: 5,
          tokensUsed: 1250,
          containsSensitiveData: true,
        },
        sensitivityLevel: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.data.sensitivityLevel).toBe('high');
      expect(result.data.persisted).toBe(true);
    });
  });

  describe('Security Event Monitoring', () => {
    it('should log failed authentication attempts', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logSecurityEvent({
        eventType: 'authentication_failure',
        severity: 'medium',
        userId: 'unknown',
        ipAddress: '192.168.1.200',
        details: {
          attemptedUsername: 'admin',
          failureReason: 'invalid_password',
          attemptCount: 3,
        },
        threatLevel: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.securityEventId).toBeDefined();
      expect(result.data.threatLevel).toBe('medium');
      expect(result.data.alertTriggered).toBeDefined();
    });

    it('should log suspicious data access patterns', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logSecurityEvent({
        eventType: 'suspicious_access_pattern',
        severity: 'high',
        userId: 'doctor-456',
        details: {
          accessCount: 50,
          timeWindow: '5 minutes',
          patientsAccessed: 25,
          pattern: 'bulk_data_access',
        },
        threatLevel: 'high',
        requiresInvestigation: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.severity).toBe('high');
      expect(result.data.investigationRequired).toBe(true);
      expect(result.data.alertTriggered).toBe(true);
    });

    it('should log unauthorized access attempts', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logSecurityEvent({
        eventType: 'unauthorized_access',
        severity: 'critical',
        userId: 'user-789',
        resourceType: 'patient',
        resourceId: 'patient-456',
        details: {
          attemptedAction: 'view_medical_records',
          denialReason: 'insufficient_permissions',
          userRole: 'receptionist',
          requiredRole: 'doctor',
        },
        threatLevel: 'critical',
      });

      expect(result.success).toBe(true);
      expect(result.data.severity).toBe('critical');
      expect(result.data.threatLevel).toBe('critical');
      expect(result.data.immediateAlert).toBe(true);
    });

    it('should detect and log data export anomalies', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logSecurityEvent({
        eventType: 'data_export_anomaly',
        severity: 'high',
        userId: 'admin-123',
        details: {
          exportSize: '500MB',
          recordCount: 10000,
          exportType: 'patient_data',
          timeOfDay: '02:30 AM',
          isOutsideBusinessHours: true,
        },
        threatLevel: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.data.anomalyDetected).toBe(true);
      expect(result.data.requiresApproval).toBe(true);
    });
  });

  describe('Compliance Audit Trails', () => {
    it('should generate LGPD compliance audit trail', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.generateComplianceAuditTrail({
        complianceFramework: 'LGPD',
        patientId: 'patient-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        includeDataProcessing: true,
        includeConsentHistory: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.framework).toBe('LGPD');
      expect(Array.isArray(result.data.auditEvents)).toBe(true);
      expect(result.data.complianceScore).toBeDefined();
      expect(result.data.violations).toBeDefined();
    });

    it('should generate ANVISA compliance audit trail', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.generateComplianceAuditTrail({
        complianceFramework: 'ANVISA',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        includeMedicalDeviceUsage: true,
        includeHealthDataProcessing: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.framework).toBe('ANVISA');
      expect(result.data.medicalDeviceEvents).toBeDefined();
      expect(result.data.healthDataEvents).toBeDefined();
    });

    it('should generate CFM compliance audit trail', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.generateComplianceAuditTrail({
        complianceFramework: 'CFM',
        doctorId: 'doctor-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        includeMedicalRecords: true,
        includePrescriptions: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.framework).toBe('CFM');
      expect(result.data.medicalRecordEvents).toBeDefined();
      expect(result.data.prescriptionEvents).toBeDefined();
      expect(result.data.professionalStandardsCompliance).toBeDefined();
    });

    it('should validate audit trail completeness', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.validateAuditTrailCompleteness({
        patientId: 'patient-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        expectedEvents: ['data_access', 'data_update', 'consent_change'],
      });

      expect(result.success).toBe(true);
      expect(result.data.isComplete).toBeDefined();
      expect(result.data.missingEvents).toBeDefined();
      expect(result.data.integrityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Forensic Analysis', () => {
    it('should reconstruct user activity timeline', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.reconstructActivityTimeline({
        userId: 'doctor-123',
        startDate: new Date('2024-01-01T08:00:00Z'),
        endDate: new Date('2024-01-01T18:00:00Z'),
        includeSystemEvents: true,
        includeDataAccess: true,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.timeline)).toBe(true);
      expect(result.data.totalEvents).toBeGreaterThanOrEqual(0);
      expect(result.data.timelineHash).toBeDefined();
    });

    it('should analyze data access patterns', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.analyzeDataAccessPatterns({
        userId: 'doctor-123',
        analysisType: 'anomaly_detection',
        timeWindow: '30 days',
        includeStatistics: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.patterns).toBeDefined();
      expect(result.data.anomalies).toBeDefined();
      expect(result.data.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.data.recommendations).toBeDefined();
    });

    it('should perform data breach investigation', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.investigateDataBreach({
        incidentId: 'incident-123',
        suspectedStartTime: new Date('2024-01-15T14:30:00Z'),
        suspectedEndTime: new Date('2024-01-15T15:30:00Z'),
        affectedResources: ['patient-123', 'patient-456'],
        investigationType: 'unauthorized_access',
      });

      expect(result.success).toBe(true);
      expect(result.data.investigationId).toBeDefined();
      expect(result.data.affectedRecords).toBeDefined();
      expect(result.data.suspiciousActivities).toBeDefined();
      expect(result.data.evidenceChain).toBeDefined();
    });

    it('should generate forensic evidence report', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.generateForensicReport({
        investigationId: 'investigation-123',
        includeTimeline: true,
        includeEvidence: true,
        includeRecommendations: true,
        reportFormat: 'detailed',
      });

      expect(result.success).toBe(true);
      expect(result.data.reportId).toBeDefined();
      expect(result.data.evidenceCount).toBeGreaterThanOrEqual(0);
      expect(result.data.reportHash).toBeDefined();
      expect(result.data.legalAdmissible).toBeDefined();
    });
  });

  describe('Real-time Audit Streaming', () => {
    it('should start real-time audit stream', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.startAuditStream({
        streamId: 'stream-123',
        filters: {
          severity: ['high', 'critical'],
          eventTypes: ['security_event', 'compliance_violation'],
          userId: 'doctor-123',
        },
        destination: 'websocket',
      });

      expect(result.success).toBe(true);
      expect(result.data.streamId).toBe('stream-123');
      expect(result.data.isActive).toBe(true);
      expect(result.data.filterCount).toBeGreaterThan(0);
    });

    it('should stop audit stream', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.stopAuditStream('stream-123');

      expect(result.success).toBe(true);
      expect(result.data.streamId).toBe('stream-123');
      expect(result.data.isActive).toBe(false);
      expect(result.data.finalEventCount).toBeGreaterThanOrEqual(0);
    });

    it('should configure audit alerts', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.configureAuditAlerts({
        alertId: 'alert-123',
        name: 'Acesso Suspeito de Dados',
        conditions: {
          eventType: 'suspicious_access_pattern',
          severity: 'high',
          threshold: 5,
          timeWindow: '5 minutes',
        },
        actions: ['email', 'sms', 'webhook'],
        recipients: ['admin@neonpro.com', 'security@neonpro.com'],
      });

      expect(result.success).toBe(true);
      expect(result.data.alertId).toBe('alert-123');
      expect(result.data.isActive).toBe(true);
      expect(Array.isArray(result.data.actions)).toBe(true);
    });

    it('should list active audit streams', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.listActiveStreams();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.streams)).toBe(true);
      expect(result.data.totalActive).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Integrity Verification', () => {
    it('should verify audit log integrity', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.verifyAuditLogIntegrity({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        includeHashChain: true,
        verifySignatures: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.integrityScore).toBeGreaterThanOrEqual(0);
      expect(result.data.integrityScore).toBeLessThanOrEqual(100);
      expect(result.data.tamperedRecords).toBeDefined();
      expect(result.data.hashChainValid).toBeDefined();
    });

    it('should detect tampered audit records', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.detectTamperedRecords({
        auditIds: ['audit-123', 'audit-456', 'audit-789'],
        verificationMethod: 'hash_comparison',
        includeDetails: true,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.tamperedRecords)).toBe(true);
      expect(result.data.integrityViolations).toBeDefined();
      expect(result.data.verificationTimestamp).toBeDefined();
    });

    it('should create audit log backup', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.createAuditLogBackup({
        backupId: 'backup-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        compressionEnabled: true,
        encryptionEnabled: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.backupId).toBe('backup-123');
      expect(result.data.recordCount).toBeGreaterThanOrEqual(0);
      expect(result.data.backupSize).toBeDefined();
      expect(result.data.backupHash).toBeDefined();
    });

    it('should restore audit logs from backup', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.restoreAuditLogsFromBackup({
        backupId: 'backup-123',
        targetDate: new Date('2024-01-15'),
        verifyIntegrity: true,
        overwriteExisting: false,
      });

      expect(result.success).toBe(true);
      expect(result.data.restoredRecords).toBeGreaterThanOrEqual(0);
      expect(result.data.integrityVerified).toBe(true);
      expect(result.data.restoreTimestamp).toBeDefined();
    });
  });

  describe('Database Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      // Mock database error
      const result = await service.logActivity({
        userId: 'test-user',
        action: 'test_action',
        resourceType: 'test',
        resourceId: 'test-123',
        simulateDbError: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro de conexão com banco de dados');
    });

    it('should validate database schema', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.validateDatabaseSchema();

      expect(result.success).toBe(true);
      expect(result.data.schemaValid).toBe(true);
      expect(result.data.tablesExist).toBeDefined();
      expect(result.data.indexesOptimal).toBeDefined();
    });

    it('should perform database maintenance', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.performDatabaseMaintenance({
        operation: 'cleanup_old_logs',
        retentionDays: 2555, // 7 years for medical records
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.recordsToDelete).toBeGreaterThanOrEqual(0);
      expect(result.data.spaceToReclaim).toBeDefined();
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid audit log parameters', async () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const result = await service.logActivity({
        userId: '',
        action: '',
        resourceType: '',
        resourceId: '',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate service configuration', () => {
      const { AuditService } = require('../audit-service');
      const service = new AuditService();

      const config = service.getServiceConfiguration();

      expect(config.databaseConnection).toBeDefined();
      expect(config.retentionPolicies).toBeDefined();
      expect(config.securitySettings).toBeDefined();
      expect(config.complianceFrameworks).toBeDefined();
    });
  });
});
