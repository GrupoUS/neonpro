// CopilotKit hooks integration types for healthcare AI services
import { z } from 'zod';
import { AGUIEvent, AGUIResponse } from '../protocol/agui-events';

// CopilotKit agent types
export const AgentTypeSchema = z.enum([
  'clinical_assessment',
  'treatment_planning',
  'diagnostic_support',
  'medication_management',
  'aesthetic_consultation',
  'procedure_recommendation',
  'outcome_prediction',
  'compliance_validation',
  'patient_education',
  'risk_assessment'
]);

export type AgentType = z.infer<typeof AgentTypeSchema>;

// Agent configuration
export const AgentConfigSchema = z.object({
  type: AgentTypeSchema,
  id: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
  version: z.string().default('1.0'),
  provider: z.string().default('openai'),
  model: z.string(),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.1),
  timeout: z.number().default(30000),
  enableStreaming: z.boolean().default(true),
  enableCache: z.boolean().default(true),
  cacheTTL: z.number().default(300000), // 5 minutes
  compliance: z.object({
    strictMode: z.boolean().default(true),
    autoRedactPII: z.boolean().default(true),
    requireConsent: z.boolean().default(true),
    auditOperations: z.boolean().default(true)
  }).default({})
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Agent state
export const AgentStateSchema = z.object({
  id: z.string(),
  type: AgentTypeSchema,
  status: z.enum(['idle', 'thinking', 'responding', 'error', 'completed']),
  isThinking: z.boolean().default(false),
  isLoading: z.boolean().default(false),
  error: z.string().optional(),
  lastActivity: z.date(),
  sessionId: z.string(),
  context: z.record(z.unknown()).optional(),
  metadata: z.object({
    processingTime: z.number().optional(),
    tokensUsed: z.number().optional(),
    cost: z.number().optional(),
    model: z.string().optional()
  }).optional()
});

export type AgentState<T = any> = z.infer<typeof AgentStateSchema> & {
  data?: T;
};

// Hook configuration
export const HookConfigSchema = z.object({
  autoExecute: z.boolean().default(false),
  debounceTime: z.number().default(300),
  retryAttempts: z.number().default(3),
  onError: z.enum(['throw', 'return_error', 'return_null']).default('throw'),
  onSuccess: z.function().optional(),
  onFailure: z.function().optional(),
  enableCache: z.boolean().default(true),
  cacheKey: z.string().optional(),
  compliance: z.object({
    validateBeforeExecution: z.boolean().default(true),
    redactPII: z.boolean().default(true),
    auditAllCalls: z.boolean().default(true)
  }).optional()
});

export type HookConfig = z.infer<typeof HookConfigSchema>;

// UseCoAgent hook return type
export const CoAgentResultSchema = z.object({
  state: AgentStateSchema,
  loading: z.boolean(),
  error: z.string().optional(),
  execute: z.function(),
  executeWithRetry: z.function(),
  reset: z.function(),
  updateContext: z.function(),
  isReady: z.boolean(),
  getLastResponse: z.function(),
  getMetrics: z.function()
});

export type CoAgentResult<T = any> = z.infer<typeof CoAgentResultSchema> & {
  state: AgentState<T>;
  execute: (request: CoAgentRequest<T>) => Promise<CoAgentResponse<T>>;
  executeWithRetry: (request: CoAgentRequest<T>, maxRetries?: number) => Promise<CoAgentResponse<T>>;
  reset: () => void;
  updateContext: (context: Partial<T>) => void;
  isReady: () => boolean;
  getLastResponse: () => CoAgentResponse<T> | null;
  getMetrics: () => CoAgentMetrics;
};

// CoAgent request
export const CoAgentRequestSchema = z.object({
  type: z.string(),
  data: z.record(z.unknown()),
  context: z.record(z.unknown()).optional(),
  metadata: z.object({
    sessionId: z.string(),
    userId: z.string(),
    patientId: z.string().optional(),
    requestId: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
  }).optional(),
  compliance: z.object({
    consentVerified: z.boolean().default(false),
    piiRedacted: z.boolean().default(false),
    auditRequired: z.boolean().default(true)
  }).optional(),
  options: z.object({
    stream: z.boolean().default(false),
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
    includeReasoning: z.boolean().default(false)
  }).optional()
});

export type CoAgentRequest<T = any> = z.infer<typeof CoAgentRequestSchema> & {
  data: T;
  context?: Partial<T>;
};

// CoAgent response
export const CoAgentResponseSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  state: AgentStateSchema,
  metadata: z.object({
    processingTime: z.number(),
    tokensUsed: z.object({
      prompt: z.number(),
      completion: z.number(),
      total: z.number()
    }),
    cost: z.number().optional(),
    model: z.string(),
    provider: z.string(),
    cached: z.boolean().default(false)
  }).optional(),
  compliance: z.object({
    validated: z.boolean(),
    piiRedacted: z.boolean(),
    auditLogId: z.string().optional()
  }).optional(),
  suggestions: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  requiresHumanReview: z.boolean().default(false)
});

export type CoAgentResponse<T = any> = z.infer<typeof CoAgentResponseSchema> & {
  data?: T;
};

// CoAgent metrics
export const CoAgentMetricsSchema = z.object({
  totalRequests: z.number(),
  successfulRequests: z.number(),
  failedRequests: z.number(),
  averageResponseTime: z.number(),
  averageTokensUsed: z.number(),
  totalCost: z.number(),
  cacheHitRate: z.number(),
  errorRate: z.number(),
  lastUsed: z.date(),
  uptime: z.number()
});

export type CoAgentMetrics = z.infer<typeof CoAgentMetricsSchema>;

// UseCopilotAction hook configuration
export const CopilotActionConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  handler: z.function(),
  enabled: z.boolean().default(true),
  icon: z.string().optional(),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'gt', 'lt', 'in']),
    value: z.unknown()
  })).optional(),
  validation: z.object({
    validate: z.function(),
    errorMessage: z.string().optional()
  }).optional(),
  compliance: z.object({
    validateConsent: z.boolean().default(true),
    redactPII: z.boolean().default(true),
    auditExecution: z.boolean().default(true)
  }).optional()
});

export type CopilotActionConfig = z.infer<typeof CopilotActionConfigSchema>;

// CopilotAction hook return type
export const CopilotActionResultSchema = z.object({
  execute: z.function(),
  isExecuting: z.boolean(),
  error: z.string().optional(),
  lastResult: z.unknown().optional(),
  canExecute: z.function(),
  getParameters: z.function(),
  reset: z.function()
});

export type CopilotActionResult = z.infer<typeof CopilotActionResultSchema> & {
  execute: (params: Record<string, unknown>) => Promise<any>;
  isExecuting: boolean;
  error: string | undefined;
  lastResult: any;
  canExecute: (params: Record<string, unknown>) => boolean;
  getParameters: () => Record<string, unknown>;
  reset: () => void;
};

// UseHealthcareState hook configuration
export const HealthcareStateConfigSchema = z.object({
  patientId: z.string(),
  sessionId: z.string(),
  initialState: z.record(z.unknown()).optional(),
  persistence: z.object({
    enabled: z.boolean().default(true),
    key: z.string().optional(),
    ttl: z.number().default(3600000) // 1 hour
  }).optional(),
  sync: z.object({
    enabled: z.boolean().default(true),
    debounceTime: z.number().default(1000),
    mergeStrategy: z.enum(['overwrite', 'merge', 'merge_deep']).default('merge_deep')
  }).optional(),
  validation: z.object({
    enabled: z.boolean().default(true),
    schema: z.unknown().optional(),
    strict: z.boolean().default(false)
  }).optional(),
  compliance: z.object({
    validateData: z.boolean().default(true),
    redactPII: z.boolean().default(true),
    auditChanges: z.boolean().default(true)
  }).optional()
});

export type HealthcareStateConfig = z.infer<typeof HealthcareStateConfigSchema>;

// Healthcare state
export const HealthcareStateSchema = z.object({
  patientId: z.string(),
  sessionId: z.string(),
  data: z.record(z.unknown()),
  lastUpdated: z.date(),
  version: z.number().default(1),
  isDirty: z.boolean().default(false),
  isValid: z.boolean().default(true),
  validationErrors: z.array(z.string()).default([]),
  metadata: z.object({
    source: z.enum(['user_input', 'ai_generated', 'system', 'external']),
    confidence: z.number().min(0).max(1).optional(),
    compliance: z.object({
      validated: z.boolean(),
      piiRedacted: z.boolean(),
      auditLogId: z.string().optional()
    })
  }).optional()
});

export type HealthcareState<T = any> = z.infer<typeof HealthcareStateSchema> & {
  data: T;
};

// UseHealthcareState hook return type
export const HealthcareStateResultSchema = z.object({
  state: HealthcareStateSchema,
  updateState: z.function(),
  resetState: z.function(),
  patchState: z.function(),
  isValid: z.boolean(),
  validationErrors: z.array(z.string()),
  isDirty: z.boolean(),
  saveState: z.function(),
  loadState: z.function(),
  syncState: z.function(),
  exportState: z.function(),
  importState: z.function(),
  clearState: z.function(),
  getHistory: z.function(),
  undo: z.function(),
  redo: z.function()
});

export type HealthcareStateResult<T = any> = z.infer<typeof HealthcareStateResultSchema> & {
  state: HealthcareState<T>;
  updateState: (newState: Partial<T>) => void;
  resetState: () => void;
  patchState: (patches: Record<string, unknown>) => void;
  isValid: boolean;
  validationErrors: string[];
  isDirty: boolean;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
  syncState: () => Promise<void>;
  exportState: () => string;
  importState: (stateData: string) => void;
  clearState: () => void;
  getHistory: () => HealthcareState<T>[];
  undo: () => boolean;
  redo: () => boolean;
};

// UseCompliance hook configuration
export const ComplianceHookConfigSchema = z.object({
  frameworks: z.array(z.enum(['lgpd', 'anvisa', 'cfm', 'general'])).default(['lgpd']),
  strictMode: z.boolean().default(true),
  autoValidate: z.boolean().default(true),
  validateOnMount: z.boolean().default(false),
  debounceTime: z.number().default(500),
  validationLevel: z.enum(['basic', 'strict', 'comprehensive']).default('strict'),
  redaction: z.object({
    enabled: z.boolean().default(true),
    method: z.enum(['mask', 'remove', 'replace']).default('mask'),
    customPatterns: z.array(z.string()).optional()
  }).optional(),
  consent: z.object({
    required: z.boolean().default(true),
    verifyAutomatically: z.boolean().default(true),
    fallbackAction: z.enum(['block', 'warn', 'proceed_with_audit']).default('block')
  }).optional(),
  audit: z.object({
    enabled: z.boolean().default(true),
    includeDetails: z.boolean().default(true),
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info')
  }).optional()
});

export type ComplianceHookConfig = z.infer<typeof ComplianceHookConfigSchema>;

// Compliance validation result
export const ComplianceHookResultSchema = z.object({
  isValid: z.boolean(),
  score: z.number().min(0).max(1),
  violations: z.array(z.object({
    framework: z.string(),
    rule: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    remediation: z.string()
  })),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
  redactedData: z.string(),
  validationTime: z.number(),
  lastValidated: z.date()
});

export type ComplianceHookResult = z.infer<typeof ComplianceHookResultSchema>;

// UseCompliance hook return type
export const ComplianceHookResultWrapperSchema = z.object({
  result: ComplianceHookResultSchema,
  validate: z.function(),
  validateData: z.function(),
  redactPII: z.string(),
  checkConsent: z.function(),
  getComplianceReport: z.function(),
  clearCache: z.function(),
  subscribe: z.function(),
  unsubscribe: z.function()
});

export type ComplianceHookResult = z.infer<typeof ComplianceHookResultWrapperSchema> & {
  result: ComplianceHookResult;
  validate: (data: string, context?: Record<string, unknown>) => Promise<ComplianceHookResult>;
  validateData: (data: Record<string, unknown>, dataType: string) => Promise<ComplianceHookResult>;
  redactPII: (text: string, context?: Record<string, unknown>) => string;
  checkConsent: (patientId: string, consentType: string) => Promise<boolean>;
  getComplianceReport: (framework?: string) => Promise<any>;
  clearCache: () => void;
  subscribe: (callback: (result: ComplianceHookResult) => void) => () => void;
  unsubscribe: (callback: (result: ComplianceHookResult) => void) => void;
};

// Hook event types
export type HookEvent = 
  | { type: 'agent.state_changed'; agentId: string; newState: AgentState }
  | { type: 'agent.request_started'; agentId: string; requestId: string }
  | { type: 'agent.request_completed'; agentId: string; requestId: string; response: CoAgentResponse }
  | { type: 'agent.request_failed'; agentId: string; requestId: string; error: Error }
  | { type: 'action.executed'; actionName: string; params: Record<string, unknown>; result: any }
  | { type: 'action.failed'; actionName: string; params: Record<string, unknown>; error: Error }
  | { type: 'state.changed'; sessionId: string; changes: Record<string, unknown> }
  | { type: 'state.saved'; sessionId: string }
  | { type: 'state.loaded'; sessionId: string }
  | { type: 'compliance.validated'; result: ComplianceHookResult }
  | { type: 'compliance.violation'; violations: any[] }
  | { type: 'hook.error'; hookType: string; error: Error };

// Hook event handler
export type HookEventHandler = (event: HookEvent) => Promise<void> | void;

// Hook interface
export interface ICopilotKitHook {
  readonly id: string;
  readonly type: string;
  readonly config: Record<string, unknown>;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Event handling
  on(event: string, handler: HookEventHandler): void;
  off(event: string, handler: HookEventHandler): void;
  emit(event: HookEvent): void;
  
  // State management
  getState(): unknown;
  setState(state: unknown): void;
  
  // Metrics
  getMetrics(): Record<string, unknown>;
  
  // Validation
  validate(): boolean;
}

// Hook factory interface
export interface ICopilotKitHookFactory {
  createCoAgentHook<T>(config: HookConfig & { agentType: AgentType }): CoAgentResult<T>;
  createCopilotAction(config: CopilotActionConfig): CopilotActionResult;
  createHealthcareStateHook<T>(config: HealthcareStateConfig): HealthcareStateResult<T>;
  createComplianceHook(config: ComplianceHookConfig): ComplianceHookResult;
  
  // Hook management
  getHook(id: string): ICopilotKitHook | undefined;
  getAllHooks(): ICopilotKitHook[];
  registerHook(hook: ICopilotKitHook): void;
  unregisterHook(id: string): void;
  
  // Event system
  on(event: string, handler: HookEventHandler): void;
  off(event: string, handler: HookEventHandler): void;
  emit(event: HookEvent): void;
}

// Hook context provider
export interface ICopilotKitContextProvider {
  context: {
    sessionId: string;
    userId: string;
    patientId?: string;
    locale: string;
    features: string[];
    config: Record<string, unknown>;
  };
  
  // Context management
  updateContext(updates: Partial<ICopilotKitContextProvider['context']>): void;
  getContextValue<T>(key: string): T | undefined;
  setContextValue<T>(key: string, value: T): void;
  
  // Event propagation
  subscribe(callback: (context: ICopilotKitContextProvider['context']) => void): () => void;
  unsubscribe(callback: (context: ICopilotKitContextProvider['context']) => void): void;
}

// Hook integration with AG-UI
export interface IAGUIHookIntegration {
  // Convert AG-UI events to hook events
  convertAGUIEventToHookEvent(event: AGUIEvent): HookEvent | null;
  
  // Convert hook events to AG-UI events
  convertHookEventToAGUIEvent(event: HookEvent): AGUIEvent | null;
  
  // Process hook responses through AG-UI
  processHookResponse(response: any, hookType: string): Promise<AGUIResponse>;
  
  // Validate hook compliance
  validateHookCompliance(hookType: string, data: any): Promise<boolean>;
  
  // Event routing
  routeEvent(event: HookEvent): string[];
  
  // State synchronization
  syncHookState(hookId: string, state: unknown): Promise<void>;
}

// Hook performance metrics
export const HookMetricsSchema = z.object({
  hookId: z.string(),
  hookType: z.string(),
  executionCount: z.number(),
  averageExecutionTime: z.number(),
  successRate: z.number(),
  errorCount: z.number(),
  lastUsed: z.date(),
  memoryUsage: z.number(),
  cacheHitRate: z.number(),
  eventSubscriptions: z.number(),
  customMetrics: z.record(z.number()),
});

export type HookMetrics = z.infer<typeof HookMetricsSchema>;

// Hook configuration validator
export interface IHookConfigValidator {
  validate(config: Record<string, unknown>): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    normalizedConfig: Record<string, unknown>;
  }>;
  
  getSchema(hookType: string): z.ZodSchema<any>;
  getDefaultConfig(hookType: string): Record<string, unknown>;
}