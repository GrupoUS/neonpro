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

## Overview

This document establishes the fundamental rules, principles, and standards for the NeonPro aesthetic clinic platform. It serves as the primary reference for all development activities and architectural decisions.

**Scope**: Healthcare-compliant aesthetic clinic management platform
**Related Documents**: See architecture docs and agent coordination guides

### Monorepo Structure

The project is organized into `apps` and `packages`:

*   `apps`: Contains the main applications.
    *   `web`: The main web application.
    *   `api`: The backend API.
*   `packages`: Contains shared code and libraries.
    *   `config`: Services related to configuration.
    *   `database`: Database utilities.
    *   `core`: Core functionality.
    *   `types`: Shared TypeScript types.
    *   `ui`: React component library.

### Key Commands

The following commands are available at the root of the monorepo:

**Development**
*   `bun dev`: Start the development servers for all apps.
*   `bun build`: Build all apps and packages.

**Testing (Functional)**
*   `bun test`: Run unit and integration tests for packages
*   `bun test:coverage`: Generate code coverage report
*   `bun test packages/types/src/__tests__/schemas.test.ts`: Test TypeScript schemas
*   `bun test packages/database/src/models/__tests__/performance-metrics.test.ts`: Test database models

**Quality Assurance**
*   `bun lint`: Lint codebase with OXLint (50-100x faster than ESLint) ✅
*   `bun lint:fix`: Auto-fix linting issues
*   `bun format`: Format codebase with Biome
*   `bunx biome check`: Alternative code quality validation

**Type Safety**
*   `bun type-check`: Run TypeScript type checking
*   `bunx biome check --apply`: Auto-fix code issues

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

## References

### Architecture Documentation

- **[Tech Stack](docs/architecture/tech-stack.md)** - Complete technology decisions and rationale
- **[Frontend Architecture](docs/architecture/frontend-architecture.md)** - Frontend structure and patterns
- **[Quality Control](.claude/commands/quality-control.md)** - Bun-optimized quality gates and compliance
- **[Frontend Testing](.claude/commands/frontend-testing.md)** - Multi-agent testing coordination

### Development Standards

- **[Coding Standards](docs/rules/coding-standards.md)** - Code organization and conventions
- **[Documentation Standards](docs/agents/documentation.md)** - Diátaxis forms and templates
- **[Rule Architecture](docs/agents/rules.md)** - Rule creation and validation frameworks

---

## Constitutional Authority

This document serves as the ultimate authority for NeonPro project development. All architectural decisions, technology choices, and development practices must align with these constitutional principles.

**Validation Requirements**: Any deviation from these standards requires explicit project leadership approval and documentation of the technical rationale.

**Review Process**: This constitution is reviewed quarterly or when major architectural changes are implemented. All changes must follow the established rule creation process.

**Enforcement**: Automated quality gates ensure compliance with these standards. Violations must be addressed before production deployment.

---
