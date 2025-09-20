# Barrel Re-export Collisions in @neonpro/shared

Problem

- Wildcard exports in `packages/shared/src/index.ts` re-exported overlapping symbols from multiple modules.
- Collisions seen during `@neonpro/web` type-check: duplicate identifiers (TS2300) and duplicate export conflicts (TS2308/TS2323), e.g.:
  - validateBrazilianPhone/formatBrazilianPhone/validateCEP in contact, patient, and validators
  - LGPDConsent type from patient vs lgpd-consent model
  - validateHealthcareCompliance from telemetry-event vs notifications helpers

Root cause

- Barrel `export *` surfaced helpers with generic names from multiple domains.
- Multiple modules defined the same helper names intended for local use.

Resolution

- Switched to explicit, non-conflicting exports in shared barrel:
  - Export only interfaces/enums from `types/contact`, `types/patient`, `types/notifications`.
  - Use `validators/brazilian` as the canonical source for validate/format helpers.
  - Export telemetry types only, plus selected functions; alias function as `validateTelemetryCompliance`.
  - Alias conflicting model names: `LGPDConsent` → `PatientLGPDConsent` (from patient) and `LGPDConsentModel` (from lgpd-consent).
  - Re-export required telemetry utilities (`PerformanceMetricsSchema`, `sanitizeTelemetryEvent`).

Outcome

- Shared export/type conflicts eliminated; `packages/shared/src/index.ts` no longer causes duplicate identifier errors.
- Remaining type-check errors are localized to the web app and unrelated to shared exports.

Policy going forward

- Avoid `export *` in shared barrels when modules include helpers; prefer explicit exports.
- Canonicalize cross-cutting helpers to a single module (validators).
- Alias duplicate domain type names at the barrel boundary.

Files touched

- packages/shared/src/index.ts (explicit exports and aliases)

Last updated: ${new Date().toISOString()}
