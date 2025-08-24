import { createClient } from "@/utils/supabase/client";

interface NoShowPredictionRequest {
	patientId: string;
	appointmentId: string;
	appointmentDate: string;
	appointmentTime: string;
	patientData?: Record<string, any>;
}

interface NoShowPredictionResponse {
	patientId: string;
	appointmentId: string;
	noShowProbability: number;
	riskCategory: "low" | "medium" | "high" | "very_high";
	confidenceScore: number;
	contributingFactors: {
		factorName: string;
		category: "patient" | "appointment" | "external" | "historical";
		importanceWeight: number;
		impactDirection: "increases_risk" | "decreases_risk";
		description: string;
		confidence: number;
	}[];
	recommendations: {
		actionType: "reminder" | "scheduling" | "incentive" | "support" | "escalation";
		priority: "low" | "medium" | "high" | "urgent";
		description: string;
		estimatedImpact: number;
		implementationCost: "low" | "medium" | "high";
		timingRecommendation: string;
		successProbability: number;
	}[];
}

interface DashboardStats {
	totalAppointments: number;
	predictedNoShows: number;
	noShowRate: number;
	prevented: number;
	cost_savings: number;
	modelAccuracy: number;
}

export async function getPredictions(filters?: {
	riskLevel?: string;
	dateRange?: string;
}): Promise<NoShowPredictionResponse[]> {
	try {
		const response = await fetch("/api/ai/no-show-prediction/predictions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ filters }),
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch predictions: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching no-show predictions:", error);
		throw error;
	}
}

export async function getDashboardStats(timeRange: "24h" | "7d" | "30d" = "24h"): Promise<DashboardStats> {
	try {
		const response = await fetch(`/api/ai/no-show-prediction/stats?timeRange=${timeRange}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		throw error;
	}
}

export async function triggerPrediction(request: NoShowPredictionRequest): Promise<NoShowPredictionResponse> {
	try {
		const response = await fetch("/api/ai/no-show-prediction/predict", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			throw new Error(`Prediction request failed: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error triggering prediction:", error);
		throw error;
	}
}

export async function updatePrediction(
	appointmentId: string,
	actualOutcome: "attended" | "no_show" | "cancelled"
): Promise<void> {
	try {
		const response = await fetch("/api/ai/no-show-prediction/feedback", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ appointmentId, actualOutcome }),
		});

		if (!response.ok) {
			throw new Error(`Failed to update prediction: ${response.statusText}`);
		}
	} catch (error) {
		console.error("Error updating prediction feedback:", error);
		throw error;
	}
}

export default {
	getPredictions,
	getDashboardStats,
	triggerPrediction,
	updatePrediction,
};
