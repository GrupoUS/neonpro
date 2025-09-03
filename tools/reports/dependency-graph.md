## Dependency Graph (Phase 2)

```mermaid
flowchart LR
  subgraph Apps
    A[apps/web]
    B[apps/api]
  end

  subgraph Packages
    UI[@neonpro/ui]
    SH[@neonpro/shared]
    UT[@neonpro/utils]
    DM[@neonpro/domain]
    DB[@neonpro/database]
    AI[@neonpro/ai]
    MON[@neonpro/monitoring]
    SEC[@neonpro/security]
    CMP[@neonpro/compliance]
    CORE[@neonpro/core-services]
    C[@neonpro/cache]
    HD[@neonpro/health-dashboard]
    BH[@neonpro/brazilian-healthcare-ui]
  end

  A --> UI
  A --> SH
  A --> UT
  A --> DM
  A --> DB
  A -. lazy/dynamic .-> AI
  A --> MON
  B --> SH
  B --> SEC
  B --> CMP
  B --> DB
  MON --> DB
  MON --> CORE
  AI --> CORE
  AI --> DB
  C --> DB
  HD --> MON
  BH --> UI
```

- Legend
  - Dashed edge = lazy/dynamic import (manual-review)
- Evidence
  - apps/web uses dynamic AI imports:
    <augment_code_snippet path="apps/web/src/hooks/use-ai-lazy-loading.ts" mode="EXCERPT">
````ts
const [aiModule, tfModule] = await Promise.all([
  import("@neonpro/ai/prediction"),
  import("@neonpro/ai/prediction/core/tensorflow-lazy-loader"),
]);
````
    </augment_code_snippet>
  - API composes routes from modules:
    <augment_code_snippet path="apps/api/src/routes/index.ts" mode="EXCERPT">
````ts
import { aiRoutes } from "./ai";
api.route("/ai", aiRoutes);
````
    </augment_code_snippet>
