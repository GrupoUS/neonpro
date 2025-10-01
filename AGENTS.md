---
title: "NeonPro Project Constitution"
last_updated: 2025-09-30
form: reference
tags: [constitution, neonpro, architecture, standards]
related:
  - docs/architecture/tech-stack.md
  - docs/architecture/frontend-architecture.md
  - .claude/commands/quality-control.md
  - .claude/commands/frontend-testing.md
---

# 🚀 NEONPRO PROJECT CONSTITUTION

## MANDATORY READ:

- **[Tech Stack](docs/architecture/tech-stack.md)** - Complete technology decisions and rationale
- **[Frontend Architecture](docs/architecture/frontend-architecture.md)** - Frontend structure and patterns

## Overview

This document establishes the fundamental rules, principles, and standards for the NeonPro aesthetic clinic platform. It serves as the primary reference for all development activities and architectural decisions.

**Scope**: Healthcare-compliant aesthetic clinic management platform
**Related Documents**: See architecture docs and agent coordination guides

### Monorepo Structure

The project is organized into `apps` and `packages`:

- `apps`: Contains the main applications.
  - `web`: The main web application.
  - `api`: The backend API.
- `packages`: Contains shared code and libraries.
  - `config`: Services related to configuration.
  - `database`: Database utilities.
  - `core`: Core functionality.
  - `types`: Shared TypeScript types.
  - `ui`: React component library.

### Key Commands

The following commands are available at the root of the monorepo:

**Development**

- `bun dev`: Start the development servers for all apps.
- `bun build`: Build all apps and packages.

**Testing (Functional)**

- `bun test`: Run unit and integration tests for packages
- `bun test:coverage`: Generate code coverage report
- `bun test packages/types/src/__tests__/schemas.test.ts`: Test TypeScript schemas
- `bun test packages/database/src/models/__tests__/performance-metrics.test.ts`: Test database models

**Quality Assurance**

- `bun lint`: Lint codebase with OXLint (50-100x faster than ESLint) ✅
- `bun lint:fix`: Auto-fix linting issues
- `bun format`: Format codebase with Biome
- `bunx biome check`: Alternative code quality validation

**Type Safety**

- `bun type-check`: Run TypeScript type checking
- `bunx biome check --apply`: Auto-fix code issues

## Core Principles

```yaml
CORE_STANDARDS:
  mantra: "Think → Research → Plan → Decompose with atomic tasks → Implement → Validate"
  mission: "Research first, think systematically, implement flawlessly with cognitive intelligence"
  research_driven: "Multi-source validation for all complex implementations"
  vibecoder_integration: "Constitutional excellence with one-shot resolution philosophy"
  core_principle: "Simple systems that work over complex systems that don't"
  preserve_context: "Maintain complete context across all agent and thinking transitions"
  incorporate_always: "Incorporate what we already have, avoid creating new files, enhance the existing structure"
  always_audit: "Never assume the error is fixed, always audit and validate"
  COGNITIVE_ARCHITECTURE:
  meta_cognition: "Think about the thinking process, identify biases, apply constitutional analysis"
  multi_perspective_analysis:
    - "user_perspective: Understanding user intent and constraints"
    - "developer_perspective: Technical implementation and architecture considerations"
    - "business_perspective: Cost, timeline, and stakeholder impact analysis"
    - "security_perspective: Risk assessment and compliance requirements"
    - "quality_perspective: Standards enforcement and continuous improvement"
```

### Development Philosophy

**Mantra**: _"Think → Research → Decompose → Plan → Implement → Validate"_

**KISS Principle**: Choose the simplest solution that meets requirements. Prioritize readable code over clever optimizations. Reduce cognitive load and avoid over-engineering.

**YAGNI Principle**: Build only what requirements specify. Resist "just in case" features. Refactor when requirements emerge. Focus on current user stories and remove unused, redundant and dead code immediately.

**Chain of Thought**: Break problems into sequential steps and atomic subtasks. Verbalize reasoning process. Show intermediate decisions. Validate against requirements.

### A.P.T.E Methodology

**Analyze** → Comprehensive requirements analysis
**Plan** → Strategic implementation planning
**Think** → Metacognition and multi-perspective evaluation
**Execute** → Systematic implementation with quality gates

**Quality Standard**: ≥9.5/10 rating on all deliveries

## Project Architecture

### Technology Stack

**Core Technologies**: Bun + Hono + React 19 + TypeScript + Supabase
**Frontend**: TanStack Router v5 + TanStack Query v5 + Vite + Tailwind CSS
**Backend**: tRPC v11 + Hono (Edge-first) + Supabase Functions
**Database**: Supabase (Postgres + Auth + Realtime + RLS)

**Package Manager**: Bun (3-5x faster than npm/pnpm)
**Build System**: Turborepo + Vite (sub-second startup)
**Testing**: Vitest + Playwright + OXLint (50-100x faster linting)

### Healthcare Compliance

**LGPD Compliance**: Brazilian data protection law enforcement

- Patient data encryption at rest and in transit
- Explicit consent management and audit trails
- Data residency requirements (Brazil-only)
- Right to erasure and data portability

**WCAG 2.1 AA+**: Accessibility compliance mandatory

- Screen reader compatibility
- Keyboard navigation support
- Color contrast requirements

### Performance Targets

**Core Web Vitals**:

- LCP ≤ 2.0s (Largest Contentful Paint)
- INP ≤ 150ms (Interaction to Next Paint)
- CLS ≤ 0.05 (Cumulative Layout Shift)

**API Performance**:

- TTFB ≤ 150ms (Time to First Byte)
- Database queries ≤ 100ms
- Edge function responses ≤ 200ms

**Build Performance**:

- Development startup < 2s
- Production build < 3min
- Bundle analysis < 10s

## Development Standards

### Code Quality

**TypeScript Strict Mode**: Maximum type safety enforcement

- Strict null checks and type inference
- No implicit any types allowed
- Comprehensive interface definitions

**Code Organization**: Clean architecture principles

- Feature-based folder structure
- Separation of concerns maintained
- Consistent naming conventions

**Import Standards**: Optimized module management

- Absolute imports for internal modules
- Proper barrel exports organization
- Tree-shaking optimization support

### Testing Requirements

**Test Coverage**: Minimum 90% for critical components

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for user workflows

**Testing Tools**: Bun-optimized testing stack

- Vitest for unit/integration tests (3-5x faster)
- Playwright for E2E automation (3 essential browsers)
- OXLint for code quality validation (50-100x faster)

**Performance Testing**: Healthcare-optimized benchmarks

- Performance metrics API testing with timeout optimization
- Memory usage validation and optimization tracking
- Edge function performance verification
- Healthcare compliance performance standards

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

### Security Standards

**Input Validation**: Mandatory sanitization

- Zod schema validation for all inputs
- SQL injection prevention via RLS
- XSS protection with proper escaping

**Authentication & Authorization**: Multi-layer security

- JWT with refresh token rotation
- Role-based access control (RBAC)
- Session management with audit trails

**Data Protection**: Healthcare compliance enforcement

- Encryption at rest and in transit
- Patient data access logging
- Automated compliance violation detection

## Tooling & Performance

### Build System

**Package Manager**: Bun (primary performance optimization)

- 3-5x faster than npm/pnpm for installs
- Native TypeScript support
- Optimized dependency resolution

**Build Tools**: Production-optimized stack

- Turborepo: Intelligent caching for 3-5x faster builds
- Vite: Sub-second dev server startup, HMR <100ms
- OXLint: 50-100x faster linting with 570+ rules

### Quality Assurance

**Code Quality**: Automated validation pipeline

- OXLint for React 19 + TypeScript 5.9+ compliance
- Biome for consistent formatting
- Comprehensive type checking

**Testing**: Multi-layer testing strategy

- Vitest for unit/integration tests (Bun-optimized)
- Playwright for E2E automation (3 essential browsers)
- Coverage reporting with ≥90% threshold

**Security**: Healthcare-focused security scanning

- Automated vulnerability scanning
- LGPD compliance validation
- Medical device security assessment

### Performance Monitoring

**Bundle Analysis**: Automated optimization

- Real-time bundle size tracking
- Tree-shaking validation
- Code splitting optimization

**Runtime Performance**: Continuous monitoring

- Core Web Vitals tracking
- API response time monitoring
- Database query performance analysis

## CLI-First Integration Standards

### Mandatory CLI-First Approach

**Philosophy**: All external service integrations MUST use official CLI tools instead of web UIs, APIs, or manual operations. This ensures reproducibility, automation, version control, and consistent documentation.

**Execution Tool**: All CLI commands MUST be executed via Desktop Commander MCP for proper logging, error handling, and audit trails.

### Core Service CLIs

#### Supabase Operations (`supabase` CLI)

**Installation Verification**:

```bash
supabase --version
supabase status
```

**Authentication**:

```bash
supabase login  # Interactive authentication
supabase projects list  # Verify access
```

**Common Operations**:

```yaml
project_management:
  init: "supabase init"
  link: "supabase link --project-ref ownkoxryswokcdanrdgj"
  status: "supabase status"

database_migrations:
  create: "supabase migration new create_patients_table"
  list: "supabase migration list"
  apply: "supabase db push"
  reset: "supabase db reset"
  diff: "supabase db diff --schema public"

local_development:
  start: "supabase start"
  stop: "supabase stop"
  restart: "supabase stop && supabase start"

functions:
  new: "supabase functions new function-name"
  serve: "supabase functions serve function-name"
  deploy: "supabase functions deploy function-name"

types_generation:
  generate: "supabase gen types typescript --local > packages/database/src/types/supabase.ts"

secrets_management:
  set: "supabase secrets set API_KEY=value"
  list: "supabase secrets list"
  unset: "supabase secrets unset API_KEY"
```

**Monorepo Configuration**:

```yaml
project_structure:
  config_location: "supabase/config.toml"
  migrations: "supabase/migrations/"
  functions: "supabase/functions/"

connection_pooling:
  max_connections: 20
  min_connections: 5
  timeout: "30s"
```

**Documentation Research**:

- **MUST** use Context7 MCP for migration patterns: `search_documentation("Supabase CLI migration best practices TypeScript")`
- Official docs: https://supabase.com/docs/guides/cli

#### Vercel Operations (`vercel` CLI)

**Installation Verification**:

```bash
vercel --version
vercel whoami
```

**Authentication**:

```bash
vercel login  # Interactive authentication
vercel teams list  # Verify team access
```

**Common Operations**:

```yaml
deployment:
  deploy_preview: "vercel"
  deploy_production: "vercel --prod"
  deploy_specific: "vercel --cwd apps/web --prod"

project_management:
  link: "vercel link --project neonpro"
  list: "vercel list"
  inspect: "vercel inspect neonpro-abc123.vercel.app"

environment_variables:
  add: "vercel env add VARIABLE_NAME production"
  list: "vercel env ls"
  pull: "vercel env pull .env.local"
  remove: "vercel env rm VARIABLE_NAME production"

domains:
  add: "vercel domains add neonpro.com.br"
  list: "vercel domains ls"
  inspect: "vercel domains inspect neonpro.com.br"

logs:
  view: "vercel logs neonpro-abc123.vercel.app"
  follow: "vercel logs neonpro-abc123.vercel.app --follow"

builds:
  list: "vercel builds list"
  inspect: "vercel builds inspect build-id"
```

**Turborepo Integration**:

```yaml
monorepo_deployment:
  build_command: "bun turbo run build"
  output_directory: "apps/web/dist"
  install_command: "bun install"

performance:
  cache_enabled: true
  remote_cache: "vercel"
```

**Documentation Research**:

- **MUST** use Context7 MCP for deployment configs: `search_documentation("Vercel CLI monorepo deployment Turborepo")`
- Official docs: https://vercel.com/docs/cli

#### shadcn/ui Operations (`bunx shadcn`)

**Installation Verification**:

```bash
bunx shadcn@latest --version
```

**Common Operations**:

```yaml
initialization:
  init: "bunx shadcn@latest init"

component_management:
  add_single: "bunx shadcn@latest add button"
  add_multiple: "bunx shadcn@latest add button card dialog"
  add_all: "bunx shadcn@latest add --all"
  list: "bunx shadcn@latest list"

configuration:
  diff: "bunx shadcn@latest diff button"
  update: "bunx shadcn@latest update"
```

**Monorepo Configuration**:

```yaml
package_location: "packages/ui"
components_path: "packages/ui/src/components"
utils_path: "packages/ui/src/lib/utils"
tailwind_config: "packages/ui/tailwind.config.ts"
```

**Theme Integration**:

```bash
# Install specific theme from tweakcn.com
bunx shadcn@latest add https://tweakcn.com/themes/cmesqts4l000r04l7bgdqfpxb
```

**Documentation Research**:

- **MUST** use Context7 MCP for component customization: `search_documentation("shadcn/ui CLI component customization monorepo")`
- Official docs: https://ui.shadcn.com/docs/cli

### Documentation Research Protocol

**MANDATORY STEPS** before executing any CLI command:

1. **Context7 MCP Research**:
   ```typescript
   // Example research query structure
   search_documentation({
     query: 'service_name CLI command_type best_practices project_context',
     sources: ['official_docs', 'github_issues', 'community_guides'],
   })
   ```

2. **Compatibility Verification**:
   - Confirm command works with Bun runtime
   - Verify TypeScript 5.9+ compatibility
   - Check monorepo structure support
   - Validate healthcare compliance requirements

3. **Prerequisites Check**:
   - Authentication status verified
   - Required environment variables set
   - Project configuration files present
   - Dependencies installed and up-to-date

4. **Command Documentation**:
   - Document command pattern in this file
   - Add to project runbook if recurring
   - Include error handling procedures
   - Note any project-specific modifications

### Error Handling Procedures

**CLI Command Failure Protocol**:

```yaml
step_1_capture:
  action: "Capture full error output including exit code"
  tool: "Desktop Commander MCP with error logging"

step_2_research:
  action: "Research error via Context7 MCP"
  query_pattern: "service_name CLI error_message troubleshooting"

step_3_verify:
  checks:
    - "Authentication status valid"
    - "Configuration files correct"
    - "Environment variables set"
    - "Network connectivity available"

step_4_fallback:
  options:
    - "Try alternative CLI flag/option"
    - "Check service status page"
    - "Verify API rate limits"
    - "Review recent service updates"

step_5_document:
  action: "Document error and resolution in project knowledge base"
  location: "docs/troubleshooting/cli-errors.md"
```

### CLI Execution Standards

**Desktop Commander MCP Integration**:

```yaml
execution_requirements:
  tool: "Desktop Commander MCP (MANDATORY)"
  working_directory: "/home/vibecode/neonpro"
  shell: "bash"
  timeout: "30s (default), 300s (long operations)"

logging:
  level: "INFO"
  capture_stdout: true
  capture_stderr: true
  audit_trail: true

error_handling:
  retry_count: 3
  retry_delay: "5s"
  fallback_strategy: "documented"
```

**Command Validation**:

```yaml
pre_execution:
  - "Verify CLI tool installed and accessible"
  - "Confirm authentication status"
  - "Validate command syntax via Context7 MCP"
  - "Check for breaking changes in CLI version"

post_execution:
  - "Verify command success via exit code"
  - "Validate expected output/side effects"
  - "Update project state documentation"
  - "Log operation in audit trail"
```

### Integration Examples

**Example 1: Deploy Supabase Migration**

```bash
# 1. Research (Context7 MCP)
search_documentation("Supabase CLI migration deployment production best practices")

# 2. Create migration
supabase migration new add_patient_consent_tracking

# 3. Apply locally first
supabase db reset
supabase db push

# 4. Generate types
supabase gen types typescript --local > packages/database/src/types/supabase.ts

# 5. Deploy to production
supabase db push --linked

# 6. Verify
supabase migration list
```

**Example 2: Vercel Production Deployment**

```bash
# 1. Research (Context7 MCP)
search_documentation("Vercel CLI production deployment Turborepo monorepo")

# 2. Build locally first
bun turbo run build

# 3. Deploy to production
vercel --prod --cwd apps/web

# 4. Verify deployment
vercel inspect $(vercel ls --prod | head -n 1)

# 5. Check logs
vercel logs --prod --follow
```

### Prohibited Practices

**MUST NOT**:

- Use web UIs for operations that have CLI equivalents
- Make direct API calls when CLI tools are available
- Manually edit configuration files managed by CLIs
- Skip Context7 MCP research for unfamiliar commands
- Execute CLI commands outside Desktop Commander MCP
- Proceed with <90% confidence in command correctness

**MUST ALWAYS**:

- Research command syntax via Context7 MCP first
- Execute all CLI operations via Desktop Commander MCP
- Verify command success and side effects
- Document new command patterns in this file
- Update audit trails for all service operations
- Maintain authentication status across sessions

## Project Restrictions

### MUST Requirements

- **Type Safety**: Strict TypeScript mode, no any types
- **Test Coverage**: Minimum 90% for critical components
- **Security**: Zero vulnerabilities in production builds
- **Performance**: All SLOs must be met or exceeded

### MUST NOT Violations

- **Data Protection**: Never expose patient data without encryption
- **Authentication**: Never bypass security controls
- **Compliance**: Never deploy without healthcare validation
- **Performance**: Never degrade Core Web Vitals below targets
- **Documentation**: Never commit without proper documentation

### Quality Gates

All code changes must pass:

1. **Automated Tests**: 100% pass rate
2. **Type Checking**: Zero TypeScript errors
3. **Security Scan**: Zero high-severity vulnerabilities
4. **Performance**: No regression in Core Web Vitals

---

## Constitutional Authority

This document serves as the ultimate authority for NeonPro project development. All architectural decisions, technology choices, and development practices must align with these constitutional principles.

**Validation Requirements**: Any deviation from these standards requires explicit project leadership approval and documentation of the technical rationale.

**Review Process**: This constitution is reviewed quarterly or when major architectural changes are implemented. All changes must follow the established rule creation process.

**Enforcement**: Automated quality gates ensure compliance with these standards. Violations must be addressed before production deployment.

---
