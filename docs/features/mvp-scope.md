---
title: MVP Scope & DoD — NeonPro
last_updated: 2025-09-06
form: reference
tags: [mvp, acceptance]
related:
  - ./bmad-brownfield-mvp-plan.md
  - ../testing/README-vitest-turborepo.md
---

# MVP Scope & DoD — NeonPro

## Must-have

- Auth básica (login/logout) com Supabase.
- Paciente CRUD com validação Zod e consentimento LGPD.
- Agendamento básico (criar/editar/cancelar) com analytics mock.
- Health-check API e página simples de status.

## Fora de escopo (MVP)

- Integrações externas (WhatsApp/AI) ON por padrão.
- Financeiro avançado e relatórios extensos.

## DoD (Definition of Done)

- `bun run type-check` PASS.
- `bun run test:unit:bun` PASS.
- Smoke e2e (staging) PASS em < 5 min (ver smoke-checklist).
- Build web/api preview/staging Vercel PASS.
- Lint sem erros (warnings tolerados no MVP). dprint check PASS.

## Métricas de Sucesso

- Smoke pass rate ≥ 95% em staging.
- Nenhum incidente alto em deploy inicial.
- Ciclo PR→preview < 15 min.
