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

import { z } from 'zod';
import {
  calculateRetryDelay,
  CreateJobRequest,
  generateJobId,
  getDefaultJobConfig,
  HealthcareJobContext,
  HealthcareJobType,
  JobData,
  JobExecutionResult,
  JobHandler,
  JobPriority,
  JobQueue,
  JobStatus,
  requiresEmergencyProcessing,
  validateHealthcareContext,
  WorkerConfig,
} from './background-jobs-framework';

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
  async createJob(request: CreateJobRequest): Promise<string> {
    // Validate healthcare context
    if (request.healthcareContext) {
      const validation = validateHealthcareContext(request.healthcareContext, request.type);
      if (!validation.isValid) {
        throw new Error(`Invalid healthcare context: ${validation.errors.join(', ')}`);
      }
    }

    // Get job configuration
    const config = {
      ...getDefaultJobConfig(request.type, request.healthcareContext),
      ...request.config,
    };

    // Create job data
    const job: JobData = {
      jobId: generateJobId(),
      type: request.type,
      priority: request.priority || JobPriority.MEDIUM,
      status: JobStatus.PENDING,
      payload: request.payload,
      createdAt: new Date(),
      scheduledAt: request.scheduledAt,
      attemptCount: 0,
      maxRetries: config.maxRetries,
      healthcareContext: request.healthcareContext,
      config,
      dependencies: request.dependencies,
      tags: request.tags,
      metadata: request.metadata,
      auditEvents: [],
      lgpdCompliant: true,
      dependents: [],
    };

    // Validate payload with handler if available
    const handler = this.handlers.get(request.type);
    if (handler) {
      const isValidPayload = await handler.validatePayload(request.payload);
      if (!isValidPayload) {
        throw new Error(`Invalid payload for job type: ${request.type}`);
      }
    }

    // Enqueue job
    await this.jobQueue.enqueue(job);

    // Log job creation
    await this.logAudit({
      action: 'job_created',
      jobId: job.jobId,
      jobType: request.type,
      priority: job.priority,
      timestamp: new Date(),
      healthcareContext: request.healthcareContext,
    });

    return job.jobId;
  }

  /**
   * Start job processing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Job manager is already running');
    }

    this.isRunning = true;
    console.log('Job Manager started');

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

    console.log('Job Manager stopped');
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
        action: 'job_cancelled',
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
      action: 'job_retried',
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
    const workerStats = Array.from(this.workers.values()).map(w => w.getStatus());

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
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error in job processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait longer on error
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
      if (job.nextRetryAt && job.nextRetryAt <= now && job.attemptCount < job.maxRetries) {
        await this.jobQueue.updateJob(job.jobId, {
          status: JobStatus.PENDING,
          nextRetryAt: undefined,
        });

        await this.logAudit({
          action: 'job_auto_retry',
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
    console.log('Job Audit:', JSON.stringify(event, null, 2));
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: any): any[] {
    return this.auditLog.filter(event => {
      if (filters?.jobId && event.jobId !== filters.jobId) return false;
      if (filters?.action && event.action !== filters.action) return false;
      if (filters?.startDate && event.timestamp < filters.startDate) return false;
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

    console.log(`Worker ${this.config.workerId} started`);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Worker ${this.config.workerId} stopped`);
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
        await new Promise(resolve => setTimeout(resolve, this.config.pollInterval));
      } catch (error) {
        console.error(`Worker ${this.config.workerId} error:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
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
          this.config.allowedJobTypes
          && !this.config.allowedJobTypes.includes(job.type)
        ) {
          // Put job back in queue
          await this.jobQueue.updateJob(job.jobId, { status: JobStatus.PENDING });
          continue;
        }

        // Check emergency jobs only restriction
        if (
          this.config.emergencyJobsOnly
          && !requiresEmergencyProcessing(job.type, job.healthcareContext)
        ) {
          // Put job back in queue
          await this.jobQueue.updateJob(job.jobId, { status: JobStatus.PENDING });
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
        workerHost: 'localhost', // In production, use actual hostname
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

      console.log(`Job ${job.jobId} completed in ${executionTime}ms`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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

        console.log(`Job ${job.jobId} failed, will retry at ${nextRetryAt}`);
      } else {
        // Move to dead letter queue
        await this.jobQueue.updateJob(job.jobId, {
          status: JobStatus.DEAD_LETTER,
          completedAt: new Date(),
          error: errorMessage,
          executionTime,
        });

        console.error(
          `Job ${job.jobId} moved to dead letter queue after ${job.attemptCount} attempts`,
        );
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

  async validatePayload(payload: Record<string, any>): Promise<boolean> {
    // Basic validation - override in specific handlers
    return typeof payload === 'object' && payload !== null;
  }

  async getEstimatedExecutionTime(_payload: Record<string, any>): Promise<number> {
    // Default estimate - override in specific handlers
    return 30000; // 30 seconds
  }

  protected createAuditEvent(action: string, details: Record<string, any>) {
    return {
      timestamp: new Date(),
      action,
      details,
      workerId: 'system',
    };
  }
}

/**
 * Patient Data Sync Handler
 */
export class PatientDataSyncHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [HealthcareJobType.PATIENT_DATA_SYNC];

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { patientId, syncType } = job.payload;

    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const auditEvents = [];

    try {
      auditEvents.push(this.createAuditEvent('patient_sync_started', {
        patientId,
        syncType: syncType || 'full',
      }));

      // Mock sync process
      await new Promise(resolve => setTimeout(resolve, 5000));

      auditEvents.push(this.createAuditEvent('patient_sync_completed', {
        patientId,
        recordsProcessed: 150,
        lgpdCompliant: true,
      }));

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
      auditEvents.push(this.createAuditEvent('patient_sync_failed', {
        patientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      throw error;
    }
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return !!(payload.patientId && payload.sourceSystem && payload.targetSystem);
  }

  override async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    // Estimate based on data volume
    const estimatedRecords = payload.estimatedRecords || 100;
    return Math.max(5000, estimatedRecords * 50); // 50ms per record
  }
}

/**
 * Emergency Notification Handler
 */
export class EmergencyNotificationHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [HealthcareJobType.EMERGENCY_NOTIFICATION];

  async execute(job: JobData): Promise<JobExecutionResult> {
    const { alertType, severity, message, recipients } = job.payload;

    if (!alertType || !message || !recipients) {
      throw new Error('Alert type, message, and recipients are required');
    }

    const auditEvents = [];
    const deliveryResults = [];

    try {
      auditEvents.push(this.createAuditEvent('emergency_alert_initiated', {
        alertType,
        severity,
        recipientCount: recipients.length,
      }));

      // Send notifications to all recipients
      for (const recipient of recipients) {
        // Mock notification delivery
        await new Promise(resolve => setTimeout(resolve, 100));

        deliveryResults.push({
          recipient,
          status: 'delivered',
          deliveredAt: new Date(),
        });

        auditEvents.push(this.createAuditEvent('notification_delivered', {
          recipient,
          alertType,
          deliveryMethod: 'push_notification',
        }));
      }

      return {
        progress: 100,
        metadata: {
          alertType: job.payload.alertType,
          severity: job.payload.severity,
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
      auditEvents.push(this.createAuditEvent('emergency_alert_failed', {
        alertType,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      throw error;
    }
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return !!(payload.alertType && payload.message && Array.isArray(payload.recipients));
  }

  override async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    const recipients = payload.recipients || [];
    return Math.max(1000, recipients.length * 100); // 100ms per recipient
  }
}

/**
 * Compliance Audit Handler
 */
export class ComplianceAuditHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [HealthcareJobType.COMPLIANCE_AUDIT];

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { auditType, scope, dateRange } = job.payload;

    if (!auditType || !scope) {
      throw new Error('Audit type and scope are required');
    }

    const auditEvents = [];

    try {
      auditEvents.push(this.createAuditEvent('compliance_audit_started', {
        auditType,
        scope,
        dateRange,
      }));

      // Mock audit process
      await new Promise(resolve => setTimeout(resolve, 10000));

      const findings = [
        { category: 'lgpd_compliance', status: 'compliant', details: 'All patient consents valid' },
        {
          category: 'data_retention',
          status: 'warning',
          details: '5 records approaching retention limit',
        },
        { category: 'access_controls', status: 'compliant', details: 'All access properly logged' },
      ];

      auditEvents.push(this.createAuditEvent('compliance_audit_completed', {
        auditType,
        findingsCount: findings.length,
        complianceScore: 95,
      }));

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
      auditEvents.push(this.createAuditEvent('compliance_audit_failed', {
        auditType,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      throw error;
    }
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return !!(payload.auditType && payload.scope);
  }

  override async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    const scope = payload.scope || 'facility';
    const baseTime = scope === 'system' ? 60000 : scope === 'facility' ? 30000 : 10000;
    return baseTime;
  }
}

/**
 * Data Retention Cleanup Handler
 */
export class DataRetentionCleanupHandler extends BaseHealthcareJobHandler {
  protected override supportedTypes = [HealthcareJobType.DATA_RETENTION_CLEANUP];

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { dataTypes, retentionPolicy, dryRun = true } = job.payload;

    if (!dataTypes || !retentionPolicy) {
      throw new Error('Data types and retention policy are required');
    }

    const auditEvents = [];
    const cleanupResults = [];

    try {
      auditEvents.push(this.createAuditEvent('retention_cleanup_started', {
        dataTypes,
        retentionPolicy,
        dryRun,
      }));

      // Process each data type
      for (const dataType of dataTypes) {
        // Mock cleanup operation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const recordsFound = Math.floor(Math.random() * 100) + 10;
        const recordsProcessed = dryRun ? 0 : recordsFound;

        cleanupResults.push({
          dataType,
          recordsFound,
          recordsProcessed,
          action: dryRun ? 'analyzed' : 'cleaned',
        });

        auditEvents.push(this.createAuditEvent('data_type_processed', {
          dataType,
          recordsFound,
          recordsProcessed,
          lgpdCompliant: true,
        }));
      }

      return {
        progress: 100, // Add required progress property
        success: true,
        result: {
          cleanupId: job.jobId,
          cleanupResults,
          totalRecordsFound: cleanupResults.reduce((sum, r) => sum + r.recordsFound, 0),
          totalRecordsProcessed: cleanupResults.reduce((sum, r) => sum + r.recordsProcessed, 0),
          dryRun,
          completedAt: new Date(),
        },
        auditEvents,
        metrics: {
          executionTime: dataTypes.length * 2000,
          bytesProcessed: cleanupResults.reduce((sum, r) => sum + r.recordsProcessed * 1024, 0),
        },
        metadata: {
          totalRecordsProcessed: cleanupResults.reduce((sum, r) => sum + r.recordsProcessed, 0),
        },
      };
    } catch (error) {
      auditEvents.push(this.createAuditEvent('retention_cleanup_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      throw error;
    }
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return !!(payload.dataTypes && Array.isArray(payload.dataTypes) && payload.retentionPolicy);
  }

  override async getEstimatedExecutionTime(_payload: Record<string, any>): Promise<number> {
    return 5000; // 5 seconds base time
  }
}

export default JobManager;
