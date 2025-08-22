# 🚀 Test Infrastructure Migration Strategy

## A.P.T.E Methodology - ELABORATE Phase: Implementation Plan

### Migration Overview
This document provides the step-by-step migration plan to consolidate all testing folders under `D:\neonpro\tools\testing` with zero downtime and zero test functionality loss.

---

## 📋 PRE-MIGRATION CHECKLIST

### Safety Measures:
- [ ] **Full Backup**: Create backup of entire D:\neonpro directory
- [ ] **Git Commit**: Commit all current changes to version control
- [ ] **Test Baseline**: Run full test suite to establish baseline
- [ ] **Dependency Freeze**: Document current dependency versions
- [ ] **CI/CD Pause**: Temporarily pause automated deployments

### Environment Validation:
- [ ] **PNPM Available**: Verify PNPM is installed and functional
- [ ] **Test Tools Ready**: Verify Playwright and Vitest are working
- [ ] **Permissions**: Ensure write permissions to target directories
- [ ] **Disk Space**: Verify sufficient space for temporary duplication

---

## 🎯 MIGRATION PHASES

## Phase 1: Preparation and Structure Creation

### Step 1.1: Create Target Directory Structure
```powershell
# Create the comprehensive tools/testing structure
New-Item -Path "D:\neonpro\tools\testing\outputs\playwright\reports" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\playwright\results" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\playwright\videos" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\playwright\screenshots" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\playwright\traces" -ItemType Directory -Force

New-Item -Path "D:\neonpro\tools\testing\outputs\vitest\reports" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\vitest\coverage" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\vitest\results" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\vitest\cache" -ItemType Directory -Force

New-Item -Path "D:\neonpro\tools\testing\outputs\legacy\e2e-reports" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\legacy\playwright-reports" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\outputs\legacy\test-results" -ItemType Directory -Force

New-Item -Path "D:\neonpro\tools\testing\utils\setup" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\utils\mocks" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\utils\fixtures" -ItemType Directory -Force
New-Item -Path "D:\neonpro\tools\testing\utils\helpers" -ItemType Directory -Force
```

### Step 1.2: Validation Checkpoint
```powershell
# Verify structure creation
Test-Path "D:\neonpro\tools\testing\outputs\playwright\reports"
Test-Path "D:\neonpro\tools\testing\outputs\vitest\coverage"
Test-Path "D:\neonpro\tools\testing\outputs\legacy"
```

---

## Phase 2: Legacy Data Migration (Safe Copy First)

### Step 2.1: Copy Legacy E2E Reports
```powershell
# Copy (don't move yet) legacy e2e reports
if (Test-Path "D:\neonpro\e2e\reports") {
    Copy-Item -Path "D:\neonpro\e2e\reports\*" -Destination "D:\neonpro\tools\testing\outputs\legacy\e2e-reports" -Recurse -Force
    Write-Host "✅ E2E reports copied to legacy location"
}
```

### Step 2.2: Copy Legacy Playwright Reports
```powershell
# Copy Playwright HTML reports and data
if (Test-Path "D:\neonpro\playwright-report") {
    Copy-Item -Path "D:\neonpro\playwright-report\*" -Destination "D:\neonpro\tools\testing\outputs\legacy\playwright-reports" -Recurse -Force
    Write-Host "✅ Playwright reports copied to legacy location"
}
```

### Step 2.3: Copy Legacy Test Results
```powershell
# Copy test results and .last-run.json
if (Test-Path "D:\neonpro\test-results") {
    Copy-Item -Path "D:\neonpro\test-results\*" -Destination "D:\neonpro\tools\testing\outputs\legacy\test-results" -Recurse -Force
    Write-Host "✅ Test results copied to legacy location"
}
```

### Step 2.4: Migrate Test Utilities
```powershell
# Move test utilities to new location
if (Test-Path "D:\neonpro\tests\test-utils.ts") {
    Copy-Item -Path "D:\neonpro\tests\test-utils.ts" -Destination "D:\neonpro\tools\testing\utils\test-utils.ts" -Force
    Write-Host "✅ test-utils.ts copied to new location"
}

if (Test-Path "D:\neonpro\tests\test-utils") {
    Copy-Item -Path "D:\neonpro\tests\test-utils\*" -Destination "D:\neonpro\tools\testing\utils" -Recurse -Force
    Write-Host "✅ test-utils directory copied to new location"
}
```

---

## Phase 3: Configuration Updates

### Step 3.1: Update Playwright Configuration
```powershell
# Backup current config
Copy-Item -Path "D:\neonpro\playwright.config.ts" -Destination "D:\neonpro\playwright.config.ts.backup" -Force
```

**Manual Update Required** - Add to `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tools/testing/e2e',  // Already correct
  
  // NEW: Add output configurations
  outputDir: './tools/testing/outputs/playwright/results',
  
  use: {
    // NEW: Specify output locations for artifacts
    video: {
      mode: 'retain-on-failure',
      outputDir: './tools/testing/outputs/playwright/videos'
    },
    screenshot: {
      mode: 'only-on-failure',
      outputDir: './tools/testing/outputs/playwright/screenshots'
    },
    trace: {
      mode: 'retain-on-failure',
      outputDir: './tools/testing/outputs/playwright/traces'
    }
  },
  
  // NEW: Configure reporters with specific output locations
  reporter: [
    ['html', { 
      outputFolder: './tools/testing/outputs/playwright/reports',
      open: 'never'
    }],
    ['json', { 
      outputFile: './tools/testing/outputs/playwright/results/results.json' 
    }],
    ['junit', { 
      outputFile: './tools/testing/outputs/playwright/results/junit.xml' 
    }]
  ],
  
  // Rest of existing configuration...
});
```

### Step 3.2: Update Vitest Configuration
```powershell
# Backup current config
Copy-Item -Path "D:\neonpro\vitest.config.ts" -Destination "D:\neonpro\vitest.config.ts.backup" -Force
```

**Manual Update Required** - Add to `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Existing configuration...
    
    // NEW: Add output configurations
    coverage: {
      reportsDirectory: './tools/testing/outputs/vitest/coverage',
      reporter: ['text', 'html', 'json-summary'],
      enabled: false  // Enable only when needed
    },
    
    // NEW: Configure reporters with output files
    outputFile: {
      json: './tools/testing/outputs/vitest/reports/results.json',
      html: './tools/testing/outputs/vitest/reports/index.html',
      junit: './tools/testing/outputs/vitest/reports/junit.xml'
    },
    
    // NEW: Specify cache directory
    cache: {
      dir: './tools/testing/outputs/vitest/cache'
    }
  }
});
```

### Step 3.3: Update Biome Configuration
```powershell
# Backup current config
Copy-Item -Path "D:\neonpro\biome.jsonc" -Destination "D:\neonpro\biome.jsonc.backup" -Force
```

**Manual Update Required** - Update `biome.jsonc` ignore patterns:
```json
{
  "files": {
    "ignore": [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      "playwright-report/**",      // REMOVE - no longer needed
      "test-results/**",           // REMOVE - no longer needed
      "tools/testing/outputs/**", // ADD - ignore all test outputs
      "**/*.d.ts"
    ]
  }
}
```

---

## Phase 4: Validation and Testing

### Step 4.1: Test Import Paths
```powershell
# Run a quick test to verify utilities are accessible
cd "D:\neonpro"
pnpm exec tsc --noEmit --skipLibCheck
```

### Step 4.2: Run Playwright Tests
```powershell
# Run a single Playwright test to verify output paths
cd "D:\neonpro"
pnpm exec playwright test --grep "basic" --reporter=html
```

**Validation Points:**
- [ ] Test runs successfully
- [ ] HTML report appears in `tools/testing/outputs/playwright/reports`
- [ ] Test results appear in `tools/testing/outputs/playwright/results`
- [ ] Videos/screenshots in correct output directories

### Step 4.3: Run Vitest Tests
```powershell
# Run Vitest with coverage to verify output paths
cd "D:\neonpro"
pnpm test:unit --coverage --reporter=html
```

**Validation Points:**
- [ ] Tests run successfully
- [ ] Coverage report in `tools/testing/outputs/vitest/coverage`
- [ ] Test reports in `tools/testing/outputs/vitest/reports`

---

## Phase 5: Cleanup and Finalization

### Step 5.1: Remove Original Folders (Only After Validation)
```powershell
# ONLY execute after successful validation
if (Test-Path "D:\neonpro\tools\testing\outputs\legacy\e2e-reports\reports.xml") {
    Remove-Item -Path "D:\neonpro\e2e" -Recurse -Force
    Write-Host "✅ Original e2e folder removed"
}

if (Test-Path "D:\neonpro\tools\testing\outputs\legacy\playwright-reports\index.html") {
    Remove-Item -Path "D:\neonpro\playwright-report" -Recurse -Force
    Write-Host "✅ Original playwright-report folder removed"
}

if (Test-Path "D:\neonpro\tools\testing\outputs\legacy\test-results\.last-run.json") {
    Remove-Item -Path "D:\neonpro\test-results" -Recurse -Force
    Write-Host "✅ Original test-results folder removed"
}

if (Test-Path "D:\neonpro\tools\testing\utils\test-utils.ts") {
    Remove-Item -Path "D:\neonpro\tests" -Recurse -Force
    Write-Host "✅ Original tests folder removed"
}
```

### Step 5.2: Update Git Ignore
**Manual Update Required** - Update `.gitignore`:
```gitignore
# Test outputs (consolidated)
tools/testing/outputs/
!tools/testing/outputs/.gitkeep

# Remove old patterns (no longer needed)
# playwright-report/     # REMOVE
# test-results/          # REMOVE
# coverage/              # REMOVE (now in tools/testing/outputs/vitest/coverage/)
```

---

## 🔍 POST-MIGRATION VALIDATION

### Comprehensive Test Suite
```powershell
# Run complete test suite to ensure everything works
cd "D:\neonpro"

# 1. Format and lint code
pnpm format
pnpm lint:biome

# 2. Run type checking
pnpm type-check

# 3. Run unit tests
pnpm test:unit

# 4. Run E2E tests  
pnpm test:e2e

# 5. Run compliance tests
pnpm compliance:lgpd
pnpm compliance:anvisa

# 6. Generate coverage report
pnpm test:unit --coverage
```

### Directory Structure Verification
```powershell
# Verify no redundant folders remain
$redundantFolders = @("D:\neonpro\e2e", "D:\neonpro\playwright-report", "D:\neonpro\test-results", "D:\neonpro\tests")
foreach ($folder in $redundantFolders) {
    if (Test-Path $folder) {
        Write-Warning "❌ Redundant folder still exists: $folder"
    } else {
        Write-Host "✅ Redundant folder removed: $folder"
    }
}

# Verify new structure exists
$requiredFolders = @(
    "D:\neonpro\tools\testing\outputs\playwright",
    "D:\neonpro\tools\testing\outputs\vitest", 
    "D:\neonpro\tools\testing\outputs\legacy",
    "D:\neonpro\tools\testing\utils"
)
foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) {
        Write-Host "✅ Required folder exists: $folder"
    } else {
        Write-Warning "❌ Required folder missing: $folder"
    }
}
```

---

## 🚨 ROLLBACK PROCEDURE

### If Migration Fails:
```powershell
# 1. Restore config files
if (Test-Path "D:\neonpro\playwright.config.ts.backup") {
    Copy-Item -Path "D:\neonpro\playwright.config.ts.backup" -Destination "D:\neonpro\playwright.config.ts" -Force
}
if (Test-Path "D:\neonpro\vitest.config.ts.backup") {
    Copy-Item -Path "D:\neonpro\vitest.config.ts.backup" -Destination "D:\neonpro\vitest.config.ts" -Force  
}
if (Test-Path "D:\neonpro\biome.jsonc.backup") {
    Copy-Item -Path "D:\neonpro\biome.jsonc.backup" -Destination "D:\neonpro\biome.jsonc" -Force
}

# 2. Restore original folders from legacy (if cleanup already done)
if (!(Test-Path "D:\neonpro\playwright-report") -and (Test-Path "D:\neonpro\tools\testing\outputs\legacy\playwright-reports")) {
    Copy-Item -Path "D:\neonpro\tools\testing\outputs\legacy\playwright-reports" -Destination "D:\neonpro\playwright-report" -Recurse -Force
}
# Repeat for other folders as needed

# 3. Run tests to verify rollback
pnpm test:unit
pnpm test:e2e
```

---

## 📊 SUCCESS CRITERIA

### Technical Validation ✅
- [ ] All tests pass with new configuration
- [ ] Test outputs appear in correct tools/testing/outputs locations
- [ ] No broken import paths for test utilities
- [ ] CI/CD pipeline continues to work
- [ ] Coverage reports generate correctly

### Organizational Validation ✅  
- [ ] Zero redundant test folders in root directory
- [ ] All test outputs consolidated under tools/testing
- [ ] Clear separation between Playwright and Vitest outputs
- [ ] Legacy data preserved in outputs/legacy

### Compliance Validation ✅
- [ ] LGPD compliance tests functional
- [ ] ANVISA compliance tests functional
- [ ] Healthcare workflow tests operational
- [ ] Security audit tests working

---

## 📝 DOCUMENTATION UPDATES

### Files to Update Post-Migration:
1. **README.md** - Update test running instructions
2. **docs/e2e-testing-guide.md** - Update output paths
3. **CI/CD configs** - Update artifact collection paths
4. **Developer onboarding docs** - Update test setup instructions

---

*Migration strategy designed for zero downtime and zero functionality loss.*