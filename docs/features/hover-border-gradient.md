# Hover Border Gradient (shadcn/ui compatible)

Status: Added
Last updated: 2025-09-12

## Location
- Component: `apps/web/src/components/ui/hover-border-gradient.tsx`
- Demo: `apps/web/src/components/hover-border-gradient-demo.tsx`

## Purpose
A small utility component that draws a soft animated border highlight around its child using motion/react. Compatible with shadcn/ui style (className/containerClassName props) and Tailwind v3.

## API
- as?: React.ElementType (default: "button")
- containerClassName?: string
- className?: string
- duration?: number (seconds, default 1)
- clockwise?: boolean (default true)
- ...props: spread onto outer tag

## Usage
```tsx
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function Example() {
  return (
    <HoverBorderGradient containerClassName="rounded-full" className="bg-black text-white">
      <span>Universidade NeonPro — Evolua com estilo</span>
    </HoverBorderGradient>
  );
}
```

## Notes
- Tailwind CSS version is v3.x in this repo; the component does not rely on v4-only features.
- motion/react is already installed; no extra deps needed.
- Accessible: forwards role/aria props to the container and keeps text inside a readable child wrapper.

## Verification
- Vite build passes for `@neonpro/web`.
- All vitest unit tests pass after integration.

## Future Enhancements
- Add theme-aware light/dark color tokens (brand palette from docs).
- Provide shadcn/ui variant slots or extend Button component wrapper.
