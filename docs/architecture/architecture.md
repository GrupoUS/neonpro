---
title: "NeonPro System Architecture"
last_updated: 2025-09-29
form: explanation
tags: [architecture, system-design, healthcare, aesthetic-clinics, brazil]
related:
  - ./frontend-architecture.md
  - ./tech-stack.md
  - ./source-tree.md
  - ../AGENTS.md
---

# NeonPro System Architecture

## Overview

NeonPro is a mobile-first SaaS platform for Brazilian aesthetic clinics, enabling multi-professional collaboration (CFM, COREN, CFF, CNEP) with AI-powered automation, compliance management, and comprehensive financial operations.

**Current Version**: 8.0.0
**Architecture Grade**: A- (9.2/10)
**Status**: Production-ready with validated performance

## Core Principles

1. **Mobile-First**: 95% mobile usage with touch-optimized interfaces
2. **AI-Powered**: Universal AI chat as primary interaction method
3. **Compliance-First**: LGPD, ANVISA, and professional council compliance built-in
4. **Edge-Optimized**: <2s page loads on 3G, 99.9% uptime requirement
5. **Type-Safe**: End-to-end TypeScript with Zod validation
6. **Real-time by Design**: Supabase subscriptions with TanStack Query cache patching

## Design Patterns

- **Clean Architecture**: Separation of concerns with dependency inversion
- **Domain-Driven Design**: Business logic organized by healthcare domains
- **Event-Driven**: Asynchronous processing via Supabase real-time
- **CQRS**: Edge reads, Node writes with service_role for sensitive operations
- **Repository Pattern**: Data access abstraction through Supabase clients

## System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React 19)    │◄──►│   (Hono+tRPC)   │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ - TanStack      │    │ - Edge Runtime  │    │ - PostgreSQL    │
│ - Router/Query  │    │ - Node Runtime  │    │ - RLS Policies  │
│ - CopilotKit    │    │ - AG-UI Proto   │    │ - Real-time     │
│ - shadcn/ui     │    │ - Zod Validate  │    │ - Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                    Turborepo Monorepo
```

**For detailed technology choices and rationale**, see [tech-stack.md](./tech-stack.md).
**For codebase organization**, see [source-tree.md](./source-tree.md).
**For frontend patterns**, see [frontend-architecture.md](./frontend-architecture.md).

## Domain Modules

NeonPro organizes business logic into domain-focused packages within the Turborepo monorepo:

### Healthcare Operations

- **Appointments & Scheduling**: Advanced optimization with AI-powered no-show prediction
- **Treatment Planning**: Comprehensive plans with AI assessments and progress tracking
- **Inventory Management**: ANVISA-compliant product tracking with automated reordering

### Professional Coordination

- **Multi-Professional Teams**: Cross-disciplinary collaboration (CFM, COREN, CFF, CNEP)
- **Referral Workflows**: Scope-validated referrals with urgency management
- **Supervision & Mentorship**: Structured clinical supervision with autonomy tracking

### Patient Engagement

- **Multi-Channel Communication**: Email, SMS, WhatsApp, push notifications
- **Journey Tracking**: Lifecycle management with engagement scoring
- **Loyalty Programs**: Points-based rewards with tier benefits

### Financial Management

- **Billing & Invoicing**: Brazilian tax compliance (ISS, PIS, COFINS, CSLL, IRPJ)
- **Payment Processing**: PIX, boleto, credit card with installment support
- **Commission Management**: Automated professional commission calculation

### Compliance & Security

- **LGPD Automation**: Data subject rights management with audit trails
- **Professional Council Validation**: CFM, COREN, CFF, CNEP scope verification
- **ANVISA Integration**: Medical device and product tracking

**For detailed package structure**, see [source-tree.md](./source-tree.md).

## Version 8.0.0: Financial Management

### Overview

Complete financial operations for Brazilian aesthetic clinics with tax compliance, payment processing, and commission management.

### Core Capabilities

**Billing & Invoicing**

- Automatic invoice generation with Brazilian tax calculation (ISS, PIS, COFINS, CSLL, IRPJ)
- Multi-item invoices with discount management
- NFSe (electronic service invoice) generation

**Payment Processing**

- Brazilian payment methods: PIX, boleto, credit card, debit card
- Payment gateway integration: Stripe, MercadoPago, PagSeguro
- Installment plans with automated reconciliation

**Commission Management**

- Automated calculation based on services, products, packages
- Tiered commission structures with performance tracking
- Payment scheduling and detailed reporting

**Financial Analytics**

- Goal setting and progress tracking (revenue, profit, acquisition)
- P&L statements, balance sheets, cash flow analysis
- Brazilian GAAP compliance with tax reporting

### Database Schema

11 tables supporting financial operations: `financial_accounts`, `service_prices`, `treatment_packages`, `package_services`, `invoices`, `invoice_items`, `payment_transactions`, `professional_commissions`, `tax_configurations`, `financial_goals`, `financial_reports`.

**For detailed schema**, see `docs/database-schema/financial-management.md`.

## Version 7.0.0: Patient Engagement

### Overview

Comprehensive communication and engagement platform for managing patient relationships through multi-channel communication, loyalty programs, and journey tracking.

### Core Capabilities

**Multi-Channel Communication**

- Email, SMS, WhatsApp, push notifications with LGPD-compliant consent management
- Automated workflows: appointment reminders, follow-ups, birthday greetings
- Template management with variable substitution and personalization

**Patient Journey Tracking**

- Lifecycle management from lead to loyal advocate
- Engagement scoring based on interactions and behaviors
- Risk assessment for at-risk patient intervention

**Loyalty Programs**

- Points-based rewards with tier benefits
- Referral tracking and rewards
- Real-time points balance management

**Campaign Management**

- Audience segmentation with A/B testing
- Multi-sequence campaign flows
- Real-time performance tracking and analytics

### Database Schema

12 tables supporting patient engagement: `patient_communication_preferences`, `patient_communication_history`, `communication_templates`, `patient_journey_stages`, `patient_engagement_actions`, `loyalty_programs`, `patient_points_balance`, `patient_surveys`, `patient_survey_responses`, `engagement_campaigns`, `reengagement_triggers`, `campaign_analytics`.

**For detailed schema**, see `docs/database-schema/patient-engagement.md`.

## Version 6.0.0: Multi-Professional Coordination

### Overview

Seamless collaboration platform for aesthetic healthcare professionals (CFM, COREN, CFF, CNEP) with scope validation and compliance management.

### Core Capabilities

**Professional Teams**

- Dynamic team formation with role-based access and granular permissions
- Scope limitations enforcing professional boundaries
- Performance metrics and collaboration analytics

**Referral Workflows**

- Cross-council referrals with automatic scope validation
- Urgency-based routing with complete lifecycle tracking
- Response tracking and acknowledgment management

**Collaborative Sessions**

- Multi-professional treatment planning and execution
- Video conferencing with secure document sharing
- Comprehensive session documentation

**Supervision & Mentorship**

- Structured clinical and administrative supervision
- Progressive autonomy development tracking
- Performance evaluations and professional development support

### Database Schema

12 tables supporting coordination: `professional_teams`, `team_members`, `professional_referrals`, `collaborative_sessions`, `session_participants`, `coordination_threads`, `coordination_messages`, `professional_supervision`, `supervision_sessions`, `professional_scope_validation`, `coordination_protocols`, `protocol_executions`.

**For detailed schema**, see `docs/database-schema/multi-professional-coordination.md`.

## Security & Compliance

### Authentication & Authorization

**Multi-Layer Security**

- JWT-based authentication with Supabase Auth integration
- Multi-factor authentication with session timeout management
- Role-based access control (RBAC) with resource-based permissions
- Professional council validation (CFM, COREN, CFF, CNEP)
- Clinic-based data isolation via Row Level Security (RLS)

### Data Protection

**Encryption**

- AES-256 for data at rest, TLS 1.3 for data in transit
- Secure key rotation and encrypted backups
- End-to-end encryption for sensitive healthcare data

**Privacy Controls**

- LGPD compliance with data subject rights management
- Granular consent management with audit logging
- Data minimization and purpose limitation
- Automated data lifecycle and retention management

### Compliance

**Brazilian Healthcare Regulations**

- LGPD: Complete data protection compliance
- ANVISA: Medical device and product tracking
- Professional Councils: CFM, COREN, CFF, CNEP scope validation
- Tax Compliance: ISS, PIS, COFINS, CSLL, IRPJ

**Audit & Monitoring**

- Complete audit trail for all data access and modifications
- Real-time compliance monitoring with automated alerts
- Comprehensive logging for regulatory reporting

## Performance & Monitoring

### Performance Targets

**Validated Metrics (Production)**

- Build time: 8.93s
- Bundle size: 603.49 kB
- Edge read TTFB: <150ms (P95)
- Real-time UI patch: <1.5s (P95)
- Page loads: <2s on 3G connections
- Uptime: 99.9% for critical operations

### Optimization Strategy

**Multi-Layer Caching**

- CDN for static assets
- Browser service workers for offline capability
- TanStack Query for API response caching
- Supabase connection pooling

**Code Optimization**

- Route-based code splitting with TanStack Router
- Lazy loading for heavy components with Suspense
- Tree-shaking enabling optimal bundle size
- WebP images with responsive loading

**Database Optimization**

- Indexing on frequently queried fields
- Connection pooling (20 max, 5 min connections)
- Query optimization with Supabase helpers
- Real-time subscriptions for live updates

### Monitoring & Observability

**Application Metrics**

- Performance: Response times, throughput, error rates
- Business: User engagement, feature usage, conversion rates
- User Experience: Core Web Vitals (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1)

**Infrastructure Metrics**

- Database: Query performance, connection usage, storage capacity
- Network: Latency, bandwidth, edge function performance
- Security: Intrusion detection, compliance checks, audit logs
- Cost: Resource usage, optimization opportunities

**For detailed performance patterns**, see [frontend-architecture.md](./frontend-architecture.md).

## Deployment

### Environment Strategy

**Development**

- Local Supabase with Docker Compose
- Feature branches with automated testing (Vitest, Playwright)
- Code quality: OXLint, dprint, TypeScript strict mode

**Staging**

- Production mirror for load and security testing
- Compliance validation (LGPD, ANVISA, professional councils)
- Payment processing and tax calculation testing

**Production**

- Vercel deployment with Edge Functions (reads) and Node Functions (writes)
- Region: gru1 (São Paulo) preferred for Brazilian market
- High availability with automated backup and disaster recovery
- Comprehensive monitoring and alerting

### Infrastructure

**Hosting: Vercel**

- Edge runtime for read-heavy, side-effect-free endpoints
- Node runtime for sensitive operations (service_role, webhooks, cron)
- Global CDN for static asset delivery
- Automatic HTTPS and DDoS protection

**Database: Supabase**

- PostgreSQL with Row Level Security (RLS)
- Real-time subscriptions via Postgres Changes
- Automated backups with point-in-time recovery
- Connection pooling (20 max, 5 min connections)

**For deployment procedures**, see `docs/deployment/vercel-deployment.md`.

## External Integrations

### Payment Processing

- Stripe, MercadoPago, PagSeguro for credit card processing
- PIX integration for instant Brazilian payments
- Boleto generation for bank slip payments
- Automated refund handling and reconciliation

### Communication Channels

- Email: Transactional (Sendgrid/Postmark) and marketing (Mailchimp)
- SMS: Twilio for appointment reminders and notifications
- WhatsApp: Business API for rich media messaging
- Push Notifications: Web and mobile push for real-time alerts

### Calendar Systems

- Google Calendar, Outlook Calendar, Apple Calendar
- Two-way synchronization for professional availability
- Automated appointment scheduling and conflict resolution

### Healthcare Systems

- FHIR-based medical records integration
- Laboratory systems for result integration
- Pharmacy systems for prescription management
- Insurance systems for claims processing

### Tax & Compliance

- SEFAZ integration for state tax authority
- Municipal tax system integration
- NFSe generation for electronic service invoices
- Automated compliance reporting

**For API documentation**, see `docs/apis/`.

## Development Workflow

### Monorepo Organization

NeonPro uses Turborepo with pnpm workspaces:

- **apps/**: web (React), api (Hono+tRPC)
- **packages/**: ui, types, agents, config, database, domain modules

**For complete structure**, see [source-tree.md](./source-tree.md).

### Development Tools

**Build & Package Management**

- Turborepo for task orchestration and caching
- Bun (primary) + PNPM (fallback) for fast installs
- TypeScript strict mode for type safety

**Testing**

- Vitest for unit and integration tests
- Playwright for end-to-end tests
- Test coverage target: ≥90% for critical components

**Code Quality**

- OXLint for fast linting
- dprint for consistent formatting
- TypeScript strict mode for type checking

### Quality Assurance

**Testing Pyramid**

- 70% unit tests (component and function testing)
- 20% integration tests (API and service integration)
- 10% E2E tests (complete user flows)

**Code Quality Gates**

- Mandatory peer review process
- Automated linting and formatting checks
- Security scanning with vulnerability detection
- Performance profiling and optimization
- Compliance validation (LGPD, ANVISA, professional councils)

### CI/CD Pipeline

**Continuous Integration**

- Automated testing on every commit
- Code quality checks (OXLint, dprint)
- Security scanning and vulnerability detection
- Build verification with reproducible builds

**Continuous Deployment**

- Automated staging deployment
- Manual approval for production
- Automated rollback on failure
- Post-deployment health checks and monitoring

**For coding standards**, see `docs/rules/coding-standards.md`.

## Summary

NeonPro is a production-ready, mobile-first platform for Brazilian aesthetic clinics with:

**Core Strengths**

- Multi-professional collaboration (CFM, COREN, CFF, CNEP)
- AI-powered automation and clinical decision support
- Comprehensive Brazilian compliance (LGPD, ANVISA, tax regulations)
- Complete financial management with tax compliance
- Edge-optimized performance (<2s page loads, 99.9% uptime)

**Architecture Grade**: A- (9.2/10)
**Technology Stack**: React 19, TanStack Router/Query, Hono, tRPC v11, Supabase, TypeScript
**Deployment**: Vercel (Edge + Node), Supabase (PostgreSQL + Real-time)

**For detailed information**, see:

- [Frontend Architecture](./frontend-architecture.md) - UI patterns and implementation
- [Technology Stack](./tech-stack.md) - Technology decisions and rationale
- [Source Tree](./source-tree.md) - Codebase organization
- [Coding Standards](../rules/coding-standards.md) - Development guidelines
