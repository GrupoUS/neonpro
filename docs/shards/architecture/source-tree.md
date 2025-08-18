# Architecture Documentation - Source Tree Structure

This document outlines the source tree structure for the NeonPro aesthetic clinic SaaS platform.

## Packages Overview

### packages/core-services
Core business services for aesthetic clinic operations.

**Responsibilities:**
- Scheduling Service: Appointment management for aesthetic treatments
- Treatment Service: Treatment planning and execution  
- Patient Service: Patient management for aesthetic clinics
- Inventory Service: Product and equipment management
- Billing Service: Treatment billing and payment processing
- Notification Service: Patient communications and reminders

**Structure:**
```
packages/core-services/
├── src/
│   ├── scheduling/
│   │   ├── scheduling.service.ts
│   │   ├── appointment.model.ts
│   │   └── scheduling.types.ts
│   ├── treatment/
│   │   ├── treatment.service.ts
│   │   ├── treatment-plan.model.ts
│   │   └── treatment.types.ts
│   ├── patient/
│   │   ├── patient.service.ts
│   │   ├── patient.model.ts
│   │   └── patient.types.ts
│   ├── inventory/
│   │   ├── inventory.service.ts
│   │   ├── product.model.ts
│   │   └── inventory.types.ts
│   ├── billing/
│   │   ├── billing.service.ts
│   │   ├── invoice.model.ts
│   │   └── billing.types.ts
│   ├── notification/
│   │   ├── notification.service.ts
│   │   ├── notification.model.ts
│   │   └── notification.types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Dependencies:**
- @neonpro/db for data access
- @neonpro/shared for utilities
- @neonpro/domain for domain models
- @neonpro/utils for helper functions

**Integration Points:**
- Database layer through @neonpro/db
- Shared utilities through @neonpro/shared
- Domain models for business logic
- External APIs for payments and notifications