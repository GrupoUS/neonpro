import type { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { LGPDComplianceManager } from '../LGPDComplianceManager';
import {
  type AuditConfig,
  AuditReportingAutomation,
} from './AuditReportingAutomation';
import {
  BreachDetectionAutomation,
  type BreachDetectionConfig,
} from './BreachDetectionAutomation';
// Import all automation modules
import {
  type ConsentAutomationConfig,
  ConsentAutomationManager,
} from './ConsentAutomationManager';
import {
  DataMinimizationAutomation,
  type DataMinimizationConfig,
} from './DataMinimizationAutomation';
import {
  DataRetentionAutomation,
  type RetentionConfig,
} from './DataRetentionAutomation';
import {
  DataSubjectRightsAutomation,
  type DataSubjectRightsConfig,
} from './DataSubjectRightsAutomation';
import {
  type ComplianceMonitorConfig,
  RealTimeComplianceMonitor,
} from './RealTimeComplianceMonitor';
import {
  ThirdPartyComplianceAutomation,
  type ThirdPartyConfig,
} from './ThirdPartyComplianceAutomation';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface LGPDAutomationConfig {
  consent_automation: ConsentAutomationConfig;
  data_subject_rights: DataSubjectRightsConfig;
  compliance_monitoring: ComplianceMonitorConfig;
  data_retention: RetentionConfig;
  breach_detection: BreachDetectionConfig;
  data_minimization: DataMinimizationConfig;
  third_party_compliance: ThirdPartyConfig;
  audit_reporting: AuditConfig;
  global_settings: {
    auto_start_all: boolean;
    unified_logging: boolean;
    cross_module_alerts: boolean;
    performance_monitoring: boolean;
    error_recovery: boolean;
    backup_enabled: boolean;
    maintenance_mode: boolean;
  };
}

export interface AutomationStatus {
  module: string;
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  last_activity: string;
  error_message?: string;
  performance_metrics: {
    uptime_percentage: number;
    average_response_time: number;
    total_operations: number;
    successful_operations: number;
    failed_operations: number;
  };
}

export interface AutomationMetrics {
  consent_automation: {
    total_consents_processed: number;
    automated_renewals: number;
    consent_withdrawals: number;
    granular_updates: number;
  };
  data_subject_rights: {
    total_requests_processed: number;
    access_requests: number;
    rectification_requests: number;
    deletion_requests: number;
    portability_requests: number;
    average_response_time_hours: number;
  };
  compliance_monitoring: {
    total_checks_performed: number;
    compliance_violations_detected: number;
    alerts_generated: number;
    auto_resolutions: number;
  };
  data_retention: {
    total_policies_executed: number;
    records_archived: number;
    records_deleted: number;
    storage_space_freed_gb: number;
  };
  breach_detection: {
    total_events_monitored: number;
    potential_breaches_detected: number;
    false_positives: number;
    confirmed_incidents: number;
    average_detection_time_minutes: number;
  };
  data_minimization: {
    total_analyses_performed: number;
    minimization_opportunities_identified: number;
    data_reduction_percentage: number;
    automated_minimizations: number;
  };
  third_party_compliance: {
    total_providers_monitored: number;
    compliance_assessments_performed: number;
    data_transfers_validated: number;
    compliance_violations: number;
  };
  audit_reporting: {
    total_reports_generated: number;
    automated_reports: number;
    dashboard_updates: number;
    export_operations: number;
  };
}

export interface AutomationAlert {
  id: string;
  module: string;
  alert_type: 'error' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  details: any;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

/**
 * LGPD Automation Orchestrator
 *
 * Central orchestration system that manages all LGPD automation modules,
 * providing unified control, monitoring, and coordination.
 */
export class LGPDAutomationOrchestrator {
  private readonly supabase: SupabaseClient;
  private readonly complianceManager: LGPDComplianceManager;
  private readonly config: LGPDAutomationConfig;

  // Automation modules
  private consentAutomation: ConsentAutomationManager;
  private dataSubjectRights: DataSubjectRightsAutomation;
  private complianceMonitor: RealTimeComplianceMonitor;
  private dataRetention: DataRetentionAutomation;
  private breachDetection: BreachDetectionAutomation;
  private dataMinimization: DataMinimizationAutomation;
  private thirdPartyCompliance: ThirdPartyComplianceAutomation;
  private auditReporting: AuditReportingAutomation;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly alertCallbacks: Array<(alert: AutomationAlert) => void> = [];
  private readonly statusCallbacks: Array<
    (status: AutomationStatus[]) => void
  > = [];

  constructor(
    supabase: SupabaseClient,
    complianceManager: LGPDComplianceManager,
    config: LGPDAutomationConfig
  ) {
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;

    // Initialize automation modules
    this.initializeModules();
  }

  /**
   * Initialize all automation modules
   */
  private initializeModules(): void {
    this.consentAutomation = new ConsentAutomationManager(
      this.supabase,
      this.complianceManager,
      this.config.consent_automation
    );

    this.dataSubjectRights = new DataSubjectRightsAutomation(
      this.supabase,
      this.complianceManager,
      this.config.data_subject_rights
    );

    this.complianceMonitor = new RealTimeComplianceMonitor(
      this.supabase,
      this.complianceManager,
      this.config.compliance_monitoring
    );

    this.dataRetention = new DataRetentionAutomation(
      this.supabase,
      this.complianceManager,
      this.config.data_retention
    );

    this.breachDetection = new BreachDetectionAutomation(
      this.supabase,
      this.complianceManager,
      this.config.breach_detection
    );

    this.dataMinimization = new DataMinimizationAutomation(
      this.supabase,
      this.complianceManager,
      this.config.data_minimization
    );

    this.thirdPartyCompliance = new ThirdPartyComplianceAutomation(
      this.supabase,
      this.complianceManager,
      this.config.third_party_compliance
    );

    this.auditReporting = new AuditReportingAutomation(
      this.supabase,
      this.complianceManager,
      this.config.audit_reporting
    );

    // Set up cross-module event handlers
    this.setupCrossModuleIntegration();
  }

  /**
   * Start all automation modules
   */
  async startAllAutomation(): Promise<{
    success: boolean;
    started_modules: string[];
    failed_modules: string[];
  }> {
    const startedModules: string[] = [];
    const failedModules: string[] = [];

    try {
      console.log('Starting LGPD Automation Orchestrator...');

      // Start each module
      const modules = [
        {
          name: 'consent_automation',
          instance: this.consentAutomation,
          method: 'startAutomation',
        },
        {
          name: 'data_subject_rights',
          instance: this.dataSubjectRights,
          method: 'startAutomation',
        },
        {
          name: 'compliance_monitoring',
          instance: this.complianceMonitor,
          method: 'startMonitoring',
        },
        {
          name: 'data_retention',
          instance: this.dataRetention,
          method: 'startAutomatedProcessing',
        },
        {
          name: 'breach_detection',
          instance: this.breachDetection,
          method: 'startRealTimeDetection',
        },
        {
          name: 'data_minimization',
          instance: this.dataMinimization,
          method: 'startAutomation',
        },
        {
          name: 'third_party_compliance',
          instance: this.thirdPartyCompliance,
          method: 'startComplianceMonitoring',
        },
        {
          name: 'audit_reporting',
          instance: this.auditReporting,
          method: 'startAutomatedReporting',
        },
      ];

      for (const module of modules) {
        try {
          await (module.instance as any)[module.method]();
          startedModules.push(module.name);
          console.log(`✅ ${module.name} started successfully`);
        } catch (error) {
          failedModules.push(module.name);
          console.error(`❌ Failed to start ${module.name}:`, error);

          await this.createAlert({
            module: module.name,
            alert_type: 'error',
            title: 'Module Start Failed',
            message: `Failed to start ${module.name}`,
            details: { error: error.message },
          });
        }
      }

      // Start orchestrator monitoring
      if (startedModules.length > 0) {
        this.isRunning = true;
        await this.startOrchestatorMonitoring();
      }

      // Log orchestrator start
      await this.complianceManager.logAuditEvent({
        event_type: 'automation_orchestrator',
        resource_type: 'orchestrator',
        resource_id: 'main',
        action: 'orchestrator_started',
        details: {
          started_modules: startedModules,
          failed_modules: failedModules,
          total_modules: modules.length,
        },
      });

      return {
        success: failedModules.length === 0,
        started_modules: startedModules,
        failed_modules: failedModules,
      };
    } catch (error) {
      console.error('Error starting automation orchestrator:', error);
      throw new Error(
        `Failed to start automation orchestrator: ${error.message}`
      );
    }
  }

  /**
   * Stop all automation modules
   */
  async stopAllAutomation(): Promise<{
    success: boolean;
    stopped_modules: string[];
  }> {
    const stoppedModules: string[] = [];

    try {
      console.log('Stopping LGPD Automation Orchestrator...');

      // Stop orchestrator monitoring
      this.stopOrchestatorMonitoring();

      // Stop each module
      const modules = [
        {
          name: 'consent_automation',
          instance: this.consentAutomation,
          method: 'stopAutomation',
        },
        {
          name: 'data_subject_rights',
          instance: this.dataSubjectRights,
          method: 'stopAutomation',
        },
        {
          name: 'compliance_monitoring',
          instance: this.complianceMonitor,
          method: 'stopMonitoring',
        },
        {
          name: 'data_retention',
          instance: this.dataRetention,
          method: 'stopAutomatedProcessing',
        },
        {
          name: 'breach_detection',
          instance: this.breachDetection,
          method: 'stopRealTimeDetection',
        },
        {
          name: 'data_minimization',
          instance: this.dataMinimization,
          method: 'stopAutomation',
        },
        {
          name: 'third_party_compliance',
          instance: this.thirdPartyCompliance,
          method: 'stopComplianceMonitoring',
        },
        {
          name: 'audit_reporting',
          instance: this.auditReporting,
          method: 'stopAutomatedReporting',
        },
      ];

      for (const module of modules) {
        try {
          (module.instance as any)[module.method]();
          stoppedModules.push(module.name);
          console.log(`✅ ${module.name} stopped successfully`);
        } catch (error) {
          console.error(`❌ Error stopping ${module.name}:`, error);
        }
      }

      this.isRunning = false;

      // Log orchestrator stop
      await this.complianceManager.logAuditEvent({
        event_type: 'automation_orchestrator',
        resource_type: 'orchestrator',
        resource_id: 'main',
        action: 'orchestrator_stopped',
        details: {
          stopped_modules: stoppedModules,
          total_modules: modules.length,
        },
      });

      return {
        success: true,
        stopped_modules: stoppedModules,
      };
    } catch (error) {
      console.error('Error stopping automation orchestrator:', error);
      throw new Error(
        `Failed to stop automation orchestrator: ${error.message}`
      );
    }
  }

  /**
   * Get automation status for all modules
   */
  async getAutomationStatus(): Promise<AutomationStatus[]> {
    try {
      const { data: statusData, error } = await this.supabase.rpc(
        'get_automation_status'
      );

      if (error) {
        throw error;
      }

      return statusData || [];
    } catch (error) {
      console.error('Error getting automation status:', error);
      throw new Error(`Failed to get automation status: ${error.message}`);
    }
  }

  /**
   * Get comprehensive automation metrics
   */
  async getAutomationMetrics(): Promise<AutomationMetrics> {
    try {
      const { data: metrics, error } = await this.supabase.rpc(
        'get_automation_metrics'
      );

      if (error) {
        throw error;
      }

      return metrics;
    } catch (error) {
      console.error('Error getting automation metrics:', error);
      throw new Error(`Failed to get automation metrics: ${error.message}`);
    }
  }

  /**
   * Get automation alerts
   */
  async getAutomationAlerts(
    filters: {
      module?: string;
      alert_type?: string;
      resolved?: boolean;
      start_date?: string;
      end_date?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): Promise<{
    alerts: AutomationAlert[];
    total_count: number;
    page: number;
    total_pages: number;
  }> {
    try {
      let query = this.supabase
        .from('lgpd_automation_alerts')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      if (filters.alert_type) {
        query = query.eq('alert_type', filters.alert_type);
      }
      if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query
        .order('timestamp', { ascending: false })
        .range(offset, offset + pagination.limit - 1);

      const { data: alerts, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / pagination.limit);

      return {
        alerts: alerts || [],
        total_count: count || 0,
        page: pagination.page,
        total_pages: totalPages,
      };
    } catch (error) {
      console.error('Error getting automation alerts:', error);
      throw new Error(`Failed to get automation alerts: ${error.message}`);
    }
  }

  /**
   * Resolve automation alert
   */
  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('lgpd_automation_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution_notes: resolutionNotes,
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }

      // Log alert resolution
      await this.complianceManager.logAuditEvent({
        event_type: 'automation_orchestrator',
        resource_type: 'automation_alert',
        resource_id: alertId,
        action: 'alert_resolved',
        details: {
          resolved_by: resolvedBy,
          resolution_notes: resolutionNotes,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }

  /**
   * Get unified automation dashboard
   */
  async getUnifiedDashboard(): Promise<{
    overall_status: string;
    total_modules: number;
    running_modules: number;
    error_modules: number;
    recent_alerts: AutomationAlert[];
    key_metrics: any;
    performance_summary: any;
  }> {
    try {
      const { data: dashboard, error } = await this.supabase.rpc(
        'get_unified_automation_dashboard'
      );

      if (error) {
        throw error;
      }

      return dashboard;
    } catch (error) {
      console.error('Error getting unified dashboard:', error);
      throw new Error(`Failed to get unified dashboard: ${error.message}`);
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: AutomationAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Register status callback
   */
  onStatusChange(callback: (status: AutomationStatus[]) => void): void {
    this.statusCallbacks.push(callback);
  }

  /**
   * Get individual module instances for direct access
   */
  getModules() {
    return {
      consentAutomation: this.consentAutomation,
      dataSubjectRights: this.dataSubjectRights,
      complianceMonitor: this.complianceMonitor,
      dataRetention: this.dataRetention,
      breachDetection: this.breachDetection,
      dataMinimization: this.dataMinimization,
      thirdPartyCompliance: this.thirdPartyCompliance,
      auditReporting: this.auditReporting,
    };
  }

  // Private helper methods
  private setupCrossModuleIntegration(): void {
    // Set up cross-module event handlers for coordinated automation

    // Breach detection triggers compliance monitoring
    this.breachDetection.onBreachDetected(async (incident) => {
      await this.complianceMonitor.triggerEmergencyCompliance(incident);
    });

    // Consent changes trigger data retention review
    this.consentAutomation.onConsentWithdrawn(async (consent) => {
      await this.dataRetention.reviewRetentionForConsent(
        consent.user_id,
        consent.purpose
      );
    });

    // Data subject requests trigger compliance checks
    this.dataSubjectRights.onRequestProcessed(async (request) => {
      await this.complianceMonitor.validateRequestCompliance(request);
    });

    // Third-party compliance issues trigger alerts
    this.thirdPartyCompliance.onComplianceAssessmentCompleted(
      async (assessment) => {
        if (
          assessment.risk_rating === 'high' ||
          assessment.risk_rating === 'critical'
        ) {
          await this.createAlert({
            module: 'third_party_compliance',
            alert_type: 'warning',
            title: 'High Risk Third Party Detected',
            message: `Provider ${assessment.provider_id} has ${assessment.risk_rating} risk rating`,
            details: assessment,
          });
        }
      }
    );

    // Data minimization opportunities trigger retention review
    this.dataMinimization.onMinimizationOpportunity(async (opportunity) => {
      await this.dataRetention.evaluateMinimizationOpportunity(opportunity);
    });
  }

  private async startOrchestatorMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
        await this.updatePerformanceMetrics();
        await this.checkForCriticalAlerts();
      } catch (error) {
        console.error('Error in orchestrator monitoring cycle:', error);
      }
    }, 60_000); // Check every minute

    console.log('Orchestrator monitoring started');
  }

  private stopOrchestatorMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Orchestrator monitoring stopped');
  }

  private async createAlert(
    alertData: Omit<AutomationAlert, 'id' | 'timestamp' | 'resolved'>
  ): Promise<void> {
    try {
      const { data: alert, error } = await this.supabase
        .from('lgpd_automation_alerts')
        .insert({
          ...alertData,
          timestamp: new Date().toISOString(),
          resolved: false,
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Trigger callbacks
      for (const callback of this.alertCallbacks) {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  private async performHealthCheck(): Promise<void> {
    // Implementation would perform health checks on all modules
  }

  private async updatePerformanceMetrics(): Promise<void> {
    // Implementation would update performance metrics
  }

  private async checkForCriticalAlerts(): Promise<void> {
    // Implementation would check for critical alerts requiring immediate attention
  }
}

// Export all automation classes for individual use
export {
  ConsentAutomationManager,
  DataSubjectRightsAutomation,
  RealTimeComplianceMonitor,
  DataRetentionAutomation,
  BreachDetectionAutomation,
  DataMinimizationAutomation,
  ThirdPartyComplianceAutomation,
  AuditReportingAutomation,
};

// Export configuration types
export type {
  ConsentAutomationConfig,
  DataSubjectRightsConfig,
  ComplianceMonitorConfig,
  RetentionConfig,
  BreachDetectionConfig,
  DataMinimizationConfig,
  ThirdPartyConfig,
  AuditConfig,
};
