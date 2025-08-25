# Command: /coordinate | /coordenar

## Universal Description
**Phase 4: Coordination & Task Distribution** - Intelligent agent orchestration and task distribution with context preservation for any project complexity.

## Purpose
Orchestrate specialized agents and coordinate task execution based on implementation plan, ensuring optimal agent selection, seamless handoffs, and context preservation throughout the development process.

## Context Detection
- **Multi-Agent Requirements**: Complex tasks requiring specialized expertise
- **Task Distribution**: Breaking down implementation into coordinated workstreams
- **Agent Specialization**: Routing tasks to optimal agent capabilities
- **Context Management**: Preserving context across agent transitions
- **Quality Coordination**: Ensuring consistent quality standards across agents

## Auto-Activation Triggers
```yaml
bilingual_triggers:
  portuguese: ["coordenar", "orquestrar", "distribuir", "delegar", "gerenciar", "organizar"]
  english: ["coordinate", "orchestrate", "distribute", "delegate", "manage", "organize"]
  
complexity_triggers:
  - "L5+ complexity requiring multi-agent coordination"
  - "Planning phase completed with complex implementation"
  - "Multiple specialized domains identified"
  - "Parallel development streams needed"
  - "Cross-functional expertise required"
  
automatic_scenarios:
  - Implementation plan indicates multi-component development
  - Different technical domains require specialized agents
  - Complex quality gates need coordinated validation
  - Parallel development streams optimize timeline
  - Expert knowledge required across multiple areas
```

## Execution Pattern

### 1. Coordination Strategy Assessment
```bash
# Load implementation plan and analyze coordination needs
IMPLEMENTATION_PLAN=$(cat .claude/.cache/implementation-plan.md)
COMPLEXITY_LEVEL=$(cat .claude/.cache/context.tmp | grep COMPLEXITY_LEVEL)
QUALITY_TARGET=$(cat .claude/.cache/routing.tmp | grep QUALITY_TARGET)

echo "🎭 Analyzing coordination requirements..."

# Determine coordination complexity
if [[ $COMPLEXITY_LEVEL =~ "L[1-3]" ]]; then
    COORDINATION_MODE="single_agent"
    AGENT_COUNT=1
elif [[ $COMPLEXITY_LEVEL =~ "L[4-5]" ]]; then
    COORDINATION_MODE="dual_agent"
    AGENT_COUNT=2
elif [[ $COMPLEXITY_LEVEL =~ "L[6-7]" ]]; then
    COORDINATION_MODE="multi_agent"
    AGENT_COUNT=3-4
else
    COORDINATION_MODE="orchestrated"
    AGENT_COUNT=4+
fi
```

### 2. Agent Selection Matrix
```bash
# Analyze implementation plan for agent specialization needs
echo "🤖 Selecting optimal agent configuration..."

REQUIRED_SPECIALIZATIONS=()

# Detect frontend requirements
if grep -q "frontend\|ui\|react\|vue\|angular" implementation-plan.md; then
    REQUIRED_SPECIALIZATIONS+=("apex-ui-ux-designer")
fi

# Detect backend/API requirements  
if grep -q "backend\|api\|server\|database" implementation-plan.md; then
    REQUIRED_SPECIALIZATIONS+=("apex-dev")
fi

# Detect research/analysis requirements
if grep -q "research\|analysis\|evaluation\|comparison" implementation-plan.md; then
    REQUIRED_SPECIALIZATIONS+=("apex-researcher")
fi

# Detect quality/testing requirements
if grep -q "testing\|quality\|validation\|debugging" implementation-plan.md; then
    REQUIRED_SPECIALIZATIONS+=("apex-qa-debugger")
fi
```

## Agent Specialization Matrix

### Apex-Dev Agent
```yaml
specialization: "Full-stack development with architectural excellence"
optimal_for:
  - "Backend API development and database design"
  - "System architecture and integration"
  - "Framework setup and configuration"
  - "Core business logic implementation"
  - "Infrastructure and deployment setup"
  
triggers:
  english: ["implement", "develop", "build", "create", "architecture", "backend"]
  portuguese: ["implementar", "desenvolver", "construir", "criar", "arquitetura", "backend"]
  
coordination_handoff:
  receives_from: "Planning phase outputs, architecture specifications"
  provides_to: "Working implementation, technical documentation"
  context_preservation: "Technical decisions, implementation patterns"
```

### Apex-UI-UX-Designer Agent
```yaml
specialization: "Enterprise design systems with WCAG 2.1 AA+ compliance"
optimal_for:
  - "User interface design and component systems"
  - "User experience optimization and accessibility"
  - "Design system creation and maintenance"
  - "Frontend component architecture"
  - "Responsive design and mobile optimization"
  
triggers:
  english: ["design", "ui", "ux", "interface", "frontend", "components"]
  portuguese: ["design", "ui", "ux", "interface", "frontend", "componentes"]
  
coordination_handoff:
  receives_from: "User requirements, brand guidelines, technical constraints"
  provides_to: "Design specifications, component library, accessibility validation"
  context_preservation: "Design decisions, user experience patterns"
```

### Apex-Researcher Agent
```yaml
specialization: "Multi-source research with Context7 → Tavily → Exa intelligence"
optimal_for:
  - "Technology evaluation and comparison"
  - "Best practice research and validation"
  - "Performance optimization research"
  - "Security and compliance research"
  - "Solution architecture research"
  
triggers:
  english: ["research", "analyze", "investigate", "evaluate", "compare"]
  portuguese: ["pesquisar", "analisar", "investigar", "avaliar", "comparar"]
  
coordination_handoff:
  receives_from: "Research requirements, technology constraints"
  provides_to: "Research findings, recommendations, implementation guidance"
  context_preservation: "Research insights, decision rationale"
```

### Apex-QA-Debugger Agent
```yaml
specialization: "Advanced debugging and comprehensive quality assurance"
optimal_for:
  - "Quality gate validation and enforcement"
  - "Testing strategy development and execution"
  - "Debugging and issue resolution"
  - "Performance testing and optimization"
  - "Security testing and vulnerability assessment"
  
triggers:
  english: ["debug", "test", "validate", "quality", "review", "troubleshoot"]
  portuguese: ["debugar", "testar", "validar", "qualidade", "revisar", "solucionar"]
  
coordination_handoff:
  receives_from: "Implementation artifacts, quality requirements"
  provides_to: "Quality validation reports, testing results, issue resolutions"
  context_preservation: "Quality metrics, testing patterns, issue history"
```

## Coordination Modes

### Single Agent Mode (L1-L3)
```yaml
coordination_strategy: "Direct execution with single specialized agent"
agent_selection: "Best fit for primary project requirements"
context_management: "Simple context preservation within single agent"
quality_gates: "Integrated quality validation within agent execution"

workflow:
  1. "Analyze implementation plan for primary specialization need"
  2. "Select optimal agent based on project requirements"
  3. "Provide complete context and implementation plan"
  4. "Monitor execution and quality gates"
  5. "Capture results and prepare for validation phase"
```

### Dual Agent Mode (L4-L5)
```yaml
coordination_strategy: "Sequential agent execution with optimized handoffs"
agent_selection: "Two complementary specializations"
context_management: "Structured context handoffs between agents"
quality_gates: "Coordinated quality validation across agents"

workflow:
  1. "Select primary and secondary agents based on plan analysis"
  2. "Execute primary agent with implementation plan context"
  3. "Prepare handoff package with context and deliverables"
  4. "Execute secondary agent with enhanced context"
  5. "Integrate deliverables and validate quality gates"
```

### Multi-Agent Mode (L6-L7)
```yaml
coordination_strategy: "Parallel and sequential execution with orchestration"
agent_selection: "3-4 specialized agents with coordinated workflows"
context_management: "Comprehensive context synchronization"
quality_gates: "Distributed quality validation with integration points"

workflow:
  1. "Analyze implementation plan for all required specializations"
  2. "Create agent execution sequence and dependency mapping"
  3. "Execute parallel-capable agents with synchronized context"
  4. "Manage sequential handoffs with context preservation"
  5. "Integrate all deliverables with quality validation"
```

### Orchestrated Mode (L8-L10)
```yaml
coordination_strategy: "Full orchestration with dynamic agent coordination"
agent_selection: "4+ agents with real-time coordination"
context_management: "Enterprise-grade context management"
quality_gates: "Enterprise quality orchestration across all agents"

workflow:
  1. "Create comprehensive agent orchestration plan"
  2. "Initialize shared context and coordination infrastructure"
  3. "Execute dynamic agent coordination with real-time handoffs"
  4. "Manage complex dependencies and context synchronization"
  5. "Integrate enterprise-grade deliverables with comprehensive validation"
```

## Context Preservation Framework

### Context Handoff Protocol
```yaml
context_package:
  technical_context:
    - "Implementation decisions and rationale"
    - "Architecture patterns and constraints"
    - "Technology stack and configuration"
    - "Performance and security requirements"
    
  quality_context:
    - "Quality standards and targets"
    - "Testing requirements and strategies"
    - "Validation criteria and acceptance"
    - "Performance benchmarks and metrics"
    
  business_context:
    - "User requirements and use cases"
    - "Business constraints and priorities"
    - "Timeline and resource considerations"
    - "Risk factors and mitigation strategies"
```

### Coordination State Management
```bash
# Create coordination workspace
COORDINATION_DIR=".claude/.cache/coordination"
mkdir -p "$COORDINATION_DIR"

# Initialize coordination state
echo "Creating coordination state management..."
cat > "$COORDINATION_DIR/coordination-state.json" << EOF
{
  "coordination_id": "$(uuidgen | cut -c1-8)",
  "mode": "$COORDINATION_MODE",
  "agents": [],
  "active_agent": null,
  "context_version": 1,
  "handoff_history": [],
  "quality_gates": [],
  "status": "initialized"
}
EOF
```

## Quality Coordination

### Progressive Quality Standards
```yaml
quality_orchestration:
  l1_l3_single_agent:
    standards: "≥9.0/10 with integrated validation"
    gates: "Single agent quality responsibility"
    validation: "Streamlined validation within agent"
    
  l4_l5_dual_agent:
    standards: "≥9.2/10 with coordinated validation"
    gates: "Shared quality responsibility with handoff validation"
    validation: "Coordinated validation across agents"
    
  l6_l7_multi_agent:
    standards: "≥9.5/10 with comprehensive coordination"
    gates: "Distributed quality gates with integration validation"
    validation: "Multi-agent quality orchestration"
    
  l8_l10_orchestrated:
    standards: "≥9.7/10 with enterprise coordination"
    gates: "Enterprise quality orchestration"
    validation: "Full lifecycle quality management"
```

### Coordination Quality Gates
```yaml
handoff_validation:
  context_integrity: "Complete context preservation validation"
  deliverable_quality: "Agent deliverable quality validation"
  integration_readiness: "Integration compatibility validation"
  performance_standards: "Performance requirement compliance"
  
coordination_metrics:
  handoff_success_rate: "≥95% successful agent handoffs"
  context_preservation: "≥98% context integrity maintenance"
  quality_consistency: "Quality standards maintained across agents"
  coordination_efficiency: "Optimal agent utilization and timing"
```

## Deliverables

### 1. Coordination Execution Plan
```markdown
# Agent Coordination Plan

## Coordination Strategy
- **Mode**: [Single/Dual/Multi/Orchestrated]
- **Agent Count**: [Number and specializations]
- **Execution Sequence**: [Parallel/Sequential/Hybrid]
- **Context Management**: [Handoff protocol and preservation]

## Agent Assignment Matrix
| Specialization | Agent | Responsibilities | Dependencies |
|---------------|-------|------------------|--------------|
| Development | apex-dev | Core implementation | Planning outputs |
| Design | apex-ui-ux-designer | UI/UX design | User requirements |
| Research | apex-researcher | Technical research | Analysis needs |
| Quality | apex-qa-debugger | Quality validation | Implementation |

## Handoff Schedule
1. **Phase 1**: [Agent] - [Deliverables] - [Timeline]
2. **Phase 2**: [Agent] - [Deliverables] - [Timeline]
3. **Integration**: [Coordination] - [Validation] - [Timeline]

## Quality Coordination
- **Standards**: [Quality targets per agent]
- **Gates**: [Validation points and criteria]
- **Integration**: [Cross-agent validation approach]
```

### 2. Context Management System
```yaml
coordination_artifacts:
  context_cache: "Shared context repository for all agents"
  handoff_packages: "Structured context transfer between agents"
  quality_tracking: "Quality metrics and validation across agents"
  coordination_logs: "Complete coordination execution history"
  
integration_outputs:
  unified_deliverables: "Integrated output from all agent work"
  quality_validation: "Comprehensive quality validation results"
  execution_metrics: "Coordination efficiency and success metrics"
```

## Bilingual Support

### Portuguese Coordination Commands
- **`/coordenar`** - Coordenação completa de agentes
- **`/orquestrar`** - Orquestração avançada de múltiplos agentes
- **`/distribuir-tarefas`** - Distribuição inteligente de tarefas
- **`/gerenciar-contexto`** - Gerenciamento de contexto entre agentes

### English Coordination Commands
- **`/coordinate`** - Complete agent coordination
- **`/orchestrate`** - Advanced multi-agent orchestration
- **`/distribute-tasks`** - Intelligent task distribution
- **`/manage-context`** - Context management across agents

## Success Metrics

### Coordination Effectiveness
- **Agent Selection Accuracy**: ≥95% optimal agent assignments
- **Handoff Success Rate**: ≥95% successful agent transitions
- **Context Preservation**: ≥98% context integrity maintenance
- **Quality Consistency**: Quality standards maintained across agents
- **Coordination Efficiency**: Optimal timeline and resource utilization

### Integration Quality
- **Deliverable Integration**: Seamless integration of all agent outputs
- **Quality Validation**: Comprehensive quality validation across all work
- **Context Coherence**: Consistent context and decision rationale
- **Execution Metrics**: Coordination success and efficiency measurement

---

## Ready for Coordination

Advanced agent coordination system activated. The coordination phase will:

✅ **Analyze coordination requirements** based on implementation complexity and plan  
✅ **Select optimal agent configuration** with specialized expertise matching  
✅ **Execute intelligent handoff protocols** with complete context preservation  
✅ **Coordinate quality standards** across all agent interactions  
✅ **Integrate deliverables** into coherent, production-ready outputs  
✅ **Prepare execution inputs** with comprehensive context and coordination  

**Usage**: Type `/coordinate` or `/coordenar` to begin agent coordination, or let the system auto-activate after planning phase completion for L5+ complexity projects.

The coordination phase ensures every complex implementation has optimal agent specialization, seamless collaboration, and unified quality standards for maximum development efficiency and success.