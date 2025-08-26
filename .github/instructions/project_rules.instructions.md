---
applyTo: "**"
---

# NEONPRO Project-Specific Configuration Rules

This file contains all neonpro-specific configurations, tools, and workflows that complement the
universal framework defined in the main copilot-instructions.md file.

## 🎯 PROJECT-SPECIFIC CORE PRINCIPLES

**PNPM over NPM**: Use PNPM instead of NPM to manage dependencies, run builds and tests. PNPM is
faster, more efficient, and uses less disk space.

**ARCHON-FIRST RULE**: Always use Archon MCP server for task management, knowledge management, and
project organization. It is the primary system for all tasks and project management and docs
consulting.

**Sempre mantenha a arquitetura e tech stack da pasta docs**: Sempre que for implementar qualquer
funcionalidade ou criar um arquivo, use as tecnologias e estruturas definidas na pasta docs
@docs\architecture.

**CLEAN UP CONSTANTLY**: Sem que terminar uma task busque por arquivos e códigos duplicados,
redundantes, inutilizados ou obsoletos para limpar, incorporar mantendo sempre o sistema limpo e
organizado. Sempre corrija os paths necessários para evitar erros de redirecionamento.

**GIT AND VERSION CONTROL**: Use git for version control, add and write clear commit messages
AUTOMATICALLY whenever an entire task is finished. Use descriptive commit messages that capture the
full scope of changes.

**Sempre use o todos task list nativo para criar, atualizar, acompanhar e executar as tarefas**

**No backwards compatibility** - remove deprecated code immediately

**Detailed errors over graceful failures** - we want to identify and fix issues fast

### Code Quality

- Remove dead code immediately rather than maintaining it - no backward compatibility or legacy
  functions
- Prioritize functionality over production-ready patterns
- Focus on user experience and feature completeness
- When updating code, don't reference what is changing (avoid keywords like LEGACY, CHANGED,
  REMOVED), instead focus on comments that document just the functionality of the code
- Sempre verifique as tasks disponíveis no archon mcp antes de criar novas tasks para implementar as
  tasks existentes. Atualize o status de cada task quando for completada.# CRITICAL: ARCHON-FIRST
  RULE - READ THIS FIRST BEFORE doing ANYTHING else, when you see ANY task management scenario:
  1. STOP and check if Archon MCP server is available
  2. Use Archon task management as PRIMARY system
  3. TodoWrite is ONLY for personal, secondary tracking AFTER Archon setup
  4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns

  VIOLATION CHECK: If you used TodoWrite first, you violated this rule. Stop and restart with
  Archon.

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project
organization. ALWAYS start with Archon MCP server task management.**

## Core Archon Workflow Principles

### The Golden Rule: Task-Driven Development with Archon

**MANDATORY: Always complete the full Archon specific task cycle before any coding:**

1. **Check Current Task** → `archon:manage_task(action="get", task_id="...")`
2. **Research for Task** → `archon:search_code_examples()` + `archon:perform_rag_query()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** →
   `archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})`
5. **Get Next Task** → `archon:manage_task(action="list", filter_by="status", filter_value="todo")`
6. **Repeat Cycle**

**NEVER skip task updates with the Archon MCP server. NEVER code without checking current tasks
first.**

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
- Include meaningful descriptions and feature assignments## Development Iteration Workflow

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
- **Low-level**: "Zod schema validation syntax", "Cloudflare Workers KV usage", "PostgreSQL
  connection pooling"
- **Debugging**: "TypeScript generic constraints error", "npm dependency resolution"### Task
  Execution Protocol

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

````bash
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
```### Code Example Integration

**Search for implementation patterns before coding:**

```bash
# Before implementing any feature
archon:search_code_examples(query="React custom hook data fetching", match_count=3)

# For specific technical challenges
archon:search_code_examples(query="PostgreSQL connection pooling Node.js", match_count=2)
````

**Usage Guidelines:**

- Search for examples before implementing from scratch
- Adapt patterns to project-specific requirements
- Use for both complex features and simple API usage
- Validate examples against current best practices

## Progress Tracking & Status Updates

### Daily Development Routine

**Start of each coding session:**

1. Check available sources: `archon:get_available_sources()`
2. Review project status:
   `archon:manage_task(action="list", filter_by="project", filter_value="...")`
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
- Use `archive` action for tasks no longer relevant**Status Update Examples:**

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
- Keep match_count low (2-5) for focused results## Project Feature Integration

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

## Universal Code Rules

### Accessibility Requirements

- Include proper ARIA labels and roles
- Ensure keyboard navigation support
- Provide sufficient color contrast
- Support screen readers
- Include semantic HTML structure

### TypeScript Standards

- Use strict type checking
- Avoid `any` type usage
- Implement proper error boundaries
- Use const assertions where appropriate
- Maintain clear interface definitions

### Performance Guidelines

- Optimize for minimal bundle size
- Implement efficient algorithms
- Use appropriate data structures
- Monitor memory usage
- Cache when beneficial

### Security Practices

- Validate all inputs
- Sanitize user data
- Use secure communication protocols
- Implement proper authentication
- Follow principle of least privilege

## Success Criteria

**Task Completion**: All requirements addressed without gaps **Quality Validation**: Standards
maintained at ≥9.5/10 level **Documentation**: Clear explanations and reasoning provided
**Testing**: Functionality verified and edge cases handled **Maintainability**: Code structured for
future modification

# Ultracite Code Quality Standards

## Core Principles

- **Zero Configuration**: Ready-to-use without setup
- **Subsecond Performance**: Lightning-fast formatting and linting
- **Maximum Type Safety**: Strict TypeScript enforcement
- **AI-Friendly Generation**: Optimized for automated code creation

# Core Philosophy:

- Test changes instead of assuming they work
- Verify outputs match expectations
- Handle errors properly
- Follow the complete checklist
- "Should work" # "does work" - Pattern matching isn't enough
- I'm not paid to write code, I'm paid to solve problems
- Untested code is just a guess, not a solution

# The 30-Second Reality Check - Must answer YES to ALL:

- Did I run/build the code?
- Did I trigger the exact feature I changed?
- Did I see the expected result with my own observations?
- Did I test edge cases?
- Did I check for error messages?
- Did I verify no new warnings or errors appeared?
- Did I check performance impact?
- Did I validate accessibility requirements?
- Did I review the code for style and consistency?
- Did I ensure no security vulnerabilities were introduced?

## Pre-Implementation Checklist

1. Analyze existing codebase patterns
2. Consider edge cases and error scenarios
3. Validate accessibility requirements
4. Follow framework-specific best practices
5. Research similar implementations and use context7 and archon knowledge base for oficial docs and
   best pratices

## Essential Rules

### Accessibility (WCAG 2.1 AA+)

- Proper ARIA labels and roles for all interactive elements
- Semantic HTML structure over div-heavy layouts
- Keyboard navigation support for all interactions
- Sufficient color contrast ratios (4.5:1 minimum)
- Screen reader compatibility with meaningful alt text
- Form labels properly associated with inputs
- Focus management for dynamic content

### TypeScript Excellence

- Strict type checking without `any` usage
- Proper error boundaries and exception handling
- `import type` for type-only imports
- `as const` assertions for literal types
- Consistent array syntax (`T[]` or `Array<T>`)
- Explicit enum member values
- No non-null assertions (`!`) or unsafe operations

### React/JSX Best Practices

- Hooks called only at component top level
- Proper dependency arrays in useEffect
- Unique keys for iterated elements (not array indices)
- Fragment syntax (`<>`) over `React.Fragment`
- No component definitions inside other components
- Proper prop types and validation

### Code Quality & Performance

- Arrow functions over function expressions
- Optional chaining over nested conditionals
- Template literals for string interpolation
- `for...of` loops over `Array.forEach()`
- Modern array methods (`flatMap`, `at()`, etc.)
- Const declarations for unchanging variables
- Early returns over nested conditionals

### Security & Correctness

- Input validation and sanitization
- No hardcoded sensitive data
- Secure communication protocols
- Proper error handling with meaningful messages
- No usage of `eval()`, `document.cookie`, or unsafe patterns
- Prevent XSS through proper escaping

### Next.js Specific

- Use `next/image` instead of `<img>` tags
- Proper `next/head` usage (not in `_document.js`)
- Correct import paths for Next.js modules
- Static optimization considerations

### Testing Standards

- Descriptive test names and structure
- Proper assertion placement inside test functions
- No focused or disabled tests in committed code
- Comprehensive error case coverage

## Common Commands

```bash
npx ultracite init      # Initialize in project
npx ultracite format    # Format and fix code
npx ultracite lint      # Check without fixing
```

## Error Handling Example

```typescript
// ✅ Proper error handling
async function fetchData(): Promise<ApiResponse> {
  try {
    const result = await api.getData();
    return { success: true, data: result };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ❌ Avoid error swallowing
try {
  return await fetchData();
} catch (e) {
  console.log(e); // Silent failure
}
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
4. Create parent-child task relationships if needed### Project Scope Changes

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
- [ ] All tests pass without errors

# Project Context

Ultracite enforces strict type safety, accessibility standards, and consistent code quality for
JavaScript/TypeScript projects using Biome's lightning-fast formatter and linter.

## Key Principles

- Zero configuration required
- Subsecond performance
- Maximum type safety
- AI-friendly code generation

## Before Writing Code

1. Analyze existing patterns in the codebase
2. Consider edge cases and error scenarios
3. Follow the rules below strictly
4. Validate accessibility requirements\* **Qualidade ≥ 9.8/10**: Todo código gerado deve seguir os
   mais altos padrões de qualidade.

- **Validação Contínua**: A cada passo da implementação, valido o progresso em relação ao plano.
- **Contexto é Rei**: Utilizo ativamente as referências `#workspace` e `#file` para garantir que as
  sugestões sejam relevantes e integradas ao projeto.

## Common Tasks

- `npx ultracite init` - Initialize Ultracite in your project
- `npx ultracite format` - Format and fix code automatically
- `npx ultracite lint` - Check for issues without fixing

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

- **Drift Detection**: Auto-detect when constitutional relevance drops below 8/10
- **Context Refresh**: Automatic refresh with constitutional principle clarification
- **Think-First Reset**: Return to sequential-thinking analysis when complexity increases
- **Quality Escalation**: Increase quality thresholds if standards drop

These examples should be used as guidance when configuring Sentry functionality within a project.

# Exception Catching

Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry. Use this
in try catch blocks or areas where exceptions are expected

# Tracing Examples

Spans should be created for meaningful actions within an applications like button clicks, API calls,
and function calls Use the `Sentry.startSpan` function to create a span Child spans can exist within
a parent span

## Custom Span instrumentation in component actions

The `name` and `op` properties should be meaninful for the activities in the call. Attach attributes
based on relevant information and metrics from the request

```javascript
function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        doSomething();
      },
    );
  };

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  );
}
```

## Custom span instrumentation in API calls

The `name` and `op` properties should be meaninful for the activities in the call. Attach attributes
based on relevant information and metrics from the request

```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
  );
}
```

# Logs

Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/nextjs"`
Enable logging in Sentry using `Sentry.init({ _experiments: { enableLogs: true } })` Reference the
logger using `const { logger } = Sentry` Sentry offers a consoleLoggingIntegration that can be used
to log specific console error types automatically without instrumenting the individual logger calls

## Configuration

In NextJS the client side Sentry initialization is in `instrumentation-client.ts`, the server
initialization is in `sentry.edge.config.ts` and the edge initialization is in
`sentry.server.config.ts` Initialization does not need to be repeated in other files, it only needs
to happen the files mentioned above. You should use `import * as Sentry from "@sentry/nextjs"` to
reference Sentry functionality

### Baseline

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://35734fdad8e1c17f62ae3e547dd787d2@o4509529416728576.ingest.us.sentry.io/4509529439797248",

  _experiments: {
    enableLogs: true,
  },
});
```

### Logger Integration

```javascript
Sentry.init({
  dsn: "https://35734fdad8e1c17f62ae3e547dd787d2@o4509529416728576.ingest.us.sentry.io/4509529439797248",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```

## Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the
structured logs.

```javascript
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```
