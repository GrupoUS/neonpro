# API Reference - Monorepo Audit Tool

## Table of Contents

1. [Service APIs](#service-apis)
2. [Configuration APIs](#configuration-apis)
3. [Utility APIs](#utility-apis)
4. [Type Definitions](#type-definitions)
5. [Error Handling](#error-handling)

## Service APIs

### FileScanner

The FileScanner service discovers and categorizes files within the workspace.

#### Methods

##### `scan(options: FileScanOptions): Promise<FileScanResult>`

Scans the workspace for files matching the specified patterns.

**Parameters:**

```typescript
interface FileScanOptions {
  workspacePath: string
  appsDir?: string
  packagesDir?: string
  includePatterns?: string[]
  excludePatterns?: string[]
  followSymlinks?: boolean
  maxDepth?: number
}
```

**Returns:**

```typescript
interface FileScanResult {
  files: CodeAsset[]
  statistics: {
    totalFiles: number
    totalSize: number
    categories: Record<string, number>
  }
  errors: ScanError[]
  duration: number
}
```

**Example:**

```typescript
import { FileScanner, } from './services/FileScanner'

const scanner = new FileScanner()
const result = await scanner.scan({
  workspacePath: '/path/to/workspace',
  includePatterns: ['**/*.{ts,tsx}',],
  excludePatterns: ['**/node_modules/**',],
},)

console.log(`Scanned ${result.statistics.totalFiles} files`,)
```

##### `categorizeFile(filePath: string): FileCategory`

Categorizes a single file based on its path and content.

**Parameters:**

- `filePath: string` - Absolute path to the file

**Returns:**

```typescript
enum FileCategory {
  COMPONENT = 'component',
  UTILITY = 'utility',
  TEST = 'test',
  CONFIG = 'config',
  DOCUMENTATION = 'documentation',
  UNKNOWN = 'unknown',
}
```

### DependencyAnalyzer

The DependencyAnalyzer service analyzes TypeScript code to build dependency graphs.

#### Methods

##### `analyze(files: CodeAsset[], options: AnalysisOptions): Promise<DependencyGraph>`

Analyzes file dependencies and builds a comprehensive dependency graph.

**Parameters:**

```typescript
interface AnalysisOptions {
  maxDepth?: number
  includeExternalDeps?: boolean
  followSymlinks?: boolean
  ignorePatterns?: string[]
}
```

**Returns:**

```typescript
interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
  statistics: {
    totalNodes: number
    totalEdges: number
    circularDependencies: CircularDependency[]
    unusedFiles: string[]
  }
}
```

**Example:**

```typescript
import { DependencyAnalyzer, } from './services/DependencyAnalyzer'

const analyzer = new DependencyAnalyzer()
const graph = await analyzer.analyze(scanResult.files, {
  maxDepth: 10,
  includeExternalDeps: true,
},)

console.log(`Found ${graph.statistics.circularDependencies.length} circular dependencies`,)
```

##### `findCircularDependencies(graph: DependencyGraph): CircularDependency[]`

Identifies circular dependencies in the dependency graph.

**Returns:**

```typescript
interface CircularDependency {
  cycle: string[]
  length: number
  severity: 'low' | 'medium' | 'high'
}
```

### ArchitectureValidator

The ArchitectureValidator service validates compliance with architectural patterns.

#### Methods

##### `validate(graph: DependencyGraph, rules: ValidationRules): Promise<ValidationResult>`

Validates the dependency graph against architectural rules.

**Parameters:**

```typescript
interface ValidationRules {
  turborepo?: TurborepoRules
  hono?: HonoRules
  tanstackRouter?: TanStackRouterRules
  custom?: CustomRule[]
}

interface TurborepoRules {
  checkWorkspaceConfig?: boolean
  checkTaskPipelines?: boolean
  checkDependencies?: boolean
}
```

**Returns:**

```typescript
interface ValidationResult {
  passed: boolean
  results: RuleResult[]
  summary: {
    totalRules: number
    passed: number
    failed: number
    warnings: number
  }
}

interface RuleResult {
  rule: string
  status: 'passed' | 'failed' | 'warning'
  message: string
  files?: string[]
  suggestions?: string[]
}
```

**Example:**

```typescript
import { ArchitectureValidator, } from './services/ArchitectureValidator'

const validator = new ArchitectureValidator()
const result = await validator.validate(dependencyGraph, {
  turborepo: { checkWorkspaceConfig: true, },
  hono: { checkRoutes: true, },
  tanstackRouter: { checkRouteConfig: true, },
},)

console.log(`Validation: ${result.summary.passed}/${result.summary.totalRules} rules passed`,)
```

### CleanupEngine

The CleanupEngine service provides safe file cleanup operations with rollback capabilities.

#### Methods

##### `createCleanupPlan(graph: DependencyGraph, options: CleanupOptions): Promise<CleanupPlan>`

Creates a cleanup plan identifying files that can be safely removed.

**Parameters:**

```typescript
interface CleanupOptions {
  aggressive?: boolean
  removeUnusedFiles?: boolean
  removeOrphanedDependencies?: boolean
  cleanupEmptyDirectories?: boolean
  optimizeImports?: boolean
}
```

**Returns:**

```typescript
interface CleanupPlan {
  id: string
  operations: CleanupOperation[]
  estimatedSavings: {
    files: number
    sizeBytes: number
    dependencies: number
  }
  risks: RiskAssessment[]
}

interface CleanupOperation {
  type: 'delete' | 'modify' | 'move'
  target: string
  reason: string
  risk: 'low' | 'medium' | 'high'
  backup?: string
}
```

##### `executePlan(plan: CleanupPlan, options: ExecutionOptions): Promise<ExecutionResult>`

Executes a cleanup plan with backup and rollback capabilities.

**Parameters:**

```typescript
interface ExecutionOptions {
  dryRun?: boolean
  interactive?: boolean
  backupDir?: string
  confirmBeforeDelete?: boolean
}
```

### ReportGenerator

The ReportGenerator service creates comprehensive reports in various formats.

#### Methods

##### `generateReport(data: ReportData, options: ReportOptions): Promise<GeneratedReport>`

Generates audit reports in the specified format.

**Parameters:**

```typescript
interface ReportOptions {
  format: 'html' | 'json' | 'markdown' | 'pdf'
  template?: string
  includeCharts?: boolean
  outputPath?: string
}

interface ReportData {
  scanResult: FileScanResult
  dependencyGraph: DependencyGraph
  validationResult: ValidationResult
  cleanupPlan?: CleanupPlan
  metadata: ReportMetadata
}
```

**Returns:**

```typescript
interface GeneratedReport {
  filePath: string
  format: string
  size: number
  generatedAt: Date
  metadata: ReportMetadata
}
```

## Configuration APIs

### ConfigManager

The ConfigManager handles configuration loading, validation, and watching.

#### Methods

##### `load(configPath?: string): Promise<AuditToolConfig>`

Loads configuration from multiple sources with validation.

##### `watch(callback: (config: AuditToolConfig) => void): void`

Watches configuration files for changes and triggers callbacks.

##### `validate(config: Partial<AuditToolConfig>): ValidationResult`

Validates configuration structure and values.

## Utility APIs

### Logger

Structured logging with performance monitoring and context management.

#### Methods

##### `info(message: string, context?: LogContext): void`

##### `error(message: string, error?: Error, context?: LogContext): void`

##### `debug(message: string, context?: LogContext): void`

##### `performance(operation: string, duration: number, context?: LogContext): void`

**Example:**

```typescript
import { Logger, } from './utils/Logger'

const logger = new Logger({ level: 'info', format: 'json', },)

logger.info('Starting file scan', { component: 'FileScanner', },)
logger.performance('File scan completed', 1250, { filesScanned: 1247, },)
```

### PerformanceMonitor

System performance monitoring with metrics collection and alerting.

#### Methods

##### `startOperation(name: string): string`

##### `endOperation(operationId: string): OperationMetrics`

##### `getMetrics(): PerformanceMetrics`

### ErrorHandler

Comprehensive error handling with retry logic and circuit breaker patterns.

#### Methods

##### `handle(error: Error, context: ErrorContext): Promise<ErrorHandlingResult>`

##### `retry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T>`

## Type Definitions

### Core Types

```typescript
// Code Asset representation
interface CodeAsset {
  id: string
  path: string
  relativePath: string
  size: number
  category: FileCategory
  lastModified: Date
  checksum: string
  metadata: AssetMetadata
}

// Dependency graph node
interface DependencyNode {
  id: string
  path: string
  type: 'internal' | 'external'
  category: FileCategory
  dependencies: string[]
  dependents: string[]
}

// Dependency graph edge
interface DependencyEdge {
  from: string
  to: string
  type: 'import' | 'require' | 'dynamic'
  weight: number
}

// Validation rule definition
interface ValidationRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  validator: (graph: DependencyGraph, config: any,) => Promise<RuleResult>
}
```

### Configuration Types

```typescript
interface AuditToolConfig {
  workspace: WorkspaceConfig
  analysis: AnalysisConfig
  validation: ValidationConfig
  cleanup: CleanupConfig
  reporting: ReportingConfig
  performance: PerformanceConfig
  logging: LoggingConfig
}

interface WorkspaceConfig {
  rootPath: string
  appsDir: string
  packagesDir: string
  includePatterns: string[]
  excludePatterns: string[]
}
```

## Error Handling

### Error Types

The API uses a comprehensive error hierarchy:

```typescript
// Base error class
abstract class AuditError extends Error {
  abstract readonly code: string
  abstract readonly category: ErrorCategory
  readonly context?: Record<string, unknown>
}

// Specific error types
class FileSystemError extends AuditError {
  readonly code = 'FILESYSTEM_ERROR'
  readonly category = ErrorCategory.FILESYSTEM
}

class ValidationError extends AuditError {
  readonly code = 'VALIDATION_ERROR'
  readonly category = ErrorCategory.VALIDATION
}

class ConfigurationError extends AuditError {
  readonly code = 'CONFIGURATION_ERROR'
  readonly category = ErrorCategory.CONFIGURATION
}
```

### Error Categories

```typescript
enum ErrorCategory {
  FILESYSTEM = 'filesystem',
  VALIDATION = 'validation',
  CONFIGURATION = 'configuration',
  ANALYSIS = 'analysis',
  NETWORK = 'network',
  PERMISSION = 'permission',
  RESOURCE = 'resource',
}
```

### Error Handling Patterns

```typescript
// Using try-catch with specific error handling
try {
  const result = await scanner.scan(options,)
} catch (error) {
  if (error instanceof FileSystemError) {
    // Handle file system specific errors
    logger.error('File system error during scan', error,)
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    logger.warn('Configuration validation failed', error,)
  } else {
    // Handle unexpected errors
    logger.error('Unexpected error during scan', error,)
    throw error
  }
}

// Using error handler service
const errorHandler = new ErrorHandler()
const result = await errorHandler.retry(() => scanner.scan(options,), {
  maxRetries: 3,
  backoffMs: 1000,
},)
```

### Return Types

All service methods return results wrapped in a consistent format:

```typescript
interface ServiceResult<T,> {
  success: boolean
  data?: T
  error?: AuditError
  warnings?: string[]
  metadata: {
    duration: number
    timestamp: Date
    version: string
  }
}
```

**Usage:**

```typescript
const result = await scanner.scan(options,)
if (result.success) {
  console.log(`Scanned ${result.data.statistics.totalFiles} files`,)
} else {
  console.error('Scan failed:', result.error.message,)
}
```

This API reference provides comprehensive documentation for all public interfaces and methods in the monorepo audit tool.
