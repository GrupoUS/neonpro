# apps/web/src/components

Architecture

- atoms/: leaf UI pieces (inputs, buttons, labels)
- molecules/: small composed widgets (card, alert, table)
- organisms/: complex composites/features (dashboards, panels)
- templates/: layout shells and page-level wrappers
- ui/: compat/demo/specialty components; prefer moving primitives to atoms/molecules or `@neonpro/ui`
- healthcare/: domain-specific components

Importing

- App components: `import { Card } from '@/components'` or from specific level
- Shared UI kit: `import { KokonutGradientButton } from '@neonpro/ui'`

Guidelines

- Keep atoms/molecules generic; push shared primitives to `packages/ui`
- Keep feature-specific pieces in organisms/templates
- Use barrel exports (`index.ts`) for discoverability
