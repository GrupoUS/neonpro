/**
 * Simplified types for tool orchestration following KISS principles
 */

export type ExecutionMode = 'parallel' | 'sequential'

export interface ToolExecutionRequest {
  id: string
  toolName: string
  action: string
  parameters: Record<string, any>
  timeout?: number
  priority?: 'low' | 'medium' | 'high'
}

export interface ToolExecutionResult {
  id: string
  success: boolean
  result?: any
  duration: number
  error?: string
}

export interface OrchestrationStep {
  name: string
  command: string[]
  cwd?: string
}

export interface ToolWorkflow {
  id: string
  displayName: string
  steps: OrchestrationStep[]
}
