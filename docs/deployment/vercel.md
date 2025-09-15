# NeonPro — Vercel Deployment Guide

This document explains how the project is deployed to Vercel, how environment variables are managed, how Preview deployments work, and how Turbo remote caching is enabled.

## 1) Environment Variables

Configure these in Vercel Project Settings (Production and Preview):

Required (critical)
- VITE_SUPABASE_URL: Public Supabase URL (embedded at build time by Vite)
- VITE_SUPABASE_ANON_KEY: Public anon key (embedded at build time)
- SUPABASE_SERVICE_ROLE_KEY: Service role key for serverless functions (never exposed to client)
- DATABASE_URL: Database connection string for server-side APIs (if applicable)

Common/optional
- NEXT_PUBLIC_* or VITE_* variables used by the app
- TURBO_TEAM, TURBO_TOKEN (for Turbo Remote Cache)

Validation
- Run `vercel pull --environment=preview|production` to verify env mapping
- Build locally with `vercel build` to ensure the values are available at build time

## 2) Preview Deployments for PRs

Preview deploys are handled by `.github/workflows/deploy.yml` (job: preview):
- Triggers on PR open/update
- Runs type-check, lint:fix, tests
- Builds with `vercel build`
- Deploys prebuilt output with `vercel deploy --prebuilt`
- Comments the preview URL on the PR automatically

## 3) Turbo Remote Caching (Vercel)

`turbo.json` already enables remote cache. To use Vercel infrastructure set:
- TURBO_TEAM: your Vercel team slug (e.g., `grupous-projects`)
- TURBO_TOKEN: token generated from https://vercel.com/account/tokens (scope: Turbo)

Add these to:
- GitHub Secrets (used in CI)
- Vercel Project Env (optional, for Vercel-side builds)

Expected benefit: significant reduction in build times after initial run as cache hits are served from Vercel.

## 4) CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`
- Push to `main` → Production job runs (type-check, lint:fix, tests → vercel build → vercel deploy --prebuilt --prod)
- Pull Request → Preview job runs and posts URL as a PR comment

Required GitHub Secrets
- VERCEL_TOKEN: Personal token for CLI
- VERCEL_ORG_ID, VERCEL_PROJECT_ID: From `.vercel/project.json` or Vercel Project Settings
- TURBO_TEAM: e.g., `grupous-projects`
- TURBO_TOKEN: Turbo Remote Cache token
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL

## Notes
- Frontend variables must be prefixed with `VITE_` to be embedded by Vite
- Server-only secrets must NOT be prefixed with `VITE_`; they are only available to serverless functions
- vercel.json at repo root defines build/output for the monorepo (builds apps/web and uses apps/web/dist)

