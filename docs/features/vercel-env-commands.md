---
title: Vercel Env Commands — NeonPro
last_updated: 2025-09-08
form: how-to
tags: [vercel, env]
related:
  - ./vercel-env-mapping.md
  - ./staging-deploy-runbook.md
---

# Vercel Env Commands — NeonPro

Project: NeonPro Brasil (Supabase ref ownkoxryswokcdanrdgj)
Supabase URL: https://ownkoxryswokcdanrdgj.supabase.co

## Preview/Staging (safe defaults)

```bash
# web (preview/staging)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< https://ownkoxryswokcdanrdgj.supabase.co
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< <paste-anon-key>
vercel env add NEXTAUTH_URL preview <<< https://your-preview-url.vercel.app
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXT_PUBLIC_ENABLE_WHATSAPP preview <<< false
vercel env add NEXT_PUBLIC_ENABLE_AI preview <<< false

# api (preview/staging)
vercel env add SUPABASE_URL preview <<< https://ownkoxryswokcdanrdgj.supabase.co
vercel env add SUPABASE_SERVICE_ROLE_KEY preview  # paste securely
vercel env add DATABASE_URL preview  # prisma connection string
vercel env add JWT_SECRET preview
vercel env add ENABLE_WHATSAPP preview <<< false
vercel env add ENABLE_AI preview <<< false
```

## Notes

- Never expose SERVICE_ROLE in web.
- Maintain separate values for preview/staging/prod.
- Rotate secrets on incidents or team changes.
