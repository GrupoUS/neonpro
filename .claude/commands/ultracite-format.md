# /ultracite - Ultra-Fast Code Quality & Formatting Command

## Command: `/ultracite [action] [--files=pattern] [--fix] [--check-only]`

### 🎯 **Purpose**
**Zero Configuration** code quality enforcement with **subsecond performance** using Ultracite's lightning-fast formatter and linter. Implements maximum type safety, AI-friendly generation, and ≥9.5/10 quality standards for TypeScript/JavaScript projects.

### ⚡ **Ultracite Core Principles**
```yaml
ULTRACITE_STANDARDS:
  zero_configuration: "Ready-to-use without setup"
  subsecond_performance: "Lightning-fast formatting and linting"
  maximum_type_safety: "Strict TypeScript enforcement"
  ai_friendly_generation: "Optimized for automated code creation"
  
QUALITY_ENFORCEMENT:
  standard: "≥9.5/10 code quality (non-negotiable)"
  accessibility: "WCAG 2.1 AA+ compliance"
  type_safety: "Strict TypeScript without 'any' usage"
  performance: "Optimized bundle size and algorithms"
  security: "Input validation and XSS prevention"
```

### 🚀 **Execution Flow**

#### **Phase 1: Project Analysis & Initialization**
```yaml
PROJECT_ANALYSIS:
  detection:
    - "Detect TypeScript/JavaScript project type"
    - "Analyze existing configuration files"
    - "Identify framework (Next.js, React, Vue, etc.)"
    - "Check for existing linting/formatting setup"
    
  initialization:
    - "Run 'npx ultracite init' if not initialized"
    - "Verify ultracite configuration"
    - "Detect file patterns for processing"
    - "Set up AI-friendly generation rules"
    
  file_targeting:
    includes: "*.ts, *.tsx, *.js, *.jsx, *.vue, *.svelte"
    excludes: "node_modules, dist, build, .next, coverage"
    special_cases: "Configuration files, declaration files"
```

#### **Phase 2: Code Quality Processing**
```yaml
QUALITY_PROCESSING:
  formatting:
    - "Lightning-fast code formatting"
    - "Consistent style enforcement"
    - "AI-friendly structure optimization"
    - "Preserve semantic meaning"
    
  linting:
    - "Strict type checking enforcement"
    - "Accessibility rule validation"
    - "Security vulnerability detection"
    - "Performance optimization suggestions"
    
  type_safety:
    - "Eliminate 'any' type usage"
    - "Enforce strict TypeScript compliance"
    - "Validate proper error boundaries"
    - "Check import type usage"
```

#### **Phase 3: Quality Validation & Reporting**
```yaml
VALIDATION_REPORTING:
  quality_assessment:
    - "Calculate overall quality score"
    - "Identify critical issues requiring fixes"
    - "Generate improvement recommendations"
    - "Validate ≥9.5/10 standard compliance"
    
  performance_tracking:
    - "Measure formatting speed (subsecond target)"
    - "Track processing efficiency"
    - "Monitor memory usage"
    - "Report optimization opportunities"
    
  integration_validation:
    - "Verify build compatibility"
    - "Check test framework integration"
    - "Validate CI/CD pipeline compatibility"
    - "Ensure development workflow efficiency"
```

### 🔧 **Core Actions & Commands**

#### **Ultracite Operations**
```yaml
ULTRACITE_ACTIONS:
  init:
    command: "/ultracite init"
    purpose: "Initialize Ultracite in project (zero configuration)"
    creates: "ultracite.config.json, .ultraciterc, biome.json"
    automatic: "Auto-detect project type and framework"
    
  format:
    command: "/ultracite format [--files=pattern]"
    purpose: "Format and fix code automatically"
    speed: "Subsecond performance for most projects"
    scope: "All TypeScript/JavaScript files by default"
    
  lint:
    command: "/ultracite lint [--check-only]"
    purpose: "Check for issues without fixing"
    output: "Detailed issue report with severity levels"
    integration: "CI/CD pipeline compatible"
    
  check:
    command: "/ultracite check"
    purpose: "Comprehensive quality assessment"
    includes: "Format + lint + type checking + accessibility"
    quality_gate: "Fails if quality < 9.5/10"
```

#### **Quality Enforcement Actions**
```yaml
QUALITY_ACTIONS:
  accessibility_check:
    command: "/ultracite accessibility [--fix]"
    purpose: "WCAG 2.1 AA+ compliance validation"
    checks: "ARIA labels, semantic HTML, contrast ratios, keyboard nav"
    
  type_safety:
    command: "/ultracite types [--strict]"
    purpose: "Enforce maximum type safety"
    eliminates: "'any' usage, unsafe operations, non-null assertions"
    
  security_scan:
    command: "/ultracite security"
    purpose: "Security vulnerability detection"
    checks: "XSS prevention, input validation, unsafe patterns"
    
  performance_audit:
    command: "/ultracite performance"
    purpose: "Performance optimization analysis"
    checks: "Bundle size, algorithm efficiency, memory usage"
```

#### **Framework-Specific Actions**
```yaml
FRAMEWORK_ACTIONS:
  nextjs:
    command: "/ultracite nextjs [--optimize]"
    purpose: "Next.js specific optimizations"
    checks: "next/image usage, head optimization, static optimization"
    
  react:
    command: "/ultracite react [--hooks]"
    purpose: "React best practices enforcement"
    validates: "Hook rules, key props, fragment usage, prop types"
    
  typescript:
    command: "/ultracite typescript [--strict]"
    purpose: "Advanced TypeScript validation"
    enforces: "Strict mode, proper imports, const assertions"
```

### 📋 **Essential Quality Rules Implementation**

#### **Accessibility (WCAG 2.1 AA+)**
```yaml
ACCESSIBILITY_RULES:
  semantic_html:
    - "Proper ARIA labels and roles for interactive elements"
    - "Semantic HTML structure over div-heavy layouts"
    - "Form labels properly associated with inputs"
    
  interaction_support:
    - "Keyboard navigation support for all interactions"
    - "Focus management for dynamic content"
    - "Screen reader compatibility with meaningful alt text"
    
  visual_standards:
    - "Sufficient color contrast ratios (4.5:1 minimum)"
    - "Responsive design for accessibility devices"
    - "Text scaling and zoom support"
```

#### **TypeScript Excellence**
```yaml
TYPESCRIPT_RULES:
  strict_enforcement:
    - "Strict type checking without 'any' usage"
    - "Proper error boundaries and exception handling"
    - "'import type' for type-only imports"
    
  safety_patterns:
    - "'as const' assertions for literal types"
    - "Consistent array syntax (T[] or Array<T>)"
    - "Explicit enum member values"
    - "No non-null assertions (!) or unsafe operations"
```

#### **React/JSX Best Practices**
```yaml
REACT_RULES:
  component_structure:
    - "Hooks called only at component top level"
    - "Proper dependency arrays in useEffect"
    - "No component definitions inside other components"
    
  performance_optimization:
    - "Unique keys for iterated elements (not array indices)"
    - "Fragment syntax (<>) over React.Fragment"
    - "Proper prop types and validation"
```

#### **Security & Correctness**
```yaml
SECURITY_RULES:
  data_protection:
    - "Input validation and sanitization"
    - "No hardcoded sensitive data"
    - "Secure communication protocols"
    
  safe_patterns:
    - "Proper error handling with meaningful messages"
    - "No usage of eval(), document.cookie, or unsafe patterns"
    - "Prevent XSS through proper escaping"
```

### 🏥 **Healthcare & Compliance Integration**

```yaml
HEALTHCARE_QUALITY:
  data_protection:
    - "LGPD compliance in data handling patterns"
    - "Patient data encryption validation"
    - "Multi-tenant isolation checks (clinic_id patterns)"
    
  performance_standards:
    - "Medical workflow optimization (≤100ms target)"
    - "Clinical operation performance validation"
    - "Patient data access speed requirements"
    
  accessibility_healthcare:
    - "Medical interface accessibility (enhanced WCAG)"
    - "Healthcare device compatibility"
    - "Emergency access pattern validation"
    
  audit_compliance:
    - "Code patterns support audit trail requirements"
    - "Medical data logging compliance"
    - "Healthcare regulation adherence validation"
```

### 🔄 **Integration with Development Workflow**

#### **Pre-Implementation Quality Check**
```yaml
PRE_CODING:
  analysis_required:
    1: "Analyze existing codebase patterns"
    2: "Consider edge cases and error scenarios"
    3: "Validate accessibility requirements"
    4: "Follow framework-specific best practices"
    5: "Research similar implementations (Context7 + Archon)"
    
  ultracite_preparation:
    - "Initialize ultracite if not present"
    - "Configure project-specific rules"
    - "Set up AI-friendly generation patterns"
    - "Establish quality baseline (≥9.5/10)"
```

#### **Post-Implementation Quality Enforcement**
```yaml
POST_CODING:
  automatic_processing:
    - "Format all modified files"
    - "Run comprehensive lint checks"
    - "Validate type safety compliance"
    - "Check accessibility standards"
    
  quality_validation:
    - "Ensure ≥9.5/10 quality score"
    - "Verify no critical issues remain"
    - "Validate performance requirements"
    - "Check healthcare compliance (if applicable)"
```

### 🤝 **MCP Integration & Intelligence**

```yaml
MCP_INTEGRATION:
  context7_research:
    - "Official framework documentation for best practices"
    - "TypeScript/JavaScript specification compliance"
    - "Accessibility guidelines and implementation"
    - "Security standards and patterns"
    
  archon_knowledge:
    - "Project-specific quality standards"
    - "Healthcare compliance requirements"
    - "Performance benchmarks and optimization"
    - "Code pattern repositories and examples"
    
  desktop_commander:
    - "File system operations for batch processing"
    - "Build process integration and validation"
    - "Test execution and result processing"
    - "Performance monitoring and reporting"
```

### 🔍 **Usage Examples**

```bash
# Project initialization with ultracite
/ultracite init
# → Auto-configure for TypeScript/React/Next.js project

# Format all TypeScript/JavaScript files
/ultracite format
# → Lightning-fast formatting with ≥9.5/10 quality

# Comprehensive quality check
/ultracite check
# → Format + lint + types + accessibility + security

# Healthcare-specific validation
/ultracite healthcare --lgpd
# → LGPD compliance + patient data patterns + audit trails

# Framework-specific optimization
/ultracite nextjs --optimize
# → Next.js best practices + performance + accessibility

# Security-focused validation
/ultracite security --strict
# → XSS prevention + input validation + secure patterns

# Accessibility compliance check
/ultracite accessibility --wcag-aa
# → WCAG 2.1 AA+ compliance with healthcare enhancements

# Performance optimization analysis
/ultracite performance --bundle-size
# → Bundle optimization + algorithm efficiency + memory usage
```

### 🌐 **Bilingual Support**

#### **Portuguese Commands**
- **`/ultracite`** - Formatação e qualidade de código ultra-rápida
- **`/formatar-codigo`** - Formatação automática com padrões de excelência
- **`/validar-qualidade`** - Validação completa de qualidade ≥9.5/10
- **`/acessibilidade`** - Compliance WCAG 2.1 AA+ para saúde
- **`/seguranca-codigo`** - Análise de segurança e vulnerabilidades

#### **English Commands**
- **`/ultracite`** - Ultra-fast code quality and formatting
- **`/format-code`** - Automatic formatting with excellence standards
- **`/validate-quality`** - Complete quality validation ≥9.5/10
- **`/accessibility`** - WCAG 2.1 AA+ compliance for healthcare
- **`/code-security`** - Security analysis and vulnerability detection

### 📊 **Quality Metrics & Reporting**

#### **Quality Score Calculation**
```yaml
QUALITY_METRICS:
  type_safety: "25% - TypeScript strict compliance"
  code_style: "20% - Formatting and consistency"
  accessibility: "20% - WCAG 2.1 AA+ compliance"
  security: "15% - Vulnerability detection and prevention"
  performance: "15% - Optimization and efficiency"
  healthcare: "5% - LGPD/ANVISA/CFM compliance (if applicable)"
  
SCORING_SYSTEM:
  excellent: "≥9.5/10 - Production ready with excellence"
  good: "8.5-9.4/10 - Good quality, minor improvements needed"
  warning: "7.0-8.4/10 - Significant improvements required"
  critical: "<7.0/10 - Major issues must be resolved"
```

#### **Performance Benchmarks**
```yaml
PERFORMANCE_TARGETS:
  formatting_speed: "≤500ms for medium projects (≤100 files)"
  linting_speed: "≤1000ms for comprehensive analysis"
  type_checking: "≤2000ms for strict TypeScript validation"
  total_processing: "≤3000ms for complete quality check"
  
EFFICIENCY_METRICS:
  memory_usage: "≤200MB peak usage during processing"
  cpu_utilization: "≤80% during intensive operations"
  file_processing: "≥50 files/second formatting rate"
  cache_effectiveness: "≥90% cache hit rate for repeated operations"
```

### 🎯 **Success Criteria & Validation**

```yaml
ULTRACITE_COMPLIANCE:
  zero_configuration: "Works out-of-box without manual setup ✓"
  subsecond_performance: "Formatting completes in ≤1000ms ✓"
  maximum_type_safety: "Strict TypeScript without 'any' usage ✓"
  ai_friendly_generation: "Optimized for automated code creation ✓"
  quality_enforcement: "≥9.5/10 standards maintained consistently ✓"
  
HEALTHCARE_INTEGRATION:
  lgpd_compliance: "Patient data patterns validated ✓"
  performance_healthcare: "≤100ms medical workflow operations ✓"
  accessibility_enhanced: "WCAG 2.1 AA+ with healthcare extensions ✓"
  audit_support: "Code patterns support audit requirements ✓"
```

### 📋 **30-Second Reality Check Integration**

```yaml
REALITY_CHECK_ULTRACITE:
  format_execution: "Did ultracite format run successfully?"
  quality_improvement: "Did code quality score improve?"
  type_safety: "Are all type errors resolved?"
  accessibility: "Do accessibility checks pass?"
  performance: "Is performance within acceptable limits?"
  build_compatibility: "Does the code still build successfully?"
  test_execution: "Do all tests pass after formatting?"
  
AUTOMATED_VALIDATION:
  - "Run ultracite format and validate output"
  - "Execute comprehensive quality check"
  - "Verify build process completion"
  - "Run test suite for regression detection"
  - "Check performance benchmarks"
  - "Validate accessibility compliance"
  - "Confirm healthcare standards (if applicable)"
```

### 🏆 **Quality Standards**

- ⚡ **Zero Configuration**: Ready-to-use without setup
- 🚀 **Subsecond Performance**: Lightning-fast processing
- 🔒 **Maximum Type Safety**: Strict TypeScript enforcement
- 🤖 **AI-Friendly**: Optimized for automated code generation
- ♿ **Accessibility**: WCAG 2.1 AA+ compliance
- 🏥 **Healthcare Ready**: LGPD/ANVISA/CFM compliance
- 📊 **Quality Enforced**: ≥9.5/10 standards with validation

---

**Status**: ⚡ **Ultra-Fast Quality Enforcer** | **Performance**: Subsecond | **Quality**: ≥9.5/10 | **Type Safety**: Maximum | **Healthcare**: ✅ LGPD/ANVISA/CFM Ready | **Bilingual**: 🇧🇷 🇺🇸

**Ready for Excellence**: Zero-configuration code quality with lightning-fast performance, maximum type safety, and healthcare compliance integration.