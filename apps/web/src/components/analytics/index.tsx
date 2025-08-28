/**
 * Analytics Components Index - NeonPro AI-Powered Healthcare Analytics
 * 
 * Centralized export file for all advanced analytics components including
 * AI-powered dashboards, predictive intelligence, real-time monitoring,
 * and Brazilian healthcare compliance tracking.
 * 
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 */

// ====== MAIN ANALYTICS COMPONENTS ======
export { default as AnalyticsDashboard } from './AnalyticsDashboard';
export { default as PatientOutcomePrediction } from './PatientOutcomePrediction';
export { default as RealTimeMonitoringDashboard } from './RealTimeMonitoringDashboard';
export { default as BrazilianComplianceTracker } from './BrazilianComplianceTracker';

// ====== ANALYTICS TYPES ======
export type {
  // Core Analytics Types
  HealthcareAnalytics,
  AnalyticsDashboardProps,
  PatientOutcomePredictionProps,
  
  // Predictive Intelligence Types
  PredictiveIntelligence,
  OutcomePrediction,
  ComplicationPrediction,
  RecoveryMilestone,
  AlternativeTreatment,
  
  // Real-time Monitoring Types
  HealthcareMonitoring,
  CriticalAlert,
  WarningAlert,
  EmergencyTrigger,
  VitalSignsMonitoring,
  AutomatedAction,
  
  // Brazilian Healthcare Intelligence Types
  BrazilianHealthcareIntelligence,
  CFMComplianceScore,
  ANVISAComplianceScore,
  LGPDComplianceScore,
  ComplianceViolation,
  BrazilianRegion,
  BrazilianState,
  
  // AI and ML Types
  MLModel,
  PredictionResult,
  FeatureImportance,
  FeatureContribution,
  AIInsight,
  AIRecommendation,
  
  // Chart and Visualization Types
  ChartData,
  ChartDataset,
  MetricCard,
  Dashboard,
  DashboardWidget,
  
  // Performance and Audit Types
  PerformanceMetrics,
  AuditTrail,
  OptimizationSuggestion,
  ReportConfiguration
} from '@/types/analytics';

// ====== ANALYTICS SERVICES ======
export { PredictiveModelsService, predictiveModels } from '@/lib/analytics/predictive-models';

// ====== ANALYTICS CONSTANTS ======
export {
  DEFAULT_ANALYTICS_CONFIG,
  BRAZILIAN_HEALTHCARE_COLORS,
  PERFORMANCE_THRESHOLDS
} from '@/types/analytics';

// ====== ANALYTICS UTILITIES ======

/**
 * Format analytics metric values for display
 */
export const formatMetricValue = (
  value: number | string,
  format: 'number' | 'currency' | 'percentage' | 'duration'
): string => {
  switch (format) {
    case 'currency':
      return `R$ ${Number(value).toLocaleString('pt-BR')}`;
    case 'percentage':
      return `${Number(value).toFixed(1)}%`;
    case 'duration':
      const hours = Number(value);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      return `${days} dia${days > 1 ? 's' : ''}`;
    case 'number':
    default:
      return Number(value).toLocaleString('pt-BR');
  }
};

/**
 * Calculate metric change percentage
 */
export const calculateMetricChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Determine metric status based on value and thresholds
 */
export const getMetricStatus = (
  value: number,
  target?: number,
  benchmark?: number
): 'good' | 'warning' | 'critical' => {
  if (target) {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'good';
    if (percentage >= 80) return 'warning';
    return 'critical';
  }
  
  if (benchmark) {
    if (value >= benchmark * 1.1) return 'good';
    if (value >= benchmark * 0.9) return 'warning';
    return 'critical';
  }
  
  return 'good'; // Default when no thresholds
};

/**
 * Format Brazilian phone number for display
 */
export const formatBrazilianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Format Brazilian CPF for display
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf;
};

/**
 * Calculate patient age from birthdate
 */
export const calculateAge = (birthdate: Date): number => {
  const today = new Date();
  const age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    return age - 1;
  }
  return age;
};

/**
 * Get Brazilian state name from code
 */
export const getBrazilianStateName = (stateCode: string): string => {
  const states: Record<string, string> = {
    'AC': 'Acre',
    'AL': 'Alagoas', 
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins'
  };
  return states[stateCode.toUpperCase()] || stateCode;
};

/**
 * Get Brazilian region from state code
 */
export const getBrazilianRegion = (stateCode: string): string => {
  const regions: Record<string, string> = {
    // Norte
    'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
    // Nordeste  
    'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 
    'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
    // Centro-Oeste
    'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
    // Sudeste
    'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
    // Sul
    'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
  };
  return regions[stateCode.toUpperCase()] || 'Não identificado';
};

/**
 * Validate Brazilian CRM number format
 */
export const validateCRM = (crm: string, state: string): boolean => {
  const cleaned = crm.replace(/\D/g, '');
  
  // CRM format: state-specific number ranges
  const ranges: Record<string, { min: number; max: number }> = {
    'SP': { min: 1, max: 999999 },
    'RJ': { min: 1, max: 999999 },
    'MG': { min: 1, max: 999999 },
    // Add more state-specific ranges as needed
  };
  
  const range = ranges[state.toUpperCase()];
  if (!range) return cleaned.length >= 4 && cleaned.length <= 6;
  
  const number = parseInt(cleaned);
  return number >= range.min && number <= range.max;
};

/**
 * Generate compliance score color
 */
export const getComplianceScoreColor = (score: number): string => {
  if (score >= 95) return 'text-green-600';
  if (score >= 90) return 'text-blue-600';
  if (score >= 85) return 'text-yellow-600';
  if (score >= 70) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Format time duration in Portuguese
 */
export const formatDurationPT = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Calculate business days between two dates (Brazilian business calendar)
 */
export const calculateBusinessDays = (start: Date, end: Date): number => {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Check if it's not a Brazilian holiday
      if (!isBrazilianHoliday(current)) {
        count++;
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Check if date is a Brazilian national holiday
 */
export const isBrazilianHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Fixed holidays
  const fixedHolidays = [
    '1-1',   // Confraternização Universal
    '4-21',  // Tiradentes
    '5-1',   // Dia do Trabalhador
    '9-7',   // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida
    '11-2',  // Finados
    '11-15', // Proclamação da República
    '12-25'  // Natal
  ];
  
  const dateKey = `${month}-${day}`;
  return fixedHolidays.includes(dateKey);
};

/**
 * Generate analytics export filename
 */
export const generateExportFilename = (
  type: 'dashboard' | 'prediction' | 'monitoring' | 'compliance',
  clinicId: string,
  format: 'json' | 'csv' | 'pdf' = 'json'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `neonpro-${type}-${clinicId}-${timestamp}.${format}`;
};

/**
 * Sanitize data for export (remove sensitive information)
 */
export const sanitizeExportData = (data: any): any => {
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Remove or mask sensitive fields
  const sensitiveFields = ['password', 'token', 'cpf', 'email', 'phone'];
  
  const removeSensitive = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(removeSensitive);
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          cleaned[key] = '***MASKED***';
        } else {
          cleaned[key] = removeSensitive(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  };
  
  return removeSensitive(sanitized);
};

// ====== ANALYTICS HOOKS (for future use) ======

/**
 * Custom hook for analytics data management
 * Note: This would be implemented as actual React hooks in a real application
 */
export const analyticsHooks = {
  useAnalyticsDashboard: (clinicId: string) => {
    // Implementation would go here
    return {
      data: null,
      loading: false,
      error: null,
      refresh: () => {},
      export: () => {}
    };
  },
  
  usePredictiveIntelligence: (patientId: string) => {
    // Implementation would go here
    return {
      prediction: null,
      loading: false,
      error: null,
      generatePrediction: () => {},
      updateModel: () => {}
    };
  },
  
  useRealTimeMonitoring: (patientIds: string[]) => {
    // Implementation would go here
    return {
      monitoringData: [],
      alerts: [],
      connectionStatus: 'connected',
      startMonitoring: () => {},
      stopMonitoring: () => {}
    };
  },
  
  useComplianceTracking: (clinicId: string) => {
    // Implementation would go here
    return {
      complianceData: null,
      violations: [],
      upcomingDeadlines: [],
      overallScore: 0,
      refreshCompliance: () => {}
    };
  }
};

// ====== DEFAULT EXPORTS ======

/**
 * Default analytics configuration for Brazilian healthcare
 */
export const defaultAnalyticsConfig = {
  refreshInterval: 300, // 5 minutes
  realTimeEnabled: true,
  soundAlerts: true,
  exportFormats: ['json', 'csv', 'pdf'],
  complianceFrameworks: ['CFM', 'ANVISA', 'LGPD', 'ANS'],
  defaultDateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    preset: 'month' as const
  },
  performanceThresholds: {
    loadTime: 2000, // 2 seconds
    accuracy: 0.85, // 85%
    availability: 0.999 // 99.9%
  }
};

/**
 * Brazilian healthcare compliance deadlines
 */
export const complianceDeadlines = {
  cfm: {
    annualDeclaration: { month: 3, day: 31 }, // March 31st
    ethicsReporting: { month: 12, day: 15 }, // December 15th
    licenseRenewal: { frequency: 'annual', notification: 60 } // 60 days notice
  },
  anvisa: {
    sanitaryRenewal: { frequency: 'biannual', notification: 90 },
    adverseEventReporting: { urgency: 'immediate', maxDays: 15 }
  },
  lgpd: {
    privacyAssessment: { frequency: 'annual', notification: 30 },
    dataBreachReporting: { urgency: 'immediate', maxHours: 72 }
  }
};

// ====== COMPONENT LIBRARY INFO ======

export const analyticsLibrary = {
  name: 'NeonPro Analytics',
  version: '1.0.0',
  components: [
    'AnalyticsDashboard',
    'PatientOutcomePrediction',
    'RealTimeMonitoringDashboard',
    'BrazilianComplianceTracker'
  ],
  features: [
    'AI-powered predictive analytics',
    'Real-time patient monitoring', 
    'Brazilian healthcare compliance',
    'Advanced data visualization',
    'Automated alert systems',
    'Export and reporting capabilities'
  ],
  compliance: [
    'LGPD (Lei Geral de Proteção de Dados)',
    'CFM (Conselho Federal de Medicina)',
    'ANVISA (Agência Nacional de Vigilância Sanitária)',
    'ANS (Agência Nacional de Saúde Suplementar)'
  ]
};