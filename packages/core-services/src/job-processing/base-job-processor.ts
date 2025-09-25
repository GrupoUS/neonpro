/**
 * Base job processing utilities for Background Jobs Manager
 * Consolidates common patterns from circuit breaker and performance optimization services
 */

export interface JobConfig {
  timeoutMs?: number
  retryAttempts?: number
  retryDelayMs?: number
  continueOnError?: boolean
  maxBatchSize?: number
  priority?: 'low' | 'normal' | 'high' | 'critical'
}

export interface JobResult<T = unknown> {
  success: boolean
  data?: T
  error?: Error
  responseTime: number
  attempt: number
  jobId: string
}

export interface BatchJobResult<T = unknown> {
  results: JobResult<T>[]
  summary: {
    total: number
    processed: number
    failed: number
    successRate: number
    averageTimePerItem: number
    totalTime: number
  }
  performance: {
    startTime: number
    endTime: number
    duration: number
    throughput: number // items per second
  }
}

export interface JobMetrics {
  totalJobs: number
  successfulJobs: number
  failedJobs: number
  averageResponseTime: number
  retryAttempts: number
  timeoutCount: number
}

/**
 * Base job processor with common functionality
 */
export class BaseJobProcessor {
  protected jobMetrics: JobMetrics = {
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    averageResponseTime: 0,
    retryAttempts: 0,
    timeoutCount: 0
  }
  
  protected activeJobs: Map<string, NodeJS.Timeout> = new Map()
  protected jobHistory: JobResult[] = []
  protected maxHistorySize: number = 1000

  constructor(protected readonly defaultConfig: JobConfig = {}) {
    this.defaultConfig = {
      timeoutMs: 30000,
      retryAttempts: 3,
      retryDelayMs: 1000,
      continueOnError: false,
      maxBatchSize: 100,
      priority: 'normal',
      ...defaultConfig
    }
  }

  /**
   * Execute a job with timeout and retry logic
   */
  async executeJob<T>(
    jobId: string,
    jobFn: () => Promise<T>,
    config: Partial<JobConfig> = {}
  ): Promise<JobResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const startTime = Date.now()
    let attempt = 0

    while (attempt <= (finalConfig.retryAttempts || 0)) {
      attempt++
      
      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(
          jobId,
          jobFn,
          finalConfig.timeoutMs
        )

        const responseTime = Date.now() - startTime
        
        // Record success
        this.recordJobSuccess(responseTime, attempt - 1)
        
        return {
          success: true,
          data: result,
          responseTime,
          attempt,
          jobId
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        
        if (attempt === (finalConfig.retryAttempts || 0)) {
          // Final attempt failed
          this.recordJobFailure(error as Error, responseTime)
          
          return {
            success: false,
            error: error as Error,
            responseTime,
            attempt,
            jobId
          }
        }
        
        // Wait before retry
        if (finalConfig.retryDelayMs && attempt < (finalConfig.retryAttempts || 0)) {
          await this.delay(finalConfig.retryDelayMs)
        }
      }
    }

    // Should never reach here, but TypeScript requires it
    throw new Error('Job execution failed after all retry attempts')
  }

  /**
   * Execute batch of jobs with optimized processing
   */
  async executeBatchJobs<T>(
    jobs: Array<{
      id: string
      fn: () => Promise<T>
      config?: Partial<JobConfig>
    }>,
    batchConfig: {
      maxConcurrent?: number
      continueOnError?: boolean
      progressCallback?: (progress: number, result: JobResult<T>) => void
    } = {}
  ): Promise<BatchJobResult<T>> {
    const startTime = Date.now()
    const maxConcurrent = batchConfig.maxConcurrent || 10
    const continueOnError = batchConfig.continueOnError ?? this.defaultConfig.continueOnError
    
    const results: JobResult<T>[] = []
    const errors: Error[] = []
    
    let processed = 0
    let failed = 0

    // Process jobs in batches to control concurrency
    for (let i = 0; i < jobs.length; i += maxConcurrent) {
      const batch = jobs.slice(i, i + maxConcurrent)
      
      const batchPromises = batch.map(async (job) => {
        try {
          const result = await this.executeJob(job.id, job.fn, job.config)
          results.push(result)
          
          if (batchConfig.progressCallback) {
            batchConfig.progressCallback(++processed / jobs.length, result)
          }
          
          return result
        } catch (error) {
          const errorResult: JobResult<T> = {
            success: false,
            error: error as Error,
            responseTime: 0,
            attempt: 1,
            jobId: job.id
          }
          
          results.push(errorResult)
          errors.push(error as Error)
          failed++
          
          if (batchConfig.progressCallback) {
            batchConfig.progressCallback(++processed / jobs.length, errorResult)
          }
          
          if (!continueOnError) {
            throw error
          }
          
          return errorResult
        }
      })

      try {
        await Promise.all(batchPromises)
      } catch (error) {
        if (!continueOnError) {
          // Re-throw the error if we're not continuing on error
          throw error
        }
        // Continue with next batch if continueOnError is true
      }
    }

    const endTime = Date.now()
    const totalTime = endTime - startTime
    const averageTimePerItem = totalTime / jobs.length

    return {
      results,
      summary: {
        total: jobs.length,
        processed: processed,
        failed: failed,
        successRate: ((processed - failed) / processed) * 100,
        averageTimePerItem,
        totalTime
      },
      performance: {
        startTime,
        endTime,
        duration: totalTime,
        throughput: jobs.length / (totalTime / 1000) // items per second
      }
    }
  }

  /**
   * Execute function with timeout
   */
  protected async executeWithTimeout<T>(
    jobId: string,
    fn: () => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs || this.defaultConfig.timeoutMs
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.activeJobs.delete(jobId)
        this.recordTimeout()
        reject(new Error(`Job ${jobId} timed out after ${timeout}ms`))
      }, timeout)

      this.activeJobs.set(jobId, timeoutId)

      fn()
        .then((result) => {
          clearTimeout(timeoutId)
          this.activeJobs.delete(jobId)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          this.activeJobs.delete(jobId)
          reject(error)
        })
    })
  }

  /**
   * Record successful job
   */
  protected recordJobSuccess(responseTime: number, retryAttempts: number): void {
    this.jobMetrics.totalJobs++
    this.jobMetrics.successfulJobs++
    this.jobMetrics.averageResponseTime = this.calculateAverageResponseTime(responseTime)
    this.jobMetrics.retryAttempts += retryAttempts

    // Add to history
    this.addToJobHistory({
      success: true,
      responseTime,
      attempt: retryAttempts + 1,
      jobId: `job_${Date.now()}_${Math.random()}`
    })
  }

  /**
   * Record failed job
   */
  protected recordJobFailure(error: Error, responseTime: number): void {
    this.jobMetrics.totalJobs++
    this.jobMetrics.failedJobs++
    this.jobMetrics.averageResponseTime = this.calculateAverageResponseTime(responseTime)

    // Add to history
    this.addToJobHistory({
      success: false,
      error,
      responseTime,
      attempt: this.defaultConfig.retryAttempts || 0,
      jobId: `job_${Date.now()}_${Math.random()}`
    })
  }

  /**
   * Record timeout
   */
  protected recordTimeout(): void {
    this.jobMetrics.timeoutCount++
    this.jobMetrics.totalJobs++
    this.jobMetrics.failedJobs++
  }

  /**
   * Calculate average response time
   */
  protected calculateAverageResponseTime(newResponseTime: number): number {
    const total = this.jobMetrics.totalJobs
    if (total === 0) return newResponseTime
    
    const currentAverage = this.jobMetrics.averageResponseTime
    return (currentAverage * (total - 1) + newResponseTime) / total
  }

  /**
   * Add job to history
   */
  protected addToJobHistory(result: JobResult): void {
    this.jobHistory.push(result)
    
    // Maintain history size
    if (this.jobHistory.length > this.maxHistorySize) {
      this.jobHistory.shift()
    }
  }

  /**
   * Delay execution
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get job metrics
   */
  getJobMetrics(): JobMetrics {
    return { ...this.jobMetrics }
  }

  /**
   * Get job history
   */
  getJobHistory(limit?: number): JobResult[] {
    if (limit) {
      return this.jobHistory.slice(-limit)
    }
    return [...this.jobHistory]
  }

  /**
   * Clear job history
   */
  clearJobHistory(): void {
    this.jobHistory = []
  }

  /**
   * Cancel all active jobs
   */
  cancelAllActiveJobs(): void {
    for (const [jobId, timeoutId] of this.activeJobs.entries()) {
      clearTimeout(timeoutId)
      this.activeJobs.delete(jobId)
    }
  }

  /**
   * Get active jobs count
   */
  getActiveJobsCount(): number {
    return this.activeJobs.size
  }

  /**
   * Destroy processor and cleanup
   */
  destroy(): void {
    this.cancelAllActiveJobs()
    this.clearJobHistory()
  }
}

/**
 * Priority-based job queue
 */
export class PriorityJobQueue<T = unknown> {
  private queues: Map<string, Array<{ job: T; priority: number; timestamp: number }>> = new Map()
  private priorityOrder: string[] = ['critical', 'high', 'normal', 'low']

  constructor() {
    // Initialize queues for each priority level
    this.priorityOrder.forEach(priority => {
      this.queues.set(priority, [])
    })
  }

  /**
   * Add job to queue with priority
   */
  enqueue(job: T, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    const queue = this.queues.get(priority)
    if (!queue) throw new Error(`Invalid priority: ${priority}`)

    queue.push({
      job,
      priority: this.getPriorityValue(priority),
      timestamp: Date.now()
    })

    // Sort queue by priority (descending) and timestamp (ascending)
    queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.timestamp - b.timestamp
    })
  }

  /**
   * Get next job from queue
   */
  dequeue(): T | null {
    // Check queues in priority order
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority)!
      if (queue.length > 0) {
        return queue.shift()!.job
      }
    }
    return null
  }

  /**
   * Get queue size
   */
  size(): number {
    let total = 0
    for (const queue of this.queues.values()) {
      total += queue.length
    }
    return total
  }

  /**
   * Get size by priority
   */
  sizeByPriority(priority: string): number {
    const queue = this.queues.get(priority)
    return queue ? queue.length : 0
  }

  /**
   * Clear all queues
   */
  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0
    }
  }

  /**
   * Get priority value for sorting
   */
  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'critical': return 4
      case 'high': return 3
      case 'normal': return 2
      case 'low': return 1
      default: return 2
    }
  }
}