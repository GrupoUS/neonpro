# Command: /plan | /planejar

## Universal Description
**Phase 3: Planning & Design** - Strategic implementation planning with constitutional architecture design for any project complexity and domain.

## Purpose
Transform research insights into comprehensive implementation plans using constitutional AI principles, systematic design thinking, and architecture patterns suitable for any technology stack or business domain.

## Context Detection
- **Architecture Planning**: System design, component structure, data flow
- **Implementation Strategy**: Development approach, technology integration
- **Resource Planning**: Timeline, skills, tools, dependencies
- **Risk Management**: Risk assessment, mitigation strategies, contingency plans
- **Quality Planning**: Quality gates, testing strategy, validation approach
- **Deployment Planning**: Environment setup, CI/CD, monitoring

## Auto-Activation Triggers
```yaml
bilingual_triggers:
  portuguese: ["planejar", "projetar", "arquitetar", "estratégia", "design", "estruturar"]
  english: ["plan", "design", "architect", "strategy", "structure", "blueprint"]
  
workflow_triggers:
  - "Research phase completed with recommendations"
  - "Discovery complexity ≥L3 requires planning"
  - "Multiple implementation options need planning"
  - "Architecture decisions required"
  - "Resource allocation needed"
  
automatic_scenarios:
  - Research findings require systematic planning
  - Complex project structure needs architecture
  - Team coordination requires planning
  - Risk mitigation strategies needed
  - Quality standards require planning framework
```

## Execution Pattern

### 1. Constitutional Planning Framework
```bash
# Load research intelligence and context
RESEARCH_FINDINGS=$(cat .claude/.cache/research-report.md)
COMPLEXITY_LEVEL=$(cat .claude/.cache/context.tmp | grep COMPLEXITY_LEVEL)
QUALITY_TARGET=$(cat .claude/.cache/routing.tmp | grep QUALITY_TARGET)

echo "🏗️ Initiating constitutional planning framework..."

# Constitutional Analysis for Planning
# User Perspective: End-user experience and usability
# Developer Perspective: Maintainability, extensibility, code quality
# Business Perspective: Cost, timeline, resource optimization
# Security Perspective: Risk assessment, compliance requirements
# Performance Perspective: Scalability, optimization, monitoring
```

### 2. Architecture Design Process
```bash
# Multi-tier architecture planning
echo "🎨 Designing system architecture..."

if [[ $COMPLEXITY_LEVEL =~ "L[1-2]" ]]; then
    ARCHITECTURE_PATTERN="simple"
    PLANNING_DEPTH="basic"
elif [[ $COMPLEXITY_LEVEL =~ "L[3-4]" ]]; then
    ARCHITECTURE_PATTERN="modular"
    PLANNING_DEPTH="moderate"
elif [[ $COMPLEXITY_LEVEL =~ "L[5-6]" ]]; then
    ARCHITECTURE_PATTERN="layered"
    PLANNING_DEPTH="comprehensive"
else
    ARCHITECTURE_PATTERN="enterprise"
    PLANNING_DEPTH="exhaustive"
fi

# Component design based on technology stack
case $PROJECT_TYPE in
    "nodejs")
        COMPONENTS="frontend,backend,database,api,auth"
        ;;
    "python")
        COMPONENTS="application,services,models,database,api"
        ;;
    "java")
        COMPONENTS="controllers,services,repositories,entities,config"
        ;;
    *)
        COMPONENTS="presentation,business,data,integration"
        ;;
esac
```

### 3. Implementation Strategy Design
```bash
# Development approach planning
echo "⚡ Designing implementation strategy..."

# Agile planning with constitutional principles
DEVELOPMENT_PHASES=(
    "foundation_setup"
    "core_implementation"  
    "feature_development"
    "integration_testing"
    "optimization_deployment"
)

# Resource and timeline estimation
case $COMPLEXITY_LEVEL in
    "L1-L2")
        ESTIMATED_TIMELINE="1-2 weeks"
        TEAM_SIZE="1-2 developers"
        ;;
    "L3-L4")
        ESTIMATED_TIMELINE="2-4 weeks"
        TEAM_SIZE="2-3 developers"
        ;;
    "L5-L6")
        ESTIMATED_TIMELINE="1-2 months"
        TEAM_SIZE="3-5 developers"
        ;;
    "L7-L8")
        ESTIMATED_TIMELINE="2-3 months"
        TEAM_SIZE="5-8 developers"
        ;;
    "L9-L10")
        ESTIMATED_TIMELINE="3+ months"
        TEAM_SIZE="8+ developers"
        ;;
esac
```

## MCP Integration for Planning

### Sequential Thinking (Mandatory L4+)
```yaml
systematic_planning:
  - "Constitutional analysis of planning decisions"
  - "Multi-perspective implementation strategy"
  - "Risk assessment and mitigation planning"
  - "Resource optimization analysis"
  - "Quality gate definition and validation"
  
planning_complexity:
  L4_moderate: "Basic sequential analysis for planning decisions"
  L5_L6_comprehensive: "Deep systematic planning with alternatives"
  L7_L10_enterprise: "Exhaustive planning with enterprise considerations"
```

### Context7 Integration
```yaml
architecture_research:
  - "Framework-specific architecture patterns"
  - "Best practice implementation guides"
  - "Configuration and setup documentation"
  - "Testing and deployment guidelines"
  
validation_sources:
  - "Official architecture recommendations"
  - "Framework design patterns"
  - "Performance optimization guides"
  - "Security implementation patterns"
```

### Desktop Commander Operations
```yaml
planning_artifacts:
  - "Create planning directory structure"
  - "Generate architecture diagrams (markdown)"
  - "Create implementation checklists"
  - "Setup project configuration templates"
  - "Generate documentation templates"
```

## Planning Domains

### Frontend Planning
```yaml
frontend_architecture:
  component_design:
    - "Component hierarchy and relationships"
    - "State management strategy"
    - "Routing and navigation structure"
    - "UI/UX design system integration"
    
  technical_planning:
    - "Build tool configuration"
    - "Testing strategy (unit, integration, e2e)"
    - "Performance optimization approach"
    - "Accessibility compliance planning"
```

### Backend Planning
```yaml
backend_architecture:
  service_design:
    - "API design and documentation"
    - "Database schema and relationships"
    - "Authentication and authorization"
    - "Business logic organization"
    
  technical_planning:
    - "Framework setup and configuration"
    - "Database migration strategy"
    - "Caching and performance optimization"
    - "Monitoring and logging setup"
```

### Full-Stack Planning
```yaml
integration_planning:
  data_flow:
    - "Frontend-backend communication"
    - "API contract definition"
    - "State synchronization strategy"
    - "Error handling and recovery"
    
  deployment_planning:
    - "Environment configuration"
    - "CI/CD pipeline design"
    - "Monitoring and alerting setup"
    - "Backup and recovery procedures"
```

## Quality Planning Framework

### Progressive Quality Gates
```yaml
l1_l2_quality_planning:
  standards:
    - "Basic code quality (linting, formatting)"
    - "Essential testing (unit tests for core functions)"
    - "Simple deployment process"
  target: "≥9.0/10 quality with basic validation"
  
l3_l4_quality_planning:
  standards:
    - "Enhanced code quality (strict linting, type checking)"
    - "Comprehensive testing (unit, integration)"
    - "Automated deployment with basic monitoring"
  target: "≥9.2/10 quality with enhanced validation"
  
l5_l6_quality_planning:
  standards:
    - "Advanced code quality (complex analysis, documentation)"
    - "Full testing suite (unit, integration, e2e, performance)"
    - "Advanced deployment with comprehensive monitoring"
  target: "≥9.5/10 quality with comprehensive validation"
  
l7_l10_quality_planning:
  standards:
    - "Enterprise code quality (security audit, compliance)"
    - "Production-grade testing (all types + chaos engineering)"
    - "Enterprise deployment (blue-green, canary, rollback)"
  target: "≥9.7/10 quality with enterprise validation"
```

### Security Planning
```yaml
security_framework:
  authentication_planning:
    - "User authentication strategy"
    - "Session management approach"
    - "Multi-factor authentication (if required)"
    - "OAuth/SSO integration planning"
    
  authorization_planning:
    - "Role-based access control design"
    - "Permission management system"
    - "API security and rate limiting"
    - "Data access control mechanisms"
    
  data_protection_planning:
    - "Encryption strategy (at rest, in transit)"
    - "Sensitive data handling procedures"
    - "Privacy compliance (GDPR, CCPA, etc.)"
    - "Audit logging and monitoring"
```

## Risk Management Planning

### Risk Assessment Matrix
```yaml
risk_categories:
  technical_risks:
    - "Technology adoption challenges"
    - "Integration complexity issues"
    - "Performance bottlenecks"
    - "Scalability limitations"
    
  project_risks:
    - "Timeline and resource constraints"
    - "Skill gap and learning curve"
    - "Dependency management issues"
    - "Quality gate failures"
    
  business_risks:
    - "Requirement changes and scope creep"
    - "Market and competitive pressures"
    - "Compliance and regulatory changes"
    - "Budget and resource availability"
```

### Mitigation Strategies
```yaml
risk_mitigation:
  prevention:
    - "Proactive risk identification and assessment"
    - "Conservative estimation and buffer planning"
    - "Skills development and training planning"
    - "Technology evaluation and validation"
    
  contingency:
    - "Alternative implementation approaches"
    - "Backup technology options"
    - "Resource reallocation strategies"
    - "Timeline adjustment procedures"
    
  monitoring:
    - "Early warning indicators and metrics"
    - "Regular checkpoint and review processes"
    - "Continuous risk assessment updates"
    - "Escalation and response procedures"
```

## Deliverables

### 1. Comprehensive Implementation Plan
```markdown
# Implementation Plan

## Executive Summary
- **Project Overview**: [Brief description and objectives]
- **Complexity Assessment**: [L1-L10 with justification]
- **Implementation Strategy**: [Approach and methodology]
- **Timeline Estimate**: [Phases and milestones]
- **Resource Requirements**: [Team, tools, budget]

## Architecture Design
### System Architecture
- **Overall Pattern**: [Monolith/Microservices/Serverless/Hybrid]
- **Component Structure**: [Major components and relationships]
- **Data Flow**: [Information flow between components]
- **Integration Points**: [External systems and APIs]

### Technology Stack
- **Frontend**: [Framework, libraries, tools]
- **Backend**: [Language, framework, database]
- **Infrastructure**: [Hosting, CI/CD, monitoring]
- **Development Tools**: [IDE, testing, debugging]

## Implementation Strategy
### Development Phases
1. **Foundation Setup** (X days)
   - Environment setup and configuration
   - Project structure and tooling
   - Basic architecture implementation
   
2. **Core Implementation** (X days)
   - Essential features and functionality
   - Database setup and initial data
   - Authentication and basic security
   
3. **Feature Development** (X days)
   - Primary feature implementation
   - API development and integration
   - User interface development
   
4. **Integration & Testing** (X days)
   - System integration testing
   - Performance testing and optimization
   - Security testing and validation
   
5. **Deployment & Optimization** (X days)
   - Production deployment setup
   - Monitoring and alerting configuration
   - Performance optimization and tuning

### Quality Assurance Plan
- **Code Quality Standards**: [Linting, formatting, review process]
- **Testing Strategy**: [Unit, integration, e2e, performance]
- **Security Validation**: [Authentication, authorization, data protection]
- **Performance Benchmarks**: [Response time, throughput, scalability]
```

### 2. Architecture Documentation
```yaml
architecture_artifacts:
  system_diagram: "High-level system architecture visualization"
  component_diagram: "Detailed component relationships and interfaces"
  data_flow_diagram: "Data flow and processing visualization"
  deployment_diagram: "Infrastructure and deployment architecture"
  
documentation_templates:
  api_specification: "OpenAPI/Swagger documentation template"
  database_schema: "Database design and relationship documentation"
  configuration_guide: "Environment and deployment configuration"
  testing_strategy: "Comprehensive testing approach and procedures"
```

### 3. Resource Allocation Plan
```yaml
team_structure:
  roles_and_responsibilities:
    - "Technical lead / architect"
    - "Frontend developers"
    - "Backend developers"
    - "QA / testing specialists"
    - "DevOps / infrastructure"
    
  skill_requirements:
    - "Required technical skills and experience"
    - "Training and development needs"
    - "External consultant or contractor needs"
    - "Knowledge transfer and documentation"
    
timeline_and_milestones:
  project_phases:
    - "Phase objectives and deliverables"
    - "Timeline estimates and dependencies"
    - "Milestone criteria and validation"
    - "Risk mitigation and contingency plans"
```

## Bilingual Support

### Portuguese Planning Commands
- **`/planejar`** - Planejamento abrangente de implementação
- **`/arquitetar`** - Design de arquitetura de sistema
- **`/estratégia`** - Estratégia de desenvolvimento e implementação
- **`/cronograma`** - Planejamento de cronograma e recursos

### English Planning Commands
- **`/plan`** - Comprehensive implementation planning
- **`/architect`** - System architecture design
- **`/strategy`** - Development and implementation strategy
- **`/timeline`** - Timeline and resource planning

## Success Metrics

### Planning Quality Indicators
- **Completeness**: ≥95% coverage of all planning aspects
- **Feasibility**: Realistic timeline and resource estimates
- **Risk Management**: Comprehensive risk identification and mitigation
- **Quality Integration**: Quality standards properly integrated
- **Stakeholder Alignment**: All perspectives considered and balanced

### Constitutional Validation
- **Multi-perspective Analysis**: All stakeholder viewpoints incorporated
- **Principle Alignment**: All decisions aligned with constitutional principles
- **Risk Assessment**: Comprehensive risk analysis and mitigation
- **Quality Framework**: Progressive quality standards established
- **Implementation Readiness**: Clear and actionable implementation guidance

## Integration Points

### Workflow Continuity
- **Research Integration**: Builds on research findings and recommendations
- **Coordination Preparation**: Provides clear inputs for coordination phase
- **Quality Preservation**: Planning quality standards maintained throughout
- **Context Enhancement**: Enriches project context with detailed planning

### Intelligence System
- **Constitutional AI**: Applied throughout planning decisions
- **Sequential Thinking**: Used for complex planning analysis
- **Quality Gates**: Progressive planning quality validation
- **Pattern Learning**: Planning effectiveness patterns captured

---

## Ready for Planning

Constitutional planning system activated. The planning phase will:

✅ **Apply constitutional AI framework** for multi-perspective planning analysis  
✅ **Design system architecture** appropriate for project complexity and requirements  
✅ **Create implementation strategy** with realistic timelines and resource allocation  
✅ **Establish quality framework** with progressive standards and validation gates  
✅ **Assess and mitigate risks** through comprehensive risk management planning  
✅ **Prepare coordination inputs** with clear roles, responsibilities, and workflows  

**Usage**: Type `/plan` or `/planejar` to begin comprehensive planning, or let the system auto-activate after research phase completion for L3+ complexity projects.

The planning phase ensures every implementation has a solid foundation with constitutional principles, quality standards, and comprehensive strategy for optimal project success.