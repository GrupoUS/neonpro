import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

interface RecoveryConfiguration {
  recovery_strategies: {
    database_failure: DatabaseRecoveryStrategy;
    service_failure: ServiceRecoveryStrategy;
    infrastructure_failure: InfrastructureRecoveryStrategy;
    data_corruption: DataCorruptionRecoveryStrategy;
  };
  healthcare_priorities: {
    emergency_services: string[];
    critical_data_types: string[];
    maximum_downtime_minutes: number;
    patient_safety_protocols: string[];
  };
  recovery_objectives: {
    rto_minutes: number; // Recovery Time Objective
    rpo_minutes: number; // Recovery Point Objective
    maximum_data_loss_minutes: number;
  };
  backup_configuration: {
    database_backup_frequency_minutes: number;
    service_state_backup_frequency_minutes: number;
    retention_days: number;
    backup_locations: string[];
  };
}

interface DatabaseRecoveryStrategy {
  primary_backup_location: string;
  secondary_backup_location: string;
  point_in_time_recovery_enabled: boolean;
  automatic_failover_enabled: boolean;
  replica_databases: string[];
}

interface ServiceRecoveryStrategy {
  dependency_map: { [service: string]: string[] };
  graceful_degradation_levels: { [service: string]: string[] };
  circuit_breaker_thresholds: { [service: string]: number };
  auto_restart_attempts: number;
  manual_intervention_threshold_minutes: number;
}

interface InfrastructureRecoveryStrategy {
  multi_region_setup: boolean;
  load_balancer_failover: boolean;
  cdn_backup_regions: string[];
  auto_scaling_policies: any;
}

interface DataCorruptionRecoveryStrategy {
  corruption_detection_methods: string[];
  data_validation_checksums: boolean;
  rollback_safe_points: number;
  data_integrity_verification: boolean;
}

interface DisasterEvent {
  id: string;
  event_type: 'database_failure' | 'service_failure' | 'infrastructure_failure' | 'data_corruption' | 'security_breach' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_services: string[];
  detected_at: string;
  recovery_initiated_at?: string;
  recovery_completed_at?: string;
  status: 'detected' | 'recovery_in_progress' | 'recovered' | 'manual_intervention_required';
  description: string;
  recovery_actions: RecoveryAction[];
  patient_impact_assessment: {
    affected_patients: number;
    critical_operations_affected: boolean;
    data_loss_risk: boolean;
    estimated_recovery_time_minutes: number;
  };
}

interface RecoveryAction {
  action_type: 'rollback' | 'failover' | 'restore_backup' | 'restart_service' | 'notify_team' | 'emergency_protocol';
  description: string;
  executed_at?: string;
  success: boolean;
  error_message?: string;
  duration_ms?: number;
}

class DisasterRecoveryOrchestrator {
  private config: RecoveryConfiguration;
  private supabase: any;
  private activeRecoveries: Map<string, DisasterEvent>;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: RecoveryConfiguration) {
    this.config = config;
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.activeRecoveries = new Map();
    
    this.startContinuousHealthMonitoring();
  }

  private startContinuousHealthMonitoring(): void {
    // Monitor system health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performSystemHealthCheck();
    }, 30000);

    console.log('🔍 Disaster recovery monitoring started');
  }

  private async performSystemHealthCheck(): Promise<void> {
    try {
      // Check all critical services
      const serviceHealthChecks = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkAIServicesHealth(),
        this.checkInfrastructureHealth(),
        this.checkDataIntegrity()
      ]);

      const failures: Array<{ type: string; error: any }> = [];
      
      serviceHealthChecks.forEach((result, index) => {
        if (result.status === 'rejected') {
          const types = ['database', 'ai_services', 'infrastructure', 'data_integrity'];
          failures.push({
            type: types[index],
            error: result.reason
          });
        }
      });

      // Trigger recovery if failures detected
      if (failures.length > 0) {
        await this.handleDetectedFailures(failures);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      await this.createDisasterEvent('infrastructure_failure', 'high', [], `Health check system failure: ${error.message}`);
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('patients')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Database health check failed: ${error.message}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Database connectivity failed: ${error.message}`);
    }
  }

  private async checkAIServicesHealth(): Promise<boolean> {
    const criticalServices = ['universal-chat', 'compliance-automation', 'no-show-prediction'];
    const failedServices: string[] = [];

    for (const service of criticalServices) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/api/ai/${service}/health`, {
          method: 'GET',
          timeout: 5000
        });

        if (!response.ok) {
          failedServices.push(service);
        }
      } catch (error) {
        failedServices.push(service);
      }
    }

    if (failedServices.length > 0) {
      throw new Error(`AI services health check failed: ${failedServices.join(', ')}`);
    }
    return true;
  }

  private async checkInfrastructureHealth(): Promise<boolean> {
    try {
      // Check API gateway responsiveness
      const response = await fetch(`${process.env.API_BASE_URL}/api/health`, {
        method: 'GET',
        timeout: 3000
      });

      if (!response.ok) {
        throw new Error(`Infrastructure health check failed: HTTP ${response.status}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Infrastructure connectivity failed: ${error.message}`);
    }
  }

  private async checkDataIntegrity(): Promise<boolean> {
    try {
      // Perform basic data integrity checks
      const { data, error } = await this.supabase.rpc('check_data_integrity');
      
      if (error || !data?.integrity_ok) {
        throw new Error('Data integrity verification failed');
      }
      return true;
    } catch (error) {
      throw new Error(`Data integrity check failed: ${error.message}`);
    }
  }

  private async handleDetectedFailures(failures: Array<{ type: string; error: any }>): Promise<void> {
    for (const failure of failures) {
      const eventType = this.mapFailureTypeToEventType(failure.type);
      const severity = this.assessFailureSeverity(failure);
      const affectedServices = this.identifyAffectedServices(failure.type);

      await this.createDisasterEvent(
        eventType,
        severity,
        affectedServices,
        `Detected ${failure.type} failure: ${failure.error.message}`
      );
    }
  }

  private mapFailureTypeToEventType(failureType: string): DisasterEvent['event_type'] {
    const mapping: { [key: string]: DisasterEvent['event_type'] } = {
      'database': 'database_failure',
      'ai_services': 'service_failure',
      'infrastructure': 'infrastructure_failure',
      'data_integrity': 'data_corruption'
    };
    return mapping[failureType] || 'service_failure';
  }

  private assessFailureSeverity(failure: { type: string; error: any }): 'low' | 'medium' | 'high' | 'critical' {
    // Healthcare systems require high sensitivity
    if (failure.type === 'database' || failure.type === 'data_integrity') {
      return 'critical';
    }
    if (failure.type === 'ai_services' && failure.error.message.includes('compliance')) {
      return 'critical';
    }
    if (failure.type === 'infrastructure') {
      return 'high';
    }
    return 'medium';
  }

  private identifyAffectedServices(failureType: string): string[] {
    const serviceMap: { [key: string]: string[] } = {
      'database': ['universal-chat', 'compliance-automation', 'no-show-prediction', 'appointment-optimization'],
      'ai_services': ['universal-chat', 'compliance-automation', 'no-show-prediction'],
      'infrastructure': ['api-gateway', 'load-balancer', 'cdn'],
      'data_integrity': ['universal-chat', 'compliance-automation']
    };
    return serviceMap[failureType] || [];
  }

  private async createDisasterEvent(
    eventType: DisasterEvent['event_type'],
    severity: DisasterEvent['severity'],
    affectedServices: string[],
    description: string
  ): Promise<void> {
    const event: DisasterEvent = {
      id: `disaster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event_type: eventType,
      severity,
      affected_services: affectedServices,
      detected_at: new Date().toISOString(),
      status: 'detected',
      description,
      recovery_actions: [],
      patient_impact_assessment: await this.assessPatientImpact(affectedServices, severity)
    };

    this.activeRecoveries.set(event.id, event);

    console.log(`🚨 Disaster event detected: ${event.id} - ${description}`);
    
    // Log to database for audit trail
    await this.logDisasterEvent(event);
    
    // Initiate immediate recovery
    await this.initiateRecovery(event);
  }

  private async assessPatientImpact(affectedServices: string[], severity: string): Promise<any> {
    try {
      // Get current active patient sessions
      const { data: activeSessions } = await this.supabase
        .from('ai_chat_sessions')
        .select('count')
        .eq('status', 'active');

      const affectedPatients = activeSessions?.[0]?.count || 0;
      const criticalOperationsAffected = affectedServices.includes('compliance-automation') || 
                                        affectedServices.includes('universal-chat');

      return {
        affected_patients: affectedPatients,
        critical_operations_affected: criticalOperationsAffected,
        data_loss_risk: severity === 'critical',
        estimated_recovery_time_minutes: this.config.recovery_objectives.rto_minutes
      };
    } catch (error) {
      return {
        affected_patients: 0,
        critical_operations_affected: false,
        data_loss_risk: false,
        estimated_recovery_time_minutes: this.config.recovery_objectives.rto_minutes
      };
    }
  }

  private async logDisasterEvent(event: DisasterEvent): Promise<void> {
    try {
      await this.supabase
        .from('disaster_recovery_events')
        .insert({
          event_id: event.id,
          event_type: event.event_type,
          severity: event.severity,
          affected_services: event.affected_services,
          detected_at: event.detected_at,
          status: event.status,
          description: event.description,
          patient_impact: event.patient_impact_assessment
        });
    } catch (error) {
      console.error('Failed to log disaster event:', error);
    }
  }

  private async initiateRecovery(event: DisasterEvent): Promise<void> {
    console.log(`🔄 Initiating recovery for event: ${event.id}`);
    event.recovery_initiated_at = new Date().toISOString();
    event.status = 'recovery_in_progress';

    try {
      // Execute recovery strategy based on event type
      switch (event.event_type) {
        case 'database_failure':
          await this.executeDatabaseRecovery(event);
          break;
        case 'service_failure':
          await this.executeServiceRecovery(event);
          break;
        case 'infrastructure_failure':
          await this.executeInfrastructureRecovery(event);
          break;
        case 'data_corruption':
          await this.executeDataCorruptionRecovery(event);
          break;
        default:
          await this.executeGenericRecovery(event);
      }

      // Verify recovery success
      const recoverySuccessful = await this.verifyRecoverySuccess(event);
      
      if (recoverySuccessful) {
        event.status = 'recovered';
        event.recovery_completed_at = new Date().toISOString();
        console.log(`✅ Recovery completed for event: ${event.id}`);
        
        await this.sendRecoveryNotification(event, 'success');
      } else {
        event.status = 'manual_intervention_required';
        console.log(`⚠️ Manual intervention required for event: ${event.id}`);
        
        await this.sendRecoveryNotification(event, 'manual_intervention_required');
        await this.escalateToOncallTeam(event);
      }

      await this.updateDisasterEventLog(event);

    } catch (error) {
      console.error(`❌ Recovery failed for event: ${event.id}:`, error);
      event.status = 'manual_intervention_required';
      
      event.recovery_actions.push({
        action_type: 'notify_team',
        description: `Recovery failed: ${error.message}`,
        executed_at: new Date().toISOString(),
        success: false,
        error_message: error.message
      });

      await this.sendRecoveryNotification(event, 'failed');
      await this.escalateToOncallTeam(event);
    }
  }

  private async executeDatabaseRecovery(event: DisasterEvent): Promise<void> {
    const strategy = this.config.recovery_strategies.database_failure;
    
    // Step 1: Try to reconnect to primary database
    event.recovery_actions.push(await this.executeRecoveryAction(
      'restart_service',
      'Attempting database reconnection',
      async () => {
        const { error } = await this.supabase.from('patients').select('count').limit(1);
        if (error) throw error;
      }
    ));

    // If primary fails, try replica failover
    if (!event.recovery_actions[event.recovery_actions.length - 1].success) {
      if (strategy.automatic_failover_enabled && strategy.replica_databases.length > 0) {
        event.recovery_actions.push(await this.executeRecoveryAction(
          'failover',
          'Failing over to replica database',
          async () => {
            await execAsync('npm run db:failover-to-replica');
          }
        ));
      }

      // If all else fails, restore from backup
      if (!event.recovery_actions[event.recovery_actions.length - 1].success) {
        event.recovery_actions.push(await this.executeRecoveryAction(
          'restore_backup',
          'Restoring database from latest backup',
          async () => {
            await this.restoreDatabaseBackup('latest');
          }
        ));
      }
    }
  }

  private async executeServiceRecovery(event: DisasterEvent): Promise<void> {
    const strategy = this.config.recovery_strategies.service_failure;
    
    for (const service of event.affected_services) {
      // Step 1: Try service restart
      event.recovery_actions.push(await this.executeRecoveryAction(
        'restart_service',
        `Restarting service: ${service}`,
        async () => {
          await execAsync(`npm run service:restart ${service}`);
          await this.waitForServiceHealth(service, 30000); // 30 second timeout
        }
      ));

      // Step 2: If restart fails, try rollback to previous version
      if (!event.recovery_actions[event.recovery_actions.length - 1].success) {
        event.recovery_actions.push(await this.executeRecoveryAction(
          'rollback',
          `Rolling back service: ${service}`,
          async () => {
            await execAsync(`npm run service:rollback ${service}`);
            await this.waitForServiceHealth(service, 60000); // 60 second timeout
          }
        ));
      }

      // Step 3: Enable graceful degradation
      if (!event.recovery_actions[event.recovery_actions.length - 1].success) {
        const degradationLevels = strategy.graceful_degradation_levels[service] || [];
        if (degradationLevels.length > 0) {
          event.recovery_actions.push(await this.executeRecoveryAction(
            'failover',
            `Enabling graceful degradation for: ${service}`,
            async () => {
              await this.enableGracefulDegradation(service, degradationLevels[0]);
            }
          ));
        }
      }
    }
  }

  private async executeInfrastructureRecovery(event: DisasterEvent): Promise<void> {
    const strategy = this.config.recovery_strategies.infrastructure_failure;
    
    // Load balancer failover
    if (strategy.load_balancer_failover) {
      event.recovery_actions.push(await this.executeRecoveryAction(
        'failover',
        'Switching to backup load balancer',
        async () => {
          await execAsync('npm run lb:switch-to-backup');
        }
      ));
    }

    // CDN failover to backup regions
    if (strategy.cdn_backup_regions.length > 0) {
      event.recovery_actions.push(await this.executeRecoveryAction(
        'failover',
        'Activating CDN backup regions',
        async () => {
          for (const region of strategy.cdn_backup_regions) {
            await execAsync(`npm run cdn:activate-region ${region}`);
          }
        }
      ));
    }

    // Auto-scaling activation
    if (strategy.auto_scaling_policies) {
      event.recovery_actions.push(await this.executeRecoveryAction(
        'restart_service',
        'Triggering auto-scaling policies',
        async () => {
          await execAsync('npm run autoscale:emergency-scale-up');
        }
      ));
    }
  }

  private async executeDataCorruptionRecovery(event: DisasterEvent): Promise<void> {
    const strategy = this.config.recovery_strategies.data_corruption;
    
    // Step 1: Stop affected services to prevent further corruption
    event.recovery_actions.push(await this.executeRecoveryAction(
      'restart_service',
      'Stopping affected services',
      async () => {
        for (const service of event.affected_services) {
          await execAsync(`npm run service:stop ${service}`);
        }
      }
    ));

    // Step 2: Restore from the latest clean backup
    event.recovery_actions.push(await this.executeRecoveryAction(
      'restore_backup',
      'Restoring from clean backup',
      async () => {
        await this.restoreDatabaseBackup('clean');
      }
    ));

    // Step 3: Verify data integrity
    event.recovery_actions.push(await this.executeRecoveryAction(
      'restart_service',
      'Verifying data integrity',
      async () => {
        const { data, error } = await this.supabase.rpc('verify_data_integrity_full');
        if (error || !data?.integrity_verified) {
          throw new Error('Data integrity verification failed');
        }
      }
    ));

    // Step 4: Restart services
    event.recovery_actions.push(await this.executeRecoveryAction(
      'restart_service',
      'Restarting services after data recovery',
      async () => {
        for (const service of event.affected_services) {
          await execAsync(`npm run service:start ${service}`);
        }
      }
    ));
  }

  private async executeGenericRecovery(event: DisasterEvent): Promise<void> {
    // Generic recovery: restart affected services and notify team
    event.recovery_actions.push(await this.executeRecoveryAction(
      'restart_service',
      'Attempting generic service recovery',
      async () => {
        for (const service of event.affected_services) {
          try {
            await execAsync(`npm run service:restart ${service}`);
          } catch (error) {
            console.warn(`Failed to restart ${service}:`, error);
          }
        }
      }
    ));

    event.recovery_actions.push(await this.executeRecoveryAction(
      'notify_team',
      'Notifying oncall team for manual intervention',
      async () => {
        await this.escalateToOncallTeam(event);
      }
    ));
  }

  private async executeRecoveryAction(
    actionType: RecoveryAction['action_type'],
    description: string,
    actionFunction: () => Promise<void>
  ): Promise<RecoveryAction> {
    const startTime = Date.now();
    const action: RecoveryAction = {
      action_type: actionType,
      description,
      executed_at: new Date().toISOString(),
      success: false
    };

    try {
      await actionFunction();
      action.success = true;
      action.duration_ms = Date.now() - startTime;
      console.log(`✅ Recovery action completed: ${description}`);
    } catch (error) {
      action.success = false;
      action.error_message = error.message;
      action.duration_ms = Date.now() - startTime;
      console.log(`❌ Recovery action failed: ${description} - ${error.message}`);
    }

    return action;
  }

  private async waitForServiceHealth(service: string, timeoutMs: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/api/ai/${service}/health`, {
          method: 'GET',
          timeout: 3000
        });

        if (response.ok) {
          const healthData = await response.json();
          if (healthData.healthy) {
            return; // Service is healthy
          }
        }
      } catch (error) {
        // Service still unhealthy, continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
    }

    throw new Error(`Service ${service} did not become healthy within ${timeoutMs}ms`);
  }

  private async enableGracefulDegradation(service: string, degradationLevel: string): Promise<void> {
    // Enable graceful degradation by updating feature flags
    await execAsync(`npm run feature-flags:set ${service}_degradation_mode ${degradationLevel}`);
    
    // Update service configuration for degraded mode
    await execAsync(`npm run service:configure ${service} --mode=degraded --level=${degradationLevel}`);
  }

  private async restoreDatabaseBackup(backupType: 'latest' | 'clean'): Promise<void> {
    const backupLocation = this.config.backup_configuration.backup_locations[0];
    
    if (backupType === 'latest') {
      await execAsync(`npm run db:restore-backup -- --source=${backupLocation}/latest`);
    } else {
      // For clean backup, get the last verified clean backup
      await execAsync(`npm run db:restore-backup -- --source=${backupLocation}/clean --verify-integrity`);
    }

    // Run database migrations to ensure schema is current
    await execAsync('npm run db:migrate');
  }

  private async verifyRecoverySuccess(event: DisasterEvent): Promise<boolean> {
    try {
      // Wait a moment for services to stabilize
      await new Promise(resolve => setTimeout(resolve, 10000));

      const verificationChecks = [
        this.checkDatabaseHealth(),
        this.checkAIServicesHealth(),
        this.checkInfrastructureHealth()
      ];

      if (event.event_type === 'data_corruption') {
        verificationChecks.push(this.checkDataIntegrity());
      }

      const results = await Promise.allSettled(verificationChecks);
      const allSuccessful = results.every(result => result.status === 'fulfilled');

      return allSuccessful;
    } catch (error) {
      console.error('Recovery verification failed:', error);
      return false;
    }
  }

  private async sendRecoveryNotification(event: DisasterEvent, status: 'success' | 'failed' | 'manual_intervention_required'): Promise<void> {
    const notification = {
      event_id: event.id,
      event_type: event.event_type,
      severity: event.severity,
      status,
      affected_services: event.affected_services,
      patient_impact: event.patient_impact_assessment,
      recovery_actions: event.recovery_actions.length,
      recovery_duration_ms: event.recovery_completed_at ? 
        new Date(event.recovery_completed_at).getTime() - new Date(event.recovery_initiated_at!).getTime() : null,
      timestamp: new Date().toISOString()
    };

    // In production, this would send to Slack, PagerDuty, email, etc.
    console.log('📢 Recovery notification:', JSON.stringify(notification, null, 2));

    // Log notification to database
    try {
      await this.supabase
        .from('recovery_notifications')
        .insert(notification);
    } catch (error) {
      console.error('Failed to log recovery notification:', error);
    }
  }

  private async escalateToOncallTeam(event: DisasterEvent): Promise<void> {
    console.log(`🚨 ESCALATING TO ONCALL TEAM - Event: ${event.id}`);
    console.log(`Severity: ${event.severity}`);
    console.log(`Patient Impact: ${JSON.stringify(event.patient_impact_assessment)}`);
    console.log(`Description: ${event.description}`);
    
    // In production, this would trigger PagerDuty, call oncall engineers, etc.
    // For now, log the escalation
    try {
      await this.supabase
        .from('oncall_escalations')
        .insert({
          event_id: event.id,
          severity: event.severity,
          description: event.description,
          patient_impact: event.patient_impact_assessment,
          escalated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log oncall escalation:', error);
    }
  }

  private async updateDisasterEventLog(event: DisasterEvent): Promise<void> {
    try {
      await this.supabase
        .from('disaster_recovery_events')
        .update({
          status: event.status,
          recovery_initiated_at: event.recovery_initiated_at,
          recovery_completed_at: event.recovery_completed_at,
          recovery_actions: event.recovery_actions
        })
        .eq('event_id', event.id);
    } catch (error) {
      console.error('Failed to update disaster event log:', error);
    }
  }

  // Public methods for manual intervention
  async triggerManualRecovery(eventId: string): Promise<void> {
    const event = this.activeRecoveries.get(eventId);
    if (!event) {
      throw new Error(`Recovery event ${eventId} not found`);
    }

    console.log(`🔧 Manual recovery triggered for event: ${eventId}`);
    await this.initiateRecovery(event);
  }

  async getActiveRecoveries(): Promise<DisasterEvent[]> {
    return Array.from(this.activeRecoveries.values());
  }

  async getRecoveryHistory(days: number = 7): Promise<any[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await this.supabase
      .from('disaster_recovery_events')
      .select('*')
      .gte('detected_at', startDate)
      .order('detected_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recovery history: ${error.message}`);
    }

    return data || [];
  }

  async performManualBackup(): Promise<void> {
    console.log('💾 Initiating manual backup...');
    
    const backupId = `manual-${Date.now()}`;
    const backupLocation = this.config.backup_configuration.backup_locations[0];
    
    try {
      await execAsync(`npm run db:backup -- --id=${backupId} --location=${backupLocation}`);
      console.log(`✅ Manual backup completed: ${backupId}`);
    } catch (error) {
      console.error(`❌ Manual backup failed: ${error.message}`);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    console.log('🛑 Disaster recovery monitoring stopped');
  }
}

export default DisasterRecoveryOrchestrator;
export { RecoveryConfiguration, DisasterEvent, RecoveryAction };