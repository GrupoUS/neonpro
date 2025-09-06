---
title: "Database Migrations Hygiene & Rollback Plan"
last_updated: 2025-09-06
form: reference
status: COMPLETED
---

# Database Migrations Hygiene & Rollback Plan

## Executive Summary

**CRITICAL FINDING**: Migration system exists in infrastructure but **NO MIGRATION FILES** found in the project.

- ❌ **Migration Directory Missing**: `supabase/migrations/` referenced but not present
- ⚙️ **Infrastructure Present**: Generator templates and scripts exist  
- 🚨 **Schema Drift**: Explains Prisma-Supabase parity issues discovered in audit
- 📋 **Action Required**: Initialize migration system and create baseline migration

## Scope
- Deduplicate legacy migrations, standardize naming, and define tested rollback steps for high-risk changes
- Deliverable: tools/reports/db-migrations-hygiene.md
- Acceptance: Linear migration history, rollback doc, CI migrate dry-run clean

## Migration Infrastructure Analysis

### ✅ Present Infrastructure
1. **Turbo Generator System** (`turbo/generators/config.ts:147`)
   - Generator name: "migration"  
   - Template path: `turbo/generators/templates/migration.sql.hbs`
   - Output path: `infrastructure/database/migrations/{{timestamp}}_{{snakeCase name}}.sql`

2. **Package.json Scripts** (`packages/database/package.json`)
   ```json
   "supabase:migration:new": "supabase migration new",
   "supabase:migration:up": "supabase migration up", 
   "supabase:migration:squash": "supabase migration squash"
   ```

3. **Migration Application Script** (`packages/database/scripts/apply-migration.js`)
   - Applies subscriptions table migration
   - Includes validation and rollback logic

### ❌ Missing Components

#### 1. Migration Files Directory
**Expected Locations:**
- `supabase/migrations/` (referenced in .gitignore, .dprintignore, .oxlintrc.json)
- `infrastructure/database/migrations/` (turbo generator output)

**Status**: Neither directory exists

#### 2. Baseline Migration
**Critical Missing**: Initial schema migration to establish database state
**Impact**: Cannot track schema changes or perform rollbacks

#### 3. Migration History Tracking
**Missing**: Linear history of schema changes
**Risk**: No ability to rollback or understand schema evolution

## Current State Assessment

### Migration File Inventory
```bash
# Search Results: ZERO migration files found
find . -name "*migration*.sql" -type f
# Result: No matches
```

### Schema Management Status
- **Prisma Schema**: `packages/database/prisma/schema.prisma` (Source of Truth)
- **Supabase Database**: Live database with different schema (drift detected)
- **Migration Bridge**: **MISSING** - No synchronization mechanism

### CI/CD Integration Status
**Configuration Present:**
```json
// .github/prompts/pull_request_template.md
"- [ ] Database migrations tested"
```

**Reality**: No migration testing possible due to missing migration files

## Migration Hygiene Recommendations

### Immediate Actions (P0)

#### 1. Initialize Migration System
```bash
# Create migration directories
mkdir -p supabase/migrations
mkdir -p infrastructure/database/migrations

# Initialize Supabase migrations
cd packages/database
supabase migration new baseline_schema
```

#### 2. Create Baseline Migration
Based on current Prisma schema, create initial migration:
```sql
-- 20250906000000_baseline_schema.sql
-- Baseline migration from Prisma schema

-- Create users table (CRITICAL - missing from Supabase)
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  -- ... full schema from Prisma
);

-- Create enums
CREATE TYPE "UserRole" AS ENUM (
  'SUPER_ADMIN', 'MEDICAL_DIRECTOR', 'DOCTOR', 
  'NURSE', 'TECHNICIAN', 'RECEPTIONIST', 
  'BILLING', 'AUDITOR', 'PATIENT'
);

-- ... continue with full schema
```

#### 3. Schema Drift Resolution Migration
```sql
-- 20250906000001_resolve_schema_drift.sql
-- Align existing tables with Prisma schema

-- Fix appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;

-- Rename clinic columns for consistency
ALTER TABLE clinics 
RENAME COLUMN clinic_name TO name;

-- ... additional alignment changes
```

### Short Term Actions (P1)

#### 1. Migration Naming Standards
**Convention**: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Timestamp ensures chronological ordering
- Descriptive names explain purpose
- Snake_case for consistency

#### 2. Rollback Strategy Implementation
For each migration, create corresponding rollback:
```sql
-- Forward migration: 20250906120000_add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- Rollback migration: 20250906120000_add_user_preferences_rollback.sql  
ALTER TABLE users DROP COLUMN IF EXISTS preferences;
```

#### 3. CI Migration Validation
```yaml
# .github/workflows/migrations.yml
name: Migration Validation
jobs:
  validate-migrations:
    steps:
      - name: Run Migration Dry-run
        run: |
          supabase db reset --db-url $TEST_DATABASE_URL
          supabase migration up --dry-run
      - name: Test Rollback
        run: |
          supabase migration down 1 --dry-run
```

### Long Term Actions (P2)

#### 1. Migration Testing Framework
```javascript
// tools/testing/migration-test.js
describe('Migration Tests', () => {
  test('baseline migration creates all tables', async () => {
    await applyMigration('20250906000000_baseline_schema.sql');
    const tables = await listTables();
    expect(tables).toContain('users');
    expect(tables).toContain('appointments');
  });

  test('rollback removes changes safely', async () => {
    // Test rollback scenarios
  });
});
```

#### 2. Automated Schema Drift Detection
```bash
#!/bin/bash
# scripts/detect-schema-drift.sh
# Compare Prisma schema with live database
npx prisma db pull --print > current_schema.prisma
diff packages/database/prisma/schema.prisma current_schema.prisma
```

## Rollback Strategy

### High-Risk Change Categories
1. **Table Drops**: Always require explicit confirmation
2. **Column Drops**: Require data backup
3. **Data Type Changes**: Multi-step migration required
4. **Index Changes**: Performance impact assessment

### Rollback Procedures
1. **Immediate Rollback**: Use migration down command
2. **Point-in-time Rollback**: Database snapshot restoration  
3. **Selective Rollback**: Cherry-pick specific migrations

### Rollback Testing Requirements
- Every migration must have tested rollback
- Rollback cannot cause data loss
- Rollback must maintain referential integrity

## Implementation Timeline

### Week 1: Emergency Setup
1. Create migration directories
2. Generate baseline migration from current Prisma schema
3. Apply baseline to establish migration history

### Week 2: Schema Alignment  
1. Create drift resolution migrations
2. Test migration/rollback cycle
3. Update CI/CD pipeline

### Week 3: Process Integration
1. Migration review process
2. Developer training on migration workflow
3. Documentation updates

## Risk Assessment

### High Risk Issues
- **No Migration History**: Cannot rollback changes
- **Schema Drift**: Production database differs from code
- **Missing Users Table**: Authentication system compromised

### Medium Risk Issues
- **CI Integration**: Migrations not tested in pipeline
- **Developer Workflow**: No standardized migration process

### Mitigation Strategies
1. **Database Backups**: Before any migration deployment
2. **Staging Validation**: Test all migrations in staging first
3. **Rollback Procedures**: Document and test rollback for critical changes

## Conclusion

**CRITICAL STATUS**: Migration system requires immediate initialization. The absence of migration files explains the significant schema drift discovered in the database parity audit.

**Priority Actions**:
1. Initialize migration system (immediate)
2. Create baseline migration to establish current state
3. Implement rollback procedures for high-risk changes
4. Integrate migration testing into CI/CD

**Success Metrics**:
- ✅ Migration directory structure created
- ✅ Baseline migration applied
- ✅ CI dry-run passes
- ✅ Rollback procedures tested

**Estimated Effort**: 1-2 weeks for complete implementation
**Risk Level**: HIGH - Database integrity and deployment reliability at risk