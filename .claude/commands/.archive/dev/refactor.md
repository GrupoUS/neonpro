# /refactor - Universal Code Refactoring Command

## Command: `/refactor [target] [--type=performance|maintainability|security|architecture]`

### 🎯 **Purpose**
Intelligent code refactoring with technology stack detection, progressive improvement strategies, and automated quality validation for any project type.

### 🧠 **Intelligence Integration**
```yaml
REFACTOR_INTELLIGENCE:
  activation_triggers:
    - "/refactor [component]"
    - "improve [code]"
    - "optimize [module]"
    - "restructure [architecture]"
  
  context_detection:
    code_analysis: "Complexity metrics, code smells, technical debt"
    refactor_type: "Performance, maintainability, security, architecture"
    technology_stack: "Auto-detect patterns and best practices"
    impact_assessment: "Dependencies, breaking changes, risk analysis"
```

### 🚀 **Execution Flow**

#### **Phase 1: Code Analysis & Planning**
```yaml
ANALYSIS:
  code_assessment:
    - "Analyze code complexity and maintainability metrics"
    - "Identify code smells, anti-patterns, and technical debt"
    - "Map dependencies and potential breaking changes"
    - "Assess performance bottlenecks and optimization opportunities"
    
  refactor_strategy:
    performance: "Optimize algorithms, reduce complexity, improve efficiency"
    maintainability: "Improve readability, reduce coupling, enhance cohesion"
    security: "Fix vulnerabilities, improve data handling, enhance authentication"
    architecture: "Restructure components, improve design patterns, enhance scalability"
    
  risk_assessment:
    - "Identify potential breaking changes"
    - "Plan testing strategy and rollback procedures"
    - "Estimate refactoring complexity and timeline"
    - "Define success criteria and validation metrics"
```#### **Phase 2: Progressive Refactoring Implementation**
```yaml
IMPLEMENTATION:
  staged_approach:
    L1-L3: "Simple refactoring - Direct improvements, minimal impact"
    L4-L6: "Moderate refactoring - Structural changes with comprehensive testing"
    L7-L10: "Complex refactoring - Architectural changes with migration strategy"
    
  refactoring_patterns:
    - "Apply appropriate design patterns for technology stack"
    - "Extract methods, classes, and modules for better separation"
    - "Eliminate code duplication and improve reusability"
    - "Optimize data structures and algorithms"
    
  quality_preservation:
    - "Maintain existing functionality and behavior"
    - "Preserve API contracts and public interfaces"
    - "Ensure backward compatibility where required"
    - "Validate performance improvements"
```

#### **Phase 3: Validation & Quality Assurance**
```yaml
VALIDATION:
  comprehensive_testing:
    - "Run existing test suites to verify functionality preservation"
    - "Add new tests for refactored components"
    - "Performance testing to validate improvements"
    - "Integration testing to ensure system stability"
    
  quality_metrics:
    - "Measure code complexity reduction"
    - "Validate maintainability improvements"
    - "Assess performance gains"
    - "Verify security enhancements"
    
  documentation_updates:
    - "Update code documentation and comments"
    - "Revise architectural diagrams and specs"
    - "Document refactoring decisions and rationale"
    - "Update deployment and maintenance guides"
```

### 🔧 **Technology Stack Support**

#### **Frontend Refactoring Patterns**
```yaml
REACT_REFACTORING:
  common_improvements:
    - "Convert class components to functional with hooks"
    - "Optimize re-renders with memo and useMemo"
    - "Extract custom hooks for reusable logic"
    - "Improve state management with context or state libraries"
  tools: "React DevTools, ESLint, Prettier, Bundle Analyzers"
  
VUE_REFACTORING:
  common_improvements:
    - "Convert Options API to Composition API"
    - "Optimize reactivity with proper refs and computed"
    - "Extract composables for reusable functionality"
    - "Improve component structure and props design"
  tools: "Vue DevTools, ESLint Vue plugin, Vite analyzers"
  
ANGULAR_REFACTORING:
  common_improvements:
    - "Implement OnPush change detection strategy"
    - "Extract services for business logic separation"
    - "Optimize bundle size with lazy loading"
    - "Improve RxJS streams and subscription management"
  tools: "Angular CLI, NgRx, Bundle Analyzer, Lighthouse"
```

#### **Backend Refactoring Patterns**
```yaml
NODE_REFACTORING:
  common_improvements:
    - "Convert callbacks to async/await"
    - "Implement proper error handling patterns"
    - "Extract middleware and utilities"
    - "Optimize database queries and connections"
  tools: "ESLint, Node Clinic, PM2, Database profilers"
  
PYTHON_REFACTORING:
  common_improvements:
    - "Apply PEP 8 and type hints"
    - "Extract functions and classes for better organization"
    - "Optimize database ORM queries"
    - "Implement proper exception handling"
  tools: "pylint, black, mypy, Django Debug Toolbar"
  
JAVA_REFACTORING:
  common_improvements:
    - "Apply SOLID principles and design patterns"
    - "Optimize Spring configuration and dependency injection"
    - "Improve database access patterns"
    - "Enhance exception handling and logging"
  tools: "SonarQube, SpotBugs, JProfiler, Spring Boot Actuator"
```

### 📊 **Refactoring Types & Strategies**

#### **Performance Refactoring**
```yaml
PERFORMANCE_FOCUS:
  optimization_areas:
    - "Algorithm efficiency and Big O improvements"
    - "Database query optimization and indexing"
    - "Caching strategies and implementation"
    - "Resource usage optimization (memory, CPU, I/O)"
    
  validation_metrics:
    - "Response time improvements (target: >20% faster)"
    - "Resource usage reduction (memory, CPU)"
    - "Throughput and concurrent user capacity"
    - "Bundle size and loading time optimization"
```

#### **Maintainability Refactoring**
```yaml
MAINTAINABILITY_FOCUS:
  improvement_areas:
    - "Code readability and documentation"
    - "Reduce cyclomatic complexity"
    - "Eliminate code duplication (DRY principle)"
    - "Improve separation of concerns"
    
  validation_metrics:
    - "Cyclomatic complexity reduction (target: <10 per method)"
    - "Code duplication elimination (target: <3% duplicate code)"
    - "Test coverage improvement (target: >80%)"
    - "Documentation coverage and accuracy"
```

### 🤝 **Agent Orchestration**

```yaml
AGENT_COORDINATION:
  apex_dev:
    role: "Primary refactoring implementation"
    focus: "Code restructuring and improvement"
    
  apex_qa_debugger:
    role: "Quality validation and testing"
    activation: "All refactoring operations"
    
  apex_researcher:
    role: "Best practices research"
    activation: "Complex architectural refactoring"
```

### 🔍 **Usage Examples**

```bash
# Performance optimization
/refactor user-authentication --type=performance

# Code maintainability improvement
/refactor payment-processing --type=maintainability

# Security enhancement refactoring
/refactor data-handling --type=security

# Architectural restructuring
/refactor microservices-migration --type=architecture
```

### 🎯 **Success Criteria**

```yaml
COMPLETION_VALIDATION:
  functionality: "All existing functionality preserved and working"
  quality_improvement: "Measurable improvement in target area"
  test_coverage: "Maintained or improved test coverage"
  documentation: "Updated documentation and architectural diagrams"
  performance: "No performance regression, ideally improvements"
  maintainability: "Improved code metrics and maintainability scores"
```

---

**Status**: 🟢 **Universal Refactor Command** | **Focus**: Performance + Maintainability + Security + Architecture