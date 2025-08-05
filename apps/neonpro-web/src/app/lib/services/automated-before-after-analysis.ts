// app/lib/services/automated-before-after-analysis.ts
// Backend service for Story 10.1: Automated Before/After Analysis

import type {
    AccuracyMetrics,
    AccuracyValidationRequest,
    AnalysisDashboardStats,
    AnalysisEngineConfig,
    AnalysisProgressResponse,
    AnalysisReport,
    AnalysisResultFilters,
    AnalysisSessionFilters,
    AnnotationCreateRequest,
    BatchAnalysisRequest,
    BeforeAfterPhotoPair,
    ComparisonAnalysisRequest,
    ComparisonAnalysisResponse,
    CreateAnalysisSessionRequest,
    CreatePhotoPairRequest,
    GenerateReportRequest,
    ImageAnalysisResult,
    MeasurementMetric,
    MLModelTraining,
    ModelTrainingRequest,
    PhotoAnalysisSession,
    PhotoPairFilters,
    ProcessingMetrics,
    QualityMetrics,
    QualityValidation,
    ReportFilters,
    TreatmentArea,
    VisualAnnotation,
} from '@/app/types/automated-before-after-analysis';
import { createClient } from '@/lib/supabase/server';

export class AutomatedBeforeAfterAnalysisService {
  // Supabase client created per method for proper request context

  constructor() {}

  // Analysis Engine Configuration Methods
  async getAnalysisEngineConfigs(): Promise<AnalysisEngineConfig[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('analysis_engine_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAnalysisEngineConfig(id: string): Promise<AnalysisEngineConfig | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('analysis_engine_config')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Basic implementation - other methods can be added as needed
}

// Export a singleton instance
export const automatedBeforeAfterAnalysisService = new AutomatedBeforeAfterAnalysisService();