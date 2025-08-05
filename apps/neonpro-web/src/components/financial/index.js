/**
 * TASK-003: Business Logic Enhancement
 * Financial Module Index
 *
 * Central export point for all financial components and utilities.
 * Provides a clean interface for importing financial features throughout the app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CONFIG =
  exports.FINANCIAL_CONSTANTS =
  exports.validateAppointmentSlot =
  exports.calculateTotals =
  exports.formatPercentage =
  exports.formatCurrency =
  exports.FinancialAnalytics =
  exports.IntelligentScheduling =
  exports.IntelligentInvoicing =
    void 0;
// Core Financial Components
var IntelligentInvoicing_tsx_1 = require("./IntelligentInvoicing.tsx");
Object.defineProperty(exports, "IntelligentInvoicing", {
  enumerable: true,
  get: () => IntelligentInvoicing_tsx_1.IntelligentInvoicing,
});
var IntelligentScheduling_tsx_1 = require("./IntelligentScheduling.tsx");
Object.defineProperty(exports, "IntelligentScheduling", {
  enumerable: true,
  get: () => IntelligentScheduling_tsx_1.IntelligentScheduling,
});
var FinancialAnalytics_tsx_1 = require("./FinancialAnalytics.tsx");
Object.defineProperty(exports, "FinancialAnalytics", {
  enumerable: true,
  get: () => FinancialAnalytics_tsx_1.FinancialAnalytics,
});
// Utility Functions
var formatCurrency = (value, currency) => {
  if (currency === void 0) {
    currency = "BRL";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value);
};
exports.formatCurrency = formatCurrency;
var formatPercentage = (value) => "".concat(value.toFixed(1), "%");
exports.formatPercentage = formatPercentage;
var calculateTotals = (items) => {
  var subtotal = items.reduce((sum, item) => sum + item.total, 0);
  var totalDiscount = items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.discount) / 100,
    0,
  );
  var totalTax = items.reduce((sum, item) => {
    var itemTotal = item.unitPrice * item.quantity;
    var discountedTotal = itemTotal - (itemTotal * item.discount) / 100;
    return sum + (discountedTotal * item.taxRate) / 100;
  }, 0);
  var total = subtotal - totalDiscount + totalTax;
  return {
    subtotal: subtotal,
    totalDiscount: totalDiscount,
    totalTax: totalTax,
    total: total,
  };
};
exports.calculateTotals = calculateTotals;
// Appointment validation functions
var validateAppointmentSlot = (datetime, durationMinutes) => {
  try {
    // Check if datetime is in the future
    var appointmentDate = new Date(datetime);
    var now = new Date();
    if (appointmentDate <= now) {
      return false;
    }
    // Check duration is valid (between 15 and 480 minutes, and multiple of 15)
    if (durationMinutes < 15 || durationMinutes > 480) {
      return false;
    }
    if (durationMinutes % 15 !== 0) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
exports.validateAppointmentSlot = validateAppointmentSlot;
// Constants
exports.FINANCIAL_CONSTANTS = {
  DEFAULT_TAX_RATE: 0.0, // 0% by default for medical services
  DEFAULT_PAYMENT_TERMS: 30, // 30 days
  MIN_INVOICE_AMOUNT: 10.0,
  MAX_DISCOUNT_PERCENTAGE: 50,
  CURRENCY_SYMBOL: "R$",
  DATE_FORMAT: "dd/MM/yyyy",
  TIME_FORMAT: "HH:mm",
};
// AI Configuration
exports.AI_CONFIG = {
  SCHEDULING: {
    SCORE_THRESHOLD: 70, // Minimum AI score for recommendations
    MAX_RECOMMENDATIONS: 3,
    CONFLICT_DETECTION: true,
    LOAD_BALANCING: true,
  },
  INVOICING: {
    AUTO_TEMPLATE_SELECTION: true,
    SMART_PRICING: false, // Feature flag for dynamic pricing
    COMPLIANCE_CHECK: true,
  },
  ANALYTICS: {
    PREDICTIVE_INSIGHTS: true,
    REAL_TIME_UPDATES: true,
    TREND_ANALYSIS_DAYS: 30,
    CONFIDENCE_THRESHOLD: 75,
  },
};
