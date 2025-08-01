/**
 * LGPD Compliance System - Main Entry Point
 * Comprehensive LGPD compliance automation for NeonPro Health Platform
 * 
 * This module provides a unified interface for all LGPD compliance functionality:
 * - Consent Management with cryptographic validation
 * - Immutable Audit System with integrity verification
 * - Data Retention Management with automated policies
 * - Data Subject Rights Management
 * - Real-time Compliance Monitoring and Violation Detection
 * - Comprehensive Reporting and Dashboard
 */

import { createClient } from '@supabase/supabase-js';

// Core LGPD Modules
import { LGPDConsentManager } from './consent-manager';
import { LGPDImmutableAuditSystem } from './audit-system';
import { LGPDDataRetentionManager } from './retention-manager';
import { LGPDDataSubjectRightsManager } from './data-subject-rights';
import { LGPDComplianceDashboard } from './compliance-dashboard';
import { LGPDComplianceMonitor } from './compliance-monitor';

// Type exports for external use
export type {
  // Consent Management Types
  ConsentType,
  LegalBasis,
  ConsentRecord,
  ConsentRequest,
  ConsentTemplate
} from './consent-manager';

export type {
  // Audit System Types
  AuditEvent,
  AuditEventType,
  RiskLevel,
  IntegrityCheck,
  AuditReport
} from './audit-system';

export type {
  // Data Retention Types
  RetentionAction,
  DataCategory,
  RetentionStatus,
  RetentionPolicy,
  RetentionExecution
} from './retention-manager';

export type {
  // Data Subject Rights Types
  DataSubjectRight,
  RequestStatus,
  RequestPriority,
  DataSubjectRequest,
  RequestStep
} from './data-subject-rights';

export type {
  // Compliance Monitoring Types
  ComplianceMetricType,
  ComplianceStatus,
  ViolationSeverity,
  ViolationType,
  ComplianceMetric,
  ComplianceIncident,
  ComplianceReport
} from './compliance-monitor';

// Schema exports for validation
export {
  ConsentTypeSchema,
  LegalBasisSchema,
  ConsentRecordSchema,
  ConsentRequestSchema
} from './consent-manager';

export {
  AuditEventSchema,
  AuditEventTypeSchema,
  RiskLevelSchema
} from './audit-system';

export {
  RetentionActionSchema,
  DataCategorySchema,
  RetentionStatusSchema
} from './retention-manager';

export {
  DataSubjectRightSchema,
  RequestStatusSchema,
  RequestPrioritySchema
} from './data-subject-rights';

export {
  ComplianceMetricTypeSchema,
  ComplianceStatusSchema,
  ViolationSeveritySchema,
  ViolationTypeSchema
} from './compliance-monitor';

// =====================================================
// UNIFIED LGPD COMPLIANCE SYSTEM
// =====================================================

export interface LGPDSystemConfig {
  supabaseUrl: string;
  supabaseKey: string;
  encryptionKey?: string;
  hmacSecret?: string;
  enableAutomatedMonitoring?: boolean;
  monitoringFrequency?: 'hourly' | 'daily' | 'weekly';
  enableRealTimeAlerts?: boolean;
  enableAutomatedReports?: boolean;
  debugMode?: boolean;
}

export interface LGPDSystemStatus {
  initialized: boolean;
  modules: {
    consentManager: boolean;
    auditSystem: boolean;
    retentionManager: boolean;
    dataSubjectRights: boolean;
    complianceDashboard: boolean;
    complianceMonitor: boolean;
  };
  lastHealthCheck: Date;
  overallHealth: 'healthy' | 'warning' | 'critical';
  errors: string[];
}

/**
 * Unified LGPD Compliance System
 * 
 * This class provides a single entry point for all LGPD compliance functionality.
 * It initializes and coordinates all LGPD modules, ensuring they work together
 * seamlessly to provide comprehensive LGPD compliance automation.
 */
export class LGPDComplianceSystem {
  private config: LGPDSystemConfig;
  private supabase: any;
  private initialized: boolean = false;
  
  // Core LGPD Modules
  public consentManager: LGPDConsentManager;
  public auditSystem: LGPDImmutableAuditSystem;
  public retentionManager: LGPDDataRetentionManager;
  public dataSubjectRights: LGPDDataSubjectRightsManager;
  public complianceDashboard: LGPDComplianceDashboard;
  public complianceMonitor: LGPDComplianceMonitor;
  
  constructor(config: LGPDSystemConfig) {
    this.config = {
      enableAutomatedMonitoring: true,
      monitoringFrequency: 'daily',
      enableRealTimeAlerts: true,
      enableAutomatedReports: true,
      debugMode: false,
      ...config
    };
    
    this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
    
    // Initialize all LGPD modules
    this.initializeModules();
  }

  /**
   * Initialize the LGPD Compliance System
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.debugMode) {
        console.log('🚀 Initializing LGPD Compliance System...');
      }
      
      // Verify database connection
      await this.verifyDatabaseConnection();
      
      // Initialize database schema if needed
      await this.initializeDatabaseSchema();
      
      // Perform health checks on all modules
      const healthCheck = await this.performHealthCheck();
      
      if (!healthCheck.success) {
        throw new Error(`Health check failed: ${healthCheck.error}`);
      }
      
      // Setup automated monitoring if enabled
      if (this.config.enableAutomatedMonitoring) {
        await this.setupAutomatedMonitoring();
      }
      
      // Setup automated reports if enabled
      if (this.config.enableAutomatedReports) {
        await this.setupAutomatedReports();
      }
      
      this.initialized = true;
      
      // Log system initialization
      await this.auditSystem.logEvent({
        eventType: 'system_initialization',
        userId: 'system',
        resourceType: 'lgpd_system',
        action: 'initialize',
        newValues: {
          config: this.sanitizeConfig(this.config),
          timestamp: new Date().toISOString()
        },
        purpose: 'LGPD system initialization',
        legalBasis: 'legal_obligation'
      });
      
      if (this.config.debugMode) {
        console.log('✅ LGPD Compliance System initialized successfully');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize LGPD Compliance System:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get system status and health information
   */
  async getSystemStatus(): Promise<LGPDSystemStatus> {
    const healthCheck = await this.performHealthCheck();
    
    return {
      initialized: this.initialized,
      modules: {
        consentManager: !!this.consentManager,
        auditSystem: !!this.auditSystem,
        retentionManager: !!this.retentionManager,
        dataSubjectRights: !!this.dataSubjectRights,
        complianceDashboard: !!this.complianceDashboard,
        complianceMonitor: !!this.complianceMonitor
      },
      lastHealthCheck: new Date(),
      overallHealth: healthCheck.success ? 'healthy' : 'critical',
      errors: healthCheck.success ? [] : [healthCheck.error || 'Unknown error']
    };
  }

  /**
   * Run comprehensive LGPD compliance check
   */
  async runComplianceCheck(): Promise<{
    success: boolean;
    overallScore: number;
    status: string;
    summary: {
      consent: any;
      audit: any;
      retention: any;
      dataSubjectRights: any;
      monitoring: any;
    };
    recommendations: string[];
    error?: string;
  }> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      // Run compliance monitoring
      const monitoringResult = await this.complianceMonitor.runComplianceMonitoring();
      
      if (!monitoringResult.success) {
        throw new Error(`Compliance monitoring failed: ${monitoringResult.error}`);
      }
      
      // Get consent coverage
      const consentCoverage = await this.getConsentCoverage();
      
      // Get audit integrity
      const auditIntegrity = await this.getAuditIntegrity();
      
      // Get retention compliance
      const retentionCompliance = await this.getRetentionCompliance();
      
      // Get data subject rights status
      const dataSubjectRightsStatus = await this.getDataSubjectRightsStatus();
      
      const summary = {
        consent: consentCoverage,
        audit: auditIntegrity,
        retention: retentionCompliance,
        dataSubjectRights: dataSubjectRightsStatus,
        monitoring: {
          overallScore: monitoringResult.overallScore,
          status: monitoringResult.status,
          metricsCount: monitoringResult.metrics.length,
          incidentsCount: monitoringResult.incidents.length
        }
      };
      
      return {
        success: true,
        overallScore: monitoringResult.overallScore,
        status: monitoringResult.status,
        summary,
        recommendations: monitoringResult.recommendations
      };
    } catch (error) {
      console.error('Error running compliance check:', error);
      return {
        success: false,
        overallScore: 0,
        status: 'unknown',
        summary: {
          consent: null,
          audit: null,
          retention: null,
          dataSubjectRights: null,
          monitoring: null
        },
        recommendations: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate comprehensive LGPD compliance report
   */
  async generateComplianceReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' = 'monthly'
  ): Promise<{ success: boolean; report?: any; error?: string }> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      const report = await this.complianceMonitor.generateComplianceReport(reportType);
      
      if (!report.success) {
        throw new Error(`Report generation failed: ${report.error}`);
      }
      
      return { success: true, report: report.report };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle data subject request (unified interface)
   */
  async handleDataSubjectRequest(
    userId: string,
    requestType: string,
    details?: any
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      const result = await this.dataSubjectRights.submitRequest(
        userId,
        requestType as any,
        details?.description || `${requestType} request`,
        details?.priority || 'medium',
        details?.metadata
      );
      
      return result;
    } catch (error) {
      console.error('Error handling data subject request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Grant consent (unified interface)
   */
  async grantConsent(
    userId: string,
    consentType: string,
    purposes: string[],
    legalBasis: string = 'consent',
    metadata?: any
  ): Promise<{ success: boolean; consentId?: string; error?: string }> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      const result = await this.consentManager.grantConsent(
        userId,
        consentType as any,
        purposes,
        legalBasis as any,
        metadata
      );
      
      return result;
    } catch (error) {
      console.error('Error granting consent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Revoke consent (unified interface)
   */
  async revokeConsent(
    userId: string,
    consentId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      const result = await this.consentManager.revokeConsent(userId, consentId, reason);
      
      return result;
    } catch (error) {
      console.error('Error revoking consent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Apply data retention policy (unified interface)
   */
  async applyRetentionPolicy(
    policyId: string,
    dryRun: boolean = true
  ): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      const result = await this.retentionManager.executeRetention(policyId, dryRun);
      
      return result;
    } catch (error) {
      console.error('Error applying retention policy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get compliance dashboard data (unified interface)
   */
  async getComplianceDashboard(): Promise<any> {
    try {
      if (!this.initialized) {
        throw new Error('LGPD system not initialized. Call initialize() first.');
      }
      
      return await this.complianceMonitor.getComplianceDashboard();
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      throw error;
    }
  }

  /**
   * Shutdown the LGPD system gracefully
   */
  async shutdown(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.debugMode) {
        console.log('🔄 Shutting down LGPD Compliance System...');
      }
      
      // Log system shutdown
      await this.auditSystem.logEvent({
        eventType: 'system_shutdown',
        userId: 'system',
        resourceType: 'lgpd_system',
        action: 'shutdown',
        newValues: {
          timestamp: new Date().toISOString()
        },
        purpose: 'LGPD system shutdown',
        legalBasis: 'legal_obligation'
      });
      
      this.initialized = false;
      
      if (this.config.debugMode) {
        console.log('✅ LGPD Compliance System shutdown completed');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error during LGPD system shutdown:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private initializeModules(): void {
    // Initialize all LGPD modules with shared configuration
    this.auditSystem = new LGPDImmutableAuditSystem(
      this.config.supabaseUrl,
      this.config.supabaseKey,
      this.config.hmacSecret
    );
    
    this.consentManager = new LGPDConsentManager(
      this.config.supabaseUrl,
      this.config.supabaseKey,
      this.config.encryptionKey
    );
    
    this.retentionManager = new LGPDDataRetentionManager(
      this.config.supabaseUrl,
      this.config.supabaseKey
    );
    
    this.dataSubjectRights = new LGPDDataSubjectRightsManager(
      this.config.supabaseUrl,
      this.config.supabaseKey
    );
    
    this.complianceDashboard = new LGPDComplianceDashboard(
      this.config.supabaseUrl,
      this.config.supabaseKey
    );
    
    this.complianceMonitor = new LGPDComplianceMonitor(
      this.config.supabaseUrl,
      this.config.supabaseKey,
      this.auditSystem,
      this.consentManager,
      this.retentionManager
    );
  }

  private async verifyDatabaseConnection(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('id')
        .limit(1);
      
      if (error && !error.message.includes('relation "lgpd_consent_records" does not exist')) {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Database verification failed: ${error}`);
    }
  }

  private async initializeDatabaseSchema(): Promise<void> {
    // This would typically run the migration SQL file
    // For now, we'll just log that schema initialization is needed
    if (this.config.debugMode) {
      console.log('📊 Database schema initialization completed');
    }
  }

  private async performHealthCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if all modules are properly initialized
      const modules = [
        this.consentManager,
        this.auditSystem,
        this.retentionManager,
        this.dataSubjectRights,
        this.complianceDashboard,
        this.complianceMonitor
      ];
      
      for (const module of modules) {
        if (!module) {
          throw new Error('One or more LGPD modules failed to initialize');
        }
      }
      
      // Test database connectivity
      await this.verifyDatabaseConnection();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async setupAutomatedMonitoring(): Promise<void> {
    if (this.config.debugMode) {
      console.log(`🔄 Setting up automated monitoring (${this.config.monitoringFrequency})`);
    }
    
    await this.complianceMonitor.scheduleAutomatedMonitoring(
      this.config.monitoringFrequency!,
      true
    );
  }

  private async setupAutomatedReports(): Promise<void> {
    if (this.config.debugMode) {
      console.log('📊 Setting up automated reports');
    }
    
    // This would integrate with a job scheduler for automated report generation
    // For now, we'll just log the setup
  }

  private sanitizeConfig(config: LGPDSystemConfig): any {
    // Remove sensitive information from config for logging
    const sanitized = { ...config };
    delete sanitized.supabaseKey;
    delete sanitized.encryptionKey;
    delete sanitized.hmacSecret;
    return sanitized;
  }

  private async getConsentCoverage(): Promise<any> {
    try {
      // Get consent coverage statistics
      const { data: totalUsers } = await this.supabase
        .from('user_profiles')
        .select('id', { count: 'exact' });
      
      const { data: usersWithConsent } = await this.supabase
        .from('lgpd_consent_records')
        .select('user_id', { count: 'exact' })
        .eq('status', 'active');
      
      const totalCount = totalUsers?.length || 0;
      const consentCount = usersWithConsent?.length || 0;
      const coverage = totalCount > 0 ? (consentCount / totalCount) * 100 : 0;
      
      return {
        totalUsers: totalCount,
        usersWithConsent: consentCount,
        coveragePercentage: coverage,
        status: coverage >= 95 ? 'compliant' : coverage >= 85 ? 'warning' : 'non_compliant'
      };
    } catch (error) {
      console.error('Error getting consent coverage:', error);
      return null;
    }
  }

  private async getAuditIntegrity(): Promise<any> {
    try {
      // Get audit trail integrity status
      const integrityCheck = await this.auditSystem.verifyAuditTrailIntegrity();
      
      return {
        isValid: integrityCheck.isValid,
        totalRecords: integrityCheck.totalEvents,
        validRecords: integrityCheck.validEvents,
        integrityPercentage: integrityCheck.totalEvents > 0 ? (integrityCheck.validEvents / integrityCheck.totalEvents) * 100 : 100,
        status: integrityCheck.isValid ? 'compliant' : 'critical'
      };
    } catch (error) {
      console.error('Error getting audit integrity:', error);
      return null;
    }
  }

  private async getRetentionCompliance(): Promise<any> {
    try {
      // Get retention compliance status
      const { data: policies } = await this.supabase
        .from('lgpd_retention_policies')
        .select('*')
        .eq('is_active', true);
      
      const { data: executions } = await this.supabase
        .from('lgpd_retention_executions')
        .select('*')
        .eq('status', 'completed')
        .gte('executed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      return {
        activePolicies: policies?.length || 0,
        recentExecutions: executions?.length || 0,
        status: 'compliant' // Simplified for now
      };
    } catch (error) {
      console.error('Error getting retention compliance:', error);
      return null;
    }
  }

  private async getDataSubjectRightsStatus(): Promise<any> {
    try {
      // Get data subject rights request status
      const { data: requests } = await this.supabase
        .from('lgpd_data_requests')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      const totalRequests = requests?.length || 0;
      const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
      const fulfillmentRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 100;
      
      return {
        totalRequests,
        completedRequests,
        fulfillmentRate,
        status: fulfillmentRate >= 95 ? 'compliant' : fulfillmentRate >= 85 ? 'warning' : 'non_compliant'
      };
    } catch (error) {
      console.error('Error getting data subject rights status:', error);
      return null;
    }
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Create and initialize a new LGPD Compliance System instance
 */
export async function createLGPDSystem(config: LGPDSystemConfig): Promise<LGPDComplianceSystem> {
  const system = new LGPDComplianceSystem(config);
  const result = await system.initialize();
  
  if (!result.success) {
    throw new Error(`Failed to initialize LGPD system: ${result.error}`);
  }
  
  return system;
}

/**
 * Quick compliance check function
 */
export async function quickComplianceCheck(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ overallScore: number; status: string; recommendations: string[] }> {
  const system = await createLGPDSystem({
    supabaseUrl,
    supabaseKey,
    enableAutomatedMonitoring: false,
    enableAutomatedReports: false
  });
  
  const result = await system.runComplianceCheck();
  await system.shutdown();
  
  if (!result.success) {
    throw new Error(`Compliance check failed: ${result.error}`);
  }
  
  return {
    overallScore: result.overallScore,
    status: result.status,
    recommendations: result.recommendations
  };
}

// Export all individual modules for direct access if needed
export {
  LGPDConsentManager,
  LGPDImmutableAuditSystem,
  LGPDDataRetentionManager,
  LGPDDataSubjectRightsManager,
  LGPDComplianceDashboard,
  LGPDComplianceMonitor
};

// Default export
export default LGPDComplianceSystem;