# Phase 0 — Agents Summary (docs/agents/AGENTS.md)

Purpose
- Central orchestration of specialized agents and workflows; Archon-first tasking

Core mantra
- Think → Research → Decompose → Plan → Implement → Validate

Key agents (roles → triggers → capabilities)
- apex-dev: Full‑stack + coordination, refactor, security; Archon MCP integration
- apex-researcher: Multi‑source research (Context7 → Tavily → Exa), compliance validation
- apex-ui-ux-designer: WCAG AA+, shadcn/ui optimization for healthcare
- test: TDD, Vitest/Playwright, coverage and quality gates
- prd: PRDs, roadmap, success metrics; documentation/rules support agents

Workflows
- Full feature dev; Research‑driven implementation; Integrated Refactor & Security; Complete MVP
Mandatory references
- `docs/AGENTS.md`, `docs/project.md`, `docs/architecture/source-tree.md`

Guidance
- Minimal context loading: pick 1–2 docs per task
- Move tasks todo → doing → review (not directly to complete)
- Quality standard ≥9.5/10; finish only when 100% resolved

Notes
- Keep Augment tasklist single IN_PROGRESS; Archon may track multiple doings
- Use Archon for tasks/knowledge; Serena for codebase reads; Desktop Commander for file ops
