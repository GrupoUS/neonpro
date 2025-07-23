# 2 · Componentes Lógicos & Fluxo de Dados

| Camada | Componentes | Responsabilidades | Notas |
|--------|-------------|-------------------|-------|
| **Interface / PWA** | Islands React, Service Worker | UI, offline queue (retries × 5), precache | Banner erro se fila falha |
| **Edge Functions** | `agenda`, `finance`, `messages.enqueue`, `payments.import` | JWT validação, Zod schemas, stored proc chamada | `trace_id` propagado |
| **Async Workers** | Supabase Edge cron every 5 s | Processa filas `messages`, `payments` | Concurrency dinâmica (10→40) |
| **Data‑plane** | Supabase Postgres, proc `sp_book_appointment` | Consistência ACID, RLS multi‑tenant | Prevent double‑booking |
| **Observability** | New Relic, Grafana | Logs, traces, metrics, alerts | MTTR < 15 min |

## Fluxo booking (happy‑path)

1. Paciente POST `/v1/agenda/book` → Edge (Zod, JWT).
2. Edge chama `sp_book_appointment` (verifica conflito, cria row).
3. Trigger `pg_notify('new_appt')` publica evento.
4. Worker enfileira WhatsApp; fallback SMS.
5. Realtime canal `agenda:<clinic_id>:<date>` atualiza recepção.
6. SW sincroniza fila offline quando on‑line.
