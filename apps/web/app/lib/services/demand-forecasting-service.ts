// Demand Forecasting Engine - Advanced Predictive Analytics
// Part of Epic 6: Inventory Management - Story 6.2 Task 4
import { createClient } from '@/app/utils/supabase/server';

// Forecasting Data Types
interface ForecastInput {
  itemId: string;
  clinicId: string;
  forecastPeriod: number; // days
  confidenceLevel: number; // 0.80, 0.90, 0.95
}

interface ForecastResult {
  itemId: string;
  itemName: string;
  forecastPeriod: number;
  predictedDemand: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number;
  };
  seasonalFactors: number[];
  trendComponent: number;
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    lastPeriodAccuracy: number;
  };
  recommendations: string[];
  modelUsed:
    | 'exponential_smoothing'
    | 'seasonal_decomposition'
    | 'linear_regression'
    | 'moving_average';
}

interface SeasonalPattern {
  pattern: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  strength: number; // 0-1, onde 1 = padrão muito forte
  peaks: number[]; // Períodos de pico
  valleys: number[]; // Períodos de baixa
}

interface ConsumptionData {
  date: Date;
  quantity: number;
  type: 'consumption' | 'appointment_based' | 'emergency' | 'routine';
  context?: string;
}

export class DemandForecastingService {
  private async getSupabase() {
    return await createClient();
  }

  // ===============================================================================
  // HISTORICAL DATA COLLECTION
  // ===============================================================================

  /**
   * Get historical consumption data with context
   */
  async getHistoricalConsumption(
    itemId: string,
    clinicId: string,
    daysBack = 365
  ): Promise<ConsumptionData[]> {
    const supabase = await this.getSupabase();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data: transactions, error } = await supabase
      .from('inventory_transactions')
      .select(`
        quantity,
        created_at,
        transaction_type,
        transaction_context,
        appointment_id
      `)
      .eq('item_id', itemId)
      .eq('clinic_id', clinicId)
      .eq('transaction_type', 'consumption')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (
      transactions?.map((tx) => ({
        date: new Date(tx.created_at),
        quantity: Math.abs(tx.quantity),
        type: this.categorizeConsumption(
          tx.transaction_context,
          tx.appointment_id
        ),
        context: tx.transaction_context,
      })) || []
    );
  }

  /**
   * Get appointment-based demand data
   */
  async getAppointmentBasedDemand(
    itemId: string,
    clinicId: string,
    daysBack = 365
  ): Promise<
    Array<{
      date: Date;
      procedureType: string;
      expectedConsumption: number;
      actualConsumption?: number;
    }>
  > {
    const supabase = await this.getSupabase();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Obter agendamentos com consumo associado
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        date,
        procedure_type,
        status,
        inventory_usage (
          item_id,
          quantity_used
        )
      `)
      .eq('clinic_id', clinicId)
      .gte('date', startDate.toISOString())
      .in('status', ['completed', 'in_progress'])
      .order('date', { ascending: true });

    if (error) throw error;

    return (
      appointments
        ?.map((apt) => ({
          date: new Date(apt.date),
          procedureType: apt.procedure_type,
          expectedConsumption: this.getExpectedConsumptionForProcedure(
            apt.procedure_type,
            itemId
          ),
          actualConsumption: apt.inventory_usage?.find(
            (usage: any) => usage.item_id === itemId
          )?.quantity_used,
        }))
        .filter((item) => item.expectedConsumption > 0) || []
    );
  }

  // ===============================================================================
  // SEASONAL PATTERN ANALYSIS
  // ===============================================================================

  /**
   * Analyze seasonal patterns in consumption data
   */
  analyzeSeasonalPatterns(
    consumptionData: ConsumptionData[]
  ): SeasonalPattern[] {
    if (consumptionData.length < 30) return []; // Dados insuficientes

    const patterns: SeasonalPattern[] = [];

    // Análise de padrão semanal
    const weeklyPattern = this.analyzeWeeklyPattern(consumptionData);
    if (weeklyPattern.strength > 0.3) {
      patterns.push(weeklyPattern);
    }

    // Análise de padrão mensal
    const monthlyPattern = this.analyzeMonthlyPattern(consumptionData);
    if (monthlyPattern.strength > 0.3) {
      patterns.push(monthlyPattern);
    }

    // Análise de padrão anual (se temos dados suficientes)
    if (consumptionData.length >= 365) {
      const annualPattern = this.analyzeAnnualPattern(consumptionData);
      if (annualPattern.strength > 0.3) {
        patterns.push(annualPattern);
      }
    }

    return patterns.sort((a, b) => b.strength - a.strength);
  }

  private analyzeWeeklyPattern(data: ConsumptionData[]): SeasonalPattern {
    const weeklyData = new Array(7).fill(0).map(() => ({ total: 0, count: 0 }));

    data.forEach((item) => {
      const dayOfWeek = item.date.getDay();
      weeklyData[dayOfWeek].total += item.quantity;
      weeklyData[dayOfWeek].count += 1;
    });

    const weeklyAverages = weeklyData.map((day) =>
      day.count > 0 ? day.total / day.count : 0
    );
    const overallAverage =
      weeklyAverages.reduce((sum, val) => sum + val, 0) / 7;

    // Calcular força do padrão (variação em relação à média)
    const variance =
      weeklyAverages.reduce(
        (sum, val) => sum + (val - overallAverage) ** 2,
        0
      ) / 7;
    const strength = Math.min(Math.sqrt(variance) / overallAverage, 1);

    // Identificar picos e vales
    const peaks = weeklyAverages
      .map((val, idx) => ({ idx, val }))
      .filter((item) => item.val > overallAverage * 1.2)
      .map((item) => item.idx);

    const valleys = weeklyAverages
      .map((val, idx) => ({ idx, val }))
      .filter((item) => item.val < overallAverage * 0.8)
      .map((item) => item.idx);

    return {
      pattern: 'weekly',
      strength,
      peaks,
      valleys,
    };
  }

  private analyzeMonthlyPattern(data: ConsumptionData[]): SeasonalPattern {
    const monthlyData = new Array(12)
      .fill(0)
      .map(() => ({ total: 0, count: 0 }));

    data.forEach((item) => {
      const month = item.date.getMonth();
      monthlyData[month].total += item.quantity;
      monthlyData[month].count += 1;
    });

    const monthlyAverages = monthlyData.map((month) =>
      month.count > 0 ? month.total / month.count : 0
    );
    const overallAverage =
      monthlyAverages.reduce((sum, val) => sum + val, 0) / 12;

    // Filtrar meses sem dados
    const validMonths = monthlyAverages.filter((val) => val > 0);
    if (validMonths.length < 6) {
      return { pattern: 'monthly', strength: 0, peaks: [], valleys: [] };
    }

    const variance =
      monthlyAverages.reduce(
        (sum, val) => sum + (val - overallAverage) ** 2,
        0
      ) / 12;
    const strength = Math.min(Math.sqrt(variance) / overallAverage, 1);

    const peaks = monthlyAverages
      .map((val, idx) => ({ idx, val }))
      .filter((item) => item.val > overallAverage * 1.3)
      .map((item) => item.idx);

    const valleys = monthlyAverages
      .map((val, idx) => ({ idx, val }))
      .filter((item) => item.val < overallAverage * 0.7)
      .map((item) => item.idx);

    return {
      pattern: 'monthly',
      strength,
      peaks,
      valleys,
    };
  }

  private analyzeAnnualPattern(data: ConsumptionData[]): SeasonalPattern {
    // Agrupar por trimestre
    const quarterlyData = new Array(4)
      .fill(0)
      .map(() => ({ total: 0, count: 0 }));

    data.forEach((item) => {
      const quarter = Math.floor(item.date.getMonth() / 3);
      quarterlyData[quarter].total += item.quantity;
      quarterlyData[quarter].count += 1;
    });

    const quarterlyAverages = quarterlyData.map((q) =>
      q.count > 0 ? q.total / q.count : 0
    );
    const overallAverage =
      quarterlyAverages.reduce((sum, val) => sum + val, 0) / 4;

    const variance =
      quarterlyAverages.reduce(
        (sum, val) => sum + (val - overallAverage) ** 2,
        0
      ) / 4;
    const strength = Math.min(Math.sqrt(variance) / overallAverage, 1);

    const peaks = quarterlyAverages
      .map((val, idx) => ({ idx, val }))
      .filter((item) => item.val > overallAverage * 1.4)
      .map((item) => item.idx);

    const valleys = quarterlyAverages
      .map((val, idx) => ({ idx, val }))
      .filter((item) => item.val < overallAverage * 0.6)
      .map((item) => item.idx);

    return {
      pattern: 'quarterly',
      strength,
      peaks,
      valleys,
    };
  }

  // ===============================================================================
  // DEMAND FORECASTING ALGORITHMS
  // ===============================================================================

  /**
   * Generate demand forecast using multiple algorithms
   */
  async generateDemandForecast(input: ForecastInput): Promise<ForecastResult> {
    const supabase = await this.getSupabase();

    // Obter dados históricos
    const historicalData = await this.getHistoricalConsumption(
      input.itemId,
      input.clinicId,
      Math.max(input.forecastPeriod * 4, 365) // Pelo menos 4x o período ou 1 ano
    );

    if (historicalData.length < 30) {
      throw new Error('Insufficient historical data for forecasting');
    }

    // Obter informações do item
    const { data: itemData, error } = await supabase
      .from('inventory_items')
      .select('name, category')
      .eq('id', input.itemId)
      .single();

    if (error) throw error;

    // Analisar padrões sazonais
    const seasonalPatterns = this.analyzeSeasonalPatterns(historicalData);

    // Preparar dados para previsão
    const timeSeriesData = this.prepareTimeSeriesData(
      historicalData,
      input.forecastPeriod
    );

    // Aplicar diferentes algoritmos e escolher o melhor
    const forecasts = {
      exponentialSmoothing: this.exponentialSmoothingForecast(
        timeSeriesData,
        input.forecastPeriod
      ),
      seasonalDecomposition: this.seasonalDecompositionForecast(
        timeSeriesData,
        seasonalPatterns,
        input.forecastPeriod
      ),
      movingAverage: this.movingAverageForecast(
        timeSeriesData,
        input.forecastPeriod
      ),
      linearRegression: this.linearRegressionForecast(
        timeSeriesData,
        input.forecastPeriod
      ),
    };

    // Selecionar melhor modelo baseado na precisão histórica
    const bestModelKey = this.selectBestModelKey(forecasts, timeSeriesData);
    const bestModel = this.mapModelKeyToEnum(bestModelKey as string);
    const selectedForecast = (forecasts as any)[bestModelKey];

    // Calcular intervalo de confiança
    const confidenceInterval = this.calculateConfidenceInterval(
      selectedForecast.prediction,
      selectedForecast.errorEstimate,
      input.confidenceLevel
    );

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      selectedForecast,
      seasonalPatterns,
      input.forecastPeriod
    );

    return {
      itemId: input.itemId,
      itemName: itemData.name,
      forecastPeriod: input.forecastPeriod,
      predictedDemand: Math.round(selectedForecast.prediction),
      confidenceInterval: {
        lower: Math.round(confidenceInterval.lower),
        upper: Math.round(confidenceInterval.upper),
        level: input.confidenceLevel,
      },
      seasonalFactors: selectedForecast.seasonalFactors || [],
      trendComponent: selectedForecast.trend || 0,
      accuracy: {
        mape: selectedForecast.mape || 0,
        rmse: selectedForecast.rmse || 0,
        lastPeriodAccuracy: selectedForecast.lastPeriodAccuracy || 0,
      },
      recommendations,
      modelUsed: bestModel,
    };
  }

  // ===============================================================================
  // FORECASTING ALGORITHMS IMPLEMENTATION
  // ===============================================================================

  private exponentialSmoothingForecast(data: number[], periods: number) {
    const alpha = 0.3; // Smoothing parameter
    let smoothed = data[0];
    const smoothedValues = [smoothed];

    // Calculate smoothed values
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
      smoothedValues.push(smoothed);
    }

    // Forecast future periods
    const prediction = smoothed * periods; // Simplified
    const errorEstimate = this.calculateForecastError(data, smoothedValues);

    return {
      prediction,
      errorEstimate,
      trend: this.calculateTrend(smoothedValues),
      mape: this.calculateMAPE(data, smoothedValues),
      rmse: this.calculateRMSE(data, smoothedValues),
      lastPeriodAccuracy: this.calculateLastPeriodAccuracy(
        data,
        smoothedValues
      ),
    };
  }

  private seasonalDecompositionForecast(
    data: number[],
    patterns: SeasonalPattern[],
    periods: number
  ) {
    // Decompose into trend, seasonal, and residual components
    const trend = this.extractTrend(data);
    const seasonal = this.extractSeasonal(data, patterns);

    // Project trend forward
    const trendForecast = this.projectTrend(trend, periods);

    // Apply seasonal adjustments
    const seasonalAdjustment = this.getSeasonalAdjustment(patterns, periods);
    const prediction = trendForecast * seasonalAdjustment;

    const errorEstimate = this.calculateDecompositionError(
      data,
      trend,
      seasonal
    );

    return {
      prediction,
      errorEstimate,
      trend: this.calculateTrend(trend),
      seasonalFactors: seasonal,
      mape: this.calculateMAPE(data, trend),
      rmse: this.calculateRMSE(data, trend),
      lastPeriodAccuracy: 0.85, // Placeholder
    };
  }

  private movingAverageForecast(data: number[], periods: number) {
    const window = Math.min(7, Math.floor(data.length / 4)); // 7-day or 25% of data
    const recentData = data.slice(-window);
    const average =
      recentData.reduce((sum, val) => sum + val, 0) / recentData.length;

    const prediction = average * periods;
    const errorEstimate = this.calculateMovingAverageError(data, window);

    return {
      prediction,
      errorEstimate,
      trend: this.calculateTrend(data.slice(-window * 2)),
      mape: this.calculateMovingAverageMAPE(data, window),
      rmse: this.calculateMovingAverageRMSE(data, window),
      lastPeriodAccuracy: 0.8, // Simplified
    };
  }

  private linearRegressionForecast(data: number[], periods: number) {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = data;

    // Calculate regression coefficients
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, idx) => sum + val * y[idx], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast
    const nextPoint = n + periods;
    const prediction = slope * nextPoint + intercept;

    // Calculate error
    const fitted = x.map((val) => slope * val + intercept);
    const errorEstimate = this.calculateRMSE(y, fitted);

    return {
      prediction: Math.max(0, prediction), // Não pode ser negativo
      errorEstimate,
      trend: slope,
      mape: this.calculateMAPE(y, fitted),
      rmse: errorEstimate,
      lastPeriodAccuracy: 0.75, // Simplified
    };
  }

  // ===============================================================================
  // HELPER METHODS
  // ===============================================================================

  private categorizeConsumption(
    context?: string,
    appointmentId?: string
  ): ConsumptionData['type'] {
    if (appointmentId) return 'appointment_based';
    if (context?.includes('emergency')) return 'emergency';
    return 'routine';
  }

  private getExpectedConsumptionForProcedure(
    procedureType: string,
    _itemId: string
  ): number {
    // This would typically come from a procedure-item mapping table
    // For now, return a simplified estimate
    const consumptionMap: Record<string, number> = {
      facial_treatment: 2,
      laser_therapy: 1,
      botox_application: 3,
      chemical_peel: 4,
      microneedling: 2,
      default: 1,
    };

    return consumptionMap[procedureType] || consumptionMap.default;
  }

  private prepareTimeSeriesData(
    consumption: ConsumptionData[],
    _forecastPeriod: number
  ): number[] {
    // Group by day and sum quantities
    const dailyConsumption = new Map<string, number>();

    consumption.forEach((item) => {
      const dateKey = item.date.toISOString().split('T')[0];
      dailyConsumption.set(
        dateKey,
        (dailyConsumption.get(dateKey) || 0) + item.quantity
      );
    });

    return Array.from(dailyConsumption.values());
  }

  private selectBestModelKey(
    forecasts: any,
    _historicalData: number[]
  ): keyof typeof forecasts {
    // Select model with lowest MAPE
    let bestModel: keyof typeof forecasts = 'movingAverage';
    let lowestMAPE = Number.POSITIVE_INFINITY;

    Object.entries(forecasts).forEach(([model, forecast]: [string, any]) => {
      if (forecast.mape < lowestMAPE) {
        lowestMAPE = forecast.mape;
        bestModel = model as keyof typeof forecasts;
      }
    });

    return bestModel;
  }

  private mapModelKeyToEnum(
    modelKey: string
  ):
    | 'exponential_smoothing'
    | 'seasonal_decomposition'
    | 'linear_regression'
    | 'moving_average' {
    const modelMapping: Record<
      string,
      | 'exponential_smoothing'
      | 'seasonal_decomposition'
      | 'linear_regression'
      | 'moving_average'
    > = {
      exponentialSmoothing: 'exponential_smoothing',
      seasonalDecomposition: 'seasonal_decomposition',
      linearRegression: 'linear_regression',
      movingAverage: 'moving_average',
    };

    return modelMapping[modelKey] || 'moving_average';
  }

  private calculateConfidenceInterval(
    prediction: number,
    errorEstimate: number,
    confidenceLevel: number
  ) {
    // Z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.8: 1.28,
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };

    const zScore = zScores[confidenceLevel] || 1.96;
    const margin = zScore * errorEstimate;

    return {
      lower: Math.max(0, prediction - margin),
      upper: prediction + margin,
    };
  }

  private generateRecommendations(
    forecast: any,
    seasonalPatterns: SeasonalPattern[],
    _forecastPeriod: number
  ): string[] {
    const recommendations: string[] = [];

    // Trend-based recommendations
    if (forecast.trend > 0.1) {
      recommendations.push(
        'Increasing trend detected - consider higher safety stock levels'
      );
    } else if (forecast.trend < -0.1) {
      recommendations.push(
        'Decreasing trend detected - review minimum stock levels'
      );
    }

    // Seasonal recommendations
    seasonalPatterns.forEach((pattern) => {
      if (pattern.strength > 0.5) {
        recommendations.push(
          `Strong ${pattern.pattern} seasonality detected - adjust ordering patterns accordingly`
        );
      }
    });

    // Accuracy recommendations
    if (forecast.mape > 0.3) {
      recommendations.push(
        'High forecast uncertainty - consider more frequent monitoring'
      );
    }

    return recommendations;
  }

  // Error calculation helper methods
  private calculateForecastError(
    actual: number[],
    predicted: number[]
  ): number {
    const errors = actual.map((val, idx) =>
      Math.abs(val - (predicted[idx] || 0))
    );
    return errors.reduce((sum, err) => sum + err, 0) / errors.length;
  }

  private calculateMAPE(actual: number[], predicted: number[]): number {
    const apeSum = actual.reduce((sum, val, idx) => {
      if (val === 0) return sum;
      return sum + Math.abs((val - (predicted[idx] || 0)) / val);
    }, 0);

    return apeSum / actual.length;
  }

  private calculateRMSE(actual: number[], predicted: number[]): number {
    const squaredErrors = actual.map(
      (val, idx) => (val - (predicted[idx] || 0)) ** 2
    );
    const mse =
      squaredErrors.reduce((sum, err) => sum + err, 0) / squaredErrors.length;
    return Math.sqrt(mse);
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.ceil(data.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    return (secondAvg - firstAvg) / firstAvg;
  }

  private calculateLastPeriodAccuracy(
    actual: number[],
    predicted: number[]
  ): number {
    if (actual.length === 0 || predicted.length === 0) return 0;

    const lastActual = actual[actual.length - 1];
    const lastPredicted = predicted[predicted.length - 1] || 0;

    if (lastActual === 0) return 0;
    return 1 - Math.abs((lastActual - lastPredicted) / lastActual);
  }

  // Seasonal decomposition helper methods
  private extractTrend(data: number[]): number[] {
    const window = Math.floor(data.length / 12) || 3;
    const trend: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.ceil(window / 2));
      const slice = data.slice(start, end);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      trend.push(average);
    }

    return trend;
  }

  private extractSeasonal(
    data: number[],
    patterns: SeasonalPattern[]
  ): number[] {
    // Simplified seasonal extraction
    return data.map((_, idx) => {
      let seasonalFactor = 1;

      patterns.forEach((pattern) => {
        if (pattern.pattern === 'weekly') {
          const dayOfWeek = idx % 7;
          if (pattern.peaks.includes(dayOfWeek)) seasonalFactor *= 1.2;
          if (pattern.valleys.includes(dayOfWeek)) seasonalFactor *= 0.8;
        }
      });

      return seasonalFactor;
    });
  }

  private projectTrend(trend: number[], _periods: number): number {
    if (trend.length < 2) return trend[0] || 0;

    const recentTrend = trend.slice(-Math.min(7, trend.length));
    return recentTrend.reduce((sum, val) => sum + val, 0) / recentTrend.length;
  }

  private getSeasonalAdjustment(
    patterns: SeasonalPattern[],
    _periods: number
  ): number {
    // Simplified seasonal adjustment
    const currentPeriod = new Date();
    let adjustment = 1;

    patterns.forEach((pattern) => {
      if (pattern.pattern === 'monthly') {
        const month = currentPeriod.getMonth();
        if (pattern.peaks.includes(month)) adjustment *= 1.2;
        if (pattern.valleys.includes(month)) adjustment *= 0.8;
      }
    });

    return adjustment;
  }

  private calculateDecompositionError(
    data: number[],
    trend: number[],
    seasonal: number[]
  ): number {
    const errors = data.map((val, idx) => {
      const predicted = (trend[idx] || 0) * (seasonal[idx] || 1);
      return Math.abs(val - predicted);
    });

    return errors.reduce((sum, err) => sum + err, 0) / errors.length;
  }

  private calculateMovingAverageError(data: number[], window: number): number {
    if (data.length < window) return 0;

    const errors: number[] = [];
    for (let i = window; i < data.length; i++) {
      const slice = data.slice(i - window, i);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      errors.push(Math.abs(data[i] - average));
    }

    return errors.reduce((sum, err) => sum + err, 0) / errors.length;
  }

  private calculateMovingAverageMAPE(data: number[], window: number): number {
    if (data.length < window) return 0;

    const apes: number[] = [];
    for (let i = window; i < data.length; i++) {
      const slice = data.slice(i - window, i);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      if (data[i] !== 0) {
        apes.push(Math.abs((data[i] - average) / data[i]));
      }
    }

    return apes.reduce((sum, ape) => sum + ape, 0) / apes.length;
  }

  private calculateMovingAverageRMSE(data: number[], window: number): number {
    if (data.length < window) return 0;

    const squaredErrors: number[] = [];
    for (let i = window; i < data.length; i++) {
      const slice = data.slice(i - window, i);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      squaredErrors.push((data[i] - average) ** 2);
    }

    const mse =
      squaredErrors.reduce((sum, err) => sum + err, 0) / squaredErrors.length;
    return Math.sqrt(mse);
  }
}

export const demandForecastingService = new DemandForecastingService();
