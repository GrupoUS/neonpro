/**
 * TASK-003: Business Logic Enhancement
 * Financial Utilities
 *
 * Pure utility functions for financial operations without React dependencies.
 * This ensures they can be tested independently and imported without JSX complications.
 */

// Appointment validation functions
export const validateAppointmentSlot = (datetime: string, durationMinutes: number): boolean => {
  try {
    // Check if datetime is in the future
    // Convert ISO string to timestamp manually to avoid mocked Date constructor
    const appointmentTimestamp = Date.parse(datetime); // Date.parse works with mocked environment
    const now = Date.now(); // Use Date.now() which can be mocked

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

// Utility Functions
export const formatCurrency = (value: number, currency: string = "BRL"): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export interface InvoiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export const calculateTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.discount) / 100,
    0,
  );
  const totalTax = items.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    const discountedTotal = itemTotal - (itemTotal * item.discount) / 100;
    return sum + (discountedTotal * item.taxRate) / 100;
  }, 0);
  const total = subtotal - totalDiscount + totalTax;

  return {
    subtotal,
    totalDiscount,
    totalTax,
    total,
  };
};

// Constants
export const FINANCIAL_CONSTANTS = {
  DEFAULT_TAX_RATE: 0.0, // 0% by default for medical services
  DEFAULT_PAYMENT_TERMS: 30, // 30 days
  MIN_INVOICE_AMOUNT: 10.0,
  MAX_DISCOUNT_PERCENTAGE: 50,
  CURRENCY_SYMBOL: "R$",
  DATE_FORMAT: "dd/MM/yyyy",
  TIME_FORMAT: "HH:mm",
} as const;

// AI Configuration
export const AI_CONFIG = {
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
} as const;
