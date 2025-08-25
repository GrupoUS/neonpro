# Command: /discover | /descobrir

## Universal Description
**Phase 1: Discovery & Analysis** - Comprehensive requirement analysis with context understanding and complexity assessment for any project type.

## Purpose
Initiate intelligent project discovery through constitutional AI analysis, automatically detecting project context, assessing complexity (L1-L10), and establishing quality standards for optimal development workflow.

## Context Detection
- **Frontend Projects**: React, Vue, Angular, Next.js, Svelte
- **Backend Projects**: Node.js, Python, Java, .NET, PHP
- **Mobile Projects**: React Native, Flutter, Swift, Kotlin
- **DevOps Projects**: Docker, Kubernetes, CI/CD, Infrastructure
- **AI/ML Projects**: Python, TensorFlow, PyTorch, Data Science
- **Generic Projects**: Any technology stack or domain

## Auto-Activation Triggers
```yaml
bilingual_triggers:
  portuguese: ["descobrir", "analisar", "explorar", "investigar", "compreender", "mapear"]
  english: ["discover", "analyze", "explore", "investigate", "understand", "map"]
  
context_triggers:
  - "new project initialization"
  - "requirements gathering"
  - "project assessment"
  - "technology evaluation"
  - "complexity analysis"
  
automatic_scenarios:
  - Missing README.md or basic project structure
  - New repository without clear direction
  - Request for project analysis or evaluation
  - Technology stack assessment needs
```

## Execution Pattern

### 1. Project Context Analysis
```bash
# Auto-detect project type and framework
echo "🔍 Analyzing project structure..."

# Check for technology indicators
if package.json exists: PROJECT_TYPE="nodejs"
if requirements.txt exists: PROJECT_TYPE="python"  
if pom.xml exists: PROJECT_TYPE="java"
if Cargo.toml exists: PROJECT_TYPE="rust"
if composer.json exists: PROJECT_TYPE="php"

# Framework detection within technology stack
# Next.js, React, Vue, Express, Django, etc.
```

### 2. Complexity Assessment (L1-L10)
```bash
# Intelligent complexity scoring
COMPLEXITY_FACTORS=()

# Project size assessment
if file_count > 1000: COMPLEXITY_SCORE += 2
if dependencies > 50: COMPLEXITY_SCORE += 1
if monorepo_structure: COMPLEXITY_SCORE += 2
if microservices_indicators: COMPLEXITY_SCORE += 2

# Determine complexity level and quality targets
L1-L2 (1-3 score): Simple → Quality ≥9.0/10
L3-L4 (4-5 score): Moderate → Quality ≥9.2/10  
L5-L6 (6-7 score): Complex → Quality ≥9.5/10
L7-L8 (8-9 score): Enterprise → Quality ≥9.7/10
L9-L10 (10 score): Critical → Quality ≥9.9/10
```

### 3. Constitutional Analysis
```bash
# Multi-perspective constitutional analysis
echo "🧠 Performing constitutional analysis..."

# User perspective: End user impact and experience
# Developer perspective: Maintainability and code quality  
# Business perspective: Strategic value and ROI
# Security perspective: Risk assessment and compliance
# Performance perspective: Scalability and optimization
```

## MCP Intelligence Chain

### Context7 Integration
- **Technical Documentation**: Fetch official docs for detected technologies
- **Best Practices**: Validate against framework best practices
- **API References**: Load relevant API documentation
- **Configuration Guides**: Access setup and configuration documentation

### Desktop Commander Operations
- **Project Structure Analysis**: Deep scan of directory structure
- **File Content Analysis**: Examine key configuration files
- **Dependency Analysis**: Parse package.json, requirements.txt, etc.
- **Git Analysis**: Check repository status and history

### Sequential Thinking (L4+)
- **Systematic Analysis**: Structured thinking for complex projects
- **Multi-step Assessment**: Breaking down complex discovery process
- **Pattern Recognition**: Identifying architectural and design patterns
- **Risk Analysis**: Systematic risk assessment and mitigation planning

## Quality Gates & Standards

### Discovery Phase Quality Requirements
```yaml
completeness_gates:
  - "≥95% project structure understanding"
  - "Clear technology stack identification"
  - "Accurate complexity assessment (L1-L10)"
  - "Constitutional analysis completion"
  - "Quality standards establishment"

validation_criteria:
  - "Project context properly cached"
  - "Complexity routing configured"  
  - "Quality targets established"
  - "Workflow phase properly initialized"
  - "Next phase recommendations provided"
```

### Progressive Quality Standards
- **L1-L2 Projects**: Basic structure validation + simple quality metrics
- **L3-L4 Projects**: Enhanced analysis + moderate quality standards
- **L5-L6 Projects**: Comprehensive discovery + complex quality requirements
- **L7-L8 Projects**: Enterprise-grade analysis + advanced quality gates
- **L9-L10 Projects**: Critical analysis + maximum quality standards

## Deliverables

### 1. Project Discovery Report
```markdown
# Project Discovery Report
- **Project Type**: [nodejs/python/java/etc]
- **Framework**: [nextjs/react/django/etc]  
- **Complexity Level**: [L1-L10]
- **Quality Target**: [9.0-9.9/10]
- **Architecture Pattern**: [SPA/API/Microservices/etc]
- **Key Dependencies**: [List of major dependencies]
- **Risk Assessment**: [High/Medium/Low risks identified]
```

### 2. Context Cache Files
```bash
# Automatically generated cache files
.claude/.cache/context.tmp          # Project context
.claude/.cache/routing.tmp           # Complexity routing
.claude/.cache/discovery-report.md   # Full discovery report
.claude/.cache/workflow/current-workflow.json  # Workflow state
```

### 3. Next Phase Recommendations
```yaml
recommended_next_phase: "research"
suggested_commands:
  - "/research" - "Deep technical research and validation"
  - "/tech-stack-analysis" - "Comprehensive technology evaluation"
  - "/best-practices" - "Industry best practices research"
  
automatic_transitions:
  - "If L1-L2 complexity → Direct to planning phase"
  - "If L3+ complexity → Research phase recommended"
  - "If critical issues found → Risk assessment phase"
```

## Bilingual Support

### Portuguese Commands
- **`/descobrir`** - Comando principal de descoberta
- **`/analisar-projeto`** - Análise específica de projeto
- **`/mapear-contexto`** - Mapeamento de contexto tecnológico
- **`/avaliar-complexidade`** - Avaliação de complexidade

### English Commands  
- **`/discover`** - Main discovery command
- **`/analyze-project`** - Specific project analysis
- **`/map-context`** - Technology context mapping
- **`/assess-complexity`** - Complexity assessment

## Success Metrics

### Discovery Effectiveness
- **Context Accuracy**: ≥95% correct technology detection
- **Complexity Precision**: ≥90% accurate complexity assessment  
- **Quality Alignment**: Proper quality target establishment
- **Workflow Optimization**: Optimal next phase routing
- **Time Efficiency**: Discovery completion within complexity-appropriate timeframe

### Constitutional Validation
- **Multi-perspective Coverage**: All stakeholder perspectives analyzed
- **Risk Identification**: Comprehensive risk assessment completed
- **Quality Framework**: Progressive quality standards established
- **Principle Alignment**: All decisions aligned with constitutional principles

## Integration Points

### Workflow Engine
- **Automatic Phase Transition**: Seamless transition to research phase
- **Context Preservation**: Full context maintained across phases
- **Quality Continuity**: Quality standards carried through workflow
- **Progress Tracking**: Discovery progress tracked and reported

### Intelligence System
- **Hook Integration**: Activated by context-detector and workflow-tracker
- **Routing Optimization**: Complexity routing automatically configured
- **Cache Management**: Intelligent caching of discovery results
- **Pattern Learning**: Discovery patterns learned and optimized

---

## Ready for Discovery

Universal project discovery system activated. The discovery phase will:

✅ **Automatically detect** your project's technology stack and framework  
✅ **Assess complexity** using the L1-L10 framework with intelligent scoring  
✅ **Establish quality standards** appropriate for your project's complexity level  
✅ **Perform constitutional analysis** from multiple stakeholder perspectives  
✅ **Cache all context** for optimal workflow efficiency across phases  
✅ **Recommend next steps** based on comprehensive project analysis  

**Usage**: Simply type `/discover` or `/descobrir` to begin comprehensive project discovery, or let the intelligence system auto-activate based on project context.

The discovery phase ensures every subsequent workflow phase has the complete context and appropriate quality standards for optimal development success.