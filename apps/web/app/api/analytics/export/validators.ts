import {
  ExportErrorCode,
  type ExportFormat,
  type ExportOptions,
  type ExportRequest,
  type ExportType,
  SUPPORTED_FORMATS,
  SUPPORTED_TYPES,
  type ValidationResult,
} from './types';

/**
 * Validates the export format
 */
export function validateFormat(format: string): ValidationResult {
  if (!format) {
    return { valid: false, errors: ['Format is required'] };
  }

  if (!SUPPORTED_FORMATS.includes(format as ExportFormat)) {
    return {
      valid: false,
      errors: [
        `Unsupported format: ${format}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`,
      ],
    };
  }

  return { valid: true };
}

/**
 * Validates the export type
 */
export function validateType(type: string): ValidationResult {
  if (!type) {
    return { valid: false, errors: ['Type is required'] };
  }

  if (!SUPPORTED_TYPES.includes(type as ExportType)) {
    return {
      valid: false,
      errors: [
        `Unsupported type: ${type}. Supported types: ${SUPPORTED_TYPES.join(', ')}`,
      ],
    };
  }

  return { valid: true };
}

/**
 * Validates export options
 */
export function validateOptions(options: any): ValidationResult {
  const errors: string[] = [];

  if (options && typeof options === 'object') {
    // Validate orientation
    if (
      options.orientation &&
      !['portrait', 'landscape'].includes(options.orientation)
    ) {
      errors.push('Orientation must be either "portrait" or "landscape"');
    }

    // Validate date range
    if (options.dateRange) {
      if (options.dateRange.start && options.dateRange.end) {
        const startDate = new Date(options.dateRange.start);
        const endDate = new Date(options.dateRange.end);

        if (Number.isNaN(startDate.getTime())) {
          errors.push('Invalid start date format');
        }

        if (Number.isNaN(endDate.getTime())) {
          errors.push('Invalid end date format');
        }

        if (startDate > endDate) {
          errors.push('Start date must be before end date');
        }
      } else {
        errors.push('Date range must include both start and end dates');
      }
    }

    // Validate title length
    if (
      options.title &&
      typeof options.title === 'string' &&
      options.title.length > 100
    ) {
      errors.push('Title must be 100 characters or less');
    }

    // Validate boolean options
    const booleanOptions = [
      'includeCharts',
      'includeHeader',
      'includeFooter',
      'compression',
    ];
    booleanOptions.forEach((option) => {
      if (
        options[option] !== undefined &&
        typeof options[option] !== 'boolean'
      ) {
        errors.push(`${option} must be a boolean value`);
      }
    });
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validates export data based on type
 */
export function validateData(data: any, type: ExportType): ValidationResult {
  if (!data) {
    return { valid: false, errors: ['Data is required'] };
  }

  if (typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  const errors: string[] = [];

  switch (type) {
    case 'cohort':
      errors.push(...validateCohortData(data));
      break;
    case 'forecast':
      errors.push(...validateForecastData(data));
      break;
    case 'insights':
      errors.push(...validateInsightsData(data));
      break;
    case 'dashboard':
      errors.push(...validateDashboardData(data));
      break;
    case 'realtime':
      errors.push(...validateRealtimeData(data));
      break;
    default:
      errors.push(`Unknown data type: ${type}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validates cohort data structure
 */
function validateCohortData(data: any): string[] {
  const errors: string[] = [];

  if (data.metrics && Array.isArray(data.metrics)) {
    data.metrics.forEach((metric: any, index: number) => {
      if (!metric.cohortId) {
        errors.push(`Metric ${index}: cohortId is required`);
      }
      if (typeof metric.totalUsers !== 'number' || metric.totalUsers < 0) {
        errors.push(
          `Metric ${index}: totalUsers must be a non-negative number`,
        );
      }
      if (
        typeof metric.retentionRate !== 'number' ||
        metric.retentionRate < 0 ||
        metric.retentionRate > 100
      ) {
        errors.push(
          `Metric ${index}: retentionRate must be a number between 0 and 100`,
        );
      }
      if (typeof metric.revenue !== 'number' || metric.revenue < 0) {
        errors.push(`Metric ${index}: revenue must be a non-negative number`);
      }
      if (
        typeof metric.churnRate !== 'number' ||
        metric.churnRate < 0 ||
        metric.churnRate > 100
      ) {
        errors.push(
          `Metric ${index}: churnRate must be a number between 0 and 100`,
        );
      }
    });
  } else {
    errors.push('Cohort data must include a metrics array');
  }

  if (data.insights && !Array.isArray(data.insights)) {
    errors.push('Insights must be an array');
  }

  if (data.statistics && typeof data.statistics !== 'object') {
    errors.push('Statistics must be an object');
  }

  return errors;
}

/**
 * Validates forecast data structure
 */
function validateForecastData(data: any): string[] {
  const errors: string[] = [];

  if (!data.model || typeof data.model !== 'string') {
    errors.push('Forecast data must include a model name');
  }

  if (data.predictions && Array.isArray(data.predictions)) {
    data.predictions.forEach((prediction: any, index: number) => {
      if (prediction.date) {
        const date = new Date(prediction.date);
        if (Number.isNaN(date.getTime())) {
          errors.push(`Prediction ${index}: invalid date format`);
        }
      } else {
        errors.push(`Prediction ${index}: date is required`);
      }

      if (typeof prediction.value !== 'number') {
        errors.push(`Prediction ${index}: value must be a number`);
      }

      if (
        prediction.confidence !== undefined &&
        (typeof prediction.confidence !== 'number' ||
          prediction.confidence < 0 ||
          prediction.confidence > 1)
      ) {
        errors.push(
          `Prediction ${index}: confidence must be a number between 0 and 1`,
        );
      }
    });
  } else {
    errors.push('Forecast data must include a predictions array');
  }

  if (data.evaluation && typeof data.evaluation !== 'object') {
    errors.push('Evaluation must be an object');
  }

  return errors;
}

/**
 * Validates insights data structure
 */
function validateInsightsData(data: any): string[] {
  const errors: string[] = [];

  if (data.correlations && !Array.isArray(data.correlations)) {
    errors.push('Correlations must be an array');
  } else if (data.correlations) {
    data.correlations.forEach((corr: any, index: number) => {
      if (!(corr.metric1 && corr.metric2)) {
        errors.push(
          `Correlation ${index}: both metric1 and metric2 are required`,
        );
      }
      if (
        typeof corr.correlation !== 'number' ||
        corr.correlation < -1 ||
        corr.correlation > 1
      ) {
        errors.push(
          `Correlation ${index}: correlation must be a number between -1 and 1`,
        );
      }
    });
  }

  if (data.anomalies && !Array.isArray(data.anomalies)) {
    errors.push('Anomalies must be an array');
  } else if (data.anomalies) {
    data.anomalies.forEach((anomaly: any, index: number) => {
      if (!anomaly.metric) {
        errors.push(`Anomaly ${index}: metric is required`);
      }
      if (!anomaly.timestamp) {
        errors.push(`Anomaly ${index}: timestamp is required`);
      }
      if (typeof anomaly.value !== 'number') {
        errors.push(`Anomaly ${index}: value must be a number`);
      }
      if (typeof anomaly.expectedValue !== 'number') {
        errors.push(`Anomaly ${index}: expectedValue must be a number`);
      }
      if (
        anomaly.severity &&
        !['Low', 'Medium', 'High', 'Critical'].includes(anomaly.severity)
      ) {
        errors.push(
          `Anomaly ${index}: severity must be Low, Medium, High, or Critical`,
        );
      }
    });
  }

  if (data.predictions && !Array.isArray(data.predictions)) {
    errors.push('Predictions must be an array');
  }

  if (data.recommendations && !Array.isArray(data.recommendations)) {
    errors.push('Recommendations must be an array');
  }

  return errors;
}

/**
 * Validates dashboard data structure
 */
function validateDashboardData(data: any): string[] {
  const errors: string[] = [];

  if (!data.kpis || typeof data.kpis !== 'object') {
    errors.push('Dashboard data must include a kpis object');
  } else {
    // Validate common KPI fields
    const numericKPIs = [
      'activeSubscriptions',
      'monthlyRecurringRevenue',
      'trialConversions',
      'churnRate',
      'newSignups',
      'conversionRate',
      'averageRevenuePerUser',
      'customerLifetimeValue',
    ];

    numericKPIs.forEach((kpi) => {
      if (data.kpis[kpi] !== undefined && typeof data.kpis[kpi] !== 'number') {
        errors.push(`KPI ${kpi} must be a number`);
      }
    });
  }

  if (data.cohorts && !Array.isArray(data.cohorts)) {
    errors.push('Cohorts must be an array');
  }

  if (data.forecasts && !Array.isArray(data.forecasts)) {
    errors.push('Forecasts must be an array');
  }

  if (data.insights && !Array.isArray(data.insights)) {
    errors.push('Insights must be an array');
  }

  return errors;
}

/**
 * Validates realtime data structure
 */
function validateRealtimeData(data: any): string[] {
  const errors: string[] = [];

  if (!data.metrics || typeof data.metrics !== 'object') {
    errors.push('Realtime data must include a metrics object');
  } else {
    const requiredMetrics = [
      'activeSubscriptions',
      'monthlyRecurringRevenue',
      'trialConversions',
      'churnRate',
      'newSignups',
      'timestamp',
    ];

    requiredMetrics.forEach((metric) => {
      if (metric === 'timestamp') {
        if (data.metrics[metric]) {
          const date = new Date(data.metrics[metric]);
          if (Number.isNaN(date.getTime())) {
            errors.push(`Metric ${metric} must be a valid date`);
          }
        } else {
          errors.push(`Metric ${metric} is required`);
        }
      } else if (typeof data.metrics[metric] !== 'number') {
        errors.push(`Metric ${metric} must be a number`);
      }
    });
  }

  if (data.alerts && !Array.isArray(data.alerts)) {
    errors.push('Alerts must be an array');
  }

  if (data.events && !Array.isArray(data.events)) {
    errors.push('Events must be an array');
  }

  return errors;
}

/**
 * Validates the complete export request
 */
export function validateRequest(request: ExportRequest): ValidationResult {
  const errors: string[] = [];

  // Validate format
  const formatValidation = validateFormat(request.format);
  if (!formatValidation.valid) {
    errors.push(...formatValidation.errors);
  }

  // Validate type
  const typeValidation = validateType(request.type);
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // Validate options
  if (request.options) {
    const optionsValidation = validateOptions(request.options);
    if (!optionsValidation.valid) {
      errors.push(...optionsValidation.errors);
    }
  }

  // Validate data if provided
  if (request.data) {
    const dataValidation = validateData(request.data, request.type);
    if (!dataValidation.valid) {
      errors.push(...dataValidation.errors);
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Sanitizes and normalizes export options
 */
export function normalizeOptions(
  options: Partial<ExportOptions> = {},
): ExportOptions {
  return {
    format: options.format || 'csv',
    type: options.type || 'dashboard',
    title: options.title || 'Analytics Export',
    includeCharts: options.includeCharts !== false,
    includeHeader: options.includeHeader !== false,
    includeFooter: options.includeFooter !== false,
    orientation: options.orientation || 'portrait',
    dateRange: options.dateRange || undefined,
    filters: options.filters || {},
    compression: options.compression,
    password: options.password || undefined,
  };
}

/**
 * Validates file size constraints
 */
export function validateFileSize(
  data: Buffer | string,
  maxSize: number = 50 * 1024 * 1024,
): ValidationResult {
  const size = Buffer.isBuffer(data)
    ? data.length
    : Buffer.byteLength(data, 'utf8');

  if (size > maxSize) {
    return {
      valid: false,
      errors: [
        `File size (${Math.round(size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`,
      ],
    };
  }

  return { valid: true };
}

/**
 * Validates export rate limits
 */
export function validateRateLimit(
  _userId: string,
  exportHistory: Array<{ createdAt: string }>,
  limits: { maxExportsPerHour: number; maxExportsPerDay: number },
): ValidationResult {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentExports = exportHistory.filter(
    (export_) => new Date(export_.createdAt) > oneHourAgo,
  );

  const dailyExports = exportHistory.filter(
    (export_) => new Date(export_.createdAt) > oneDayAgo,
  );

  if (recentExports.length >= limits.maxExportsPerHour) {
    return {
      valid: false,
      errors: [
        `Rate limit exceeded: Maximum ${limits.maxExportsPerHour} exports per hour`,
      ],
    };
  }

  if (dailyExports.length >= limits.maxExportsPerDay) {
    return {
      valid: false,
      errors: [
        `Rate limit exceeded: Maximum ${limits.maxExportsPerDay} exports per day`,
      ],
    };
  }

  return { valid: true };
}

/**
 * Creates validation error response
 */
export function createValidationError(
  errors: string[],
  code: ExportErrorCode = ExportErrorCode.VALIDATION_FAILED,
) {
  return {
    success: false as const,
    error: errors.join('; '),
    code,
    details: { validationErrors: errors },
  };
}
