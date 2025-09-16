# useAdvancedSearch — Advanced Search Hook

Last updated: 2025-09-16

## Overview
A lightweight React hook that manages advanced search filters for the web app:
- Fields: `query`, `email`, `cpf`, `phone`, `status[]`, `dateRange { start, end }`
- Utils: `formatCPF`, `formatPhone`, `validateCPF`, `validatePhone`
- Metrics: `metrics.totalFilters`, `lastSearchAt`, `searchTime`

Exports: `useAdvancedSearch(initial?: AdvancedFilters)`
Location: `apps/web/src/hooks/useAdvancedSearch.ts`

## API
Inputs
- `initial?: AdvancedFilters` (defaults to `{ status: [], dateRange: { start: null, end: null } }`)

Returns
- `filters`: stateful `AdvancedFilters`
- `setFilters`: React `setState` for `filters`
- `clearFilters()`: resets to defaults
- `formatCPF(value: string) => string`: masks as `123.456.789-01`
- `formatPhone(value: string) => string`: masks as `(DD) DDDDD-DDDD`
- `validateCPF(value: string) => boolean`: strict mask match
- `validatePhone(value: string) => boolean`: strict mask match
- `metrics: { totalFilters: number; lastSearchAt?: Date; searchTime: number }`

## Formatting & Validation Rules
- CPF: only digits are considered; capped at 11 digits, then formatted to `123.456.789-01`
- Phone (BR mobile): only digits are considered; capped at 11 digits, then formatted to `(DD) DDDDD-DDDD`
- `validateCPF`: `/\d{3}\.\d{3}\.\d{3}-\d{2}/`
- `validatePhone`: `/\(\d{2}\) \d{5}-\d{4}/`

## Metrics Semantics
`metrics.totalFilters` counts non-empty values:
- `query`, `email`, `cpf`, `phone` → counts if non-blank string
- `status[]` → counts if array has at least 1 item
- `dateRange.start` and `dateRange.end` → each counts if not null

`lastSearchAt` and `searchTime` are placeholders for future enhancements.

## Tests
Location: `apps/web/src/hooks/__tests__/useAdvancedSearch.test.ts`
Coverage:
- Formatting: progressive and capped for CPF/Phone
- Validation: strict masks
- State: `clearFilters` resets to defaults
- Metrics: counts only non-empty values

To run:
```bash
pnpm --filter @neonpro/web test
```

## Notes
- The hook is UI-agnostic; compose with form libs as needed.
- Consider refactoring formatting/validation to a shared utility if reused across the app.
