# E2E Testing Guidelines - NeonPro Healthcare

## Overview
End-to-end testing for NeonPro healthcare workflows using Playwright with focus on user journeys, healthcare compliance, and cross-browser compatibility.

## Directory Structure
```
e2e/
├── fixtures/           # Test fixtures and data
├── tests/              # E2E test files  
├── utils/              # E2E testing utilities
├── pages/              # Page object models
└── healthcare/         # Healthcare-specific E2E tests
```

## Healthcare E2E Scenarios

### Patient Management Workflows
- Patient registration with LGPD consent
- Appointment scheduling and management
- Medical record access and updates
- Treatment tracking and reporting

### Compliance Workflows  
- ANVISA device registration validation
- CFM professional verification
- Audit trail generation and validation
- Privacy controls and data subject rights

## Test Execution
```bash
# Run all E2E tests
pnpm test:e2e

# Run healthcare-specific E2E tests
pnpm test:e2e:healthcare

# Run compliance E2E tests  
pnpm test:e2e:compliance
```