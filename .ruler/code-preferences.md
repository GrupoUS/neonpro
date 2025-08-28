# Development Preferences

> **⚠️ IMPORTANT:** These rules must ALWAYS be followed. They are mandatory guidelines for maintaining code quality and consistency across all projects.

## Code Style

*   **High Confidence:** Only suggest code changes with 95%+ confidence in the solution
*   **Code Comments:** Self-documenting code, but old code deleted (not disabled with comments). Use `code-freeze.md` when necessary to prevent AI from editing a part that was difficult to implement.
*   **Modularization:** Split large files into smaller modules for better maintainability
*   **Package Manager:** pnpm
*   **State Patterns:** Avoid unnecessary useState + useEffect patterns
*   **Images:** Next.js `<Image>` for optimization
*   **Conditional Complexity:** Avoid chaining more than 3 nested if statements
*   **Cognitive Load:** Break down complex tasks into smaller, manageable functions
*   **Function Length:** Keep functions under 20 lines when possible
*   **Single Responsibility:** Each function should have one clear purpose
*   **Early Returns:** Use early returns to reduce nesting and improve readability
*   **Meaningful Names:** Use descriptive kebab-case names that clearly explain intent (e.g., `user-profile-data`, `calculate-total-price`)

## Architecture

*   **Separation:** Frontend separated from backend (avoid monoliths)
*   **TypeScript:** Strict typing across all layers
    *   Never use `any` explicitly
    *   Remove unused variables, imports, and parameters

## Performance & UX

*   **Loading:** SSR + Skeletons as a fallback for instant display
*   **Loading States:** Avoid when possible, prefer cache/fallback
*   **Accessibility:** Always include `DialogTitle` in modals

## Testing & Development

*   **Test-Driven Development:** Write comprehensive Jest tests before generating code - use TDD to validate requirements
*   **Immediate Refactoring:** Refactor generated code immediately to align with SOLID principles and project architecture
*   **Technical Documentation:** Maintain updated and detailed technical documentation to guide both humans and future code generation

## Version Control

*   **Commit Safety:** NEVER delete commits from history or delete the entire project - use revert only when user explicitly requests

## Linting

*   **Commands:** `npx next lint` and `npx tsc --noEmit`
*   **Fix Errors:** Fix errors instead of ignoring (do not comment out errors)
    *   `@typescript-eslint/no-explicit-any` - fix with proper types
    *   `@typescript-eslint/no-unused-vars` - remove unused items