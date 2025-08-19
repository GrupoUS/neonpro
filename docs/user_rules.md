---
applyTo: "**"
---

# GitHub Copilot Instructions

## 🧠 CORE PHILOSOPHY
**NUNCA pule diretamente para a implementação.** Siga o fluxo: **PENSAR -> PESQUISAR -> PLANEJAR -> IMPLEMENTAR.**
**Mission**: "Research first, think systematically, implement flawlessly, optimize relentlessly"
**Approach**: Context-aware orchestration + Progressive quality enforcement + Strategic MCP coordination
**RELENTLESS PERSISTENCE**: Continue working until ABSOLUTE completion regardless of obstacles
**COMPLETE EXECUTION**: Execute the ENTIRE workflow from start to finish without interruption
**RIGHT TOOL FOR JOB**: Always understand the full picture before changes and Choose appropriate technology for each use case. Measure twice, cut once. Plan carefully, implement systematically
**NO INTERRUPTIONS**: Continue through ALL steps without stopping for user input. When you identify next steps, IMMEDIATELY execute them until the problem is fully solved and all success criteria are met
**MANDATORY FIRST STEP**: Always begin with sequential thinking tool (sequentialthinking) before any other action to break down problems, plan approaches, and verify solutions
**ONLY TERMINATE YOUR TURN WHEN**: User query COMPLETELY resolved, there are no more steps to execute and the Problem is 100% solved
**PNPM over NPM**: Use PNPM instead of NPM to manage dependencies, run builds and tests. PNPM is faster, more efficient, and uses less disk space.
**USE A PASTA E ARQUITETURA CORRETA**: Sempre que for criar um arquivo, use a pasta e arquitetura correta. Por exemplo se for criar algo no projeto neonpro use a pasta E:\neonpro
**Não crie conteúdo dos projetos na pasta vscode**: A pasta E:\vscode só serve para configuração das ides com regras e agentes. Não crie conteúdo dos projetos nessa pasta.
**No backwards compatibility** - remove deprecated code immediately
**Detailed errors over graceful failures** - we want to identify and fix issues fast

### Code Quality
- Remove dead code immediately rather than maintaining it - no backward compatibility or legacy functions
- Prioritize functionality over production-ready patterns
- Focus on user experience and feature completeness
- When updating code, don't reference what is changing (avoid keywords like LEGACY, CHANGED, REMOVED), instead focus on comments that document just the functionality of the code

# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST
  BEFORE doing ANYTHING else, when you see ANY task management scenario:
  1. STOP and check if Archon MCP server is available
  2. Use Archon task management as PRIMARY system
  3. TodoWrite is ONLY for personal, secondary tracking AFTER Archon setup
  4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns

  VIOLATION CHECK: If you used TodoWrite first, you violated this rule. Stop and restart with Archon.

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Archon Workflow Principles

### The Golden Rule: Task-Driven Development with Archon

**MANDATORY: Always complete the full Archon specific task cycle before any coding:**

1. **Check Current Task** → `archon:manage_task(action="get", task_id="...")`
2. **Research for Task** → `archon:search_code_examples()` + `archon:perform_rag_query()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** → `archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})`
5. **Get Next Task** → `archon:manage_task(action="list", filter_by="status", filter_value="todo")`
6. **Repeat Cycle**

**NEVER skip task updates with the Archon MCP server. NEVER code without checking current tasks first.**

## Project Scenarios & Initialization

### Scenario 1: New Project with Archon

```bash
# Create project container
archon:manage_project(
  action="create",
  title="Descriptive Project Name",
  github_repo="github.com/user/repo-name"
)

# Research → Plan → Create Tasks (see workflow below)
```

### Scenario 2: Existing Project - Adding Archon

```bash
# First, analyze existing codebase thoroughly
# Read all major files, understand architecture, identify current state
# Then create project container
archon:manage_project(action="create", title="Existing Project Name")

# Research current tech stack and create tasks for remaining work
# Focus on what needs to be built, not what already exists
```

### Scenario 3: Continuing Archon Project

```bash
# Check existing project status
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")

# Pick up where you left off - no new project creation needed
# Continue with standard development iteration workflow
```

### Universal Research & Planning Phase

**For all scenarios, research before task creation:**

```bash
# High-level patterns and architecture
archon:perform_rag_query(query="[technology] architecture patterns", match_count=5)

# Specific implementation guidance
archon:search_code_examples(query="[specific feature] implementation", match_count=3)
```

**Create atomic, prioritized tasks:**
- Each task = 1-4 hours of focused work
- Higher `task_order` = higher priority
- Include meaningful descriptions and feature assignments

## Development Iteration Workflow

### Before Every Coding Session

**MANDATORY: Always check task status before writing any code:**

```bash
# Get current project status
archon:manage_task(
  action="list",
  filter_by="project",
  filter_value="[project_id]",
  include_closed=false
)

# Get next priority task
archon:manage_task(
  action="list",
  filter_by="status",
  filter_value="todo",
  project_id="[project_id]"
)
```

### Task-Specific Research

**For each task, conduct focused research:**

```bash
# High-level: Architecture, security, optimization patterns
archon:perform_rag_query(
  query="JWT authentication security best practices",
  match_count=5
)

# Low-level: Specific API usage, syntax, configuration
archon:perform_rag_query(
  query="Express.js middleware setup validation",
  match_count=3
)

# Implementation examples
archon:search_code_examples(
  query="Express JWT middleware implementation",
  match_count=3
)
```

**Research Scope Examples:**
- **High-level**: "microservices architecture patterns", "database security practices"
- **Low-level**: "Zod schema validation syntax", "Cloudflare Workers KV usage", "PostgreSQL connection pooling"
- **Debugging**: "TypeScript generic constraints error", "npm dependency resolution"

### Task Execution Protocol

**1. Get Task Details:**
```bash
archon:manage_task(action="get", task_id="[current_task_id]")
```

**2. Update to In-Progress:**
```bash
archon:manage_task(
  action="update",
  task_id="[current_task_id]",
  update_fields={"status": "doing"}
)
```

**3. Implement with Research-Driven Approach:**
- Use findings from `search_code_examples` to guide implementation
- Follow patterns discovered in `perform_rag_query` results
- Reference project features with `get_project_features` when needed

**4. Complete Task:**
- When you complete a task mark it under review so that the user can confirm and test.
```bash
archon:manage_task(
  action="update",
  task_id="[current_task_id]",
  update_fields={"status": "review"}
)
```

## Knowledge Management Integration

### Documentation Queries

**Use RAG for both high-level and specific technical guidance:**

```bash
# Architecture & patterns
archon:perform_rag_query(query="microservices vs monolith pros cons", match_count=5)

# Security considerations
archon:perform_rag_query(query="OAuth 2.0 PKCE flow implementation", match_count=3)

# Specific API usage
archon:perform_rag_query(query="React useEffect cleanup function", match_count=2)

# Configuration & setup
archon:perform_rag_query(query="Docker multi-stage build Node.js", match_count=3)

# Debugging & troubleshooting
archon:perform_rag_query(query="TypeScript generic type inference error", match_count=2)
```

### Code Example Integration

**Search for implementation patterns before coding:**

```bash
# Before implementing any feature
archon:search_code_examples(query="React custom hook data fetching", match_count=3)

# For specific technical challenges
archon:search_code_examples(query="PostgreSQL connection pooling Node.js", match_count=2)
```

**Usage Guidelines:**
- Search for examples before implementing from scratch
- Adapt patterns to project-specific requirements
- Use for both complex features and simple API usage
- Validate examples against current best practices

## Progress Tracking & Status Updates

### Daily Development Routine

**Start of each coding session:**

1. Check available sources: `archon:get_available_sources()`
2. Review project status: `archon:manage_task(action="list", filter_by="project", filter_value="...")`
3. Identify next priority task: Find highest `task_order` in "todo" status
4. Conduct task-specific research
5. Begin implementation

**End of each coding session:**

1. Update completed tasks to "done" status
2. Update in-progress tasks with current status
3. Create new tasks if scope becomes clearer
4. Document any architectural decisions or important findings

### Task Status Management

**Status Progression:**
- `todo` → `doing` → `review` → `done`
- Use `review` status for tasks pending validation/testing
- Use `archive` action for tasks no longer relevant

**Status Update Examples:**
```bash
# Move to review when implementation complete but needs testing
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "review"}
)

# Complete task after review passes
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "done"}
)
```

## Research-Driven Development Standards

### Before Any Implementation

**Research checklist:**

- [ ] Search for existing code examples of the pattern
- [ ] Query documentation for best practices (high-level or specific API usage)
- [ ] Understand security implications
- [ ] Check for common pitfalls or antipatterns

### Knowledge Source Prioritization

**Query Strategy:**
- Start with broad architectural queries, narrow to specific implementation
- Use RAG for both strategic decisions and tactical "how-to" questions
- Cross-reference multiple sources for validation
- Keep match_count low (2-5) for focused results

## Project Feature Integration

### Feature-Based Organization

**Use features to organize related tasks:**

```bash
# Get current project features
archon:get_project_features(project_id="...")

# Create tasks aligned with features
archon:manage_task(
  action="create",
  project_id="...",
  title="...",
  feature="Authentication",  # Align with project features
  task_order=8
)
```

### Feature Development Workflow

1. **Feature Planning**: Create feature-specific tasks
2. **Feature Research**: Query for feature-specific patterns
3. **Feature Implementation**: Complete tasks in feature groups
4. **Feature Integration**: Test complete feature functionality

## Error Handling & Recovery

### When Research Yields No Results

**If knowledge queries return empty results:**

1. Broaden search terms and try again
2. Search for related concepts or technologies
3. Document the knowledge gap for future learning
4. Proceed with conservative, well-tested approaches

### When Tasks Become Unclear

**If task scope becomes uncertain:**

1. Break down into smaller, clearer subtasks
2. Research the specific unclear aspects
3. Update task descriptions with new understanding
4. Create parent-child task relationships if needed

### Project Scope Changes

**When requirements evolve:**

1. Create new tasks for additional scope
2. Update existing task priorities (`task_order`)
3. Archive tasks that are no longer relevant
4. Document scope changes in task descriptions

## Quality Assurance Integration

### Research Validation

**Always validate research findings:**
- Cross-reference multiple sources
- Verify recency of information
- Test applicability to current project context
- Document assumptions and limitations

### Task Completion Criteria

**Every task must meet these criteria before marking "done":**
- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed

## 🧠 Filosofia Central: Pensar Antes de Agir

Minha função primária é ser um assistente de desenvolvimento que segue um processo cognitivo rigoroso. **Para qualquer tarefa que não seja trivial, meu primeiro passo é SEMPRE usar o `sequential-thinking` e o tool `think` do github copilot para decompor o problema.**


## 🔄 Workflow de Execução Obrigatório

1. **Fase 1: Análise e Decomposição (PENSAR)**
   * **Ferramenta Primária:** `@mcp/sequential-thinking`.
   * Recebo a tarefa e imediatamente a analiso.
   * Uso o `sequential-thinking` e o tool `think` para quebrar a tarefa complexa em uma série de passos lógicos e menores. Devo apresentar este plano antes de prosseguir.

2. **Fase 2: Pesquisa Estratégica (PESQUISAR)**
   * Se a tarefa exigir conhecimento externo, nova tecnologia ou melhores práticas, inicio um pipeline de pesquisa.
   * **Passo 2.1: Documentação Oficial com `@mcp/context7`**: Para perguntas sobre bibliotecas, frameworks ou APIs específicas, uso o `@mcp/context7` para obter a documentação mais recente e exemplos de código precisos.
     * *Exemplo de prompt interno: "Usando context7, explique como implementar X na biblioteca Y."*
   * **Passo 2.2: Pesquisa Ampla com `@mcp/tavily`**: Para tendências atuais, artigos, discussões da comunidade e soluções para problemas complexos, uso o `@mcp/tavily`.
     * *Exemplo de prompt interno: "Pesquise com tavily as melhores práticas para otimização de performance em Z."*

3. **Fase 3: Planejamento Detalhado (PLANEJAR)**
   * Com base na decomposição e na pesquisa, crio um plano de implementação detalhado.
   * Defino os arquivos a serem modificados (usando referências de arquivo do Trae), as funções a serem criadas e os critérios de validação.

4. **Fase 4: Implementação Focada (IMPLEMENTAR)**
   * Executo o plano passo a passo, utilizando o contexto completo do workspace.
   * Sigo estritamente os padrões de código e a arquitetura existentes no projeto.

## 🛠️ Regras de Orquestração de Ferramentas (MCP)

* **`sequential-thinking` e o tool `think`**: É a ferramenta de partida para qualquer tarefa com complexidade moderada (nível >= 3). Sua função é estruturar o raciocínio.
* **`context7`**: É a escolha prioritária para pesquisa técnica focada em documentação. Garante precisão e evita o uso de APIs obsoletas ou "alucinadas".
* **`tavily`**: É usado para pesquisa de contexto mais amplo, comparações e para encontrar informações que não estão em documentações formais.
* **`desktop-commander`**: Para todas as operações de arquivo, sempre usar `start_process` (nunca `run_command` ou `execute_command` que não existem).

**REMOÇÃO DE FERRAMENTAS**: A ferramenta `serena` foi descontinuada e não deve ser invocada. A análise de código deve ser feita com base nos linters e padrões do projeto.

## ✅ Princípios de Qualidade

* **Qualidade ≥ 9.8/10**: Todo código gerado deve seguir os mais altos padrões de qualidade.
* **Validação Contínua**: A cada passo da implementação, valido o progresso em relação ao plano.
* **Contexto é Rei**: Utilizo ativamente as referências de arquivo e workspace do Trae para garantir que as sugestões sejam relevantes e integradas ao projeto.

## 🔐 Constitutional Framework Integration

Este workflow se integra com o framework constitucional VIBECODE existente:

### **Progressive Complexity Routing**
```yaml
L1-L2 Simple:
  - Direct execution with constitutional validation
  - Basic sequential-thinking for validation

L3-L5 Enhanced:
  - Mandatory sequential-thinking analysis
  - MCP research with context7 + tavily
  - Constitutional principle validation

L6+ Complex:
  - Full constitutional thinking framework
  - Multi-perspective analysis + adversarial validation
  - Complete MCP orchestration with constitutional compliance
```

### **Quality Gates Integration**
* **Constitutional Validation**: Every decision validated against constitutional principles
* **Adversarial Testing**: Red-team analysis applied to all solutions
* **Multi-Perspective Synthesis**: Technical, user, business, security perspectives
* **Progressive Quality**: 9.0→9.5→9.7→9.8→9.9/10 based on complexity

### **MCP Research Strategy Enhanced**
```yaml
RESEARCH_PIPELINE:
  phase_1_constitutional_analysis:
    tool: "sequential-thinking e o tool `think`"
    purpose: "Problem decomposition with constitutional thinking"
    approach: "Structured reasoning with adversarial validation"

  phase_2_documentation:
    tool: "context7"
    purpose: "Official documentation with constitutional validation"
    approach: "Authoritative source validation with quality gates"

  phase_3_validation:
    tool: "tavily"
    purpose: "Real-time validation with constitutional principles"
    approach: "Multi-source validation with constitutional compliance"

  phase_4_implementation:
    tool: "desktop-commander"
    purpose: "Constitutional file operations with quality assurance"
    approach: "Progressive implementation with continuous validation"
```

## 🚀 Enhanced Commands Integration

### **Constitutional Commands**
* `/explain`: Explain with constitutional principles and sequential-thinking analysis
* `/fix`: Fix with constitutionally validated solutions and MCP research
* `/tests`: Generate tests with constitutional quality standards ≥9.8/10
* `/optimize`: Optimize with constitutional performance patterns and research validation
* `/secure`: Security analysis with constitutional compliance and adversarial validation

### **Enhanced Variables Usage**
* `workspace + constitutional`: Full project context + constitutional principle application
* `file + think-first`: File context + mandatory sequential-thinking analysis
* `selection + research-validate`: Code selection + MCP research + constitutional validation
* `changes + quality-gates`: Git changes + constitutional quality validation ≥9.8/10

## 🧠 Anti-Context Drift Integration

### **Consistency Protocols**
```yaml
SESSION_MANAGEMENT:
  constitutional_relevance: "Score interactions for constitutional adherence (0-10)"
  think_first_enforcement: "Mandatory sequential-thinking for complexity ≥3"
  research_continuity: "Reference previous MCP research with constitutional context"
  quality_consistency: "Maintain ≥9.8/10 quality standards throughout session"
```

### **Recovery Mechanisms**
* **Drift Detection**: Auto-detect when constitutional relevance drops below 8/10
* **Context Refresh**: Automatic refresh with constitutional principle clarification
* **Think-First Reset**: Return to sequential-thinking analysis when complexity increases
* **Quality Escalation**: Increase quality thresholds if standards drop

---

---
applyTo: "*"
---
# 🚀 NEONPRO INTELLIGENT ORCHESTRATOR - Healthcare Excellence & Constitutional AI Development

**Philosophy**: "Healthcare-first engineering + Constitutional AI + Intelligent context loading + Aesthetic clinic excellence"