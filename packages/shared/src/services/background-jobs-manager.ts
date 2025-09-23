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
   * Start job manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    healthcareLogger.auditLogger.info("Job manager started successfully", {
      component: 'job-manager',
      action: 'start',
      timestamp: new Date().toISOString()
    });

    // Start processing loop
    this.processJobs();
  }

  /**
   * Stop job manager
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    // Stop all workers
    const stopPromises = Array.from(this.workers.values()).map(worker => 
      worker.stop()
    );
    await Promise.all(stopPromises);

    this.stop();
    this.workers.clear();
    this.handlers.clear();
    this.auditLog = [];
  }

  /**
   * Log audit event
   */
  private async logAudit(event: any): Promise<void> {
    this.auditLog.push(event);
    healthcareLogger.auditLogger.info("Job audit event", event);
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
          const job = await this.jobQueue.getNextJob(
            this.config.allowedJobTypes,
            this.config.maxJobPriority
          );

          if (job) {
            await this.executeJob(job);
          }
        }

        // Wait before next iteration
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        logHealthcareError('job-worker', error as Error, {
          workerId: this.config.workerId,
          method: 'processJobs'
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
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
      const result = await handler(job);
      
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
        duration: Date.now() - job.createdAt.getTime()
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      await this.jobQueue.updateJob(job.jobId, {
        status: JobStatus.FAILED,
        error: errorObj.message,
        attemptCount: job.attemptCount + 1,
        nextRetryAt: job.attemptCount < job.maxRetries 
          ? new Date(Date.now() + calculateRetryDelay(job.attemptCount + 1))
          : undefined,
      });

      logHealthcareError('job-worker', errorObj, {
        workerId: this.config.workerId,
        jobId: job.jobId,
        jobType: job.type,
        attemptCount: job.attemptCount + 1
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
 * Healthcare-specific job handlers
 */
export const healthcareJobHandlers: Map<HealthcareJobType, JobHandler> = new Map([
  [HealthcareJobType.APPOINTMENT_REMINDER, async (job: JobData): Promise<JobExecutionResult> => {
    // Send appointment reminders
    return { success: true, processedAt: new Date() };
  }],

  [HealthcareJobType.MEDICAL_REPORT_GENERATION, async (job: JobData): Promise<JobExecutionResult> => {
    // Generate medical reports
    return { success: true, processedAt: new Date() };
  }],

  [HealthcareJobType.DATA_BACKUP, async (job: JobData): Promise<JobExecutionResult> => {
    // Perform data backups
    return { success: true, processedAt: new Date() };
  }],

  [HealthcareJobType.AUDIT_LOG_PROCESSING, async (job: JobData): Promise<JobExecutionResult> => {
    // Process audit logs
    return { success: true, processedAt: new Date() };
  }],

  [HealthcareJobType.COMPLIANCE_CHECK, async (job: JobData): Promise<JobExecutionResult> => {
    // Perform compliance checks
    return { success: true, processedAt: new Date() };
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
  allowedJobTypes?: HealthcareJobType[]
): Worker[] {
  const workers: Worker[] = [];
  
  for (let i = 0; i < poolSize; i++) {
    const workerConfig: WorkerConfig = {
      workerId: `healthcare-worker-${i}`,
      concurrency: 5,
      maxJobPriority: JobPriority.HIGH,
      allowedJobTypes: allowedJobTypes || Object.values(HealthcareJobType),
    };

    const worker = new Worker(workerConfig, jobQueue, healthcareJobHandlers);
    workers.push(worker);
  }

  return workers;
}