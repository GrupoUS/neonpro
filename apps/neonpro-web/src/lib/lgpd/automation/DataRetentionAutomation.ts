import type { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { LGPDComplianceManager } from "../LGPDComplianceManager";

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  data_category: string;
  table_name: string;
  retention_period_days: number;
  legal_basis: string;
  deletion_method: "hard_delete" | "soft_delete" | "anonymize" | "archive";
  grace_period_days: number;
  auto_execution: boolean;
  requires_approval: boolean;
  notification_before_days: number;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface RetentionSchedule {
  id: string;
  policy_id: string;
  scheduled_date: string;
  execution_date?: string;
  status: "scheduled" | "pending_approval" | "approved" | "executed" | "failed" | "cancelled";
  affected_records: number;
  execution_method: string;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
  execution_details?: any;
  created_at: string;
}

export interface RetentionExecution {
  id: string;
  schedule_id: string;
  policy_id: string;
  execution_start: string;
  execution_end?: string;
  status: "running" | "completed" | "failed" | "cancelled";
  records_processed: number;
  records_deleted: number;
  records_anonymized: number;
  records_archived: number;
  errors: any[];
  execution_log: any[];
  verification_hash: string;
}

export interface DataArchive {
  id: string;
  retention_execution_id: string;
  archive_location: string;
  archive_format: "json" | "csv" | "parquet" | "encrypted";
  compression: boolean;
  encryption: boolean;
  data_hash: string;
  record_count: number;
  archive_size_bytes: number;
  created_at: string;
  expires_at?: string;
  retrieval_possible: boolean;
}

export interface RetentionConfig {
  auto_execution_enabled: boolean;
  approval_workflow_enabled: boolean;
  notification_enabled: boolean;
  backup_before_deletion: boolean;
  verification_required: boolean;
  batch_size: number;
  execution_window: {
    start_hour: number;
    end_hour: number;
    allowed_days: string[];
  };
  notification_channels: {
    email: boolean;
    webhook: boolean;
    dashboard: boolean;
  };
}

export class DataRetentionAutomation {
  private supabase: SupabaseClient;
  private complianceManager: LGPDComplianceManager;
  private config: RetentionConfig;
  private executionInterval: NodeJS.Timeout | null = null;

  constructor(
    supabase: SupabaseClient,
    complianceManager: LGPDComplianceManager,
    config: RetentionConfig,
  ) {
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }

  /**
   * Start Automated Retention Processing
   */
  async startAutomatedRetention(checkIntervalHours: number = 24): Promise<void> {
    try {
      if (this.executionInterval) {
        clearInterval(this.executionInterval);
      }

      // Initial retention check
      await this.processRetentionSchedules();

      // Set up automated processing
      if (this.config.auto_execution_enabled) {
        this.executionInterval = setInterval(
          async () => {
            try {
              await this.processRetentionSchedules();
            } catch (error) {
              console.error("Error in retention processing cycle:", error);
            }
          },
          checkIntervalHours * 60 * 60 * 1000,
        );
      }

      console.log(`Automated retention processing started (${checkIntervalHours}h intervals)`);
    } catch (error) {
      console.error("Error starting automated retention:", error);
      throw new Error(`Failed to start automated retention: ${error.message}`);
    }
  }

  /**
   * Stop Automated Retention Processing
   */
  stopAutomatedRetention(): void {
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
    console.log("Automated retention processing stopped");
  }

  /**
   * Create Retention Policy
   */
  async createRetentionPolicy(
    policyData: Omit<RetentionPolicy, "id" | "created_at" | "updated_at">,
  ): Promise<{ success: boolean; policy_id: string }> {
    try {
      // Validate policy data
      const validation = await this.validateRetentionPolicy(policyData);
      if (!validation.valid) {
        throw new Error(`Invalid retention policy: ${validation.errors.join(", ")}`);
      }

      // Create policy
      const { data: policy, error } = await this.supabase
        .from("lgpd_retention_policies")
        .insert({
          ...policyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      // Log policy creation
      await this.complianceManager.logAuditEvent({
        event_type: "retention_policy",
        resource_type: "retention_policy",
        resource_id: policy.id,
        action: "policy_created",
        details: {
          policy_name: policyData.name,
          data_category: policyData.data_category,
          retention_period_days: policyData.retention_period_days,
          auto_execution: policyData.auto_execution,
        },
      });

      return {
        success: true,
        policy_id: policy.id,
      };
    } catch (error) {
      console.error("Error creating retention policy:", error);
      throw new Error(`Failed to create retention policy: ${error.message}`);
    }
  }

  /**
   * Schedule Retention Execution
   */
  async scheduleRetentionExecution(
    policyId: string,
    scheduledDate?: string,
  ): Promise<{ success: boolean; schedule_id: string; affected_records: number }> {
    try {
      // Get policy details
      const { data: policy, error: policyError } = await this.supabase
        .from("lgpd_retention_policies")
        .select("*")
        .eq("id", policyId)
        .eq("active", true)
        .single();

      if (policyError) throw policyError;
      if (!policy) throw new Error("Retention policy not found or inactive");

      // Calculate affected records
      const affectedRecords = await this.calculateAffectedRecords(policy);

      // Determine execution date
      const executionDate = scheduledDate || this.calculateNextExecutionDate(policy);

      // Create schedule
      const { data: schedule, error: scheduleError } = await this.supabase
        .from("lgpd_retention_schedules")
        .insert({
          policy_id: policyId,
          scheduled_date: executionDate,
          status: policy.requires_approval ? "pending_approval" : "scheduled",
          affected_records: affectedRecords.count,
          execution_method: policy.deletion_method,
          approval_required: policy.requires_approval,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (scheduleError) throw scheduleError;

      // Send notifications if enabled
      if (this.config.notification_enabled) {
        await this.sendRetentionNotification({
          type: "schedule_created",
          policy_name: policy.name,
          scheduled_date: executionDate,
          affected_records: affectedRecords.count,
          requires_approval: policy.requires_approval,
        });
      }

      // Log scheduling
      await this.complianceManager.logAuditEvent({
        event_type: "retention_scheduling",
        resource_type: "retention_schedule",
        resource_id: schedule.id,
        action: "retention_scheduled",
        details: {
          policy_id: policyId,
          policy_name: policy.name,
          scheduled_date: executionDate,
          affected_records: affectedRecords.count,
          requires_approval: policy.requires_approval,
        },
      });

      return {
        success: true,
        schedule_id: schedule.id,
        affected_records: affectedRecords.count,
      };
    } catch (error) {
      console.error("Error scheduling retention execution:", error);
      throw new Error(`Failed to schedule retention execution: ${error.message}`);
    }
  }

  /**
   * Execute Retention Schedule
   */
  async executeRetentionSchedule(
    scheduleId: string,
    forceExecution: boolean = false,
  ): Promise<{ success: boolean; execution_id: string; results: RetentionExecution }> {
    try {
      // Get schedule details
      const { data: schedule, error: scheduleError } = await this.supabase
        .from("lgpd_retention_schedules")
        .select("*, lgpd_retention_policies(*)")
        .eq("id", scheduleId)
        .single();

      if (scheduleError) throw scheduleError;
      if (!schedule) throw new Error("Retention schedule not found");

      // Validate execution conditions
      if (!forceExecution) {
        const canExecute = await this.validateExecutionConditions(schedule);
        if (!canExecute.valid) {
          throw new Error(`Cannot execute retention: ${canExecute.reason}`);
        }
      }

      // Create execution record
      const { data: execution, error: executionError } = await this.supabase
        .from("lgpd_retention_executions")
        .insert({
          schedule_id: scheduleId,
          policy_id: schedule.policy_id,
          execution_start: new Date().toISOString(),
          status: "running",
          records_processed: 0,
          records_deleted: 0,
          records_anonymized: 0,
          records_archived: 0,
          errors: [],
          execution_log: [],
        })
        .select("id")
        .single();

      if (executionError) throw executionError;

      // Update schedule status
      await this.supabase
        .from("lgpd_retention_schedules")
        .update({
          status: "executing",
          execution_date: new Date().toISOString(),
        })
        .eq("id", scheduleId);

      try {
        // Execute retention based on policy
        const results = await this.performRetentionExecution(
          execution.id,
          schedule.lgpd_retention_policies,
          schedule.affected_records,
        );

        // Update execution record with results
        await this.supabase
          .from("lgpd_retention_executions")
          .update({
            execution_end: new Date().toISOString(),
            status: "completed",
            records_processed: results.records_processed,
            records_deleted: results.records_deleted,
            records_anonymized: results.records_anonymized,
            records_archived: results.records_archived,
            execution_log: results.execution_log,
            verification_hash: results.verification_hash,
          })
          .eq("id", execution.id);

        // Update schedule status
        await this.supabase
          .from("lgpd_retention_schedules")
          .update({ status: "executed" })
          .eq("id", scheduleId);

        // Log successful execution
        await this.complianceManager.logAuditEvent({
          event_type: "retention_execution",
          resource_type: "retention_execution",
          resource_id: execution.id,
          action: "retention_executed_successfully",
          details: {
            schedule_id: scheduleId,
            policy_name: schedule.lgpd_retention_policies.name,
            records_processed: results.records_processed,
            records_deleted: results.records_deleted,
            records_anonymized: results.records_anonymized,
            records_archived: results.records_archived,
          },
        });

        return {
          success: true,
          execution_id: execution.id,
          results,
        };
      } catch (executionError) {
        // Update execution record with error
        await this.supabase
          .from("lgpd_retention_executions")
          .update({
            execution_end: new Date().toISOString(),
            status: "failed",
            errors: [{ error: executionError.message, timestamp: new Date().toISOString() }],
          })
          .eq("id", execution.id);

        // Update schedule status
        await this.supabase
          .from("lgpd_retention_schedules")
          .update({ status: "failed" })
          .eq("id", scheduleId);

        throw executionError;
      }
    } catch (error) {
      console.error("Error executing retention schedule:", error);
      throw new Error(`Failed to execute retention schedule: ${error.message}`);
    }
  }

  /**
   * Process All Pending Retention Schedules
   */
  async processRetentionSchedules(): Promise<{
    processed: number;
    executed: number;
    failed: number;
    skipped: number;
  }> {
    try {
      const results = {
        processed: 0,
        executed: 0,
        failed: 0,
        skipped: 0,
      };

      // Get pending schedules
      const { data: pendingSchedules, error } = await this.supabase
        .from("lgpd_retention_schedules")
        .select("*, lgpd_retention_policies(*)")
        .in("status", ["scheduled", "approved"])
        .lte("scheduled_date", new Date().toISOString())
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      if (!pendingSchedules || pendingSchedules.length === 0) {
        console.log("No pending retention schedules found");
        return results;
      }

      console.log(`Processing ${pendingSchedules.length} pending retention schedules`);

      // Process each schedule
      for (const schedule of pendingSchedules) {
        results.processed++;

        try {
          // Check if within execution window
          if (!this.isWithinExecutionWindow()) {
            results.skipped++;
            continue;
          }

          // Execute retention
          await this.executeRetentionSchedule(schedule.id);
          results.executed++;

          console.log(`Successfully executed retention schedule ${schedule.id}`);
        } catch (scheduleError) {
          results.failed++;
          console.error(`Failed to execute retention schedule ${schedule.id}:`, scheduleError);

          // Log failure
          await this.complianceManager.logAuditEvent({
            event_type: "retention_execution",
            resource_type: "retention_schedule",
            resource_id: schedule.id,
            action: "retention_execution_failed",
            details: {
              error: scheduleError.message,
              policy_name: schedule.lgpd_retention_policies?.name,
            },
          });
        }
      }

      // Log processing summary
      await this.complianceManager.logAuditEvent({
        event_type: "retention_processing",
        resource_type: "retention_batch",
        action: "batch_processing_completed",
        details: {
          processed: results.processed,
          executed: results.executed,
          failed: results.failed,
          skipped: results.skipped,
          processing_timestamp: new Date().toISOString(),
        },
      });

      return results;
    } catch (error) {
      console.error("Error processing retention schedules:", error);
      throw new Error(`Failed to process retention schedules: ${error.message}`);
    }
  }

  /**
   * Get Retention Status Report
   */
  async getRetentionStatusReport(): Promise<{
    active_policies: number;
    pending_schedules: number;
    overdue_schedules: number;
    recent_executions: any[];
    compliance_status: string;
    next_execution: string | null;
  }> {
    try {
      const { data: report, error } = await this.supabase.rpc("get_retention_status_report");

      if (error) throw error;

      return report;
    } catch (error) {
      console.error("Error getting retention status report:", error);
      throw new Error(`Failed to get retention status report: ${error.message}`);
    }
  }

  /**
   * Approve Retention Schedule
   */
  async approveRetentionSchedule(
    scheduleId: string,
    approvedBy: string,
    notes?: string,
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from("lgpd_retention_schedules")
        .update({
          status: "approved",
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          approval_notes: notes,
        })
        .eq("id", scheduleId)
        .eq("status", "pending_approval");

      if (error) throw error;

      // Log approval
      await this.complianceManager.logAuditEvent({
        event_type: "retention_approval",
        resource_type: "retention_schedule",
        resource_id: scheduleId,
        action: "retention_schedule_approved",
        details: {
          approved_by: approvedBy,
          approval_notes: notes,
          approved_at: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error approving retention schedule:", error);
      throw new Error(`Failed to approve retention schedule: ${error.message}`);
    }
  }

  // Private helper methods
  private async validateRetentionPolicy(
    policy: any,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!policy.name || policy.name.trim().length === 0) {
      errors.push("Policy name is required");
    }

    if (!policy.data_category || policy.data_category.trim().length === 0) {
      errors.push("Data category is required");
    }

    if (!policy.table_name || policy.table_name.trim().length === 0) {
      errors.push("Table name is required");
    }

    if (!policy.retention_period_days || policy.retention_period_days <= 0) {
      errors.push("Retention period must be greater than 0");
    }

    if (!policy.legal_basis || policy.legal_basis.trim().length === 0) {
      errors.push("Legal basis is required");
    }

    if (!["hard_delete", "soft_delete", "anonymize", "archive"].includes(policy.deletion_method)) {
      errors.push("Invalid deletion method");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async calculateAffectedRecords(
    policy: RetentionPolicy,
  ): Promise<{ count: number; sample: any[] }> {
    try {
      const { data: result, error } = await this.supabase.rpc("calculate_affected_records", {
        table_name: policy.table_name,
        retention_period_days: policy.retention_period_days,
        data_category: policy.data_category,
      });

      if (error) throw error;

      return result;
    } catch (error) {
      console.error("Error calculating affected records:", error);
      return { count: 0, sample: [] };
    }
  }

  private calculateNextExecutionDate(policy: RetentionPolicy): string {
    const now = new Date();
    const executionDate = new Date(now);

    // Add grace period
    executionDate.setDate(executionDate.getDate() + policy.grace_period_days);

    // Ensure execution is within allowed window
    if (!this.isWithinExecutionWindow(executionDate)) {
      // Move to next allowed day
      while (!this.isWithinExecutionWindow(executionDate)) {
        executionDate.setDate(executionDate.getDate() + 1);
      }

      // Set to start of execution window
      executionDate.setHours(this.config.execution_window.start_hour, 0, 0, 0);
    }

    return executionDate.toISOString();
  }

  private async validateExecutionConditions(
    schedule: any,
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check if schedule is approved (if approval required)
    if (schedule.approval_required && schedule.status !== "approved") {
      return { valid: false, reason: "Schedule requires approval" };
    }

    // Check if within execution window
    if (!this.isWithinExecutionWindow()) {
      return { valid: false, reason: "Outside execution window" };
    }

    // Check if policy is still active
    if (!schedule.lgpd_retention_policies?.active) {
      return { valid: false, reason: "Retention policy is inactive" };
    }

    return { valid: true };
  }

  private isWithinExecutionWindow(date?: Date): boolean {
    const checkDate = date || new Date();
    const hour = checkDate.getHours();
    const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    const withinHours =
      hour >= this.config.execution_window.start_hour &&
      hour < this.config.execution_window.end_hour;
    const withinDays = this.config.execution_window.allowed_days.includes(dayName);

    return withinHours && withinDays;
  }

  private async performRetentionExecution(
    executionId: string,
    policy: RetentionPolicy,
    expectedRecords: number,
  ): Promise<RetentionExecution> {
    const executionLog: any[] = [];
    let recordsProcessed = 0;
    let recordsDeleted = 0;
    let recordsAnonymized = 0;
    let recordsArchived = 0;

    try {
      executionLog.push({
        timestamp: new Date().toISOString(),
        action: "execution_started",
        details: { policy_name: policy.name, expected_records: expectedRecords },
      });

      // Create backup if required
      if (this.config.backup_before_deletion) {
        executionLog.push({
          timestamp: new Date().toISOString(),
          action: "backup_started",
        });

        const archiveResult = await this.createDataArchive(executionId, policy);
        recordsArchived = archiveResult.record_count;

        executionLog.push({
          timestamp: new Date().toISOString(),
          action: "backup_completed",
          details: { records_archived: recordsArchived, archive_id: archiveResult.id },
        });
      }

      // Execute retention based on deletion method
      switch (policy.deletion_method) {
        case "hard_delete": {
          const deleteResult = await this.performHardDelete(policy);
          recordsDeleted = deleteResult.deleted_count;
          recordsProcessed = deleteResult.processed_count;
          break;
        }

        case "soft_delete": {
          const softDeleteResult = await this.performSoftDelete(policy);
          recordsDeleted = softDeleteResult.deleted_count;
          recordsProcessed = softDeleteResult.processed_count;
          break;
        }

        case "anonymize": {
          const anonymizeResult = await this.performAnonymization(policy);
          recordsAnonymized = anonymizeResult.anonymized_count;
          recordsProcessed = anonymizeResult.processed_count;
          break;
        }

        case "archive":
          if (!this.config.backup_before_deletion) {
            const archiveResult = await this.createDataArchive(executionId, policy);
            recordsArchived = archiveResult.record_count;
            recordsProcessed = archiveResult.record_count;
          }
          break;
      }

      executionLog.push({
        timestamp: new Date().toISOString(),
        action: "execution_completed",
        details: {
          records_processed: recordsProcessed,
          records_deleted: recordsDeleted,
          records_anonymized: recordsAnonymized,
          records_archived: recordsArchived,
        },
      });

      // Generate verification hash
      const verificationHash = await this.generateVerificationHash({
        execution_id: executionId,
        policy_id: policy.id,
        records_processed: recordsProcessed,
        records_deleted: recordsDeleted,
        records_anonymized: recordsAnonymized,
        records_archived: recordsArchived,
        execution_timestamp: new Date().toISOString(),
      });

      return {
        id: executionId,
        schedule_id: "",
        policy_id: policy.id,
        execution_start: new Date().toISOString(),
        execution_end: new Date().toISOString(),
        status: "completed",
        records_processed: recordsProcessed,
        records_deleted: recordsDeleted,
        records_anonymized: recordsAnonymized,
        records_archived: recordsArchived,
        errors: [],
        execution_log: executionLog,
        verification_hash: verificationHash,
      };
    } catch (error) {
      executionLog.push({
        timestamp: new Date().toISOString(),
        action: "execution_failed",
        error: error.message,
      });

      throw error;
    }
  }

  private async createDataArchive(
    executionId: string,
    policy: RetentionPolicy,
  ): Promise<DataArchive> {
    const { data: archive, error } = await this.supabase.rpc("create_data_archive", {
      execution_id: executionId,
      policy_id: policy.id,
      table_name: policy.table_name,
      retention_period_days: policy.retention_period_days,
    });

    if (error) throw error;

    return archive;
  }

  private async performHardDelete(
    policy: RetentionPolicy,
  ): Promise<{ deleted_count: number; processed_count: number }> {
    const { data: result, error } = await this.supabase.rpc("perform_hard_delete", {
      table_name: policy.table_name,
      retention_period_days: policy.retention_period_days,
      batch_size: this.config.batch_size,
    });

    if (error) throw error;

    return result;
  }

  private async performSoftDelete(
    policy: RetentionPolicy,
  ): Promise<{ deleted_count: number; processed_count: number }> {
    const { data: result, error } = await this.supabase.rpc("perform_soft_delete", {
      table_name: policy.table_name,
      retention_period_days: policy.retention_period_days,
      batch_size: this.config.batch_size,
    });

    if (error) throw error;

    return result;
  }

  private async performAnonymization(
    policy: RetentionPolicy,
  ): Promise<{ anonymized_count: number; processed_count: number }> {
    const { data: result, error } = await this.supabase.rpc("perform_anonymization", {
      table_name: policy.table_name,
      retention_period_days: policy.retention_period_days,
      batch_size: this.config.batch_size,
    });

    if (error) throw error;

    return result;
  }

  private async generateVerificationHash(data: any): Promise<string> {
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
  }

  private async sendRetentionNotification(notification: any): Promise<void> {
    // Implementation for retention notifications
    console.log("Retention notification sent:", notification.type);
  }
}
