# Data Model: Monorepo Integration Verification

**Date**: September 25, 2025  
**Feature**: Monorepo Integration Verification & Organization  
**Purpose**: Define data structures for apps ↔ packages integration analysis

## Core Entities

### 1. Integration Verification Checklist

```typescript
interface IntegrationVerificationChecklist {
  id: string;
  monorepo_path: string;
  verification_date: Date;
  overall_status: 'healthy' | 'warning' | 'critical';
  health_score: number; // 0-100
  
  // Main verification areas
  import_analysis: ImportAnalysisResult;
  route_integration: RouteIntegrationResult;
  hook_dependencies: HookDependencyResult;
  file_cleanup: FileCleanupResult;
  compliance_status: ComplianceValidationResult;
  
  // Pass/fail criteria
  critical_issues: VerificationIssue[];
  warnings: VerificationIssue[];
  recommendations: string[];
  
  // Metadata
  apps_analyzed: number;
  packages_analyzed: number;
  analysis_duration_ms: number;
}

interface VerificationIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'import' | 'route' | 'hook' | 'duplicate' | 'compliance';
  description: string;
  file_path: string;
  line_number?: number;
  suggested_fix: string;
  impact_level: 'high' | 'medium' | 'low';
}
```

### 2. Import Dependency Map

```typescript
interface ImportDependencyMap {
  source_app: string; // apps/api, apps/web, apps/ai-agent, apps/tools
  target_packages: PackageConnection[];
  missing_imports: MissingImport[];
  incorrect_imports: IncorrectImport[];
  unused_imports: UnusedImport[];
  
  // Expected vs actual analysis
  expected_connections: ExpectedConnection[];
  actual_connections: ActualConnection[];
  connection_health: number; // 0-100 percentage match
}

interface PackageConnection {
  package_name: string; // @neonpro/database, @neonpro/shared, etc.
  import_type: 'named' | 'default' | 'namespace' | 'type-only';
  usage_frequency: number;
  is_workspace_protocol: boolean;
  connection_status: 'valid' | 'deprecated' | 'missing' | 'incorrect';
}

interface MissingImport {
  source_file: string;
  expected_package: string;
  expected_import: string;
  reason: string; // Based on architecture docs
  priority: 'high' | 'medium' | 'low';
}

interface IncorrectImport {
  source_file: string;
  current_import_path: string;
  correct_import_path: string;
  issue_type: 'wrong_package' | 'incorrect_alias' | 'missing_workspace_protocol';
}

interface UnusedImport {
  source_file: string;
  unused_import: string;
  can_safely_remove: boolean;
  removal_impact: string;
}
```

### 3. File Cleanup Registry

```typescript
interface FileCleanupRegistry {
  total_files_analyzed: number;
  duplicate_candidates: DuplicateFile[];
  obsolete_candidates: ObsoleteFile[];
  cleanup_strategy: CleanupStrategy;
  estimated_cleanup_impact: CleanupImpact;
}

interface DuplicateFile {
  primary_file: string;
  duplicate_files: string[];
  business_function: string;
  similarity_score: number; // 0-100
  safe_to_remove: boolean;
  removal_justification: string;
  
  // Conservative analysis (per clarifications)
  functional_overlap: boolean; // Only flag if same business function
  preserve_package_boundaries: boolean; // Respect existing structure
  priority: 'high' | 'medium' | 'low'; // Package issues are high priority
}

interface ObsoleteFile {
  file_path: string;
  last_modified: Date;
  last_referenced: Date | null;
  usage_analysis: FileUsageAnalysis;
  safe_to_remove: boolean;
  removal_risk: 'low' | 'medium' | 'high';
  dependencies: string[]; // Files that depend on this
}

interface FileUsageAnalysis {
  import_references: number;
  test_coverage: boolean;
  build_system_references: boolean;
  documentation_references: boolean;
  runtime_usage_detected: boolean;
}

interface CleanupStrategy {
  phase_1_safe_removals: string[]; // Zero-risk removals
  phase_2_validated_removals: string[]; // Require validation
  phase_3_complex_removals: string[]; // Need careful analysis
  rollback_plan: RollbackStrategy;
}
```

### 4. Route Integration Matrix

```typescript
interface RouteIntegrationMatrix {
  api_routes: ApiRouteIntegration[];
  frontend_routes: FrontendRouteIntegration[];
  integration_health_score: number;
  missing_integrations: MissingIntegration[];
  broken_integrations: BrokenIntegration[];
}

interface ApiRouteIntegration {
  route_path: string; // /api/clients, /api/appointments
  handler_file: string; // apps/api/src/routes/clients/index.ts
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  // Package service integration
  package_services_used: PackageServiceUsage[];
  expected_services: string[]; // From architecture docs
  missing_services: string[];
  
  // Validation and error handling
  input_validation: ValidationImplementation;
  error_handling: ErrorHandlingImplementation;
  healthcare_compliance: ComplianceImplementation;
}

interface FrontendRouteIntegration {
  route_path: string; // /dashboard, /clients, /appointments
  component_file: string; // apps/web/src/routes/dashboard/index.tsx
  
  // Package component integration
  package_components_used: PackageComponentUsage[];
  package_utilities_used: PackageUtilityUsage[];
  expected_integrations: string[]; // From architecture docs
  
  // Performance and optimization
  code_splitting: boolean;
  lazy_loading: boolean;
  error_boundaries: boolean;
}

interface PackageServiceUsage {
  package_name: string;
  service_name: string;
  usage_pattern: 'direct' | 'injected' | 'composed';
  error_handling_present: boolean;
  performance_optimized: boolean;
}
```

### 5. Hook Dependency Tracker

```typescript
interface HookDependencyTracker {
  custom_hooks: CustomHookAnalysis[];
  package_utility_usage: PackageUtilityUsage[];
  duplication_analysis: HookDuplicationAnalysis;
  dependency_health: DependencyHealthMetrics;
}

interface CustomHookAnalysis {
  hook_name: string;
  hook_file: string; // apps/web/src/hooks/useClientData.ts
  hook_type: 'data_fetching' | 'state_management' | 'form_validation' | 'utility' | 'other';
  
  // Package dependencies
  package_utilities_consumed: PackageUtilityReference[];
  dependencies_correct: boolean;
  missing_dependencies: string[];
  unnecessary_dependencies: string[];
  
  // Performance and patterns
  performance_optimized: boolean;
  follows_react_patterns: boolean;
  test_coverage: boolean;
}

interface PackageUtilityUsage {
  utility_name: string;
  source_package: string; // @neonpro/utils, @neonpro/shared
  consuming_hooks: string[];
  usage_frequency: number;
  optimization_opportunities: string[];
}

interface HookDuplicationAnalysis {
  potential_duplicates: HookDuplication[];
  consolidation_opportunities: ConsolidationOpportunity[];
  estimated_reduction: number; // Percentage of code that could be consolidated
}

interface HookDuplication {
  primary_hook: string;
  duplicate_hooks: string[];
  similarity_level: 'identical' | 'similar' | 'related';
  business_logic_overlap: boolean;
  safe_to_consolidate: boolean;
}
```

### 6. Compliance Validation Log

```typescript
interface ComplianceValidationLog {
  lgpd_compliance: LGPDComplianceStatus;
  anvisa_compliance: ANVISAComplianceStatus;
  cfm_compliance: CFMComplianceStatus;
  overall_compliance_score: number;
  compliance_issues: ComplianceIssue[];
}

interface LGPDComplianceStatus {
  data_protection_maintained: boolean;
  audit_trails_preserved: boolean;
  client_consent_management: boolean;
  data_portability_support: boolean;
  privacy_by_design_principles: boolean;
  issues: string[];
  recommendations: string[];
}

interface ANVISAComplianceStatus {
  equipment_registration_support: boolean;
  cosmetic_product_control: boolean;
  procedure_documentation: boolean;
  regulatory_reporting: boolean;
  issues: string[];
  recommendations: string[];
}

interface CFMComplianceStatus {
  professional_standards_maintained: boolean;
  aesthetic_procedure_compliance: boolean;
  patient_safety_protocols: boolean;
  documentation_requirements: boolean;
  issues: string[];
  recommendations: string[];
}

interface ComplianceIssue {
  regulation: 'LGPD' | 'ANVISA' | 'CFM';
  severity: 'critical' | 'warning';
  description: string;
  affected_files: string[];
  remediation_plan: string;
  estimated_effort: string;
}
```

## Relationships & Constraints

### Entity Relationships
```typescript
// Primary aggregation relationship
IntegrationVerificationChecklist {
  contains: ImportDependencyMap[];
  contains: RouteIntegrationMatrix;
  contains: HookDependencyTracker;
  contains: FileCleanupRegistry;
  validates: ComplianceValidationLog;
}

// Cross-entity relationships
ImportDependencyMap.missing_imports → FileCleanupRegistry.cleanup_strategy
RouteIntegrationMatrix.missing_integrations → ImportDependencyMap.missing_imports
HookDependencyTracker.duplication_analysis → FileCleanupRegistry.duplicate_candidates
ComplianceValidationLog → All entities (validation overlay)
```

### Business Rules & Constraints

1. **Conservative Cleanup Rule**: Only flag files with obvious functional overlap
2. **Package Boundary Preservation**: Respect existing package structure
3. **Priority Rule**: Package-related issues marked as high priority
4. **Safety First**: All removals must have rollback capability
5. **Test Preservation**: Maintain 90%+ test coverage during cleanup
6. **Compliance Preservation**: All changes must maintain healthcare compliance
7. **Build Optimization**: Preserve Turborepo caching and performance

### Validation Rules

```typescript
interface ValidationRules {
  // Import validation
  workspace_protocol_required: boolean; // All internal packages must use workspace:
  circular_dependencies_forbidden: boolean;
  unused_imports_flagged: boolean;
  
  // Route integration validation  
  error_handling_required: boolean;
  input_validation_required: boolean;
  healthcare_compliance_required: boolean;
  
  // Hook validation
  dependency_optimization_required: boolean;
  react_patterns_enforced: boolean;
  duplication_minimized: boolean;
  
  // Cleanup validation
  safe_removal_only: boolean;
  test_coverage_maintained: boolean;
  rollback_capability_required: boolean;
}
```

## Success Metrics

### Key Performance Indicators
```typescript
interface SuccessMetrics {
  // Primary success criteria (from specification)
  zero_functional_overlaps: boolean;
  clean_import_state: boolean;
  package_integration_health: number; // 0-100
  
  // Performance metrics
  analysis_completion_time: number; // Target: <30 seconds per component
  build_performance_maintained: boolean;
  test_coverage_preserved: number; // Must maintain 90%+
  
  // Compliance metrics
  healthcare_compliance_maintained: boolean;
  regulatory_requirements_satisfied: boolean;
  audit_trail_integrity: boolean;
}
```

---
**Data Model Complete**: Ready for contract generation and quickstart guide