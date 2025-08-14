import { z } from 'zod';

// Treatment Outcome Schemas
export const createTreatmentOutcomeSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  treatment_id: z.string().min(1, 'ID do tratamento é obrigatório'),
  provider_id: z.string().uuid('ID do profissional deve ser um UUID válido'),
  treatment_type: z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
  treatment_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de tratamento inválida'),
  success_criteria: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, 'Critérios de sucesso são obrigatórios'),
  notes: z.string().optional(),
});

export const updateTreatmentOutcomeSchema = z.object({
  outcome_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de resultado inválida').optional(),
  success_score: z.number().min(0).max(1, 'Score de sucesso deve estar entre 0 e 1').optional(),
  actual_outcomes: z.record(z.any()).optional(),
  before_photos: z.array(z.string().url('URL da foto inválida')).optional(),
  after_photos: z.array(z.string().url('URL da foto inválida')).optional(),
  patient_satisfaction_score: z.number().min(0).max(1, 'Score de satisfação deve estar entre 0 e 1').optional(),
  complications: z.record(z.any()).optional(),
  follow_up_required: z.boolean().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

// Success Metrics Schemas
export const createSuccessMetricsSchema = z.object({
  treatment_type: z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
  provider_id: z.string().uuid('ID do profissional deve ser um UUID válido').optional(),
  time_period: z.enum(['monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({ message: 'Período deve ser monthly, quarterly ou yearly' })
  }),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida'),
  total_treatments: z.number().int().min(0, 'Total de tratamentos deve ser positivo'),
  successful_treatments: z.number().int().min(0, 'Tratamentos bem-sucedidos deve ser positivo'),
  success_rate: z.number().min(0).max(1, 'Taxa de sucesso deve estar entre 0 e 1'),
  average_satisfaction: z.number().min(0).max(1, 'Satisfação média deve estar entre 0 e 1').optional(),
  complication_rate: z.number().min(0).max(1, 'Taxa de complicação deve estar entre 0 e 1').optional(),
  benchmarks: z.record(z.any()).optional(),
  industry_comparison: z.record(z.any()).optional(),
}).refine((data) => data.successful_treatments <= data.total_treatments, {
  message: 'Tratamentos bem-sucedidos não pode ser maior que o total',
  path: ['successful_treatments']
});

// Provider Performance Schemas
export const createProviderPerformanceSchema = z.object({
  provider_id: z.string().uuid('ID do profissional deve ser um UUID válido'),
  evaluation_period: z.string().min(1, 'Período de avaliação é obrigatório'),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida'),
  overall_success_rate: z.number().min(0).max(1, 'Taxa de sucesso deve estar entre 0 e 1').optional(),
  patient_satisfaction_avg: z.number().min(0).max(1, 'Satisfação média deve estar entre 0 e 1').optional(),
  total_treatments: z.number().int().min(0, 'Total de tratamentos deve ser positivo'),
  specialties: z.record(z.any()).optional(),
  performance_trends: z.record(z.any()).optional(),
  improvement_areas: z.record(z.any()).optional(),
  achievements: z.record(z.any()).optional(),
  training_recommendations: z.record(z.any()).optional(),
  certification_status: z.record(z.any()).optional(),
});

// Protocol Optimization Schemas
export const createProtocolOptimizationSchema = z.object({
  treatment_type: z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
  current_protocol: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, 'Protocolo atual é obrigatório'),
  recommended_changes: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, 'Mudanças recomendadas são obrigatórias'),
  success_rate_improvement: z.number().min(0, 'Melhoria da taxa de sucesso deve ser positiva').optional(),
  evidence_data: z.record(z.any()).optional(),
  implementation_priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Prioridade deve ser low, medium, high ou critical' })
  }),
  cost_impact: z.number().optional(),
  timeline_estimate: z.string().optional(),
});

export const updateProtocolOptimizationSchema = z.object({
  current_protocol: z.record(z.any()).optional(),
  recommended_changes: z.record(z.any()).optional(),
  success_rate_improvement: z.number().min(0, 'Melhoria da taxa de sucesso deve ser positiva').optional(),
  evidence_data: z.record(z.any()).optional(),
  implementation_priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  cost_impact: z.number().optional(),
  timeline_estimate: z.string().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected', 'implemented']).optional(),
  approved_by: z.string().uuid('ID do aprovador deve ser um UUID válido').optional(),
  implementation_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de implementação inválida').optional(),
  results_tracking: z.record(z.any()).optional(),
});

// Quality Benchmark Schemas
export const createQualityBenchmarkSchema = z.object({
  treatment_type: z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
  benchmark_type: z.enum(['industry_standard', 'clinic_target', 'best_practice'], {
    errorMap: () => ({ message: 'Tipo de benchmark deve ser industry_standard, clinic_target ou best_practice' })
  }),
  metric_name: z.string().min(1, 'Nome da métrica é obrigatório').max(100),
  target_value: z.number().min(0, 'Valor alvo deve ser positivo'),
  benchmark_source: z.string().max(200).optional(),
  update_frequency: z.string().optional(),
});

export const updateQualityBenchmarkSchema = z.object({
  benchmark_type: z.enum(['industry_standard', 'clinic_target', 'best_practice']).optional(),
  metric_name: z.string().min(1, 'Nome da métrica é obrigatório').max(100).optional(),
  target_value: z.number().min(0, 'Valor alvo deve ser positivo').optional(),
  current_value: z.number().min(0, 'Valor atual deve ser positivo').optional(),
  variance_percentage: z.number().optional(),
  benchmark_source: z.string().max(200).optional(),
  update_frequency: z.string().optional(),
  last_updated: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de atualização inválida').optional(),
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
});

// Success Prediction Schemas
export const createSuccessPredictionSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  treatment_type: z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
  prediction_factors: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, 'Fatores de predição são obrigatórios'),
  confidence_score: z.number().min(0).max(1, 'Score de confiança deve estar entre 0 e 1').optional(),
  risk_factors: z.record(z.any()).optional(),
  recommendations: z.record(z.any()).optional(),
});

export const updateSuccessPredictionSchema = z.object({
  predicted_success_rate: z.number().min(0).max(1, 'Taxa de sucesso predita deve estar entre 0 e 1').optional(),
  prediction_factors: z.record(z.any()).optional(),
  confidence_score: z.number().min(0).max(1, 'Score de confiança deve estar entre 0 e 1').optional(),
  risk_factors: z.record(z.any()).optional(),
  recommendations: z.record(z.any()).optional(),
});

// Compliance Report Schemas
export const createComplianceReportSchema = z.object({
  report_type: z.string().min(1, 'Tipo de relatório é obrigatório').max(100),
  reporting_period: z.string().min(1, 'Período de relatório é obrigatório'),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida'),
  report_data: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, 'Dados do relatório são obrigatórios'),
  compliance_score: z.number().min(0).max(1, 'Score de conformidade deve estar entre 0 e 1').optional(),
  findings: z.record(z.any()).optional(),
  recommendations: z.record(z.any()).optional(),
  action_items: z.record(z.any()).optional(),
});

export const updateComplianceReportSchema = z.object({
  report_data: z.record(z.any()).optional(),
  compliance_score: z.number().min(0).max(1, 'Score de conformidade deve estar entre 0 e 1').optional(),
  findings: z.record(z.any()).optional(),
  recommendations: z.record(z.any()).optional(),
  action_items: z.record(z.any()).optional(),
  status: z.enum(['draft', 'review', 'approved', 'published']).optional(),
  reviewed_by: z.string().uuid('ID do revisor deve ser um UUID válido').optional(),
});

// Query Parameter Schemas
export const treatmentSuccessQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  treatment_type: z.string().optional(),
  provider_id: z.string().uuid().optional(),
  date_from: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  date_to: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
  success_rate_min: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
  success_rate_max: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
  satisfaction_min: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  has_complications: z.string().transform((val) => val === 'true').optional(),
});

export const successMetricsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  treatment_type: z.string().optional(),
  provider_id: z.string().uuid().optional(),
  time_period: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  success_rate_min: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
});

export const providerPerformanceQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  provider_id: z.string().uuid().optional(),
  evaluation_period: z.string().optional(),
  success_rate_min: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
});

export const protocolOptimizationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  treatment_type: z.string().optional(),
  implementation_priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected', 'implemented']).optional(),
  success_improvement_min: z.string().transform(Number).pipe(z.number().min(0)).optional(),
});

export const qualityBenchmarkQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  treatment_type: z.string().optional(),
  benchmark_type: z.enum(['industry_standard', 'clinic_target', 'best_practice']).optional(),
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
});

export const complianceReportQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  report_type: z.string().optional(),
  reporting_period: z.string().optional(),
  status: z.enum(['draft', 'review', 'approved', 'published']).optional(),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
});
