# Neon Pro – Full‑Stack Architecture Document

> **Versão:** 2025-07-18
> **Autor:** Winston (Architect Agent) – BMad‑Method

---

## 1 · Visão Geral & Contexto do Sistema

**Neon Pro** adota uma arquitetura **Next.js 15 “islands”** hospedada em **Vercel Edge Network** com **Supabase** como data‑plane e um **Canal de Mensagens plug‑in**.  
- **Next.js 15 (App Router)**: SSR/ISR + Edge Cache (`revalidate: 60 s`) e **Server Actions** assíncronas.  
- **Edge Functions** em Vercel Deno executam lógica crítica (agenda, conciliação, mensageria) autenticada via JWT Supabase.  
- **Supabase** oferece Postgres + Auth + Storage + Realtime; **RLS** garante isolamento multi‑tenant (LGPD).  
- **Canal de Mensagens** desacoplado: adapter TypeScript → providers (WhatsApp Cloud, Twilio SMS) com fallback e fila assíncrona.  
- **Offline first PWA**: Service Worker com precache `/agenda` e fila IndexedDB.  
- **Ambientes**: Preview → Staging (beta) → Production, cada um com instância Supabase isolada.

```
[ Browser / PWA ]──SW offline/queue──▶ [ Islands React ]
        │  Server Actions
        ▼
[ Vercel Edge Functions ]───Messages──▶ [ Messages Adapter ]──▶ [ WA / SMS ]
        │ JWT + trace_id
        ▼
[ Supabase Postgres + RLS ]──▶ [ Read‑Replica / Backups S3 ]
```

---

## 2 · Componentes Lógicos & Fluxo de Dados

| Camada | Componentes | Responsabilidades | Notas |
|--------|-------------|-------------------|-------|
| **Interface / PWA** | Islands React, Service Worker | UI, offline queue (retries × 5), precache | Banner erro se fila falha |
| **Edge Functions** | `agenda`, `finance`, `messages.enqueue`, `payments.import` | JWT validação, Zod schemas, stored proc chamada | `trace_id` propagado |
| **Async Workers** | Supabase Edge cron every 5 s | Processa filas `messages`, `payments` | Concurrency dinâmica (10→40) |
| **Data‑plane** | Supabase Postgres, proc `sp_book_appointment` | Consistência ACID, RLS multi‑tenant | Prevent double‑booking |
| **Observability** | New Relic, Grafana | Logs, traces, metrics, alerts | MTTR < 15 min |

**Fluxo booking (happy‑path)**  
1. Paciente POST `/v1/agenda/book` → Edge (Zod, JWT).  
2. Edge chama `sp_book_appointment` (verifica conflito, cria row).  
3. Trigger `pg_notify('new_appt')` publica evento.  
4. Worker enfileira WhatsApp; fallback SMS.  
5. Realtime canal `agenda:<clinic_id>:<date>` atualiza recepção.  
6. SW sincroniza fila offline quando on‑line.

---

## 3 · Modelo de Dados & Políticas RLS

Principais tabelas usam **UUID padrão `gen_random_uuid()`**, campos `created_at`, `updated_at`, `deleted_at` (soft‑delete) e `clinic_id` como chave de tenant.  
Stored Procedure `sp_book_appointment` garante atomicidade; triggers delegam enfileiramento via `pg_notify`.

**Exemplo de política RLS (SELECT)**  
```sql
CREATE POLICY select_appt ON appointments
FOR SELECT USING (
  clinic_id = current_setting('request.jwt.claims', true)::json->>'clinic_id'
  AND deleted_at IS NULL
);
```

Criptografia **PGP_symm** apenas em `patients.document`. Timezone armazenado em UTC + coluna `tz` na tabela `clinics`.

---

## 4 · Infraestrutura & Pipeline CI/CD

| Ambiente | Hosting | Database | Propósito |
|----------|---------|----------|-----------|
| Preview | Vercel Preview | Supabase preview | PR validation |
| Staging | `staging.neonpro.app` | Supabase staging | Beta fechado |
| Production | `neonpro.app` | Supabase prod + replica | MVP público |

**CI/CD:** GitHub Actions (lint → Jest 80 % cov → Playwright → dbmate migrate → build) → Vercel Preview. Merge main → Staging; Canary 50 % traffic, promote 100 % se métricas OK. Tagged release deploy production. IaC via Terraform; cost diff Infracost no PR.

---

## 5 · API Surface & Edge Functions

Versão **`/v1`** com JSON padrão `{{ traceId, errorCode, message }}`.

| Método | Endpoint | Auth | Rate‑limit | Observações |
|--------|----------|------|-----------|-------------|
| POST | `/v1/agenda/book` | JWT public | 60 rpm | Chama proc, retorna 201 |
| PATCH | `/v1/agenda/{{id}}/status` | recep/gestor | 120 rpm | Atualiza enum |
| GET | `/v1/agenda` | JWT | 120 rpm | Filtros date, professional, status |
| POST | `/v1/payments/import` | finance | 30 rpm | CSV ≤ 5 MB, scanned |
| POST | `/v1/messages/send` | gestor | 60 rpm | Enfileira |
| GET | `/v1/reports/kpi` | gestor | 30 rpm | cache 60 s |
| GET | `/v1/healthz` | none | — | 200 OK |
| GET | `/v1/metrics` | token | — | Prometheus |
| GET | `/v1/docs` | public | — | Swagger UI |

Esquemas em Zod → OpenAPI via pipeline; docs em `/v1/openapi.json`.

---

## 6 · Segurança & Compliance

- **Defesa em profundidade:** WAF, JWT, RLS, AES‑256, TLS 1.3, soft‑delete.  
- **LGPD:** consent audit, anonimização após 2 anos inativo, export portabilidade.  
- **OWASP Top 10** mitigations registradas; CI bloqueia CVSS ≥ 7.  
- **Pentest schedule:** Sprint RC (OWASP ZAP) + trimestral black‑box.

---

## 7 · Escalabilidade & Custos

Inicial **≈ US$ 274/mês** (Vercel Pro, Supabase xlarge‑4, Storage 100 GB, SMS fallback).  
Triggers de escala: Edge cold‑start p95 > 300 ms, Supabase CPU > 70 %, Realtime conns > 80 %.  
Budget alarms 80 % / 100 % para Supabase & Twilio; Infracost diff nos PRs.

---

## 8 · Observabilidade & Monitoramento

- **Unified trace_id** header → New Relic → Grafana Loki logs.  
- SLOs: API p95 ≤ 800 ms, cold‑start p95 ≤ 300 ms, error rate < 1 %.  
- Alerts Slack → PagerDuty; MTTR alvo < 15 min.  
- Dashboards: Grafana UID `neonpro-overview`.

---

## 9 · Extensibilidade & Roadmap Técnico

Feature flags com ciclo **PROPOSED → EXPERIMENT → ROLLOUT → SUNSET**; flag de emergência `emergency_readonly`.  
Expansion packs versionados semver + GPG; ADR‑bot controla decisões (#001‒006).

---

## ✅ Conclusão

Arquitetura alinhada ao PRD; cobre metas de performance, segurança LGPD, custo OPEX inicial < US$ 300/mês, escala até 1000 clínicas. Extensível via packs, segura via RLS + Edge.  

**Próximos passos**  
1. Revisão DevOps → `terraform apply`.  
2. PO shard docs & arquitetura.  
3. SM iniciar stories P0 (Financeiro, Portal Paciente).

---

*Gerado automaticamente pela BMad‑Method – Arquitetura Neon Pro.*