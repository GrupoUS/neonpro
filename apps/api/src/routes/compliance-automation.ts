/**
 * ⚖️ Brazilian Healthcare Compliance Automation Routes - NeonPro API
 * ==================================================================
 *
 * Real-time LGPD/ANVISA/CFM compliance automation endpoints
 * Constitutional healthcare compliance with ≥9.9/10 standards
 */

import { zValidator } from "@hono/zod-validator";
import {
	type ComplianceAutomationConfig,
	type ComplianceAutomationResponse,
	createBrazilianComplianceAutomationService,
	DEFAULT_COMPLIANCE_CONFIG,
} from "@neonpro/compliance";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../lib/constants.js";
import { createSupabaseClient } from "../lib/supabase.js";

// Zod schemas for compliance automation
const ComplianceAutomationConfigSchema = z.object({
	tenant_id: z.string(),
	lgpd_automation: z.boolean().default(true),
	anvisa_automation: z.boolean().default(true),
	cfm_automation: z.boolean().default(true),
	monitoring_config: z.object({
		enabled: z.boolean().default(true),
		interval_minutes: z.number().min(5).max(1440).default(15),
		alert_thresholds: z.object({
			warning: z.number().min(9.0).max(10.0).default(9.95),
			critical: z.number().min(9.0).max(10.0).default(9.9),
			constitutional_minimum: z.number().min(9.9).max(10.0).default(9.9),
		}),
	}),
	reporting_config: z.object({
		daily_reports: z.boolean().default(true),
		monthly_reports: z.boolean().default(true),
		anvisa_reports: z.boolean().default(true),
		lgpd_reports: z.boolean().default(true),
	}),
});

const ComplianceExecutionSchema = z.object({
	tenant_id: z.string(),
	user_id: z.string(),
	compliance_areas: z.array(z.enum(["lgpd", "anvisa", "cfm", "all"])).default(["all"]),
	immediate_execution: z.boolean().default(true),
});

const _MonitoringStatusSchema = z.object({
	tenant_id: z.string(),
	monitor_id: z.string().optional(),
});

// Create compliance automation router
export const complianceAutomationRoutes = new Hono()

	// Authentication middleware
	.use("*", async (c, next) => {
		const auth = c.req.header("Authorization");
		if (!auth?.startsWith("Bearer ")) {
			return c.json({ error: "UNAUTHORIZED", message: "Token de acesso obrigatório" }, 401);
		}
		await next();
	})

	// 🚀 Execute Comprehensive Compliance Automation
	.post("/execute", zValidator("json", ComplianceExecutionSchema), async (c) => {
		const { tenant_id, user_id, compliance_areas, immediate_execution } = c.req.valid("json");

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			// Create compliance automation configuration
			const config: ComplianceAutomationConfig = {
				...DEFAULT_COMPLIANCE_CONFIG,
				tenant_id,
				// Override based on compliance_areas selection
				lgpd_automation: compliance_areas.includes("lgpd") || compliance_areas.includes("all"),
				anvisa_automation: compliance_areas.includes("anvisa") || compliance_areas.includes("all"),
				cfm_automation: compliance_areas.includes("cfm") || compliance_areas.includes("all"),
			};

			// Create compliance automation service
			const complianceService = createBrazilianComplianceAutomationService(supabase, config);

			// Execute compliance automation
			const automationResult = await complianceService.executeComplianceAutomation(user_id);

			if (!automationResult.success) {
				return c.json(
					{
						success: false,
						error: "COMPLIANCE_AUTOMATION_ERROR",
						message: automationResult.error || "Erro na automação de compliance",
					},
					500
				);
			}

			const response: ApiResponse<ComplianceAutomationResponse> = {
				success: true,
				data: automationResult.data!,
				message: "Automação de compliance executada com sucesso",
				metadata: {
					execution_time: new Date().toISOString(),
					compliance_areas,
					constitutional_standard_met: automationResult.data?.overall_score >= 9.9,
				},
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro interno na automação de compliance",
				},
				500
			);
		}
	})

	// 📊 Get Real-Time Compliance Status
	.get("/status/:tenant_id", async (c) => {
		const tenant_id = c.req.param("tenant_id");

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			// Get latest compliance assessment
			const { data: latestAssessment, error: assessmentError } = await supabase
				.from("compliance_assessments")
				.select("*")
				.eq("tenant_id", tenant_id)
				.order("assessed_at", { ascending: false })
				.limit(1)
				.single();

			if (assessmentError && assessmentError.code !== "PGRST116") {
				throw assessmentError;
			}

			// Get active monitoring status
			const { data: activeMonitor, error: monitorError } = await supabase
				.from("enterprise_compliance_monitors")
				.select("*")
				.eq("tenant_id", tenant_id)
				.eq("status", "active")
				.single();

			if (monitorError && monitorError.code !== "PGRST116") {
			}

			const response: ApiResponse<{
				latest_assessment?: any;
				active_monitoring: boolean;
				monitor_info?: any;
				status_summary: {
					overall_compliant: boolean;
					overall_score: number;
					last_assessment: string | null;
					monitoring_active: boolean;
				};
			}> = {
				success: true,
				data: {
					latest_assessment: latestAssessment,
					active_monitoring: !!activeMonitor,
					monitor_info: activeMonitor,
					status_summary: {
						overall_compliant:
							latestAssessment?.overall_status === "compliant" || latestAssessment?.overall_score >= 9.9,
						overall_score: latestAssessment?.overall_score || 9.9,
						last_assessment: latestAssessment?.assessed_at || null,
						monitoring_active: !!activeMonitor,
					},
				},
				message: "Status de compliance carregado",
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao carregar status de compliance",
				},
				500
			);
		}
	})

	// 📈 Get Compliance History and Trends
	.get("/history/:tenant_id", async (c) => {
		const tenant_id = c.req.param("tenant_id");
		const { days = "30" } = c.req.query();

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			// Calculate date range
			const endDate = new Date();
			const startDate = new Date(endDate.getTime() - Number.parseInt(days, 10) * 24 * 60 * 60 * 1000);

			// Get compliance history
			const { data: complianceHistory, error: historyError } = await supabase
				.from("compliance_assessments")
				.select("*")
				.eq("tenant_id", tenant_id)
				.gte("assessed_at", startDate.toISOString())
				.lte("assessed_at", endDate.toISOString())
				.order("assessed_at", { ascending: true });

			if (historyError) {
				throw historyError;
			}

			// Calculate trends
			const trends = {
				score_trend: "stable" as "improving" | "stable" | "declining",
				average_score: 9.9,
				compliance_consistency: 100,
				areas_improving: [] as string[],
				areas_declining: [] as string[],
			};

			if (complianceHistory && complianceHistory.length >= 2) {
				const scores = complianceHistory.map((h) => h.overall_score);
				const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

				const firstScore = scores[0];
				const lastScore = scores.at(-1);
				const trendPercentage = ((lastScore - firstScore) / firstScore) * 100;

				trends.average_score = Math.round(averageScore * 100) / 100;
				trends.compliance_consistency = Math.round((scores.filter((s) => s >= 9.9).length / scores.length) * 100);

				if (trendPercentage > 1) {
					trends.score_trend = "improving";
				} else if (trendPercentage < -1) {
					trends.score_trend = "declining";
				}
			}

			const response: ApiResponse<{
				history: typeof complianceHistory;
				trends: typeof trends;
				summary: {
					total_assessments: number;
					date_range: {
						start: string;
						end: string;
						days: number;
					};
					constitutional_compliance_rate: number;
				};
			}> = {
				success: true,
				data: {
					history: complianceHistory || [],
					trends,
					summary: {
						total_assessments: complianceHistory?.length || 0,
						date_range: {
							start: startDate.toISOString(),
							end: endDate.toISOString(),
							days: Number.parseInt(days, 10),
						},
						constitutional_compliance_rate: trends.compliance_consistency,
					},
				},
				message: "Histórico de compliance carregado",
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao carregar histórico de compliance",
				},
				500
			);
		}
	})

	// ⚙️ Configure Compliance Automation
	.post("/configure", zValidator("json", ComplianceAutomationConfigSchema), async (c) => {
		const config = c.req.valid("json");

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			// Store compliance configuration
			const { data: configData, error: configError } = await supabase
				.from("compliance_configurations")
				.upsert({
					tenant_id: config.tenant_id,
					configuration: config,
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (configError) {
				throw configError;
			}

			const response: ApiResponse<typeof configData> = {
				success: true,
				data: configData,
				message: "Configuração de compliance atualizada",
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao configurar automação de compliance",
				},
				500
			);
		}
	})

	// 🚨 Get Active Compliance Alerts
	.get("/alerts/:tenant_id", async (c) => {
		const tenant_id = c.req.param("tenant_id");
		const { severity, limit = "50" } = c.req.query();

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			let query = supabase
				.from("compliance_alerts")
				.select("*")
				.eq("tenant_id", tenant_id)
				.eq("acknowledged", false)
				.order("triggered_at", { ascending: false })
				.limit(Number.parseInt(limit, 10));

			if (severity) {
				query = query.eq("severity", severity);
			}

			const { data: alerts, error: alertsError } = await query;

			if (alertsError) {
				throw alertsError;
			}

			// Categorize alerts by severity
			const alertsSummary = {
				total: alerts?.length || 0,
				critical:
					alerts?.filter((a) => a.severity === "critical" || a.severity === "constitutional_violation").length || 0,
				warning: alerts?.filter((a) => a.severity === "warning").length || 0,
				info: alerts?.filter((a) => a.severity === "info").length || 0,
			};

			const response: ApiResponse<{
				alerts: typeof alerts;
				summary: typeof alertsSummary;
			}> = {
				success: true,
				data: {
					alerts: alerts || [],
					summary: alertsSummary,
				},
				message: "Alertas de compliance carregados",
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao carregar alertas de compliance",
				},
				500
			);
		}
	})

	// ✅ Acknowledge Compliance Alert
	.put("/alerts/:alert_id/acknowledge", async (c) => {
		const alert_id = c.req.param("alert_id");
		const { user_id } = await c.req.json();

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			// Acknowledge alert
			const { data: acknowledgedAlert, error: ackError } = await supabase
				.from("compliance_alerts")
				.update({
					acknowledged: true,
					acknowledged_by: user_id,
					acknowledged_at: new Date().toISOString(),
				})
				.eq("alert_id", alert_id)
				.select()
				.single();

			if (ackError) {
				throw ackError;
			}

			const response: ApiResponse<typeof acknowledgedAlert> = {
				success: true,
				data: acknowledgedAlert,
				message: "Alerta de compliance confirmado",
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao confirmar alerta",
				},
				500
			);
		}
	})

	// 📋 Generate Compliance Report
	.post("/reports/generate", async (c) => {
		const { tenant_id, report_type, period_days = 30 } = await c.req.json();

		try {
			// Initialize Supabase client
			const supabase = createSupabaseClient();

			// Generate compliance report data
			const endDate = new Date();
			const startDate = new Date(endDate.getTime() - period_days * 24 * 60 * 60 * 1000);

			const { data: reportData, error: reportError } = await supabase
				.from("compliance_assessments")
				.select("*")
				.eq("tenant_id", tenant_id)
				.gte("assessed_at", startDate.toISOString())
				.lte("assessed_at", endDate.toISOString())
				.order("assessed_at", { ascending: false });

			if (reportError) {
				throw reportError;
			}

			const reportSummary = {
				report_id: `compliance_report_${Date.now()}`,
				report_type,
				period: {
					start: startDate.toISOString(),
					end: endDate.toISOString(),
					days: period_days,
				},
				compliance_overview: {
					total_assessments: reportData?.length || 0,
					average_score: reportData?.length
						? reportData.reduce((sum, r) => sum + r.overall_score, 0) / reportData.length
						: 9.9,
					constitutional_compliance_rate: reportData?.length
						? (reportData.filter((r) => r.overall_score >= 9.9).length / reportData.length) * 100
						: 100,
					areas_analyzed: ["LGPD", "ANVISA", "CFM"],
				},
				generated_at: new Date().toISOString(),
				download_url: `/api/v1/compliance-automation/reports/download/${tenant_id}/${Date.now()}`,
			};

			// Store report
			await supabase.from("compliance_reports").insert({
				tenant_id,
				report_type,
				report_data: reportSummary,
				generated_at: new Date().toISOString(),
			});

			const response: ApiResponse<typeof reportSummary> = {
				success: true,
				data: reportSummary,
				message: "Relatório de compliance gerado",
			};

			return c.json(response, HTTP_STATUS.OK);
		} catch (_error) {
			return c.json(
				{
					success: false,
					error: "INTERNAL_ERROR",
					message: "Erro ao gerar relatório de compliance",
				},
				500
			);
		}
	});

export default complianceAutomationRoutes;
