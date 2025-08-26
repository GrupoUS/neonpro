// Batch Prediction API Endpoints - Proactive ML Predictions at Scale
// RESTful API for managing large-scale batch prediction jobs

import { zValidator } from "@hono/zod-validator";
import type {
	CacheService,
	LoggerService,
	MetricsService,
} from "@neonpro/core-services";
import { Hono } from "hono";
import { z } from "zod";
import { BatchPredictionService } from "../../../../../packages/ai/src/services/batch-prediction-service";
import { EnhancedNoShowPredictionService } from "../../../../../packages/ai/src/services/enhanced-no-show-prediction-service";

// Validation Schemas
const BatchJobParametersSchema = z.object({
	date_range: z
		.object({
			start_date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
			end_date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
		})
		.refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
			message: "Start date must be before or equal to end date",
		}),
	filters: z
		.object({
			clinic_ids: z.array(z.string()).optional(),
			doctor_ids: z.array(z.string()).optional(),
			appointment_types: z.array(z.string()).optional(),
			priority_levels: z
				.array(z.enum(["low", "medium", "high", "urgent"]))
				.optional(),
			min_risk_threshold: z.number().min(0).max(1).optional(),
		})
		.optional(),
	batch_size: z.number().min(10).max(1000).default(100),
	priority: z.number().min(1).max(5).default(3),
});

const CreateBatchJobSchema = z.object({
	type: z.enum([
		"daily_predictions",
		"weekly_forecast",
		"intervention_planning",
		"risk_assessment",
	]),
	parameters: BatchJobParametersSchema,
	created_by: z.string().optional().default("api_user"),
});

const BatchJobFiltersSchema = z.object({
	status: z
		.enum(["queued", "processing", "completed", "failed", "cancelled"])
		.optional(),
	type: z
		.enum([
			"daily_predictions",
			"weekly_forecast",
			"intervention_planning",
			"risk_assessment",
		])
		.optional(),
	created_by: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
});

// Initialize services
const mockCache: CacheService = {
	get: async () => null,
	set: async () => true,
	delete: async () => true,
	clear: async () => true,
};

const mockLogger: LoggerService = {
	info: (_message: string, _meta?: any) => {},
	warn: (_message: string, _meta?: any) => {},
	error: (_message: string, _meta?: any) => {},
	debug: (_message: string, _meta?: any) => {},
};

const mockMetrics: MetricsService = {
	increment: async () => {},
	histogram: async () => {},
	gauge: async () => {},
	timer: async () => ({ end: () => {} }),
};

// Initialize services
const enhancedPredictionService = new EnhancedNoShowPredictionService(
	mockCache,
	mockLogger,
	mockMetrics,
);

const batchPredictionService = new BatchPredictionService(
	enhancedPredictionService,
	mockCache,
	mockLogger,
	mockMetrics,
);

// Create Hono app for batch prediction endpoints
export const batchPredictionRoutes = new Hono();

// Middleware for performance monitoring
batchPredictionRoutes.use("*", async (c, next) => {
	const startTime = performance.now();
	const _path = c.req.path;
	const _method = c.req.method;

	await next();

	const processingTime = performance.now() - startTime;
	const _responseStatus = c.res.status;

	// Log slow requests (>2000ms)
	if (processingTime > 2000) {
	}
});

// Health check endpoint
batchPredictionRoutes.get("/health", async (c) => {
	const health = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		service: "batch-prediction-api",
		version: "1.0.0",
		uptime_seconds: Math.floor(process.uptime()),
		memory_usage: {
			used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
			total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
		},
	};

	return c.json(health);
});

// Create a new batch prediction job
batchPredictionRoutes.post(
	"/jobs",
	zValidator("json", CreateBatchJobSchema),
	async (c) => {
		const startTime = performance.now();

		try {
			const body = c.req.valid("json");

			// Validate date range is reasonable
			const startDate = new Date(body.parameters.date_range.start_date);
			const endDate = new Date(body.parameters.date_range.end_date);
			const daysDiff = Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (daysDiff > 90) {
				return c.json(
					{
						success: false,
						error: "Date range cannot exceed 90 days",
					},
					400,
				);
			}

			const jobId = await batchPredictionService.createBatchJob(
				body.type,
				body.parameters,
				body.created_by,
			);

			const processingTime = performance.now() - startTime;

			return c.json(
				{
					success: true,
					job_id: jobId,
					message: "Batch prediction job created successfully",
					estimated_processing_time: "5-15 minutes",
					processing_time_ms: Math.round(processingTime),
				},
				201,
			);
		} catch (error) {
			const processingTime = performance.now() - startTime;

			return c.json(
				{
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to create batch job",
					processing_time_ms: Math.round(processingTime),
				},
				500,
			);
		}
	},
);

// Get batch job status
batchPredictionRoutes.get("/jobs/:jobId", async (c) => {
	const startTime = performance.now();

	try {
		const jobId = c.req.param("jobId");

		if (!jobId) {
			return c.json(
				{
					success: false,
					error: "Job ID is required",
				},
				400,
			);
		}

		const job = await batchPredictionService.getBatchJobStatus(jobId);

		if (!job) {
			return c.json(
				{
					success: false,
					error: "Batch job not found",
				},
				404,
			);
		}

		const processingTime = performance.now() - startTime;

		return c.json({
			success: true,
			job,
			processing_time_ms: Math.round(processingTime),
		});
	} catch (error) {
		const processingTime = performance.now() - startTime;

		return c.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to get job status",
				processing_time_ms: Math.round(processingTime),
			},
			500,
		);
	}
});

// Get batch job results
batchPredictionRoutes.get("/jobs/:jobId/results", async (c) => {
	const startTime = performance.now();

	try {
		const jobId = c.req.param("jobId");

		if (!jobId) {
			return c.json(
				{
					success: false,
					error: "Job ID is required",
				},
				400,
			);
		}

		// Check if job exists first
		const job = await batchPredictionService.getBatchJobStatus(jobId);

		if (!job) {
			return c.json(
				{
					success: false,
					error: "Batch job not found",
				},
				404,
			);
		}

		if (job.status !== "completed") {
			return c.json(
				{
					success: false,
					error: `Job is not completed yet. Current status: ${job.status}`,
					job_status: job.status,
					progress: job.progress,
				},
				409,
			);
		}

		const results = await batchPredictionService.getBatchJobResults(jobId);

		if (!results) {
			return c.json(
				{
					success: false,
					error: "Job results not found",
				},
				404,
			);
		}

		const processingTime = performance.now() - startTime;

		return c.json({
			success: true,
			results,
			processing_time_ms: Math.round(processingTime),
		});
	} catch (error) {
		const processingTime = performance.now() - startTime;

		return c.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to get job results",
				processing_time_ms: Math.round(processingTime),
			},
			500,
		);
	}
});

// List batch jobs with filtering
batchPredictionRoutes.get(
	"/jobs",
	zValidator("query", BatchJobFiltersSchema),
	async (c) => {
		const startTime = performance.now();

		try {
			const query = c.req.valid("query");

			const jobs = await batchPredictionService.listBatchJobs({
				status: query.status,
				type: query.type,
				created_by: query.created_by,
				limit: query.limit,
			});

			const processingTime = performance.now() - startTime;

			return c.json({
				success: true,
				jobs,
				count: jobs.length,
				processing_time_ms: Math.round(processingTime),
			});
		} catch (error) {
			const processingTime = performance.now() - startTime;

			return c.json(
				{
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to list batch jobs",
					processing_time_ms: Math.round(processingTime),
				},
				500,
			);
		}
	},
);

// Cancel a batch job
batchPredictionRoutes.delete("/jobs/:jobId", async (c) => {
	const startTime = performance.now();

	try {
		const jobId = c.req.param("jobId");

		if (!jobId) {
			return c.json(
				{
					success: false,
					error: "Job ID is required",
				},
				400,
			);
		}

		const cancelled = await batchPredictionService.cancelBatchJob(jobId);

		if (!cancelled) {
			return c.json(
				{
					success: false,
					error: "Job not found or cannot be cancelled",
				},
				404,
			);
		}

		const processingTime = performance.now() - startTime;

		return c.json({
			success: true,
			message: "Batch job cancelled successfully",
			job_id: jobId,
			processing_time_ms: Math.round(processingTime),
		});
	} catch (error) {
		const processingTime = performance.now() - startTime;

		return c.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to cancel batch job",
				processing_time_ms: Math.round(processingTime),
			},
			500,
		);
	}
});

// Get batch job metrics and analytics
batchPredictionRoutes.get("/analytics", async (c) => {
	const startTime = performance.now();

	try {
		// Get recent jobs for analytics
		const recentJobs = await batchPredictionService.listBatchJobs({
			limit: 100,
		});

		const completedJobs = recentJobs.filter(
			(job) => job.status === "completed",
		);
		const failedJobs = recentJobs.filter((job) => job.status === "failed");
		const processingJobs = recentJobs.filter(
			(job) => job.status === "processing",
		);
		const queuedJobs = recentJobs.filter((job) => job.status === "queued");

		// Calculate performance metrics
		const avgProcessingTime =
			completedJobs.length > 0
				? completedJobs.reduce((sum, job) => {
						if (job.completed_at && job.started_at) {
							return (
								sum +
								(new Date(job.completed_at).getTime() -
									new Date(job.started_at).getTime())
							);
						}
						return sum;
					}, 0) / completedJobs.length
				: 0;

		const totalPredictionsProcessed = completedJobs.reduce(
			(sum, job) => sum + job.progress.processed_appointments,
			0,
		);

		const analytics = {
			overview: {
				total_jobs: recentJobs.length,
				completed_jobs: completedJobs.length,
				failed_jobs: failedJobs.length,
				processing_jobs: processingJobs.length,
				queued_jobs: queuedJobs.length,
				success_rate_percentage:
					recentJobs.length > 0
						? Math.round((completedJobs.length / recentJobs.length) * 100)
						: 0,
			},
			performance: {
				avg_processing_time_ms: Math.round(avgProcessingTime),
				total_predictions_processed: totalPredictionsProcessed,
				avg_predictions_per_job:
					completedJobs.length > 0
						? Math.round(totalPredictionsProcessed / completedJobs.length)
						: 0,
				estimated_throughput_per_hour:
					totalPredictionsProcessed > 0 && avgProcessingTime > 0
						? Math.round(
								(totalPredictionsProcessed / avgProcessingTime) * 3_600_000,
							)
						: 0,
			},
			job_types: {
				daily_predictions: recentJobs.filter(
					(j) => j.type === "daily_predictions",
				).length,
				weekly_forecast: recentJobs.filter((j) => j.type === "weekly_forecast")
					.length,
				intervention_planning: recentJobs.filter(
					(j) => j.type === "intervention_planning",
				).length,
				risk_assessment: recentJobs.filter((j) => j.type === "risk_assessment")
					.length,
			},
			recent_activity: recentJobs.slice(0, 10).map((job) => ({
				job_id: job.id,
				type: job.type,
				status: job.status,
				created_at: job.created_at,
				progress: job.progress.percentage_complete,
			})),
		};

		const processingTime = performance.now() - startTime;

		return c.json({
			success: true,
			analytics,
			generated_at: new Date().toISOString(),
			processing_time_ms: Math.round(processingTime),
		});
	} catch (error) {
		const processingTime = performance.now() - startTime;

		return c.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to generate analytics",
				processing_time_ms: Math.round(processingTime),
			},
			500,
		);
	}
});

// Batch job templates for common scenarios
batchPredictionRoutes.get("/templates", async (c) => {
	const templates = {
		daily_morning_predictions: {
			type: "daily_predictions",
			description: "Predict no-shows for appointments in the next 24 hours",
			parameters: {
				date_range: {
					start_date: new Date().toISOString().split("T")[0],
					end_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
				},
				filters: {
					priority_levels: ["high", "urgent"],
					min_risk_threshold: 0.3,
				},
				batch_size: 100,
				priority: 1,
			},
		},
		weekly_forecast: {
			type: "weekly_forecast",
			description:
				"Generate weekly no-show risk forecast for capacity planning",
			parameters: {
				date_range: {
					start_date: new Date().toISOString().split("T")[0],
					end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
				},
				batch_size: 500,
				priority: 3,
			},
		},
		high_risk_intervention: {
			type: "intervention_planning",
			description:
				"Identify high-risk appointments needing immediate intervention",
			parameters: {
				date_range: {
					start_date: new Date().toISOString().split("T")[0],
					end_date: new Date(Date.now() + 48 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
				},
				filters: {
					min_risk_threshold: 0.7,
					priority_levels: ["high", "urgent"],
				},
				batch_size: 50,
				priority: 1,
			},
		},
		monthly_risk_assessment: {
			type: "risk_assessment",
			description: "Comprehensive monthly risk assessment for all appointments",
			parameters: {
				date_range: {
					start_date: new Date().toISOString().split("T")[0],
					end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
				},
				batch_size: 200,
				priority: 4,
			},
		},
	};

	return c.json({
		success: true,
		templates,
		message:
			"Use these templates to quickly create common batch prediction jobs",
	});
});

// Bulk job creation endpoint for creating multiple related jobs
batchPredictionRoutes.post(
	"/jobs/bulk",
	zValidator(
		"json",
		z.object({
			jobs: z.array(CreateBatchJobSchema).min(1).max(10),
			bulk_operation_id: z.string().optional(),
		}),
	),
	async (c) => {
		const startTime = performance.now();

		try {
			const body = c.req.valid("json");
			const jobIds: string[] = [];
			const errors: Array<{ index: number; error: string }> = [];

			for (let i = 0; i < body.jobs.length; i++) {
				try {
					const job = body.jobs[i];
					const jobId = await batchPredictionService.createBatchJob(
						job.type,
						job.parameters,
						job.created_by || "bulk_api_user",
					);
					jobIds.push(jobId);
				} catch (error) {
					errors.push({
						index: i,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			const processingTime = performance.now() - startTime;

			return c.json(
				{
					success: errors.length === 0,
					created_jobs: jobIds,
					job_count: jobIds.length,
					errors: errors.length > 0 ? errors : undefined,
					bulk_operation_id: body.bulk_operation_id,
					processing_time_ms: Math.round(processingTime),
				},
				errors.length === 0 ? 201 : 207,
			); // 207 = Multi-Status
		} catch (error) {
			const processingTime = performance.now() - startTime;

			return c.json(
				{
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to create bulk batch jobs",
					processing_time_ms: Math.round(processingTime),
				},
				500,
			);
		}
	},
);

export default batchPredictionRoutes;
