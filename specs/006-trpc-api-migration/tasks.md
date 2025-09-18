# Tasks: tRPC API Migration with Prisma + Supabase + Vercel

**Input**: Design documents from `/specs/006-trpc-api-migration/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: tRPC v11, Prisma 5.7+, Valibot 0.30+, Supabase, Vercel Edge
   → Structure: Turborepo monorepo (apps/api, apps/web, packages/database, packages/types)
2. Load design documents ✓:
   → data-model.md: Patient, LGPDConsent, Appointment, TelemedicineSession entities
   → contracts/: patients.contract.ts, appointments.contract.ts, ai.contract.ts
   → research.md: Valibot vs Zod decisions, LGPD compliance automation, CFM validation
3. Generate tasks by category ✓:
   → Setup: Prisma + tRPC infrastructure, healthcare compliance middleware
   → Tests: Contract tests for LGPD, CFM, and ANVISA compliance
   → Core: Healthcare entities, AI services, real-time telemedicine
   → Integration: Supabase RLS, Vercel Edge deployment, audit logging
   → Polish: Performance optimization, Brazilian compliance validation
4. Apply task rules ✓:
   → Different packages/files = [P] for parallel execution
   → Healthcare compliance tests before any implementation (TDD)
   → Prisma models before tRPC procedures before frontend integration
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓:
   → All contracts have compliance tests ✓
   → All Prisma entities have migration tasks ✓
   → All healthcare endpoints have LGPD audit integration ✓
9. Return: SUCCESS (tasks ready for healthcare platform implementation) ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files/packages, no dependencies)
- All file paths are absolute for Turborepo monorepo structure
- Healthcare compliance validation integrated in all relevant tasks

## Path Conventions (Turborepo Monorepo)
- **Database**: `packages/database/` (Prisma schema, migrations)
- **API Backend**: `apps/api/src/` (tRPC routers, middleware, services)
- **Web Frontend**: `apps/web/src/` (React components, tRPC client, hooks)
- **Shared Types**: `packages/types/src/` (TypeScript types, Valibot schemas)
- **Tests**: Each package has its own `tests/` directory

## Phase 3.1: Enhanced Setup & Infrastructure

- [x] **T001** Create enhanced Prisma database package structure in `packages/database/` ✅ COMPLETED by apex-dev
  - Initialize Prisma with multi-schema support (public, audit, lgpd)
  - Configure connection to Supabase with Brazilian region compliance
  - Setup Prisma Accelerate for edge runtime optimization

- [x] **T002** [P] Setup tRPC infrastructure in `apps/api/src/trpc/` ✅ COMPLETED by apex-dev
  - Create enhanced context with Prisma + Supabase integration
  - Initialize router composition with healthcare domain separation
  - Configure Vercel Edge Runtime compatibility

- [x] **T003** [P] Configure enhanced TypeScript monorepo dependencies ✅ COMPLETED by apex-dev
  - Install tRPC v11, Prisma 5.7+, Valibot 0.30+, Supabase client
  - Setup Bun workspaces with healthcare-specific packages
  - Configure TypeScript path mapping for enhanced type safety

- [x] **T004** [P] Setup enhanced linting and formatting for healthcare compliance ✅ COMPLETED by apex-dev
  - Configure ESLint with healthcare-specific rules
  - Setup Prettier with consistent formatting across monorepo
  - Add pre-commit hooks for code quality and LGPD compliance validation

## Phase 3.2: Healthcare Compliance Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

### Contract Tests (LGPD, ANVISA, CFM Compliance) 
- [x] **T005** [P] Contract test for patients router LGPD compliance in `apps/api/tests/contract/patients.contract.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test patient list with audit logging and data minimization
  - Test patient creation with cryptographic consent verification
  - Test consent withdrawal with automatic data anonymization
  - Verify LGPD audit trail generation for all patient operations

- [x] **T006** [P] Contract test for appointments router no-show prevention in `apps/api/tests/contract/appointments.contract.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test appointment creation with AI risk prediction
  - Test appointment reminders with WhatsApp Business API
  - Test real-time appointment updates via Supabase subscriptions
  - Verify CFM doctor license validation for telemedicine

- [x] **T007** [P] Contract test for AI router Portuguese healthcare support in `apps/api/tests/contract/ai.contract.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test conversational AI with Portuguese medical terminology
  - Test no-show prediction with Brazilian patient behavior patterns
  - Test multi-provider AI routing (OpenAI GPT-4 → Anthropic Claude)
  - Verify patient data anonymization before AI processing

### Integration Tests (Brazilian Healthcare Standards)
- [x] **T008** [P] Integration test for LGPD lifecycle management in `apps/api/tests/integration/lgpd-compliance.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test complete patient data lifecycle with retention enforcement
  - Test consent withdrawal with cryptographic proof generation
  - Test automated data anonymization workflows
  - Verify audit log completeness for regulatory compliance

- [x] **T009** [P] Integration test for CFM telemedicine compliance in `apps/api/tests/integration/cfm-telemedicine.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test telemedicine session creation with NGS2 security standards
  - Test ICP-Brasil certificate validation for medical professionals
  - Test real-time video consultation with end-to-end encryption
  - Verify professional license status validation

- [x] **T010** [P] Integration test for ANVISA adverse event reporting in `apps/api/tests/integration/anvisa-compliance.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test automated adverse event detection during medical procedures
  - Test compliance reporting for Software as Medical Device (SaMD)
  - Test audit trail completeness for medical device software
  - Verify RDC 657/2022 compliance for aesthetic procedures

### Frontend Integration Tests (Mobile-First Healthcare UX)
- [x] **T011** [P] Integration test for mobile-first patient interface in `apps/web/tests/integration/mobile-patient-ux.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test responsive design for 70%+ smartphone usage
  - Test PWA capabilities for offline appointment booking
  - Test touch-optimized interfaces for aesthetic clinic workflows
  - Verify <2s page load times on mobile networks

- [x] **T012** [P] Integration test for real-time telemedicine interface in `apps/web/tests/integration/telemedicine-realtime.test.ts` ✅ COMPLETED by tdd-orchestrator
  - Test WebRTC video consultation with healthcare quality requirements
  - Test real-time chat with Portuguese medical terminology support
  - Test appointment notifications via WebSocket subscriptions
  - Verify <500ms response times for critical healthcare operations

**CRITICAL: All tests above MUST be written and MUST FAIL before ANY implementation in Phase 3.3**

## Phase 3.3: Core Healthcare Implementation (ONLY after tests are failing)

### Enhanced Database Layer (Prisma + Supabase)
- [ ] **T013** [P] Create Patient Prisma model with LGPD compliance in `packages/database/prisma/schema.prisma`
  - Implement Patient entity with Brazilian identity fields (CPF, RG, CNS)
  - Add LGPD compliance fields (consent status, data retention, anonymization)
  - Setup multi-tenant isolation with clinic-based RLS policies
  - Create database indexes for healthcare performance requirements

- [ ] **T014** [P] Create LGPDConsent Prisma model with cryptographic proof in `packages/database/prisma/schema.prisma`
  - Implement consent entity with cryptographic hash validation
  - Add legal framework fields (legal basis, data categories, retention period)
  - Setup consent lifecycle management (creation, withdrawal, expiration)
  - Create audit logging relationships for compliance tracking

- [ ] **T015** [P] Create Appointment Prisma model with no-show prediction in `packages/database/prisma/schema.prisma`
  - Implement appointment entity with AI risk scoring fields
  - Add Brazilian healthcare fields (TUSS procedure codes, CFM validation)
  - Setup real-time subscription support for appointment updates
  - Create performance indexes for appointment scheduling optimization

- [ ] **T016** [P] Create TelemedicineSession Prisma model with CFM compliance in `packages/database/prisma/schema.prisma`
  - Implement telemedicine entity with NGS2 security standards
  - Add ICP-Brasil certificate validation fields
  - Setup session encryption and recording consent management
  - Create compliance tracking for CFM professional standards

- [ ] **T017** Run Prisma migrations for healthcare database schema in `packages/database/`
  - Generate initial migration with healthcare entities
  - Apply migration to Supabase development database
  - Verify multi-schema support (public, audit, lgpd)
  - Test connection pooling with Prisma Accelerate

### Enhanced Validation Layer (Valibot + Zod Hybrid)
- [ ] **T018** [P] Create Patient Valibot schemas for edge performance in `packages/types/src/patient.valibot.ts`
  - Implement CPF validation with Brazilian format checking
  - Add email and phone validation for Brazilian healthcare standards
  - Create branded types for medical identifiers (PatientId, CPF)
  - Optimize bundle size for Vercel Edge Runtime (<100KB)

- [ ] **T019** [P] Create LGPD consent Valibot schemas in `packages/types/src/lgpd.valibot.ts`
  - Implement consent validation with legal basis verification
  - Add data category and retention period validation
  - Create cryptographic hash validation schemas
  - Setup withdrawal reason and method validation

- [ ] **T020** [P] Create Appointment Valibot schemas in `packages/types/src/appointment.valibot.ts`
  - Implement appointment time validation with Brazilian timezone support
  - Add TUSS procedure code validation for healthcare billing
  - Create no-show risk score validation (0.0-1.0 range)
  - Setup reminder type validation for multi-channel communication

### Enhanced Healthcare Middleware
- [ ] **T021** Create LGPD audit middleware with Prisma integration in `apps/api/src/trpc/middleware/lgpd-audit.ts`
  - Implement automatic audit logging for all patient data access
  - Add cryptographic proof generation for consent operations
  - Create data minimization enforcement for LGPD compliance
  - Setup performance monitoring for <200ms audit overhead

- [ ] **T022** Create CFM validation middleware in `apps/api/src/trpc/middleware/cfm-validation.ts`
  - Implement medical license validation with active status checking
  - Add ICP-Brasil certificate verification for telemedicine
  - Create professional identity validation for healthcare operations
  - Setup NGS2 security standards enforcement

- [ ] **T023** Create Prisma RLS enforcement middleware in `apps/api/src/trpc/middleware/prisma-rls.ts`
  - Implement automatic clinic-based data isolation
  - Add user context validation for multi-tenant access
  - Create RLS policy enforcement for all database operations
  - Setup fallback policies for edge cases

### Enhanced tRPC Healthcare Routers
- [ ] **T024** Implement patients tRPC router with LGPD compliance in `apps/api/src/trpc/routers/patients.ts`
  - Create patient list procedure with audit logging and data minimization
  - Implement patient creation with cryptographic consent management
  - Add consent withdrawal procedure with automatic anonymization
  - Setup patient search with LGPD-compliant result filtering

- [ ] **T025** Implement appointments tRPC router with no-show prevention in `apps/api/src/trpc/routers/appointments.ts`
  - Create appointment scheduling with AI risk prediction
  - Implement real-time availability checking with doctor validation
  - Add appointment reminders with multi-channel communication
  - Setup no-show analytics with Brazilian behavioral patterns

- [ ] **T026** Implement AI tRPC router with Portuguese healthcare support in `apps/api/src/trpc/routers/ai.ts`
  - Create conversational AI with Portuguese medical terminology
  - Implement no-show prediction with Brazilian clinic data
  - Add multi-provider routing with cost optimization
  - Setup healthcare insights generation with compliance validation

### Enhanced Healthcare Services
- [ ] **T027** [P] Create LGPD compliance service in `apps/api/src/services/lgpd-compliance.ts`
  - Implement automated data lifecycle management
  - Add consent withdrawal processing with legal validity
  - Create data anonymization workflows for patient privacy
  - Setup retention period enforcement with automatic deletion

- [ ] **T028** [P] Create no-show prediction service in `apps/api/src/services/no-show-prediction.ts`
  - Implement AI model integration for appointment attendance prediction
  - Add Brazilian patient behavior analysis
  - Create intervention recommendation engine
  - Setup model performance monitoring and retraining

- [ ] **T029** [P] Create telemedicine service with CFM compliance in `apps/api/src/services/telemedicine.ts`
  - Implement session management with NGS2 security standards
  - Add ICP-Brasil certificate validation
  - Create real-time communication with healthcare quality requirements
  - Setup compliance monitoring for CFM professional standards

## Phase 3.4: Enhanced Integration & Real-Time Features

### Supabase Integration (RLS + Real-Time)
- [ ] **T030** Setup Supabase RLS policies for multi-tenant healthcare data in database configuration
  - Create clinic-based patient data isolation policies
  - Implement LGPD consent access restrictions
  - Add audit log protection with read-only enforcement
  - Setup emergency access procedures for healthcare operations

- [ ] **T031** Implement real-time subscriptions for telemedicine in `apps/api/src/trpc/routers/telemedicine.ts`
  - Create WebSocket subscriptions for video consultation updates
  - Add real-time chat with message encryption
  - Implement presence detection for healthcare professionals
  - Setup connection quality monitoring for medical consultations

- [ ] **T032** [P] Setup Supabase Edge Functions for healthcare operations in Supabase configuration
  - Create patient lookup functions with LGPD compliance
  - Implement appointment reminder functions with multi-channel support
  - Add adverse event reporting functions for ANVISA compliance
  - Setup performance monitoring for <100ms response times

### Vercel Edge Deployment Optimization
- [ ] **T033** Configure Vercel Edge Runtime for Brazilian healthcare compliance in `vercel.json`
  - Setup São Paulo region deployment for data residency
  - Configure edge functions for patient-facing operations
  - Add serverless functions for complex healthcare processing
  - Setup environment variables for healthcare API keys

- [ ] **T034** [P] Optimize bundle size for edge runtime performance in build configuration
  - Implement Valibot for edge function validation (<50KB bundle)
  - Setup tree-shaking for healthcare libraries
  - Add compression for medical terminology assets
  - Create performance budgets for mobile healthcare users

### WhatsApp Business API Integration
- [ ] **T035** [P] Implement WhatsApp reminder service in `apps/api/src/services/whatsapp-reminders.ts`
  - Create appointment reminder templates in Portuguese
  - Add patient consent verification for WhatsApp communication
  - Implement delivery status tracking for healthcare compliance
  - Setup fallback to SMS for communication reliability

## Phase 3.5: Enhanced Frontend Integration (Mobile-First Healthcare UX)

### Enhanced tRPC Client Setup
- [ ] **T036** Setup enhanced tRPC client with healthcare optimization in `apps/web/src/lib/trpc.ts`
  - Configure client with healthcare-specific error handling
  - Add automatic retry logic for critical healthcare operations
  - Implement request/response logging for compliance auditing
  - Setup performance monitoring for mobile healthcare users

- [ ] **T037** [P] Create enhanced patient hooks with LGPD compliance in `apps/web/src/hooks/use-patients.ts`
  - Implement patient list hook with audit logging
  - Add patient creation hook with consent management
  - Create consent withdrawal hook with user confirmation
  - Setup optimistic updates for healthcare operations

- [ ] **T038** [P] Create appointment hooks with real-time updates in `apps/web/src/hooks/use-appointments.ts`
  - Implement appointment scheduling with availability checking
  - Add real-time appointment updates via WebSocket subscriptions
  - Create no-show risk display with intervention suggestions
  - Setup reminder management with multi-channel preferences

- [ ] **T039** [P] Create AI chat hooks with Portuguese support in `apps/web/src/hooks/use-ai-chat.ts`
  - Implement conversational AI with healthcare terminology
  - Add patient data anonymization before AI processing
  - Create multi-provider fallback for AI service reliability
  - Setup cost monitoring for AI usage optimization

### Enhanced Healthcare Components
- [ ] **T040** [P] Create patient management components in `apps/web/src/components/patients/`
  - Implement patient list with LGPD-compliant data display
  - Add patient registration form with consent collection
  - Create consent management interface with withdrawal options
  - Setup mobile-optimized design for 70%+ smartphone usage

- [ ] **T041** [P] Create appointment scheduling components in `apps/web/src/components/appointments/`
  - Implement appointment booking with real-time availability
  - Add no-show risk display with intervention recommendations
  - Create reminder preference management interface
  - Setup touch-optimized design for mobile healthcare workflows

- [ ] **T042** [P] Create telemedicine interface components in `apps/web/src/components/telemedicine/`
  - Implement video consultation interface with healthcare quality
  - Add real-time chat with Portuguese medical terminology
  - Create session recording consent interface
  - Setup emergency escalation procedures for patient safety

## Phase 3.6: Enhanced Testing & Quality Assurance

### Performance Testing (Healthcare SLA Requirements)
- [ ] **T043** [P] Performance test for mobile healthcare operations in `apps/web/tests/performance/mobile-healthcare.test.ts`
  - Test <2s page load times on 3G networks
  - Verify <500ms API response times for patient operations
  - Test PWA capabilities for offline appointment booking
  - Validate bundle size targets for mobile healthcare users

- [ ] **T044** [P] Performance test for edge runtime optimization in `apps/api/tests/performance/edge-runtime.test.ts`
  - Test <100ms cold start times for patient lookup operations
  - Verify connection pooling efficiency with Prisma Accelerate
  - Test bundle size optimization with Valibot validation
  - Validate memory usage for healthcare service scaling

### Compliance Testing (Brazilian Healthcare Standards)
- [ ] **T045** [P] LGPD compliance validation test in `apps/api/tests/compliance/lgpd-validation.test.ts`
  - Test complete data lifecycle compliance
  - Verify audit trail completeness for regulatory review
  - Test consent withdrawal with cryptographic proof
  - Validate data anonymization effectiveness

- [ ] **T046** [P] CFM telemedicine compliance test in `apps/api/tests/compliance/cfm-telemedicine.test.ts`
  - Test medical license validation accuracy
  - Verify NGS2 security standards compliance
  - Test ICP-Brasil certificate authentication
  - Validate professional identity verification

- [ ] **T047** [P] ANVISA adverse event reporting test in `apps/api/tests/compliance/anvisa-reporting.test.ts`
  - Test automated adverse event detection
  - Verify SaMD compliance for aesthetic procedures
  - Test regulatory reporting automation
  - Validate audit trail for medical device software

## Phase 3.7: Production Deployment & Polish

### Documentation & Developer Experience
- [ ] **T048** [P] Update healthcare API documentation in `docs/api/healthcare-endpoints.md`
  - Document all tRPC procedures with LGPD compliance notes
  - Add Brazilian healthcare compliance requirements
  - Create code examples for common healthcare operations
  - Setup interactive API documentation with authentication

- [ ] **T049** [P] Create healthcare deployment guide in `docs/deployment/healthcare-production.md`
  - Document Vercel deployment with Brazilian compliance
  - Add Supabase configuration for healthcare data
  - Create monitoring setup for healthcare SLA requirements
  - Setup disaster recovery procedures for patient data

### Final Integration Testing
- [ ] **T050** Run complete healthcare platform integration test
  - Test end-to-end patient journey from registration to telemedicine
  - Verify all Brazilian compliance requirements (LGPD, ANVISA, CFM)
  - Test real-time features with healthcare quality standards
  - Validate performance targets for mobile healthcare users

- [ ] **T051** [P] Healthcare compliance audit preparation
  - Generate compliance reports for LGPD, ANVISA, CFM
  - Prepare audit documentation for regulatory review
  - Test emergency procedures for patient data protection
  - Validate healthcare professional access controls

- [ ] **T052** Production deployment validation
  - Deploy to Vercel São Paulo region for Brazilian compliance
  - Test production performance with healthcare SLA monitoring
  - Validate all healthcare integrations in production environment
  - Setup monitoring alerts for critical healthcare operations

## Dependencies

**Setup Dependencies**:
- T001 → T002, T003 (Database before tRPC setup)
- T004 → All subsequent tasks (Linting before code)

**Testing Dependencies (TDD Enforcement)**:
- T005-T012 → All implementation tasks T013+ (Tests MUST fail first)
- No implementation without failing tests

**Database Dependencies**:
- T013-T016 → T017 (Models before migrations)
- T017 → T021-T023 (Database before middleware)
- T021-T023 → T024-T026 (Middleware before routers)

**Service Dependencies**:
- T024-T026 → T027-T029 (Routers before services)
- T027-T029 → T030-T032 (Services before integration)

**Frontend Dependencies**:
- T030-T032 → T036 (Backend integration before frontend)
- T036 → T037-T039 (Client setup before hooks)
- T037-T039 → T040-T042 (Hooks before components)

**Testing & Polish Dependencies**:
- T040-T042 → T043-T047 (Components before testing)
- T043-T047 → T048-T052 (Testing before deployment)

## Parallel Execution Examples

### Phase 3.1 Setup (Parallel Infrastructure)
```bash
# Launch T002-T004 together:
Task: "Setup tRPC infrastructure in apps/api/src/trpc/"
Task: "Configure enhanced TypeScript monorepo dependencies"  
Task: "Setup enhanced linting and formatting for healthcare compliance"
```

### Phase 3.2 Contract Tests (Parallel TDD)
```bash
# Launch T005-T012 together:
Task: "Contract test for patients router LGPD compliance"
Task: "Contract test for appointments router no-show prevention"
Task: "Contract test for AI router Portuguese healthcare support"
Task: "Integration test for LGPD lifecycle management"
Task: "Integration test for CFM telemedicine compliance"
Task: "Integration test for ANVISA adverse event reporting"
Task: "Integration test for mobile-first patient interface"
Task: "Integration test for real-time telemedicine interface"
```

### Phase 3.3 Database Models (Parallel Implementation)
```bash
# Launch T013-T016 together:
Task: "Create Patient Prisma model with LGPD compliance"
Task: "Create LGPDConsent Prisma model with cryptographic proof"
Task: "Create Appointment Prisma model with no-show prediction"
Task: "Create TelemedicineSession Prisma model with CFM compliance"
```

### Phase 3.3 Validation Schemas (Parallel Optimization)
```bash
# Launch T018-T020 together:
Task: "Create Patient Valibot schemas for edge performance"
Task: "Create LGPD consent Valibot schemas"
Task: "Create Appointment Valibot schemas"
```

### Phase 3.3 Healthcare Services (Parallel Business Logic)
```bash
# Launch T027-T029 together:
Task: "Create LGPD compliance service"
Task: "Create no-show prediction service"
Task: "Create telemedicine service with CFM compliance"
```

### Phase 3.5 Frontend Hooks (Parallel Client Integration)
```bash
# Launch T037-T039 together:
Task: "Create enhanced patient hooks with LGPD compliance"
Task: "Create appointment hooks with real-time updates"
Task: "Create AI chat hooks with Portuguese support"
```

### Phase 3.5 Healthcare Components (Parallel UI Development)
```bash
# Launch T040-T042 together:
Task: "Create patient management components"
Task: "Create appointment scheduling components"
Task: "Create telemedicine interface components"
```

### Phase 3.6 Performance Testing (Parallel Validation)
```bash
# Launch T043-T047 together:
Task: "Performance test for mobile healthcare operations"
Task: "Performance test for edge runtime optimization"
Task: "LGPD compliance validation test"
Task: "CFM telemedicine compliance test"
Task: "ANVISA adverse event reporting test"
```

### Phase 3.7 Documentation (Parallel Knowledge)
```bash
# Launch T048-T049, T051 together:
Task: "Update healthcare API documentation"
Task: "Create healthcare deployment guide"
Task: "Healthcare compliance audit preparation"
```

## Validation Checklist
*GATE: Checked before task completion*

- [x] All contracts have corresponding LGPD/CFM/ANVISA compliance tests ✓
- [x] All Prisma entities have model creation and migration tasks ✓
- [x] All tests come before implementation (TDD enforced) ✓
- [x] Parallel tasks are in different files/packages ✓
- [x] Each task specifies exact file path ✓
- [x] Healthcare compliance integrated in all relevant tasks ✓
- [x] Brazilian standards (LGPD, ANVISA, CFM) coverage complete ✓
- [x] Mobile-first design requirements included ✓
- [x] Real-time telemedicine features covered ✓
- [x] AI integration with Portuguese support included ✓

## Notes
- **[P] tasks** = Different files/packages, no dependencies, can run in parallel
- **TDD Enforcement**: All tests (T005-T012) MUST be written and failing before any implementation
- **Healthcare Compliance**: LGPD, ANVISA, CFM requirements integrated throughout
- **Performance Targets**: <100ms edge cold starts, <200ms patient operations, <2s mobile load times
- **Brazilian Standards**: Data residency, Portuguese language, CFM medical licensing, LGPD privacy
- **Zero Downtime**: Gradual migration approach with parallel API deployment
- **Commit Strategy**: Commit after each task for incremental progress tracking

---
**Tasks Version**: 1.0.0 | **Healthcare Compliance**: ✅ LGPD + ANVISA + CFM | **Architecture**: ✅ tRPC + Prisma + Supabase + Vercel | **Last Updated**: 2025-09-18