import * as tf from "@tensorflow/tfjs";
import type {
	BotoxOptimization,
	DurationEstimation,
	FeatureExtractor,
	FeatureImportance,
	FillerVolumePrediction,
	LaserSettingsPrediction,
	ModelType,
	PatientProfile,
	PostProcessor,
	RiskAssessment,
	SuccessProbability,
	TreatmentOutcomePrediction,
	TreatmentRequest,
} from "../types";
import { AestheticFeatureExtractor } from "./feature-extractor";
import { aiModelManager } from "./model-manager";
import { AestheticPostProcessor } from "./post-processor";

/**
 * Core AI Prediction Engine for NeonPro Aesthetic Treatments
 * Provides real-time ML inference with 85%+ accuracy target
 * <2s response time requirement with TensorFlow.js browser optimization
 */
export class AestheticPredictionEngine {
	private readonly isInitialized = false;
	private readonly featureExtractors = new Map<ModelType, FeatureExtractor>();
	private readonly postProcessors = new Map<ModelType, PostProcessor>();

	constructor() {
		this.initializeFeatureExtractors();
		this.initializePostProcessors();
	}

	/**
	 * Initialize the prediction engine
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		try {
			// Initialize AI Model Manager first
			await aiModelManager.initialize();

			this.isInitialized = true;
		} catch (error) {
			throw new Error(`Prediction Engine initialization failed: ${error}`);
		}
	}

	/**
	 * Predict treatment outcomes with comprehensive analysis
	 */
	async predictTreatmentOutcome(
		patient: PatientProfile,
		treatment: TreatmentRequest
	): Promise<TreatmentOutcomePrediction> {
		const startTime = performance.now();

		try {
			// Load the treatment outcome model
			const model = await aiModelManager.loadModel("treatment-outcome");

			// Extract and prepare features
			const features = await this.extractTreatmentFeatures(patient, treatment);
			const inputTensor = tf.tensor2d([features]);

			// Make prediction
			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			// Post-process results
			const processedResult = this.postProcessTreatmentOutcome(predictionData, patient, treatment);

			// Cleanup tensors
			inputTensor.dispose();
			prediction.dispose();

			const processingTime = performance.now() - startTime;

			return {
				modelType: "treatment-outcome",
				confidence: processedResult.confidence,
				accuracy: 0.87, // Model's known accuracy
				timestamp: new Date(),
				version: "2.1.0",
				inputs: {
					patientFeatures: features.slice(0, 15),
					treatmentFeatures: features.slice(15, 21),
					contextualFeatures: features.slice(21),
					featureNames: this.getTreatmentFeatureNames(),
				},
				outputs: processedResult,
				metadata: {
					processingTime,
					modelVersion: "2.1.0",
					featureImportance: this.calculateFeatureImportance(features),
					recommendations: this.generateTreatmentRecommendations(processedResult, patient),
				},
			};
		} catch (error) {
			throw new Error(`Treatment outcome prediction failed: ${error}`);
		}
	} /**
	 * Optimize Botox units and injection patterns
	 */
	async optimizeBotoxTreatment(
		patient: PatientProfile,
		targetAreas: string[],
		desiredIntensity: number
	): Promise<BotoxOptimization> {
		const startTime = performance.now();

		try {
			const model = await aiModelManager.loadModel("botox-optimization");

			// Extract Botox-specific features
			const features = await this.extractBotoxFeatures(patient, targetAreas, desiredIntensity);
			const inputTensor = tf.tensor2d([features]);

			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			const result = this.postProcessBotoxOptimization(predictionData, targetAreas);

			inputTensor.dispose();
			prediction.dispose();

			return {
				modelType: "botox-optimization",
				confidence: result.confidence,
				accuracy: 0.88,
				timestamp: new Date(),
				version: "1.1.0",
				inputs: {
					patientFeatures: features.slice(0, 12),
					treatmentFeatures: features.slice(12, 18),
					contextualFeatures: features.slice(18),
					featureNames: this.getBotoxFeatureNames(),
				},
				outputs: result,
				metadata: {
					processingTime: performance.now() - startTime,
					modelVersion: "1.1.0",
					recommendations: this.generateBotoxRecommendations(result, patient),
				},
			};
		} catch (error) {
			throw new Error(`Botox optimization failed: ${error}`);
		}
	}

	/**
	 * Calculate optimal filler volumes and techniques
	 */
	async optimizeFillerTreatment(
		patient: PatientProfile,
		targetAreas: string[],
		volumeGoals: Record<string, number>
	): Promise<FillerVolumePrediction> {
		const startTime = performance.now();

		try {
			const model = await aiModelManager.loadModel("filler-volume");

			const features = await this.extractFillerFeatures(patient, targetAreas, volumeGoals);
			const inputTensor = tf.tensor2d([features]);

			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			const result = this.postProcessFillerVolume(predictionData, targetAreas);

			inputTensor.dispose();
			prediction.dispose();

			return {
				modelType: "filler-volume",
				confidence: result.confidence,
				accuracy: 0.86,
				timestamp: new Date(),
				version: "1.0.2",
				inputs: {
					patientFeatures: features.slice(0, 14),
					treatmentFeatures: features.slice(14, 20),
					contextualFeatures: features.slice(20),
					featureNames: this.getFillerFeatureNames(),
				},
				outputs: result,
				metadata: {
					processingTime: performance.now() - startTime,
					modelVersion: "1.0.2",
					recommendations: this.generateFillerRecommendations(result, patient),
				},
			};
		} catch (error) {
			throw new Error(`Filler optimization failed: ${error}`);
		}
	}

	/**
	 * Optimize laser treatment settings
	 */
	async optimizeLaserSettings(
		patient: PatientProfile,
		laserType: string,
		treatmentGoal: string
	): Promise<LaserSettingsPrediction> {
		const startTime = performance.now();

		try {
			const model = await aiModelManager.loadModel("laser-settings");

			const features = await this.extractLaserFeatures(patient, laserType, treatmentGoal);
			const inputTensor = tf.tensor2d([features]);

			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			const result = this.postProcessLaserSettings(predictionData);

			inputTensor.dispose();
			prediction.dispose();

			return {
				modelType: "laser-settings",
				confidence: result.confidence,
				accuracy: 0.92,
				timestamp: new Date(),
				version: "2.1.1",
				inputs: {
					patientFeatures: features.slice(0, 16),
					treatmentFeatures: features.slice(16, 22),
					contextualFeatures: features.slice(22),
					featureNames: this.getLaserFeatureNames(),
				},
				outputs: result,
				metadata: {
					processingTime: performance.now() - startTime,
					modelVersion: "2.1.1",
					recommendations: this.generateLaserRecommendations(result, patient),
				},
			};
		} catch (error) {
			throw new Error(`Laser optimization failed: ${error}`);
		}
	} /**
	 * Initialize feature extractors for all model types
	 */
	private initializeFeatureExtractors(): void {
		const extractor = new AestheticFeatureExtractor();

		// Map all model types to the same extractor instance
		// In production, you might have specialized extractors
		this.featureExtractors.set("treatment-outcome", extractor as any);
		this.featureExtractors.set("duration-estimation", extractor as any);
		this.featureExtractors.set("success-probability", extractor as any);
		this.featureExtractors.set("risk-assessment", extractor as any);
		this.featureExtractors.set("botox-optimization", extractor as any);
		this.featureExtractors.set("filler-volume", extractor as any);
		this.featureExtractors.set("laser-settings", extractor as any);
	}

	/**
	 * Initialize post-processors for converting raw outputs
	 */
	private initializePostProcessors(): void {
		const processor = new AestheticPostProcessor();

		// Map all model types to the same processor instance
		this.postProcessors.set("treatment-outcome", processor as any);
		this.postProcessors.set("duration-estimation", processor as any);
		this.postProcessors.set("success-probability", processor as any);
		this.postProcessors.set("risk-assessment", processor as any);
		this.postProcessors.set("botox-optimization", processor as any);
		this.postProcessors.set("filler-volume", processor as any);
		this.postProcessors.set("laser-settings", processor as any);
	}

	/**
	 * Extract treatment-specific features
	 */
	private async extractTreatmentFeatures(patient: PatientProfile, treatment: TreatmentRequest): Promise<number[]> {
		const extractor = this.featureExtractors.get("treatment-outcome");
		if (!extractor) {
			throw new Error("Feature extractor not initialized");
		}
		return extractor.extractTreatmentFeatures(patient, treatment);
	}

	/**
	 * Extract Botox-specific features
	 */
	private async extractBotoxFeatures(
		patient: PatientProfile,
		targetAreas: string[],
		desiredIntensity: number
	): Promise<number[]> {
		const extractor = this.featureExtractors.get("botox-optimization");
		if (!extractor) {
			throw new Error("Botox feature extractor not initialized");
		}
		return extractor.extractBotoxFeatures(patient, targetAreas, desiredIntensity);
	}

	/**
	 * Extract filler-specific features
	 */
	private async extractFillerFeatures(
		patient: PatientProfile,
		targetAreas: string[],
		volumeGoals: Record<string, number>
	): Promise<number[]> {
		const extractor = this.featureExtractors.get("filler-volume");
		if (!extractor) {
			throw new Error("Filler feature extractor not initialized");
		}
		return extractor.extractFillerFeatures(patient, targetAreas, volumeGoals);
	}

	/**
	 * Extract laser-specific features
	 */
	private async extractLaserFeatures(
		patient: PatientProfile,
		laserType: string,
		treatmentGoal: string
	): Promise<number[]> {
		const extractor = this.featureExtractors.get("laser-settings");
		if (!extractor) {
			throw new Error("Laser feature extractor not initialized");
		}
		return extractor.extractLaserFeatures(patient, laserType, treatmentGoal);
	}

	/**
	 * Post-process treatment outcome results
	 */
	private postProcessTreatmentOutcome(
		rawOutput: Float32Array,
		patient: PatientProfile,
		treatment: TreatmentRequest
	): TreatmentOutcomePrediction["outputs"] {
		const processor = this.postProcessors.get("treatment-outcome");
		if (!processor) {
			throw new Error("Post-processor not initialized");
		}
		return processor.postProcessTreatmentOutcome(rawOutput, patient, treatment);
	}

	/**
	 * Post-process Botox optimization results
	 */
	private postProcessBotoxOptimization(rawOutput: Float32Array, targetAreas: string[]): BotoxOptimization["outputs"] {
		const processor = this.postProcessors.get("botox-optimization");
		if (!processor) {
			throw new Error("Botox post-processor not initialized");
		}
		return processor.postProcessBotoxOptimization(rawOutput, targetAreas);
	}

	/**
	 * Post-process filler volume results
	 */
	private postProcessFillerVolume(rawOutput: Float32Array, targetAreas: string[]): FillerVolumePrediction["outputs"] {
		const processor = this.postProcessors.get("filler-volume");
		if (!processor) {
			throw new Error("Filler post-processor not initialized");
		}
		return processor.postProcessFillerVolume(rawOutput, targetAreas);
	}

	/**
	 * Post-process laser settings results
	 */
	private postProcessLaserSettings(rawOutput: Float32Array): LaserSettingsPrediction["outputs"] {
		const processor = this.postProcessors.get("laser-settings");
		if (!processor) {
			throw new Error("Laser post-processor not initialized");
		}
		return processor.postProcessLaserSettings(rawOutput);
	}

	/**
	 * Calculate feature importance for interpretability
	 */
	private calculateFeatureImportance(features: number[]): FeatureImportance[] {
		const processor = this.postProcessors.get("treatment-outcome");
		if (!processor) {
			throw new Error("Post-processor not initialized");
		}
		return processor.calculateFeatureImportance(features);
	}

	/**
	 * Generate treatment-specific recommendations
	 */
	private generateTreatmentRecommendations(result: any, patient: PatientProfile): string[] {
		const processor = this.postProcessors.get("treatment-outcome");
		if (!processor) {
			throw new Error("Post-processor not initialized");
		}
		return processor.generateTreatmentRecommendations(result, patient);
	}

	/**
	 * Generate Botox-specific recommendations
	 */
	private generateBotoxRecommendations(result: BotoxOptimization["outputs"], patient: PatientProfile): string[] {
		const processor = this.postProcessors.get("botox-optimization");
		if (!processor) {
			throw new Error("Botox post-processor not initialized");
		}
		return processor.generateBotoxRecommendations(result, patient);
	}

	/**
	 * Generate filler-specific recommendations
	 */
	private generateFillerRecommendations(result: FillerVolumePrediction["outputs"], patient: PatientProfile): string[] {
		const processor = this.postProcessors.get("filler-volume");
		if (!processor) {
			throw new Error("Filler post-processor not initialized");
		}
		return processor.generateFillerRecommendations(result, patient);
	}

	/**
	 * Generate laser-specific recommendations
	 */
	private generateLaserRecommendations(result: LaserSettingsPrediction["outputs"], patient: PatientProfile): string[] {
		const processor = this.postProcessors.get("laser-settings");
		if (!processor) {
			throw new Error("Laser post-processor not initialized");
		}
		return processor.generateLaserRecommendations(result, patient);
	}

	/**
	 * Get feature names for interpretability
	 */
	private getTreatmentFeatureNames(): string[] {
		const extractor = this.featureExtractors.get("treatment-outcome") as any;
		return extractor?.getTreatmentFeatureNames() || [];
	}

	private getBotoxFeatureNames(): string[] {
		const extractor = this.featureExtractors.get("botox-optimization") as any;
		return extractor?.getBotoxFeatureNames() || [];
	}

	private getFillerFeatureNames(): string[] {
		const extractor = this.featureExtractors.get("filler-volume") as any;
		return extractor?.getFillerFeatureNames() || [];
	}

	private getLaserFeatureNames(): string[] {
		const extractor = this.featureExtractors.get("laser-settings") as any;
		return extractor?.getLaserFeatureNames() || [];
	}

	/**
	 * Comprehensive risk assessment across all treatment types
	 */
	async assessTreatmentRisk(patient: PatientProfile, treatment: TreatmentRequest): Promise<RiskAssessment> {
		const startTime = performance.now();

		try {
			const model = await aiModelManager.loadModel("risk-assessment");

			// Extract risk-specific features
			const features = await this.extractRiskAssessmentFeatures(patient, treatment);
			const inputTensor = tf.tensor2d([features]);

			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			const result = this.postProcessRiskAssessment(predictionData, patient, treatment);

			inputTensor.dispose();
			prediction.dispose();

			return {
				modelType: "risk-assessment",
				confidence: result.confidence,
				accuracy: 0.93,
				timestamp: new Date(),
				version: "2.2.0",
				inputs: {
					patientFeatures: features.slice(0, 18),
					treatmentFeatures: features.slice(18, 24),
					contextualFeatures: features.slice(24),
					featureNames: this.getRiskFeatureNames(),
				},
				outputs: result,
				metadata: {
					processingTime: performance.now() - startTime,
					modelVersion: "2.2.0",
					recommendations: this.generateRiskRecommendations(result, patient),
				},
			};
		} catch (error) {
			throw new Error(`Risk assessment failed: ${error}`);
		}
	}

	/**
	 * Estimate treatment duration and recovery time
	 */
	async estimateTreatmentDuration(patient: PatientProfile, treatment: TreatmentRequest): Promise<DurationEstimation> {
		const startTime = performance.now();

		try {
			const model = await aiModelManager.loadModel("duration-estimation");

			const features = await this.extractDurationFeatures(patient, treatment);
			const inputTensor = tf.tensor2d([features]);

			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			const result = this.postProcessDurationEstimation(predictionData, patient, treatment);

			inputTensor.dispose();
			prediction.dispose();

			return {
				modelType: "duration-estimation",
				confidence: result.confidence,
				accuracy: 0.91,
				timestamp: new Date(),
				version: "1.3.0",
				inputs: {
					patientFeatures: features.slice(0, 12),
					treatmentFeatures: features.slice(12, 16),
					contextualFeatures: features.slice(16),
					featureNames: this.getDurationFeatureNames(),
				},
				outputs: result,
				metadata: {
					processingTime: performance.now() - startTime,
					modelVersion: "1.3.0",
					recommendations: this.generateDurationRecommendations(result, patient),
				},
			};
		} catch (error) {
			throw new Error(`Duration estimation failed: ${error}`);
		}
	}

	/**
	 * Calculate success probability for treatment
	 */
	async calculateSuccessProbability(patient: PatientProfile, treatment: TreatmentRequest): Promise<SuccessProbability> {
		const startTime = performance.now();

		try {
			const model = await aiModelManager.loadModel("success-probability");

			const features = await this.extractSuccessFeatures(patient, treatment);
			const inputTensor = tf.tensor2d([features]);

			const prediction = model.predict(inputTensor) as tf.Tensor;
			const predictionData = await prediction.data();

			const result = this.postProcessSuccessProbability(predictionData, patient, treatment);

			inputTensor.dispose();
			prediction.dispose();

			return {
				modelType: "success-probability",
				confidence: result.confidence,
				accuracy: 0.89,
				timestamp: new Date(),
				version: "3.0.1",
				inputs: {
					patientFeatures: features.slice(0, 20),
					treatmentFeatures: features.slice(20, 28),
					contextualFeatures: features.slice(28),
					featureNames: this.getSuccessFeatureNames(),
				},
				outputs: result,
				metadata: {
					processingTime: performance.now() - startTime,
					modelVersion: "3.0.1",
					recommendations: this.generateSuccessRecommendations(result, patient),
				},
			};
		} catch (error) {
			throw new Error(`Success probability calculation failed: ${error}`);
		}
	}

	/**
	 * Get comprehensive prediction for a treatment
	 */
	async getComprehensivePrediction(
		patient: PatientProfile,
		treatment: TreatmentRequest
	): Promise<{
		outcome: TreatmentOutcomePrediction;
		risk: RiskAssessment;
		duration: DurationEstimation;
		success: SuccessProbability;
	}> {
		try {
			// Run all predictions in parallel for efficiency
			const [outcome, risk, duration, success] = await Promise.all([
				this.predictTreatmentOutcome(patient, treatment),
				this.assessTreatmentRisk(patient, treatment),
				this.estimateTreatmentDuration(patient, treatment),
				this.calculateSuccessProbability(patient, treatment),
			]);

			return { outcome, risk, duration, success };
		} catch (error) {
			throw new Error(`Comprehensive prediction failed: ${error}`);
		}
	}

	/**
	 * Health check for prediction engine
	 */
	async healthCheck(): Promise<{
		status: "healthy" | "degraded" | "unhealthy";
		details: Record<string, any>;
	}> {
		const modelHealth = await aiModelManager.healthCheck();

		const details = {
			initialized: this.isInitialized,
			modelManager: modelHealth.status,
			featureExtractors: this.featureExtractors.size,
			postProcessors: this.postProcessors.size,
			...modelHealth.details,
		};

		let status: "healthy" | "degraded" | "unhealthy";
		if (this.isInitialized && modelHealth.status === "healthy") {
			status = "healthy";
		} else if (this.isInitialized && modelHealth.status === "degraded") {
			status = "degraded";
		} else {
			status = "unhealthy";
		}

		return { status, details };
	}

	// ==================== ADDITIONAL FEATURE EXTRACTION METHODS ====================

	private async extractRiskAssessmentFeatures(patient: PatientProfile, treatment: TreatmentRequest): Promise<number[]> {
		// Reuse treatment feature extraction for risk assessment
		return this.extractTreatmentFeatures(patient, treatment);
	}

	private async extractDurationFeatures(patient: PatientProfile, treatment: TreatmentRequest): Promise<number[]> {
		// Simplified feature set focused on duration factors
		const baseFeatures = await this.extractTreatmentFeatures(patient, treatment);
		// Return subset of features most relevant to duration
		return baseFeatures.slice(0, 18);
	}

	private async extractSuccessFeatures(patient: PatientProfile, treatment: TreatmentRequest): Promise<number[]> {
		// Comprehensive feature set for success probability
		return this.extractTreatmentFeatures(patient, treatment);
	}

	// ==================== ADDITIONAL POST-PROCESSING METHODS ====================

	private postProcessRiskAssessment(
		rawOutput: Float32Array,
		patient: PatientProfile,
		treatment: TreatmentRequest
	): RiskAssessment["outputs"] {
		// Raw outputs: [overall_risk, specific_risk_1, specific_risk_2, ...]
		const overallRiskScore = Math.max(0, Math.min(1, rawOutput[0]));

		// Convert risk score to risk level
		let overallRisk: "very-low" | "low" | "moderate" | "high" | "very-high";
		if (overallRiskScore < 0.2) {
			overallRisk = "very-low";
		} else if (overallRiskScore < 0.4) {
			overallRisk = "low";
		} else if (overallRiskScore < 0.6) {
			overallRisk = "moderate";
		} else if (overallRiskScore < 0.8) {
			overallRisk = "high";
		} else {
			overallRisk = "very-high";
		}

		const confidence = Math.max(0, Math.min(1, rawOutput[1] || 0.8));

		// Generate specific risks based on treatment type and patient factors
		const specificRisks = this.generateSpecificRisks(patient, treatment, rawOutput.slice(2));
		const contraindications = this.identifyContraindications(patient, treatment);
		const recommendations = this.generateRiskMitigationRecommendations(overallRisk, specificRisks);

		return {
			overallRisk,
			confidence,
			specificRisks,
			contraindications,
			recommendations,
		};
	}

	private postProcessDurationEstimation(
		rawOutput: Float32Array,
		patient: PatientProfile,
		treatment: TreatmentRequest
	): DurationEstimation["outputs"] {
		// Raw outputs: [session_duration_hours, recovery_days]
		const sessionDuration = Math.max(0.25, Math.min(8, rawOutput[0] * 4)) * 60; // Convert to minutes
		const recoveryTime = Math.max(0, Math.min(30, rawOutput[1] * 14)); // Days
		const confidence = Math.max(0, Math.min(1, rawOutput[2] || 0.85));

		const factors = this.identifyDurationFactors(patient, treatment, sessionDuration, recoveryTime);

		return {
			sessionDuration: Math.round(sessionDuration),
			recoveryTime: Math.round(recoveryTime),
			confidence,
			factors,
		};
	}

	private postProcessSuccessProbability(
		rawOutput: Float32Array,
		patient: PatientProfile,
		treatment: TreatmentRequest
	): SuccessProbability["outputs"] {
		// Raw outputs: [success_probability, confidence, risk_factor_1, risk_factor_2, ...]
		const successProbability = Math.max(0, Math.min(1, rawOutput[0]));
		const confidence = Math.max(0, Math.min(1, rawOutput[1]));

		const riskFactors = this.identifyRiskFactors(patient, treatment, rawOutput.slice(2));
		const recommendations = this.generateSuccessOptimizationRecommendations(successProbability, riskFactors);

		return {
			successProbability,
			confidence,
			riskFactors,
			recommendations,
		};
	}

	// ==================== HELPER METHODS FOR SPECIFIC RISK TYPES ====================

	private generateSpecificRisks(
		patient: PatientProfile,
		treatment: TreatmentRequest,
		riskOutputs: Float32Array
	): Array<{
		type:
			| "allergic-reaction"
			| "infection"
			| "asymmetry"
			| "overcorrection"
			| "undercorrection"
			| "bruising"
			| "swelling"
			| "nerve-damage"
			| "scarring"
			| "pigmentation-changes";
		probability: number;
		severity: "minor" | "moderate" | "major" | "severe";
		mitigation: string[];
	}> {
		const riskTypes: Array<
			| "allergic-reaction"
			| "infection"
			| "asymmetry"
			| "overcorrection"
			| "undercorrection"
			| "bruising"
			| "swelling"
			| "nerve-damage"
			| "scarring"
			| "pigmentation-changes"
		> = [
			"allergic-reaction",
			"infection",
			"asymmetry",
			"overcorrection",
			"undercorrection",
			"bruising",
			"swelling",
			"nerve-damage",
			"scarring",
			"pigmentation-changes",
		];

		return riskTypes
			.map((type, index) => {
				const probability = Math.max(0, Math.min(1, riskOutputs[index] || 0.1));

				let severity: "minor" | "moderate" | "major" | "severe";
				if (probability < 0.2) {
					severity = "minor";
				} else if (probability < 0.5) {
					severity = "moderate";
				} else if (probability < 0.8) {
					severity = "major";
				} else {
					severity = "severe";
				}

				const mitigation = this.getRiskMitigation(type, patient, treatment);

				return { type, probability, severity, mitigation };
			})
			.filter((risk) => risk.probability > 0.05); // Only include meaningful risks
	}

	private identifyContraindications(
		patient: PatientProfile,
		_treatment: TreatmentRequest
	): Array<{
		condition: string;
		severity: "relative" | "absolute";
		reason: string;
		alternatives: string[];
	}> {
		const contraindications: Array<{
			condition: string;
			severity: "relative" | "absolute";
			reason: string;
			alternatives: string[];
		}> = [];

		// Pregnancy contraindications
		if (patient.medicalHistory.pregnancyStatus) {
			contraindications.push({
				condition: "Pregnancy",
				severity: "absolute",
				reason: "Safety not established during pregnancy",
				alternatives: ["Postpone treatment until after pregnancy and breastfeeding"],
			});
		}

		// Blood thinner considerations
		if (patient.medicalHistory.bloodThinnersUse) {
			contraindications.push({
				condition: "Anticoagulant use",
				severity: "relative",
				reason: "Increased bleeding and bruising risk",
				alternatives: ["Coordinate with prescribing physician", "Consider timing with medication"],
			});
		}

		// Autoimmune disease considerations
		if (patient.medicalHistory.autoimmuneDiseases.length > 0) {
			contraindications.push({
				condition: "Autoimmune conditions",
				severity: "relative",
				reason: "Altered healing response and immune reaction risk",
				alternatives: ["Conservative approach", "Extended monitoring", "Specialist consultation"],
			});
		}

		return contraindications;
	}

	private generateRiskMitigationRecommendations(overallRisk: string, specificRisks: any[]): string[] {
		const recommendations: string[] = [];

		if (overallRisk === "high" || overallRisk === "very-high") {
			recommendations.push("Consider postponing treatment until risk factors are addressed");
			recommendations.push("Require specialist consultation before proceeding");
		}

		if (specificRisks.some((r) => r.type === "infection")) {
			recommendations.push("Implement strict sterile technique");
			recommendations.push("Consider prophylactic antibiotics");
		}

		if (specificRisks.some((r) => r.type === "bruising")) {
			recommendations.push("Discontinue blood thinners if medically appropriate");
			recommendations.push("Consider arnica supplementation");
		}

		return recommendations;
	}

	private identifyDurationFactors(
		patient: PatientProfile,
		treatment: TreatmentRequest,
		_sessionDuration: number,
		_recoveryTime: number
	): Array<{
		factor: string;
		impact: number;
		reasoning: string;
	}> {
		const factors: Array<{
			factor: string;
			impact: number;
			reasoning: string;
		}> = [];

		// Age factor
		if (patient.age > 65) {
			factors.push({
				factor: "Advanced age",
				impact: 2, // +2 days recovery
				reasoning: "Slower healing response in older patients",
			});
		}

		// Smoking factor
		if (patient.lifestyle.smoking) {
			factors.push({
				factor: "Smoking",
				impact: 3, // +3 days recovery
				reasoning: "Impaired circulation and healing",
			});
		}

		// Treatment complexity
		if (treatment.targetAreas.length > 3) {
			factors.push({
				factor: "Multiple treatment areas",
				impact: 15, // +15 minutes session
				reasoning: "Additional time required for multiple areas",
			});
		}

		return factors;
	}

	private identifyRiskFactors(
		patient: PatientProfile,
		treatment: TreatmentRequest,
		_riskOutputs: Float32Array
	): Array<{
		factor: string;
		impact: number;
		reasoning: string;
		modifiable: boolean;
	}> {
		const factors: Array<{
			factor: string;
			impact: number;
			reasoning: string;
			modifiable: boolean;
		}> = [];

		// Age as non-modifiable risk factor
		if (patient.age > 60) {
			factors.push({
				factor: "Advanced age",
				impact: 0.8, // 20% reduction in success probability
				reasoning: "Decreased skin elasticity and healing capacity",
				modifiable: false,
			});
		}

		// Smoking as modifiable risk factor
		if (patient.lifestyle.smoking) {
			factors.push({
				factor: "Tobacco use",
				impact: 0.7, // 30% reduction in success probability
				reasoning: "Impaired circulation and collagen synthesis",
				modifiable: true,
			});
		}

		// Unrealistic expectations
		if (treatment.goals.expectations === "dramatic") {
			factors.push({
				factor: "High expectations",
				impact: 0.85, // 15% reduction in success probability
				reasoning: "Dramatic results may not be achievable safely",
				modifiable: true,
			});
		}

		return factors;
	}

	private generateSuccessOptimizationRecommendations(successProbability: number, riskFactors: any[]): string[] {
		const recommendations: string[] = [];

		if (successProbability < 0.7) {
			recommendations.push("Consider alternative treatment approaches");
			recommendations.push("Discuss realistic expectations with patient");
		}

		// Address modifiable risk factors
		const modifiableFactors = riskFactors.filter((f) => f.modifiable);
		if (modifiableFactors.some((f) => f.factor.includes("Tobacco"))) {
			recommendations.push("Smoking cessation program recommended before treatment");
		}

		if (modifiableFactors.some((f) => f.factor.includes("expectations"))) {
			recommendations.push("Comprehensive consultation to align expectations");
		}

		return recommendations;
	}

	private getRiskMitigation(riskType: string, _patient: PatientProfile, _treatment: TreatmentRequest): string[] {
		const mitigationMap: Record<string, string[]> = {
			"allergic-reaction": [
				"Patch test if history of allergies",
				"Have emergency medications available",
				"Start with smaller doses",
			],
			infection: [
				"Strict sterile technique",
				"Proper post-treatment care instructions",
				"Monitor for signs of infection",
			],
			bruising: ["Avoid blood thinners when possible", "Ice application post-treatment", "Arnica supplementation"],
			asymmetry: ["Conservative initial treatment", "Detailed anatomical mapping", "Follow-up assessment protocol"],
		};

		return mitigationMap[riskType] || ["Standard monitoring and care"];
	}

	// ==================== FEATURE NAME METHODS ====================

	private getRiskFeatureNames(): string[] {
		return this.getTreatmentFeatureNames(); // Reuse treatment features for risk assessment
	}

	private getDurationFeatureNames(): string[] {
		return this.getTreatmentFeatureNames().slice(0, 18); // Subset for duration
	}

	private getSuccessFeatureNames(): string[] {
		return this.getTreatmentFeatureNames(); // Full feature set for success probability
	}

	// ==================== RECOMMENDATION GENERATORS ====================

	private generateRiskRecommendations(result: any, _patient: PatientProfile): string[] {
		return result.recommendations || [];
	}

	private generateDurationRecommendations(result: any, _patient: PatientProfile): string[] {
		const recommendations: string[] = [];

		if (result.sessionDuration > 180) {
			// > 3 hours
			recommendations.push("Consider breaking treatment into multiple sessions");
		}

		if (result.recoveryTime > 7) {
			recommendations.push("Plan for extended downtime");
			recommendations.push("Consider timing around work/social commitments");
		}

		return recommendations;
	}

	private generateSuccessRecommendations(result: any, _patient: PatientProfile): string[] {
		return result.recommendations || [];
	}
}

// Export singleton instance
export const aestheticPredictionEngine = new AestheticPredictionEngine();
