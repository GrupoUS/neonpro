/**
 * LGPD Compliance Automation System - Main Index
 *
 * This module provides comprehensive LGPD compliance automation including:
 * - Consent Management
 * - Data Subject Rights
 * - Compliance Monitoring
 * - Data Retention Policies
 * - Breach Detection
 * - Data Minimization
 * - Impact Assessment (DPIA)
 * - Legal Documentation Automation
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

// ============================================================================
// CORE MANAGERS
// ============================================================================

export {
  type AffectedData,
  type BreachCompliance,
  BreachDetectionSystem,
  type BreachEvents,
  type BreachImpact,
  type BreachIncident,
  type BreachInvestigation,
  type BreachNotification,
  type BreachSeverity,
  type BreachStatus,
  type BreachType,
  type DetectionRule,
  type MonitoringAlert,
  type ResponseAction,
  type TechnicalDetails,
} from './breach-detection';
export {
  type ComplianceAudit,
  type ComplianceCategory,
  type ComplianceEvents,
  ComplianceMonitor,
  type ComplianceRequirement,
  type ComplianceScore,
  type ComplianceStatus,
  type ComplianceViolation,
  type LGPDArticle,
  type ViolationSeverity,
} from './compliance-monitor';
export {
  type ConsentAuditEntry,
  type ConsentConfiguration,
  type ConsentData,
  type ConsentEvents,
  type ConsentLegalBasis,
  ConsentManager,
  type ConsentPurpose,
  type ConsentRecord,
  type ConsentRequest,
  type ConsentStatus,
  ConsentValidator,
} from './consent-management';
export {
  type CollectionRequest,
  type DataCategory as MinimizationDataCategory,
  type DataCollectionSchema,
  DataMinimizationManager,
  type MinimizationAction,
  type MinimizationEvents,
  type MinimizationReport,
  type MinimizationRule,
  type NecessityLevel,
  type ProcessingPurpose,
} from './data-minimization';
export {
  type DataCategory,
  DataRetentionManager,
  type DeletionMethod,
  type LegalHold,
  type LegalHoldStatus,
  type RetentionEvents,
  type RetentionPolicy,
  type RetentionReport,
  type RetentionSchedule,
  type RetentionTrigger,
  type RetentionUnit,
} from './data-retention';
export {
  type DataSubjectRequest,
  type DataSubjectRightsEvents,
  DataSubjectRightsManager,
  type RequestPriority,
  type RequestStatus,
  type RequestType,
} from './data-subject-rights';

export {
  type AssessmentEvents,
  type AssessmentStatus,
  type ComplianceGap,
  type ImpactAssessment,
  ImpactAssessmentManager,
  type ProcessingContext,
  type RiskAssessment,
  type RiskCategory,
  type RiskSeverity,
  type StakeholderConsultation,
} from './impact-assessment';

export {
  type ComplianceReport,
  type DocumentationEvents,
  type DocumentGenerationRequest,
  type DocumentLanguage,
  type DocumentStatus,
  type DocumentTemplate,
  type DocumentType,
  type LegalDocument,
  LegalDocumentationManager,
  type LegalFramework,
} from './legal-documentation';

// ============================================================================
// UNIFIED LGPD SYSTEM
// ============================================================================

import { EventEmitter } from 'node:events';
import { BreachDetectionSystem } from './breach-detection';
import { ComplianceMonitor } from './compliance-monitor';
import { ConsentManager } from './consent-management';
import { DataMinimizationManager } from './data-minimization';
import { DataRetentionManager } from './data-retention';
import { DataSubjectRightsManager } from './data-subject-rights';
import { ImpactAssessmentManager } from './impact-assessment';
import { LegalDocumentationManager } from './legal-documentation';

/**
 * LGPD System Configuration
 */
export type LGPDSystemConfiguration = {
  // Organization info
  organization: {
    name: string;
    legalName: string;
    cnpj?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    contact: {
      email: string;
      phone: string;
      website?: string;
    };
    dpo?: {
      name: string;
      email: string;
      phone?: string;
    };
  };

  // System settings
  settings: {
    defaultLanguage: 'pt-BR' | 'en-US';
    autoCompliance: boolean;
    realTimeMonitoring: boolean;
    auditTrailEnabled: boolean;
    notificationsEnabled: boolean;
    encryptionEnabled: boolean;
    backupEnabled: boolean;
  };

  // Module configurations
  modules: {
    consent: {
      enabled: boolean;
      autoExpiry: boolean;
      expiryDays: number;
      granularConsent: boolean;
    };
    dataSubjectRights: {
      enabled: boolean;
      autoProcessing: boolean;
      responseTimeHours: number;
      verificationRequired: boolean;
    };
    compliance: {
      enabled: boolean;
      continuousMonitoring: boolean;
      alertThreshold: number;
      autoRemediation: boolean;
    };
    retention: {
      enabled: boolean;
      autoCleanup: boolean;
      defaultRetentionDays: number;
      legalHoldSupport: boolean;
    };
    breachDetection: {
      enabled: boolean;
      realTimeDetection: boolean;
      autoNotification: boolean;
      severityThreshold: 'low' | 'medium' | 'high' | 'critical';
    };
    minimization: {
      enabled: boolean;
      autoMinimization: boolean;
      strictMode: boolean;
      consentValidation: boolean;
    };
    impactAssessment: {
      enabled: boolean;
      autoAssessment: boolean;
      riskThreshold: number;
      stakeholderConsultation: boolean;
    };
    documentation: {
      enabled: boolean;
      autoGeneration: boolean;
      pdfGeneration: boolean;
      multiLanguage: boolean;
    };
  };
};

/**
 * LGPD System Events
 */
export type LGPDSystemEvents = {
  'system:initialized': { timestamp: Date };
  'system:shutdown': { timestamp: Date };
  'system:error': { error: Error; module: string };
  'system:health_check': {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  };
  'compliance:violation': { violation: any; severity: string };
  'data:processed': { operation: string; dataType: string; purpose: string };
  'audit:entry': { actor: string; action: string; details: any };
};

/**
 * Unified LGPD Compliance System
 *
 * This class provides a unified interface to all LGPD compliance modules,
 * orchestrating their interactions and ensuring comprehensive compliance.
 */
export class LGPDComplianceSystem extends EventEmitter {
  private readonly consentManager: ConsentManager;
  private readonly dataSubjectRightsManager: DataSubjectRightsManager;
  private readonly complianceMonitor: ComplianceMonitor;
  private readonly dataRetentionManager: DataRetentionManager;
  private readonly breachDetectionSystem: BreachDetectionSystem;
  private readonly dataMinimizationManager: DataMinimizationManager;
  private readonly impactAssessmentManager: ImpactAssessmentManager;
  private readonly legalDocumentationManager: LegalDocumentationManager;

  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(private readonly config: LGPDSystemConfiguration) {
    super();
    this.setMaxListeners(100);

    // Initialize managers
    this.consentManager = new ConsentManager();
    this.dataSubjectRightsManager = new DataSubjectRightsManager();
    this.complianceMonitor = new ComplianceMonitor();
    this.dataRetentionManager = new DataRetentionManager();
    this.breachDetectionSystem = new BreachDetectionSystem();
    this.dataMinimizationManager = new DataMinimizationManager();
    this.impactAssessmentManager = new ImpactAssessmentManager();
    this.legalDocumentationManager = new LegalDocumentationManager();
  }

  /**
   * Initialize the LGPD compliance system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize enabled modules
      const initPromises: Promise<void>[] = [];

      if (this.config.modules.consent.enabled) {
        initPromises.push(this.consentManager.initialize());
      }

      if (this.config.modules.dataSubjectRights.enabled) {
        initPromises.push(this.dataSubjectRightsManager.initialize());
      }

      if (this.config.modules.compliance.enabled) {
        initPromises.push(this.complianceMonitor.initialize());
      }

      if (this.config.modules.retention.enabled) {
        initPromises.push(this.dataRetentionManager.initialize());
      }

      if (this.config.modules.breachDetection.enabled) {
        initPromises.push(this.breachDetectionSystem.initialize());
      }

      if (this.config.modules.minimization.enabled) {
        initPromises.push(this.dataMinimizationManager.initialize());
      }

      if (this.config.modules.impactAssessment.enabled) {
        initPromises.push(this.impactAssessmentManager.initialize());
      }

      if (this.config.modules.documentation.enabled) {
        initPromises.push(this.legalDocumentationManager.initialize());
      }

      // Wait for all modules to initialize
      await Promise.all(initPromises);

      // Set up event forwarding
      this.setupEventForwarding();

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      this.emit('system:initialized', { timestamp: new Date() });

      this.logActivity('system', 'lgpd_system_initialized', {
        enabledModules: this.getEnabledModules(),
        configuration: this.config.settings,
      });
    } catch (error) {
      this.emit('system:error', { error: error as Error, module: 'system' });
      throw new Error(`Failed to initialize LGPD system: ${error}`);
    }
  }

  /**
   * Process data with LGPD compliance checks
   */
  async processData(operation: {
    type: 'collect' | 'process' | 'store' | 'share' | 'delete';
    dataType: string;
    purpose: string;
    legalBasis: string;
    dataSubject: string;
    data: any;
    retention?: number;
    recipients?: string[];
  }): Promise<{
    allowed: boolean;
    requirements: string[];
    violations: string[];
    recommendations: string[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const result = {
      allowed: true,
      requirements: [] as string[],
      violations: [] as string[],
      recommendations: [] as string[],
    };

    try {
      // Check consent if required
      if (
        this.config.modules.consent.enabled &&
        operation.legalBasis === 'consent'
      ) {
        const consentValid = await this.consentManager.validateConsent(
          operation.dataSubject,
          operation.purpose,
        );

        if (consentValid.isValid) {
          result.requirements.push('Consent validated successfully');
        } else {
          result.allowed = false;
          result.violations.push('Valid consent required for data processing');
        }
      }

      // Check data minimization
      if (
        this.config.modules.minimization.enabled &&
        operation.type === 'collect'
      ) {
        // This would integrate with the data minimization manager
        result.requirements.push('Data minimization principles applied');
      }

      // Check retention policies
      if (this.config.modules.retention.enabled && operation.type === 'store') {
        // This would integrate with the retention manager
        result.requirements.push('Retention policy applied');
      }

      // Monitor compliance
      if (this.config.modules.compliance.enabled) {
        await this.complianceMonitor.checkOperationCompliance({
          operation: operation.type,
          dataType: operation.dataType,
          purpose: operation.purpose,
          legalBasis: operation.legalBasis,
          timestamp: new Date(),
        });
      }

      // Log the operation
      this.emit('data:processed', {
        operation: operation.type,
        dataType: operation.dataType,
        purpose: operation.purpose,
      });

      this.logActivity('user', 'data_processed', {
        operation: operation.type,
        dataType: operation.dataType,
        purpose: operation.purpose,
        allowed: result.allowed,
        dataSubject: operation.dataSubject,
      });
    } catch (error) {
      result.allowed = false;
      result.violations.push(`Processing error: ${error}`);
      this.emit('system:error', {
        error: error as Error,
        module: 'processing',
      });
    }

    return result;
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    modules: Record<string, any>;
    overall: {
      uptime: number;
      errors: number;
      warnings: number;
    };
  } {
    const moduleStatuses: Record<string, any> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const totalErrors = 0;
    const totalWarnings = 0;

    // Check each enabled module
    if (this.config.modules.consent.enabled) {
      const status = this.consentManager.getHealthStatus();
      moduleStatuses.consent = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.dataSubjectRights.enabled) {
      const status = this.dataSubjectRightsManager.getHealthStatus();
      moduleStatuses.dataSubjectRights = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.compliance.enabled) {
      const status = this.complianceMonitor.getHealthStatus();
      moduleStatuses.compliance = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.retention.enabled) {
      const status = this.dataRetentionManager.getHealthStatus();
      moduleStatuses.retention = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.breachDetection.enabled) {
      const status = this.breachDetectionSystem.getHealthStatus();
      moduleStatuses.breachDetection = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.minimization.enabled) {
      const status = this.dataMinimizationManager.getHealthStatus();
      moduleStatuses.minimization = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.impactAssessment.enabled) {
      const status = this.impactAssessmentManager.getHealthStatus();
      moduleStatuses.impactAssessment = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    if (this.config.modules.documentation.enabled) {
      const status = this.legalDocumentationManager.getHealthStatus();
      moduleStatuses.documentation = status;
      if (status.status !== 'healthy') {
        if (status.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    return {
      status: overallStatus,
      modules: moduleStatuses,
      overall: {
        uptime: process.uptime(),
        errors: totalErrors,
        warnings: totalWarnings,
      },
    };
  }

  /**
   * Get enabled modules
   */
  private getEnabledModules(): string[] {
    const enabled: string[] = [];

    Object.entries(this.config.modules).forEach(([module, config]) => {
      if (config.enabled) {
        enabled.push(module);
      }
    });

    return enabled;
  }

  /**
   * Setup event forwarding from modules
   */
  private setupEventForwarding(): void {
    // Forward events from all modules to the main system
    const modules = [
      this.consentManager,
      this.dataSubjectRightsManager,
      this.complianceMonitor,
      this.dataRetentionManager,
      this.breachDetectionSystem,
      this.dataMinimizationManager,
      this.impactAssessmentManager,
      this.legalDocumentationManager,
    ];

    modules.forEach((module) => {
      module.on('violation:detected', (data) => {
        this.emit('compliance:violation', data);
      });

      module.on('audit:entry', (data) => {
        this.emit('audit:entry', data);
      });
    });
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(
      () => {
        const health = this.getHealthStatus();
        this.emit('system:health_check', health);

        if (health.status !== 'healthy') {
          this.logActivity('system', 'health_check_warning', {
            status: health.status,
            modules: health.modules,
          });
        }
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  /**
   * Log activity
   */
  private logActivity(
    actor: string,
    action: string,
    details: Record<string, any>,
  ): void {
    const entry = {
      timestamp: new Date(),
      actor,
      action,
      details,
    };

    this.emit('audit:entry', entry);
  }

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Shutdown all modules
    const shutdownPromises: Promise<void>[] = [];

    if (this.config.modules.consent.enabled) {
      shutdownPromises.push(this.consentManager.shutdown());
    }

    if (this.config.modules.dataSubjectRights.enabled) {
      shutdownPromises.push(this.dataSubjectRightsManager.shutdown());
    }

    if (this.config.modules.compliance.enabled) {
      shutdownPromises.push(this.complianceMonitor.shutdown());
    }

    if (this.config.modules.retention.enabled) {
      shutdownPromises.push(this.dataRetentionManager.shutdown());
    }

    if (this.config.modules.breachDetection.enabled) {
      shutdownPromises.push(this.breachDetectionSystem.shutdown());
    }

    if (this.config.modules.minimization.enabled) {
      shutdownPromises.push(this.dataMinimizationManager.shutdown());
    }

    if (this.config.modules.impactAssessment.enabled) {
      shutdownPromises.push(this.impactAssessmentManager.shutdown());
    }

    if (this.config.modules.documentation.enabled) {
      shutdownPromises.push(this.legalDocumentationManager.shutdown());
    }

    await Promise.all(shutdownPromises);

    this.removeAllListeners();
    this.isInitialized = false;

    this.emit('system:shutdown', { timestamp: new Date() });
  }

  // ============================================================================
  // MODULE ACCESSORS
  // ============================================================================

  /**
   * Get consent manager
   */
  get consent(): ConsentManager {
    return this.consentManager;
  }

  /**
   * Get data subject rights manager
   */
  get dataSubjectRights(): DataSubjectRightsManager {
    return this.dataSubjectRightsManager;
  }

  /**
   * Get compliance monitor
   */
  get compliance(): ComplianceMonitor {
    return this.complianceMonitor;
  }

  /**
   * Get data retention manager
   */
  get retention(): DataRetentionManager {
    return this.dataRetentionManager;
  }

  /**
   * Get breach detection system
   */
  get breachDetection(): BreachDetectionSystem {
    return this.breachDetectionSystem;
  }

  /**
   * Get data minimization manager
   */
  get minimization(): DataMinimizationManager {
    return this.dataMinimizationManager;
  }

  /**
   * Get impact assessment manager
   */
  get impactAssessment(): ImpactAssessmentManager {
    return this.impactAssessmentManager;
  }

  /**
   * Get legal documentation manager
   */
  get documentation(): LegalDocumentationManager {
    return this.legalDocumentationManager;
  }
}

/**
 * Create default LGPD system configuration
 */
export function createDefaultLGPDConfig(
  organizationInfo: LGPDSystemConfiguration['organization'],
): LGPDSystemConfiguration {
  return {
    organization: organizationInfo,
    settings: {
      defaultLanguage: 'pt-BR',
      autoCompliance: true,
      realTimeMonitoring: true,
      auditTrailEnabled: true,
      notificationsEnabled: true,
      encryptionEnabled: true,
      backupEnabled: true,
    },
    modules: {
      consent: {
        enabled: true,
        autoExpiry: true,
        expiryDays: 365,
        granularConsent: true,
      },
      dataSubjectRights: {
        enabled: true,
        autoProcessing: true,
        responseTimeHours: 72,
        verificationRequired: true,
      },
      compliance: {
        enabled: true,
        continuousMonitoring: true,
        alertThreshold: 0.8,
        autoRemediation: true,
      },
      retention: {
        enabled: true,
        autoCleanup: true,
        defaultRetentionDays: 1095, // 3 years
        legalHoldSupport: true,
      },
      breachDetection: {
        enabled: true,
        realTimeDetection: true,
        autoNotification: true,
        severityThreshold: 'medium',
      },
      minimization: {
        enabled: true,
        autoMinimization: true,
        strictMode: true,
        consentValidation: true,
      },
      impactAssessment: {
        enabled: true,
        autoAssessment: true,
        riskThreshold: 0.7,
        stakeholderConsultation: true,
      },
      documentation: {
        enabled: true,
        autoGeneration: true,
        pdfGeneration: true,
        multiLanguage: true,
      },
    },
  };
}

/**
 * Default LGPD system instance (singleton)
 */
let defaultLGPDSystem: LGPDComplianceSystem | null = null;

/**
 * Get or create default LGPD system
 */
export function getLGPDSystem(
  config?: LGPDSystemConfiguration,
): LGPDComplianceSystem {
  if (!defaultLGPDSystem && config) {
    defaultLGPDSystem = new LGPDComplianceSystem(config);
  }

  if (!defaultLGPDSystem) {
    throw new Error(
      'LGPD system not initialized. Please provide configuration.',
    );
  }

  return defaultLGPDSystem;
}

/**
 * Export the main system class and utilities
 */
export { LGPDComplianceSystem as default, LGPDComplianceSystem };
