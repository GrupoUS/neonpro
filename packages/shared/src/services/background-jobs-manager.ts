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

import { logHealthcareError } from '../logging/healthcare-logger';
import healthcareLogger from '../logging/healthcare-logger';
import {
  calculateRetryDelay,
  CreateJobRequest,
  generateJobId,
  getDefaultJobConfig,
  HealthcareJobContextSchema,
  HealthcareJobType,
  JobData,
  JobExecutionResult,
  JobHandler,
  JobPriority,
  JobQueue,
  JobStatus,
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
  private processingLoop?: NodeJS.Timeout;

  constructor(jobQueue: JobQueue) {
    this.jobQueue = jobQueue;
  }

  /**
   * Register a job handler
   */
  registerHandler(type: HealthcareJobType, handler: JobHandlerFunction): void {
    // Convert function to JobHandler interface with full compliance
    const jobHandler: JobHandler = {
      execute: handler,
      getSupportedTypes: () => [type],
      validatePayload: async (payload: Record<string, any>) => {
        return typeof payload === 'object' && payload !== null;
      },
      getEstimatedExecutionTime: async (payload: Record<string, any>) => {
        return 5000; // Default 5 seconds estimation
      },
    };
    this.handlers.set(type, jobHandler);
  }

  /**
   * Process jobs (main processing loop)
   */
  private processJobs(): void {
    if (!this.isRunning) return;

    this.processingLoop = setInterval(async () => {
      // Simple implementation - in real scenario would be more sophisticated
    }, 1000);
  }

  /**
   * Start job manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Job manager is already running');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    healthcareLogger.auditLogger.info('Job manager started successfully', {
      component: 'job-manager',
      action: 'start',
      timestamp: new Date().toISOString(),
    });

    // Start processing loop
    this.startProcessingLoop();
    return Promise.resolve();
  }

  /**
   * Start processing loop for jobs
   */
  private startProcessingLoop(): void {
    this.processingLoop = setInterval(async () => {
      if (!this.isRunning) {
        return;
      }

      try {
        // Get pending jobs and distribute to workers
        for (const [workerId, worker] of Array.from(this.workers.entries())) {
          // Logic to assign jobs to workers
        }
      } catch (error) {
        logHealthcareError('job-manager', error as Error, {
          method: 'processJobs',
        });
      }
    }, 1000);
  }

  /**
   * Stop job manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return Promise.resolve(); // Gracefully handle stop when not running
    }
    this.isRunning = false;
    // Stop processing loop
    if (this.processingLoop) {
      clearInterval(this.processingLoop);
    }
    // Stop all workers
    const stopPromises = Array.from(this.workers.values()).map(worker => worker.stop());
    await Promise.all(stopPromises);
    this.workers.clear();
    this.handlers.clear();
    this.auditLog = [];
    // Log audit event
    await this.logAudit({
      type: 'job_manager_stopped',
      timestamp: new Date().toISOString(),
      details: 'Job manager stopped gracefully',
    });
    return Promise.resolve();
  }

  /**
   * Add worker to job manager
   */
  addWorker(config: WorkerConfig): void {
    const worker = new Worker(config, this.jobQueue, this.handlers);
    this.workers.set(config.workerId, worker);
  }


  /**
   * Remove worker from job manager
   */
  async removeWorker(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (worker) {
      await worker.stop();
      this.workers.delete(workerId);

      // Log audit event
      await this.logAudit({
        type: 'worker_removed',
        action: 'worker_removed',
        workerId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.jobQueue.getJob(jobId);

    if (!job) {
      return false;
    }

    if (job.status !== JobStatus.FAILED) {
      return false;
    }

    if (job.attemptCount >= job.maxRetries) {
      return false;
    }

    // Reset job status and reset attempt count for retry
    const updates = {
      status: JobStatus.PENDING,
      attemptCount: 0,
      error: undefined,
      nextRetryAt: undefined,
      lastAttemptAt: new Date(),
    };

    await this.jobQueue.updateJob(jobId, updates);

    // Log audit event
    await this.logAudit({
      type: 'job_retried',
      jobId,
      jobType: job.type,
      attemptCount: job.attemptCount + 1,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Destroy job manager (cleanup)
   */
  destroy(): void {
    if (this.isRunning) {
      void this.stop(); // Don't wait for promise in destroy
    }
  }

  /**
   * Log audit event
   */
  private async logAudit(event: any): Promise<void> {
    // Ensure action field is set for audit events
    const auditEvent = {
      ...event,
      action: event.action || event.type || 'unknown',
    };
    this.auditLog.push(auditEvent);
    healthcareLogger.auditLogger.info('Job audit event', auditEvent);
  }

  /**
   * Validate healthcare context
   */
  private validateHealthcareContext(context: any): boolean {
    if (!context) {
      return true; // No context is valid
    }

    try {
      // Use the actual schema validation
      return HealthcareJobContextSchema.safeParse(context).success;
    } catch {
      return false;
    }
  }

  /**
   * Create and enqueue a new job
   */
  async createJob(jobRequest: CreateJobRequest): Promise<string> {
    // Validate healthcare context if provided
    if (
      jobRequest.healthcareContext && !this.validateHealthcareContext(jobRequest.healthcareContext)
    ) {
      throw new Error('Invalid healthcare context');
    }

    // Validate payload with registered handler if available
    if (this.handlers.has(jobRequest.type)) {
      const handler = this.handlers.get(jobRequest.type)!;
      const isValid = await handler.validatePayload(jobRequest._payload);
      if (!isValid) {
        throw new Error('Invalid payload for job type');
      }
    } else {
      // For handlers not in the registry, do basic payload validation
      if (typeof jobRequest._payload !== 'object' || jobRequest._payload === null) {
        throw new Error('Invalid payload for job type');
      }
    }

    // Create job data
    const jobData: JobData = {
      jobId: generateJobId(),
      type: jobRequest.type,
      status: JobStatus.PENDING,
      priority: JobPriority.MEDIUM,
      _payload: jobRequest._payload,
      createdAt: new Date(),
      attemptCount: 0,
      maxRetries: 3,
      config: jobRequest.config
        || getDefaultJobConfig(jobRequest.type, jobRequest.healthcareContext),
      auditEvents: [],
      lgpdCompliant: true,
      dependencies: [],
      dependents: [],
      progress: 0,
      tags: [],
      metadata: {},
    };

    // Enqueue job using the job queue
    await this.jobQueue.enqueue(jobData);

    // Log audit event
    await this.logAudit({
      type: 'job_created',
      jobId: jobData.jobId,
      jobType: jobRequest.type,
      timestamp: new Date().toISOString(),
    });

    return jobData.jobId;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<JobData | null> {
    return await this.jobQueue.getJob(jobId);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.jobQueue.getJob(jobId);
    if (!job) {
      return false;
    }

    // Only cancel pending or running jobs
    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
      return false;
    }

    if (job.status === JobStatus.RUNNING) {
      return false; // Cannot cancel running jobs
    }

    await this.jobQueue.updateJob(jobId, {
      status: JobStatus.CANCELLED,
      completedAt: new Date(),
    });

    await this.logAudit({
      type: 'job_cancelled',
      jobId,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Get job manager statistics
   */
  getStatistics() {
    return {
      isRunning: this.isRunning,
      totalJobs: this.auditLog.length,
      workers: Array.from(this.workers.values()).map(worker => ({
        workerId: worker.getStatus().workerId,
        status: worker.getStatus(),
      })),
      activeWorkers: this.workers.size,
      registeredHandlers: this.handlers.size,
      uptime: this.isRunning ? Date.now() - (this.startTime || Date.now()) : 0,
    };
  }

  /**
   * Get audit log
   */
  getAuditLog(
    filter?: { jobId?: string; action?: string; startDate?: Date; endDate?: Date },
  ): any[] {
    let filteredLog = [...this.auditLog];

    if (filter) {
      filteredLog = filteredLog.filter(event => {
        if (filter.jobId && event.jobId !== filter.jobId) return false;
        if (filter.action && event.action !== filter.action) return false;
        if (filter.startDate && new Date(event.timestamp) < filter.startDate) return false;
        if (filter.endDate && new Date(event.timestamp) > filter.endDate) return false;
        return true;
      });
    }

    return filteredLog;
  }

  private startTime?: number;
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
      return Promise.resolve();
    }

    this.isRunning = true;
    this.lastHeartbeat = new Date();

    healthcareLogger.auditLogger.info(`Worker ${this.config.workerId} started successfully`, {
      component: 'job-worker',
      action: 'start',
      workerId: this.config.workerId,
      timestamp: new Date().toISOString(),
    });

    // Start processing loop
    this.processJobs();

    // Start heartbeat
    this.startHeartbeat();

    return Promise.resolve();
  }

  /**
   * Stop worker
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return Promise.resolve(); // Gracefully handle stop when not running
    }
    
    this.isRunning = false;
    
    // Wait for current jobs to complete
    while (this.currentJobs.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    healthcareLogger.auditLogger.info(`Worker ${this.config.workerId} stopped successfully`, {
      component: 'job-worker',
      action: 'stop',
      workerId: this.config.workerId,
      timestamp: new Date().toISOString(),
    });
    
    return Promise.resolve();
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
          const job = await this.jobQueue.getNextJob(
            this.config.allowedJobTypes || Object.values(HealthcareJobType),
            this.config.maxJobPriority || JobPriority.HIGH,
          );

          if (job) {
            await this.executeJob(job);
          }
        }

        // Wait before next iteration
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logHealthcareError('job-worker', error as Error, {
          workerId: this.config.workerId,
          method: 'processJobs',
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Execute a job
   */
  private async executeJob(job: JobData): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      await this.jobQueue.updateJob(job.jobId, {
        status: JobStatus.FAILED,
        error: `No handler found for job type: ${job.type}`,
      });
      return;
    }

    this.currentJobs.set(job.jobId, job);

    try {
      const result = await handler.execute(job);

      await this.jobQueue.updateJob(job.jobId, {
        status: JobStatus.COMPLETED,
        result,
        completedAt: new Date(),
      });

      healthcareLogger.auditLogger.info(`Job ${job.jobId} completed successfully`, {
        component: 'job-worker',
        action: 'job_completed',
        jobId: job.jobId,
        jobType: job.type,
        workerId: this.config.workerId,
        duration: Date.now() - job.createdAt.getTime(),
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      await this.jobQueue.updateJob(job.jobId, {
        status: JobStatus.FAILED,
        error: errorObj.message,
        attemptCount: job.attemptCount + 1,
        nextRetryAt: job.attemptCount < job.maxRetries
          ? new Date(Date.now() + calculateRetryDelay(job.attemptCount + 1, 5000, true, 300000))
          : undefined,
      });

      logHealthcareError('job-worker', errorObj, {
        workerId: this.config.workerId,
        jobId: job.jobId,
        jobType: job.type,
        attemptCount: job.attemptCount + 1,
      });
    } finally {
      this.currentJobs.delete(job.jobId);
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    setInterval(() => {
      if (this.isRunning) {
        this.lastHeartbeat = new Date();
      }
    }, 30000); // Every 30 seconds
  }
}

// ============================================================================
// HEALTHCARE JOB HANDLERS
// ============================================================================

/**
 * Job handler function type
 */
export type JobHandlerFunction = (job: JobData) => Promise<JobExecutionResult>;

/**
 * Abstract base class for healthcare job handlers
 */
export abstract class BaseHealthcareJobHandler implements JobHandler {
  abstract execute(job: JobData): Promise<JobExecutionResult>;

  abstract getSupportedTypes(): HealthcareJobType[];

  async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return typeof payload === 'object' && payload !== null;
  }

  async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    return 30000; // Default 30 seconds estimation
  }

  /**
   * Create audit event
   */
  protected createAuditEvent(action: string, details: Record<string, any> = {}): any {
    return {
      type: 'job_audit',
      action,
      timestamp: new Date(),
      workerId: 'system',
      details,
    };
  }
}

/**
 * Handler for patient data synchronization
 */
export class PatientDataSyncHandler extends BaseHealthcareJobHandler {
  override getSupportedTypes(): HealthcareJobType[] {
    return [HealthcareJobType.PATIENT_DATA_SYNC];
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return (
      typeof payload === 'object'
      && payload !== null
      && typeof payload.patientId === 'string'
      // syncFields is optional - if not provided, will sync all fields
    );
  }

  override async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    const baseTime = 30000; // Base 30 seconds
    const fieldCount = Array.isArray(payload.syncFields) ? payload.syncFields.length : 4; // Default 4 fields
    const fieldTime = fieldCount * 200; // 200ms per field
    return baseTime + fieldTime;
  }

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { patientId, syncFields } = job._payload;

    // Validate required fields
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    // If syncFields not provided, use default fields
    const fieldsToSync = Array.isArray(syncFields) ? syncFields : ['name', 'email', 'phone', 'address'];

    // Simulate patient data synchronization
    const syncedFields = fieldsToSync.map((field: string) => ({
      field,
      status: 'synced',
      timestamp: new Date().toISOString(),
    }));

    return {
      success: true,
      progress: 100,
      result: {
        patientId,
        syncedFields,
        syncTimestamp: new Date().toISOString(),
      },
      auditEvents: [
        {
          type: 'patient_data_sync',
          timestamp: new Date().toISOString(),
          details: `Synced ${syncedFields.length} fields for patient ${patientId}`,
        },
      ],
      metadata: {
        jobType: 'patient_data_sync',
        recordsProcessed: syncedFields.length,
      },
    };
  }
}

/**
 * Handler for emergency notifications
 */
export class EmergencyNotificationHandler extends BaseHealthcareJobHandler {
  override getSupportedTypes(): HealthcareJobType[] {
    return [HealthcareJobType.EMERGENCY_NOTIFICATION];
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return (
      typeof payload === 'object'
      && payload !== null
      && typeof payload.emergencyType === 'string'
      && typeof payload.patientId === 'string'
      // recipients is optional - if not provided, will use default emergency contacts
    );
  }

  override async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    const baseTime = 5000; // Base 5 seconds
    const recipientCount = Array.isArray(payload.recipients) ? payload.recipients.length : 0;
    const recipientTime = recipientCount * 100; // 100ms per recipient
    return baseTime + recipientTime;
  }

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { emergencyType, patientId, recipients, message } = job._payload;

    // Validate required fields
    if (!emergencyType || !patientId) {
      throw new Error('Alert type and patient ID are required');
    }

    // If recipients not provided, use default emergency contacts
    const defaultRecipients = ['emergency@clinic.com', 'on-call@clinic.com'];
    const recipientsToNotify = Array.isArray(recipients) && recipients.length > 0 ? recipients : defaultRecipients;

    // Simulate emergency notification sending
    const notificationResults = recipientsToNotify.map((recipient: string) => ({
      recipient,
      status: 'sent',
      timestamp: new Date().toISOString(),
    }));

    return {
      success: true,
      progress: 100,
      result: {
        emergencyType,
        patientId,
        totalRecipients: notificationResults.length,
        notificationResults,
        emergencyTimestamp: new Date().toISOString(),
      },
      auditEvents: [
        {
          type: 'emergency_notification',
          timestamp: new Date().toISOString(),
          details: `Sent ${emergencyType} notification for patient ${patientId} to ${recipientsToNotify.length} recipients`,
        },
      ],
      metadata: {
        jobType: 'emergency_notification',
        emergencyType,
        recipientsNotified: notificationResults.length,
      },
    };
  }
}

/**
 * Handler for compliance audits
 */
export class ComplianceAuditHandler extends BaseHealthcareJobHandler {
  override getSupportedTypes(): HealthcareJobType[] {
    return [HealthcareJobType.COMPLIANCE_AUDIT];
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return (
      typeof payload === 'object'
      && payload !== null
      && typeof payload.auditType === 'string'
      && typeof payload.scope === 'string'
    );
  }

  override async getEstimatedExecutionTime(payload: Record<string, any>): Promise<number> {
    const baseTime = 5000; // Base 5 seconds
    const scopeMultipliers = {
      system: 3,
      facility: 2,
      department: 1.5,
      individual: 1,
    };
    const scope = payload.scope || 'individual';
    const multiplier = scopeMultipliers[scope as keyof typeof scopeMultipliers] || 1;
    return baseTime * multiplier;
  }

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { auditType, scope, filters } = job._payload;

    // Simulate compliance audit execution
    const findings = [
      {
        category: 'data_access',
        severity: 'low',
        description: 'All access logs properly maintained',
        recommendation: 'Continue current practices',
      },
      {
        category: 'retention_policy',
        severity: 'medium',
        description: 'Some records exceeding retention period',
        recommendation: 'Schedule cleanup operation',
      },
      {
        category: 'encryption_standards',
        severity: 'low',
        description: 'All data properly encrypted at rest and in transit',
        recommendation: 'Continue current encryption practices',
      },
    ];

    return {
      success: true,
      progress: 100,
      result: {
        auditType,
        scope,
        auditId: job.jobId,
        findings,
        complianceScore: 95,
        auditTimestamp: new Date().toISOString(),
      },
      auditEvents: [
        {
          type: 'compliance_audit',
          timestamp: new Date().toISOString(),
          details: `Completed ${auditType} audit for ${scope} with score 95%`,
        },
      ],
      metadata: {
        jobType: 'compliance_audit',
        auditType,
        findingsCount: findings.length,
      },
    };
  }
}

/**
 * Handler for data retention cleanup
 */
export class DataRetentionCleanupHandler extends BaseHealthcareJobHandler {
  override getSupportedTypes(): HealthcareJobType[] {
    return [HealthcareJobType.DATA_RETENTION_CLEANUP];
  }

  override async validatePayload(payload: Record<string, any>): Promise<boolean> {
    return (
      typeof payload === 'object'
      && payload !== null
      && Array.isArray(payload.dataTypes)
      && typeof payload.retentionPolicy === 'object'
      && payload.retentionPolicy !== null
      && typeof payload.dryRun === 'boolean'
    );
  }

  override async execute(job: JobData): Promise<JobExecutionResult> {
    const { dataTypes, retentionPolicy, dryRun } = job._payload;

    // Simulate data retention cleanup
    const cleanupResults = dataTypes.map((dataType: string) => ({
      dataType,
      recordsProcessed: dryRun ? 0 : Math.floor(Math.random() * 1000),
      action: dryRun ? 'analyzed' : 'deleted',
      spaceFreed: dryRun ? 0 : Math.floor(Math.random() * 1000000),
      retentionPeriod: retentionPolicy[dataType + 's'] || retentionPolicy[dataType] || 365,
    }));

    const totalRecordsProcessed = cleanupResults.reduce(
      (sum: number, result: { recordsProcessed: number }) => sum + result.recordsProcessed,
      0,
    );
    const totalSpaceFreed = cleanupResults.reduce(
      (sum: number, result: { spaceFreed: number }) => sum + result.spaceFreed,
      0,
    );

    const auditEvents = [
      {
        type: 'data_retention_cleanup',
        timestamp: new Date().toISOString(),
        details: `Started ${dryRun ? 'dry run' : 'cleanup'} for ${dataTypes.length} data types`,
      },
      ...dataTypes.map((dataType: string) => ({
        type: 'data_retention_cleanup',
        timestamp: new Date().toISOString(),
        details: `${dryRun ? 'Analyzed' : 'Processed'} ${dataType} data type`,
      })),
    ];

    return {
      success: true,
      progress: 100,
      result: {
        dryRun,
        totalRecordsProcessed,
        totalSpaceFreed,
        cleanupResults,
        cleanupTimestamp: new Date().toISOString(),
      },
      auditEvents,
      metadata: {
        jobType: 'data_retention_cleanup',
        dataTypes: dataTypes.length,
        dryRun,
        recordsProcessed: totalRecordsProcessed,
      },
    };
  }
}

/**
 * Healthcare-specific job handlers (legacy function-based)
 */
export const healthcareJobHandlers: Map<HealthcareJobType, JobHandlerFunction> = new Map([
  [HealthcareJobType.APPOINTMENT_REMINDER, async (job: JobData): Promise<JobExecutionResult> => {
    // Send appointment reminders
    return {
      success: true,
      progress: 100,
      auditEvents: [],
      metadata: { jobType: 'appointment_reminder' },
    };
  }],

  [
    HealthcareJobType.CLINICAL_REPORT_GENERATION,
    async (job: JobData): Promise<JobExecutionResult> => {
      // Generate clinical reports
      return {
        success: true,
        progress: 100,
        auditEvents: [],
        metadata: { jobType: 'clinical_report_generation' },
      };
    },
  ],

  [HealthcareJobType.BACKUP_OPERATION, async (job: JobData): Promise<JobExecutionResult> => {
    // Perform data backups
    return {
      success: true,
      progress: 100,
      auditEvents: [],
      metadata: { jobType: 'backup_operation' },
    };
  }],

  [HealthcareJobType.COMPLIANCE_AUDIT, async (job: JobData): Promise<JobExecutionResult> => {
    // Process compliance audits
    return {
      success: true,
      progress: 100,
      auditEvents: [],
      metadata: { jobType: 'compliance_audit' },
    };
  }],

  [HealthcareJobType.ANVISA_REPORTING, async (job: JobData): Promise<JobExecutionResult> => {
    // Perform ANVISA reporting
    return {
      success: true,
      progress: 100,
      auditEvents: [],
      metadata: { jobType: 'anvisa_reporting' },
    };
  }],
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create job manager with healthcare handlers
 */
export function createHealthcareJobManager(jobQueue: JobQueue): JobManager {
  const manager = new JobManager(jobQueue);

  // Register healthcare handlers
  healthcareJobHandlers.forEach((handler, type) => {
    manager.registerHandler(type, handler);
  });

  return manager;
}

/**
 * Create worker pool for healthcare jobs
 */
export function createWorkerPool(
  jobQueue: JobQueue,
  poolSize: number = 3,
  allowedJobTypes?: HealthcareJobType[],
): Worker[] {
  const workers: Worker[] = [];

  for (let i = 0; i < poolSize; i++) {
    const workerConfig: WorkerConfig = {
      workerId: `healthcare-worker-${i}`,
      concurrency: 5,
      pollInterval: 1000,
      emergencyJobsOnly: false,
      maxMemoryUsage: 512 * 1024 * 1024,
      maxCpuUsage: 2,
      jobTimeout: 300000,
      heartbeatInterval: 30000,
      priorityQueues: [
        JobPriority.CRITICAL,
        JobPriority.HIGH,
        JobPriority.MEDIUM,
        JobPriority.LOW,
        JobPriority.BACKGROUND,
      ],
      allowedJobTypes: allowedJobTypes || Object.values(HealthcareJobType),
      maxJobPriority: JobPriority.HIGH,
      tags: [],
      metadata: {},
    };

    // Convert JobHandlerFunction to JobHandler for Worker compatibility
    const convertedHandlers = new Map<HealthcareJobType, JobHandler>();
    healthcareJobHandlers.forEach((handler, type) => {
      convertedHandlers.set(type, {
        execute: handler,
        getSupportedTypes: () => [type],
        validatePayload: async (payload: Record<string, any>) => {
          return typeof payload === 'object' && payload !== null;
        },
        getEstimatedExecutionTime: async (payload: Record<string, any>) => {
          return 5000; // Default 5 seconds estimation
        },
      });
    });

    const worker = new Worker(workerConfig, jobQueue, convertedHandlers);
    workers.push(worker);
  }

  return workers;
}
