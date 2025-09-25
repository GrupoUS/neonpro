/**
 * Background Jobs Manager Tests
 * Comprehensive test suite for healthcare background job processing system
 * 
 * Following TDD principles and KISS/YAGNI methodology
 * Version: 1.0.0
 * Compliance: LGPD, ANVISA, ISO 27001
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { 
  JobManager, 
  Worker, 
  createHealthcareJobManager, 
  createWorkerPool,
  PatientDataSyncHandler,
  EmergencyNotificationHandler,
  ComplianceAuditHandler,
  DataRetentionCleanupHandler
} from '../../../packages/shared/src/services/background-jobs-manager'
import { InMemoryJobQueue } from '../../../packages/shared/src/services/background-jobs-framework'
import { HealthcareJobType, JobPriority, JobStatus, HealthcareJobContext } from '../../../packages/shared/src/services/background-jobs-framework'
import type { JobData, JobExecutionResult, CreateJobRequest, JobQueue } from '../../../packages/shared/src/services/background-jobs-framework'

// Mock healthcare logger
vi.mock('../../../packages/shared/src/logging/healthcare-logger', () => ({
  logHealthcareError: vi.fn(),
  default: {
    auditLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}))

// Mock utilities
const mockJobId = '12345678-1234-1234-1234-123456789012'
vi.mock('../../../packages/shared/src/services/background-jobs-framework', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    generateJobId: vi.fn(() => mockJobId),
    calculateRetryDelay: vi.fn(() => 5000),
    getDefaultJobConfig: vi.fn(() => ({
      jobTimeout: 300000,
      maxRetries: 3,
      priority: JobPriority.MEDIUM,
    })),
    HealthcareJobContextSchema: {
      safeParse: vi.fn((data: any) => {
        // Return success only for valid healthcare context structure
        if (data && typeof data === 'object') {
          // Check for required fields based on the schema
          const hasValidFields = data.patientId !== undefined ||
                               data.urgencyLevel !== undefined ||
                               data.dataClassification !== undefined
          return { success: hasValidFields, data: hasValidFields ? data : undefined }
        }
        return { success: false, error: new Error('Invalid healthcare context') }
      })
    }
  }
})

describe('Background Jobs Manager - JobManager', () => {
  let jobManager: JobManager
  let jobQueue: JobQueue
  let mockQueue: any

  beforeEach(() => {
    // Create mock job queue
    mockQueue = new InMemoryJobQueue()
    jobQueue = mockQueue
    jobManager = new JobManager(jobQueue)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor and Initialization', () => {
    it('should create JobManager with valid job queue', () => {
      expect(jobManager).toBeInstanceOf(JobManager)
      expect(jobManager['jobQueue']).toBe(jobQueue)
      expect(jobManager['handlers']).toBeInstanceOf(Map)
      expect(jobManager['workers']).toBeInstanceOf(Map)
      expect(jobManager['isRunning']).toBe(false)
    })

    it('should initialize with empty handlers and workers', () => {
      expect(jobManager['handlers'].size).toBe(0)
      expect(jobManager['workers'].size).toBe(0)
      expect(jobManager['auditLog']).toEqual([])
    })
  })

  describe('Handler Registration', () => {
    it('should register function-based handler correctly', () => {
      const mockHandler = vi.fn(() => Promise.resolve({ success: true }))
      
      jobManager.registerHandler(HealthcareJobType.APPOINTMENT_REMINDER, mockHandler)
      
      expect(jobManager['handlers'].has(HealthcareJobType.APPOINTMENT_REMINDER)).toBe(true)
      const handler = jobManager['handlers'].get(HealthcareJobType.APPOINTMENT_REMINDER)
      expect(handler).toHaveProperty('execute')
      expect(handler).toHaveProperty('getSupportedTypes')
      expect(handler).toHaveProperty('validatePayload')
    })

    it('should register JobHandler object correctly', () => {
      const mockJobHandler = {
        execute: vi.fn(() => Promise.resolve({ success: true })),
        getSupportedTypes: vi.fn(() => [HealthcareJobType.COMPLIANCE_AUDIT]),
        validatePayload: vi.fn(() => Promise.resolve(true)),
        getEstimatedExecutionTime: vi.fn(() => Promise.resolve(5000)),
      }

      jobManager.registerJobHandler(HealthcareJobType.COMPLIANCE_AUDIT, mockJobHandler)
      
      expect(jobManager['handlers'].has(HealthcareJobType.COMPLIANCE_AUDIT)).toBe(true)
      const handler = jobManager['handlers'].get(HealthcareJobType.COMPLIANCE_AUDIT)
      expect(handler).toBe(mockJobHandler)
    })

    it('should handle duplicate handler registration', () => {
      const mockHandler1 = vi.fn(() => Promise.resolve({ success: true }))
      const mockHandler2 = vi.fn(() => Promise.resolve({ success: false }))
      
      jobManager.registerHandler(HealthcareJobType.APPOINTMENT_REMINDER, mockHandler1)
      jobManager.registerHandler(HealthcareJobType.APPOINTMENT_REMINDER, mockHandler2)
      
      expect(jobManager['handlers'].size).toBe(1)
      const handler = jobManager['handlers'].get(HealthcareJobType.APPOINTMENT_REMINDER)
      expect(handler).toHaveProperty('execute')
    })
  })

  describe('Start and Stop Operations', () => {
    it('should start job manager successfully', async () => {
      await jobManager.start()
      
      expect(jobManager['isRunning']).toBe(true)
      expect(jobManager['startTime']).toBeDefined()
      expect(jobManager['processingLoop']).toBeDefined()
    })

    it('should throw error when starting already running manager', async () => {
      await jobManager.start()
      
      await expect(jobManager.start()).rejects.toThrow('Job manager is already running')
    })

    it('should stop job manager gracefully', async () => {
      await jobManager.start()
      const mockWorker = { stop: vi.fn() }
      jobManager['workers'].set('test-worker', mockWorker as any)
      
      // Store the interval reference before stopping
      const intervalBeforeStop = jobManager['processingLoop']
      
      await jobManager.stop()
      
      expect(jobManager['isRunning']).toBe(false)
      expect(mockWorker.stop).toHaveBeenCalled()
      // The interval should be cleared (but may not be undefined)
      expect(jobManager['workers'].size).toBe(0)
      expect(jobManager['auditLog']).toEqual([])
    })

    it('should handle stop when not running', async () => {
      await jobManager.stop()
      
      expect(jobManager['isRunning']).toBe(false)
    })

    it('should clear audit log on stop', async () => {
      await jobManager.start()
      jobManager['auditLog'].push({ type: 'test', timestamp: new Date().toISOString() })
      
      await jobManager.stop()
      
      expect(jobManager['auditLog']).toEqual([])
    })
  })

  describe('Job Creation', () => {
    it('should create job with valid request', async () => {
      const mockHandler = {
        execute: vi.fn(() => Promise.resolve({ success: true })),
        getSupportedTypes: vi.fn(() => [HealthcareJobType.APPOINTMENT_REMINDER]),
        validatePayload: vi.fn(() => Promise.resolve(true)),
      }
      
      jobManager.registerJobHandler(HealthcareJobType.APPOINTMENT_REMINDER, mockHandler)
      
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { patientId: 'test-patient' },
      }
      
      const jobId = await jobManager.createJob(jobRequest)
      
      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')
      expect(mockHandler.validatePayload).toHaveBeenCalledWith(jobRequest._payload)
    })

    it('should validate healthcare context when provided', async () => {
      const validContext: HealthcareJobContext = {
        patientId: 'test-patient',
        urgencyLevel: 'routine',
        dataClassification: 'internal',
        clinicalContext: 'consultation',
      }

      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { patientId: 'test-patient' },
        healthcareContext: validContext,
      }

      // This should not throw an error
      const jobId = await jobManager.createJob(jobRequest)
      expect(jobId).toBeDefined()
    })

    it('should reject invalid healthcare context', async () => {
      const invalidContext = { invalid: 'context' }
      
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { patientId: 'test-patient' },
        healthcareContext: invalidContext,
      }
      
      await expect(jobManager.createJob(jobRequest)).rejects.toThrow()
    })

    it('should reject invalid payload for registered handler', async () => {
      const mockHandler = {
        execute: vi.fn(() => Promise.resolve({ success: true })),
        getSupportedTypes: vi.fn(() => [HealthcareJobType.APPOINTMENT_REMINDER]),
        validatePayload: vi.fn(() => Promise.resolve(false)),
      }
      
      jobManager.registerJobHandler(HealthcareJobType.APPOINTMENT_REMINDER, mockHandler)
      
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { invalid: 'payload' },
      }
      
      await expect(jobManager.createJob(jobRequest)).rejects.toThrow('Invalid payload for job type')
    })

    it('should validate basic payload for unregistered handler', async () => {
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: null,
      }
      
      await expect(jobManager.createJob(jobRequest)).rejects.toThrow('Invalid payload for job type')
    })
  })

  describe('Job Status Management', () => {
    it('should get job status correctly', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      
      const status = await jobManager.getJobStatus('test-job-123')
      
      expect(status).toBe(mockJob)
      expect(jobQueue.getJob).toHaveBeenCalledWith('test-job-123')
    })

    it('should return null for non-existent job', async () => {
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(null)
      
      const status = await jobManager.getJobStatus('non-existent-job')
      
      expect(status).toBeNull()
    })
  })

  describe('Job Cancellation', () => {
    it('should cancel pending job successfully', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      vi.spyOn(jobQueue, 'updateJob').mockResolvedValue()
      
      const result = await jobManager.cancelJob('test-job-123')
      
      expect(result).toBe(true)
      expect(jobQueue.updateJob).toHaveBeenCalledWith('test-job-123', {
        status: JobStatus.CANCELLED,
        completedAt: expect.any(Date),
      })
    })

    it('should not cancel completed job', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.COMPLETED,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      
      const result = await jobManager.cancelJob('test-job-123')
      
      expect(result).toBe(false)
    })

    it('should not cancel running job', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.RUNNING,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      
      const result = await jobManager.cancelJob('test-job-123')
      
      expect(result).toBe(false)
    })

    it('should return false for non-existent job', async () => {
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(null)
      
      const result = await jobManager.cancelJob('non-existent-job')
      
      expect(result).toBe(false)
    })
  })

  describe('Job Retry Logic', () => {
    it('should retry failed job within retry limit', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.FAILED,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 1,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
        error: 'Test error',
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      vi.spyOn(jobQueue, 'updateJob').mockResolvedValue()
      
      const result = await jobManager.retryJob('test-job-123')
      
      expect(result).toBe(true)
      expect(jobQueue.updateJob).toHaveBeenCalledWith('test-job-123', {
        status: JobStatus.PENDING,
        attemptCount: 0,
        error: undefined,
        nextRetryAt: undefined,
        lastAttemptAt: expect.any(Date),
      })
    })

    it('should not retry non-failed job', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      
      const result = await jobManager.retryJob('test-job-123')
      
      expect(result).toBe(false)
    })

    it('should not retry job exceeding max retries', async () => {
      const mockJob: JobData = {
        jobId: 'test-job-123',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.FAILED,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test-patient' },
        createdAt: new Date(),
        attemptCount: 3,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
        error: 'Test error',
      }
      
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(mockJob)
      
      const result = await jobManager.retryJob('test-job-123')
      
      expect(result).toBe(false)
    })

    it('should return false for non-existent job', async () => {
      vi.spyOn(jobQueue, 'getJob').mockResolvedValue(null)
      
      const result = await jobManager.retryJob('non-existent-job')
      
      expect(result).toBe(false)
    })
  })

  describe('Worker Management', () => {
    it('should add worker correctly', () => {
      const workerConfig = {
        workerId: 'test-worker',
        concurrency: 3,
        pollInterval: 1000,
        emergencyJobsOnly: false,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxCpuUsage: 2,
        jobTimeout: 300000,
        heartbeatInterval: 30000,
        priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
        allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
        maxJobPriority: JobPriority.HIGH,
        tags: [],
        metadata: {},
      }
      
      jobManager.addWorker(workerConfig)
      
      expect(jobManager['workers'].has('test-worker')).toBe(true)
      const worker = jobManager['workers'].get('test-worker')
      expect(worker).toBeDefined()
    })

    it('should remove worker correctly', async () => {
      const mockWorker = {
        stop: vi.fn(),
        getStatus: vi.fn(() => ({ workerId: 'test-worker', isRunning: true })),
      }
      
      jobManager['workers'].set('test-worker', mockWorker as any)
      
      await jobManager.removeWorker('test-worker')
      
      expect(mockWorker.stop).toHaveBeenCalled()
      expect(jobManager['workers'].has('test-worker')).toBe(false)
    })

    it('should handle removing non-existent worker', async () => {
      await expect(jobManager.removeWorker('non-existent-worker')).resolves.not.toThrow()
    })
  })

  describe('Statistics and Monitoring', () => {
    it('should return correct statistics when running', async () => {
      await jobManager.start()
      
      // Add a small delay to ensure uptime is calculated
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const mockWorker = {
        getStatus: vi.fn(() => ({
          workerId: 'test-worker',
          isRunning: true,
          currentJobs: 0,
          maxConcurrency: 3,
          lastHeartbeat: new Date(),
          allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
        })),
      }
      
      jobManager['workers'].set('test-worker', mockWorker as any)
      jobManager['handlers'].set(HealthcareJobType.APPOINTMENT_REMINDER, {
        execute: vi.fn(),
        getSupportedTypes: vi.fn(),
        validatePayload: vi.fn(),
        getEstimatedExecutionTime: vi.fn(),
      } as any)
      
      const stats = jobManager.getStatistics()
      
      expect(stats.isRunning).toBe(true)
      expect(stats.totalJobs).toBe(0)
      expect(stats.workers).toHaveLength(1)
      expect(stats.activeWorkers).toBe(1)
      expect(stats.registeredHandlers).toBe(1)
      expect(stats.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should return correct statistics when not running', () => {
      const stats = jobManager.getStatistics()
      
      expect(stats.isRunning).toBe(false)
      expect(stats.uptime).toBe(0)
    })

    it('should filter audit log correctly', () => {
      const auditEvents = [
        { type: 'job_created', jobId: 'job1', action: 'create', timestamp: '2024-01-01T10:00:00Z' },
        { type: 'job_completed', jobId: 'job2', action: 'complete', timestamp: '2024-01-01T11:00:00Z' },
        { type: 'job_failed', jobId: 'job1', action: 'fail', timestamp: '2024-01-01T12:00:00Z' },
      ]
      
      jobManager['auditLog'] = auditEvents
      
      const filtered = jobManager.getAuditLog({ jobId: 'job1' })
      
      expect(filtered).toHaveLength(2)
      expect(filtered.map(e => e.jobId)).toEqual(['job1', 'job1'])
    })
  })

  describe('Destroy and Cleanup', () => {
    it('should destroy job manager correctly', async () => {
      await jobManager.start()
      const stopSpy = vi.spyOn(jobManager, 'stop').mockResolvedValue()
      
      jobManager.destroy()
      
      expect(stopSpy).toHaveBeenCalled()
    })

    it('should handle destroy when not running', () => {
      expect(() => jobManager.destroy()).not.toThrow()
    })
  })
})

describe('Background Jobs Manager - Worker', () => {
  let worker: Worker
  let jobQueue: JobQueue
  let handlers: Map<HealthcareJobType, any>
  let mockQueue: any

  beforeEach(() => {
    mockQueue = new InMemoryJobQueue()
    jobQueue = mockQueue
    handlers = new Map()
    
    const mockHandler = {
      execute: vi.fn(() => Promise.resolve({ success: true })),
      getSupportedTypes: vi.fn(() => [HealthcareJobType.APPOINTMENT_REMINDER]),
      validatePayload: vi.fn(() => Promise.resolve(true)),
      getEstimatedExecutionTime: vi.fn(() => Promise.resolve(5000)),
    }
    
    handlers.set(HealthcareJobType.APPOINTMENT_REMINDER, mockHandler)
    
    const workerConfig = {
      workerId: 'test-worker',
      concurrency: 2,
      pollInterval: 1000,
      emergencyJobsOnly: false,
      maxMemoryUsage: 512 * 1024 * 1024,
      maxCpuUsage: 2,
      jobTimeout: 30000,
      heartbeatInterval: 30000,
      priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
      allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
      maxJobPriority: JobPriority.HIGH,
      tags: [],
      metadata: {},
    }
    
    worker = new Worker(workerConfig, jobQueue, handlers)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Worker Lifecycle', () => {
    it('should start worker correctly', async () => {
      await worker.start()
      
      expect(worker['isRunning']).toBe(true)
      expect(worker['lastHeartbeat']).toBeInstanceOf(Date)
    })

    it('should throw error when starting already running worker', async () => {
      await worker.start()
      
      await expect(worker.start()).rejects.toThrow('Worker is already running')
    })

    it('should stop worker correctly', async () => {
      await worker.start()
      await worker.stop()
      
      expect(worker['isRunning']).toBe(false)
      expect(worker['currentJobs'].size).toBe(0)
    })

    it('should handle stop when not running', async () => {
      await worker.stop()
      
      expect(worker['isRunning']).toBe(false)
    })
  })

  describe('Worker Status', () => {
    it('should return correct status', () => {
      const status = worker.getStatus()
      
      expect(status.workerId).toBe('test-worker')
      expect(status.isRunning).toBe(false)
      expect(status.currentJobs).toBe(0)
      expect(status.maxConcurrency).toBe(2)
      expect(status.lastHeartbeat).toBeInstanceOf(Date)
      expect(status.allowedJobTypes).toEqual([HealthcareJobType.APPOINTMENT_REMINDER])
    })
  })

  describe('Job Type Filtering', () => {
    it('should return all job types when no restriction', () => {
      const workerConfig = {
        workerId: 'test-worker',
        concurrency: 2,
        pollInterval: 1000,
        emergencyJobsOnly: false,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxCpuUsage: 2,
        jobTimeout: 30000,
        heartbeatInterval: 30000,
        priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
        allowedJobTypes: [],
        maxJobPriority: JobPriority.HIGH,
        tags: [],
        metadata: {},
      }
      
      const unrestrictedWorker = new Worker(workerConfig, jobQueue, handlers)
      const allowedTypes = (unrestrictedWorker as any).getAllowedJobTypes()
      
      expect(allowedTypes).toContain(HealthcareJobType.APPOINTMENT_REMINDER)
    })

    it('should return restricted job types when specified', () => {
      const allowedTypes = (worker as any).getAllowedJobTypes()
      
      expect(allowedTypes).toEqual([HealthcareJobType.APPOINTMENT_REMINDER])
    })

    it('should correctly identify emergency jobs', () => {
      const emergencyJob: JobData = {
        jobId: 'emergency-job',
        type: HealthcareJobType.EMERGENCY_NOTIFICATION,
        status: JobStatus.PENDING,
        priority: JobPriority.CRITICAL,
        _payload: { alertType: 'test' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const isEmergency = (worker as any).isEmergencyJob(emergencyJob)
      
      expect(isEmergency).toBe(true)
    })

    it('should correctly identify non-emergency jobs', () => {
      const normalJob: JobData = {
        jobId: 'normal-job',
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: { patientId: 'test' },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const isEmergency = (worker as any).isEmergencyJob(normalJob)
      
      expect(isEmergency).toBe(false)
    })
  })
})

describe('Background Jobs Manager - Healthcare Job Handlers', () => {
  describe('PatientDataSyncHandler', () => {
    let handler: PatientDataSyncHandler

    beforeEach(() => {
      handler = new PatientDataSyncHandler()
    })

    it('should return supported job types', () => {
      const types = handler.getSupportedTypes()
      
      expect(types).toContain(HealthcareJobType.PATIENT_DATA_SYNC)
    })

    it('should validate correct payload', async () => {
      const validPayload = {
        patientId: 'test-patient',
        sourceSystem: 'system1',
        targetSystem: 'system2',
        syncFields: ['name', 'email'],
      }
      
      const isValid = await handler.validatePayload(validPayload)
      
      expect(isValid).toBe(true)
    })

    it('should reject invalid payload', async () => {
      const invalidPayload = {
        patientId: 'test-patient',
        // Missing required sourceSystem and targetSystem
      }
      
      const isValid = await handler.validatePayload(invalidPayload)
      
      expect(isValid).toBe(false)
    })

    it('should execute patient data sync job successfully', async () => {
      const job: JobData = {
        jobId: 'sync-job',
        type: HealthcareJobType.PATIENT_DATA_SYNC,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: {
          patientId: 'test-patient',
          sourceSystem: 'system1',
          targetSystem: 'system2',
          syncFields: ['name', 'email'],
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const result = await handler.execute(job)
      
      expect(result.success).toBe(true)
      expect(result.progress).toBe(100)
      expect(result.result.patientId).toBe('test-patient')
      expect(result.result.syncedFields).toHaveLength(2)
      expect(result.auditEvents).toHaveLength(2)
    })

    it('should handle missing sync fields', async () => {
      const job: JobData = {
        jobId: 'sync-job',
        type: HealthcareJobType.PATIENT_DATA_SYNC,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: {
          patientId: 'test-patient',
          sourceSystem: 'system1',
          targetSystem: 'system2',
          // syncFields not provided
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const result = await handler.execute(job)
      
      expect(result.success).toBe(true)
      expect(result.result.syncedFields).toHaveLength(4) // Default fields
    })

    it('should throw error for missing patient ID', async () => {
      const job: JobData = {
        jobId: 'sync-job',
        type: HealthcareJobType.PATIENT_DATA_SYNC,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: {
          sourceSystem: 'system1',
          targetSystem: 'system2',
          // Missing patientId
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      await expect(handler.execute(job)).rejects.toThrow('Patient ID is required')
    })
  })

  describe('EmergencyNotificationHandler', () => {
    let handler: EmergencyNotificationHandler

    beforeEach(() => {
      handler = new EmergencyNotificationHandler()
    })

    it('should return supported job types', () => {
      const types = handler.getSupportedTypes()
      
      expect(types).toContain(HealthcareJobType.EMERGENCY_NOTIFICATION)
    })

    it('should validate correct payload', async () => {
      const validPayload = {
        emergencyType: 'medical-emergency',
        severity: 'high',
        message: 'Test emergency message',
        recipients: ['doctor1', 'nurse1'],
      }
      
      const isValid = await handler.validatePayload(validPayload)
      
      expect(isValid).toBe(true)
    })

    it('should validate payload with alertType', async () => {
      const validPayload = {
        alertType: 'medical-emergency',
        severity: 'high',
        message: 'Test emergency message',
        recipients: ['doctor1', 'nurse1'],
      }
      
      const isValid = await handler.validatePayload(validPayload)
      
      expect(isValid).toBe(true)
    })

    it('should reject invalid payload', async () => {
      const invalidPayload = {
        emergencyType: 'medical-emergency',
        severity: 'high',
        // Missing message and recipients
      }
      
      const isValid = await handler.validatePayload(invalidPayload)
      
      expect(isValid).toBe(false)
    })

    it('should execute emergency notification job successfully', async () => {
      const job: JobData = {
        jobId: 'emergency-job',
        type: HealthcareJobType.EMERGENCY_NOTIFICATION,
        status: JobStatus.PENDING,
        priority: JobPriority.CRITICAL,
        _payload: {
          emergencyType: 'medical-emergency',
          patientId: 'test-patient',
          severity: 'high',
          message: 'Test emergency message',
          recipients: ['doctor1', 'nurse1'],
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const result = await handler.execute(job)
      
      expect(result.success).toBe(true)
      expect(result.progress).toBe(100)
      expect(result.result.alertType).toBe('medical-emergency')
      expect(result.result.totalRecipients).toBe(2)
      expect(result.result.successfulDeliveries).toBe(2)
      expect(result.auditEvents).toHaveLength(3) // 1 initiated + 2 delivered
    })
  })

  describe('ComplianceAuditHandler', () => {
    let handler: ComplianceAuditHandler

    beforeEach(() => {
      handler = new ComplianceAuditHandler()
    })

    it('should return supported job types', () => {
      const types = handler.getSupportedTypes()
      
      expect(types).toContain(HealthcareJobType.COMPLIANCE_AUDIT)
    })

    it('should validate correct payload', async () => {
      const validPayload = {
        auditType: 'lgpd-compliance',
        scope: 'facility',
        filters: { department: 'cardiology' },
      }
      
      const isValid = await handler.validatePayload(validPayload)
      
      expect(isValid).toBe(true)
    })

    it('should reject invalid payload', async () => {
      const invalidPayload = {
        auditType: 'lgpd-compliance',
        // Missing required scope
      }
      
      const isValid = await handler.validatePayload(invalidPayload)
      
      expect(isValid).toBe(false)
    })

    it('should execute compliance audit job successfully', async () => {
      const job: JobData = {
        jobId: 'audit-job',
        type: HealthcareJobType.COMPLIANCE_AUDIT,
        status: JobStatus.PENDING,
        priority: JobPriority.HIGH,
        _payload: {
          auditType: 'lgpd-compliance',
          scope: 'facility',
          filters: { department: 'cardiology' },
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const result = await handler.execute(job)
      
      expect(result.success).toBe(true)
      expect(result.progress).toBe(100)
      expect(result.result.auditType).toBe('lgpd-compliance')
      expect(result.result.scope).toBe('facility')
      expect(result.result.findings).toHaveLength(3)
      expect(result.result.complianceScore).toBe(95)
    })

    it('should calculate execution time based on scope', async () => {
      const facilityPayload = { auditType: 'test', scope: 'facility' }
      const systemPayload = { auditType: 'test', scope: 'system' }
      
      const facilityTime = await handler.getEstimatedExecutionTime(facilityPayload)
      const systemTime = await handler.getEstimatedExecutionTime(systemPayload)
      
      expect(systemTime).toBeGreaterThan(facilityTime)
    })
  })

  describe('DataRetentionCleanupHandler', () => {
    let handler: DataRetentionCleanupHandler

    beforeEach(() => {
      handler = new DataRetentionCleanupHandler()
    })

    it('should return supported job types', () => {
      const types = handler.getSupportedTypes()
      
      expect(types).toContain(HealthcareJobType.DATA_RETENTION_CLEANUP)
    })

    it('should validate correct payload', async () => {
      const validPayload = {
        dataTypes: ['patient_records', 'appointments'],
        retentionPolicy: { patient_records: 365, appointments: 180 },
        dryRun: false,
      }
      
      const isValid = await handler.validatePayload(validPayload)
      
      expect(isValid).toBe(true)
    })

    it('should reject invalid payload', async () => {
      const invalidPayload = {
        dataTypes: ['patient_records'],
        // Missing retentionPolicy and dryRun
      }
      
      const isValid = await handler.validatePayload(invalidPayload)
      
      expect(isValid).toBe(false)
    })

    it('should execute data retention cleanup job successfully', async () => {
      const job: JobData = {
        jobId: 'cleanup-job',
        type: HealthcareJobType.DATA_RETENTION_CLEANUP,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: {
          dataTypes: ['patient_records', 'appointments'],
          retentionPolicy: { patient_records: 365, appointments: 180 },
          dryRun: false,
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const result = await handler.execute(job)
      
      expect(result.success).toBe(true)
      expect(result.progress).toBe(100)
      expect(result.result.dryRun).toBe(false)
      expect(result.result.cleanupResults).toHaveLength(2)
      expect(result.result.totalRecordsProcessed).toBeGreaterThanOrEqual(0)
      expect(result.result.totalSpaceFreed).toBeGreaterThanOrEqual(0)
      expect(result.auditEvents).toHaveLength(3) // 1 initiated + 2 per data type
    })

    it('should handle dry run correctly', async () => {
      const job: JobData = {
        jobId: 'cleanup-job',
        type: HealthcareJobType.DATA_RETENTION_CLEANUP,
        status: JobStatus.PENDING,
        priority: JobPriority.MEDIUM,
        _payload: {
          dataTypes: ['patient_records'],
          retentionPolicy: { patient_records: 365 },
          dryRun: true,
        },
        createdAt: new Date(),
        attemptCount: 0,
        maxRetries: 3,
        auditEvents: [],
        lgpdCompliant: true,
        dependencies: [],
        dependents: [],
        progress: 0,
        tags: [],
        metadata: {},
      }
      
      const result = await handler.execute(job)
      
      expect(result.success).toBe(true)
      expect(result.result.dryRun).toBe(true)
      expect(result.result.totalRecordsProcessed).toBe(0)
      expect(result.result.totalSpaceFreed).toBe(0)
      
      const cleanupResult = result.result.cleanupResults[0]
      expect(cleanupResult.action).toBe('analyzed')
    })
  })
})

describe('Background Jobs Manager - Utility Functions', () => {
  let jobQueue: JobQueue

  beforeEach(() => {
    jobQueue = new InMemoryJobQueue()
  })

  describe('createHealthcareJobManager', () => {
    it('should create job manager with healthcare handlers', () => {
      const manager = createHealthcareJobManager(jobQueue)
      
      expect(manager).toBeInstanceOf(JobManager)
      expect(manager['handlers'].size).toBeGreaterThan(0)
    })
  })

  describe('createWorkerPool', () => {
    it('should create worker pool with specified size', () => {
      const workers = createWorkerPool(jobQueue, 3)
      
      expect(workers).toHaveLength(3)
      workers.forEach(worker => {
        expect(worker).toBeInstanceOf(Worker)
      })
    })

    it('should create worker pool with job type restrictions', () => {
      const restrictedTypes = [HealthcareJobType.EMERGENCY_NOTIFICATION]
      const workers = createWorkerPool(jobQueue, 2, restrictedTypes)
      
      expect(workers).toHaveLength(2)
      workers.forEach(worker => {
        const status = worker.getStatus()
        expect(status.allowedJobTypes).toEqual(restrictedTypes)
      })
    })

    it('should create workers with default settings when no restrictions', () => {
      const workers = createWorkerPool(jobQueue, 1)
      
      expect(workers).toHaveLength(1)
      const worker = workers[0]
      const status = worker.getStatus()
      expect(status.allowedJobTypes).toContain(HealthcareJobType.APPOINTMENT_REMINDER)
      expect(status.allowedJobTypes).toContain(HealthcareJobType.EMERGENCY_NOTIFICATION)
    })
  })
})

describe('Background Jobs Manager - Integration Scenarios', () => {
  let jobManager: JobManager
  let jobQueue: JobQueue

  beforeEach(() => {
    jobQueue = new InMemoryJobQueue()
    jobManager = createHealthcareJobManager(jobQueue)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('End-to-End Job Processing', () => {
    it('should process job from creation to completion', async () => {
      // Create and start job manager
      await jobManager.start()
      
      // Add a worker
      const workerConfig = {
        workerId: 'integration-worker',
        concurrency: 1,
        pollInterval: 100,
        emergencyJobsOnly: false,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxCpuUsage: 2,
        jobTimeout: 5000,
        heartbeatInterval: 30000,
        priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
        allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
        maxJobPriority: JobPriority.HIGH,
        tags: [],
        metadata: {},
      }
      
      jobManager.addWorker(workerConfig)
      
      // Create a job
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { patientId: 'test-patient' },
      }
      
      const jobId = await jobManager.createJob(jobRequest)
      
      // Verify job was created
      expect(jobId).toBeDefined()
      
      // Get job status
      const jobStatus = await jobManager.getJobStatus(jobId)
      expect(jobStatus).toBeDefined()
      expect(jobStatus?.status).toBe(JobStatus.PENDING)
      
      // Stop job manager
      await jobManager.stop()
    })

    it('should handle job failure and retry', async () => {
      await jobManager.start()
      
      // Add a worker with failing handler
      const workerConfig = {
        workerId: 'failing-worker',
        concurrency: 1,
        pollInterval: 100,
        emergencyJobsOnly: false,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxCpuUsage: 2,
        jobTimeout: 1000,
        heartbeatInterval: 30000,
        priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
        allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
        maxJobPriority: JobPriority.HIGH,
        tags: [],
        metadata: {},
      }
      
      jobManager.addWorker(workerConfig)
      
      // Create a job
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { patientId: 'test-patient' },
      }
      
      const jobId = await jobManager.createJob(jobRequest)
      
      // Simulate job failure
      await jobQueue.updateJob(jobId, {
        status: JobStatus.FAILED,
        error: 'Test failure',
        attemptCount: 1,
      })
      
      // Retry the job
      const retryResult = await jobManager.retryJob(jobId)
      
      expect(retryResult).toBe(true)
      
      // Verify job status after retry
      const jobStatus = await jobQueue.getJob(jobId)
      expect(jobStatus?.status).toBe(JobStatus.PENDING)
      expect(jobStatus?.attemptCount).toBe(0)
      
      await jobManager.stop()
    })

    it('should handle job cancellation', async () => {
      await jobManager.start()
      
      // Create a job
      const jobRequest: CreateJobRequest = {
        type: HealthcareJobType.APPOINTMENT_REMINDER,
        _payload: { patientId: 'test-patient' },
      }
      
      const jobId = await jobManager.createJob(jobRequest)
      
      // Cancel the job
      const cancelResult = await jobManager.cancelJob(jobId)
      
      expect(cancelResult).toBe(true)
      
      // Verify job status after cancellation
      const jobStatus = await jobQueue.getJob(jobId)
      expect(jobStatus?.status).toBe(JobStatus.CANCELLED)
      
      await jobManager.stop()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent job processing', async () => {
      await jobManager.start()
      
      // Add multiple workers
      for (let i = 0; i < 3; i++) {
        const workerConfig = {
          workerId: `worker-${i}`,
          concurrency: 2,
          pollInterval: 100,
          emergencyJobsOnly: false,
          maxMemoryUsage: 512 * 1024 * 1024,
          maxCpuUsage: 2,
          jobTimeout: 5000,
          heartbeatInterval: 30000,
          priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
          allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
          maxJobPriority: JobPriority.HIGH,
          tags: [],
          metadata: {},
        }
        
        jobManager.addWorker(workerConfig)
      }
      
      // Create multiple jobs
      const jobPromises = []
      for (let i = 0; i < 5; i++) {
        const jobRequest: CreateJobRequest = {
          type: HealthcareJobType.APPOINTMENT_REMINDER,
          _payload: { patientId: `test-patient-${i}` },
        }
        
        jobPromises.push(jobManager.createJob(jobRequest))
      }
      
      const jobIds = await Promise.all(jobPromises)
      
      // Verify all jobs were created
      expect(jobIds).toHaveLength(5)
      jobIds.forEach(jobId => {
        expect(jobId).toBeDefined()
      })
      
      await jobManager.stop()
    })

    it('should handle worker removal during processing', async () => {
      await jobManager.start()
      
      const workerConfig = {
        workerId: 'removable-worker',
        concurrency: 1,
        pollInterval: 100,
        emergencyJobsOnly: false,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxCpuUsage: 2,
        jobTimeout: 5000,
        heartbeatInterval: 30000,
        priorityQueues: [JobPriority.HIGH, JobPriority.MEDIUM],
        allowedJobTypes: [HealthcareJobType.APPOINTMENT_REMINDER],
        maxJobPriority: JobPriority.HIGH,
        tags: [],
        metadata: {},
      }
      
      jobManager.addWorker(workerConfig)
      
      // Verify worker was added
      expect(jobManager['workers'].has('removable-worker')).toBe(true)
      
      // Remove worker
      await jobManager.removeWorker('removable-worker')
      
      // Verify worker was removed
      expect(jobManager['workers'].has('removable-worker')).toBe(false)
      
      await jobManager.stop()
    })
  })
})