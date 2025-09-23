/**
 * @fileoverview Background Jobs Framework
 *
 * Comprehensive background job processing system for healthcare applications with:
 * - Priority-based job queues with healthcare workflow support
 * - Retry logic with exponential backoff and dead letter queues
 * - Job scheduling and cron-like functionality
 * - Healthcare context and LGPD compliance monitoring
 * - Performance metrics and observability integration
 * - Multi-worker support with load balancing
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001, NIST Cybersecurity Framework
 */

import { z } from "zod";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Job priority levels for healthcare workflows
 */
export enum JobPriority {
  CRITICAL = "critical", // Emergency, patient safety
  HIGH = "high", // Urgent clinical tasks
  MEDIUM = "medium", // Standard clinical workflows
  LOW = "low", // Administrative tasks
  BACKGROUND = "background", // Maintenance, cleanup
}

/**
 * Job status enumeration
 */
export enum JobStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  RETRYING = "retrying",
  CANCELLED = "cancelled",
  DEAD_LETTER = "dead_letter",
}

/**
 * Healthcare job types
 */
export enum HealthcareJobType {
  PATIENT_DATA_SYNC = "patient_data_sync",
  CLINICAL_REPORT_GENERATION = "clinical_report_generation",
  COMPLIANCE_AUDIT = "compliance_audit",
  DATA_RETENTION_CLEANUP = "data_retention_cleanup",
  EMERGENCY_NOTIFICATION = "emergency_notification",
  APPOINTMENT_REMINDER = "appointment_reminder",
  LAB_RESULT_PROCESSING = "lab_result_processing",
  BILLING_INTEGRATION = "billing_integration",
  BACKUP_OPERATION = "backup_operation",
  SYSTEM_MAINTENANCE = "system_maintenance",
  LGPD_DATA_PROCESSING = "lgpd_data_processing",
  ANVISA_REPORTING = "anvisa_reporting",
}

/**
 * Healthcare context for job processing
 */
export const HealthcareJobContextSchema = z.object({
  facilityId: z.string().optional(),
  departmentId: z.string().optional(),
  patientId: z.string().optional(),
  providerId: z.string().optional(),
  clinicalContext: z
    .enum([
      "consultation",
      "surgery",
      "emergency",
      "administrative",
      "research",
    ])
    .optional(),
  urgencyLevel: z
    .enum(["routine", "urgent", "critical", "emergency"])
    .default("routine"),
  dataClassification: z
    .enum(["public", "internal", "confidential", "restricted"])
    .default("internal"),
  lgpdConsentId: z.string().optional(),
  auditTrailId: z.string().optional(),
  regulatoryRequirement: z
    .enum(["anvisa", "lgpd", "iso27001", "hipaa"])
    .optional(),
});

export type HealthcareJobContext = z.infer<typeof HealthcareJobContextSchema>;

/**
 * Job configuration schema
 */
export const JobConfigSchema = z.object({
  // Retry configuration
  maxRetries: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(1000).default(5000), // Initial delay in ms
  exponentialBackoff: z.boolean().default(true),
  maxRetryDelay: z.number().default(300000), // 5 minutes max delay

  // Timeout configuration
  jobTimeout: z.number().min(1000).default(300000), // 5 minutes default

  // Healthcare-specific
  emergencyOverride: z.boolean().default(false),
  patientSafetyRelevant: z.boolean().default(false),
  auditRequired: z.boolean().default(true),
  lgpdCompliant: z.boolean().default(true),

  // Scheduling
  delay: z.number().min(0).default(0), // Delay before execution
  cron: z.string().optional(), // Cron expression for recurring jobs
  timezone: z.string().default("UTC"),

  // Resource limits
  memoryLimit: z
    .number()
    .positive()
    .default(128 * 1024 * 1024), // 128MB
  cpuLimit: z.number().positive().default(1), // 1 CPU core

  // Metadata
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
});

export type JobConfig = z.infer<typeof JobConfigSchema>;

/**
 * Job data schema
 */
export const JobDataSchema = z.object({
  jobId: z.string().uuid(),
  type: z.nativeEnum(HealthcareJobType),
  priority: z.nativeEnum(JobPriority).default(JobPriority.MEDIUM),
  status: z.nativeEnum(JobStatus).default(JobStatus.PENDING),

  // Job payload
  _payload: z.record(z.any()).default({}),

  // Timing information
  createdAt: z.date(),
  scheduledAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  lastRetryAt: z.date().optional(),

  // Progress and results
  progress: z.number().min(0).max(100).default(0),
  result: z.any().optional(),
  error: z.string().optional(),

  // Retry information
  attemptCount: z.number().min(0).default(0),
  maxRetries: z.number().min(0).default(3),
  nextRetryAt: z.date().optional(),

  // Healthcare context
  healthcareContext: HealthcareJobContextSchema.optional(),

  // Configuration
  config: JobConfigSchema.default({}),

  // Worker information
  workerId: z.string().optional(),
  workerHost: z.string().optional(),

  // Performance metrics
  executionTime: z.number().optional(),
  memoryUsage: z.number().optional(),
  cpuUsage: z.number().optional(),

  // Compliance
  auditEvents: z.array(z.record(z.any())).default([]),
  lgpdCompliant: z.boolean().default(true),

  // Dependencies
  dependencies: z.array(z.string().uuid()).default([]),
  dependents: z.array(z.string().uuid()).default([]),

  // Metadata
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
});

export type JobData = z.infer<typeof JobDataSchema>;

/**
 * Job creation request schema
 */
export const CreateJobRequestSchema = z.object({
  type: z.nativeEnum(HealthcareJobType),
  priority: z.nativeEnum(JobPriority).default(JobPriority.MEDIUM),
  _payload: z.record(z.any()).default({}),
  healthcareContext: HealthcareJobContextSchema.optional(),
  config: JobConfigSchema.optional(),
  scheduledAt: z.date().optional(),
  dependencies: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
});

export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;

/**
 * Job execution result schema
 */
export const JobExecutionResultSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  progress: z.number().min(0).max(100).default(100),
  metrics: z
    .object({
      executionTime: z.number(),
      memoryUsage: z.number().optional(),
      cpuUsage: z.number().optional(),
      bytesProcessed: z.number().optional(),
    })
    .optional(),
  auditEvents: z.array(z.record(z.any())).default([]),
  metadata: z.record(z.any()).default({}),
});

export type JobExecutionResult = z.infer<typeof JobExecutionResultSchema>;

/**
 * Worker configuration schema
 */
export const WorkerConfigSchema = z.object({
  workerId: z.string(),
  concurrency: z.number().min(1).max(50).default(5),
  pollInterval: z.number().min(100).default(1000), // ms

  // Healthcare-specific
  emergencyJobsOnly: z.boolean().default(false),
  allowedJobTypes: z.array(z.nativeEnum(HealthcareJobType)).optional(),
  facilitiesAllowed: z.array(z.string()).optional(),

  // Resource limits
  maxMemoryUsage: z.number().default(512 * 1024 * 1024), // 512MB
  maxCpuUsage: z.number().default(2), // 2 CPU cores

  // Timeouts
  jobTimeout: z.number().default(300000), // 5 minutes
  heartbeatInterval: z.number().default(30000), // 30 seconds

  // Queue configuration
  priorityQueues: z
    .array(z.nativeEnum(JobPriority))
    .default([
      JobPriority.CRITICAL,
      JobPriority.HIGH,
      JobPriority.MEDIUM,
      JobPriority.LOW,
      JobPriority.BACKGROUND,
    ]),

  // Metadata
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
});

export type WorkerConfig = z.infer<typeof WorkerConfigSchema>;

/**
 * Queue statistics schema
 */
export const QueueStatisticsSchema = z.object({
  totalJobs: z.number().default(0),
  pendingJobs: z.number().default(0),
  runningJobs: z.number().default(0),
  completedJobs: z.number().default(0),
  failedJobs: z.number().default(0),
  deadLetterJobs: z.number().default(0),

  // Priority distribution
  priorityDistribution: z
    .object({
      [JobPriority.CRITICAL]: z.number().default(0),
      [JobPriority.HIGH]: z.number().default(0),
      [JobPriority.MEDIUM]: z.number().default(0),
      [JobPriority.LOW]: z.number().default(0),
      [JobPriority.BACKGROUND]: z.number().default(0),
    })
    .default({}),

  // Performance metrics
  averageExecutionTime: z.number().default(0),
  throughputPerMinute: z.number().default(0),
  errorRate: z.number().min(0).max(1).default(0),

  // Healthcare metrics
  emergencyJobsProcessed: z.number().default(0),
  patientSafetyJobsProcessed: z.number().default(0),
  complianceJobsCompleted: z.number().default(0),

  // Worker metrics
  activeWorkers: z.number().default(0),
  idleWorkers: z.number().default(0),

  // Time-based metrics
  lastUpdateTime: z.date().default(() => new Date()),
  uptime: z.number().default(0),
});

export type QueueStatistics = z.infer<typeof QueueStatisticsSchema>;

// ============================================================================
// JOB HANDLER INTERFACE
// ============================================================================

/**
 * Interface for job handlers
 */
export interface JobHandler {
  /**
   * Execute a job
   */
  execute(job: JobData): Promise<JobExecutionResult>;

  /**
   * Get supported job types
   */
  getSupportedTypes(): HealthcareJobType[];

  /**
   * Validate job payload
   */
  validatePayload(_payload: Record<string, any>): Promise<boolean>;

  /**
   * Get estimated execution time
   */
  getEstimatedExecutionTime(_payload: Record<string, any>): Promise<number>;
}

// ============================================================================
// JOB QUEUE INTERFACE
// ============================================================================

/**
 * Interface for job queue implementations
 */
export interface JobQueue {
  /**
   * Add a job to the queue
   */
  enqueue(job: JobData): Promise<void>;

  /**
   * Get next job from queue
   */
  dequeue(priority?: JobPriority): Promise<JobData | null>;

  /**
   * Get job by ID
   */
  getJob(jobId: string): Promise<JobData | null>;

  /**
   * Update job status
   */
  updateJob(jobId: string, updates: Partial<JobData>): Promise<void>;

  /**
   * Delete job
   */
  deleteJob(jobId: string): Promise<boolean>;

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus, limit?: number): Promise<JobData[]>;

  /**
   * Get queue statistics
   */
  getStatistics(): Promise<QueueStatistics>;

  /**
   * Clear completed jobs
   */
  cleanup(olderThan?: Date): Promise<number>;
}

// ============================================================================
// JOB UTILITIES
// ============================================================================

/**
 * Generate unique job ID
 */
export function generateJobId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `job_${timestamp}_${random}`;
}

/**
 * Calculate priority score for job ordering
 */
export function calculatePriorityScore(
  priority: JobPriority,
  healthcareContext?: HealthcareJobContext,
  createdAt?: Date,
): number {
  let score = 0;

  // Base priority scores
  switch (priority) {
    case JobPriority.CRITICAL:
      score = 1000;
      break;
    case JobPriority.HIGH:
      score = 750;
      break;
    case JobPriority.MEDIUM:
      score = 500;
      break;
    case JobPriority.LOW:
      score = 250;
      break;
    case JobPriority.BACKGROUND:
      score = 100;
      break;
  }

  // Healthcare context adjustments
  if (healthcareContext) {
    // Urgency level bonus
    switch (healthcareContext.urgencyLevel) {
      case "emergency":
        score += 500;
        break;
      case "critical":
        score += 300;
        break;
      case "urgent":
        score += 150;
        break;
    }

    // Clinical context bonus
    if (healthcareContext.clinicalContext === "emergency") {
      score += 400;
    } else if (healthcareContext.clinicalContext === "surgery") {
      score += 200;
    }

    // Patient data handling
    if (healthcareContext.patientId) {
      score += 50; // Patient-related jobs get slight priority
    }
  }

  // Age penalty (older jobs get lower priority)
  if (createdAt) {
    const ageMinutes = (Date.now() - createdAt.getTime()) / (1000 * 60);
    score -= Math.floor(ageMinutes / 10); // -1 point per 10 minutes
  }

  return Math.max(0, score);
}

/**
 * Calculate next retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attemptCount: number,
  baseDelay: number,
  exponentialBackoff: boolean,
  maxDelay: number,
): number {
  if (!exponentialBackoff) {
    return Math.min(baseDelay, maxDelay);
  }

  const exponentialDelay = baseDelay * Math.pow(2, attemptCount);
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter

  return Math.min(jitteredDelay, maxDelay);
}

/**
 * Validate healthcare context
 */
export function validateHealthcareContext(
  _context: HealthcareJobContext,
  jobType: HealthcareJobType,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Emergency jobs must have emergency urgency
  if (
    jobType === HealthcareJobType.EMERGENCY_NOTIFICATION &&
    context.urgencyLevel !== "emergency"
  ) {
    errors.push(
      "Emergency notification jobs must have emergency urgency level",
    );
  }

  // Patient-related jobs must have patient ID
  const patientJobTypes = [
    HealthcareJobType.PATIENT_DATA_SYNC,
    HealthcareJobType.CLINICAL_REPORT_GENERATION,
    HealthcareJobType.LAB_RESULT_PROCESSING,
  ];

  if (patientJobTypes.includes(jobType) && !context.patientId) {
    errors.push("Patient-related jobs require patientId in healthcare context");
  }

  // LGPD jobs must have consent ID
  if (
    jobType === HealthcareJobType.LGPD_DATA_PROCESSING &&
    !context.lgpdConsentId
  ) {
    errors.push("LGPD data processing jobs require lgpdConsentId");
  }

  // Compliance jobs must have audit trail
  const complianceJobTypes = [
    HealthcareJobType.COMPLIANCE_AUDIT,
    HealthcareJobType.ANVISA_REPORTING,
  ];

  if (complianceJobTypes.includes(jobType) && !context.auditTrailId) {
    errors.push("Compliance jobs require auditTrailId");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determine if job requires emergency processing
 */
export function requiresEmergencyProcessing(
  jobType: HealthcareJobType,
  _context?: HealthcareJobContext,
): boolean {
  // Emergency notification jobs are always urgent
  if (jobType === HealthcareJobType.EMERGENCY_NOTIFICATION) {
    return true;
  }

  // Jobs with emergency context
  if (
    context?.urgencyLevel === "emergency" ||
    context?.clinicalContext === "emergency"
  ) {
    return true;
  }

  return false;
}

/**
 * Get default job configuration for healthcare job type
 */
export function getDefaultJobConfig(
  type: HealthcareJobType,
  _context?: HealthcareJobContext,
): JobConfig {
  switch (type) {
    case HealthcareJobType.EMERGENCY_NOTIFICATION:
      return {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
        maxRetryDelay: 30000,
        jobTimeout: 30000,
        emergencyOverride: true,
        patientSafetyRelevant: true,
        auditRequired: true,
        lgpdCompliant: true,
        delay: 0,
        timezone: "UTC",
        memoryLimit: 128 * 1024 * 1024,
        cpuLimit: 1,
        tags: [],
        metadata: {},
      };
    case HealthcareJobType.PATIENT_DATA_SYNC:
      return {
        maxRetries: 2,
        retryDelay: 5000,
        exponentialBackoff: true,
        maxRetryDelay: 60000,
        jobTimeout: 60000,
        emergencyOverride: false,
        patientSafetyRelevant: false,
        auditRequired: true,
        lgpdCompliant: true,
        delay: 0,
        timezone: "UTC",
        memoryLimit: 128 * 1024 * 1024,
        cpuLimit: 1,
        tags: [],
        metadata: {},
      };
    case HealthcareJobType.COMPLIANCE_AUDIT:
      return {
        maxRetries: 1,
        retryDelay: 15000,
        exponentialBackoff: false,
        maxRetryDelay: 120000,
        jobTimeout: 120000,
        emergencyOverride: false,
        patientSafetyRelevant: true,
        auditRequired: true,
        lgpdCompliant: true,
        delay: 0,
        timezone: "UTC",
        memoryLimit: 128 * 1024 * 1024,
        cpuLimit: 1,
        tags: [],
        metadata: {},
      };
    default:
      return {
        maxRetries: 3,
        retryDelay: 5000,
        exponentialBackoff: true,
        maxRetryDelay: 300000,
        jobTimeout: 300000,
        emergencyOverride: false,
        patientSafetyRelevant: false,
        auditRequired: true,
        lgpdCompliant: true,
        delay: 0,
        timezone: "UTC",
        memoryLimit: 128 * 1024 * 1024,
        cpuLimit: 1,
        tags: [],
        metadata: {},
      };
  }
}

// ============================================================================
// IN-MEMORY JOB QUEUE IMPLEMENTATION
// ============================================================================

/**
 * In-memory job queue implementation for development and testing
 */
export class InMemoryJobQueue implements JobQueue {
  private jobs: Map<string, JobData> = new Map();
  private priorityQueues: Map<JobPriority, string[]> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private statistics: QueueStatistics;
  private startTime: Date;

  constructor() {
    // Initialize priority queues
    Object.values(JobPriority).forEach((priority) => {
      this.priorityQueues.set(priority, []);
    });

    this.statistics = QueueStatisticsSchema.parse({});
    this.startTime = new Date();
  }

  async enqueue(job: JobData): Promise<void> {
    const validatedJob = JobDataSchema.parse(job);

    // Store job
    this.jobs.set(validatedJob.jobId, validatedJob);

    // Handle scheduling
    if (validatedJob.scheduledAt && validatedJob.scheduledAt > new Date()) {
      const delay = validatedJob.scheduledAt.getTime() - Date.now();
      const timeout = setTimeout(() => {
        this.moveToQueue(validatedJob.jobId, validatedJob.priority);
        this.scheduledJobs.delete(validatedJob.jobId);
      }, delay);

      this.scheduledJobs.set(validatedJob.jobId, timeout);
    } else {
      // Add to appropriate priority queue immediately
      this.moveToQueue(validatedJob.jobId, validatedJob.priority);
    }

    this.updateStatistics();
  }

  async dequeue(priority?: JobPriority): Promise<JobData | null> {
    // Get priorities to check (in order)
    const prioritiesToCheck = priority
      ? [priority]
      : [
          JobPriority.CRITICAL,
          JobPriority.HIGH,
          JobPriority.MEDIUM,
          JobPriority.LOW,
          JobPriority.BACKGROUND,
        ];

    for (const pri of prioritiesToCheck) {
      const queue = this.priorityQueues.get(pri);
      if (queue && queue.length > 0) {
        // Sort by priority score
        queue.sort((a, _b) => {
          const jobA = this.jobs.get(a);
          const jobB = this.jobs.get(b);
          if (!jobA || !jobB) return 0;

          const scoreA = calculatePriorityScore(
            jobA.priority,
            jobA.healthcareContext,
            jobA.createdAt,
          );
          const scoreB = calculatePriorityScore(
            jobB.priority,
            jobB.healthcareContext,
            jobB.createdAt,
          );

          return scoreB - scoreA; // Higher score first
        });

        const jobId = queue.shift()!;
        const job = this.jobs.get(jobId);

        if (job && job.status === JobStatus.PENDING) {
          // Update job status
          await this.updateJob(jobId, {
            status: JobStatus.RUNNING,
            startedAt: new Date(),
          });

          this.updateStatistics();
          return job;
        }
      }
    }

    return null;
  }

  async getJob(jobId: string): Promise<JobData | null> {
    const job = this.jobs.get(jobId);
    return job ? { ...job } : null;
  }

  async updateJob(jobId: string, updates: Partial<JobData>): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      const updatedJob = { ...job, ...updates };
      this.jobs.set(jobId, JobDataSchema.parse(updatedJob));
      this.updateStatistics();
    }
  }

  async deleteJob(jobId: string): Promise<boolean> {
    const deleted = this.jobs.delete(jobId);

    if (deleted) {
      // Remove from priority queues
      for (const queue of this.priorityQueues.values()) {
        const index = queue.indexOf(jobId);
        if (index > -1) {
          queue.splice(index, 1);
        }
      }

      // Cancel scheduled timeout
      const timeout = this.scheduledJobs.get(jobId);
      if (timeout) {
        clearTimeout(timeout);
        this.scheduledJobs.delete(jobId);
      }

      this.updateStatistics();
    }

    return deleted;
  }

  async getJobsByStatus(status: JobStatus, limit = 100): Promise<JobData[]> {
    return Array.from(this.jobs.values())
      .filter((job) => job.status === status)
      .slice(0, limit)
      .map((job) => ({ ...job }));
  }

  async getStatistics(): Promise<QueueStatistics> {
    this.updateStatistics();
    return { ...this.statistics };
  }

  async cleanup(
    olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
  ): Promise<number> {
    let cleanedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === JobStatus.COMPLETED ||
          job.status === JobStatus.FAILED) &&
        job.completedAt &&
        job.completedAt < olderThan
      ) {
        await this.deleteJob(jobId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  private moveToQueue(jobId: string, priority: JobPriority): void {
    const queue = this.priorityQueues.get(priority);
    if (queue && !queue.includes(jobId)) {
      queue.push(jobId);
    }
  }

  private updateStatistics(): void {
    const allJobs = Array.from(this.jobs.values());

    this.statistics = {
      totalJobs: allJobs.length,
      pendingJobs: allJobs.filter((j) => j.status === JobStatus.PENDING).length,
      runningJobs: allJobs.filter((j) => j.status === JobStatus.RUNNING).length,
      completedJobs: allJobs.filter((j) => j.status === JobStatus.COMPLETED)
        .length,
      failedJobs: allJobs.filter((j) => j.status === JobStatus.FAILED).length,
      deadLetterJobs: allJobs.filter((j) => j.status === JobStatus.DEAD_LETTER)
        .length,

      priorityDistribution: {
        [JobPriority.CRITICAL]: allJobs.filter(
          (j) => j.priority === JobPriority.CRITICAL,
        ).length,
        [JobPriority.HIGH]: allJobs.filter(
          (j) => j.priority === JobPriority.HIGH,
        ).length,
        [JobPriority.MEDIUM]: allJobs.filter(
          (j) => j.priority === JobPriority.MEDIUM,
        ).length,
        [JobPriority.LOW]: allJobs.filter((j) => j.priority === JobPriority.LOW)
          .length,
        [JobPriority.BACKGROUND]: allJobs.filter(
          (j) => j.priority === JobPriority.BACKGROUND,
        ).length,
      },

      averageExecutionTime: this.calculateAverageExecutionTime(allJobs),
      throughputPerMinute: this.calculateThroughput(allJobs),
      errorRate: this.calculateErrorRate(allJobs),

      emergencyJobsProcessed: allJobs.filter(
        (j) => j.healthcareContext?.urgencyLevel === "emergency",
      ).length,
      patientSafetyJobsProcessed: allJobs.filter(
        (j) => j.config.patientSafetyRelevant,
      ).length,
      complianceJobsCompleted: allJobs.filter(
        (j) =>
          j.type === HealthcareJobType.COMPLIANCE_AUDIT ||
          j.type === HealthcareJobType.ANVISA_REPORTING ||
          j.type === HealthcareJobType.LGPD_DATA_PROCESSING,
      ).length,

      activeWorkers: 0, // Would be tracked separately in real implementation
      idleWorkers: 0,

      lastUpdateTime: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  private calculateAverageExecutionTime(jobs: JobData[]): number {
    const completedJobs = jobs.filter((j) => j.executionTime);
    if (completedJobs.length === 0) return 0;

    const totalTime = completedJobs.reduce(
      (sum, _job) => sum + (job.executionTime || 0),
      0,
    );
    return totalTime / completedJobs.length;
  }

  private calculateThroughput(jobs: JobData[]): number {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentJobs = jobs.filter(
      (j) => j.completedAt && j.completedAt > lastHour,
    );

    return recentJobs.length;
  }

  private calculateErrorRate(jobs: JobData[]): number {
    const totalJobs = jobs.filter(
      (j) =>
        j.status === JobStatus.COMPLETED ||
        j.status === JobStatus.FAILED ||
        j.status === JobStatus.DEAD_LETTER,
    ).length;

    if (totalJobs === 0) return 0;

    const failedJobs = jobs.filter(
      (j) =>
        j.status === JobStatus.FAILED || j.status === JobStatus.DEAD_LETTER,
    ).length;

    return failedJobs / totalJobs;
  }
}

// ============================================================================
// JOB SCHEDULER
// ============================================================================

/**
 * Job scheduler for cron-like recurring jobs
 */
export class JobScheduler {
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private jobQueue: JobQueue;

  constructor(jobQueue: JobQueue) {
    this.jobQueue = jobQueue;
  }

  /**
   * Schedule a recurring job
   */
  scheduleRecurringJob(
    name: string,
    cronExpression: string,
    jobTemplate: CreateJobRequest,
  ): void {
    // Simple cron parser (in production, use proper cron library)
    const interval = this.parseCronExpression(cronExpression);

    const scheduleNext = () => {
      // Create job instance
      const job: JobData = {
        jobId: generateJobId(),
        type: jobTemplate.type,
        priority: jobTemplate.priority || JobPriority.MEDIUM,
        status: JobStatus.PENDING,
        progress: 0,
        _payload: jobTemplate.payload,
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: jobTemplate.config?.maxRetries || 3,
        healthcareContext: jobTemplate.healthcareContext,
        config: jobTemplate.config || getDefaultJobConfig(jobTemplate.type),
        dependencies: jobTemplate.dependencies,
        tags: [...(jobTemplate.tags || []), "scheduled", name],
        metadata: {
          ...jobTemplate.metadata,
          scheduledJob: name,
          cronExpression,
        },
        auditEvents: [],
        lgpdCompliant: true,
        dependents: [],
      };

      // Enqueue job
      this.jobQueue.enqueue(job);

      // Schedule next execution
      const timeout = setTimeout(scheduleNext, interval);
      this.scheduledJobs.set(name, timeout);
    };

    // Start scheduling
    scheduleNext();
  }

  /**
   * Cancel scheduled job
   */
  cancelScheduledJob(name: string): boolean {
    const timeout = this.scheduledJobs.get(name);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledJobs.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Get scheduled jobs
   */
  getScheduledJobs(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  private parseCronExpression(cronExpression: string): number {
    // Simplified cron parser - in production use proper library
    // This only handles basic minute intervals
    const parts = cronExpression.split(" ");

    if (parts.length >= 2) {
      const minutes = parts[0];
      if (minutes.startsWith("*/")) {
        const interval = parseInt(minutes.substring(2));
        return interval * 60 * 1000; // Convert to milliseconds
      }
    }

    // Default to 1 hour
    return 60 * 60 * 1000;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Removed duplicate named re-exports to avoid conflicts with existing exported declarations
export default InMemoryJobQueue;
