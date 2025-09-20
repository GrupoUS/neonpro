# Card regression: login card replaced feature cards

Date: 2025-09-12

Problem

- While adjusting card animations, the base shadcn `ui/card` was previously customized like the Auth/Login visual, which propagated the login look to all pages.

Correct solution (current)

- Keep `apps/web/src/components/ui/card.tsx` minimal and generic (shadcn default).
- Introduce an animated wrapper in `apps/web/src/components/molecules/card.tsx` that composes `ShineBorder` + `MagicCard` and exposes:
  - `magic?: boolean` to opt-in effects per usage.
  - `magicDisabled?: boolean` to explicitly disable when needed.
- Pages import from `@/components/molecules/card` and enable `magic` only where appropriate (e.g., KPI tiles).

Key files

- ui (base): `apps/web/src/components/ui/card.tsx`
- wrapper (animated): `apps/web/src/components/molecules/card.tsx`
- effects: `apps/web/src/components/ui/magic-card.tsx`, `apps/web/src/components/ui/shine-border.tsx`
- login: `apps/web/src/components/auth/AuthForm.tsx` (uses molecules card but scoped to the login page)

Verified pages (using molecules/card)

- Dashboard: `apps/web/src/routes/dashboard.tsx` (stats with `magic`, activity, quick actions)
- Clients: `apps/web/src/routes/clients.tsx`
- Appointments: `apps/web/src/routes/appointments.tsx`
- Reports: `apps/web/src/routes/reports.tsx`
- Financial, Patients, Profile, Settings, Healthcare test pages

Tests/build

- Vite build OK.
- Route tests pass; unrelated AI Chat tests currently failing (tracked separately).

Takeaways

- Never style base primitives with page-specific visuals; use composition wrappers.
- Keep animations opt-in to avoid regressions.
