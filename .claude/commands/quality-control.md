# 🔍 NeonPro Code Quality Control

**Focused guide for finding and fixing code errors using apex-dev and code review agents**

## Tech Stack
- Frontend: React 19 + Vite + TanStack Router
- Backend: Hono + Node 20  
- Data: Supabase + Prisma ORM
- QA: Vitest, Playwright, Oxlint, TypeScript strict

## Error Categories

### 1. Code Errors
- TypeScript type errors and strict mode violations
- Syntax errors and missing imports
- Unused variables and functions
- Module resolution issues

### 2. Architecture Errors  
- Design pattern violations
- Service boundary issues
- Module dependency problems
- Component structure issues

### 3. Routing Errors
- API contract mismatches
- Route definition problems
- Field mapping inconsistencies
- Parameter validation errors

### 4. Tech Stack Errors
- Build configuration issues
- Dependency conflicts
- Test infrastructure problems
- Performance bottlenecks

## Agent Coordination

### Primary Agent
- **apex-dev**: Implementation coordination and technical leadership

### Support Agents (from docs/agents/code-review/)
- **architect-review**: Architecture validation and design patterns
- **code-reviewer**: Code quality and maintainability analysis  
- **security-auditor**: Security vulnerability assessment

### MCP Tool Sequence
1. **sequential-thinking** → Problem analysis and decomposition
2. **archon** → Task management and tracking
3. **serena** → Codebase analysis and semantic search
4. **desktop-commander** → File operations and execution

## Workflow: Find → Analyze → Fix → Validate

### Phase 1: Error Discovery
```bash
# Scan for errors
pnpm --filter @neonpro/api lint     # Check API package
pnpm --filter @neonpro/web lint     # Check web package  
pnpm --filter @neonpro/api test     # Run API tests
pnpm --filter @neonpro/web test     # Run web tests
```

### Phase 2: Root Cause Analysis
- Use `archon` to create and track error-fixing tasks
- Use `serena` to analyze codebase dependencies and impacts
- Use `sequential-thinking` for complex error decomposition

### Phase 3: Targeted Fixes
**Priority Order:**
1. **P0**: Build failures, critical test errors
2. **P1**: TypeScript errors, security vulnerabilities
3. **P2**: Linting warnings, performance issues  
4. **P3**: Code improvements, optimizations

### Phase 4: Validation
```bash
# Verify fixes
pnpm --filter @neonpro/api type-check
pnpm --filter @neonpro/web type-check
pnpm audit --audit-level moderate
```

## Common Issues & Solutions

### TypeScript Errors
```typescript
// Problem: Using 'any' type
function handler(data: any): any {
  return data.result;
}

// Solution: Use specific types
interface HandlerResponse {
  result: string;
}

function handler(data: unknown): HandlerResponse {
  return data as HandlerResponse;
}
```

### Import/Export Issues
```typescript
// Problem: Incorrect import paths
import { MyComponent } from '../components/MyComponent';

// Solution: Use correct module resolution
import { MyComponent } from '@/components/MyComponent';
```

### Build Failures
```bash
# Missing dependencies
pnpm add missing-package

# Configuration errors
# Check vite.config.ts, tsconfig.json, package.json
```

### Test Failures
```typescript
// Problem: Missing test setup
vi.mock('supabase', () => ({
  createClient: vi.fn()
}));

// Solution: Proper test configuration
import { createClient } from '@/lib/supabase';
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn()
}));
```

## Working Commands

### ✅ Verified Working
```bash
# API package
pnpm --filter @neonpro/api lint     # 305 warnings, 0 errors
pnpm --filter @neonpro/api test     # Works (has failures)
pnpm audit --audit-level moderate   # 2 moderate vulnerabilities
pnpm audit --fix                    # Auto-fix vulnerabilities

# Package management
pnpm update --latest                # Update dependencies
pnpm install                        # Install dependencies
```

### ❌ Known Issues
```bash
# TypeScript type check (filter configuration needed)
pnpm --filter ./ type-check         # "No projects matched"

# Web package (critical - 3 errors blocking)
pnpm --filter @neonpro/web lint     # 1003 warnings, 3 errors
```

## Error-Fixing Strategies

### 1. Use Agents Systematically
```bash
# Start with apex-dev for coordination
@apex-dev "analyze and fix TypeScript errors in web package"

# Bring in specialists as needed
@architect-review "validate API architecture patterns"
@code-reviewer "review code quality and maintainability"
```

### 2. Fix in Priority Order
1. **Fix web package syntax errors** (3 blocking errors)
2. **Resolve TypeScript type-check filter** configuration
3. **Address test infrastructure issues** (vi, bun:test imports)
4. **Clean up unused variables** (305 warnings in API)

### 3. Validation Loop
```bash
# After each fix, verify:
pnpm --filter @neonpro/web lint      # Should show reduced errors
pnpm --filter @neonpro/api test      # Should show reduced failures
pnpm audit --audit-level moderate    # Should show 0 criticals
```

## Quick Reference

### Critical Issues to Fix First
1. **Web package**: 3 syntax errors blocking builds
2. **TypeScript**: Filter configuration for type-checking
3. **Tests**: 15 failed test files across API package
4. **Security**: 2 moderate vulnerabilities

### Agent Command Patterns
```bash
# Code analysis and fixing
@apex-dev "fix TypeScript errors in [file/path]"
@architect-review "review architecture of [feature]"
@code-reviewer "analyze performance of [component]"

# Multi-agent coordination
@apex-dev,code-reviewer "implement and review [feature]"
@architect-review,apex-dev "design and build [system]"
```

### Success Criteria
- **Zero build errors** across all packages
- **Zero critical test failures**
- **Security vulnerabilities**: 0 critical, minimal moderate
- **TypeScript**: Strict mode compliance
- **Code quality**: Linter warnings < 100 per package

---

**Focus**: Technical excellence through systematic error detection and fixing using coordinated agent workflows.