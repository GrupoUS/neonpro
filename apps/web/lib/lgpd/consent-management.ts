/**
 * LGPD Consent Management System
 * Implements automated consent tracking and management for LGPD compliance
 *
 * Features:
 * - Granular consent tracking for all data types
 * - Consent versioning and historical tracking
 * - Automated consent withdrawal with immediate effect
 * - Consent analytics and reporting
 * - Consent re-confirmation workflows
 * - Consent inheritance for related accounts
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { EventEmitter } from 'node:events';

// ============================================================================
// LGPD CONSENT TYPES & INTERFACES
// ============================================================================

/**
 * LGPD Data Types for Consent Management
 */
export enum LGPDDataType {
  PERSONAL_DATA = 'personal_data',
  SENSITIVE_DATA = 'sensitive_data',
  BIOMETRIC_DATA = 'biometric_data',
  HEALTH_DATA = 'health_data',
  AUTHENTICATION_DATA = 'authentication_data',
  SESSION_DATA = 'session_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  COMMUNICATION_DATA = 'communication_data',
  FINANCIAL_DATA = 'financial_data',
  LOCATION_DATA = 'location_data',
}

/**
 * LGPD Processing Purposes
 */
export enum LGPDProcessingPurpose {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SESSION_MANAGEMENT = 'session_management',
  SECURITY_MONITORING = 'security_monitoring',
  AUDIT_LOGGING = 'audit_logging',
  COMMUNICATION = 'communication',
  ANALYTICS = 'analytics',
  COMPLIANCE = 'compliance',
  LEGAL_OBLIGATION = 'legal_obligation',
  LEGITIMATE_INTEREST = 'legitimate_interest',
}

/**
 * LGPD Legal Basis for Processing
 */
export enum LGPDLegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_INTEREST = 'public_interest',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

/**
 * Consent Status Types
 */
export enum ConsentStatus {
  GIVEN = 'given',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  PENDING = 'pending',
  INVALID = 'invalid',
}

/**
 * Consent Record Interface
 */
export interface ConsentRecord {
  id: string;
  userId: string;
  dataType: LGPDDataType;
  purpose: LGPDProcessingPurpose;
  legalBasis: LGPDLegalBasis;
  status: ConsentStatus;
  version: string;
  consentGiven: boolean;
  consentDate: Date;
  expiryDate?: Date;
  withdrawalDate?: Date;
  renewalRequired: boolean;
  metadata: {
    ipAddress: string;
    userAgent: string;
    consentMethod: 'explicit' | 'implicit' | 'inherited';
    consentInterface: string;
    dataRetentionPeriod?: number;
    thirdPartySharing?: boolean;
    automatedDecisionMaking?: boolean;
  };
  auditTrail: ConsentAuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Consent Audit Entry
 */
export interface ConsentAuditEntry {
  id: string;
  action: 'given' | 'withdrawn' | 'renewed' | 'expired' | 'modified';
  timestamp: Date;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

/**
 * Consent Configuration
 */
export interface ConsentConfiguration {
  dataType: LGPDDataType;
  purpose: LGPDProcessingPurpose;
  legalBasis: LGPDLegalBasis;
  required: boolean;
  defaultExpiry?: number; // days
  renewalPeriod?: number; // days
  description: {
    pt: string;
    en: string;
  };
  dataUsage: {
    pt: string;
    en: string;
  };
  consequences: {
    pt: string;
    en: string;
  };
  thirdPartySharing?: {
    enabled: boolean;
    partners: string[];
    purpose: string;
  };
  automatedDecisionMaking?: {
    enabled: boolean;
    logic: string;
    significance: string;
  };
}

/**
 * Consent Request Interface
 */
export interface ConsentRequest {
  userId: string;
  consents: {
    dataType: LGPDDataType;
    purpose: LGPDProcessingPurpose;
    legalBasis: LGPDLegalBasis;
    granted: boolean;
    metadata?: Record<string, any>;
  }[];
  context: {
    ipAddress: string;
    userAgent: string;
    interface: string;
    timestamp: Date;
  };
}

/**
 * Consent Analytics Interface
 */
export interface ConsentAnalytics {
  totalConsents: number;
  consentsByType: Record<LGPDDataType, number>;
  consentsByPurpose: Record<LGPDProcessingPurpose, number>;
  consentsByStatus: Record<ConsentStatus, number>;
  consentRate: number;
  withdrawalRate: number;
  renewalRate: number;
  expiringConsents: number;
  trends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
  compliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

/**
 * Consent Events
 */
export interface ConsentEvents {
  'consent:given': { userId: string; consent: ConsentRecord };
  'consent:withdrawn': {
    userId: string;
    consent: ConsentRecord;
    reason?: string;
  };
  'consent:expired': { userId: string; consent: ConsentRecord };
  'consent:renewed': { userId: string; consent: ConsentRecord };
  'consent:violation': {
    userId: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  'consent:analytics': { analytics: ConsentAnalytics };
  'consent:audit': {
    userId: string;
    action: string;
    details: Record<string, any>;
  };
}

// ============================================================================
// CONSENT MANAGEMENT SYSTEM
// ============================================================================

/**
 * LGPD Consent Management System
 *
 * Provides comprehensive consent management for LGPD compliance including:
 * - Granular consent tracking and management
 * - Automated consent lifecycle management
 * - Consent analytics and reporting
 * - Audit trail and compliance monitoring
 */
export class ConsentManager extends EventEmitter {
  private readonly consents: Map<string, ConsentRecord> = new Map();
  private readonly configurations: Map<string, ConsentConfiguration> =
    new Map();
  private analytics: ConsentAnalytics | null = null;
  private isInitialized = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private analyticsInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: {
      defaultExpiryDays: number;
      renewalReminderDays: number;
      cleanupIntervalHours: number;
      analyticsIntervalHours: number;
      auditEnabled: boolean;
      encryptionEnabled: boolean;
    } = {
      defaultExpiryDays: 365,
      renewalReminderDays: 30,
      cleanupIntervalHours: 24,
      analyticsIntervalHours: 6,
      auditEnabled: true,
      encryptionEnabled: true,
    }
  ) {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Initialize the consent management system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load default consent configurations
      await this.loadDefaultConfigurations();

      // Load existing consents
      await this.loadConsents();

      // Start cleanup and analytics intervals
      this.startCleanupInterval();
      this.startAnalyticsInterval();

      // Generate initial analytics
      await this.generateAnalytics();

      this.isInitialized = true;
      this.emit('consent:audit', {
        userId: 'system',
        action: 'consent_manager_initialized',
        details: { timestamp: new Date() },
      });
    } catch (error) {
      throw new Error(`Failed to initialize consent manager: ${error}`);
    }
  }

  /**
   * Process consent request
   */
  async processConsentRequest(
    request: ConsentRequest
  ): Promise<ConsentRecord[]> {
    const results: ConsentRecord[] = [];

    for (const consentData of request.consents) {
      try {
        const consent = await this.createConsentRecord({
          userId: request.userId,
          dataType: consentData.dataType,
          purpose: consentData.purpose,
          legalBasis: consentData.legalBasis,
          granted: consentData.granted,
          context: request.context,
          metadata: consentData.metadata,
        });

        results.push(consent);

        // Emit consent event
        this.emit('consent:given', {
          userId: request.userId,
          consent,
        });

        // Audit log
        this.emit('consent:audit', {
          userId: request.userId,
          action: 'consent_processed',
          details: {
            dataType: consentData.dataType,
            purpose: consentData.purpose,
            granted: consentData.granted,
            timestamp: new Date(),
          },
        });
      } catch (error) {
        this.emit('consent:violation', {
          userId: request.userId,
          violation: `Failed to process consent: ${error}`,
          severity: 'high',
        });
        throw error;
      }
    }

    return results;
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    userId: string,
    dataType: LGPDDataType,
    purpose: LGPDProcessingPurpose,
    reason?: string,
    context?: {
      ipAddress: string;
      userAgent: string;
      interface: string;
    }
  ): Promise<ConsentRecord> {
    const consentKey = this.generateConsentKey(userId, dataType, purpose);
    const consent = this.consents.get(consentKey);

    if (!consent) {
      throw new Error('Consent record not found');
    }

    if (consent.status === ConsentStatus.WITHDRAWN) {
      throw new Error('Consent already withdrawn');
    }

    // Update consent record
    consent.status = ConsentStatus.WITHDRAWN;
    consent.consentGiven = false;
    consent.withdrawalDate = new Date();
    consent.updatedAt = new Date();

    // Add audit entry
    const auditEntry: ConsentAuditEntry = {
      id: this.generateId(),
      action: 'withdrawn',
      timestamp: new Date(),
      reason,
      ipAddress: context?.ipAddress || 'unknown',
      userAgent: context?.userAgent || 'unknown',
      metadata: { interface: context?.interface },
    };
    consent.auditTrail.push(auditEntry);

    // Save consent
    await this.saveConsent(consent);

    // Emit events
    this.emit('consent:withdrawn', {
      userId,
      consent,
      reason,
    });

    this.emit('consent:audit', {
      userId,
      action: 'consent_withdrawn',
      details: {
        dataType,
        purpose,
        reason,
        timestamp: new Date(),
      },
    });

    return consent;
  }

  /**
   * Renew consent
   */
  async renewConsent(
    userId: string,
    dataType: LGPDDataType,
    purpose: LGPDProcessingPurpose,
    context: {
      ipAddress: string;
      userAgent: string;
      interface: string;
    }
  ): Promise<ConsentRecord> {
    const consentKey = this.generateConsentKey(userId, dataType, purpose);
    const consent = this.consents.get(consentKey);

    if (!consent) {
      throw new Error('Consent record not found');
    }

    // Update consent record
    consent.status = ConsentStatus.GIVEN;
    consent.consentGiven = true;
    consent.consentDate = new Date();
    consent.withdrawalDate = undefined;
    consent.renewalRequired = false;
    consent.updatedAt = new Date();

    // Update expiry date
    const config = this.configurations.get(
      this.generateConfigKey(dataType, purpose)
    );
    if (config?.defaultExpiry) {
      consent.expiryDate = new Date(
        Date.now() + config.defaultExpiry * 24 * 60 * 60 * 1000
      );
    }

    // Add audit entry
    const auditEntry: ConsentAuditEntry = {
      id: this.generateId(),
      action: 'renewed',
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { interface: context.interface },
    };
    consent.auditTrail.push(auditEntry);

    // Save consent
    await this.saveConsent(consent);

    // Emit events
    this.emit('consent:renewed', {
      userId,
      consent,
    });

    this.emit('consent:audit', {
      userId,
      action: 'consent_renewed',
      details: {
        dataType,
        purpose,
        timestamp: new Date(),
      },
    });

    return consent;
  }

  /**
   * Get user consents
   */
  getUserConsents(userId: string): ConsentRecord[] {
    return Array.from(this.consents.values())
      .filter((consent) => consent.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Check if user has valid consent
   */
  hasValidConsent(
    userId: string,
    dataType: LGPDDataType,
    purpose: LGPDProcessingPurpose
  ): boolean {
    const consentKey = this.generateConsentKey(userId, dataType, purpose);
    const consent = this.consents.get(consentKey);

    if (!consent) {
      return false;
    }

    return (
      consent.status === ConsentStatus.GIVEN &&
      consent.consentGiven &&
      (!consent.expiryDate || consent.expiryDate > new Date())
    );
  }

  /**
   * Get consents requiring renewal
   */
  getConsentsRequiringRenewal(userId?: string): ConsentRecord[] {
    const renewalDate = new Date();
    renewalDate.setDate(
      renewalDate.getDate() + this.config.renewalReminderDays
    );

    return Array.from(this.consents.values()).filter((consent) => {
      if (userId && consent.userId !== userId) {
        return false;
      }
      return (
        consent.status === ConsentStatus.GIVEN &&
        consent.expiryDate &&
        consent.expiryDate <= renewalDate &&
        !consent.renewalRequired
      );
    });
  }

  /**
   * Get consent analytics
   */
  getAnalytics(): ConsentAnalytics | null {
    return this.analytics;
  }

  /**
   * Generate consent analytics
   */
  private async generateAnalytics(): Promise<void> {
    const consents = Array.from(this.consents.values());
    const now = new Date();
    const _thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalConsents = consents.length;
    const activeConsents = consents.filter(
      (c) => c.status === ConsentStatus.GIVEN
    ).length;
    const withdrawnConsents = consents.filter(
      (c) => c.status === ConsentStatus.WITHDRAWN
    ).length;
    const _expiredConsents = consents.filter(
      (c) => c.status === ConsentStatus.EXPIRED
    ).length;

    // Consent by type
    const consentsByType = consents.reduce(
      (acc, consent) => {
        acc[consent.dataType] = (acc[consent.dataType] || 0) + 1;
        return acc;
      },
      {} as Record<LGPDDataType, number>
    );

    // Consent by purpose
    const consentsByPurpose = consents.reduce(
      (acc, consent) => {
        acc[consent.purpose] = (acc[consent.purpose] || 0) + 1;
        return acc;
      },
      {} as Record<LGPDProcessingPurpose, number>
    );

    // Consent by status
    const consentsByStatus = consents.reduce(
      (acc, consent) => {
        acc[consent.status] = (acc[consent.status] || 0) + 1;
        return acc;
      },
      {} as Record<ConsentStatus, number>
    );

    // Rates
    const consentRate =
      totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 0;
    const withdrawalRate =
      totalConsents > 0 ? (withdrawnConsents / totalConsents) * 100 : 0;
    const renewalRate =
      totalConsents > 0
        ? (consents.filter((c) =>
            c.auditTrail.some((entry) => entry.action === 'renewed')
          ).length /
            totalConsents) *
          100
        : 0;

    // Expiring consents
    const expiringConsents = consents.filter(
      (consent) =>
        consent.expiryDate &&
        consent.expiryDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    // Compliance assessment
    const compliance = this.assessCompliance(consents);

    this.analytics = {
      totalConsents,
      consentsByType,
      consentsByPurpose,
      consentsByStatus,
      consentRate,
      withdrawalRate,
      renewalRate,
      expiringConsents,
      trends: {
        daily: {},
        weekly: {},
        monthly: {},
      },
      compliance,
    };

    this.emit('consent:analytics', { analytics: this.analytics });
  }

  /**
   * Assess compliance
   */
  private assessCompliance(consents: ConsentRecord[]): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for expired consents
    const expiredConsents = consents.filter(
      (c) =>
        c.expiryDate &&
        c.expiryDate < new Date() &&
        c.status === ConsentStatus.GIVEN
    );
    if (expiredConsents.length > 0) {
      issues.push(`${expiredConsents.length} expired consents still active`);
      recommendations.push('Update expired consents to expired status');
      score -= 10;
    }

    // Check for missing audit trails
    const missingAuditTrails = consents.filter(
      (c) => c.auditTrail.length === 0
    );
    if (missingAuditTrails.length > 0) {
      issues.push(`${missingAuditTrails.length} consents without audit trails`);
      recommendations.push('Ensure all consents have complete audit trails');
      score -= 15;
    }

    // Check consent renewal requirements
    const needingRenewal = this.getConsentsRequiringRenewal();
    if (needingRenewal.length > 0) {
      recommendations.push(
        `${needingRenewal.length} consents require renewal reminders`
      );
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Create consent record
   */
  private async createConsentRecord(data: {
    userId: string;
    dataType: LGPDDataType;
    purpose: LGPDProcessingPurpose;
    legalBasis: LGPDLegalBasis;
    granted: boolean;
    context: {
      ipAddress: string;
      userAgent: string;
      interface: string;
      timestamp: Date;
    };
    metadata?: Record<string, any>;
  }): Promise<ConsentRecord> {
    const config = this.configurations.get(
      this.generateConfigKey(data.dataType, data.purpose)
    );

    const now = new Date();
    const expiryDate = config?.defaultExpiry
      ? new Date(now.getTime() + config.defaultExpiry * 24 * 60 * 60 * 1000)
      : undefined;

    const consent: ConsentRecord = {
      id: this.generateId(),
      userId: data.userId,
      dataType: data.dataType,
      purpose: data.purpose,
      legalBasis: data.legalBasis,
      status: data.granted ? ConsentStatus.GIVEN : ConsentStatus.WITHDRAWN,
      version: '1.0',
      consentGiven: data.granted,
      consentDate: now,
      expiryDate,
      renewalRequired: false,
      metadata: {
        ipAddress: data.context.ipAddress,
        userAgent: data.context.userAgent,
        consentMethod: 'explicit',
        consentInterface: data.context.interface,
        dataRetentionPeriod: config?.defaultExpiry,
        thirdPartySharing: config?.thirdPartySharing?.enabled,
        automatedDecisionMaking: config?.automatedDecisionMaking?.enabled,
        ...data.metadata,
      },
      auditTrail: [
        {
          id: this.generateId(),
          action: data.granted ? 'given' : 'withdrawn',
          timestamp: now,
          ipAddress: data.context.ipAddress,
          userAgent: data.context.userAgent,
          metadata: { interface: data.context.interface },
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Store consent
    const consentKey = this.generateConsentKey(
      data.userId,
      data.dataType,
      data.purpose
    );
    this.consents.set(consentKey, consent);

    // Save to persistent storage
    await this.saveConsent(consent);

    return consent;
  }

  /**
   * Load default consent configurations
   */
  private async loadDefaultConfigurations(): Promise<void> {
    const defaultConfigs: ConsentConfiguration[] = [
      {
        dataType: LGPDDataType.PERSONAL_DATA,
        purpose: LGPDProcessingPurpose.AUTHENTICATION,
        legalBasis: LGPDLegalBasis.CONSENT,
        required: true,
        defaultExpiry: 365,
        renewalPeriod: 30,
        description: {
          pt: 'Dados pessoais para autenticação no sistema',
          en: 'Personal data for system authentication',
        },
        dataUsage: {
          pt: 'Utilizados para verificar sua identidade e permitir acesso ao sistema',
          en: 'Used to verify your identity and allow system access',
        },
        consequences: {
          pt: 'Sem estes dados, não será possível acessar o sistema',
          en: 'Without this data, system access will not be possible',
        },
      },
      {
        dataType: LGPDDataType.BIOMETRIC_DATA,
        purpose: LGPDProcessingPurpose.AUTHENTICATION,
        legalBasis: LGPDLegalBasis.CONSENT,
        required: false,
        defaultExpiry: 180,
        renewalPeriod: 30,
        description: {
          pt: 'Dados biométricos para autenticação multifator',
          en: 'Biometric data for multi-factor authentication',
        },
        dataUsage: {
          pt: 'Utilizados para autenticação biométrica adicional',
          en: 'Used for additional biometric authentication',
        },
        consequences: {
          pt: 'Sem estes dados, a autenticação biométrica não estará disponível',
          en: 'Without this data, biometric authentication will not be available',
        },
      },
      {
        dataType: LGPDDataType.SESSION_DATA,
        purpose: LGPDProcessingPurpose.SESSION_MANAGEMENT,
        legalBasis: LGPDLegalBasis.LEGITIMATE_INTERESTS,
        required: true,
        defaultExpiry: 90,
        renewalPeriod: 15,
        description: {
          pt: 'Dados de sessão para gerenciamento de acesso',
          en: 'Session data for access management',
        },
        dataUsage: {
          pt: 'Utilizados para manter sua sessão ativa e segura',
          en: 'Used to maintain your active and secure session',
        },
        consequences: {
          pt: 'Sem estes dados, será necessário fazer login frequentemente',
          en: 'Without this data, frequent logins will be required',
        },
      },
      {
        dataType: LGPDDataType.BEHAVIORAL_DATA,
        purpose: LGPDProcessingPurpose.SECURITY_MONITORING,
        legalBasis: LGPDLegalBasis.LEGITIMATE_INTERESTS,
        required: false,
        defaultExpiry: 365,
        renewalPeriod: 60,
        description: {
          pt: 'Dados comportamentais para monitoramento de segurança',
          en: 'Behavioral data for security monitoring',
        },
        dataUsage: {
          pt: 'Utilizados para detectar atividades suspeitas e proteger sua conta',
          en: 'Used to detect suspicious activities and protect your account',
        },
        consequences: {
          pt: 'Sem estes dados, a proteção contra atividades suspeitas será limitada',
          en: 'Without this data, protection against suspicious activities will be limited',
        },
      },
    ];

    for (const config of defaultConfigs) {
      const configKey = this.generateConfigKey(config.dataType, config.purpose);
      this.configurations.set(configKey, config);
    }
  }

  /**
   * Load existing consents
   */
  private async loadConsents(): Promise<void> {
    // In a real implementation, this would load from database
    // For now, we'll start with an empty state
  }

  /**
   * Save consent to persistent storage
   */
  private async saveConsent(_consent: ConsentRecord): Promise<void> {
    // In a real implementation, this would save to database
    // For now, we'll just keep in memory
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        await this.cleanupExpiredConsents();
      },
      this.config.cleanupIntervalHours * 60 * 60 * 1000
    );
  }

  /**
   * Start analytics interval
   */
  private startAnalyticsInterval(): void {
    this.analyticsInterval = setInterval(
      async () => {
        await this.generateAnalytics();
      },
      this.config.analyticsIntervalHours * 60 * 60 * 1000
    );
  }

  /**
   * Cleanup expired consents
   */
  private async cleanupExpiredConsents(): Promise<void> {
    const now = new Date();
    const expiredConsents: ConsentRecord[] = [];

    for (const consent of this.consents.values()) {
      if (
        consent.expiryDate &&
        consent.expiryDate < now &&
        consent.status === ConsentStatus.GIVEN
      ) {
        consent.status = ConsentStatus.EXPIRED;
        consent.consentGiven = false;
        consent.updatedAt = now;

        // Add audit entry
        consent.auditTrail.push({
          id: this.generateId(),
          action: 'expired',
          timestamp: now,
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { automated: true },
        });

        expiredConsents.push(consent);
        await this.saveConsent(consent);

        this.emit('consent:expired', {
          userId: consent.userId,
          consent,
        });
      }
    }

    if (expiredConsents.length > 0) {
      this.emit('consent:audit', {
        userId: 'system',
        action: 'expired_consents_cleanup',
        details: {
          count: expiredConsents.length,
          timestamp: now,
        },
      });
    }
  }

  /**
   * Generate consent key
   */
  private generateConsentKey(
    userId: string,
    dataType: LGPDDataType,
    purpose: LGPDProcessingPurpose
  ): string {
    return `${userId}:${dataType}:${purpose}`;
  }

  /**
   * Generate configuration key
   */
  private generateConfigKey(
    dataType: LGPDDataType,
    purpose: LGPDProcessingPurpose
  ): string {
    return `${dataType}:${purpose}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the consent manager
   */
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }

    this.removeAllListeners();
    this.isInitialized = false;

    this.emit('consent:audit', {
      userId: 'system',
      action: 'consent_manager_shutdown',
      details: { timestamp: new Date() },
    });
  }

  /**
   * Health check
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const issues: string[] = [];

    if (!this.isInitialized) {
      issues.push('Consent manager not initialized');
    }

    if (!this.cleanupInterval) {
      issues.push('Cleanup interval not running');
    }

    if (!this.analyticsInterval) {
      issues.push('Analytics interval not running');
    }

    const status =
      issues.length === 0
        ? 'healthy'
        : issues.length <= 2
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      details: {
        initialized: this.isInitialized,
        totalConsents: this.consents.size,
        totalConfigurations: this.configurations.size,
        issues,
        lastAnalytics: this.analytics ? new Date() : null,
      },
    };
  }
}

// ============================================================================
// CONSENT UTILITIES
// ============================================================================

/**
 * Consent validation utilities
 */
export class ConsentValidator {
  /**
   * Validate consent request
   */
  static validateConsentRequest(request: ConsentRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.consents || request.consents.length === 0) {
      errors.push('At least one consent is required');
    }

    if (request.context) {
      if (!request.context.ipAddress) {
        errors.push('IP address is required in context');
      }
      if (!request.context.userAgent) {
        errors.push('User agent is required in context');
      }
    } else {
      errors.push('Context is required');
    }

    for (const consent of request.consents || []) {
      if (!Object.values(LGPDDataType).includes(consent.dataType)) {
        errors.push(`Invalid data type: ${consent.dataType}`);
      }
      if (!Object.values(LGPDProcessingPurpose).includes(consent.purpose)) {
        errors.push(`Invalid purpose: ${consent.purpose}`);
      }
      if (!Object.values(LGPDLegalBasis).includes(consent.legalBasis)) {
        errors.push(`Invalid legal basis: ${consent.legalBasis}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate consent record
   */
  static validateConsentRecord(consent: ConsentRecord): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!consent.id) {
      errors.push('Consent ID is required');
    }

    if (!consent.userId) {
      errors.push('User ID is required');
    }

    if (!Object.values(LGPDDataType).includes(consent.dataType)) {
      errors.push(`Invalid data type: ${consent.dataType}`);
    }

    if (!Object.values(LGPDProcessingPurpose).includes(consent.purpose)) {
      errors.push(`Invalid purpose: ${consent.purpose}`);
    }

    if (!Object.values(LGPDLegalBasis).includes(consent.legalBasis)) {
      errors.push(`Invalid legal basis: ${consent.legalBasis}`);
    }

    if (!Object.values(ConsentStatus).includes(consent.status)) {
      errors.push(`Invalid status: ${consent.status}`);
    }

    if (consent.expiryDate && consent.expiryDate <= consent.consentDate) {
      errors.push('Expiry date must be after consent date');
    }

    if (!consent.auditTrail || consent.auditTrail.length === 0) {
      errors.push('Audit trail is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Default consent manager instance
 */
export const consentManager = new ConsentManager();

/**
 * Export types for external use
 */
export type {
  ConsentRecord,
  ConsentRequest,
  ConsentConfiguration,
  ConsentAnalytics,
  ConsentEvents,
  ConsentAuditEntry,
};
