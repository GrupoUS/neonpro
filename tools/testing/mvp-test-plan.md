---
title: MVP Test Plan — NeonPro
last_updated: 2025-09-06
form: reference
tags: [testing, unit, integration, e2e]
related:
  - ./README-vitest-turborepo.md
  - ../features/smoke-checklist.md
---

# MVP Test Plan — NeonPro

## Escopo

- Unit: schemas (Zod), utils, hooks essenciais.
- Integração: endpoints paciente/agendamento (mocks quando necessário).
- E2E/Smoke: fluxo essencial (login → paciente CRUD → agendamento → health).

## Dados/Fixtures

- Usuário de teste staging (e-mail/senha controlados).
- Paciente "Teste Silva" com consentimento LGPD.
- Horários próximos (±24h).

## Critérios de Aprovação

- Unit/integração: 0 falhas.
- Smoke: < 5 min; 100% passos concluídos.

## Execução (comandos propostos)

- Type: `bun run type-check`
- Unit: `bun run test:unit:bun`
- Integração: `bun run test:integration`
- E2E/Smoke: job Playwright (staging) — browsers instalados no runner.

## CI (sugestão)

1. type-check → unit
2. build preview → smoke (gate)
