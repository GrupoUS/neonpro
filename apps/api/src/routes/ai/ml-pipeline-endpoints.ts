/**
 * ML Pipeline Management API Endpoints
 * Gerenciamento avançado do pipeline de ML para healthcare
 * Funcionalidades: A/B Testing, Drift Detection, Model Management
 */

import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import type { 
	MLModel, 
	ABTestExperiment, 
	DriftDetectionResult, 
	ModelPerformanceMetrics,
	MLPipelineConfig,
	ModelDeploymentStatus 
} from "@neonpro/types/ml-pipeline";

const mlPipeline = new Hono();

interface ModelVersionInfo {
	id: string;
	model_name: string;
	version: string;
	status: "training" | "testing" | "deployed" | "deprecated";
	accuracy: number;
	created_at: string;
	deployed_at?: string;
	metadata: Record<string, any>;
}

interface ABTestCreateRequest {
	name: string;
	description: string;
	model_a_id: string;
	model_b_id: string;
	traffic_split: number; // percentage for model_a (0-100)
	target_metric: string;
	duration_days: number;
	tenant_id: string;
}

interface DriftAnalysisRequest {
	model_id: string;
	feature_data: Record<string, any>[];
	reference_period_days?: number;
	tenant_id: string;
}

class MLPipelineService {
	private static supabase = createClient(
		process.env.SUPABASE_URL!, 
		process.env.SUPABASE_SERVICE_ROLE_KEY!
	);

	/**
	 * Get all ML models for a tenant
	 */
	static async getModels(tenantId: string): Promise<ModelVersionInfo[]> {
		try {
			const { data: models, error } = await MLPipelineService.supabase
				.from("ai_models")
				.select(`
					id,
					name,
					version,
					status,
					accuracy,
					created_at,
					deployed_at,
					metadata,
					model_type,
					framework
				`)
				.eq("tenant_id", tenantId)
				.order("created_at", { ascending: false });

			if (error) {
				throw new Error(`Failed to fetch models: ${error.message}`);
			}

			return models.map(model => ({
				id: model.id,
				model_name: model.name,
				version: model.version,
				status: model.status,
				accuracy: model.accuracy || 0,
				created_at: model.created_at,
				deployed_at: model.deployed_at,
				metadata: model.metadata || {}
			}));
		} catch (error) {
			console.error("Error fetching models:", error);
			throw error;
		}
	}

	/**
	 * Deploy a model to production
	 */
	static async deployModel(modelId: string, tenantId: string): Promise<ModelDeploymentStatus> {
		try {
			// Check if model exists
			const { data: model, error: modelError } = await MLPipelineService.supabase
				.from("ai_models")
				.select("*")
				.eq("id", modelId)
				.eq("tenant_id", tenantId)
				.single();

			if (modelError || !model) {
				throw new Error("Model not found or access denied");
			}

			// Update model status to deployed
			const { error: updateError } = await MLPipelineService.supabase
				.from("ai_models")
				.update({
					status: "deployed",
					deployed_at: new Date().toISOString(),
					metadata: {
						...model.metadata,
						deployment_timestamp: new Date().toISOString(),
						deployment_version: model.version
					}
				})
				.eq("id", modelId);

			if (updateError) {
				throw new Error(`Failed to deploy model: ${updateError.message}`);
			}

			// Log deployment event
			await MLPipelineService.logModelEvent(modelId, "deployment", {
				tenant_id: tenantId,
				model_version: model.version,
				timestamp: new Date().toISOString()
			});

			return {
				model_id: modelId,
				status: "deployed",
				deployed_at: new Date().toISOString(),
				version: model.version
			};
		} catch (error) {
			console.error("Error deploying model:", error);
			throw error;
		}
	}

	/**
	 * Create A/B test experiment
	 */
	static async createABTest(request: ABTestCreateRequest): Promise<ABTestExperiment> {
		try {
			// Validate models exist
			const { data: models, error: modelsError } = await MLPipelineService.supabase
				.from("ai_models")
				.select("id, name, version")
				.in("id", [request.model_a_id, request.model_b_id])
				.eq("tenant_id", request.tenant_id);

			if (modelsError || !models || models.length !== 2) {
				throw new Error("One or both models not found");
			}

			// Create AB test experiment
			const experimentData = {
				name: request.name,
				description: request.description,
				tenant_id: request.tenant_id,
				model_a_id: request.model_a_id,
				model_b_id: request.model_b_id,
				traffic_split_a: request.traffic_split,
				traffic_split_b: 100 - request.traffic_split,
				target_metric: request.target_metric,
				status: "active",
				start_date: new Date().toISOString(),
				end_date: new Date(Date.now() + request.duration_days * 24 * 60 * 60 * 1000).toISOString(),
				created_at: new Date().toISOString(),
				metadata: {
					model_a_info: models.find(m => m.id === request.model_a_id),
					model_b_info: models.find(m => m.id === request.model_b_id)
				}
			};

			const { data: experiment, error: experimentError } = await MLPipelineService.supabase
				.from("ab_test_experiments")
				.insert(experimentData)
				.select()
				.single();

			if (experimentError) {
				throw new Error(`Failed to create A/B test: ${experimentError.message}`);
			}

			return {
				id: experiment.id,
				name: experiment.name,
				description: experiment.description,
				model_a_id: experiment.model_a_id,
				model_b_id: experiment.model_b_id,
				traffic_split_a: experiment.traffic_split_a,
				traffic_split_b: experiment.traffic_split_b,
				target_metric: experiment.target_metric,
				status: experiment.status,
				start_date: experiment.start_date,
				end_date: experiment.end_date,
				results: null // Will be populated as experiment runs
			};
		} catch (error) {
			console.error("Error creating A/B test:", error);
			throw error;
		}
	}

	/**
	 * Get A/B test results
	 */
	static async getABTestResults(experimentId: string, tenantId: string): Promise<ABTestExperiment> {
		try {
			const { data: experiment, error } = await MLPipelineService.supabase
				.from("ab_test_experiments")
				.select(`
					*,
					ab_test_results(*)
				`)
				.eq("id", experimentId)
				.eq("tenant_id", tenantId)
				.single();

			if (error || !experiment) {
				throw new Error("A/B test experiment not found");
			}

			// Calculate aggregated results
			const results = experiment.ab_test_results || [];
			const modelAResults = results.filter((r: any) => r.model_version === "A");
			const modelBResults = results.filter((r: any) => r.model_version === "B");

			const aggregatedResults = {
				model_a: {
					total_predictions: modelAResults.length,
					avg_confidence: modelAResults.reduce((sum: number, r: any) => sum + (r.confidence || 0), 0) / modelAResults.length || 0,
					success_rate: modelAResults.filter((r: any) => r.outcome === "success").length / modelAResults.length || 0
				},
				model_b: {
					total_predictions: modelBResults.length,
					avg_confidence: modelBResults.reduce((sum: number, r: any) => sum + (r.confidence || 0), 0) / modelBResults.length || 0,
					success_rate: modelBResults.filter((r: any) => r.outcome === "success").length / modelBResults.length || 0
				},
				statistical_significance: MLPipelineService.calculateStatisticalSignificance(modelAResults, modelBResults)
			};

			return {
				id: experiment.id,
				name: experiment.name,
				description: experiment.description,
				model_a_id: experiment.model_a_id,
				model_b_id: experiment.model_b_id,
				traffic_split_a: experiment.traffic_split_a,
				traffic_split_b: experiment.traffic_split_b,
				target_metric: experiment.target_metric,
				status: experiment.status,
				start_date: experiment.start_date,
				end_date: experiment.end_date,
				results: aggregatedResults
			};
		} catch (error) {
			console.error("Error fetching A/B test results:", error);
			throw error;
		}
	}

	/**
	 * Perform drift detection analysis
	 */
	static async detectDrift(request: DriftAnalysisRequest): Promise<DriftDetectionResult> {
		try {
			// Get reference data from the specified period
			const referencePeriodDays = request.reference_period_days || 30;
			const referenceStartDate = new Date(Date.now() - referencePeriodDays * 24 * 60 * 60 * 1000).toISOString();

			const { data: referenceData, error: refError } = await MLPipelineService.supabase
				.from("patient_analytics")
				.select("features, prediction_input")
				.eq("model_id", request.model_id)
				.eq("tenant_id", request.tenant_id)
				.gte("created_at", referenceStartDate)
				.limit(1000);

			if (refError) {
				throw new Error(`Failed to fetch reference data: ${refError.message}`);
			}

			// Calculate drift metrics
			const driftMetrics = MLPipelineService.calculateDriftMetrics(
				referenceData?.map(d => d.features || d.prediction_input) || [],
				request.feature_data
			);

			// Store drift detection result
			const driftResult = {
				model_id: request.model_id,
				tenant_id: request.tenant_id,
				analysis_date: new Date().toISOString(),
				drift_score: driftMetrics.overall_drift_score,
				feature_drift_scores: driftMetrics.feature_scores,
				drift_detected: driftMetrics.overall_drift_score > 0.3, // threshold
				severity: MLPipelineService.getDriftSeverity(driftMetrics.overall_drift_score),
				recommendations: MLPipelineService.generateDriftRecommendations(driftMetrics),
				metadata: {
					reference_period_days: referencePeriodDays,
					reference_sample_size: referenceData?.length || 0,
					current_sample_size: request.feature_data.length
				}
			};

			const { data: savedResult, error: saveError } = await MLPipelineService.supabase
				.from("drift_detection_results")
				.insert(driftResult)
				.select()
				.single();

			if (saveError) {
				console.error("Failed to save drift result:", saveError);
				// Continue without failing - result will still be returned
			}

			return {
				model_id: request.model_id,
				analysis_date: driftResult.analysis_date,
				drift_detected: driftResult.drift_detected,
				drift_score: driftResult.drift_score,
				severity: driftResult.severity,
				feature_scores: driftResult.feature_drift_scores,
				recommendations: driftResult.recommendations
			};
		} catch (error) {
			console.error("Error performing drift detection:", error);
			throw error;
		}
	}

	/**
	 * Get model performance metrics
	 */
	static async getModelMetrics(modelId: string, tenantId: string, days: number = 7): Promise<ModelPerformanceMetrics> {
		try {
			const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

			const { data: predictions, error } = await MLPipelineService.supabase
				.from("patient_analytics")
				.select("confidence, actual_outcome, predicted_outcome, created_at")
				.eq("model_id", modelId)
				.eq("tenant_id", tenantId)
				.gte("created_at", startDate);

			if (error) {
				throw new Error(`Failed to fetch model metrics: ${error.message}`);
			}

			const metrics = MLPipelineService.calculatePerformanceMetrics(predictions || []);

			return {
				model_id: modelId,
				period_days: days,
				total_predictions: predictions?.length || 0,
				accuracy: metrics.accuracy,
				precision: metrics.precision,
				recall: metrics.recall,
				f1_score: metrics.f1_score,
				avg_confidence: metrics.avg_confidence,
				prediction_distribution: metrics.distribution
			};
		} catch (error) {
			console.error("Error calculating model metrics:", error);
			throw error;
		}
	}

	// Helper methods
	private static calculateStatisticalSignificance(modelAResults: any[], modelBResults: any[]): number {
		// Simplified statistical significance calculation
		// In production, use proper statistical tests (t-test, chi-square, etc.)
		if (modelAResults.length < 30 || modelBResults.length < 30) {
			return 0; // Not enough data for significance
		}

		const aSuccessRate = modelAResults.filter(r => r.outcome === "success").length / modelAResults.length;
		const bSuccessRate = modelBResults.filter(r => r.outcome === "success").length / modelBResults.length;
		
		const difference = Math.abs(aSuccessRate - bSuccessRate);
		
		// Simple heuristic - in production use proper statistical tests
		if (difference > 0.05 && Math.min(modelAResults.length, modelBResults.length) > 100) {
			return 0.95; // High significance
		} else if (difference > 0.03) {
			return 0.8; // Moderate significance
		}
		
		return 0.1; // Low significance
	}

	private static calculateDriftMetrics(referenceData: any[], currentData: any[]): any {
		// Simplified drift calculation - in production use proper statistical methods
		const featureNames = Object.keys(currentData[0] || {});
		const featureScores: Record<string, number> = {};
		
		featureNames.forEach(feature => {
			const refValues = referenceData.map(d => d[feature]).filter(v => v !== undefined);
			const curValues = currentData.map(d => d[feature]).filter(v => v !== undefined);
			
			if (refValues.length > 0 && curValues.length > 0) {
				// Calculate simple distribution difference
				const refMean = refValues.reduce((sum, val) => sum + Number(val), 0) / refValues.length;
				const curMean = curValues.reduce((sum, val) => sum + Number(val), 0) / curValues.length;
				
				featureScores[feature] = Math.abs(refMean - curMean) / (refMean || 1);
			} else {
				featureScores[feature] = 0;
			}
		});

		const overallScore = Object.values(featureScores).reduce((sum, score) => sum + score, 0) / featureNames.length;

		return {
			feature_scores: featureScores,
			overall_drift_score: Math.min(overallScore, 1) // Cap at 1.0
		};
	}

	private static getDriftSeverity(driftScore: number): "low" | "medium" | "high" | "critical" {
		if (driftScore > 0.7) return "critical";
		if (driftScore > 0.5) return "high";
		if (driftScore > 0.3) return "medium";
		return "low";
	}

	private static generateDriftRecommendations(driftMetrics: any): string[] {
		const recommendations: string[] = [];
		
		if (driftMetrics.overall_drift_score > 0.5) {
			recommendations.push("Consider retraining the model with recent data");
			recommendations.push("Review feature engineering pipeline for changes");
		}
		
		if (driftMetrics.overall_drift_score > 0.3) {
			recommendations.push("Monitor model performance closely");
			recommendations.push("Increase prediction confidence thresholds");
		}

		// Check for specific feature drift
		Object.entries(driftMetrics.feature_scores).forEach(([feature, score]: [string, any]) => {
			if (score > 0.4) {
				recommendations.push(`High drift detected in feature '${feature}' - investigate data source`);
			}
		});

		return recommendations;
	}

	private static calculatePerformanceMetrics(predictions: any[]): any {
		if (predictions.length === 0) {
			return {
				accuracy: 0,
				precision: 0,
				recall: 0,
				f1_score: 0,
				avg_confidence: 0,
				distribution: { positive: 0, negative: 0 }
			};
		}

		const validPredictions = predictions.filter(p => p.actual_outcome !== null);
		
		let tp = 0, fp = 0, tn = 0, fn = 0;
		
		validPredictions.forEach(p => {
			const predicted = p.predicted_outcome === "positive" || p.predicted_outcome === true;
			const actual = p.actual_outcome === "positive" || p.actual_outcome === true;
			
			if (predicted && actual) tp++;
			else if (predicted && !actual) fp++;
			else if (!predicted && actual) fn++;
			else tn++;
		});

		const accuracy = validPredictions.length > 0 ? (tp + tn) / validPredictions.length : 0;
		const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
		const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
		const f1_score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
		
		const avgConfidence = predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length;
		
		const positiveCount = predictions.filter(p => p.predicted_outcome === "positive" || p.predicted_outcome === true).length;
		
		return {
			accuracy,
			precision,
			recall,
			f1_score,
			avg_confidence: avgConfidence,
			distribution: {
				positive: positiveCount,
				negative: predictions.length - positiveCount
			}
		};
	}

	private static async logModelEvent(modelId: string, eventType: string, metadata: any): Promise<void> {
		try {
			await MLPipelineService.supabase
				.from("ml_model_events")
				.insert({
					model_id: modelId,
					event_type: eventType,
					metadata,
					timestamp: new Date().toISOString()
				});
		} catch (error) {
			console.error("Failed to log model event:", error);
		}
	}
}

// API Endpoints

// Get all models for tenant
mlPipeline.get("/models", async (c) => {
	try {
		const tenantId = c.req.header("x-tenant-id");
		
		if (!tenantId) {
			return c.json({ success: false, error: "Tenant ID required" }, 400);
		}

		const models = await MLPipelineService.getModels(tenantId);

		return c.json({
			success: true,
			data: models,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		}, 500);
	}
});

// Deploy model
mlPipeline.post("/models/:modelId/deploy", async (c) => {
	try {
		const modelId = c.req.param("modelId");
		const tenantId = c.req.header("x-tenant-id");

		if (!tenantId) {
			return c.json({ success: false, error: "Tenant ID required" }, 400);
		}

		const deployment = await MLPipelineService.deployModel(modelId, tenantId);

		return c.json({
			success: true,
			data: deployment,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		}, 500);
	}
});

// Create A/B test
mlPipeline.post("/ab-tests", async (c) => {
	try {
		const tenantId = c.req.header("x-tenant-id");
		
		if (!tenantId) {
			return c.json({ success: false, error: "Tenant ID required" }, 400);
		}

		const body = await c.req.json();
		const request: ABTestCreateRequest = { ...body, tenant_id: tenantId };

		const experiment = await MLPipelineService.createABTest(request);

		return c.json({
			success: true,
			data: experiment,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		}, 500);
	}
});

// Get A/B test results
mlPipeline.get("/ab-tests/:experimentId", async (c) => {
	try {
		const experimentId = c.req.param("experimentId");
		const tenantId = c.req.header("x-tenant-id");

		if (!tenantId) {
			return c.json({ success: false, error: "Tenant ID required" }, 400);
		}

		const results = await MLPipelineService.getABTestResults(experimentId, tenantId);

		return c.json({
			success: true,
			data: results,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		}, 500);
	}
});

// Detect drift
mlPipeline.post("/drift-detection", async (c) => {
	try {
		const tenantId = c.req.header("x-tenant-id");
		
		if (!tenantId) {
			return c.json({ success: false, error: "Tenant ID required" }, 400);
		}

		const body = await c.req.json();
		const request: DriftAnalysisRequest = { ...body, tenant_id: tenantId };

		const driftResult = await MLPipelineService.detectDrift(request);

		return c.json({
			success: true,
			data: driftResult,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		}, 500);
	}
});

// Get model performance metrics
mlPipeline.get("/models/:modelId/metrics", async (c) => {
	try {
		const modelId = c.req.param("modelId");
		const tenantId = c.req.header("x-tenant-id");
		const days = Number(c.req.query("days")) || 7;

		if (!tenantId) {
			return c.json({ success: false, error: "Tenant ID required" }, 400);
		}

		const metrics = await MLPipelineService.getModelMetrics(modelId, tenantId, days);

		return c.json({
			success: true,
			data: metrics,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		}, 500);
	}
});

export default mlPipeline;