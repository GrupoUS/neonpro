/**
 * NeonPro - Integration Queue System
 * Asynchronous job processing system for third-party integrations
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  IntegrationQueue,
  IntegrationJob,
  JobStatus,
  JobProcessor,
  QueueConfig,
  QueueStats
} from './types';

/**
 * Memory Queue Implementation
 * In-memory job queue for development and single-instance deployments
 */
export class MemoryIntegrationQueue implements IntegrationQueue {
  private jobs: Map<string, IntegrationJob> = new Map();
  private pendingJobs: IntegrationJob[] = [];
  private processingJobs: Set<string> = new Set();
  private processors: Map<string, JobProcessor> = new Map();
  private config: QueueConfig;
  private isProcessing = false;
  private stats: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retries: 0
  };

  constructor(config: QueueConfig) {
    this.config = {
      maxConcurrency: 5,
      retryDelay: 5000,
      maxRetries: 3,
      processInterval: 1000,
      ...config
    };

    // Start processing loop
    this.startProcessing();
  }

  /**
   * Add job to queue
   */
  async enqueue(job: IntegrationJob): Promise<string> {
    // Set default values
    job.id = job.id || crypto.randomUUID();
    job.status = 'pending';
    job.createdAt = job.createdAt || new Date();
    job.attempts = job.attempts || 0;
    job.maxAttempts = job.maxAttempts || this.config.maxRetries + 1;

    // Store job
    this.jobs.set(job.id, job);
    
    // Add to pending queue with priority sorting
    this.insertJobByPriority(job);
    
    this.updateStats();
    
    return job.id;
  }

  /**
   * Get job by ID
   */
  async getJob(id: string): Promise<IntegrationJob | null> {
    return this.jobs.get(id) || null;
  }

  /**
   * Update job status
   */
  async updateJob(id: string, updates: Partial<IntegrationJob>): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    Object.assign(job, updates);
    job.updatedAt = new Date();
    
    this.updateStats();
  }

  /**
   * Remove job from queue
   */
  async removeJob(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) {
      return false;
    }

    // Remove from jobs map
    this.jobs.delete(id);
    
    // Remove from pending queue
    const pendingIndex = this.pendingJobs.findIndex(j => j.id === id);
    if (pendingIndex > -1) {
      this.pendingJobs.splice(pendingIndex, 1);
    }
    
    // Remove from processing set
    this.processingJobs.delete(id);
    
    this.updateStats();
    
    return true;
  }

  /**
   * Register job processor
   */
  registerProcessor(type: string, processor: JobProcessor): void {
    this.processors.set(type, processor);
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    return { ...this.stats };
  }

  /**
   * Get pending jobs
   */
  async getPendingJobs(limit?: number): Promise<IntegrationJob[]> {
    const jobs = this.pendingJobs.slice(0, limit);
    return jobs.map(job => ({ ...job }));
  }

  /**
   * Get processing jobs
   */
  async getProcessingJobs(): Promise<IntegrationJob[]> {
    const jobs: IntegrationJob[] = [];
    for (const id of this.processingJobs) {
      const job = this.jobs.get(id);
      if (job) {
        jobs.push({ ...job });
      }
    }
    return jobs;
  }

  /**
   * Clear all jobs
   */
  async clear(): Promise<void> {
    this.jobs.clear();
    this.pendingJobs = [];
    this.processingJobs.clear();
    this.updateStats();
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isProcessing = false;
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.isProcessing = true;
  }

  // Private helper methods

  /**
   * Insert job into pending queue by priority
   */
  private insertJobByPriority(job: IntegrationJob): void {
    const priority = job.priority || 0;
    let insertIndex = this.pendingJobs.length;
    
    // Find insertion point (higher priority first)
    for (let i = 0; i < this.pendingJobs.length; i++) {
      if ((this.pendingJobs[i].priority || 0) < priority) {
        insertIndex = i;
        break;
      }
    }
    
    this.pendingJobs.splice(insertIndex, 0, job);
  }

  /**
   * Start processing loop
   */
  private startProcessing(): void {
    setInterval(() => {
      if (this.isProcessing) {
        this.processJobs();
      }
    }, this.config.processInterval);
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    const availableSlots = this.config.maxConcurrency - this.processingJobs.size;
    
    if (availableSlots <= 0 || this.pendingJobs.length === 0) {
      return;
    }

    const jobsToProcess = this.pendingJobs.splice(0, availableSlots);
    
    for (const job of jobsToProcess) {
      this.processJob(job);
    }
  }

  /**
   * Process individual job
   */
  private async processJob(job: IntegrationJob): Promise<void> {
    try {
      // Mark as processing
      job.status = 'processing';
      job.startedAt = new Date();
      job.attempts++;
      this.processingJobs.add(job.id);
      this.updateStats();

      // Get processor
      const processor = this.processors.get(job.type);
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.type}`);
      }

      // Process job
      const result = await processor(job);
      
      // Mark as completed
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      
    } catch (error) {
      // Handle job failure
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.failedAt = new Date();
      
      // Retry if attempts remaining
      if (job.attempts < job.maxAttempts) {
        await this.scheduleRetry(job);
      }
    } finally {
      // Remove from processing set
      this.processingJobs.delete(job.id);
      this.updateStats();
    }
  }

  /**
   * Schedule job retry
   */
  private async scheduleRetry(job: IntegrationJob): Promise<void> {
    const delay = this.calculateRetryDelay(job.attempts);
    
    setTimeout(() => {
      job.status = 'pending';
      job.scheduledAt = new Date();
      this.insertJobByPriority(job);
      this.updateStats();
    }, delay);
    
    this.stats.retries++;
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(attempts: number): number {
    // Exponential backoff: delay * 2^(attempts-1)
    return this.config.retryDelay * Math.pow(2, attempts - 1);
  }

  /**
   * Update queue statistics
   */
  private updateStats(): void {
    this.stats.pending = this.pendingJobs.length;
    this.stats.processing = this.processingJobs.size;
    
    let completed = 0;
    let failed = 0;
    
    for (const job of this.jobs.values()) {
      if (job.status === 'completed') completed++;
      else if (job.status === 'failed') failed++;
    }
    
    this.stats.completed = completed;
    this.stats.failed = failed;
  }
}

/**
 * Supabase Queue Implementation
 * Database-backed job queue using Supabase for persistence
 */
export class SupabaseIntegrationQueue implements IntegrationQueue {
  private supabase: any;
  private processors: Map<string, JobProcessor> = new Map();
  private config: QueueConfig;
  private isProcessing = false;
  private processingJobs: Set<string> = new Set();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: QueueConfig
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      maxConcurrency: 5,
      retryDelay: 5000,
      maxRetries: 3,
      processInterval: 5000,
      ...config
    };

    // Start processing loop
    this.startProcessing();
  }

  /**
   * Add job to queue
   */
  async enqueue(job: IntegrationJob): Promise<string> {
    try {
      // Set default values
      job.id = job.id || crypto.randomUUID();
      job.status = 'pending';
      job.createdAt = job.createdAt || new Date();
      job.attempts = job.attempts || 0;
      job.maxAttempts = job.maxAttempts || this.config.maxRetries + 1;

      // Insert into database
      const { error } = await this.supabase
        .from('integration_jobs')
        .insert({
          id: job.id,
          type: job.type,
          integration_id: job.integrationId,
          payload: job.payload,
          priority: job.priority || 0,
          attempts: job.attempts,
          max_attempts: job.maxAttempts,
          delay: job.delay || 0,
          status: job.status,
          created_at: job.createdAt,
          scheduled_at: job.scheduledAt
        });

      if (error) {
        throw new Error(`Failed to enqueue job: ${error.message}`);
      }

      return job.id;
    } catch (error) {
      console.error('Failed to enqueue job:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJob(id: string): Promise<IntegrationJob | null> {
    try {
      const { data, error } = await this.supabase
        .from('integration_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapDatabaseToJob(data);
    } catch (error) {
      console.error('Failed to get job:', error);
      return null;
    }
  }

  /**
   * Update job status
   */
  async updateJob(id: string, updates: Partial<IntegrationJob>): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date()
      };

      if (updates.status) updateData.status = updates.status;
      if (updates.attempts !== undefined) updateData.attempts = updates.attempts;
      if (updates.result) updateData.result = updates.result;
      if (updates.error) updateData.error = updates.error;
      if (updates.startedAt) updateData.started_at = updates.startedAt;
      if (updates.completedAt) updateData.completed_at = updates.completedAt;
      if (updates.failedAt) updateData.failed_at = updates.failedAt;
      if (updates.scheduledAt) updateData.scheduled_at = updates.scheduledAt;

      const { error } = await this.supabase
        .from('integration_jobs')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update job: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update job:', error);
      throw error;
    }
  }

  /**
   * Remove job from queue
   */
  async removeJob(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('integration_jobs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to remove job:', error);
        return false;
      }

      this.processingJobs.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to remove job:', error);
      return false;
    }
  }

  /**
   * Register job processor
   */
  registerProcessor(type: string, processor: JobProcessor): void {
    this.processors.set(type, processor);
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    try {
      const { data, error } = await this.supabase
        .from('integration_jobs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw new Error(`Failed to get stats: ${error.message}`);
      }

      const stats: QueueStats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retries: 0
      };

      for (const job of data || []) {
        switch (job.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'processing':
            stats.processing++;
            break;
          case 'completed':
            stats.completed++;
            break;
          case 'failed':
            stats.failed++;
            break;
        }
      }

      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retries: 0
      };
    }
  }

  /**
   * Get pending jobs
   */
  async getPendingJobs(limit: number = 10): Promise<IntegrationJob[]> {
    try {
      const { data, error } = await this.supabase
        .from('integration_jobs')
        .select('*')
        .eq('status', 'pending')
        .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get pending jobs: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToJob);
    } catch (error) {
      console.error('Failed to get pending jobs:', error);
      return [];
    }
  }

  /**
   * Get processing jobs
   */
  async getProcessingJobs(): Promise<IntegrationJob[]> {
    try {
      const { data, error } = await this.supabase
        .from('integration_jobs')
        .select('*')
        .eq('status', 'processing');

      if (error) {
        throw new Error(`Failed to get processing jobs: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToJob);
    } catch (error) {
      console.error('Failed to get processing jobs:', error);
      return [];
    }
  }

  /**
   * Clear completed and failed jobs
   */
  async clear(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('integration_jobs')
        .delete()
        .in('status', ['completed', 'failed'])
        .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw new Error(`Failed to clear jobs: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to clear jobs:', error);
      throw error;
    }
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isProcessing = false;
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.isProcessing = true;
  }

  // Private helper methods

  /**
   * Start processing loop
   */
  private startProcessing(): void {
    this.isProcessing = true;
    
    setInterval(() => {
      if (this.isProcessing) {
        this.processJobs();
      }
    }, this.config.processInterval);
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    try {
      const availableSlots = this.config.maxConcurrency - this.processingJobs.size;
      
      if (availableSlots <= 0) {
        return;
      }

      const jobs = await this.getPendingJobs(availableSlots);
      
      for (const job of jobs) {
        if (this.processingJobs.size >= this.config.maxConcurrency) {
          break;
        }
        
        this.processJob(job);
      }
    } catch (error) {
      console.error('Failed to process jobs:', error);
    }
  }

  /**
   * Process individual job
   */
  private async processJob(job: IntegrationJob): Promise<void> {
    try {
      // Mark as processing
      this.processingJobs.add(job.id);
      
      await this.updateJob(job.id, {
        status: 'processing',
        startedAt: new Date(),
        attempts: job.attempts + 1
      });

      // Get processor
      const processor = this.processors.get(job.type);
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.type}`);
      }

      // Process job
      const result = await processor(job);
      
      // Mark as completed
      await this.updateJob(job.id, {
        status: 'completed',
        completedAt: new Date(),
        result
      });
      
    } catch (error) {
      // Handle job failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.updateJob(job.id, {
        status: 'failed',
        error: errorMessage,
        failedAt: new Date()
      });
      
      // Retry if attempts remaining
      if (job.attempts + 1 < job.maxAttempts) {
        await this.scheduleRetry(job);
      }
    } finally {
      // Remove from processing set
      this.processingJobs.delete(job.id);
    }
  }

  /**
   * Schedule job retry
   */
  private async scheduleRetry(job: IntegrationJob): Promise<void> {
    const delay = this.calculateRetryDelay(job.attempts + 1);
    const scheduledAt = new Date(Date.now() + delay);
    
    await this.updateJob(job.id, {
      status: 'pending',
      scheduledAt
    });
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(attempts: number): number {
    // Exponential backoff: delay * 2^(attempts-1)
    return this.config.retryDelay * Math.pow(2, attempts - 1);
  }

  /**
   * Map database record to job object
   */
  private mapDatabaseToJob(data: any): IntegrationJob {
    return {
      id: data.id,
      type: data.type,
      integrationId: data.integration_id,
      payload: data.payload,
      priority: data.priority,
      attempts: data.attempts,
      maxAttempts: data.max_attempts,
      delay: data.delay,
      status: data.status,
      result: data.result,
      error: data.error,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      failedAt: data.failed_at ? new Date(data.failed_at) : undefined,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined
    };
  }
}

/**
 * Queue Factory
 * Creates appropriate queue implementation based on configuration
 */
export class QueueFactory {
  /**
   * Create queue instance based on type
   */
  static createQueue(
    type: 'memory' | 'supabase',
    config: QueueConfig,
    options?: any
  ): IntegrationQueue {
    switch (type) {
      case 'memory':
        return new MemoryIntegrationQueue(config);
      
      case 'supabase':
        if (!options?.supabaseUrl || !options?.supabaseKey) {
          throw new Error('Supabase URL and key are required for Supabase queue');
        }
        return new SupabaseIntegrationQueue(
          options.supabaseUrl,
          options.supabaseKey,
          config
        );
      
      default:
        throw new Error(`Unsupported queue type: ${type}`);
    }
  }
}
