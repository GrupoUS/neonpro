/**
 * Background Job Processing System with Bull/BullMQ
 * Healthcare-optimized job processing for NeonPro
 */

import { type Job, Queue, type QueueOptions, Worker, type WorkerOptions } from "bullmq";
import { Redis } from "ioredis";
import { z } from "zod";
import { healthcareLogger } from "../plugins/logging";

// Job configuration schemas
const JobConfigSchema = z.object({
  priority: z.number().min(1).max(10).default(5),
  delay: z.number().optional(),
  attempts: z.number().min(1).max(10).default(3),
  backoff: z
    .object({
      type: z.enum(["fixed", "exponential"]).default("exponential"),
      settings: z
        .object({
          delay: z.number().default(2000),
        })
        .optional(),
    })
    .optional(),
  removeOnComplete: z.number().default(100),
  removeOnFail: z.number().default(50),
  repeat: z
    .object({
      pattern: z.string().optional(), // Cron pattern
      every: z.number().optional(), // Milliseconds
    })
    .optional(),
});

type JobConfig = z.infer<typeof JobConfigSchema>;

// Healthcare-specific job types
export enum HealthcareJobType {
  // Patient data processing
  PATIENT_DATA_SYNC = "patient_data_sync",
  PATIENT_BACKUP = "patient_backup",
  PATIENT_ANONYMIZATION = "patient_anonymization",

  // Medical records
  MEDICAL_RECORD_EXPORT = "medical_record_export",
  MEDICAL_RECORD_ARCHIVE = "medical_record_archive",

  // Appointments
  APPOINTMENT_REMINDER = "appointment_reminder",
  APPOINTMENT_FOLLOWUP = "appointment_followup",

  // Billing and payments
  INVOICE_GENERATION = "invoice_generation",
  PAYMENT_PROCESSING = "payment_processing",
  TAX_CALCULATION = "tax_calculation",

  // Compliance and auditing
  AUDIT_LOG_EXPORT = "audit_log_export",
  COMPLIANCE_REPORT = "compliance_report",
  LGPD_DATA_DELETION = "lgpd_data_deletion",

  // System maintenance
  DATABASE_CLEANUP = "database_cleanup",
  CACHE_WARMING = "cache_warming",
  BACKUP_DATABASE = "backup_database",

  // Integrations
  EXTERNAL_API_SYNC = "external_api_sync",
  WEBHOOK_DELIVERY = "webhook_delivery",
  FILE_PROCESSING = "file_processing",

  // Notifications
  EMAIL_SEND = "email_send",
  SMS_SEND = "sms_send",
  PUSH_NOTIFICATION = "push_notification",
}

// Job data schemas
const PatientDataSyncJobSchema = z.object({
  tenantId: z.string(),
  patientId: z.string(),
  source: z.string(),
  syncType: z.enum(["full", "incremental"]),
});

const AppointmentReminderJobSchema = z.object({
  tenantId: z.string(),
  appointmentId: z.string(),
  patientId: z.string(),
  reminderType: z.enum(["24h", "1h", "15m"]),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
});

const InvoiceGenerationJobSchema = z.object({
  tenantId: z.string(),
  appointmentId: z.string(),
  patientId: z.string(),
  services: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      amount: z.number(),
      taxRate: z.number(),
    }),
  ),
});

export type PatientDataSyncJobData = z.infer<typeof PatientDataSyncJobSchema>;
export type AppointmentReminderJobData = z.infer<typeof AppointmentReminderJobSchema>;
export type InvoiceGenerationJobData = z.infer<typeof InvoiceGenerationJobSchema>;

/**
 * Healthcare Job Manager with Bull/BullMQ
 */
export class HealthcareJobManager {
  private redis: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private jobHandlers: Map<HealthcareJobType, Function> = new Map();

  constructor(redisConfig: any) {
    this.redis = new Redis(redisConfig);
    this.setupJobHandlers();
  }

  /**
   * Initialize job queues and workers
   */
  async initialize(): Promise<void> {
    // Create queues for different job categories
    await this.createQueue("healthcare-high");
    await this.createQueue("healthcare-normal");
    await this.createQueue("healthcare-background");

    // Start workers
    this.startWorkers();

    // Setup scheduled jobs
    await this.setupScheduledJobs();

    healthcareLogger.log("info", "Healthcare Job Manager initialized");
  } /**
   * Add job to queue
   */
  async addJob<T = any>(
    type: HealthcareJobType,
    data: T,
    config: Partial<JobConfig> = {},
    tenantId: string,
  ): Promise<Job> {
    const validatedConfig = JobConfigSchema.parse(config);
    const queueName = this.getQueueNameForJobType(type);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobData = {
      type,
      tenantId,
      data,
      createdAt: new Date().toISOString(),
    };

    const job = await queue.add(type, jobData, {
      priority: validatedConfig.priority,
      delay: validatedConfig.delay,
      attempts: validatedConfig.attempts,
      backoff: validatedConfig.backoff,
      removeOnComplete: validatedConfig.removeOnComplete,
      removeOnFail: validatedConfig.removeOnFail,
      repeat: validatedConfig.repeat,
    });

    healthcareLogger.log("info", `Job added: ${type}`, {
      tenantId,
      metadata: { jobType: type, queueName, jobId: job.id },
    });

    return job;
  }

  /**
   * Healthcare-specific job methods
   */

  // Patient data synchronization
  async schedulePatientDataSync(
    tenantId: string,
    patientId: string,
    source: string,
    syncType: "full" | "incremental" = "incremental",
  ): Promise<Job> {
    const data: PatientDataSyncJobData = {
      tenantId,
      patientId,
      source,
      syncType,
    };

    return this.addJob(HealthcareJobType.PATIENT_DATA_SYNC, data, { priority: 8 }, tenantId);
  }

  // Appointment reminders
  async scheduleAppointmentReminder(
    tenantId: string,
    _appointmentId: string,
    reminderData: AppointmentReminderJobData,
    scheduleTime: Date,
  ): Promise<Job> {
    const delay = scheduleTime.getTime() - Date.now();

    return this.addJob(
      HealthcareJobType.APPOINTMENT_REMINDER,
      reminderData,
      { priority: 9, delay: Math.max(0, delay) },
      tenantId,
    );
  }

  // Invoice generation
  async scheduleInvoiceGeneration(
    tenantId: string,
    invoiceData: InvoiceGenerationJobData,
  ): Promise<Job> {
    return this.addJob(
      HealthcareJobType.INVOICE_GENERATION,
      invoiceData,
      { priority: 7 },
      tenantId,
    );
  }

  // LGPD data deletion (scheduled after retention period)
  async scheduleLGPDDataDeletion(
    tenantId: string,
    patientId: string,
    deletionDate: Date,
  ): Promise<Job> {
    const delay = deletionDate.getTime() - Date.now();

    return this.addJob(
      HealthcareJobType.LGPD_DATA_DELETION,
      { tenantId, patientId, requestedAt: new Date().toISOString() },
      { priority: 10, delay, attempts: 1 }, // Critical job, single attempt
      tenantId,
    );
  }

  // Bulk operations
  async scheduleBulkPatientSync(
    tenantId: string,
    patientIds: string[],
    source: string,
  ): Promise<Job[]> {
    const jobs = await Promise.all(
      patientIds.map((patientId) =>
        this.schedulePatientDataSync(tenantId, patientId, source, "incremental"),
      ),
    );

    healthcareLogger.log("info", `Bulk patient sync scheduled`, {
      tenantId,
      metadata: { patientCount: patientIds.length, source },
    });

    return jobs;
  }

  /**
   * Queue management
   */
  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
    ]);

    return {
      name: queueName,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      jobs: {
        waiting: waiting.map((job) => ({ id: job.id, name: job.name, data: job.data })),
        active: active.map((job) => ({ id: job.id, name: job.name, data: job.data })),
        failed: failed.map((job) => ({
          id: job.id,
          name: job.name,
          error: job.failedReason,
          attempts: job.attemptsMade,
        })),
      },
    };
  }

  async getAllQueueStats(): Promise<any[]> {
    const stats = await Promise.all(
      Array.from(this.queues.keys()).map((name) => this.getQueueStats(name)),
    );
    return stats.filter(Boolean);
  }

  async retryFailedJobs(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    const failedJobs = await queue.getFailed();

    for (const job of failedJobs) {
      await job.retry();
      healthcareLogger.log("info", `Job retried: ${job.name}`, {
        metadata: { queueName, attempts: job.attemptsMade, jobId: job.id },
      });
    }
  }

  async cleanOldJobs(queueName: string, maxAge: number = 86400000): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    await queue.clean(maxAge, 100, "completed");
    await queue.clean(maxAge, 50, "failed");

    healthcareLogger.log("info", `Queue cleaned: ${queueName}`, {
      metadata: { maxAge, type: "cleanup" },
    });
  }

  /**
   * Shutdown gracefully
   */
  async shutdown(): Promise<void> {
    healthcareLogger.log("info", "Shutting down job manager");

    // Close all workers
    await Promise.all(Array.from(this.workers.values()).map((worker) => worker.close()));

    // Close all queues
    await Promise.all(Array.from(this.queues.values()).map((queue) => queue.close()));

    // Close Redis connection
    await this.redis.quit();
  }

  // Private methods

  private async createQueue(name: string, options: Partial<QueueOptions> = {}): Promise<void> {
    const queue = new Queue(name, {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        ...options,
      },
    });

    this.queues.set(name, queue);

    // Setup queue events
    queue.on("error", (error) => {
      healthcareLogger.logError(error, { metadata: { queueName: name } });
    });

    queue.on("waiting", (job) => {
      healthcareLogger.log("debug", `Job waiting: ${job.name}`, {
        metadata: { queueName: name, jobId: job.id },
      });
    });
  }

  private startWorkers(): void {
    const workerOptions: WorkerOptions = {
      connection: this.redis,
      concurrency: 5,
      maxStalledCount: 1,
      stalledInterval: 30000,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    };

    // Start workers for each queue
    for (const [queueName] of this.queues) {
      const worker = new Worker(queueName, this.processJob.bind(this), workerOptions);

      // Setup worker events
      worker.on("completed", (job) => {
        healthcareLogger.log("info", `Job completed: ${job.name}`, {
          tenantId: job.data.tenantId,
          metadata: { queueName, duration: Date.now() - job.timestamp, jobId: job.id },
        });
      });

      worker.on("failed", (job, err) => {
        healthcareLogger.logError(err, {
          tenantId: job?.data?.tenantId,
          metadata: { queueName, jobName: job?.name, attempts: job?.attemptsMade, jobId: job?.id },
        });
      });

      worker.on("error", (error) => {
        healthcareLogger.logError(error, { metadata: { workerQueue: queueName } });
      });

      this.workers.set(queueName, worker);
    }
  }

  private async processJob(job: Job): Promise<any> {
    const { type, tenantId, data } = job.data;
    const handler = this.jobHandlers.get(type);

    if (!handler) {
      throw new Error(`No handler found for job type: ${type}`);
    }

    healthcareLogger.log("info", `Processing job: ${type}`, {
      tenantId,
      metadata: { jobType: type, jobId: job.id },
    });

    const startTime = Date.now();

    try {
      const result = await handler(data, job);
      const duration = Date.now() - startTime;

      healthcareLogger.logPerformance(`Job ${type}`, duration, {
        tenantId,
        success: true,
        metadata: { jobId: job.id },
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      healthcareLogger.logError(error as Error, {
        tenantId,
        metadata: { jobType: type, duration, jobId: job.id },
      });

      throw error;
    }
  }

  private setupJobHandlers(): void {
    // Patient data handlers
    this.jobHandlers.set(
      HealthcareJobType.PATIENT_DATA_SYNC,
      this.handlePatientDataSync.bind(this),
    );
    this.jobHandlers.set(HealthcareJobType.PATIENT_BACKUP, this.handlePatientBackup.bind(this));

    // Appointment handlers
    this.jobHandlers.set(
      HealthcareJobType.APPOINTMENT_REMINDER,
      this.handleAppointmentReminder.bind(this),
    );

    // Billing handlers
    this.jobHandlers.set(
      HealthcareJobType.INVOICE_GENERATION,
      this.handleInvoiceGeneration.bind(this),
    );

    // Compliance handlers
    this.jobHandlers.set(
      HealthcareJobType.LGPD_DATA_DELETION,
      this.handleLGPDDataDeletion.bind(this),
    );

    // System maintenance
    this.jobHandlers.set(HealthcareJobType.DATABASE_CLEANUP, this.handleDatabaseCleanup.bind(this));
  }

  private getQueueNameForJobType(type: HealthcareJobType): string {
    const highPriorityJobs = [
      HealthcareJobType.APPOINTMENT_REMINDER,
      HealthcareJobType.LGPD_DATA_DELETION,
      HealthcareJobType.PAYMENT_PROCESSING,
    ];

    const backgroundJobs = [
      HealthcareJobType.DATABASE_CLEANUP,
      HealthcareJobType.AUDIT_LOG_EXPORT,
      HealthcareJobType.PATIENT_BACKUP,
    ];

    if (highPriorityJobs.includes(type)) return "healthcare-high";
    if (backgroundJobs.includes(type)) return "healthcare-background";
    return "healthcare-normal";
  }

  private async setupScheduledJobs(): Promise<void> {
    // Schedule daily database cleanup
    await this.addJob(
      HealthcareJobType.DATABASE_CLEANUP,
      { maxAge: 86400000 * 30 }, // 30 days
      {
        repeat: { pattern: "0 2 * * *" }, // 2 AM daily
        priority: 1,
      },
      "system",
    );

    // Schedule weekly compliance reports
    await this.addJob(
      HealthcareJobType.COMPLIANCE_REPORT,
      { reportType: "weekly" },
      {
        repeat: { pattern: "0 0 * * 0" }, // Sunday midnight
        priority: 3,
      },
      "system",
    );
  }

  // Job handler implementations (simplified)
  private async handlePatientDataSync(_data: PatientDataSyncJobData): Promise<void> {
    // Implementation would sync patient data from external sources
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
  }

  private async handlePatientBackup(_data: any): Promise<void> {
    // Implementation would backup patient data
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
  }

  private async handleAppointmentReminder(_data: AppointmentReminderJobData): Promise<void> {
    // Implementation would send appointment reminders
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate work
  }

  private async handleInvoiceGeneration(_data: InvoiceGenerationJobData): Promise<void> {
    // Implementation would generate invoices
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate work
  }

  private async handleLGPDDataDeletion(_data: any): Promise<void> {
    // Implementation would handle LGPD-compliant data deletion
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate work
  }

  private async handleDatabaseCleanup(_data: any): Promise<void> {
    // Implementation would clean up old database records
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate work
  }
}

// Singleton instance
export let jobManager: HealthcareJobManager;

// Initialize job manager
export async function initializeJobManager(redisConfig: any): Promise<HealthcareJobManager> {
  jobManager = new HealthcareJobManager(redisConfig);
  await jobManager.initialize();
  return jobManager;
}

// Fastify plugin
export async function registerJobManager(fastify: any, redisConfig: any) {
  const manager = await initializeJobManager(redisConfig);
  fastify.decorate("jobs", manager);

  // Shutdown hook
  fastify.addHook("onClose", async () => {
    await manager.shutdown();
  });

  // Health check endpoint
  fastify.get("/health/jobs", async () => {
    const stats = await manager.getAllQueueStats();
    return { status: "healthy", queues: stats };
  });
}
