import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const dashboardParamsSchema = z.object({
  clinicId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const params = dashboardParamsSchema.parse({
      clinicId: searchParams.get('clinicId'),
      period: searchParams.get('period') || '30d',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    })

    // Calculate date range based on period
    let startDate: Date
    let endDate: Date = new Date()

    if (params.period === 'custom' && params.startDate && params.endDate) {
      startDate = new Date(params.startDate)
      endDate = new Date(params.endDate)
    } else {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[params.period] || 30

      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', params.clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    // Get current active alerts
    const { data: alertsData, error: alertsError } = await supabase
      .from('stock_alerts')
      .select('alert_type, severity_level, status, created_at')
      .eq('clinic_id', params.clinicId)
      .eq('status', 'active')

    if (alertsError) {
      console.error('Alerts Error:', alertsError)
      return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 })
    }

    // Get historical alerts for trend analysis
    const { data: historicalAlertsData, error: historicalError } = await supabase
      .from('stock_alerts')
      .select('alert_type, severity_level, created_at')
      .eq('clinic_id', params.clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (historicalError) {
      console.error('Historical Alerts Error:', historicalError)
      return NextResponse.json({ error: 'Erro ao buscar histórico de alertas' }, { status: 500 })
    }

    // Group alerts by type
    const alertsByType = new Map()
    const alertTypes = ['low_stock', 'expiring', 'expired', 'overstock']

    // Initialize with zeros
    alertTypes.forEach(type => {
      alertsByType.set(type, {
        type,
        count: 0,
        severity: 'low' as const,
        trend: 'stable' as const,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0
      })
    })

    // Count current alerts
    alertsData?.forEach(alert => {
      if (alertsByType.has(alert.alert_type)) {
        const typeData = alertsByType.get(alert.alert_type)
        typeData.count++
        
        // Count by severity
        switch (alert.severity_level) {
          case 'critical':
            typeData.criticalCount++
            break
          case 'high':
            typeData.highCount++
            break
          case 'medium':
            typeData.mediumCount++
            break
          case 'low':
            typeData.lowCount++
            break
        }

        // Determine overall severity for this type
        if (typeData.criticalCount > 0) {
          typeData.severity = 'critical'
        } else if (typeData.highCount > 0) {
          typeData.severity = 'high'
        } else if (typeData.mediumCount > 0) {
          typeData.severity = 'medium'
        } else {
          typeData.severity = 'low'
        }
      }
    })

    // Calculate trends based on historical data
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    const previousPeriodEnd = startDate

    const currentPeriodCounts = new Map()
    const previousPeriodCounts = new Map()

    alertTypes.forEach(type => {
      currentPeriodCounts.set(type, 0)
      previousPeriodCounts.set(type, 0)
    })

    // Count alerts in current period
    historicalAlertsData?.forEach(alert => {
      const alertDate = new Date(alert.created_at)
      if (alertDate >= startDate && alertDate <= endDate) {
        const current = currentPeriodCounts.get(alert.alert_type) || 0
        currentPeriodCounts.set(alert.alert_type, current + 1)
      }
    })

    // Get previous period data for trend calculation
    const { data: previousPeriodData } = await supabase
      .from('stock_alerts')
      .select('alert_type, created_at')
      .eq('clinic_id', params.clinicId)
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', previousPeriodEnd.toISOString())

    previousPeriodData?.forEach(alert => {
      const previous = previousPeriodCounts.get(alert.alert_type) || 0
      previousPeriodCounts.set(alert.alert_type, previous + 1)
    })

    // Calculate trends
    alertsByType.forEach((typeData, type) => {
      const currentCount = currentPeriodCounts.get(type) || 0
      const previousCount = previousPeriodCounts.get(type) || 0

      if (previousCount === 0) {
        typeData.trend = currentCount > 0 ? 'up' : 'stable'
      } else {
        const change = ((currentCount - previousCount) / previousCount) * 100
        if (change > 10) {
          typeData.trend = 'up'
        } else if (change < -10) {
          typeData.trend = 'down'
        } else {
          typeData.trend = 'stable'
        }
      }
    })

    const alertsSummary = Array.from(alertsByType.values())

    // Calculate overall metrics
    const totalActiveAlerts = alertsData?.length || 0
    const criticalAlerts = alertsData?.filter(alert => alert.severity_level === 'critical').length || 0
    const highAlerts = alertsData?.filter(alert => alert.severity_level === 'high').length || 0

    return NextResponse.json({
      success: true,
      data: alertsSummary,
      metadata: {
        period: params.period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        clinicId: params.clinicId,
        totalActiveAlerts,
        criticalAlerts,
        highAlerts,
        totalHistoricalAlerts: historicalAlertsData?.length || 0
      }
    })

  } catch (error) {
    console.error('Dashboard Alerts Summary API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
