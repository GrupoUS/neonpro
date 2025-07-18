# 9 · Technical Constraints & External Integrations

| Categoria | Restrição / Integração | Motivo |
|-----------|-----------------------|--------|
| Stack Front‑end | **Next.js 15, React 18, Tailwind CSS + Shadcn** | SSR/ISR, DX, App Router |
| Backend BaaS | **Supabase (Postgres, Auth, Storage, Realtime)** | Time‑to‑market; RLS |
| Infra | **Vercel Edge Functions** | Deploy contínuo, baixa latência |
| Mensageria | Plug‑in: WhatsApp Cloud API / Twilio SMS/e‑mail | Evitar lock‑in |
| Pagamentos | CSV import Stone/Cloud Payments | Conciliação receita |
| Observability | Next.js Telemetry + Supabase Logs + Vercel Analytics | Performance & alertas |
| Compliance | AES‑256, TLS 1.3, retenção 5 anos, anonimização 2 anos | LGPD |
| Browser Support | Chrome/Edge últimas 2 versões | Simplifica QA |

---

**Documento criado por BMad‑Method (PM Agent) – versão 2025‑07‑18.**
