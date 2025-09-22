/**
 * Financial KPIs - Healthcare Business Analytics & Revenue Management
 *
 * Comprehensive financial performance indicators with compliance awareness,
 * revenue cycle management, and Brazilian healthcare payment systems.
 */

import {
  BaseMetric,
  HealthcareContext,
  RiskLevel,
  MetricFrequency,
  Currency,
} from "./base-metrics";

/**
 * Financial metric categories for healthcare business intelligence
 */
export type FinancialCategory =
  | "revenue_cycle"
  | "cost_management"
  | "billing_efficiency"
  | "insurance_claims"
  | "accounts_receivable"
  | "profitability"
  | "cash_flow"
  | "reimbursement"
  | "cost_per_case"
  | "productivity"
  | "denials_management"
  | "patient_financial_experience";

/**
 * Payment sources in Brazilian healthcare system
 */
export type PaymentSource =
  | "sus" // Sistema Único de Saúde
  | "private_insurance"
  | "corporate_plan"
  | "direct_pay"
  | "supplementary_insurance"
  | "international_insurance"
  | "government_program"
  | "research_grant";

/**
 * Revenue cycle stages
 */
export type RevenueCycleStage =
  | "pre_registration"
  | "registration"
  | "charge_capture"
  | "coding"
  | "billing"
  | "payment_posting"
  | "denial_management"
  | "collections";

/**
 * Base financial KPI interface extending BaseMetric
 */
export interface FinancialKPI extends BaseMetric {
  /** Financial category classification */
  category: FinancialCategory;

  /** Currency for monetary values */
  currency: Currency;

  /** Healthcare business context */
  healthcareContext: HealthcareContext & {
    costCenter?: string;
    serviceLineId?: string;
    payerMix?: Record<PaymentSource, number>;
  };

  /** Financial period context */
  financialPeriod: {
    fiscalYear: number;
    quarter?: 1 | 2 | 3 | 4;
    month?: number;
    comparativePeriod?: "prior_month" | "prior_quarter" | "prior_year";
  };

  /** Budget and target information */
  budgetContext?: {
    budgetedValue: number;
    variance: number;
    variancePercentage: number;
  };

  /** Compliance and audit requirements */
  auditRequirements?: {
    required: boolean;
    frequency: MetricFrequency;
    lastAudit?: Date;
    findings?: string[];
  };
} /**
 * Revenue Cycle KPIs - Core financial performance metrics
 */
export interface RevenueCycleKPI extends FinancialKPI {
  category: "revenue_cycle";

  /** Revenue cycle stage tracking */
  stageMetrics: {
    stage: RevenueCycleStage;
    averageDays: number;
    bottlenecks: string[];
    automation: number; // 0-1 scale
  };

  /** Collection and payment metrics */
  collectionMetrics?: {
    collectionsRate: number;
    daysInAR: number;
    cashCollected: number;
    writeOffs: number;
  };
}

/**
 * Insurance Claims KPIs - Claims processing and reimbursement
 */
export interface InsuranceClaimsKPI extends FinancialKPI {
  category: "insurance_claims";

  /** Claims processing details */
  claimsContext: {
    payerType: PaymentSource;
    claimType: "initial" | "correction" | "appeal" | "supplementary";
    processingTime: number; // Days
    denialRate: number; // Percentage
    appealSuccessRate?: number;
  };

  /** ANS (Agência Nacional de Saúde Suplementar) compliance */
  ansCompliance?: {
    required: boolean;
    qualityIndicator: string;
    benchmark: number;
    reportingDeadline: Date;
  };
}

/**
 * Cost Management KPIs - Operational cost tracking
 */
export interface CostManagementKPI extends FinancialKPI {
  category: "cost_management";

  /** Cost breakdown */
  costBreakdown: {
    personnel: number;
    supplies: number;
    equipment: number;
    facilities: number;
    overhead: number;
    other: number;
  };

  /** Cost per unit metrics */
  unitCosts: {
    costPerPatient?: number;
    costPerProcedure?: number;
    costPerBed?: number;
    costPerFTE?: number; // Full-time equivalent
  };
}

/**
 * Profitability KPIs - Margin and profit analysis
 */
export interface ProfitabilityKPI extends FinancialKPI {
  category: "profitability";

  /** Margin analysis */
  marginAnalysis: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    contributionMargin?: number;
  };

  /** Service line profitability */
  serviceLineProfitability?: {
    serviceLineId: string;
    revenue: number;
    directCosts: number;
    allocatedCosts: number;
    profit: number;
    marginPercentage: number;
  };
}

/**
 * Accounts Receivable KPIs - AR management and aging
 */
export interface AccountsReceivableKPI extends FinancialKPI {
  category: "accounts_receivable";

  /** AR aging analysis */
  agingAnalysis: {
    current: number; // 0-30 days
    days31to60: number;
    days61to90: number;
    days91to120: number;
    over120: number;
    totalAR: number;
  };

  /** Collection metrics */
  collectionMetrics: {
    collectionRate: number;
    averageDaysToPayment: number;
    badDebtRate: number;
    writeOffAmount: number;
  };
}

/**
 * Specific Financial KPI Implementations
 */

/**
 * Net Patient Revenue KPI
 */
export interface NetPatientRevenueKPI extends RevenueCycleKPI {
  name: "net_patient_revenue";
  unit: "BRL";
  currency: "BRL";

  /** Revenue components */
  revenueComponents: {
    grossRevenue: number;
    contractualAdjustments: number;
    badDebtProvision: number;
    charityCare: number;
    netRevenue: number;
  };

  /** Payer mix breakdown */
  payerMixRevenue: Record<
    PaymentSource,
    {
      amount: number;
      percentage: number;
      averageReimbursement: number;
    }
  >;
}

/**
 * Days in Accounts Receivable (DAR) KPI
 */
export interface DaysInARKPI extends AccountsReceivableKPI {
  name: "days_in_accounts_receivable";
  unit: "days";

  /** DAR calculation components */
  darCalculation: {
    totalAR: number;
    averageDailyRevenue: number;
    calculatedDAR: number;
    targetDAR: number;
    industryBenchmark: number;
  };
}

/**
 * Claims Denial Rate KPI
 */
export interface ClaimsDenialRateKPI extends InsuranceClaimsKPI {
  name: "claims_denial_rate";
  unit: "percentage";

  /** Denial analysis */
  denialAnalysis: {
    totalClaims: number;
    deniedClaims: number;
    denialRate: number;
    topDenialReasons: Array<{
      reason: string;
      count: number;
      amount: number;
    }>;
    overturnsSuccessful: number;
  };
}

/**
 * Cost per Patient KPI
 */
export interface CostPerPatientKPI extends CostManagementKPI {
  name: "cost_per_patient";
  unit: "BRL_per_patient";
  currency: "BRL";

  /** Cost analysis per patient */
  costAnalysis: {
    totalCosts: number;
    patientVolume: number;
    costPerPatient: number;
    costByCategory: Record<string, number>;
    benchmarkComparison: number;
  };
}

/**
 * Operating Margin KPI
 */
export interface OperatingMarginKPI extends ProfitabilityKPI {
  name: "operating_margin";
  unit: "percentage";

  /** Operating performance */
  operatingPerformance: {
    operatingRevenue: number;
    operatingExpenses: number;
    operatingIncome: number;
    operatingMargin: number;
    targetMargin: number;
  };
}

/**
 * Patient Financial Experience KPI
 */
export interface PatientFinancialExperienceKPI extends FinancialKPI {
  category: "patient_financial_experience";
  name: "patient_financial_experience_score";
  unit: "score_1_100";

  /** Patient financial experience metrics */
  experienceMetrics: {
    billClarity: number; // 1-100 score
    paymentOptions: number;
    communicationQuality: number;
    resolutionTime: number; // Days
    satisfactionScore: number;
  };

  /** LGPD compliance for financial data */
  lgpdCompliance: {
    consentObtained: boolean;
    dataMinimization: boolean;
    retentionPeriod: number; // Years
    anonymizationRequired: boolean;
  };
}

/**
 * SUS Reimbursement KPI
 */
export interface SUSReimbursementKPI extends InsuranceClaimsKPI {
  name: "sus_reimbursement_rate";
  unit: "percentage";

  /** SUS-specific metrics */
  susMetrics: {
    authorizedProcedures: number;
    reimbursedAmount: number;
    averageReimbursementTime: number; // Days
    rejectionRate: number;
    complexityMix: Record<string, number>;
  };

  /** Ministry of Health reporting */
  ministryReporting: {
    sigtapCompliance: boolean;
    reportingDeadline: Date;
    qualityIndicators: string[];
  };
}

/**
 * Financial KPI Factory Functions
 */

/**
 * Create a revenue cycle KPI with Brazilian healthcare context
 */
export function createRevenueCycleKPI(params: {
  name: string;
  value: number;
  currency: Currency;
  clinicId: string;
  stage: RevenueCycleStage;
}): RevenueCycleKPI {
  return {
    id: `revenue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: params.name,
    description: `Revenue cycle metric: ${params.name}`,
    dataType: "currency",
    value: params.value,
    unit: params.currency,
    currency: params.currency,
    frequency: "monthly",
    aggregation: "sum",
    status: "active",
    riskLevel: "LOW",
    complianceFrameworks: ["LGPD"],
    source: "financial_system",
    timestamp: new Date(),
    lastUpdated: new Date(),
    createdAt: new Date(),
    category: "revenue_cycle",
    healthcareContext: {
      clinicId: params.clinicId,
    },
    financialPeriod: {
      fiscalYear: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
    stageMetrics: {
      stage: params.stage,
      averageDays: 0,
      bottlenecks: [],
      automation: 0.5,
    },
  };
}

/**
 * Create an insurance claims KPI with ANS compliance
 */
export function createInsuranceClaimsKPI(params: {
  name: string;
  value: number;
  clinicId: string;
  payerType: PaymentSource;
  denialRate: number;
}): InsuranceClaimsKPI {
  return {
    id: `claims_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: params.name,
    description: `Insurance claims metric: ${params.name}`,
    dataType: "percentage",
    value: params.value,
    unit: "%",
    currency: "BRL",
    frequency: "monthly",
    aggregation: "average",
    status: "active",
    riskLevel: params.denialRate > 10 ? "HIGH" : "LOW",
    complianceFrameworks: ["LGPD"],
    source: "claims_system",
    timestamp: new Date(),
    lastUpdated: new Date(),
    createdAt: new Date(),
    category: "insurance_claims",
    healthcareContext: {
      clinicId: params.clinicId,
    },
    financialPeriod: {
      fiscalYear: new Date().getFullYear(),
    },
    claimsContext: {
      payerType: params.payerType,
      claimType: "initial",
      processingTime: 15,
      denialRate: params.denialRate,
    },
  };
}

/**
 * Utility functions for financial KPI analysis
 */

/**
 * Calculate financial health score
 */
export function calculateFinancialHealthScore(kpis: FinancialKPI[]): {
  score: number;
  level: "excellent" | "good" | "fair" | "poor";
  indicators: Array<{
    category: FinancialCategory;
    performance: "above" | "at" | "below" | "critical";
    impact: number;
  }>;
} {
  // Scoring logic based on healthcare financial best practices
  const categoryWeights: Record<FinancialCategory, number> = {
    revenue_cycle: 0.25,
    profitability: 0.2,
    accounts_receivable: 0.15,
    cost_management: 0.15,
    insurance_claims: 0.1,
    billing_efficiency: 0.05,
    cash_flow: 0.05,
    reimbursement: 0.03,
    cost_per_case: 0.02,
    productivity: 0.0,
    denials_management: 0.0,
    patient_financial_experience: 0.0,
  };

  let weightedScore = 0;
  const indicators: Array<{
    category: FinancialCategory;
    performance: "above" | "at" | "below" | "critical";
    impact: number;
  }> = [];

  kpis.forEach((kpi) => {
    const weight = categoryWeights[kpi.category] || 0;
    const targetValue = kpi.targetValue || kpi.value;
    const performance = kpi.value / targetValue;

    let performanceLevel: "above" | "at" | "below" | "critical";
    let score: number;

    if (performance >= 1.1) {
      performanceLevel = "above";
      score = 100;
    } else if (performance >= 0.95) {
      performanceLevel = "at";
      score = 85;
    } else if (performance >= 0.8) {
      performanceLevel = "below";
      score = 65;
    } else {
      performanceLevel = "critical";
      score = 30;
    }

    weightedScore += score * weight;

    indicators.push({
      category: kpi.category,
      performance: performanceLevel,
      impact: weight,
    });
  });

  const level =
    weightedScore >= 90
      ? "excellent"
      : weightedScore >= 75
        ? "good"
        : weightedScore >= 60
          ? "fair"
          : "poor";

  return { score: weightedScore, level, indicators };
}

/**
 * Validate financial KPI for Brazilian compliance
 */
export function validateBrazilianFinancialCompliance(kpi: FinancialKPI): {
  compliant: boolean;
  requirements: string[];
  recommendations: string[];
} {
  const requirements: string[] = [];
  const recommendations: string[] = [];

  // LGPD requirements for financial data
  if (kpi.complianceFrameworks.includes("LGPD")) {
    requirements.push("Patient financial data consent required");
    requirements.push("Data retention policy must be defined");
    if (kpi.metadata?.personalData) {
      requirements.push("Anonymization required for analytics");
    }
  }

  // ANS requirements for supplementary health insurance
  if (
    kpi.category === "insurance_claims" &&
    kpi.healthcareContext.payerMix?.private_insurance
  ) {
    requirements.push("ANS quality indicators reporting required");
    recommendations.push("Monitor ANS benchmarks for reimbursement rates");
  }

  // SUS requirements for public health services
  if (kpi.healthcareContext.payerMix?.sus) {
    requirements.push("Ministry of Health reporting compliance");
    recommendations.push("SIGTAP procedure coding validation");
  }

  // Currency compliance
  if (kpi.currency === "BRL") {
    recommendations.push("Consider inflation adjustment for trend analysis");
    recommendations.push(
      "Monitor Central Bank exchange rates for international comparisons",
    );
  }

  return {
    compliant: requirements.length === 0,
    requirements,
    recommendations,
  };
}

/**
 * Calculate payer mix diversity score
 */
export function calculatePayerMixDiversity(
  payerMix: Record<PaymentSource, number>,
): {
  diversityScore: number;
  dominantPayer: PaymentSource;
  concentration: number;
  riskLevel: RiskLevel;
} {
  const total = Object.values(payerMix).reduce((sum,value) => sum + value, 0);
  const proportions = Object.entries(payerMix).map(([payer,amount]) => ({
    payer: payer as PaymentSource,
    proportion: amount / total,
  }));

  // Calculate Herfindahl-Hirschman Index for concentration
  const hhi = proportions.reduce(
    (sum, { proportion }) => sum + proportion * proportion,
    0
  );
  const diversityScore = (1 - hhi) * 100;

  const dominantPayer = proportions.reduce((max,current) =>
    current.proportion > max.proportion ? current : max,
  ).payer;

  const concentration = Math.max(...proportions.map((p) => p.proportion)) * 100;

  const riskLevel: RiskLevel =
    concentration > 70 ? "HIGH" : concentration > 50 ? "MEDIUM" : "LOW";

  return {
    diversityScore,
    dominantPayer,
    concentration,
    riskLevel,
  };
}
