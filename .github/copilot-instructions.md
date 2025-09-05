---
applyTo: "**/*"
---

# Development Workflow

> **🤖 AI Instructions:** This is the mandatory step-by-step process you MUST follow when developing features, unless the user explicitly requests to skip specific steps. Always follow this workflow systematically.

# MANDATORY EXECUTION RULES ALWAYS READ AND LOAD References

- **🌟 Always Read the Complete Workflow**: [`docs/AGENTS.md`](../docs/AGENTS.md)
- **⚙️ Always Read the Project Memory**: [`docs/memory.md`](../docs/memory.md)
- **📚 Always Read the @source-tree**: [docs/architecture/source-tree.md](../docs/architecture/source-tree.md)
  - One‑line: Real monorepo structure (apps/packages) validated and categorized
  - Use when: Locating code, packages, or wiring across the repo
- **RIGHT TOOL FOR JOB**: Understand full context before implementation. Choose appropriate technology and mcp tools. Plan carefully, implement systematically.
- **MANDATORY** Use do gerenciador de tasks nativo do augment de forma mais ativa para acompanhar tudo o que precisa ser feito, criando atomic tasks para executar tudo o que foi solicitado em fases
- **MANDATORY** use of `serena mcp` to search codebase and semantic code analysis, _DO NOT USE NATIVE SEARCH CODEBASE tool_
- **MANDATORY** use of `supabase mcp` for database operations
- **MANDATORY** use of `shadcn-ui mcp` to manage ui components
- **MANDATORY** use of `archon mcp` for task and knowledge management
- **MANDATORY** use of `desktop-commander mcp` for file and terminal operations and system management
- **MANDATORY** invoke `sequential-thinking` first and then the `think` native tool before any other action; under ULTRATHINK, always use `think` to produce a 5‑step breakdown of next steps/strategies to clarify order and purpose.
- **MANDATORY** use of `tavily mcp` for real-time information, current trends, and technology updates, _DO NOT USE NATIVE SEARCH tool_
- **MANDATORY** use of `context7 mcp` for deep contextual understanding and analysis, _DO NOT USE NATIVE CONTEXT tool_
- **NO INTERRUPTIONS**: Continue through ALL steps until problem fully solved.
- **MANDATORY FIRST STEP**: Always begin with sequential-thinking tool.
- **ONLY TERMINATE WHEN**: User query COMPLETELY resolved and Problem 100% solved.
- **CRITICAL:This project uses Archon for knowledge management, task tracking, and project organization.**
- Project uses A.P.T.E methodology (Analyze → Plan → Think → Execute) with quality standard ≥9.5/10, prefers Bun over npm for 3-5x performance improvements, and requires phased migration approach with rollback strategies.
- User prefers comprehensive backend database architecture audits following a 4-phase structured approach: Architecture Analysis → Backend Integration Audit → Archon Project Creation → Task Execution, with mandatory use of serena mcp for codebase analysis, supabase mcp for database operations, and archon mcp for project management, following sequential-thinking → research → plan → implement → validate workflow.

## Pre-Development Guidelines

**📚 Documentation Consultation:**
⚠️ **IMPORTANT**: Only consult documentation when you have specific questions or uncertainties. Avoid loading unnecessary context.

When you have ANY doubt during development:

- First consult the `/docs` folder for relevant documentation
- Check `docs/architecture/AGENTS.md` for architectural decisions
- Look at `docs/apis/AGENTS.md` for API patterns
- Check `docs/database-schema/AGENTS.md` for data structure
- Consult specific guides in `docs/rules/coding-standards.md` for coding standards, best practices, and design patterns

## 🤖 APEX AGENT COORDINATION SYSTEM

**🎯 Filosofia de Coordenação**: _"Agentes especializados com coordenação inteligente"_
**🌟 Complete Workflow**: [`docs/agents/AGENTS.md`](../docs/agents/AGENTS.md)

## 🎯 CORE PRINCIPLES & MISSION

```yaml
CORE_STANDARDS:
  mantra: "Think → Research → Decompose → Plan → Implement → Validate"
  mission: "Research first, think systematically, implement flawlessly with cognitive intelligence"
  research_driven: "Multi-source validation for all complex implementations"
  research_excellence: "Context7 → Tavily → Archon → Sequential Thinking chain"
  agent_coordination: "Intelligent APEX routing with apex-dev as central coordinator"
  cognitive_authority: "Automated thinking activation with complexity-based routing"
  vibecoder_integration: "Constitutional excellence with one-shot resolution philosophy"
  core_principle: "Simple systems that work over complex systems that don't"
  archon_first_rule: "MANDATORY Archon MCP integration for all task management"
  mandatory_execution_rules:
    right_tool_for_job: "Understand full context before implementation and choose the right mcp and agent for the job"
    serena_mcp: "MANDATORY use of serena mcp to search codebase, *DO NOT USE* `NATIVE SEARCH CODEBASE`"
    serena_mcp_integration: "MANDATORY use of serena mcp for semantic code analysis"
    supabase_integration: "MANDATORY use of supabase mcp for database operations"
    shadcn-ui_integration: "MANDATORY use of shadcn-ui mcp to manage ui components"
    no_interruptions: "Continue through ALL steps until problem fully solved"
    mandatory_first_step: "Always begin with sequential-thinking tool"
    only_terminate_when: "User query COMPLETELY resolved and Problem 100% solved"
    complete_execution: "Execute entire workflow without interruption"
WORKFLOW_MANAGEMENT_PRINCIPLES:
  preserve_context: "Maintain complete context across all agent and thinking transitions"
  incremental_excellence: "Build quality progressively through workflow phases with cognitive enhancement"
  pattern_optimization: "Learn from successful workflows and apply cognitive improvements"
  scalable_coordination: "Scale from single-agent to multi-agent based on complexity requirements"
  adaptive_routing: "Dynamic agent and thinking selection based on task requirements and domain"
  quality_consistency: "Maintain consistent progressive standards across all agents and thinking levels"
  recovery_protocols: "Comprehensive error handling with mcp research and multiple errors fail and cognitive recovery procedures"
```

## 🧠 META-COGNITIVE & CONSTITUTIONAL FRAMEWORK

```yaml
COGNITIVE_ARCHITECTURE:
  meta_cognition: "Think about the thinking process, identify biases, apply constitutional analysis"
  multi_perspective_analysis:
    - "user_perspective: Understanding user intent and constraints"
    - "developer_perspective: Technical implementation and architecture considerations"
    - "business_perspective: Cost, timeline, and stakeholder impact analysis"
    - "security_perspective: Risk assessment and compliance requirements"
    - "quality_perspective: Standards enforcement and continuous improvement"

VIBECODER_ENGINEERING_PRINCIPLES:
  kiss_principle:
    definition: "Keep It Simple, Stupid - Simplicity is key"
    core_rules: [
      "Choose simplest solution that meets requirements",
      "Prefer readable code over clever optimizations",
      "Reduce cognitive load",
      "Does this solve the core problem without unnecessary complexity?",
      "Use clear, descriptive naming and avoid Over-Engineering",
    ]

  yagni_principle:
    definition: "You Aren't Gonna Need It - Don't implement until needed"
    core_rules: [
      "Build only what current requirements specify",
      "Resist 'just in case' features",
      "Refactor when requirements emerge",
      "Focus on current user stories",
      "Remove unused code immediately",
    ]

  chain_of_thought:
    definition: "Explicit step-by-step reasoning for accuracy"
    core_rules: [
      "Break problems into sequential steps",
      "Verbalize reasoning process",
      "Show intermediate decisions",
      "Question assumptions",
      "Validate against requirements",
      "Each step follows logically from previous steps",
      "Final solution traced back to requirements",
    ]

CONSTITUTIONAL_PRINCIPLES:
  principle_based_design: "Align with software engineering excellence"
  constraint_satisfaction: "Balance competing requirements optimally"
  risk_assessment: "Multi-dimensional risk analysis"
  quality_gates: "Define success criteria and validation checkpoints"
  continuous_improvement: "Iterate based on feedback and metrics"
  relentless_persistence: "Continue until absolute completion"
  complete_execution: "Execute entire workflow without interruption"
  right_tool_selection: "Understand full context before implementation"
```

## 🔧 MCP TOOL INTEGRATION

### **⚡ Mandatory Sequence**

1. **🧠 sequential-thinking** (FIRST STEP)
2. **📋 archon** (task management)
3. **🔍 serena** (codebase - NEVER native)

### **🎯 Contextual MCPs**

- **💻 desktop-commander** - Files/system
- **📚 context7** - Documentation
- **🌐 tavily** - Real-time info
- **🎨 shadcn-ui** - UI components

### **🚨 Critical Rules**

- NEVER skip mandatory sequence
- NEVER use native codebase-retrieval
- IF STUCK >3x: reassess with sequential-thinking

## Mandatory Development Steps

### 1. **Research & Decomposition** 🧠

**🔧 MCP**: sequential-thinking → archon → serena

- **MANDATORY**: Start with `sequential-thinking` to analyze requirements
- Use `archon` to check project context and create/update tasks
- Use `serena` (NEVER native) to understand current codebase
- Break down feature into smaller components
- Identify complexities, dependencies, and constraints
- **Complexity ≥7**: Add context7 → tavily
- **Stuck >3x**: See MCP Error Recovery (mcp-coordination.md)

**🔬 Ativação Automática do @apex-researcher**:

- Implementações técnicas complexas
- Integração de novos frameworks/bibliotecas
- Requisitos de segurança/compliance
- Necessidades de otimização de performance
- Decisões arquiteturais
- Regulamentações específicas de saúde (HIPAA, LGPD)

**Comando de Ativação APEX**:

```bash
@apex-researcher "pesquisar [tecnologia/padrão/regulamentação]"
```

- Follow the Research Execution Framework below

```yaml
RESEARCH_EXECUTION_FRAMEWORK:
  vibecoder_integration: "Think & Analyze - ALWAYS before any action - NO EXCEPTIONS"
  primary_tool: "sequential-thinking + native think tool (MANDATORY FIRST STEP)"
  purpose: "Comprehensive requirement analysis with context understanding and complexity assessment"
  intelligence: "Dynamic complexity scoring (L1-L10) with automatic cognitive and agent routing"
  thinking_activation: "Auto-scaled based on complexity detection and domain triggers"
  routing: "Intelligent MCP selection based on complexity, domain, and requirements analysis"
  agent_coordination: "Sequential thinking primary, potential apex_researcher_agent for complex analysis"
  process:
    - "Understand requirements completely with constitutional analysis"
    - "Identify constraints and dependencies with multi-perspective evaluation"
    - "Assess complexity level (1-10) with domain-specific triggers"
    - "Define strategic approach with agent coordination planning"
    - "Break down into manageable components with quality gate definition"
  deliverables: "Complete requirements with execution plan, cognitive activation, and agent assignments"
  purpose: "Knowledge acquisition and validation for informed implementation with multi-source validation"
  intelligence: "Multi-source research orchestration with authority validation and cross-referencing"
  routing: "Context7 → Tavily → Archon → Exa chain for complexity, with sequential thinking integration"
  quality_gate: "100% requirement clarity with multi-source validation and constitutional compliance"
```

### 2. **Planning & Task List** 📋

**🔧 MCP**: archon + serena

- **MANDATORY**: Use `archon` for task management (create_task, update_task, list_tasks)
- Create detailed task list using archon's system
- Break down features: atomic tasks on archon, subtasks on native todos
- Use `serena` to analyze codebase complexity and dependencies
- Mark tasks as in_progress when starting, completed when finished
- **Follow:** [`docs/AGENTS.md`](../docs/AGENTS.md)

**🎯 Ativação de Agentes APEX por Contexto**:

```bash
# Planejamento Técnico
@apex-dev "planejar implementação de [feature]"

# Planejamento de UI/UX
@apex-ui-ux-designer "projetar interface para [funcionalidade]"

# Planejamento com Pesquisa
@apex-dev,apex-researcher "pesquisar e planejar sistema de [funcionalidade complexa]"
```

- Follow the Planning & Design Framework below

```yaml
phase_3_planning_design:
  vibecoder_integration: "Context Engineering & Planning with ONE-SHOT template methodology"
  contextual_loading: "UI/UX agent loaded automatically when design tasks detected"
  purpose: "Solution architecture and strategic implementation planning with systematic design approach"
  intelligence: "Risk assessment with comprehensive mitigation strategies and architectural validation"
  routing: "Sequential Thinking integration with architectural pattern analysis and validation"
  one_shot_template:
    role: "[Specific: Frontend Developer | Backend Engineer | Full-Stack | UI/UX Designer]"
    context: "#workspace + #codebase search with serena mcp + [archon knowledge base + relevant files]"
    task: "[Specific, measurable, actionable requirement]"
    constraints: "[Technical limitations, performance requirements]"
    output: "[Code | Documentation | Architecture | Analysis | Design]"
    success_criteria: "[Measurable outcomes, quality thresholds]"
  task_planning:
    structure:
      - "Break down into atomic executable tasks with agent assignment"
      - "Assign optimal tools and agents for each task with specialization matching"
      - "Define validation checkpoints with quality gates"
      - "Create dependency mapping with agent coordination requirements"
      - "Set measurable success criteria with progressive quality standards"
  deliverables: "Detailed execution plan with quality gates, agent coordination, and architectural specifications"
  quality_gate: "Architecture review ≥9.5/10 with scalability validation and security compliance"
```

### 3. **TEST DRIVEN Implementation**

- **MANDATORY**: Follow the process as described in `docs/AGENTS.md`
- **TEST DRIVEN Cycle for each feature component:**
  1. **RED**: Write failing test first (describe expected behavior)
  2. **GREEN**: Write minimal code to pass the test
  3. **REFACTOR**: Improve code while keeping tests green
  4. **REPEAT**: Continue cycle for next requirement
  - 🔥 **CRITICAL**: Business logic, AI agents, APIs, financial operations
  - ⚡ **IMPORTANT**: Complex hooks, utilities, data validation, integrations
  - ✅ **USEFUL**: UI components with logic, helpers

- **Implementation Guidelines:**
  - **🔧 MCP**: serena → desktop-commander (+shadcn-ui for UI)
  - Use `serena` for codebase analysis (get_symbols_overview → find_symbol)
  - Use `desktop-commander` for file operations (chunked 25-30 lines max)
  - Use `shadcn-ui` to check component availability before custom development
  - Follow established code patterns, naming conventions, and project standards
  - **Stuck >3x**: Use sequential-thinking to reassess
  - Use `think` tool every 5 steps for alignment with requirements
  - Implement comprehensive error handling following project patterns
  - **Test Categories**: Success cases, error cases, edge cases, business logic
  - **Documentation First**: Check existing patterns with `serena`

### 4. **Test Execution & Validation** ✅

**🔧 MCP**: desktop-commander + serena

- Use `desktop-commander` to run all test commands
- Run `bun oxlint apps packages --fix` for linter issues
- Run `bun format && bun lint:fix && bun type-check` to format code
- Run `bun test` and all task tests
- **Correction Loop**: If tests fail:
  - Use `serena` to analyze failing code and dependencies
  - Fix issues following TDD principles
  - **Stuck >3x**: Use sequential-thinking to reassess
  - Repeat until ALL tests pass
- **Coverage Requirements** (from ttd-flow.md):
  - Critical business logic: 100%
  - AI agents/services: 90%+
  - Complex hooks: 85%+
  - Utilities/validators: 80%+
- Use `archon` to document test results and coverage metrics
- Only proceed when all tests green and coverage meets requirements
- Run `run tasks:test` to execute all task tests

### 5. **Code Quality Check** 🔍

**🔧 MCP**: desktop-commander + serena

- Use `desktop-commander` to run quality check commands
- Run `bun next lint` for linting issues
- Run `bun tsc --noEmit` to verify TypeScript compilation
- Use `serena` to analyze code quality and identify issues
- Fix any errors or warnings before proceeding
- **Correction Loop**: If issues found:
  - Use `serena` to understand code structure and dependencies
  - Fix issues using `desktop-commander` for file operations
  - **Stuck >3x**: Use sequential-thinking to reassess
  - Return to **Step 4** and repeat cycle
  - Continue until ALL quality checks pass

```yaml
validation:
  vibecoder_integration: "Quality Validation & Testing with constitutional enforcement gates"
  architecture_analysis: "Always check architecture docs for best practices validation"
  technology_excellence: "Framework best practices compliance and performance optimization"
  qa_mandatory:
    post_modification_checks:
      - "Syntax errors verification with zero tolerance policy"
      - "Duplicates/orphans detection with cleanup protocols"
      - "Feature validation against requirements with completeness verification"
      - "Requirements compliance with constitutional principles validation"
      - "Security vulnerabilities assessment with compliance verification"
      - "Test coverage ≥90% with comprehensive testing protocols"
  verification_rule: "Never assume changes complete without explicit verification"
```

### 6. **Memory Documentation Protocol** 📝

**🔧 MCP**: desktop-commander + archon

- **MANDATORY**: Follow Proactive Update Protocol from `docs/memory.md`:
  - Use `desktop-commander` to create documentation files (chunked)
  - Use `archon` to create/update project documents and knowledge base
  - Create `mistakes/[error-category].md` if mistakes corrected
  - Create `features/[feature-name].md` for new features or modified behavior
- **Test Documentation**: Document new test patterns, mocks, utilities
- Store learnings in archon knowledge base for future retrieval

### 10. **Documentation Folder Updates** 📚

**🔧 MCP**: serena + desktop-commander

- Use `serena` to analyze code changes and identify documentation impact
- **Evaluate and Suggest**: Assess if documentation folders need updates:
  - Application flows (`docs/architecture/aesthetic-platform-flows.md`) - if user flows modified
  - API documentation (`docs/apis/`) - if endpoints created/modified
  - Database schemas (`docs/database-schema/`) - if structure changed
  - Any other relevant documentation folders
- Use `desktop-commander` to create/update documentation files
- Use `archon` to store documentation updates in knowledge base
- **Suggest to User**: Recommend specific updates and ask user to review

### 11. **Out-of-Scope Documentation**

- **🔄 Ativação do @apex-researcher**: Para documentação não coberta por protocolos existentes

```bash
@apex-researcher "criar documentação para [conceito/padrão/integração]"
```

- Use o agente apex-researcher para criar documentação abrangente para:
  - Novos conceitos ou padrões introduzidos
  - Decisões arquiteturais complexas
  - Guias de integração ou tutoriais
  - Qualquer documentação fora dos protocolos padrão de memória e pastas

## Important Notes

- **🚫 Never skip steps** unless explicitly told by the user
- **🔧 Always follow MCP Mandatory Sequence**: sequential-thinking → archon → serena (NEVER native codebase-retrieval)
- **📖 Always consult `/docs`** when uncertain, using `desktop-commander` for file operations
- **✅ Complete each step** before moving to the next, using appropriate MCPs for each phase
- **🔄 Iterate** until all quality checks pass
- **📝 Document everything** for future reference using `archon` knowledge base
- **🚨 If stuck >3 attempts**: Use sequential-thinking to reassess and try alternatives

---