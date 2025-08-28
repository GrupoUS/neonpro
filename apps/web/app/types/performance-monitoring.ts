// Performance Monitoring Dashboard Types
// Real-time KPI tracking and ROI visualization for no-show prevention

export interface PerformanceMetrics {
  id: string;
  clinicId: string;
  departmentId?: string;
  staffMemberId?: string;
  period: "day" | "week" | "month" | "quarter" | "year";
  startDate: Date;
  endDate: Date;

  // No-show prediction metrics
  predictionAccuracy: number; // percentage
  predictionConfidence: number; // percentage
  totalPredictions: number;
  correctPredictions: number;
  falsePositives: number;
  falseNegatives: number;

  // Intervention effectiveness
  interventionsAttempted: number;
  interventionsSuccessful: number;
  interventionSuccessRate: number; // percentage
  avgInterventionTime: number; // minutes

  // No-show rates
  totalAppointments: number;
  appointmentsAttended: number;
  appointmentsMissed: number;
  noShowRate: number; // percentage
  noShowRateImprovement: number; // percentage change from baseline

  // Financial impact
  revenueProtected: number; // R$ value
  costOfInterventions: number; // R$ value
  roi: number; // percentage
  avgAppointmentValue: number; // R$ value

  // Staff performance
  alertResponseTime: number; // minutes
  alertResolutionRate: number; // percentage
  staffUtilization: number; // percentage

  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardKPI {
  id: string;
  name: string;
  displayName: string;
  category: "prediction" | "intervention" | "financial" | "operational";
  value: number;
  unit: "percentage" | "currency" | "count" | "time" | "ratio";
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  target?: number;
  benchmarkValue?: number;
  isGoodTrend: boolean; // true if trend direction is positive for this KPI
  lastUpdated: Date;
  chartData?: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
  category?: string;
}

export interface PerformanceDashboard {
  id: string;
  name: string;
  description: string;
  clinicId: string;
  departmentIds: string[];
  kpis: DashboardKPI[];
  charts: DashboardChart[];
  filters: DashboardFilters;
  refreshRate: number; // minutes
  isRealTime: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DashboardChart {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "donut" | "area" | "gauge" | "heatmap";
  dataSource: string;
  data: ChartDataPoint[];
  config: ChartConfig;
  position: { x: number; y: number; width: number; height: number };
}

export interface ChartConfig {
  xAxis?: {
    label: string;
    type: "datetime" | "category" | "numeric";
    format?: string;
  };
  yAxis?: {
    label: string;
    format?: string;
    min?: number;
    max?: number;
  };
  colors: string[];
  showLegend: boolean;
  showTooltip: boolean;
  animations: boolean;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
    preset?:
      | "today"
      | "yesterday"
      | "last7days"
      | "last30days"
      | "last90days"
      | "custom";
  };
  departments: string[];
  staffMembers: string[];
  riskLevels: ("low" | "medium" | "high" | "critical")[];
  interventionTypes: string[];
  appointmentTypes: string[];
}

export interface StaffPerformanceReport {
  staffId: string;
  staffName: string;
  department: string;
  role: string;
  period: { start: Date; end: Date };

  // Alert handling
  alertsReceived: number;
  alertsAcknowledged: number;
  alertsResolved: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes

  // Interventions performed
  interventionsAttempted: number;
  interventionsSuccessful: number;
  interventionSuccessRate: number;
  interventionTypes: { [key: string]: number };

  // Patient outcomes
  patientsContacted: number;
  appointmentsProtected: number;
  revenueProtected: number;

  // Performance score
  performanceScore: number; // 0-100
  ranking: number; // position among peers
  badges: PerformanceBadge[];
}

export interface PerformanceBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  criteria: string;
}

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "png";
  dateRange: { start: Date; end: Date };
  includedSections: string[];
  title?: string;
  includeCharts: boolean;
  includeRawData: boolean;
}

export interface ROICalculation {
  period: { start: Date; end: Date };

  // Investment (costs)
  systemCosts: number; // R$ - technology and implementation
  staffCosts: number; // R$ - additional staff time
  interventionCosts: number; // R$ - calls, messages, etc.
  totalInvestment: number; // R$

  // Returns (benefits)
  revenueProtected: number; // R$ - appointments that would have been missed
  efficiencyGains: number; // R$ - operational improvements
  reputationValue: number; // R$ - customer satisfaction impact
  totalReturns: number; // R$

  // Metrics
  roi: number; // percentage
  paybackPeriod: number; // months
  netPresentValue: number; // R$

  // Comparative metrics
  noShowRateBefore: number; // percentage
  noShowRateAfter: number; // percentage
  improvement: number; // percentage points

  confidence: number; // percentage - statistical confidence
}

// Brazilian Portuguese localization
export const KPI_LABELS_PT = {
  // Prediction metrics
  predictionAccuracy: "Precisão das Predições",
  predictionConfidence: "Confiança Média",
  totalPredictions: "Total de Predições",

  // Intervention metrics
  interventionSuccessRate: "Taxa de Sucesso das Intervenções",
  avgInterventionTime: "Tempo Médio de Intervenção",
  interventionsAttempted: "Intervenções Tentadas",

  // Financial metrics
  revenueProtected: "Receita Protegida",
  roi: "Retorno sobre Investimento",
  costOfInterventions: "Custo das Intervenções",

  // Operational metrics
  noShowRate: "Taxa de Faltas",
  noShowRateImprovement: "Melhoria na Taxa de Faltas",
  alertResponseTime: "Tempo de Resposta aos Alertas",
  staffUtilization: "Utilização da Equipe",
} as const;

export const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
] as const;

export const KPI_TARGETS = {
  predictionAccuracy: 85, // 85% accuracy target
  interventionSuccessRate: 70, // 70% success rate
  noShowRateImprovement: 30, // 30% reduction target
  roi: 200, // 200% ROI target
  alertResponseTime: 15, // 15 minutes response time
} as const;

// Default dashboard configurations
export const DEFAULT_DASHBOARD_CONFIG = {
  refreshRate: 5, // 5 minutes
  maxDataPoints: 100,
  animationDuration: 300,
  chartHeight: 300,
  gridCols: 12,
  gridRows: 8,
} as const;
