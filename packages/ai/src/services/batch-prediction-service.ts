// Batch Prediction Service - Proactive ML Predictions at Scale
// Processes large volumes of appointments for proactive no-show risk assessment

import type { LoggerService, MetricsService } from "@neonpro/core-services";
import type { EnhancedNoShowPredictionService } from "./enhanced-no-show-prediction-service";
import type { AIServiceConfig, CacheService } from "./enhanced-service-base";
import { EnhancedAIService } from "./enhanced-service-base";
import type {
	AppointmentContext,
	ExternalFactors,
	InterventionAnalysis,
	PatientProfile,
	PredictionOutput,
} from "./no-show-prediction-service";

// Batch Processing Types
export type BatchPredictionJob = {
	id: string;
	status: "queued" | "processing" | "completed" | "failed" | "cancelled";
	type: "daily_predictions" | "weekly_forecast" | "intervention_planning" | "risk_assessment";
	parameters: {
		date_range: {
			start_date: string;
			end_date: string;
		};
		filters?: {
			clinic_ids?: string[];
			doctor_ids?: string[];
			appointment_types?: string[];
			priority_levels?: ("low" | "medium" | "high" | "urgent")[];
			min_risk_threshold?: number;
		};
		batch_size: number;
		priority: 1 | 2 | 3 | 4 | 5; // 1 = highest priority
	};
	created_at: string;
	started_at?: string;
	completed_at?: string;
	progress: {
		total_appointments: number;
		processed_appointments: number;
		successful_predictions: number;
		failed_predictions: number;
		percentage_complete: number;
	};
	results?: BatchPredictionResults;
	error?: string;
	estimated_completion_time?: string;
	created_by: string;
};

export type BatchPredictionResults = {
	job_id: string;
	summary: {
		total_processed: number;
		high_risk_appointments: number;
		medium_risk_appointments: number;
		low_risk_appointments: number;
		avg_prediction_confidence: number;
		processing_time_ms: number;
		predictions_per_second: number;
	};
	risk_distribution: {
		[risk_level: string]: {
			count: number;
			percentage: number;
			avg_confidence: number;
		};
	};
	intervention_recommendations: {
		immediate_action_required: AppointmentPrediction[];
		schedule_reminders: AppointmentPrediction[];
		monitor_closely: AppointmentPrediction[];
	};
	performance_metrics: {
		batch_processing_time: number;
		avg_prediction_time_ms: number;
		throughput_predictions_per_minute: number;
		memory_usage_mb: number;
		cpu_utilization_percent: number;
	};
	data_insights: {
		top_risk_factors: Array<{
			factor: string;
			impact_score: number;
			frequency: number;
		}>;
		temporal_patterns: Array<{
			time_period: string;
			risk_level: number;
			appointment_count: number;
		}>;
		clinic_risk_analysis: Array<{
			clinic_id: string;
			clinic_name: string;
			high_risk_count: number;
			avg_risk_score: number;
		}>;
	};
};

export type AppointmentPrediction = {
	appointment_id: string;
	patient_id: string;
	doctor_id: string;
	clinic_id: string;
	appointment_datetime: string;
	prediction_result: PredictionOutput & {
		batch_processed_at: string;
		prediction_model_version: string;
	};
	intervention_analysis: InterventionAnalysis;
	recommended_actions: Array<{
		action_type: "sms_reminder" | "email_reminder" | "phone_call" | "reschedule_offer" | "priority_confirmation";
		priority: number;
		timing: string;
		message_template: string;
		estimated_effectiveness: number;
	}>;
};

export type BatchScheduleConfig = {
	daily_predictions: {
		enabled: boolean;
		cron_schedule: string; // "0 6 * * *" = 6 AM daily
		look_ahead_days: number;
		batch_size: number;
		priority: number;
	};
	weekly_forecasts: {
		enabled: boolean;
		cron_schedule: string; // "0 8 * * 1" = 8 AM Monday
		look_ahead_weeks: number;
		batch_size: number;
		priority: number;
	};
	intervention_planning: {
		enabled: boolean;
		cron_schedule: string; // "*/30 * * * *" = every 30 minutes
		hours_ahead: number;
		min_risk_threshold: number;
		batch_size: number;
		priority: number;
	};
	performance_analytics: {
		enabled: boolean;
		cron_schedule: string; // "0 0 * * 0" = midnight Sunday
		retention_days: number;
		batch_size: number;
		priority: number;
	};
};

export class BatchPredictionService extends EnhancedAIService {
	private readonly predictionService: EnhancedNoShowPredictionService;
	private readonly jobQueue: Map<string, BatchPredictionJob> = new Map();
	private readonly activeJobs: Set<string> = new Set();
	private readonly scheduleConfig: BatchScheduleConfig;
	private readonly MAX_CONCURRENT_JOBS = 3;
	private readonly DEFAULT_BATCH_SIZE = 100;

	constructor(
		predictionService: EnhancedNoShowPredictionService,
		cache: CacheService,
		logger: LoggerService,
		metrics: MetricsService,
		config?: AIServiceConfig & { batchConfig?: BatchScheduleConfig }
	) {
		super(cache, logger, metrics, config);
		this.predictionService = predictionService;
		this.scheduleConfig = config?.batchConfig || this.getDefaultScheduleConfig();

		// Initialize batch processing system
		this.initializeBatchProcessor();
	}

	private getDefaultScheduleConfig(): BatchScheduleConfig {
		return {
			daily_predictions: {
				enabled: true,
				cron_schedule: "0 6 * * *", // 6 AM daily
				look_ahead_days: 7,
				batch_size: 200,
				priority: 2,
			},
			weekly_forecasts: {
				enabled: true,
				cron_schedule: "0 8 * * 1", // 8 AM Monday
				look_ahead_weeks: 2,
				batch_size: 500,
				priority: 3,
			},
			intervention_planning: {
				enabled: true,
				cron_schedule: "*/30 * * * *", // Every 30 minutes
				hours_ahead: 24,
				min_risk_threshold: 0.7,
				batch_size: 50,
				priority: 1, // Highest priority for interventions
			},
			performance_analytics: {
				enabled: true,
				cron_schedule: "0 0 * * 0", // Midnight Sunday
				retention_days: 90,
				batch_size: 1000,
				priority: 4,
			},
		};
	}

	private async initializeBatchProcessor(): Promise<void> {
		this.logger?.info("Initializing Batch Prediction Service", {
			service: "BatchPredictionService",
			max_concurrent_jobs: this.MAX_CONCURRENT_JOBS,
			default_batch_size: this.DEFAULT_BATCH_SIZE,
			schedule_config: this.scheduleConfig,
		});

		// Start job processing loop
		this.startJobProcessor();

		// Schedule recurring batch jobs
		this.scheduleBatchJobs();
	}

	// Public API Methods

	async createBatchJob(
		type: BatchPredictionJob["type"],
		parameters: BatchPredictionJob["parameters"],
		createdBy = "system"
	): Promise<string> {
		const startTime = performance.now();
		const jobId = `batch_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		try {
			const job: BatchPredictionJob = {
				id: jobId,
				status: "queued",
				type,
				parameters,
				created_at: new Date().toISOString(),
				progress: {
					total_appointments: 0,
					processed_appointments: 0,
					successful_predictions: 0,
					failed_predictions: 0,
					percentage_complete: 0,
				},
				created_by: createdBy,
			};

			// Estimate total appointments based on parameters
			job.progress.total_appointments = await this.estimateAppointmentCount(parameters);

			// Calculate estimated completion time
			const estimatedProcessingTime = this.calculateEstimatedTime(
				job.progress.total_appointments,
				parameters.batch_size
			);
			job.estimated_completion_time = new Date(Date.now() + estimatedProcessingTime).toISOString();

			// Add to queue
			this.jobQueue.set(jobId, job);

			this.logger?.info("Batch prediction job created", {
				job_id: jobId,
				type,
				estimated_appointments: job.progress.total_appointments,
				estimated_completion_time: job.estimated_completion_time,
				created_by: createdBy,
			});

			const processingTime = performance.now() - startTime;
			await this.recordMetrics("batch_job_creation", {
				job_id: jobId,
				type,
				processing_time_ms: processingTime,
				estimated_appointments: job.progress.total_appointments,
			});

			return jobId;
		} catch (error) {
			this.logger?.error("Failed to create batch job", {
				error: error instanceof Error ? error.message : "Unknown error",
				type,
				parameters,
				created_by: createdBy,
			});
			throw new Error(`Failed to create batch job: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	async getBatchJobStatus(jobId: string): Promise<BatchPredictionJob | null> {
		return this.jobQueue.get(jobId) || null;
	}

	async getBatchJobResults(jobId: string): Promise<BatchPredictionResults | null> {
		const job = this.jobQueue.get(jobId);
		return job?.results || null;
	}

	async listBatchJobs(filters?: {
		status?: BatchPredictionJob["status"];
		type?: BatchPredictionJob["type"];
		created_by?: string;
		limit?: number;
	}): Promise<BatchPredictionJob[]> {
		let jobs = Array.from(this.jobQueue.values());

		if (filters) {
			if (filters.status) {
				jobs = jobs.filter((job) => job.status === filters.status);
			}
			if (filters.type) {
				jobs = jobs.filter((job) => job.type === filters.type);
			}
			if (filters.created_by) {
				jobs = jobs.filter((job) => job.created_by === filters.created_by);
			}
			if (filters.limit) {
				jobs = jobs.slice(0, filters.limit);
			}
		}

		return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}

	async cancelBatchJob(jobId: string): Promise<boolean> {
		const job = this.jobQueue.get(jobId);
		if (!job) {
			return false;
		}

		if (job.status === "queued") {
			job.status = "cancelled";
			this.logger?.info("Batch job cancelled", { job_id: jobId });
			return true;
		}

		if (job.status === "processing") {
			job.status = "cancelled";
			this.activeJobs.delete(jobId);
			this.logger?.info("Processing batch job cancelled", { job_id: jobId });
			return true;
		}

		return false;
	}

	// Job Processing Engine

	private async startJobProcessor(): Promise<void> {
		// Process jobs every 30 seconds
		setInterval(async () => {
			await this.processQueuedJobs();
		}, 30_000);

		// Initial processing
		setTimeout(() => this.processQueuedJobs(), 5000);
	}

	private async processQueuedJobs(): Promise<void> {
		if (this.activeJobs.size >= this.MAX_CONCURRENT_JOBS) {
			return; // Max concurrent jobs reached
		}

		const queuedJobs = Array.from(this.jobQueue.values())
			.filter((job) => job.status === "queued")
			.sort((a, b) => a.parameters.priority - b.parameters.priority); // Higher priority first

		for (const job of queuedJobs) {
			if (this.activeJobs.size >= this.MAX_CONCURRENT_JOBS) {
				break;
			}

			this.activeJobs.add(job.id);
			this.processJob(job); // Fire and forget
		}
	}

	private async processJob(job: BatchPredictionJob): Promise<void> {
		const startTime = performance.now();

		try {
			job.status = "processing";
			job.started_at = new Date().toISOString();

			this.logger?.info("Starting batch job processing", {
				job_id: job.id,
				type: job.type,
				total_appointments: job.progress.total_appointments,
			});

			// Get appointments to process
			const appointments = await this.fetchAppointments(job.parameters);
			job.progress.total_appointments = appointments.length;

			// Process in batches
			const results: AppointmentPrediction[] = [];
			const batchSize = job.parameters.batch_size;

			for (let i = 0; i < appointments.length; i += batchSize) {
				if (job.status === "cancelled") {
					break;
				}

				const batch = appointments.slice(i, i + batchSize);
				const batchResults = await this.processBatch(batch, job);
				results.push(...batchResults);

				// Update progress
				job.progress.processed_appointments = i + batch.length;
				job.progress.successful_predictions = results.filter((r) => r.prediction_result.prediction_accuracy > 0).length;
				job.progress.failed_predictions = results.length - job.progress.successful_predictions;
				job.progress.percentage_complete = Math.round(
					(job.progress.processed_appointments / job.progress.total_appointments) * 100
				);

				// Small delay to prevent overwhelming the system
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			if (job.status !== "cancelled") {
				// Generate final results
				job.results = await this.generateBatchResults(job, results);
				job.status = "completed";
				job.completed_at = new Date().toISOString();

				this.logger?.info("Batch job completed successfully", {
					job_id: job.id,
					total_processed: results.length,
					processing_time_ms: performance.now() - startTime,
					high_risk_count: job.results.summary.high_risk_appointments,
				});
			}
		} catch (error) {
			job.status = "failed";
			job.error = error instanceof Error ? error.message : "Unknown processing error";
			job.completed_at = new Date().toISOString();

			this.logger?.error("Batch job processing failed", {
				job_id: job.id,
				error: job.error,
				processing_time_ms: performance.now() - startTime,
			});
		} finally {
			this.activeJobs.delete(job.id);
		}
	} // Core Processing Methods

	private async processBatch(appointments: any[], job: BatchPredictionJob): Promise<AppointmentPrediction[]> {
		const results: AppointmentPrediction[] = [];
		const batchStartTime = performance.now();

		for (const appointment of appointments) {
			try {
				// Extract prediction input data
				const patientProfile: PatientProfile = await this.extractPatientProfile(appointment);
				const appointmentContext: AppointmentContext = await this.extractAppointmentContext(appointment);
				const externalFactors: ExternalFactors = await this.extractExternalFactors(appointment);

				// Get prediction from enhanced service
				const predictionResult = await this.predictionService.getEnhancedPredictionWithROI({
					patient_profile: patientProfile,
					appointment_context: appointmentContext,
					external_factors: externalFactors,
				});

				// Generate intervention analysis
				const interventionAnalysis = await this.predictionService.generateInterventionRecommendations(
					predictionResult,
					patientProfile,
					appointmentContext
				);

				// Create recommended actions based on risk level
				const recommendedActions = await this.generateRecommendedActions(
					predictionResult,
					patientProfile,
					appointmentContext,
					interventionAnalysis
				);

				const appointmentPrediction: AppointmentPrediction = {
					appointment_id: appointment.id,
					patient_id: appointment.patient_id,
					doctor_id: appointment.doctor_id,
					clinic_id: appointment.clinic_id,
					appointment_datetime: appointment.appointment_datetime,
					prediction_result: {
						...predictionResult,
						batch_processed_at: new Date().toISOString(),
						prediction_model_version: "enhanced-v1.2-stacking",
					},
					intervention_analysis: interventionAnalysis,
					recommended_actions: recommendedActions,
				};

				results.push(appointmentPrediction);
			} catch (error) {
				this.logger?.warn("Failed to process appointment in batch", {
					job_id: job.id,
					appointment_id: appointment.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		const batchProcessingTime = performance.now() - batchStartTime;
		this.logger?.debug("Batch processing completed", {
			job_id: job.id,
			batch_size: appointments.length,
			successful_predictions: results.length,
			processing_time_ms: batchProcessingTime,
			predictions_per_second: Math.round((results.length / batchProcessingTime) * 1000),
		});

		return results;
	}

	private async generateRecommendedActions(
		predictionResult: any,
		_patientProfile: PatientProfile,
		appointmentContext: AppointmentContext,
		interventionAnalysis: InterventionAnalysis
	): Promise<AppointmentPrediction["recommended_actions"]> {
		const actions: AppointmentPrediction["recommended_actions"] = [];
		const riskScore = predictionResult.no_show_probability;
		const appointmentDate = new Date(appointmentContext.appointment_date);
		const hoursUntilAppointment = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

		// High risk (>0.7) - aggressive intervention
		if (riskScore > 0.7) {
			actions.push({
				action_type: "phone_call",
				priority: 1,
				timing: hoursUntilAppointment > 48 ? "48 hours before" : "24 hours before",
				message_template: "personal_confirmation_high_risk",
				estimated_effectiveness: 0.75,
			});

			actions.push({
				action_type: "sms_reminder",
				priority: 2,
				timing: hoursUntilAppointment > 24 ? "24 hours before" : "6 hours before",
				message_template: "urgent_reminder_with_incentive",
				estimated_effectiveness: 0.65,
			});

			if (interventionAnalysis.reschedule_options?.available) {
				actions.push({
					action_type: "reschedule_offer",
					priority: 3,
					timing: hoursUntilAppointment > 12 ? "12 hours before" : "immediate",
					message_template: "flexible_reschedule_offer",
					estimated_effectiveness: 0.55,
				});
			}
		}

		// Medium risk (0.4-0.7) - standard intervention
		else if (riskScore > 0.4) {
			actions.push({
				action_type: "sms_reminder",
				priority: 1,
				timing: hoursUntilAppointment > 24 ? "24 hours before" : "4 hours before",
				message_template: "standard_reminder_with_benefits",
				estimated_effectiveness: 0.6,
			});

			actions.push({
				action_type: "email_reminder",
				priority: 2,
				timing: hoursUntilAppointment > 48 ? "48 hours before" : "12 hours before",
				message_template: "detailed_appointment_info",
				estimated_effectiveness: 0.45,
			});
		}

		// Low risk (0.2-0.4) - minimal intervention
		else if (riskScore > 0.2) {
			actions.push({
				action_type: "sms_reminder",
				priority: 1,
				timing: hoursUntilAppointment > 24 ? "24 hours before" : "2 hours before",
				message_template: "gentle_reminder",
				estimated_effectiveness: 0.5,
			});
		}

		// Very low risk (<0.2) - confirmation only
		else {
			actions.push({
				action_type: "priority_confirmation",
				priority: 1,
				timing: hoursUntilAppointment > 48 ? "72 hours before" : "24 hours before",
				message_template: "simple_confirmation",
				estimated_effectiveness: 0.4,
			});
		}

		return actions.sort((a, b) => a.priority - b.priority);
	}

	private async generateBatchResults(
		job: BatchPredictionJob,
		predictions: AppointmentPrediction[]
	): Promise<BatchPredictionResults> {
		const processingTime =
			job.completed_at && job.started_at
				? new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()
				: 0;

		// Calculate risk distribution
		const riskDistribution: BatchPredictionResults["risk_distribution"] = {};
		const riskBuckets = {
			very_low: predictions.filter((p) => p.prediction_result.no_show_probability < 0.2),
			low: predictions.filter(
				(p) => p.prediction_result.no_show_probability >= 0.2 && p.prediction_result.no_show_probability < 0.4
			),
			medium: predictions.filter(
				(p) => p.prediction_result.no_show_probability >= 0.4 && p.prediction_result.no_show_probability < 0.7
			),
			high: predictions.filter((p) => p.prediction_result.no_show_probability >= 0.7),
		};

		for (const [level, preds] of Object.entries(riskBuckets)) {
			riskDistribution[level] = {
				count: preds.length,
				percentage: Math.round((preds.length / predictions.length) * 100),
				avg_confidence:
					preds.length > 0
						? Math.round(
								(preds.reduce((sum, p) => sum + p.prediction_result.confidence_score, 0) / preds.length) * 100
							) / 100
						: 0,
			};
		}

		// Generate intervention recommendations
		const highRisk = riskBuckets.high;
		const mediumRisk = riskBuckets.medium;
		const lowRisk = [...riskBuckets.low, ...riskBuckets.very_low];

		// Analyze top risk factors
		const riskFactors = this.analyzeTopRiskFactors(predictions);

		// Temporal pattern analysis
		const temporalPatterns = this.analyzeTemporalPatterns(predictions);

		// Clinic risk analysis
		const clinicAnalysis = this.analyzeClinicRisk(predictions);

		const results: BatchPredictionResults = {
			job_id: job.id,
			summary: {
				total_processed: predictions.length,
				high_risk_appointments: highRisk.length,
				medium_risk_appointments: mediumRisk.length,
				low_risk_appointments: lowRisk.length,
				avg_prediction_confidence:
					Math.round(
						(predictions.reduce((sum, p) => sum + p.prediction_result.confidence_score, 0) / predictions.length) * 100
					) / 100,
				processing_time_ms: processingTime,
				predictions_per_second: processingTime > 0 ? Math.round((predictions.length / processingTime) * 1000) : 0,
			},
			risk_distribution: riskDistribution,
			intervention_recommendations: {
				immediate_action_required: highRisk
					.sort((a, b) => b.prediction_result.no_show_probability - a.prediction_result.no_show_probability)
					.slice(0, 20),
				schedule_reminders: mediumRisk
					.sort((a, b) => b.prediction_result.no_show_probability - a.prediction_result.no_show_probability)
					.slice(0, 50),
				monitor_closely: [...highRisk, ...mediumRisk]
					.sort((a, b) => b.prediction_result.no_show_probability - a.prediction_result.no_show_probability)
					.slice(0, 100),
			},
			performance_metrics: {
				batch_processing_time: processingTime,
				avg_prediction_time_ms: predictions.length > 0 ? Math.round(processingTime / predictions.length) : 0,
				throughput_predictions_per_minute:
					processingTime > 0 ? Math.round((predictions.length / processingTime) * 60_000) : 0,
				memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
				cpu_utilization_percent: Math.round(Math.random() * 30 + 40), // Simulated CPU usage
			},
			data_insights: {
				top_risk_factors: riskFactors,
				temporal_patterns: temporalPatterns,
				clinic_risk_analysis: clinicAnalysis,
			},
		};

		return results;
	}

	// Data Analysis Methods

	private analyzeTopRiskFactors(
		predictions: AppointmentPrediction[]
	): Array<{ factor: string; impact_score: number; frequency: number }> {
		const factorAnalysis = new Map<string, { total_impact: number; count: number }>();

		// Simulated risk factor analysis based on prediction patterns
		const riskFactors = [
			"previous_no_show_history",
			"appointment_time_early_morning",
			"monday_appointment",
			"long_wait_time",
			"weather_conditions",
			"travel_distance",
			"insurance_issues",
			"appointment_type_routine",
		];

		// Simulate factor analysis
		riskFactors.forEach((factor) => {
			const impact = 0.1 + Math.random() * 0.3; // Random impact between 0.1-0.4
			const frequency = Math.floor(predictions.length * (0.2 + Math.random() * 0.6)); // 20-80% frequency
			factorAnalysis.set(factor, { total_impact: impact, count: frequency });
		});

		return Array.from(factorAnalysis.entries())
			.map(([factor, data]) => ({
				factor,
				impact_score: Math.round(data.total_impact * 100) / 100,
				frequency: data.count,
			}))
			.sort((a, b) => b.impact_score - a.impact_score)
			.slice(0, 10);
	}

	private analyzeTemporalPatterns(
		predictions: AppointmentPrediction[]
	): Array<{ time_period: string; risk_level: number; appointment_count: number }> {
		const patterns: Array<{ time_period: string; risk_level: number; appointment_count: number }> = [];

		// Group by time periods
		const timeGroups = {
			"Monday 8-10 AM": predictions.filter((p) => {
				const date = new Date(p.appointment_datetime);
				return date.getDay() === 1 && date.getHours() >= 8 && date.getHours() < 10;
			}),
			"Friday 4-6 PM": predictions.filter((p) => {
				const date = new Date(p.appointment_datetime);
				return date.getDay() === 5 && date.getHours() >= 16 && date.getHours() < 18;
			}),
			Weekend: predictions.filter((p) => {
				const date = new Date(p.appointment_datetime);
				return date.getDay() === 0 || date.getDay() === 6;
			}),
			"Lunch Hours": predictions.filter((p) => {
				const date = new Date(p.appointment_datetime);
				return date.getHours() >= 12 && date.getHours() < 14;
			}),
		};

		for (const [period, preds] of Object.entries(timeGroups)) {
			if (preds.length > 0) {
				const avgRisk = preds.reduce((sum, p) => sum + p.prediction_result.no_show_probability, 0) / preds.length;
				patterns.push({
					time_period: period,
					risk_level: Math.round(avgRisk * 100) / 100,
					appointment_count: preds.length,
				});
			}
		}

		return patterns.sort((a, b) => b.risk_level - a.risk_level);
	}

	private analyzeClinicRisk(
		predictions: AppointmentPrediction[]
	): Array<{ clinic_id: string; clinic_name: string; high_risk_count: number; avg_risk_score: number }> {
		const clinicGroups = new Map<string, AppointmentPrediction[]>();

		// Group by clinic
		predictions.forEach((pred) => {
			if (!clinicGroups.has(pred.clinic_id)) {
				clinicGroups.set(pred.clinic_id, []);
			}
			clinicGroups.get(pred.clinic_id)?.push(pred);
		});

		const clinicAnalysis: Array<{
			clinic_id: string;
			clinic_name: string;
			high_risk_count: number;
			avg_risk_score: number;
		}> = [];

		for (const [clinicId, preds] of clinicGroups) {
			const highRiskCount = preds.filter((p) => p.prediction_result.no_show_probability >= 0.7).length;
			const avgRisk = preds.reduce((sum, p) => sum + p.prediction_result.no_show_probability, 0) / preds.length;

			clinicAnalysis.push({
				clinic_id: clinicId,
				clinic_name: `Clinic ${clinicId.slice(-4)}`, // Simulated clinic name
				high_risk_count: highRiskCount,
				avg_risk_score: Math.round(avgRisk * 100) / 100,
			});
		}

		return clinicAnalysis.sort((a, b) => b.avg_risk_score - a.avg_risk_score);
	}

	// Utility Methods

	private async estimateAppointmentCount(parameters: BatchPredictionJob["parameters"]): Promise<number> {
		// In production, query Supabase to get actual count
		// For now, simulate based on date range and filters
		const startDate = new Date(parameters.date_range.start_date);
		const endDate = new Date(parameters.date_range.end_date);
		const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

		// Estimate ~150 appointments per day on average
		let estimatedCount = daysDiff * 150;

		// Apply filters
		if (parameters.filters?.clinic_ids?.length) {
			estimatedCount = Math.round(estimatedCount * (parameters.filters.clinic_ids.length / 10)); // Assume 10 clinics total
		}

		return Math.max(1, estimatedCount);
	}

	private calculateEstimatedTime(totalAppointments: number, _batchSize: number): number {
		// Estimate ~50ms per prediction + batch overhead
		const predictionsPerSecond = 20;
		const estimatedSeconds = Math.ceil(totalAppointments / predictionsPerSecond);
		return estimatedSeconds * 1000; // Return milliseconds
	}

	private async fetchAppointments(parameters: BatchPredictionJob["parameters"]): Promise<any[]> {
		// In production, query Supabase with filters
		// For now, simulate appointment data
		const appointments: any[] = [];
		const count = await this.estimateAppointmentCount(parameters);

		for (let i = 0; i < Math.min(count, 1000); i++) {
			// Cap at 1000 for simulation
			const appointmentDate = new Date(parameters.date_range.start_date);
			appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 7));
			appointmentDate.setHours(8 + Math.floor(Math.random() * 10)); // 8 AM to 6 PM

			appointments.push({
				id: `apt_${i.toString().padStart(6, "0")}`,
				patient_id: `patient_${Math.floor(Math.random() * 10_000)}`,
				doctor_id: `doctor_${Math.floor(Math.random() * 50)}`,
				clinic_id: parameters.filters?.clinic_ids?.[0] || `clinic_${Math.floor(Math.random() * 10)}`,
				appointment_datetime: appointmentDate.toISOString(),
				appointment_type: ["routine", "followup", "consultation", "procedure"][Math.floor(Math.random() * 4)],
				urgency_level: ["low", "medium", "high", "urgent"][Math.floor(Math.random() * 4)],
			});
		}

		return appointments;
	}

	private async extractPatientProfile(appointment: any): Promise<PatientProfile> {
		// In production, fetch from Supabase
		return {
			patient_id: appointment.patient_id,
			age: 25 + Math.floor(Math.random() * 50),
			gender: Math.random() > 0.5 ? "M" : "F",
			insurance_type: ["private", "public", "self_pay"][Math.floor(Math.random() * 3)],
			no_show_history: Math.random() * 0.3, // 0-30% historical no-show rate
			avg_reschedule_time: 24 + Math.floor(Math.random() * 48), // 24-72 hours
			communication_preferences: {
				sms: Math.random() > 0.3,
				email: Math.random() > 0.2,
				phone: Math.random() > 0.7,
				app_notifications: Math.random() > 0.4,
			},
		};
	}

	private async extractAppointmentContext(appointment: any): Promise<AppointmentContext> {
		return {
			appointment_id: appointment.id,
			doctor_id: appointment.doctor_id,
			clinic_id: appointment.clinic_id,
			appointment_date: appointment.appointment_datetime.split("T")[0],
			appointment_time: appointment.appointment_datetime.split("T")[1]?.split(".")[0] || "10:00:00",
			appointment_type: appointment.appointment_type,
			urgency_level: appointment.urgency_level,
			estimated_duration_minutes: 30 + Math.floor(Math.random() * 60), // 30-90 minutes
			is_followup: Math.random() > 0.7,
			requires_preparation: Math.random() > 0.8,
		};
	}

	private async extractExternalFactors(appointment: any): Promise<ExternalFactors> {
		const appointmentDate = new Date(appointment.appointment_datetime);

		return {
			weather_condition: ["sunny", "rainy", "cloudy", "stormy"][Math.floor(Math.random() * 4)],
			temperature_celsius: 18 + Math.floor(Math.random() * 15), // 18-33°C
			is_holiday_period: false, // Simplified
			traffic_conditions: ["light", "moderate", "heavy"][Math.floor(Math.random() * 3)],
			public_transport_status: ["normal", "delayed", "disrupted"][Math.floor(Math.random() * 3)],
			local_events:
				Math.random() > 0.8 ? ["festival", "conference", "sports_event"][Math.floor(Math.random() * 3)] : "none",
			day_of_week: appointmentDate.getDay(),
			is_weekend: appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6,
			time_of_day:
				appointmentDate.getHours() < 12 ? "morning" : appointmentDate.getHours() < 17 ? "afternoon" : "evening",
		};
	}

	// Scheduling Methods

	private scheduleBatchJobs(): void {
		this.logger?.info("Scheduling recurring batch jobs", {
			daily_predictions: this.scheduleConfig.daily_predictions.enabled,
			weekly_forecasts: this.scheduleConfig.weekly_forecasts.enabled,
			intervention_planning: this.scheduleConfig.intervention_planning.enabled,
			performance_analytics: this.scheduleConfig.performance_analytics.enabled,
		});

		// In production, use a proper cron scheduler like node-cron
		// For now, simulate with intervals

		// Daily predictions
		if (this.scheduleConfig.daily_predictions.enabled) {
			setInterval(
				async () => {
					await this.createScheduledJob("daily_predictions");
				},
				24 * 60 * 60 * 1000
			); // Daily
		}

		// Intervention planning (every 30 minutes)
		if (this.scheduleConfig.intervention_planning.enabled) {
			setInterval(
				async () => {
					await this.createScheduledJob("intervention_planning");
				},
				30 * 60 * 1000
			); // 30 minutes
		}

		// Weekly forecasts
		if (this.scheduleConfig.weekly_forecasts.enabled) {
			setInterval(
				async () => {
					await this.createScheduledJob("weekly_forecast");
				},
				7 * 24 * 60 * 60 * 1000
			); // Weekly
		}
	}

	private async createScheduledJob(type: BatchPredictionJob["type"]): Promise<void> {
		const config = this.scheduleConfig[type as keyof BatchScheduleConfig];
		if (!config?.enabled) {
			return;
		}

		const now = new Date();
		const parameters: BatchPredictionJob["parameters"] = {
			date_range: {
				start_date: now.toISOString().split("T")[0],
				end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days ahead
			},
			batch_size: config.batch_size,
			priority: config.priority,
		};

		try {
			const jobId = await this.createBatchJob(type, parameters, "scheduler");
			this.logger?.info("Scheduled batch job created", {
				job_id: jobId,
				type,
				scheduled_by: "system",
			});
		} catch (error) {
			this.logger?.error("Failed to create scheduled batch job", {
				type,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}
