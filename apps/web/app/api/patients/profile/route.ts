import { NextRequest, NextResponse } from 'next/server';
import { ProfileManager } from '@/lib/patients/profile-manager';
import { PatientInsights } from '@/lib/ai/patient-insights';
import { createClient } from '@/app/utils/supabase/server';
import { z } from 'zod';

// Initialize services
const profileManager = new ProfileManager();
const patientInsights = new PatientInsights();

// Validation schemas
const CreateProfileSchema = z.object({
  patient_id: z.string().min(1),
  user_id: z.string().min(1),
  demographics: z.object({
    name: z.string().min(1),
    date_of_birth: z.string(),
    gender: z.enum(['male', 'female', 'other']),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional()
  }),
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

const SearchSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  min_completeness: z.number().min(0).max(1).optional()
});

/**
 * POST /api/patients/profile - Create patient profile
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateProfileSchema.parse(body);

    // Create patient profile
    const profile = await profileManager.createPatientProfile(validatedData);

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to create patient profile' },
        { status: 500 }
      );
    }

    // Generate initial insights
    const insights = await patientInsights.generateComprehensiveInsights(profile);

    return NextResponse.json({
      profile,
      insights,
      message: 'Patient profile created successfully'
    });

  } catch (error) {
    console.error('Error creating patient profile:', error);
    
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
 * GET /api/patients/profile - Search patient profiles
 */
export async function GET(request: NextRequest) {
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

    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const searchData = {
      name: searchParams.get('name') || undefined,
      phone: searchParams.get('phone') || undefined,
      email: searchParams.get('email') || undefined,
      conditions: searchParams.get('conditions')?.split(',') || undefined,
      min_completeness: searchParams.get('min_completeness') 
        ? parseFloat(searchParams.get('min_completeness')!) 
        : undefined
    };

    // Validate search parameters
    const validatedSearch = SearchSchema.parse(searchData);

    // Search patient profiles
    const profiles = await profileManager.searchPatients(validatedSearch);

    return NextResponse.json({
      profiles,
      count: profiles.length,
      message: 'Patient profiles retrieved successfully'
    });

  } catch (error) {
    console.error('Error searching patient profiles:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}