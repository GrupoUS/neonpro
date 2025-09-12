# Postinstall failure on Windows (pnpm install)

Problem
- During `pnpm install`, the package `tools/monorepo-audit` ran `postinstall` as:
  `node dist/scripts/postinstall.js || true`
- Two issues:
  1) The target file `dist/scripts/postinstall.js` doesn’t exist before building, causing `MODULE_NOT_FOUND`.
  2) `|| true` is a Unix shell idiom. On Windows PowerShell/CMD, `true` isn’t a command, so the shell throws an error.

Fix
- Added a cross‑platform wrapper that no‑ops when the built script is missing:
  - File: `tools/monorepo-audit/scripts/safe-postinstall.cjs`
  - Updated `postinstall` in `tools/monorepo-audit/package.json` to:
    `node ./scripts/safe-postinstall.cjs`
- The wrapper checks for common build output locations and exits cleanly if none exist.

Why this works
- Avoids Unix‑specific `|| true`.
- Prevents `MODULE_NOT_FOUND` during fresh installs where `dist/` doesn’t exist yet.
- Compatible with `type: module` by using a `.cjs` wrapper.

Related notes (potential Windows pitfalls)
- Other scripts in `tools/monorepo-audit/package.json` still use Unix commands:
  - `chmod +x` (build:chmod)
  - `rm -rf` (clean)
  - `NODE_ENV=production ...` (build:production)
- These are fine for CI/Linux, but will fail on Windows shells. If we need local Windows dev for this package, consider cross‑platform replacements:
  - Use `shx` or `rimraf` for deletion and chmod
  - Use `cross-env` for env vars

Validation
- Ran: `node .\tools\monorepo-audit\scripts\safe-postinstall.cjs` on Windows; exits cleanly with no errors.
- Next: `pnpm install` should no longer fail due to this `postinstall`.

Last updated: 2025-09-12