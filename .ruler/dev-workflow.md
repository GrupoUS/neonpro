# Development Workflow

> **🤖 AI Instructions:** This is the mandatory step-by-step process you MUST follow when developing features, unless the user explicitly requests to skip specific steps. Always follow this workflow systematically.

## Pre-Development Guidelines

**📚 Documentation Consultation:**
⚠️ **IMPORTANT**: Only consult documentation when you have specific questions or uncertainties. Avoid loading unnecessary context.

When you have ANY doubt during development:

- First consult the `/docs` folder for relevant documentation
- Check `docs/architecture.md` for architectural decisions
- Review `docs/tech-stack.md` for technology guidelines
- Look at `docs/apis.md` for API patterns
- Check `docs/database-schema.md` for data structure
- Consult specific guides in `/rules` or `/docs` for coding standards, best practices, and design patterns

## 🎯 CORE PRINCIPLES & MISSION
```yaml
CORE_STANDARDS:
  mantra: "Think → Research → Decompose → Plan → Implement → Validate"
  mission: "Research first, think systematically, implement flawlessly with cognitive intelligence"
  research_driven: "Multi-source validation for all complex implementations"
  research_excellence: "Context7 → Tavily → Archon → Sequential Thinking chain"
  agent_coordination: "Seamless handoffs with context preservation and quality validation"
  cognitive_authority: "Automated thinking activation with complexity-based routing"
  vibecoder_integration: "Constitutional excellence with one-shot resolution philosophy"
  core_principle: "Simple systems that work over complex systems that don't"
  archon_first_rule: "MANDATORY Archon MCP integration for all task management"
  mandatory_execution_rules:
    right_tool_for_job: "Understand full context before implementation and choose the right mcp and agent for the job"
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
    core_rules: ["Choose simplest solution that meets requirements", "Prefer readable code over clever optimizations", "Reduce cognitive load", "Does this solve the core problem without unnecessary complexity?", "Use clear, descriptive naming and avoid Over-Engineering"]

  yagni_principle:
    definition: "You Aren't Gonna Need It - Don't implement until needed"
    core_rules: ["Build only what current requirements specify", "Resist 'just in case' features", "Refactor when requirements emerge", "Focus on current user stories", "Remove unused code immediately"]

  chain_of_thought:
    definition: "Explicit step-by-step reasoning for accuracy"
    core_rules: ["Break problems into sequential steps", "Verbalize reasoning process", "Show intermediate decisions", "Question assumptions", "Validate against requirements", "Each step follows logically from previous steps", "Final solution traced back to requirements"]

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

## Mandatory Development Steps

### 1. **Research & Decomposition**

- Conduct thorough research on the feature requirements and constraints
- Decompose the feature into smaller, manageable tasks
- Identify potential complexities and dependencies
- Use the `apex-researcher` agent for multi-source intelligence gathering: [`.ruler/agents/apex-researcher.md`](../.ruler/agents/apex-researcher.md)
- Follow the Research Execution Framework below

```bash
# Triggers: research, analyze, investigate, pesquisar, analisar, planejar
ruler --agents apex-researcher
```

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

### 3. **Planning & Task List**

- Create a detailed task list using the todo tool to implement the feature
- Break down complex features into manageable subtasks
- Mark tasks as in_progress when starting, completed when finished
- Use the `apex-dev` agent for development context and task management: [`.ruler/agents/apex-dev.md`](../.ruler/agents/apex-dev.md)
- Use the `apex-ui-ux-designer` agent for UI/UX design tasks: [`.ruler/agents/apex-ui-ux-designer.md`](../.ruler/agents/apex-ui-ux-designer.md)
- **Follow the Project Context Guide:** [`docs/project.md`](docs/project.md)
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
      context: "#workspace + #codebase + [archon knowledge base + relevant files]"
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

### 3. **TDD Implementation (Red-Green-Refactor)**

- **MANDATORY**: Follow the TDD process as described in `docs/ttd-flow.md`
- **TDD Cycle for each feature component:**
  1. **RED**: Write failing test first (describe expected behavior)
  2. **GREEN**: Write minimal code to pass the test
  3. **REFACTOR**: Improve code while keeping tests green
  4. **REPEAT**: Continue cycle for next requirement

- **Test Priority (from ttd-flow.md):**
  - 🔥 **CRITICAL**: Business logic, AI agents, APIs, financial operations
  - ⚡ **IMPORTANT**: Complex hooks, utilities, data validation, integrations
  - ✅ **USEFUL**: UI components with logic, helpers

- **Implementation Guidelines:**
  - **MANDATORY**: Execute following ALL guidelines from `/.ruler` and `/docs` directories
  - **ALWAYS**: Consult documentation when uncertain about patterns, conventions, or approaches
  - Follow established code patterns, naming conventions, and project standards
  - Implement comprehensive error handling following project patterns
  - **Test Categories Required**: Success cases, error cases, edge cases, business logic
  - **Documentation First**: Check existing patterns before creating new ones

### 4. **Test Execution & Validation**

- Run `pnpm test` and all task tests to execute all unit tests
- **Correction Loop**: If tests fail:
  - Fix the issues following TDD principles
  - Run `pnpm test` and tasks tests again
  - Repeat until ALL tests pass
- **Coverage Requirements** (from ttd-flow.md):
  - Critical business logic: 100%
  - AI agents/services: 90%+
  - Complex hooks: 85%+
  - Utilities/validators: 80%+
- Only proceed when all unit tests are green and coverage meets requirements

### 5. **Code Quality Check**

- Run `pnpx next lint` to check for linting issues
- Run `pnpx tsc --noEmit` to verify TypeScript compilation
- Fix any errors or warnings before proceeding
- **Correction Loop**: If issues are found:
  - Fix the reported issues
  - Return to **Step 4** (Unit Testing) and repeat the entire cycle
  - Continue until ALL quality checks pass
  - Only proceed when linting and type checks are clean

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

### 6. **Memory Documentation Protocol**

- **MANDATORY**: Follow the Proactive Update Protocol from `docs/memory.md`:
  - Create `mistakes/[error-category].md` if any mistake was made and corrected
  - Create `features/[feature-name].md` for new features or modified behavior
  - **TDD Documentation**: Include test coverage metrics, test patterns used, and any TDD-specific decisions
  - Update `docs\project.md` if new project standards were established
  - Update `.ruler\code-preferences.md` if coding preferences were clarified
- Update relevant README files if needed
- **Test Documentation**: Document any new test patterns, mocks, or testing utilities created during TDD process

### 10. **Documentation Folder Updates**

- **Evaluate and Suggest**: Assess if the following documentation folders need updates based on the implemented feature:
  - Application flows (`docs/app-flows/`) - if user flows were modified
  - API documentation (`docs/apis/`) - if endpoints were created/modified
  - Database schemas (`docs/database-schema/`) - if database structure changed
  - Any other relevant documentation folders
- **Suggest to User**: Recommend specific updates needed and ask user to review/update the identified documentation folders

### 11. **Out-of-Scope Documentation**

- **Documentation Agent**: For new documentation not covered by existing folders or protocols
- Use the documentation agent (`.ruler\agents\documentation.md`) to create comprehensive documentation for:
  - New concepts or patterns introduced
  - Complex architectural decisions
  - Integration guides or tutorials
  - Any documentation that falls outside the standard memory and folder protocols

## Important Notes

- **🚫 Never skip steps** unless explicitly told by the user
- **📖 Always consult `/docs`** when uncertain
- **✅ Complete each step** before moving to the next
- **🔄 Iterate** until all quality checks pass
- **📝 Document everything** for future reference
