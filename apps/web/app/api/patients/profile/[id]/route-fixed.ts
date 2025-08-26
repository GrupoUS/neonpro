import { createClient } from "@/app/utils/supabase/server";
import { PatientInsights } from "@/lib/ai/patient-insights";
import { ProfileManager } from "@/lib/patients/profile-manager";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize services
const profileManager = new ProfileManager();
const _patientInsights = new PatientInsights();

// Validation schema for updates
const UpdateProfileSchema = z.object({
	demographics: z
		.object({
			name: z.string().optional(),
			phone: z.string().optional(),
			email: z.string().email().optional(),
			address: z.string().optional(),
		})
		.optional(),
	medical_history: z
		.object({
			allergies: z.array(z.string()).optional(),
			conditions: z.array(z.string()).optional(),
			medications: z.array(z.string()).optional(),
			surgeries: z.array(z.string()).optional(),
		})
		.optional(),
	preferences: z
		.object({
			language: z.string().optional(),
			timezone: z.string().optional(),
			communication_method: z.enum(["email", "sms", "phone", "in_app"]).optional(),
			appointment_reminders: z.boolean().optional(),
		})
		.optional(),
	emergency_contact: z
		.object({
			name: z.string().optional(),
			relationship: z.string().optional(),
			phone: z.string().optional(),
		})
		.optional(),
});

/**
 * GET /api/patients/profile/[id] - Get specific patient profile
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const supabase = createClient();
		const { id: patientId } = await params;

		// Verify authentication
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get patient profile
		const profile = await profileManager.getPatientProfile(patientId);
		if (!profile) {
			return NextResponse.json({ error: "Patient not found" }, { status: 404 });
		}

		return NextResponse.json({ profile });
	} catch (_error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * PUT /api/patients/profile/[id] - Update patient profile
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const supabase = createClient();
		const { id: patientId } = await params;

		// Verify authentication
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = UpdateProfileSchema.parse(body);

		// Update patient profile
		const updatedProfile = await profileManager.updatePatientProfile(patientId, validatedData);
		if (!updatedProfile) {
			return NextResponse.json({ error: "Patient not found" }, { status: 404 });
		}

		return NextResponse.json({
			profile: updatedProfile,
			message: "Profile updated successfully",
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data format", details: error.errors },
				{
					status: 400,
				}
			);
		}
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * DELETE /api/patients/profile/[id] - Archive patient profile
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const supabase = createClient();
		const { id: patientId } = await params;

		// Verify authentication
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Archive patient profile (soft delete)
		const archived = await profileManager.archivePatientProfile(patientId);
		if (!archived) {
			return NextResponse.json({ error: "Patient not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Patient profile archived successfully",
		});
	} catch (_error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
