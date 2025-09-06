---
title: Smoke Checklist — MVP Staging
last_updated: 2025-09-06
form: how-to
tags: [testing, e2e, smoke]
related:
  - ./staging-deploy-runbook.md
---

# Smoke Checklist — MVP Staging

## Dados de Teste

- Usuário: test@example.com / senha: Teste@123 (staging)
- Paciente: Nome "Teste Silva", consentimento LGPD = true
- Horário: próximo horário disponível (±24h)

## Fluxo Essencial

1. Login → ver dashboard.
2. Criar paciente → editar → excluir (consentimento visível).
3. Criar e cancelar agendamento.
4. Health: `/api/health` 200 e página de status carrega.

## Aprovação

- Todos passos OK sem erros críticos.
- Duração total < 5 minutos.
