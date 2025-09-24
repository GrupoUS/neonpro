# Core Services

This package provides core business and governance services for NeonPro.

## Included Services

- AIService: Basic heuristic prediction engine with anonymization & preprocessing.
- Governance Schemas: Zod-based validation for patient, appointment, and compliance policy.

## Usage

```ts
import { AIService, validatePatient } from '@neonpro/core-services';

const ai = new AIService();
const result = await ai.makePrediction({
  type: 'appointment_noshow',
  data: {
    daysSinceScheduled: 1,
    previousNoShows: 2,
    appointmentType: 'consultation',
  },
});

console.log(result);
```

## Validation

```ts
import { validatePatient } from '@neonpro/core-services';

const patient = validatePatient({ name: 'Maria', age: 34 });
```

## Notes

- AIService currently uses heuristic scoring (Phase 1). A future phase will integrate a real model.
- All schemas are minimal and focused on fields actively used by tests and early features.
