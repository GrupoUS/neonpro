// CopilotKit action types for healthcare AI services
import { z } from 'zod';
import { AgentType } from './hooks';

// Action parameter types
export const ActionParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string(),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.unknown()).optional(),
    custom: z.function().optional()
  }).optional(),
  examples: z.array(z.unknown()).optional()
});

export type ActionParameter = z.infer<typeof ActionParameterSchema>;

// Action execution context
export const ActionExecutionContextSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  patientId: z.string().optional(),
  timestamp: z.date(),
  environment: z.enum(['development', 'staging', 'production']),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  locale: z.string().default('pt-BR')
});

export type ActionExecutionContext = z.infer<typeof ActionExecutionContextSchema>;

// Action execution result
export const ActionExecutionResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  metadata: z.object({
    executionTime: z.number(),
    tokensUsed: z.number().optional(),
    cost: z.number().optional(),
    provider: z.string(),
    model: z.string()
  }).optional(),
  suggestions: z.array(z.string()).optional(),
  followUpActions: z.array(z.string()).optional(),
  requiresHumanReview: z.boolean().default(false),
  confidence: z.number().min(0).max(1).optional()
});

export type ActionExecutionResult = z.infer<typeof ActionExecutionResultSchema>;

// Base action configuration
export const CopilotActionConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    'clinical_assessment',
    'treatment_planning',
    'diagnostic_support',
    'medication_management',
    'patient_education',
    'aesthetic_consultation',
    'compliance_validation',
    'risk_assessment',
    'administrative_tasks'
  ]),
  parameters: z.array(ActionParameterSchema),
  handler: z.function(),
  enabled: z.boolean().default(true),
  icon: z.string().optional(),
  color: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'gt', 'lt', 'in', 'not_in']),
    value: z.unknown()
  })).optional(),
  validation: z.object({
    schema: z.unknown().optional(),
    validate: z.function().optional(),
    errorMessage: z.string().optional()
  }).optional(),
  compliance: z.object({
    validateConsent: z.boolean().default(true),
    redactPII: z.boolean().default(true),
    auditExecution: z.boolean().default(true),
    frameworks: z.array(z.enum(['lgpd', 'anvisa', 'cfm', 'general'])).default(['lgpd'])
  }).optional(),
  ui: z.object({
    display: z.enum(['button', 'form', 'dialog', 'inline']).default('button'),
    position: z.enum(['toolbar', 'sidebar', 'inline', 'floating']).default('toolbar'),
    group: z.string().optional(),
    order: z.number().default(0)
  }).optional(),
  performance: z.object({
    timeout: z.number().default(30000),
    retryAttempts: z.number().default(3),
    cache: z.object({
      enabled: z.boolean().default(true),
      ttl: z.number().default(300000) // 5 minutes
    })
  }).optional()
});

export type CopilotActionConfig = z.infer<typeof CopilotActionConfigSchema>;

// Clinical assessment action
export const ClinicalAssessmentActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('clinical_assessment'),
  name: z.literal('assessPatient'),
  description: z.string().default('Perform comprehensive patient assessment using AI'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'assessmentType',
      type: z.literal('string'),
      description: 'Type of assessment to perform',
      required: true,
      validation: {
        enum: ['initial', 'followup', 'emergency', 'routine', 'discharge']
      }
    },
    {
      name: 'symptoms',
      type: z.literal('array'),
      description: 'Patient symptoms and concerns',
      required: true
    },
    {
      name: 'vitalSigns',
      type: z.literal('object'),
      description: 'Patient vital signs',
      required: false
    },
    {
      name: 'medicalHistory',
      type: z.literal('object'),
      description: 'Relevant medical history',
      required: false
    }
  ])
});

export type ClinicalAssessmentAction = z.infer<typeof ClinicalAssessmentActionSchema>;

// Treatment planning action
export const TreatmentPlanningActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('treatment_planning'),
  name: z.literal('planTreatment'),
  description: z.string().default('Generate personalized treatment plan'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'diagnosis',
      type: z.literal('string'),
      description: 'Primary diagnosis',
      required: true
    },
    {
      name: 'patientProfile',
      type: z.literal('object'),
      description: 'Patient demographics and profile',
      required: true
    },
    {
      name: 'treatmentGoals',
      type: z.literal('array'),
      description: 'Treatment goals and objectives',
      required: true
    },
    {
      name: 'constraints',
      type: z.literal('object'),
      description: 'Treatment constraints and preferences',
      required: false
    }
  ])
});

export type TreatmentPlanningAction = z.infer<typeof TreatmentPlanningActionSchema>;

// Diagnostic support action
export const DiagnosticSupportActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('diagnostic_support'),
  name: z.literal('supportDiagnosis'),
  description: z.string().default('Provide AI-powered diagnostic support'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'clinicalData',
      type: z.literal('object'),
      description: 'Clinical data and findings',
      required: true
    },
    {
      name: 'differentialDiagnoses',
      type: z.literal('array'),
      description: 'Potential diagnoses to consider',
      required: false
    },
    {
      name: 'diagnosticTests',
      type: z.literal('array'),
      description: 'Available diagnostic test results',
      required: false
    }
  ])
});

export type DiagnosticSupportAction = z.infer<typeof DiagnosticSupportActionSchema>;

// Medication management action
export const MedicationManagementActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('medication_management'),
  name: z.literal('manageMedication'),
  description: z.string().default('Manage patient medications with AI support'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'action',
      type: z.literal('string'),
      description: 'Medication action to perform',
      required: true,
      validation: {
        enum: ['prescribe', 'modify', 'discontinue', 'refill', 'reconcile']
      }
    },
    {
      name: 'medication',
      type: z.literal('object'),
      description: 'Medication details',
      required: true
    },
    {
      name: 'indication',
      type: z.literal('string'),
      description: 'Reason for medication',
      required: true
    },
    {
      name: 'currentMedications',
      type: z.literal('array'),
      description: 'Current medication list',
      required: false
    }
  ])
});

export type MedicationManagementAction = z.infer<typeof MedicationManagementActionSchema>;

// Patient education action
export const PatientEducationActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('patient_education'),
  name: z.literal('educatePatient'),
  description: z.string().default('Generate personalized patient education content'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'topic',
      type: z.literal('string'),
      description: 'Education topic',
      required: true
    },
    {
      name: 'educationLevel',
      type: z.literal('string'),
      description: 'Patient education level',
      required: true,
      validation: {
        enum: ['basic', 'intermediate', 'advanced']
      }
    },
    {
      name: 'format',
      type: z.literal('string'),
      description: 'Content format preference',
      required: false,
      validation: {
        enum: ['text', 'simplified', 'visual', 'interactive']
      }
    },
    {
      name: 'language',
      type: z.literal('string'),
      description: 'Content language',
      required: false,
      defaultValue: 'pt-BR'
    }
  ])
});

export type PatientEducationAction = z.infer<typeof PatientEducationActionSchema>;

// Aesthetic consultation action
export const AestheticConsultationActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('aesthetic_consultation'),
  name: z.literal('consultAesthetic'),
  description: z.string().default('Perform aesthetic medicine consultation'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'consultationType',
      type: z.literal('string'),
      description: 'Type of aesthetic consultation',
      required: true,
      validation: {
        enum: ['initial', 'followup', 'preoperative', 'postoperative', 'treatment_planning']
      }
    },
    {
      name: 'concerns',
      type: z.literal('array'),
      description: 'Patient aesthetic concerns',
      required: true
    },
    {
      name: 'aestheticGoals',
      type: z.literal('array'),
      description: 'Patient aesthetic goals',
      required: true
    },
    {
      name: 'patientProfile',
      type: z.literal('object'),
      description: 'Patient aesthetic profile',
      required: false
    }
  ])
});

export type AestheticConsultationAction = z.infer<typeof AestheticConsultationActionSchema>;

// Procedure recommendation action
export const ProcedureRecommendationActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('aesthetic_consultation'),
  name: z.literal('recommendProcedure'),
  description: z.string().default('Recommend aesthetic procedures based on patient needs'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'concerns',
      type: z.literal('array'),
      description: 'Patient concerns and goals',
      required: true
    },
    {
      name: 'treatmentAreas',
      type: z.literal('array'),
      description: 'Areas for treatment',
      required: true
    },
    {
      name: 'patientFactors',
      type: z.literal('object'),
      description: 'Patient-specific factors',
      required: true
    },
    {
      name: 'constraints',
      type: z.literal('object'),
      description: 'Treatment constraints',
      required: false
    }
  ])
});

export type ProcedureRecommendationAction = z.infer<typeof ProcedureRecommendationActionSchema>;

// Compliance validation action
export const ComplianceValidationActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('compliance_validation'),
  name: z.literal('validateCompliance'),
  description: z.string().default('Validate data against healthcare compliance frameworks'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'data',
      type: z.literal('string'),
      description: 'Data to validate',
      required: true
    },
    {
      name: 'dataType',
      type: z.literal('string'),
      description: 'Type of data being validated',
      required: true,
      validation: {
        enum: ['patient_data', 'clinical_data', 'aesthetic_data', 'administrative_data']
      }
    },
    {
      name: 'framework',
      type: z.literal('string'),
      description: 'Compliance framework to validate against',
      required: true,
      validation: {
        enum: ['lgpd', 'anvisa', 'cfm', 'general']
      }
    },
    {
      name: 'context',
      type: z.literal('object'),
      description: 'Validation context',
      required: false
    }
  ])
});

export type ComplianceValidationAction = z.infer<typeof ComplianceValidationActionSchema>;

// Risk assessment action
export const RiskAssessmentActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('risk_assessment'),
  name: z.literal('assessRisk'),
  description: z.string().default('Assess treatment or procedure risks'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Patient identifier',
      required: true
    },
    {
      name: 'procedure',
      type: z.literal('string'),
      description: 'Procedure or treatment',
      required: true
    },
    {
      name: 'patientFactors',
      type: z.literal('object'),
      description: 'Patient risk factors',
      required: true
    },
    {
      name: 'context',
      type: z.literal('object'),
      description: 'Assessment context',
      required: false
    }
  ])
});

export type RiskAssessmentAction = z.infer<typeof RiskAssessmentActionSchema>;

// Administrative tasks action
export const AdministrativeTaskActionSchema = CopilotActionConfigSchema.extend({
  category: z.literal('administrative_tasks'),
  name: z.literal('processAdministrativeTask'),
  description: z.string().default('Process administrative and documentation tasks'),
  parameters: z.array(ActionParameterSchema).default([
    {
      name: 'taskType',
      type: z.literal('string'),
      description: 'Type of administrative task',
      required: true,
      validation: {
        enum: ['documentation', 'billing', 'scheduling', 'reporting', 'prior_authorization']
      }
    },
    {
      name: 'taskData',
      type: z.literal('object'),
      description: 'Task-specific data',
      required: true
    },
    {
      name: 'patientId',
      type: z.literal('string'),
      description: 'Associated patient (if applicable)',
      required: false
    }
  ])
});

export type AdministrativeTaskAction = z.infer<typeof AdministrativeTaskActionSchema>;

// Action registry interface
export interface ICopilotActionRegistry {
  // Action management
  registerAction(action: CopilotActionConfig): void;
  unregisterAction(actionId: string): void;
  getAction(actionId: string): CopilotActionConfig | undefined;
  getAllActions(): CopilotActionConfig[];
  getActionsByCategory(category: string): CopilotActionConfig[];
  
  // Action execution
  executeAction(actionId: string, parameters: Record<string, unknown>, context: ActionExecutionContext): Promise<ActionExecutionResult>;
  validateAction(actionId: string, parameters: Record<string, unknown>): Promise<{ valid: boolean; errors: string[] }>;
  
  // Action discovery
  searchActions(query: string): CopilotActionConfig[];
  getRecommendedActions(context: ActionExecutionContext): CopilotActionConfig[];
  
  // Action analytics
  getActionMetrics(actionId: string): ActionMetrics;
  getAllMetrics(): Record<string, ActionMetrics>;
}

// Action metrics
export const ActionMetricsSchema = z.object({
  actionId: z.string(),
  executionCount: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
  averageExecutionTime: z.number(),
  averageTokensUsed: z.number(),
  totalCost: z.number(),
  lastUsed: z.date(),
  userSatisfaction: z.number().min(0).max(5).optional(),
  errorRate: z.number(),
  popularParameters: z.array(z.object({
    parameter: z.string(),
    valueFrequency: z.record(z.number())
  })),
  complianceViolations: z.number()
});

export type ActionMetrics = z.infer<typeof ActionMetricsSchema>;

// Action executor interface
export interface ICopilotActionExecutor {
  execute(action: CopilotActionConfig, parameters: Record<string, unknown>, context: ActionExecutionContext): Promise<ActionExecutionResult>;
  validate(action: CopilotActionConfig, parameters: Record<string, unknown>): Promise<{ valid: boolean; errors: string[] }>;
  preprocessParameters(action: CopilotActionConfig, parameters: Record<string, unknown>): Promise<Record<string, unknown>>;
  postprocessResult(action: CopilotActionConfig, result: ActionExecutionResult): Promise<ActionExecutionResult>;
  handleExecutionError(action: CopilotActionConfig, error: Error, context: ActionExecutionContext): Promise<ActionExecutionResult>;
}

// Action validator interface
export interface ICopilotActionValidator {
  validateConfiguration(action: CopilotActionConfig): Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
  validateParameters(action: CopilotActionConfig, parameters: Record<string, unknown>): Promise<{ valid: boolean; errors: string[] }>;
  validateCompliance(action: CopilotActionConfig, context: ActionExecutionContext): Promise<{ compliant: boolean; issues: string[] }>;
  getValidationSchema(action: CopilotActionConfig): z.ZodSchema<any>;
}

// Action UI component interface
export interface ICopilotActionUI {
  renderAction(action: CopilotActionConfig, context: ActionExecutionContext): React.ComponentType<any>;
  renderActionForm(action: CopilotActionConfig, onSubmit: (params: Record<string, unknown>) => void, context: ActionExecutionContext): React.ComponentType<any>;
  renderActionResult(action: CopilotActionConfig, result: ActionExecutionResult, context: ActionExecutionContext): React.ComponentType<any>;
}

// Action event types
export type ActionEvent = 
  | { type: 'action.registered'; action: CopilotActionConfig }
  | { type: 'action.unregistered'; actionId: string }
  | { type: 'action.executed'; actionId: string; parameters: Record<string, unknown>; result: ActionExecutionResult; context: ActionExecutionContext }
  | { type: 'action.failed'; actionId: string; parameters: Record<string, unknown>; error: Error; context: ActionExecutionContext }
  | { type: 'action.validated'; actionId: string; parameters: Record<string, unknown>; result: { valid: boolean; errors: string[] } }
  | { type: 'action.compliance_checked'; actionId: string; result: { compliant: boolean; issues: string[] } }
  | { type: 'action.metrics_updated'; actionId: string; metrics: ActionMetrics };

// Action event handler
export type ActionEventHandler = (event: ActionEvent) => Promise<void> | void;

// All action types union
export type AnyCopilotAction = 
  | ClinicalAssessmentAction
  | TreatmentPlanningAction
  | DiagnosticSupportAction
  | MedicationManagementAction
  | PatientEducationAction
  | AestheticConsultationAction
  | ProcedureRecommendationAction
  | ComplianceValidationAction
  | RiskAssessmentAction
  | AdministrativeTaskAction;

// Action execution options
export const ActionExecutionOptionsSchema = z.object({
  timeout: z.number().default(30000),
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000),
  enableCache: z.boolean().default(true),
  cacheTTL: z.number().default(300000),
  validateCompliance: z.boolean().default(true),
  auditExecution: z.boolean().default(true),
  streamResponse: z.boolean().default(false),
  includeReasoning: z.boolean().default(false)
});

export type ActionExecutionOptions = z.infer<typeof ActionExecutionOptionsSchema>;

// Action execution context extensions
export const ClinicalExecutionContextSchema = ActionExecutionContextSchema.extend({
  clinicalContext: z.object({
    encounterType: z.enum(['inpatient', 'outpatient', 'emergency', 'telemedicine']),
    providerRole: z.string(),
    department: z.string(),
    careTeam: z.array(z.string()).optional()
  }).optional()
});

export type ClinicalExecutionContext = z.infer<typeof ClinicalExecutionContextSchema>;

export const AestheticExecutionContextSchema = ActionExecutionContextSchema.extend({
  aestheticContext: z.object({
    consultationType: z.enum(['initial', 'followup', 'preoperative', 'postoperative']),
    procedureType: z.string().optional(),
    treatmentPhase: z.string().optional()
  }).optional()
});

export type AestheticExecutionContext = z.infer<typeof AestheticExecutionContextSchema>;