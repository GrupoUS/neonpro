# Environment Variable Strategy

Status: Initial draft  
Last Updated: 2025-09-11

## Goals
1. Prevent secret leakage to client bundles.
2. Standardize naming (public vs private).
3. Support Vercel, local dev, CI, and preview deployments.
4. Enable safe RLS & Prisma operations.

## Classification
| Category | Prefix / Pattern | Examples | Exposure |
|----------|------------------|----------|----------|
| Public runtime config | `VITE_` | `VITE_API_BASE_URL` | Embedded in client build |
| Supabase client | none (safe anon) | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Client + Server |
| Supabase privileged | none | `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| Database | none | `DATABASE_URL`, `DIRECT_URL` | Server only |
| Secrets / Security | none | `JWT_SECRET`, `ENCRYPTION_KEY` | Server only |
| Feature flags | `FEATURE_` | `FEATURE_ENABLE_AUDIT` | Client or server (decide per usage) |

## File Layout
```
.env                # local defaults (NOT committed with real secrets)
.env.example        # template (committed)
.env.production     # optional production overrides (not committed)
```

In Vercel, variables are stored per Environment (Development / Preview / Production) via dashboard or CLI (`vercel env pull`).

## Loading Order (Local)
1. `.env.local` (gitignored overrides)
2. `.env` base
3. Shell export / CI injected values

## Supabase
- Use `SUPABASE_SERVICE_ROLE_KEY` only in secure server contexts (never send to client; do not prefix with VITE_).
- RLS smoke tests should skip privileged path without service key.

## Prisma
- `DATABASE_URL` required.
- `DIRECT_URL` optional for migrations or read replicas.

## Security Controls
| Risk | Mitigation |
|------|------------|
| Secret in bundle | Run bundle scan (T043) before deploy |
| Vars missing | `validateEnv()` early in boot (fail-fast) |
| Overexposed keys | Separate public vs private naming & review diffs |

## CI Recommendations
```yaml
- name: Pull env (preview)
  run: vercel env pull .env --environment=preview
- name: Validate env
  run: bun tsx packages/utils/src/env/validate.ts
- name: Bundle scan
  run: bun tsx tools/testing/scripts/scan-bundle.ts dist/**/*.js
```

## Local Developer Onboarding
1. Copy `.env.example` to `.env`.
2. Fill Supabase URL & anon key.
3. Request service role key (secure channel only).
4. Run `bun test` to confirm health.

## Future Enhancements
- Typed runtime config loader exporting a `config` object.
- Schema validation using Zod + transform (coerce numbers, booleans).
- Secret rotation checklist.
