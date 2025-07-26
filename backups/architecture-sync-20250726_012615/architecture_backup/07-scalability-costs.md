# 7 · Escalabilidade & Custos

Inicial **≈ US$ 274/mês** (Vercel Pro, Supabase xlarge‑4, Storage 100 GB, SMS fallback).

## Triggers de Escala

- Edge cold‑start p95 > 300 ms
- Supabase CPU > 70 %
- Realtime conns > 80 %

## Budget Management

- Budget alarms 80 % / 100 % para Supabase & Twilio
- Infracost diff nos PRs
