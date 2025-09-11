# Testing Responsibility Matrix (NeonPro)

Purpose: Define scope, audience, mandatory vs optional, and CI integration for each test type.

| Test Type | Scope | Audience | Mandatory? | CI Stage | Notes |
|---|---|---|---|---|---|
| Unit | Functions, components, hooks | Devs | Yes (critical paths) | Unit | React 19, utils, validators |
| Integration | API endpoints, DB, service orchestration | Devs/QA | Yes | Integration | Hono routes, Supabase, RLS |
| E2E | Critical user flows | QA/Devs | Yes (critical flows) | E2E | Playwright, a11y checks |
| Performance | Rendering, API latency | Devs/Architects | Optional (targeted) | Post-E2E | Benchmarks, budgets |
| Security | Dependency + static analysis | DevOps/Sec | Yes | Security | Fail on high/critical |
| Compliance | LGPD/ANVISA/CFM checklist | QA/Compliance | Yes | Compliance | Artifacts retained |

- Coverage per `coverage-policy.md` (≥95% critical, ≥85% important, ≥75% useful)
- Privacy: No real PII in tests or artifacts (LGPD)
- RLS: Deny-by-default validated on sensitive tables

