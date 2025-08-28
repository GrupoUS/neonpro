// Batch Prediction API Services - Business Logic Layer
// Core services for batch prediction operations

import { v4 as uuidv4 } from "uuid";
import type { z } from "zod";
import {
  ERROR_MESSAGES,
  JOB_STATUS,
  STATUS_CODES,
} from "./batch-prediction-constants";
import type {
  BatchJobFiltersSchema,
  BulkJobCreationSchema,
  CreateBatchJobSchema,
} from "./batch-prediction-schemas";

// Type definitions from schemas
type CreateBatchJobRequest = z.infer<typeof CreateBatchJobSchema>;
type BulkJobCreationRequest = z.infer<typeof BulkJobCreationSchema>;
type BatchJobFilters = z.infer<typeof BatchJobFiltersSchema>;

// Service Error Class
export class BatchPredictionError extends Error {
  constructor(
    message: string,
    public statusCode: number = STATUS_CODES.SERVER_ERROR,
  ) {
    super(message);
    this.name = "BatchPredictionError";
  }
}

// Core Batch Prediction Service
// Batch prediction services
export class BatchPredictionService {
  static async createBatchJob(data: CreateBatchJobRequest) {
    try {
      // Generate unique job ID
      const jobId = uuidv4();

      // Validate job parameters
      const validatedData = await this.validateJobData(data);

      // Create job record
      const job = {
        created_at: new Date().toISOString(),
        created_by: validatedData.created_by || "api_user",
        id: jobId,
        parameters: validatedData.parameters,
        priority: validatedData.parameters.priority,
        status: JOB_STATUS.QUEUED,
        type: validatedData.type,
        updated_at: new Date().toISOString(),
      };

      // Store job in database
      await this.storeJob(job);

      // Queue job for processing
      await this.queueJob(jobId);

      return {
        data: job,
        message: "Batch job created successfully",
        success: true,
      };
    } catch (error) {
      throw new BatchPredictionError(
        error instanceof Error ? error.message : ERROR_MESSAGES.CREATION_FAILED,
        STATUS_CODES.BAD_REQUEST,
      );
    }
  }

  static async getBatchJobs(filters: BatchJobFilters) {
    try {
      const jobs = await this.fetchJobs(filters);

      return {
        data: jobs,
        message: "Batch jobs retrieved successfully",
        success: true,
      };
    } catch (error) {
      throw new BatchPredictionError(
        error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_FAILED,
        STATUS_CODES.SERVER_ERROR,
      );
    }
  }

  static async getBatchJob(jobId: string) {
    try {
      if (!this.isValidUuid(jobId)) {
        throw new BatchPredictionError(
          ERROR_MESSAGES.INVALID_JOB_ID,
          STATUS_CODES.BAD_REQUEST,
        );
      }

      const job = await this.fetchJobById(jobId);

      if (!job) {
        throw new BatchPredictionError(
          ERROR_MESSAGES.JOB_NOT_FOUND,
          STATUS_CODES.NOT_FOUND,
        );
      }

      return {
        data: job,
        message: "Batch job retrieved successfully",
        success: true,
      };
    } catch (error) {
      if (error instanceof BatchPredictionError) {
        throw error;
      }
      throw new BatchPredictionError(
        ERROR_MESSAGES.FETCH_FAILED,
        STATUS_CODES.SERVER_ERROR,
      );
    }
  }

  static async createBulkJobs(data: BulkJobCreationRequest) {
    try {
      const bulkOperationId = data.bulk_operation_id || uuidv4();
      const jobPromises = data.jobs.map((job) => this.createBatchJob(job));

      const results = await Promise.allSettled(jobPromises);

      const successful = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<unknown>).value);

      const failed = results
        .filter((result) => result.status === "rejected")
        .map((result) => (result as PromiseRejectedResult).reason);

      return {
        bulk_operation_id: bulkOperationId,
        failed_count: failed.length,
        results: {
          failed,
          successful,
        },
        success: true,
        successful_count: successful.length,
        total_count: data.jobs.length,
      };
    } catch (error) {
      throw new BatchPredictionError(
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.BULK_CREATION_FAILED,
        STATUS_CODES.SERVER_ERROR,
      );
    }
  }

  // Helper methods
  private static async validateJobData(data: CreateBatchJobRequest) {
    // Additional business logic validation
    const { parameters } = data;

    // Validate date range
    const startDate = new Date(parameters.date_range.start_date);
    const endDate = new Date(parameters.date_range.end_date);
    const maxRange = 365; // days

    if (
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) >
      maxRange
    ) {
      throw new Error("Date range cannot exceed 365 days");
    }

    return data;
  }

  private static async storeJob(job: unknown) {
    // Database storage implementation
    // console.log("Storing job:", job);
    return job;
  }

  private static async queueJob(_jobId: string) {
    // Queue implementation for job processing
    // console.log("Queueing job:", jobId);
  }

  private static async fetchJobs(_filters: BatchJobFilters) {
    // Database query implementation
    // console.log("Fetching jobs with filters:", filters);
    return [];
  }

  private static async fetchJobById(_jobId: string) {
    // Database query implementation
    // console.log("Fetching job by ID:", jobId);
    return;
  }

  private static isValidUuid(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
