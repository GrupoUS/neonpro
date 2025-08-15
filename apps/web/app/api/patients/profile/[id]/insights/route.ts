import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { PatientInsights } from '@/lib/ai/patient-insights';
import { ProfileManager } from '@/lib/patients/profile-manager';

// Initialize services
const profileManager = new ProfileManager();
const patientInsights = new PatientInsights();

/**
 * GET /api/patients/profile/[id]/insights - Get patient insights
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get patient profile
    const profile = await profileManager.getPatientProfile(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Parse query parameters for specific insight types
    const { searchParams } = new URL(request.url);
    const insightType = searchParams.get('type');

    let insights;

    switch (insightType) {
      case 'clinical':
        insights = await patientInsights.generateClinicalInsights(profile);
        break;
      case 'personalization':
        insights =
          await patientInsights.generatePersonalizationInsights(profile);
        break;
      case 'risk':
        insights = await patientInsights.generateRiskAssessment(profile);
        break;
      case 'care':
        insights = await patientInsights.generateCareRecommendations(profile);
        break;
      case 'trending':
        insights = await patientInsights.getTrendingInsights(id);
        break;
      default:
        insights = await patientInsights.generateComprehensiveInsights(profile);
    }

    return NextResponse.json({
      insights,
      patient_id: id,
      type: insightType || 'comprehensive',
      generated_at: new Date().toISOString(),
      message: 'Patient insights retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving patient insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients/profile/[id]/insights - Regenerate insights
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get patient profile
    const profile = await profileManager.getPatientProfile(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Regenerate comprehensive insights
    const insights =
      await patientInsights.generateComprehensiveInsights(profile);

    // Update insights in the system
    const updated = await patientInsights.updateInsights(id, insights);

    return NextResponse.json({
      insights: updated,
      patient_id: id,
      regenerated_at: new Date().toISOString(),
      message: 'Patient insights regenerated successfully',
    });
  } catch (error) {
    console.error('Error regenerating patient insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
