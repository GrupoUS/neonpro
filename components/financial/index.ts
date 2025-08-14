/**
 * TASK-003: Business Logic Enhancement
 * Financial Module Index
 * 
 * Central export point for all financial components and utilities.
 * Provides a clean interface for importing financial features throughout the app.
 */

// Core Financial Components
export { IntelligentInvoicing } from './IntelligentInvoicing.tsx';
export { IntelligentScheduling } from './IntelligentScheduling.tsx';
export { FinancialAnalytics } from './FinancialAnalytics.tsx';

// Type Definitions
export interface FinancialModuleConfig {
  clinicId: string;
  currency: 'BRL' | 'USD' | 'EUR';
  taxRate: number;
  defaultPaymentTerms: number; // days
  enablePredictiveAnalytics: boolean;
  enableAIRecommendations: boolean;
}

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

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  aiScore?: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  activePatients: number;
  averageTicket: number;
  conversionRate: number;
  period: string;
}

// Utility Functions
export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.discount / 100), 0);
  const totalTax = items.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    const discountedTotal = itemTotal - (itemTotal * item.discount / 100);
    return sum + (discountedTotal * item.taxRate / 100);
  }, 0);
  const total = subtotal - totalDiscount + totalTax;
  
  return {
    subtotal,
    totalDiscount,
    totalTax,
    total
  };
};

// Appointment validation functions
export const validateAppointmentSlot = (datetime: string, durationMinutes: number): boolean => {
  try {
    // Check if datetime is in the future
    const appointmentDate = new Date(datetime);
    const now = new Date();
    
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

// Constants
export const FINANCIAL_CONSTANTS = {
  DEFAULT_TAX_RATE: 0.0, // 0% by default for medical services
  DEFAULT_PAYMENT_TERMS: 30, // 30 days
  MIN_INVOICE_AMOUNT: 10.00,
  MAX_DISCOUNT_PERCENTAGE: 50,
  CURRENCY_SYMBOL: 'R$',
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm'
} as const;

// AI Configuration
export const AI_CONFIG = {
  SCHEDULING: {
    SCORE_THRESHOLD: 70, // Minimum AI score for recommendations
    MAX_RECOMMENDATIONS: 3,
    CONFLICT_DETECTION: true,
    LOAD_BALANCING: true
  },
  INVOICING: {
    AUTO_TEMPLATE_SELECTION: true,
    SMART_PRICING: false, // Feature flag for dynamic pricing
    COMPLIANCE_CHECK: true
  },
  ANALYTICS: {
    PREDICTIVE_INSIGHTS: true,
    REAL_TIME_UPDATES: true,
    TREND_ANALYSIS_DAYS: 30,
    CONFIDENCE_THRESHOLD: 75
  }
} as const;