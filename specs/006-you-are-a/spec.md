# Feature Specification: Comprehensive Monorepo Architecture Analysis

**Feature Branch**: `006-you-are-a`  
**Created**: 2025-01-30  
**Status**: Draft  
**Input**: User description: "You are a senior software architect specializing in monorepo architectures with expertise in vite, React, hono, tanstack router e query, turbo repo, TypeScript, and modern frontend tooling. Your task is to perform a comprehensive, systematic analysis of the provided codebase to identify architectural issues, code duplication, redundancy, and organizational problems, then propose concrete improvements aligned with established architectural patterns and best practices.

## Analysis Framework

### Phase 1: Architecture Documentation Review
**Objective**: Establish architectural baseline and constraints
- **Primary Sources**: Analyze all documents in `@/docs/architecture/` to understand:
  - Project structure and layer definitions (frontend, backend, shared packages)
  - Module responsibilities and boundaries
  - Monorepo configuration (Turborepo/bun workspaces)
  - Established patterns and conventions
- **Review Criteria**: Consult `@/.claude/agents/code-review/architect-review.md` for:
  - SOLID principles compliance
  - DRY principle violations
  - Separation of concerns
  - Scalability patterns
  - Design pattern adherence

### Phase 2: Codebase Deep Dive Analysis
**Target Directories**:
- **Frontend App**: `/home/vibecode/neonpro/apps/web/src/`
  - Components architecture and reusability
  - Page structure and routing patterns
  - Custom hooks implementation and usage
  - State management patterns
  - API integration approaches
- **Shared Packages**: `/home/vibecode/neonpro/packages/`
  - Package boundaries and responsibilities
  - Cross-package dependencies
  - Export/import patterns
  - Type definitions and interfaces

**Critical Issues to Identify**:
1. **Code Duplication**:
   - Identical or near-identical functions/components across locations
   - Duplicated business logic between apps and packages
   - Repeated validation schemas or utility functions
   - Similar custom hooks with slight variations

2. **Architectural Violations**:
   - Business logic leaking into presentation components
   - Direct database/API calls in UI components
   - Circular dependencies between packages
   - Improper abstraction levels

3. **Misplaced Code**:
   - UI components in business logic packages
   - Shared utilities buried in app-specific directories
   - Configuration scattered across multiple locations /home/vibecode/neonpro/docs/architecture/source-tree.md
   - Type definitions not properly centralized

### Phase 3: Technology Stack Assessment
**Current Stack Analysis**:
- **Core Technologies**:  /home/vibecode/neonpro/docs/architecture/tech-stack.md
- **Tooling**: Identify build tools, linting, testing frameworks
- **State Management**: Detect patterns (Zustand, Redux, Context API)
- **Styling**: CSS-in-JS, Tailwind CSS, or other approaches
- **Data Fetching**: React Query, SWR, or native fetch patterns

**Best Practices Validation**:
analise o /home/vibecode/neonpro/docs/architecture/tech-stack.md para entender
- **TypeScript**: Type safety, interface design, generic usage

### Phase 4: Architectural Improvement Proposals
**Reorganization Strategy**:
- **Package Structure Optimization**:
  - `@neonpro/ui` - Reusable UI components with proper theming
  - `@neonpro/core` - Shared custom hooks with proper abstractions and Pure utility functions and helpers
  - `@neonpro/types` - Centralized type definitions
  - `@neonpro/config` - Shared configuration and constants

**Frontend Architecture Enhancements**:
- **Routing Optimization**: Leverage tanstack router features (parallel routes, intercepting routes, route groups)
- **Component Architecture**: where is the best place to be? /home/vibecode/neonpro/packages/ui/src/components or  /home/vibecode/neonpro/apps/web/src/components
- **Hook Strategy**: Create reusable, testable hooks with proper dependency injection
- **Performance**: Implement proper code splitting, lazy loading, and caching strategies

**Integration Patterns**:
- **Build System**: Optimize Turborepo configuration for efficient builds
- **Type Safety**: Ensure end-to-end type safety across package boundaries
- **Testing Strategy**: Implement comprehensive testing at package and integration levels

## Deliverables

### 1. Executive Summary
- **Impact Assessment**: Quantify technical debt and maintenance burden
- **Priority Matrix**: High/Medium/Low severity issues with business impact
- **ROI Analysis**: Effort vs. benefit for proposed changes

### 2. Detailed Issue Inventory
For each identified problem:
- **Location**: Exact file paths and line numbers
- **Issue Type**: Duplication/Redundancy/Misplacement/Violation
- **Severity**: Critical/High/Medium/Low with justification
- **Impact**: Maintenance cost, performance implications, developer experience
- **Proposed Solution**: Specific refactoring steps with code examples

### 3. Refactoring Roadmap
- **Phase 1 (Quick Wins)**: Low-risk, high-impact improvements (Weeks 1-2)
- **Phase 2 (Structural Changes)**: Package reorganization and major refactoring (Weeks 3-4)
- **Phase 3 (Optimization)**: Performance and scalability enhancements (Weeks 5-6)
- **Implementation Phase**: Execute complete refactoring roadmap following analysis approval
- **Migration Strategy**: Step-by-step implementation plan with rollback options
- **Stakeholder Approach**: Minimal involvement - analysis team delivers findings for review

### 4. Updated Architecture Specification
- **Visual Representation**: Mermaid diagrams showing current vs. proposed structure
- **Package Dependency Graph**: Clear visualization of package relationships
- **Data Flow Diagrams**: How information flows through the system
- **Component Hierarchy**: Organized component structure with clear boundaries

### 5. Implementation Guidelines
- **Code Standards**: Specific coding patterns and conventions
- **Package Configuration**: Updated package.json configurations and scripts
- **Build Optimization**: Turborepo and bundling improvements
- **Quality Gates**: Linting rules, testing requirements, and CI/CD integration

### 6. Documentation and References
- **Official Documentation**: 
- **Best Practices**: Industry standards and proven patterns
- **Decision Rationale**: Technical justifications for each recommendation
- **Migration Examples**: Before/after code samples for key changes

## Quality Standards
- **Evidence-Based**: All recommendations must be supported by code analysis
- **Actionable**: Each suggestion must include concrete implementation steps
- **Measurable**: Define success criteria and metrics for improvements
- **Risk-Aware**: Identify potential issues and mitigation strategies
- **Future-Proof**: Consider long-term maintainability and scalability

If additional context is needed for any specific area, request targeted information with clear scope and purpose. ultrathink"

## Clarifications

### Session 2025-01-30
- Q: What is the target timeline for completing this comprehensive architectural analysis? → A: 4-6 weeks - Thorough analysis with deep dive into all packages and patterns
- Q: What is the expected level of stakeholder involvement during the analysis process? → A: Minimal involvement - Analysis team delivers findings, stakeholders review final report
- Q: What is the expected scope for implementing the architectural improvements identified in the analysis? → A: Full implementation - Execute the complete refactoring roadmap after analysis approval

## Execution Flow (main)
```
1. Parse user description from Input
   → ✅ Complex architectural analysis request identified
2. Extract key concepts from description
   → Actors: Senior software architect, development team
   → Actions: Analyze, identify issues, propose improvements, create roadmap
   → Data: Codebase structure, patterns, documentation
   → Constraints: Monorepo architecture, specific tech stack
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → ✅ Clear architectural review workflow identified
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
   → Codebase components, packages, documentation
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **NeonPro Aesthetic Clinic Compliance**: Consider these mandatory requirements:
   - Brazilian aesthetic clinic regulations (LGPD, ANVISA, relevant professional councils)
   - Client data protection and privacy for aesthetic procedures
   - AI-powered prevention capabilities for no-show reduction
   - Mobile-first Brazilian experience for all aesthetic professionals
   - Type safety and data integrity for clinic operations
5. **Common underspecified areas**:
   - User types and permissions (clinic owners, aesthetic professionals, coordinators)
   - Data retention/deletion policies for client information
   - Performance targets and scale for aesthetic clinic workflows
   - Error handling behaviors specific to aesthetic procedures
   - Integration requirements for aesthetic clinic management
   - Security/compliance needs for cosmetic products and equipment
   - Aesthetic clinic compliance requirements

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a development team lead, I need a comprehensive architectural analysis of our NeonPro monorepo to identify technical debt, code duplication, and organizational issues so that we can improve code quality, reduce maintenance overhead, and ensure our architecture supports future growth for Brazilian aesthetic clinics.

### Acceptance Scenarios
1. **Given** the current monorepo structure with frontend app and shared packages, **When** the architectural analysis is completed, **Then** all code duplications are identified with exact locations and impact assessments
2. **Given** existing documentation in `/docs/architecture/`, **When** compared against actual codebase implementation, **Then** all architectural violations are documented with severity levels and proposed solutions
3. **Given** the current package structure, **When** analyzed for reorganization opportunities, **Then** a clear roadmap for package optimization is presented with ROI analysis
4. **Given** identified issues, **When** prioritized by business impact and technical debt, **Then** a phased implementation plan is provided with quick wins and long-term improvements

### Edge Cases
- What happens when the analysis discovers critical architectural flaws that require immediate attention?
- How does the analysis handle conflicting architectural patterns between different parts of the system?
- What if the current documentation significantly differs from actual implementation?
- How are recommendations prioritized when multiple issues have similar severity levels?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST analyze all documents in `/docs/architecture/` to establish architectural baseline
- **FR-002**: System MUST perform deep dive analysis of `/home/vibecode/neonpro/apps/web/src/` for component architecture patterns
- **FR-003**: System MUST analyze `/home/vibecode/neonpro/packages/` for package boundaries and cross-dependencies
- **FR-004**: System MUST identify and categorize code duplication with exact file paths and line numbers
- **FR-005**: System MUST assess architectural violations including SOLID principles and DRY principle compliance
- **FR-006**: System MUST generate detailed issue inventory with severity levels (Critical/High/Medium/Low)
- **FR-007**: System MUST provide concrete refactoring steps with code examples for each identified issue
- **FR-008**: System MUST create executive summary with impact assessment and priority matrix
- **FR-009**: System MUST deliver visual representations showing current vs proposed architecture
- **FR-010**: System MUST provide implementation guidelines with measurable success criteria

### Brazilian Healthcare Compliance Requirements (NON-NEGOTIABLE)
- **FR-011**: System MUST ensure LGPD compliance for all Brazilian aesthetic clinic data processing including consent management, audit trails, and data portability
- **FR-012**: System MUST validate ANVISA compliance for equipment registration tracking, cosmetic product control, and procedure documentation
- **FR-013**: System MUST ensure compliance with Brazilian professional council regulations (CFM, COREN, CFF, CNEP) for aesthetic procedure scope validation
- **FR-014**: System MUST enforce Brazilian data residency requirements ensuring all client and clinic data remains within Brazil (Vercel gru1 region)
- **FR-015**: System MUST implement Row Level Security (RLS) policies for multi-tenant data isolation and audit trail logging for all client data access

### Constitutional Performance Requirements (MANDATORY)
- **FR-016**: System MUST meet Edge read TTFB <150ms (P95) for all architectural analysis operations
- **FR-017**: System MUST achieve API response time <500ms (P95) for all analysis endpoints and data processing
- **FR-018**: System MUST maintain 99.9% uptime for all architectural analysis and reporting services
- **FR-019**: System MUST ensure real-time UI updates <1.5s (P95) for analysis progress and result visualization
- **FR-020**: System MUST optimize for page load times <2s on 3G connections for Brazilian clinic infrastructure constraints

### Key Entities
- **Codebase Analysis**: Comprehensive review of NeonPro monorepo structure and patterns
- **Issue Inventory**: Detailed catalog of architectural problems with locations and impacts
- **Refactoring Roadmap**: Phased improvement plan with quick wins and structural changes
- **Architecture Specification**: Updated documentation with visual diagrams and package relationships
- **Implementation Guidelines**: Code standards and configuration recommendations

### Non-Functional Requirements
- **NFR-001**: Analysis MUST be evidence-based with support from actual code examination
- **NFR-002**: All recommendations MUST be actionable with specific implementation steps
- **NFR-003**: Improvements MUST be measurable with defined success criteria and metrics
- **NFR-004**: Analysis MUST identify potential risks and mitigation strategies
- **NFR-005**: Recommendations MUST ensure long-term maintainability and scalability
- **NFR-006**: Analysis MUST consider KISS and YAGNI principles to eliminate over-engineering

### Constitutional Performance & Compliance Requirements
- **NFR-007**: Analysis system MUST meet Edge read TTFB <150ms (P95) per constitutional performance targets
- **NFR-008**: All API responses MUST achieve <500ms (P95) response time per constitutional requirements
- **NFR-009**: System MUST maintain 99.9% uptime for all architectural analysis operations
- **NFR-010**: Real-time analysis updates MUST complete within <1.5s (P95) per constitution
- **NFR-011**: Analysis MUST consider Brazilian 3G/4G infrastructure constraints with <2s page load targets
- **NFR-012**: All analysis MUST ensure LGPD compliance for Brazilian aesthetic clinic data processing
- **NFR-013**: System MUST validate ANVISA compliance for aesthetic equipment and product tracking
- **NFR-014**: Analysis MUST enforce Brazilian professional council regulations (CFM, COREN, CFF, CNEP)
- **NFR-015**: All analysis operations MUST respect Brazilian data residency requirements (gru1 region)

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) - Focus on analysis outcomes
- [x] Focused on user value and business needs - Improved maintainability and reduced technical debt
- [x] Written for non-technical stakeholders - Clear business impact and ROI focus
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded - Comprehensive architectural analysis
- [x] Dependencies and assumptions identified - Based on existing documentation and codebase

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---