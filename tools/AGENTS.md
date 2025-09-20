---
title: "NeonPro Tools Usage Guide"
last_updated: 2025-09-16
form: how-to
tags: [tools, testing, healthcare, neonpro]
related:
  - ../docs/AGENTS.md
  - ../docs/rules/coding-standards.md
  - ../docs/architecture/tech-stack.md
---

# NeonPro Tools Usage Guide — Version: 1.0.0

## Overview

The NeonPro Tools collection provides a categorized testing infrastructure for healthcare compliance and development excellence. This guide covers how to use the four main tool categories: frontend, backend, database, and quality testing tools, along with the central orchestration system.

**Target Audience**: Developers, QA engineers, and DevOps teams working on the NeonPro healthcare platform.

## Prerequisites

- **Node.js** ≥20.0.0
- **pnpm** ≥8.15.0 (primary package manager)
- **Bun** (for performance-critical tasks)
- **Git** repository access
- **Environment Variables**: Healthcare compliance keys (LGPD_COMPLIANCE_KEY, etc.)

## Quick Start

```bash
# Install all dependencies
pnpm install

# Run all tests by category
pnpm run test:frontend    # React, E2E, Accessibility tests
pnpm run test:backend     # API, Integration, Middleware tests
pnpm run test:database    # RLS, Security, Compliance tests
pnpm run test:quality     # Coverage, Performance, Audit tests

# Run orchestrated test suite
pnpm run test:orchestrate
```

## Test Categories

### 🎨 Frontend Tests (`@neonpro/tools-frontend-tests`)

**Focus**: React components, E2E workflows, accessibility, and healthcare UI compliance.

```bash
# All frontend tests
pnpm run test:frontend

# Specific test types
pnpm --filter @neonpro/tools-frontend-tests test:components
pnpm --filter @neonpro/tools-frontend-tests test:e2e
pnpm --filter @neonpro/tools-frontend-tests test:a11y

# Healthcare UI compliance
pnpm run test:a11y
```

**Key Features**:

- React Testing Library integration
- Playwright E2E automation
- WCAG 2.1 AA+ accessibility validation
- Healthcare-specific UI component testing

### 🔧 Backend Tests (`@neonpro/tools-backend-tests`)

**Focus**: API endpoints, integration testing, monorepo validation, and middleware.

```bash
# All backend tests
pnpm run test:backend

# Specific test types
pnpm --filter @neonpro/tools-backend-tests test:api
pnpm --filter @neonpro/tools-backend-tests test:integration
pnpm --filter @neonpro/tools-backend-tests test:middleware
```

**Key Features**:

- Hono.dev framework testing
- Supertest API validation
- MSW mocking integration
- Healthcare compliance validation

### 🗄️ Database Tests (`@neonpro/tools-database-tests`)

**Focus**: Row Level Security (RLS), data compliance, and migration validation.

```bash
# All database tests
pnpm run test:database

# Specific test types
pnpm run test:rls         # Row Level Security
pnpm run test:compliance  # LGPD/ANVISA/CFM compliance
```

**Key Features**:

- Supabase RLS policy testing
- Brazilian healthcare regulation compliance (LGPD, ANVISA, CFM)
- Migration safety validation
- Data encryption verification

### ⚡ Quality Tests (`@neonpro/tools-quality-tests`)

**Focus**: Code coverage, performance benchmarks, and monitoring.

```bash
# All quality tests
pnpm run test:quality

# Specific quality checks
pnpm --filter @neonpro/tools-quality-tests test:coverage
pnpm --filter @neonpro/tools-quality-tests test:performance
pnpm --filter @neonpro/tools-quality-tests benchmark
```

**Key Features**:

- Vitest coverage enforcement
- Performance budget validation
- Clinic.js profiling integration
- Quality gate enforcement

## Test Orchestration

### Basic Orchestration

The orchestration system coordinates all test categories through TDD phases (Red → Green → Refactor):

```bash
# Run all categories with healthcare compliance
pnpm run test:orchestrate --healthcare-compliance

# Run specific categories
pnpm run test:orchestrate --categories=frontend,backend

# Run all categories in parallel
pnpm run test:all-categories
```

### Healthcare Compliance Mode

```bash
# Full healthcare compliance validation
pnpm run test:healthcare

# Individual compliance checks
pnpm run test:compliance  # Database compliance
pnpm run test:a11y        # Accessibility compliance
```

### Integration Testing

```bash
# Run the integration test suite
bun run tools/orchestration/scripts/test-integration.ts
```

## Agent Coordination

The tools integrate with AI agents for enhanced testing:

- **apex-ui-ux-designer**: Frontend design validation
- **apex-dev**: Code implementation review
- **code-reviewer**: Code quality assessment
- **test-auditor**: Security and compliance validation
- **architect-review**: Architecture decisions
- **tdd-orchestrator**: Test-driven development coordination

## Configuration Files

### Vitest Configuration

Each category has its own `vitest.config.ts`:

```typescript
// tools/frontend/vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom", // For React testing
    coverage: {
      thresholds: { global: { lines: 85 } },
    },
  },
});
```

### Playwright Configuration

E2E tests use centralized Playwright config:

```bash
# Run E2E tests
pnpm run test:e2e

# Run with UI mode
pnpm --filter @neonpro/tools-frontend-tests test:e2e:ui
```

## Troubleshooting

### Common Issues

- **Issue**: `Cannot find module '@neonpro/tools-shared'`
  **Solution**: Run `pnpm install` from the root directory

- **Issue**: `Module resolution failed`
  **Solution**: Build shared package: `cd tools/shared && bun run build`

- **Issue**: `Healthcare compliance failed`
  **Solution**: Check environment variables for compliance keys

- **Issue**: `E2E tests timeout`
  **Solution**: Increase timeout in `playwright.config.ts` or run with `--headed` flag

### Performance Issues

- **Issue**: Slow test execution
  **Solution**: Use `--parallel` flag or split test categories

- **Issue**: High memory usage
  **Solution**: Run categories individually or increase Node.js memory limit

## Healthcare Compliance Requirements

### LGPD (Brazilian Data Protection)

- Patient data anonymization tests
- Consent management validation
- Data retention policy checks

### ANVISA (Health Surveillance)

- Medical device software validation
- Clinical data integrity tests
- Audit trail verification

### CFM (Federal Council of Medicine)

- Medical professional verification
- Prescription validation tests
- Patient-doctor relationship checks

## Next Steps

After setting up the tools:

1. **Integrate with CI/CD**: Add test scripts to your GitHub Actions
2. **Configure Quality Gates**: Set coverage thresholds for your project
3. **Setup Monitoring**: Enable performance tracking and alerts
4. **Train Team**: Share this guide with your development team

## Performance Targets

- **Frontend Tests**: ≤100ms per component test
- **Backend Tests**: ≤500ms per API endpoint test
- **Database Tests**: ≤200ms per RLS validation
- **E2E Tests**: ≤30s per user workflow
- **Coverage**: ≥85% for frontend, ≥90% for database

## See Also

- [Main Architecture Guide](../docs/AGENTS.md)
- [Coding Standards](../docs/rules/coding-standards.md)
- [Tech Stack Documentation](../docs/architecture/tech-stack.md)
- [Testing Strategy Guide](../docs/testing/)
- [Healthcare Compliance Guide](../docs/compliance/)
