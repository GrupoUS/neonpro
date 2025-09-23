# Sync Impact Report
- **Version change**: 1.0.0 → 1.1.0 (minor update - scope clarification)
- **Modified principles**: I, III, V - Updated to reflect aesthetic clinic focus vs medical
- **Added sections**: None
- **Removed sections**: None
- **Templates requiring updates**: 
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- **Follow-up TODOs**: None

# NeonPro Constitution

## Core Principles

### I. Aesthetic Clinic Compliance First (NON-NEGOTIABLE)
Every feature must comply with Brazilian aesthetic clinic regulations: LGPD for data protection, ANVISA for equipment and cosmetic product standards, and relevant professional council regulations for aesthetic procedures. Compliance is not optional - it's the foundation of everything we build for all aesthetic professionals.

### II. AI-Powered Prevention Over Reaction
The platform must predict and prevent problems before they occur, particularly the 30% no-show rate that destroys clinic revenue. All AI systems must be proactive, not reactive, with measurable ROI impact for aesthetic clinics of all sizes.

### III. Mobile-First Brazilian Aesthetic Experience
The platform is designed specifically for Brazilian aesthetic clinics and all aesthetic professionals using mobile devices. WhatsApp integration, Portuguese language processing, and Brazilian aesthetic procedure workflows are core requirements, not afterthoughts.

### IV. Type Safety & Data Integrity
End-to-end TypeScript with strict mode is mandatory. All data flows must be type-safe from database to UI, with Valibot/Zod validation for aesthetic clinic data (client information, treatment records, product inventory). Client and clinic data integrity cannot be compromised.

### V. Performance & Reliability for Aesthetic Clinics
The system must achieve <2s response times for AI queries, <500ms for APIs, and 99.9% uptime. Brazilian infrastructure constraints (3G/4G connections) and aesthetic clinic workflow patterns must be considered in all performance optimizations.

### VI. Privacy & Security by Design for Aesthetic Clients
Client data protection is paramount. All systems must implement encryption at rest and in transit, complete audit trails, and automatic PII redaction. Brazilian data residency requirements must be respected for all aesthetic clinic client information.

## Technology & Compliance Standards

### Brazilian Aesthetic Clinic Technology Stack
**Mandatory Technologies**:
- **Frontend**: TanStack Router + Vite + React 19 + TypeScript 5.9.2
- **Backend**: tRPC v11 + Prisma + Supabase + PostgreSQL 15+
- **AI**: Vercel AI SDK with OpenAI GPT-5-nano + Google Gemini Flash 2.5 with Copilot kit
- **Infrastructure**: Vercel São Paulo region + Turborepo monorepo
- **Package Management**: Bun primary, PNPM fallback

**Brazilian Aesthetic Compliance Requirements**:
- **LGPD**: Granular consent management, audit trails, data portability for client data
- **ANVISA**: Equipment registration, cosmetic product control, procedure documentation
- **Professional Councils**: Compliance with relevant aesthetic professional regulations
- **Data Residency**: All client and clinic data must remain in Brazil

### AI Governance Standards
- **Data Retention**: 7-day maximum for conversation logs
- **Failover Strategy**: OpenAI → Anthropic with exponential backoff
- **PII Protection**: Automatic redaction in all AI conversations
- **Portuguese Language**: All AI systems must support Brazilian Portuguese natively for aesthetic terminology

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
- **Testing**: Vitest + Playwright with 90%+ coverage for critical components
- **Performance**: Core Web Vitals must meet aesthetic clinic standards (LCP ≤2.5s)
- **Security**: Oxlint + security scanning for all code changes
- **Compliance**: Automated aesthetic clinic compliance validation before deployment

### Documentation Requirements
- **Code Comments**: No unnecessary comments - code should be self-documenting
- **Architecture**: All technical decisions must be documented with rationale
- **Compliance**: Aesthetic clinic compliance documentation must be comprehensive
- **User Stories**: All features must include Brazilian aesthetic clinic context and use cases

## Governance

### Constitution Authority
This constitution supersedes all other development practices and guidelines. All code reviews, pull requests, and architectural decisions must verify compliance with these principles.

### Amendment Process
- **Major Changes**: Require full team review and unanimous approval
- **Minor Updates**: Require lead architect and compliance officer approval
- **Version Control**: All amendments must be versioned with clear rationale
- **Implementation**: Changes require migration plan and rollback strategy

### Compliance Review
- **Monthly**: Full constitution compliance audit
- **Quarterly**: External aesthetic clinic compliance review
- **Annually**: Complete constitution review and update
- **Trigger-based**: Immediate review after regulatory changes

### Enforcement Mechanisms
- **Code Reviews**: All PRs must validate constitutional compliance
- **Automated Checks**: CI/CD pipeline includes constitution validation
- **Team Training**: All developers must complete constitution training
- **Exception Process**: Non-compliance requires explicit CTO approval with justification

**Version**: 1.1.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23