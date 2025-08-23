// =====================================================================================
// CLINIC RETENTION METRICS API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for clinic-wide retention metrics and analytics
// =====================================================================================

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import { createClient } from "@/app/utils/supabase/server";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const ClinicMetricsParamsSchema = z.object({
	clinicId: z.string().uuid("Invalid clinic ID format"),
});

const ClinicMetricsQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(1000).default(100),
	offset: z.coerce.number().min(0).default(0),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
});

// =====================================================================================
// GET CLINIC RETENTION METRICS
// =====================================================================================

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ clinicId: string }> },
) {
	try {
		const resolvedParams = await params;
		// Validate clinic ID parameter
		const clinicValidation = ClinicMetricsParamsSchema.safeParse({
			clinicId: resolvedParams.clinicId,
		});

		if (!clinicValidation.success) {
			return NextResponse.json(
				{
					error: "Invalid clinic ID",
					details: clinicValidation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { clinicId } = clinicValidation.data;

		// Parse query parameters
		const { searchParams } = new URL(request.url);
		const queryValidation = ClinicMetricsQuerySchema.safeParse({
			limit: searchParams.get("limit"),
			offset: searchParams.get("offset"),
			startDate: searchParams.get("startDate"),
			endDate: searchParams.get("endDate"),
			riskLevel: searchParams.get("riskLevel"),
		});

		if (!queryValidation.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					details: queryValidation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { limit, offset, startDate, endDate, riskLevel } =
			queryValidation.data;

		// Verify authentication
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Verify clinic access
		const { data: userProfile, error: profileError } = await supabase
			.from("profiles")
			.select("clinic_id, role")
			.eq("id", user.id)
			.single();

		if (profileError || !userProfile) {
			return NextResponse.json(
				{ error: "User profile not found" },
				{ status: 403 },
			);
		}

		if (userProfile.clinic_id !== clinicId) {
			return NextResponse.json(
				{ error: "Access denied to clinic data" },
				{ status: 403 },
			);
		}

		// Verify clinic exists
		const { data: clinic, error: clinicError } = await supabase
			.from("clinics")
			.select("id, name")
			.eq("id", clinicId)
			.single();

		if (clinicError || !clinic) {
			return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
		}

		// Get clinic retention metrics
		const retentionService = new RetentionAnalyticsService();
		const metrics = await retentionService.getClinicRetentionMetrics(
			clinicId,
			limit,
			offset,
		);

		// Apply additional filters if provided
		let filteredMetrics = metrics;

		if (startDate || endDate || riskLevel) {
			filteredMetrics = metrics.filter((metric) => {
				// Filter by date range
				if (
					startDate &&
					new Date(metric.last_appointment_date) < new Date(startDate)
				) {
					return false;
				}
				if (
					endDate &&
					new Date(metric.last_appointment_date) > new Date(endDate)
				) {
					return false;
				}

				// Filter by risk level
				if (riskLevel && metric.churn_risk_level !== riskLevel) {
					return false;
				}

				return true;
			});
		}

		// Calculate summary statistics
		const summary = {
			total_patients: filteredMetrics.length,
			average_retention_rate:
				filteredMetrics.reduce((sum, m) => sum + m.retention_rate, 0) /
					filteredMetrics.length || 0,
			average_churn_risk:
				filteredMetrics.reduce((sum, m) => sum + m.churn_risk_score, 0) /
					filteredMetrics.length || 0,
			risk_distribution: {
				low: filteredMetrics.filter((m) => m.churn_risk_level === "low").length,
				medium: filteredMetrics.filter((m) => m.churn_risk_level === "medium")
					.length,
				high: filteredMetrics.filter((m) => m.churn_risk_level === "high")
					.length,
				critical: filteredMetrics.filter(
					(m) => m.churn_risk_level === "critical",
				).length,
			},
			total_lifetime_value: filteredMetrics.reduce(
				(sum, m) => sum + m.lifetime_value,
				0,
			),
			patients_at_risk: filteredMetrics.filter((m) =>
				["high", "critical"].includes(m.churn_risk_level),
			).length,
		};

		return NextResponse.json({
			success: true,
			data: {
				metrics: filteredMetrics,
				summary,
				pagination: {
					limit,
					offset,
					total: filteredMetrics.length,
					hasMore: offset + limit < filteredMetrics.length,
				},
				filters: {
					startDate,
					endDate,
					riskLevel,
				},
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// =====================================================================================
// BULK CALCULATE CLINIC RETENTION METRICS
// =====================================================================================

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ clinicId: string }> },
) {
	try {
		const resolvedParams = await params;
		// Validate clinic ID parameter
		const clinicValidation = ClinicMetricsParamsSchema.safeParse({
			clinicId: resolvedParams.clinicId,
		});

		if (!clinicValidation.success) {
			return NextResponse.json(
				{
					error: "Invalid clinic ID",
					details: clinicValidation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { clinicId } = clinicValidation.data;

		// Parse request body
		const body = await request.json();
		const { patientIds, forceRecalculate = false } = body;

		// Verify authentication
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Verify clinic access and permissions
		const { data: userProfile, error: profileError } = await supabase
			.from("profiles")
			.select("clinic_id, role")
			.eq("id", user.id)
			.single();

		if (profileError || !userProfile) {
			return NextResponse.json(
				{ error: "User profile not found" },
				{ status: 403 },
			);
		}

		if (userProfile.clinic_id !== clinicId) {
			return NextResponse.json(
				{ error: "Access denied to clinic data" },
				{ status: 403 },
			);
		}

		// Check permissions for bulk calculations
		const allowedRoles = ["admin", "manager", "analyst"];
		if (!allowedRoles.includes(userProfile.role)) {
			return NextResponse.json(
				{ error: "Insufficient permissions for bulk calculations" },
				{ status: 403 },
			);
		}

		// Get patients to calculate metrics for
		let targetPatientIds = patientIds;

		if (!targetPatientIds || targetPatientIds.length === 0) {
			// Get all patients for the clinic
			const { data: patients, error: patientsError } = await supabase
				.from("patients")
				.select("id")
				.eq("clinic_id", clinicId)
				.eq("active", true);

			if (patientsError) {
				throw new Error(`Failed to get patients: ${patientsError.message}`);
			}

			targetPatientIds = patients.map((p) => p.id);
		}

		// Validate that all patients belong to the clinic
		const { data: validPatients, error: validationError } = await supabase
			.from("patients")
			.select("id")
			.eq("clinic_id", clinicId)
			.in("id", targetPatientIds);

		if (validationError || validPatients.length !== targetPatientIds.length) {
			return NextResponse.json(
				{ error: "Some patients do not belong to the specified clinic" },
				{ status: 400 },
			);
		}

		// Calculate metrics in batches to avoid overwhelming the system
		const retentionService = new RetentionAnalyticsService();
		const results = [];
		const errors = [];

		const batchSize = 10; // Process 10 patients at a time

		for (let i = 0; i < targetPatientIds.length; i += batchSize) {
			const batch = targetPatientIds.slice(i, i + batchSize);

			const batchPromises = batch.map(async (patientId) => {
				try {
					const metrics =
						await retentionService.calculatePatientRetentionMetrics(
							patientId,
							clinicId,
						);
					return { patientId, metrics, success: true };
				} catch (error) {
					return {
						patientId,
						error: error instanceof Error ? error.message : "Unknown error",
						success: false,
					};
				}
			});

			const batchResults = await Promise.allSettled(batchPromises);

			batchResults.forEach((result) => {
				if (result.status === "fulfilled") {
					if (result.value.success) {
						results.push(result.value);
					} else {
						errors.push(result.value);
					}
				} else {
					errors.push({
						patientId: "unknown",
						error: result.reason?.message || "Promise rejected",
						success: false,
					});
				}
			});
		}

		// Calculate summary
		const summary = {
			total_processed: targetPatientIds.length,
			successful: results.length,
			failed: errors.length,
			success_rate: results.length / targetPatientIds.length,
		};

		return NextResponse.json({
			success: true,
			data: {
				results: results.map((r) => r.metrics),
				summary,
				errors: errors.length > 0 ? errors : undefined,
			},
			message: `Processed ${results.length} patients successfully, ${errors.length} failed`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
