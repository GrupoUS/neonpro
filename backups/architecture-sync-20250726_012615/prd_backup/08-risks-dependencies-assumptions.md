# 8 · Risks, Dependencies & Assumptions

## Risk Matrix

| ID | Risco | Prob. | Impacto | Mitigação | Owner |
|----|-------|-------|---------|-----------|-------|
| R‑01 | Supabase down | M | Alto | Backup + replica | DevOps |
| R‑02 | Google OAuth muda | M | Médio | fallback Auth email | Dev |
| R‑03 | WhatsApp pricing | M | Médio | Plug‑in + SMS | Backend |
| R‑04 | Baixa adoção | M | Médio | Onboarding guiado | UX Lead |
| R‑05 | Mudança LGPD | B | Alto | Monitor & anonimização | Compliance |
| R‑06 | Perf dashboards | M | Médio | Edge Functions | QA Perf |
| R‑07 | CSV pagamentos muda | B | Baixo | Adaptador + tests | Backend |
| R‑08 | Browsers antigos | B | Baixo | Banner upgrade | Front‑end |
| R‑09 | Conectividade fraca | M | Médio | PWA offline | Front‑end |
| R‑10 | Next.js 15 canary breaks | M | Médio | Pin version + e2e | DevOps |

## Assumptions

- WhatsApp é canal primário de contato.
- Dispositivos Chromium latest 2 versões; >= 5 Mbps.
- Conta bancária exporta CSV.
- PT‑BR padrão.
