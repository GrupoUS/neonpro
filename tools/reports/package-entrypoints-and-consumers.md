## Package Entrypoints & Consumers (Phase 1 validated in Phase 2)

- Entrypoints (build/runtime)
  - apps/web (Next.js 15 App Router)
    - Routes under apps/web/app/api/** act as HTTP entrypoints
    - Uses dynamic AI imports (lazy) — manual review
  - apps/api (Hono)
    - Routes composed in apps/api/src/routes/index.ts
  - Turbo tasks define build/test graph

- Consumers by package
  - @neonpro/ui → apps/web
  - @neonpro/shared → apps/web, apps/api
  - @neonpro/database → apps/web, apps/api, monitoring
  - @neonpro/monitoring → apps/web (client), health-dashboard
  - @neonpro/core-services → referenced by ai, monitoring
  - @neonpro/security → apps/api, core-services
  - @neonpro/compliance → apps/api
  - @neonpro/ai → apps/web (lazy)

- Routes/handlers evidence
  - Hono route composition:
    <augment_code_snippet path="apps/api/src/routes/index.ts" mode="EXCERPT">
````ts
import { aiRoutes } from "./ai";
api.route("/ai", aiRoutes);
````
    </augment_code_snippet>
  - Next.js dynamic AI lazy loading:
    <augment_code_snippet path="apps/web/src/hooks/use-ai-lazy-loading.ts" mode="EXCERPT">
````ts
const [aiModule, tfModule] = await Promise.all([
  import("@neonpro/ai/prediction"),
  import("@neonpro/ai/prediction/core/tensorflow-lazy-loader"),
]);
````
    </augment_code_snippet>

- Config signals (aliases/build)
  - TypeScript path aliases map @neonpro/* to packages/*/src
    <augment_code_snippet path="tsconfig.json" mode="EXCERPT">
````json
"paths": {"@neonpro/ui": ["./packages/ui/src"], "@neonpro/shared": ["./packages/shared/src"]}
````
    </augment_code_snippet>
  - Turbo build dependencies:
    <augment_code_snippet path="turbo.json" mode="EXCERPT">
````json
"@neonpro/shared#build": {"dependsOn": ["@neonpro/types#build","@neonpro/database#build","@neonpro/auth#build"]}
````
    </augment_code_snippet>

- Scripts/Jobs/CLI (observed)
  - packages/monitoring/scripts/* (quality/performance reports)
  - packages/database/supabase/functions/* (Edge Functions)
  - packages/enterprise/scripts/* (subscriptions setup) — manual execution only, not wired in turbo

- Notes
  - This document complements the inventory with concrete entrypoints and consumers; see `tools/reports/dependency-graph.*` for full graph.
