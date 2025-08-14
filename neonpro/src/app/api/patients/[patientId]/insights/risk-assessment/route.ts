// API Route: Patient Insights - Risk Assessment
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
  enableBehaviorAnalysis: true,
  enableHealthTrends: true,
  enableContinuousLearning: true
})

// GET /api/patients/[patientId]/insights/risk-assessment
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

    // 2. Validate patient access
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

    // 3. Check user permissions for this clinic
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

    // 4. Generate risk assessment
    const riskAssessment = await patientInsights.generateQuickRiskAssessment(params.patientId)

    // 5. Log the request for audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'patient_risk_assessment',
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { request_type: 'quick_risk_assessment' }
      })

    return NextResponse.json({
      success: true,
      data: riskAssessment
    })

  } catch (error) {
    console.error('Risk assessment API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/patients/[patientId]/insights/risk-assessment - Update risk factors
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
    const { riskFactors, customFactors } = body

    if (!riskFactors && !customFactors) {
      return NextResponse.json(
        { error: 'Risk factors or custom factors required' },
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

    // 5. Store risk factors
    const { data: riskData, error: riskError } = await supabase
      .from('patient_risk_factors')
      .upsert({
        patient_id: params.patientId,
        risk_factors: riskFactors || {},
        custom_factors: customFactors || {},
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
      })

    if (riskError) {
      console.error('Risk factors storage error:', riskError)
      return NextResponse.json(
        { error: 'Failed to store risk factors' },
        { status: 500 }
      )
    }

    // 6. Generate updated risk assessment
    const updatedAssessment = await patientInsights.generateQuickRiskAssessment(params.patientId)

    // 7. Log the update
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'patient_risk_factors_updated',
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { risk_factors: riskFactors, custom_factors: customFactors }
      })

    return NextResponse.json({
      success: true,
      data: {
        stored: riskData,
        assessment: updatedAssessment
      }
    })

  } catch (error) {
    console.error('Risk factors update API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}