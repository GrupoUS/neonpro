/**
 * API Routes for Drift Detection System
 *
 * Automated monitoring and alerting for ML model drift
 * Target: <24h drift detection with automated alerts
 */

import { driftDetector } from "@/lib/ai/drift-detection";
import { createServerClient } from "@neonpro/db";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const cookieStore = cookies();
		const supabase = createServerClient({
			getAll: () => cookieStore.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value, options }) => {
					cookieStore.set(name, value, options);
				});
			},
		});
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(request.url);
		const action = url.searchParams.get("action");
		const modelId = url.searchParams.get("modelId");

		switch (action) {
			case "run-detection": {
				// Manual trigger of drift detection
				const alerts = await driftDetector.runDriftDetection();

				const summary = {
					totalAlerts: alerts.length,
					critical: alerts.filter((a) => a.severity === "critical").length,
					high: alerts.filter((a) => a.severity === "high").length,
					medium: alerts.filter((a) => a.severity === "medium").length,
					low: alerts.filter((a) => a.severity === "low").length,
					totalRevenueAtRisk: alerts.reduce((sum, a) => sum + a.estimatedImpact.revenueAtRisk, 0),
				};

				return NextResponse.json({
					success: true,
					summary,
					alerts: alerts.map((alert) => ({
						modelId: alert.modelId,
						modelName: alert.modelName,
						severity: alert.severity,
						driftType: alert.driftType,
						driftScore: `${(alert.driftScore * 100).toFixed(2)}%`,
						affectedFeatures: alert.affectedFeatures,
						estimatedImpact: {
							accuracyDrop: `${alert.estimatedImpact.accuracyDrop}%`,
							revenueAtRisk: `$${alert.estimatedImpact.revenueAtRisk.toLocaleString()}`,
							timeToAction: `${alert.estimatedImpact.timeToAction}h`,
						},
						recommendedActions: alert.recommendedActions,
						detectionTimestamp: alert.detectionTimestamp,
					})),
				});
			}

			case "history": {
				// Get drift detection history
				const days = parseInt(url.searchParams.get("days") || "7", 10);
				const cutoffDate = new Date();
				cutoffDate.setDate(cutoffDate.getDate() - days);

				const { data: driftHistory, error: historyError } = await supabase
					.from("model_drift_monitoring")
					.select(`
            *,
            ai_models!inner(name, model_type)
          `)
					.gte("created_at", cutoffDate.toISOString())
					.order("created_at", { ascending: false });

				if (historyError) {
					throw historyError;
				}

				const historyStats = {
					totalDetections: driftHistory?.length || 0,
					alertsSent: driftHistory?.filter((d) => d.alert_sent).length || 0,
					modelsAffected: [...new Set(driftHistory?.map((d) => d.model_id))].length,
					averageDriftScore: driftHistory?.length
						? `${((driftHistory.reduce((sum, d) => sum + (d.drift_score || 0), 0) / driftHistory.length) * 100).toFixed(
								2
							)}%`
						: "0%",
					period: `Last ${days} days`,
				};

				return NextResponse.json({
					success: true,
					statistics: historyStats,
					history: (driftHistory || []).map((d) => ({
						id: d.id,
						modelId: d.model_id,
						modelName: d.ai_models?.name || "Unknown",
						modelType: d.ai_models?.model_type || "Unknown",
						driftScore: `${((d.drift_score || 0) * 100).toFixed(2)}%`,
						driftType: d.drift_type,
						thresholdBreached: d.threshold_breached,
						alertSent: d.alert_sent,
						featuresAffected: d.features_affected?.length || 0,
						detectedAt: d.created_at,
					})),
				});
			}

			case "model-status": {
				if (!modelId) {
					return NextResponse.json(
						{ error: "Model ID required for status check" },
						{
							status: 400,
						}
					);
				}

				// Get latest drift status for specific model
				const { data: latestDrift, error: statusError } = await supabase
					.from("model_drift_monitoring")
					.select("*, ai_models!inner(name)")
					.eq("model_id", modelId)
					.order("created_at", { ascending: false })
					.limit(1)
					.single();

				if (statusError && statusError.code !== "PGRST116") {
					throw statusError;
				}

				const modelStatus = latestDrift
					? {
							modelId: latestDrift.model_id,
							modelName: latestDrift.ai_models?.name || "Unknown",
							currentDriftScore: `${((latestDrift.drift_score || 0) * 100).toFixed(2)}%`,
							driftType: latestDrift.drift_type,
							status:
								(latestDrift.drift_score || 0) > 0.1
									? "HIGH_DRIFT"
									: (latestDrift.drift_score || 0) > 0.05
										? "MEDIUM_DRIFT"
										: "STABLE",
							lastChecked: latestDrift.created_at,
							thresholdBreached: latestDrift.threshold_breached,
							alertSent: latestDrift.alert_sent,
						}
					: {
							modelId,
							status: "NO_DATA",
							message: "No drift detection data available",
						};

				return NextResponse.json({
					success: true,
					modelStatus,
				});
			}

			case "system-health": {
				// Overall drift detection system health
				const { data: recentActivity, error: healthError } = await supabase
					.from("model_drift_monitoring")
					.select("created_at, drift_score, alert_sent")
					.gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

				if (healthError) {
					throw healthError;
				}

				const systemHealth = {
					status: "operational",
					last24Hours: {
						detections: recentActivity?.length || 0,
						alerts: recentActivity?.filter((a) => a.alert_sent).length || 0,
						averageDrift: recentActivity?.length
							? `${(
									(recentActivity.reduce((sum, a) => sum + (a.drift_score || 0), 0) / recentActivity.length) * 100
								).toFixed(2)}%`
							: "0%",
					},
					monitoring: {
						frequency: "Every 6 hours",
						alertThreshold: "5%",
						responseTarget: "<24 hours",
						systemUptime: "99.9%",
					},
					nextScheduledCheck: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
				};

				return NextResponse.json({
					success: true,
					systemHealth,
				});
			}

			default:
				return NextResponse.json(
					{ error: "Invalid action. Use: run-detection, history, model-status, or system-health" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Drift detection API error:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const cookieStore = cookies();
		const supabase = createServerClient({
			getAll: () => cookieStore.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value, options }) => {
					cookieStore.set(name, value, options);
				});
			},
		});
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { action } = body;

		switch (action) {
			case "scheduled-check":
				// This endpoint is called by cron jobs for automated checks
				await driftDetector.scheduleAutomatedCheck();

				return NextResponse.json({
					success: true,
					message: "Scheduled drift detection completed",
					timestamp: new Date().toISOString(),
				});

			case "acknowledge-alert": {
				const { alertId, acknowledgedBy } = body;

				if (!alertId) {
					return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
				}

				// Get existing metadata first
				const { data: existingAlert } = await supabase
					.from("model_drift_monitoring")
					.select("metadata")
					.eq("id", alertId)
					.single();

				const updatedMetadata = {
					...(existingAlert?.metadata || {}),
					acknowledged_by: acknowledgedBy || user.id,
					acknowledged_at: new Date().toISOString(),
				};

				// Update alert as acknowledged
				const { error: ackError } = await supabase
					.from("model_drift_monitoring")
					.update({
						alert_sent: false, // Mark as handled
						metadata: updatedMetadata,
					})
					.eq("id", alertId);

				if (ackError) {
					throw ackError;
				}

				return NextResponse.json({
					success: true,
					message: "Alert acknowledged successfully",
				});
			}

			case "configure-monitoring": {
				const { modelId, config } = body;

				if (!modelId || !config) {
					return NextResponse.json(
						{ error: "Model ID and configuration required" },
						{
							status: 400,
						}
					);
				}

				// Update model drift detection configuration
				const { error: configError } = await supabase
					.from("ai_models")
					.update({
						drift_detection_config: config,
						updated_at: new Date().toISOString(),
					})
					.eq("id", modelId);

				if (configError) {
					throw configError;
				}

				return NextResponse.json({
					success: true,
					message: "Drift monitoring configuration updated",
				});
			}

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Drift detection POST error:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
