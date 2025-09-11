# NeonPro Constitution

<!-- AI-First Advanced Aesthetic Platform for Brazilian Healthcare -->

## Core Principles

### I. AI-First Healthcare Development

Portuguese-optimized AI drives all system interactions; Every feature must integrate intelligent automation; Healthcare workflows require conversational AI support with emergency detection; Brazilian healthcare terminology and cultural context required; AI responses must achieve <2 second response time for clinic operations

### II. Compliance by Design

LGPD compliance built into every data operation; ANVISA device validation integrated by default; CFM professional registration verification required; Audit trail mandatory for all patient data access; Row Level Security (RLS) enforced at database level; Granular consent management with timestamp tracking

### III. Type-Safe Healthcare Development

TypeScript mandatory across entire stack (frontend, backend, database); Healthcare-specific type definitions required (PatientId, CPF, AppointmentStatus); Zod validation schemas for all API boundaries; No `any` types in healthcare domain logic; Database operations must use strongly-typed clients (Supabase)

### IV. Test-Driven Development (NON-NEGOTIABLE)

Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Healthcare business logic requires >95% test coverage; Integration tests mandatory for patient data workflows; E2E tests required for appointment scheduling and AI chat; Critical paths (emergency detection, no-show prediction) require comprehensive test suites

### V. Performance & Reliability Standards

AI chat responses: <2 seconds response time; System uptime: 99.9% availability requirement; Mobile-first design for Brazilian clinic workflows; PWA functionality for offline basic operations; Database queries optimized for clinic-scale operations; Real-time subscriptions for appointment updates

### VI. Simplicity & Necessity (KISS + YAGNI)

Choose simplest solution that meets healthcare requirements; Prefer readable code over clever optimizations; Build only what current clinic workflows specify; Remove unused code immediately; "Does this solve the core healthcare problem without unnecessary complexity?"; Clear, descriptive naming with healthcare terminology

### VII. Chain of Thought Development

Break healthcare problems into sequential, traceable steps; Verbalize reasoning process in healthcare context; Show intermediate decisions with medical logic; Question assumptions about clinic workflows; Validate solutions against Brazilian healthcare regulations; Each implementation step follows logically from previous steps; Final healthcare solution traceable back to clinic requirements

## Architecture Constraints

### Technology Stack Requirements

- Frontend: TanStack Router + Vite + React 19 (File-based routing)
- Backend: Supabase PostgreSQL with RLS + Hono.dev API
- AI: OpenAI GPT-4 with Portuguese optimization
- UI: shadcn/ui with healthcare themes
- State: Zustand + React Server Components
- Monorepo: Turborepo 2.5.6 with 8 essential packages

### Healthcare Data Requirements

- Encrypted PII storage (CPF, RG) using PostgreSQL bytea
- LGPD consent tracking with granular permissions
- Audit logging for all patient data access
- Medical image storage with DICOM compliance consideration
- Brazilian timezone handling (America/Sao_Paulo)
- Portuguese language support throughout

### Integration Requirements

- WhatsApp Business API for patient communication
- Brazilian SMS providers (Zenvia, TotalVoice)
- ANVISA API for device validation
- PIX payment integration for Brazilian market
- Healthcare professional registry validation

## Development Workflow

### Mandatory Development Sequence

1. **Sequential Thinking**: Use sequential-thinking MCP first for analysis
2. **Task Management**: Use Archon MCP for task tracking and knowledge management
3. **Codebase Analysis**: Use Serena MCP for semantic code understanding (never native tools)
4. **Implementation**: Follow TDD cycle with healthcare-specific test patterns
5. **Quality Gates**: TypeScript compilation + tests + lint + healthcare compliance checks

### Code Review Requirements

- Healthcare domain expert review for medical workflows
- LGPD compliance verification for data handling
- Performance review for AI response times
- Accessibility review for clinic staff usage
- Security review for patient data protection

### Quality Standards

- TypeScript strict mode with healthcare types
- Test coverage >90% for healthcare business logic
- AI response time <2 seconds validated
- Mobile responsiveness for clinic workflows verified
- LGPD compliance automated testing included

## Security & Compliance

### Data Protection Standards

- All patient data encrypted at rest and in transit
- CPF/RG data stored encrypted with secure key management
- Database access logged with user identification
- Patient consent tracked with legal compliance
- Data retention policies automated per Brazilian healthcare law

### Authentication & Authorization

- Multi-factor authentication for healthcare professionals
- Role-based access control (dermatologist, aesthetician, coordinator)
- Session management with automatic timeout
- Professional license validation integration
- Clinic-based data isolation (multi-tenant RLS)

### Audit & Monitoring

- All patient data access logged with context
- Healthcare actions tracked for regulatory compliance
- Performance monitoring for clinic operations
- Error tracking with healthcare context
- Compliance reporting automation

## Governance

This Constitution supersedes all other development practices and architectural decisions. All code reviews, pull requests, and system changes must verify compliance with these principles. Any complexity introduced must be justified against healthcare requirements and Brazilian regulatory needs.

Architecture changes require documentation update and migration plan. Breaking changes must include compatibility strategy for existing clinic data.

Use `docs/architecture/AGENTS.md` for detailed architectural guidance and `docs/rules/coding-standards.md` for implementation-specific standards during development.

**Version**: 2.0.0 | **Ratified**: 2025-01-14 | **Last Amended**: 2025-01-14
