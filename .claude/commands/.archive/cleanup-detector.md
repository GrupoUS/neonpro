# /cleanup - Intelligent Code Cleanup & Deduplication Command

## Command: `/cleanup [scope] [--auto-fix] [--healthcare] [--aggressive] [--paths-only]`

### 🎯 **Purpose**
**CLEAN UP CONSTANTLY** implementation with intelligent detection of duplicate, redundant, unused, and obsolete code. Automatic path correction, dead code elimination, and system optimization following NEONPRO's "no backwards compatibility" principle.

### 🧹 **Core Cleanup Philosophy**
```yaml
CLEANUP_PRINCIPLES:
  constant_cleaning: "After every task - busque por códigos duplicados/obsoletos"
  path_correction: "Always correct paths to avoid redirection errors"  
  no_backwards_compatibility: "Remove deprecated code immediately"
  detailed_errors: "Detailed errors over graceful failures - identify and fix fast"
  system_optimization: "Keep system clean and organized"
  
CLEANUP_SCOPE:
  duplicate_code: "Identical or near-identical code blocks"
  redundant_functions: "Functions that do the same thing"
  unused_imports: "Import statements not being used"
  obsolete_files: "Files no longer referenced or needed"
  broken_paths: "Incorrect file paths and redirections"
  dead_dependencies: "Unused packages and libraries"
```

### 🚀 **Execution Flow**

#### **Phase 1: Codebase Analysis & Discovery**
```yaml
ANALYSIS_PHASE:
  project_scanning:
    - "Scan entire project structure for patterns"
    - "Identify file types and relationships"
    - "Map import/export dependencies"
    - "Healthcare-specific pattern detection"
    
  duplicate_detection:
    - "AST-based code similarity analysis"
    - "Function signature duplication detection"
    - "Component duplication identification"
    - "Configuration duplication scanning"
    
  path_analysis:
    - "Broken import path detection"
    - "Redirect loop identification"
    - "Relative path optimization opportunities"
    - "Healthcare module path validation"
    
  dependency_mapping:
    - "Unused import detection"
    - "Orphaned file identification"
    - "Dead package dependency scanning"
    - "Healthcare compliance dependency validation"
```

#### **Phase 2: Intelligent Cleanup Classification**
```yaml
CLASSIFICATION_SYSTEM:
  critical_duplicates:
    priority: "HIGH - Immediate removal required"
    examples: "Identical utility functions, duplicate components"
    action: "Consolidate into single implementation"
    healthcare: "Medical data processing duplicates"
    
  redundant_patterns:
    priority: "MEDIUM - Optimization opportunity"
    examples: "Similar but not identical implementations"
    action: "Refactor to unified approach"
    healthcare: "Patient workflow redundancies"
    
  obsolete_code:
    priority: "HIGH - Remove immediately"
    examples: "Commented code, unused functions, deprecated APIs"
    action: "Delete without backward compatibility"
    healthcare: "Outdated compliance implementations"
    
  path_corrections:
    priority: "CRITICAL - System stability"
    examples: "Broken imports, incorrect redirects"
    action: "Fix immediately to prevent errors"
    healthcare: "Medical module path corrections"
```

#### **Phase 3: Automated Cleanup Execution**
```yaml
CLEANUP_EXECUTION:
  safe_removal:
    - "Verify no active references before deletion"
    - "Create backup of removed code (temporary)"
    - "Update all dependent imports automatically"
    - "Validate healthcare compliance maintained"
    
  path_correction:
    - "Fix broken import paths automatically"
    - "Update relative to absolute paths where beneficial"
    - "Correct redirect loops and circular dependencies"
    - "Optimize healthcare module imports"
    
  consolidation:
    - "Merge duplicate implementations intelligently"
    - "Preserve best implementation of duplicates"
    - "Update all references to consolidated version"
    - "Maintain healthcare functionality integrity"
```

### 🔧 **Core Actions & Commands**

#### **Detection Actions**
```yaml
DETECTION_ACTIONS:
  scan_duplicates:
    command: "/cleanup scan --duplicates"
    purpose: "Find duplicate code blocks and functions"
    analysis: "AST similarity, function signatures, component patterns"
    healthcare: "Medical workflow duplicate detection"
    
  scan_obsolete:
    command: "/cleanup scan --obsolete"
    purpose: "Find unused, commented, or deprecated code"
    targets: "Dead functions, unused imports, old APIs"
    healthcare: "Outdated compliance implementations"
    
  scan_paths:
    command: "/cleanup scan --paths"
    purpose: "Find broken imports and path issues"
    fixes: "Import errors, redirect loops, missing files"
    healthcare: "Medical module path validation"
    
  scan_dependencies:
    command: "/cleanup scan --deps"
    purpose: "Find unused packages and dependencies"
    analysis: "Package.json analysis, import usage scanning"
    healthcare: "Healthcare package optimization"
```

#### **Cleanup Actions**
```yaml
CLEANUP_ACTIONS:
  auto_clean:
    command: "/cleanup auto --fix"
    purpose: "Automatic cleanup with safe removal"
    safety: "Backup before removal, validation after"
    healthcare: "Preserve medical functionality"
    
  aggressive_clean:
    command: "/cleanup aggressive"
    purpose: "Deep cleanup with no backwards compatibility"
    removes: "All deprecated code, unused patterns"
    healthcare: "Remove non-compliant legacy medical code"
    
  paths_only:
    command: "/cleanup paths --fix"
    purpose: "Fix only path and import issues"
    focus: "Broken imports, redirect corrections"
    healthcare: "Critical medical module path fixes"
    
  consolidate:
    command: "/cleanup consolidate --merge"
    purpose: "Merge duplicate implementations"
    strategy: "Keep best implementation, update references"
    healthcare: "Consolidate medical utility functions"
```

#### **Validation Actions**
```yaml
VALIDATION_ACTIONS:
  verify_cleanup:
    command: "/cleanup verify"
    purpose: "Validate cleanup didn't break functionality"
    tests: "Build validation, test execution, lint checks"
    healthcare: "Medical compliance validation"
    
  rollback_safe:
    command: "/cleanup rollback --safe"
    purpose: "Rollback last cleanup if issues found"
    protection: "Temporary backup restoration"
    healthcare: "Medical functionality restoration"
    
  report_cleanup:
    command: "/cleanup report"
    purpose: "Generate cleanup summary and metrics"
    metrics: "Files removed, duplicates merged, paths fixed"
    healthcare: "Compliance cleanup reporting"
```

### 🏥 **Healthcare-Specific Cleanup Patterns**

#### **Medical Code Compliance**
```yaml
HEALTHCARE_CLEANUP:
  lgpd_compliance:
    patterns: "Remove non-LGPD compliant data handling"
    validation: "Ensure patient data protection maintained"
    cleanup: "Obsolete privacy implementations removed"
    
  medical_workflows:
    duplicates: "Consolidate patient workflow implementations"
    obsolete: "Remove deprecated medical process code"
    optimization: "≤100ms performance requirement maintenance"
    
  audit_trail:
    cleanup: "Remove broken audit logging"
    consolidation: "Merge duplicate audit implementations"
    validation: "Ensure audit trail integrity maintained"
    
  multi_tenant:
    isolation: "Fix tenant isolation path issues"
    cleanup: "Remove obsolete tenant-specific code"
    optimization: "Consolidate tenant utility functions"
```

#### **Medical Module Path Corrections**
```yaml
MEDICAL_PATHS:
  patient_modules:
    - "Fix patient data module imports"
    - "Correct medical record path redirections"
    - "Optimize clinical workflow imports"
    
  compliance_modules:
    - "Fix LGPD compliance module paths"
    - "Correct ANVISA integration imports"
    - "Optimize CFM compliance paths"
    
  audit_modules:
    - "Fix medical audit trail imports"
    - "Correct compliance reporting paths"
    - "Optimize healthcare logging imports"
```

### 🔍 **Intelligent Detection Algorithms**

#### **Duplicate Code Detection**
```yaml
DUPLICATE_ALGORITHMS:
  ast_similarity:
    - "Abstract Syntax Tree comparison"
    - "Function signature matching"
    - "Code structure similarity analysis"
    - "Variable name normalization"
    
  semantic_analysis:
    - "Functionality equivalence detection"
    - "Intent-based similarity matching"
    - "Healthcare domain-specific patterns"
    - "Medical workflow equivalence"
    
  pattern_matching:
    - "React component duplication"
    - "Utility function similarities"
    - "Configuration pattern duplicates"
    - "Medical data handling patterns"
```

#### **Obsolete Code Detection**
```yaml
OBSOLETE_ALGORITHMS:
  reference_analysis:
    - "Dead function detection (zero references)"
    - "Unused import identification"
    - "Orphaned file discovery"
    - "Medical module usage analysis"
    
  deprecation_scanning:
    - "Deprecated API usage detection"
    - "Legacy pattern identification"
    - "Outdated healthcare compliance code"
    - "Superseded medical implementations"
    
  comment_analysis:
    - "Commented-out code detection"
    - "TODO/FIXME annotation analysis"
    - "Temporary implementation identification"
    - "Medical code annotation cleanup"
```

### 🔄 **Integration with NEONPRO Workflow**

#### **Archon Task Integration**
```yaml
ARCHON_INTEGRATION:
  post_task_cleanup:
    - "Automatic cleanup after task completion"
    - "Task-specific duplicate detection"
    - "Research-driven cleanup optimization"
    - "Healthcare task compliance cleanup"
    
  task_context_cleanup:
    - "Context-aware duplicate detection"
    - "Task-related obsolete code removal"
    - "Feature-specific path corrections"
    - "Medical workflow task optimization"
```

#### **Ultracite Quality Integration**
```yaml
ULTRACITE_INTEGRATION:
  quality_cleanup:
    - "Cleanup integrated with ≥9.5/10 standards"
    - "Code quality improvement through deduplication"
    - "Type safety enhancement via cleanup"
    - "Healthcare quality standards maintenance"
    
  post_format_cleanup:
    - "Cleanup after ultracite formatting"
    - "Quality-driven duplicate removal"
    - "Performance optimization cleanup"
    - "Medical code excellence maintenance"
```

#### **PNPM Dependency Cleanup**
```yaml
PNPM_INTEGRATION:
  dependency_optimization:
    - "Unused package detection and removal"
    - "Duplicate dependency consolidation"
    - "Healthcare package optimization"
    - "Performance-driven dependency cleanup"
    
  build_optimization:
    - "Build-time dead code elimination"
    - "Bundle size optimization through cleanup"
    - "Medical application performance enhancement"
    - "Healthcare deployment optimization"
```

### 🔍 **Usage Examples**

```bash
# Comprehensive automatic cleanup
/cleanup auto --fix --healthcare
# → Safe automatic cleanup with healthcare compliance

# Aggressive cleanup with no backwards compatibility
/cleanup aggressive --no-backup
# → Remove all obsolete code immediately

# Path-only corrections for critical fixes
/cleanup paths --fix --critical
# → Fix broken imports and redirections only

# Healthcare-specific duplicate detection
/cleanup scan --duplicates --healthcare
# → Find medical workflow duplications

# Post-task cleanup (integrated with Archon)
/cleanup post-task --task-id="task-123"
# → Cleanup specific to completed task context

# Dependency cleanup with PNPM optimization
/cleanup deps --pnpm --optimize
# → Remove unused packages and optimize

# Medical compliance cleanup
/cleanup compliance --lgpd --anvisa
# → Clean obsolete compliance implementations

# Performance-focused cleanup
/cleanup performance --medical
# → Optimize for ≤100ms medical operations
```

### 🌐 **Bilingual Support**

#### **Portuguese Commands**
- **`/limpar`** - Limpeza inteligente de código duplicado/obsoleto
- **`/detectar-duplicados`** - Detecção de código duplicado com padrões médicos
- **`/corrigir-caminhos`** - Correção automática de paths e imports
- **`/otimizar-saude`** - Otimização específica para aplicações médicas
- **`/limpeza-compliance`** - Limpeza de código de compliance LGPD/ANVISA

#### **English Commands**
- **`/cleanup`** - Intelligent duplicate/obsolete code cleanup
- **`/detect-duplicates`** - Duplicate code detection with medical patterns
- **`/fix-paths`** - Automatic path and import correction
- **`/optimize-healthcare`** - Healthcare-specific application optimization
- **`/compliance-cleanup`** - LGPD/ANVISA compliance code cleanup

### 📊 **Cleanup Metrics & Reporting**

#### **Cleanup Impact Measurement**
```yaml
CLEANUP_METRICS:
  code_reduction:
    - "Lines of code eliminated"
    - "Duplicate functions merged"
    - "Obsolete files removed" 
    - "Healthcare-specific optimizations"
    
  performance_improvement:
    - "Bundle size reduction"
    - "Build time improvement"
    - "Medical operation performance gains"
    - "Healthcare workflow optimization"
    
  maintenance_benefit:
    - "Reduced complexity metrics"
    - "Improved code maintainability"
    - "Healthcare compliance simplification"
    - "Medical audit trail optimization"
```

#### **Cleanup Risk Assessment**
```yaml
RISK_ASSESSMENT:
  safety_validation:
    - "Reference analysis before removal"
    - "Healthcare functionality preservation"
    - "Medical compliance maintenance"
    - "Performance regression prevention"
    
  rollback_protection:
    - "Temporary backup creation"
    - "Incremental cleanup with validation"
    - "Healthcare safety checkpoints"
    - "Medical workflow verification"
```

### 🔒 **Safety & Validation**

#### **Cleanup Safety Protocols**
```yaml
SAFETY_PROTOCOLS:
  pre_cleanup:
    - "Complete project backup creation"
    - "Reference dependency mapping"
    - "Healthcare compliance validation"
    - "Medical workflow impact assessment"
    
  during_cleanup:
    - "Incremental removal with validation"
    - "Real-time reference checking"
    - "Healthcare functionality monitoring"
    - "Medical performance tracking"
    
  post_cleanup:
    - "Build validation and testing"
    - "Healthcare compliance verification"
    - "Medical workflow testing"
    - "Performance benchmark validation"
```

### 🎯 **Success Criteria & Validation**

```yaml
CLEANUP_COMPLIANCE:
  constant_cleaning: "Automated cleanup after every task ✓"
  path_correction: "All broken imports and redirections fixed ✓"
  no_backwards_compatibility: "Deprecated code removed immediately ✓"
  system_optimization: "Codebase clean and organized ✓"
  healthcare_preservation: "Medical functionality maintained ✓"
  
QUALITY_IMPROVEMENT:
  code_reduction: "≥20% reduction in duplicate code ✓"
  performance_gain: "≥10% build time improvement ✓"
  maintenance_simplification: "Reduced complexity metrics ✓"
  healthcare_optimization: "Medical workflow performance maintained ✓"
```

### 📋 **Integration with 30-Second Reality Check**

```yaml
REALITY_CHECK_CLEANUP:
  cleanup_execution: "Did cleanup run successfully without errors?"
  functionality_preserved: "Do all features still work correctly?"
  performance_maintained: "Is performance equal or better than before?"
  healthcare_compliance: "Is medical compliance still validated?"
  build_success: "Does the project still build successfully?"
  test_execution: "Do all tests pass after cleanup?"
  import_resolution: "Are all imports resolving correctly?"
  
AUTOMATED_VALIDATION:
  - "Execute comprehensive cleanup scan"
  - "Run build process to validate integrity"
  - "Execute test suite for regression detection"
  - "Check healthcare compliance requirements"
  - "Validate medical workflow performance"
  - "Verify no broken imports or paths"
  - "Confirm quality standards ≥9.5/10 maintained"
```

### 🏆 **Quality Standards**

- 🧹 **Constant Cleaning**: Automated cleanup after every task completion
- 🔧 **Path Correction**: Automatic fixing of broken imports and redirections  
- ❌ **No Backwards Compatibility**: Immediate removal of deprecated code
- 🏥 **Healthcare Preservation**: Medical functionality and compliance maintained
- 📊 **Performance Optimization**: Medical workflow performance ≤100ms maintained
- 🤖 **Archon Integrated**: Task-driven cleanup with research-based optimization
- 🌐 **Bilingual**: Portuguese/English healthcare optimization support

---

**Status**: 🧹 **Intelligent Code Cleaner** | **Philosophy**: Constant Cleanup + No Backwards Compatibility | **Safety**: Backup Protected | **Healthcare**: ✅ LGPD/ANVISA/CFM Compliant | **Integration**: ✅ Archon + Ultracite + PNPM | **Bilingual**: 🇧🇷 🇺🇸

**Ready for Clean Excellence**: Intelligent duplicate detection, obsolete code removal, and automatic path correction with healthcare compliance and safety validation.