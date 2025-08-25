# /review - Universal Code Review Command

## Command: `/review [target] [--type=security|performance|maintainability|architecture]`

### 🎯 **Purpose**
Intelligent code review system with technology stack detection, progressive analysis, and automated quality validation for any project type.

### 🧠 **Intelligence Integration**
```yaml
REVIEW_INTELLIGENCE:
  activation_triggers:
    - "/review [code]"
    - "analyze [component]"
    - "audit [security]"
    - "validate [architecture]"
  
  context_detection:
    review_scope: "Files, components, modules, or full system"
    review_type: "Security, performance, maintainability, architecture"
    technology_stack: "Auto-detect patterns and best practices"
    complexity_level: "L1-L10 based on scope and depth"
```

### 🚀 **Execution Flow**

#### **Phase 1: Review Planning & Scope**
```yaml
PLANNING:
  scope_analysis:
    - "Identify files, components, and dependencies to review"
    - "Determine review type and focus areas"
    - "Assess complexity and required expertise level"
    - "Plan review timeline and resource allocation"
    
  review_criteria:
    security: "Vulnerability scanning, input validation, authentication"
    performance: "Algorithm efficiency, resource usage, scalability"
    maintainability: "Code readability, documentation, testing"
    architecture: "Design patterns, separation of concerns, modularity"
    
  quality_standards:
    L1-L3: "Basic review - Focus on critical issues"
    L4-L6: "Comprehensive review - Detailed analysis and recommendations"
    L7-L10: "Expert review - Deep architecture and security analysis"
```#### **Phase 2: Automated Analysis**
```yaml
ANALYSIS:
  static_code_analysis:
    - "Run linters and code quality analyzers"
    - "Identify security vulnerabilities and code smells"
    - "Analyze complexity metrics and maintainability indices"
    - "Check adherence to coding standards and best practices"
    
  dependency_analysis:
    - "Audit third-party dependencies for vulnerabilities"
    - "Check for outdated packages and security updates"
    - "Analyze license compatibility and compliance"
    - "Identify potential supply chain risks"
    
  architecture_review:
    - "Validate design patterns and architectural decisions"
    - "Check separation of concerns and modularity"
    - "Analyze coupling and cohesion metrics"
    - "Review scalability and maintainability aspects"
```

#### **Phase 3: Manual Review & Recommendations**
```yaml
MANUAL_REVIEW:
  code_inspection:
    - "Review business logic and algorithm implementation"
    - "Validate error handling and edge case coverage"
    - "Check input validation and sanitization"
    - "Assess performance optimization opportunities"
    
  documentation_review:
    - "Validate code comments and documentation accuracy"
    - "Check API documentation completeness"
    - "Review architectural decision records"
    - "Assess user-facing documentation quality"
    
  recommendation_generation:
    - "Prioritize issues by severity and impact"
    - "Provide actionable improvement suggestions"
    - "Include code examples and best practices"
    - "Estimate implementation effort and timeline"
```

### 🔧 **Technology Stack Support**

#### **Frontend Review Patterns**
```yaml
REACT_REVIEW:
  security_focus:
    - "XSS prevention and input sanitization"
    - "Secure state management and data handling"
    - "Component prop validation and type safety"
    - "Bundle security and dependency scanning"
    
  performance_focus:
    - "Component re-render optimization"
    - "Bundle size and code splitting analysis"
    - "Memory leak detection in useEffect"
    - "Virtual DOM performance patterns"
    
  maintainability_focus:
    - "Component structure and reusability"
    - "Custom hooks and logic extraction"
    - "PropTypes or TypeScript usage"
    - "Testing coverage and quality"
  
VUE_REVIEW:
  security_focus:
    - "Template injection prevention"
    - "Reactive data security patterns"
    - "Component communication security"
    - "Build configuration security"
    
  performance_focus:
    - "Reactivity system optimization"
    - "Computed properties efficiency"
    - "Component lifecycle optimization"
    - "Bundle analysis and tree shaking"
  
ANGULAR_REVIEW:
  security_focus:
    - "Template security and sanitization"
    - "HTTP client security configuration"
    - "Authentication and authorization patterns"
    - "Dependency injection security"
    
  performance_focus:
    - "Change detection optimization"
    - "OnPush strategy implementation"
    - "Lazy loading and code splitting"
    - "RxJS subscription management"
```

#### **Backend Review Patterns**
```yaml
NODE_REVIEW:
  security_focus:
    - "Input validation and parameter sanitization"
    - "Authentication and session management"
    - "SQL injection and NoSQL injection prevention"
    - "Environment variable security"
    
  performance_focus:
    - "Event loop optimization"
    - "Database query efficiency"
    - "Memory usage and garbage collection"
    - "Caching strategies and implementation"
  
PYTHON_REVIEW:
  security_focus:
    - "Input validation and OWASP compliance"
    - "Django/Flask security best practices"
    - "Database ORM security patterns"
    - "API authentication and authorization"
    
  performance_focus:
    - "Algorithm optimization and Big O analysis"
    - "Database query optimization"
    - "Memory usage and profiling"
    - "Async programming efficiency"
  
JAVA_REVIEW:
  security_focus:
    - "Input validation and parameter binding"
    - "Spring Security configuration"
    - "Database access security"
    - "Serialization and deserialization security"
    
  performance_focus:
    - "JVM optimization and garbage collection"
    - "Database connection pooling"
    - "Caching strategies (Redis, Hazelcast)"
    - "Concurrent programming patterns"
```

### 📊 **Review Types & Focus Areas**

#### **Security Review**
```yaml
SECURITY_REVIEW:
  vulnerability_scanning:
    - "OWASP Top 10 vulnerability assessment"
    - "Dependency vulnerability scanning"
    - "Code injection prevention analysis"
    - "Authentication and authorization review"
    
  data_protection:
    - "Sensitive data handling and encryption"
    - "Privacy compliance (GDPR, LGPD)"
    - "Data transmission security"
    - "Audit logging and monitoring"
    
  severity_classification:
    Critical: "Immediate security risks requiring urgent fixes"
    High: "Significant security issues requiring prompt attention"
    Medium: "Security improvements with scheduled implementation"
    Low: "Security enhancements and best practice adoption"
```

#### **Performance Review**
```yaml
PERFORMANCE_REVIEW:
  optimization_areas:
    - "Algorithm efficiency and computational complexity"
    - "Database query optimization and indexing"
    - "Caching strategies and cache invalidation"
    - "Resource utilization (CPU, memory, I/O)"
    
  scalability_assessment:
    - "Horizontal and vertical scaling potential"
    - "Load balancing and distribution strategies"
    - "Database sharding and partitioning"
    - "Microservices architecture optimization"
    
  performance_metrics:
    - "Response time and throughput analysis"
    - "Resource consumption patterns"
    - "Concurrent user capacity"
    - "System bottleneck identification"
```

### 🤝 **Agent Orchestration**

```yaml
AGENT_COORDINATION:
  apex_qa_debugger:
    role: "Primary review coordinator"
    focus: "Quality analysis and validation"
    
  apex_researcher:
    role: "Best practices research"
    activation: "Complex architectural or security reviews"
    
  apex_dev:
    role: "Implementation guidance"
    activation: "Providing code examples and solutions"
```

### 🔍 **Usage Examples**

```bash
# Comprehensive security review
/review authentication-module --type=security

# Performance optimization review
/review data-processing --type=performance

# Architecture design review
/review microservices-design --type=architecture

# General maintainability review
/review user-management --type=maintainability
```

### 🎯 **Success Criteria**

```yaml
COMPLETION_VALIDATION:
  issue_identification: "All critical and high-priority issues identified"
  recommendation_quality: "Actionable recommendations with examples"
  security_compliance: "Security standards and best practices validated"
  documentation: "Comprehensive review report with prioritized actions"
  knowledge_transfer: "Team educated on findings and improvements"
```

---

**Status**: 🟢 **Universal Review Command** | **Focus**: Security + Performance + Maintainability + Architecture