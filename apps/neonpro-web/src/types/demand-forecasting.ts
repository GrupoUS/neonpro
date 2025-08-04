/**
 * Temporary demand forecasting types for build compatibility
 */

export interface DemandForecastRequest {
  time_horizon: number;
  resource_types: string[];
  algorithm?: 'linear' | 'arima' | 'lstm';
}

export interface DemandForecastResponse {
  forecasts: Array<{
    id: string;
    resource_type: string;
    predicted_demand: number;
    confidence_interval: [number, number];
    forecast_date: string;
  }>;
  accuracy_metrics: {
    mae: number;
    mape: number;
    rmse: number;
  };
  model_info: {
    algorithm: string;
    training_period: string;
    last_updated: string;
  };
}

export interface ResourceAllocationRequest {
  forecast_id: string;
  allocation_strategy: 'cost_optimized' | 'service_level' | 'balanced';
  constraints?: {
    max_budget?: number;
    min_service_level?: number;
    resource_limits?: Record<string, number>;
  };
}// Export do FORECASTING_CONSTANTS
export const FORECASTING_CONSTANTS = {
  MAX_FORECAST_DAYS: 365,
  MIN_HISTORICAL_DAYS: 30,
  DEFAULT_CONFIDENCE_LEVEL: 0.95,
  ALGORITHMS: ['LINEAR', 'SEASONAL', 'EXPONENTIAL']
} as const;

// Export do DemandForecastSchema
export const DemandForecastSchema = {
  type: 'object',
  properties: {
    algorithm: { type: 'string' },
    confidenceLevel: { type: 'number' },
    forecastDays: { type: 'number' }
  }
} as const;

// Export do DemandForecastingEngine
export class DemandForecastingEngine {
  static analyze() { return {}; }
  static predict() { return {}; }
  static calculate() { return {}; }
}