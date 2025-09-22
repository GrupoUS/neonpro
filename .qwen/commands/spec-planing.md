```yaml
name: "Spec-Driven Research+Planning Executor"
version: 1.0.0
purpose: "Transform any user request into a fully researched PRD, comprehensive implementation plan, and atomic task breakdown aligned with Spec‑Kit SDD and NeonPro standards."
inputs:
  - user_request: "Free‑form request from stakeholder or engineer"
  - context: "Optional context links or constraints"
outputs:
  - prd: "Archon document (type=prd) with full requirements"
  - plan: "Implementation plan aligned to repository templates"
  - tasks: "Atomic task list with phases, parallelization, and acceptance criteria"
  - research: "Consolidated research notes with sources and confidence"
```

## 🧭 Overview

This prompt operationalizes Specification‑Driven Development (SDD) by combining:

- GitHub Spec‑Kit spec-driven methodology (Specification as primary artifact; plan/code serve the spec)
- NeonPro templates and constitutional gates
- Deep research via Tavily + Context7 + Archon knowledge base
- Task generation with strict quality gates and sequential execution

The assistant MUST produce: (1) a PRD stored in Archon, (2) a full implementation plan, (3) an atomic, parallelizable task list, and (4) research notes with cited sources and confidence.

## 📚 Mandatory Pre‑Reads (NeonPro context)

When uncertain, consult only what is needed (minimal context load):

- docs/AGENTS.md (docs orchestrator)
- docs/architecture/AGENTS.md (architecture orchestrator)
- docs/architecture/source-tree.md (source-tree)
- docs/architecture/tech-stack.md (tech-stack)
- docs/apis/AGENTS.md (API doc standards)
- docs/database-schema/AGENTS.md (DB schema orchestrator)
- docs/agents/apex-researcher.md (research methodology)
- templates/spec-template.md (feature spec structure)
- templates/plan-template.md (implementation plan structure)

## 🔧 Required MCP Tools

- Tavily (Real‑time web research; trends, news, best practices)
- Context7 (Official docs, API references)
- Archon (Knowledge base, PRD/plan/task documents)

## 🔐 Constitutional & Project Rules (ALWAYS ENFORCE)

- KISS/YAGNI, simplicity gates, anti‑abstraction (avoid wrappers without need)
- Test‑first: Contracts → Integration/E2E → Unit; RED before GREEN
- Every feature as a library with CLI exposure where applicable
- Follow monorepo structure and stack in source-tree and tech-stack
- Compliance & security (LGPD/ANVISA/CFM) when healthcare data is involved
- Coding standards in docs/rules/coding-standards.md

## 🧠 High‑Level Execution Flow

1. Understand → 2) Research → 3) PRD → 4) Plan → 5) Tasks → 6) Quality Gates → 7) Final Output

### 1) Understand User Request

- Extract goals, actors, constraints, success metrics
- Identify unknowns → mark with [NEEDS CLARIFICATION: question]

### 2) Research (Apex‑Researcher methodology)

- Classify complexity (L1–L10) and choose depth
- Run Archon RAG → Context7 → Tavily chain
- For each key decision, collect: Decision, Rationale, Alternatives, Sources, Confidence
- Record compliance/security implications when relevant

### 3) PRD Generation (Store in Archon)

Create a PRD aligned with spec-driven and templates/spec-template.md, but business‑first:

- Title, Summary, Goals/Non‑Goals
- Stakeholders & Personas
- User Scenarios (Given/When/Then)
- Functional Requirements (FR‑###; testable; no implementation details)
- Non‑Functional Requirements (performance, security, compliance, availability)
- Data Concepts & Relationships (names only; no schema)
- Assumptions, Risks, Out‑of‑Scope
- Open Questions → [NEEDS CLARIFICATION]
- Acceptance Criteria and Success Metrics
- Research Appendix (decisions, alternatives, citations, confidence)

**🌟 Use PRD agent do create PRD**: [`docs/agents/prd.md`](../../docs/agents/prd.md)

Persist via Archon as document_type="prd" with tags, including links to plan and tasks that will be generated next.

### 4) Implementation Plan (templates/plan-template.md)

Follow the local plan template precisely. Include:

- Summary (from PRD)
- Technical Context (language/versions/deps/testing/platform/constraints)
- Constitution Check (simplicity, architecture, testing, observability, versioning)
- Phase 0: Outline & Research consolidation (resolve all NEEDS CLARIFICATION)
- Phase 1: Design & Contracts (data-model.md, contracts/, quickstart.md, failing tests first)
- Phase 2: Task Planning Approach (describe only)
- Complexity Tracking (if any gate violated → justify)
- Progress Tracking and Gate Status checkboxes

### 5) Atomic Tasks & Subtasks

Output a numbered, dependency‑aware task list with parallelizable [P] marks:

- Order strictly by TDD: generate contracts/tests before implementation
- Dependencies: models → services → API → UI; respect monorepo structure
- Each task includes: purpose, inputs, outputs (files/artifacts), acceptance criteria, related PRD/Plan refs
- Include specific repository paths (e.g., apps/api/src/..., packages/core-services/src/...)
- Enforce security/compliance checks where applicable

### 6) Quality Gates (Do not skip)

- PRD: unambiguous, testable, no implementation details
- Plan: passes Constitution Check; violations justified in Complexity Tracking
- Tasks: each has clear acceptance criteria; tests before code; realistic environments favored
- Cross‑reference: Plan/Tasks link back to PRD FRs and scenarios

## 🧱 Output Contract (Return Format)

Return a single JSON block under a fenced code block for machine consumption AND human‑readable sections. Use the structure below (keys required). Then perform Archon writes.

### Machine‑Readable Block

```json
{
  "inputs": { "user_request": "...", "context": "..." },
  "research": {
    "decisions": [
      {
        "topic": "...",
        "decision": "...",
        "rationale": "...",
        "alternatives": ["..."],
        "sources": [
          {
            "url": "...",
            "type": "official|community|vendor",
            "date": "YYYY-MM-DD",
            "credibility": "high|med|low"
          }
        ],
        "confidence": 0.95
      }
    ]
  },
  "prd": {
    "title": "...",
    "summary": "...",
    "goals": ["..."],
    "non_goals": ["..."],
    "stakeholders": ["..."],
    "user_scenarios": ["Given ... When ... Then ..."],
    "functional_requirements": ["FR-001: ..."],
    "non_functional_requirements": ["..."],
    "data_concepts": ["..."],
    "assumptions": ["..."],
    "risks": ["..."],
    "open_questions": ["[NEEDS CLARIFICATION: ...]"]
  },
  "plan": {
    "technical_context": {
      "language": "...",
      "deps": ["..."],
      "testing": "...",
      "platform": "...",
      "constraints": ["..."]
    },
    "constitution_check": {
      "simplicity": true,
      "architecture": true,
      "testing": true,
      "observability": true,
      "versioning": true,
      "notes": "..."
    },
    "phases": [
      {
        "phase": 0,
        "outputs": ["specs/<feature>/research.md"],
        "status": "pending|done"
      },
      {
        "phase": 1,
        "outputs": [
          "specs/<feature>/data-model.md",
          "specs/<feature>/contracts/*",
          "specs/<feature>/quickstart.md"
        ],
        "status": "pending|done"
      }
    ],
    "complexity_tracking": [
      { "violation": "...", "why_needed": "...", "simpler_alt_rejected": "..." }
    ]
  },
  "tasks": {
    "list": [
      {
        "id": "T-001",
        "title": "Generate OpenAPI contracts for ... [P]",
        "depends_on": [],
        "path": "specs/<feature>/contracts/...",
        "acceptance": ["..."],
        "artifacts": ["..."]
      }
    ],
    "policy": { "tdd_order": true, "parallelization": true }
  },
  "links": { "archon_prd_id": null, "archon_plan_id": null }
}
```

### Human‑Readable Sections

- Research Summary (bullets with sources + confidence)
- PRD (clear sections, no implementation details)
- Plan (as per template with gates)
- Tasks (numbered, grouped by phase with [P] markers)

## 🧩 Feature Documentation File (docs/features/[feature-name].md)

Create a comprehensive feature documentation file to align product, research, and engineering:

- Filename: `[feature-name].md` (kebab-case)
- Sections:
  - Feature overview and business context
  - Technical architecture decisions from research
  - Implementation approach and key components
  - API endpoints and data models involved (paths reference `docs/architecture/source-tree.md` conventions)
  - Testing strategy and acceptance criteria (test-first: contracts → integration → unit)
  - Compliance considerations (LGPD/ANVISA/CFM, if applicable)
  - Dependencies and integration points
  - Risk assessment and mitigation strategies
  - Links to PRD and Implementation Plan in Archon (use returned IDs: `links.archon_prd_id`, `links.archon_plan_id`)

Write this file to `docs/features/[feature-name].md` and ensure it references the exact repo paths and Archon document links.

## 🗂️ Archon Writeback (required)

After producing the JSON and human sections:

1. Create PRD document in Archon:
   - create_document(project_id=?, title, document_type="prd", tags=["spec-kit","prd"], content=PRD JSON + human)
   - Save returned document_id and echo it in `links.archon_prd_id`
2. Create Plan document:
   - create_document(project_id=?, title, document_type="design", tags=["plan","templates/plan-template.md"], content=Plan JSON + human)
   - Save document_id → `links.archon_plan_id`
3. Create Tasks (optional if Archon tasks are enabled):
   - For each task, create_task(project_id=?, title, description, feature=?, sources=[docs refs])

Note: If project_id is unknown, ask user for the target Archon project once (then cache/reference it in output).

## 🧪 Research Protocol (Apex‑Researcher)

- Use archon.perform_rag_query first for internal knowledge
- Use context7 for official docs (frameworks, APIs). Resolve library IDs via resolve-library-id before fetching docs
- Use tavily for real‑time best practices and validation
- For each critical decision, ensure multi‑source validation and list trade‑offs
- Record confidence scores and compliance implications (LGPD/ANVISA/CFM) where relevant

## 🧱 Planning Constraints

- Enforce templates/plan-template.md phases and gates strictly
- Keep the plan high‑level and move deep details to implementation‑details files as needed
- Ensure repository paths conform to docs/architecture/source-tree.md
- Respect current stack versions from docs/architecture/tech-stack.md

## ✅ Completion Criteria

- PRD: Complete, unambiguous, linked to research and acceptance metrics
- Plan: Passes Constitution Check (or justified), includes Phase 0/1 outputs
- Tasks: 25–40 granular items, parallelization tagged, each with acceptance criteria
- Research: Cited sources with credibility and confidence
- Archon: PRD and Plan persisted; IDs returned in `links`

## ▶️ Execution Instructions

Given ${user_request} (and optional ${context}):

1. Run the Research Protocol
2. Draft PRD with [NEEDS CLARIFICATION] markers, resolve via research; keep unresolved markers visible
3. Generate the Plan per template with gates and Phase 0/1 outputs
4. Generate Atomic Tasks, ordered for TDD and dependency chains, with [P] for independent tasks
5. Return outputs in the Machine‑Readable Block + Human‑Readable Sections
6. Persist PRD & Plan to Archon (request project_id if missing)
7. Create the Feature Documentation file at `docs/features/[feature-name].md` with the specified sections and Archon links
8. Print a concise summary of next actions
