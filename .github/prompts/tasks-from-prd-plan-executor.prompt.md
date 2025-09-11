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

## 📚 Mandatory Pre‑Reads
- templates/tasks-template.md (structure and rules)
- .github/prompts/tasks.prompt.md (execution patterns and repo scripts)
- docs/architecture/source-tree.md (path conventions)
- docs/architecture/tech-stack.md (versions and tooling)
- docs/AGENTS.md (docs orchestration)

## 🔧 Required MCP Tools
- Archon (read PRD/Plan by ID, create tasks)

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
- All endpoints in contracts/ have contract test tasks
- All entities in data-model.md have model tasks
- All integration scenarios from PRD are present as tests
- Tests precede implementation tasks
- Each task includes an exact file path and clear acceptance criteria
- [P] tasks touch different files

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
  "tasks": [
    {
      "id": "T001",
      "title": "Setup project tooling [P]",
      "path": "apps/api/",
      "depends_on": [],
      "acceptance": ["lint, type-check scripts run successfully"],
      "artifacts": ["package.json scripts updated"],
      "refs": {"prd": ["FR-001"], "plan": ["Technical Context"]}
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

## 🧭 Parallelization Guidance
Group [P] tasks by different files and no dependency edges. Provide a short example group to help executors run them concurrently.

## ✅ Completion Criteria
- tasks.md created with ≥25 high‑quality tasks (or appropriate to scope)
- TDD ordering verified; no implementation before tests
- Dependencies explicit and [P] markers correct
- Concrete paths and acceptance criteria present
- (Optional) Tasks created in Archon with proper metadata and links

