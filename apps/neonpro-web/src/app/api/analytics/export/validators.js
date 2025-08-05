Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFormat = validateFormat;
exports.validateType = validateType;
exports.validateOptions = validateOptions;
exports.validateData = validateData;
exports.validateRequest = validateRequest;
exports.normalizeOptions = normalizeOptions;
exports.validateFileSize = validateFileSize;
exports.validateRateLimit = validateRateLimit;
exports.createValidationError = createValidationError;
var types_1 = require("./types");
/**
 * Validates the export format
 */
function validateFormat(format) {
  if (!format) {
    return { valid: false, errors: ["Format is required"] };
  }
  if (!types_1.SUPPORTED_FORMATS.includes(format)) {
    return {
      valid: false,
      errors: [
        "Unsupported format: "
          .concat(format, ". Supported formats: ")
          .concat(types_1.SUPPORTED_FORMATS.join(", ")),
      ],
    };
  }
  return { valid: true };
}
/**
 * Validates the export type
 */
function validateType(type) {
  if (!type) {
    return { valid: false, errors: ["Type is required"] };
  }
  if (!types_1.SUPPORTED_TYPES.includes(type)) {
    return {
      valid: false,
      errors: [
        "Unsupported type: "
          .concat(type, ". Supported types: ")
          .concat(types_1.SUPPORTED_TYPES.join(", ")),
      ],
    };
  }
  return { valid: true };
}
/**
 * Validates export options
 */
function validateOptions(options) {
  var errors = [];
  if (options && typeof options === "object") {
    // Validate orientation
    if (options.orientation && !["portrait", "landscape"].includes(options.orientation)) {
      errors.push('Orientation must be either "portrait" or "landscape"');
    }
    // Validate date range
    if (options.dateRange) {
      if (!options.dateRange.start || !options.dateRange.end) {
        errors.push("Date range must include both start and end dates");
      } else {
        var startDate = new Date(options.dateRange.start);
        var endDate = new Date(options.dateRange.end);
        if (Number.isNaN(startDate.getTime())) {
          errors.push("Invalid start date format");
        }
        if (Number.isNaN(endDate.getTime())) {
          errors.push("Invalid end date format");
        }
        if (startDate > endDate) {
          errors.push("Start date must be before end date");
        }
      }
    }
    // Validate title length
    if (options.title && typeof options.title === "string" && options.title.length > 100) {
      errors.push("Title must be 100 characters or less");
    }
    // Validate boolean options
    var booleanOptions = ["includeCharts", "includeHeader", "includeFooter", "compression"];
    booleanOptions.forEach((option) => {
      if (options[option] !== undefined && typeof options[option] !== "boolean") {
        errors.push("".concat(option, " must be a boolean value"));
      }
    });
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors: errors };
}
/**
 * Validates export data based on type
 */
function validateData(data, type) {
  if (!data) {
    return { valid: false, errors: ["Data is required"] };
  }
  if (typeof data !== "object") {
    return { valid: false, errors: ["Data must be an object"] };
  }
  var errors = [];
  switch (type) {
    case "cohort":
      errors.push.apply(errors, validateCohortData(data));
      break;
    case "forecast":
      errors.push.apply(errors, validateForecastData(data));
      break;
    case "insights":
      errors.push.apply(errors, validateInsightsData(data));
      break;
    case "dashboard":
      errors.push.apply(errors, validateDashboardData(data));
      break;
    case "realtime":
      errors.push.apply(errors, validateRealtimeData(data));
      break;
    default:
      errors.push("Unknown data type: ".concat(type));
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors: errors };
}
/**
 * Validates cohort data structure
 */
function validateCohortData(data) {
  var errors = [];
  if (!data.metrics || !Array.isArray(data.metrics)) {
    errors.push("Cohort data must include a metrics array");
  } else {
    data.metrics.forEach((metric, index) => {
      if (!metric.cohortId) {
        errors.push("Metric ".concat(index, ": cohortId is required"));
      }
      if (typeof metric.totalUsers !== "number" || metric.totalUsers < 0) {
        errors.push("Metric ".concat(index, ": totalUsers must be a non-negative number"));
      }
      if (
        typeof metric.retentionRate !== "number" ||
        metric.retentionRate < 0 ||
        metric.retentionRate > 100
      ) {
        errors.push("Metric ".concat(index, ": retentionRate must be a number between 0 and 100"));
      }
      if (typeof metric.revenue !== "number" || metric.revenue < 0) {
        errors.push("Metric ".concat(index, ": revenue must be a non-negative number"));
      }
      if (typeof metric.churnRate !== "number" || metric.churnRate < 0 || metric.churnRate > 100) {
        errors.push("Metric ".concat(index, ": churnRate must be a number between 0 and 100"));
      }
    });
  }
  if (data.insights && !Array.isArray(data.insights)) {
    errors.push("Insights must be an array");
  }
  if (data.statistics && typeof data.statistics !== "object") {
    errors.push("Statistics must be an object");
  }
  return errors;
}
/**
 * Validates forecast data structure
 */
function validateForecastData(data) {
  var errors = [];
  if (!data.model || typeof data.model !== "string") {
    errors.push("Forecast data must include a model name");
  }
  if (!data.predictions || !Array.isArray(data.predictions)) {
    errors.push("Forecast data must include a predictions array");
  } else {
    data.predictions.forEach((prediction, index) => {
      if (!prediction.date) {
        errors.push("Prediction ".concat(index, ": date is required"));
      } else {
        var date = new Date(prediction.date);
        if (Number.isNaN(date.getTime())) {
          errors.push("Prediction ".concat(index, ": invalid date format"));
        }
      }
      if (typeof prediction.value !== "number") {
        errors.push("Prediction ".concat(index, ": value must be a number"));
      }
      if (prediction.confidence !== undefined) {
        if (
          typeof prediction.confidence !== "number" ||
          prediction.confidence < 0 ||
          prediction.confidence > 1
        ) {
          errors.push("Prediction ".concat(index, ": confidence must be a number between 0 and 1"));
        }
      }
    });
  }
  if (data.evaluation && typeof data.evaluation !== "object") {
    errors.push("Evaluation must be an object");
  }
  return errors;
}
/**
 * Validates insights data structure
 */
function validateInsightsData(data) {
  var errors = [];
  if (data.correlations && !Array.isArray(data.correlations)) {
    errors.push("Correlations must be an array");
  } else if (data.correlations) {
    data.correlations.forEach((corr, index) => {
      if (!corr.metric1 || !corr.metric2) {
        errors.push("Correlation ".concat(index, ": both metric1 and metric2 are required"));
      }
      if (typeof corr.correlation !== "number" || corr.correlation < -1 || corr.correlation > 1) {
        errors.push(
          "Correlation ".concat(index, ": correlation must be a number between -1 and 1"),
        );
      }
    });
  }
  if (data.anomalies && !Array.isArray(data.anomalies)) {
    errors.push("Anomalies must be an array");
  } else if (data.anomalies) {
    data.anomalies.forEach((anomaly, index) => {
      if (!anomaly.metric) {
        errors.push("Anomaly ".concat(index, ": metric is required"));
      }
      if (!anomaly.timestamp) {
        errors.push("Anomaly ".concat(index, ": timestamp is required"));
      }
      if (typeof anomaly.value !== "number") {
        errors.push("Anomaly ".concat(index, ": value must be a number"));
      }
      if (typeof anomaly.expectedValue !== "number") {
        errors.push("Anomaly ".concat(index, ": expectedValue must be a number"));
      }
      if (anomaly.severity && !["Low", "Medium", "High", "Critical"].includes(anomaly.severity)) {
        errors.push("Anomaly ".concat(index, ": severity must be Low, Medium, High, or Critical"));
      }
    });
  }
  if (data.predictions && !Array.isArray(data.predictions)) {
    errors.push("Predictions must be an array");
  }
  if (data.recommendations && !Array.isArray(data.recommendations)) {
    errors.push("Recommendations must be an array");
  }
  return errors;
}
/**
 * Validates dashboard data structure
 */
function validateDashboardData(data) {
  var errors = [];
  if (!data.kpis || typeof data.kpis !== "object") {
    errors.push("Dashboard data must include a kpis object");
  } else {
    // Validate common KPI fields
    var numericKPIs = [
      "activeSubscriptions",
      "monthlyRecurringRevenue",
      "trialConversions",
      "churnRate",
      "newSignups",
      "conversionRate",
      "averageRevenuePerUser",
      "customerLifetimeValue",
    ];
    numericKPIs.forEach((kpi) => {
      if (data.kpis[kpi] !== undefined && typeof data.kpis[kpi] !== "number") {
        errors.push("KPI ".concat(kpi, " must be a number"));
      }
    });
  }
  if (data.cohorts && !Array.isArray(data.cohorts)) {
    errors.push("Cohorts must be an array");
  }
  if (data.forecasts && !Array.isArray(data.forecasts)) {
    errors.push("Forecasts must be an array");
  }
  if (data.insights && !Array.isArray(data.insights)) {
    errors.push("Insights must be an array");
  }
  return errors;
}
/**
 * Validates realtime data structure
 */
function validateRealtimeData(data) {
  var errors = [];
  if (!data.metrics || typeof data.metrics !== "object") {
    errors.push("Realtime data must include a metrics object");
  } else {
    var requiredMetrics = [
      "activeSubscriptions",
      "monthlyRecurringRevenue",
      "trialConversions",
      "churnRate",
      "newSignups",
      "timestamp",
    ];
    requiredMetrics.forEach((metric) => {
      if (metric === "timestamp") {
        if (!data.metrics[metric]) {
          errors.push("Metric ".concat(metric, " is required"));
        } else {
          var date = new Date(data.metrics[metric]);
          if (Number.isNaN(date.getTime())) {
            errors.push("Metric ".concat(metric, " must be a valid date"));
          }
        }
      } else {
        if (typeof data.metrics[metric] !== "number") {
          errors.push("Metric ".concat(metric, " must be a number"));
        }
      }
    });
  }
  if (data.alerts && !Array.isArray(data.alerts)) {
    errors.push("Alerts must be an array");
  }
  if (data.events && !Array.isArray(data.events)) {
    errors.push("Events must be an array");
  }
  return errors;
}
/**
 * Validates the complete export request
 */
function validateRequest(request) {
  var errors = [];
  // Validate format
  var formatValidation = validateFormat(request.format);
  if (!formatValidation.valid) {
    errors.push.apply(errors, formatValidation.errors);
  }
  // Validate type
  var typeValidation = validateType(request.type);
  if (!typeValidation.valid) {
    errors.push.apply(errors, typeValidation.errors);
  }
  // Validate options
  if (request.options) {
    var optionsValidation = validateOptions(request.options);
    if (!optionsValidation.valid) {
      errors.push.apply(errors, optionsValidation.errors);
    }
  }
  // Validate data if provided
  if (request.data) {
    var dataValidation = validateData(request.data, request.type);
    if (!dataValidation.valid) {
      errors.push.apply(errors, dataValidation.errors);
    }
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors: errors };
}
/**
 * Sanitizes and normalizes export options
 */
function normalizeOptions(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    format: options.format || "csv",
    type: options.type || "dashboard",
    title: options.title || "Analytics Export",
    includeCharts: options.includeCharts !== false,
    includeHeader: options.includeHeader !== false,
    includeFooter: options.includeFooter !== false,
    orientation: options.orientation || "portrait",
    dateRange: options.dateRange || undefined,
    filters: options.filters || {},
    compression: options.compression || false,
    password: options.password || undefined,
  };
}
/**
 * Validates file size constraints
 */
function validateFileSize(data, maxSize) {
  if (maxSize === void 0) {
    maxSize = 50 * 1024 * 1024;
  }
  var size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data, "utf8");
  if (size > maxSize) {
    return {
      valid: false,
      errors: [
        "File size ("
          .concat(Math.round(size / 1024 / 1024), "MB) exceeds maximum allowed size (")
          .concat(Math.round(maxSize / 1024 / 1024), "MB)"),
      ],
    };
  }
  return { valid: true };
}
/**
 * Validates export rate limits
 */
function validateRateLimit(_userId, exportHistory, limits) {
  var now = new Date();
  var oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  var oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  var recentExports = exportHistory.filter((export_) => new Date(export_.createdAt) > oneHourAgo);
  var dailyExports = exportHistory.filter((export_) => new Date(export_.createdAt) > oneDayAgo);
  if (recentExports.length >= limits.maxExportsPerHour) {
    return {
      valid: false,
      errors: [
        "Rate limit exceeded: Maximum ".concat(limits.maxExportsPerHour, " exports per hour"),
      ],
    };
  }
  if (dailyExports.length >= limits.maxExportsPerDay) {
    return {
      valid: false,
      errors: ["Rate limit exceeded: Maximum ".concat(limits.maxExportsPerDay, " exports per day")],
    };
  }
  return { valid: true };
}
/**
 * Creates validation error response
 */
function createValidationError(errors, code) {
  if (code === void 0) {
    code = types_1.ExportErrorCode.VALIDATION_FAILED;
  }
  return {
    success: false,
    error: errors.join("; "),
    code: code,
    details: { validationErrors: errors },
  };
}
