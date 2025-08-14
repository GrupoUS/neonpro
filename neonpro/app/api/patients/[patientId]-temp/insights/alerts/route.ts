// Story 3.2: API Endpoint - Patient Alerts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PatientInsightsIntegration } from '@/lib/ai/patient-insights'

const patientInsights = new PatientInsightsIntegration()

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate patient access
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', params.patientId)
      .single()

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Monitor patient alerts
    const alertSummary = await patientInsights.monitorPatientAlerts(params.patientId)

    return NextResponse.json({
      success: true,
      data: alertSummary
    })

  } catch (error) {
    console.error('Patient alerts API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve patient alerts' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alertTypes = [], severityFilter = null } = body

    // Get detailed alerts with filters
    const alertSummary = await patientInsights.monitorPatientAlerts(params.patientId)

    // Apply filters
    let filteredAlerts = alertSummary.alerts

    if (alertTypes.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alertTypes.includes(alert.type)
      )
    }

    if (severityFilter) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.severity === severityFilter
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...alertSummary,
        alerts: filteredAlerts,
        totalFiltered: filteredAlerts.length
      }
    })

  } catch (error) {
    console.error('Patient alerts POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve filtered alerts' },
      { status: 500 }
    )
  }
}