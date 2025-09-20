<!-- Sync Impact Report -->
<!-- Version change: 1.1.0 → 1.2.0 -->
<!-- Modified principles: Technology Stack Standards, Security & Privacy Standards -->
<!-- Added sections: Authentication & Authorization Stack -->
<!-- Removed sections: None -->
<!-- Templates requiring updates: ✅ plan-template.md ✅ tasks-template.md ✅ spec-template.md -->
<!-- Follow-up TODOs: None -->

# NeonPro Constitution

## Core Principles

### I. Healthcare-First Development
Every feature MUST prioritize patient safety, data privacy (LGPD), and healthcare compliance. All development decisions MUST consider impact on healthcare workflows, emergency response times, and regulatory requirements. Brazilian healthcare standards (ANVISA, CFM) MUST be integrated into all design decisions.

### II. AI-Native Architecture
All systems MUST be designed with AI integration as a core requirement, not an afterthought. Machine learning pipelines MUST be built for Brazilian Portuguese language processing and healthcare-specific predictive analytics. Data structures MUST support real-time learning and behavioral pattern recognition.

### III. Test-Driven Healthcare (NON-NEGOTIABLE)
TDD is MANDATORY for all healthcare-critical features: Tests MUST be written → User approved → Tests fail → Then implement. RED-GREEN-REFACTOR cycle strictly enforced with healthcare-specific test cases including emergency scenarios, compliance validation, and patient safety checks.

### IV. Brazilian Regulatory Compliance
All code MUST comply with LGPD (Lei Geral de Proteção de Dados), ANVISA regulations, and CFM (Conselho Federal de Medicina) standards. Patient data encryption, audit trails, and consent management MUST be implemented at all levels. International privacy standards MUST be adapted for Brazilian healthcare context.

### V. Performance for Clinical Environments
All systems MUST meet clinical-grade performance standards: Emergency response <200ms, Patient record loading <1.5s, Real-time updates <100ms. Mobile-first design MUST support tablet use in clinical settings with touch-optimized interfaces and offline capabilities for unstable network conditions.

## Technology Stack Standards

### Frontend Excellence (apps/web)
TanStack Router for type-safe routing, Vite for fast development, React 19 with concurrent features, TypeScript 5.9.2 for maximum type safety, Tailwind CSS for healthcare-optimized styling, and shadcn/ui v4 for WCAG 2.1 AA+ compliant components.

### Backend Architecture (apps/api)
tRPC v11.0.0 for end-to-end type-safe APIs, Supabase for PostgreSQL with RLS (Row Level Security), comprehensive healthcare audit logging, and real-time subscriptions for clinical workflows.

### Development Infrastructure
Turborepo for monorepo management, PNPM for efficient package management, Bun for fast script execution (3-5x faster than npm), and comprehensive testing with Vitest, Playwright, and healthcare-specific test suites.

## Security & Privacy Standards

### HTTPS Implementation Standards (MANDATORY)
1. **HTTPS Everywhere**: ALL production traffic MUST use HTTPS with TLS 1.3 or higher
2. **HSTS Enforcement**: HTTP Strict Transport Security MUST be enabled with max-age ≥ 31536000 (1 year), includeSubDomains, and preload
3. **Certificate Management**: SSL/TLS certificates MUST be automatically renewed and monitored for expiration
4. **Security Headers**: Comprehensive security headers MUST be implemented including:
   - Strict-Transport-Security
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy
   - Referrer-Policy
5. **Mixed Content Prevention**: All resources MUST be served over HTTPS; mixed content is strictly prohibited
6. **Forward Secrecy**: Perfect Forward Secrecy (PFS) cipher suites MUST be supported
7. **Certificate Transparency**: All certificates MUST support Certificate Transparency logging

### Data Protection Architecture
All patient data MUST be encrypted at rest (AES-256) and in transit (TLS 1.3). Role-based access control MUST be implemented with granular permissions for different healthcare roles (doctors, nurses, receptionists, administrators). Audit trails MUST track all data access and modifications with user attribution.

### LGPD Compliance Framework
Explicit patient consent MUST be obtained and documented for all data processing operations. Data retention policies MUST be enforced automatically. Right to access, rectification, and deletion MUST be implemented with immediate effect upon patient request.

### Healthcare Security Patterns
Zero-trust architecture MUST be implemented throughout the system. Multi-factor authentication MUST be required for all healthcare operations. Security vulnerabilities MUST be patched within 24 hours of discovery for critical issues.

## Authentication & Authorization Stack

### Primary Authentication
**Supabase Auth v2.38.5** MUST be used as the primary authentication provider with LGPD-compliant features, built-in MFA, social providers, and Brazilian data residency.

### Biometric Authentication
**WebAuthn (@simplewebauthn/server)** MUST be implemented for passwordless authentication with FIDO2 compliance, supporting fingerprint, Face ID, and hardware keys.

### Token Management
**JOSE Library** MUST be used for secure JWT token handling with Web Crypto API compliance, edge runtime compatibility, and proper signature verification.

### Password Security
**bcryptjs v2.4.3** MUST be used for password hashing with cost factor 12+, serverless optimization, and timing attack protection. Migration to Argon2id MUST be implemented for new passwords.

## Quality Gates

### Healthcare Testing Requirements
- Unit test coverage ≥90% for all patient-critical features
- Integration tests MUST validate all healthcare workflows
- E2E tests MUST simulate real clinical usage scenarios
- Performance tests MUST validate clinical SLAs under load
- Security tests MUST pass OWASP healthcare compliance checks
- HTTPS/TLS configuration MUST be validated for all endpoints

### Code Quality Standards
- TypeScript strict mode MUST be enabled
- ESLint with healthcare-specific rules MUST pass
- Code reviews MUST include healthcare compliance validation
- All pull requests MUST require at least one healthcare domain expert approval
- Critical healthcare features MUST undergo additional security audit

### Performance Requirements
- LCP (Largest Contentful Paint) ≤2.5s for all patient-facing pages
- INP (Interaction to Next Paint) ≤200ms for emergency operations
- CLS (Cumulative Layout Shift) ≤0.1 for all interfaces
- API response times ≤500ms for 95th percentile
- Real-time update latency ≤100ms for clinical data
- HTTPS handshake time ≤300ms

## Development Workflow

### A.P.T.E Methodology
**Analyze** → Comprehensive requirements analysis with healthcare stakeholders
**Plan** → Strategic implementation planning with compliance validation
**Think** → Constitutional analysis and multi-perspective evaluation
**Execute** → Systematic implementation with quality gates

### Agent Coordination
Specialized agents MUST be used for healthcare development: apex-dev for core implementation, apex-researcher for healthcare compliance research, apex-ui-ux-designer for accessible interfaces, security-auditor for vulnerability assessment, and tdd-orchestrator for test management.

### Constitutional Compliance
All development MUST follow the KISS principle: Choose simplest solution that meets healthcare requirements. YAGNI principle MUST be applied: Build only what current healthcare requirements specify. Chain of thought MUST be maintained: Break problems into sequential steps with healthcare context validation.

## Governance

### Amendment Process
Constitution amendments require documentation, healthcare expert approval, and migration plan. All changes MUST be validated against existing healthcare compliance requirements. Version management follows semantic versioning with MAJOR for breaking healthcare changes, MINOR for new healthcare features, and PATCH for clarifications.

### Compliance Review
Quarterly healthcare compliance reviews MUST be conducted. All new regulations MUST be assessed and integrated within 30 days of announcement. Patient safety impact assessments MUST be performed for all significant changes.

### Enforcement
The constitution supersedes all other development practices. All pull requests and code reviews MUST verify constitutional compliance. Complex implementations MUST be justified with aesthetic clinic-specific rationale. Use `.claude/CLAUDE.md` and `.specify/memory/constitution.md` for runtime development guidance.

**Version**: 1.2.0 | **Ratified**: 2025-09-20 | **Last Amended**: 2025-09-20