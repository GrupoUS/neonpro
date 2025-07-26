# 4 · Core Functionality & MVP Scope

| Módulo | Descrição | Aceitação mínima | Prioridade | KPI |
|--------|-----------|------------------|------------|-----|
| **Autenticação & Permissões** | Login + OAuth Google; roles com RLS | Login ≤ 3 s (p95) | P0 | Churn |
| **Agenda Inteligente** | CRUD horários; bloqueio conflito; lembretes via canal plug‑in | CRUD ≤ 3 cliques; lembrete < 60 s | P0 | Tempo agendamento |
| **Portal Paciente** | Auto‑agendar; cancelar/reagendar | Agendar ≤ 2 min; cancelar ≤ 3 cliques | P0 | No‑show |
| **Financeiro Essencial** | Contas pagar/receber; caixa diário; conciliação CSV | Caixa fecha < 2 h; match ≥ 95 % | P0 | Fechamento caixa |
| **BI & Dashboards** | KPIs realtime + export CSV/PDF | KPI load < 2 s; export ≤ 5 s | P0 | MRR |
| **Cadastro Pacientes & Prontuário** | CRUD ficha + anexos | Criar ficha ≤ 30 s | P0 | Ticket médio |
| **CRM & Campanhas** | Segmentação + lembretes cobrança/retorno | Campanha ≤ 5 cliques; inadimplência −20 % | P1 | Inadimplência |
| **Estoque Simplificado** | Entradas/saídas; alertas baixo nível | Notif. ≤ 60 s; saldo < 30 % | P1 | Custos |

*RF‑09 Gestão Serviços* e *RF‑10 Gestão Profissionais* já **implementados** no repositório.
