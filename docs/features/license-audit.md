# License Audit

Status: Minimal structural stub (T044 GREEN)  
Last Updated: 2025-09-11

## Purpose
Ensures visibility over third-party package licenses and surfaces potential incompatibilities early.

## Module
`tools/audit/license-audit.ts`

### API
```ts
performLicenseAudit(): Promise<{
  packages: { name: string; version: string; license: string }[]
  violations: string[]
  generatedAt: string
}>
```

### Current Behavior
Returns empty arrays — satisfies contract test only.

### Planned Enhancements
| Phase | Feature | Detail |
|-------|---------|--------|
| P1 | Real package scan | Traverse workspaces `package.json` & node_modules metadata |
| P2 | SPDX normalization | Map irregular license strings to SPDX identifiers |
| P3 | Policy engine | Deny list (e.g., GPL-3.0-only) + warnings list |
| P4 | HTML/Markdown report | Summaries grouped by license type |
| P5 | SBOM export | CycloneDX / SPDX JSON output for compliance pipelines |

### Data Sources
- Each workspace `package.json`
- `node_modules/*/package.json`
- Potential integration with `license-checker` or custom walker

### CI Integration Sketch
1. Post-install: run `pnpm install`.
2. Execute license audit script.
3. Fail if violations > 0.

### Security & Compliance
Early flagging reduces legal risk. Keep audit cache to speed repeated runs. Consider storing last report artifact in `audit-evidence.json`.

### Next Steps
- Implement workspace traversal & basic SPDX mapping.
- Add deny/allow configuration file (e.g., `license-policy.json`).
