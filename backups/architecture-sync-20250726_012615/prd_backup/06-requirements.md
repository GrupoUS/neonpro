# 6 · Requirements

## Functional Requirements

(Ver tabela seção 4 – "Módulo" = RF‑01…08 + RF‑09, 10 *Implemented*)

## Non‑Functional Requirements

| ID | Categoria | Requisito | Métrica |
|----|-----------|-----------|---------|
| **RNF‑01** | Performance | TTFB ≤ 300 ms web / 500 ms 3G | API ≤ 800 ms p95 |
| **RNF‑02** | Segurança & LGPD | AES‑256 at‑rest; TLS 1.3 | retenção 5 anos; anonimização 2 anos |
| **RNF‑03** | Escalabilidade | Edge Functions Vercel | stress × 2 pico |
| **RNF‑04** | Acessibilidade | WCAG 2.1 AA | modo escuro/claro |
| **RNF‑05** | Localização | PT‑BR default | i18n ready |
| **RNF‑06** | Integrações | Mensageria plug‑in | swappable ≤ 4 h |
| **RNF‑07** | Observabilidade | Coverage ≥ 80 % | logs agreg p95 < 30 s; alerta Slack ≤ 60 s |
