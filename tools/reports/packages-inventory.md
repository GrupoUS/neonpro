## Packages Inventory (Phase 1)

- Package manager: `pnpm@8.15.0`
- Build/Test tooling: `turbo.json`, TypeScript strict, Vitest, Playwright, Next.js

- Inventory (selection; full JSON in `tools/reports/packages-inventory.json`)
  - @neonpro/database — path `packages/database` — size 5.3M — exports: `.`, `./client`, `./prisma`
  - @neonpro/core-services — path `packages/core-services` — size 2.8M — exports: `.`, `./scheduling`, `./treatment`, `./patient`, `./inventory`, `./billing`, `./notification`
  - @neonpro/ui — path `packages/ui` — size 3.9M — exports: `.`, `./button`, `./styles`, theming exports
  - @neonpro/shared — path `packages/shared` — size 4.0M — exports: `.`, `./api-client`, hooks
  - @neonpro/compliance — path `packages/compliance` — size 2.4M
  - @neonpro/security — path `packages/security` — size 1.8M — UnifiedAuditService
  - Others: ai, auth, cache, config, devops, docs, domain, health-dashboard, integrations, monitoring, performance, types, utils, brazilian-healthcare-ui, enterprise

- Evidence
  - <augment_code_snippet path="packages/ui/package.json" mode="EXCERPT">
````json
{"name":"@neonpro/ui","exports":{".":{"types":"./dist/src/index.d.ts"}}
````
  </augment_code_snippet>
  - <augment_code_snippet path="turbo.json" mode="EXCERPT">
````json
"@neonpro/ui#build": {"dependsOn": ["@neonpro/types#build", "@neonpro/shared#build"]}
````
  </augment_code_snippet>
