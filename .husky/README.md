# NeonPro Git Hooks Documentation

**Last Updated**: 2025-09-29  
**Husky Version**: 9.x  
**Status**: ✅ Production-Ready

## Overview

NeonPro uses [Husky](https://typicode.github.io/husky/) to enforce code quality, security, and healthcare compliance standards through automated Git hooks. These hooks run automatically at specific points in the Git workflow to prevent issues from entering the codebase.

## Architecture Alignment

This Git hooks configuration aligns with NeonPro's architecture principles:

- **Healthcare Compliance First**: LGPD, ANVISA, and CFM validation built into every commit
- **Type Safety**: End-to-end TypeScript validation with strict mode
- **Code Quality**: Multi-layer linting with OXLint, ESLint, and BiomeJS
- **Security by Design**: Automated security scanning and secrets detection
- **Accessibility**: WCAG 2.1 AA compliance validation for UI components
- **Monorepo Best Practices**: Turborepo-aware validation across packages

### Technology Stack Integration

**Package Manager**: Bun (primary) with PNPM fallback  
**Linting**: OXLint (fast) + ESLint (security) + BiomeJS (formatting)  
**Type Checking**: TypeScript 5.7.2 strict mode via Turborepo  
**Testing**: Vitest (unit/integration) + Playwright (E2E)  
**Compliance**: Custom bash scripts for LGPD, ANVISA, CFM validation

## Available Hooks

### 1. Pre-commit Hook (`.husky/pre-commit`)

**Purpose**: Validate code quality, security, and compliance before allowing commits.

**Execution Order**:
1. ✅ TypeScript type checking (`bun run type-check`)
2. 🛡️ Security linting (`bun run lint:security`)
3. 🔧 Code quality linting (`bun run lint`)
4. 📝 Code formatting check/auto-fix (`bun run biome:check`)
5. 🏥 LGPD compliance validation (custom bash script)
6. ♿ Accessibility compliance check (UI files only)
7. 🧪 Test coverage validation (critical healthcare functions)

**What It Checks**:

#### TypeScript Type Safety
- Runs `turbo type-check` across all packages
- Ensures strict TypeScript compliance
- Validates type definitions and imports
- **Blocks commit** if type errors exist

#### Security Linting
- Runs ESLint with security-focused rules
- Checks for common vulnerabilities (XSS, injection, etc.)
- Validates secure coding patterns
- **Blocks commit** if security issues found

#### Code Quality
- Runs OXLint with import and jsx-a11y plugins
- Validates code style and best practices
- Checks for common code smells
- **Blocks commit** if linting errors exist

#### Code Formatting
- Runs BiomeJS format checker
- **Auto-fixes** formatting issues when possible
- Prompts to re-add files if auto-fixed
- **Blocks commit** only if auto-fix fails

#### LGPD Compliance
- Scans for personal data (CPF, RG, email, phone) in unsafe contexts
- Checks for `console.log`, `localStorage`, `sessionStorage` with patient data
- Validates use of secure storage utilities from `@neonpro/security`
- **Blocks commit** if violations detected

**Example violation**:
```typescript
// ❌ BLOCKED: Personal data in console.log
console.log('Patient CPF:', patient.cpf);

// ✅ ALLOWED: Using secure logging
import { secureLog } from '@neonpro/security';
secureLog.audit('patient_access', { patientId: patient.id });
```

#### Accessibility Compliance
- Checks staged UI files (`.tsx`, `.jsx`) in `components/`, `ui/`, `pages/`
- Validates alt text on images
- Checks for labeled form inputs
- **Blocks commit** for missing alt text
- **Warns** for unlabeled inputs (non-blocking)

**Example violations**:
```tsx
// ❌ BLOCKED: Missing alt text
<img src="/patient-photo.jpg" />

// ✅ ALLOWED: Alt text provided
<img src="/patient-photo.jpg" alt="Patient identification photo" />

// ⚠️ WARNING: Unlabeled input (non-blocking)
<input type="text" name="cpf" />

// ✅ BEST: Properly labeled
<label htmlFor="cpf">CPF</label>
<input type="text" id="cpf" name="cpf" aria-label="CPF do paciente" />
```

#### Test Coverage Validation
- Checks critical healthcare directories: `lgpd/`, `patient/`, `medical/`, `telemedicine/`, `compliance/`
- Validates that `.ts` files have corresponding `.test.ts` or `.spec.ts` files
- **Non-blocking warnings** for missing tests (encourages but doesn't enforce)

### 2. Pre-push Hook (`.husky/pre-push`)

**Purpose**: Run comprehensive validation before pushing to remote repository.

**Execution Order**:
1. 🧪 Comprehensive test suite (`bun run test`)
2. 🏥 Healthcare compliance tests (if available)
3. 🛡️ Security compliance tests (if available)
4. 🔨 Build critical packages (`@neonpro/types`, `@neonpro/security`)

**What It Checks**:

#### Comprehensive Test Suite
- Runs all Vitest unit and integration tests
- Validates business logic and component behavior
- **Blocks push** if any tests fail

#### Healthcare Compliance Tests
- Runs healthcare-specific test suites (if configured)
- Validates LGPD, ANVISA, CFM compliance in code
- **Non-blocking warnings** if tests fail (informational)

#### Security Compliance Tests
- Runs security-focused test suites (if configured)
- Validates authentication, authorization, encryption
- **Non-blocking warnings** if tests fail (informational)

#### Critical Package Builds
- Builds `@neonpro/types` package (shared types)
- Builds `@neonpro/security` package (security utilities)
- **Blocks push** if builds fail (prevents broken dependencies)

## Troubleshooting

### Common Issues and Solutions

#### 1. Type Check Failures

**Error**: `❌ Type check failed! Please fix TypeScript errors before committing.`

**Causes**:
- Missing type definitions
- Incorrect type usage
- Import errors

**Solutions**:
```bash
# Run type check manually to see detailed errors
bun run type-check

# Check specific package
cd packages/types && bun run type-check

# Regenerate types from Supabase
bun run db:types
```

#### 2. Security Linting Failures

**Error**: `❌ Security linting failed! Please fix security issues before committing.`

**Causes**:
- Unsafe code patterns (eval, innerHTML, etc.)
- Missing input validation
- Insecure dependencies

**Solutions**:
```bash
# Run security linting with details
bun run lint:security

# Auto-fix security issues (when possible)
bun run lint:security:fix

# Check specific file
bunx eslint path/to/file.ts --max-warnings 0
```

#### 3. LGPD Compliance Violations

**Error**: `❌ LGPD Violation: Personal data detected in unsafe contexts`

**Causes**:
- Personal data in console.log
- Patient data in localStorage/sessionStorage
- Unencrypted sensitive data

**Solutions**:
```typescript
// ❌ WRONG: Direct console logging
console.log('Patient:', patient);

// ✅ CORRECT: Use secure logging
import { secureLog } from '@neonpro/security';
secureLog.audit('patient_access', { patientId: patient.id });

// ❌ WRONG: localStorage for sensitive data
localStorage.setItem('patient', JSON.stringify(patient));

// ✅ CORRECT: Use secure storage
import { secureStorage } from '@neonpro/security';
await secureStorage.setEncrypted('patient', patient);
```

#### 4. Code Formatting Issues

**Error**: `❌ Could not auto-fix formatting issues. Please fix manually.`

**Causes**:
- Syntax errors preventing auto-fix
- Conflicting formatting rules

**Solutions**:
```bash
# Check formatting issues
bun run biome:check

# Auto-fix formatting
bun run biome:fix

# Format specific file
bunx biome format --write path/to/file.ts
```

#### 5. Test Failures on Pre-push

**Error**: `❌ Tests failed! Please fix failing tests before pushing.`

**Causes**:
- Broken business logic
- Missing test updates after code changes
- Environment issues

**Solutions**:
```bash
# Run tests with verbose output
bun run test

# Run tests in watch mode for debugging
bun run test:watch

# Run specific test file
bunx vitest path/to/test.test.ts

# Check test coverage
bun run test:coverage
```

#### 6. Package Build Failures

**Error**: `❌ Types package failed to build!`

**Causes**:
- TypeScript compilation errors
- Missing dependencies
- Circular dependencies

**Solutions**:
```bash
# Build specific package
cd packages/types && bun run build

# Clean and rebuild
bun run clean && bun run build

# Check for circular dependencies
bunx madge --circular --extensions ts,tsx packages/types/src
```

### Bypassing Hooks (Emergency Only)

**⚠️ WARNING**: Only bypass hooks in emergency situations. All bypassed commits must be fixed immediately.

```bash
# Bypass pre-commit hook (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Bypass pre-push hook (NOT RECOMMENDED)
git push --no-verify
```

**When to bypass**:
- Critical production hotfix needed immediately
- CI/CD pipeline failure blocking deployment
- Hook script bug preventing valid commits

**After bypassing**:
1. Create immediate follow-up task to fix issues
2. Run all validations manually: `bun run quality:complete`
3. Create PR with fixes before next deployment

## Configuration Files

### Related Configuration Files

- **`.pre-commit-config.yaml`**: Python pre-commit framework configuration (alternative to Husky)
- **`.oxlintrc.json`**: OXLint configuration for code quality
- **`.config/eslint/.eslintrc.json`**: ESLint configuration for security
- **`biome.json`**: BiomeJS configuration for formatting
- **`turbo.json`**: Turborepo task configuration
- **`tsconfig.json`**: TypeScript compiler configuration

### Package.json Scripts

Key scripts used by hooks:

```json
{
  "type-check": "turbo type-check",
  "lint": "oxlint . --import-plugin --jsx-a11y-plugin",
  "lint:fix": "oxlint . --import-plugin --jsx-a11y-plugin --fix",
  "lint:security": "eslint . --max-warnings 0",
  "lint:security:fix": "eslint . --fix --max-warnings 0",
  "biome:check": "biome check .",
  "biome:fix": "biome check --fix .",
  "test": "vitest",
  "test:healthcare-compliance": "vitest run --config=vitest.config.ts --packages=packages/healthcare-core/src/__tests__/ --timeout=30000",
  "test:security-compliance": "vitest run --config=vitest.config.ts --packages=packages/security/src/__tests__/ --timeout=30000"
}
```

## Healthcare Compliance Details

### LGPD (Lei Geral de Proteção de Dados)

**What it validates**:
- Personal data handling (CPF, RG, email, phone)
- Data subject rights implementation
- Consent management
- Data retention policies
- Audit trail requirements

**Validation patterns**:
```bash
# Searches for personal data in unsafe contexts
grep -r -i -E "(cpf|rg|email|phone|patient.*data)" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist . | \
  grep -v -E "(test|spec|mock)" | \
  grep -E "(console\.log|localStorage|sessionStorage)"
```

### ANVISA (Agência Nacional de Vigilância Sanitária)

**What it validates**:
- Medical device tracking
- Product registration numbers
- Protocol format compliance
- Inventory management

**Expected format**: `XXXX.XXXXXX/YYYY-XX`

### CFM (Conselho Federal de Medicina)

**What it validates**:
- Medical license numbers
- Professional scope validation
- Telemedicine compliance

**Expected format**: `NNNNNN/UF` (e.g., `123456/SP`)

## Performance Considerations

### Hook Execution Times

**Pre-commit** (typical): 15-30 seconds
- Type check: 5-10s
- Security lint: 3-5s
- Code quality lint: 2-4s
- Formatting: 1-2s
- Compliance checks: 2-3s

**Pre-push** (typical): 30-60 seconds
- Test suite: 20-40s
- Package builds: 5-10s
- Compliance tests: 5-10s

### Optimization Tips

1. **Use `--no-verify` sparingly**: Only for emergencies
2. **Keep commits small**: Faster validation on fewer files
3. **Run checks locally**: `bun run quality:complete` before committing
4. **Cache dependencies**: Ensure node_modules is up to date
5. **Use Turborepo cache**: Speeds up type checking and builds

## Maintenance

### Updating Hooks

When modifying hooks:

1. **Test changes locally** before committing
2. **Document changes** in this README
3. **Update related configs** (.pre-commit-config.yaml, package.json)
4. **Communicate to team** via PR description

### Adding New Validations

To add new validation to pre-commit:

1. Add script to `package.json`
2. Add validation step to `.husky/pre-commit`
3. Document in this README
4. Add troubleshooting guidance
5. Test with various scenarios

Example:
```bash
# Add to .husky/pre-commit
echo -e "${YELLOW}🔍 Running new validation...${NC}"
if ! bun run new:validation; then
    echo -e "${RED}❌ New validation failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ New validation passed${NC}"
```

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [NeonPro Architecture](../docs/architecture/AGENTS.md)
- [Tech Stack](../docs/architecture/tech-stack.md)
- [Coding Standards](../docs/rules/coding-standards.md)
- [LGPD Compliance Guide](../docs/compliance/lgpd-guide.md)
- [Security Best Practices](../docs/security/best-practices.md)

## Support

For issues with Git hooks:

1. Check this README's troubleshooting section
2. Review related configuration files
3. Run validations manually to see detailed errors
4. Consult architecture documentation
5. Ask in team chat or create GitHub issue

---

**Last Reviewed**: 2025-09-29  
**Maintained By**: NeonPro Development Team  
**Version**: 1.0.0

