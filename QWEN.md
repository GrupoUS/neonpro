# Development Workflow

> **🤖 AI Instructions:** This is the mandatory step-by-step process you MUST follow when developing features, unless the user explicitly requests to skip specific steps. Always follow this workflow systematically.
> **⚠️ IMPORTANT:** Execute entire workflow without interruption asking for next steps. If you unsure about any step, consult the documentation in `/docs` and do a research using `context7` and `tavily` for official docs and best practices. Dont keep asking the user to clarify or provide more info, use your tools to research and fill in the gaps and keep working until all the prompt is complete.
> **ALWAYS** Execute Tasks, tools and Agents in parallel when possible to optimize time and efficiency.

# MANDATORY EXECUTION RULES ALWAYS READ AND LOAD References

- **🌟 Always Read the Complete Workflow**: [`docs/AGENTS.md`](../docs/AGENTS.md)
- **📚 Always Read the source-tree**: [docs/architecture/source-tree.md](../docs/architecture/source-tree.md)
- **🔍 Always Read the tech-stack**: [docs/architecture/tech-stack.md](../docs/architecture/tech-stack.md)

## Pre-Development Guidelines

**📚 Documentation Consultation:**
⚠️ **IMPORTANT**: Only consult documentation when you have specific questions or uncertainties. Avoid loading unnecessary context.

When you have ANY doubt during development:

- First consult the `/docs` folder for relevant documentation
- Check `docs/architecture/AGENTS.md` for architectural decisions
- Look at `docs/apis/AGENTS.md` for API patterns
- Check `docs/database-schema/AGENTS.md` for data structure
- Consult specific guides in `docs/rules/coding-standards.md` for coding standards, best practices, and design patterns

## 🎯 CORE PRINCIPLES & MISSION

```yaml
CORE_STANDARDS:
  mantra: "Think → Research → Decompose → Plan → Implement → Validate"
  mission: "Research first, think systematically, implement flawlessly with cognitive intelligence"
  research_driven: "Multi-source validation for all complex implementations"
  research_excellence: "Context7 → Tavily → Archon → Sequential Thinking chain"
  cognitive_authority: "Automated thinking activation with complexity-based routing"
  vibecoder_integration: "Constitutional excellence with one-shot resolution philosophy"
  core_principle: "Simple systems that work over complex systems that don't"
  archon_first_rule: "MANDATORY Archon MCP integration for all task management"
  preserve_context: "Maintain complete context across all agent and thinking transitions"
  incremental_excellence: "Build quality progressively through workflow phases with cognitive enhancement"
  pattern_optimization: "Learn from successful workflows and apply cognitive improvements"
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

### **🤖 AI Agent Technologies**

**NEW: AI Agent Integration Stack**

- **CopilotKit**: Conversational AI UI and infrastructure
- **AG-UI Protocol**: Real-time agent communication protocol
- **ottomator-agents**: Backend agent logic with RAG capabilities
- **Supabase Integration**: Secure database access with RLS enforcement

**Key Integration Points**:

- AI chat interface in React/Next.js frontend
- Python-based agent backend with natural language processing
- Real-time communication via AG-UI Protocol
- Secure data access respecting Row Level Security

## Mandatory Development Steps

### 1. **Research & Decomposition** 🧠

**🔧 MCP**: sequential-thinking → archon → serena

- **MANDATORY**: Start with `sequential-thinking` to analyze requirements
- Use `archon` to check project context and create/update tasks
- Use `serena` (NEVER native) to understand current codebase
- Break down feature into smaller components
- Identify complexities, dependencies, and constraints
- **Complexity ≥7 or Stuck >3x**: consult official docs and best practices with context7 → tavily

**Proactive Update Protocol (MANDATORY FINAL STEP)**

- At the conclusion of each request, review whether updates are needed:
- Mistakes: `docs/mistakes/[error-category].md`
- Features: `docs/features/[feature-name].md`
- APIs: `docs/apis/`
- Database schema: `docs/database-schema/`
- Application flows: `docs/architecture/aesthetic-platform-flows.md`
- System architecture: `docs/architecture/AGENTS.md`
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
  routing: "Context7 → Tavily → Archon chain for complexity, with sequential thinking integration"
  quality_gate: "100% requirement clarity with multi-source validation and constitutional compliance"
```

### 2. **Planning & Task List** 📋

**🔧 MCP**: archon + serena

- **MANDATORY**: Use `archon` for task management (create_task, update_task, list_tasks)
- Create detailed task list using archon's system
- Create atomic subtasks for each feature component, with detailed descriptions of what needs to be done
- Assign tasks to appropriate agents (apex-dev, apex-ui-ux-designer, apex-researcher)
- Define success criteria and quality gates for each task
- Break down features: atomic tasks on archon, subtasks on native todos with detailed descriptions what needs to be done
- Use `serena` to analyze codebase complexity and dependencies
- Mark tasks as in_progress when starting, completed when finished
- **Follow:** [`docs/AGENTS.md`](../docs/AGENTS.md)
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
  - **Stuck >3x**: Use sequential-thinking to reassess and try alternatives
  - **Complexity ≥7**: Add context7 → tavily for deep understanding and best practices
  - Use `think` tool every 5 steps for alignment with requirements
  - Implement comprehensive error handling following project patterns
  - **Test Categories**: Success cases, error cases, edge cases, business logic
  - **Documentation First**: Check existing patterns with `serena`

### 4. **Test Execution & Validation** ✅

- Use `desktop-commander` to run all test commands
- Run `bun run lint:fix` for linter issues (or `bun run oxlint:fix`)
- Run `bun run format && bun run lint:fix && bun run type-check` to format code
- **Correction Loop**: If tests fail:
  - Use `serena` to analyze failing code and dependencies
  - Use `tavily` and `context7` for oficial docs and best practices to fix the errors
  - **Stuck >3x**: Use sequential-thinking to update strategy with new insights from research
  - Repeat until ALL tests pass
- Use `archon` to document test results and coverage metrics

### 5. **Code Quality Check** 🔍

**🔧 MCP**: desktop-commander + serena

- Use `desktop-commander` to run quality check commands
- Use `serena` to analyze code quality and identify issues
- Always look for big picture, and Fix all errors or warnings before finalizing tasks.
- Avoid loop trying to fix errors and focus on the most impactful changes, finish all tasks and return to fix errors later
- Ensure code adheres to project coding standards and best practices
- Only proceed when all tests green and coverage meets requirements
- **Correction Loop**: If issues found:
  - Use `serena` to understand code structure and dependencies
  - Fix issues using `desktop-commander` for file operations
  - **Stuck >3x**: Use sequential-thinking to reassess and try alternatives
  - Use `context7` and `tavily` for oficial docs and best practices to fix the errors
  - Return to **Step 4** and repeat cycle
  - Only Continue when ALL quality checks pass

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

- Use `archon` to create/update project documents and knowledge base
- Create `mistakes/[error-category].md` if mistakes corrected
- Create `features/[feature-name].md` for new features or modified behavior
- **Test Documentation**: Document new test patterns, mocks, utilities
- Store learnings in archon knowledge base for future retrieval
- Confirmation: Explicitly note in your thoughts whether updates were made or not.

**Specific Memory File Management**

- `docs/mistakes/[error-category].md` — Problem, wrong approach, correct solution, root cause, prevention, related files.
- `docs/features/[feature-name].md` — Overview, architecture, key components, APIs, DB schema, configuration, common issues, testing strategy, last updated.
- `docs/database-schema/*.md` — DDL/relationships/RLS changes recorded alongside migrations.
- `docs/apis/*.md` — Endpoint docs: path, method, purpose, request/response, auth, file path.

## Important Notes

- **🚫 Never skip steps** unless explicitly told by the user
- **📖 Always consult `/docs`** when uncertain, using `desktop-commander` for file operations
- **✅ Complete each step** before moving to the next, using appropriate MCPs for each phase
- **🔄 Iterate** until all quality checks pass
- **📝 Document everything** for future reference using `archon` knowledge base
- **🚨 If stuck >3 attempts**: Use sequential-thinking to reassess and try alternatives using official docs and best practices with context7 → tavily

---
