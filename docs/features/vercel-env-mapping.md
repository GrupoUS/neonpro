---
title: Vercel Env Mapping — NeonPro
last_updated: 2025-09-06
form: reference
tags: [vercel, env]
related:
  - ./staging-deploy-runbook.md
  - ../architecture/monorepo-inventory.md
---

# Vercel Env Mapping — NeonPro

## apps/web (Environment Variables)

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- NEXT_PUBLIC_ENABLE_WHATSAPP=false
- NEXT_PUBLIC_ENABLE_AI=false

## apps/api (Environment Variables)

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL (Prisma connection string)
- JWT_SECRET
- API_PORT=3001 (opcional no Vercel)
- ENABLE_WHATSAPP=false
- ENABLE_AI=false

## Observações

- Não expor SERVICE_ROLE no frontend.
- Usar variáveis separadas por ambiente (Preview/Staging/Prod) no Vercel.
