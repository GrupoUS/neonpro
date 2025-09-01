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