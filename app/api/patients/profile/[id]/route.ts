import { NextRequest, NextResponse } from 'next/server';
import { ProfileManager } from '@/lib/patients/profile-manager';
import { PatientInsights } from '@/lib/ai/patient-insights';
import { createClient } from '@/app/utils/supabase/server';
import { z } from 'zod';

// Initialize services
const profileManager = new ProfileManager();
const patientInsights = new PatientInsights();

// Validation schema for updates
const UpdateProfileSchema = z.object({
  demographics: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional()
  }).optional(),
  medical_history: z.object({
    allergies: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    surgeries: z.array(z.string()).optional()
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    timezone: z.string().optional(),
    communication_method: z.enum(['email', 'sms', 'phone', 'in_app']).optional(),
    appointment_reminders: z.boolean().optional()
  }).optional(),
  emergency_contact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional()
  }).optional()
});

/**
 * GET /api/patients/profile/[id] - Get specific patient profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get patient profile
    const profile = await profileManager.getPatientProfile(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Get latest insights
    const insights = await patientInsights.generateComprehensiveInsights(profile);

    return NextResponse.json({
      profile,
      insights,
      message: 'Patient profile retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving patient profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patients/profile/[id] - Update patient profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateProfileSchema.parse(body);

    // Update patient profile
    const updatedProfile = await profileManager.updatePatientProfile(id, validatedData);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found or update failed' },
        { status: 404 }
      );
    }

    // Regenerate insights after update
    const insights = await patientInsights.generateComprehensiveInsights(updatedProfile);

    return NextResponse.json({
      profile: updatedProfile,
      insights,
      message: 'Patient profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating patient profile:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/profile/[id] - Archive patient profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Archive patient profile (soft delete)
    const archivedProfile = await profileManager.archivePatientProfile(id);

    if (!archivedProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found or archival failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: archivedProfile,
      message: 'Patient profile archived successfully'
    });

  } catch (error) {
    console.error('Error archiving patient profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}