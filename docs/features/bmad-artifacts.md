---
title: BMAD Artifacts — MVP NeonPro
last_updated: 2025-09-06
form: reference
tags: [bmad, planning, validation]
related:
  - ./bmad-brownfield-mvp-plan.md
  - ../AGENTS.md
---

# BMAD Artifacts — MVP NeonPro

## Problem Canvas (resumo)

- Quem: Clínicas de estética BR.
- Dor: Gestão de paciente/agendamento com compliance e alto tempo de ciclo.
- Resultado desejado: Fluxos essenciais confiáveis, prontos para teste real.

## Hipótese de Valor

- MVP com Auth + Paciente CRUD + Agendamento + Health-check reduz tempo e erros, mantendo LGPD básica.

## Plano de Validação

- Métricas: smoke e2e (<5 min), taxa de sucesso ≥95%, 0 erros críticos de deploy.
- Evidências: type-check PASS, unit PASS, deploy preview/staging Vercel, smoke verde.

## Check de Prontidão

- Env templates prontos (.env.example*), flags OFF integrações.
- Runbook de staging e rollback definidos.
- Rotas de saúde presentes; contratos testáveis em unit/integration.
