/**
 * Forecasting System Configuration
 * Epic 11 - Story 11.1: Configuration management for demand forecasting system
 * 
 * Centralized configuration for:
 * - System-wide forecasting parameters
 * - Model training defaults and constraints
 * - Resource optimization settings
 * - Performance thresholds and limits
 * - Integration configurations
 * - Environment-specific settings
 * 
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

import {
  ForecastingSystemConfig,
  ResourceOptimizationConfig,
  ModelTrainingDefaults
} from './types';

/**
 * Default Forecasting System Configuration
 */
export const DEFAULT_FORECASTING_CONFIG: ForecastingSystemConfig = {
  // Core accuracy requirements
  accuracy_threshold: 0.80, // 80% minimum accuracy requirement per story 11.1
  
  // Forecast horizon settings
  default_forecast_horizon_days: 30,
  max_forecast_horizon_days: 365,
  
  // Data requirements
  min_historical_data_points: 50, // Minimum data points for reliable forecasting
  
  // Confidence intervals
  default_confidence_intervals: [80, 95], // 80% and 95% confidence levels
  
  // Model lifecycle management
  model_retraining_interval_days: 30, // Retrain models monthly
  performance_check_interval_hours: 24, // Check performance daily
  drift_detection_threshold: 0.10, // 10% drift threshold
  
  // Alert thresholds
  alert_thresholds: {
    demand_spike_multiplier: 1.5, // Alert when demand exceeds 150% of average
    capacity_shortage_threshold: 0.90, // Alert when capacity utilization > 90%
    accuracy_degradation_threshold: 0.75 // Alert when accuracy drops below 75%
  }
};

/**
 * Default Resource Optimization Configuration
 */
export const DEFAULT_RESOURCE_CONFIG: ResourceOptimizationConfig = {
  // Target utilization rates
  target_utilization_rate: 0.85, // 85% target utilization
  
  // Cost and efficiency thresholds
  cost_variance_threshold: 0.10, // 10% cost variance threshold
  efficiency_threshold: 0.80, // 80% minimum efficiency
  
  // Resource-specific limits
  staff_overtime_limit_hours: 10, // Maximum 10 hours overtime per week
  equipment_max_utilization: 0.90, // Maximum 90% equipment utilization
  room_max_utilization: 0.95, // Maximum 95% room utilization
  inventory_safety_stock_multiplier: 1.2, // 20% safety stock buffer
  
  // Optimization objective weights
  optimization_objectives_weights: {
    cost_minimization: 0.30, // 30% weight on cost reduction
    revenue_maximization: 0.35, // 35% weight on revenue optimization
    utilization_optimization: 0.25, // 25% weight on utilization efficiency
    satisfaction_optimization: 0.10 // 10% weight on satisfaction metrics
  }
};

/**
 * Default Model Training Configuration
 */
export const DEFAULT_MODEL_TRAINING: ModelTrainingDefaults = {
  // Training data configuration
  training_period_days: 365, // Use 1 year of historical data
  validation_split: 0.20, // 20% for validation
  test_split: 0.10, // 10% for testing
  
  // Cross-validation settings
  cross_validation_folds: 5, // 5-fold cross-validation
  
  // Early stopping configuration
  early_stopping: true,
  patience: 10, // Stop after 10 epochs without improvement
  min_delta: 0.001, // Minimum improvement threshold
  
  // Training parameters
  max_epochs: 100, // Maximum training epochs
  batch_size: 32, // Batch size for training
  learning_rate: 0.001, // Initial learning rate
  regularization: 0.01 // L2 regularization strength
};

/**
 * Model-Specific Configurations
 */
export const MODEL_CONFIGS = {
  arima: {
    max_p: 5, // Maximum autoregressive order
    max_d: 2, // Maximum differencing order
    max_q: 5, // Maximum moving average order
    seasonal: true,
    information_criterion: 'aic', // Use AIC for model selection
    stepwise: true, // Use stepwise selection
    suppress_warnings: true
  },
  
  lstm: {
    hidden_units: [64, 32], // Hidden layer sizes
    dropout_rate: 0.2, // Dropout for regularization
    sequence_length: 30, // Input sequence length
    activation: 'relu', // Activation function
    optimizer: 'adam', // Optimizer algorithm
    loss_function: 'mse' // Loss function
  },
  
  prophet: {
    growth: 'linear', // Growth model
    changepoint_prior_scale: 0.05, // Changepoint flexibility
    seasonality_prior_scale: 10, // Seasonality strength
    holidays_prior_scale: 10, // Holiday effect strength
    seasonality_mode: 'additive', // Seasonality mode
    yearly_seasonality: true,
    weekly_seasonality: true,
    daily_seasonality: false
  },
  
  linear_regression: {
    fit_intercept: true, // Include intercept
    normalize: true, // Normalize features
    feature_selection: 'recursive', // Feature selection method
    max_features: 20, // Maximum features to select
    regularization_type: 'ridge', // Regularization type
    alpha: 1.0 // Regularization strength
  },
  
  ensemble: {
    base_models: ['linear_regression', 'arima', 'prophet'], // Models to ensemble
    ensemble_method: 'weighted_average', // Ensemble combination method
    weight_calculation: 'accuracy_based', // How to calculate weights
    min_models: 2, // Minimum models required
    max_models: 5 // Maximum models in ensemble
  }
};

/**
 * External Factor Configurations
 */
export const EXTERNAL_FACTOR_CONFIGS = {
  weather: {
    enabled: true,
    api_key_env: 'WEATHER_API_KEY',
    update_interval_hours: 6, // Update every 6 hours
    forecast_days: 7, // Get 7-day weather forecast
    impact_weights: {
      temperature: 0.3,
      precipitation: 0.4,
      humidity: 0.2,
      conditions: 0.1
    }
  },
  
  holidays: {
    enabled: true,
    country_code: 'BR', // Brazil holidays
    include_regional: true, // Include regional holidays
    impact_multiplier: 1.5, // Holiday impact on demand
    pre_holiday_days: 2, // Days before holiday affected
    post_holiday_days: 1 // Days after holiday affected
  },
  
  economic_indicators: {
    enabled: false, // Disabled by default
    api_key_env: 'ECONOMIC_API_KEY',
    update_interval_hours: 24, // Update daily
    indicators: [
      'unemployment_rate',
      'inflation_rate',
      'healthcare_spending'
    ]
  },
  
  health_trends: {
    enabled: true,
    data_source: 'government_health_api',
    update_interval_hours: 24,
    trend_types: [
      'seasonal_illness',
      'vaccination_rates',
      'public_health_alerts'
    ]
  }
};

/**
 * Performance and Monitoring Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Response time thresholds (milliseconds)
  response_time_thresholds: {
    forecast_generation: 30000, // 30 seconds max for forecast generation
    model_training: 3600000, // 1 hour max for model training
    resource_optimization: 60000, // 1 minute max for optimization
    api_response: 5000 // 5 seconds max for API responses
  },
  
  // Monitoring intervals
  monitoring_intervals: {
    health_check_seconds: 60, // Health check every minute
    performance_metrics_minutes: 5, // Performance metrics every 5 minutes
    accuracy_check_hours: 1, // Accuracy check every hour
    system_report_hours: 24 // System report daily
  },
  
  // Error rate thresholds
  error_rate_thresholds: {
    forecast_errors: 0.05, // 5% max forecast error rate
    model_failures: 0.02, // 2% max model failure rate
    api_errors: 0.01, // 1% max API error rate
    system_errors: 0.001 // 0.1% max system error rate
  },
  
  // Resource usage limits
  resource_limits: {
    max_concurrent_trainings: 3, // Max concurrent model trainings
    max_memory_usage_gb: 8, // Max memory usage
    max_cpu_usage_percent: 80, // Max CPU usage
    max_storage_gb: 100 // Max storage usage
  }
};

/**
 * Database Configuration
 */
export const DATABASE_CONFIG = {
  // Table names
  tables: {
    demand_forecasts: 'demand_forecasts',
    forecast_models: 'forecast_models',
    model_training_jobs: 'model_training_jobs',
    allocation_plans: 'allocation_plans',
    forecast_alerts: 'forecast_alerts',
    demand_factors: 'demand_factors',
    model_performance_metrics: 'model_performance_metrics',
    allocation_alerts: 'allocation_alerts'
  },
  
  // Connection settings
  connection: {
    pool_size: 10, // Connection pool size
    timeout_seconds: 30, // Query timeout
    retry_attempts: 3, // Retry failed queries
    retry_delay_ms: 1000 // Delay between retries
  },
  
  // Data retention policies
  retention_policies: {
    forecast_data_days: 365, // Keep forecast data for 1 year
    training_job_data_days: 90, // Keep training job data for 3 months
    performance_metrics_days: 180, // Keep performance metrics for 6 months
    alert_data_days: 30, // Keep alert data for 1 month
    log_data_days: 7 // Keep logs for 1 week
  }
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Rate limiting
  rate_limits: {
    forecasts_per_minute: 60, // Max 60 forecast requests per minute
    trainings_per_hour: 10, // Max 10 training requests per hour
    optimizations_per_hour: 30, // Max 30 optimization requests per hour
    reports_per_hour: 100 // Max 100 report requests per hour
  },
  
  // Request validation
  validation: {
    max_forecast_horizon_days: 365, // Max forecast horizon
    min_forecast_horizon_days: 1, // Min forecast horizon
    max_batch_size: 50, // Max batch forecast size
    max_request_size_mb: 10 // Max request size
  },
  
  // Response formatting
  response_format: {
    include_metadata: true, // Include response metadata
    include_confidence_intervals: true, // Include confidence intervals
    decimal_places: 2, // Decimal places for numbers
    date_format: 'ISO8601' // Date format
  }
};

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  // Authentication
  authentication: {
    require_api_key: true, // Require API key for requests
    jwt_expiration_hours: 24, // JWT token expiration
    refresh_token_days: 30, // Refresh token expiration
    max_login_attempts: 5 // Max failed login attempts
  },
  
  // Authorization
  authorization: {
    role_based_access: true, // Enable role-based access control
    resource_level_permissions: true, // Resource-level permissions
    audit_logging: true, // Enable audit logging
    permission_caching_minutes: 15 // Cache permissions for 15 minutes
  },
  
  // Data protection
  data_protection: {
    encrypt_sensitive_data: true, // Encrypt sensitive data
    data_anonymization: true, // Anonymize data for analytics
    gdpr_compliance: true, // GDPR compliance mode
    data_retention_compliance: true // Auto-delete expired data
  }
};

/**
 * Environment-Specific Configurations
 */
export const ENVIRONMENT_CONFIGS = {
  development: {
    logging_level: 'debug',
    enable_debug_mode: true,
    cache_ttl_seconds: 60, // Short cache TTL for development
    mock_external_apis: true, // Use mock APIs in development
    performance_monitoring: false // Disable performance monitoring
  },
  
  staging: {
    logging_level: 'info',
    enable_debug_mode: false,
    cache_ttl_seconds: 300, // 5-minute cache TTL
    mock_external_apis: false, // Use real APIs in staging
    performance_monitoring: true // Enable performance monitoring
  },
  
  production: {
    logging_level: 'warn',
    enable_debug_mode: false,
    cache_ttl_seconds: 900, // 15-minute cache TTL
    mock_external_apis: false, // Use real APIs in production
    performance_monitoring: true, // Enable performance monitoring
    error_reporting: true, // Enable error reporting
    metrics_collection: true // Enable metrics collection
  }
};

/**
 * Feature Flags Configuration
 */
export const FEATURE_FLAGS = {
  // Core features
  enable_ensemble_models: true, // Enable ensemble modeling
  enable_real_time_adjustments: true, // Enable real-time forecast adjustments
  enable_external_factors: true, // Enable external factor integration
  
  // Advanced features
  enable_auto_retraining: true, // Enable automatic model retraining
  enable_hyperparameter_optimization: false, // Disable hyperparameter optimization (experimental)
  enable_advanced_analytics: true, // Enable advanced analytics
  
  // Integration features
  enable_weather_integration: true, // Enable weather data integration
  enable_economic_indicators: false, // Disable economic indicators (experimental)
  enable_health_trends: true, // Enable health trends integration
  
  // Experimental features
  enable_neural_networks: false, // Disable neural networks (experimental)
  enable_deep_learning: false, // Disable deep learning models (experimental)
  enable_quantum_optimization: false // Disable quantum optimization (future)
};

/**
 * Configuration Helper Functions
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, any> = {};

  private constructor() {
    this.loadConfiguration();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfiguration(): void {
    // Load environment-specific configuration
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = ENVIRONMENT_CONFIGS[environment as keyof typeof ENVIRONMENT_CONFIGS];

    // Merge configurations
    this.config = {
      ...DEFAULT_FORECASTING_CONFIG,
      ...DEFAULT_RESOURCE_CONFIG,
      ...DEFAULT_MODEL_TRAINING,
      ...PERFORMANCE_CONFIG,
      ...DATABASE_CONFIG,
      ...API_CONFIG,
      ...SECURITY_CONFIG,
      ...envConfig,
      model_configs: MODEL_CONFIGS,
      external_factors: EXTERNAL_FACTOR_CONFIGS,
      feature_flags: FEATURE_FLAGS
    };
  }

  public get<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return defaultValue as T;
      }
    }

    return value as T;
  }

  public set(key: string, value: any): void {
    const keys = key.split('.');
    let config = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!config[keys[i]]) {
        config[keys[i]] = {};
      }
      config = config[keys[i]];
    }

    config[keys[keys.length - 1]] = value;
  }

  public reload(): void {
    this.loadConfiguration();
  }

  public getAll(): Record<string, any> {
    return { ...this.config };
  }

  public isFeatureEnabled(feature: string): boolean {
    return this.get(`feature_flags.${feature}`, false);
  }

  public getModelConfig(modelType: string): Record<string, any> {
    return this.get(`model_configs.${modelType}`, {});
  }

  public getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();

// Export individual configurations for direct access
export {
  DEFAULT_FORECASTING_CONFIG as FORECASTING_CONFIG,
  DEFAULT_RESOURCE_CONFIG as RESOURCE_CONFIG,
  DEFAULT_MODEL_TRAINING as MODEL_TRAINING_CONFIG,
  MODEL_CONFIGS,
  EXTERNAL_FACTOR_CONFIGS,
  PERFORMANCE_CONFIG,
  DATABASE_CONFIG,
  API_CONFIG,
  SECURITY_CONFIG,
  ENVIRONMENT_CONFIGS,
  FEATURE_FLAGS
};
