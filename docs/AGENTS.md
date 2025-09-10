---

title: "📚 Documentation Orchestrator (docs/) — v2"
applyTo:

- "docs/**"

- llm:
- mandatory_sequence:
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
  - guardrails:
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
  priority: omitted
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
    - goal: "Create/update an API"
      consult:
        - docs/apis/AGENTS.md
        - docs/apis/apis.md
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

## Pre-Development Guidelines

**📚 Documentation Consultation:**
⚠️ **IMPORTANT**: Only consult documentation when you have specific questions or uncertainties. Avoid loading unnecessary context.

- agents/ — Orchestrator: [./agents/AGENTS.md](./agents/AGENTS.md)
  - Key documents: apex-dev, apex-researcher, apex-ui-ux-designer, test, prd, briefing, documentation, rules

- Check architecture/ — Orchestrator for architectural decisions: [./architecture/AGENTS.md](./architecture/AGENTS.md)
  - Review `docs/tech-stack.md` for technology guidelines
  - Key documents: architecture, source-tree, frontend-architecture, front-end-spec, tech-stack, aesthetic-platform-flows

- Check database-schema/ — Orchestrator for data structure: [./database-schema/AGENTS.md](./database-schema/AGENTS.md)
  - Key documents: database-schema-consolidated, tables/README, tables/tables-consolidated
- Look at apis/ — Orchestrator for API patterns: [./apis/AGENTS.md](./apis/AGENTS.md)
  - Key documents: apis, ai-sdk-v5.0, ai-sdk-v4.0
- **Code Style:** Follow established patterns and conventions from development rules and guidelines found in the `/rules` directory — Standards: coding-standards, supabase-*, variables-configuration
- Check testing/ — Tests: react-test-patterns, e2e-testing, integration-testing, coverage-policy, ci-pipelines
- Check prd/ — Product: prd and support files
- Check mistakes/ — Errors and fixes
- Check features/ — Feature documentation

---
