# NeonPro Testing Toolkit

A unified, simplified testing toolkit for the entire NeonPro project following KISS and YAGNI principles.

## Overview

This toolkit consolidates all testing utilities into a single, focused package that serves the entire project. It eliminates the complexity of multiple testing packages while maintaining all essential functionality.

## Key Principles

- **KISS (Keep It Simple, Stupid)**: Single package, clear structure, minimal abstractions
- **YAGNI (You Aren't Gonna Need It)**: Only implement what's actually needed
- **TDD-First**: Red-Green-Refactor cycle support
- **Agent Integration**: Works seamlessly with code review agents
- **Healthcare Compliance**: Built-in LGPD, ANVISA, CFM validation

## Structure

```
tools/testing-toolkit/
├── src/
│   ├── core/                 # Core testing utilities
│   ├── agents/              # Agent integration helpers
│   ├── compliance/          # Healthcare compliance validators
│   ├── fixtures/            # Test data and mocks
│   └── utils/               # Testing utilities
├── tests/                   # Self-tests for the toolkit
├── package.json            # Single package configuration
├── vitest.config.ts        # Unified test configuration
└── README.md               # This file
```

## Features

### Core Testing

- **Unit Testing**: Vitest-based with React Testing Library
- **Integration Testing**: API and service integration tests
- **E2E Testing**: Playwright for critical user workflows
- **Performance Testing**: Built-in performance benchmarks

### Agent Coordination

- **TDD Orchestrator**: Red-Green-Refactor cycle coordination
- **Code Reviewer**: Quality metrics and analysis
- **Security Auditor**: Vulnerability scanning and compliance
- **Architect Review**: Pattern validation and design review

### Healthcare Compliance

- **LGPD**: Brazilian data protection compliance
- **ANVISA**: Health surveillance validation
- **CFM**: Medical council compliance
- **Audit Trails**: Comprehensive logging and monitoring

### Quality Gates

- **Coverage Thresholds**: ≥90% critical, ≥85% important, ≥75% useful
- **Security Validation**: Zero critical vulnerabilities
- **Performance Budgets**: Automated performance monitoring
- **Compliance Checks**: Regulatory requirement validation

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run compliance validation
pnpm test:compliance

# Run with agent coordination
pnpm test:agents
```

## Integration with Code Review Agents

The toolkit is designed to work seamlessly with the existing code review agents:

- **architect-review.md**: Validates architectural patterns and design decisions
- **code-reviewer.md**: Analyzes code quality and performance
- **test-auditor.md**: Performs security and compliance validation
- **tdd-orchestrator.md**: Coordinates the complete TDD cycle

## Configuration

All configuration is centralized in `vitest.config.ts` and `package.json`, eliminating the need for multiple configuration files across different packages.

## Migration from Old Structure

This toolkit replaces the following packages:

- `@neonpro/tools-frontend-tests`
- `@neonpro/tools-backend-tests`
- `@neonpro/tools-database-tests`
- `@neonpro/tools-quality-tests`
- `@neonpro/tools-orchestration`
- `@neonpro/tools-shared`

All functionality is preserved while eliminating complexity and maintenance overhead.
