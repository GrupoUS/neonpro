// Sustainable pricing model for Brazilian aesthetic clinics
// KISS principle: fair prices for Brazilian market

export interface ClinicPricing {
  plan: 'basic' | 'pro' | 'enterprise';
  monthlyPrice: number;        // BRL
  annualPrice: number;         // BRL (20% discount)
  features: {
    lgpdMonitoring: boolean;
    mobileOptimization: boolean;
    bookingReliability: boolean;
    paymentSecurity: boolean;
    reports: boolean;
    support: 'email' | 'phone' | 'dedicated';
  };
  targetClinicSize: 'small' | 'medium' | 'large';
}

export const BRAZILIAN_CLINIC_PRICING: ClinicPricing[] = [
  {
    plan: 'basic',
    monthlyPrice: 97,           // ~US$ 20
    annualPrice: 936,           // 20% discount = 2 months free
    features: {
      lgpdMonitoring: true,     // Essential (avoid R$50M fines)
      mobileOptimization: true, // 70% patients use mobile
      bookingReliability: true, // Revenue critical
      paymentSecurity: false,   // Basic only
      reports: true,            // Simple reports
      support: 'email'          // Community support
    },
    targetClinicSize: 'small'   // 1-3 professionals
  },
  {
    plan: 'pro',
    monthlyPrice: 197,          // ~US$ 40
    annualPrice: 1896,          // 20% discount
    features: {
      lgpdMonitoring: true,
      mobileOptimization: true,
      bookingReliability: true,
      paymentSecurity: true,    // Secure payments
      reports: true,            // Detailed reports
      support: 'phone'          // Priority support
    },
    targetClinicSize: 'medium'  // 4-10 professionals
  },
  {
    plan: 'enterprise',
    monthlyPrice: 397,          // ~US$ 80
    annualPrice: 3816,          // 20% discount
    features: {
      lgpdMonitoring: true,
      mobileOptimization: true,
      bookingReliability: true,
      paymentSecurity: true,
      reports: true,            // Executive reports
      support: 'dedicated'      // Dedicated account manager
    },
    targetClinicSize: 'large'   // 11+ professionals
  }
];

export interface ROICalculation {
  monthlyCost: number;
  monthlySavings: number;
  paybackMonths: number;
  annualROI: number;            // Percentage
  riskAvoidance: {
    lgpdFines: number;          // Avoid R$50M fines
    lostRevenue: number;        // Recovered appointments
    patientChurn: number;       // Retention improvement
  };
}

export class PricingCalculator {
  static calculateROI(plan: ClinicPricing, clinicMetrics: {
    monthlyRevenue: number;
    patientCount: number;
    hasLGPDIssues: boolean;
    hasMobileIssues: boolean;
    hasBookingIssues: boolean;
  }): ROICalculation {
    
    const monthlyCost = plan.monthlyPrice;
    
    // Calculate savings based on real Brazilian clinic problems
    let monthlySavings = 0;
    
    // LGPD fine avoidance (major Brazilian concern)
    if (clinicMetrics.hasLGPDIssues) {
      monthlySavings += 50000; // Avoid R$50M+ fines
    }
    
    // Mobile optimization (70% patients use mobile)
    if (clinicMetrics.hasMobileIssues) {
      monthlySavings += clinicMetrics.monthlyRevenue * 0.15; // 15% increase
    }
    
    // Booking reliability (direct revenue impact)
    if (clinicMetrics.hasBookingIssues) {
      monthlySavings += clinicMetrics.monthlyRevenue * 0.10; // 10% recovery
    }
    
    const paybackMonths = Math.ceil(monthlyCost / monthlySavings);
    const annualROI = ((monthlySavings * 12 - monthlyCost * 12) / (monthlyCost * 12)) * 100;
    
    return {
      monthlyCost,
      monthlySavings,
      paybackMonths,
      annualROI,
      riskAvoidance: {
        lgpdFines: clinicMetrics.hasLGPDIssues ? 50000 : 0,
        lostRevenue: clinicMetrics.hasBookingIssues ? clinicMetrics.monthlyRevenue * 0.10 : 0,
        patientChurn: clinicMetrics.hasMobileIssues ? clinicMetrics.patientCount * 50 : 0 // BRL per patient
      }
    };
  }
  
  static getRecommendedPlan(clinicSize: 'small' | 'medium' | 'large'): ClinicPricing {
    return BRAZILIAN_CLINIC_PRICING.find(p => p.targetClinicSize === clinicSize) || BRAZILIAN_CLINIC_PRICING[0];
  }
}