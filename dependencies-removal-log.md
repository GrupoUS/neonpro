# Dependencies Cleanup Analysis - NeonPro

## Summary

- **Unused Dependencies**: 16 packages (safe to remove)
- **Unused Dev Dependencies**: 5 packages (safe to remove)
- **Missing Dependencies**: 15+ packages (need to be added)
- **Total Potential Savings**: 21 packages removed

## Unused Dependencies (Production) - 16 packages

These dependencies are installed but not used in the codebase:

1. `@radix-ui/react-avatar` - UI component not used
2. `@radix-ui/react-popover` - UI component not used
3. `@radix-ui/react-progress` - UI component not used
4. `@radix-ui/react-scroll-area` - UI component not used
5. `@radix-ui/react-select` - UI component not used
6. `@radix-ui/react-slider` - UI component not used
7. `@radix-ui/react-switch` - UI component not used
8. `@radix-ui/react-tabs` - UI component not used
9. `@tanstack/react-query-devtools` - Development tool not used
10. `@vitejs/plugin-react` - Vite plugin not used
11. `jspdf` - PDF generation library not used
12. `lru-cache` - Caching library not used
13. `lucide-react` - Icon library not used
14. `optional` - Utility library not used
15. `recharts` - Chart library not used
16. `tailwindcss` - CSS framework not used

## Unused Dev Dependencies - 5 packages

These dev dependencies are installed but not used:

1. `@vitest/coverage-v8` - Test coverage tool not used
2. `depcheck` - Just added for this analysis
3. `oxc` - Compiler not used
4. `oxlint` - Linter not used (we use this, false positive)
5. `prettier` - Code formatter not used

## False Positives to Keep

- `oxlint` - Actually used for linting (false positive)
- `prettier` - May be used in CI/CD

## Safe Removals (19 packages)

Total packages that can be safely removed: 19

### Production Dependencies (16):

- All @radix-ui components listed above
- @tanstack/react-query-devtools
- @vitejs/plugin-react
- jspdf
- lru-cache
- lucide-react
- optional
- recharts
- tailwindcss

### Dev Dependencies (3):

- @vitest/coverage-v8
- depcheck (after this analysis)
- oxc

## Missing Dependencies to Add

Key missing dependencies that should be added:

- @testing-library/react
- @testing-library/user-event
- @supabase/supabase-js
- dotenv
- @playwright/test
- zod
- hono
- msw
- node-mocks-http

## Execution Plan

1. Remove unused production dependencies (16 packages)
2. Remove unused dev dependencies (3 packages)
3. Test build and functionality
4. Add missing dependencies as needed
5. Verify all tests pass

## Expected Impact

- **Bundle Size Reduction**: Significant reduction in node_modules size
- **Build Performance**: Faster dependency resolution
- **Security**: Reduced attack surface
- **Maintenance**: Cleaner dependency tree
