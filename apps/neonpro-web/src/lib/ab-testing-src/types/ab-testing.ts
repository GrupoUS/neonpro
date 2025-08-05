/**
 * A/B Testing Engine Types
 * NeonPro - Sistema de Testes A/B para Comunicação
 */

// Tipos básicos de teste
export type TestType = 'template' | 'timing' | 'channel' | 'content' | 'subject' | 'cta';
export type TestStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type VariationStatus = 'active' | 'inactive' | 'winner' | 'loser';
export type StatisticalSignificance = 'not_significant' | 'marginally_significant' | 'significant' | 'highly_significant';

// Configuração de testes A/B
export interface ABTestConfig {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  type: TestType;
  status: TestStatus;
  
  // Configurações temporais
  startDate: Date;
  endDate?: Date;
  duration?: number; // em dias
  
  // Configurações de audiência
  audienceFilter: AudienceFilter;
  trafficAllocation: number; // 0-100 (porcentagem do tráfego)
  
  // Configurações estatísticas
  confidenceLevel: number; // 95, 99, etc.
  minimumDetectableEffect: number; // Efeito mínimo detectável (%)
  powerAnalysis: number; // Power (80%, 90%, etc.)
  
  // Configurações de conversão
  primaryGoal: ConversionGoal;
  secondaryGoals?: ConversionGoal[];
  
  // Meta dados
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Estado do teste
  sampleSize: number;
  currentSampleSize: number;
  variations: TestVariation[];
  results?: TestResults;
}

// Filtros de audiência
export interface AudienceFilter {
  includePatients?: string[]; // IDs específicos
  excludePatients?: string[]; // IDs para excluir
  
  // Filtros demográficos
  ageRange?: { min: number; max: number };
  gender?: 'male' | 'female' | 'other' | 'all';
  location?: string[];
  
  // Filtros comportamentais
  lastVisitRange?: { start: Date; end: Date };
  appointmentTypes?: string[];
  communicationPreference?: string[];
  engagementScore?: { min: number; max: number };
  
  // Filtros de segmentação
  patientSegments?: string[];
  customAttributes?: Record<string, any>;
}

// Variações do teste
export interface TestVariation {
  id: string;
  testId: string;
  name: string;
  description?: string;
  status: VariationStatus;
  
  // Alocação de tráfego
  trafficPercentage: number; // 0-100
  
  // Conteúdo da variação
  content: VariationContent;
  
  // Métricas
  impressions: number;
  conversions: number;
  conversionRate: number;
  
  // Estatísticas
  confidence?: number;
  significance?: StatisticalSignificance;
  pValue?: number;
  
  // Meta dados
  createdAt: Date;
  updatedAt: Date;
}

// Conteúdo das variações
export interface VariationContent {
  // Para templates de comunicação
  subject?: string;
  body?: string;
  callToAction?: string;
  
  // Para timing tests
  sendTime?: string; // HH:mm format
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  timezone?: string;
  
  // Para channel tests
  channel?: 'email' | 'sms' | 'whatsapp' | 'push';
  
  // Conteúdo personalizado
  customFields?: Record<string, any>;
  
  // Assets
  images?: string[];
  attachments?: string[];
}

// Goals de conversão
export interface ConversionGoal {
  id: string;
  name: string;
  description?: string;
  type: 'appointment_booking' | 'response_rate' | 'click_through' | 'open_rate' | 'custom';
  
  // Configurações de tracking
  trackingMethod: 'event' | 'url' | 'custom_script';
  trackingValue?: string;
  
  // Valor monetário (opcional)
  monetaryValue?: number;
  
  // Condições
  conditions?: ConversionCondition[];
}

// Condições de conversão
export interface ConversionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  logic?: 'and' | 'or';
}

// Resultados do teste
export interface TestResults {
  testId: string;
  status: 'ongoing' | 'completed' | 'inconclusive';
  
  // Estatísticas gerais
  totalImpressions: number;
  totalConversions: number;
  overallConversionRate: number;
  
  // Análise estatística
  statisticalSignificance: StatisticalSignificance;
  confidenceLevel: number;
  pValue: number;
  powerAchieved: number;
  
  // Winner determination
  winningVariation?: string;
  liftPercentage?: number;
  confidenceInterval?: { lower: number; upper: number };
  
  // Resultados por variação
  variationResults: VariationResults[];
  
  // Análise temporal
  dailyResults?: DailyResults[];
  
  // Insights e recomendações
  insights: TestInsight[];
  recommendations: string[];
  
  // Meta dados
  calculatedAt: Date;
  nextReviewDate?: Date;
}

// Resultados por variação
export interface VariationResults {
  variationId: string;
  variationName: string;
  
  // Métricas básicas
  impressions: number;
  conversions: number;
  conversionRate: number;
  
  // Análise estatística
  significance: StatisticalSignificance;
  pValue: number;
  confidenceInterval: { lower: number; upper: number };
  
  // Comparação com controle
  liftPercentage: number;
  isWinner: boolean;
  
  // Métricas por goal
  goalResults: GoalResults[];
  
  // Análise de segmentos
  segmentResults?: SegmentResults[];
}

// Resultados por goal
export interface GoalResults {
  goalId: string;
  goalName: string;
  conversions: number;
  conversionRate: number;
  monetaryValue?: number;
  significance: StatisticalSignificance;
}

// Resultados por segmento
export interface SegmentResults {
  segmentName: string;
  segmentFilter: Partial<AudienceFilter>;
  impressions: number;
  conversions: number;
  conversionRate: number;
  significance: StatisticalSignificance;
}

// Resultados diários
export interface DailyResults {
  date: Date;
  totalImpressions: number;
  totalConversions: number;
  conversionRate: number;
  
  // Resultados por variação
  variationResults: {
    variationId: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  }[];
}

// Insights do teste
export interface TestInsight {
  type: 'performance' | 'timing' | 'audience' | 'content' | 'statistical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  supportingData?: any;
  actionable: boolean;
  relatedVariations?: string[];
}

// Events para tracking
export interface ABTestEvent {
  id: string;
  testId: string;
  variationId: string;
  patientId: string;
  
  // Tipo de evento
  type: 'impression' | 'conversion' | 'click' | 'open';
  goalId?: string;
  
  // Contexto do evento
  timestamp: Date;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  
  // Dados do evento
  eventData?: Record<string, any>;
  monetaryValue?: number;
  
  // Meta dados
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

// Informações do dispositivo
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser?: string;
  screenSize?: string;
}

// Configurações do experimento
export interface ExperimentConfig {
  // Configurações globais
  defaultConfidenceLevel: number;
  defaultPowerAnalysis: number;
  minimumSampleSize: number;
  
  // Configurações de auto-stop
  autoStopEnabled: boolean;
  autoStopConditions: AutoStopCondition[];
  
  // Configurações de notificação
  notifications: NotificationConfig;
  
  // Configurações de segurança
  maxTestDuration: number; // em dias
  blacklistPatterns: string[];
}

// Condições de auto-stop
export interface AutoStopCondition {
  type: 'significance_reached' | 'max_duration' | 'min_confidence' | 'sample_size_reached';
  threshold: number;
  enabled: boolean;
}

// Configurações de notificação
export interface NotificationConfig {
  significanceReached: boolean;
  testCompleted: boolean;
  errorOccurred: boolean;
  weeklyReports: boolean;
  
  // Canais de notificação
  email: boolean;
  slack: boolean;
  dashboard: boolean;
  
  // Destinatários
  recipients: string[];
}

// Analytics de experimentos
export interface ExperimentAnalytics {
  testId: string;
  
  // Métricas de performance
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  
  // Análise de cohort
  cohortAnalysis?: CohortAnalysis[];
  
  // Análise de funil
  funnelAnalysis?: FunnelStep[];
  
  // Heatmaps (se aplicável)
  heatmapData?: HeatmapData;
  
  // User journey analysis
  userJourneys?: UserJourney[];
}

// Análise de cohort
export interface CohortAnalysis {
  cohortDate: Date;
  cohortSize: number;
  retentionRates: number[]; // por período (dia, semana, mês)
  conversionRates: number[];
}

// Passos do funil
export interface FunnelStep {
  stepName: string;
  stepOrder: number;
  entries: number;
  exits: number;
  conversionRate: number;
}

// Dados de heatmap
export interface HeatmapData {
  elementId: string;
  clicks: number;
  views: number;
  coordinates: { x: number; y: number }[];
}

// Jornada do usuário
export interface UserJourney {
  patientId: string;
  steps: JourneyStep[];
  totalDuration: number;
  converted: boolean;
  conversionValue?: number;
}

// Passo da jornada
export interface JourneyStep {
  timestamp: Date;
  action: string;
  element?: string;
  variation?: string;
  duration: number;
}

// Template de teste
export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'sms' | 'push' | 'timing' | 'channel';
  
  // Configuração padrão
  defaultConfig: Partial<ABTestConfig>;
  variations: Partial<TestVariation>[];
  
  // Meta dados
  usageCount: number;
  averageSuccessRate: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

// Relatório de teste
export interface TestReport {
  testId: string;
  reportType: 'interim' | 'final' | 'custom';
  generatedAt: Date;
  generatedBy: string;
  
  // Sumário executivo
  executiveSummary: {
    testName: string;
    duration: number;
    sampleSize: number;
    winningVariation?: string;
    liftPercentage?: number;
    confidenceLevel: number;
    recommendation: string;
  };
  
  // Seções do relatório
  sections: ReportSection[];
  
  // Configurações de export
  format: 'pdf' | 'html' | 'json' | 'csv';
  includeCharts: boolean;
  includeRawData: boolean;
}

// Seção do relatório
export interface ReportSection {
  sectionType: 'overview' | 'results' | 'analysis' | 'recommendations' | 'appendix';
  title: string;
  content: any;
  charts?: ChartConfig[];
}

// Configuração de gráficos
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'funnel';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  series?: string[];
}

// Filtros para consulta de testes
export interface TestQueryFilter {
  clinicId?: string;
  status?: TestStatus[];
  type?: TestType[];
  dateRange?: { start: Date; end: Date };
  createdBy?: string[];
  tags?: string[];
  searchTerm?: string;
  
  // Paginação
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Resultado de consulta
export interface TestQueryResult {
  tests: ABTestConfig[];
  totalCount: number;
  hasMore: boolean;
  aggregations?: {
    statusCounts: Record<TestStatus, number>;
    typeCounts: Record<TestType, number>;
    averageConversionRate: number;
    totalActiveTests: number;
  };
}

// Configurações de automação
export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Trigger conditions
  triggers: AutomationTrigger[];
  
  // Actions to take
  actions: AutomationAction[];
  
  // Execution settings
  executionSettings: {
    maxExecutions?: number;
    cooldownPeriod?: number; // in minutes
    timezone?: string;
  };
  
  // Meta dados
  createdBy: string;
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
}

// Trigger de automação
export interface AutomationTrigger {
  type: 'significance_reached' | 'time_based' | 'sample_size' | 'conversion_rate' | 'custom';
  conditions: Record<string, any>;
  operator: 'and' | 'or';
}

// Ação de automação
export interface AutomationAction {
  type: 'stop_test' | 'promote_winner' | 'send_notification' | 'create_report' | 'start_new_test';
  parameters: Record<string, any>;
  delay?: number; // in minutes
}
