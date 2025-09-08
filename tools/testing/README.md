# NeonPro Healthcare Testing Infrastructure

## Overview

Unified testing infrastructure for the NeonPro healthcare monorepo, designed to provide comprehensive test coverage, efficient execution, and clear reporting while maintaining LGPD+ANVISA+CFM compliance.

## Directory Structure

```
tools/testing/
├── unit/                    # Unit tests (migrated from __tests__/)
│   ├── setup/              # Test setup configurations
│   ├── setup.ts            # Main test setup file
│   └── README.md           # Unit testing guidelines
├── e2e/                     # End-to-end tests ✅ CONSOLIDATED LOCATION
│   ├── tests/              # ✅ All E2E test files (constitutional structure)
│   │   ├── auth/           # Authentication & authorization tests
│   │   ├── healthcare/     # Healthcare-specific workflow tests
│   │   ├── patient-management/ # Patient management E2E tests
│   │   ├── core/           # Core system functionality tests
│   │   ├── security/       # Security & compliance tests
│   │   └── performance/    # Performance & accessibility tests
│   ├── fixtures/           # Test fixtures and data
│   ├── utils/              # E2E testing utilities
│   └── README.md           # E2E testing guidelines
├── mocks/                   # Test mocks (migrated from __mocks__/)
│   └── README.md           # Mocking guidelines
├── reports/                 # Test reports and coverage
│   ├── unit/               # Unit test reports
│   ├── e2e/                # E2E test reports
│   └── README.md           # Reporting documentation
├── configs/                 # Shared test configurations
│   ├── vitest.config.ts    # Vitest configuration
│   ├── playwright.config.ts # Playwright configuration
│   └── jest.config.js      # Jest configuration (legacy)
- pages/: Test-only Next.js pages used exclusively for E2E, not shipped to production
└── README.md               # This file
```

## Testing Commands

### Unified Test Execution

```bash
# Run all tests across the monorepo
pnpm test

# Run specific test types
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:e2e               # End-to-end tests only
pnpm test:healthcare        # Healthcare-specific tests
pnpm test:compliance        # Compliance tests (LGPD/ANVISA/CFM)

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## Healthcare Compliance Testing

### LGPD Compliance Tests

- Data privacy validation
- Consent management testing
- Data subject rights verification
- Privacy impact assessment tests

### ANVISA Compliance Tests

- Medical device validation scenarios
- Product registration testing
- Adverse event reporting tests
- Procedure classification validation

### CFM Standards Tests

- Medical professional standards compliance
- Professional licensing validation
- Digital signature verification
- Electronic prescription testing
- Telemedicine compliance validation

## Test Configuration

### Framework Stack

- **Vitest**: Primary test runner for unit and integration tests
- **Playwright**: End-to-end testing framework
- **Jest**: Legacy compatibility where needed
- **Istanbul**: Code coverage reporting
- **Biome**: Exclusive linting and formatting (ESLint and Prettier fully migrated)

### Quality Standards

- **Minimum Coverage**: 90% across all packages
- **Healthcare Quality**: ≥9.9/10 quality standards
- **Performance**: Optimized test execution with Turborepo caching
- **Security**: Automated security tests for healthcare data protection

## CI/CD Integration

Tests are automatically executed in the CI/CD pipeline with:

- Parallel execution for performance optimization
- Test result aggregation and reporting
- Automatic retries for flaky tests
- Test artifact storage and comprehensive reporting
- Quality gates enforcement based on test results

## Contributing

When adding new tests:

1. Follow the established directory structure
2. Use appropriate test frameworks for the test type
3. Include healthcare compliance validation where applicable
4. Ensure tests meet the 90% coverage requirement
5. Update documentation as needed

## Healthcare Data Protection

All test data must comply with:

- LGPD requirements for data privacy
- ANVISA regulations for medical device testing
- CFM standards for medical professional validation
- Comprehensive audit trails for all test executions
