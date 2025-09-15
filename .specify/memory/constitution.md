# NeonPro Constitution
<!-- AI-First Advanced Aesthetic Platform for Brazilian Clinics -->

## Core Principles

### I. Compliance-First Development
Every feature must meet Brazilian healthcare regulations from design to deployment; LGPD data protection, ANVISA medical device compliance, and CFM professional standards are fundamental requirements; Patient privacy and data security are non-negotiable - all data operations require explicit consent and comprehensive audit trails.

### II. Test-Driven Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Minimum 90% test coverage for critical healthcare components (patient data, appointments, AI features, financial operations).

### III. AI-Enhanced Architecture
Conversational AI for 24/7 patient engagement in Portuguese is core infrastructure; Predictive analytics for no-show prevention (target <10% from 30%); AI-driven automation integrated throughout platform - scheduling optimization, patient triage, and operational insights.

### IV. Mobile-First Design
Optimized for smartphone-centric workflows (70%+ mobile usage by clinic staff); Touch-optimized interfaces with PWA capabilities; Responsive design mandatory - mobile experience cannot be degraded version of desktop.

### V. Real-Time Operations
Live updates essential for clinic operations and patient safety; WebSocket subscriptions for instant data synchronization; Performance targets: <500ms patient record access, <300ms appointment scheduling, 99.9% uptime.

## Healthcare-Specific Standards

### Patient Data Protection
All patient data classified as sensitive with LGPD protection requirements; Branded types for PatientId, CPF, and medical record numbers prevent data mixing; Automatic data anonymization after consent withdrawal; Comprehensive audit logging for all data access and modifications.

### Medical Terminology Standards
Clear healthcare nomenclature required - PatientRecord, MedicalRecordNumber, HealthInsuranceNumber; Error handling must include healthcare context with severity levels (low/medium/high/critical); Patient safety considerations in all UI/UX decisions.

### Audit and Compliance
Every data operation generates audit trail with timestamp, user, action, and reason; LGPD consent management with expiration tracking; Automated compliance reports for ANVISA and CFM requirements; Data retention policies aligned with Brazilian healthcare regulations.

## Technology Governance

### Required Tech Stack
Frontend: TanStack Router + Vite + React 19 + TypeScript 5.7.2; Backend: Hono.dev + Supabase + PostgreSQL 15+; AI: OpenAI GPT-4 + Anthropic Claude via Vercel AI SDK; Infrastructure: Vercel (São Paulo) + Turborepo monorepo; Quality: Vitest + Playwright + Oxlint + TypeScript strict mode.

### Performance Standards
System reliability: 99.9% uptime mandatory; Response times: <500ms patient records, <300ms scheduling, <2s AI responses; Mobile performance: 60fps animations, <100ms interactions; Database: Row Level Security (RLS) for multi-tenant isolation.

### Code Quality Requirements
Quality standard ≥9.5/10 for all implementations; Zod schemas for runtime validation of sensitive data; Healthcare-specific error handling with patient safety context; Type-safe APIs with branded types for medical identifiers.

## Development Workflow

### MCP Tool Integration
MANDATORY use of archon MCP for task management and knowledge base; MANDATORY use of serena MCP for codebase analysis (never native search); MANDATORY use of desktop-commander MCP for file operations; Use context7 and tavily for research and best practices.

### Quality Gates
All implementations follow CLAUDE.md workflow: Research → Decompose → Plan → Implement → Validate; TDD cycle for every feature: Red → Green → Refactor; Lint + type-check + test must pass before any commit; Healthcare compliance review required for patient-facing features.

### AI-Driven Development
Sequential thinking for complex problem analysis; Research-driven implementation using official documentation; One-shot resolution philosophy with complete requirement analysis; Constitutional compliance verification at each development phase.

## Governance

Constitution supersedes all other development practices and standards; All PRs and code reviews must verify constitutional compliance; Amendment requires documentation, approval from technical leadership, and migration plan; Use CLAUDE.md for runtime development guidance and MCP tool coordination.

**Version**: 1.0.0 | **Ratified**: 2025-01-15 | **Last Amended**: 2025-01-15