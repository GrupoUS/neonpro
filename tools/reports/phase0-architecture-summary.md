## Architecture Summary (Phase 0)

- Sources
  - `docs/architecture/AGENTS.md`
  - `docs/architecture/source-tree.md`
  - `docs/architecture/tech-stack.md`

- ADRs and decisions (excerpts)
  - Turborepo monorepo with 2 apps (`apps/web` Next.js 15, `apps/api` Hono) and ~22 packages under `/packages`
  - Strict TypeScript with path aliases; shared configs via `@neonpro/config`
  - Security and LGPD compliance central via `@neonpro/security` and `@neonpro/compliance`
  - Unified Audit Service exposed from `@neonpro/security`

- Context boundaries
  - UI system: `@neonpro/ui`, `@neonpro/brazilian-healthcare-ui`
  - Data/types: `@neonpro/types`, `@neonpro/database`
  - Core/infra: `@neonpro/auth`, `@neonpro/core-services`, `@neonpro/compliance`, `@neonpro/security`, `@neonpro/monitoring`, `@neonpro/devops`, `@neonpro/domain`, `@neonpro/utils`, `@neonpro/cache`, `@neonpro/integrations`, `@neonpro/enterprise`, `@neonpro/docs`

- Non-functional goals (from docs)
  - Performance targets (FCP <2s, bundle <1MB), API latency <200ms, uptime 99.9%
  - Compliance: LGPD/ANVISA/CFM, RLS 100%
  - Testing: Vitest, E2E Playwright; CI GitHub Actions

- Links
  - <augment_code_snippet path="docs/architecture/source-tree.md" mode="EXCERPT">
````markdown
- **Package Mais Dependente**: @neonpro/ai (4 dependências)
````
  </augment_code_snippet>
  - `docs/architecture/tech-stack.md`

- Open questions / Decision required
  - Some packages appear partially implemented or placeholders; confirm production readiness vs PRD phase
