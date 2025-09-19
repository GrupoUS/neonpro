import { describe, it, expect, beforeEach } from 'vitest';
import {
  FinancialKPI,
  RevenueCycleKPI,
  InsuranceClaimsKPI,
  CostManagementKPI,
  ProfitabilityKPI,
  AccountsReceivableKPI,
  FinancialCategory,
  PaymentSource,
  RevenueCycleStage,
  isFinancialKPI,
  createRevenueCycleKPI,
  createInsuranceClaimsKPI,
  calculateFinancialHealthScore,
  validateBrazilianFinancialCompliance,
  calculatePayerMixDiversity,
} from '../types/financial-kpis';

describe('Financial KPIs', () => {
  describe('FinancialKPI type guards', () => {
    it('should identify valid financial KPIs', () => {
      const kpi = createRevenueCycleKPI({
        name: 'net_patient_revenue',
        value: 150000.50,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'billing',
      });

      expect(isFinancialKPI(kpi)).toBe(true);
    });

    it('should reject invalid financial KPIs', () => {
      expect(isFinancialKPI({})).toBe(false);
      expect(isFinancialKPI(null)).toBe(false);
      expect(isFinancialKPI({ id: 'test', name: 'test' })).toBe(false);
    });
  });

  describe('Revenue Cycle KPI', () => {
    let revenueCycleKPI: RevenueCycleKPI;

    beforeEach(() => {
      revenueCycleKPI = createRevenueCycleKPI({
        name: 'revenue_cycle_efficiency',
        value: 125000.75,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'collection',
      });
    });

    it('should create a valid revenue cycle KPI', () => {
      expect(revenueCycleKPI.category).toBe('revenue_cycle');
      expect(revenueCycleKPI.currency).toBe('BRL');
      expect(revenueCycleKPI.value).toBe(125000.75);
      expect(revenueCycleKPI.stageMetrics.stage).toBe('collection');
    });

    it('should track revenue cycle stages', () => {
      const stages: RevenueCycleStage[] = [
        'registration',
        'insurance_verification',
        'prior_authorization',
        'charge_capture',
        'coding',
        'billing',
        'payment_posting',
        'collection',
        'denial_management',
      ];

      stages.forEach(stage => {
        const kpi = createRevenueCycleKPI({
          name: `stage_${stage}`,
          value: 10000,
          currency: 'BRL',
          clinicId: 'clinic_123',
          stage,
        });

        expect(kpi.stageMetrics.stage).toBe(stage);
      });
    });

    it('should include stage metrics', () => {
      expect(revenueCycleKPI.stageMetrics).toBeDefined();
      expect(revenueCycleKPI.stageMetrics.averageDays).toBeGreaterThanOrEqual(0);
      expect(revenueCycleKPI.stageMetrics.automation).toBeGreaterThanOrEqual(0);
      expect(revenueCycleKPI.stageMetrics.automation).toBeLessThanOrEqual(1);
      expect(Array.isArray(revenueCycleKPI.stageMetrics.bottlenecks)).toBe(true);
    });
  });

  describe('Insurance Claims KPI', () => {
    let insuranceClaimsKPI: InsuranceClaimsKPI;

    beforeEach(() => {
      insuranceClaimsKPI = createInsuranceClaimsKPI({
        name: 'claims_processing_efficiency',
        value: 92.5,
        clinicId: 'clinic_123',
        payerType: 'private_insurance',
        denialRate: 5.2,
      });
    });

    it('should create a valid insurance claims KPI', () => {
      expect(insuranceClaimsKPI.category).toBe('insurance_claims');
      expect(insuranceClaimsKPI.claimsContext.payerType).toBe('private_insurance');
      expect(insuranceClaimsKPI.claimsContext.denialRate).toBe(5.2);
    });

    it('should handle different payer types', () => {
      const payerTypes: PaymentSource[] = [
        'sus',
        'private_insurance',
        'out_of_pocket',
        'employer_insurance',
        'government_programs',
        'international_insurance',
      ];

      payerTypes.forEach(payerType => {
        const kpi = createInsuranceClaimsKPI({
          name: `claims_${payerType}`,
          value: 95.0,
          clinicId: 'clinic_123',
          payerType,
          denialRate: 3.0,
        });

        expect(kpi.claimsContext.payerType).toBe(payerType);
      });
    });

    it('should set appropriate risk level based on denial rate', () => {
      const highDenialKPI = createInsuranceClaimsKPI({
        name: 'high_denial_claims',
        value: 80.0,
        clinicId: 'clinic_123',
        payerType: 'private_insurance',
        denialRate: 15.0,
      });

      const lowDenialKPI = createInsuranceClaimsKPI({
        name: 'low_denial_claims',
        value: 98.0,
        clinicId: 'clinic_123',
        payerType: 'private_insurance',
        denialRate: 2.0,
      });

      expect(highDenialKPI.riskLevel).toBe('HIGH');
      expect(lowDenialKPI.riskLevel).toBe('LOW');
    });
  });

  describe('Financial Categories', () => {
    it('should support all financial categories', () => {
      const categories: FinancialCategory[] = [
        'revenue_cycle',
        'profitability',
        'accounts_receivable',
        'cost_management',
        'insurance_claims',
        'billing_efficiency',
        'cash_flow',
        'reimbursement',
        'cost_per_case',
        'productivity',
        'denials_management',
        'patient_financial_experience',
      ];

      categories.forEach(category => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Financial Health Score Calculation', () => {
    it('should calculate comprehensive financial health score', () => {
      const financialKPIs: FinancialKPI[] = [
        createRevenueCycleKPI({
          name: 'monthly_revenue',
          value: 200000,
          currency: 'BRL',
          clinicId: 'clinic_123',
          stage: 'collection',
        }),
        createInsuranceClaimsKPI({
          name: 'claims_approval_rate',
          value: 95.5,
          clinicId: 'clinic_123',
          payerType: 'private_insurance',
          denialRate: 4.5,
        }),
        {
          id: 'profit_001',
          name: 'operating_margin',
          description: 'Monthly operating margin',
          dataType: 'percentage',
          value: 15.2,
          unit: '%',
          currency: 'BRL',
          frequency: 'monthly',
          aggregation: 'average',
          status: 'active',
          riskLevel: 'LOW',
          complianceFrameworks: ['LGPD'],
          source: 'financial_system',
          timestamp: new Date(),
          lastUpdated: new Date(),
          createdAt: new Date(),
          category: 'profitability',
          healthcareContext: {
            clinicId: 'clinic_123',
          },
          financialPeriod: {
            fiscalYear: 2024,
            quarter: 1,
          },
          targetValue: 18.0,
        } as FinancialKPI,
      ];

      const healthScore = calculateFinancialHealthScore(financialKPIs);

      expect(healthScore.score).toBeGreaterThan(0);
      expect(healthScore.score).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(healthScore.level);
      expect(Array.isArray(healthScore.indicators)).toBe(true);
    });

    it('should handle empty KPI array gracefully', () => {
      const healthScore = calculateFinancialHealthScore([]);

      expect(healthScore.score).toBe(0);
      expect(healthScore.level).toBe('poor');
      expect(healthScore.indicators).toHaveLength(0);
    });

    it('should weight categories appropriately', () => {
      const revenueCycleKPI = createRevenueCycleKPI({
        name: 'revenue_test',
        value: 100000,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'billing',
      });
      revenueCycleKPI.targetValue = 90000; // Above target

      const healthScore = calculateFinancialHealthScore([revenueCycleKPI]);

      const revenueIndicator = healthScore.indicators.find(i => i.category === 'revenue_cycle');
      expect(revenueIndicator).toBeDefined();
      expect(revenueIndicator?.performance).toBe('above');
      expect(revenueIndicator?.impact).toBe(0.25); // 25% weight for revenue cycle
    });
  });

  describe('Brazilian Financial Compliance Validation', () => {
    it('should validate LGPD compliance for financial data', () => {
      const financialKPI = createRevenueCycleKPI({
        name: 'patient_revenue',
        value: 50000,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'billing',
      });

      const compliance = validateBrazilianFinancialCompliance(financialKPI);

      expect(compliance.compliant).toBeDefined();
      expect(compliance.requirements).toContain('Patient financial data consent required');
      expect(compliance.requirements).toContain('Data retention policy must be defined');
    });

    it('should validate ANS compliance for supplementary health insurance', () => {
      const insuranceKPI = createInsuranceClaimsKPI({
        name: 'ans_claims',
        value: 88.5,
        clinicId: 'clinic_123',
        payerType: 'private_insurance',
        denialRate: 6.5,
      });
      
      // Simulate private insurance payer mix
      insuranceKPI.healthcareContext.payerMix = { private_insurance: 60, sus: 40 };

      const compliance = validateBrazilianFinancialCompliance(insuranceKPI);

      expect(compliance.requirements).toContain('ANS quality indicators reporting required');
      expect(compliance.recommendations).toContain('Monitor ANS benchmarks for reimbursement rates');
    });

    it('should validate SUS compliance for public health services', () => {
      const susKPI = createRevenueCycleKPI({
        name: 'sus_reimbursement',
        value: 75000,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'payment_posting',
      });

      // Simulate SUS payer mix
      susKPI.healthcareContext.payerMix = { sus: 80, private_insurance: 20 };

      const compliance = validateBrazilianFinancialCompliance(susKPI);

      expect(compliance.requirements).toContain('Ministry of Health reporting compliance');
      expect(compliance.recommendations).toContain('SIGTAP procedure coding validation');
    });

    it('should provide currency-specific recommendations', () => {
      const brlKPI = createRevenueCycleKPI({
        name: 'brl_revenue',
        value: 100000,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'collection',
      });

      const compliance = validateBrazilianFinancialCompliance(brlKPI);

      expect(compliance.recommendations).toContain('Consider inflation adjustment for trend analysis');
      expect(compliance.recommendations).toContain('Monitor Central Bank exchange rates for international comparisons');
    });
  });

  describe('Payer Mix Diversity Calculation', () => {
    it('should calculate payer mix diversity score', () => {
      const payerMix: Record<PaymentSource, number> = {
        sus: 40000,
        private_insurance: 30000,
        out_of_pocket: 20000,
        employer_insurance: 10000,
        government_programs: 0,
        international_insurance: 0,
      };

      const diversity = calculatePayerMixDiversity(payerMix);

      expect(diversity.diversityScore).toBeGreaterThan(0);
      expect(diversity.diversityScore).toBeLessThanOrEqual(100);
      expect(diversity.dominantPayer).toBe('sus');
      expect(diversity.concentration).toBe(40); // 40% for SUS
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(diversity.riskLevel);
    });

    it('should identify high concentration risk', () => {
      const highConcentrationMix: Record<PaymentSource, number> = {
        sus: 85000,
        private_insurance: 10000,
        out_of_pocket: 5000,
        employer_insurance: 0,
        government_programs: 0,
        international_insurance: 0,
      };

      const diversity = calculatePayerMixDiversity(highConcentrationMix);

      expect(diversity.concentration).toBe(85);
      expect(diversity.riskLevel).toBe('HIGH');
      expect(diversity.dominantPayer).toBe('sus');
    });

    it('should identify low concentration risk with balanced mix', () => {
      const balancedMix: Record<PaymentSource, number> = {
        sus: 25000,
        private_insurance: 25000,
        out_of_pocket: 25000,
        employer_insurance: 25000,
        government_programs: 0,
        international_insurance: 0,
      };

      const diversity = calculatePayerMixDiversity(balancedMix);

      expect(diversity.concentration).toBe(25);
      expect(diversity.riskLevel).toBe('LOW');
      expect(diversity.diversityScore).toBeGreaterThan(60);
    });
  });

  describe('Currency Handling', () => {
    it('should handle Brazilian Real currency correctly', () => {
      const brlKPI = createRevenueCycleKPI({
        name: 'brl_test',
        value: 1500.75,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'billing',
      });

      expect(brlKPI.currency).toBe('BRL');
      expect(brlKPI.unit).toBe('BRL');
      expect(typeof brlKPI.value).toBe('number');
    });

    it('should format currency values appropriately', () => {
      const kpi = createRevenueCycleKPI({
        name: 'currency_formatting_test',
        value: 123456.78,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'collection',
      });

      expect(kpi.value).toBe(123456.78);
      expect(kpi.currency).toBe('BRL');
    });
  });

  describe('Financial Period Tracking', () => {
    it('should track fiscal year and periods', () => {
      const kpi = createRevenueCycleKPI({
        name: 'period_test',
        value: 50000,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'billing',
      });

      expect(kpi.financialPeriod).toBeDefined();
      expect(kpi.financialPeriod.fiscalYear).toBe(new Date().getFullYear());
    });
  });

  describe('Performance Metrics', () => {
    it('should track target values and performance', () => {
      const kpi = createRevenueCycleKPI({
        name: 'performance_test',
        value: 95000,
        currency: 'BRL',
        clinicId: 'clinic_123',
        stage: 'collection',
      });

      // Set a target value
      kpi.targetValue = 100000;

      const performance = kpi.value / kpi.targetValue;
      expect(performance).toBeCloseTo(0.95, 2);
    });
  });
});