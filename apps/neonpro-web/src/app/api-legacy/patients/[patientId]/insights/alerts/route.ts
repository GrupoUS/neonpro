// API Route: Patient Insights - Alerts Monitoring
// Story 3.2: Task 8 - API Endpoints

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

// GET /api/patients/[patientId]/insights/alerts
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') // high, medium, low
    const category = searchParams.get('category') // risk, behavior, health, general
    const active = searchParams.get('active') === 'true'

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

    // 5. Monitor patient alerts
    const alertSummary = await patientInsights.monitorPatientAlerts(params.patientId)

    // 6. Filter alerts based on query parameters
    let filteredAlerts = alertSummary.alerts

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }

    if (category) {
      filteredAlerts = filteredAlerts.filter(alert => alert.category === category)
    }

    if (active) {
      // Filter only active alerts (not acknowledged or resolved)
      filteredAlerts = filteredAlerts.filter(alert => !alert.acknowledged && !alert.resolved)
    }

    // 7. Get acknowledgment status from database
    const { data: alertStatuses } = await supabase
      .from('patient_alert_status')
      .select('alert_id, acknowledged_by, acknowledged_at, resolved_by, resolved_at, notes')
      .eq('patient_id', params.patientId)

    // 8. Merge alert status information
    const alertsWithStatus = filteredAlerts.map(alert => {
      const status = alertStatuses?.find(s => s.alert_id === alert.id)
      return {
        ...alert,
        acknowledged: !!status?.acknowledged_by,
        acknowledgedBy: status?.acknowledged_by,
        acknowledgedAt: status?.acknowledged_at,
        resolved: !!status?.resolved_by,
        resolvedBy: status?.resolved_by,
        resolvedAt: status?.resolved_at,
        notes: status?.notes
      }
    })

    // 9. Update summary counts based on filtered results
    const filteredSummary = {
      ...alertSummary,
      totalAlerts: alertsWithStatus.length,
      criticalAlerts: alertsWithStatus.filter(a => a.severity === 'high').length,
      warningAlerts: alertsWithStatus.filter(a => a.severity === 'medium').length,
      infoAlerts: alertsWithStatus.filter(a => a.severity === 'low').length,
      alerts: alertsWithStatus
    }

    // 10. Log the request
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: 'patient_alerts_monitored',
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { 
          filters: { severity, category, active },
          alert_count: alertsWithStatus.length
        }
      })

    return NextResponse.json({
      success: true,
      data: filteredSummary
    })

  } catch (error) {
    console.error('Patient alerts monitoring API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/patients/[patientId]/insights/alerts - Acknowledge or resolve alerts
export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Validate request body
    const body = await request.json()
    const { alertId, action, notes } = body // action: 'acknowledge' | 'resolve'

    if (!alertId || !action || !['acknowledge', 'resolve'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. alertId and action (acknowledge/resolve) required' },
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

    // 5. Update alert status
    const updateData: any = {
      patient_id: params.patientId,
      alert_id: alertId,
      notes: notes || null,
      updated_at: new Date().toISOString()
    }

    if (action === 'acknowledge') {
      updateData.acknowledged_by = session.user.id
      updateData.acknowledged_at = new Date().toISOString()
    } else if (action === 'resolve') {
      updateData.resolved_by = session.user.id
      updateData.resolved_at = new Date().toISOString()
      // Also acknowledge if not already acknowledged
      updateData.acknowledged_by = session.user.id
      updateData.acknowledged_at = new Date().toISOString()
    }

    const { data: alertStatus, error: statusError } = await supabase
      .from('patient_alert_status')
      .upsert(updateData)
      .select()

    if (statusError) {
      console.error('Alert status update error:', statusError)
      return NextResponse.json(
        { error: 'Failed to update alert status' },
        { status: 500 }
      )
    }

    // 6. Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: session.user.id,
        action: `patient_alert_${action}`,
        resource_type: 'patient',
        resource_id: params.patientId,
        details: { 
          alert_id: alertId,
          action,
          notes
        }
      })

    // 7. Get updated alert summary
    const updatedAlerts = await patientInsights.monitorPatientAlerts(params.patientId)

    return NextResponse.json({
      success: true,
      data: {
        alertStatus: alertStatus?.[0],
        updatedSummary: updatedAlerts
      },
      message: `Alert ${action}d successfully`
    })

  } catch (error) {
    console.error('Alert status update API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}