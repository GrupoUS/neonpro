# 🔍 NeonPro Code Quality Audit & Refactoring

**COMPREHENSIVE CODE QUALITY AUDIT & REFACTORING PROJECT**

## 📋 MANDATORY EXECUTION SEQUENCE

### **Phase 1: Code Quality Assessment & Fixes**
1. **Initialize with sequential-thinking** to analyze the complete scope
2. **Use archon MCP** to create/update project tracking
3. **Use serena MCP** (never native codebase-retrieval) for codebase analysis
4. **Use desktop-commander MCP** for all file operations and terminal commands

### **Phase 2: Quality Assessment Commands**

```bash
# TypeScript Compilation Check
cd /home/vibecoder/neonpro && npx tsc --noEmit --skipLibCheck

# Comprehensive Linting Scan
cd /home/vibecoder/neonpro && npx oxlint --quiet

# Targeted File Analysis
cd /home/vibecoder/neonpro && npx oxlint --quiet [specific-files]
```

### **Phase 2b: Intelligent Test Strategy Orchestration**

This prompt must auto-select and configure the correct testing strategy based on detected code changes.

#### Inputs (provide or auto-derive)
- `changed_files`: array of repository paths (e.g., from `git diff --name-only origin/main...HEAD`)
- `diff_stats` (optional): per-file stats to assess impact/criticality
- `monorepo_map`: inferred from `docs/architecture/source-tree.md`

#### Mandatory Pre‑Reads
- `docs/architecture/source-tree.md` (structure), `docs/architecture/tech-stack.md` (stack)
- `docs/testing/testing-responsibility-matrix.md`, `docs/testing/coverage-policy.md`
- `docs/rules/coding-standards.md` (LGPD/ANVISA/CFM, security)
- Strategy guides:
  - `docs/testing/hono-api-testing.md`
  - `docs/testing/react-test-patterns.md`
  - `docs/testing/tanstack-router-testing.md`
  - `docs/testing/supabase-rls-testing.md`
  - `docs/testing/monorepo-testing-strategies.md`

#### Routing Rules (path → strategy)
- API (Hono): any changes under `apps/api/**` or shared services used by API → invoke Hono API testing patterns
- Frontend components/hooks: changes under `apps/web/src/components/**` or `apps/web/src/hooks/**` → React 19 component testing
- Routes: changes under `apps/web/src/routes/**` or files named `route.tsx/tsx` → TanStack Router testing
- Database/RLS: SQL migrations, `packages/database/**`, Supabase policies or DB service code → Supabase RLS testing
- Monorepo-wide: changes affecting multiple apps/packages or root configs → Monorepo testing strategies

#### Responsibility Matrix Application
Use `testing-responsibility-matrix.md` to determine for each triggered strategy:
- Mandatory vs optional test types (Unit, Integration, E2E, Performance, Security, Compliance)
- CI stages to run (Unit → Integration → E2E → Security → Compliance)
- Coverage thresholds by criticality from `coverage-policy.md` (≥95% critical, ≥85% important, ≥75% useful)

#### Command Planner (examples)
- API integration (apps/api):
  - `pnpm --filter @neonpro/api... test:integration`
- Web unit/integration (apps/web):
  - `pnpm --filter @neonpro/web... test`
- Router-specific:
  - `pnpm --filter @neonpro/web... test -- routes`
- RLS suite:
  - `pnpm test:integration --filter "*" -- --run supabase`
- Monorepo parallel runs:
  - `pnpm --filter ...^... test:unit` (changed pkg and dependents)

#### Coverage Verification
- Merge coverage per stage and verify thresholds per `coverage-policy.md`
- Fail audit if thresholds not met for files marked critical/important

#### Healthcare Compliance Hooks
- If domains like `patients`, `appointments`, `clinical` changed:
  - Enforce LGPD checks (no real PII in fixtures, artifact anonymization)
  - Run E2E compliance checks from `docs/testing/e2e-testing.md` and checklist in `code-review-checklist.md`

#### JSON Orchestrator Output (machine‑readable)
```json
{
  "detected_changes": ["apps/api/src/routes/patients.ts", "apps/web/src/routes/patients/$id.tsx"],
  "selected_strategies": ["hono_api", "tanstack_router"],
  "mandatory_tests": ["integration", "e2e", "compliance"],
  "commands": [
    "pnpm --filter @neonpro/api... test:integration",
    "pnpm --filter @neonpro/web... test"
  ],
  "coverage_targets": {"critical": 0.95, "important": 0.85, "useful": 0.75},
  "ci_stages": ["unit", "integration", "e2e", "security", "compliance"]
}
```


### **Phase 3: Systematic Fixing Approach**

#### **Priority 1: Critical Security Issues**
- Fix `no-script-url` violations (replace `javascript:` URLs)
- Address `no-eval` usage in code
- Resolve `no-invalid-fetch-options` violations

#### **Priority 2: Type Safety Issues**
- Replace `no-explicit-any` with proper types:
  - `any` → `unknown` for generic unknowns
  - `any` → `Record<string, unknown>` for object types
  - `Mock<any, any[]>` → `Mock<unknown, unknown[]>`

#### **Priority 3: Module System Issues**
- Convert `no-require-imports` to ES6 imports:
  - `const fs = require('fs')` → `import fs from 'fs'`
  - `const { execSync } = require('child_process')` → `import { execSync } from 'child_process'`

#### **Priority 4: Code Quality Issues**
- Fix `no-var-requires` in test files
- Resolve `no-assign-module-variable` violations
- Address `no-thenable` violations in mock objects

## 🎯 QUALITY GATES

### **Gate 1: Linting Errors (Critical)**
- **Success Criteria**: 0 linting errors
- **Command**: `npx oxlint --quiet`
- **Target**: All TypeScript/JavaScript files

### **Gate 2: Type Safety (High Priority)**
- **Success Criteria**: TypeScript compilation successful, no explicit any types
- **Command**: `npx tsc --noEmit --skipLibCheck`
- **Target**: Exit code 0, no output

### **Gate 3: Security Issues (Critical)**
- **Success Criteria**: No security vulnerabilities
- **Focus**: Safe URL patterns, no eval usage, secure fetch options
- **Manual Review**: Required for security-sensitive changes

### **Gate 4: Code Standards (Medium Priority)**
- **Success Criteria**: ES6 imports, consistent patterns, no deprecated APIs
- **Tools**: oxlint custom rules, manual review
- **Target**: Modern JavaScript/TypeScript patterns

## 🔧 COMMON FIXES REFERENCE

### **TypeScript Type Safety**
```typescript
// ❌ Before
interface MockClient {
  from: Mock<any, any[]>;
  auth: { getUser: Mock<any, any[]>; };
}

// ✅ After
interface MockClient {
  from: Mock<unknown, unknown[]>;
  auth: { getUser: Mock<unknown, unknown[]>; };
}
```

### **ES6 Module Imports**
```javascript
// ❌ Before
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// ✅ After
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
```

### **Security URL Patterns**
```javascript
// ❌ Before (Security Risk)
const xssPayloads = [
  'javascript:alert("XSS")',
];


// ✅ After (Safe Alternative)
const xssPayloads = [
  'data:text/html,<script>alert("XSS")</script>',
];
```

## 📊 SUCCESS METRICS

### **Quantitative Targets**
- **Linting Errors**: 0 (from 3,157)
- **Linting Warnings**: <100 (from 3,248)
- **TypeScript Compilation**: 100% success rate
- **Security Violations**: 0
- **Code Quality Score**: ≥9.5/10

### **Qualitative Improvements**
- Enhanced type safety across codebase
- Modernized module system usage
- Improved security posture
- Consistent code patterns
- Better maintainability

## 🚀 EXECUTION WORKFLOW

### **Step 1: Assessment**
```bash
# Run comprehensive analysis
npx oxlint --quiet > quality-report.txt
npx tsc --noEmit --skipLibCheck
```

### **Step 2: Systematic Fixes**
1. Address security issues first
2. Fix type safety violations
3. Convert module imports
4. Resolve remaining quality issues

### **Step 3: Validation**
```bash
# Validate fixes
npx oxlint --quiet [fixed-files]
npx tsc --noEmit --skipLibCheck
```

### **Step 4: Documentation**
- Update Archon project with progress
- Document patterns and decisions
- Create/update coding standards

## 🔄 CONTINUOUS MAINTENANCE

### **Regular Audit Schedule**
- **Weekly**: Quick oxlint scan on changed files
- **Monthly**: Full codebase quality audit
- **Pre-release**: Comprehensive quality gate validation

### **Automated Integration**
- Add oxlint to CI/CD pipeline
- TypeScript compilation checks
- Pre-commit hooks for quality gates
- Automated reporting to Archon

## 📚 REFERENCE DOCUMENTATION

### **Tools Configuration**
- **oxlint**: Fast linter with TypeScript support
- **TypeScript**: Type checking and compilation
- **Archon MCP**: Project and task management
- **Desktop Commander MCP**: File operations

### **Quality Standards**
- Use `/docs/architecture/source-tree.md` for priorities
- Focus on `/packages` and `/apps` directories

---

### **Testing Guides & Compliance References**
- **Testing Guides**: `docs/testing/hono-api-testing.md`, `docs/testing/react-test-patterns.md`, `docs/testing/tanstack-router-testing.md`, `docs/testing/supabase-rls-testing.md`, `docs/testing/monorepo-testing-strategies.md`, `docs/testing/testing-responsibility-matrix.md`, `docs/testing/coverage-policy.md`
- **Compliance**: `docs/rules/coding-standards.md`, `docs/testing/e2e-testing.md`, `docs/testing/code-review-checklist.md`


**🎯 EXECUTION COMMAND**: Use this prompt with Augment Agent to execute comprehensive code quality audit and refactoring following all specified procedures and quality gates.