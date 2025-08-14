// API Route: Patient Insights - Treatment Guidance
// Story 3.2: Task 8 - API Endpoints

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import PatientInsightsIntegration from '@/lib/ai/patient-insights'

// Initialize patient insights integration
const patientInsights = new PatientInsightsIntegration({
  enableRiskAssessment: true,
  enableTreatmentRecommendations: true,
  enablePredictiveAnalytics: true,
  enableContinuousLearning: true
})

// GET /api/patients/[patientId]/insights/treatments
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // 1. Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url)
    const treatmentContext = searchParams.get('context') // 'consultation', 'follow-up', 'emergency', etc.
    const includeAlternatives = searchParams.get('alternatives') === 'true'

    // 3. Validate patient access
    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', params.patientId)
      .single()

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // 4. Check user permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.clinic_id !== patient.clinic_id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // 5. Generate treatment guidance
    const treatmentGuidance = await patientInsights.generateTreatmentGuidance(
      params.patientId,
      treatmentContext || undefined
    )

    // 6. Get recent treatment history for context
    const { data: recentTreatments } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        treatment_summary,
        treatment_type
      `)
      .eq('patient_id', params.patientId)
      .eq('status', 'completed')
      .order('appointment_date', { ascending: false })
      .limit(5)

    // 7. Get active treatments and conditions
    const { data: activeTreatments } = await supabase
      .from('treatment_plans')
      .select(`
        id,
        treatment_type,
        start_date,
        status,
        notes
      `)
      .eq('patient_id', params.patientId)
      .eq('status', 'active')

    // 8. Enhanced treatment recommendations with context
    const enhancedGuidance = {
      ...treatmentGuidance,
      context: {
        treatmentContext,
        recentTreatments: recentTreatments?.map(t => ({
          id: t.id,
          date: t.appointment_date,
          type: t.treatment_type,
          summary: t.treatment_summary
        })) || [],
        activeTreatments: activeTreatments?.map(t => ({
          id: t.id,
          type: t.treatment_type,
          startDate: t.start_date,
          status: t.status,
          notes: t.notes
        })) || []
      }
    }

    // 9. Log the request
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'treatment_guidance_requested',
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { 
          treatment_context: treatmentContext,
          include_alternatives: includeAlternatives
        }
      })

    return NextResponse.json({
      success: true,
      data: enhancedGuidance
    })

  } catch (error) {
    console.error('Treatment guidance API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/patients/[patientId]/insights/treatments - Update treatment outcome
export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // 1. Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Validate request body
    const body = await request.json()
    const { 
      treatmentId, 
      outcome, 
      effectiveness, 
      sideEffects, 
      patientSatisfaction,
      notes,
      followUpRequired
    } = body

    if (!treatmentId || !outcome) {
      return NextResponse.json(
        { error: 'Treatment ID and outcome are required' },
        { status: 400 }
      )
    }

    // 3. Validate patient access
    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', params.patientId)
      .single()

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // 4. Check user permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.clinic_id !== patient.clinic_id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // 5. Verify treatment exists and belongs to patient
    const { data: treatment } = await supabase
      .from('treatment_plans')
      .select('id, patient_id, treatment_type')
      .eq('id', treatmentId)
      .eq('patient_id', params.patientId)
      .single()

    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found or access denied' },
        { status: 404 }
      )
    }

    // 6. Store treatment outcome
    const outcomeData = {
      treatment_id: treatmentId,
      patient_id: params.patientId,
      outcome,
      effectiveness: effectiveness || null,
      side_effects: sideEffects || null,
      patient_satisfaction: patientSatisfaction || null,
      notes: notes || null,
      follow_up_required: followUpRequired || false,
      recorded_by: session.user.id,
      recorded_at: new Date().toISOString()
    }

    const { data: storedOutcome, error: outcomeError } = await supabase
      .from('treatment_outcomes')
      .insert(outcomeData)
      .select()

    if (outcomeError) {
      console.error('Treatment outcome storage error:', outcomeError)
      return NextResponse.json(
        { error: 'Failed to store treatment outcome' },
        { status: 500 }
      )
    }

    // 7. Update patient insights with learning data
    const learningInsights = await patientInsights.updatePatientOutcome(
      params.patientId,
      treatmentId,
      outcomeData
    )

    // 8. Update treatment plan status if outcome indicates completion
    if (outcome === 'completed' || outcome === 'discontinued') {
      await supabase
        .from('treatment_plans')
        .update({ 
          status: outcome === 'completed' ? 'completed' : 'discontinued',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', treatmentId)
    }

    // 9. Log the outcome update
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'treatment_outcome_recorded',
        resource_type: 'treatment',
        resource_id: treatmentId,
        details: { 
          patient_id: params.patientId,
          outcome,
          effectiveness,
          learning_insights_count: learningInsights.length
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        outcome: storedOutcome?.[0],
        learningInsights,
        message: 'Treatment outcome recorded successfully'
      }
    })

  } catch (error) {
    console.error('Treatment outcome API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}