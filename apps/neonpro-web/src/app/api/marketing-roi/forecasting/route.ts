import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MarketingROIService } from '@/app/lib/services/marketing-roi-service'
import { 
  MarketingForecastRequest,
  MarketingForecastResponse,
  MarketingForecastType,
  MarketingForecastPeriod
} from '@/app/types/marketing-roi'

const marketingROIService = new MarketingROIService()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const forecastType = searchParams.get('type') as MarketingForecastType || 'roi'
    const period = searchParams.get('period') as MarketingForecastPeriod || '90d'
    const campaignIds = searchParams.get('campaignIds')?.split(',').filter(Boolean)
    const treatmentIds = searchParams.get('treatmentIds')?.split(',').filter(Boolean)

    const requestData: MarketingForecastRequest = {
      type: forecastType,
      period,
      campaignIds,
      treatmentIds,
      includeConfidenceInterval: searchParams.get('includeConfidenceInterval') === 'true',
      includeScenarios: searchParams.get('includeScenarios') === 'true'
    }

    const forecast = await marketingROIService.generateMarketingForecast(requestData)

    const response: MarketingForecastResponse = {
      forecast,
      metadata: {
        forecastType,
        period,
        generatedAt: new Date().toISOString(),
        dataPointsUsed: forecast.historicalData?.length || 0,
        confidenceLevel: forecast.confidenceLevel || 0.95
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Marketing forecast error:', error)
    return NextResponse.json(
      { error: 'Failed to generate marketing forecast' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestData: MarketingForecastRequest = await request.json()

    // Validate request data
    if (!requestData.type || !requestData.period) {
      return NextResponse.json(
        { error: 'Forecast type and period are required' },
        { status: 400 }
      )
    }

    const forecast = await marketingROIService.generateMarketingForecast(requestData)

    // Generate additional insights for POST requests
    const insights = await marketingROIService.generateForecastInsights({
      forecast,
      includeRecommendations: true,
      includeRiskAssessment: true
    })

    const response: MarketingForecastResponse = {
      forecast,
      insights,
      metadata: {
        forecastType: requestData.type,
        period: requestData.period,
        generatedAt: new Date().toISOString(),
        dataPointsUsed: forecast.historicalData?.length || 0,
        confidenceLevel: forecast.confidenceLevel || 0.95,
        accuracy: forecast.accuracy
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Marketing forecast generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate detailed marketing forecast' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { forecastId, actualResults, feedback } = await request.json()

    if (!forecastId || !actualResults) {
      return NextResponse.json(
        { error: 'Forecast ID and actual results are required' },
        { status: 400 }
      )
    }

    // Update forecast accuracy based on actual results
    const updatedForecast = await marketingROIService.updateForecastAccuracy(
      forecastId,
      actualResults,
      feedback
    )

    // Recalibrate forecasting model if needed
    const recalibrationResult = await marketingROIService.recalibrateForecastModel(
      forecastId,
      actualResults
    )

    return NextResponse.json({
      success: true,
      updatedForecast,
      recalibrationResult
    })

  } catch (error) {
    console.error('Marketing forecast update error:', error)
    return NextResponse.json(
      { error: 'Failed to update marketing forecast' },
      { status: 500 }
    )
  }
}
