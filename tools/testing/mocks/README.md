# Test Mocks Guidelines - NeonPro Healthcare

## Overview
Centralized test mocking for NeonPro healthcare system with compliance-aware mock data and services.

## Mock Categories

### Healthcare API Mocks
- Supabase database mocks
- ANVISA API mocks
- CFM validation service mocks
- External healthcare provider APIs

### Data Mocks
- LGPD-compliant patient data mocks
- Healthcare professional data mocks
- Medical device information mocks
- Audit trail and logging mocks

## Usage Examples
```typescript
// Import healthcare mocks
import { mockPatientData } from './mocks/healthcare/patients';
import { mockAnvisaResponse } from './mocks/compliance/anvisa';

// Use in tests
describe('Patient Service', () => {
  beforeEach(() => {
    mockPatientData.setup();
  });
});
```

## Compliance Requirements
- All mock data must be synthetic
- No real patient information in mocks
- LGPD-compliant data structures
- Audit trail simulation for compliance testing