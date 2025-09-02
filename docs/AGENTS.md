# 📚 Orquestrador de Documentação (docs/)

Guia central para navegar toda a documentação do projeto. Use este arquivo como ponto de partida para encontrar rapidamente o documento certo, com links diretos e explicação sucinta do propósito de cada pasta e arquivo.

## 🧭 Mini Sumário
- Visão: [Como Usar](#como-usar) • [Navegação Rápida](#navegacao-rapida)
- Inventário por pasta: [Mapa da Pasta docs](#mapa-da-pasta-docs)
  - [agents/](#agents) · [architecture/](#architecture) · [database-schema/](#database-schema) · [apis/](#apis)
  - [rules/](#rules) · [testing/](#testing) · [prd/](#prd) · [mistakes/](#mistakes) · [shards/](#shards) · [Raiz](#raiz-de-docs)
- Listão: [Inventário Completo](#inventario-completo)
- Referência: [Convenções de Navegação](#convencoes) • [Observação](#observacao)

---

<a id="como-usar"></a>
## 🔎 Como Usar

1) Comece pelos orquestradores por área (links abaixo)
2) Abra o guia específico da pasta antes de editar qualquer arquivo
3) Volte aqui quando precisar descobrir “onde fica” determinado conteúdo

---

<a id="navegacao-rapida"></a>
## 🧭 Navegação Rápida (Orquestradores por Pasta)

- Architecture: `docs/architecture/AGENTS.md` → Arquitetura do sistema e do frontend, árvore de fontes e stack
  - Link: [./architecture/AGENTS.md](./architecture/AGENTS.md)
- Database Schema: `docs/database-schema/AGENTS.md` → Regras e inventário de schema, tabelas e RLS
  - Link: [./database-schema/AGENTS.md](./database-schema/AGENTS.md)
- APIs: `docs/apis/AGENTS.md` → Padrões e organização de documentação de endpoints + AI SDK
  - Link: [./apis/AGENTS.md](./apis/AGENTS.md)
- Agents: `docs/agents/AGENTS.md` → Sistema de agentes (apex-dev, researcher, ui-ux, test, etc.)
  - Link: [./agents/AGENTS.md](./agents/AGENTS.md)

Documentos fundamentais:
- Memória do Projeto: [./memory.md](./memory.md) — protocolo de consulta e atualização de conhecimento
- Padrões de Código: [./rules/coding-standards.md](./rules/coding-standards.md) — normas e preferências do projeto

---

<a id="mapa-da-pasta-docs"></a>
## 🗂️ Mapa da Pasta docs

<a id="agents"></a>
### agents/ — Agentes e papéis
- Orquestrador: [./agents/AGENTS.md](./agents/AGENTS.md)
- Principais documentos:
  - [./agents/apex-dev.md](./agents/apex-dev.md) — agente de desenvolvimento e coordenação
  - [./agents/apex-researcher.md](./agents/apex-researcher.md) — pesquisa multi‑fonte com compliance
  - [./agents/apex-ui-ux-designer.md](./agents/apex-ui-ux-designer.md) — design healthcare com acessibilidade
  - [./agents/test.md](./agents/test.md) — orquestração de testes (linka docs/testing)
  - [./agents/prd.md](./agents/prd.md) — geração e organização de PRD
  - [./agents/briefing.md](./agents/briefing.md) — briefing de marketing
  - [./agents/documentation.md](./agents/documentation.md) — templates e padrões de documentação

<a id="architecture"></a>
### architecture/ — Arquitetura do sistema e frontend
- Orquestrador: [./architecture/AGENTS.md](./architecture/AGENTS.md)
- Principais documentos:
  - [./architecture/architecture.md](./architecture/architecture.md) — visão end‑to‑end e diagramas
  - [./architecture/source-tree.md](./architecture/source-tree.md) — estrutura real do monorepo
  - [./architecture/frontend-architecture.md](./architecture/frontend-architecture.md) — camadas e práticas frontend
  - [./architecture/front-end-spec.md](./architecture/front-end-spec.md) — guia de desenvolvimento frontend
  - [./architecture/tech-stack.md](./architecture/tech-stack.md) — tecnologias e versões
  - [./architecture/aesthetic-platform-flows.md](./architecture/aesthetic-platform-flows.md) — fluxos da plataforma

<a id="database-schema"></a>
### database-schema/ — Esquema de banco (Supabase)
- Orquestrador: [./database-schema/AGENTS.md](./database-schema/AGENTS.md)
- Principais documentos:
  - [./database-schema/database-schema-consolidated.md](./database-schema/database-schema-consolidated.md) — arquitetura e padrões (RLS, funções, triggers)
  - [./database-schema/tables/README.md](./database-schema/tables/README.md) — convenções por tabela
  - [./database-schema/tables/tables-consolidated.md](./database-schema/tables/tables-consolidated.md) — referência de tabelas

<a id="apis"></a>
### apis/ — Documentação de APIs e AI SDK
- Orquestrador: [./apis/AGENTS.md](./apis/AGENTS.md)
- Principais documentos:
  - [./apis/apis.md](./apis/apis.md) — instruções para escrever docs de endpoints
  - [./apis/ai-sdk-v5.0.md](./apis/ai-sdk-v5.0.md) — melhores práticas AI SDK v5.0
  - [./apis/ai-sdk-v4.0.md](./apis/ai-sdk-v4.0.md) — melhores práticas AI SDK v4.0 (legado/migração)

<a id="rules"></a>
### rules/ — Regras e padrões do projeto
- [./rules/coding-standards.md](./rules/coding-standards.md) — padrões de código (referência principal)
- [./rules/supabase-best-practices.md](./rules/supabase-best-practices.md) — práticas com Supabase
- [./rules/supabase-auth-guidelines.md](./rules/supabase-auth-guidelines.md) — diretrizes de autenticação
- [./rules/supabase-realtime-usage.md](./rules/supabase-realtime-usage.md) — uso do Realtime
- [./rules/supabase-consolidation.md](./rules/supabase-consolidation.md) — consolidação de pastas Supabase
- [./rules/variables-configuration.md](./rules/variables-configuration.md) — variáveis de ambiente

<a id="testing"></a>
### testing/ — Testes e qualidade
- [./testing/react-test-patterns.md](./testing/react-test-patterns.md) — padrões de teste para React
- [./testing/e2e-testing.md](./testing/e2e-testing.md) — guia Playwright E2E
- [./testing/integration-testing.md](./testing/integration-testing.md) — integração (APIs, DB, Realtime, AI)
- [./testing/coverage-policy.md](./testing/coverage-policy.md) — política de cobertura
- [./testing/ci-pipelines.md](./testing/ci-pipelines.md) — pipelines de CI/CD para testes

<a id="prd"></a>
### prd/ — Documentos de produto
- [./prd/prd.md](./prd/prd.md) — PRD geral do produto
- [./prd/01-executive-summary-and-analysis.md](./prd/01-executive-summary-and-analysis.md) — sumário executivo e análise
- [./prd/02-functional-and-technical-specs.md](./prd/02-functional-and-technical-specs.md) — requisitos funcionais e técnicos
- [./prd/03-success-metrics-and-implementation.md](./prd/03-success-metrics-and-implementation.md) — métricas de sucesso e implementação
- Pastas auxiliares previstas: `./prd/epics/` (épicos por arquivo)

<a id="mistakes"></a>
### mistakes/ — Erros e correções
- [./mistakes/dprint-windows-dependency.md](./mistakes/dprint-windows-dependency.md) — dependência do dprint no Windows (resolvido)

<a id="shards"></a>
### shards/ — Planejamento granular (backlog/épicos/histórias)
- Pastas: `./shards/`, `./shards/epics/`, `./shards/stories/` (sem arquivos no momento)

<a id="raiz-de-docs"></a>
### Raiz de docs
- [./memory.md](./memory.md) — protocolo de memória (consulta e atualização)

---

<a id="inventario-completo"></a>
## 📒 Inventário Completo com Descrições Curtas

> Dica: caso um arquivo não tenha heading H1, a descrição usa o nome do arquivo.

- ./agents/AGENTS.md — Orquestrador dos agentes do projeto
- ./agents/apex-dev.md — UNIFIED DEVELOPMENT AGENT (coordenação + dev)
- ./agents/apex-researcher.md — APEX RESEARCHER AGENT (pesquisa multi‑fonte)
- ./agents/apex-ui-ux-designer.md — APEX UI/UX DESIGNER AGENT (acessibilidade + shadcn/ui)
- ./agents/test.md — Test Agent Orchestration Guide (links para docs/testing)
- ./agents/prd.md — PRD Generation Instructions (estrutura e divisão de arquivos)
- ./agents/briefing.md — Marketing Briefing Agent Mode (template e processo)
- ./agents/documentation.md — Documentation Architect Mode (templates universais)

- ./architecture/AGENTS.md — Architecture Orchestration Guide (roteamento de docs de arquitetura)
- ./architecture/architecture.md — NeonPro Architecture (visão end‑to‑end)
- ./architecture/source-tree.md — Source Tree Architecture (monorepo real)
- ./architecture/frontend-architecture.md — Frontend Architecture (camadas e práticas)
- ./architecture/front-end-spec.md — Frontend Development Guide (padrões e fluxo)
- ./architecture/tech-stack.md — Tech Stack (versões e componentes do stack)
- ./architecture/aesthetic-platform-flows.md — Aesthetic Platform Flows (fluxos da plataforma)

- ./database-schema/AGENTS.md — Database Schema Orchestrator (regras de trabalho)
- ./database-schema/database-schema-consolidated.md — Database Schema Architecture (padrões Supabase)
- ./database-schema/tables/README.md — Tables Documentation (convenções por tabela)
- ./database-schema/tables/tables-consolidated.md — Database Tables Reference (tabelas + RLS)

- ./apis/AGENTS.md — API Docs Orchestrator (padrões de documentação)
- ./apis/apis.md — NEONPRO API Documentation (estrutura e exemplos)
- ./apis/ai-sdk-v5.0.md — Vercel AI SDK v5.0 Best Practices
- ./apis/ai-sdk-v4.0.md — Vercel AI SDK Best Practices (v4.0)

- ./rules/coding-standards.md — NEONPRO CODING STANDARDS (padrões de código)
- ./rules/supabase-best-practices.md — Supabase Best Practices
- ./rules/supabase-auth-guidelines.md — Supabase Authentication Guidelines
- ./rules/supabase-realtime-usage.md — Supabase Realtime Usage Guidelines
- ./rules/supabase-consolidation.md — Supabase Folder Consolidation Report
- ./rules/variables-configuration.md — Variables Configuration (variáveis de ambiente)

- ./testing/react-test-patterns.md — Padrões de Teste para Componentes React
- ./testing/e2e-testing.md — Playwright E2E Testing Guide
- ./testing/integration-testing.md — Integration Testing Guide
- ./testing/coverage-policy.md — Coverage Policy
- ./testing/ci-pipelines.md — CI/CD Testing Pipelines

- ./prd/prd.md — Product Requirements Document (visão geral)
- ./prd/01-executive-summary-and-analysis.md — Executive Summary and Analysis
- ./prd/02-functional-and-technical-specs.md — Functional and Technical Specifications
- ./prd/03-success-metrics-and-implementation.md — Success Metrics and Implementation

- ./mistakes/dprint-windows-dependency.md — dprint Windows Dependency Issue (resolvido)

- ./memory.md — Memory Management Protocol (consulta e atualização de conhecimento)

---

<a id="convencoes"></a>
## ✅ Convenções de Navegação
- Links são relativos a este arquivo (pasta `docs/`)
- Sempre leia o orquestrador da pasta antes de editar arquivos internos
- Para padrões gerais, consulte também: [./rules/coding-standards.md](./rules/coding-standards.md)

---

<a id="observacao"></a>
## 📌 Observação
O conteúdo de “orquestração de agentes” que antes ficava aqui foi consolidado em [./agents/AGENTS.md](./agents/AGENTS.md), mantendo este arquivo como guia orquestrador da pasta `docs/` inteira.
