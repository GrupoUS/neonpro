---
title: MVP Risks & Mitigation — NeonPro
last_updated: 2025-09-06
form: reference
tags: [risks, mitigation]
related:
  - ./mvp-scope.md
  - ./staging-deploy-runbook.md
---

# MVP Risks & Mitigation — NeonPro

## Riscos (impacto x probabilidade)

- Integrações externas (WhatsApp/AI)
  - Impacto: médio/alto • Prob: médio
  - Mitigação: flags OFF; mocks; habilitar por cohort.
- RLS/Compliance em produção
  - Impacto: alto • Prob: baixo/médio
  - Mitigação: validar RLS em staging; labeling MVP; auditoria mínima.
- Env/segredos
  - Impacto: alto • Prob: médio
  - Mitigação: `.env.example*` completos; checklist de validação pré-deploy.
- Lint warnings
  - Impacto: baixo/médio • Prob: alto
  - Mitigação: task pós-MVP para cleanup; monitorar CI.

## Gatilhos & Contingência

- Smoke falhou → rollback Vercel imediato, abrir bug com logs.
- Health 5xx → desativar integrações, investigar dependência externa.
- Falha de conexão DB → alternar para rotas mock; revisar DATABASE_URL.
