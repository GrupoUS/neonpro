/**
 * AI Routes - NeonPro API
 * Endpoints principais para funcionalidades de Inteligência Artificial
 * Inclui ML Pipeline, Monitoring e Chat Healthcare
 */

import { Hono } from "hono";
import mlPipelineRoutes from "./ai/ml-pipeline-endpoints";
import monitoringRoutes from "./ai/monitoring-endpoints";
import chatHealthRoutes from "./ai/universal-chat-health";
import chatEndpoints from "./ai/universal-chat-endpoints";
import arSimulatorRoutes from "./ai/ar-simulator-endpoints";
import batchPredictionRoutes from "./ai/batch-prediction-endpoints";
import healthcareMonitoringRoutes from "./ai/healthcare-monitoring-endpoints";

const ai = new Hono();

// ML Pipeline Management endpoints
// /api/v1/ai/ml-pipeline/*
ai.route("/ml-pipeline", mlPipelineRoutes);

// AI Monitoring endpoints  
// /api/v1/ai/monitoring/*
ai.route("/monitoring", monitoringRoutes);

// Universal Chat endpoints
// /api/v1/ai/universal-chat/*
ai.route("/universal-chat", chatEndpoints);

// Universal Chat Health endpoints
// /api/v1/ai/chat/*
ai.route("/chat", chatHealthRoutes);

// AR Results Simulator endpoints
// /api/v1/ai/ar-simulator/*
ai.route("/ar-simulator", arSimulatorRoutes);

// Batch Prediction endpoints
// /api/v1/ai/batch-predictions/*
ai.route("/batch-predictions", batchPredictionRoutes);

// Healthcare Monitoring endpoints
// /api/v1/ai/healthcare-monitoring/*
ai.route("/healthcare-monitoring", healthcareMonitoringRoutes);

// AI Root endpoint
ai.get("/", (c) => {
	return c.json({
		service: "NeonPro AI Services",
		version: "1.0.0",
		description: "Intelligent healthcare management and analytics",
		endpoints: {
			ml_pipeline: "/ml-pipeline",
			monitoring: "/monitoring", 
			chat: "/chat",
			ar_simulator: "/ar-simulator",
			batch_predictions: "/batch-predictions",
			healthcare_monitoring: "/healthcare-monitoring"
		},
		features: [
			"ML Pipeline Management",
			"A/B Testing",
			"Drift Detection", 
			"Model Performance Analytics",
			"Healthcare Chat AI",
			"Real-time Monitoring",
			"Behavioral CRM System",
			"Patient Segmentation",
			"Personalized Strategies",
			"AR Treatment Simulation",
			"3D Facial Modeling",
			"Outcome Prediction",
			"Batch ML Predictions",
			"Proactive Risk Assessment",
			"Automated Intervention Planning"
		],
		timestamp: new Date().toISOString()
	});
});

// AI Health check
ai.get("/health", (c) => {
	return c.json({
		status: "healthy",
		service: "AI Services",
		components: {
			ml_pipeline: "operational",
			monitoring: "operational",
			chat: "operational",
			ar_simulator: "operational"
		},
		timestamp: new Date().toISOString()
	});
});

export { ai as aiRoutes };