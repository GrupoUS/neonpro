---
title: "Next.js References Cleanup Report"
date: 2025-09-11
type: audit
tags: [cleanup, migration, nextjs, vite, tanstack]
status: completed
---

# Next.js References Cleanup Report

This document identifies and categorizes all Next.js references found in the codebase, determining which are stale and need to be replaced with accurate Vite/TanStack/Hono statements.

## 🔍 Analysis Summary

**Total References Found**: 47 files with Next.js-related content
**Categories Identified**:
- 🔴 **STALE**: References that need correction (15 files)
- 🟢 **VALID**: Legitimate references (32 files)
- 🟡 **CONTEXTUAL**: "Next Steps" and similar phrases (maintained)

## 🔴 Stale References Requiring Updates

### Critical Configuration Files

#### 1. `vercel.json` - Framework Configuration
```diff
- "framework": "nextjs",
- "outputDirectory": "apps/web/.next",
+ "framework": "vite",
+ "outputDirectory": "apps/web/dist",
```

#### 2. `.gitignore` - Architecture Description
```diff
- # Architecture: Next.js 15 + Hono.dev + Supabase + TypeScript + shadcn/ui
+ # Architecture: TanStack Router + Vite + Hono.dev + Supabase + TypeScript + shadcn/ui

- # Next.js (Frontend)
+ # Vite + TanStack Router (Frontend)

- # Total packages: 22 | Apps: 2 (web, api) | Stack: Next.js 15 + Hono.dev + Supabase
+ # Total packages: 22 | Apps: 2 (web, api) | Stack: TanStack Router + Vite + Hono.dev + Supabase
```

#### 3. `README.md` - Badge and Documentation
```diff
- [![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
+ [![TanStack Router](https://img.shields.io/badge/TanStack-Router-red)](https://tanstack.com/router)

- | **NextAuth.js**   | ^4.24.11               | Auth framework          | Session management, provider integration  |
+ | **Supabase Auth** | ^2.38.5                | Auth framework          | Session management, provider integration  |

- - **Linting Next.js app**: Use scoped helper to avoid root resolution errors:
+ - **Linting Vite app**: Use scoped helper to avoid root resolution errors:
```

### Documentation Updates

#### 4. `memory/constitution.md`
```diff
- - Frontend: Next.js 15 + React 19 (App Router required)
+ - Frontend: TanStack Router + Vite + React 19 (File-based routing)
```

#### 5. `docs/architecture/frontend-architecture.md`
```diff
- **Next.js 15 + React 19**
+ **TanStack Router + Vite + React 19**

- ├── web/              # Next.js Frontend (Primary)
+ ├── web/              # TanStack Router + Vite Frontend (Primary)

- - Image optimization with Next.js Image
+ - Image optimization with Vite static assets

- - Route-based splitting with Next.js
+ - Route-based splitting with TanStack Router
```

#### 6. `docs/architecture/tech-stack.md`
```diff
- - **Migration**: From Next.js App Router for better type safety
+ - **Migration**: From Next.js App Router to TanStack Router for better type safety

- ### Frontend Framework: TanStack Router + Vite vs Next.js
+ ### Frontend Framework: TanStack Router + Vite (Current Choice)

- - **Type Safety**: Full type-safe routing vs Next.js partial type safety
- - **Performance**: Vite HMR (<100ms) vs Next.js slower builds
+ **Advantages Over Previous Next.js Setup**:
+ - **Type Safety**: Full type-safe routing with automatic inference
+ - **Performance**: Vite HMR (<100ms) for instant feedback
```

#### 7. `docs/prd/prd.md`
```diff
- - Next.js 15 with App Router
+ - TanStack Router with Vite build system
```

#### 8. `docs/agents/AGENTS.md`
```diff
- - Next.js 15 + React 19 + TypeScript development
+ - TanStack Router + Vite + React 19 + TypeScript development
```

#### 9. `docs/agents/apex-ui-ux-designer.md`
```diff
- - **Frontend**: TanStack Router + Vite + React 19 (NOT Next.js)
+ - **Frontend**: TanStack Router + Vite + React 19
```

#### 10. `docs/agents/ui-ux-agent-analysis.yaml`
```diff
- - "TanStack Router + Vite (NOT Next.js as assumed in original spec)"
+ - "TanStack Router + Vite (current frontend framework)"

- - "Next.js assumptions vs. actual TanStack Router + Vite"
+ - "Updated to TanStack Router + Vite architecture"
```

### Template and Configuration Files

#### 11. `.github/templates/fullstack-architecture-tmpl.yaml`
```diff
- - **Vercel + Supabase**: For rapid development with Next.js, built-in auth/storage
+ - **Vercel + Supabase**: For rapid development with Vite, built-in auth/storage
```

#### 12. `.github/templates/front-end-architecture-tmpl.yaml`
```diff
- - Frontend starter templates (e.g., Create React App, Next.js, Vite, Vue CLI, Angular CLI, etc.)
+ - Frontend starter templates (e.g., Vite, Create React App, Vue CLI, Angular CLI, etc.)

- - React: Create React App, Next.js, Vite + React
+ - React: Vite + React, Create React App
```

#### 13. `.github/templates/architecture-tmpl.yaml`
```diff
- - Starter templates (e.g., Create React App, Next.js, Vue CLI, Angular CLI, etc.)
+ - Starter templates (e.g., Vite, Create React App, Vue CLI, Angular CLI, etc.)
```

#### 14. `.config/oxlint/.oxlintrc.json`
```diff
- "new-cap": "off", // Allow Next.js font constructors like Inter(), JetBrains_Mono()
+ "new-cap": "off", // Allow font constructors like Inter(), JetBrains_Mono()

- "react/jsx-uses-react": "off", // Next.js 17+ doesn't need React import
+ "react/jsx-uses-react": "off", // React 17+ doesn't need React import
```

#### 15. `packages/shared/src/auth/protected-route.tsx`
```diff
- // DISABLED: Using TanStack Router instead of Next.js
+ // NOTE: Using TanStack Router for protected routes

- // DISABLED: Using TanStack Router instead of Next.js router
+ // NOTE: Using TanStack Router navigation
```

## 🟢 Valid References (No Changes Needed)

These references are legitimate and should remain:

### Hono Middleware (32 files)
- `apps/api/src/middleware/*.ts` - `Next` parameter from Hono framework
- All instances of `async (c: Context, next: Next)` are valid Hono patterns

### Contextual "Next Steps"
- All documentation with "Next Steps" sections remain unchanged
- Build outputs referencing "hasNext" for pagination remain unchanged

### External Dependencies
- Prisma runtime library references to Next.js edge functions (vendor code)
- Error messages mentioning Next.js in dependency context

## 📊 Change Summary

| Category | Files | Actions Required |
|----------|-------|------------------|
| **Configuration** | 3 | Update framework references, build outputs |
| **Documentation** | 8 | Replace Next.js with TanStack Router + Vite |
| **Templates** | 3 | Update starter template lists |
| **Code Comments** | 1 | Clarify implementation notes |
| **Valid References** | 32 | No changes needed |

## ✅ Implementation Status

All identified stale Next.js references have been catalogued and are ready for bulk replacement. The changes primarily involve:

1. **Framework Identity**: Updating all references to reflect TanStack Router + Vite stack
2. **Build Configuration**: Correcting Vercel deployment settings
3. **Documentation Accuracy**: Ensuring all docs reflect current architecture
4. **Template Consistency**: Updating boilerplate references

## 🎯 Next Actions

1. ✅ **Analysis Complete**: All references identified and categorized
2. 🔄 **Ready for Implementation**: Diff list produced with exact changes
3. 📝 **Documentation Updated**: This audit provides complete change guide
4. ✨ **Validation**: Changes maintain all valid Hono middleware patterns

---

**Analysis Date**: 2025-09-11
**Files Analyzed**: 47 files across entire codebase
**Critical Updates**: 15 files require changes
**Status**: ✅ **READY FOR IMPLEMENTATION**