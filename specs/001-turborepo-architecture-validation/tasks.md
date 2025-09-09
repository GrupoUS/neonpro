# Tasks: Turborepo Architecture Validation (NeonPro)

**Input**: Design documents from `/home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
2. Load optional design documents (data-model, contracts, research, quickstart)
3. Generate tasks by category (Setup → Tests → Core → Integration → Polish)
4. Apply task rules (TDD first, [P] for independent files)
5. Number tasks and define dependencies
6. Create parallel execution examples
7. Validate completeness
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup

- [ ] T001 Ensure required docs present; verify paths in plan.md
      Files: /home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/plan.md, research.md, data-model.md, quickstart.md, contracts/
- [ ] T002 [P] Prepare validation report template file
      Create: /home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/validation.report.yaml
      Note: Seed with top-level sections and placeholders
- [ ] T003 [P] Create test harness notes for manual checklist execution
      Create: /home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/manual-checklist.md

## Phase 3.2: Tests First (TDD)

- [ ] T004 [P] Contract test for ValidationReport schema compliance
      File: /home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/contracts/validation-report.schema.yaml
      Task: Write a schema validation test file that would fail until a report is produced
- [ ] T005 [P] Integration test scenario from quickstart (docs/architecture cross-check)
      File: /home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/quickstart.md
      Task: Draft an integration test plan that fails until validation is implemented

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T006 [P] Populate validation.report.yaml with context and sections
      File: /home/vibecoder/neonpro/specs/001-turborepo-architecture-validation/validation.report.yaml
      Sections: context, checks[], summary.overall, summary.sections
- [ ] T007 Implement repository structure analysis
      Files: /home/vibecoder/neonpro/turbo.json, /home/vibecoder/neonpro/package.json, apps/_, packages/_
      Task: Document PASS/FAIL per structure rule with references to Turborepo docs
- [ ] T008 Implement dependency management analysis
      Files: package.json manifests across repo
      Task: Detect missing/uninstalled/broken deps; propose fixes
- [ ] T009 Implement tasks configuration analysis
      Files: /home/vibecoder/neonpro/turbo.json
      Task: Validate build/dev/test tasks, outputs, and pipeline links
- [ ] T010 Implement best practices analysis for shared vs app code
      Files: apps/* vs packages/*
      Task: Confirm shared code resides in packages and apps consume only

## Phase 3.4: Integration

- [ ] T011 Cross-reference with `/docs/architecture/*`
      Files: /home/vibecoder/neonpro/docs/architecture/
      Task: Align findings with documented source-tree and architecture
- [ ] T012 Collate concrete fix snippets with doc references
      Files: validation.report.yaml
      Task: For each FAIL add fix code/config and doc URL

## Phase 3.5: Polish

- [ ] T013 [P] Finalize report with PASS/FAIL verdicts per section and overall
      Files: validation.report.yaml
- [ ] T014 [P] Add summary and next steps to quickstart.md
      Files: quickstart.md
- [ ] T015 [P] Update plan.md Progress Tracking (Phase 5: Validation passed) once complete
      Files: plan.md

## Dependencies

- T001 → T004-T005 (tests depend on setup)
- T004-T005 before T006-T010 (TDD)
- T006 before T012-T013
- T007-T010 before T011-T012

## Parallel Example

```
# Launch T004-T005 together:
Task: "Contract test for ValidationReport schema compliance"
Task: "Integration test scenario from quickstart (docs/architecture cross-check)"

# Launch T013-T015 together (after core):
Task: "Finalize report with PASS/FAIL verdicts per section and overall"
Task: "Add summary and next steps to quickstart.md"
Task: "Update plan.md Progress Tracking"
```

## Validation Checklist

- [ ] All contract(s) mapped to tests (validation report schema)
- [ ] Entities mapped to tasks (ValidationReport)
- [ ] Tests scheduled before implementation
- [ ] Parallel tasks only touch independent files
- [ ] Each task has absolute file paths
- [ ] Core tasks cover structure, deps, tasks, best practices
