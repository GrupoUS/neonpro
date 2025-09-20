# Supabase Auth Redirects (Vercel + Vite)

This guide defines the correct configuration for OAuth/email flows so users land on `/dashboard` after logging in.

## 1) Site URL resolution

We centralize the public site URL in `apps/web/src/lib/site-url.ts`:

- `VITE_PUBLIC_SITE_URL` (recommended)
- else `VERCEL_URL` (auto-prefixed https)
- else `window.location.origin`
- else `http://localhost:5173`

Set `VITE_PUBLIC_SITE_URL` in Vercel and local dev for deterministic behavior.

## 2) Supabase Auth settings

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://neonpro.vercel.app`
- Additional Redirect URLs:
  - `https://neonpro.vercel.app/auth/callback`
  - `http://localhost:5173/auth/callback`

Include any preview domains if used (e.g., `https://<branch>-neonpro.vercel.app/auth/callback`).

## 3) Frontend OAuth flow

- We call `signInWithProvider('google', '/dashboard')` from `LoginForm`.
- The helper in `apps/web/src/integrations/supabase/client.ts` builds:
  - `redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(finalRedirectTo)}``
- The callback route (`/auth/callback`) reads `next` and navigates SPA to it (defaults to `/dashboard`).

## 4) Environment variables

Copy `.env.example` → `.env.local` and set:

```
VITE_PUBLIC_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=... # from Supabase project
VITE_SUPABASE_ANON_KEY=... # from Supabase project
```

On Vercel, add the same env vars to Project Settings → Environment Variables.

## 5) Validation checklist

- OAuth login returns to `/auth/callback` and navigates to `/dashboard`.
- Email/password login uses SPA navigate to `/dashboard`.
- No hard `window.location.href` except in error fallbacks.
- Preview deployments work if their callback URL is added in Supabase.
