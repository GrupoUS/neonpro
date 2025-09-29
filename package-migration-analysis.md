# Package.json Migration Analysis - Phase 1.2

**Analysis Date**: 2025-09-29  
**Target**: Migrate from pnpm to Bun across all packages  
**Scope**: Root + 7 workspace packages

## Current State Analysis

### Root Package.json Scripts
```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md}\"",
    "db:types": "turbo run db:types",
    "db:push": "turbo run db:push",
    "db:studio": "turbo run db:studio"
  }
}
```

### Package-Level Scripts Pattern
Based on `packages/database/package.json` analysis:

#### TypeScript Build Scripts
- `"build": "tsc -p tsconfig.json"` → **Bun Compatible** ✅
- `"dev": "tsc -w -p tsconfig.json"` → **Bun Compatible** ✅
- `"type-check": "tsc -p tsconfig.json --noEmit"` → **Bun Compatible** ✅

#### Test Scripts (Mixed Compatibility)
- `"test": "vitest run"` → **Bun Compatible** ✅
- `"test:watch": "vitest"` → **Bun Compatible** ✅
- `"test:compliance": "tsx tests/test-runner.ts"` → **Needs Bun Migration** ⚠️
- `"test:health": "tsx tests/test-runner.ts | head -20"` → **Needs Bun Migration** ⚠️
- `"test:ci": "tsx tests/test-runner.ts && npm run test:coverage"` → **Mixed** ⚠️
- `"test:coverage": "bun test --coverage"` → **Already Bun** ✅

#### Database Scripts
- `"db:types": "supabase gen types..."` → **Bun Compatible** ✅
- `"db:push": "supabase db push"` → **Bun Compatible** ✅
- `"db:diff": "supabase db diff"` → **Bun Compatible** ✅
- `"db:reset": "supabase db reset"` → **Bun Compatible** ✅
- `"db:studio": "supabase studio"` → **Bun Compatible** ✅

#### Utility Scripts
- `"clean": "rimraf dist"` → **Bun Compatible** ✅
- `"lint": "echo 'lint placeholder'"` → **Bun Compatible** ✅

## Migration Strategy by Category

### ✅ **Direct Migration (No Changes Needed)**
**Scripts that work unchanged with Bun:**
- All `tsc` commands (TypeScript compilation)
- All `vitest` commands (testing framework)
- All `supabase` commands (database operations)
- `turbo run` commands (monorepo orchestration)
- `rimraf` commands (cleaning)

### ⚠️ **tsx → bun Migration Required**
**Scripts using Node.js runtime:**
- `tsx tests/test-runner.ts` → `bun run tests/test-runner.ts`
- Any script using `node` or `tsx` runtime

### 🔄 **npm → bun Migration**
**Scripts calling npm:**
- `npm run db:types` → `bun run db:types`
- `npm run build` → `bun run build`

## Migration Plan

### Phase 1.2.1: Root Package Migration
1. Update root `package.json` scripts
2. Update `packageManager` field from `pnpm@10.17.1` to `bun@1.2.23`
3. Test Turbo compatibility with Bun

### Phase 1.2.2: Package-Level Migration
1. Migrate each package's scripts individually
2. Handle package-specific dependencies (tsx → bun)
3. Validate each package builds successfully

### Phase 1.3: Dependency Optimization
1. Remove `tsx` dependencies where possible
2. Add `bun`-specific dependencies if needed
3. Optimize installation with Bun's package manager

## Expected Benefits

### Performance Improvements
- **Installation**: 3-5x faster dependency resolution
- **Script Execution**: Native execution without Node.js overhead
- **Build Times**: Reduced startup time for TypeScript compilation

### Simplification Benefits
- **Single Runtime**: Bun as both package manager and runtime
- **Reduced Dependencies**: No need for `tsx` for TypeScript execution
- **Unified Toolchain**: Consistent experience across all scripts

## Risk Assessment

### Low Risk
- TypeScript compilation (tsc)
- Vite-based builds
- Supabase CLI operations
- Turbo monorepo commands

### Medium Risk
- Test runner migration (tsx → bun)
- Scripts with shell pipelines (`| head -20`)
- Complex npm script chains

### High Risk
- Custom build tools with Node.js-specific APIs
- Legacy tools without Bun compatibility
- Integration with external Node.js modules

## Validation Strategy

### Pre-Migration
1. **Baseline**: Document current build times and success rates
2. **Dependency Map**: Identify all Node.js-specific dependencies
3. **Script Inventory**: Categorize all scripts by compatibility

### Post-Migration
1. **Functional Testing**: Verify all scripts work as expected
2. **Performance Benchmarking**: Measure improvement percentages
3. **Compatibility Testing**: Ensure no regressions in development workflow

---
**Next**: Phase 1.2.1 - Root package.json migration  
**Timeline**: Estimated 2-3 hours for complete migration  
**Confidence**: High (95% success probability based on analysis)