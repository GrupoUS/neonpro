/**
 * Demand Forecasting Types - Story 11.1
 * 
 * Comprehensive type definitions for the demand forecasting engine
 * supporting ≥80% accuracy prediction models and resource optimization.
 */

import { z } from 'zod';

// Core Demand Forecasting Types

export interface DemandForecast {
  id: string;
  forecast_type: 'demand_prediction' | 'capacity_forecast' | 'resource_forecast';
  service_id?: string;
  period_start: string;
  period_end: string;
  predicted_demand: number;
  confidence_level: number;
  created_at: string;
  updated_at: string;
}

export interface ForecastModel {
  id: string;
  model_type: 'linear_regression' | 'arima' | 'lstm' | 'ensemble' | 'random_forest';
  parameters: Record<string, any>;
  accuracy_score: number;
  training_date: string;
  status: 'active' | 'retired' | 'training' | 'testing';
  created_at: string;
  updated_at: string;
}

export interface DemandFactor {
  id: string;
  factor_type: 'seasonality' | 'holiday_impact' | 'weather_impact' | 'economic_factor' | 'marketing_campaign' | 'weekly_seasonality' | 'monthly_seasonality';
  factor_value: string; // JSON string containing factor data
  impact_weight: number; // 0-1 representing the factor's influence
  date_effective: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastValidation {
  id: string;
  forecast_id: string;
  actual_demand: number;
  accuracy_score: number;
  validation_date: string;
  created_at: string;
  updated_at: string;
}

// Zod Validation Schemas

export const DemandForecastSchema = z.object({
  id: z.string().uuid(),
  forecast_type: z.enum(['demand_prediction', 'capacity_forecast', 'resource_forecast']),
  service_id: z.string().uuid().optional(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  predicted_demand: z.number().min(0),
  confidence_level: z.number().min(0).max(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const ForecastModelSchema = z.object({
  id: z.string().uuid(),
  model_type: z.enum(['linear_regression', 'arima', 'lstm', 'ensemble', 'random_forest']),
  parameters: z.record(z.any()),
  accuracy_score: z.number().min(0).max(1),
  training_date: z.string().datetime(),
  status: z.enum(['active', 'retired', 'training', 'testing']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const DemandFactorSchema = z.object({
  id: z.string().uuid(),
  factor_type: z.enum(['seasonality', 'holiday_impact', 'weather_impact', 'economic_factor', 'marketing_campaign', 'weekly_seasonality', 'monthly_seasonality']),
  factor_value: z.string(),
  impact_weight: z.number().min(0).max(1),
  date_effective: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Constants for the forecasting system
export const FORECASTING_CONSTANTS = {
  MIN_ACCURACY_THRESHOLD: 0.8, // ≥80% accuracy requirement
  DEFAULT_CONFIDENCE_LEVEL: 0.95,
  MAX_LOOKAHEAD_DAYS: 365, // days (alias for MAX_FORECAST_HORIZON for backward compatibility)
  MAX_FORECAST_HORIZON: 365, // days
  MIN_HISTORICAL_DATA_POINTS: 30,
  DEFAULT_SEASONALITY_PERIODS: [7, 30, 365], // weekly, monthly, yearly
  ALERT_THRESHOLDS: {
    accuracy_drop: 0.05, // 5% drop triggers alert
    demand_spike: 2.0, // 200% of predicted demand
    capacity_shortage: 0.9 // 90% capacity utilization
  }
};

export {
  DemandForecast,
  ForecastModel,
  DemandFactor,
  ForecastValidation,
  DemandForecastSchema,
  ForecastModelSchema,
  DemandFactorSchema,
  FORECASTING_CONSTANTS
};