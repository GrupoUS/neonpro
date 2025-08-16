/**
 * Time Series Forecasting Engine for NeonPro
 *
 * Advanced forecasting capabilities using machine learning approaches
 * inspired by Python's skforecast library but implemented in TypeScript.
 *
 * Features:
 * - Subscription growth forecasting
 * - Revenue prediction with confidence intervals
 * - Churn rate forecasting
 * - Seasonal adjustment
 * - Multiple time series support
 * - Automated feature engineering
 */

import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Core forecasting types
export type TimeSeriesData = {
  date: string;
  value: number;
  exogenous?: Record<string, number>;
};

export type ForecastResult = {
  date: string;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
};

export type ForecastConfig = {
  metric: 'subscriptions' | 'revenue' | 'churn_rate' | 'mrr' | 'arr';
  horizon: number; // forecast periods ahead
  frequency: 'daily' | 'weekly' | 'monthly';
  includeSeasonality: boolean;
  includeExogenous: boolean;
  confidenceLevel: number; // 0.90, 0.95, 0.99
  modelType: 'linear' | 'polynomial' | 'exponential' | 'seasonal';
};

export type ModelFeatures = {
  lags: number[]; // past values to use as features
  rolling_stats: Array<{
    window: number;
    stats: ('mean' | 'std' | 'min' | 'max')[];
  }>;
  seasonality: {
    weekly: boolean;
    monthly: boolean;
    quarterly: boolean;
  };
  trends: boolean;
  exogenous_vars: string[];
};

// Validation schemas
const forecastConfigSchema = z.object({
  metric: z.enum(['subscriptions', 'revenue', 'churn_rate', 'mrr', 'arr']),
  horizon: z.number().min(1).max(365),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  includeSeasonality: z.boolean().default(true),
  includeExogenous: z.boolean().default(true),
  confidenceLevel: z.number().min(0.8).max(0.99).default(0.95),
  modelType: z
    .enum(['linear', 'polynomial', 'exponential', 'seasonal'])
    .default('seasonal'),
});

export class ForecastingEngine {
  private readonly supabase = createClient();
  private readonly modelCache = new Map<string, any>();

  /**
   * Generate forecasts for subscription metrics
   * Based on skforecast ForecasterRecursive pattern
   */
  async generateForecast(config: ForecastConfig): Promise<ForecastResult[]> {
    const validConfig = forecastConfigSchema.parse(config);

    // Get historical data
    const historicalData = await this.getHistoricalData(
      validConfig.metric,
      validConfig.frequency
    );

    if (historicalData.length < 10) {
      throw new Error(
        'Insufficient historical data for forecasting (minimum 10 data points required)'
      );
    }

    // Prepare features using lag-based approach
    const features = this.generateModelFeatures(validConfig);
    const trainingData = this.prepareTrainingData(historicalData, features);

    // Train or retrieve cached model
    const model = await this.getOrTrainModel(validConfig, trainingData);

    // Generate forecasts
    const forecasts = this.predictFuture(
      model,
      historicalData,
      features,
      validConfig.horizon,
      validConfig.confidenceLevel
    );

    return forecasts;
  }

  /**
   * Multiple time series forecasting
   * Similar to ForecasterRecursiveMultiSeries
   */
  async forecastMultipleSeries(
    metrics: string[],
    config: Omit<ForecastConfig, 'metric'>
  ): Promise<Record<string, ForecastResult[]>> {
    const results: Record<string, ForecastResult[]> = {};

    // Process each metric in parallel
    const forecastPromises = metrics.map(async (metric) => {
      try {
        const seriesConfig = { ...config, metric: metric as any };
        const forecast = await this.generateForecast(seriesConfig);
        return { metric, forecast };
      } catch (_error) {
        return { metric, forecast: [] };
      }
    });

    const forecastResults = await Promise.all(forecastPromises);

    forecastResults.forEach(({ metric, forecast }) => {
      results[metric] = forecast;
    });

    return results;
  }

  /**
   * Scenario analysis - generate forecasts under different conditions
   */
  async generateScenarios(
    config: ForecastConfig,
    scenarios: Array<{
      name: string;
      adjustments: {
        growth_rate?: number;
        seasonality_factor?: number;
        external_factors?: Record<string, number>;
      };
    }>
  ): Promise<Record<string, ForecastResult[]>> {
    const scenarioResults: Record<string, ForecastResult[]> = {};

    // Generate baseline forecast
    const baselineForecast = await this.generateForecast(config);
    scenarioResults.baseline = baselineForecast;

    // Generate scenario-based forecasts
    for (const scenario of scenarios) {
      const adjustedForecast = this.applyScenarioAdjustments(
        baselineForecast,
        scenario.adjustments
      );
      scenarioResults[scenario.name] = adjustedForecast;
    }

    return scenarioResults;
  }

  /**
   * Forecast accuracy evaluation using backtesting
   * Similar to skforecast backtesting_forecaster
   */
  async evaluateForecastAccuracy(
    config: ForecastConfig,
    backtestPeriods = 4
  ): Promise<{
    mae: number; // Mean Absolute Error
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    accuracy_score: number;
    predictions: Array<{ actual: number; predicted: number; date: string }>;
  }> {
    // Get extended historical data for backtesting
    const historicalData = await this.getHistoricalData(
      config.metric,
      config.frequency,
      true // extended data
    );

    const predictions = [];
    const errors = [];

    // Perform time series cross-validation
    for (let i = 0; i < backtestPeriods; i++) {
      const splitPoint =
        historicalData.length - (backtestPeriods - i) * config.horizon;
      const trainData = historicalData.slice(0, splitPoint);
      const testData = historicalData.slice(
        splitPoint,
        splitPoint + config.horizon
      );

      if (trainData.length < 10 || testData.length === 0) {
        continue;
      }

      // Generate forecast for this split
      const features = this.generateModelFeatures(config);
      const trainingFeatures = this.prepareTrainingData(trainData, features);
      const model = await this.trainModel(config, trainingFeatures);

      const forecast = this.predictFuture(
        model,
        trainData,
        features,
        testData.length,
        config.confidenceLevel
      );

      // Compare predictions with actual values
      for (let j = 0; j < Math.min(forecast.length, testData.length); j++) {
        const actual = testData[j].value;
        const predicted = forecast[j].predicted;

        predictions.push({
          actual,
          predicted,
          date: testData[j].date,
        });

        errors.push({
          absolute: Math.abs(actual - predicted),
          squared: (actual - predicted) ** 2,
          percentage:
            actual !== 0 ? Math.abs((actual - predicted) / actual) * 100 : 0,
        });
      }
    }

    if (errors.length === 0) {
      throw new Error('Insufficient data for accuracy evaluation');
    }

    // Calculate accuracy metrics
    const mae = errors.reduce((sum, e) => sum + e.absolute, 0) / errors.length;
    const mse = errors.reduce((sum, e) => sum + e.squared, 0) / errors.length;
    const rmse = Math.sqrt(mse);
    const mape =
      errors.reduce((sum, e) => sum + e.percentage, 0) / errors.length;

    // Calculate accuracy score (higher is better)
    const accuracy_score = Math.max(0, 100 - mape);

    return {
      mae: Math.round(mae * 100) / 100,
      mape: Math.round(mape * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      accuracy_score: Math.round(accuracy_score * 100) / 100,
      predictions,
    };
  }

  /**
   * Automated feature engineering for time series
   */
  private generateModelFeatures(config: ForecastConfig): ModelFeatures {
    const features: ModelFeatures = {
      lags: [],
      rolling_stats: [],
      seasonality: {
        weekly: false,
        monthly: false,
        quarterly: false,
      },
      trends: true,
      exogenous_vars: [],
    };

    // Configure lags based on frequency
    if (config.frequency === 'daily') {
      features.lags = [1, 7, 14, 30]; // 1 day, 1 week, 2 weeks, 1 month
      features.rolling_stats = [
        { window: 7, stats: ['mean', 'std'] },
        { window: 30, stats: ['mean', 'min', 'max'] },
      ];
      if (config.includeSeasonality) {
        features.seasonality.weekly = true;
        features.seasonality.monthly = true;
      }
    } else if (config.frequency === 'weekly') {
      features.lags = [1, 4, 12, 24]; // 1 week, 1 month, 3 months, 6 months
      features.rolling_stats = [
        { window: 4, stats: ['mean', 'std'] },
        { window: 12, stats: ['mean', 'min', 'max'] },
      ];
      if (config.includeSeasonality) {
        features.seasonality.monthly = true;
        features.seasonality.quarterly = true;
      }
    } else {
      // monthly
      features.lags = [1, 3, 6, 12]; // 1, 3, 6, 12 months
      features.rolling_stats = [
        { window: 3, stats: ['mean', 'std'] },
        { window: 6, stats: ['mean', 'min', 'max'] },
      ];
      if (config.includeSeasonality) {
        features.seasonality.quarterly = true;
      }
    }

    // Add exogenous variables if requested
    if (config.includeExogenous) {
      features.exogenous_vars = [
        'marketing_spend',
        'support_tickets',
        'feature_releases',
        'competitor_activity',
        'economic_indicator',
      ];
    }

    return features;
  }

  /**
   * Prepare training data with lag features and rolling statistics
   */
  private prepareTrainingData(
    data: TimeSeriesData[],
    features: ModelFeatures
  ): Array<{ target: number; features: Record<string, number> }> {
    const trainingData = [];
    const maxLag = Math.max(...features.lags, 0);
    const maxWindow = Math.max(
      ...features.rolling_stats.map((rs) => rs.window),
      0
    );
    const startIndex = Math.max(maxLag, maxWindow);

    for (let i = startIndex; i < data.length; i++) {
      const featureVector: Record<string, number> = {};

      // Add lag features
      features.lags.forEach((lag) => {
        if (i - lag >= 0) {
          featureVector[`lag_${lag}`] = data[i - lag].value;
        }
      });

      // Add rolling statistics
      features.rolling_stats.forEach(({ window, stats }) => {
        if (i - window + 1 >= 0) {
          const windowData = data
            .slice(i - window + 1, i + 1)
            .map((d) => d.value);

          stats.forEach((stat) => {
            let value = 0;
            if (stat === 'mean') {
              value =
                windowData.reduce((sum, v) => sum + v, 0) / windowData.length;
            } else if (stat === 'std') {
              const mean =
                windowData.reduce((sum, v) => sum + v, 0) / windowData.length;
              value = Math.sqrt(
                windowData.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
                  windowData.length
              );
            } else if (stat === 'min') {
              value = Math.min(...windowData);
            } else if (stat === 'max') {
              value = Math.max(...windowData);
            }

            featureVector[`rolling_${window}_${stat}`] = value;
          });
        }
      });

      // Add seasonality features
      const date = new Date(data[i].date);
      if (features.seasonality.weekly) {
        featureVector.day_of_week = date.getDay();
        featureVector.day_of_week_sin = Math.sin(
          (2 * Math.PI * date.getDay()) / 7
        );
        featureVector.day_of_week_cos = Math.cos(
          (2 * Math.PI * date.getDay()) / 7
        );
      }
      if (features.seasonality.monthly) {
        featureVector.day_of_month = date.getDate();
        featureVector.month = date.getMonth();
        featureVector.month_sin = Math.sin(
          (2 * Math.PI * date.getMonth()) / 12
        );
        featureVector.month_cos = Math.cos(
          (2 * Math.PI * date.getMonth()) / 12
        );
      }
      if (features.seasonality.quarterly) {
        const quarter = Math.floor(date.getMonth() / 3);
        featureVector.quarter = quarter;
        featureVector.quarter_sin = Math.sin((2 * Math.PI * quarter) / 4);
        featureVector.quarter_cos = Math.cos((2 * Math.PI * quarter) / 4);
      }

      // Add trend feature
      if (features.trends) {
        featureVector.trend = i;
      }

      // Add exogenous variables
      if (data[i].exogenous) {
        features.exogenous_vars.forEach((varName) => {
          if (data[i].exogenous?.[varName] !== undefined) {
            featureVector[varName] = data[i].exogenous?.[varName];
          }
        });
      }

      trainingData.push({
        target: data[i].value,
        features: featureVector,
      });
    }

    return trainingData;
  }

  /**
   * Get historical data from the database
   */
  private async getHistoricalData(
    metric: string,
    frequency: string,
    extended = false
  ): Promise<TimeSeriesData[]> {
    const { data, error } = await this.supabase.rpc('get_forecasting_data', {
      p_metric: metric,
      p_frequency: frequency,
      p_extended: extended,
    });

    if (error) {
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Train or retrieve cached forecasting model
   */
  private async getOrTrainModel(
    config: ForecastConfig,
    trainingData: Array<{ target: number; features: Record<string, number> }>
  ): Promise<any> {
    const cacheKey = this.generateModelCacheKey(config);

    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey);
    }

    const model = await this.trainModel(config, trainingData);
    this.modelCache.set(cacheKey, model);

    // Cache cleanup (keep only last 10 models)
    if (this.modelCache.size > 10) {
      const firstKey = this.modelCache.keys().next().value;
      this.modelCache.delete(firstKey);
    }

    return model;
  }

  /**
   * Train a forecasting model based on configuration
   */
  private async trainModel(
    config: ForecastConfig,
    trainingData: Array<{ target: number; features: Record<string, number> }>
  ): Promise<any> {
    // Simple linear regression implementation
    // In production, could integrate with ML services or more sophisticated models

    if (trainingData.length === 0) {
      throw new Error('No training data available');
    }

    const features = Object.keys(trainingData[0].features);
    const X = trainingData.map((d) => features.map((f) => d.features[f] || 0));
    const y = trainingData.map((d) => d.target);

    let model: any;

    if (config.modelType === 'linear') {
      model = this.trainLinearRegression(X, y);
    } else if (config.modelType === 'polynomial') {
      model = this.trainPolynomialRegression(X, y, 2);
    } else if (config.modelType === 'exponential') {
      model = this.trainExponentialSmoothing(y);
    } else {
      // seasonal
      model = this.trainSeasonalModel(X, y, config.frequency);
    }

    return {
      ...model,
      features,
      config,
      trainedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate future predictions using trained model
   */
  private predictFuture(
    model: any,
    historicalData: TimeSeriesData[],
    features: ModelFeatures,
    horizon: number,
    confidenceLevel: number
  ): ForecastResult[] {
    const predictions: ForecastResult[] = [];
    const extendedData = [...historicalData];

    for (let i = 0; i < horizon; i++) {
      // Prepare features for next prediction
      const featureVector = this.prepareFeatureVector(
        extendedData,
        features,
        extendedData.length - 1 + i
      );

      // Make prediction
      const predicted = this.makePrediction(model, featureVector);

      // Calculate confidence interval
      const { lower_bound, upper_bound } = this.calculateConfidenceInterval(
        predicted,
        model.residualStd || predicted * 0.1, // fallback to 10% of prediction
        confidenceLevel
      );

      // Generate future date
      const lastDate = new Date(extendedData.at(-1).date);
      const nextDate = this.getNextDate(
        lastDate,
        features,
        model.config.frequency
      );

      const result: ForecastResult = {
        date: nextDate.toISOString().split('T')[0],
        predicted: Math.round(predicted * 100) / 100,
        lower_bound: Math.round(lower_bound * 100) / 100,
        upper_bound: Math.round(upper_bound * 100) / 100,
        confidence: confidenceLevel * 100,
      };

      predictions.push(result);

      // Add predicted value to extended data for next iteration
      extendedData.push({
        date: result.date,
        value: predicted,
      });
    }

    return predictions;
  }

  // Simplified ML model implementations (in production, use proper ML libraries)
  private trainLinearRegression(X: number[][], y: number[]) {
    // Simple linear regression using normal equation
    // For production, use proper ML libraries
    const n = X.length;
    const features = X[0].length;

    // Add bias term
    const XWithBias = X.map((row) => [1, ...row]);

    // Calculate weights using normal equation: w = (X^T * X)^-1 * X^T * y
    // Simplified implementation
    const weights = new Array(features + 1).fill(0);

    // Simple gradient descent approximation
    for (let iter = 0; iter < 1000; iter++) {
      const predictions = XWithBias.map((row) =>
        row.reduce((sum, xi, i) => sum + xi * weights[i], 0)
      );

      const errors = predictions.map((pred, i) => pred - y[i]);

      // Update weights
      for (let j = 0; j < weights.length; j++) {
        const gradient =
          errors.reduce((sum, error, i) => sum + error * XWithBias[i][j], 0) /
          n;
        weights[j] -= 0.001 * gradient; // learning rate
      }
    }

    // Calculate residual standard deviation
    const finalPredictions = XWithBias.map((row) =>
      row.reduce((sum, xi, i) => sum + xi * weights[i], 0)
    );
    const residuals = finalPredictions.map((pred, i) => (pred - y[i]) ** 2);
    const residualStd = Math.sqrt(
      residuals.reduce((sum, r) => sum + r, 0) / (n - 1)
    );

    return {
      type: 'linear',
      weights,
      residualStd,
    };
  }

  private trainPolynomialRegression(
    X: number[][],
    y: number[],
    degree: number
  ) {
    // Transform features to polynomial features
    const polyX = X.map((row) => {
      const polyRow = [1]; // bias
      row.forEach((x) => polyRow.push(x)); // linear terms

      if (degree >= 2) {
        // Add quadratic terms
        row.forEach((x, i) => {
          polyRow.push(x * x); // x^2
          for (let j = i + 1; j < row.length; j++) {
            polyRow.push(x * row[j]); // xi * xj
          }
        });
      }

      return polyRow;
    });

    // Use linear regression on polynomial features
    return this.trainLinearRegression(
      polyX.map((row) => row.slice(1)),
      y
    );
  }

  private trainExponentialSmoothing(y: number[]) {
    // Simple exponential smoothing
    const alpha = 0.3; // smoothing parameter
    let smoothed = y[0];
    const smoothedValues = [smoothed];

    for (let i = 1; i < y.length; i++) {
      smoothed = alpha * y[i] + (1 - alpha) * smoothed;
      smoothedValues.push(smoothed);
    }

    const residuals = y.map((actual, i) => (actual - smoothedValues[i]) ** 2);
    const residualStd = Math.sqrt(
      residuals.reduce((sum, r) => sum + r, 0) / (y.length - 1)
    );

    return {
      type: 'exponential',
      alpha,
      lastSmoothed: smoothed,
      residualStd,
    };
  }

  private trainSeasonalModel(X: number[][], y: number[], frequency: string) {
    // Simple seasonal decomposition and linear regression
    // This is a simplified implementation
    const seasonalPeriod =
      frequency === 'daily' ? 7 : frequency === 'weekly' ? 4 : 12;

    // Calculate seasonal components
    const seasonal = this.calculateSeasonalComponents(y, seasonalPeriod);

    // Deseasonalize the data
    const deseasonalized = y.map(
      (value, i) => value - seasonal[i % seasonalPeriod]
    );

    // Train linear model on deseasonalized data
    const linearModel = this.trainLinearRegression(X, deseasonalized);

    return {
      type: 'seasonal',
      linearModel,
      seasonal,
      seasonalPeriod,
    };
  }

  private calculateSeasonalComponents(y: number[], period: number): number[] {
    const seasonal = new Array(period).fill(0);
    const counts = new Array(period).fill(0);

    y.forEach((value, i) => {
      const seasonIndex = i % period;
      seasonal[seasonIndex] += value;
      counts[seasonIndex]++;
    });

    // Calculate average for each season
    for (let i = 0; i < period; i++) {
      seasonal[i] = counts[i] > 0 ? seasonal[i] / counts[i] : 0;
    }

    // Center the seasonal components
    const mean = seasonal.reduce((sum, s) => sum + s, 0) / period;
    return seasonal.map((s) => s - mean);
  }

  private prepareFeatureVector(
    data: TimeSeriesData[],
    features: ModelFeatures,
    index: number
  ): Record<string, number> {
    const featureVector: Record<string, number> = {};

    // Add lag features
    features.lags.forEach((lag) => {
      const lagIndex = index - lag;
      if (lagIndex >= 0 && lagIndex < data.length) {
        featureVector[`lag_${lag}`] = data[lagIndex].value;
      } else {
        featureVector[`lag_${lag}`] = 0;
      }
    });

    // Add rolling statistics (simplified)
    features.rolling_stats.forEach(({ window, stats }) => {
      const windowStart = Math.max(0, index - window + 1);
      const windowEnd = Math.min(data.length, index + 1);
      const windowData = data.slice(windowStart, windowEnd).map((d) => d.value);

      if (windowData.length > 0) {
        stats.forEach((stat) => {
          let value = 0;
          if (stat === 'mean') {
            value =
              windowData.reduce((sum, v) => sum + v, 0) / windowData.length;
          } else if (stat === 'std') {
            const mean =
              windowData.reduce((sum, v) => sum + v, 0) / windowData.length;
            value = Math.sqrt(
              windowData.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
                windowData.length
            );
          } else if (stat === 'min') {
            value = Math.min(...windowData);
          } else if (stat === 'max') {
            value = Math.max(...windowData);
          }
          featureVector[`rolling_${window}_${stat}`] = value;
        });
      }
    });

    // Add seasonality and trend features
    featureVector.trend = index;

    return featureVector;
  }

  private makePrediction(
    model: any,
    featureVector: Record<string, number>
  ): number {
    if (model.type === 'linear' || model.type === 'polynomial') {
      const features = [1, ...model.features.map((f) => featureVector[f] || 0)];
      return features.reduce(
        (sum, xi, i) => sum + xi * (model.weights[i] || 0),
        0
      );
    }
    if (model.type === 'exponential') {
      return model.lastSmoothed;
    }
    if (model.type === 'seasonal') {
      const linearPred = this.makePrediction(model.linearModel, featureVector);
      const seasonalIndex = (featureVector.trend || 0) % model.seasonalPeriod;
      return linearPred + model.seasonal[seasonalIndex];
    }

    return 0;
  }

  private calculateConfidenceInterval(
    prediction: number,
    standardError: number,
    confidenceLevel: number
  ): { lower_bound: number; upper_bound: number } {
    // Z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };

    const zScore = zScores[confidenceLevel] || 1.96;
    const margin = zScore * standardError;

    return {
      lower_bound: Math.max(0, prediction - margin), // Don't allow negative predictions
      upper_bound: prediction + margin,
    };
  }

  private getNextDate(
    lastDate: Date,
    _features: ModelFeatures,
    frequency: string
  ): Date {
    const nextDate = new Date(lastDate);

    if (frequency === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      // monthly
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate;
  }

  private applyScenarioAdjustments(
    baselineForecast: ForecastResult[],
    adjustments: {
      growth_rate?: number;
      seasonality_factor?: number;
      external_factors?: Record<string, number>;
    }
  ): ForecastResult[] {
    return baselineForecast.map((forecast, i) => {
      let adjusted = forecast.predicted;

      // Apply growth rate adjustment
      if (adjustments.growth_rate) {
        const growthMultiplier = (1 + adjustments.growth_rate / 100) ** (i + 1);
        adjusted *= growthMultiplier;
      }

      // Apply seasonality factor
      if (adjustments.seasonality_factor) {
        adjusted *= 1 + adjustments.seasonality_factor / 100;
      }

      // Apply external factors (simplified)
      if (adjustments.external_factors) {
        const factorSum = Object.values(adjustments.external_factors).reduce(
          (sum, factor) => sum + factor,
          0
        );
        adjusted *= 1 + factorSum / 100;
      }

      // Recalculate bounds proportionally
      const ratio = adjusted / forecast.predicted;

      return {
        ...forecast,
        predicted: Math.round(adjusted * 100) / 100,
        lower_bound: Math.round(forecast.lower_bound * ratio * 100) / 100,
        upper_bound: Math.round(forecast.upper_bound * ratio * 100) / 100,
      };
    });
  }

  private generateModelCacheKey(config: ForecastConfig): string {
    return `${config.metric}_${config.frequency}_${config.modelType}_${config.horizon}_${config.includeSeasonality}_${config.includeExogenous}`;
  }
}

// Factory function
export function createForecastingEngine(): ForecastingEngine {
  return new ForecastingEngine();
}

// Utility functions for forecasting
export const forecastUtils = {
  /**
   * Calculate forecast accuracy metrics
   */
  calculateAccuracyMetrics: (actual: number[], predicted: number[]) => {
    if (actual.length !== predicted.length) {
      throw new Error('Actual and predicted arrays must have the same length');
    }

    const n = actual.length;
    const errors = actual.map((a, i) => a - predicted[i]);
    const absoluteErrors = errors.map((e) => Math.abs(e));
    const squaredErrors = errors.map((e) => e * e);
    const percentageErrors = actual.map((a, i) =>
      a !== 0 ? Math.abs((a - predicted[i]) / a) * 100 : 0
    );

    return {
      mae: absoluteErrors.reduce((sum, e) => sum + e, 0) / n,
      mse: squaredErrors.reduce((sum, e) => sum + e, 0) / n,
      rmse: Math.sqrt(squaredErrors.reduce((sum, e) => sum + e, 0) / n),
      mape: percentageErrors.reduce((sum, e) => sum + e, 0) / n,
    };
  },

  /**
   * Format forecast data for visualization
   */
  formatForChart: (
    historical: TimeSeriesData[],
    forecasts: ForecastResult[]
  ) => {
    return [
      ...historical.map((h) => ({
        date: h.date,
        actual: h.value,
        type: 'historical',
      })),
      ...forecasts.map((f) => ({
        date: f.date,
        predicted: f.predicted,
        lower_bound: f.lower_bound,
        upper_bound: f.upper_bound,
        type: 'forecast',
      })),
    ];
  },

  /**
   * Detect anomalies in forecast vs actual
   */
  detectAnomalies: (actual: number[], predicted: number[], threshold = 2) => {
    const errors = actual.map((a, i) => a - predicted[i]);
    const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    const stdError = Math.sqrt(
      errors.reduce((sum, e) => sum + (e - meanError) ** 2, 0) / errors.length
    );

    return errors.map((error, i) => ({
      index: i,
      actual: actual[i],
      predicted: predicted[i],
      error,
      isAnomaly: Math.abs(error - meanError) > threshold * stdError,
      zScore: stdError > 0 ? (error - meanError) / stdError : 0,
    }));
  },
};
