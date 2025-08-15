import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

const accuracyAnalysisSchema = z.object({
  clinicId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  modelType: z
    .enum([
      'exponential_smoothing',
      'seasonal_decomposition',
      'linear_regression',
      'moving_average',
    ])
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      clinicId: searchParams.get('clinicId'),
      itemId: searchParams.get('itemId') || undefined,
      period: searchParams.get('period') || '30d',
      modelType: searchParams.get('modelType') || undefined,
    };

    const validation = accuracyAnalysisSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { clinicId, itemId, period, modelType } = validation.data;

    // Calculate date range
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays[period]);

    const supabase = await createClient();

    // Get forecast accuracy history
    let query = supabase
      .from('forecast_accuracy_log')
      .select(`
        *,
        inventory_items (
          name,
          category
        )
      `)
      .eq('clinic_id', clinicId)
      .gte('forecast_date', startDate.toISOString())
      .order('forecast_date', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    if (modelType) {
      query = query.eq('model_used', modelType);
    }

    const { data: accuracyData, error } = await query;
    if (error) {
      throw error;
    }

    // Calculate aggregate statistics
    const stats = calculateAccuracyStatistics(accuracyData || []);

    // Group by model type
    const byModel = groupAccuracyByModel(accuracyData || []);

    // Group by item category
    const byCategory = groupAccuracyByCategory(accuracyData || []);

    // Calculate trends
    const trends = calculateAccuracyTrends(accuracyData || [], period);

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalForecasts: accuracyData?.length || 0,
        overallStatistics: stats,
        byModel,
        byCategory,
        trends,
        recommendations: generateAccuracyRecommendations(
          stats,
          byModel,
          trends
        ),
      },
    });
  } catch (error) {
    console.error('Accuracy analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze forecast accuracy' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Log new forecast accuracy data
    const { data, error } = await supabase
      .from('forecast_accuracy_log')
      .insert({
        clinic_id: body.clinicId,
        item_id: body.itemId,
        forecast_date: body.forecastDate,
        forecast_period: body.forecastPeriod,
        predicted_demand: body.predictedDemand,
        actual_demand: body.actualDemand,
        accuracy_percentage: body.accuracyPercentage,
        mape: body.mape,
        rmse: body.rmse,
        model_used: body.modelUsed,
        confidence_level: body.confidenceLevel,
        within_confidence_interval: body.withinConfidenceInterval,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Failed to log forecast accuracy:', error);
    return NextResponse.json(
      { error: 'Failed to log accuracy data' },
      { status: 500 }
    );
  }
}

function calculateAccuracyStatistics(data: any[]) {
  if (data.length === 0) {
    return {
      averageAccuracy: 0,
      averageMAPE: 0,
      averageRMSE: 0,
      confidenceIntervalHitRate: 0,
      totalForecasts: 0,
    };
  }

  const accuracies = data
    .map((d) => d.accuracy_percentage)
    .filter((a) => a !== null);
  const mapes = data.map((d) => d.mape).filter((m) => m !== null);
  const rmses = data.map((d) => d.rmse).filter((r) => r !== null);
  const confidenceHits = data.filter(
    (d) => d.within_confidence_interval === true
  ).length;

  return {
    averageAccuracy:
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length,
    averageMAPE: mapes.reduce((sum, mape) => sum + mape, 0) / mapes.length,
    averageRMSE: rmses.reduce((sum, rmse) => sum + rmse, 0) / rmses.length,
    confidenceIntervalHitRate: confidenceHits / data.length,
    totalForecasts: data.length,
  };
}

function groupAccuracyByModel(data: any[]) {
  const byModel: Record<string, any> = {};

  data.forEach((item) => {
    const model = item.model_used;
    if (!byModel[model]) {
      byModel[model] = [];
    }
    byModel[model].push(item);
  });

  // Calculate statistics for each model
  Object.keys(byModel).forEach((model) => {
    const modelData = byModel[model];
    byModel[model] = {
      forecasts: modelData,
      statistics: calculateAccuracyStatistics(modelData),
      usage: modelData.length,
    };
  });

  return byModel;
}

function groupAccuracyByCategory(data: any[]) {
  const byCategory: Record<string, any> = {};

  data.forEach((item) => {
    const category = item.inventory_items?.category || 'Unknown';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(item);
  });

  // Calculate statistics for each category
  Object.keys(byCategory).forEach((category) => {
    const categoryData = byCategory[category];
    byCategory[category] = {
      forecasts: categoryData,
      statistics: calculateAccuracyStatistics(categoryData),
      itemCount: new Set(categoryData.map((d) => d.item_id)).size,
    };
  });

  return byCategory;
}

function calculateAccuracyTrends(data: any[], _period: string) {
  // Group by week for trend analysis
  const weeklyData = new Map<string, any[]>();

  data.forEach((item) => {
    const date = new Date(item.forecast_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, []);
    }
    weeklyData.get(weekKey)?.push(item);
  });

  // Calculate weekly averages
  const weeklyStats = Array.from(weeklyData.entries())
    .map(([week, items]) => ({
      week,
      ...calculateAccuracyStatistics(items),
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Calculate trend direction
  const recentWeeks = weeklyStats.slice(-4); // Last 4 weeks
  const earlyWeeks = weeklyStats.slice(0, 4); // First 4 weeks

  const recentAvgAccuracy =
    recentWeeks.reduce((sum, w) => sum + w.averageAccuracy, 0) /
    recentWeeks.length;
  const earlyAvgAccuracy =
    earlyWeeks.reduce((sum, w) => sum + w.averageAccuracy, 0) /
    earlyWeeks.length;

  return {
    weeklyStats,
    trend: {
      direction:
        recentAvgAccuracy > earlyAvgAccuracy ? 'improving' : 'declining',
      change: recentAvgAccuracy - earlyAvgAccuracy,
      isSignificant: Math.abs(recentAvgAccuracy - earlyAvgAccuracy) > 0.05, // 5% threshold
    },
  };
}

function generateAccuracyRecommendations(
  overallStats: any,
  byModel: any,
  trends: any
): string[] {
  const recommendations: string[] = [];

  // Overall accuracy recommendations
  if (overallStats.averageAccuracy < 0.7) {
    recommendations.push(
      'Overall forecast accuracy is below 70% - consider reviewing forecasting parameters and data quality'
    );
  }

  if (overallStats.confidenceIntervalHitRate < 0.8) {
    recommendations.push(
      'Confidence intervals are not performing well - consider adjusting confidence levels or improving uncertainty estimates'
    );
  }

  // Model performance recommendations
  const modelPerformance = Object.entries(byModel)
    .map(([model, data]: [string, any]) => ({
      model,
      accuracy: data.statistics.averageAccuracy,
      usage: data.usage,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  if (modelPerformance.length > 1) {
    const bestModel = modelPerformance[0];
    const worstModel = modelPerformance.at(-1);

    if (bestModel.accuracy - worstModel.accuracy > 0.1) {
      recommendations.push(
        `Consider using ${bestModel.model} more frequently - it shows ${Math.round((bestModel.accuracy - worstModel.accuracy) * 100)}% better accuracy than ${worstModel.model}`
      );
    }
  }

  // Trend recommendations
  if (trends.trend.direction === 'declining' && trends.trend.isSignificant) {
    recommendations.push(
      'Forecast accuracy is declining over time - review data quality and model parameters'
    );
  } else if (
    trends.trend.direction === 'improving' &&
    trends.trend.isSignificant
  ) {
    recommendations.push(
      'Forecast accuracy is improving - current approach is working well'
    );
  }

  return recommendations;
}
