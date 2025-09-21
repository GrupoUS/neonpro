/**
 * Dynamic Pricing Rules Types
 * Types for flexible pricing engine with time-based and professional-specific pricing
 */

export type PricingRuleType =
  | 'time_based' // Different prices based on time of day/week
  | 'professional' // Professional-specific pricing tiers
  | 'duration' // Price based on service duration
  | 'package' // Package/bundle pricing
  | 'seasonal' // Seasonal pricing adjustments
  | 'loyalty' // Loyalty program discounts
  | 'first_time' // First-time client discounts
  | 'group'; // Group booking discounts

export type PricingCondition = {
  field: string;
  operator:
    | 'equals'
    | 'greater_than'
    | 'less_than'
    | 'between'
    | 'in'
    | 'not_in';
  value: string | number | string[] | number[];
};

export type PricingAdjustment = {
  type: 'percentage' | 'fixed_amount' | 'override';
  value: number;
  description?: string;
};

export interface PricingRule {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  rule_type: PricingRuleType;
  priority: number; // Higher number = higher priority
  is_active: boolean;

  // Conditions that must be met for rule to apply
  conditions: PricingCondition[];

  // Price adjustment when conditions are met
  adjustment: PricingAdjustment;

  // Optional: specific services this rule applies to
  service_ids?: string[];

  // Optional: specific professionals this rule applies to
  professional_ids?: string[];

  // Time-based conditions
  time_conditions?: {
    days_of_week?: number[]; // 0-6, Sunday = 0
    time_start?: string; // HH:MM format
    time_end?: string; // HH:MM format
    date_start?: string; // YYYY-MM-DD format
    date_end?: string; // YYYY-MM-DD format
  };

  // Usage limits
  usage_limits?: {
    max_uses_per_client?: number;
    max_uses_total?: number;
    current_uses?: number;
  };

  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PricingCalculation {
  base_price: number;
  applied_rules: {
    rule_id: string;
    rule_name: string;
    adjustment: PricingAdjustment;
    calculated_adjustment: number;
  }[];
  final_price: number;
  savings: number;
}

export interface CreatePricingRuleRequest {
  name: string;
  description?: string;
  rule_type: PricingRuleType;
  priority: number;
  conditions: PricingCondition[];
  adjustment: PricingAdjustment;
  service_ids?: string[];
  professional_ids?: string[];
  time_conditions?: PricingRule['time_conditions'];
  usage_limits?: PricingRule['usage_limits'];
}

export interface UpdatePricingRuleRequest extends Partial<CreatePricingRuleRequest> {
  is_active?: boolean;
}

export interface PricingRuleFilters {
  rule_type?: PricingRuleType;
  is_active?: boolean;
  service_id?: string;
  professional_id?: string;
  search?: string;
}

// Predefined pricing rule templates
export const _PRICING_RULE_TEMPLATES = {
  HAPPY_HOUR: {
    name: 'Happy Hour Discount',
    rule_type: 'time_based' as PricingRuleType,
    time_conditions: {
      days_of_week: [1, 2, 3], // Monday to Wednesday
      time_start: '14:00',
      time_end: '16:00',
    },
    adjustment: {
      type: 'percentage' as const,
      value: 20,
      description: '20% off during slow hours',
    },
  },

  FIRST_TIME_CLIENT: {
    name: 'First Time Client Discount',
    rule_type: 'first_time' as PricingRuleType,
    adjustment: {
      type: 'percentage' as const,
      value: 15,
      description: '15% off for new clients',
    },
    usage_limits: {
      max_uses_per_client: 1,
    },
  },

  PREMIUM_PROFESSIONAL: {
    name: 'Premium Professional Surcharge',
    rule_type: 'professional' as PricingRuleType,
    adjustment: {
      type: 'percentage' as const,
      value: 25,
      description: '25% premium for senior professionals',
    },
  },

  WEEKEND_PREMIUM: {
    name: 'Weekend Premium',
    rule_type: 'time_based' as PricingRuleType,
    time_conditions: {
      days_of_week: [0, 6], // Sunday and Saturday
    },
    adjustment: {
      type: 'percentage' as const,
      value: 15,
      description: '15% premium for weekend appointments',
    },
  },
} as const;

// Utility functions
export function calculatePricing(
  basePrice: number,
  rules: PricingRule[],
  _context: {
    service_id?: string;
    professional_id?: string;
    appointment_date?: Date;
    client_id?: string;
    is_first_time_client?: boolean;
  },
): PricingCalculation {
  const appliedRules: PricingCalculation['applied_rules'] = [];
  let currentPrice = basePrice;

  // Sort rules by priority (highest first)
  const sortedRules = rules
    .filter(rule => rule.is_active)
    .sort(_(a,_b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    if (shouldApplyRule(rule, _context)) {
      const adjustment = calculateAdjustment(rule.adjustment, currentPrice);
      appliedRules.push({
        rule_id: rule.id,
        rule_name: rule.name,
        adjustment: rule.adjustment,
        calculated_adjustment: adjustment,
      });

      if (rule.adjustment.type === 'override') {
        currentPrice = rule.adjustment.value;
      } else {
        currentPrice += adjustment;
      }
    }
  }

  return {
    base_price: basePrice,
    applied_rules: appliedRules,
    final_price: Math.max(0, currentPrice), // Ensure price doesn't go negative
    savings: basePrice - currentPrice,
  };
}

function shouldApplyRule(rule: PricingRule, _context: any): boolean {
  // Check service restrictions
  if (
    rule.service_ids?.length
    && context.service_id
    && !rule.service_ids.includes(context.service_id)
  ) {
    return false;
  }

  // Check professional restrictions
  if (
    rule.professional_ids?.length
    && context.professional_id
    && !rule.professional_ids.includes(context.professional_id)
  ) {
    return false;
  }

  // Check time conditions
  if (rule.time_conditions && context.appointment_date) {
    const date = new Date(context.appointment_date);
    const dayOfWeek = date.getDay();
    const timeStr = date.toTimeString().slice(0, 5); // HH:MM format

    if (
      rule.time_conditions.days_of_week
      && !rule.time_conditions.days_of_week.includes(dayOfWeek)
    ) {
      return false;
    }

    if (
      rule.time_conditions.time_start
      && timeStr < rule.time_conditions.time_start
    ) {
      return false;
    }

    if (
      rule.time_conditions.time_end
      && timeStr > rule.time_conditions.time_end
    ) {
      return false;
    }
  }

  // Check first-time client condition
  if (rule.rule_type === 'first_time' && !context.is_first_time_client) {
    return false;
  }

  return true;
}

function calculateAdjustment(
  adjustment: PricingAdjustment,
  currentPrice: number,
): number {
  switch (adjustment.type) {
    case 'percentage':
      return (currentPrice * adjustment.value) / 100;
    case 'fixed_amount':
      return adjustment.value;
    case 'override':
      return adjustment.value - currentPrice;
    default:
      return 0;
  }
}
