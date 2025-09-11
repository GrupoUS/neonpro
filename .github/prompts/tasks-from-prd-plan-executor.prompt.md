```yaml
name: "Tasks from PRD+Plan Executor"
version: 1.0.0
purpose: "Generate atomic, executable tasks from a completed PRD and Implementation Plan, aligned with NeonPro constitutional principles and monorepo structure."
inputs:
  - archon_prd_id: "Optional: Archon PRD document ID"
  - archon_plan_id: "Optional: Archon Plan document ID"
  - prd_content: "Optional: Raw PRD content if Archon ID not supplied"
  - plan_content: "Optional: Raw Plan content if Archon ID not supplied"
  - feature_dir: "Optional: Absolute path to feature directory (e.g., specs/001-feature-name)"
outputs:
  - tasks_md: "Written to <feature_dir>/tasks.md"
  - archon_tasks: "Tasks created in Archon (optional)"
```

## 🧭 Overview
Generates an actionable tasks.md and (optionally) Archon tasks from the completed PRD and plan. Enforces TDD ordering (contracts → integration → unit), dependency-aware sequencing, and [P] markers for parallel work. Mirrors and extends:
- templates/tasks-template.md
- .github/prompts/tasks.prompt.md

## 🔗 Plan Section Mapping (from plan.md)
The generator must parse these sections of `plan.md` (Implementation Plan template) and use them as constraints:
| Plan Section | Purpose in Task Generation | Failure Condition |
|--------------|---------------------------|------------------|
| Summary | Derive feature name + top-level objective | Empty → error |
| Technical Context | Determine languages, deps, testing stack; identify remaining NEEDS CLARIFICATION | Any "NEEDS CLARIFICATION" unresolved → abort |
| Constitution Check | Enumerate architectural/testing/observability/versioning commitments → create explicit tasks | Missing PASS gates → abort |
| Project Structure / Structure Decision | Select pathing strategy (single/web/mobile) | Unsupported structure token → abort |
| Phase 0 Research | Provide evidence that unknowns resolved; map decisions to rationale | Missing decisions for prior unknowns → abort |
| Phase 1 Design (contracts, data-model, quickstart) | Source for contract tests, model entities, integration scenarios | Absent required doc(s) → abort |
| Complexity Tracking | If rows exist → emit mitigation tasks & tag complexity flag | Table present but no mitigation tasks produced |
| Progress Tracking | Validate Phase 0 + 1 complete & both Constitution gates PASS before generating tasks | Any required phase unchecked → abort |

If any abort condition triggers, return structured error JSON instead of writing `tasks.md`.


## 📚 Mandatory Pre‑Reads
- templates/tasks-template.md (structure and rules)
- .github/prompts/tasks.prompt.md (execution patterns and repo scripts)
- docs/architecture/source-tree.md (path conventions)
- docs/architecture/tech-stack.md (versions and tooling)
- docs/AGENTS.md (docs orchestration)

## 🔧 Required MCP Tools
- Archon (read PRD/Plan by ID, create tasks)

## 🛡️ Gates & Constitutional Enforcement
Before any task generation the following MUST be validated from `plan.md`:
1. Progress Tracking: `Phase 0: Research complete` = checked
2. Progress Tracking: `Phase 1: Design complete` = checked
3. Gate Status: `Initial Constitution Check: PASS` and `Post-Design Constitution Check: PASS`
4. No remaining tokens "NEEDS CLARIFICATION" in Technical Context or Research
5. At least one contract spec present (contracts/*) and `data-model.md` exists

If any fail → return:
```json
{"error": {"code": "GATE_FAILURE", "details": {"missing": ["list of failed predicates"]}}}
```

Commitments mapping (each must become ≥1 task unless already covered by explicit design docs):
- Testing commitments → tasks for RED first: contract tests, integration tests, then implementation
- Observability commitments → structured logging setup (API + Frontend) tasks
- Versioning commitments → version bump + CHANGELOG/update tasks
- Architecture commitments → tasks to enforce library boundaries / imports audit
- Simplicity commitments → tasks to remove unnecessary abstractions if flagged

## 🧠 Inputs & Discovery
Resolve inputs in this order:
1) If archon_plan_id provided → fetch plan content
2) Else use plan_content
3) Determine FEATURE_DIR:
   - If feature_dir provided → use it
   - Else, run `scripts/check-task-prerequisites.sh --json` to detect FEATURE_DIR and AVAILABLE_DOCS
4) Load available design docs within FEATURE_DIR (if present):
   - plan.md (REQUIRED)
   - data-model.md
   - contracts/*
   - research.md
   - quickstart.md

## 🧱 Task Generation Rules (must enforce)
- TDD: All tests written first and MUST FAIL before implementation
- From contracts/: one contract test per endpoint [P]
- From data-model.md: one model task per entity [P]
- From PRD user scenarios: one integration test per scenario [P]
- Endpoint implementation tasks follow their tests (no [P] if same file touched)
- Order: Setup → Tests → Models → Services → Endpoints → Integration → Polish
- Parallelization: Different files only; same-file sequences are not [P]
- Include exact repo file paths per docs/architecture/source-tree.md
- Acceptance criteria: concrete, verifiable, tied to PRD FRs

## 🔗 Cross‑References
- Every task should reference relevant PRD FR‑IDs and Plan sections
- Include compliance checkpoints where healthcare data is involved (LGPD/ANVISA/CFM)

## 🧩 Output Structure (tasks.md)
Follow templates/tasks-template.md, replacing examples with real tasks:
- Title: `# Tasks: <FEATURE NAME>`
- Prereqs and execution flow (condensed)
- Numbered tasks (T001, T002, ...)
- [P] markers for independent tasks
- Dependency notes and parallel examples

## 🧪 Validation Checklist (auto‑review before writing)
MUST all be TRUE before writing `tasks.md`:
1. Contract Coverage: Every endpoint in `contracts/` has a preceding contract test task.
2. Model Coverage: Every entity in `data-model.md` has a model creation + validation test task.
3. Scenario Coverage: Every PRD user scenario → integration test task (RED first).
4. TDD Order: No implementation task appears before all its prerequisite test tasks.
5. Parallel Safety: All `[P]` tasks operate on disjoint file paths.
6. Acceptance Criteria: Each task lists ≥1 explicit, testable criterion.
7. Constitution Commitments: For each commitment category (Testing, Observability, Versioning, Architecture, Simplicity) at least one task enforces it.
8. Gates Passed: Both Constitution gates in `plan.md` are PASS.
9. No Unknowns: Zero remaining "NEEDS CLARIFICATION" tokens.
10. Complexity Mitigation: For every row in Complexity Tracking table, a matching mitigation task exists referencing the violation.
11. Structure Consistency: All task paths align with the resolved Structure Decision.
12. Compliance: Any task touching PHI/PII includes LGPD/ANVISA acceptance criteria note.
13. Versioning: If version bump required (commitment), a task updates version + changelog.
14. Observability: Logging / tracing setup tasks exist for new code areas.
15. JSON Summary Integrity: Summary arrays lengths match number of tasks & IDs sequential (T001..Tnn).
If any item fails → abort with `VALIDATION_FAILED` JSON containing failing item indices.

## 🗂️ Archon Integration (optional)
- If an Archon project_id is available, create tasks in Archon with:
  - title, description (include purpose, inputs, outputs, acceptance)
  - feature label = <feature name>
  - sources = links to PRD/Plan Archon docs and repo paths

## ▶️ Execution Flow
1) Resolve inputs and locate FEATURE_DIR
2) Load plan.md (REQUIRED) and optional design docs
3) Build task set by categories: Setup → Tests → Models → Services → Endpoints → Integration → Polish
4) Compute dependencies and [P] markers (files must not conflict)
5) Validate via checklist
6) Write tasks to `<FEATURE_DIR>/tasks.md`
7) (Optional) Create Archon tasks
8) Return a machine‑readable JSON summary and a human‑readable tasks preview

## 🧾 Machine‑Readable Summary (return this JSON)
```json
{
  "feature_dir": "specs/001-feature-name",
  "structure_decision": "web|single|mobile",
  "constitution_status": {"initial_gate": "PASS", "post_design_gate": "PASS"},
  "unresolved_clarifications": 0,
  "complexity_items": [
    {"violation": "4th project", "mitigation_task": "T012"}
  ],
  "tasks": [
    {
      "id": "T001",
      "title": "Setup project tooling [P]",
      "path": "apps/api/",
      "depends_on": [],
      "acceptance": ["lint, type-check scripts run successfully"],
      "artifacts": ["package.json scripts updated"],
      "refs": {"prd": ["FR-001"], "plan": ["Technical Context"], "complexity": [], "constitution": ["Testing"]}
    }
  ],
  "policy": {"tdd_order": true, "parallelization": true},
  "archon": {"project_id": null, "tasks_created": 0}
}
```

## 🧑‍💻 Task Content Requirements
For each task include:
- Purpose and rationale (1–2 lines)
- Inputs (contract/data‑model/plan references)
- Path(s) to modify/create (absolute or from repo root)
- Acceptance criteria (explicit, testable)
- Artifacts (files generated/updated)

## 📌 Pathing Examples (adjust per plan structure)
- Single project: `src/`, `tests/`
- Web app: `backend/src/`, `frontend/src/`
- Monorepo (NeonPro default): per `docs/architecture/source-tree.md`

### Structure Decision Logic
Parse `Structure Decision:` line from plan.md.
Map tokens → path template:
- `single` or default → use package/service layering inside monorepo packages if applicable
- `web` → use `apps/api/src` & `apps/web/src` separation; tests mirrored per app
- `mobile` → (future) ensure api + platform dir; abort if platform dirs missing
If detected structure conflicts with actual repo layout (missing directories), raise error `STRUCTURE_MISMATCH`.
All task paths must reflect chosen structure (e.g., model tasks in `packages/core-services/src/services` vs `apps/api/src/services`).

## 🧭 Parallelization Guidance
Group [P] tasks by different files and no dependency edges. Provide a short example group to help executors run them concurrently.

### Extra Task Categories (derived from plan commitments)
Must append these categories when applicable:
- Observability: logging/tracing setup, log routing, error context enrichment
- Versioning: bump version + changelog + migration notes (if breaking)
- Complexity Mitigation: one task per Complexity Tracking violation row
- Architecture Enforcement: import boundary audit, removal of unused abstractions
- Simplicity Cleanup: eliminate premature patterns flagged

## ✅ Completion Criteria
- tasks.md created with ≥25 high‑quality tasks (or appropriate to scope)
- TDD ordering verified; no implementation before tests
- Dependencies explicit and [P] markers correct
- Concrete paths and acceptance criteria present
- (Optional) Tasks created in Archon with proper metadata and links

