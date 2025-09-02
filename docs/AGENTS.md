---
# Machine-readable metadata for LLMs and tooling
title: "📚 Documentation Orchestrator (docs/) — v2"
version: 2.0.0
last_updated: 2025-09-02
language: en
applyTo:
  - "docs/**"
llm:
  mandatory_sequence:
    - sequential-thinking
    - task-management
    - codebase-analysis
  pre_read:
    - path: "docs/AGENTS.md"
      reason: "Root orchestrator for the docs folder"
    - path: "docs/memory.md"
      reason: "Mandatory memory protocol"
    - path: "docs/agents/AGENTS.md"
      reason: "Agent system and coordination"
    - path: "docs/rules/coding-standards.md"
      reason: "Project coding standards"
  retrieval_hints:
    prefer:
      - "docs/**/AGENTS.md"
      - "docs/**/README.md"
    avoid:
      - "images/**"
      - "*.pdf"
  guardrails:
    tone: "concise, professional, English"
    formatting: "Markdown with clear headings and short lists"
    stop_criteria: "finish only when the task is 100% resolved"
  output_preferences:
    - "Use short bullets"
    - "Include relative paths in backticks"
    - "Provide shell commands in fenced code blocks when applicable"

# Machine-readable index to guide retrieval priority per domain
llm_index:
  - name: "architecture"
    path: "docs/architecture/**"
    priority: high
  - name: "agents"
    path: "docs/agents/**"
    priority: high
  - name: "apis"
    path: "docs/apis/**"
    priority: medium
  - name: "database-schema"
    path: "docs/database-schema/**"
    priority: medium
  - name: "rules"
    path: "docs/rules/**"
    priority: medium
  - name: "testing"
    path: "docs/testing/**"
    priority: medium
  - name: "prd"
    path: "docs/prd/**"
    priority: low
  - name: "mistakes"
    path: "docs/mistakes/**"
    priority: medium
  - name: "shards"
    path: "docs/shards/**"
    priority: low
---

# 📚 Documentation Orchestrator (docs/) — v2

Central guide for humans and LLMs to navigate the entire `docs/` folder with maximum efficiency and precision.

## ⚡ Quick Start for LLMs

1. Read the prerequisites (see front matter: `llm.pre_read`)
2. Follow the mandatory sequence: thinking → tasks → codebase analysis (`llm.mandatory_sequence`)
3. Use the `llm_index` to prioritize folders by domain
4. Apply the Diátaxis framework when consuming content: Tutorial → How-to → Reference → Explanation
5. When finished, execute the Memory Protocol (see `docs/memory.md`)

## 🔎 How to Use (Humans)

- Start with the per-area orchestrators (links below)
- Read the folder guide before editing any internal file
- Return here when you need to discover where content lives

## 🧭 Orchestrated Navigation (by Folder)

- Architecture: `docs/architecture/AGENTS.md` → System and frontend architecture, source tree, stack
  - Link: [./architecture/AGENTS.md](./architecture/AGENTS.md)
- Database Schema: `docs/database-schema/AGENTS.md` → Schema rules and inventory, tables and RLS
  - Link: [./database-schema/AGENTS.md](./database-schema/AGENTS.md)
- APIs: `docs/apis/AGENTS.md` → Documentation standards for endpoints + AI SDK
  - Link: [./apis/AGENTS.md](./apis/AGENTS.md)
- Agents: `docs/agents/AGENTS.md` → Agent system (apex-dev, researcher, ui-ux, test, etc.)
  - Link: [./agents/AGENTS.md](./agents/AGENTS.md)

Fundamental documents:

- Project Memory: [./memory.md](./memory.md)
- Coding Standards: [./rules/coding-standards.md](./rules/coding-standards.md)

## 🧭 Navigation Matrix for LLMs (Machine-readable)

```yaml
navigation_matrix:
  tasks:
    - goal: "Implement a feature or fix a bug"
      consult:
        - docs/agents/AGENTS.md
        - docs/rules/coding-standards.md
        - docs/architecture/source-tree.md
        - docs/memory.md
    - goal: "Create/update an API"
      consult:
        - docs/apis/AGENTS.md
        - docs/apis/apis.md
        - docs/rules/variables-configuration.md
        - docs/testing/integration-testing.md
    - goal: "Modify schema/tables (Supabase)"
      consult:
        - docs/database-schema/AGENTS.md
        - docs/database-schema/database-schema-consolidated.md
        - docs/database-schema/tables/tables-consolidated.md
        - docs/rules/supabase-best-practices.md
    - goal: "Add tests (unit/integration/e2e)"
      consult:
        - docs/testing/coverage-policy.md
        - docs/testing/react-test-patterns.md
        - docs/testing/integration-testing.md
        - docs/testing/e2e-testing.md
```

## 🗂️ Docs Folder Map

- agents/ — Orchestrator: [./agents/AGENTS.md](./agents/AGENTS.md)
  - Key documents: apex-dev, apex-researcher, apex-ui-ux-designer, test, prd, briefing, documentation, rules
- architecture/ — Orchestrator: [./architecture/AGENTS.md](./architecture/AGENTS.md)
  - Key documents: architecture, source-tree, frontend-architecture, front-end-spec, tech-stack, aesthetic-platform-flows
- database-schema/ — Orchestrator: [./database-schema/AGENTS.md](./database-schema/AGENTS.md)
  - Key documents: database-schema-consolidated, tables/README, tables/tables-consolidated
- apis/ — Orchestrator: [./apis/AGENTS.md](./apis/AGENTS.md)
  - Key documents: apis, ai-sdk-v5.0, ai-sdk-v4.0
- rules/ — Standards: coding-standards, supabase-*, variables-configuration
- testing/ — Tests: react-test-patterns, e2e-testing, integration-testing, coverage-policy, ci-pipelines
- prd/ — Product: prd and support files
- mistakes/ — Errors and fixes
- shards/ — Granular planning (epics/stories)

## 🧱 Content Hierarchy (Diátaxis)

- Tutorials: guided steps from zero to “aha” (e.g., quickstarts)
- How-to: task-focused recipes (e.g., “how to document an endpoint”)
- Reference: stable facts and APIs (e.g., contracts, tables)
- Explanation: context and rationale (e.g., architectural decisions)

Keep each document focused on ONE form. Avoid mixing forms.

## 🏷️ Metadata and Tagging (Recommended)

Add simple front matter to primary files:

```yaml
---
title: "Document Name"
last_updated: 2025-09-02
form: reference   # tutorial | how-to | reference | explanation
tags: [agents, testing, supabase]
related:
  - ./AGENTS.md
  - ../rules/coding-standards.md
---
```

Benefits: better retrieval (RAG), maintenance, and cross-navigation.

## 🔗 Cross-referencing and Links

- Use consistent relative links: `[Text](./path/file.md)`
- Include a “See also” block with 3–5 relevant links
- Maintain stable section anchors (English, kebab-case)
- At the top of each file, include a link back to this orchestrator

“See also” model:

```markdown
> See also: [Docs Orchestrator](../AGENTS.md) · [Coding Standards](../rules/coding-standards.md) · [Memory](../memory.md)
```

## ✅ Update & Memory Protocol

- When behavior/contracts change: update related docs
- Log errors/fixes in `docs/mistakes/`
- Update `docs/features/` if you create/alter a feature
- Re-evaluate “See also” links and `tags`
- Follow `docs/memory.md` (Memory Protocol)

## 🗒️ Complete Inventory (Summary)

Refer to the previous version’s “Complete Inventory” section or search within `docs/`.

## 🕒 Changelog

- 2.0.0 (2025-09-02)
  - Adds machine-readable front matter (LLM)
  - Creates `llm_index` and navigation matrix
  - Establishes metadata, tagging, and link conventions
  - Aligns content to the Diátaxis framework
