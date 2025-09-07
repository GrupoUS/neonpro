# Coverage Policy (NeonPro Healthcare)

> Purpose: Define coverage requirements and enforcement mechanisms aligned with healthcare compliance and risk.

## Coverage Targets (by component type)

- 🔥 Critical (≥ 95%)
  - Business logic (billing, credits, limits)
  - AI agents/services core logic
  - Public APIs and authentication flows
  - Financial operations and audit trail

- ⚡ Important (≥ 85%)
  - Complex hooks and stateful UI logic
  - Core utilities and validators
  - Data access layers and service orchestration

- ✅ Useful (≥ 75%)
  - UI components with simple logic
  - Helper modules

## Reporting & Enforcement

- Generate coverage per stage: unit, integration, e2e (where applicable)
- Merge coverage reports for global visibility
- Fail CI if thresholds not met (see ci-pipelines.md)
- PRs must not reduce coverage in critical modules without approval

## Compliance Requirements (Healthcare)

- LGPD: Test data anonymization; no real PII in fixtures
- ANVISA/CFM: Validate that clinical guidance follows approved content
- Access Control: Enforce RLS and authorization in tested paths
- Auditability: Store coverage reports as artifacts for traceability

## Exemptions & Justifications

- Third-party wrappers or generated code with no business logic
- Deprecated modules pending removal
- Temporary exemptions require:
  - Business-owner approval
  - Jira/Linear ticket reference
  - Expiration date and mitigation plan

## Developer Workflow

- Before coding: Write/adjust tests for expected behavior
- During PR: Ensure coverage summaries meet targets
- Before merge: Run coverage:verify script locally and in CI
- After merge: Monitor trends; address declines promptly
