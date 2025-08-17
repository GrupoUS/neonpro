# Source Code Consolidation - Story 2.5

## Healthcare Quality Target: ≥9.9/10
## Compliance: LGPD+ANVISA+CFM

### Phase 1: Analysis ✅
- [x] Analyze root src/ structure
- [x] Analyze apps/web/ target structure  
- [x] Identify migration targets
- [ ] Read story requirements file

### Phase 2: Migration Implementation
- [ ] Update story status: Draft → Approved
- [ ] Migrate src/hooks/useComplianceAutomation.ts → apps/web/hooks/
- [ ] Create apps/web/lib/services/ directory
- [ ] Migrate 8 service files: src/services/ → apps/web/lib/services/
- [ ] Migrate src/__tests__/security/ → apps/web/__tests__/security/
- [ ] Handle src/app/ consolidation (complex merge)
- [ ] Update import paths throughout codebase
- [ ] Fix TypeScript compilation errors

### Phase 3: Validation
- [ ] Test application functionality
- [ ] Validate healthcare quality standards
- [ ] Clean root src/ directory
- [ ] Update story status: Approved → Completed

## Files to Migrate:
**Hooks**: useComplianceAutomation.ts
**Services**: api-gateway.ts, auth.ts, compliance.ts, configuration.ts, financial.ts, monitoring.ts, notification.ts, patient.ts
**Tests**: security-system.integration.test.ts
**App Routes**: Complex merge with existing apps/web/app/