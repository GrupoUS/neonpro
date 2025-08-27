# Design Guidelines - Version: 1.0.0

## Purpose & Scope

Standards for building consistent, maintainable, and visually appealing user interfaces for the [NOME_PROJETO] platform. Covers component architecture, styling conventions, color systems, typography, responsive design, accessibility, and performance using Shadcn UI, Tailwind CSS, and modern Next.js/React best practices.

## Core Principles

- **UI Framework:** Shadcn UI components as primary building blocks
- **Styling:** Tailwind CSS for all styling needs, configured in `globals.css`
- **Responsiveness:** Mobile-first design with graceful mobile adaptation
- **Images:** Next.js `<Image>` component for optimization
- **Icons:** Lucide React icons, import only what's needed
- **Components:** Server Components by default, Client Components only when necessary
- **TypeScript:** Strict typing for component props
- **Accessibility:** WCAG compliance
- **Colors & Fonts:** Always use values defined in `globals.css`
- **Buttons:** All button-like components must have `cursor-pointer` class

## Component Architecture

### Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── layout.tsx
│       └── _components/  # Route-specific components
├── components/           # Shared reusable components
│   ├── ui/               # Shadcn UI components
│   ├── shared/           # App-wide components
│   └── forms/            # Form components
├── features/             # Feature-specific components
├── lib/                  # Utilities and helpers
└── public/               # Static assets
```

### Component Strategy

- **Shadcn UI First:** Use Shadcn UI components from `@/components/ui/*`
- **Server vs Client:**
  - Server Components by default
  - Client Components only for interactivity (`useState`, `useEffect`, events)
- **Installation:** `pnpm dlx shadcn@latest add <component-name>`
- **Custom Components:**
  - Build using Shadcn UI + Tailwind utilities
  - Use kebab-case for file names, PascalCase for exports
  - Keep small, focused, and reusable
- **TypeScript:** Define explicit prop types, avoid `any`

### Examples

```typescript
// ✅ Client component for interactivity
"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}

// ✅ Server component for static content
import { Card } from "@/components/ui/card";
export function StaticCard() {/* ... */}
```

## Color System

Use semantic CSS variables with oklch color format in `globals.css`. The [NOME_PROJETO] platform uses a carefully crafted color palette optimized for the application's specific needs:

**Usage:**

```typescript
// ✅ Use semantic classes
<div className="bg-background text-foreground border border-border">
  <Button className="bg-primary text-primary-foreground">Click</Button>
</div>

// ❌ Don't hardcode colors
<div className="bg-[#ffffff] text-[#1f1f21]">...</div>
```

## Typography

The [NOME_PROJETO] platform uses **Geist** font family for optimal readability and professional appearance:

- **Primary Font:** Geist Sans configured in `layout.tsx` and `globals.css`
- **Monospace Font:** Geist Mono for code and technical content
- **Font Loading:** Optimized with `display: "swap"` for performance

### Font Configuration

```typescript
// layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
```

### Typography Utilities

Define text styles in `globals.css`:

```css
@layer utilities {
  .text-heading {
    @apply text-2xl font-bold leading-tight;
  }
  .text-body {
    @apply text-base leading-relaxed;
  }
  .text-caption {
    @apply text-sm text-muted-foreground;
  }
}
```

### Typography Usage Examples

```typescript
// ✅ Typography hierarchy
<h1 className="text-5xl font-bold text-primary tracking-tight">Main Title</h1>
<h2 className="text-3xl font-semibold">Section Title</h2>
<p className="text-base font-medium">Body text with medium weight</p>
<code className="font-mono text-sm bg-muted px-2 py-1 rounded">Code snippet</code>

// ✅ Font weight variations
<p className="font-light">Light text</p>
<p className="font-medium">Medium text</p>
<p className="font-semibold">Semibold text</p>
<p className="font-bold">Bold text</p>
```

## Styling Practices

- **Configuration:** All Tailwind customization in `globals.css` using `@theme inline` and `@layer utilities`
- **No Config File:** Avoid `tailwind.config.js` unless absolutely necessary
- **Utility Classes:** Use Tailwind utilities directly in components
- **Organization:** Group classes by category (layout, typography, colors)

```typescript
// ✅ Good organization
<div className="flex flex-col gap-4 p-6 bg-card text-card-foreground rounded-lg border border-border">
  <h2 className="text-2xl font-semibold text-primary">Title</h2>
  <p className="text-base text-muted-foreground">Content with proper contrast</p>
</div>;
```

## Responsive Design

- **Primary Targets:** Desktop (1920x1080) and notebook (1366x768)
- **Graceful Degradation:** Ensure mobile usability without horizontal scrolling
- **Flexible Layouts:** Use relative units, Flexbox, Grid
- **Breakpoints:** Tailwind responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)

```typescript
// ✅ Responsive layout example
<div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto p-8">
  <Card className="w-full md:w-1/2">
    <CardHeader>
      <CardTitle className="text-xl">Main Feature</CardTitle>
    </CardHeader>
    <CardContent>
      <Button className="w-full">Primary Action</Button>
    </CardContent>
  </Card>
  <Card className="w-full md:w-1/2">
    <CardHeader>
      <CardTitle className="text-xl">Secondary Feature</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Content components */}
      </div>
    </CardContent>
  </Card>
</div>;
```

## Shadcn UI Integration

### Installation Process

```bash
# Initialize shadcn/ui
pnpm dlx shadcn@latest init --yes

# Install specific components
pnpm dlx shadcn@latest add button card input form dialog

# For project-specific components
pnpm dlx shadcn@latest add calendar textarea badge sheet
```

### Configuration

The `components.json` configuration:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## Form Components

```typescript
// Shadcn + react-hook-form example
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const { register, formState: { errors } } = useForm();

<div className="space-y-4">
  <div>
    <Label htmlFor="topic">Topic</Label>
    <Input
      id="topic"
      placeholder="Enter your topic..."
      {...register("topic", { required: "Topic is required" })}
      className={cn(errors.topic && "border-destructive")}
    />
    {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
  </div>

  <div>
    <Label htmlFor="content">Content</Label>
    <Textarea
      id="content"
      placeholder="Write your content..."
      className="min-h-[120px]"
      {...register("content")}
    />
  </div>

  <Button type="submit" className="w-full">
    Submit
  </Button>
</div>;
```

## Accessibility

- **Semantic HTML:** Use proper elements (`<nav>`, `<button>`, `<main>`)
- **ARIA:** Apply roles and attributes for screen readers
- **Keyboard Navigation:** All interactive elements focusable
- **Color Contrast:** Meet WCAG AA requirements with oklch color optimization
- **Labels:** Clear labels for form inputs and application tools
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

## React rules

- Use functional components with hooks instead of class components
- Use custom hooks for reusable logic
- Use the Context API for state management when needed
- Use proper prop validation with PropTypes
- Use React.memo for performance optimization when necessary
- Use fragments to avoid unnecessary DOM elements
- Use proper list rendering with keys
- Prefer composition over inheritance
- Use React.lazy for code splitting
- Avoid using `dangerouslySetInnerHTML`
- Use `useCallback` and `useMemo` for performance optimization
- Use `useEffect` for side effects and cleanups

## Tailwind CSS rules

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

## Performance

- **Server Components:** Minimize client-side JavaScript
- **Font Loading:** Geist fonts with `display: "swap"` optimization
- **Unused Styles:** Build process removes unused CSS
- **Image Optimization:** Use `next/image` component

## Restrictions

- **MUST NOT** hardcode color values in `className` props - always use semantic color variables
- **MUST NOT** define theme variables outside `globals.css`
- **MUST NOT** use arbitrary values when theme utilities exist
- **MUST NOT** create horizontal scrolling layouts
- **MUST NOT** use fonts other than Geist Sans/Mono without explicit approval

## Conventions

- Place file mentions at the end of responses when referencing this guideline
- Use consistent formatting for all code examples and file paths
- Organize Tailwind classes by category (layout, typography, colors) for readability
- Follow project naming conventions for components and utilities

## Related Rules

- `@react.md` - React component patterns and hooks usage
- `@commit-messages.md` - Standardized commit message format
- `@memory.md` - Memory management protocol for AI interactions
