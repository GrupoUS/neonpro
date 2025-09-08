// Batch Prediction API Templates - Response Templates and Utilities
// Standardized response templates and email/notification templates

import { ERROR_MESSAGES, STATUS_CODES } from "./batch-prediction-constants";

// Response Template Interfaces
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  success: false;
  timestamp: string;
}

interface ValidationErrorDetail {
  field: string;
  message: string;
  value: unknown;
}

interface ValidationErrorResponse extends ErrorResponse {
  errors: ValidationErrorDetail[];
}

// Response Template Service
// Batch prediction templates
export class ResponseTemplates {
  static success<T>(data: T, message = "Operation successful"): ApiResponse<T> {
    return {
      data,
      message,
      statusCode: STATUS_CODES.SUCCESS,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(
    data: T,
    message = "Resource created successfully",
  ): ApiResponse<T> {
    return {
      data,
      message,
      statusCode: STATUS_CODES.CREATED,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message = ERROR_MESSAGES.GENERIC,
    statusCode = STATUS_CODES.SERVER_ERROR,
  ): ErrorResponse {
    return {
      error: this.getErrorType(statusCode),
      message,
      statusCode,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(
    errors: ValidationErrorDetail[],
    message = ERROR_MESSAGES.VALIDATION_FAILED,
  ): ValidationErrorResponse {
    return {
      error: "VALIDATION_ERROR",
      errors,
      message,
      statusCode: STATUS_CODES.BAD_REQUEST,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }

  static notFound(message = ERROR_MESSAGES.JOB_NOT_FOUND): ErrorResponse {
    return {
      error: "NOT_FOUND",
      message,
      statusCode: STATUS_CODES.NOT_FOUND,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }

  static unauthorized(message = ERROR_MESSAGES.UNAUTHORIZED): ErrorResponse {
    return {
      error: "UNAUTHORIZED",
      message,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }

  private static getErrorType(statusCode: number): string {
    const errorTypes: Record<number, string> = {
      [STATUS_CODES.BAD_REQUEST]: "BAD_REQUEST",
      [STATUS_CODES.UNAUTHORIZED]: "UNAUTHORIZED",
      [STATUS_CODES.FORBIDDEN]: "FORBIDDEN",
      [STATUS_CODES.NOT_FOUND]: "NOT_FOUND",
      [STATUS_CODES.SERVER_ERROR]: "INTERNAL_SERVER_ERROR",
    };

    return errorTypes[statusCode] || "UNKNOWN_ERROR";
  }
}

// Email and Notification Templates
// Template functions
export class NotificationTemplates {
  static batchJobCompleted(
    jobId: string,
    jobType: string,
  ): {
    html: string;
    subject: string;
    text: string;
  } {
    const subject = `Batch Job Completed: ${jobType}`;
    const text = `Your batch job ${jobId} of type ${jobType} has completed successfully.`;
    const html = `
      <h2>Batch Job Completed</h2>
      <p>Your batch job <strong>${jobId}</strong> of type <strong>${jobType}</strong> has completed successfully.</p>
      <p>You can view the results in your dashboard.</p>
    `;

    return { html, subject, text };
  }

  static batchJobFailed(
    jobId: string,
    jobType: string,
    error: string,
  ): {
    html: string;
    subject: string;
    text: string;
  } {
    const subject = `Batch Job Failed: ${jobType}`;
    const text = `Your batch job ${jobId} of type ${jobType} has failed with error: ${error}`;
    const html = `
      <h2>Batch Job Failed</h2>
      <p>Your batch job <strong>${jobId}</strong> of type <strong>${jobType}</strong> has failed.</p>
      <p><strong>Error:</strong> ${error}</p>
      <p>Please check your job parameters and try again.</p>
    `;

    return { html, subject, text };
  }

  static bulkOperationSummary(
    bulkOperationId: string,
    total: number,
    successful: number,
    failed: number,
  ): { html: string; subject: string; text: string; } {
    const subject = `Bulk Operation Summary: ${bulkOperationId}`;
    const text =
      `Bulk operation ${bulkOperationId} completed. ${successful}/${total} jobs successful, ${failed} failed.`;
    const html = `
      <h2>Bulk Operation Summary</h2>
      <p>Bulk operation <strong>${bulkOperationId}</strong> has completed.</p>
      <ul>
        <li>Total jobs: ${total}</li>
        <li>Successful: ${successful}</li>
        <li>Failed: ${failed}</li>
      </ul>
    `;

    return { html, subject, text };
  }
}

// API Documentation Templates
// Prediction templates
export class ApiDocumentationTemplates {
  static getOpenApiSchema() {
    return {
      components: {
        schemas: {
          BatchJob: {
            properties: {
              created_at: { format: "date-time", type: "string" },
              created_by: { type: "string" },
              id: { format: "uuid", type: "string" },
              parameters: { $ref: "#/components/schemas/BatchJobParameters" },
              status: {
                enum: [
                  "queued",
                  "processing",
                  "completed",
                  "failed",
                  "cancelled",
                ],
                type: "string",
              },
              type: {
                enum: [
                  "daily_predictions",
                  "weekly_forecast",
                  "intervention_planning",
                  "risk_assessment",
                ],
                type: "string",
              },
              updated_at: { format: "date-time", type: "string" },
            },
            required: ["id", "type", "status", "parameters", "created_at"],
            type: "object",
          },
          BatchJobParameters: {
            properties: {
              batch_size: { maximum: 1000, minimum: 1, type: "integer" },
              date_range: {
                properties: {
                  end_date: { format: "date", type: "string" },
                  start_date: { format: "date", type: "string" },
                },
                required: ["start_date", "end_date"],
                type: "object",
              },
              filters: {
                properties: {
                  appointment_types: {
                    items: { type: "string" },
                    type: "array",
                  },
                  clinic_ids: { items: { type: "string" }, type: "array" },
                  doctor_ids: { items: { type: "string" }, type: "array" },
                  min_risk_threshold: {
                    maximum: 1,
                    minimum: 0,
                    type: "number",
                  },
                  priority_levels: {
                    items: {
                      enum: ["low", "medium", "high", "urgent"],
                      type: "string",
                    },
                    type: "array",
                  },
                },
                type: "object",
              },
              priority: { maximum: 10, minimum: 1, type: "integer" },
            },
            required: ["date_range"],
            type: "object",
          },
        },
      },
      info: {
        description: "API for managing batch prediction jobs",
        title: "Batch Prediction API",
        version: "1.0.0",
      },
      openapi: "3.0.0",
    };
  }
}
