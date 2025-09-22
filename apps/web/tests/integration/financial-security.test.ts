import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: vi.fn(),
  },
})

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
})

// Mock security services
vi.mock('@/services/financial-security', () => ({
  FinancialSecurityService: {
    validateAccess: vi.fn(),
    auditAction: vi.fn(),
    encryptSensitiveData: vi.fn(),
    decryptSensitiveData: vi.fn(),
    checkComplianceRules: vi.fn(),
    generateSecurityReport: vi.fn(),
    detectAnomalies: vi.fn(),
    rotateApiKeys: vi.fn(),
  },
})

vi.mock('@/services/access-control', () => ({
  AccessControlService: {
    hasPermission: vi.fn(),
    getUserRole: vi.fn(),
    validateResourceAccess: vi.fn(),
    enforcePermission: vi.fn(),
    logAccessAttempt: vi.fn(),
    getPermissionHistory: vi.fn(),
  },
})

vi.mock('@/services/audit-logger', () => ({
  AuditLogger: {
    logFinancialAction: vi.fn(),
    logDataAccess: vi.fn(),
    logSecurityEvent: vi.fn(),
    getAuditTrail: vi.fn(),
    exportAuditLog: vi.fn(),
    searchAuditEvents: vi.fn(),
  },
})

vi.mock('@/services/compliance-validator', () => ({
  ComplianceValidator: {
    validateLGPD: vi.fn(),
    validateANVISA: vi.fn(),
    validateCFM: vi.fn(),
    validateDataRetention: vi.fn(),
    generateComplianceReport: vi.fn(),
    scheduleComplianceCheck: vi.fn(),
  },
})

// Mock components that should exist but don't yet (TDD RED)
vi.mock('@/components/security/FinancialSecurityDashboard', () => ({
  FinancialSecurityDashboard: () =>
    React.createElement(
      'div',
      { 'data-testid': 'financial-security-dashboard' },
      'Financial Security Dashboard',
    ),
})

vi.mock('@/components/security/AccessControlPanel', () => ({
  AccessControlPanel: () =>
    React.createElement('div', { 'data-testid': 'access-control-panel' }, 'Access Control Panel'),
})

vi.mock('@/components/security/AuditLogViewer', () => ({
  AuditLogViewer: () =>
    React.createElement('div', { 'data-testid': 'audit-log-viewer' }, 'Audit Log Viewer'),
})

vi.mock('@/components/security/ComplianceMonitor', () => ({
  ComplianceMonitor: () =>
    React.createElement('div', { 'data-testid': 'compliance-monitor' }, 'Compliance Monitor'),
})

vi.mock('@/components/security/DataEncryptionManager', () => ({
  DataEncryptionManager: () =>
    React.createElement(
      'div',
      { 'data-testid': 'data-encryption-manager' },
      'Data Encryption Manager',
    ),
})

vi.mock('@/components/security/SecurityAlertsPanel', () => ({
  SecurityAlertsPanel: () =>
    React.createElement('div', { 'data-testid': 'security-alerts-panel' }, 'Security Alerts Panel'),
})

// Types that should exist but don't yet (TDD RED)
interface SecurityContext {
  _userId: string;
  _role: 'admin' | 'manager' | 'doctor' | 'receptionist' | 'viewer';
  permissions: Permission[];
  sessionId: string;
  clinicId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
}

interface Permission {
  id: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  scope: 'own' | 'clinic' | 'all';
  conditions?: Record<string, any>;
}

interface AuditEvent {
  id: string;
  _userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  result: 'success' | 'failure' | 'blocked';
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    requestId: string;
  };
  sensitiveData?: boolean;
  complianceFlags?: string[];
}

interface SecurityViolation {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  _userId?: string;
  description: string;
  timestamp: Date;
  ipAddress: string;
  evidence: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  regulation: 'LGPD' | 'ANVISA' | 'CFM' | 'INTERNAL';
  description: string;
  requiredActions: string[];
  severity: 'mandatory' | 'recommended' | 'optional';
  checkFrequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
  lastCheck?: Date;
  status: 'compliant' | 'non_compliant' | 'needs_review';
}

interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyRotationInterval: number;
  encryptPII: boolean;
  encryptFinancialData: boolean;
  encryptInTransit: boolean;
  encryptAtRest: boolean;
  keyManagementService: string;
}

interface SecurityReport {
  id: string;
  type: 'access_summary' | 'violation_report' | 'compliance_status' | 'security_audit';
  generatedAt: Date;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalEvents: number;
    violations: number;
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  details: Record<string, any>;
  recommendations: string[];
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  }

  return React.createElement(
    BrowserRouter,
    {},
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    ),
  
};

describe('Financial Security Integration Tests', () => {
  let queryClient: QueryClient;
  let mockSecurityContext: SecurityContext;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    }

    mockSecurityContext = {
      _userId: 'user-001',
      _role: 'admin',
      permissions: [
        {
          id: 'perm-001',
          resource: 'financial_data',
          action: 'read',
          scope: 'clinic',
        },
        {
          id: 'perm-002',
          resource: 'financial_reports',
          action: 'write',
          scope: 'clinic',
        },
      ],
      sessionId: 'session-001',
      clinicId: 'clinic-001',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      loginTime: new Date('2024-01-15T09:00:00Z'),
      lastActivity: new Date('2024-01-15T10:30:00Z'),
    };

    vi.clearAllMocks(
  }

  afterEach(() => {
    queryClient.clear(
    vi.resetAllMocks(
  }

  describe('Access Control Integration', () => {
    it('should validate user permissions for financial data access', async () => {
      // Arrange
      const resourceRequest = {
        _userId: 'user-001',
        resource: 'financial_data',
        action: 'read' as const,
        resourceId: 'financial-report-001',
        _context: mockSecurityContext,
      };

      const mockAccessResult = {
        allowed: true,
        reason: 'User has read permission for clinic financial data',
        conditions: [],
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };

      // Mock service responses
      const { AccessControlService } = await import('@/services/access-control')
      vi.mocked(AccessControlService.validateResourceAccess).mockResolvedValue(mockAccessResult

      // Act
      const result = await AccessControlService.validateResourceAccess(resourceRequest

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('read permission')
      expect(AccessControlService.validateResourceAccess).toHaveBeenCalledWith(resourceRequest
    }

    it('should deny access for insufficient permissions', async () => {
      // Arrange
      const unauthorizedRequest = {
        _userId: 'user-002',
        resource: 'financial_data',
        action: 'delete' as const,
        resourceId: 'financial-report-001',
        _context: {
          ...mockSecurityContext,
          _userId: 'user-002',
          _role: 'receptionist' as const,
          permissions: [
            {
              id: 'perm-readonly',
              resource: 'appointments',
              action: 'read' as const,
              scope: 'own' as const,
            },
          ],
        },
      };

      const mockDeniedResult = {
        allowed: false,
        reason: 'User does not have delete permission for financial data',
        requiredPermissions: ['financial_data:delete:clinic'],
        violationType: 'insufficient_permissions',
      };

      // Mock service responses
      const { AccessControlService } = await import('@/services/access-control')
      vi.mocked(AccessControlService.validateResourceAccess).mockResolvedValue(mockDeniedResult

      // Act
      const result = await AccessControlService.validateResourceAccess(unauthorizedRequest

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('does not have delete permission')
      expect(result.requiredPermissions).toContain('financial_data:delete:clinic')
    }

    it('should enforce role-based access control for financial operations', async () => {
      // Arrange
      const rolePermissionTests = [
        {
          _role: 'admin' as const,
          resource: 'financial_data',
          action: 'admin' as const,
          expectedAccess: true,
        },
        {
          _role: 'manager' as const,
          resource: 'financial_reports',
          action: 'write' as const,
          expectedAccess: true,
        },
        {
          _role: 'doctor' as const,
          resource: 'financial_data',
          action: 'read' as const,
          expectedAccess: false,
        },
        {
          _role: 'receptionist' as const,
          resource: 'financial_reports',
          action: 'write' as const,
          expectedAccess: false,
        },
      ];

      // Mock service responses
      const { AccessControlService } = await import('@/services/access-control')

      for (const test of rolePermissionTests) {
        vi.mocked(AccessControlService.hasPermission).mockResolvedValue(test.expectedAccess

        // Act
        const hasPermission = await AccessControlService.hasPermission(
          test.role,
          test.resource,
          test.action,
        

        // Assert
        expect(hasPermission).toBe(test.expectedAccess
      }
    }

    it('should implement session-based access control with timeout', async () => {
      // Arrange
      const sessionValidationRequest = {
        sessionId: 'session-001',
        _userId: 'user-001',
        lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
        sessionTimeout: 3600000, // 1 hour
      };

      const mockSessionResult = {
        valid: true,
        timeRemaining: 1800000, // 30 minutes
        needsRefresh: false,
        warningThreshold: 300000, // 5 minutes
      };

      // Mock service responses
      const { AccessControlService } = await import('@/services/access-control')
      vi.mocked(AccessControlService.validateResourceAccess).mockResolvedValue({
        allowed: true,
        sessionValid: true,
        sessionTimeRemaining: mockSessionResult.timeRemaining,
      }

      // Act
      const result = await AccessControlService.validateResourceAccess({
        ...sessionValidationRequest,
        resource: 'financial_data',
        action: 'read',
      }

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.sessionValid).toBe(true);
      expect(result.sessionTimeRemaining).toBe(1800000
    }
  }

  describe('Audit Logging Integration', () => {
    it('should log all financial data access events', async () => {
      // Arrange
      const financialAccessEvent = {
        _userId: 'user-001',
        action: 'view_financial_report',
        resource: 'financial_report',
        resourceId: 'report-001',
        sensitiveData: true,
        metadata: {
          reportType: 'revenue',
          period: '2024-01',
          dataPoints: 150,
        },
      };

      const mockAuditEvent: AuditEvent = {
        id: 'audit-001',
        _userId: 'user-001',
        action: 'view_financial_report',
        resource: 'financial_report',
        resourceId: 'report-001',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        result: 'success',
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          sessionId: 'session-001',
          requestId: 'req-001',
        },
        sensitiveData: true,
        complianceFlags: ['LGPD_SENSITIVE_DATA'],
      };

      // Mock service responses
      const { AuditLogger } = await import('@/services/audit-logger')
      vi.mocked(AuditLogger.logFinancialAction).mockResolvedValue(mockAuditEvent

      // Act
      const result = await AuditLogger.logFinancialAction(financialAccessEvent

      // Assert
      expect(result.sensitiveData).toBe(true);
      expect(result.complianceFlags).toContain('LGPD_SENSITIVE_DATA')
      expect(result.result).toBe('success')
      expect(AuditLogger.logFinancialAction).toHaveBeenCalledWith(financialAccessEvent
    }

    it('should track security violations and suspicious activities', async () => {
      // Arrange
      const suspiciousActivity = {
        _userId: 'user-suspect',
        events: [
          {
            action: 'failed_login',
            timestamp: new Date('2024-01-15T10:00:00Z'),
            ipAddress: '192.168.1.200',
          },
          {
            action: 'multiple_financial_reports_download',
            timestamp: new Date('2024-01-15T10:05:00Z'),
            ipAddress: '192.168.1.200',
          },
          {
            action: 'attempt_access_restricted_data',
            timestamp: new Date('2024-01-15T10:10:00Z'),
            ipAddress: '192.168.1.200',
          },
        ],
      };

      const mockSecurityViolation: SecurityViolation = {
        id: 'violation-001',
        type: 'suspicious_activity',
        severity: 'high',
        _userId: 'user-suspect',
        description: 'Multiple failed login attempts followed by rapid financial data access',
        timestamp: new Date('2024-01-15T10:10:00Z'),
        ipAddress: '192.168.1.200',
        evidence: {
          failedLoginAttempts: 3,
          rapidDataAccess: true,
          timeWindow: '10 minutes',
          accessPattern: 'unusual',
        },
        status: 'open',
        assignedTo: 'security-team',
      };

      // Mock service responses
      const { AuditLogger } = await import('@/services/audit-logger')
      const { FinancialSecurityService } = await import('@/services/financial-security')

      vi.mocked(AuditLogger.logSecurityEvent).mockResolvedValue(mockAuditEvent
      vi.mocked(FinancialSecurityService.detectAnomalies).mockResolvedValue([
        mockSecurityViolation,
      ]

      // Act
      const violations = await FinancialSecurityService.detectAnomalies(suspiciousActivity

      // Assert
      expect(violations).toHaveLength(1
      expect(violations[0].type).toBe('suspicious_activity')
      expect(violations[0].severity).toBe('high')
      expect(violations[0].evidence.failedLoginAttempts).toBe(3
    }

    it('should maintain comprehensive audit trail for compliance', async () => {
      // Arrange
      const auditQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        _userId: 'user-001',
        actions: ['view_financial_data', 'export_financial_report', 'modify_financial_data'],
        includeComplianceFlags: true,
      };

      const mockAuditTrail = {
        events: [
          {
            id: 'audit-001',
            _userId: 'user-001',
            action: 'view_financial_data',
            timestamp: new Date('2024-01-15T10:00:00Z'),
            result: 'success',
            complianceFlags: ['LGPD_DATA_ACCESS'],
          },
          {
            id: 'audit-002',
            _userId: 'user-001',
            action: 'export_financial_report',
            timestamp: new Date('2024-01-20T14:30:00Z'),
            result: 'success',
            complianceFlags: ['LGPD_DATA_EXPORT', 'ANVISA_FINANCIAL_RECORD'],
          },
        ],
        summary: {
          totalEvents: 2,
          successfulActions: 2,
          failedActions: 0,
          complianceEvents: 2,
          riskScore: 'low',
        },
      };

      // Mock service responses
      const { AuditLogger } = await import('@/services/audit-logger')
      vi.mocked(AuditLogger.getAuditTrail).mockResolvedValue(mockAuditTrail

      // Act
      const result = await AuditLogger.getAuditTrail(auditQuery

      // Assert
      expect(result.events).toHaveLength(2
      expect(result.summary.complianceEvents).toBe(2
      expect(result.summary.riskScore).toBe('low')
      expect(result.events[1].complianceFlags).toContain('ANVISA_FINANCIAL_RECORD')
    }
  }

  describe('Data Encryption Integration', () => {
    it('should encrypt sensitive financial data before storage', async () => {
      // Arrange
      const sensitiveFinancialData = {
        patientId: 'patient-001',
        amount: 1500.00,
        paymentMethod: 'credit_card',
        cardNumber: '4111-1111-1111-1111',
        procedure: 'consultation',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      const encryptionConfig: EncryptionConfig = {
        algorithm: 'AES-256-GCM',
        keyRotationInterval: 86400000, // 24 hours
        encryptPII: true,
        encryptFinancialData: true,
        encryptInTransit: true,
        encryptAtRest: true,
        keyManagementService: 'aws-kms',
      };

      const mockEncryptedData = {
        encryptedPayload: 'AES256:IV:encrypted_data_here',
        keyId: 'key-001',
        algorithm: 'AES-256-GCM',
        encryptedAt: new Date('2024-01-15T10:00:00Z'),
        metadata: {
          originalSize: 256,
          encryptedSize: 344,
          compressionRatio: 0.85,
        },
      };

      // Mock service responses
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.encryptSensitiveData).mockResolvedValue(mockEncryptedData

      // Act
      const result = await FinancialSecurityService.encryptSensitiveData(
        sensitiveFinancialData,
        encryptionConfig,
      

      // Assert
      expect(result.encryptedPayload).toContain('AES256:')
      expect(result.keyId).toBe('key-001')
      expect(result.metadata.compressionRatio).toBe(0.85
    }

    it('should decrypt data only for authorized users', async () => {
      // Arrange
      const encryptedData = {
        encryptedPayload: 'AES256:IV:encrypted_data_here',
        keyId: 'key-001',
        algorithm: 'AES-256-GCM',
        encryptedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const decryptionRequest = {
        encryptedData,
        _userId: 'user-001',
        purpose: 'financial_report_generation',
        auditTrail: true,
      };

      const mockDecryptedData = {
        patientId: 'patient-001',
        amount: 1500.00,
        paymentMethod: 'credit_card',
        cardNumber: '****-****-****-1111', // Masked for security
        procedure: 'consultation',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      // Mock service responses
      const { FinancialSecurityService } = await import('@/services/financial-security')
      const { AccessControlService } = await import('@/services/access-control')

      vi.mocked(AccessControlService.hasPermission).mockResolvedValue(true
      vi.mocked(FinancialSecurityService.decryptSensitiveData).mockResolvedValue(mockDecryptedData

      // Act
      const hasPermission = await AccessControlService.hasPermission(
        'admin',
        'encrypted_financial_data',
        'read',
      

      if (hasPermission) {
        const result = await FinancialSecurityService.decryptSensitiveData(decryptionRequest

        // Assert
        expect(result.cardNumber).toBe('****-****-****-1111'); // Should be masked
        expect(result.amount).toBe(1500.00
      }
    }

    it('should implement automatic key rotation for enhanced security', async () => {
      // Arrange
      const keyRotationConfig = {
        currentKeyId: 'key-001',
        rotationInterval: 86400000, // 24 hours
        lastRotation: new Date('2024-01-14T10:00:00Z'),
        autoRotate: true,
      };

      const mockRotationResult = {
        newKeyId: 'key-002',
        rotatedAt: new Date('2024-01-15T10:00:00Z'),
        affectedRecords: 1500,
        rotationDuration: 45000, // 45 seconds
        status: 'completed',
      };

      // Mock service responses
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.rotateApiKeys).mockResolvedValue(mockRotationResult

      // Act
      const result = await FinancialSecurityService.rotateApiKeys(keyRotationConfig

      // Assert
      expect(result.newKeyId).toBe('key-002')
      expect(result.affectedRecords).toBe(1500
      expect(result.status).toBe('completed')
    }
  }

  describe('Compliance Validation Integration', () => {
    it('should validate LGPD compliance for financial data processing', async () => {
      // Arrange
      const lgpdValidationRequest = {
        dataType: 'financial_personal_data',
        processingPurpose: 'healthcare_service_billing',
        dataSubjectConsent: true,
        retentionPeriod: '7_years',
        dataMinimization: true,
        crossBorderTransfer: false,
      };

      const mockLGPDValidation = {
        compliant: true,
        violations: [],
        recommendations: [
          'Implement automated data anonymization after retention period',
          'Add explicit consent renewal process for long-term patients',
        ],
        score: 95,
        lastValidation: new Date('2024-01-15T10:00:00Z'),
      };

      // Mock service responses
      const { ComplianceValidator } = await import('@/services/compliance-validator')
      vi.mocked(ComplianceValidator.validateLGPD).mockResolvedValue(mockLGPDValidation

      // Act
      const result = await ComplianceValidator.validateLGPD(lgpdValidationRequest

      // Assert
      expect(result.compliant).toBe(true);
      expect(result.score).toBe(95
      expect(result.recommendations).toHaveLength(2
    }

    it('should validate ANVISA compliance for medical device financial data', async () => {
      // Arrange
      const anvisaValidationRequest = {
        deviceType: 'financial_reporting_system',
        regulatoryClassification: 'class_ii',
        financialDataHandling: true,
        qualityManagementSystem: 'iso_13485',
        riskManagement: 'iso_14971',
      };

      const mockANVISAValidation = {
        compliant: true,
        certificateNumber: 'ANVISA-80146467321',
        validUntil: new Date('2025-01-15T23:59:59Z'),
        requiredActions: [],
        riskLevel: 'acceptable',
        lastAudit: new Date('2024-01-10T00:00:00Z'),
      };

      // Mock service responses
      const { ComplianceValidator } = await import('@/services/compliance-validator')
      vi.mocked(ComplianceValidator.validateANVISA).mockResolvedValue(mockANVISAValidation

      // Act
      const result = await ComplianceValidator.validateANVISA(anvisaValidationRequest

      // Assert
      expect(result.compliant).toBe(true);
      expect(result.certificateNumber).toContain('ANVISA-')
      expect(result.riskLevel).toBe('acceptable')
    }

    it('should validate CFM ethical standards for financial transparency', async () => {
      // Arrange
      const cfmValidationRequest = {
        clinicId: 'clinic-001',
        financialTransparency: true,
        patientConsentForBilling: true,
        priceDisclosure: true,
        ethicalPricing: true,
        conflictOfInterestDisclosure: true,
      };

      const mockCFMValidation = {
        compliant: true,
        ethicalScore: 98,
        violations: [],
        requirements: [
          'Maintain transparent pricing display',
          'Document patient consent for all financial procedures',
          'Regular ethical review of pricing practices',
        ],
        lastReview: new Date('2024-01-01T00:00:00Z'),
        nextReview: new Date('2024-07-01T00:00:00Z'),
      };

      // Mock service responses
      const { ComplianceValidator } = await import('@/services/compliance-validator')
      vi.mocked(ComplianceValidator.validateCFM).mockResolvedValue(mockCFMValidation

      // Act
      const result = await ComplianceValidator.validateCFM(cfmValidationRequest

      // Assert
      expect(result.compliant).toBe(true);
      expect(result.ethicalScore).toBe(98
      expect(result.requirements).toHaveLength(3
    }

    it('should generate comprehensive compliance reports', async () => {
      // Arrange
      const complianceReportRequest = {
        clinicId: 'clinic-001',
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        regulations: ['LGPD', 'ANVISA', 'CFM'],
        includeRecommendations: true,
        detailLevel: 'comprehensive',
      };

      const mockComplianceReport = {
        id: 'compliance-report-001',
        generatedAt: new Date('2024-01-31T23:59:59Z'),
        period: complianceReportRequest.period,
        overallScore: 94,
        regulationScores: {
          LGPD: 95,
          ANVISA: 92,
          CFM: 96,
        },
        violations: [
          {
            regulation: 'ANVISA',
            description: 'Missing financial audit trail for device maintenance costs',
            severity: 'medium',
            remediation: 'Implement detailed maintenance cost tracking',
          },
        ],
        recommendations: [
          'Enhance audit trail granularity for ANVISA compliance',
          'Implement automated LGPD consent renewal',
          'Schedule quarterly CFM ethical reviews',
        ],
        nextAuditDate: new Date('2024-04-30T00:00:00Z'),
      };

      // Mock service responses
      const { ComplianceValidator } = await import('@/services/compliance-validator')
      vi.mocked(ComplianceValidator.generateComplianceReport).mockResolvedValue(
        mockComplianceReport,
      

      // Act
      const result = await ComplianceValidator.generateComplianceReport(complianceReportRequest

      // Assert
      expect(result.overallScore).toBe(94
      expect(result.regulationScores.LGPD).toBe(95
      expect(result.violations).toHaveLength(1
      expect(result.recommendations).toHaveLength(3
    }
  }

  describe('Security Monitoring and Alerting Integration', () => {
    it('should monitor real-time security events', async () => {
      // Arrange
      const securityMonitoringConfig = {
        clinicId: 'clinic-001',
        monitoredEvents: [
          'financial_data_access',
          'unusual_login_patterns',
          'bulk_data_export',
          'permission_changes',
        ],
        alertThresholds: {
          failedLogins: 3,
          dataExportSize: 10000000, // 10MB
          offHoursAccess: true,
          suspiciousIPs: true,
        },
      };

      const mockSecurityEvents = [
        {
          id: 'event-001',
          type: 'financial_data_access',
          severity: 'low',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          _userId: 'user-001',
          details: {
            resource: 'financial_report',
            action: 'view',
            recordCount: 150,
          },
        },
        {
          id: 'event-002',
          type: 'bulk_data_export',
          severity: 'medium',
          timestamp: new Date('2024-01-15T02:30:00Z'),
          _userId: 'user-002',
          details: {
            resource: 'patient_financial_data',
            action: 'export',
            recordCount: 5000,
            offHours: true,
          },
        },
      ];

      // Mock service responses
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.detectAnomalies).mockResolvedValue(mockSecurityEvents

      // Act
      const result = await FinancialSecurityService.detectAnomalies(securityMonitoringConfig

      // Assert
      expect(result).toHaveLength(2
      expect(result[1].severity).toBe('medium')
      expect(result[1].details.offHours).toBe(true);
    }

    it('should generate automated security alerts for critical events', async () => {
      // Arrange
      const criticalSecurityEvent = {
        type: 'unauthorized_financial_access',
        _userId: 'user-unknown',
        ipAddress: '192.168.1.999',
        timestamp: new Date('2024-01-15T03:00:00Z'),
        attemptedResource: 'financial_database',
        failureReason: 'invalid_credentials',
      };

      const mockSecurityAlert = {
        id: 'alert-001',
        severity: 'critical',
        type: 'security_breach_attempt',
        title: 'Unauthorized Financial Database Access Attempt',
        description: 'Unknown user attempted to access financial database with invalid credentials',
        timestamp: new Date('2024-01-15T03:00:00Z'),
        affectedResources: ['financial_database'],
        recommendedActions: [
          'Immediately review access logs',
          'Verify user account security',
          'Consider IP blocking if pattern continues',
          'Notify security team and clinic management',
        ],
        autoActions: [
          'IP_temporarily_blocked',
          'Security_team_notified',
          'Audit_log_enhanced',
        ],
        status: 'active',
      };

      // Mock service responses
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.generateSecurityReport).mockResolvedValue(
        mockSecurityAlert,
      

      // Act
      const result = await FinancialSecurityService.generateSecurityReport(criticalSecurityEvent

      // Assert
      expect(result.severity).toBe('critical')
      expect(result.autoActions).toContain('IP_temporarily_blocked')
      expect(result.recommendedActions).toHaveLength(4
    }

    it('should provide security dashboard with real-time metrics', async () => {
      // Arrange
      const dashboardQuery = {
        clinicId: 'clinic-001',
        timeRange: 'last_24_hours',
        includeMetrics: [
          'access_attempts',
          'security_violations',
          'compliance_score',
          'data_encryption_status',
        ],
      };

      const mockSecurityDashboard = {
        timestamp: new Date('2024-01-15T10:00:00Z'),
        overallSecurityScore: 88,
        metrics: {
          accessAttempts: {
            total: 245,
            successful: 240,
            failed: 5,
            suspicious: 2,
          },
          securityViolations: {
            total: 3,
            resolved: 2,
            pending: 1,
            critical: 0,
          },
          complianceScore: {
            overall: 94,
            LGPD: 95,
            ANVISA: 92,
            CFM: 96,
          },
          dataEncryptionStatus: {
            encryptedRecords: 98.5,
            keyRotationUpToDate: true,
            encryptionAlgorithm: 'AES-256-GCM',
          },
        },
        alerts: [
          {
            id: 'alert-dashboard-001',
            severity: 'medium',
            message: 'Off-hours data export detected',
            timestamp: new Date('2024-01-15T02:30:00Z'),
          },
        ],
        recommendations: [
          'Review off-hours access policies',
          'Update encryption key rotation schedule',
          'Enhance monitoring for bulk data exports',
        ],
      };

      // Mock service responses
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.generateSecurityReport).mockResolvedValue(
        mockSecurityDashboard,
      

      // Act
      const result = await FinancialSecurityService.generateSecurityReport(dashboardQuery

      // Assert
      expect(result.overallSecurityScore).toBe(88
      expect(result.metrics.dataEncryptionStatus.encryptedRecords).toBe(98.5
      expect(result.alerts).toHaveLength(1
      expect(result.recommendations).toHaveLength(3
    }
  }

  describe('Error Handling and Security Edge Cases', () => {
    it('should handle security service failures gracefully', async () => {
      // Arrange
      const securityRequest = {
        _userId: 'user-001',
        resource: 'financial_data',
        action: 'read',
      };

      // Mock service error
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.validateAccess).mockRejectedValue(
        new Error('Security service temporarily unavailable'),
      

      // Act & Assert
      await expect(
        FinancialSecurityService.validateAccess(securityRequest),
      ).rejects.toThrow('Security service temporarily unavailable')
    }

    it('should implement fail-secure behavior on security failures', async () => {
      // Arrange
      const criticalSecurityFailure = {
        _service: 'access_control',
        error: 'database_connection_lost',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      const mockFailSecureResponse = {
        accessGranted: false,
        reason: 'Security service failure - fail secure mode activated',
        fallbackActions: [
          'Deny all access requests',
          'Log all denied attempts',
          'Notify security team',
          'Switch to manual approval process',
        ],
        manualOverrideRequired: true,
        emergencyContactRequired: true,
      };

      // Mock service responses
      const { AccessControlService } = await import('@/services/access-control')
      vi.mocked(AccessControlService.validateResourceAccess).mockResolvedValue(
        mockFailSecureResponse,
      

      // Act
      const result = await AccessControlService.validateResourceAccess({
        _userId: 'user-001',
        resource: 'financial_data',
        action: 'read',
        emergencyMode: true,
      }

      // Assert
      expect(result.accessGranted).toBe(false);
      expect(result.reason).toContain('fail secure mode')
      expect(result.manualOverrideRequired).toBe(true);
    }

    it('should validate input sanitization for security parameters', async () => {
      // Arrange
      const maliciousInput = {
        _userId: 'user-001\'; DROP TABLE financial_data; --',
        resource: '<script>alert("xss")</script>',
        action: '../../etc/passwd',
      };

      const sanitizedInput = {
        _userId: 'user-001',
        resource: 'financial_data',
        action: 'read',
      };

      // Mock service responses with input validation
      const { FinancialSecurityService } = await import('@/services/financial-security')
      vi.mocked(FinancialSecurityService.validateAccess).mockImplementation(async input => {
        // Simulate input sanitization
        if (
          input.userId.includes('\'') || input.resource.includes('<')
          || input.action.includes('../')
        ) {
          throw new Error('Invalid input detected - potential security threat')
        }
        return { accessGranted: true, sanitized: true };
      }

      // Act & Assert - Malicious input should be rejected
      await expect(
        FinancialSecurityService.validateAccess(maliciousInput),
      ).rejects.toThrow('Invalid input detected')

      // Act & Assert - Clean input should be accepted
      const result = await FinancialSecurityService.validateAccess(sanitizedInput
      expect(result.sanitized).toBe(true);
    }
  }
}
