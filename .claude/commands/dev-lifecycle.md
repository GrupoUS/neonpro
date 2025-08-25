# 🔄 Dev Lifecycle - MEGA Development Command

## Command: `/dev-lifecycle [action] [target] [--complexity=L1-L10] [--type=init|feature|refactor|deploy|review|optimize]`

### 🎯 **Purpose**
Universal development lifecycle orchestrator - from project initialization to production deployment. Combines intelligent project setup, feature development, code refactoring, deployment strategies, code review, and performance optimization in a single comprehensive command.

### 🧠 **Intelligence Integration**
```yaml
DEV_INTELLIGENCE:
  activation_triggers:
    - "/dev-lifecycle [action]"
    - "/init-project", "/feature", "/refactor", "/deploy", "/review", "/optimize"
    - "create [project]", "develop [feature]", "optimize [code]", "deploy [app]"
  
  context_detection:
    project_state: "Empty, existing, production-ready"
    technology_stack: "Auto-detect: React, Vue, Angular, Node.js, Python, Java, etc."
    complexity_assessment: "L1-L10 based on scope and requirements"
    lifecycle_stage: "Init → Develop → Optimize → Deploy → Review → Maintain"
```

## 🚀 **Core Actions**

### **1. PROJECT INITIALIZATION (init)**
```yaml
PROJECT_INIT:
  purpose: "Bootstrap new projects with intelligent technology stack setup"
  
  execution_flow:
    analysis: "Analyze project requirements and recommend optimal tech stack"
    setup: "Create complete development environment with best practices"
    configuration: "Configure quality standards, linting, testing, CI/CD"
    documentation: "Generate comprehensive documentation and guides"
    
  technology_stacks:
    saas_multi_tenant:
      - "Next.js + TypeScript + Tailwind"
      - "Supabase + RLS patterns"  
      - "shadcn/ui components"
      - "Multi-tenant architecture patterns"
      
    healthcare_clinic:
      - "Compliance LGPD patterns"
      - "Healthcare-specific components"
      - "Enhanced security patterns"
      - "ANVISA/CFM compliance"
      
    generic_fullstack:
      - "Proven architecture patterns"
      - "Performance optimization"
      - "Quality gates ≥9.5/10"
      - "CI/CD automation"
  
  deliverables:
    - "Complete project structure with organized directories"
    - "Configuration files (package.json, tsconfig.json, etc.)"
    - "Quality tooling setup (ESLint, Prettier, Testing)"
    - "Documentation package (README, API docs, guides)"
    - "Git workflow and CI/CD configuration"
```

### **2. FEATURE DEVELOPMENT (feature)**
```yaml
FEATURE_DEVELOPMENT:
  purpose: "Universal feature development with intelligent routing and progressive quality"
  
  execution_flow:
    discovery: "Parse requirements, assess dependencies, determine complexity"
    architecture: "Design component structure, API contracts, testing strategy"
    implementation: "Research-driven development with quality validation"
    validation: "Comprehensive testing and integration validation"
    
  complexity_routing:
    L1-L3: "Simple feature - direct implementation with basic testing"
    L4-L6: "Moderate feature - structured development with comprehensive tests"
    L7-L10: "Complex feature - architecture design + multi-phase development"
    
  quality_standards:
    L1-L3: "≥9.0/10 - Basic quality with essential features"
    L4-L6: "≥9.3/10 - Professional quality with error handling"
    L7-L10: "≥9.7/10 - Enterprise quality with security review"
    
  tech_stack_support:
    frontend: "React, Vue, Angular - Component architecture and state management"
    backend: "Node.js, Python, Java - API design and database integration"
    fullstack: "Next.js, Nuxt, Django - End-to-end feature implementation"
```

### **3. CODE REFACTORING (refactor)**
```yaml
CODE_REFACTOR:
  purpose: "Intelligent code improvement with technology stack detection and validation"
  
  execution_flow:
    analysis: "Code complexity metrics, technical debt assessment, impact analysis"
    strategy: "Performance, maintainability, security, or architecture focus"
    implementation: "Progressive refactoring with comprehensive testing"
    validation: "Quality metrics validation and performance benchmarking"
    
  refactor_types:
    performance: "Algorithm optimization, database queries, caching strategies"
    maintainability: "Code readability, duplication elimination, documentation"
    security: "Vulnerability fixes, data handling, authentication enhancement"
    architecture: "Design patterns, component restructuring, scalability"
    
  validation_metrics:
    performance: "Response time improvements (target: >20% faster)"
    maintainability: "Complexity reduction, test coverage increase"
    security: "Vulnerability elimination, compliance validation"
    architecture: "Coupling reduction, cohesion improvement"
```

### **4. DEPLOYMENT ORCHESTRATION (deploy)**
```yaml
DEPLOYMENT:
  purpose: "Intelligent deployment with environment detection and progressive strategies"
  
  execution_flow:
    validation: "Pre-deployment testing, security scans, configuration verification"
    execution: "Blue-green, rolling, or canary deployment strategies"
    monitoring: "Real-time health monitoring and performance validation"
    verification: "Post-deployment smoke tests and business metrics validation"
    
  deployment_strategies:
    blue_green: "Zero-downtime with instant rollback capability"
    rolling: "Gradual deployment with continuous monitoring"
    canary: "Risk mitigation through gradual user rollout"
    
  platform_support:
    frontend: "Vercel, Netlify, AWS S3/CloudFront, Azure Static Web Apps"
    backend: "AWS ECS/Fargate, Kubernetes, Google Cloud Run, Docker Swarm"
    fullstack: "Next.js deployment, containerized applications, serverless"
    
  validation_criteria:
    functionality: "Critical features working correctly"
    performance: "Response times within acceptable ranges" 
    monitoring: "Health checks and alerting configured"
```

### **5. CODE REVIEW (review)**
```yaml
CODE_REVIEW:
  purpose: "Comprehensive code analysis with automated and manual validation"
  
  execution_flow:
    planning: "Scope analysis, review type determination, quality standards"
    automated: "Static analysis, dependency audit, security scanning"
    manual: "Business logic review, architecture validation, recommendations"
    reporting: "Prioritized issues with actionable improvement suggestions"
    
  review_types:
    security: "OWASP compliance, vulnerability scanning, data protection"
    performance: "Algorithm efficiency, scalability, resource optimization"
    maintainability: "Code readability, testing coverage, documentation"
    architecture: "Design patterns, modularity, separation of concerns"
    
  technology_patterns:
    react: "XSS prevention, re-render optimization, component structure"
    vue: "Template security, reactivity optimization, composition patterns"
    angular: "Security configuration, change detection, dependency injection"
    nodejs: "Input validation, event loop optimization, security patterns"
```

### **6. PERFORMANCE OPTIMIZATION (optimize)**
```yaml
PERFORMANCE_OPTIMIZATION:
  purpose: "PNPM-first performance optimization with healthcare compliance"
  
  execution_flow:
    analysis: "Performance bottleneck identification, dependency audit"
    optimization: "PNPM migration, build optimization, caching strategies"
    validation: "Performance benchmarking, compliance verification"
    monitoring: "Continuous performance monitoring and alerting"
    
  pnpm_advantages:
    speed: "3x faster than NPM installation"
    efficiency: "70% disk space reduction"
    security: "Strict dependency isolation"
    healthcare: "LGPD/ANVISA/CFM compliance integration"
    
  optimization_areas:
    installation: "PNPM store optimization, parallel downloads"
    builds: "Incremental builds, caching, bundle optimization"
    runtime: "Performance monitoring, resource optimization"
    compliance: "Healthcare performance standards (≤100ms targets)"
```

## 🔧 **Universal Usage Patterns**

### **Project Initialization**
```bash
# Healthcare SaaS project initialization
/dev-lifecycle init healthcare-saas --complexity=L6
# → Complete setup with LGPD compliance and multi-tenant architecture

# Quick generic full-stack project
/dev-lifecycle init fullstack --complexity=L3
# → Basic full-stack setup with essential tools and quality gates

# Enterprise project with advanced configuration
/dev-lifecycle init enterprise --complexity=L8
# → Comprehensive setup with governance, security, and compliance
```

### **Feature Development**
```bash
# Simple UI component development
/dev-lifecycle feature user-profile --complexity=L2 --type=frontend
# → Direct implementation with basic testing

# Complex payment system
/dev-lifecycle feature payment-gateway --complexity=L8 --type=fullstack
# → Architecture design, security review, comprehensive testing

# API endpoint development
/dev-lifecycle feature recommendation-api --complexity=L5 --type=backend
# → Structured development with integration testing
```

### **Code Refactoring**
```bash
# Performance optimization refactoring
/dev-lifecycle refactor data-processing --type=performance
# → Algorithm optimization, caching improvements

# Security-focused refactoring
/dev-lifecycle refactor authentication --type=security
# → Vulnerability fixes, security pattern implementation

# Architecture restructuring
/dev-lifecycle refactor microservices --type=architecture
# → Component restructuring, design pattern application
```

### **Deployment Operations**
```bash
# Production deployment with blue-green strategy
/dev-lifecycle deploy production --strategy=blue-green --validate
# → Zero-downtime deployment with comprehensive validation

# Staging deployment with canary rollout
/dev-lifecycle deploy staging --strategy=canary
# → Gradual rollout with real user feedback

# Development environment quick deployment
/dev-lifecycle deploy development --strategy=rolling
# → Fast deployment with basic validation
```

### **Code Review Operations**
```bash
# Comprehensive security review
/dev-lifecycle review authentication-module --type=security
# → OWASP compliance, vulnerability scanning

# Performance analysis review
/dev-lifecycle review data-processing --type=performance
# → Algorithm analysis, optimization recommendations

# Architecture design review
/dev-lifecycle review system-architecture --type=architecture
# → Design pattern validation, scalability assessment
```

### **Performance Optimization**
```bash
# PNPM migration with healthcare optimization
/dev-lifecycle optimize --migrate --healthcare
# → NPM to PNPM migration with medical compliance

# Build performance optimization
/dev-lifecycle optimize build --performance
# → Build time optimization, bundle analysis

# Runtime performance optimization
/dev-lifecycle optimize runtime --medical
# → Medical workflow performance (≤100ms targets)
```

## 🏥 **Healthcare & Compliance Integration**

```yaml
HEALTHCARE_OPTIMIZATION:
  lgpd_compliance:
    - "Automated LGPD compliance validation throughout lifecycle"
    - "Patient data handling pattern enforcement"
    - "Medical audit trail integration"
    - "Regulatory compliance reporting"
    
  performance_medical:
    - "≤100ms patient data operation targets"
    - "Medical workflow optimization patterns"
    - "Emergency response performance validation"
    - "Clinical decision support optimization"
    
  security_healthcare:
    - "Medical-grade security scanning and validation"
    - "Patient privacy protection patterns"
    - "Healthcare audit requirements compliance"
    - "Medical device integration security"
```

## 🤝 **Agent Orchestration & MCP Integration**

```yaml
AGENT_COORDINATION:
  archon_integration:
    - "Task-driven development with Archon MCP workflow"
    - "Research-first implementation using perform_rag_query"
    - "Code examples integration with search_code_examples"
    - "Project management with task status updates"
    
  quality_agents:
    apex_dev: "Primary implementation and architecture"
    apex_ui_ux_designer: "Frontend features and user interfaces"
    apex_qa_debugger: "Quality assurance and testing validation"
    apex_researcher: "Technology research and best practices"
    
  tool_integration:
    desktop_commander: "File operations and project management"
    context7: "Official documentation and best practices"
    sequential_thinking: "Complex problem solving and analysis"
    ultracite: "Code quality enforcement (≥9.5/10)"
```

## 📊 **Quality Standards & Metrics**

```yaml
QUALITY_ENFORCEMENT:
  code_quality:
    L1-L3: "≥9.0/10 - Essential quality with basic patterns"
    L4-L6: "≥9.3/10 - Professional quality with comprehensive testing"
    L7-L10: "≥9.7/10 - Enterprise quality with security and performance"
    
  performance_targets:
    response_time: "≤200ms for standard operations"
    medical_operations: "≤100ms for patient data operations"
    build_time: "≥50% improvement with PNPM optimization"
    bundle_size: "Optimized for target platform requirements"
    
  security_compliance:
    vulnerability_scanning: "Automated security validation"
    dependency_audit: "Third-party package security verification"
    healthcare_compliance: "LGPD/ANVISA/CFM regulatory compliance"
    data_protection: "Patient data security pattern enforcement"
```

## 🌐 **Bilingual Support**

### **Portuguese Commands**
- **`/ciclo-dev init`** - Inicialização completa de projeto
- **`/ciclo-dev feature`** - Desenvolvimento de funcionalidades
- **`/ciclo-dev refatorar`** - Refatoração e otimização de código
- **`/ciclo-dev deploy`** - Orquestração de deployment
- **`/ciclo-dev revisar`** - Revisão abrangente de código
- **`/ciclo-dev otimizar`** - Otimização de performance PNPM

### **English Commands**
- **`/dev-lifecycle init`** - Complete project initialization
- **`/dev-lifecycle feature`** - Feature development workflow
- **`/dev-lifecycle refactor`** - Code refactoring and optimization
- **`/dev-lifecycle deploy`** - Deployment orchestration
- **`/dev-lifecycle review`** - Comprehensive code review
- **`/dev-lifecycle optimize`** - Performance optimization with PNPM

## 🎯 **Success Criteria & Validation**

```yaml
LIFECYCLE_VALIDATION:
  init_success: "Complete project setup with quality tooling and documentation"
  feature_delivery: "Working features meeting complexity-appropriate quality standards"
  refactor_improvement: "Measurable improvements in target areas (performance, security, etc.)"
  deployment_reliability: "Successful deployment with validation and monitoring"
  review_completeness: "Comprehensive analysis with actionable recommendations"
  optimization_performance: "Significant performance improvements (≥3x faster with PNPM)"
  
HEALTHCARE_COMPLIANCE:
  medical_performance: "≤100ms patient data operations achieved ✓"
  lgpd_compliance: "Automated LGPD validation throughout lifecycle ✓"
  security_validation: "Medical-grade security standards enforced ✓"
  audit_readiness: "Complete audit trail and compliance reporting ✓"
```

---

## 🚀 **Ready for Complete Development Lifecycle**

**Dev Lifecycle Command** activated with comprehensive development workflow orchestration:

✅ **Project Initialization** - Intelligent setup with technology detection and quality standards  
✅ **Feature Development** - Progressive complexity handling with research-driven implementation  
✅ **Code Refactoring** - Multi-type optimization with automated validation  
✅ **Deployment Orchestration** - Multiple strategies with comprehensive monitoring  
✅ **Code Review System** - Automated and manual analysis with actionable recommendations  
✅ **Performance Optimization** - PNPM-first approach with healthcare compliance  

**Healthcare Ready**: LGPD/ANVISA/CFM compliance integrated throughout lifecycle  
**Quality Enforced**: L1-L10 progressive quality standards (≥9.0-9.7/10)  
**Technology Universal**: Auto-detection and support for all major stacks  
**Archon Integrated**: Seamless task-driven development workflow  

**Status**: 🟢 **MEGA Development Command** | **Coverage**: Complete Lifecycle | **Quality**: L1-L10 Progressive | **Healthcare**: ✅ Compliant | **Bilingual**: 🇧🇷 🇺🇸