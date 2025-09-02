---
title: "Architecture Orchestrator (docs/architecture) — v2"
version: 2.0.0
last_updated: 2025-09-02
language: en
applyTo:
  - "docs/architecture/**"
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
      - "docs/architecture/AGENTS.md"
      - "docs/architecture/**/README.md"
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

# 🏛️ NeonPro Architecture Orchestration Guide (docs/architecture)

## 🧠 Intelligent Architecture Context Engineering

- Purpose: Central navigation for architectural docs (not the docs themselves)
- Mission: Route AI agents and developers to the right architecture file, fast
- Principle: Minimal context loading → precise document selection → efficient work

## 📚 Architecture Documentation Matrix

### System Architecture

- **🏗️ @system-architecture**: [docs/architecture/architecture.md](./architecture.md)
  - One‑line: End‑to‑end platform architecture overview and diagrams
  - Use when: You need the big picture before decisions or cross‑cutting changes
  - Metadata:
    ```yaml
    role: "System Architecture Overview"
    triggers: ["overview", "diagram", "end-to-end", "big-picture", "decisão"]
    outputs: ["contexto geral", "componentes", "fluxos de alto nível"]
    ```

- **🌳 @source-tree**: [docs/architecture/source-tree.md](./source-tree.md)
  - One‑line: Real monorepo structure (apps/packages) validated and categorized
  - Use when: Locating code, packages, or wiring across the repo
  - Metadata:
    ```yaml
    role: "Repository Structure & Boundaries"
    triggers: ["onde está", "packages", "apps", "ownership", "dependências"]
    outputs: ["mapa do repo", "categorias", "localização de código"]
    ```

### Frontend Architecture

- **🖥️ @frontend-architecture**: [docs/architecture/frontend-architecture.md](./frontend-architecture.md)
  - One‑line: Frontend architectural patterns, layers, and best practices
  - Use when: Designing frontend solutions or validating approaches
  - Metadata:
    ```yaml
    role: "Frontend Architectural Guidance"
    triggers: ["frontend", "camadas", "padrões", "boas práticas"]
    outputs: ["decisões de UI", "arquitetura web", "guidelines"]
    ```

- **🧩 @frontend-spec**: [docs/architecture/front-end-spec.md](./front-end-spec.md)
  - One‑line: Frontend development conventions, workflows, and implementation details
  - Use when: Coding, enforcing conventions, or aligning on developer workflows
  - Metadata:
    ```yaml
    role: "Frontend Development Specification"
    triggers: ["convenções", "workflow", "implementação", "padrões de código"]
    outputs: ["regras práticas", "quick references", "exemplos"]
    ```

### Technology & Flows

- **⚙️ @tech-stack**: [docs/architecture/tech-stack.md](./tech-stack.md)
  - One‑line: Live, in‑repo technology list with pinned versions and tooling
  - Use when: Choosing libs, validating compatibility, or planning upgrades
  - Metadata:
    ```yaml
    role: "Technology Inventory & Versions"
    triggers: ["versões", "compatibilidade", "libs", "upgrade", "tooling"]
    outputs: ["stack atual", "pinagens", "dependências críticas"]
    ```

- **🩺 @platform-flows**: [docs/architecture/aesthetic-platform-flows.md](./aesthetic-platform-flows.md)
  - One‑line: Core product workflows and sequence diagrams for aesthetic clinics
  - Use when: Mapping functional behavior or designing new flows
  - Metadata:
    ```yaml
    role: "Business/Clinical Workflow Architecture"
    triggers: ["fluxo", "sequência", "processo", "produto"]
    outputs: ["diagramas", "passo-a-passo funcional"]
    ```

## 🔄 Orchestrated Architecture Workflows

- Implementar feature frontend
  1. @tech-stack → 2) @frontend-architecture → 3) @frontend-spec → (+ @source-tree se necessário)
- Corrigir bug transversal
  1. @source-tree → 2) @tech-stack → 3) seção relevante em @system-architecture
- Criar novo fluxo
  1. @platform-flows → 2) @system-architecture → 3) @source-tree
- Revisar performance/segurança
  1. @tech-stack → 2) @frontend-architecture → 3) @source-tree

## 🧭 Navigation Commands

```bash
# Sistema
@system-architecture "panorama end-to-end"
@source-tree "onde está X?"

# Frontend
@frontend-architecture "padrões de camadas"
@frontend-spec "convenções de implementação"

# Tech & Flows
@tech-stack "versões e compatibilidade"
@platform-flows "diagramas funcionais"
```

## 🧠 Intelligent Context Engineering

```yaml
CONTEXT_STRATEGY:
  minimal_loading: "Carregue apenas 1-2 arquivos por tarefa"
  primary_order:
    - @system-architecture
    - @source-tree
    - @frontend-architecture
    - @frontend-spec
    - @tech-stack
    - @platform-flows
  when_to_load:
    overview: [@system-architecture]
    localizar_codigo: [@source-tree]
    design_frontend: [@frontend-architecture, @frontend-spec]
    escolher_tecnologias: [@tech-stack]
    definir_fluxos: [@platform-flows, @system-architecture]
```

## 📚 References (correct link format)

- **🏗️ @system-architecture**: [docs/architecture/architecture.md](./architecture.md)
- **🌳 @source-tree**: [docs/architecture/source-tree.md](./source-tree.md)
- **🖥️ @frontend-architecture**: [docs/architecture/frontend-architecture.md](./frontend-architecture.md)
- **🧩 @frontend-spec**: [docs/architecture/front-end-spec.md](./front-end-spec.md)
- **⚙️ @tech-stack**: [docs/architecture/tech-stack.md](./tech-stack.md)
- **🩺 @platform-flows**: [docs/architecture/aesthetic-platform-flows.md](./aesthetic-platform-flows.md)
