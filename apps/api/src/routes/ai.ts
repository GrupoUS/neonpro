/**
 * AI Routes - NeonPro API
 * Endpoints principais para funcionalidades de Inteligência Artificial
 * Inclui ML Pipeline, Monitoring e Chat Healthcare
 */

import { Hono } from "hono";
import mlPipelineRoutes from "./ai/ml-pipeline-endpoints";
import monitoringRoutes from "./ai/monitoring-endpoints";
import chatHealthRoutes from "./ai/universal-chat-health";

const ai = new Hono();

// ML Pipeline Management endpoints
// /api/v1/ai/ml-pipeline/*
ai.route("/ml-pipeline", mlPipelineRoutes);

// AI Monitoring endpoints  
// /api/v1/ai/monitoring/*
ai.route("/monitoring", monitoringRoutes);

// Universal Chat Health endpoints
// /api/v1/ai/chat/*
ai.route("/chat", chatHealthRoutes);

// AI Root endpoint
ai.get("/", (c) => {
	return c.json({
		service: "NeonPro AI Services",
		version: "1.0.0",
		description: "Intelligent healthcare management and analytics",
		endpoints: {
			ml_pipeline: "/ml-pipeline",
			monitoring: "/monitoring", 
			chat: "/chat"
		},
		features: [
			"ML Pipeline Management",
			"A/B Testing",
			"Drift Detection", 
			"Model Performance Analytics",
			"Healthcare Chat AI",
			"Real-time Monitoring"
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
			chat: "operational"
		},
		timestamp: new Date().toISOString()
	});
});

export { ai as aiRoutes };