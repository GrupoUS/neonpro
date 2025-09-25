# tRPC + Valibot Alignment (Web App)

Goal: Keep apps/web type-check green while preparing a safe path to typed API/validation.

## Decisions

- Keep TRPCProvider as a no-op stub until backend router types stabilize.
- Provide a minimal client shim that avoids importing router types to prevent type collisions.
- Replace zod with Valibot only when necessary (no big-bang migration). Follow KISS/YAGNI.

## Implemented

- src/lib/trpcClient.ts
  - `createTRPCClientShim()` → now backed by an untyped `@trpc/client` with `httpBatchLink`
  - Targets `${VITE_API_URL || window.origin}/trpc` (override with VITE_API_URL)
  - Exposes `{ query(path, input), mutation(path, input) }` without importing router types
  - `trpcClient` singleton for convenience in non-critical places
- Zod enums previously using deprecated patterns were simplified (errorMap removed). No further changes needed now.
- Shared API contracts published (initial): `@neonpro/types/api/scheduling`
  - Exposes `MultiSessionSchedulingRequestSchema`, `AestheticSchedulingResponseSchema`
  - Purpose: frontends can depend on a narrow, stable contract without importing router types

## Next Steps

1. Stabilize backend router contracts (tRPC v11) and expose a small, stable public client surface.
2. Incrementally map domain calls (e.g., `aestheticScheduling.*`) from the shim to real server methods — keep web decoupled from router types.
3. For schemas actively used in apps/web, convert brittle zod constructs to Valibot one-by-one.
4. Keep type-check green after each incremental change; revert if change causes cascading errors.

## Notes

- This alignment intentionally avoids deep type coupling between apps/web and server routers.
- Prefer functional boundaries with narrow interfaces (domain adapters) to prevent type explosion.
