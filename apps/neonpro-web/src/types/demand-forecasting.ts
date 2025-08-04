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
}