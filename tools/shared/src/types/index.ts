/**
 * Shared types for NeonPro tools
 * Consolidates common interfaces and type definitions
 */

// Log levels with consistent ordering
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  CRITICAL = 5,
}

// Context for logging operations
export interface LogContext {
  component?: string
  operation?: string
  requestId?: string
  userId?: string
  sessionId?: string
  correlationId?: string
  metadata?: Record<string, any>
}

// Constitutional compliance tracking for healthcare
export interface ConstitutionalContext {
  compliance: boolean
  requirement?: string
  impact?: string
  standard?: 'LGPD' | 'ANVISA' | 'CFM' | 'HIPAA' | 'GDPR' | 'ISO27001'
  [key: string]: unknown
}

// Error information with stack traces
export interface ErrorInfo {
  name: string
  message: string
  stack?: string
  code?: string | number
  cause?: ErrorInfo
}

// Performance metrics
export interface PerformanceMetrics {
  duration?: number
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
  timestamp: number
}

// Complete log entry structure
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  constitutional?: ConstitutionalContext
  error?: ErrorInfo
  performance?: PerformanceMetrics
  tags?: string[]
}

// File system operations
export interface FileOperationOptions {
  encoding?: BufferEncoding
  createDirectories?: boolean
  mode?: number
  flag?: string
}

// Common result pattern
export interface Result<T, E = Error> {
  success: boolean
  data?: T
  error?: E
  message?: string
}

// Async operation with progress tracking
export interface AsyncOperation<T> {
  promise: Promise<T>
  progress?: (completed: number, total: number) => void
  cancel?: () => void
}

// Tool configuration interface
export interface ToolConfig {
  name: string
  version: string
  description?: string
  enabled: boolean
  options?: Record<string, any>
}

// Audit and validation types
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  score?: number
}

export interface AuditRule {
  id: string
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  enabled: boolean
}

export interface AuditResult {
  ruleId: string
  passed: boolean
  message: string
  details?: Record<string, any>
  suggestions?: string[]
}

// Package and dependency types
export interface PackageInfo {
  name: string
  version: string
  description?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface DependencyInfo {
  name: string
  version: string
  type: 'production' | 'development' | 'peer' | 'optional'
  resolved: string
  integrity?: string
  vulnerabilities?: number
}

// Testing types
export interface TestResult {
  suite: string
  passed: number
  failed: number
  skipped: number
  duration: number
  coverage?: CoverageInfo
}

export interface CoverageInfo {
  lines: number
  statements: number
  functions: number
  branches: number
  threshold?: number
}

// Performance and monitoring
export interface Metric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
}

export interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  duration: number
  timestamp: number
}

// Common error types
export class ToolError extends Error {
  public readonly code: string
  public readonly details?: Record<string, any>

  constructor(message: string, code: string, details?: Record<string, any>) {
    super(message)
    this.name = 'ToolError'
    this.code = code
    this.details = details
    Error.captureStackTrace(this, ToolError)
  }
}

export class ValidationError extends ToolError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class ConfigurationError extends ToolError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', details)
    this.name = 'ConfigurationError'
  }
}

// Export type guards
export function isLogEntry(obj: any): obj is LogEntry {
  return (
    obj
    && typeof obj === 'object'
    && typeof obj.timestamp === 'string'
    && typeof obj.level === 'number'
    && typeof obj.message === 'string'
    && typeof obj.context === 'object'
  )
}

export function isResult<T>(obj: any): obj is Result<T> {
  return obj && typeof obj === 'object' && typeof obj.success === 'boolean'
}

export function isValidationResult(obj: any): obj is ValidationResult {
  return (
    obj
    && typeof obj === 'object'
    && typeof obj.valid === 'boolean'
    && Array.isArray(obj.errors)
    && Array.isArray(obj.warnings)
  )
}
