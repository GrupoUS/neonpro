# Accessibility Essentials - Version: 1.0.0

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
