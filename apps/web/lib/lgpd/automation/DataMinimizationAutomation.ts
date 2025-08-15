import type { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { LGPDComplianceManager } from '../LGPDComplianceManager';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface DataMinimizationRule {
  id: string;
  name: string;
  description: string;
  table_name: string;
  column_name: string;
  data_category:
    | 'personal'
    | 'sensitive'
    | 'biometric'
    | 'health'
    | 'financial'
    | 'location'
    | 'behavioral';
  minimization_type:
    | 'anonymization'
    | 'pseudonymization'
    | 'aggregation'
    | 'deletion'
    | 'masking'
    | 'encryption';
  trigger_condition: string;
  retention_period_days: number;
  business_justification: string;
  legal_basis: string;
  auto_execute: boolean;
  requires_approval: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MinimizationTask {
  id: string;
  rule_id: string;
  task_type: 'scheduled' | 'triggered' | 'manual';
  status:
    | 'pending'
    | 'approved'
    | 'executing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  target_table: string;
  target_columns: string[];
  affected_records_count: number;
  minimization_method: string;
  execution_plan: any;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  approved_by?: string;
  approved_at?: string;
  business_impact_assessment: any;
  rollback_plan: any;
  created_at: string;
  updated_at: string;
}

export interface DataInventory {
  table_name: string;
  column_name: string;
  data_type: string;
  data_category: string;
  sensitivity_level: 'public' | 'internal' | 'confidential' | 'restricted';
  contains_personal_data: boolean;
  contains_sensitive_data: boolean;
  record_count: number;
  last_accessed: string;
  access_frequency: number;
  business_purpose: string;
  legal_basis: string;
  retention_period: number;
  minimization_candidate: boolean;
  minimization_priority: 'low' | 'medium' | 'high' | 'critical';
  last_analyzed: string;
}

export interface MinimizationAnalysis {
  table_name: string;
  total_records: number;
  personal_data_columns: string[];
  sensitive_data_columns: string[];
  minimization_opportunities: Array<{
    column: string;
    current_usage: string;
    recommended_action: string;
    potential_savings: string;
    risk_assessment: string;
    business_impact: string;
  }>;
  compliance_score: number;
  recommendations: string[];
  estimated_storage_reduction: string;
  estimated_risk_reduction: string;
}

export interface MinimizationConfig {
  auto_discovery_enabled: boolean;
  auto_execution_enabled: boolean;
  approval_required_for_sensitive: boolean;
  backup_before_minimization: boolean;
  audit_all_operations: boolean;
  notification_enabled: boolean;
  analysis_frequency_days: number;
  retention_policy_enforcement: boolean;
  anonymization_algorithms: {
    k_anonymity: boolean;
    l_diversity: boolean;
    t_closeness: boolean;
    differential_privacy: boolean;
  };
  pseudonymization_methods: {
    hash_based: boolean;
    encryption_based: boolean;
    tokenization: boolean;
    format_preserving: boolean;
  };
}

export class DataMinimizationAutomation {
  private readonly supabase: SupabaseClient;
  private readonly complianceManager: LGPDComplianceManager;
  private readonly config: MinimizationConfig;
  private analysisInterval: NodeJS.Timeout | null = null;
  private readonly minimizationCallbacks: Array<
    (task: MinimizationTask) => void
  > = [];

  constructor(
    supabase: SupabaseClient,
    complianceManager: LGPDComplianceManager,
    config: MinimizationConfig
  ) {
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }

  /**
   * Start Automated Data Minimization
   */
  async startDataMinimization(analysisIntervalHours = 24): Promise<void> {
    try {
      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
      }

      // Initial data discovery and analysis
      await this.performDataDiscovery();
      await this.analyzeMinimizationOpportunities();

      // Set up automated analysis
      if (this.config.auto_discovery_enabled) {
        this.analysisInterval = setInterval(
          async () => {
            try {
              await this.performDataDiscovery();
              await this.analyzeMinimizationOpportunities();
              await this.processScheduledMinimization();
            } catch (error) {
              console.error('Error in data minimization cycle:', error);
            }
          },
          analysisIntervalHours * 60 * 60 * 1000
        );
      }

      console.log(
        `Data minimization automation started (${analysisIntervalHours}h intervals)`
      );
    } catch (error) {
      console.error('Error starting data minimization:', error);
      throw new Error(`Failed to start data minimization: ${error.message}`);
    }
  }

  /**
   * Stop Data Minimization
   */
  stopDataMinimization(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    console.log('Data minimization automation stopped');
  }

  /**
   * Create Minimization Rule
   */
  async createMinimizationRule(
    ruleData: Omit<DataMinimizationRule, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; rule_id: string }> {
    try {
      // Validate minimization rule
      const validation = await this.validateMinimizationRule(ruleData);
      if (!validation.valid) {
        throw new Error(
          `Invalid minimization rule: ${validation.errors.join(', ')}`
        );
      }

      // Create rule
      const { data: rule, error } = await this.supabase
        .from('lgpd_data_minimization_rules')
        .insert({
          ...ruleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Log rule creation
      await this.complianceManager.logAuditEvent({
        event_type: 'data_minimization',
        resource_type: 'minimization_rule',
        resource_id: rule.id,
        action: 'minimization_rule_created',
        details: {
          rule_name: ruleData.name,
          table_name: ruleData.table_name,
          column_name: ruleData.column_name,
          minimization_type: ruleData.minimization_type,
          auto_execute: ruleData.auto_execute,
        },
      });

      return {
        success: true,
        rule_id: rule.id,
      };
    } catch (error) {
      console.error('Error creating minimization rule:', error);
      throw new Error(`Failed to create minimization rule: ${error.message}`);
    }
  }

  /**
   * Schedule Minimization Task
   */
  async scheduleMinimizationTask(
    ruleId: string,
    scheduledAt: string,
    taskType: 'scheduled' | 'triggered' | 'manual' = 'scheduled'
  ): Promise<{ success: boolean; task_id: string }> {
    try {
      // Get minimization rule
      const { data: rule, error: ruleError } = await this.supabase
        .from('lgpd_data_minimization_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (ruleError) {
        throw ruleError;
      }
      if (!rule) {
        throw new Error('Minimization rule not found');
      }

      // Analyze affected records
      const affectedRecords = await this.analyzeAffectedRecords(rule);

      // Generate execution plan
      const executionPlan = await this.generateExecutionPlan(
        rule,
        affectedRecords
      );

      // Generate business impact assessment
      const businessImpact = await this.assessBusinessImpact(
        rule,
        affectedRecords
      );

      // Generate rollback plan
      const rollbackPlan = await this.generateRollbackPlan(rule, executionPlan);

      // Create minimization task
      const { data: task, error } = await this.supabase
        .from('lgpd_minimization_tasks')
        .insert({
          rule_id: ruleId,
          task_type: taskType,
          status: rule.requires_approval ? 'pending' : 'approved',
          target_table: rule.table_name,
          target_columns: [rule.column_name],
          affected_records_count: affectedRecords.count,
          minimization_method: rule.minimization_type,
          execution_plan: executionPlan,
          scheduled_at: scheduledAt,
          business_impact_assessment: businessImpact,
          rollback_plan: rollbackPlan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Auto-execute if configured and approved
      if (rule.auto_execute && !rule.requires_approval) {
        await this.executeMinimizationTask(task.id);
      }

      // Log task scheduling
      await this.complianceManager.logAuditEvent({
        event_type: 'data_minimization',
        resource_type: 'minimization_task',
        resource_id: task.id,
        action: 'minimization_task_scheduled',
        details: {
          rule_id: ruleId,
          task_type: taskType,
          scheduled_at: scheduledAt,
          affected_records: affectedRecords.count,
          requires_approval: rule.requires_approval,
        },
      });

      return {
        success: true,
        task_id: task.id,
      };
    } catch (error) {
      console.error('Error scheduling minimization task:', error);
      throw new Error(`Failed to schedule minimization task: ${error.message}`);
    }
  }

  /**
   * Execute Minimization Task
   */
  async executeMinimizationTask(
    taskId: string,
    executedBy?: string
  ): Promise<{ success: boolean; records_processed: number }> {
    try {
      // Get task details
      const { data: task, error: taskError } = await this.supabase
        .from('lgpd_minimization_tasks')
        .select('*, lgpd_data_minimization_rules(*)')
        .eq('id', taskId)
        .single();

      if (taskError) {
        throw taskError;
      }
      if (!task) {
        throw new Error('Minimization task not found');
      }

      // Check if task is approved
      if (task.status !== 'approved') {
        throw new Error('Task must be approved before execution');
      }

      // Update task status to executing
      await this.supabase
        .from('lgpd_minimization_tasks')
        .update({
          status: 'executing',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      let recordsProcessed = 0;

      try {
        // Create backup if configured
        if (this.config.backup_before_minimization) {
          await this.createDataBackup(task);
        }

        // Execute minimization based on method
        switch (task.minimization_method) {
          case 'anonymization':
            recordsProcessed = await this.executeAnonymization(task);
            break;
          case 'pseudonymization':
            recordsProcessed = await this.executePseudonymization(task);
            break;
          case 'aggregation':
            recordsProcessed = await this.executeAggregation(task);
            break;
          case 'deletion':
            recordsProcessed = await this.executeDeletion(task);
            break;
          case 'masking':
            recordsProcessed = await this.executeMasking(task);
            break;
          case 'encryption':
            recordsProcessed = await this.executeEncryption(task);
            break;
          default:
            throw new Error(
              `Unsupported minimization method: ${task.minimization_method}`
            );
        }

        // Update task status to completed
        await this.supabase
          .from('lgpd_minimization_tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);

        // Trigger callbacks
        for (const callback of this.minimizationCallbacks) {
          try {
            callback({
              ...task,
              status: 'completed',
              completed_at: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error in minimization callback:', error);
          }
        }

        // Log successful execution
        await this.complianceManager.logAuditEvent({
          event_type: 'data_minimization',
          resource_type: 'minimization_task',
          resource_id: taskId,
          action: 'minimization_task_executed',
          details: {
            minimization_method: task.minimization_method,
            records_processed: recordsProcessed,
            executed_by: executedBy,
            execution_duration:
              Date.now() - new Date(task.started_at!).getTime(),
          },
        });

        return {
          success: true,
          records_processed: recordsProcessed,
        };
      } catch (executionError) {
        // Update task status to failed
        await this.supabase
          .from('lgpd_minimization_tasks')
          .update({
            status: 'failed',
            error_message: executionError.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);

        throw executionError;
      }
    } catch (error) {
      console.error('Error executing minimization task:', error);
      throw new Error(`Failed to execute minimization task: ${error.message}`);
    }
  }

  /**
   * Approve Minimization Task
   */
  async approveMinimizationTask(
    taskId: string,
    approvedBy: string,
    approvalNotes?: string
  ): Promise<{ success: boolean }> {
    try {
      // Update task status
      const { error } = await this.supabase
        .from('lgpd_minimization_tasks')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      // Log approval
      await this.complianceManager.logAuditEvent({
        event_type: 'data_minimization',
        resource_type: 'minimization_task',
        resource_id: taskId,
        action: 'minimization_task_approved',
        details: {
          approved_by: approvedBy,
          approval_notes: approvalNotes,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error approving minimization task:', error);
      throw new Error(`Failed to approve minimization task: ${error.message}`);
    }
  }

  /**
   * Get Data Inventory
   */
  async getDataInventory(includeAnalysis = true): Promise<DataInventory[]> {
    try {
      const { data: inventory, error } = await this.supabase.rpc(
        'get_data_inventory',
        {
          include_analysis: includeAnalysis,
        }
      );

      if (error) {
        throw error;
      }

      return inventory || [];
    } catch (error) {
      console.error('Error getting data inventory:', error);
      throw new Error(`Failed to get data inventory: ${error.message}`);
    }
  }

  /**
   * Analyze Minimization Opportunities
   */
  async analyzeMinimizationOpportunities(
    tableName?: string
  ): Promise<MinimizationAnalysis[]> {
    try {
      const { data: analysis, error } = await this.supabase.rpc(
        'analyze_minimization_opportunities',
        {
          table_name: tableName,
        }
      );

      if (error) {
        throw error;
      }

      return analysis || [];
    } catch (error) {
      console.error('Error analyzing minimization opportunities:', error);
      throw new Error(
        `Failed to analyze minimization opportunities: ${error.message}`
      );
    }
  }

  /**
   * Get Minimization Dashboard
   */
  async getMinimizationDashboard(): Promise<{
    total_tables: number;
    tables_with_personal_data: number;
    minimization_opportunities: number;
    pending_tasks: number;
    completed_tasks_this_month: number;
    storage_saved: string;
    compliance_score: number;
    recent_tasks: MinimizationTask[];
  }> {
    try {
      const { data: dashboard, error } = await this.supabase.rpc(
        'get_minimization_dashboard'
      );

      if (error) {
        throw error;
      }

      return dashboard;
    } catch (error) {
      console.error('Error getting minimization dashboard:', error);
      throw new Error(`Failed to get minimization dashboard: ${error.message}`);
    }
  }

  /**
   * Register Minimization Callback
   */
  onMinimizationCompleted(callback: (task: MinimizationTask) => void): void {
    this.minimizationCallbacks.push(callback);
  }

  // Private helper methods
  private async performDataDiscovery(): Promise<void> {
    try {
      // Discover tables and columns with personal data
      const { error } = await this.supabase.rpc('perform_data_discovery');

      if (error) {
        throw error;
      }

      console.log('Data discovery completed');
    } catch (error) {
      console.error('Error performing data discovery:', error);
    }
  }

  private async processScheduledMinimization(): Promise<void> {
    try {
      // Get pending scheduled tasks
      const { data: tasks, error } = await this.supabase
        .from('lgpd_minimization_tasks')
        .select('*')
        .eq('status', 'approved')
        .lte('scheduled_at', new Date().toISOString());

      if (error) {
        throw error;
      }

      if (!tasks || tasks.length === 0) {
        return;
      }

      // Execute each scheduled task
      for (const task of tasks) {
        try {
          await this.executeMinimizationTask(task.id, 'system');
        } catch (taskError) {
          console.error(
            `Error executing scheduled task ${task.id}:`,
            taskError
          );
        }
      }
    } catch (error) {
      console.error('Error processing scheduled minimization:', error);
    }
  }

  private async validateMinimizationRule(
    rule: any
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.table_name || rule.table_name.trim().length === 0) {
      errors.push('Table name is required');
    }

    if (!rule.column_name || rule.column_name.trim().length === 0) {
      errors.push('Column name is required');
    }

    if (!rule.data_category) {
      errors.push('Data category is required');
    }

    if (!rule.minimization_type) {
      errors.push('Minimization type is required');
    }

    if (!rule.retention_period_days || rule.retention_period_days <= 0) {
      errors.push('Retention period must be greater than 0');
    }

    if (
      !rule.business_justification ||
      rule.business_justification.trim().length === 0
    ) {
      errors.push('Business justification is required');
    }

    if (!rule.legal_basis || rule.legal_basis.trim().length === 0) {
      errors.push('Legal basis is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async analyzeAffectedRecords(
    rule: DataMinimizationRule
  ): Promise<{ count: number; sample: any[] }> {
    const { data: analysis, error } = await this.supabase.rpc(
      'analyze_affected_records',
      {
        table_name: rule.table_name,
        column_name: rule.column_name,
        trigger_condition: rule.trigger_condition,
      }
    );

    if (error) {
      throw error;
    }

    return analysis || { count: 0, sample: [] };
  }

  private async generateExecutionPlan(
    rule: DataMinimizationRule,
    affectedRecords: any
  ): Promise<any> {
    return {
      method: rule.minimization_type,
      target_table: rule.table_name,
      target_column: rule.column_name,
      affected_records: affectedRecords.count,
      execution_steps: this.getExecutionSteps(rule.minimization_type),
      estimated_duration: this.estimateExecutionDuration(
        affectedRecords.count,
        rule.minimization_type
      ),
      resource_requirements: this.getResourceRequirements(
        rule.minimization_type
      ),
      rollback_supported: this.isRollbackSupported(rule.minimization_type),
    };
  }

  private async assessBusinessImpact(
    rule: DataMinimizationRule,
    affectedRecords: any
  ): Promise<any> {
    return {
      data_utility_impact: 'medium', // Would be calculated based on usage patterns
      performance_impact: 'low',
      storage_savings: this.calculateStorageSavings(
        affectedRecords.count,
        rule.minimization_type
      ),
      compliance_benefit: 'high',
      risk_reduction: 'high',
      affected_processes: [], // Would be determined by analyzing dependencies
      mitigation_measures: this.getMitigationMeasures(rule.minimization_type),
    };
  }

  private async generateRollbackPlan(
    rule: DataMinimizationRule,
    executionPlan: any
  ): Promise<any> {
    if (!executionPlan.rollback_supported) {
      return {
        rollback_supported: false,
        reason: 'Irreversible operation',
      };
    }

    return {
      rollback_supported: true,
      backup_location: `backups/${rule.table_name}_${Date.now()}`,
      rollback_steps: this.getRollbackSteps(rule.minimization_type),
      estimated_rollback_duration: executionPlan.estimated_duration * 0.5,
      data_recovery_method: this.getDataRecoveryMethod(rule.minimization_type),
    };
  }

  private async createDataBackup(task: MinimizationTask): Promise<void> {
    const { error } = await this.supabase.rpc('create_minimization_backup', {
      task_id: task.id,
      table_name: task.target_table,
      columns: task.target_columns,
    });

    if (error) {
      throw error;
    }
  }

  private async executeAnonymization(task: MinimizationTask): Promise<number> {
    // Implement k-anonymity, l-diversity, or t-closeness based on config
    const { data: result, error } = await this.supabase.rpc(
      'execute_anonymization',
      {
        task_id: task.id,
        table_name: task.target_table,
        columns: task.target_columns,
        execution_plan: task.execution_plan,
        anonymization_config: this.config.anonymization_algorithms,
      }
    );

    if (error) {
      throw error;
    }
    return result?.records_processed || 0;
  }

  private async executePseudonymization(
    task: MinimizationTask
  ): Promise<number> {
    // Implement pseudonymization using configured methods
    const { data: result, error } = await this.supabase.rpc(
      'execute_pseudonymization',
      {
        task_id: task.id,
        table_name: task.target_table,
        columns: task.target_columns,
        execution_plan: task.execution_plan,
        pseudonymization_config: this.config.pseudonymization_methods,
      }
    );

    if (error) {
      throw error;
    }
    return result?.records_processed || 0;
  }

  private async executeAggregation(task: MinimizationTask): Promise<number> {
    // Implement data aggregation
    const { data: result, error } = await this.supabase.rpc(
      'execute_aggregation',
      {
        task_id: task.id,
        table_name: task.target_table,
        columns: task.target_columns,
        execution_plan: task.execution_plan,
      }
    );

    if (error) {
      throw error;
    }
    return result?.records_processed || 0;
  }

  private async executeDeletion(task: MinimizationTask): Promise<number> {
    // Implement secure deletion
    const { data: result, error } = await this.supabase.rpc(
      'execute_secure_deletion',
      {
        task_id: task.id,
        table_name: task.target_table,
        columns: task.target_columns,
        execution_plan: task.execution_plan,
      }
    );

    if (error) {
      throw error;
    }
    return result?.records_processed || 0;
  }

  private async executeMasking(task: MinimizationTask): Promise<number> {
    // Implement data masking
    const { data: result, error } = await this.supabase.rpc(
      'execute_data_masking',
      {
        task_id: task.id,
        table_name: task.target_table,
        columns: task.target_columns,
        execution_plan: task.execution_plan,
      }
    );

    if (error) {
      throw error;
    }
    return result?.records_processed || 0;
  }

  private async executeEncryption(task: MinimizationTask): Promise<number> {
    // Implement field-level encryption
    const { data: result, error } = await this.supabase.rpc(
      'execute_field_encryption',
      {
        task_id: task.id,
        table_name: task.target_table,
        columns: task.target_columns,
        execution_plan: task.execution_plan,
      }
    );

    if (error) {
      throw error;
    }
    return result?.records_processed || 0;
  }

  private getExecutionSteps(minimizationType: string): string[] {
    const steps: Record<string, string[]> = {
      anonymization: [
        'Analyze data distribution',
        'Apply k-anonymity algorithm',
        'Verify anonymization quality',
        'Update records',
      ],
      pseudonymization: [
        'Generate pseudonym mapping',
        'Apply pseudonymization',
        'Store mapping securely',
        'Verify pseudonymization',
      ],
      aggregation: [
        'Group records by criteria',
        'Calculate aggregated values',
        'Replace individual records',
        'Verify aggregation accuracy',
      ],
      deletion: [
        'Identify records for deletion',
        'Create backup if required',
        'Perform secure deletion',
        'Verify deletion completion',
      ],
      masking: [
        'Identify sensitive fields',
        'Apply masking patterns',
        'Preserve data format',
        'Verify masking effectiveness',
      ],
      encryption: [
        'Generate encryption keys',
        'Encrypt sensitive fields',
        'Store keys securely',
        'Verify encryption integrity',
      ],
    };

    return steps[minimizationType] || ['Execute minimization'];
  }

  private estimateExecutionDuration(
    recordCount: number,
    minimizationType: string
  ): number {
    // Estimate duration in minutes based on record count and method complexity
    const baseTime = Math.ceil(recordCount / 1000); // 1 minute per 1000 records
    const complexityMultiplier: Record<string, number> = {
      deletion: 1,
      masking: 1.5,
      encryption: 2,
      pseudonymization: 2.5,
      aggregation: 3,
      anonymization: 4,
    };

    return baseTime * (complexityMultiplier[minimizationType] || 1);
  }

  private getResourceRequirements(minimizationType: string): any {
    const requirements: Record<string, any> = {
      anonymization: { cpu: 'high', memory: 'high', storage: 'medium' },
      pseudonymization: { cpu: 'medium', memory: 'medium', storage: 'high' },
      aggregation: { cpu: 'medium', memory: 'high', storage: 'low' },
      deletion: { cpu: 'low', memory: 'low', storage: 'low' },
      masking: { cpu: 'low', memory: 'low', storage: 'low' },
      encryption: { cpu: 'medium', memory: 'medium', storage: 'medium' },
    };

    return (
      requirements[minimizationType] || {
        cpu: 'medium',
        memory: 'medium',
        storage: 'medium',
      }
    );
  }

  private isRollbackSupported(minimizationType: string): boolean {
    // Deletion is typically irreversible
    return minimizationType !== 'deletion';
  }

  private calculateStorageSavings(
    recordCount: number,
    minimizationType: string
  ): string {
    // Estimate storage savings based on minimization type
    const avgRecordSize = 1024; // 1KB average
    const savingsMultiplier: Record<string, number> = {
      deletion: 1.0, // 100% savings
      aggregation: 0.8, // 80% savings
      anonymization: 0.1, // 10% savings
      pseudonymization: 0.05, // 5% savings
      masking: 0.02, // 2% savings
      encryption: -0.1, // -10% (encryption overhead)
    };

    const savings =
      recordCount * avgRecordSize * (savingsMultiplier[minimizationType] || 0);
    return this.formatBytes(Math.max(0, savings));
  }

  private getMitigationMeasures(minimizationType: string): string[] {
    const measures: Record<string, string[]> = {
      anonymization: [
        'Maintain data utility metrics',
        'Implement quality checks',
        'Monitor re-identification risks',
      ],
      pseudonymization: [
        'Secure pseudonym key management',
        'Regular key rotation',
        'Access control for mapping tables',
      ],
      aggregation: [
        'Preserve statistical accuracy',
        'Maintain business intelligence capabilities',
        'Document aggregation methods',
      ],
      deletion: [
        'Comprehensive backup strategy',
        'Legal compliance verification',
        'Business impact assessment',
      ],
      masking: [
        'Format preservation',
        'Referential integrity maintenance',
        'Test environment synchronization',
      ],
      encryption: [
        'Key management procedures',
        'Performance impact monitoring',
        'Backup encryption verification',
      ],
    };

    return measures[minimizationType] || ['Standard data protection measures'];
  }

  private getRollbackSteps(minimizationType: string): string[] {
    const steps: Record<string, string[]> = {
      anonymization: [
        'Restore from backup',
        'Verify data integrity',
        'Update dependent systems',
      ],
      pseudonymization: [
        'Reverse pseudonym mapping',
        'Restore original values',
        'Verify restoration accuracy',
      ],
      aggregation: [
        'Restore individual records',
        'Recalculate aggregations',
        'Verify data consistency',
      ],
      masking: [
        'Restore original values',
        'Verify unmasking accuracy',
        'Update dependent processes',
      ],
      encryption: [
        'Decrypt fields',
        'Restore plaintext values',
        'Verify decryption integrity',
      ],
    };

    return steps[minimizationType] || ['Restore from backup'];
  }

  private getDataRecoveryMethod(minimizationType: string): string {
    const methods: Record<string, string> = {
      anonymization: 'backup_restoration',
      pseudonymization: 'mapping_reversal',
      aggregation: 'backup_restoration',
      masking: 'value_restoration',
      encryption: 'decryption',
    };

    return methods[minimizationType] || 'backup_restoration';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }
}
