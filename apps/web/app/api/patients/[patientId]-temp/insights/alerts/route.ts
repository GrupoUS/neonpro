// Story 3.2: API Endpoint - Patient Alerts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { PatientInsightsIntegration } from "@/lib/ai/patient-insights";

const patientInsights = new PatientInsightsIntegration();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
	try {
		const supabase = await createClient();

		// Verify authentication
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { patientId } = await params;

		// Validate patient access
		const { data: patient } = await supabase.from("patients").select("id").eq("id", patientId).single();

		if (!patient) {
			return NextResponse.json({ error: "Patient not found" }, { status: 404 });
		}

		// Monitor patient alerts
		const alertSummary = await patientInsights.monitorPatientAlerts(patientId);

		return NextResponse.json({
			success: true,
			data: alertSummary,
		});
	} catch (_error) {
		return NextResponse.json({ error: "Failed to retrieve patient alerts" }, { status: 500 });
	}
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
	try {
		const supabase = await createClient();

		// Verify authentication
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { patientId } = await params;
		const body = await request.json();
		const { alertTypes = [], severityFilter = null } = body;

		// Get detailed alerts with filters
		const alertSummary = await patientInsights.monitorPatientAlerts(patientId);

		// Apply filters
		let filteredAlerts = alertSummary.alerts;

		if (alertTypes.length > 0) {
			filteredAlerts = filteredAlerts.filter((alert) => alertTypes.includes(alert.type));
		}

		if (severityFilter) {
			filteredAlerts = filteredAlerts.filter((alert) => alert.severity === severityFilter);
		}

		return NextResponse.json({
			success: true,
			data: {
				...alertSummary,
				alerts: filteredAlerts,
				totalFiltered: filteredAlerts.length,
			},
		});
	} catch (_error) {
		return NextResponse.json({ error: "Failed to retrieve filtered alerts" }, { status: 500 });
	}
}
