## Agents Summary (Phase 0)

- Orchestrator: `docs/AGENTS.md`; area orchestrators in `docs/architecture/AGENTS.md` and `docs/agents/AGENTS.md`

- Roles & handoffs
  - apex-dev: coordinator, full-stack, refactor+security; always active
  - apex-researcher: multi-source research, compliance validation
  - apex-ui-ux-designer: healthcare UI/UX, accessibility
  - test: TDD/QA (Vitest/Playwright)
  - prd: product requirements and roadmaps
  - documentation: technical docs and guides
  - rules: coding standards, conventions

- Acceptance criteria per agent (from docs)
  - apex-dev: architecture alignment, quality gates, rollback strategy
  - test: coverage and regression checks
  - documentation: updated docs with links and tags

- Links
  - <augment_code_snippet path="docs/agents/AGENTS.md" mode="EXCERPT">
````markdown
role: "Full-Stack Healthcare Development + Agent Coordination + Refactoring + Security Audit"
````
  </augment_code_snippet>

- Notes
  - Use triggers and workflows defined in agents docs to map owners for backlog tasks
