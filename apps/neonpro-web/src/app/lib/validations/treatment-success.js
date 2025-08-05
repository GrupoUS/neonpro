"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceReportQuerySchema = exports.qualityBenchmarkQuerySchema = exports.protocolOptimizationQuerySchema = exports.providerPerformanceQuerySchema = exports.successMetricsQuerySchema = exports.treatmentSuccessQuerySchema = exports.updateComplianceReportSchema = exports.createComplianceReportSchema = exports.updateSuccessPredictionSchema = exports.createSuccessPredictionSchema = exports.updateQualityBenchmarkSchema = exports.createQualityBenchmarkSchema = exports.updateProtocolOptimizationSchema = exports.createProtocolOptimizationSchema = exports.createProviderPerformanceSchema = exports.createSuccessMetricsSchema = exports.updateTreatmentOutcomeSchema = exports.createTreatmentOutcomeSchema = void 0;
var zod_1 = require("zod");
// Treatment Outcome Schemas
exports.createTreatmentOutcomeSchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid('ID do paciente deve ser um UUID válido'),
    treatment_id: zod_1.z.string().min(1, 'ID do tratamento é obrigatório'),
    provider_id: zod_1.z.string().uuid('ID do profissional deve ser um UUID válido'),
    treatment_type: zod_1.z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
    treatment_date: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de tratamento inválida'),
    success_criteria: zod_1.z.record(zod_1.z.any()).refine(function (obj) { return Object.keys(obj).length > 0; }, 'Critérios de sucesso são obrigatórios'),
    notes: zod_1.z.string().optional(),
});
exports.updateTreatmentOutcomeSchema = zod_1.z.object({
    outcome_date: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de resultado inválida').optional(),
    success_score: zod_1.z.number().min(0).max(1, 'Score de sucesso deve estar entre 0 e 1').optional(),
    actual_outcomes: zod_1.z.record(zod_1.z.any()).optional(),
    before_photos: zod_1.z.array(zod_1.z.string().url('URL da foto inválida')).optional(),
    after_photos: zod_1.z.array(zod_1.z.string().url('URL da foto inválida')).optional(),
    patient_satisfaction_score: zod_1.z.number().min(0).max(1, 'Score de satisfação deve estar entre 0 e 1').optional(),
    complications: zod_1.z.record(zod_1.z.any()).optional(),
    follow_up_required: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'completed', 'cancelled']).optional(),
});
// Success Metrics Schemas
exports.createSuccessMetricsSchema = zod_1.z.object({
    treatment_type: zod_1.z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
    provider_id: zod_1.z.string().uuid('ID do profissional deve ser um UUID válido').optional(),
    time_period: zod_1.z.enum(['monthly', 'quarterly', 'yearly'], {
        errorMap: function () { return ({ message: 'Período deve ser monthly, quarterly ou yearly' }); }
    }),
    period_start: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de início inválida'),
    period_end: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de fim inválida'),
    total_treatments: zod_1.z.number().int().min(0, 'Total de tratamentos deve ser positivo'),
    successful_treatments: zod_1.z.number().int().min(0, 'Tratamentos bem-sucedidos deve ser positivo'),
    success_rate: zod_1.z.number().min(0).max(1, 'Taxa de sucesso deve estar entre 0 e 1'),
    average_satisfaction: zod_1.z.number().min(0).max(1, 'Satisfação média deve estar entre 0 e 1').optional(),
    complication_rate: zod_1.z.number().min(0).max(1, 'Taxa de complicação deve estar entre 0 e 1').optional(),
    benchmarks: zod_1.z.record(zod_1.z.any()).optional(),
    industry_comparison: zod_1.z.record(zod_1.z.any()).optional(),
}).refine(function (data) { return data.successful_treatments <= data.total_treatments; }, {
    message: 'Tratamentos bem-sucedidos não pode ser maior que o total',
    path: ['successful_treatments']
});
// Provider Performance Schemas
exports.createProviderPerformanceSchema = zod_1.z.object({
    provider_id: zod_1.z.string().uuid('ID do profissional deve ser um UUID válido'),
    evaluation_period: zod_1.z.string().min(1, 'Período de avaliação é obrigatório'),
    period_start: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de início inválida'),
    period_end: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de fim inválida'),
    overall_success_rate: zod_1.z.number().min(0).max(1, 'Taxa de sucesso deve estar entre 0 e 1').optional(),
    patient_satisfaction_avg: zod_1.z.number().min(0).max(1, 'Satisfação média deve estar entre 0 e 1').optional(),
    total_treatments: zod_1.z.number().int().min(0, 'Total de tratamentos deve ser positivo'),
    specialties: zod_1.z.record(zod_1.z.any()).optional(),
    performance_trends: zod_1.z.record(zod_1.z.any()).optional(),
    improvement_areas: zod_1.z.record(zod_1.z.any()).optional(),
    achievements: zod_1.z.record(zod_1.z.any()).optional(),
    training_recommendations: zod_1.z.record(zod_1.z.any()).optional(),
    certification_status: zod_1.z.record(zod_1.z.any()).optional(),
});
// Protocol Optimization Schemas
exports.createProtocolOptimizationSchema = zod_1.z.object({
    treatment_type: zod_1.z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
    current_protocol: zod_1.z.record(zod_1.z.any()).refine(function (obj) { return Object.keys(obj).length > 0; }, 'Protocolo atual é obrigatório'),
    recommended_changes: zod_1.z.record(zod_1.z.any()).refine(function (obj) { return Object.keys(obj).length > 0; }, 'Mudanças recomendadas são obrigatórias'),
    success_rate_improvement: zod_1.z.number().min(0, 'Melhoria da taxa de sucesso deve ser positiva').optional(),
    evidence_data: zod_1.z.record(zod_1.z.any()).optional(),
    implementation_priority: zod_1.z.enum(['low', 'medium', 'high', 'critical'], {
        errorMap: function () { return ({ message: 'Prioridade deve ser low, medium, high ou critical' }); }
    }),
    cost_impact: zod_1.z.number().optional(),
    timeline_estimate: zod_1.z.string().optional(),
});
exports.updateProtocolOptimizationSchema = zod_1.z.object({
    current_protocol: zod_1.z.record(zod_1.z.any()).optional(),
    recommended_changes: zod_1.z.record(zod_1.z.any()).optional(),
    success_rate_improvement: zod_1.z.number().min(0, 'Melhoria da taxa de sucesso deve ser positiva').optional(),
    evidence_data: zod_1.z.record(zod_1.z.any()).optional(),
    implementation_priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    cost_impact: zod_1.z.number().optional(),
    timeline_estimate: zod_1.z.string().optional(),
    approval_status: zod_1.z.enum(['pending', 'approved', 'rejected', 'implemented']).optional(),
    approved_by: zod_1.z.string().uuid('ID do aprovador deve ser um UUID válido').optional(),
    implementation_date: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de implementação inválida').optional(),
    results_tracking: zod_1.z.record(zod_1.z.any()).optional(),
});
// Quality Benchmark Schemas
exports.createQualityBenchmarkSchema = zod_1.z.object({
    treatment_type: zod_1.z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
    benchmark_type: zod_1.z.enum(['industry_standard', 'clinic_target', 'best_practice'], {
        errorMap: function () { return ({ message: 'Tipo de benchmark deve ser industry_standard, clinic_target ou best_practice' }); }
    }),
    metric_name: zod_1.z.string().min(1, 'Nome da métrica é obrigatório').max(100),
    target_value: zod_1.z.number().min(0, 'Valor alvo deve ser positivo'),
    benchmark_source: zod_1.z.string().max(200).optional(),
    update_frequency: zod_1.z.string().optional(),
});
exports.updateQualityBenchmarkSchema = zod_1.z.object({
    benchmark_type: zod_1.z.enum(['industry_standard', 'clinic_target', 'best_practice']).optional(),
    metric_name: zod_1.z.string().min(1, 'Nome da métrica é obrigatório').max(100).optional(),
    target_value: zod_1.z.number().min(0, 'Valor alvo deve ser positivo').optional(),
    current_value: zod_1.z.number().min(0, 'Valor atual deve ser positivo').optional(),
    variance_percentage: zod_1.z.number().optional(),
    benchmark_source: zod_1.z.string().max(200).optional(),
    update_frequency: zod_1.z.string().optional(),
    last_updated: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de atualização inválida').optional(),
    status: zod_1.z.enum(['active', 'inactive', 'deprecated']).optional(),
});
// Success Prediction Schemas
exports.createSuccessPredictionSchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid('ID do paciente deve ser um UUID válido'),
    treatment_type: zod_1.z.string().min(1, 'Tipo de tratamento é obrigatório').max(100),
    prediction_factors: zod_1.z.record(zod_1.z.any()).refine(function (obj) { return Object.keys(obj).length > 0; }, 'Fatores de predição são obrigatórios'),
    confidence_score: zod_1.z.number().min(0).max(1, 'Score de confiança deve estar entre 0 e 1').optional(),
    risk_factors: zod_1.z.record(zod_1.z.any()).optional(),
    recommendations: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateSuccessPredictionSchema = zod_1.z.object({
    predicted_success_rate: zod_1.z.number().min(0).max(1, 'Taxa de sucesso predita deve estar entre 0 e 1').optional(),
    prediction_factors: zod_1.z.record(zod_1.z.any()).optional(),
    confidence_score: zod_1.z.number().min(0).max(1, 'Score de confiança deve estar entre 0 e 1').optional(),
    risk_factors: zod_1.z.record(zod_1.z.any()).optional(),
    recommendations: zod_1.z.record(zod_1.z.any()).optional(),
});
// Compliance Report Schemas
exports.createComplianceReportSchema = zod_1.z.object({
    report_type: zod_1.z.string().min(1, 'Tipo de relatório é obrigatório').max(100),
    reporting_period: zod_1.z.string().min(1, 'Período de relatório é obrigatório'),
    period_start: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de início inválida'),
    period_end: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data de fim inválida'),
    report_data: zod_1.z.record(zod_1.z.any()).refine(function (obj) { return Object.keys(obj).length > 0; }, 'Dados do relatório são obrigatórios'),
    compliance_score: zod_1.z.number().min(0).max(1, 'Score de conformidade deve estar entre 0 e 1').optional(),
    findings: zod_1.z.record(zod_1.z.any()).optional(),
    recommendations: zod_1.z.record(zod_1.z.any()).optional(),
    action_items: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateComplianceReportSchema = zod_1.z.object({
    report_data: zod_1.z.record(zod_1.z.any()).optional(),
    compliance_score: zod_1.z.number().min(0).max(1, 'Score de conformidade deve estar entre 0 e 1').optional(),
    findings: zod_1.z.record(zod_1.z.any()).optional(),
    recommendations: zod_1.z.record(zod_1.z.any()).optional(),
    action_items: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.enum(['draft', 'review', 'approved', 'published']).optional(),
    reviewed_by: zod_1.z.string().uuid('ID do revisor deve ser um UUID válido').optional(),
});
// Query Parameter Schemas
exports.treatmentSuccessQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    treatment_type: zod_1.z.string().optional(),
    provider_id: zod_1.z.string().uuid().optional(),
    date_from: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data inicial inválida').optional(),
    date_to: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data final inválida').optional(),
    success_rate_min: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0).max(1)).optional(),
    success_rate_max: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0).max(1)).optional(),
    satisfaction_min: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0).max(1)).optional(),
    status: zod_1.z.enum(['active', 'completed', 'cancelled']).optional(),
    has_complications: zod_1.z.string().transform(function (val) { return val === 'true'; }).optional(),
});
exports.successMetricsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    treatment_type: zod_1.z.string().optional(),
    provider_id: zod_1.z.string().uuid().optional(),
    time_period: zod_1.z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    success_rate_min: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0).max(1)).optional(),
    period_start: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data inicial inválida').optional(),
    period_end: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data final inválida').optional(),
});
exports.providerPerformanceQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    provider_id: zod_1.z.string().uuid().optional(),
    evaluation_period: zod_1.z.string().optional(),
    success_rate_min: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0).max(1)).optional(),
    period_start: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data inicial inválida').optional(),
    period_end: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data final inválida').optional(),
});
exports.protocolOptimizationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    treatment_type: zod_1.z.string().optional(),
    implementation_priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    approval_status: zod_1.z.enum(['pending', 'approved', 'rejected', 'implemented']).optional(),
    success_improvement_min: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(0)).optional(),
});
exports.qualityBenchmarkQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    treatment_type: zod_1.z.string().optional(),
    benchmark_type: zod_1.z.enum(['industry_standard', 'clinic_target', 'best_practice']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'deprecated']).optional(),
});
exports.complianceReportQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    report_type: zod_1.z.string().optional(),
    reporting_period: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'review', 'approved', 'published']).optional(),
    period_start: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data inicial inválida').optional(),
    period_end: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, 'Data final inválida').optional(),
});
