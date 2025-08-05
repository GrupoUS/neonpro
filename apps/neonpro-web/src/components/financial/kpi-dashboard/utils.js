var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.kpiUtils =
  exports.generateDrillDownHierarchy =
  exports.calculateCorrelation =
  exports.detectAnomalies =
  exports.calculateStatistics =
  exports.generateMockTimeSeries =
  exports.filterAlertsBySeverity =
  exports.sortKPIsByPriority =
  exports.getComparisonPeriod =
  exports.getDateRangeDuration =
  exports.validateDateRange =
  exports.getDateRangePresets =
  exports.calculateCAGR =
  exports.calculateGrowthRate =
  exports.calculateMovingAverage =
  exports.getTrendColor =
  exports.getStatusBgColor =
  exports.getStatusColor =
  exports.determineKPIStatus =
  exports.calculatePercentageChange =
  exports.calculateTrend =
  exports.formatKPIValue =
  exports.formatRelativeDate =
  exports.formatDate =
  exports.formatCompactNumber =
  exports.formatNumber =
  exports.formatPercentage =
  exports.formatCurrency =
    void 0;
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Currency formatting
var formatCurrency = (value, currency) => {
  if (currency === void 0) {
    currency = "BRL";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
exports.formatCurrency = formatCurrency;
// Percentage formatting
var formatPercentage = (value, precision) => {
  if (precision === void 0) {
    precision = 1;
  }
  return "".concat(value.toFixed(precision), "%");
};
exports.formatPercentage = formatPercentage;
// Number formatting
var formatNumber = (value, precision) => {
  if (precision === void 0) {
    precision = 0;
  }
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};
exports.formatNumber = formatNumber;
// Compact number formatting (K, M, B)
var formatCompactNumber = (value) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
exports.formatCompactNumber = formatCompactNumber;
// Date formatting
var formatDate = (date, formatStr) => {
  if (formatStr === void 0) {
    formatStr = "dd/MM/yyyy";
  }
  return (0, date_fns_1.format)(date, formatStr, { locale: locale_1.ptBR });
};
exports.formatDate = formatDate;
// Relative date formatting
var formatRelativeDate = (date) => {
  var now = new Date();
  var diffInDays = (0, date_fns_1.differenceInDays)(now, date);
  if (diffInDays === 0) return "Hoje";
  if (diffInDays === 1) return "Ontem";
  if (diffInDays < 7) return "".concat(diffInDays, " dias atr\u00E1s");
  if (diffInDays < 30) return "".concat(Math.floor(diffInDays / 7), " semanas atr\u00E1s");
  if (diffInDays < 365) return "".concat(Math.floor(diffInDays / 30), " meses atr\u00E1s");
  return "".concat(Math.floor(diffInDays / 365), " anos atr\u00E1s");
};
exports.formatRelativeDate = formatRelativeDate;
// KPI value formatting based on type
var formatKPIValue = (kpi) => {
  switch (kpi.format) {
    case "currency":
      return (0, exports.formatCurrency)(kpi.value);
    case "percentage":
      return (0, exports.formatPercentage)(kpi.value, kpi.precision || 1);
    case "number":
      return (0, exports.formatNumber)(kpi.value, kpi.precision || 0);
    default:
      return kpi.value.toString();
  }
};
exports.formatKPIValue = formatKPIValue;
// Calculate trend direction
var calculateTrend = (current, previous) => {
  var threshold = 0.01; // 1% threshold for stability
  var change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < threshold) return "stable";
  return change > 0 ? "up" : "down";
};
exports.calculateTrend = calculateTrend;
// Calculate percentage change
var calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
exports.calculatePercentageChange = calculatePercentageChange;
// Determine KPI status based on value and thresholds
var determineKPIStatus = (value, target, thresholds) => {
  if (thresholds) {
    if (value <= thresholds.critical) return "critical";
    if (value <= thresholds.warning) return "warning";
    return "good";
  }
  if (target) {
    var achievement = (value / target) * 100;
    if (achievement < 70) return "critical";
    if (achievement < 90) return "warning";
    return "good";
  }
  return "good";
};
exports.determineKPIStatus = determineKPIStatus;
// Generate color based on status
var getStatusColor = (status) => {
  switch (status) {
    case "good":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "critical":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
exports.getStatusColor = getStatusColor;
// Generate background color based on status
var getStatusBgColor = (status) => {
  switch (status) {
    case "good":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "critical":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};
exports.getStatusBgColor = getStatusBgColor;
// Generate trend color
var getTrendColor = (trend, isPositive) => {
  if (isPositive === void 0) {
    isPositive = true;
  }
  if (trend === "stable") return "text-gray-600";
  var isGoodTrend = (trend === "up" && isPositive) || (trend === "down" && !isPositive);
  return isGoodTrend ? "text-green-600" : "text-red-600";
};
exports.getTrendColor = getTrendColor;
// Calculate moving average
var calculateMovingAverage = (data, window) => {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    var start = Math.max(0, i - window + 1);
    var subset = data.slice(start, i + 1);
    var average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    result.push(average);
  }
  return result;
};
exports.calculateMovingAverage = calculateMovingAverage;
// Calculate growth rate
var calculateGrowthRate = (current, previous, periods) => {
  if (periods === void 0) {
    periods = 1;
  }
  if (previous === 0) return 0;
  return ((current / previous) ** (1 / periods) - 1) * 100;
};
exports.calculateGrowthRate = calculateGrowthRate;
// Calculate compound annual growth rate (CAGR)
var calculateCAGR = (endValue, startValue, years) => {
  if (startValue === 0 || years === 0) return 0;
  return ((endValue / startValue) ** (1 / years) - 1) * 100;
};
exports.calculateCAGR = calculateCAGR;
// Generate date range presets
var getDateRangePresets = () => {
  var now = new Date();
  return {
    today: {
      start: now,
      end: now,
      preset: "today",
    },
    yesterday: {
      start: (0, date_fns_1.addDays)(now, -1),
      end: (0, date_fns_1.addDays)(now, -1),
      preset: "yesterday",
    },
    "last-7-days": {
      start: (0, date_fns_1.addDays)(now, -6),
      end: now,
      preset: "last-7-days",
    },
    "last-30-days": {
      start: (0, date_fns_1.addDays)(now, -29),
      end: now,
      preset: "last-30-days",
    },
    "current-month": {
      start: (0, date_fns_1.startOfMonth)(now),
      end: (0, date_fns_1.endOfMonth)(now),
      preset: "current-month",
    },
    "last-month": {
      start: (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1)),
      end: (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1)),
      preset: "last-month",
    },
  };
};
exports.getDateRangePresets = getDateRangePresets;
// Validate date range
var validateDateRange = (dateRange) => dateRange.start <= dateRange.end;
exports.validateDateRange = validateDateRange;
// Calculate date range duration in days
var getDateRangeDuration = (dateRange) =>
  (0, date_fns_1.differenceInDays)(dateRange.end, dateRange.start) + 1;
exports.getDateRangeDuration = getDateRangeDuration;
// Generate comparison period
var getComparisonPeriod = (dateRange) => {
  var duration = (0, exports.getDateRangeDuration)(dateRange);
  var comparisonEnd = (0, date_fns_1.addDays)(dateRange.start, -1);
  var comparisonStart = (0, date_fns_1.addDays)(comparisonEnd, -duration + 1);
  return {
    start: comparisonStart,
    end: comparisonEnd,
    preset: "comparison",
  };
};
exports.getComparisonPeriod = getComparisonPeriod;
// Sort KPIs by priority
var sortKPIsByPriority = (kpis) => {
  var priorityOrder = { critical: 0, warning: 1, good: 2 };
  return __spreadArray([], kpis, true).sort((a, b) => {
    // First by status priority
    var statusDiff = priorityOrder[a.status] - priorityOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    // Then by absolute change (descending)
    return Math.abs(b.change) - Math.abs(a.change);
  });
};
exports.sortKPIsByPriority = sortKPIsByPriority;
// Filter alerts by severity
var filterAlertsBySeverity = (alerts, minSeverity) => {
  var severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  var minLevel = severityOrder[minSeverity];
  return alerts.filter((alert) => severityOrder[alert.severity] >= minLevel);
};
exports.filterAlertsBySeverity = filterAlertsBySeverity;
// Generate mock time series data
var generateMockTimeSeries = (baseValue, days, volatility, trend) => {
  if (volatility === void 0) {
    volatility = 0.1;
  }
  if (trend === void 0) {
    trend = 0;
  }
  var data = [];
  var now = new Date();
  for (var i = days - 1; i >= 0; i--) {
    var date = (0, date_fns_1.addDays)(now, -i);
    var trendEffect = (days - i) * trend;
    var randomEffect = (Math.random() - 0.5) * volatility * baseValue;
    var value = baseValue + trendEffect + randomEffect;
    data.push({
      timestamp: date,
      value: Math.max(0, value),
      target: baseValue * 1.1, // 10% above base as target
      previous: baseValue * 0.95, // 5% below base as previous period
    });
  }
  return data;
};
exports.generateMockTimeSeries = generateMockTimeSeries;
// Calculate statistical measures
var calculateStatistics = (values) => {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      variance: 0,
    };
  }
  var sorted = __spreadArray([], values, true).sort((a, b) => a - b);
  var mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  var median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  var variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  var stdDev = Math.sqrt(variance);
  return {
    mean: mean,
    median: median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev: stdDev,
    variance: variance,
  };
};
exports.calculateStatistics = calculateStatistics;
// Detect anomalies using z-score
var detectAnomalies = (values, threshold) => {
  if (threshold === void 0) {
    threshold = 2;
  }
  var stats = (0, exports.calculateStatistics)(values);
  return values
    .map((value, index) => {
      var zScore = Math.abs((value - stats.mean) / stats.stdDev);
      return zScore > threshold ? index : -1;
    })
    .filter((index) => index !== -1);
};
exports.detectAnomalies = detectAnomalies;
// Calculate correlation between two series
var calculateCorrelation = (x, y) => {
  if (x.length !== y.length || x.length === 0) return 0;
  var n = x.length;
  var sumX = x.reduce((sum, val) => sum + val, 0);
  var sumY = y.reduce((sum, val) => sum + val, 0);
  var sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  var sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  var sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  var numerator = n * sumXY - sumX * sumY;
  var denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
};
exports.calculateCorrelation = calculateCorrelation;
// Generate drill-down hierarchy
var generateDrillDownHierarchy = (data) => {
  var hierarchy = {};
  // Group by category
  data.forEach((item) => {
    if (!hierarchy[item.category]) {
      hierarchy[item.category] = [];
    }
    hierarchy[item.category].push(item);
  });
  // Create category nodes with children
  return Object.entries(hierarchy).map((_a) => {
    var category = _a[0],
      items = _a[1];
    return {
      id: "category-".concat(category),
      label: category,
      value: items.reduce((sum, item) => sum + item.value, 0),
      change: items.reduce((sum, item) => sum + item.change, 0) / items.length,
      trend: "stable",
      category: category,
      details: {
        itemCount: items.length,
        avgValue: items.reduce((sum, item) => sum + item.value, 0) / items.length,
      },
      children: items,
    };
  });
};
exports.generateDrillDownHierarchy = generateDrillDownHierarchy;
// Export utilities for external use
exports.kpiUtils = {
  formatCurrency: exports.formatCurrency,
  formatPercentage: exports.formatPercentage,
  formatNumber: exports.formatNumber,
  formatCompactNumber: exports.formatCompactNumber,
  formatDate: exports.formatDate,
  formatRelativeDate: exports.formatRelativeDate,
  formatKPIValue: exports.formatKPIValue,
  calculateTrend: exports.calculateTrend,
  calculatePercentageChange: exports.calculatePercentageChange,
  determineKPIStatus: exports.determineKPIStatus,
  getStatusColor: exports.getStatusColor,
  getStatusBgColor: exports.getStatusBgColor,
  getTrendColor: exports.getTrendColor,
  calculateMovingAverage: exports.calculateMovingAverage,
  calculateGrowthRate: exports.calculateGrowthRate,
  calculateCAGR: exports.calculateCAGR,
  getDateRangePresets: exports.getDateRangePresets,
  validateDateRange: exports.validateDateRange,
  getDateRangeDuration: exports.getDateRangeDuration,
  getComparisonPeriod: exports.getComparisonPeriod,
  sortKPIsByPriority: exports.sortKPIsByPriority,
  filterAlertsBySeverity: exports.filterAlertsBySeverity,
  generateMockTimeSeries: exports.generateMockTimeSeries,
  calculateStatistics: exports.calculateStatistics,
  detectAnomalies: exports.detectAnomalies,
  calculateCorrelation: exports.calculateCorrelation,
  generateDrillDownHierarchy: exports.generateDrillDownHierarchy,
};
exports.default = exports.kpiUtils;
