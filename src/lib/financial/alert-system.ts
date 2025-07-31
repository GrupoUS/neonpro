/**
 * Financial Alert System for NeonPro
 * Sistema de alertas automatizados para monitoramento financeiro crítico
 */

import { createClient } from '@/app/utils/supabase/server';
import { 
  FinancialAlert,
  AlertRule,
  AlertThreshold,
  AlertChannel,
  AlertHistory,
  AlertEscalation,
  FinancialAPIResponse,
  AlertSeverity,
  AlertType
} from './types/cash-flow';

// ====================================================================
// FINANCIAL ALERT SYSTEM ENGINE
// ====================================================================

export class FinancialAlertSystem {
  private supabase = createClient();
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, FinancialAlert> = new Map();

  constructor() {
    this.initializeAlertSystem();
  }

  /**
   * Initialize alert system and load rules
   */
  private async initializeAlertSystem(): Promise<void> {
    try {
      // Load alert rules from database
      await this.loadAlertRules();
      
      // Setup real-time monitoring
      await this.setupRealtimeMonitoring();
      
      // Initialize default rules if none exist
      if (this.alertRules.size === 0) {
        await this.createDefaultAlertRules();
      }
      
      console.log('Financial alert system initialized with', this.alertRules.size, 'rules');
    } catch (error) {
      console.error('Failed to initialize financial alert system:', error);
      throw error;
    }
  }

  /**
   * Check all alert conditions and trigger alerts if needed
   */
  async checkAlertConditions(): Promise<FinancialAPIResponse<FinancialAlert[]>> {
    const start = performance.now();
    
    try {
      const triggeredAlerts: FinancialAlert[] = [];

      // Check each alert rule
      for (const [ruleId, rule] of this.alertRules) {
        if (!rule.is_active) continue;

        const alertResult = await this.evaluateAlertRule(rule);
        if (alertResult.triggered) {
          const alert = await this.createAlert(rule, alertResult.data);
          triggeredAlerts.push(alert);
        }
      }

      // Process and send triggered alerts
      await this.processTriggeredAlerts(triggeredAlerts);

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: triggeredAlerts,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check alert conditions',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Create new alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialAPIResponse<AlertRule>> {
    const start = performance.now();
    
    try {
      // Validate rule configuration
      await this.validateAlertRule(rule);

      // Create the rule
      const { data: newRule, error } = await this.supabase
        .from('financial_alert_rules')
        .insert([{
          ...rule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local cache
      this.alertRules.set(newRule.id, newRule);

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: newRule,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create alert rule',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(
    severity?: AlertSeverity,
    type?: AlertType
  ): Promise<FinancialAPIResponse<FinancialAlert[]>> {
    const start = performance.now();
    
    try {
      let query = this.supabase
        .from('financial_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (severity) {
        query = query.eq('severity', severity);
      }

      if (type) {
        query = query.eq('type', type);
      }

      const { data: alerts, error } = await query;
      if (error) throw error;

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: alerts || [],
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active alerts',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(
    alertId: string,
    resolution: string,
    userId: string
  ): Promise<FinancialAPIResponse<FinancialAlert>> {
    const start = performance.now();
    
    try {
      const { data: resolvedAlert, error } = await this.supabase
        .from('financial_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          resolution
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      // Remove from active alerts cache
      this.activeAlerts.delete(alertId);

      // Log resolution
      await this.logAlertHistory(alertId, 'resolved', { resolution, resolved_by: userId });

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: resolvedAlert,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve alert',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Send alert through configured channels
   */
  async sendAlert(
    alert: FinancialAlert,
    channels: AlertChannel[] = ['dashboard']
  ): Promise<FinancialAPIResponse<boolean>> {
    const start = performance.now();
    
    try {
      const results = await Promise.all(
        channels.map(channel => this.sendAlertToChannel(alert, channel))
      );

      const allSuccessful = results.every(result => result);

      // Log alert sending
      await this.logAlertHistory(alert.id, 'sent', { 
        channels, 
        success: allSuccessful 
      });

      const executionTime = performance.now() - start;
      
      return {
        success: allSuccessful,
        data: allSuccessful,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send alert',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Configure alert escalation
   */
  async configureEscalation(
    ruleId: string,
    escalation: AlertEscalation
  ): Promise<FinancialAPIResponse<AlertRule>> {
    const start = performance.now();
    
    try {
      const { data: updatedRule, error } = await this.supabase
        .from('financial_alert_rules')
        .update({
          escalation_config: escalation,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      // Update local cache
      this.alertRules.set(ruleId, updatedRule);

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: updatedRule,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to configure escalation',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(
    days: number = 30
  ): Promise<FinancialAPIResponse<{
    total_alerts: number;
    critical_alerts: number;
    warning_alerts: number;
    resolved_alerts: number;
    average_resolution_time: number;
    top_alert_types: { type: string; count: number }[];
  }>> {
    const start = performance.now();
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: alerts, error } = await this.supabase
        .from('financial_alerts')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = this.calculateAlertStatistics(alerts || []);

      const executionTime = performance.now() - start;
      
      return {
        success: true,
        data: stats,
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - start;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get alert statistics',
        timestamp: new Date(),
        execution_time_ms: executionTime
      };
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  /**
   * Load alert rules from database
   */
  private async loadAlertRules(): Promise<void> {
    const { data: rules, error } = await this.supabase
      .from('financial_alert_rules')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    (rules || []).forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  /**
   * Setup real-time monitoring for financial data changes
   */
  private async setupRealtimeMonitoring(): Promise<void> {
    // Subscribe to cash flow changes
    this.supabase
      .channel('financial_monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cash_flow_entries'
      }, () => {
        this.checkAlertConditions();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cash_flow_accounts'
      }, () => {
        this.checkAlertConditions();
      })
      .subscribe();
  }

  /**
   * Create default alert rules
   */
  private async createDefaultAlertRules(): Promise<void> {
    const defaultRules: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Low Cash Balance Alert',
        description: 'Alert when account balance falls below minimum threshold',
        type: 'low_balance',
        severity: 'warning',
        condition: {
          metric: 'account_balance',
          operator: 'less_than',
          threshold: 5000,
          account_id: null
        },
        channels: ['dashboard', 'email'],
        is_active: true,
        escalation_config: {
          levels: [
            { after_minutes: 30, severity: 'critical', channels: ['dashboard', 'email', 'sms'] }
          ]
        }
      },
      {
        name: 'Negative Cash Flow Alert',
        description: 'Alert when daily cash flow becomes negative',
        type: 'negative_cash_flow',
        severity: 'critical',
        condition: {
          metric: 'daily_cash_flow',
          operator: 'less_than',
          threshold: 0,
          period: 'daily'
        },
        channels: ['dashboard', 'email', 'sms'],
        is_active: true,
        escalation_config: {
          levels: [
            { after_minutes: 15, severity: 'critical', channels: ['dashboard', 'email', 'sms'] }
          ]
        }
      },
      {
        name: 'High Expense Alert',
        description: 'Alert when daily expenses exceed normal patterns',
        type: 'high_expenses',
        severity: 'warning',
        condition: {
          metric: 'daily_expenses',
          operator: 'greater_than',
          threshold: 10000,
          period: 'daily'
        },
        channels: ['dashboard', 'email'],
        is_active: true,
        escalation_config: {
          levels: []
        }
      }
    ];

    for (const rule of defaultRules) {
      await this.createAlertRule(rule);
    }
  }

  /**
   * Evaluate if alert rule conditions are met
   */
  private async evaluateAlertRule(rule: AlertRule): Promise<{ triggered: boolean; data?: any }> {
    try {
      const { condition } = rule;
      
      switch (condition.metric) {
        case 'account_balance':
          return await this.checkAccountBalanceCondition(condition);
          
        case 'daily_cash_flow':
          return await this.checkCashFlowCondition(condition);
          
        case 'daily_expenses':
          return await this.checkExpenseCondition(condition);
          
        default:
          return { triggered: false };
      }
    } catch (error) {
      console.error('Error evaluating alert rule:', rule.id, error);
      return { triggered: false };
    }
  }

  /**
   * Check account balance condition
   */
  private async checkAccountBalanceCondition(condition: any): Promise<{ triggered: boolean; data?: any }> {
    let query = this.supabase
      .from('cash_flow_accounts')
      .select('id, name, current_balance, minimum_balance')
      .eq('is_active', true);

    if (condition.account_id) {
      query = query.eq('id', condition.account_id);
    }

    const { data: accounts, error } = await query;
    if (error) throw error;

    const triggeredAccounts = (accounts || []).filter(account => {
      const balance = account.current_balance;
      const threshold = condition.threshold || account.minimum_balance;
      
      switch (condition.operator) {
        case 'less_than':
          return balance < threshold;
        case 'greater_than':
          return balance > threshold;
        case 'equals':
          return balance === threshold;
        default:
          return false;
      }
    });

    return {
      triggered: triggeredAccounts.length > 0,
      data: { accounts: triggeredAccounts, threshold: condition.threshold }
    };
  }

  /**
   * Check cash flow condition
   */
  private async checkCashFlowCondition(condition: any): Promise<{ triggered: boolean; data?: any }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const { data: entries, error } = await this.supabase
      .from('cash_flow_entries')
      .select('amount, type')
      .gte('date', startOfDay.toISOString())
      .eq('is_forecast', false);

    if (error) throw error;

    const dailyCashFlow = (entries || []).reduce((sum, entry) => {
      return sum + (entry.type === 'inflow' ? entry.amount : -entry.amount);
    }, 0);

    const triggered = this.evaluateCondition(dailyCashFlow, condition.operator, condition.threshold);

    return {
      triggered,
      data: { daily_cash_flow: dailyCashFlow, threshold: condition.threshold }
    };
  }

  /**
   * Check expense condition
   */
  private async checkExpenseCondition(condition: any): Promise<{ triggered: boolean; data?: any }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const { data: entries, error } = await this.supabase
      .from('cash_flow_entries')
      .select('amount')
      .gte('date', startOfDay.toISOString())
      .eq('type', 'outflow')
      .eq('is_forecast', false);

    if (error) throw error;

    const dailyExpenses = (entries || []).reduce((sum, entry) => sum + entry.amount, 0);

    const triggered = this.evaluateCondition(dailyExpenses, condition.operator, condition.threshold);

    return {
      triggered,
      data: { daily_expenses: dailyExpenses, threshold: condition.threshold }
    };
  }

  /**
   * Evaluate condition based on operator
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'less_than':
        return value < threshold;
      case 'greater_than':
        return value > threshold;
      case 'equals':
        return value === threshold;
      case 'less_than_or_equal':
        return value <= threshold;
      case 'greater_than_or_equal':
        return value >= threshold;
      default:
        return false;
    }
  }

  /**
   * Create new alert from rule and data
   */
  private async createAlert(rule: AlertRule, data: any): Promise<FinancialAlert> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: FinancialAlert = {
      id: alertId,
      rule_id: rule.id,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: this.generateAlertMessage(rule, data),
      data,
      channels: rule.channels,
      is_resolved: false,
      created_at: new Date(),
      resolved_at: null,
      resolved_by: null,
      resolution: null
    };

    // Save to database
    const { error } = await this.supabase
      .from('financial_alerts')
      .insert([{
        ...alert,
        created_at: alert.created_at.toISOString()
      }]);

    if (error) {
      console.error('Failed to save alert to database:', error);
    }

    // Add to active alerts cache
    this.activeAlerts.set(alertId, alert);

    return alert;
  }

  /**
   * Generate alert message based on rule and data
   */
  private generateAlertMessage(rule: AlertRule, data: any): string {
    switch (rule.type) {
      case 'low_balance':
        const account = data.accounts[0];
        return `Saldo baixo na conta ${account.name}: R$ ${account.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
      case 'negative_cash_flow':
        return `Cash flow negativo hoje: R$ ${data.daily_cash_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
      case 'high_expenses':
        return `Despesas altas hoje: R$ ${data.daily_expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
      default:
        return `Alerta financeiro: ${rule.name}`;
    }
  }

  /**
   * Process triggered alerts
   */
  private async processTriggeredAlerts(alerts: FinancialAlert[]): Promise<void> {
    for (const alert of alerts) {
      // Send alert through configured channels
      await this.sendAlert(alert, alert.channels);
      
      // Check for escalation
      await this.checkEscalation(alert);
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendAlertToChannel(alert: FinancialAlert, channel: AlertChannel): Promise<boolean> {
    try {
      switch (channel) {
        case 'dashboard':
          // Real-time dashboard notification (handled by subscriptions)
          return true;
          
        case 'email':
          return await this.sendEmailAlert(alert);
          
        case 'sms':
          return await this.sendSMSAlert(alert);
          
        case 'webhook':
          return await this.sendWebhookAlert(alert);
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel}:`, error);
      return false;
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: FinancialAlert): Promise<boolean> {
    // Implementation would integrate with email service (SendGrid, SES, etc.)
    console.log('Sending email alert:', alert.title);
    return true;
  }

  /**
   * Send SMS alert
   */
  private async sendSMSAlert(alert: FinancialAlert): Promise<boolean> {
    // Implementation would integrate with SMS service (Twilio, etc.)
    console.log('Sending SMS alert:', alert.title);
    return true;
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: FinancialAlert): Promise<boolean> {
    // Implementation would send HTTP POST to configured webhook URL
    console.log('Sending webhook alert:', alert.title);
    return true;
  }

  /**
   * Check and trigger escalation if needed
   */
  private async checkEscalation(alert: FinancialAlert): Promise<void> {
    const rule = this.alertRules.get(alert.rule_id);
    if (!rule?.escalation_config?.levels.length) return;

    // Schedule escalation checks
    rule.escalation_config.levels.forEach(level => {
      setTimeout(async () => {
        // Check if alert is still unresolved
        const { data: currentAlert } = await this.supabase
          .from('financial_alerts')
          .select('is_resolved')
          .eq('id', alert.id)
          .single();

        if (!currentAlert?.is_resolved) {
          // Escalate alert
          const escalatedAlert = {
            ...alert,
            severity: level.severity,
            channels: level.channels
          };
          
          await this.sendAlert(escalatedAlert, level.channels);
          await this.logAlertHistory(alert.id, 'escalated', { level });
        }
      }, level.after_minutes * 60 * 1000);
    });
  }

  /**
   * Log alert history
   */
  private async logAlertHistory(
    alertId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    const { error } = await this.supabase
      .from('financial_alert_history')
      .insert([{
        alert_id: alertId,
        action,
        metadata,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Failed to log alert history:', error);
    }
  }

  /**
   * Validate alert rule configuration
   */
  private async validateAlertRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    if (!rule.name || rule.name.trim().length === 0) {
      throw new Error('Alert rule name is required');
    }

    if (!rule.condition || !rule.condition.metric) {
      throw new Error('Alert rule condition is required');
    }

    if (!rule.channels || rule.channels.length === 0) {
      throw new Error('At least one alert channel is required');
    }
  }

  /**
   * Calculate alert statistics
   */
  private calculateAlertStatistics(alerts: any[]): any {
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
    const resolvedAlerts = alerts.filter(a => a.is_resolved).length;

    // Calculate average resolution time
    const resolvedAlertsWithTime = alerts.filter(a => a.is_resolved && a.resolved_at);
    const averageResolutionTime = resolvedAlertsWithTime.length > 0 
      ? resolvedAlertsWithTime.reduce((sum, alert) => {
          const created = new Date(alert.created_at);
          const resolved = new Date(alert.resolved_at);
          return sum + (resolved.getTime() - created.getTime());
        }, 0) / resolvedAlertsWithTime.length / (1000 * 60) // Convert to minutes
      : 0;

    // Calculate top alert types
    const typeCounts = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});

    const topAlertTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_alerts: totalAlerts,
      critical_alerts: criticalAlerts,
      warning_alerts: warningAlerts,
      resolved_alerts: resolvedAlerts,
      average_resolution_time: averageResolutionTime,
      top_alert_types: topAlertTypes
    };
  }
}