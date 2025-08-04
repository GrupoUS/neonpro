// API Route: Patient Insights - Comprehensive Analysis
// Story 3.2: Task 8 - API Endpoints

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { PatientInsightsIntegration } from '@/lib/ai/patient-insights'
import { PatientInsightRequest } from '@/lib/ai/patient-insights/types'

// Initialize patient insights integration
const patientInsights = new PatientInsightsIntegration({
  enableRiskAssessment: true,
  enableTreatmentRecommendations: true,
  enablePredictiveAnalytics: true,
  enableBehaviorAnalysis: true,
  enableHealthTrends: true,
  enableContinuousLearning: true
})

// POST /api/patients/[patientId]/insights/comprehensive
export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // 1. Authenticate user
    const supabase = createClient()
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
      requestedInsights = ['risk', 'treatment', 'behavior', 'trends'],
      treatmentContext,
      treatmentId,
      includeAlerts = true,
      includePredictions = true,
      feedbackData
    } = body

    // 3. Validate patient access
    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id, created_at')
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

    // 5. Build comprehensive insight request
    const insightRequest: PatientInsightRequest = {
      patientId: params.patientId,
      requestId: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestedInsights,
      treatmentContext,
      treatmentId,
      includeAlerts,
      includePredictions,
      feedbackData,
      timestamp: new Date(),
      userId: session.user.id,
      clinicId: userProfile?.clinic_id || ''
    }

    // 6. Generate comprehensive insights
    const comprehensiveInsights = await patientInsights.generateComprehensiveInsights(insightRequest)

    // 7. Store insights in database for future reference
    const { data: storedInsights, error: storageError } = await supabase
      .from('patient_insights')
      .insert({
        patient_id: params.patientId,
        request_id: insightRequest.requestId,
        insights_data: comprehensiveInsights,
        requested_by: session.user.id,
        request_timestamp: new Date().toISOString(),
        insight_types: requestedInsights,
        processing_time: comprehensiveInsights.processingTime
      })

    if (storageError) {
      console.warn('Failed to store insights:', storageError)
      // Continue without storing - insights are still returned
    }

    // 8. Log the comprehensive request for audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'comprehensive_patient_insights',
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { 
          request_id: insightRequest.requestId,
          insight_types: requestedInsights,
          processing_time: comprehensiveInsights.processingTime
        }
      })

    // 9. Return comprehensive insights
    return NextResponse.json({
      success: true,
      data: comprehensiveInsights,
      metadata: {
        requestId: insightRequest.requestId,
        processingTime: comprehensiveInsights.processingTime,
        storedInDatabase: !storageError
      }
    })

  } catch (error) {
    console.error('Comprehensive insights API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/patients/[patientId]/insights/comprehensive - Get recent insights
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // 1. Authenticate user
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const since = searchParams.get('since') // ISO date string

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

    // 5. Build query for recent insights
    let query = supabase
      .from('patient_insights')
      .select(`
        id,
        request_id,
        insights_data,
        requested_by,
        request_timestamp,
        insight_types,
        processing_time,
        profiles!patient_insights_requested_by_fkey(first_name, last_name)
      `)
      .eq('patient_id', params.patientId)
      .order('request_timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (since) {
      query = query.gte('request_timestamp', since)
    }

    const { data: recentInsights, error: queryError } = await query

    if (queryError) {
      console.error('Recent insights query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch recent insights' },
        { status: 500 }
      )
    }

    // 6. Format response
    const formattedInsights = recentInsights?.map(insight => ({
      id: insight.id,
      requestId: insight.request_id,
      insightTypes: insight.insight_types,
      requestedBy: {
        name: `${insight.profiles?.first_name || ''} ${insight.profiles?.last_name || ''}`.trim(),
        id: insight.requested_by
      },
      requestTimestamp: insight.request_timestamp,
      processingTime: insight.processing_time,
      summary: {
        riskScore: insight.insights_data?.riskAssessment?.overallRiskScore || null,
        alertCount: insight.insights_data?.alerts?.totalAlerts || 0,
        recommendationCount: insight.insights_data?.recommendations?.length || 0,
        confidence: insight.insights_data?.confidence || null
      },
      fullInsights: insight.insights_data // Include full data for detailed view
    })) || []

    // 7. Log the request
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'patient_insights_history_accessed',
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { 
          limit,
          offset,
          since,
          results_count: formattedInsights.length
        }
      })

    return NextResponse.json({
      success: true,
      data: formattedInsights,
      metadata: {
        total: formattedInsights.length,
        limit,
        offset,
        hasMore: formattedInsights.length === limit
      }
    })

  } catch (error) {
    console.error('Recent insights API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}