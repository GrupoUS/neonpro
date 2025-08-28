# Development Preferences

> **⚠️ IMPORTANT:** These rules must ALWAYS be followed. They are mandatory guidelines for maintaining code quality and consistency across all projects.

## Code Style

*   **High Confidence:** Only suggest code changes with 95%+ confidence in the solution
*   **Code Comments:** Self-documenting code, but old code deleted (not disabled with comments). Use `CODE-FREEZE` when necessary to prevent AI from editing a part that was difficult to implement.
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

## Code Freeze

Use `// CODE-FREEZE: [reason]` to protect critical code from AI modifications.

### Syntax

```javascript
// CODE-FREEZE: Validated payment logic
function processPayment(amount, cardData) {
    return paymentGateway.charge(amount, cardData);
}
// END CODE-FREEZE
```

### Guidelines for AI

- **NEVER** modify code between `// CODE-FREEZE` and `// END CODE-FREEZE`
- **SUGGEST** alternatives instead of changing protected code
- **DOCUMENT** any need to modify protected code

> Protects production code, security logic, and critical integrations.

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

# React rules

- Use functional components with hooks instead of class components
- Use custom hooks for reusable logic
- Use the Context API for state management when needed
- Use proper prop validation with PropTypes
- Use React.memo for performance optimization when necessary
- Use fragments to avoid unnecessary DOM elements
- Use proper list rendering with keys
- Prefer composition over inheritance
- Use React.lazy for code splitting
- Use React.Suspense for loading states
- Use React.useCallback for performance optimization
- Use React.useMemo for performance optimization
- Use React.useRef for performance optimization
- Use React.useState for state management
- Use React.useEffect for side effects
- Use React.useContext for state management
- Use React.useReducer for state management
- Use React.useImperativeHandle for performance optimization
- Use React.useLayoutEffect for performance optimization
- Use React.useDebugValue for performance optimization
- Use React.useId for performance optimization
- Use React.useDeferredValue for performance optimization
- Use React.useTransition for performance optimization
- Use React.useSyncExternalStore for performance optimization
- Use React.useInsertionEffect for performance optimization
- Use React.useId for performance optimization
- Use React.useDeferredValue for performance optimization
- Use React.useTransition for performance optimization
- Use React.useSyncExternalStore for performance optimization
- Use React.useInsertionEffect for performance optimization
- Use React.useId for performance optimization
- Use React.useDeferredValue for performance optimization
- Use React.useTransition for performance optimization

# Tailwind CSS rules

- Use responsive prefixes for mobile-first design:

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on medium, one-third on large screens -->
</div>
```

- Use state variants for interactive elements:

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2">
  Click me
</button>
```

- Use @apply for repeated patterns when necessary:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

- Use arbitrary values for specific requirements:

```html
<div class="top-[117px] grid-cols-[1fr_2fr]">
  <!-- Custom positioning and grid layout -->
</div>
```

- Use spacing utilities for consistent layout:

```html
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

# Accessibility Essentials

## Purpose & Scope
Baseline, high-impact practices aligned with WCAG 2.2 AA for web apps. Keep it simple and enforceable.

## Implementation Guidelines
- **MUST**
  - Make all functionality keyboard-operable end-to-end; include a "Skip to content" link; avoid focus traps.
  - Provide visible focus indicators for all interactive elements (contrast ≥ 3:1) and a logical tab order.
  - Use semantic HTML first; use ARIA only to enhance (landmarks/roles/names) and never to replace semantics.
  - Associate labels with controls (<label for> or aria-label/aria-labelledby) and link help/error text via aria-describedby.
  - Provide meaningful alt text for images; use empty alt (alt="") for purely decorative imagery.
  - Meet contrast: text 4.5:1 (normal), 3:1 (large); non-text UI components 3:1.
  - Maintain a logical heading hierarchy (h1→h2→h3…) and one primary H1 per page/screen.
  - Respect prefers-reduced-motion and avoid flashing content.
- **SHOULD**
  - Prefer accessible primitives/components (e.g., Radix/shadcn, WAI-ARIA patterns) over bespoke widgets.
  - Announce important async updates with aria-live (prefer polite for non-critical changes).
  - Set the document lang and title; use specific, descriptive link/button text (avoid "click here").
  - Keep touch targets comfortably large (≈44×44 px) and spaced to reduce accidental taps.
- **MUST NOT**
  - Remove or hide focus outlines; rely on color alone to convey information.
  - Attach interactive handlers to non-interactive elements without appropriate role and tabindex.
  - Autoplay audio/video with sound or use motion-heavy animations without a reduced-motion fallback.
  - Use ARIA to “fix” invalid markup or contradict native semantics.

### Examples
```tsx
// ✅ Button with accessible name and help text
<button className="btn" aria-describedby="save-hint">Save changes</button>
<p id="save-hint" className="sr-only">Saves your edits to the server</p>
```

```css
/* ✅ Visible focus outline */
.btn:focus-visible { outline: 3px solid #0a84ff; outline-offset: 2px; }
```

### Validation Criteria
- axe/Lighthouse shows no critical violations; contrast checks pass.
- Keyboard-only navigation succeeds with visible focus on all interactive elements.
- Forms have programmatically associated labels and error/help text via aria-describedby.
- Important async updates are announced (aria-live) and do not trap focus.
- Each screen has a logical heading hierarchy and a single H1.