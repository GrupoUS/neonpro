// app/lib/services/automated-before-after-analysis.ts
// Backend service for Story 10.1: Automated Before/After Analysis

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  StartAnalysisRequest,
  TreatmentArea,
  VisualAnnotation,
} from '@/app/types/automated-before-after-analysis';

export class AutomatedBeforeAfterAnalysisService {
  private readonly supabase;

  constructor() {
    this.supabase = createClientComponentClient();
  }

  // Analysis Engine Configuration Methods
  async getAnalysisEngineConfigs(): Promise<AnalysisEngineConfig[]> {
    const { data, error } = await this.supabase
      .from('analysis_engine_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getAnalysisEngineConfig(
    id: string,
  ): Promise<AnalysisEngineConfig | null> {
    const { data, error } = await this.supabase
      .from('analysis_engine_config')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createAnalysisEngineConfig(
    config: Partial<AnalysisEngineConfig>,
  ): Promise<AnalysisEngineConfig> {
    const { data, error } = await this.supabase
      .from('analysis_engine_config')
      .insert(config)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateAnalysisEngineConfig(
    id: string,
    updates: Partial<AnalysisEngineConfig>,
  ): Promise<AnalysisEngineConfig> {
    const { data, error } = await this.supabase
      .from('analysis_engine_config')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Photo Analysis Session Methods
  async getAnalysisSessions(
    filters: AnalysisSessionFilters = {},
  ): Promise<PhotoAnalysisSession[]> {
    let query = this.supabase.from('photo_analysis_sessions').select('*');

    // Apply filters
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    if (filters.treatment_type) {
      query = query.eq('treatment_type', filters.treatment_type);
    }
    if (filters.analysis_type) {
      query = query.eq('analysis_type', filters.analysis_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.accuracy_min) {
      query = query.gte('accuracy_score', filters.accuracy_min);
    }
    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getAnalysisSession(id: string): Promise<PhotoAnalysisSession | null> {
    const { data, error } = await this.supabase
      .from('photo_analysis_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createAnalysisSession(
    request: CreateAnalysisSessionRequest,
  ): Promise<PhotoAnalysisSession> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    const sessionData = {
      ...request,
      created_by: user?.id,
    };

    const { data, error } = await this.supabase
      .from('photo_analysis_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateAnalysisSession(
    id: string,
    updates: Partial<PhotoAnalysisSession>,
  ): Promise<PhotoAnalysisSession> {
    const { data, error } = await this.supabase
      .from('photo_analysis_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async deleteAnalysisSession(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('photo_analysis_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Before/After Photo Pair Methods
  async getPhotoPairs(
    filters: PhotoPairFilters = {},
  ): Promise<BeforeAfterPhotoPair[]> {
    let query = this.supabase.from('before_after_photo_pairs').select('*');

    // Apply filters
    if (filters.session_id) {
      query = query.eq('session_id', filters.session_id);
    }
    if (filters.treatment_area) {
      query = query.eq('treatment_area', filters.treatment_area);
    }
    if (filters.pair_type) {
      query = query.eq('pair_type', filters.pair_type);
    }
    if (filters.analysis_status) {
      query = query.eq('analysis_status', filters.analysis_status);
    }
    if (filters.improvement_min) {
      query = query.gte('improvement_percentage', filters.improvement_min);
    }
    if (filters.time_between_min) {
      query = query.gte('time_between_days', filters.time_between_min);
    }
    if (filters.time_between_max) {
      query = query.lte('time_between_days', filters.time_between_max);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getPhotoPair(id: string): Promise<BeforeAfterPhotoPair | null> {
    const { data, error } = await this.supabase
      .from('before_after_photo_pairs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createPhotoPair(
    request: CreatePhotoPairRequest,
  ): Promise<BeforeAfterPhotoPair> {
    const { data, error } = await this.supabase
      .from('before_after_photo_pairs')
      .insert(request)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updatePhotoPair(
    id: string,
    updates: Partial<BeforeAfterPhotoPair>,
  ): Promise<BeforeAfterPhotoPair> {
    const { data, error } = await this.supabase
      .from('before_after_photo_pairs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async deletePhotoPair(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('before_after_photo_pairs')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Image Analysis Result Methods
  async getAnalysisResults(
    filters: AnalysisResultFilters = {},
  ): Promise<ImageAnalysisResult[]> {
    let query = this.supabase.from('image_analysis_results').select('*');

    // Apply filters
    if (filters.photo_pair_id) {
      query = query.eq('photo_pair_id', filters.photo_pair_id);
    }
    if (filters.analysis_engine) {
      query = query.eq('analysis_engine', filters.analysis_engine);
    }
    if (filters.processing_time_max) {
      query = query.lte('processing_time_ms', filters.processing_time_max);
    }
    if (filters.date_from) {
      query = query.gte('analysis_timestamp', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('analysis_timestamp', filters.date_to);
    }

    const { data, error } = await query.order('analysis_timestamp', {
      ascending: false,
    });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getAnalysisResult(id: string): Promise<ImageAnalysisResult | null> {
    const { data, error } = await this.supabase
      .from('image_analysis_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createAnalysisResult(
    result: Partial<ImageAnalysisResult>,
  ): Promise<ImageAnalysisResult> {
    const { data, error } = await this.supabase
      .from('image_analysis_results')
      .insert(result)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Measurement Metrics Methods
  async getMeasurementMetrics(): Promise<MeasurementMetric[]> {
    const { data, error } = await this.supabase
      .from('measurement_metrics')
      .select('*')
      .eq('is_active', true)
      .order('metric_name');

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getMeasurementMetric(id: string): Promise<MeasurementMetric | null> {
    const { data, error } = await this.supabase
      .from('measurement_metrics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createMeasurementMetric(
    metric: Partial<MeasurementMetric>,
  ): Promise<MeasurementMetric> {
    const { data, error } = await this.supabase
      .from('measurement_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateMeasurementMetric(
    id: string,
    updates: Partial<MeasurementMetric>,
  ): Promise<MeasurementMetric> {
    const { data, error } = await this.supabase
      .from('measurement_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Treatment Areas Methods
  async getTreatmentAreas(): Promise<TreatmentArea[]> {
    const { data, error } = await this.supabase
      .from('treatment_areas')
      .select('*')
      .eq('is_active', true)
      .order('area_name');

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getTreatmentArea(id: string): Promise<TreatmentArea | null> {
    const { data, error } = await this.supabase
      .from('treatment_areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createTreatmentArea(
    area: Partial<TreatmentArea>,
  ): Promise<TreatmentArea> {
    const { data, error } = await this.supabase
      .from('treatment_areas')
      .insert(area)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateTreatmentArea(
    id: string,
    updates: Partial<TreatmentArea>,
  ): Promise<TreatmentArea> {
    const { data, error } = await this.supabase
      .from('treatment_areas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Visual Annotations Methods
  async getVisualAnnotations(
    analysisResultId: string,
  ): Promise<VisualAnnotation[]> {
    const { data, error } = await this.supabase
      .from('visual_annotations')
      .select('*')
      .eq('analysis_result_id', analysisResultId)
      .eq('is_visible', true)
      .order('created_at');

    if (error) {
      throw error;
    }
    return data || [];
  }

  async createVisualAnnotation(
    request: AnnotationCreateRequest,
  ): Promise<VisualAnnotation> {
    const { data, error } = await this.supabase
      .from('visual_annotations')
      .insert(request)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateVisualAnnotation(
    id: string,
    updates: Partial<VisualAnnotation>,
  ): Promise<VisualAnnotation> {
    const { data, error } = await this.supabase
      .from('visual_annotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async deleteVisualAnnotation(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('visual_annotations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Analysis Reports Methods
  async getAnalysisReports(
    filters: ReportFilters = {},
  ): Promise<AnalysisReport[]> {
    let query = this.supabase.from('analysis_reports').select('*');

    // Apply filters
    if (filters.session_id) {
      query = query.eq('session_id', filters.session_id);
    }
    if (filters.report_type) {
      query = query.eq('report_type', filters.report_type);
    }
    if (filters.generated_by) {
      query = query.eq('generated_by', filters.generated_by);
    }
    if (filters.date_from) {
      query = query.gte('generated_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('generated_at', filters.date_to);
    }
    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    const { data, error } = await query.order('generated_at', {
      ascending: false,
    });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async generateReport(
    request: GenerateReportRequest,
  ): Promise<AnalysisReport> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    // Get session data for report generation
    const session = await this.getAnalysisSession(request.session_id);
    if (!session) {
      throw new Error('Analysis session not found');
    }

    // Get photo pairs for the session
    const photoPairs = await this.getPhotoPairs({
      session_id: request.session_id,
    });

    // Generate report data based on session and pairs
    const reportData = {
      session,
      photo_pairs: photoPairs,
      analysis_summary: {
        total_pairs: photoPairs.length,
        analyzed_pairs: photoPairs.filter(
          (p) => p.analysis_status === 'analyzed',
        ).length,
        average_improvement:
          photoPairs.reduce(
            (acc, p) => acc + (p.improvement_percentage || 0),
            0,
          ) / photoPairs.length,
        overall_accuracy: session.accuracy_score,
        processing_time: session.processing_time_seconds,
      },
      // Add more report sections based on request.include_sections
    };

    const reportRecord = {
      session_id: request.session_id,
      report_type: request.report_type,
      report_title: `${request.report_type.charAt(0).toUpperCase() + request.report_type.slice(1)} Analysis Report`,
      report_data: reportData,
      export_formats: { [request.export_format || 'html']: true },
      template_used: 'default',
      generated_by: user?.id,
    };

    const { data, error } = await this.supabase
      .from('analysis_reports')
      .insert(reportRecord)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Quality Validation Methods
  async getQualityValidations(
    analysisResultId: string,
  ): Promise<QualityValidation[]> {
    const { data, error } = await this.supabase
      .from('quality_validations')
      .select('*')
      .eq('analysis_result_id', analysisResultId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async createQualityValidation(
    request: AccuracyValidationRequest,
  ): Promise<QualityValidation> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    const validationData = {
      ...request,
      validator_id: user?.id,
    };

    const { data, error } = await this.supabase
      .from('quality_validations')
      .insert(validationData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateQualityValidation(
    id: string,
    updates: Partial<QualityValidation>,
  ): Promise<QualityValidation> {
    const { data, error } = await this.supabase
      .from('quality_validations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // ML Model Training Methods
  async getMLModelTraining(): Promise<MLModelTraining[]> {
    const { data, error } = await this.supabase
      .from('ml_model_training')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async createMLModelTraining(
    request: ModelTrainingRequest,
  ): Promise<MLModelTraining> {
    const trainingData = {
      ...request,
      training_start: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('ml_model_training')
      .insert(trainingData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateMLModelTraining(
    id: string,
    updates: Partial<MLModelTraining>,
  ): Promise<MLModelTraining> {
    const { data, error } = await this.supabase
      .from('ml_model_training')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Analysis Operations
  async startAnalysis(
    request: StartAnalysisRequest,
  ): Promise<AnalysisProgressResponse> {
    // Update session status to processing
    await this.updateAnalysisSession(request.session_id, {
      status: 'processing',
      started_at: new Date().toISOString(),
    });

    // Get photo pairs for analysis
    const photoPairs = await this.getPhotoPairs({
      session_id: request.session_id,
    });

    // Simulate analysis progress (in real implementation, this would trigger actual CV processing)
    const progressResponse: AnalysisProgressResponse = {
      session_id: request.session_id,
      status: 'processing',
      progress_percentage: 0,
      processed_photos: 0,
      total_photos: photoPairs.length,
      estimated_completion_time: new Date(Date.now() + 30_000).toISOString(), // 30 seconds estimate
      current_processing: photoPairs[0],
    };

    return progressResponse;
  }

  async getAnalysisProgress(
    sessionId: string,
  ): Promise<AnalysisProgressResponse> {
    const session = await this.getAnalysisSession(sessionId);
    if (!session) {
      throw new Error('Analysis session not found');
    }

    const photoPairs = await this.getPhotoPairs({ session_id: sessionId });
    const processedPairs = photoPairs.filter(
      (p) => p.analysis_status === 'analyzed',
    );
    const currentProcessing = photoPairs.find(
      (p) => p.analysis_status === 'pending',
    );

    const progressResponse: AnalysisProgressResponse = {
      session_id: sessionId,
      status: session.status,
      progress_percentage:
        photoPairs.length > 0
          ? (processedPairs.length / photoPairs.length) * 100
          : 0,
      processed_photos: processedPairs.length,
      total_photos: photoPairs.length,
      current_processing: currentProcessing,
    };

    return progressResponse;
  }

  async performComparisonAnalysis(
    request: ComparisonAnalysisRequest,
  ): Promise<ComparisonAnalysisResponse> {
    const startTime = Date.now();

    // Get photo pair
    const photoPair = await this.getPhotoPair(request.photo_pair_id);
    if (!photoPair) {
      throw new Error('Photo pair not found');
    }

    // Simulate computer vision analysis (in real implementation, this would call actual CV algorithms)
    const improvementPercentage = Math.random() * 100; // Mock improvement calculation
    const comparisonScore = 90 + Math.random() * 10; // Mock comparison score (90-100)

    // Update photo pair with analysis results
    await this.updatePhotoPair(request.photo_pair_id, {
      analysis_status: 'analyzed',
      improvement_percentage: improvementPercentage,
      comparison_score: comparisonScore,
    });

    // Create analysis result record
    const analysisResult = await this.createAnalysisResult({
      photo_pair_id: request.photo_pair_id,
      analysis_engine: 'primary_cv_engine',
      processing_time_ms: Date.now() - startTime,
      feature_vectors: { mock: 'feature_data' },
      measurement_data: { improvement: improvementPercentage },
      change_detection: { areas_changed: ['area1', 'area2'] },
      quality_metrics: { sharpness: 0.95, lighting: 0.88 },
      confidence_scores: { overall: comparisonScore },
    });

    // Create quality validation
    const qualityValidation = await this.createQualityValidation({
      analysis_result_id: analysisResult.id,
      validation_type: 'automated',
    });

    const response: ComparisonAnalysisResponse = {
      photo_pair_id: request.photo_pair_id,
      improvement_percentage: improvementPercentage,
      comparison_score: comparisonScore,
      detailed_measurements: { improvement: improvementPercentage },
      visual_annotations: [], // Would be populated with actual annotations
      quality_assessment: qualityValidation,
      processing_time_ms: Date.now() - startTime,
    };

    return response;
  }

  // Dashboard and Analytics Methods
  async getDashboardStats(): Promise<AnalysisDashboardStats> {
    const [
      sessions,
      completedSessions,
      photoPairs,
      analyzedPairs,
      pendingValidations,
    ] = await Promise.all([
      this.getAnalysisSessions(),
      this.getAnalysisSessions({ status: 'completed' }),
      this.getPhotoPairs(),
      this.getPhotoPairs({ analysis_status: 'analyzed' }),
      this.supabase
        .from('quality_validations')
        .select('id')
        .eq('validation_status', 'pending'),
    ]);

    const recentActivity = sessions.slice(0, 5);
    const avgAccuracy =
      completedSessions.reduce((acc, s) => acc + (s.accuracy_score || 0), 0) /
      (completedSessions.length || 1);
    const avgProcessingTime =
      completedSessions.reduce(
        (acc, s) => acc + (s.processing_time_seconds || 0),
        0,
      ) / (completedSessions.length || 1);

    return {
      total_sessions: sessions.length,
      completed_sessions: completedSessions.length,
      average_accuracy: avgAccuracy,
      average_processing_time: avgProcessingTime,
      total_photo_pairs: photoPairs.length,
      analyzed_pairs: analyzedPairs.length,
      pending_validations: pendingValidations.data?.length || 0,
      recent_activity: recentActivity,
    };
  }

  async getAccuracyMetrics(): Promise<AccuracyMetrics> {
    const completedSessions = await this.getAnalysisSessions({
      status: 'completed',
    });
    const overallAccuracy =
      completedSessions.reduce((acc, s) => acc + (s.accuracy_score || 0), 0) /
      (completedSessions.length || 1);

    // Mock implementation - in real system, would aggregate actual metrics
    return {
      overall_accuracy: overallAccuracy,
      accuracy_by_treatment_area: {
        facial_full: 95.2,
        body_abdomen: 93.8,
        facial_upper: 96.1,
      },
      accuracy_by_engine: {
        primary_cv_engine: overallAccuracy,
      },
      accuracy_trend: [
        { date: '2025-01-20', accuracy: 94.5 },
        { date: '2025-01-21', accuracy: 95.1 },
        { date: '2025-01-22', accuracy: overallAccuracy },
      ],
      confidence_distribution: {
        high: 75,
        medium: 20,
        low: 5,
      },
    };
  }

  async getProcessingMetrics(): Promise<ProcessingMetrics> {
    const completedSessions = await this.getAnalysisSessions({
      status: 'completed',
    });
    const avgProcessingTime =
      completedSessions.reduce(
        (acc, s) => acc + (s.processing_time_seconds || 0),
        0,
      ) / (completedSessions.length || 1);

    const pendingSessions = await this.getAnalysisSessions({
      status: 'pending',
    });
    const processingSessions = await this.getAnalysisSessions({
      status: 'processing',
    });

    return {
      average_processing_time: avgProcessingTime * 1000, // Convert to ms
      processing_time_by_area: {
        facial_full: 25_000,
        body_abdomen: 35_000,
        facial_upper: 20_000,
      },
      processing_time_trend: [
        { date: '2025-01-20', time_ms: 28_000 },
        { date: '2025-01-21', time_ms: 26_000 },
        { date: '2025-01-22', time_ms: avgProcessingTime * 1000 },
      ],
      queue_statistics: {
        pending: pendingSessions.length,
        processing: processingSessions.length,
        completed_today: completedSessions.filter(
          (s) =>
            new Date(s.completed_at || '').toDateString() ===
            new Date().toDateString(),
        ).length,
      },
    };
  }

  async getQualityMetrics(): Promise<QualityMetrics> {
    // Mock implementation - in real system, would aggregate validation data
    return {
      validation_success_rate: 92.5,
      manual_review_rate: 7.5,
      accuracy_validation_results: {
        approved: 85,
        rejected: 8,
        needs_review: 7,
      },
      quality_score_distribution: {
        excellent: 60,
        good: 30,
        fair: 8,
        poor: 2,
      },
      improvement_validation: {
        accurate_predictions: 88,
        false_positives: 7,
        false_negatives: 5,
      },
    };
  }

  // Batch Operations
  async batchAnalysis(
    request: BatchAnalysisRequest,
  ): Promise<AnalysisProgressResponse[]> {
    const results = await Promise.all(
      request.session_ids.map((sessionId: string) =>
        this.startAnalysis({
          session_id: sessionId,
          analysis_parameters: request.analysis_parameters,
        }),
      ),
    );

    return results;
  }

  async batchUpdateSessions(
    sessionIds: string[],
    updates: Partial<PhotoAnalysisSession>,
  ): Promise<PhotoAnalysisSession[]> {
    const results = await Promise.all(
      sessionIds.map((id) => this.updateAnalysisSession(id, updates)),
    );

    return results;
  }

  async batchDeleteSessions(sessionIds: string[]): Promise<void> {
    await Promise.all(sessionIds.map((id) => this.deleteAnalysisSession(id)));
  }
}

// Export singleton instance
export const automatedBeforeAfterAnalysisService =
  new AutomatedBeforeAfterAnalysisService();
