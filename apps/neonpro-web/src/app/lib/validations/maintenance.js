"use strict";
// =====================================================================================
// EQUIPMENT MAINTENANCE VALIDATION SCHEMAS
// Epic 6 - Story 6.4: Zod validation schemas for equipment maintenance
// =====================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateComplianceRecordCreation = exports.validateUsageLogCreation = exports.validateWorkOrderCreation = exports.validateMaintenanceScheduleCreation = exports.validateEquipmentUpdate = exports.validateEquipmentCreation = exports.analyticsQuerySchema = exports.alertQuerySchema = exports.workOrderQuerySchema = exports.maintenanceScheduleQuerySchema = exports.equipmentQuerySchema = exports.createComplianceRecordSchema = exports.createVendorServiceContractSchema = exports.resolveAlertSchema = exports.acknowledgeAlertSchema = exports.createMaintenanceAlertSchema = exports.createUsageLogSchema = exports.updateWorkOrderSchema = exports.createWorkOrderSchema = exports.updateMaintenanceScheduleSchema = exports.createMaintenanceScheduleSchema = exports.equipmentFiltersSchema = exports.updateEquipmentSchema = exports.createEquipmentSchema = exports.alertSeveritySchema = exports.alertTypeSchema = exports.workOrderPrioritySchema = exports.workOrderStatusSchema = exports.frequencyTypeSchema = exports.maintenanceTypeSchema = exports.criticalityLevelSchema = exports.equipmentStatusSchema = exports.equipmentCategorySchema = exports.equipmentTypeSchema = void 0;
var zod_1 = require("zod");
// =====================================================================================
// ENUM VALIDATION SCHEMAS
// =====================================================================================
exports.equipmentTypeSchema = zod_1.z.enum([
    'medical_device',
    'diagnostic',
    'surgical',
    'laboratory',
    'office',
    'it'
]);
exports.equipmentCategorySchema = zod_1.z.enum([
    'x_ray',
    'ultrasound',
    'ct_scan',
    'mri',
    'lab_analyzer',
    'autoclave',
    'surgical_table',
    'anesthesia_machine',
    'ventilator',
    'defibrillator',
    'ecg_machine',
    'blood_pressure_monitor',
    'infusion_pump',
    'centrifuge',
    'microscope',
    'refrigerator',
    'computer',
    'printer',
    'other'
]);
exports.equipmentStatusSchema = zod_1.z.enum([
    'active',
    'maintenance',
    'out_of_service',
    'decommissioned'
]);
exports.criticalityLevelSchema = zod_1.z.enum([
    'critical',
    'high',
    'medium',
    'low'
]);
exports.maintenanceTypeSchema = zod_1.z.enum([
    'preventive',
    'predictive',
    'corrective',
    'emergency',
    'calibration'
]);
exports.frequencyTypeSchema = zod_1.z.enum([
    'fixed_interval',
    'usage_based',
    'condition_based'
]);
exports.workOrderStatusSchema = zod_1.z.enum([
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold'
]);
exports.workOrderPrioritySchema = zod_1.z.enum([
    'emergency',
    'high',
    'medium',
    'low'
]);
exports.alertTypeSchema = zod_1.z.enum([
    'scheduled_maintenance',
    'overdue_maintenance',
    'emergency',
    'calibration_due',
    'warranty_expiring'
]);
exports.alertSeveritySchema = zod_1.z.enum([
    'critical',
    'high',
    'medium',
    'low',
    'info'
]);
// =====================================================================================
// EQUIPMENT SCHEMAS
// =====================================================================================
exports.createEquipmentSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    name: zod_1.z.string()
        .min(1, 'Nome do equipamento é obrigatório')
        .max(255, 'Nome deve ter no máximo 255 caracteres'),
    model: zod_1.z.string().max(255, 'Modelo deve ter no máximo 255 caracteres').optional(),
    manufacturer: zod_1.z.string().max(255, 'Fabricante deve ter no máximo 255 caracteres').optional(),
    serial_number: zod_1.z.string().max(255, 'Número serial deve ter no máximo 255 caracteres').optional(),
    equipment_type: exports.equipmentTypeSchema,
    category: exports.equipmentCategorySchema.optional(),
    // Location
    location: zod_1.z.string().max(255, 'Localização deve ter no máximo 255 caracteres').optional(),
    department: zod_1.z.string().max(100, 'Departamento deve ter no máximo 100 caracteres').optional(),
    room_number: zod_1.z.string().max(50, 'Número da sala deve ter no máximo 50 caracteres').optional(),
    // Purchase and warranty
    purchase_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de compra deve estar no formato YYYY-MM-DD').optional(),
    purchase_cost: zod_1.z.number().min(0, 'Custo de compra deve ser positivo').optional(),
    warranty_start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início da garantia deve estar no formato YYYY-MM-DD').optional(),
    warranty_end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de fim da garantia deve estar no formato YYYY-MM-DD').optional(),
    vendor_id: zod_1.z.string().uuid('ID do fornecedor deve ser um UUID válido').optional(),
    // Status
    criticality_level: exports.criticalityLevelSchema.default('medium'),
    // Maintenance specifications
    estimated_lifespan_years: zod_1.z.number().int().min(1).max(50, 'Vida útil deve estar entre 1 e 50 anos').optional(),
    maintenance_frequency_days: zod_1.z.number().int().min(1, 'Frequência de manutenção deve ser pelo menos 1 dia').optional(),
    usage_based_maintenance: zod_1.z.boolean().default(false),
    usage_threshold_hours: zod_1.z.number().min(0, 'Limite de horas deve ser positivo').optional(),
    usage_threshold_cycles: zod_1.z.number().int().min(0, 'Limite de ciclos deve ser positivo').optional(),
    // Regulatory
    requires_calibration: zod_1.z.boolean().default(false),
    calibration_frequency_days: zod_1.z.number().int().min(1, 'Frequência de calibração deve ser pelo menos 1 dia').optional(),
    regulatory_requirements: zod_1.z.array(zod_1.z.string()).default([]),
    // Documentation
    manual_url: zod_1.z.string().url('URL do manual deve ser válida').optional(),
    specifications: zod_1.z.record(zod_1.z.any()).optional(),
    notes: zod_1.z.string().optional()
});
exports.updateEquipmentSchema = exports.createEquipmentSchema.partial().omit({ clinic_id: true });
exports.equipmentFiltersSchema = zod_1.z.object({
    equipment_type: zod_1.z.array(exports.equipmentTypeSchema).optional(),
    category: zod_1.z.array(exports.equipmentCategorySchema).optional(),
    status: zod_1.z.array(exports.equipmentStatusSchema).optional(),
    criticality_level: zod_1.z.array(exports.criticalityLevelSchema).optional(),
    department: zod_1.z.array(zod_1.z.string()).optional(),
    location: zod_1.z.array(zod_1.z.string()).optional(),
    requires_maintenance: zod_1.z.boolean().optional(),
    warranty_expiring: zod_1.z.boolean().optional(),
    search: zod_1.z.string().min(1).optional()
});
// =====================================================================================
// MAINTENANCE SCHEDULE SCHEMAS
// =====================================================================================
exports.createMaintenanceScheduleSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid('ID do equipamento deve ser um UUID válido'),
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    // Schedule information
    maintenance_type: exports.maintenanceTypeSchema,
    schedule_name: zod_1.z.string()
        .min(1, 'Nome do cronograma é obrigatório')
        .max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: zod_1.z.string().optional(),
    // Frequency
    frequency_type: exports.frequencyTypeSchema,
    frequency_days: zod_1.z.number().int().min(1, 'Frequência em dias deve ser pelo menos 1').optional(),
    frequency_hours: zod_1.z.number().min(0.1, 'Frequência em horas deve ser positiva').optional(),
    frequency_cycles: zod_1.z.number().int().min(1, 'Frequência em ciclos deve ser pelo menos 1').optional(),
    // Scheduling preferences
    preferred_time_slot: zod_1.z.string().max(20).optional(),
    estimated_duration_minutes: zod_1.z.number().int().min(1, 'Duração estimada deve ser pelo menos 1 minuto').optional(),
    required_skills: zod_1.z.array(zod_1.z.string()).default([]),
    required_tools: zod_1.z.array(zod_1.z.string()).default([]),
    required_parts: zod_1.z.array(zod_1.z.string()).default([]),
    // Cost planning
    estimated_cost: zod_1.z.number().min(0, 'Custo estimado deve ser positivo').optional(),
    budget_code: zod_1.z.string().max(50, 'Código do orçamento deve ter no máximo 50 caracteres').optional(),
    // Notification settings
    alert_days_before: zod_1.z.number().int().min(0).max(365, 'Alerta deve estar entre 0 e 365 dias').default(7),
    critical_alert_days_before: zod_1.z.number().int().min(0).max(30, 'Alerta crítico deve estar entre 0 e 30 dias').default(3),
    notification_recipients: zod_1.z.array(zod_1.z.string().uuid('ID do destinatário deve ser um UUID válido')).default([])
}).refine(function (data) {
    // Validate frequency type requirements
    if (data.frequency_type === 'fixed_interval' && !data.frequency_days) {
        return false;
    }
    if (data.frequency_type === 'usage_based' && !data.frequency_hours && !data.frequency_cycles) {
        return false;
    }
    return true;
}, {
    message: 'Frequência deve ser especificada de acordo com o tipo selecionado'
});
exports.updateMaintenanceScheduleSchema = zod_1.z.object({
    // Schedule information
    maintenance_type: exports.maintenanceTypeSchema.optional(),
    schedule_name: zod_1.z.string()
        .min(1, 'Nome do cronograma é obrigatório')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .optional(),
    description: zod_1.z.string().optional(),
    // Frequency
    frequency_type: exports.frequencyTypeSchema.optional(),
    frequency_days: zod_1.z.number().int().min(1, 'Frequência em dias deve ser pelo menos 1').optional(),
    frequency_hours: zod_1.z.number().min(0.1, 'Frequência em horas deve ser positiva').optional(),
    frequency_cycles: zod_1.z.number().int().min(1, 'Frequência em ciclos deve ser pelo menos 1').optional(),
    // Scheduling preferences
    preferred_time_slot: zod_1.z.string().max(20).optional(),
    estimated_duration_minutes: zod_1.z.number().int().min(1, 'Duração estimada deve ser pelo menos 1 minuto').optional(),
    required_skills: zod_1.z.array(zod_1.z.string()).optional(),
    required_tools: zod_1.z.array(zod_1.z.string()).optional(),
    required_parts: zod_1.z.array(zod_1.z.string()).optional(),
    // Cost planning
    estimated_cost: zod_1.z.number().min(0, 'Custo estimado deve ser positivo').optional(),
    budget_code: zod_1.z.string().max(50, 'Código do orçamento deve ter no máximo 50 caracteres').optional(),
    // Notification settings
    alert_days_before: zod_1.z.number().int().min(0).max(365, 'Alerta deve estar entre 0 e 365 dias').optional(),
    critical_alert_days_before: zod_1.z.number().int().min(0).max(30, 'Alerta crítico deve estar entre 0 e 30 dias').optional(),
    notification_recipients: zod_1.z.array(zod_1.z.string().uuid('ID do destinatário deve ser um UUID válido')).optional(),
    // Status
    is_active: zod_1.z.boolean().optional()
});
// =====================================================================================
// WORK ORDER SCHEMAS
// =====================================================================================
exports.createWorkOrderSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid('ID do equipamento deve ser um UUID válido'),
    schedule_id: zod_1.z.string().uuid('ID do cronograma deve ser um UUID válido').optional(),
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    // Work order information
    title: zod_1.z.string()
        .min(1, 'Título da ordem de serviço é obrigatório')
        .max(255, 'Título deve ter no máximo 255 caracteres'),
    description: zod_1.z.string().optional(),
    maintenance_type: exports.maintenanceTypeSchema,
    priority: exports.workOrderPrioritySchema,
    // Scheduling
    scheduled_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data agendada deve estar no formato YYYY-MM-DD').optional(),
    scheduled_start_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    estimated_duration_minutes: zod_1.z.number().int().min(1, 'Duração estimada deve ser pelo menos 1 minuto').optional(),
    // Assignment
    assigned_technician_id: zod_1.z.string().uuid('ID do técnico deve ser um UUID válido').optional(),
    assigned_team_ids: zod_1.z.array(zod_1.z.string().uuid('ID da equipe deve ser um UUID válido')).default([]),
    external_vendor_id: zod_1.z.string().uuid('ID do fornecedor deve ser um UUID válido').optional()
});
exports.updateWorkOrderSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().optional(),
    maintenance_type: exports.maintenanceTypeSchema.optional(),
    priority: exports.workOrderPrioritySchema.optional(),
    status: exports.workOrderStatusSchema.optional(),
    // Scheduling updates
    scheduled_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    scheduled_start_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    estimated_duration_minutes: zod_1.z.number().int().min(1).optional(),
    // Assignment updates
    assigned_technician_id: zod_1.z.string().uuid().optional(),
    assigned_team_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    external_vendor_id: zod_1.z.string().uuid().optional(),
    // Completion data
    completion_notes: zod_1.z.string().optional(),
    issues_found: zod_1.z.string().optional(),
    actions_taken: zod_1.z.string().optional(),
    parts_used: zod_1.z.record(zod_1.z.any()).optional(),
    materials_cost: zod_1.z.number().min(0).optional(),
    labor_hours: zod_1.z.number().min(0).optional(),
    total_cost: zod_1.z.number().min(0).optional(),
    // Quality checks
    quality_check_passed: zod_1.z.boolean().optional(),
    calibration_performed: zod_1.z.boolean().optional(),
    calibration_results: zod_1.z.record(zod_1.z.any()).optional(),
    certification_updated: zod_1.z.boolean().optional(),
    // Follow-up
    requires_follow_up: zod_1.z.boolean().optional(),
    follow_up_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    follow_up_notes: zod_1.z.string().optional(),
    // Documentation
    photos_urls: zod_1.z.array(zod_1.z.string().url()).optional(),
    documents_urls: zod_1.z.array(zod_1.z.string().url()).optional()
});
// =====================================================================================
// USAGE LOG SCHEMAS
// =====================================================================================
exports.createUsageLogSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid('ID do equipamento deve ser um UUID válido'),
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    // Usage session
    session_start: zod_1.z.string().datetime('Data/hora de início deve ser um datetime válido'),
    session_end: zod_1.z.string().datetime('Data/hora de fim deve ser um datetime válido').optional(),
    usage_type: zod_1.z.string().max(50).optional(),
    // Metrics
    cycles_performed: zod_1.z.number().int().min(0, 'Ciclos executados deve ser positivo').optional(),
    power_consumption_kwh: zod_1.z.number().min(0, 'Consumo de energia deve ser positivo').optional(),
    performance_metrics: zod_1.z.record(zod_1.z.any()).optional(),
    // Operator information
    operated_by: zod_1.z.string().uuid('ID do operador deve ser um UUID válido').optional(),
    department: zod_1.z.string().max(100).optional(),
    patient_id: zod_1.z.string().uuid('ID do paciente deve ser um UUID válido').optional(),
    procedure_type: zod_1.z.string().max(100).optional(),
    // Environmental conditions
    ambient_temperature: zod_1.z.number().min(-50).max(100, 'Temperatura deve estar entre -50°C e 100°C').optional(),
    humidity_percentage: zod_1.z.number().min(0).max(100, 'Umidade deve estar entre 0% e 100%').optional(),
    environmental_conditions: zod_1.z.record(zod_1.z.any()).optional(),
    // Performance assessment
    performance_rating: zod_1.z.number().int().min(1).max(10, 'Avaliação deve estar entre 1 e 10').optional(),
    issues_reported: zod_1.z.string().optional(),
    anomalies_detected: zod_1.z.record(zod_1.z.any()).optional()
}).refine(function (data) {
    // If session_end is provided, it should be after session_start
    if (data.session_end && data.session_start) {
        return new Date(data.session_end) > new Date(data.session_start);
    }
    return true;
}, {
    message: 'Data/hora de fim deve ser posterior ao início'
});
// =====================================================================================
// ALERT SCHEMAS
// =====================================================================================
exports.createMaintenanceAlertSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid('ID do equipamento deve ser um UUID válido'),
    schedule_id: zod_1.z.string().uuid('ID do cronograma deve ser um UUID válido').optional(),
    work_order_id: zod_1.z.string().uuid('ID da ordem de serviço deve ser um UUID válido').optional(),
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    // Alert information
    alert_type: exports.alertTypeSchema,
    severity: exports.alertSeveritySchema,
    title: zod_1.z.string()
        .min(1, 'Título do alerta é obrigatório')
        .max(255, 'Título deve ter no máximo 255 caracteres'),
    message: zod_1.z.string()
        .min(1, 'Mensagem do alerta é obrigatória'),
    // Timing
    trigger_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data do trigger deve estar no formato YYYY-MM-DD'),
    due_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento deve estar no formato YYYY-MM-DD').optional(),
    // Notification settings
    notification_recipients: zod_1.z.array(zod_1.z.string().uuid('ID do destinatário deve ser um UUID válido')).default([]),
    delivery_methods: zod_1.z.array(zod_1.z.enum(['email', 'sms', 'push', 'dashboard'])).default(['dashboard'])
});
exports.acknowledgeAlertSchema = zod_1.z.object({
    acknowledged_by: zod_1.z.string().uuid('ID do usuário deve ser um UUID válido'),
    acknowledgment_notes: zod_1.z.string().optional()
});
exports.resolveAlertSchema = zod_1.z.object({
    resolved_by: zod_1.z.string().uuid('ID do usuário deve ser um UUID válido'),
    resolution_notes: zod_1.z.string()
        .min(1, 'Notas de resolução são obrigatórias')
});
// =====================================================================================
// VENDOR SERVICE CONTRACT SCHEMAS
// =====================================================================================
exports.createVendorServiceContractSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid('ID do equipamento deve ser um UUID válido'),
    vendor_id: zod_1.z.string().uuid('ID do fornecedor deve ser um UUID válido'),
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    // Contract information
    contract_number: zod_1.z.string().max(100).optional(),
    contract_type: zod_1.z.enum(['warranty', 'service_agreement', 'maintenance_contract']),
    service_level: zod_1.z.enum(['basic', 'standard', 'premium', 'full_service']).optional(),
    // Coverage
    coverage_type: zod_1.z.enum(['parts_only', 'labor_only', 'parts_and_labor', 'full_coverage']),
    covered_services: zod_1.z.array(zod_1.z.string()).default([]),
    excluded_services: zod_1.z.array(zod_1.z.string()).default([]),
    response_time_hours: zod_1.z.number().int().min(1, 'Tempo de resposta deve ser pelo menos 1 hora').optional(),
    resolution_time_hours: zod_1.z.number().int().min(1, 'Tempo de resolução deve ser pelo menos 1 hora').optional(),
    // Contract terms
    start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato YYYY-MM-DD'),
    end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de fim deve estar no formato YYYY-MM-DD'),
    auto_renewal: zod_1.z.boolean().default(false),
    contract_value: zod_1.z.number().min(0, 'Valor do contrato deve ser positivo').optional(),
    payment_schedule: zod_1.z.enum(['monthly', 'quarterly', 'annually', 'one_time']).optional(),
    // Performance guarantees
    uptime_guarantee_percentage: zod_1.z.number().min(0).max(100, 'Garantia de disponibilidade deve estar entre 0% e 100%').optional(),
    performance_penalties: zod_1.z.record(zod_1.z.any()).optional(),
    service_credits: zod_1.z.record(zod_1.z.any()).optional(),
    // Contact information
    vendor_contact_name: zod_1.z.string().max(255).optional(),
    vendor_contact_phone: zod_1.z.string().max(20).optional(),
    vendor_contact_email: zod_1.z.string().email('Email de contato deve ser válido').optional(),
    emergency_contact_phone: zod_1.z.string().max(20).optional(),
    // Documentation
    contract_document_url: zod_1.z.string().url('URL do documento deve ser válida').optional(),
    terms_and_conditions_url: zod_1.z.string().url('URL dos termos deve ser válida').optional()
}).refine(function (data) {
    // End date should be after start date
    return new Date(data.end_date) > new Date(data.start_date);
}, {
    message: 'Data de fim deve ser posterior à data de início'
});
// =====================================================================================
// COMPLIANCE RECORD SCHEMAS
// =====================================================================================
exports.createComplianceRecordSchema = zod_1.z.object({
    equipment_id: zod_1.z.string().uuid('ID do equipamento deve ser um UUID válido'),
    clinic_id: zod_1.z.string().uuid('ID da clínica deve ser um UUID válido'),
    // Compliance requirement
    regulation_name: zod_1.z.string()
        .min(1, 'Nome da regulamentação é obrigatório')
        .max(255, 'Nome deve ter no máximo 255 caracteres'),
    regulation_body: zod_1.z.string().max(100).optional(),
    requirement_type: zod_1.z.enum(['calibration', 'inspection', 'testing', 'certification']),
    compliance_standard: zod_1.z.string().max(100).optional(),
    // Timing
    last_compliance_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de última conformidade deve estar no formato YYYY-MM-DD').optional(),
    next_compliance_due_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento deve estar no formato YYYY-MM-DD').optional(),
    compliance_frequency_days: zod_1.z.number().int().min(1, 'Frequência deve ser pelo menos 1 dia').optional(),
    // Documentation
    certificate_number: zod_1.z.string().max(100).optional(),
    certificate_url: zod_1.z.string().url('URL do certificado deve ser válida').optional(),
    compliance_report_url: zod_1.z.string().url('URL do relatório deve ser válida').optional(),
    test_results: zod_1.z.record(zod_1.z.any()).optional(),
    // Responsible parties
    compliance_officer_id: zod_1.z.string().uuid('ID do oficial de compliance deve ser um UUID válido').optional(),
    testing_organization: zod_1.z.string().max(255).optional(),
    certified_by: zod_1.z.string().max(255).optional(),
    // Notification settings
    reminder_days_before: zod_1.z.number().int().min(1).max(365, 'Lembrete deve estar entre 1 e 365 dias').default(30),
    critical_reminder_days_before: zod_1.z.number().int().min(1).max(30, 'Lembrete crítico deve estar entre 1 e 30 dias').default(7),
    notification_recipients: zod_1.z.array(zod_1.z.string().uuid('ID do destinatário deve ser um UUID válido')).default([])
});
// =====================================================================================
// QUERY PARAMETER SCHEMAS
// =====================================================================================
exports.equipmentQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    equipment_type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    criticality_level: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    requires_maintenance: zod_1.z.coerce.boolean().optional(),
    warranty_expiring: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().min(1).optional()
});
exports.maintenanceScheduleQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    equipment_id: zod_1.z.string().uuid().optional(),
    maintenance_type: zod_1.z.string().optional(),
    is_active: zod_1.z.coerce.boolean().optional(),
    due_soon: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50)
});
exports.workOrderQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    equipment_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    assigned_technician_id: zod_1.z.string().uuid().optional(),
    date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50)
});
exports.alertQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    equipment_id: zod_1.z.string().uuid().optional(),
    alert_type: zod_1.z.string().optional(),
    severity: zod_1.z.string().optional(),
    is_active: zod_1.z.coerce.boolean().optional(),
    is_acknowledged: zod_1.z.coerce.boolean().optional(),
    is_resolved: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50)
});
// =====================================================================================
// ANALYTICS SCHEMAS
// =====================================================================================
exports.analyticsQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    period_start: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato YYYY-MM-DD'),
    period_end: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de fim deve estar no formato YYYY-MM-DD'),
    equipment_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    equipment_types: zod_1.z.array(exports.equipmentTypeSchema).optional(),
    departments: zod_1.z.array(zod_1.z.string()).optional()
}).refine(function (data) {
    return new Date(data.period_end) > new Date(data.period_start);
}, {
    message: 'Data de fim deve ser posterior à data de início'
});
// =====================================================================================
// EXPORT VALIDATION FUNCTIONS
// =====================================================================================
var validateEquipmentCreation = function (data) {
    return exports.createEquipmentSchema.parse(data);
};
exports.validateEquipmentCreation = validateEquipmentCreation;
var validateEquipmentUpdate = function (data) {
    return exports.updateEquipmentSchema.parse(data);
};
exports.validateEquipmentUpdate = validateEquipmentUpdate;
var validateMaintenanceScheduleCreation = function (data) {
    return exports.createMaintenanceScheduleSchema.parse(data);
};
exports.validateMaintenanceScheduleCreation = validateMaintenanceScheduleCreation;
var validateWorkOrderCreation = function (data) {
    return exports.createWorkOrderSchema.parse(data);
};
exports.validateWorkOrderCreation = validateWorkOrderCreation;
var validateUsageLogCreation = function (data) {
    return exports.createUsageLogSchema.parse(data);
};
exports.validateUsageLogCreation = validateUsageLogCreation;
var validateComplianceRecordCreation = function (data) {
    return exports.createComplianceRecordSchema.parse(data);
};
exports.validateComplianceRecordCreation = validateComplianceRecordCreation;
