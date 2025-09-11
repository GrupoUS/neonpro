---
title: "Testing Orchestrator (docs/testing) — v2"
version: 2.0.0
last_updated: 2025-09-02
language: en
applyTo:
  - "docs/testing/**"
llm:
  mandatory_sequence:
    - sequential-thinking
    - task-management
    - codebase-analysis
  pre_read:
    - path: "docs/AGENTS.md"
      reason: "Root docs orchestrator"
    - path: "docs/memory.md"
      reason: "Memory protocol"
  retrieval_hints:
    prefer:
      - "docs/testing/AGENTS.md"
      - "docs/testing/**/README.md"
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
---

# 🧪 Testing Orchestrator (docs/testing)

Central router for all testing documentation. Start here to choose the right guide.

## Quick Index

- Coverage Policy: `./coverage-policy.md`
- React Test Patterns: `./react-test-patterns.md`
- Integration Testing: `./integration-testing.md`
- E2E Testing: `./e2e-testing.md`
- CI Pipelines: `./ci-pipelines.md`

  - Hono API Testing: `./hono-api-testing.md`
  - TanStack Router Testing: `./tanstack-router-testing.md`
  - Supabase RLS Testing: `./supabase-rls-testing.md`
  - Monorepo Testing Strategies: `./monorepo-testing-strategies.md`
  - Responsibility Matrix: `./testing-responsibility-matrix.md`

## Navigation
- Test Hono endpoints f `./hono-api-testing.md`
- Validate TanStack routes f `./tanstack-router-testing.md`
- Enforce DB RLS f `./supabase-rls-testing.md`
- Plan monorepo runs f `./monorepo-testing-strategies.md`
- Assign responsibilities f `./testing-responsibility-matrix.md`


- Implement unit tests → `./react-test-patterns.md`
- Add integration tests → `./integration-testing.md`
- Run E2E suite → `./e2e-testing.md`
- Validate coverage thresholds → `./coverage-policy.md`
- Configure CI for tests → `./ci-pipelines.md`
