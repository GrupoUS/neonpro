# Security Audit Summary (Phase 2)

Date: 2025-09-19
Scope: Monorepo (apps/api, apps/web, tools/\*)
Source: `pnpm audit --json` at repo root + header review (`vercel.json`, `api-vercel.json`)

## Vulnerability Snapshot

- Total: 13 (critical: 1, high: 5, moderate: 4, low: 3)
- Observed paths are concentrated in dev/perf tooling (Lighthouse, Puppeteer, Clinic), not production runtime of apps/api or apps/web.

### Critical (1)

- form-data <2.5.4 (via request → clinic tooling)
  - Risk: Predictable multipart boundary. Dev-only chain. No runtime usage in production.
  - Mitigation: Prefer replacing `clinic`/`request` chain; optional override `form-data@^2.5.4`.

### High (5)

- ws >=8.0.0 <8.17.1 (via lighthouse → puppeteer-core)
  - Risk: DoS via many HTTP headers in ws server. Dev-only.
  - Mitigation: Update dependency chain (upgrade lighthouse/puppeteer) or override `ws@^8.17.1`.
- cross-spawn <6.0.6 (via pre-commit)
  - Risk: ReDoS. Dev-only.
  - Mitigation: Upgrade pre-commit toolchain or override `cross-spawn@^6.0.6`.
- tar-fs 2.1.1 (two advisories) (via puppeteer-core)
  - Risk: Path traversal during tar extraction. Dev-only.
  - Mitigation: Upgrade puppeteer toolchain or override `tar-fs@^2.1.3`.

### Moderate (4)

- d3-color <3.1.0 (via clinic/0x/d3-\* stack)
- got <11.8.5 (via update-notifier chain)
- request <=2.88.2 (deprecated; SSRF bypass)
- tough-cookie <4.1.3 (via request)
  - All in dev-only profiling/diagnostics. Prefer replacing clinic stack; otherwise accept dev-only risk.

### Low (3)

- esbuild 0.21.5 (dev server CORS; patched ≥0.25.0)
- cookie <0.7.0 (via Sentry in lighthouse chain)
- tmp ≤0.2.3 (via LHCI tooling)
  - Dev-only; plan upgrades with future Vite/Lighthouse updates.

## Production Runtime Impact

- apps/api and apps/web do not import the flagged chains in production builds.
- Residual risk categorized as Dev-Only; no known production exploit path.

## Header Hardening (Vercel)

- Enforced: HSTS, XFO=DENY, X-Content-Type-Options=nosniff, Referrer-Policy=strict-origin-when-cross-origin (web), COOP=same-origin, COEP=require-corp (+ reporting), CORP=same-site, X-DNS-Prefetch-Control=off, Permissions-Policy locked down, API CORS restricted to https://neonpro.vercel.app, CSP-Report-Only with report endpoint wired.
- Notes:
  - COEP/COOP create cross-origin isolation; review third-party embeds/resources before rollout.
  - Consider preview-domain CORS exceptions for Vercel previews.

## Recommended Actions

1. Dev-only dependency hygiene (low priority):
   - Upgrade ws (≥8.17.1), tar-fs (≥2.1.3), tmp (≥0.2.4), tough-cookie (≥4.1.3), got (≥11.8.5), cookie (≥0.7.0) via transitive bumps or overrides.
   - Evaluate replacing `clinic` tooling to remove deprecated `request` chain.
2. Runtime headers: Keep current hardening; verify no breakage in preview/prod.
3. Track Vite/Lighthouse major updates to pick up esbuild ≥0.25.0 automatically.
4. Add CI gate for audit with dev-only allowlist (e.g. audit-ci), to keep prod clean while tolerating tooling advisories.

## Status

- Vulnerabilities reviewed and categorized (Dev-only).
- Headers verified and aligned with best practices.
- Next: Run Supabase advisors (security & performance) and validate RLS policies.
