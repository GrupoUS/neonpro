# NeonPro Documentation Cleanup Plan

_Last updated: 2025-09-25_

## 1. Purpose & Scope
- Deliver a comprehensive cleanup plan for Markdown documentation located at the repository root and within `docs/`.
- Preserve compliance, architectural, and operative knowledge while removing or consolidating redundant, obsolete, and unused files.
- Align the documentation set with current tooling best practices validated via Tavily research (TanStack Router, tRPC, Supabase, shadcn/ui, Vercel) and internal orchestration workflows defined in the `AGENTS.md` control files.

## 2. Current Landscape Snapshot
| Area | Key Contents | Observations |
| --- | --- | --- |
| Root | `AGENTS.md`, `QWEN.md`, empty `CLAUDE.md` | Root instructions duplicated across agents; `CLAUDE.md` empty; `QWEN.md` mirrors root workflow.
| Control Hubs | `docs/AGENTS.md` + per-domain `AGENTS.md` files | Critical navigation layer for LLM agents; multiple cross-links to architecture, testing, database, API docs.
| Architecture & Platform | `docs/architecture/*`, `docs/architecture-*.md`, `docs/deployment/*`, `docs/performance-optimization-summary.md`, `docs/build-system-guide.md` | Rich but overlapping historical reports (`architecture-restructuring-*`, `cleanup-final-report.md`).
| Features & Components | `docs/features/*`, `docs/components/*` | Heavy duplication around Google Calendar and dashboard enhancements; some files exceed 800-line guideline.
| Compliance & Database | `docs/compliance/*`, `docs/database-schema/*` | Must preserve; mostly aligned with orchestrator references.
| User-Facing Docs | `docs/user-documentation/*`, `docs/aesthetic-clinic/*` | Two parallel documentation trees (EN + PT) with significant content overlap.
| Testing & QA | `docs/testing/*` | Well structured; orchestrator references ensure usage.
| Historical Reports | `docs/cleanup-final-report.md`, `docs/architecture-analysis-report.md`, `docs/migration-guide.md` | Provide context but may be archived once summaries are captured.

## 3. Research Validation Summary
- **TanStack Router (official docs)** – File-based routing expects route files under `src/routes` following naming conventions (`tanstack.com/router/v1/docs/framework/react/routing/file-naming-conventions`). No documentation files are required by the router.
- **tRPC (official docs)** – Recommended router structure keeps server routers under `/server/routers` with helper utilities (`trpc.io/docs/client/nextjs/setup`). Documentation files are optional; focus is on code organization.
- **shadcn/ui (official docs)** – Requires `components.json` and structured component directories; documentation should reference registry usage rather than duplicate component guides (`ui.shadcn.com/docs/installation`, `/docs/components-json`).
- **Supabase (official docs)** – Emphasizes security guides (SOC 2, HIPAA, RLS) but no mandated documentation artifacts; compliance docs must capture customer responsibilities (`supabase.com/docs/guides/security`).
- **Vercel (official docs)** – `vercel.json` governs rewrites/headers (`vercel.com/docs/rewrites`); documentation should explain configurations but the file itself is authoritative.
- **Vite (community & official guidance)** – Default structure is `index.html` + `src/`; README optional. Extensive multi-file documentation not required for build tooling.

> Implication: The frameworks only mandate configuration files. Documentation can be reorganized freely provided compliance, architecture, and ops knowledge remain accessible via the AGENTS control hierarchy.
## 4. Findings by Category

### 4.1 Redundant Sets (Consolidate)
| Group | Files | Recommendation |
| --- | --- | --- |
| Google Calendar feature | `docs/features/google-calendar-{integration,implementation-guide,integration-research,setup}.md`, `docs/components/*Calendar*.md`, `docs/testing/CalendarErrors.md`, `docs/compliance/CalendarSecurity.md` | Merge into a single feature pack: `docs/features/google-calendar.md` (overview + compliance + ops) and place technical component details inside `docs/components/calendar.md`. Cross-link testing/compliance subsections instead of maintaining separate files.
| Dashboard enhancements | `docs/features/client-dashboard-enhancement.md` (933 lines), `docs/features/patient-dashboard-enhancement.md`, component guides | Create concise `docs/features/client-dashboard.md` (<250 lines) describing architecture + UX; move UI patterns to `docs/components/dashboard/*`; archive duplicated patient variant once parity confirmed.
| User manuals | `docs/user-documentation/**` (EN) vs `docs/user-documentation/portuguese/**` vs `docs/aesthetic-clinic/0*-*.md` | Adopt bilingual structure `docs/user-guides/en/` and `docs/user-guides/pt-br/` with shared assets. Map `docs/aesthetic-clinic` chapters into the same tree and retain only normative references.
| Architecture restructuring reports | `docs/architecture-analysis-report.md`, `docs/architecture-restructuring-*.md`, `docs/cleanup-final-report.md` | Summarize key decisions in `docs/architecture/change-log.md` and move legacy reports to `docs/archive/architecture/` for historical context.

### 4.2 Obsolete or Low-Value Artifacts
| File | Rationale | Action |
| --- | --- | --- |
| Root `CLAUDE.md` | Empty placeholder; authoritative instructions live in `.claude/CLAUDE.md` | Delete after confirming no references.
| `docs/features/cleanup-plan.md` | Old cleanup status specific to past initiative; superseded by this plan | Archive or remove once new plan ratified.
| `docs/features/error-handling-refactor.md` | Tied to PR #58; ensure changes are now reflected in architecture/testing docs | Integrate relevant lessons into `docs/rules/coding-standards.md` then archive.
| `docs/performance-optimization-summary.md` | Overlaps with `docs/aesthetic-clinic/08-performance-optimization.md`; verify most recent content | Merge into unified performance guide under `docs/operations/performance.md`.
### 4.3 Unused / Weakly Referenced Content
| File or Folder | Usage Notes | Proposed Treatment |
| --- | --- | --- |
| `docs/aesthetic-clinic/` | Not linked from control AGENTS; duplicates user, architecture, compliance docs | Absorb into restructured user-guide + architecture sections, then retire folder.
| `docs/components/usage-guide.md` | Overlaps with feature write-ups and shadcn registry guidelines | Replace with concise component index pointing to shadcn registry entries.
| `docs/components/CalendarOptimization.md` vs `docs/components/calendar-integration.md` | Both describe same performance tuning | Consolidate into single `docs/components/calendar-operations.md` section.
| `docs/migration-guide.md` | Refers to earlier build migration; confirm if steps still relevant | If superseded by `build-system-guide.md`, archive with note in change log.
| `docs/user-documentation/videos/*` | Many entries without references in AGENTS or onboarding flows | Fold into training plan or provide single index referencing actual assets.

### 4.4 Must-Preserve Collections (No Deletion)
- `docs/compliance/*` (LGPD, ANVISA, audit checklists)
- `docs/database-schema/*` including migrations orchestrators
- `docs/testing/*` orchestrators and test suites
- `docs/rules/coding-standards.md`
- All `AGENTS.md` control files
- `docs/deployment/*` and `docs/troubleshooting.md`
## 5. Target Documentation Structure
```
docs/
  AGENTS.md
  architecture/
    AGENTS.md
    architecture.md
    tech-stack.md
    source-tree.md
    frontend-architecture.md
    change-log.md            # new, summarises historical reports
  apis/
    AGENTS.md
    core-api.md
    telemedicine.md
    billing.md
    compliance.md
  compliance/
    (unchanged)
  database-schema/
    AGENTS.md
    schema-essentials.md
    tables-consolidated.md
    migrations/
  features/
    google-calendar.md
    client-dashboard.md
    (one file per active feature, ≤250 lines)
  components/
    index.md                 # links to shadcn registry + component pages
    calendar.md
    dashboard/
  testing/
    (unchanged)
  operations/
    build-system-guide.md
    deployment/
    performance.md
    troubleshooting.md
  user-guides/
    en/
      administrator.md
      professional.md
      reception.md
      patient.md
      training.md
    pt-br/
      administrador.md
      profissional.md
      recepcao.md
      paciente.md
      treinamento.md
  archive/
    architecture/
    cleanup/
```
## 6. Action Matrix

### 6.1 Consolidations / Renames
| Current Path | Action | New Path | Notes |
| --- | --- | --- | --- |
| `docs/features/google-calendar-integration*.md` | Merge | `docs/features/google-calendar.md` | Keep architecture, configuration, error handling, compliance in one document with clear subsections; link to components/testing/compliance sections.
| `docs/components/{BigCalendar,WeekView,EventCalendar,CalendarOptimization}.md` | Merge | `docs/components/calendar.md` | Provide component overview + link to shadcn registry + testing references.
| `docs/features/client-dashboard-enhancement.md` | Trim & rename | `docs/features/client-dashboard.md` | Break into subdocs: architecture (feature), UI components (in `components/dashboard/`), analytics/performance (in `operations/performance.md`).
| `docs/user-documentation/**` & `docs/aesthetic-clinic/**` | Reorganize | `docs/user-guides/en|pt-br/**` | Preserve bilingual content, remove duplicates, centralize shared assets.
| `docs/performance-optimization-summary.md` & `docs/aesthetic-clinic/08-performance-optimization.md` | Merge | `docs/operations/performance.md` | Provide single canonical performance playbook.
| `docs/architecture-restructuring-*.md`, `docs/cleanup-final-report.md` | Summarize & archive | `docs/architecture/change-log.md` + `docs/archive/architecture/*` | Capture decision highlights while preserving raw reports for audit trail.

### 6.2 Safe Deletions (post-validation)
| Path | Preconditions | Justification |
| --- | --- | --- |
| Root `CLAUDE.md` | Confirm `.claude/` copy remains authoritative | File is empty today; removing avoids confusion.
| `docs/features/cleanup-plan.md` | Replace with this plan | Superseded by new cleanup roadmap.
| `docs/features/google-calendar-integration-research.md` | Merge action complete | Research details move into new consolidated feature doc appendix.
| `docs/components/usage-guide.md` | New component index ready | Content overlaps with shadcn registry documentation.
| `docs/user-documentation/videos/*` | Training index created with actual media locations | Replace with single `docs/user-guides/en/training.md` section referencing video assets.
## 7. Risk Assessment
| Change Area | Risk | Mitigation |
| --- | --- | --- |
| Consolidating Google Calendar docs | Loss of edge-case knowledge (rate limits, compliance) | Create structured sections (Architecture, Operations, Compliance, Troubleshooting) inside new doc; cross-verify with Supabase + Google API references; update links in AGENTS.
| Restructuring user guides | Broken external links or language coverage gaps | Produce redirect map (`docs/archive/redirects.md`), validate with stakeholders, ensure Portuguese translations preserved before folder removal.
| Archiving architecture reports | Losing historical context required by audits | Summarize key decisions in `change-log.md` with dates + doc references; store originals under `docs/archive/architecture/` and note location in AGENTS.
| Removing `CLAUDE.md` | Some tooling referencing root file fails | Check `.claude/CLAUDE.md` integration pipeline; if necessary, replace with stub linking to canonical instructions instead of deleting outright.
| Trimming oversized feature docs | Missing implementation steps for future engineers | Move deep technical steps into living design docs or ADRs; confirm AGENTS references point to new location.
| Consolidating component docs | LLM navigation depending on specific file names | Update component index and ensure AGENTS/component references align; keep synonyms in front matter for search.
## 8. Implementation Roadmap
1. **Stabilize Current Control Files**
   - Review all `AGENTS.md` entries and document existing cross-links.
   - Create temporary tracking sheet for link updates.
2. **Consolidate High-Impact Features**
   - Merge Google Calendar documentation (feature + components + testing + compliance).
   - Rewrite dashboard feature doc and split supporting material into components/operations.
3. **Restructure User Documentation**
   - Design bilingual folder structure (`docs/user-guides/en|pt-br`).
   - Migrate English manuals first, validate with stakeholders, then migrate Portuguese equivalents.
4. **Archive Legacy Reports**
   - Draft `docs/architecture/change-log.md` summarizing key decisions.
   - Move historical reports to `docs/archive/architecture/` with index.
5. **Standardize Operations & Performance Guides**
   - Merge performance docs, ensure build/deployment guides link to new location.
6. **Clean Up Remaining Redundancies**
   - Remove empty root files (`CLAUDE.md`), old cleanup plan, unused video placeholders once replacements exist.
   - Update references in AGENTS and other docs.
7. **Quality Gate**
   - Run documentation link checker (e.g., `pnpm lint:docs` if available) or custom script.
   - Validate with compliance/security stakeholders before final deletion.
## 9. Success Criteria & Follow-Up
- All control files (`docs/AGENTS.md` family) reference the consolidated documentation locations.
- Feature documents ≤250 lines with clear subsections and cross-links to components/testing/compliance.
- User guidance maintained in both English and Portuguese without duplicated content.
- Compliance, database, and testing documents untouched except for link updates.
- Historical reports preserved under `docs/archive/` with indexed references in `change-log.md`.
- Link validation passes and team stakeholders (architecture, compliance, product, support) sign off on changes.

## 10. Open Questions
- Confirm whether any automation scripts read specific doc paths (e.g., knowledge ingestion pipelines) before renaming.
- Validate if bilingual documentation needs separate versioning or translation workflow tooling.
- Determine whether to introduce ADR (Architecture Decision Record) format for future decisions to avoid report proliferation.
