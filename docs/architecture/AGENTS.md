---
title: "Architecture Orchestrator (docs/architecture) — v2"
version: 2.0.0
last_updated: 2025-09-02
language: en
form: "orchestrator"
tags:

- orchestration
- architecture
  applyTo:
- "docs/architecture/**"
  related:
- "docs/AGENTS.md"
- "docs/architecture/AGENTS.md"
- llm:
  mandatory_sequence:
  - sequential-thinking
  - task-management
  - codebase-analysis
    pre_read:
  - path: "docs/AGENTS.md"
    reason: "Root docs orchestrator"
    retrieval_hints:
    prefer:
    - "docs/architecture/AGENTS.md"
    - "docs/architecture/**/README.md"
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

---

# neonpro-architecture-orchestration-guide

## intelligent-architecture-context-engineering

- Purpose: Central navigation for architectural docs (not the docs themselves)
- Mission: Route AI agents and developers to the right architecture file, fast
- Principle: Minimal context loading → precise document selection → efficient work

## architecture-documentation-matrix

### system-architecture

- **🏗️ @system-architecture**: [docs/architecture/architecture.md](./architecture.md)
  - One‑line: End‑to‑end platform architecture overview and diagrams
  - Use when: You need the big picture before decisions or cross‑cutting changes
  - Metadata:
    ```yaml
    role: "System Architecture Overview"
    triggers: ["overview", "diagram", "end-to-end", "big-picture", "decision"]
    outputs: ["overall context", "components", "high-level flows"]
    ```

- **🌳 @source-tree**: [docs/architecture/source-tree.md](./source-tree.md)
  - One‑line: Real monorepo structure (apps/packages) validated and categorized
  - Use when: Locating code, packages, or wiring across the repo
  - Metadata:
    ```yaml
    role: "Repository Structure & Boundaries"
    triggers: ["where is", "packages", "apps", "ownership", "dependencies"]
    outputs: ["repo map", "categories", "code location"]
    ```

### frontend-architecture

- **🖥️ @frontend-architecture**: [docs/architecture/frontend-architecture.md](./frontend-architecture.md)
  - One‑line: Frontend architectural patterns, layers, and best practices
  - Use when: Designing frontend solutions or validating approaches
  - Metadata:
    ```yaml
    role: "Frontend Architectural Guidance"
    triggers: ["frontend", "layers", "patterns", "best practices"]
    outputs: ["UI decisions", "web architecture", "guidelines"]
    ```

- **🧩 @frontend-spec**: [docs/architecture/front-end-spec.md](./front-end-spec.md)
  - One‑line: Frontend development conventions, workflows, and implementation details
  - Use when: Coding, enforcing conventions, or aligning on developer workflows
  - Metadata:
    ```yaml
    role: "Frontend Development Specification"
    triggers: ["conventions", "workflow", "implementation", "code patterns"]
    outputs: ["practical rules", "quick references", "examples"]
    ```

### technology-and-flows

- **⚙️ @tech-stack**: [docs/architecture/tech-stack.md](./tech-stack.md)
  - One‑line: Live, in‑repo technology list with pinned versions and tooling
  - Use when: Choosing libs, validating compatibility, or planning upgrades
  - Metadata:
    ```yaml
    role: "Technology Inventory & Versions"
    triggers: ["versions", "compatibility", "libs", "upgrade", "tooling"]
    outputs: ["current stack", "pinned versions", "critical dependencies"]
    ```

- **🩺 @platform-flows**: [docs/architecture/aesthetic-platform-flows.md](./aesthetic-platform-flows.md)
  - One‑line: Core product workflows and sequence diagrams for aesthetic clinics
  - Use when: Mapping functional behavior or designing new flows
  - Metadata:
    ```yaml
    role: "Business/Clinical Workflow Architecture"
    triggers: ["flow", "sequence", "process", "product"]
    outputs: ["diagrams", "functional step-by-step"]
    ```

## orchestrated-architecture-workflows

- Implement frontend feature
  1. @tech-stack → 2) @frontend-architecture → 3) @frontend-spec → (+ @source-tree if needed)
- Fix cross-cutting bug
  1. @source-tree → 2) @tech-stack → 3) relevant section in @system-architecture
- Create new flow
  1. @platform-flows → 2) @system-architecture → 3) @source-tree
- Review performance/security
  1. @tech-stack → 2) @frontend-architecture → 3) @source-tree

## references-correct-link-format

- **🏗️ @system-architecture**: [docs/architecture/architecture.md](./architecture.md)
- **🌳 @source-tree**: [docs/architecture/source-tree.md](./source-tree.md)
- **🖥️ @frontend-architecture**: [docs/architecture/frontend-architecture.md](./frontend-architecture.md)
- **🧩 @frontend-spec**: [docs/architecture/front-end-spec.md](./front-end-spec.md)
- **⚙️ @tech-stack**: [docs/architecture/tech-stack.md](./tech-stack.md)
- **🩺 @platform-flows**: [docs/architecture/aesthetic-platform-flows.md](./aesthetic-platform-flows.md)
