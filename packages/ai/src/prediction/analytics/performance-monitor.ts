import type { ModelType } from "../types";

/**
 * Performance Monitoring System for AI Prediction Engine
 * Tracks accuracy, performance, and usage patterns to maintain 85%+ accuracy target
 */
export class PredictionPerformanceMonitor {
	private predictionLogs: Array<{
		modelType: ModelType;
		timestamp: Date;
		processingTime: number;
		accuracy: number;
		success: boolean;
		error?: string;
	}> = [];

	private readonly accuracyHistory: Array<{
		modelType: ModelType;
		date: Date;
		actualOutcome: number;
		predictedOutcome: number;
		confidence: number;
	}> = [];
	logPrediction(
		modelType: ModelType,
		processingTime: number,
		accuracy: number,
		success: boolean,
		error?: string,
	): void {
		this.predictionLogs.push({
			modelType,
			timestamp: new Date(),
			processingTime,
			accuracy,
			success,
			error,
		});

		// Keep only last 10,000 logs to prevent memory issues
		if (this.predictionLogs.length > 10_000) {
			this.predictionLogs = this.predictionLogs.slice(-10_000);
		}
	}

	/**
	 * Check if model accuracy meets target (85%+)
	 */
	checkAccuracyTarget(
		modelType: ModelType,
		days = 7,
	): {
		meetsTarget: boolean;
		currentAccuracy: number;
		target: number;
		recommendation: string;
	} {
		const endDate = new Date();
		const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

		const recentAccuracy = this.accuracyHistory.filter(
			(record) =>
				record.modelType === modelType &&
				record.date >= startDate &&
				record.date <= endDate,
		);

		if (recentAccuracy.length === 0) {
			return {
				meetsTarget: false,
				currentAccuracy: 0,
				target: 0.85,
				recommendation: "Insufficient data for accuracy assessment",
			};
		}

		// Calculate accuracy as percentage of predictions within acceptable range
		const accurateCount = recentAccuracy.filter((record) => {
			const error = Math.abs(record.actualOutcome - record.predictedOutcome);
			return error <= 0.1; // Within 10% is considered accurate
		}).length;

		const currentAccuracy = accurateCount / recentAccuracy.length;
		const target = 0.85;
		const meetsTarget = currentAccuracy >= target;

		let recommendation: string;
		if (meetsTarget) {
			recommendation = "Model performance is meeting accuracy targets";
		} else if (currentAccuracy >= 0.75) {
			recommendation =
				"Model performance slightly below target - consider fine-tuning";
		} else {
			recommendation =
				"Model performance significantly below target - urgent retraining needed";
		}

		return {
			meetsTarget,
			currentAccuracy,
			target,
			recommendation,
		};
	}
}
