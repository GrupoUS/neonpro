/**
 * AI Insights Model (T035)
 * Comprehensive AI insights management for Brazilian healthcare
 *
 * Features:
 * - Multi-model AI support (OpenAI, Anthropic, Google, local models)
 * - Patient analysis and recommendations
 * - Confidence scoring and validation
 * - Brazilian Portuguese context and healthcare compliance
 * - LGPD compliance for AI-generated data
 * - Healthcare professional validation workflow
 */

// AI insight types
export enum AIInsightType {
  HEALTH_ANALYSIS = 'health_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  TREATMENT_RECOMMENDATION = 'treatment_recommendation',
  APPOINTMENT_OPTIMIZATION = 'appointment_optimization',
  MEDICATION_REVIEW = 'medication_review',
  DIAGNOSTIC_SUPPORT = 'diagnostic_support',
  PREVENTIVE_CARE = 'preventive_care',
  LIFESTYLE_RECOMMENDATION = 'lifestyle_recommendation',
}

// AI providers
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  LOCAL = 'local',
  HUGGINGFACE = 'huggingface',
}

// Insight status
export enum InsightStatus {
  GENERATED = 'generated',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
  PENDING_REVIEW = 'pending_review',
}

// AI model configuration
export interface AIModelConfig {
  provider: AIProvider | string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  language: 'pt-BR' | 'en-US';
  healthcareContext: boolean;
  complianceMode?: boolean;
}

// Brazilian healthcare context
export interface BrazilianHealthcareContext {
  anvisa: {
    medicationCodes: string[];
    deviceCodes: string[];
    regulations?: string[];
  };
  cfm: {
    specialties: string[];
    procedures: string[];
    ethicalGuidelines?: string[];
  };
  sus: {
    cid10Codes: string[];
    procedureCodes: string[];
    protocols?: string[];
  };
  lgpd: {
    dataCategories: string[];
    legalBasis: string;
    consentRequired: boolean;
  };
}

// Insight content structure
export interface InsightContent {
  summary: string;
  recommendations: string[];
  riskFactors?: string[];
  keyFindings?: string[];
  confidence?: number;
  sources?: string[];
  limitations?: string[];
  followUpActions?: string[];
}

// Insight template
export interface InsightTemplate {
  id: string;
  name: string;
  type: AIInsightType | string;
  prompt: string;
  outputFormat: Record<string, string>;
  language: 'pt-BR' | 'en-US';
  healthcareSpecific: boolean;
  requiredData?: string[];
  validationCriteria?: string[];
}

// AI model performance tracking
export interface AIModelPerformance {
  modelId: string;
  provider: AIProvider | string;
  totalInsights: number;
  validatedInsights: number;
  rejectedInsights: number;
  averageConfidence: number;
  averageReliability: number;
  responseTime: number; // seconds
  lastUpdated: Date;
  errorRate?: number;
  costPerInsight?: number;
}

// Main AI insight interface
export interface AIInsight {
  id: string;
  patientId: string;

  // Insight metadata
  type: AIInsightType | string;
  title: string;
  description?: string;
  content: InsightContent;

  // AI model information
  confidence: number; // 0-1
  model: string;
  provider: AIProvider | string;
  modelConfig?: Partial<AIModelConfig>;

  // Generation metadata
  generatedAt: Date;
  processingTime?: number; // milliseconds
  tokensUsed?: number;
  cost?: number;

  // Validation and approval
  status: InsightStatus | string;
  validatedAt?: Date;
  validatedBy?: string;
  validationNotes?: string;
  rejectionReason?: string;

  // Healthcare context
  healthcareContext?: BrazilianHealthcareContext;
  relatedInsights?: string[]; // IDs of related insights

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;

  // LGPD compliance
  lgpdConsent?: boolean;
  accessLog?: Array<{
    _userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }>;
}

// Validate confidence score
export function validateConfidenceScore(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1;
}

// Generate patient analysis
export function generatePatientAnalysis(
  patientData: any,
  config: Partial<AIModelConfig>,
): Partial<AIInsight> {
  const now = new Date();

  return {
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    patientId: patientData.id,
    type: AIInsightType.HEALTH_ANALYSIS,
    title: 'Análise de Saúde Gerada por IA',
    description: 'Análise automática dos dados de saúde do paciente',
    content: {
      summary: 'Análise em processamento...',
      recommendations: [],
      riskFactors: [],
      keyFindings: [],
    },
    confidence: 0.8, // Default confidence
    model: config.model || 'gpt-4',
    provider: config.provider || AIProvider.OPENAI,
    generatedAt: now,
    status: InsightStatus.GENERATED,
    createdAt: now,
    updatedAt: now,
  };
}

// Validate AI insight
export function validateAIInsight(insight: Partial<AIInsight>): boolean {
  if (!insight.patientId || insight.patientId.trim() === '') {
    return false;
  }

  if (!insight.type) {
    return false;
  }

  if (!insight.title || insight.title.trim() === '') {
    return false;
  }

  if (
    insight.confidence !== undefined
    && !validateConfidenceScore(insight.confidence)
  ) {
    return false;
  }

  if (!insight.model || !insight.provider) {
    return false;
  }

  return true;
}

// Approve insight
export function approveInsight(
  insight: Partial<AIInsight>,
  validatedBy: string,
  notes?: string,
): Partial<AIInsight> {
  return {
    ...insight,
    status: InsightStatus.VALIDATED,
    validatedAt: new Date(),
    validatedBy,
    validationNotes: notes,
    updatedAt: new Date(),
  };
}

// Reject insight
export function rejectInsight(
  insight: Partial<AIInsight>,
  rejectedBy: string,
  reason: string,
): Partial<AIInsight> {
  return {
    ...insight,
    status: InsightStatus.REJECTED,
    validatedAt: new Date(),
    validatedBy: rejectedBy,
    rejectionReason: reason,
    updatedAt: new Date(),
  };
}

// Anonymize AI insight for LGPD compliance
export function anonymizeAIInsight(
  insight: Partial<AIInsight>,
): Partial<AIInsight> {
  const anonymized = { ...insight };

  if (anonymized.title) {
    anonymized.title = `ANÁLISE ANONIMIZADA - ${Date.now()}`;
  }

  if (anonymized.description) {
    anonymized.description = `DESCRIÇÃO ANONIMIZADA - ${Date.now()}`;
  }

  if (anonymized.content) {
    anonymized.content = {
      ...anonymized.content,
      summary: `RESUMO ANONIMIZADO - ${Date.now()}`,
      recommendations: ['RECOMENDAÇÃO ANONIMIZADA'],
      riskFactors: ['FATOR DE RISCO ANONIMIZADO'],
      keyFindings: ['ACHADO ANONIMIZADO'],
    };
  }

  if (anonymized.validationNotes) {
    anonymized.validationNotes = `NOTAS ANONIMIZADAS - ${Date.now()}`;
  }

  return anonymized;
}

// Calculate insight reliability score
export function calculateReliabilityScore(insight: Partial<AIInsight>): number {
  let score = 0;

  // Base confidence score (40% weight)
  if (insight.confidence) {
    score += insight.confidence * 0.4;
  }

  // Model reliability (20% weight)
  const modelReliability = getModelReliability(insight.model, insight.provider);
  score += modelReliability * 0.2;

  // Validation status (25% weight)
  if (insight.status === InsightStatus.VALIDATED) {
    score += 0.25;
  } else if (insight.status === InsightStatus.REJECTED) {
    score += 0;
  } else {
    score += 0.1; // Pending validation
  }

  // Data quality (15% weight)
  if (insight.content?.sources && insight.content.sources.length > 0) {
    score += 0.15;
  } else {
    score += 0.05;
  }

  return Math.min(score, 1.0);
}

// Helper function to get model reliability
function getModelReliability(model?: string, _provider?: string): number {
  const reliabilityMap: Record<string, number> = {
    'gpt-4': 0.9,
    'gpt-3.5-turbo': 0.8,
    'claude-3': 0.9,
    'gemini-pro': 0.85,
    local: 0.7,
  };

  return reliabilityMap[model || ''] || 0.7;
}

// Create AI insight with defaults
export function createAIInsight(
  data: Omit<
    AIInsight,
    'id' | 'createdAt' | 'updatedAt' | 'generatedAt' | 'status'
  >,
): AIInsight {
  const now = new Date();

  return {
    ...data,
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: InsightStatus.GENERATED,
    generatedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

// Get insights by patient ID
export function getInsightsByPatientId(
  insights: AIInsight[],
  patientId: string,
): AIInsight[] {
  return insights
    .filter(insight => insight.patientId === patientId)
    .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
}

// Get insights by type
export function getInsightsByType(
  insights: AIInsight[],
  type: AIInsightType,
): AIInsight[] {
  return insights.filter(insight => insight.type === type);
}

// Get validated insights
export function getValidatedInsights(insights: AIInsight[]): AIInsight[] {
  return insights.filter(
    insight => insight.status === InsightStatus.VALIDATED,
  );
}

// Get insights requiring validation
export function getInsightsRequiringValidation(
  insights: AIInsight[],
): AIInsight[] {
  return insights.filter(
    insight =>
      insight.status === InsightStatus.GENERATED
      || insight.status === InsightStatus.PENDING_REVIEW,
  );
}

// Calculate insights statistics
export function calculateInsightsStatistics(insights: AIInsight[]): {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  averageConfidence: number;
  averageReliability: number;
} {
  const stats = {
    total: insights.length,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    averageConfidence: 0,
    averageReliability: 0,
  };

  let totalConfidence = 0;
  let totalReliability = 0;

  insights.forEach(insight => {
    // Count by status
    stats.byStatus[insight.status] = (stats.byStatus[insight.status] || 0) + 1;

    // Count by type
    stats.byType[insight.type] = (stats.byType[insight.type] || 0) + 1;

    // Sum confidence and reliability
    totalConfidence += insight.confidence;
    totalReliability += calculateReliabilityScore(insight);
  });

  if (insights.length > 0) {
    stats.averageConfidence = totalConfidence / insights.length;
    stats.averageReliability = totalReliability / insights.length;
  }

  return stats;
}
