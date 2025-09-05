# Variables Configuration

> **📝 Project Settings:** This file contains the project's variable configuration. Update this file when adding new environment variables or changing existing ones so other developers know what's needed.

## Required Environment Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL={supabase-url}
NEXT_PUBLIC_SUPABASE_ANON_KEY={supabase-anon-key}
SUPABASE_SERVICE_ROLE_KEY={supabase-service-role-key}

# Authentication
AUTH_SECRET={auth-secret}
GOOGLE_CLIENT_ID={google-client-id}
GOOGLE_CLIENT_SECRET={google-client-secret}

# External Services
STRIPE_SECRET_KEY={stripe-secret-key}
STRIPE_WEBHOOK_SECRET={stripe-webhook-secret}
EMAIL_SERVICE_API_KEY={email-api-key}

# AI Services (Optional)
OPENAI_API_KEY={openai-key}
ANTHROPIC_API_KEY={anthropic-key}
OPENROUTER_API_KEY={openrouter-key}

# Rate Limiting
UPSTASH_REDIS_REST_URL={upstash-url}
UPSTASH_REDIS_REST_TOKEN={upstash-token}

# Analytics & Monitoring
GOOGLE_ANALYTICS_ID={ga-id}
SENTRY_DSN={sentry-dsn}
```

## Phase 6 — Database Integration Variables

Add these variables (root or app scope as indicated). Never commit secrets.

```bash
# Root (.env or via Vercel script)
SUPABASE_SERVICE_ROLE_KEY= # secret
SUPABASE_JWT_SECRET=       # secret
API_BASE_URL=
JWT_SECRET=                # secret
JWT_EXPIRY=7d

# apps/web (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_MONITORING=false
NEXT_PUBLIC_SENTRY_DSN=

# apps/api (.env.local)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # secret
SUPABASE_JWT_SECRET=       # secret
SECURITY_HEADERS_ENABLED=true
```

### Rotation & Branching Notes

- Use `scripts/setup-vercel-env.sh` to add/update envs for production/preview.
- Prefer project-level secrets in Vercel; do not store in repo.
- For CI: set `NON_INTERACTIVE=1` and export envs to let the script push values.
- For Supabase branches, generate keys per branch environment; never reuse prod keys.
