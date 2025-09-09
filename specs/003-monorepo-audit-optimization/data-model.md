# Data Model: Monorepo Architecture Audit and Optimization

**Date**: 2025-09-09
**Scope**: Entity definitions and relationships for monorepo audit system

## Core Entities

### CodeAsset

Represents any file or resource in the monorepo with usage and compliance tracking.

**Attributes**:

- `path: string` - Absolute file path from repository root
- `type: AssetType` - Classification (component, route, test, config, etc.)
- `size: number` - File size in bytes
- `lastModified: Date` - Last modification timestamp
- `usageStatus: UsageStatus` - Active, unused, orphaned, or redundant
- `dependencies: string[]` - Paths of files this asset depends on
- `dependents: string[]` - Paths of files that depend on this asset
- `complianceStatus: ComplianceStatus` - Complies, violates, or unknown
- `violations: ArchitectureViolation[]` - Specific compliance issues
- `metadata: AssetMetadata` - Additional type-specific information

**Enumerations**:

```typescript
enum AssetType {
  COMPONENT = 'component',
  ROUTE = 'route',
  SERVICE = 'service',
  UTILITY = 'utility',
  TEST = 'test',
  CONFIG = 'config',
  DOCUMENTATION = 'documentation',
  TYPES = 'types',
  UNKNOWN = 'unknown',
}

enum UsageStatus {
  ACTIVE = 'active', // Referenced by other code
  UNUSED = 'unused', // Not referenced anywhere
  ORPHANED = 'orphaned', // Dependencies missing
  REDUNDANT = 'redundant', // Duplicate functionality
  TEMPORARY = 'temporary', // Temp/backup files
}

enum ComplianceStatus {
  COMPLIES = 'complies',
  VIOLATES = 'violates',
  UNKNOWN = 'unknown',
}
```

**Relationships**:

- One-to-many with DependencyGraph nodes
- Many-to-many with other CodeAssets (dependencies)
- One-to-many with CleanupActions

### DependencyGraph

Represents the relationship network between code assets showing imports, exports, and routing connections.

**Attributes**:

- `nodes: Map<string, GraphNode>` - Asset path to node mapping
- `edges: GraphEdge[]` - Dependency relationships
- `cycles: CircularDependency[]` - Detected circular dependencies
- `orphanedNodes: string[]` - Assets with no incoming dependencies
- `rootNodes: string[]` - Entry point assets (no outgoing dependencies)
- `layers: GraphLayer[]` - Architectural layers for organization

**GraphNode**:

- `assetPath: string` - Reference to CodeAsset
- `incomingEdges: string[]` - Paths of assets that depend on this
- `outgoingEdges: string[]` - Paths of assets this depends on
- `layer: string` - Architectural layer (app, packages, shared)
- `importance: number` - Calculated importance score (0-100)

**GraphEdge**:

- `from: string` - Source asset path
- `to: string` - Target asset path
- `type: DependencyType` - Import type classification
- `isStatic: boolean` - Static vs dynamic import
- `line: number` - Line number where dependency occurs

**Enumerations**:

```typescript
enum DependencyType {
  ES6_IMPORT = 'es6_import',
  COMMONJS_REQUIRE = 'commonjs_require',
  DYNAMIC_IMPORT = 'dynamic_import',
  ROUTE_REFERENCE = 'route_reference',
  TYPE_REFERENCE = 'type_reference',
  ASSET_REFERENCE = 'asset_reference',
}
```

**Relationships**:

- Contains multiple CodeAssets as nodes
- Maintains CircularDependency records
- Used by CleanupEngine for impact analysis

### ArchitectureDocument

Represents the source-tree.md and tech-stack.md files that define standards and patterns for resource organization.

**Attributes**:

- `filePath: string` - Path to documentation file
- `type: DocumentType` - Source tree or tech stack
- `standards: ArchitectureStandard[]` - Defined standards and patterns
- `rules: ValidationRule[]` - Specific compliance rules
- `exceptions: RuleException[]` - Documented exceptions to rules
- `lastUpdated: Date` - Document modification date
- `version: string` - Document version if specified

**ArchitectureStandard**:

- `name: string` - Standard identifier
- `description: string` - Human-readable description
- `scope: string[]` - Applicable file patterns or directories
- `required: boolean` - Whether compliance is mandatory
- `examples: string[]` - Example code or file patterns

**ValidationRule**:

- `id: string` - Unique rule identifier
- `pattern: string` - File path or code pattern to match
- `requirement: string` - What the pattern must satisfy
- `severity: RuleSeverity` - Error, warning, or info
- `category: string` - Grouping category for rules

**Enumerations**:

```typescript
enum DocumentType {
  SOURCE_TREE = 'source_tree',
  TECH_STACK = 'tech_stack',
}

enum RuleSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}
```

**Relationships**:

- One-to-many with ArchitectureViolations
- Used by ArchitectureValidator for compliance checking

### AuditReport

Represents the comprehensive documentation of all changes made, files removed, and irregularities found during the optimization process.

**Attributes**:

- `reportId: string` - Unique identifier for the audit run
- `timestamp: Date` - When audit was performed
- `summary: AuditSummary` - High-level metrics and results
- `findings: AuditFinding[]` - Detailed findings and issues
- `actions: CleanupAction[]` - All cleanup actions taken
- `metrics: OptimizationMetrics` - Before/after comparison data
- `warnings: AuditWarning[]` - Non-critical issues found
- `rollbackData: RollbackInformation` - Data needed for rollback

**AuditSummary**:

- `totalFilesScanned: number` - Total files analyzed
- `unusedFilesFound: number` - Count of unused files
- `orphanedFilesFound: number` - Count of orphaned files
- `redundantFilesFound: number` - Count of redundant files
- `violationsFound: number` - Architecture compliance violations
- `filesRemoved: number` - Count of files actually deleted
- `spaceReclaimed: number` - Disk space recovered in bytes

**AuditFinding**:

- `type: FindingType` - Category of finding
- `severity: FindingSeverity` - Critical, high, medium, low
- `description: string` - Human-readable finding description
- `affectedFiles: string[]` - Files involved in the finding
- `recommendation: string` - Suggested action
- `autoFixable: boolean` - Whether finding can be automatically resolved

**OptimizationMetrics**:

- `beforeMetrics: RepositoryMetrics` - State before cleanup
- `afterMetrics: RepositoryMetrics` - State after cleanup
- `improvement: ImprovementMetrics` - Calculated improvements

**Enumerations**:

```typescript
enum FindingType {
  UNUSED_FILE = 'unused_file',
  ORPHANED_DEPENDENCY = 'orphaned_dependency',
  REDUNDANT_CODE = 'redundant_code',
  ARCHITECTURE_VIOLATION = 'architecture_violation',
  ROUTING_ISSUE = 'routing_issue',
  CIRCULAR_DEPENDENCY = 'circular_dependency',
}

enum FindingSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}
```

**Relationships**:

- Contains multiple CleanupActions
- References CodeAssets and ArchitectureDocuments
- One-to-one with RollbackInformation

### CleanupAction

Represents each individual file or resource removal/modification with justification and impact assessment.

**Attributes**:

- `actionId: string` - Unique identifier for the action
- `type: ActionType` - Type of cleanup operation
- `targetPath: string` - File or directory being acted upon
- `justification: string` - Reason for the action
- `impactAssessment: ImpactAssessment` - Analysis of action consequences
- `status: ActionStatus` - Planned, executed, failed, or rolled back
- `executedAt: Date | null` - When action was performed
- `backupPath: string | null` - Backup location if applicable
- `rollbackPossible: boolean` - Whether action can be undone

**ImpactAssessment**:

- `affectedFiles: string[]` - Other files potentially impacted
- `brokenReferences: string[]` - References that will break
- `riskLevel: RiskLevel` - Low, medium, high risk assessment
- `requiresManualReview: boolean` - Whether human review is needed

**Enumerations**:

```typescript
enum ActionType {
  DELETE_FILE = 'delete_file',
  DELETE_DIRECTORY = 'delete_directory',
  MOVE_FILE = 'move_file',
  MODIFY_FILE = 'modify_file',
  CREATE_BACKUP = 'create_backup',
}

enum ActionStatus {
  PLANNED = 'planned',
  EXECUTING = 'executing',
  EXECUTED = 'executed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
```

**Relationships**:

- Many-to-one with AuditReport
- References CodeAsset for target
- One-to-one with backup data

## Supporting Types

### ArchitectureViolation

Specific compliance issue found in a CodeAsset.

**Attributes**:

- `ruleId: string` - Reference to violated ValidationRule
- `description: string` - Specific violation description
- `location: CodeLocation` - Where violation occurs
- `severity: RuleSeverity` - Error, warning, or info
- `suggestedFix: string | null` - Recommended resolution

### CircularDependency

Detected circular dependency in the DependencyGraph.

**Attributes**:

- `cycle: string[]` - Array of asset paths forming the cycle
- `severity: CircularSeverity` - Based on cycle length and importance
- `resolution: ResolutionStrategy[]` - Possible ways to break cycle

### CodeLocation

Represents a specific location within a code file.

**Attributes**:

- `file: string` - File path
- `line: number` - Line number
- `column: number` - Column number
- `context: string` - Surrounding code context

## Entity Relationships Summary

```
ArchitectureDocument (1) ←→ (N) ValidationRule
ValidationRule (1) ←→ (N) ArchitectureViolation
CodeAsset (1) ←→ (N) ArchitectureViolation
CodeAsset (N) ←→ (N) CodeAsset [dependencies]
DependencyGraph (1) ←→ (N) GraphNode
GraphNode (1) ←→ (1) CodeAsset
DependencyGraph (1) ←→ (N) CircularDependency
AuditReport (1) ←→ (N) CleanupAction
CleanupAction (1) ←→ (1) CodeAsset
AuditReport (1) ←→ (N) AuditFinding
AuditFinding (N) ←→ (N) CodeAsset
```

This data model supports comprehensive monorepo analysis, dependency tracking, architecture validation, and safe cleanup operations with full rollback capabilities.
