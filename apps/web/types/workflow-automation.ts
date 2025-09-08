// Workflow Automation Types

export interface WorkflowRule {
  id: string
  name: string
  description: string
  category: 'appointment' | 'patient' | 'billing' | 'compliance' | 'marketing' | 'general'
  isActive: boolean
  clinicId: string
  createdBy: string
  lastRunAt?: Date
  runCount: number
  successCount: number
  errorCount: number
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowQueue {
  id: string
  name: string
  description: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'idle' | 'processing' | 'paused' | 'error'
  pendingJobs: number
  processingJobs: number
  completedJobs: number
  failedJobs: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowTrigger {
  id: string
  name: string
  description: string
  type: 'time_based' | 'event_based' | 'condition_based' | 'manual'
  configuration: Record<string, unknown>
  isActive: boolean
  clinicId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowAction {
  id: string
  workflowId: string
  name: string
  description: string
  type: 'notification' | 'data_update' | 'integration' | 'approval' | 'delay'
  configuration: Record<string, unknown>
  order: number
  isEnabled: boolean
  conditions?: WorkflowCondition[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowCondition {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in'
  value: string | number | boolean | string[]
  logicalOperator?: 'AND' | 'OR'
}

export interface Workflow {
  id: string
  name: string
  description: string
  category: 'appointment' | 'patient' | 'billing' | 'compliance' | 'marketing' | 'general'
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  isActive: boolean
  clinicId: string
  createdBy: string
  lastRunAt?: Date
  runCount: number
  successCount: number
  errorCount: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  triggeredBy: string
  triggerData: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  results: WorkflowExecutionResult[]
  error?: string
  context: Record<string, unknown>
}

export interface WorkflowExecutionResult {
  actionId: string
  actionName: string
  status: 'success' | 'failed' | 'skipped'
  result?: unknown
  error?: string
  executedAt: Date
  duration: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  trigger: Omit<WorkflowTrigger, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>
  actions: Omit<WorkflowAction, 'id' | 'workflowId' | 'createdAt' | 'updatedAt'>[]
  tags: string[]
  isPublic: boolean
  usageCount: number
  rating: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowAnalytics {
  workflowId: string
  period: {
    start: Date
    end: Date
  }
  metrics: {
    totalRuns: number
    successRate: number
    averageExecutionTime: number
    errorRate: number
    mostCommonErrors: {
      error: string
      count: number
    }[]
  }
  trends: {
    runsOverTime: {
      date: Date
      runs: number
    }[]
    successRateOverTime: {
      date: Date
      successRate: number
    }[]
  }
}

export interface WorkflowNotificationSettings {
  workflowId: string
  onSuccess: boolean
  onFailure: boolean
  onLongRunning: boolean
  recipients: string[]
  channels: ('email' | 'sms' | 'whatsapp' | 'in_app')[]
}

// Hook return types
export interface UseWorkflowAutomationOptions {
  clinicId: string
  autoRefresh?: boolean
}

export interface UseWorkflowAutomationReturn {
  workflows: Workflow[]
  executions: WorkflowExecution[]
  templates: WorkflowTemplate[]
  isLoading: boolean
  error: string | null

  // Actions
  createWorkflow: (
    workflow: Omit<
      Workflow,
      'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'errorCount'
    >,
  ) => Promise<void>
  updateWorkflow: (id: string, updates: Partial<Workflow>,) => Promise<void>
  deleteWorkflow: (id: string,) => Promise<void>
  executeWorkflow: (id: string, context?: Record<string, unknown>,) => Promise<void>
  getWorkflowAnalytics: (
    id: string,
    period: { start: Date; end: Date },
  ) => Promise<WorkflowAnalytics>
  loadWorkflows: () => Promise<void>
  loadExecutions: (workflowId?: string,) => Promise<void>
  loadTemplates: () => Promise<void>
}

// API Response types
export interface WorkflowApiResponse<T = unknown,> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
  }
}

// Export all interfaces are already available via the export declarations above
