# Neon Pro – Product Requirements Document (PRD)

---

## 1 · Objective & Context

O **Neon Pro** é uma plataforma SaaS “**all‑in‑one**” que **centraliza agenda, fluxo de caixa, estoque, CRM e BI** para clínicas de estética.  
Desenvolvido em **Next.js 15 + Supabase**, elimina o uso de planilhas e apps desconexos, entrega **insights financeiros em tempo real** e prepara terreno para módulos de **IA** (chatbot de atendimento e previsões de receita).  

O **MVP** foca em:

- Autenticação OAuth Google + roles (RLS)  
- Agenda inteligente com Portal Paciente  
- Financeiro essencial (contas a pagar / receber + fluxo de caixa)  
- Relatórios BI core exportáveis  

Metas norteadoras: reduzir **tempo de agendamento em 30 %**, diminuir **no‑show em 25 %** e ampliar **MRR em 25 %** nos 6 meses pós‑lançamento.

---

## 2 · Business Goals & Success Metrics

### Strategic Goals

1. **Centralizar operações** – substituir planilhas e apps isolados.  
2. **Eficiência financeira** – visão de caixa e BI em tempo real.  
3. **Experiência do paciente** – reduzir no‑shows e fidelizar via CRM.  
4. **Crescimento de receita recorrente** – escalar MRR por assinatura.  
5. **Segurança e escalabilidade** – RLS Supabase + Next.js edge.

### KPIs (6 meses pós‑MVP)

| Indicador | Meta | Baseline |
|-----------|------|----------|
| **MRR** | + 25 % | 1º mês pós‑go‑live |
| **NPS** | ≥ 75 | Pesquisa T0 |
| **Churn mensal** | ≤ 3 % | Setor ≈ 7 % |
| **Tempo médio agendamento** | − 30 % | 15 min → 10,5 min |
| **Taxa de no‑show** | − 25 % | 20 % → 15 % |
| **Recuperação inadimplência** | + 20 % | 65 % → 78 % |
| **Adoção módulos/clinica** | ≥ 4 módulos | Agenda, Financeiro, CRM, BI |

---

## 3 · Personas & User Profiles

| Persona | Objetivos | Dores / Medos | Métricas de sucesso |
|---------|-----------|---------------|---------------------|
| **Gestor / Proprietário** | Visão lucro diário; escalar sem planilhas; compliance LGPD | Falta de BI; perda de receita; custos ocultos | MRR +25 %; fechamento mês < 2 h |
| **Recepcionista / Atendimento** | Agendar ≤ 2 min; lembretes auto; prontuário rápido | Overbooking; ligações manuais | No‑show −25 %; agendamentos +30 % |
| **Back‑office Financeiro** | Conciliação automática; relatórios fiscais | Erros digitação; multas | Caixa diário sem ajuste; 0 multa |
| **Paciente Digital** | Auto‑agendar mobile; confirmação instantânea | Espera telefônica; falta transparência preço | NPS ≥ 75; auto‑agendamento ≥ 60 % |

---

## 4 · Core Functionality & MVP Scope

| Módulo | Descrição | Aceitação mínima | Prioridade | KPI |
|--------|-----------|------------------|------------|-----|
| **Autenticação & Permissões** | Login + OAuth Google; roles com RLS | Login ≤ 3 s (p95) | P0 | Churn |
| **Agenda Inteligente** | CRUD horários; bloqueio conflito; lembretes via canal plug‑in | CRUD ≤ 3 cliques; lembrete < 60 s | P0 | Tempo agendamento |
| **Portal Paciente** | Auto‑agendar; cancelar/reagendar | Agendar ≤ 2 min; cancelar ≤ 3 cliques | P0 | No‑show |
| **Financeiro Essencial** | Contas pagar/receber; caixa diário; conciliação CSV | Caixa fecha < 2 h; match ≥ 95 % | P0 | Fechamento caixa |
| **BI & Dashboards** | KPIs realtime + export CSV/PDF | KPI load < 2 s; export ≤ 5 s | P0 | MRR |
| **Cadastro Pacientes & Prontuário** | CRUD ficha + anexos | Criar ficha ≤ 30 s | P0 | Ticket médio |
| **CRM & Campanhas** | Segmentação + lembretes cobrança/retorno | Campanha ≤ 5 cliques; inadimplência −20 % | P1 | Inadimplência |
| **Estoque Simplificado** | Entradas/saídas; alertas baixo nível | Notif. ≤ 60 s; saldo < 30 % | P1 | Custos |

*RF‑09 Gestão Serviços* e *RF‑10 Gestão Profissionais* já **implementados** no repositório.

---

## 5 · Key User Journeys & Flows

### Fluxo 0 – Autenticação  
Login/OAuth → roles RLS → dashboard (< 3 s).

### Fluxo A – Paciente agenda  
Portal Paciente → seleciona horário → confirma → recebe notificação.  
*Critérios:* agendar ≤ 2 min; lembrete < 60 s; zero overbooking.

### Fluxo B – Recepcionista gerencia agenda  
CRUD horário ≤ 3 cliques; status colorido; lembrete manual/auto.

### Fluxo C – Gestor acompanha finanças  
Dashboard KPI (mobile) carregar < 2 s; export CSV/PDF ≤ 5 s.

### Fluxo D – Back‑office concilia pagamentos  
Import CSV → match ≥ 95 % → caixa fecha < 2 h.

*KPI mapping por fluxo incluído na seção 5 original.*

---

## 6 · Requirements

### Functional Requirements

(Ver tabela seção 4 – “Módulo” = RF‑01…08 + RF‑09, 10 *Implemented*)

### Non‑Functional Requirements

| ID | Categoria | Requisito | Métrica |
|----|-----------|-----------|---------|
| **RNF‑01 Performance** | TTFB ≤ 300 ms web / 500 ms 3G; API ≤ 800 ms p95 |
| **RNF‑02 Segurança & LGPD** | AES‑256 at‑rest; TLS 1.3; retenção 5 anos; anonimização 2 anos |
| **RNF‑03 Escalabilidade** | Edge Functions Vercel; stress × 2 pico |
| **RNF‑04 Acessibilidade** | WCAG 2.1 AA; modo escuro/claro |
| **RNF‑05 Localização** | PT‑BR default; i18n ready |
| **RNF‑06 Integrações** | Mensageria plug‑in swappable ≤ 4 h |
| **RNF‑07 Observabilidade** | Coverage ≥ 80 %; logs agreg p95 < 30 s; alerta Slack ≤ 60 s |

---

## 7 · Release Roadmap

| Fase | Duração | Entregáveis | Critério de saída |
|------|---------|-------------|-------------------|
| Sprint 0.a – DevOps Foundations | 2 sem | Repo, CI/CD, Supabase Auth + RLS | Pipelines verdes |
| Sprint 0.b – UX Wireframes | 2 sem (paralelo) | Protótipo Figma, teste usabilidade ≥ 80 % | Aprovado |
| Sprint 1 – Autenticação & Agenda Core | 2 sem | Login/OAuth, Agenda CRUD, Portal Paciente α | Agendar ≤ 2 min |
| Sprint 2 – Financeiro Essencial | 2 sem | Contas + Caixa + Conciliação β | Caixa < 2 h |
| Sprint 3 – BI Core + Export | 2 sem | KPI dashboard + CSV/PDF | KPI load < 2 s |
| Sprint RC – QA/Perf | 1 sem | Stress × 2 pico, pentest, bug fix | p95 API ≤ 800 ms |
| Beta Fechado (3 clínicas) | 1 sem | Deploy staging, feedback | NPS β ≥ 65 |
| Buffer Sprint | 1 sem | Refatorações, Next.js 15 hardening | Zero crit bugs |
| Sprint 4 – CRM & Campanhas | 2 sem | Segmentação, lembretes cobrança | Campanha ≤ 5 cliques |
| Sprint 5 – Estoque Simplificado | 2 sem | Entradas/saídas, alertas | Notif ≤ 60 s |
| **MVP Público** | — | P0 + CRM no ar, LGPD ok | No‑show −25 %; MRR +25 % |

---

## 8 · Risks, Dependencies & Assumptions

### Risk Matrix

| ID | Risco | Prob. | Impacto | Mitigação | Owner |
|----|-------|-------|---------|-----------|-------|
| R‑01 Supabase down | M | Alto | Backup + replica | DevOps |
| R‑02 Google OAuth muda | M | Médio | fallback Auth email | Dev |
| R‑03 WhatsApp pricing | M | Médio | Plug‑in + SMS | Backend |
| R‑04 Baixa adoção | M | Médio | Onboarding guiado | UX Lead |
| R‑05 Mudança LGPD | B | Alto | Monitor & anonimização | Compliance |
| R‑06 Perf dashboards | M | Médio | Edge Functions | QA Perf |
| R‑07 CSV pagamentos muda | B | Baixo | Adaptador + tests | Backend |
| R‑08 Browsers antigos | B | Baixo | Banner upgrade | Front‑end |
| R‑09 Conectividade fraca | M | Médio | PWA offline | Front‑end |
| R‑10 Next.js 15 canary breaks | M | Médio | Pin version + e2e | DevOps |

### Assumptions

- WhatsApp é canal primário de contato.  
- Dispositivos Chromium latest 2 versões; >= 5 Mbps.  
- Conta bancária exporta CSV.  
- PT‑BR padrão.

---

## 9 · Technical Constraints & External Integrations

| Categoria | Restrição / Integração | Motivo |
|-----------|-----------------------|--------|
| Stack Front‑end | **Next.js 15, React 18, Tailwind CSS + Shadcn** | SSR/ISR, DX, App Router |
| Backend BaaS | **Supabase (Postgres, Auth, Storage, Realtime)** | Time‑to‑market; RLS |
| Infra | **Vercel Edge Functions** | Deploy contínuo, baixa latência |
| Mensageria | Plug‑in: WhatsApp Cloud API / Twilio SMS/e‑mail | Evitar lock‑in |
| Pagamentos | CSV import Stone/Cloud Payments | Conciliação receita |
| Observability | Next.js Telemetry + Supabase Logs + Vercel Analytics | Performance & alertas |
| Compliance | AES‑256, TLS 1.3, retenção 5 anos, anonimização 2 anos | LGPD |
| Browser Support | Chrome/Edge últimas 2 versões | Simplifica QA |

---

**Documento criado por BMad‑Method (PM Agent) – versão 2025‑07‑18.**