<!--
# Sync Impact Report
- **Version change**: 1.1.0 → 2.0.0 (major update - comprehensive architecture integration)
- **Modified principles**: All principles enhanced with architectural knowledge and design patterns
- **Added sections**:
  - Architecture & Design Patterns (new section)
  - Documentation Standards (new section)
  - Performance & Reliability Targets (expanded)
- **Removed sections**: None
- **Templates requiring updates**:
  - ⚠ .specify/templates/plan-template.md (pending - add architecture validation)
  - ⚠ .specify/templates/spec-template.md (pending - add design pattern requirements)
  - ⚠ .specify/templates/tasks-template.md (pending - add architecture review tasks)
- **Follow-up TODOs**:
  - Update templates to reference architecture documentation catalog
  - Add architecture review checklist to PR template
  - Create architecture decision record (ADR) template

Rationale for MAJOR version bump:
- Fundamental shift from basic principles to comprehensive architecture-driven governance
- Introduction of mandatory design patterns and architectural standards
- New documentation requirements that affect all development workflows
- Breaking change: All new features must now follow documented architectural patterns
-->

# NeonPro Constitution

## Core Principles

### I. Aesthetic Clinic Compliance First (NON-NEGOTIABLE)

Every feature MUST comply with Brazilian aesthetic clinic regulations: LGPD for data protection, ANVISA for equipment and cosmetic product standards, and relevant professional council regulations (CFM, COREN, CFF, CNEP) for aesthetic procedures. Compliance is not optional - it's the foundation of everything we build.

**Architectural Implementation**:

- Row Level Security (RLS) policies enforce data access control at database level
- Audit trails automatically logged for all client data access via Supabase triggers
- LGPD consent management integrated into authentication flow
- Data residency enforced through Vercel São Paulo region (gru1) deployment

**Rationale**: Healthcare compliance cannot be retrofitted. Building compliance into the architecture from day one prevents costly refactoring and regulatory violations.

### II. AI-Powered Prevention Over Reaction

The platform MUST predict and prevent problems before they occur, particularly the 30% no-show rate that destroys clinic revenue. All AI systems MUST be proactive, not reactive, with measurable ROI impact for aesthetic clinics of all sizes.

**Architectural Implementation**:

- CopilotKit v1.10.5 provides universal AI chat interface across all user roles
- AG-UI Protocol enables real-time agent-to-UI communication with ~16 standard event types
- Multi-provider AI strategy: OpenAI GPT-5-mini primary, Gemini Flash 2.5 failover
- Predictive models integrated into appointment scheduling and patient engagement flows

**Rationale**: AI-first architecture enables proactive automation that traditional reactive systems cannot achieve. Real-time communication protocols ensure immediate user feedback.

### III. Mobile-First Brazilian Aesthetic Experience

The platform is designed specifically for Brazilian aesthetic clinics with 95% mobile usage. WhatsApp integration, Portuguese language processing, and Brazilian aesthetic procedure workflows are core requirements, not afterthoughts.

**Architectural Implementation**:

- Touch-optimized interfaces with minimum 44px touch targets (WCAG 2.1 AA+)
- Progressive Web App (PWA) capabilities for app-like mobile experience
- Offline-capable core functions using TanStack Query cache
- <2s page loads on 3G connections through edge-first optimization

**Rationale**: Mobile-first is not responsive design - it's a fundamental architectural decision affecting data loading, caching strategies, and interaction patterns.

### IV. Type Safety & Data Integrity

End-to-end TypeScript with strict mode is MANDATORY. All data flows MUST be type-safe from database to UI, with Zod validation for all data boundaries. Client and clinic data integrity cannot be compromised.

**Architectural Implementation**:

- TypeScript 5.9.2+ strict mode across entire monorepo
- Supabase generated types published to `@neonpro/types` package
- Zod schemas for all tRPC procedures and API boundaries
- TanStack Router provides type-safe routing with loader validation

**Rationale**: Type safety prevents entire classes of runtime errors. Generated types from database schema ensure database-to-UI type consistency without manual synchronization.

### V. Performance & Reliability for Aesthetic Clinics

The system MUST achieve <2s page loads, <500ms API responses, and 99.9% uptime. Brazilian infrastructure constraints (3G/4G connections) and aesthetic clinic workflow patterns MUST be considered in all performance optimizations.

**Architectural Implementation**:

- Edge-first architecture: Hono on Vercel Edge for read operations (TTFB <150ms P95)
- Node runtime only for sensitive operations requiring service_role access
- TanStack Query v5 with optimistic updates and cache patching
- Supabase real-time subscriptions for live data updates without polling

**Performance Targets** (NON-NEGOTIABLE):

- Edge read TTFB: <150ms (P95)
- API response time: <500ms (P95)
- Page load (3G): <2s (P95)
- Real-time UI patch: <1.5s (P95)
- Cold dev start: <2s (Vite)
- System uptime: 99.9%

**Rationale**: Performance is a feature, not an optimization. Edge-first architecture and real-time subscriptions provide the responsiveness required for clinic operations.

### VI. Privacy & Security by Design for Aesthetic Clients

Client data protection is paramount. All systems MUST implement encryption at rest and in transit, complete audit trails, and automatic PII redaction. Brazilian data residency requirements MUST be respected for all aesthetic clinic client information.

**Architectural Implementation**:

- Supabase RLS policies enforce multi-tenant data isolation
- JWT tokens carry `clinic_id` and `role` for authorization
- Automatic PII redaction in AI conversations (7-day retention maximum)
- End-to-end encryption: TLS in transit, AES-256 at rest

**Rationale**: Security cannot be added later. Architecture-level security through RLS and JWT-based authorization provides defense in depth.

## Architecture & Design Patterns

### Mandatory Architectural Patterns

All system components MUST follow these architectural patterns as documented in `/docs/architecture/`:

**Clean Architecture** (NON-NEGOTIABLE):

- Separation of concerns with dependency inversion
- Business logic independent of frameworks and UI
- Domain layer at the center, infrastructure at the edges
- Dependencies point inward toward domain

**Domain-Driven Design (DDD)**:

- Business logic organized by healthcare domains (appointments, treatments, inventory)
- Ubiquitous language shared between code and domain experts
- Bounded contexts for multi-professional coordination (CFM, COREN, CFF, CNEP)
- Aggregate roots enforce consistency boundaries

**Event-Driven Architecture**:

- Asynchronous processing via Supabase real-time subscriptions
- Event sourcing for audit trails and compliance
- Domain events for cross-module communication
- Eventual consistency where appropriate

**CQRS (Command Query Responsibility Segregation)**:

- Edge runtime for read-heavy, side-effect-free queries
- Node runtime for write operations requiring service_role access
- Separate optimization paths for reads vs writes
- TanStack Query cache as read model

**Repository Pattern**:

- Data access abstraction through Supabase clients
- Domain models independent of database schema
- Type-safe queries with generated Supabase types
- Consistent error handling across data layer

**Rationale**: These patterns are not optional - they're the foundation of a maintainable, scalable healthcare platform. Deviations require explicit architectural review and approval.

### Component Architecture Standards

**Atomic Design Methodology** (MANDATORY):

- **Atoms**: Basic UI elements from `@neonpro/ui` (Button, Badge, Alert, Card)
- **Molecules**: App-specific combinations (SearchBox, PatientCard, AppointmentForm)
- **Organisms**: Complex features (Dashboard, AppointmentScheduler, GovernanceDashboard)

**Import Hierarchy** (MUST follow this exact order):

```typescript
// 1. Shared components first
import { Alert, Badge, Button, Card } from '@neonpro/ui'
// 2. Organisms third
import { Dashboard, GovernanceDashboard } from '@/components/organisms'
// 3. Molecules second
import { AppointmentForm, ClientCard } from '@/components/molecules'
// 4. Domain-specific last
import { AestheticClinicSpecific } from '@/components/aesthetic-clinic'
```

**Base Component Interface**:

```typescript
interface AestheticClinicComponentProps {
  readonly clientId?: string
  readonly userRole: 'admin' | 'professional' | 'coordinator'
  readonly lgpdCompliant: boolean
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void
}
```

## Technology & Compliance Standards

### Brazilian Aesthetic Clinic Technology Stack

**Monorepo & Tooling** (MANDATORY):

- **Turborepo**: Task orchestration with intelligent caching (3-5x faster builds)
- **Bun (primary)**: Package manager and runtime (3-5x faster than npm)
- **PNPM (fallback)**: Alternative package manager for compatibility
- **TypeScript 5.9.2+ (strict)**: Shared types across apps/packages

**Frontend Stack** (MANDATORY):

- **Vite 7.x**: Dev server with <2s cold start, HMR <100ms
- **React 19**: Concurrent features, automatic batching, transitions
- **TanStack Router**: File-based, type-safe routing with loaders
- **TanStack Query v5**: Server state management with real-time cache updates
- **Tailwind CSS + shadcn/ui**: Accessible, consistent UI components
- **CopilotKit v1.10.5**: Conversational AI UI infrastructure
- **AG-UI Protocol**: Real-time agent-to-UI communication

**Backend Stack** (MANDATORY):

- **Hono 4.x**: Edge-first web framework hosting tRPC
- **tRPC v11**: End-to-end type-safe APIs without code generation
- **Supabase**: PostgreSQL + Auth + Real-time + RLS + Edge Functions
- **Zod 4.x**: Runtime validation as single source of truth

**Data Layer** (MANDATORY):

- **PostgreSQL 15+**: Primary database via Supabase
- **Supabase Auth**: JWT-based authentication with RLS integration
- **Supabase Real-time**: Postgres Changes subscriptions
- **Row Level Security (RLS)**: Multi-tenant data isolation
- **Generated Types**: `supabase gen types` published to `@neonpro/types`

**Testing & Quality** (MANDATORY):

- **Vitest 3.x**: Unit and integration testing
- **Playwright 1.4x**: End-to-end and smoke testing
- **Oxlint**: Fast linting with zero config
- **dprint**: Code formatting
- **90%+ coverage**: Required for critical healthcare components

**Deployment** (MANDATORY):

- **Vercel**: Edge Functions + Node Functions
- **Region**: gru1 (São Paulo) for Brazilian data residency
- **Edge Runtime**: Read operations, TTFB <150ms
- **Node Runtime**: Write operations with service_role access

**Version Requirements**:

- React 19.x, TanStack Router/Query latest stable
- Vite 7.x, Hono 4.x, tRPC 11.x
- Supabase JS 2.x, TypeScript 5.9+, Zod 4.x

**Brazilian Aesthetic Compliance Requirements** (NON-NEGOTIABLE):

- **LGPD**: Granular consent management, audit trails, data portability, right to erasure
- **ANVISA**: Equipment registration tracking, cosmetic product control, procedure documentation
- **Professional Councils**: CFM, COREN, CFF, CNEP scope validation and compliance
- **Data Residency**: All client and clinic data MUST remain in Brazil (Vercel gru1 region)

**Rationale**: Technology choices are architectural decisions. This stack provides type safety, performance, and compliance while minimizing complexity.

### AI Governance Standards

**Multi-Provider Strategy** (MANDATORY):

- **Primary**: OpenAI GPT-5-mini for production workloads
- **Failover**: Google Gemini Flash 2.5 with exponential backoff
- **Integration**: CopilotKit v1.10.5 + AG-UI Protocol for real-time communication

**Data Protection** (NON-NEGOTIABLE):

- **Retention**: 7-day maximum for AI conversation logs
- **PII Redaction**: Automatic redaction in all AI conversations
- **Audit Trails**: Complete logging of AI interactions for compliance
- **Portuguese Language**: Native Brazilian Portuguese support for aesthetic terminology

**Performance Requirements**:

- AI response time: <2s for 95% of queries
- Real-time UI updates: <1.5s for agent-to-UI communication
- Failover time: <5s for provider switching

**Rationale**: AI governance prevents compliance violations and ensures reliable service. Multi-provider strategy provides resilience against API failures.

## Development Workflow

### MCP-First Development (MANDATORY)

All development must follow the exact MCP sequence:

1. **sequential-thinking** → Analysis and decomposition
2. **archon** → Task management and knowledge base
3. **serena** → Codebase analysis (NEVER use native search)
4. **contextual tools** → As needed per task requirements
5. **desktop-commander** → Implementation and operations

### Agent Coordination Matrix

**Single Agent Tasks** (simple bugs, features):

- **apex-dev**: Full-stack development and coordination
- **apex-researcher**: Multi-source research and compliance validation
- **apex-ui-ux-designer**: WCAG 2.1 AA+ compliant interfaces

**Multi-Agent Coordination** (complex features):

- **apex-researcher** → **apex-dev** → **apex-ui-ux-designer** → **code-reviewer**
- **architect-review** → **apex-dev** → **security-auditor** for architecture work

### Quality Gates (NON-NEGOTIABLE)

**Testing Requirements**:

- **Unit Tests**: Vitest for business logic and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Playwright for critical user journeys
- **Coverage**: 90%+ for healthcare-critical components (appointments, treatments, billing)
- **Test Categories**: Success cases, error cases, edge cases, compliance scenarios

**Performance Requirements**:

- **Core Web Vitals**: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1
- **API Response**: <500ms P95 for all endpoints
- **Bundle Size**: <1MB total, <200KB per route
- **Lighthouse Score**: ≥90 for performance, accessibility, best practices

**Security Requirements**:

- **Linting**: Oxlint with zero warnings policy
- **Security Scanning**: Automated vulnerability scanning in CI/CD
- **Dependency Audit**: Regular npm/bun audit with immediate patching
- **RLS Validation**: All database queries must respect Row Level Security

**Compliance Requirements**:

- **LGPD Validation**: Automated consent and data access checks
- **Professional Scope**: Validation of professional council regulations
- **Audit Logging**: All sensitive operations must be logged
- **Data Residency**: Verification of Brazilian data storage

**Rationale**: Quality gates prevent regressions and ensure production readiness. Automated validation catches issues before they reach production.

### Documentation Standards

All documentation MUST follow the Diátaxis framework and standards defined in `/docs/agents/documentation.md`:

**Documentation Forms** (MANDATORY):

- **Tutorial**: Learning-oriented, hands-on lessons for new developers
- **How-to**: Task-oriented, practical guides for specific problems
- **Reference**: Information-oriented, technical descriptions and specifications
- **Explanation**: Understanding-oriented, clarification and discussion of design decisions

**YAML Front Matter** (REQUIRED):

```yaml
---
title: "Document Title"
last_updated: YYYY-MM-DD
form: tutorial | how-to | reference | explanation
tags: [relevant, tags, here]
related:
  - ./related-doc-1.md
  - ./related-doc-2.md
---
```

**Architecture Documentation** (MANDATORY):

- **Technical Decisions**: All architectural decisions must be documented with rationale
- **Design Patterns**: Pattern usage must reference architecture documentation
- **Cross-References**: Maintain accurate links between related documents
- **Healthcare Compliance**: LGPD, ANVISA, CFM considerations in all architectural guidance

**Code Documentation** (MANDATORY):

- **Self-Documenting Code**: Clear naming, small functions, obvious intent
- **JSDoc for Public APIs**: Type definitions and usage examples
- **No Obvious Comments**: Avoid comments that restate what code does
- **Why Not What**: Comments explain reasoning, not mechanics

**User Stories** (MANDATORY):

- **Brazilian Context**: All features must include aesthetic clinic use cases
- **User Personas**: Reference clinic owner, coordinator, or patient personas
- **Compliance Context**: LGPD and professional council considerations
- **Success Criteria**: Measurable outcomes for feature acceptance

**Architecture Documentation Catalog**:

- `/docs/architecture/architecture.md` - System architecture overview
- `/docs/architecture/tech-stack.md` - Technology decisions and rationale
- `/docs/architecture/source-tree.md` - Monorepo organization
- `/docs/architecture/frontend-architecture.md` - Frontend patterns
- `/docs/architecture/saas-flow.md` - Application flows and user journeys
- `/docs/architecture/ai-agents-architecture.md` - AI integration patterns
- `/docs/architecture/prd.md` - Product requirements
- `/docs/architecture/AGENTS.md` - Architecture documentation guide

**Rationale**: Documentation as code ensures knowledge is versioned, reviewed, and maintained with the same rigor as implementation code.

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. All code reviews, pull requests, and architectural decisions MUST verify compliance with these principles.

**Hierarchy of Authority**:

1. **Constitution** (this document) - Highest authority
2. **Architecture Documentation** (`/docs/architecture/`) - Technical implementation of principles
3. **Coding Standards** (`/docs/rules/coding-standards.md`) - Detailed implementation guidelines
4. **Team Conventions** - Project-specific practices that don't conflict with above

**Conflict Resolution**: In case of conflict between documents, higher authority prevails. Conflicts must be resolved through amendment process.

### Amendment Process

**Version Numbering** (Semantic Versioning):

- **MAJOR (X.0.0)**: Backward-incompatible governance changes, principle removals/redefinitions
- **MINOR (x.Y.0)**: New principles added, materially expanded guidance, new sections
- **PATCH (x.y.Z)**: Clarifications, wording improvements, typo fixes, non-semantic refinements

**Amendment Requirements**:

- **Major Changes**: Full team review + unanimous approval + 2-week review period
- **Minor Updates**: Lead architect + compliance officer approval + 1-week review period
- **Patch Updates**: Lead architect approval + immediate implementation
- **Emergency Changes**: CTO approval for immediate regulatory compliance

**Amendment Process**:

1. Proposal submitted with rationale and impact analysis
2. Review period with team feedback
3. Approval by required authorities
4. Version increment following semantic versioning
5. Migration plan and rollback strategy (for major/minor)
6. Documentation update across all affected files
7. Team notification and training (for major/minor)

**Documentation Sync**: All amendments MUST update:

- This constitution file with new version and sync impact report
- Architecture documentation if patterns/standards change
- Template files if workflow changes
- Agent configuration if responsibilities change

### Compliance Review

**Regular Reviews**:

- **Weekly**: Architecture documentation accuracy validation
- **Monthly**: Full constitution compliance audit across codebase
- **Quarterly**: External aesthetic clinic compliance review (LGPD, ANVISA, CFM)
- **Annually**: Complete constitution review and update with team retrospective

**Trigger-Based Reviews** (Immediate):

- Brazilian healthcare regulatory changes (LGPD, ANVISA, CFM updates)
- Major security vulnerabilities discovered
- Significant architecture pattern changes
- Technology stack major version updates

**Review Deliverables**:

- Compliance audit report with findings
- Remediation plan for non-compliance
- Constitution amendment proposals if needed
- Team training updates

### Enforcement Mechanisms

**Automated Enforcement**:

- **CI/CD Pipeline**: Constitution validation checks in all builds
- **Pre-commit Hooks**: Linting, formatting, type checking
- **PR Templates**: Constitutional compliance checklist
- **Automated Tests**: 90%+ coverage requirement enforced

**Manual Enforcement**:

- **Code Reviews**: All PRs must validate constitutional compliance
- **Architecture Reviews**: Major features require architecture review against patterns
- **Security Reviews**: Sensitive operations require security audit
- **Compliance Reviews**: Healthcare features require compliance validation

**Training & Onboarding**:

- **New Developers**: Complete constitution training within first week
- **Quarterly Refreshers**: Team-wide constitution review sessions
- **Documentation**: Maintain up-to-date onboarding materials
- **Knowledge Sharing**: Regular architecture and compliance discussions

**Exception Process**:

- **Request**: Non-compliance requires written justification
- **Review**: Lead architect + compliance officer review
- **Approval**: CTO approval required with documented rationale
- **Tracking**: All exceptions logged with expiration date
- **Remediation**: Plan required to bring into compliance

**Consequences**:

- **First Violation**: Warning + remediation training
- **Repeated Violations**: Escalation to team lead
- **Severe Violations**: Immediate escalation to CTO
- **Security/Compliance Violations**: Immediate production rollback if deployed

### Success Metrics

**Architecture Quality**:

- Architecture Grade: A- (9.2/10) or higher
- Design pattern compliance: 100%
- Documentation coverage: 100% of architecture decisions
- Cross-reference integrity: Zero broken links

**Performance Targets**:

- Edge read TTFB: <150ms (P95)
- API response time: <500ms (P95)
- Page load (3G): <2s (P95)
- System uptime: 99.9%

**Quality Metrics**:

- Test coverage: ≥90% for critical components
- Lighthouse score: ≥90 for all metrics
- Zero security vulnerabilities in production
- Zero LGPD compliance violations

**Team Metrics**:

- Constitution training completion: 100%
- PR compliance rate: ≥95%
- Architecture review completion: 100% for major features
- Documentation currency: <30 days outdated

---

**Version**: 2.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-29

**Change Log**:

- **2.0.0** (2025-09-29): Major update - comprehensive architecture integration, new design patterns section, expanded documentation standards
- **1.1.0** (2025-09-23): Minor update - scope clarification for aesthetic clinic focus
- **1.0.0** (2025-09-23): Initial constitution ratification
