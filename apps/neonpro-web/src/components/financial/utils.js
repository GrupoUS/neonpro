"use strict";
/**
 * TASK-003: Business Logic Enhancement
 * Financial Utilities
 *
 * Pure utility functions for financial operations without React dependencies.
 * This ensures they can be tested independently and imported without JSX complications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CONFIG =
  exports.FINANCIAL_CONSTANTS =
  exports.calculateTotals =
  exports.formatPercentage =
  exports.formatCurrency =
  exports.validateAppointmentSlot =
    void 0;
// Appointment validation functions
var validateAppointmentSlot = function (datetime, durationMinutes) {
  try {
    // Check if datetime is in the future
    // Convert ISO string to timestamp manually to avoid mocked Date constructor
    var appointmentTimestamp = Date.parse(datetime); // Date.parse works with mocked environment
    var now = Date.now(); // Use Date.now() which can be mocked
    if (appointmentTimestamp <= now) {
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
// Utility Functions
var formatCurrency = function (value, currency) {
  if (currency === void 0) {
    currency = "BRL";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value);
};
exports.formatCurrency = formatCurrency;
var formatPercentage = function (value) {
  return "".concat(value.toFixed(1), "%");
};
exports.formatPercentage = formatPercentage;
var calculateTotals = function (items) {
  var subtotal = items.reduce(function (sum, item) {
    return sum + item.total;
  }, 0);
  var totalDiscount = items.reduce(function (sum, item) {
    return sum + (item.unitPrice * item.quantity * item.discount) / 100;
  }, 0);
  var totalTax = items.reduce(function (sum, item) {
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
