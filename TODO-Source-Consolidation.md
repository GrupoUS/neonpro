# Source Code Consolidation - Story 2.5

## Healthcare Quality Target: ≥9.9/10 | LGPD+ANVISA+CFM Compliance

### Phase 1: Analysis ✅
- [x] Analyzed root src/ structure
- [x] Identified migration targets  
- [x] Confirmed target directories exist

### Phase 2: Migration (In Progress)
- [ ] Migrate useComplianceAutomation.ts → apps/web/hooks/
- [ ] Create apps/web/lib/services/ directory
- [ ] Migrate 8 service files → apps/web/lib/services/
- [ ] Migrate src/__tests__/security/ → apps/web/__tests__/security/
- [ ] Handle src/app/ complex merge with apps/web/app/

### Phase 3: Validation
- [ ] Update all import paths
- [ ] Fix TypeScript compilation errors
- [ ] Test application functionality
- [ ] Clean root src/ directory
- [ ] Update story status to "Completed"

## Files to Migrate:
**Hook**: useComplianceAutomation.ts
**Services**: api-gateway.ts, auth.ts, compliance.ts, configuration.ts, financial.ts, monitoring.ts, notification.ts, patient.ts
**Tests**: security-system.integration.test.ts

## Current Task: Starting with hook migration