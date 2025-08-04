/**
 * TASK-001: Foundation Setup & Baseline
 * Emergency Response System
 * 
 * Automated monitoring and response for critical system issues
 * with rollback capabilities and alerting mechanisms.
 */

import { createClient } from '@/app/utils/supabase/client';

export interface EmergencyRule {
  rule_id: string;
  rule_name: string;
  trigger_type: 'metric_threshold' | 'error_rate' | 'consecutive_failures' | 'custom';
  metric_name?: string;
  threshold_value?: number;
  threshold_operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  consecutive_count?: number;
  time_window_minutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  actions: EmergencyAction[];
  cooldown_minutes: number;
  metadata?: Record<string, any>;
}

export interface EmergencyAction {
  action_type: 'alert' | 'feature_flag_disable' | 'cache_clear' | 'service_restart' | 'rollback' | 'notification';
  target?: string;
  parameters?: Record<string, any>;
  priority: number;
}

export interface EmergencyAlert {
  alert_id: string;
  rule_id: string;
  trigger_time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_message: string;
  trigger_data: Record<string, any>;
  actions_taken: string[];
  resolved: boolean;
  resolution_time?: string;
  resolution_method?: 'auto' | 'manual';
  metadata?: Record<string, any>;
}

export interface SystemSnapshot {
  snapshot_id: string;
  snapshot_time: string;
  system_state: {
    feature_flags: Record<string, boolean>;
    performance_metrics: Record<string, number>;
    error_rates: Record<string, number>;
    active_users: number;
    system_health: 'healthy' | 'degraded' | 'critical';
  };
  deployment_info?: {
    version: string;
    commit_hash: string;
    deployment_time: string;
  };
}

class EmergencyResponseSystem {
  private supabase = createClient();
  private rules: Map<string, EmergencyRule> = new Map();
  private activeAlerts: Map<string, EmergencyAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private snapshots: SystemSnapshot[] = [];
  private maxSnapshots = 50; // Keep last 50 snapshots

  // Default emergency rules
  private defaultRules: EmergencyRule[] = [
    {
      rule_id: 'critical_error_rate',
      rule_name: 'Critical Error Rate',
      trigger_type: 'metric_threshold',
      metric_name: 'error_rate',
      threshold_value: 5,
      threshold_operator: 'gte',
      time_window_minutes: 5,
      severity: 'critical',
      enabled: true,
      cooldown_minutes: 15,
      actions: [
        { action_type: 'alert', priority: 1, parameters: { channel: 'emergency' } },
        { action_type: 'feature_flag_disable', target: 'new_features', priority: 2 },
        { action_type: 'notification', priority: 3, parameters: { recipients: ['admin'] } }
      ]
    },
    {
      rule_id: 'page_load_performance',
      rule_name: 'Page Load Performance Degradation',
      trigger_type: 'metric_threshold',
      metric_name: 'page_load_time',
      threshold_value: 5000,
      threshold_operator: 'gte',
      time_window_minutes: 10,
      severity: 'high',
      enabled: true,
      cooldown_minutes: 30,
      actions: [
        { action_type: 'alert', priority: 1 },
        { action_type: 'cache_clear', priority: 2 }
      ]
    },
    {
      rule_id: 'consecutive_failures',
      rule_name: 'Consecutive API Failures',
      trigger_type: 'consecutive_failures',
      metric_name: 'api_failures',
      threshold_operator: 'gte',
      consecutive_count: 5,
      time_window_minutes: 5,
      severity: 'high',
      enabled: true,
      cooldown_minutes: 20,
      actions: [
        { action_type: 'alert', priority: 1 },
        { action_type: 'service_restart', target: 'api_service', priority: 2 }
      ]
    },
    {
      rule_id: 'database_performance',
      rule_name: 'Database Performance Issue',
      trigger_type: 'metric_threshold',
      metric_name: 'database_query_time',
      threshold_value: 1000,
      threshold_operator: 'gte',
      time_window_minutes: 5,
      severity: 'high',
      enabled: true,
      cooldown_minutes: 10,
      actions: [
        { action_type: 'alert', priority: 1 },
        { action_type: 'notification', priority: 2, parameters: { message: 'Database performance degraded' } }
      ]
    }
  ];

  constructor() {
    this.initializeEmergencySystem();
  }

  /**
   * Initialize emergency response system
   */
  private async initializeEmergencySystem(): Promise<void> {
    try {
      console.log('🚨 Initializing Emergency Response System...');
      
      // Load existing rules
      await this.loadRules();
      
      // Create default rules if none exist
      if (this.rules.size === 0) {
        await this.createDefaultRules();
      }
      
      // Load active alerts
      await this.loadActiveAlerts();
      
      // Take initial system snapshot
      await this.takeSystemSnapshot();
      
      // Start monitoring
      this.startMonitoring();
      
      console.log('✅ Emergency Response System initialized');
    } catch (error) {
      console.error('Error initializing emergency response system:', error);
    }
  }

  /**
   * Load emergency rules from database
   */
  private async loadRules(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('*')
        .eq('metric_type', 'emergency_rule')
        .eq('metadata->>enabled', 'true');

      if (error) {
        console.error('Error loading emergency rules:', error);
        return;
      }

      data?.forEach(record => {
        if (record.metadata && record.metadata.rule_data) {
          const rule: EmergencyRule = record.metadata.rule_data;
          this.rules.set(rule.rule_id, rule);
        }
      });

      console.log(`Loaded ${this.rules.size} emergency rules`);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  }

  /**
   * Create default emergency rules
   */
  private async createDefaultRules(): Promise<void> {
    console.log('Creating default emergency rules...');
    
    for (const rule of this.defaultRules) {
      await this.addRule(rule);
    }
  }

  /**
   * Add emergency rule
   */
  async addRule(rule: EmergencyRule): Promise<void> {
    try {
      // Store rule in database
      const { error } = await this.supabase
        .from('system_metrics')
        .insert({
          metric_type: 'emergency_rule',
          metric_name: rule.rule_name,
          metric_value: rule.enabled ? 1 : 0,
          metric_unit: 'boolean',
          metadata: {
            rule_data: rule,
            enabled: rule.enabled
          }
        });

      if (error) {
        console.error('Error storing emergency rule:', error);
        return;
      }

      // Cache rule
      this.rules.set(rule.rule_id, rule);
      
      console.log(`✅ Emergency rule added: ${rule.rule_name}`);
    } catch (error) {
      console.error('Error adding emergency rule:', error);
    }
  }

  /**
   * Load active alerts
   */
  private async loadActiveAlerts(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('*')
        .eq('metric_type', 'emergency_alert')
        .eq('metadata->>resolved', 'false')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error loading active alerts:', error);
        return;
      }

      data?.forEach(record => {
        if (record.metadata && record.metadata.alert_data) {
          const alert: EmergencyAlert = record.metadata.alert_data;
          this.activeAlerts.set(alert.alert_id, alert);
        }
      });

      console.log(`Loaded ${this.activeAlerts.size} active alerts`);
    } catch (error) {
      console.error('Error loading active alerts:', error);
    }
  }

  /**
   * Start monitoring for emergency conditions
   */
  private startMonitoring(): void {
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkEmergencyConditions();
      } catch (error) {
        console.error('Error in emergency monitoring:', error);
      }
    }, 30000);

    console.log('🔄 Emergency monitoring started');
  }

  /**
   * Check all emergency conditions
   */
  private async checkEmergencyConditions(): Promise<void> {
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      try {
        const shouldTrigger = await this.evaluateRule(rule);
        
        if (shouldTrigger) {
          await this.triggerEmergencyResponse(rule);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${ruleId}:`, error);
      }
    }
  }

  /**
   * Evaluate emergency rule
   */
  private async evaluateRule(rule: EmergencyRule): Promise<boolean> {
    // Check cooldown period
    const lastAlert = Array.from(this.activeAlerts.values())
      .find(alert => alert.rule_id === rule.rule_id);
    
    if (lastAlert) {
      const timeSinceLastAlert = Date.now() - new Date(lastAlert.trigger_time).getTime();
      const cooldownMs = rule.cooldown_minutes * 60 * 1000;
      
      if (timeSinceLastAlert < cooldownMs) {
        return false; // Still in cooldown
      }
    }

    switch (rule.trigger_type) {
      case 'metric_threshold':
        return await this.evaluateMetricThreshold(rule);
      case 'error_rate':
        return await this.evaluateErrorRate(rule);
      case 'consecutive_failures':
        return await this.evaluateConsecutiveFailures(rule);
      default:
        return false;
    }
  }

  /**
   * Evaluate metric threshold rule
   */
  private async evaluateMetricThreshold(rule: EmergencyRule): Promise<boolean> {
    if (!rule.metric_name || rule.threshold_value === undefined) return false;

    try {
      // Get recent metrics within time window
      const timeWindowStart = new Date();
      timeWindowStart.setMinutes(timeWindowStart.getMinutes() - rule.time_window_minutes);

      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('metric_value')
        .eq('metric_name', rule.metric_name)
        .gte('timestamp', timeWindowStart.toISOString())
        .order('timestamp', { ascending: false });

      if (error || !data || data.length === 0) {
        return false;
      }

      // Calculate average value in time window
      const avgValue = data.reduce((sum, record) => sum + record.metric_value, 0) / data.length;

      // Check threshold
      switch (rule.threshold_operator) {
        case 'gt': return avgValue > rule.threshold_value;
        case 'gte': return avgValue >= rule.threshold_value;
        case 'lt': return avgValue < rule.threshold_value;
        case 'lte': return avgValue <= rule.threshold_value;
        case 'eq': return avgValue === rule.threshold_value;
        default: return false;
      }
    } catch (error) {
      console.error('Error evaluating metric threshold:', error);
      return false;
    }
  }

  /**
   * Evaluate error rate rule
   */
  private async evaluateErrorRate(rule: EmergencyRule): Promise<boolean> {
    // This would integrate with error tracking system
    // For now, return false
    return false;
  }

  /**
   * Evaluate consecutive failures rule
   */
  private async evaluateConsecutiveFailures(rule: EmergencyRule): Promise<boolean> {
    if (!rule.metric_name || !rule.consecutive_count) return false;

    try {
      // Get recent failure events
      const timeWindowStart = new Date();
      timeWindowStart.setMinutes(timeWindowStart.getMinutes() - rule.time_window_minutes);

      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('metric_value, timestamp')
        .eq('metric_name', rule.metric_name)
        .gte('timestamp', timeWindowStart.toISOString())
        .order('timestamp', { ascending: false });

      if (error || !data || data.length < rule.consecutive_count) {
        return false;
      }

      // Check if we have consecutive failures
      let consecutiveFailures = 0;
      for (let i = 0; i < data.length && i < rule.consecutive_count; i++) {
        if (data[i].metric_value === 1) { // 1 indicates failure
          consecutiveFailures++;
        } else {
          break;
        }
      }

      return consecutiveFailures >= rule.consecutive_count;
    } catch (error) {
      console.error('Error evaluating consecutive failures:', error);
      return false;
    }
  }

  /**
   * Trigger emergency response
   */
  private async triggerEmergencyResponse(rule: EmergencyRule): Promise<void> {
    console.log(`🚨 EMERGENCY TRIGGERED: ${rule.rule_name} (${rule.severity})`);

    // Create alert
    const alert: EmergencyAlert = {
      alert_id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rule_id: rule.rule_id,
      trigger_time: new Date().toISOString(),
      severity: rule.severity,
      alert_message: `Emergency condition detected: ${rule.rule_name}`,
      trigger_data: {
        rule_name: rule.rule_name,
        metric_name: rule.metric_name,
        threshold_value: rule.threshold_value,
        time_window_minutes: rule.time_window_minutes
      },
      actions_taken: [],
      resolved: false
    };

    // Execute actions in priority order
    const sortedActions = [...rule.actions].sort((a, b) => a.priority - b.priority);
    
    for (const action of sortedActions) {
      try {
        await this.executeEmergencyAction(action, alert);
        alert.actions_taken.push(`${action.action_type}: ${action.target || 'default'}`);
      } catch (error) {
        console.error(`Error executing action ${action.action_type}:`, error);
        alert.actions_taken.push(`${action.action_type}: FAILED - ${error}`);
      }
    }

    // Store alert
    await this.storeAlert(alert);
    
    // Cache alert
    this.activeAlerts.set(alert.alert_id, alert);

    // Take emergency snapshot
    await this.takeSystemSnapshot('emergency');
  }

  /**
   * Execute emergency action
   */
  private async executeEmergencyAction(action: EmergencyAction, alert: EmergencyAlert): Promise<void> {
    console.log(`⚡ Executing emergency action: ${action.action_type}`);

    switch (action.action_type) {
      case 'alert':
        await this.sendAlert(alert, action.parameters);
        break;
      case 'feature_flag_disable':
        await this.disableFeatureFlag(action.target, action.parameters);
        break;
      case 'cache_clear':
        await this.clearCache(action.target, action.parameters);
        break;
      case 'service_restart':
        await this.restartService(action.target, action.parameters);
        break;
      case 'rollback':
        await this.performRollback(action.parameters);
        break;
      case 'notification':
        await this.sendNotification(alert, action.parameters);
        break;
      default:
        console.warn(`Unknown emergency action: ${action.action_type}`);
    }
  }

  /**
   * Send emergency alert
   */
  private async sendAlert(alert: EmergencyAlert, parameters?: Record<string, any>): Promise<void> {
    console.log(`🚨 EMERGENCY ALERT: ${alert.alert_message}`);
    
    // Log alert to console (in production, this would integrate with alerting systems)
    console.error(`
    ╔══════════════════════════════════════════╗
    ║              EMERGENCY ALERT              ║
    ╠══════════════════════════════════════════╣
    ║ Rule: ${alert.rule_id.padEnd(32)} ║
    ║ Severity: ${alert.severity.padEnd(28)} ║
    ║ Time: ${new Date(alert.trigger_time).toLocaleString().padEnd(28)} ║
    ║ Message: ${alert.alert_message.substring(0, 27).padEnd(27)} ║
    ╚══════════════════════════════════════════╝
    `);

    // In production, integrate with Slack, email, SMS, etc.
  }

  /**
   * Disable feature flag
   */
  private async disableFeatureFlag(flagName?: string, parameters?: Record<string, any>): Promise<void> {
    if (!flagName) return;

    console.log(`🚫 Disabling feature flag: ${flagName}`);
    
    // This would integrate with your feature flag system
    // For now, just log the action
    
    // Store the action
    await this.supabase
      .from('system_metrics')
      .insert({
        metric_type: 'emergency_action',
        metric_name: 'feature_flag_disable',
        metric_value: 1,
        metric_unit: 'action',
        metadata: {
          flag_name: flagName,
          disabled_at: new Date().toISOString(),
          reason: 'emergency_response'
        }
      });
  }

  /**
   * Clear cache
   */
  private async clearCache(cacheType?: string, parameters?: Record<string, any>): Promise<void> {
    console.log(`🗑️ Clearing cache: ${cacheType || 'all'}`);
    
    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Clear local storage if specified
    if (cacheType === 'localStorage' || cacheType === 'all') {
      localStorage.clear();
    }
    
    // Clear session storage if specified
    if (cacheType === 'sessionStorage' || cacheType === 'all') {
      sessionStorage.clear();
    }
  }

  /**
   * Restart service (placeholder)
   */
  private async restartService(serviceName?: string, parameters?: Record<string, any>): Promise<void> {
    console.log(`🔄 Service restart triggered: ${serviceName || 'unknown'}`);
    
    // This would integrate with your service management system
    // Log the restart action
    await this.supabase
      .from('system_metrics')
      .insert({
        metric_type: 'emergency_action',
        metric_name: 'service_restart',
        metric_value: 1,
        metric_unit: 'action',
        metadata: {
          service_name: serviceName,
          restart_time: new Date().toISOString(),
          reason: 'emergency_response'
        }
      });
  }

  /**
   * Perform rollback
   */
  private async performRollback(parameters?: Record<string, any>): Promise<void> {
    console.log('↩️ Emergency rollback initiated');
    
    // Get latest system snapshot before emergency
    const preEmergencySnapshot = this.snapshots.find(s => 
      s.system_state.system_health === 'healthy'
    );
    
    if (!preEmergencySnapshot) {
      console.error('No healthy snapshot found for rollback');
      return;
    }
    
    console.log(`Rolling back to snapshot: ${preEmergencySnapshot.snapshot_id}`);
    
    // Restore feature flags
    for (const [flagName, enabled] of Object.entries(preEmergencySnapshot.system_state.feature_flags)) {
      // This would restore feature flag states
      console.log(`Restoring feature flag ${flagName}: ${enabled}`);
    }
    
    // Log rollback action
    await this.supabase
      .from('system_metrics')
      .insert({
        metric_type: 'emergency_action',
        metric_name: 'rollback',
        metric_value: 1,
        metric_unit: 'action',
        metadata: {
          snapshot_id: preEmergencySnapshot.snapshot_id,
          rollback_time: new Date().toISOString(),
          reason: 'emergency_response'
        }
      });
  }

  /**
   * Send notification
   */
  private async sendNotification(alert: EmergencyAlert, parameters?: Record<string, any>): Promise<void> {
    console.log(`📢 Sending emergency notification`);
    
    const message = parameters?.message || alert.alert_message;
    const recipients = parameters?.recipients || ['admin'];
    
    // This would integrate with your notification system
    console.log(`Notification sent to ${recipients.join(', ')}: ${message}`);
  }

  /**
   * Store alert in database
   */
  private async storeAlert(alert: EmergencyAlert): Promise<void> {
    try {
      await this.supabase
        .from('system_metrics')
        .insert({
          metric_type: 'emergency_alert',
          metric_name: alert.rule_id,
          metric_value: alert.severity === 'critical' ? 4 : alert.severity === 'high' ? 3 : alert.severity === 'medium' ? 2 : 1,
          metric_unit: 'severity',
          metadata: {
            alert_data: alert,
            resolved: alert.resolved
          }
        });
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  /**
   * Take system snapshot
   */
  async takeSystemSnapshot(reason: string = 'periodic'): Promise<SystemSnapshot> {
    const snapshot: SystemSnapshot = {
      snapshot_id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      snapshot_time: new Date().toISOString(),
      system_state: {
        feature_flags: {}, // This would come from feature flag system
        performance_metrics: {
          page_load_time: performance.now(),
          memory_usage: (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0
        },
        error_rates: {}, // This would come from error tracking
        active_users: 1, // This would come from analytics
        system_health: this.determineSystemHealth()
      }
    };

    // Store snapshot
    this.snapshots.push(snapshot);
    
    // Keep only last N snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    // Store in database for persistence
    await this.supabase
      .from('system_metrics')
      .insert({
        metric_type: 'system_snapshot',
        metric_name: reason,
        metric_value: 1,
        metric_unit: 'snapshot',
        metadata: {
          snapshot_data: snapshot
        }
      });

    console.log(`📸 System snapshot taken: ${snapshot.snapshot_id} (${reason})`);
    
    return snapshot;
  }

  /**
   * Determine current system health
   */
  private determineSystemHealth(): 'healthy' | 'degraded' | 'critical' {
    const criticalAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved && alert.severity === 'critical');
    
    const highAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved && alert.severity === 'high');

    if (criticalAlerts.length > 0) {
      return 'critical';
    } else if (highAlerts.length > 2) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, method: 'auto' | 'manual' = 'manual'): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      console.warn(`Alert not found: ${alertId}`);
      return;
    }

    alert.resolved = true;
    alert.resolution_time = new Date().toISOString();
    alert.resolution_method = method;

    // Update in database
    await this.supabase
      .from('system_metrics')
      .update({
        metadata: {
          alert_data: alert,
          resolved: true
        }
      })
      .eq('metric_type', 'emergency_alert')
      .eq('metric_name', alert.rule_id);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    console.log(`✅ Alert resolved: ${alertId} (${method})`);
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    health: 'healthy' | 'degraded' | 'critical';
    active_alerts: number;
    active_rules: number;
    recent_snapshots: number;
    last_snapshot: string | null;
  } {
    return {
      health: this.determineSystemHealth(),
      active_alerts: this.activeAlerts.size,
      active_rules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      recent_snapshots: this.snapshots.length,
      last_snapshot: this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1].snapshot_time : null
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

// Export singleton instance
export const emergencyResponse = new EmergencyResponseSystem();

// Utility functions
export async function addEmergencyRule(rule: EmergencyRule): Promise<void> {
  return emergencyResponse.addRule(rule);
}

export async function takeEmergencySnapshot(reason?: string): Promise<SystemSnapshot> {
  return emergencyResponse.takeSystemSnapshot(reason);
}

export async function resolveEmergencyAlert(alertId: string, method?: 'auto' | 'manual'): Promise<void> {
  return emergencyResponse.resolveAlert(alertId, method);
}

export function getEmergencyStatus() {
  return emergencyResponse.getSystemStatus();
}
