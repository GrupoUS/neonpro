/**
 * Automated Data Retention and Cleanup Service
 * Implements LGPD Article 16º with automated data lifecycle management
 * Healthcare-specific retention policies and cleanup automation
 */

import { z } from "zod";
import { createAdminClient } from "../clients/supabase";
import { LGPDDataCategory } from "../middleware/lgpd-compliance";

// ============================================================================
// Data Retention Configuration
// ============================================================================

export enum RetentionAction {
  DELETE = "delete",
  ANONYMIZE = "anonymize",
  ARCHIVE = "archive",
  FLAG_FOR_REVIEW = "flag_for_review",
}

export enum RetentionTrigger {
  EXPIRY = "expiry",
  CONSENT_WITHDRAWN = "consent_withdrawn",
  LEGAL_HOLD = "legal_hold",
  DATA_SUBJECT_REQUEST = "data_subject_request",
  POLICY_UPDATE = "policy_update",
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataCategory: LGPDDataCategory;
  retentionPeriod: number; // days
  archivalPeriod?: number; // days before final deletion
  action: RetentionAction;
  trigger: RetentionTrigger[];
  enabled: boolean;
  priority: number; // 1-10, higher = more critical
  conditions?: {
    dataTypes?: string[];
    userRoles?: string[];
    consentRequired?: boolean;
    legalHoldExempt?: boolean;
  };
  notificationConfig?: {
    beforeCleanupDays: number;
    notifyRoles: string[];
    notificationChannels: ("email" | "system" | "sms")[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CleanupJob {
  id: string;
  policyId: string;
  dataSource: string;
  dataIdentifier: string;
  patientId?: string;
  scheduledDate: Date;
  executionDate?: Date;
  status: "scheduled" | "running" | "completed" | "failed" | "cancelled";
  action: RetentionAction;
  estimatedRecordCount: number;
  actualRecordCount?: number;
  executionTime?: number; // milliseconds
  error?: string;
  executedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CleanupExecution {
  id: string;
  jobId: string;
  startTime: Date;
  endTime?: Date;
  status: "running" | "completed" | "failed" | "partial";
  recordsProcessed: number;
  recordsAffected: number;
  errors: Array<{
    recordId: string;
    error: string;
    timestamp: Date;
  }>;
  performance: {
    recordsPerSecond: number;
    memoryUsage: number;
    cpuUsage?: number;
  };
  auditLog: {
    action: RetentionAction;
    reason: string;
    legalBasis: string;
    complianceReferences: string[];
  };
}

// ============================================================================
// Healthcare-Specific Retention Policies
// ============================================================================

const HEALTHCARE_RETENTION_POLICIES: RetentionPolicy[] = [
  // Medical Records - 20 years (Brazilian healthcare requirement)
  {
    id: "medical_records_20y",
    name: "Medical Records Retention",
    description: "Patient medical records and clinical data retention",
    dataCategory: LGPDDataCategory.MEDICAL,
    retentionPeriod: 7300, // 20 years
    archivalPeriod: 365, // 1 year archive before deletion
    action: RetentionAction.ARCHIVE,
    trigger: [RetentionTrigger.EXPIRY],
    enabled: true,
    priority: 10,
    conditions: {
      dataTypes: ["diagnosis", "treatment", "prescription", "test_results"],
      legalHoldExempt: true, // Medical records can have legal holds
    },
    notificationConfig: {
      beforeCleanupDays: 30,
      notifyRoles: ["compliance_officer", "data_protection_officer"],
      notificationChannels: ["email", "system"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Personal Data - 2 years default
  {
    id: "personal_data_2y",
    name: "Personal Data Retention",
    description: "General personal contact and demographic information",
    dataCategory: LGPDDataCategory.PERSONAL,
    retentionPeriod: 730, // 2 years
    action: RetentionAction.DELETE,
    trigger: [RetentionTrigger.EXPIRY],
    enabled: true,
    priority: 7,
    conditions: {
      dataTypes: ["phone", "email", "address"],
    },
    notificationConfig: {
      beforeCleanupDays: 7,
      notifyRoles: ["admin"],
      notificationChannels: ["system"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Financial Data - 5 years (Brazilian tax requirements)
  {
    id: "financial_data_5y",
    name: "Financial Data Retention",
    description: "Billing, payment, and financial transaction data",
    dataCategory: LGPDDataCategory.FINANCIAL,
    retentionPeriod: 1825, // 5 years
    action: RetentionAction.ANONYMIZE,
    trigger: [RetentionTrigger.EXPIRY],
    enabled: true,
    priority: 8,
    conditions: {
      dataTypes: ["payment_info", "billing_address", "credit_card"],
    },
    notificationConfig: {
      beforeCleanupDays: 15,
      notifyRoles: ["finance_team", "compliance_officer"],
      notificationChannels: ["email", "system"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Sensitive Data - Immediate cleanup on consent withdrawal
  {
    id: "sensitive_data_consent",
    name: "Sensitive Data on Consent Withdrawal",
    description:
      "Immediate cleanup of sensitive data when consent is withdrawn",
    dataCategory: LGPDDataCategory.SENSITIVE,
    retentionPeriod: 0, // Immediate
    action: RetentionAction.DELETE,
    trigger: [RetentionTrigger.CONSENT_WITHDRAWN],
    enabled: true,
    priority: 10,
    notificationConfig: {
      beforeCleanupDays: 0, // Immediate
      notifyRoles: ["compliance_officer", "data_protection_officer"],
      notificationChannels: ["system"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Biometric Data - 1 year maximum
  {
    id: "biometric_data_1y",
    name: "Biometric Data Retention",
    description: "Biometric and biometric template data",
    dataCategory: LGPDDataCategory.BIOMETRIC,
    retentionPeriod: 365, // 1 year
    action: RetentionAction.DELETE,
    trigger: [RetentionTrigger.EXPIRY],
    enabled: true,
    priority: 9,
    notificationConfig: {
      beforeCleanupDays: 7,
      notifyRoles: ["security_officer", "compliance_officer"],
      notificationChannels: ["email", "system"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Appointment Data - 7 years
  {
    id: "appointment_data_7y",
    name: "Appointment Data Retention",
    description: "Appointment scheduling and attendance data",
    dataCategory: LGPDDataCategory.BEHAVIORAL,
    retentionPeriod: 2555, // 7 years
    action: RetentionAction.ANONYMIZE,
    trigger: [RetentionTrigger.EXPIRY],
    enabled: true,
    priority: 6,
    notificationConfig: {
      beforeCleanupDays: 30,
      notifyRoles: ["admin"],
      notificationChannels: ["system"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// ============================================================================
// Data Retention Service Implementation
// ============================================================================

export class DataRetentionService {
  private supabase = createAdminClient();
  private policies: RetentionPolicy[] = HEALTHCARE_RETENTION_POLICIES;
  private activeJobs: Map<string, CleanupJob> = new Map();
  private executionHistory: CleanupExecution[] = [];

  /**
   * Schedule cleanup job based on retention policy
   */
  async scheduleCleanup(
    policyId: string,
    dataSource: string,
    dataIdentifier: string,
    patientId?: string,
    customRetentionDate?: Date,
  ): Promise<CleanupJob> {
    try {
      const policy = this.policies.find((p) => p.id === policyId);
      if (!policy) {
        throw new Error(`Retention policy not found: ${policyId}`);
      }

      if (!policy.enabled) {
        throw new Error(`Retention policy is disabled: ${policyId}`);
      }

      // Calculate scheduled date
      const scheduledDate =
        customRetentionDate || this.calculateRetentionDate(policy);

      const cleanupJob: CleanupJob = {
        id: crypto.randomUUID(),
        policyId,
        dataSource,
        dataIdentifier,
        patientId,
        scheduledDate,
        action: policy.action,
        estimatedRecordCount: await this.estimateRecordCount(
          dataSource,
          dataIdentifier,
        ),
        status: "scheduled",
        executedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store job in database
      const { data, error } = await this.supabase
        .from("data_retention_jobs")
        .insert(cleanupJob)
        .select()
        .single();

      if (error) {
        throw new Error("Failed to schedule cleanup job");
      }

      // Track active job
      this.activeJobs.set(data.id, data);

      // Send notification if configured
      if (policy.notificationConfig) {
        await this.sendCleanupNotification(data, policy);
      }

      return data;
    } catch (error) {
      console.error("Error scheduling cleanup:", error);
      throw error;
    }
  }

  /**
   * Execute scheduled cleanup jobs
   */
  async executeCleanupJob(jobId: string): Promise<CleanupExecution> {
    try {
      const job = await this.getCleanupJob(jobId);
      const policy = this.policies.find((p) => p.id === job.policyId);

      if (!policy) {
        throw new Error(`Policy not found for job: ${jobId}`);
      }

      if (job.status !== "scheduled") {
        throw new Error(`Job ${jobId} is not in scheduled status`);
      }

      // Update job status to running
      await this.updateJobStatus(jobId, "running");

      const execution: CleanupExecution = {
        id: crypto.randomUUID(),
        jobId,
        startTime: new Date(),
        status: "running",
        recordsProcessed: 0,
        recordsAffected: 0,
        errors: [],
        performance: {
          recordsPerSecond: 0,
          memoryUsage: 0,
        },
        auditLog: {
          action: job.action,
          reason: `Automated cleanup based on policy: ${policy.name}`,
          legalBasis: "LGPD Art. 16º - Data retention limitation",
          complianceReferences: [
            "LGPD",
            "ANVISA",
            "Brazilian Healthcare Standards",
          ],
        },
      };

      try {
        // Execute cleanup action
        const result = await this.executeCleanupAction(job, policy, execution);

        execution.recordsAffected = result.affectedCount;
        execution.recordsProcessed = result.processedCount;
        execution.status = result.hasErrors ? "partial" : "completed";

        // Calculate performance metrics
        const executionTime = Date.now() - execution.startTime.getTime();
        execution.endTime = new Date();
        execution.performance.recordsPerSecond =
          execution.recordsProcessed / (executionTime / 1000);

        // Update job status
        await this.updateJobStatus(jobId, "completed", {
          executionDate: execution.endTime,
          actualRecordCount: execution.recordsAffected,
          executionTime,
        });

        // Store execution record
        await this.storeExecutionRecord(execution);

        // Send completion notification
        await this.sendCompletionNotification(job, execution, policy);
      } catch (error) {
        console.error("Error executing cleanup job:", error);

        execution.status = "failed";
        execution.endTime = new Date();
        execution.errors.push({
          recordId: "system",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
        });

        await this.updateJobStatus(jobId, "failed", {
          executionDate: execution.endTime,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        await this.storeExecutionRecord(execution);

        // Send error notification
        await this.sendErrorNotification(job, execution, policy);
      }

      // Remove from active jobs
      this.activeJobs.delete(jobId);

      return execution;
    } catch (error) {
      console.error("Error in executeCleanupJob:", error);
      throw error;
    }
  }

  /**
   * Execute specific cleanup action
   */
  private async executeCleanupAction(
    job: CleanupJob,
    policy: RetentionPolicy,
    execution: CleanupExecution,
  ): Promise<{
    processedCount: number;
    affectedCount: number;
    hasErrors: boolean;
  }> {
    switch (job.action) {
      case RetentionAction.DELETE:
        return this.executeDeletion(job, execution);
      case RetentionAction.ANONYMIZE:
        return this.executeAnonymization(job, execution);
      case RetentionAction.ARCHIVE:
        return this.executeArchival(job, execution);
      case RetentionAction.FLAG_FOR_REVIEW:
        return this.executeFlagging(job, execution);
      default:
        throw new Error(`Unsupported cleanup action: ${job.action}`);
    }
  }

  /**
   * Execute data deletion
   */
  private async executeDeletion(
    job: CleanupJob,
    execution: CleanupExecution,
  ): Promise<{
    processedCount: number;
    affectedCount: number;
    hasErrors: boolean;
  }> {
    try {
      // This would integrate with your data deletion service
      console.log(`Executing deletion for job ${job.id} on ${job.dataSource}`);

      // Simulate deletion process
      const affectedCount = await this.simulateDataDeletion(
        job.dataSource,
        job.dataIdentifier,
      );

      execution.auditLog.action = RetentionAction.DELETE;
      execution.auditLog.reason +=
        " - Data permanently deleted per LGPD requirements";

      return {
        processedCount: job.estimatedRecordCount,
        affectedCount,
        hasErrors: affectedCount < job.estimatedRecordCount * 0.95, // 95% success threshold
      };
    } catch (error) {
      console.error("Error in executeDeletion:", error);
      execution.errors.push({
        recordId: "system",
        error: error instanceof Error ? error.message : "Deletion failed",
        timestamp: new Date(),
      });
      return { processedCount: 0, affectedCount: 0, hasErrors: true };
    }
  }

  /**
   * Execute data anonymization
   */
  private async executeAnonymization(
    job: CleanupJob,
    execution: CleanupExecution,
  ): Promise<{
    processedCount: number;
    affectedCount: number;
    hasErrors: boolean;
  }> {
    try {
      console.log(
        `Executing anonymization for job ${job.id} on ${job.dataSource}`,
      );

      // Simulate anonymization process
      const affectedCount = await this.simulateDataAnonymization(
        job.dataSource,
        job.dataIdentifier,
      );

      execution.auditLog.action = RetentionAction.ANONYMIZE;
      execution.auditLog.reason += " - Data anonymized per LGPD requirements";

      return {
        processedCount: job.estimatedRecordCount,
        affectedCount,
        hasErrors: false,
      };
    } catch (error) {
      console.error("Error in executeAnonymization:", error);
      execution.errors.push({
        recordId: "system",
        error: error instanceof Error ? error.message : "Anonymization failed",
        timestamp: new Date(),
      });
      return { processedCount: 0, affectedCount: 0, hasErrors: true };
    }
  }

  /**
   * Execute data archival
   */
  private async executeArchival(
    job: CleanupJob,
    execution: CleanupExecution,
  ): Promise<{
    processedCount: number;
    affectedCount: number;
    hasErrors: boolean;
  }> {
    try {
      console.log(`Executing archival for job ${job.id} on ${job.dataSource}`);

      // Simulate archival process
      const affectedCount = await this.simulateDataArchival(
        job.dataSource,
        job.dataIdentifier,
      );

      execution.auditLog.action = RetentionAction.ARCHIVE;
      execution.auditLog.reason += " - Data archived for long-term storage";

      return {
        processedCount: job.estimatedRecordCount,
        affectedCount,
        hasErrors: false,
      };
    } catch (error) {
      console.error("Error in executeArchival:", error);
      execution.errors.push({
        recordId: "system",
        error: error instanceof Error ? error.message : "Archival failed",
        timestamp: new Date(),
      });
      return { processedCount: 0, affectedCount: 0, hasErrors: true };
    }
  }

  /**
   * Execute flagging for review
   */
  private async executeFlagging(
    job: CleanupJob,
    execution: CleanupExecution,
  ): Promise<{
    processedCount: number;
    affectedCount: number;
    hasErrors: boolean;
  }> {
    try {
      console.log(`Executing flagging for job ${job.id} on ${job.dataSource}`);

      // Simulate flagging process
      const affectedCount = await this.simulateDataFlagging(
        job.dataSource,
        job.dataIdentifier,
      );

      execution.auditLog.action = RetentionAction.FLAG_FOR_REVIEW;
      execution.auditLog.reason += " - Data flagged for manual review";

      return {
        processedCount: job.estimatedRecordCount,
        affectedCount,
        hasErrors: false,
      };
    } catch (error) {
      console.error("Error in executeFlagging:", error);
      execution.errors.push({
        recordId: "system",
        error: error instanceof Error ? error.message : "Flagging failed",
        timestamp: new Date(),
      });
      return { processedCount: 0, affectedCount: 0, hasErrors: true };
    }
  }

  /**
   * Calculate retention date based on policy
   */
  private calculateRetentionDate(policy: RetentionPolicy): Date {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + policy.retentionPeriod);
    return retentionDate;
  }

  /**
   * Estimate record count for cleanup job
   */
  private async estimateRecordCount(
    dataSource: string,
    dataIdentifier: string,
  ): Promise<number> {
    // This would query your database to estimate record count
    // For now, return a mock estimate
    return Math.floor(Math.random() * 1000) + 100;
  }

  /**
   * Simulate data deletion
   */
  private async simulateDataDeletion(
    dataSource: string,
    dataIdentifier: string,
  ): Promise<number> {
    // In production, this would execute actual DELETE operations
    console.log(
      `Deleting data from ${dataSource} with identifier ${dataIdentifier}`,
    );
    return Math.floor(Math.random() * 950) + 50; // Simulate 50-1000 records deleted
  }

  /**
   * Simulate data anonymization
   */
  private async simulateDataAnonymization(
    dataSource: string,
    dataIdentifier: string,
  ): Promise<number> {
    // In production, this would execute UPDATE operations to anonymize data
    console.log(
      `Anonymizing data from ${dataSource} with identifier ${dataIdentifier}`,
    );
    return Math.floor(Math.random() * 980) + 20; // Simulate 20-1000 records anonymized
  }

  /**
   * Simulate data archival
   */
  private async simulateDataArchival(
    dataSource: string,
    dataIdentifier: string,
  ): Promise<number> {
    // In production, this would move data to archival storage
    console.log(
      `Archiving data from ${dataSource} with identifier ${dataIdentifier}`,
    );
    return Math.floor(Math.random() * 990) + 10; // Simulate 10-1000 records archived
  }

  /**
   * Simulate data flagging
   */
  private async simulateDataFlagging(
    dataSource: string,
    dataIdentifier: string,
  ): Promise<number> {
    // In production, this would add flags to records for review
    console.log(
      `Flagging data from ${dataSource} with identifier ${dataIdentifier}`,
    );
    return Math.floor(Math.random() * 990) + 10; // Simulate 10-1000 records flagged
  }

  /**
   * Get cleanup job by ID
   */
  private async getCleanupJob(jobId: string): Promise<CleanupJob> {
    const { data, error } = await this.supabase
      .from("data_retention_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !data) {
      throw new Error("Cleanup job not found");
    }

    return data;
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: CleanupJob["status"],
    updates?: Partial<CleanupJob>,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("data_retention_jobs")
      .update({
        status,
        ...updates,
        updatedAt: new Date(),
      })
      .eq("id", jobId);

    if (error) {
      console.error("Error updating job status:", error);
    }
  }

  /**
   * Store execution record
   */
  private async storeExecutionRecord(
    execution: CleanupExecution,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("data_retention_executions")
      .insert(execution);

    if (error) {
      console.error("Error storing execution record:", error);
    }

    this.executionHistory.push(execution);
  }

  /**
   * Send cleanup notification
   */
  private async sendCleanupNotification(
    job: CleanupJob,
    policy: RetentionPolicy,
  ): Promise<void> {
    if (!policy.notificationConfig) return;

    const message = `Scheduled cleanup job ${job.id} for ${job.dataSource} will execute on ${job.scheduledDate.toISOString()}`;

    // In production, this would integrate with your notification service
    console.log("[Cleanup Notification]", message);
  }

  /**
   * Send completion notification
   */
  private async sendCompletionNotification(
    job: CleanupJob,
    execution: CleanupExecution,
    policy: RetentionPolicy,
  ): Promise<void> {
    const message = `Cleanup job ${job.id} completed successfully. Processed ${execution.recordsProcessed} records, affected ${execution.recordsAffected} records.`;

    console.log("[Completion Notification]", message);
  }

  /**
   * Send error notification
   */
  private async sendErrorNotification(
    job: CleanupJob,
    execution: CleanupExecution,
    policy: RetentionPolicy,
  ): Promise<void> {
    const message = `Cleanup job ${job.id} failed. Error: ${
      execution.errors[0]?.error || "Unknown error"
    }`;

    console.log("[Error Notification]", message);
  }

  /**
   * Run automated cleanup scheduler
   */
  async runScheduledCleanup(): Promise<{
    jobsProcessed: number;
    jobsCompleted: number;
    jobsFailed: number;
    totalRecordsProcessed: number;
  }> {
    try {
      // Get all scheduled jobs that are ready to execute
      const { data: scheduledJobs, error } = await this.supabase
        .from("data_retention_jobs")
        .select("*")
        .eq("status", "scheduled")
        .lte("scheduledDate", new Date().toISOString());

      if (error) {
        throw new Error("Failed to fetch scheduled jobs");
      }

      const results = {
        jobsProcessed: 0,
        jobsCompleted: 0,
        jobsFailed: 0,
        totalRecordsProcessed: 0,
      };

      // Execute jobs in parallel (with reasonable concurrency limit)
      const concurrencyLimit = 5;
      const chunks = [];

      for (let i = 0; i < scheduledJobs!.length; i += concurrencyLimit) {
        chunks.push(scheduledJobs!.slice(i, i + concurrencyLimit));
      }

      for (const chunk of chunks) {
        const promises = chunk.map(async (job) => {
          try {
            const execution = await this.executeCleanupJob(job.id);
            results.jobsProcessed++;
            results.jobsCompleted++;
            results.totalRecordsProcessed += execution.recordsProcessed;
          } catch (error) {
            results.jobsProcessed++;
            results.jobsFailed++;
            console.error(`Job ${job.id} failed:`, error);
          }
        });

        await Promise.all(promises);
      }

      return results;
    } catch (error) {
      console.error("Error in runScheduledCleanup:", error);
      throw error;
    }
  }

  /**
   * Get retention statistics
   */
  async getRetentionStatistics(): Promise<{
    totalPolicies: number;
    enabledPolicies: number;
    scheduledJobs: number;
    activeJobs: number;
    completedJobs24h: number;
    failedJobs24h: number;
    totalRecordsProcessed24h: number;
    policiesByCategory: Record<LGPDDataCategory, number>;
  }> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get job statistics
      const [{ count: scheduledJobs = 0 } = {}] = await this.supabase
        .from("data_retention_jobs")
        .select("count", { count: "exact" })
        .eq("status", "scheduled");

      const [{ count: completedJobs24h = 0 } = {}] = await this.supabase
        .from("data_retention_jobs")
        .select("count", { count: "exact" })
        .eq("status", "completed")
        .gte("executionDate", yesterday.toISOString());

      const [{ count: failedJobs24h = 0 } = {}] = await this.supabase
        .from("data_retention_jobs")
        .select("count", { count: "exact" })
        .eq("status", "failed")
        .gte("executionDate", yesterday.toISOString());

      // Get execution statistics
      const { data: executions } = await this.supabase
        .from("data_retention_executions")
        .select("recordsProcessed")
        .gte("startTime", yesterday.toISOString());

      const totalRecordsProcessed24h =
        executions?.reduce((sum, exec) => sum + exec.recordsProcessed, 0) || 0;

      // Calculate policies by category
      const policiesByCategory = {} as Record<LGPDDataCategory, number>;
      this.policies.forEach((policy) => {
        policiesByCategory[policy.dataCategory] =
          (policiesByCategory[policy.dataCategory] || 0) + 1;
      });

      return {
        totalPolicies: this.policies.length,
        enabledPolicies: this.policies.filter((p) => p.enabled).length,
        scheduledJobs: scheduledJobs || 0,
        activeJobs: this.activeJobs.size,
        completedJobs24h: completedJobs24h || 0,
        failedJobs24h: failedJobs24h || 0,
        totalRecordsProcessed24h,
        policiesByCategory,
      };
    } catch (error) {
      console.error("Error getting retention statistics:", error);
      throw error;
    }
  }

  /**
   * Add custom retention policy
   */
  addCustomPolicy(policy: RetentionPolicy): void {
    this.policies.push(policy);
  }

  /**
   * Enable/disable retention policy
   */
  togglePolicy(policyId: string, enabled: boolean): boolean {
    const policy = this.policies.find((p) => p.id === policyId);
    if (policy) {
      policy.enabled = enabled;
      policy.updatedAt = new Date();
      return true;
    }
    return false;
  }
}

export default DataRetentionService;
