#!/usr/bin/env node

// Behavioral CRM System Validation Script
// Comprehensive testing of behavioral analytics, personalization, and campaign automation

import { performance } from "node:perf_hooks";

class BehavioralCrmValidator {
	constructor() {
		this.apiBaseUrl = "http://localhost:3001/api/ai";
		this.testResults = {
			behavioral_analytics: { passed: 0, failed: 0, tests: [] },
			personalization_engine: { passed: 0, failed: 0, tests: [] },
			campaign_automation: { passed: 0, failed: 0, tests: [] },
			dashboard_analytics: { passed: 0, failed: 0, tests: [] },
			api_endpoints: { passed: 0, failed: 0, tests: [] },
		};
		this.overallStart = performance.now();
	}

	async runTest(testName, testFunction, category = "api_endpoints") {
		const startTime = performance.now();

		try {
			const result = await testFunction();
			const endTime = performance.now();
			const duration = Math.round(endTime - startTime);

			this.testResults[category].passed++;
			this.testResults[category].tests.push({
				name: testName,
				status: "PASSED",
				duration: `${duration}ms`,
				result,
			});
			return result;
		} catch (error) {
			const endTime = performance.now();
			const duration = Math.round(endTime - startTime);

			this.testResults[category].failed++;
			this.testResults[category].tests.push({
				name: testName,
				status: "FAILED",
				duration: `${duration}ms`,
				error: error.message,
			});
			return null;
		}
	}

	// Behavioral Analytics Tests

	async testPatientBehaviorAnalysis() {
		const testPatientId = "test_patient_12345";

		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/analyze-patient-behavior`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				patientId: testPatientId,
				includeInsights: true,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Validate response structure
		if (!data.success) {
			throw new Error(`Analysis failed: ${data.error || "Unknown error"}`);
		}

		if (!data.patient_behavior) {
			throw new Error("Missing patient_behavior in response");
		}

		const behavior = data.patient_behavior;

		// Validate behavioral profile
		if (!behavior.behavioral_profile) {
			throw new Error("Missing behavioral_profile");
		}

		const profile = behavior.behavioral_profile;
		const requiredProfileFields = [
			"engagement_level",
			"communication_preference",
			"appointment_booking_pattern",
			"loyalty_score",
			"churn_risk",
		];

		for (const field of requiredProfileFields) {
			if (profile[field] === undefined) {
				throw new Error(`Missing required field: behavioral_profile.${field}`);
			}
		}

		// Validate engagement level
		const validEngagementLevels = ["low", "medium", "high", "very_high"];
		if (!validEngagementLevels.includes(profile.engagement_level)) {
			throw new Error(`Invalid engagement_level: ${profile.engagement_level}`);
		}

		// Validate churn risk range
		if (profile.churn_risk < 0 || profile.churn_risk > 1) {
			throw new Error(`Churn risk out of range: ${profile.churn_risk}`);
		}

		// Validate loyalty score range
		if (profile.loyalty_score < 0 || profile.loyalty_score > 100) {
			throw new Error(`Loyalty score out of range: ${profile.loyalty_score}`);
		}

		return {
			patient_id: testPatientId,
			engagement_level: profile.engagement_level,
			churn_risk: profile.churn_risk,
			loyalty_score: profile.loyalty_score,
			communication_preference: profile.communication_preference,
			has_insights: data.related_insights && data.related_insights.length > 0,
		};
	}

	async testPatientSegmentation() {
		const segmentationCriteria = {
			engagement_levels: ["high", "very_high"],
			lifecycle_stages: ["active", "returning"],
			churn_risk_threshold: 0.3,
		};

		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/segment-patients`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(segmentationCriteria),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Segmentation failed: ${data.error || "Unknown error"}`);
		}

		if (!Array.isArray(data.segmented_patients)) {
			throw new Error("segmented_patients is not an array");
		}

		// Validate segment scores
		for (const patient of data.segmented_patients) {
			if (typeof patient.segment_score !== "number") {
				throw new Error("Missing or invalid segment_score");
			}

			if (patient.segment_score < 0 || patient.segment_score > 100) {
				throw new Error(`Segment score out of range: ${patient.segment_score}`);
			}
		}

		// Verify sorting (highest scores first)
		for (let i = 1; i < data.segmented_patients.length; i++) {
			if (data.segmented_patients[i].segment_score > data.segmented_patients[i - 1].segment_score) {
				throw new Error("Segments not properly sorted by score");
			}
		}

		return {
			total_segments: data.total_segments,
			criteria_applied: Object.keys(segmentationCriteria).length,
			highest_score: data.segmented_patients.length > 0 ? data.segmented_patients[0].segment_score : 0,
			lowest_score: data.segmented_patients.length > 0 ? data.segmented_patients.at(-1).segment_score : 0,
		};
	}

	// Personalization Engine Tests

	async testPersonalizedMessageGeneration() {
		const testPatientId = "test_patient_67890";
		const messageTemplate =
			"Hello {patient_name}, your {loyalty_level} status gives you priority booking at {preferred_time}. You last visited us {last_visit}.";

		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/generate-personalized-message`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				patientId: testPatientId,
				messageTemplate,
				context: {
					appointment_type: "consultation",
					urgency: "medium",
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Personalization failed: ${data.error || "Unknown error"}`);
		}

		const personalizedMessage = data.personalized_message;

		// Validate required fields
		const requiredFields = ["personalized_content", "optimal_channel", "send_time", "personalization_score"];
		for (const field of requiredFields) {
			if (personalizedMessage[field] === undefined) {
				throw new Error(`Missing required field: ${field}`);
			}
		}

		// Validate personalization score range
		if (personalizedMessage.personalization_score < 0 || personalizedMessage.personalization_score > 1) {
			throw new Error(`Personalization score out of range: ${personalizedMessage.personalization_score}`);
		}

		// Check that personalization variables were replaced
		const hasUnreplacedVariables =
			personalizedMessage.personalized_content.includes("{") && personalizedMessage.personalized_content.includes("}");
		if (hasUnreplacedVariables) {
		}

		return {
			patient_id: testPatientId,
			optimal_channel: personalizedMessage.optimal_channel,
			personalization_score: personalizedMessage.personalization_score,
			content_length: personalizedMessage.personalized_content.length,
			send_time: personalizedMessage.send_time,
			variables_replaced: !hasUnreplacedVariables,
		};
	}

	async testPersonalizationRuleCreation() {
		const testRule = {
			name: "High-Value Patient Engagement Test",
			description: "Test rule for high-value patients in automated validation",
			trigger_conditions: {
				behavioral_criteria: {
					loyalty_score_min: 75,
					lifecycle_stage: "active",
				},
			},
			personalization_actions: {
				message_customization: {
					tone: "professional",
					content_focus: "benefits",
					language_complexity: "detailed",
				},
				timing_optimization: {
					preferred_send_times: ["09:00", "14:00"],
					frequency_cap: 2,
					delay_between_messages_hours: 48,
				},
				channel_selection: {
					primary_channel: "email",
					fallback_channels: ["sms"],
					avoid_channels: [],
				},
				content_recommendations: {
					treatment_suggestions: ["premium_consultation"],
					educational_content: ["advanced_care"],
					promotional_offers: ["loyalty_discount"],
				},
			},
			effectiveness_metrics: {
				conversion_rate: 0.32,
				engagement_rate: 0.78,
				roi_per_patient: 380.0,
				last_performance_review: new Date().toISOString(),
			},
			status: "active",
		};

		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/create-personalization-rule`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(testRule),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Rule creation failed: ${data.error || "Unknown error"}`);
		}

		if (!data.rule_id) {
			throw new Error("Missing rule_id in response");
		}

		// Validate rule ID format
		if (!data.rule_id.startsWith("rule_")) {
			throw new Error(`Invalid rule ID format: ${data.rule_id}`);
		}

		return {
			rule_id: data.rule_id,
			rule_name: testRule.name,
			status: testRule.status,
			roi_per_patient: testRule.effectiveness_metrics.roi_per_patient,
			conversion_rate: testRule.effectiveness_metrics.conversion_rate,
		};
	}

	// Campaign Automation Tests

	async testBehavioralCampaignCreation() {
		const testCampaign = {
			name: "Automated Validation Test Campaign",
			description: "Test campaign for behavioral CRM validation",
			campaign_type: "retention",
			target_segments: ["high_value", "at_risk"],
			trigger_rules: {
				behavioral_triggers: [
					{
						event_type: "appointment_missed",
						conditions: { consecutive_misses: 2 },
						timing: "delayed",
						delay_hours: 24,
					},
				],
				audience_filters: {
					include_segments: ["high_value"],
					exclude_segments: ["churned"],
					lifecycle_stages: ["active", "at_risk"],
					custom_criteria: { min_revenue: 500 },
				},
			},
			message_templates: [
				{
					template_id: "template_001",
					channel: "sms",
					content: "We miss you! Let's schedule your next appointment with a 15% discount.",
					personalization_variables: ["patient_name", "preferred_time"],
					call_to_action: {
						text: "Book Now",
						action_type: "book_appointment",
						action_url: "https://clinic.com/book",
					},
					message_priority: "high",
				},
			],
			automation_flow: [
				{
					step_id: "step_001",
					step_name: "Initial Re-engagement",
					trigger_after_hours: 24,
					message_template_id: "template_001",
					success_actions: ["mark_engaged"],
					failure_actions: ["escalate_to_phone"],
				},
			],
			schedule: {
				start_date: new Date().toISOString(),
				end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
				recurring: false,
				active_hours: {
					start_time: "09:00",
					end_time: "17:00",
					timezone: "America/Sao_Paulo",
				},
			},
			status: "active",
			created_by: "validator_system",
		};

		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/create-behavioral-campaign`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(testCampaign),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Campaign creation failed: ${data.error || "Unknown error"}`);
		}

		if (!data.campaign_id) {
			throw new Error("Missing campaign_id in response");
		}

		// Validate campaign ID format
		if (!data.campaign_id.startsWith("campaign_")) {
			throw new Error(`Invalid campaign ID format: ${data.campaign_id}`);
		}

		return {
			campaign_id: data.campaign_id,
			campaign_name: testCampaign.name,
			campaign_type: testCampaign.campaign_type,
			target_segments: testCampaign.target_segments.length,
			automation_steps: testCampaign.automation_flow.length,
			message_templates: testCampaign.message_templates.length,
		};
	}

	async testCampaignStepExecution() {
		// First create a campaign to test with
		const campaignResult = await this.testBehavioralCampaignCreation();
		const testPatientId = "test_patient_campaign_exec";

		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/execute-campaign-step`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				campaignId: campaignResult.campaign_id,
				stepId: "step_001",
				patientId: testPatientId,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Campaign step execution failed: ${data.error || "Unknown error"}`);
		}

		if (typeof data.executed !== "boolean") {
			throw new Error("Missing or invalid executed field in response");
		}

		return {
			campaign_id: campaignResult.campaign_id,
			step_executed: data.executed,
			patient_id: testPatientId,
			execution_success: data.executed,
		};
	}

	// Dashboard Analytics Tests

	async testDashboardDataRetrieval() {
		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/dashboard-data`);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Dashboard data fetch failed: ${data.error || "Unknown error"}`);
		}

		const dashboardData = data.dashboard_data;

		// Validate overview metrics
		const requiredMetrics = ["total_patients", "active_patients", "new_patients_this_month", "churn_risk_patients"];
		for (const metric of requiredMetrics) {
			if (typeof dashboardData.overview_metrics[metric] !== "number") {
				throw new Error(`Missing or invalid metric: ${metric}`);
			}
		}

		// Validate behavioral segments
		if (!Array.isArray(dashboardData.behavioral_segments)) {
			throw new Error("behavioral_segments is not an array");
		}

		// Validate campaign performance
		if (!Array.isArray(dashboardData.campaign_performance)) {
			throw new Error("campaign_performance is not an array");
		}

		// Validate predictive analytics
		if (!dashboardData.predictive_analytics) {
			throw new Error("Missing predictive_analytics");
		}

		return {
			total_patients: dashboardData.overview_metrics.total_patients,
			active_patients: dashboardData.overview_metrics.active_patients,
			behavioral_segments: dashboardData.behavioral_segments.length,
			active_campaigns: dashboardData.campaign_performance.length,
			churn_predictions: dashboardData.predictive_analytics.churn_predictions.length,
			revenue_forecast_30d: dashboardData.predictive_analytics.revenue_forecast.next_30_days,
		};
	}

	async testBehavioralInsights() {
		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/behavioral-insights`);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Insights generation failed: ${data.error || "Unknown error"}`);
		}

		if (!Array.isArray(data.insights)) {
			throw new Error("insights is not an array");
		}

		// Validate insight structure
		for (const insight of data.insights) {
			const requiredFields = [
				"insight_id",
				"insight_type",
				"title",
				"description",
				"key_findings",
				"actionable_recommendations",
			];
			for (const field of requiredFields) {
				if (!insight[field]) {
					throw new Error(`Missing required field in insight: ${field}`);
				}
			}

			// Validate insight types
			const validTypes = ["pattern_discovery", "anomaly_detection", "conversion_optimization", "churn_prediction"];
			if (!validTypes.includes(insight.insight_type)) {
				throw new Error(`Invalid insight type: ${insight.insight_type}`);
			}
		}

		return {
			insights_count: data.insights.length,
			insight_types: data.insights.map((i) => i.insight_type),
			avg_findings_per_insight: data.insights.reduce((sum, i) => sum + i.key_findings.length, 0) / data.insights.length,
			avg_recommendations_per_insight:
				data.insights.reduce((sum, i) => sum + i.actionable_recommendations.length, 0) / data.insights.length,
		};
	}

	// API Health Tests

	async testApiHealth() {
		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/health`);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.status !== "healthy") {
			throw new Error(`API is not healthy: ${data.status}`);
		}

		// Validate endpoint status
		const endpoints = data.endpoints;
		const requiredEndpoints = [
			"behavioral_analytics",
			"personalization_engine",
			"campaign_automation",
			"dashboard_analytics",
		];

		for (const endpoint of requiredEndpoints) {
			if (endpoints[endpoint] !== "operational") {
				throw new Error(`Endpoint ${endpoint} is not operational: ${endpoints[endpoint]}`);
			}
		}

		return {
			status: data.status,
			service: data.service,
			version: data.version,
			operational_endpoints: Object.keys(endpoints).filter((k) => endpoints[k] === "operational").length,
		};
	}

	async testApiMetrics() {
		const response = await fetch(`${this.apiBaseUrl}/behavioral-crm/metrics`);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(`Metrics fetch failed: ${data.error || "Unknown error"}`);
		}

		const metrics = data.metrics;

		// Validate metrics structure
		if (!(metrics.api_requests && metrics.performance_metrics && metrics.business_metrics)) {
			throw new Error("Missing required metrics categories");
		}

		return {
			api_requests: metrics.api_requests,
			avg_response_time: metrics.performance_metrics.avg_response_time_ms,
			success_rate: metrics.performance_metrics.success_rate,
			patients_analyzed: metrics.business_metrics.patients_analyzed,
		};
	}

	// Performance Tests

	async testResponseTimePerformance() {
		const endpoints = [
			{ url: "/behavioral-crm/health", method: "GET", expectedMaxTime: 100 },
			{ url: "/behavioral-crm/dashboard-data", method: "GET", expectedMaxTime: 500 },
			{ url: "/behavioral-crm/behavioral-insights", method: "GET", expectedMaxTime: 1000 },
		];

		const results = [];

		for (const endpoint of endpoints) {
			const startTime = performance.now();

			const response = await fetch(`${this.apiBaseUrl}${endpoint.url}`, {
				method: endpoint.method,
			});

			const endTime = performance.now();
			const responseTime = endTime - startTime;

			if (!response.ok) {
				throw new Error(`HTTP ${response.status} for ${endpoint.url}`);
			}

			results.push({
				endpoint: endpoint.url,
				response_time_ms: Math.round(responseTime),
				expected_max_ms: endpoint.expectedMaxTime,
				performance_ok: responseTime <= endpoint.expectedMaxTime,
			});
		}

		const avgResponseTime = Math.round(results.reduce((sum, r) => sum + r.response_time_ms, 0) / results.length);
		const allWithinLimits = results.every((r) => r.performance_ok);

		if (!allWithinLimits) {
		}

		return {
			endpoints_tested: results.length,
			avg_response_time_ms: avgResponseTime,
			all_within_limits: allWithinLimits,
			individual_results: results,
		};
	}

	// Main validation runner

	async runAllValidations() {
		await this.runTest("Patient Behavior Analysis", () => this.testPatientBehaviorAnalysis(), "behavioral_analytics");
		await this.runTest("Patient Segmentation", () => this.testPatientSegmentation(), "behavioral_analytics");
		await this.runTest(
			"Personalized Message Generation",
			() => this.testPersonalizedMessageGeneration(),
			"personalization_engine"
		);
		await this.runTest(
			"Personalization Rule Creation",
			() => this.testPersonalizationRuleCreation(),
			"personalization_engine"
		);
		await this.runTest(
			"Behavioral Campaign Creation",
			() => this.testBehavioralCampaignCreation(),
			"campaign_automation"
		);
		await this.runTest("Campaign Step Execution", () => this.testCampaignStepExecution(), "campaign_automation");
		await this.runTest("Dashboard Data Retrieval", () => this.testDashboardDataRetrieval(), "dashboard_analytics");
		await this.runTest("Behavioral Insights Generation", () => this.testBehavioralInsights(), "dashboard_analytics");
		await this.runTest("API Health Check", () => this.testApiHealth(), "api_endpoints");
		await this.runTest("API Metrics", () => this.testApiMetrics(), "api_endpoints");
		await this.runTest("Response Time Performance", () => this.testResponseTimePerformance(), "api_endpoints");

		// Generate final report
		this.generateValidationReport();
	}

	generateValidationReport() {
		const overallEnd = performance.now();
		const totalDuration = Math.round(overallEnd - this.overallStart);

		let totalPassed = 0;
		let totalFailed = 0;

		for (const [_category, results] of Object.entries(this.testResults)) {
			const categoryTotal = results.passed + results.failed;
			const _successRate = categoryTotal > 0 ? Math.round((results.passed / categoryTotal) * 100) : 0;

			totalPassed += results.passed;
			totalFailed += results.failed;

			if (results.failed > 0) {
				results.tests.filter((t) => t.status === "FAILED").forEach((_test) => {});
			}
		}

		const overallTotal = totalPassed + totalFailed;
		const overallSuccessRate = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;

		if (overallSuccessRate >= 90) {
		} else if (overallSuccessRate >= 70) {
		} else {
		}

		return {
			success_rate: overallSuccessRate,
			total_tests: overallTotal,
			passed: totalPassed,
			failed: totalFailed,
			duration_ms: totalDuration,
		};
	}
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const validator = new BehavioralCrmValidator();
	validator.runAllValidations().catch((_error) => {
		process.exit(1);
	});
}

export { BehavioralCrmValidator };
