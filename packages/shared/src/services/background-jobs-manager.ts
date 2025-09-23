/**
 * @fileoverview Background Jobs Framework - Part 2
 * Job Manager and Healthcare Handlers
 *
 * This file contains:
 * - Job Manager for coordinating job execution
 * - Healthcare-specific job handlers
 * - Worker management and monitoring
 * - Integration utilities
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001, NIST Cybersecurity Framework
 */

import {
  calculateRetryDelay,
  CreateJobRequest,
  generateJobId,
  getDefaultJobConfig,
  HealthcareJobType,
  JobData,
  JobExecutionResult,
  JobHandler,
  JobPriority,
  JobQueue,
  JobStatus,
  validateHealthcareContext,
  WorkerConfig,
} from "./background-jobs-framework";
import { logHealthcareError } from '../logging/healthcare-logger';
import healthcareLogger from '../logging/healthcare-logger';

// ============================================================================
// JOB MANAGER
// ============================================================================

/**
 * Comprehensive Job Manager for healthcare workflows
 */
export class JobManager {
  private jobQueue: JobQueue;
  private handlers: Map<HealthcareJobType, JobHandler> = new Map();
  private workers: Map<string, Worker> = new Map();
  private isRunning = false;
  private auditLog: any[] = [];

  constructor(jobQueue: JobQueue) {
    this.jobQueue = jobQueue;
  }

  /**
   * Register job handler
   */
  registerHandler(jobType: HealthcareJobType, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  /**
   * Create and enqueue a job
   */
  async createJob(_request: CreateJobRequest): Promise<string> {
    // Validate healthcare context
    if (_request.healthcareContext) {
      const validation = validateHealthcareContext(
        _request.healthcareContext,
        _request.type,
      );
      if (!validation.isValid) {
        throw new Error(
          `Invalid healthcare _context: ${validation.errors.join(", ")}`,
        );
      }
    }

    // Get job configuration
    const config = {
      ...getDefaultJobConfig(_request.type, _request.healthcareContext),
      ..._request.config,
    };

    // Create job data
    const job: JobData = {
      jobId: generateJobId(),
      type: _request.type,
      priority: _request.priority || JobPriority.MEDIUM,
      status: JobStatus.PENDING,
      _payload: _request._payload,
      createdAt: new Date(),
      scheduledAt: _request.scheduledAt,
      attemptCount: 0,
      maxRetries: config.maxRetries,
      healthcareContext: _request.healthcareContext,
      config,
      dependencies: _request.dependencies,
      tags: _request.tags,
      metadata: _request.metadata,
      auditEvents: [],
      lgpdCompliant: true,
      dependents: [],
      progress: 0,
    };

    // Validate payload with handler if available
    const handler = this.handlers.get(_request.type);
    if (handler) {
      const isValidPayload = await handler.validatePayload(_request._payload);
      if (!isValidPayload) {
        throw new Error(`Invalid payload for job type: ${_request.type}`);
      }
    }

    // Enqueue job
    await this.jobQueue.enqueue(job);

    // Log job creation
    await this.logAudit({
      action: "job_created",
      jobId: job.jobId,
      jobType: _request.type,
      priority: job.priority,
      timestamp: new Date(),
      healthcareContext: _request.healthcareContext,
    });

    return job.jobId;
  }

  /**
   * Start job processing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Job manager is already running");
    }

    this.isRunning = true;
    healthcareLogger.auditLogger.info("Job Manager started successfully", {
      component: 'job-manager',
      action: 'start',
      timestamp: new Date().toISOString()
    });

    // Start processing loop
    this.processJobs();
  }

  /**
   * Stop job processing
   */
  /**
   * Stop job processing
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    // Stop all workers
    const workers = Array.from(this.workers.values());
    for (const worker of workers) {
      await worker.stop();
    }

    healthcareLogger.auditLogger.info("Job Manager stopped successfully", {
      component: 'job-manager',
      action: 'stop',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add worker
   */
  addWorker(config: WorkerConfig): void {
    const worker = new Worker(config, this.jobQueue, this.handlers);
    this.workers.set(config.workerId, worker);

    if (this.isRunning) {
      worker.start();
    }
  }

  /**
   * Remove worker
   */
  async removeWorker(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (worker) {
      await worker.stop();
      this.workers.delete(workerId);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<JobData | null> {
    return this.jobQueue.getJob(jobId);
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.jobQueue.getJob(jobId);
    if (!job) {
      return false;
    }

    if (job.status === JobStatus.PENDING) {
      await this.jobQueue.updateJob(jobId, {
        status: JobStatus.CANCELLED,
        completedAt: new Date(),
      });

      await this.logAudit({
        action: "job_cancelled",
        jobId,
        timestamp: new Date(),
      });

      return true;
    }

    return false;
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.jobQueue.getJob(jobId);
    if (!job || job.status !== JobStatus.FAILED) {
      return false;
    }

    await this.jobQueue.updateJob(jobId, {
      status: JobStatus.PENDING,
      attemptCount: 0,
      error: undefined,
      nextRetryAt: undefined,
    });

    await this.logAudit({
      action: "job_retried",
      jobId,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Get queue statistics
   */
  async getStatistics() {
    const queueStats = await this.jobQueue.getStatistics();
    const workerStats = Array.from(this.workers.values()).map((w) =>
      w.getStatus(),
    );

    return {
      queue: queueStats,
      workers: workerStats,
      handlers: Array.from(this.handlers.keys()),
      isRunning: this.isRunning,
    };
  }

  /**
   * Process jobs (main loop)
   */
  private async processJobs(): Promise<void> {
    while (this.isRunning) {
      try {
        // Check for failed jobs that need retry
        await this.processRetries();

        // Cleanup old jobs
        await this.jobQueue.cleanup();

        // Wait before next iteration
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        logHealthcareError('job-manager', error, {
          method: 'processJobs',
          component: 'job-manager',
          action: 'processing_loop'
        });
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait longer on error
      }
    }
  }

  /**
   * Process job retries
   */
  private async processRetries(): Promise<void> {
    const failedJobs = await this.jobQueue.getJobsByStatus(JobStatus.FAILED);
    const now = new Date();

    for (const job of failedJobs) {
      if (
        job.nextRetryAt &&
        job.nextRetryAt <= now &&
        job.attemptCount < job.maxRetries
      ) {
        await this.jobQueue.updateJob(job.jobId, {
          status: JobStatus.PENDING,
          nextRetryAt: undefined,
        });

        await this.logAudit({
          action: "job_auto_retry",
          jobId: job.jobId,
          attemptCount: job.attemptCount,
          timestamp: now,
        });
      }
    }
  }

  /**
   * Log audit event
   */
  private async logAudit(event: any): Promise<void> {
    this.auditLog.push(event);
    healthcareLogger.auditLogger.info("Job Audit event recorded", {
      component: 'job-manager',
      action: 'audit',
      eventType: event.action,
      jobId: event.jobId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: any): any[] {
    return this.auditLog.filter((event) => {
      if (filters?.jobId && event.jobId !== filters.jobId) return false;
      if (filters?.action && event.action !== filters.action) return false;
      if (filters?.startDate && event.timestamp < filters.startDate)
        return false;
      if (filters?.endDate && event.timestamp > filters.endDate) return false;
      return true;
    });
  }
}

// ============================================================================
// WORKER IMPLEMENTATION
// ============================================================================

/**
 * Job worker for processing jobs
 */
export class Worker {
  private config: WorkerConfig;
  private jobQueue: JobQueue;
  private handlers: Map<HealthcareJobType, JobHandler>;
  private isRunning = false;
  private currentJobs: Map<string, JobData> = new Map();
  private lastHeartbeat = new Date();

  constructor(
    config: WorkerConfig,
    jobQueue: JobQueue,
    handlers: Map<HealthcareJobType, JobHandler>,
  ) {
    this.config = config;
    this.jobQueue = jobQueue;
    this.handlers = handlers;
  }

  /**
   * Start worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastHeartbeat = new Date();

    healthcareLogger.auditLogger.info(`Worker ${this.config.workerId} started successfully`, {
      component: 'job-worker',
      action: 'start',
      workerId: this.config.workerId,
      timestamp: new Date().toISOString()
    });

    // Start processing loop
    this.processJobs();

    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Stop worker
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    // Wait for current jobs to complete
    while (this.currentJobs.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    healthcareLogger.auditLogger.info(`Worker ${this.config.workerId} stopped successfully`, {
      component: 'job-worker',
      action: 'stop',
      workerId: this.config.workerId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      workerId: this.config.workerId,
      isRunning: this.isRunning,
      currentJobs: this.currentJobs.size,
      maxConcurrency: this.config.concurrency,
      lastHeartbeat: this.lastHeartbeat,
      allowedJobTypes: this.config.allowedJobTypes,
    };
  }

  /**
   * Process jobs (main worker loop)
   */
  private async processJobs(): Promise<void> {
    while (this.isRunning) {
      try {
        // Check if we can take more jobs
        if (this.currentJobs.size < this.config.concurrency) {
          const job = await this.getNextJob();

          if (job) {
            this.executeJob(job); // Don't await - run concurrently
          }
        }

        // Wait before next poll
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.pollInterval),
        );
      } catch (error) {
        logHealthcareError('job-worker', error, {
          method: 'processJobs',
          component: 'job-worker',
          workerId: this.config.workerId,
          action: 'processing_loop'
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Get next job to process
   */
  private async getNextJob(): Promise<JobData | null> {
    // Get job from highest priority queue first
    for (const priority of this.config.priorityQueues) {
      const job = await this.jobQueue.dequeue(priority);

      if (job) {
        // Check if worker can handle this job type
        if (
          this.config.allowedJobTypes &&
          !this.config.allowedJobTypes.includes(job.type)
        ) {
          // Put job back in queue
          await this.jobQueue.updateJob(job.jobId, {
            status: JobStatus.PENDING,
          });
          continue;
        }

        // Check emergency jobs only restriction
        if (
          this.config.emergencyJobsOnly &&
          !(
            job.type === HealthcareJobType.EMERGENCY_NOTIFICATION ||
            job.healthcareContext?.clinicalContext === "emergency"
          )
        ) {
          // Put job back in queue
          await this.jobQueue.updateJob(job.jobId, {
            status: JobStatus.PENDING,
          });
          continue;
        }

        return job;
      }
    }

    return null;
  }

  /**
   * Execute a job
   */
  private async executeJob(job: JobData): Promise<void> {
    const startTime = Date.now();
    this.currentJobs.set(job.jobId, job);

    try {
      // Update job with worker info
      await this.jobQueue.updateJob(job.jobId, {
        workerId: this.config.workerId,
        workerHost: "localhost", // In production, use actual hostname
      });

      // Get handler
      const handler = this.handlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      // Execute job with timeout
      const result = await Promise.race([
        handler.execute(job),
        this.createTimeoutPromise(job.config.jobTimeout),
      ]);

      const executionTime = Date.now() - startTime;

      // Update job with success result
      await this.jobQueue.updateJob(job.jobId, {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        result: result.result,
        progress: 100,
        executionTime,
        auditEvents: [...job.auditEvents, ...result.auditEvents],
      });

      healthcareLogger.auditLogger.info(`Job ${job.jobId} completed successfully`, {
        component: 'job-worker',
        action: 'job_completed',
        jobId: job.jobId,
        executionTimeMs: executionTime,
        workerId: this.config.workerId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if we should retry
      if (job.attemptCount < job.maxRetries) {
        const retryDelay = calculateRetryDelay(
          job.attemptCount,
          job.config.retryDelay,
          job.config.exponentialBackoff,
          job.config.maxRetryDelay,
        );

        const nextRetryAt = new Date(Date.now() + retryDelay);

        await this.jobQueue.updateJob(job.jobId, {
          status: JobStatus.FAILED,
          error: errorMessage,
          attemptCount: job.attemptCount + 1,
          lastRetryAt: new Date(),
          nextRetryAt,
          executionTime,
        });

        healthcareLogger.auditLogger.warn(`Job ${job.jobId} failed, scheduled for retry`, {
          component: 'job-worker',
          action: 'job_failed_retry',
          jobId: job.jobId,
          attemptCount: job.attemptCount,
          nextRetryAt: nextRetryAt.toISOString(),
          workerId: this.config.workerId,
          timestamp: new Date().toISOString()
        });
      } else {
        // Move to dead letter queue
        await this.jobQueue.updateJob(job.jobId, {
          status: JobStatus.DEAD_LETTER,
          completedAt: new Date(),
          error: errorMessage,
          executionTime,
        });

        logHealthcareError('job-worker', error, {
          method: 'executeJob',
          component: 'job-worker',
          workerId: this.config.workerId,
          action: 'job_failed_dead_letter',
          jobId: job.jobId,
          attemptCount: job.attemptCount,
          maxRetries: job.maxRetries
        });
      }
    } finally {
      this.currentJobs.delete(job.jobId);
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Job execution timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    const heartbeat = () => {
      if (this.isRunning) {
        this.lastHeartbeat = new Date();
        setTimeout(heartbeat, this.config.heartbeatInterval);
      }
    };

    heartbeat();
  }
}

// ============================================================================
// HEALTHCARE JOB HANDLERS
// ============================================================================

/**
 * Base class for healthcare job handlers
 */
export abstract class BaseHealthcareJobHandler implements JobHandler {
  protected supportedTypes: HealthcareJobType[] = [];

  abstract execute(job: JobData): Promise<JobExecutionResult>;

  getSupportedTypes(): HealthcareJobType[] {
    return this.supportedTypes;
  }

  async validatePayload(_payload: Record<string, any>): Promise<boolean> {
    // Basic validation - override in specific handlers
    return typeof _payload === "object" && _payload !== null;
  }

  async getEstimatedExecutionTime(
    _payload: Record<string, any>,
  ): Promise<number> {
    // Default estimate - override in specific handlers
    return 30000; // 30 seconds
  }

  protected createAuditEvent(action: string, details: Record<string, any>) {
    return {
      timestamp: new Date(),
      action,
      details,
      workerId: "system",
    };
  }
}

/**
 * Patient Data Sync Handler
 */
export class PatientDataSyncHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [HealthcareJobType.PATIENT_DATA_SYNC];

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { patientId, syncType } = job._payload;

    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    const auditEvents = [];

    try {
      auditEvents.push(
        this.createAuditEvent("patient_sync_started", {
          patientId,
          syncType: syncType || "full",
        }),
      );

      // Mock sync process
      await new Promise((resolve) => setTimeout(resolve, 5000));

      auditEvents.push(
        this.createAuditEvent("patient_sync_completed", {
          patientId,
          recordsProcessed: 150,
          lgpdCompliant: true,
        }),
      );

      return {
        progress: 100,
        success: true,
        result: {
          patientId,
          recordsProcessed: 150,
          syncedAt: new Date(),
        },
        auditEvents,
        metrics: {
          executionTime: 5000,
          bytesProcessed: 150 * 1024, // Approximate bytes for 150 records
        },
        metadata: {
          recordsProcessed: 150,
        },
      };
    } catch (error) {
      auditEvents.push(
        this.createAuditEvent("patient_sync_failed", {
          patientId,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );

      throw error;
    }
  }

  override async validatePayload(
    _payload: Record<string, any>,
  ): Promise<boolean> {
    return !!(
      _payload.patientId &&
      _payload.sourceSystem &&
      _payload.targetSystem
    );
  }

  override async getEstimatedExecutionTime(
    _payload: Record<string, any>,
  ): Promise<number> {
    // Estimate based on data volume
    const estimatedRecords = _payload.estimatedRecords || 100;
    return Math.max(5000, estimatedRecords * 50); // 50ms per record
  }
}

/**
 * Emergency Notification Handler
 */
export class EmergencyNotificationHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [
    HealthcareJobType.EMERGENCY_NOTIFICATION,
  ];

  async execute(job: JobData): Promise<JobExecutionResult> {
    const { alertType, severity, message, recipients } = job._payload;

    if (!alertType || !message || !recipients) {
      throw new Error("Alert type, message, and recipients are required");
    }

    const auditEvents = [];
    const deliveryResults = [];

    try {
      auditEvents.push(
        this.createAuditEvent("emergency_alert_initiated", {
          alertType,
          severity,
          recipientCount: recipients.length,
        }),
      );

      // Send notifications to all recipients
      for (const recipient of recipients) {
        // Mock notification delivery
        await new Promise((resolve) => setTimeout(resolve, 100));

        deliveryResults.push({
          recipient,
          status: "delivered",
          deliveredAt: new Date(),
        });

        auditEvents.push(
          this.createAuditEvent("notification_delivered", {
            recipient,
            alertType,
            deliveryMethod: "push_notification",
          }),
        );
      }

      return {
        progress: 100,
        metadata: {
          alertType: job._payload.alertType,
          severity: job._payload.severity,
          recipientCount: recipients.length,
        },
        success: true,
        result: {
          alertId: job.jobId,
          deliveryResults,
          totalRecipients: recipients.length,
          successfulDeliveries: deliveryResults.length,
        },
        auditEvents,
        metrics: {
          executionTime: recipients.length * 100,
          bytesProcessed: message.length * recipients.length,
        },
      };
    } catch (error) {
      auditEvents.push(
        this.createAuditEvent("emergency_alert_failed", {
          alertType,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );

      throw error;
    }
  }

  override async validatePayload(
    _payload: Record<string, any>,
  ): Promise<boolean> {
    return !!(
      _payload.alertType &&
      _payload.message &&
      Array.isArray(_payload.recipients)
    );
  }

  override async getEstimatedExecutionTime(
    _payload: Record<string, any>,
  ): Promise<number> {
    const recipients = _payload.recipients || [];
    return Math.max(1000, recipients.length * 100); // 100ms per recipient
  }
}

/**
 * Compliance Audit Handler
 */
export class ComplianceAuditHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [HealthcareJobType.COMPLIANCE_AUDIT];

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { auditType, scope, dateRange } = job._payload;

    if (!auditType || !scope) {
      throw new Error("Audit type and scope are required");
    }

    const auditEvents = [];

    try {
      auditEvents.push(
        this.createAuditEvent("compliance_audit_started", {
          auditType,
          scope,
          dateRange,
        }),
      );

      // Mock audit process
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const findings = [
        {
          category: "lgpd_compliance",
          status: "compliant",
          details: "All patient consents valid",
        },
        {
          category: "data_retention",
          status: "warning",
          details: "5 records approaching retention limit",
        },
        {
          category: "access_controls",
          status: "compliant",
          details: "All access properly logged",
        },
      ];

      auditEvents.push(
        this.createAuditEvent("compliance_audit_completed", {
          auditType,
          findingsCount: findings.length,
          complianceScore: 95,
        }),
      );

      return {
        progress: 100,
        success: true,
        result: {
          auditId: job.jobId,
          auditType,
          scope,
          findings,
          complianceScore: 95,
          completedAt: new Date(),
        },
        auditEvents,
        metrics: {
          executionTime: 10000,
          bytesProcessed: 1500 * 1024, // Approximate bytes for 1500 records
        },
        metadata: {
          recordsAudited: 1500,
        },
      };
    } catch (error) {
      auditEvents.push(
        this.createAuditEvent("compliance_audit_failed", {
          auditType,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );

      throw error;
    }
  }

  override async validatePayload(
    _payload: Record<string, any>,
  ): Promise<boolean> {
    return !!(_payload.auditType && _payload.scope);
  }

  override async getEstimatedExecutionTime(
    _payload: Record<string, any>,
  ): Promise<number> {
    const scope = _payload.scope || "facility";
    const baseTime =
      scope === "system" ? 60000 : scope === "facility" ? 30000 : 10000;
    return baseTime;
  }
}

/**
 * Data Retention Cleanup Handler
 */
export class DataRetentionCleanupHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [
    HealthcareJobType.DATA_RETENTION_CLEANUP,
  ];

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { dataTypes, retentionPolicy, dryRun = true } = job._payload;

    if (!dataTypes || !retentionPolicy) {
      throw new Error("Data types and retention policy are required");
    }

    const auditEvents = [];
    const cleanupResults = [];

    try {
      auditEvents.push(
        this.createAuditEvent("retention_cleanup_started", {
          dataTypes,
          retentionPolicy,
          dryRun,
        }),
      );

      // Process each data type
      for (const dataType of dataTypes) {
        // Mock cleanup operation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const recordsFound = Math.floor(Math.random() * 100) + 10;
        const recordsProcessed = dryRun ? 0 : recordsFound;

        cleanupResults.push({
          dataType,
          recordsFound,
          recordsProcessed,
          action: dryRun ? "analyzed" : "cleaned",
        });

        auditEvents.push(
          this.createAuditEvent("data_type_processed", {
            dataType,
            recordsFound,
            recordsProcessed,
            lgpdCompliant: true,
          }),
        );
      }

      return {
        progress: 100, // Add required progress property
        success: true,
        result: {
          cleanupId: job.jobId,
          cleanupResults,
          totalRecordsFound: cleanupResults.reduce(
            (sum, _r) => sum + _r.recordsFound,
            0,
          ),
          totalRecordsProcessed: cleanupResults.reduce(
            (sum, _r) => sum + _r.recordsProcessed,
            0,
          ),
          dryRun,
          completedAt: new Date(),
        },
        auditEvents,
        metrics: {
          executionTime: dataTypes.length * 2000,
          bytesProcessed: cleanupResults.reduce(
            (sum, _r) => sum + _r.recordsProcessed * 1024,
            0,
          ),
        },
        metadata: {
          totalRecordsProcessed: cleanupResults.reduce(
            (sum, _r) => sum + _r.recordsProcessed,
            0,
          ),
        },
      };
    } catch (error) {
      auditEvents.push(
        this.createAuditEvent("retention_cleanup_failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );

      throw error;
    }
  }

  override async validatePayload(
    _payload: Record<string, any>,
  ): Promise<boolean> {
    return !!(
      _payload.dataTypes &&
      Array.isArray(_payload.dataTypes) &&
      _payload.retentionPolicy
    );
  }

  override async getEstimatedExecutionTime(
    _payload: Record<string, any>,
  ): Promise<number> {
    return 5000; // 5 seconds base time
  }
}

export default JobManager;
