# 1 · Visão Geral & Contexto do Sistema

**Neon Pro** adota uma arquitetura **Next.js 15 "islands"** hospedada em **Vercel Edge Network** com **Supabase** como data‑plane e um **Canal de Mensagens plug‑in**.

- **Next.js 15 (App Router)**: SSR/ISR + Edge Cache (`revalidate: 60 s`) e **Server Actions** assíncronas.
- **Edge Functions** em Vercel Deno executam lógica crítica (agenda, conciliação, mensageria) autenticada via JWT Supabase.
- **Supabase** oferece Postgres + Auth + Storage + Realtime; **RLS** garante isolamento multi‑tenant (LGPD).
- **Canal de Mensagens** desacoplado: adapter TypeScript → providers (WhatsApp Cloud, Twilio SMS) com fallback e fila assíncrona.
- **Offline first PWA**: Service Worker com precache `/agenda` e fila IndexedDB.
- **Ambientes**: Preview → Staging (beta) → Production, cada um com instância Supabase isolada.

```text
[ Browser / PWA ]──SW offline/queue──▶ [ Islands React ]
        │  Server Actions
        ▼
[ Vercel Edge Functions ]───Messages──▶ [ Messages Adapter ]──▶ [ WA / SMS ]
        │ JWT + trace_id
        ▼
[ Supabase Postgres + RLS ]──▶ [ Read‑Replica / Backups S3 ]
```
