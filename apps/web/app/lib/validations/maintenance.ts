// =====================================================================================
// EQUIPMENT MAINTENANCE VALIDATION SCHEMAS
// Epic 6 - Story 6.4: Zod validation schemas for equipment maintenance
// =====================================================================================

import { z } from 'zod';

// =====================================================================================
// ENUM VALIDATION SCHEMAS
// =====================================================================================

export const equipmentTypeSchema = z.enum([
  'medical_device',
  'diagnostic',
  'surgical',
  'laboratory',
  'office',
  'it',
] as const);

export const equipmentCategorySchema = z.enum([
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
  'other',
] as const);

export const equipmentStatusSchema = z.enum([
  'active',
  'maintenance',
  'out_of_service',
  'decommissioned',
] as const);

export const criticalityLevelSchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
] as const);

export const maintenanceTypeSchema = z.enum([
  'preventive',
  'predictive',
  'corrective',
  'emergency',
  'calibration',
] as const);

export const frequencyTypeSchema = z.enum([
  'fixed_interval',
  'usage_based',
  'condition_based',
] as const);

export const workOrderStatusSchema = z.enum([
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold',
] as const);

export const workOrderPrioritySchema = z.enum([
  'emergency',
  'high',
  'medium',
  'low',
] as const);

export const alertTypeSchema = z.enum([
  'scheduled_maintenance',
  'overdue_maintenance',
  'emergency',
  'calibration_due',
  'warranty_expiring',
] as const);

export const alertSeveritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info',
] as const);

// =====================================================================================
// EQUIPMENT SCHEMAS
// =====================================================================================

export const createEquipmentSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),
  name: z
    .string()
    .min(1, 'Nome do equipamento é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  model: z
    .string()
    .max(255, 'Modelo deve ter no máximo 255 caracteres')
    .optional(),
  manufacturer: z
    .string()
    .max(255, 'Fabricante deve ter no máximo 255 caracteres')
    .optional(),
  serial_number: z
    .string()
    .max(255, 'Número serial deve ter no máximo 255 caracteres')
    .optional(),
  equipment_type: equipmentTypeSchema,
  category: equipmentCategorySchema.optional(),

  // Location
  location: z
    .string()
    .max(255, 'Localização deve ter no máximo 255 caracteres')
    .optional(),
  department: z
    .string()
    .max(100, 'Departamento deve ter no máximo 100 caracteres')
    .optional(),
  room_number: z
    .string()
    .max(50, 'Número da sala deve ter no máximo 50 caracteres')
    .optional(),

  // Purchase and warranty
  purchase_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de compra deve estar no formato YYYY-MM-DD'
    )
    .optional(),
  purchase_cost: z
    .number()
    .min(0, 'Custo de compra deve ser positivo')
    .optional(),
  warranty_start_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de início da garantia deve estar no formato YYYY-MM-DD'
    )
    .optional(),
  warranty_end_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de fim da garantia deve estar no formato YYYY-MM-DD'
    )
    .optional(),
  vendor_id: z
    .string()
    .uuid('ID do fornecedor deve ser um UUID válido')
    .optional(),

  // Status
  criticality_level: criticalityLevelSchema.default('medium'),

  // Maintenance specifications
  estimated_lifespan_years: z
    .number()
    .int()
    .min(1)
    .max(50, 'Vida útil deve estar entre 1 e 50 anos')
    .optional(),
  maintenance_frequency_days: z
    .number()
    .int()
    .min(1, 'Frequência de manutenção deve ser pelo menos 1 dia')
    .optional(),
  usage_based_maintenance: z.boolean().default(false),
  usage_threshold_hours: z
    .number()
    .min(0, 'Limite de horas deve ser positivo')
    .optional(),
  usage_threshold_cycles: z
    .number()
    .int()
    .min(0, 'Limite de ciclos deve ser positivo')
    .optional(),

  // Regulatory
  requires_calibration: z.boolean().default(false),
  calibration_frequency_days: z
    .number()
    .int()
    .min(1, 'Frequência de calibração deve ser pelo menos 1 dia')
    .optional(),
  regulatory_requirements: z.array(z.string()).default([]),

  // Documentation
  manual_url: z.string().url('URL do manual deve ser válida').optional(),
  specifications: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export const updateEquipmentSchema = createEquipmentSchema
  .partial()
  .omit({ clinic_id: true });

export const equipmentFiltersSchema = z.object({
  equipment_type: z.array(equipmentTypeSchema).optional(),
  category: z.array(equipmentCategorySchema).optional(),
  status: z.array(equipmentStatusSchema).optional(),
  criticality_level: z.array(criticalityLevelSchema).optional(),
  department: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  requires_maintenance: z.boolean().optional(),
  warranty_expiring: z.boolean().optional(),
  search: z.string().min(1).optional(),
});

// =====================================================================================
// MAINTENANCE SCHEDULE SCHEMAS
// =====================================================================================

export const createMaintenanceScheduleSchema = z
  .object({
    equipment_id: z.string().uuid('ID do equipamento deve ser um UUID válido'),
    clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),

    // Schedule information
    maintenance_type: maintenanceTypeSchema,
    schedule_name: z
      .string()
      .min(1, 'Nome do cronograma é obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: z.string().optional(),

    // Frequency
    frequency_type: frequencyTypeSchema,
    frequency_days: z
      .number()
      .int()
      .min(1, 'Frequência em dias deve ser pelo menos 1')
      .optional(),
    frequency_hours: z
      .number()
      .min(0.1, 'Frequência em horas deve ser positiva')
      .optional(),
    frequency_cycles: z
      .number()
      .int()
      .min(1, 'Frequência em ciclos deve ser pelo menos 1')
      .optional(),

    // Scheduling preferences
    preferred_time_slot: z.string().max(20).optional(),
    estimated_duration_minutes: z
      .number()
      .int()
      .min(1, 'Duração estimada deve ser pelo menos 1 minuto')
      .optional(),
    required_skills: z.array(z.string()).default([]),
    required_tools: z.array(z.string()).default([]),
    required_parts: z.array(z.string()).default([]),

    // Cost planning
    estimated_cost: z
      .number()
      .min(0, 'Custo estimado deve ser positivo')
      .optional(),
    budget_code: z
      .string()
      .max(50, 'Código do orçamento deve ter no máximo 50 caracteres')
      .optional(),

    // Notification settings
    alert_days_before: z
      .number()
      .int()
      .min(0)
      .max(365, 'Alerta deve estar entre 0 e 365 dias')
      .default(7),
    critical_alert_days_before: z
      .number()
      .int()
      .min(0)
      .max(30, 'Alerta crítico deve estar entre 0 e 30 dias')
      .default(3),
    notification_recipients: z
      .array(z.string().uuid('ID do destinatário deve ser um UUID válido'))
      .default([]),
  })
  .refine(
    (data) => {
      // Validate frequency type requirements
      if (data.frequency_type === 'fixed_interval' && !data.frequency_days) {
        return false;
      }
      if (
        data.frequency_type === 'usage_based' &&
        !data.frequency_hours &&
        !data.frequency_cycles
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'Frequência deve ser especificada de acordo com o tipo selecionado',
    }
  );

export const updateMaintenanceScheduleSchema = z.object({
  // Schedule information
  maintenance_type: maintenanceTypeSchema.optional(),
  schedule_name: z
    .string()
    .min(1, 'Nome do cronograma é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional(),
  description: z.string().optional(),

  // Frequency
  frequency_type: frequencyTypeSchema.optional(),
  frequency_days: z
    .number()
    .int()
    .min(1, 'Frequência em dias deve ser pelo menos 1')
    .optional(),
  frequency_hours: z
    .number()
    .min(0.1, 'Frequência em horas deve ser positiva')
    .optional(),
  frequency_cycles: z
    .number()
    .int()
    .min(1, 'Frequência em ciclos deve ser pelo menos 1')
    .optional(),

  // Scheduling preferences
  preferred_time_slot: z.string().max(20).optional(),
  estimated_duration_minutes: z
    .number()
    .int()
    .min(1, 'Duração estimada deve ser pelo menos 1 minuto')
    .optional(),
  required_skills: z.array(z.string()).optional(),
  required_tools: z.array(z.string()).optional(),
  required_parts: z.array(z.string()).optional(),

  // Cost planning
  estimated_cost: z
    .number()
    .min(0, 'Custo estimado deve ser positivo')
    .optional(),
  budget_code: z
    .string()
    .max(50, 'Código do orçamento deve ter no máximo 50 caracteres')
    .optional(),

  // Notification settings
  alert_days_before: z
    .number()
    .int()
    .min(0)
    .max(365, 'Alerta deve estar entre 0 e 365 dias')
    .optional(),
  critical_alert_days_before: z
    .number()
    .int()
    .min(0)
    .max(30, 'Alerta crítico deve estar entre 0 e 30 dias')
    .optional(),
  notification_recipients: z
    .array(z.string().uuid('ID do destinatário deve ser um UUID válido'))
    .optional(),

  // Status
  is_active: z.boolean().optional(),
});

// =====================================================================================
// WORK ORDER SCHEMAS
// =====================================================================================

export const createWorkOrderSchema = z.object({
  equipment_id: z.string().uuid('ID do equipamento deve ser um UUID válido'),
  schedule_id: z
    .string()
    .uuid('ID do cronograma deve ser um UUID válido')
    .optional(),
  clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),

  // Work order information
  title: z
    .string()
    .min(1, 'Título da ordem de serviço é obrigatório')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z.string().optional(),
  maintenance_type: maintenanceTypeSchema,
  priority: workOrderPrioritySchema,

  // Scheduling
  scheduled_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data agendada deve estar no formato YYYY-MM-DD'
    )
    .optional(),
  scheduled_start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM')
    .optional(),
  estimated_duration_minutes: z
    .number()
    .int()
    .min(1, 'Duração estimada deve ser pelo menos 1 minuto')
    .optional(),

  // Assignment
  assigned_technician_id: z
    .string()
    .uuid('ID do técnico deve ser um UUID válido')
    .optional(),
  assigned_team_ids: z
    .array(z.string().uuid('ID da equipe deve ser um UUID válido'))
    .default([]),
  external_vendor_id: z
    .string()
    .uuid('ID do fornecedor deve ser um UUID válido')
    .optional(),
});

export const updateWorkOrderSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  maintenance_type: maintenanceTypeSchema.optional(),
  priority: workOrderPrioritySchema.optional(),
  status: workOrderStatusSchema.optional(),

  // Scheduling updates
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  scheduled_start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  estimated_duration_minutes: z.number().int().min(1).optional(),

  // Assignment updates
  assigned_technician_id: z.string().uuid().optional(),
  assigned_team_ids: z.array(z.string().uuid()).optional(),
  external_vendor_id: z.string().uuid().optional(),

  // Completion data
  completion_notes: z.string().optional(),
  issues_found: z.string().optional(),
  actions_taken: z.string().optional(),
  parts_used: z.record(z.any()).optional(),
  materials_cost: z.number().min(0).optional(),
  labor_hours: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),

  // Quality checks
  quality_check_passed: z.boolean().optional(),
  calibration_performed: z.boolean().optional(),
  calibration_results: z.record(z.any()).optional(),
  certification_updated: z.boolean().optional(),

  // Follow-up
  requires_follow_up: z.boolean().optional(),
  follow_up_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  follow_up_notes: z.string().optional(),

  // Documentation
  photos_urls: z.array(z.string().url()).optional(),
  documents_urls: z.array(z.string().url()).optional(),
});

// =====================================================================================
// USAGE LOG SCHEMAS
// =====================================================================================

export const createUsageLogSchema = z
  .object({
    equipment_id: z.string().uuid('ID do equipamento deve ser um UUID válido'),
    clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),

    // Usage session
    session_start: z
      .string()
      .datetime('Data/hora de início deve ser um datetime válido'),
    session_end: z
      .string()
      .datetime('Data/hora de fim deve ser um datetime válido')
      .optional(),
    usage_type: z.string().max(50).optional(),

    // Metrics
    cycles_performed: z
      .number()
      .int()
      .min(0, 'Ciclos executados deve ser positivo')
      .optional(),
    power_consumption_kwh: z
      .number()
      .min(0, 'Consumo de energia deve ser positivo')
      .optional(),
    performance_metrics: z.record(z.any()).optional(),

    // Operator information
    operated_by: z
      .string()
      .uuid('ID do operador deve ser um UUID válido')
      .optional(),
    department: z.string().max(100).optional(),
    patient_id: z
      .string()
      .uuid('ID do paciente deve ser um UUID válido')
      .optional(),
    procedure_type: z.string().max(100).optional(),

    // Environmental conditions
    ambient_temperature: z
      .number()
      .min(-50)
      .max(100, 'Temperatura deve estar entre -50°C e 100°C')
      .optional(),
    humidity_percentage: z
      .number()
      .min(0)
      .max(100, 'Umidade deve estar entre 0% e 100%')
      .optional(),
    environmental_conditions: z.record(z.any()).optional(),

    // Performance assessment
    performance_rating: z
      .number()
      .int()
      .min(1)
      .max(10, 'Avaliação deve estar entre 1 e 10')
      .optional(),
    issues_reported: z.string().optional(),
    anomalies_detected: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      // If session_end is provided, it should be after session_start
      if (data.session_end && data.session_start) {
        return new Date(data.session_end) > new Date(data.session_start);
      }
      return true;
    },
    {
      message: 'Data/hora de fim deve ser posterior ao início',
    }
  );

// =====================================================================================
// ALERT SCHEMAS
// =====================================================================================

export const createMaintenanceAlertSchema = z.object({
  equipment_id: z.string().uuid('ID do equipamento deve ser um UUID válido'),
  schedule_id: z
    .string()
    .uuid('ID do cronograma deve ser um UUID válido')
    .optional(),
  work_order_id: z
    .string()
    .uuid('ID da ordem de serviço deve ser um UUID válido')
    .optional(),
  clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),

  // Alert information
  alert_type: alertTypeSchema,
  severity: alertSeveritySchema,
  title: z
    .string()
    .min(1, 'Título do alerta é obrigatório')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  message: z.string().min(1, 'Mensagem do alerta é obrigatória'),

  // Timing
  trigger_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data do trigger deve estar no formato YYYY-MM-DD'
    ),
  due_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de vencimento deve estar no formato YYYY-MM-DD'
    )
    .optional(),

  // Notification settings
  notification_recipients: z
    .array(z.string().uuid('ID do destinatário deve ser um UUID válido'))
    .default([]),
  delivery_methods: z
    .array(z.enum(['email', 'sms', 'push', 'dashboard']))
    .default(['dashboard']),
});

export const acknowledgeAlertSchema = z.object({
  acknowledged_by: z.string().uuid('ID do usuário deve ser um UUID válido'),
  acknowledgment_notes: z.string().optional(),
});

export const resolveAlertSchema = z.object({
  resolved_by: z.string().uuid('ID do usuário deve ser um UUID válido'),
  resolution_notes: z.string().min(1, 'Notas de resolução são obrigatórias'),
});

// =====================================================================================
// VENDOR SERVICE CONTRACT SCHEMAS
// =====================================================================================

export const createVendorServiceContractSchema = z
  .object({
    equipment_id: z.string().uuid('ID do equipamento deve ser um UUID válido'),
    vendor_id: z.string().uuid('ID do fornecedor deve ser um UUID válido'),
    clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),

    // Contract information
    contract_number: z.string().max(100).optional(),
    contract_type: z.enum([
      'warranty',
      'service_agreement',
      'maintenance_contract',
    ]),
    service_level: z
      .enum(['basic', 'standard', 'premium', 'full_service'])
      .optional(),

    // Coverage
    coverage_type: z.enum([
      'parts_only',
      'labor_only',
      'parts_and_labor',
      'full_coverage',
    ]),
    covered_services: z.array(z.string()).default([]),
    excluded_services: z.array(z.string()).default([]),
    response_time_hours: z
      .number()
      .int()
      .min(1, 'Tempo de resposta deve ser pelo menos 1 hora')
      .optional(),
    resolution_time_hours: z
      .number()
      .int()
      .min(1, 'Tempo de resolução deve ser pelo menos 1 hora')
      .optional(),

    // Contract terms
    start_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Data de início deve estar no formato YYYY-MM-DD'
      ),
    end_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Data de fim deve estar no formato YYYY-MM-DD'
      ),
    auto_renewal: z.boolean().default(false),
    contract_value: z
      .number()
      .min(0, 'Valor do contrato deve ser positivo')
      .optional(),
    payment_schedule: z
      .enum(['monthly', 'quarterly', 'annually', 'one_time'])
      .optional(),

    // Performance guarantees
    uptime_guarantee_percentage: z
      .number()
      .min(0)
      .max(100, 'Garantia de disponibilidade deve estar entre 0% e 100%')
      .optional(),
    performance_penalties: z.record(z.any()).optional(),
    service_credits: z.record(z.any()).optional(),

    // Contact information
    vendor_contact_name: z.string().max(255).optional(),
    vendor_contact_phone: z.string().max(20).optional(),
    vendor_contact_email: z
      .string()
      .email('Email de contato deve ser válido')
      .optional(),
    emergency_contact_phone: z.string().max(20).optional(),

    // Documentation
    contract_document_url: z
      .string()
      .url('URL do documento deve ser válida')
      .optional(),
    terms_and_conditions_url: z
      .string()
      .url('URL dos termos deve ser válida')
      .optional(),
  })
  .refine(
    (data) => {
      // End date should be after start date
      return new Date(data.end_date) > new Date(data.start_date);
    },
    {
      message: 'Data de fim deve ser posterior à data de início',
    }
  );

// =====================================================================================
// COMPLIANCE RECORD SCHEMAS
// =====================================================================================

export const createComplianceRecordSchema = z.object({
  equipment_id: z.string().uuid('ID do equipamento deve ser um UUID válido'),
  clinic_id: z.string().uuid('ID da clínica deve ser um UUID válido'),

  // Compliance requirement
  regulation_name: z
    .string()
    .min(1, 'Nome da regulamentação é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  regulation_body: z.string().max(100).optional(),
  requirement_type: z.enum([
    'calibration',
    'inspection',
    'testing',
    'certification',
  ]),
  compliance_standard: z.string().max(100).optional(),

  // Timing
  last_compliance_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de última conformidade deve estar no formato YYYY-MM-DD'
    )
    .optional(),
  next_compliance_due_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de vencimento deve estar no formato YYYY-MM-DD'
    )
    .optional(),
  compliance_frequency_days: z
    .number()
    .int()
    .min(1, 'Frequência deve ser pelo menos 1 dia')
    .optional(),

  // Documentation
  certificate_number: z.string().max(100).optional(),
  certificate_url: z
    .string()
    .url('URL do certificado deve ser válida')
    .optional(),
  compliance_report_url: z
    .string()
    .url('URL do relatório deve ser válida')
    .optional(),
  test_results: z.record(z.any()).optional(),

  // Responsible parties
  compliance_officer_id: z
    .string()
    .uuid('ID do oficial de compliance deve ser um UUID válido')
    .optional(),
  testing_organization: z.string().max(255).optional(),
  certified_by: z.string().max(255).optional(),

  // Notification settings
  reminder_days_before: z
    .number()
    .int()
    .min(1)
    .max(365, 'Lembrete deve estar entre 1 e 365 dias')
    .default(30),
  critical_reminder_days_before: z
    .number()
    .int()
    .min(1)
    .max(30, 'Lembrete crítico deve estar entre 1 e 30 dias')
    .default(7),
  notification_recipients: z
    .array(z.string().uuid('ID do destinatário deve ser um UUID válido'))
    .default([]),
});

// =====================================================================================
// QUERY PARAMETER SCHEMAS
// =====================================================================================

export const equipmentQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  equipment_type: z.string().optional(),
  status: z.string().optional(),
  criticality_level: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  requires_maintenance: z.coerce.boolean().optional(),
  warranty_expiring: z.coerce.boolean().optional(),
  search: z.string().min(1).optional(),
});

export const maintenanceScheduleQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  equipment_id: z.string().uuid().optional(),
  maintenance_type: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  due_soon: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const workOrderQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  equipment_id: z.string().uuid().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigned_technician_id: z.string().uuid().optional(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const alertQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  equipment_id: z.string().uuid().optional(),
  alert_type: z.string().optional(),
  severity: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  is_acknowledged: z.coerce.boolean().optional(),
  is_resolved: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// =====================================================================================
// ANALYTICS SCHEMAS
// =====================================================================================

export const analyticsQuerySchema = z
  .object({
    clinic_id: z.string().uuid(),
    period_start: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Data de início deve estar no formato YYYY-MM-DD'
      ),
    period_end: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Data de fim deve estar no formato YYYY-MM-DD'
      ),
    equipment_ids: z.array(z.string().uuid()).optional(),
    equipment_types: z.array(equipmentTypeSchema).optional(),
    departments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      return new Date(data.period_end) > new Date(data.period_start);
    },
    {
      message: 'Data de fim deve ser posterior à data de início',
    }
  );

// =====================================================================================
// EXPORT VALIDATION FUNCTIONS
// =====================================================================================

export const validateEquipmentCreation = (data: unknown) => {
  return createEquipmentSchema.parse(data);
};

export const validateEquipmentUpdate = (data: unknown) => {
  return updateEquipmentSchema.parse(data);
};

export const validateMaintenanceScheduleCreation = (data: unknown) => {
  return createMaintenanceScheduleSchema.parse(data);
};

export const validateWorkOrderCreation = (data: unknown) => {
  return createWorkOrderSchema.parse(data);
};

export const validateUsageLogCreation = (data: unknown) => {
  return createUsageLogSchema.parse(data);
};

export const validateComplianceRecordCreation = (data: unknown) => {
  return createComplianceRecordSchema.parse(data);
};
